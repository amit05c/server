// socket.js
const baseUrl = window.location.origin;
const socket = io(baseUrl); // Connect to your backend

// Log when connected
const user= JSON.parse(localStorage.getItem("user"));
socket.on("connect", () => {
    console.log("Socket connected:", socket.id); // Logs the socket ID for reference
    socket.emit("setup", { _id: user._id }); // Emit the setup event with user ID

    // Request the chat list after setting up the socket connection
    socket.emit("fetch chat list", user._id );

});

// Optionally, you can log any disconnection
socket.on("disconnect", () => {
    console.log("Socket disconnected");
});



// Export the socket instance
export default socket;
