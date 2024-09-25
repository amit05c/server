// socket.js
const baseUrl = window.location.origin;
const socket = io(baseUrl);

// Log when connected
const user= JSON.parse(localStorage.getItem("user"));
socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("setup", { _id: user._id });

    socket.emit("fetch chat list", user._id );

});

socket.on("disconnect", () => {
    console.log("Socket disconnected");
});



export default socket;
