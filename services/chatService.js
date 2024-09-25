const { User } = require("../models/userModel");
const { Chat } = require("../models/chatModel");
const asyncHandler = require("express-async-handler");

// Fetch chat list for a user
const fetchChats = asyncHandler(async (userId) => {
  const chats = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  const populatedChats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  return populatedChats;
});

module.exports = {
  fetchChats,
};
