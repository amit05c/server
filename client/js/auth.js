const baseUrl = window.location.origin;
const signupForm = document.getElementById('signup-form');
if(signupForm){
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
    
        try {
            const response = await fetch(`${baseUrl}/api/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: username, email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Signup successful! Please login.');
                window.location.href = 'login.html'; // Redirect to login page
            } else {
                alert(data.message || 'Signup failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while signing up.');
        }
    })
}
;

// Handle Login
// Handle Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${baseUrl}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save the token if you want to use it later
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                // Initialize Socket.IO connection after successful login
                initializeSocket(data._id); // Assuming userId is returned in the response
                // Redirect to index.html on successful login
                window.location.href = 'index.html';
            } else {
                showToast(data.message || 'Login failed. Please try again.'); // Show toast on failure
            }
        } catch (error) {
            console.error('Error logging in:', error);
            showToast('An error occurred. Please try again.');
        }
    });
}

// Function to show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show'; // Add "show" class to make it visible

    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}



// Function to initialize socket connection
function initializeSocket(userId) {
    const socket = io(baseUrl); // Initialize the socket connection

    socket.emit("setup", { _id: userId }); // Emit the setup event with user ID

    // Request the chat list after setting up the socket connection
    socket.emit("fetch chat list", userId);

    // Listen for chat list from the server
    socket.on('chat_list', (chats) => {
        console.log("Received chat list:", chats);
        // populateChatList(chats); // Call function to populate chat list
    });
}
