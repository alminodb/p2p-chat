import React, { useEffect, useRef, useState } from 'react'
import { ChatState } from '../../../Context/ChatProvider';
import { Box, Button, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon, InfoIcon, ViewIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../../../Config/ChatLogic';
import UserProfileModal from '../../../Modals/UserProfileModal';
import UpdateGroupChatModal from '../../../Modals/UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import "./styles.css";
import { io } from 'socket.io-client';
import { SocketState } from '../../../Context/SocketProvider';

var selChat;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const { selectedChat, setSelectedChat, user, notifications, setNotifications, activeUsers, setActiveUsers } = ChatState();

    const socket = SocketState();

    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    const newMessage = useRef();

    const toast = useToast();

    const fetchMessages = async () => {
        if (selectedChat) {
            setLoading(true);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                };

                const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);

                setMessages(data);
                setLoading(false);
                socket.emit("join chat", selectedChat._id);

            } catch (error) {
                toast({
                    title: "Error occured!",
                    description: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
            }
        }
    }

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage.current.value) {

            try {
                let content = newMessage.current.value;
                let chatId = selectedChat._id;

                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                };

                const { data } = await axios.post("/api/message/", { content, chatId }, config);

                setFetchAgain(!fetchAgain);
                newMessage.current.value = "";
                socket.emit("new message", data);
                setMessages([...messages, data]);

            } catch (error) {
                toast({
                    title: "Error occured!",
                    description: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
            }
        }
    }

    const sendMessageButtonHandler = async () => {
        if (newMessage.current.value) {

            try {
                let content = newMessage.current.value;
                let chatId = selectedChat._id;

                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                };

                const { data } = await axios.post("/api/message/", { content, chatId }, config);

                setFetchAgain(!fetchAgain);
                newMessage.current.value = "";
                socket.emit("new message", data);
                setMessages([...messages, data]);

            } catch (error) {
                toast({
                    title: "Error occured!",
                    description: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
            }
        }
    }

    useEffect(() => {
        socket.emit("setup", user);
        socket.emit("find active users", user);
    }, []);

    useEffect(() => {
        fetchMessages();
        selChat = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (messageReceived) => {
            if (
                !selChat ||
                selChat._id !== messageReceived.chat._id
            ) {
                if (!notifications.includes(messageReceived)) {
                    setNotifications([messageReceived, ...notifications]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, messageReceived]);
                setFetchAgain(!fetchAgain);
            }
        });
        socket.on("get active users", (active) => {
            setActiveUsers(active);
            // setFetchAgain(!fetchAgain);
        })
        
    });

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {messages &&
                            (!selectedChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectedChat.users)}
                                    <UserProfileModal
                                        user={getSenderFull(user, selectedChat.users)}
                                    ><InfoIcon _hover={{ cursor: "pointer" }} /></UserProfileModal>
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName}
                                    <UpdateGroupChatModal
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </>
                            ))
                        }
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <FormControl
                            id="first-name"
                            isRequired
                            mt={3}
                            onKeyDown={sendMessage}
                            display="flex"
                            columnGap="15px"
                        >

                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                ref={newMessage}
                            />

                            <Button colorScheme='blue' onClick={sendMessageButtonHandler}>Send</Button>
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Select who you want to chat with.
                    </Text>
                </Box>
            )}
        </>
    );
}

export default SingleChat
