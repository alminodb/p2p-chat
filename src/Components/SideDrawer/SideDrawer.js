import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
    Avatar,
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Spinner,
    Text,
    Tooltip,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";
import UserProfileModal from "../../Modals/UserProfileModal";
import { SocketState } from "../../Context/SocketProvider";
import FriendsModal from "../../Modals/FriendsModal";
import NotificationMenu from "./Menus/NotificationMenu";

const SideDrawer = ({ fetchAgain, setFetchAgain }) => {

    const history = useHistory();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { user, setUser, setSelectedChat, chats, setChats } = ChatState();
    const socket = SocketState();

    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        socket.emit("log out", user);
        toast({
            title: "You are now signed out.",
            status: "warning",
            duration: 2000,
            isClosable: true,
            position: "top"
        });
        setUser({});
        history.push("/");
    }

    const searchHandler = async () => {
        if (!search) {
            toast({
                title: "Search field must not be empty.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            return;
        }

        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error occured!",
                description: error.response.data.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
        }
        setLoading(false);
    }

    const accessChat = async (userId) => {

        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        }
    };

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
            >
                <Tooltip label="Search users for chatting" hasArrow placement="bottom-end">
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="fa fa-search"></i>
                        <Text display={{ base: "none", md: "flex" }} px="4">
                            Search users
                        </Text>
                    </Button>
                </Tooltip>

                <Text fontSize="2xl" fontFamily="Work sans">
                    Chat
                </Text>

                <div>
                    <NotificationMenu accessChat={accessChat}>
                        <MenuButton p={1} >
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                    </NotificationMenu>

                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size='sm' cursor="pointer" name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <UserProfileModal user={user}>
                                <MenuItem>My profile</MenuItem>
                            </UserProfileModal>
                            <FriendsModal accessChat={accessChat}>
                                <MenuItem>Friends</MenuItem>
                            </FriendsModal>
                            <MenuDivider />
                            <MenuItem color="red" fontWeight="bold" onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder="Search by name or email"
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={searchHandler}>Go</Button>
                        </Box>
                        {
                            loading ? (
                                <ChatLoading />
                            ) : (
                                searchResult?.map(r => <UserListItem key={r._id} listUser={r} handleFunction={() => accessChat(r._id)} />)
                            )
                        }
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
};

export default SideDrawer;