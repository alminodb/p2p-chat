import React, { useEffect, useState } from 'react'
import { ChatState } from '../../../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text } from '@chakra-ui/react';
import { ArrowBackIcon, InfoIcon, ViewIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../../../Config/ChatLogic';
import UserProfileModal from '../../../Modals/UserProfileModal';
import UpdateGroupChatModal from '../../../Modals/UpdateGroupChatModal';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const { selectedChat, setSelectedChat, user } = ChatState();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(selectedChat.groupAdmin)
    }, [])

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
                        {/* {messages && */}
                        {(!selectedChat.isGroupChat ? (
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
                                    // fetchMessages={fetchMessages}
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
                                {/* <ScrollableChat messages={messages} /> */}
                            </div>
                        )}

                        <FormControl
                            idisplay="first-name"
                            isRequired
                            mt={3}
                        >

                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                            />
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