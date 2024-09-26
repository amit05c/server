// socket.js
const socketIO = require("socket.io");
const { fetchChats } = require("../services/chatService");
const { allMessages, sendMessage } = require("../services/messageService");
const { Chat } = require("../models/chatModel");

const socketSetup = (server) => {
  const io = socketIO(server, {
    pingTimeout: 60000,
    cors: {
      origin: "",
      // credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", async(newMessageRecieved) => {
      // var chat = newMessageRecieved.chat;

      // if (!chat.users) return console.log("chat.users not defined");
       const respone =  await sendMessage(newMessageRecieved)
      console.log("chat room is >>>>>>>>>>>>>>>>",newMessageRecieved);
      newMessageRecieved.users.forEach(async(user) => {
        // if (user._id == newMessageRecieved.sender._id) return;
        const checkFirstChat = await Chat.find({})
        socket.in(user._id).emit("message recieved", respone);
      });
      socket.emit("message recieved", respone)
    });

    socket.on("fetch chat list", async(userId) => {
      // Fetch chat list from the database and emit it
      // Example: Fetching chats for the user with userId
      const chatList = await fetchChats(userId);
        socket.emit("chat_list", chatList);
    });

    socket.on("fetch chat details", async (chatId) => {
        try {
          console.log("chat_details", chatId);
       // Fetch single chat details and emit them
      // Example: Fetching chat details for chatId
      const chatDetails = {}; // Replace with DB query
      const chatData = await allMessages(chatId)
      socket.emit("chat details", chatData);
        } catch (error) {
          console.error(error);
            socket.emit("error", { message: "Error fetching chats" });
        }
     
    });

    socket.off("setup", (userData) => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
    
  });
};

module.exports = socketSetup;
