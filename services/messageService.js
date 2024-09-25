const asyncHandler = require("express-async-handler");
const Message = require("../models/messaeModel");
const User = require("../models/userModel");
const {Chat} = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (chatId) => {
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");
      return messages
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (data) => {
  const { content, chatId,sender } = data;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: sender,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
   console.log(message)
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    console.log(message)
    message = await Chat.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
     await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

   return message;
  }
   catch (error) {
    console.log("error creating message",error);
    res.status(400);
    throw new Error(error.message);
   }
});

module.exports = { allMessages, sendMessage };
