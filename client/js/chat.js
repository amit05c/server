import socket from './socket.js';

// Function to populate the chat list
let  currentChatId  = null;
let selectedChatRoom = null;
let isGroupChat = false;
const baseUrl = window.location.origin;

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem("user"));
function populateChatList(chats) {
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = ""; // Clear previous chat list

    chats.forEach(chat => {
        const listItem = document.createElement("li");
        if (chat.isGroupChat) {
            listItem.textContent = chat.chatName;
            const profileImg = document.createElement("img");
            profileImg.src = ' https://cdn-icons-png.flaticon.com/512/2352/2352167.png'
            profileImg.classList.add("profile-image");
            listItem.prepend(profileImg); 
        } else {
            console.log("user is >>>>>>>", chat)
            const findRecipient = chat.users.find(el => el._id != user._id);
            listItem.textContent = findRecipient.name;

            const profileImg = document.createElement("img");
            profileImg.src = findRecipient.pic;
            profileImg.alt = findRecipient.name;
            profileImg.classList.add("profile-image");

            // Append the image to the list item
            listItem.prepend(profileImg); 
        }

        listItem.addEventListener("click", () => {
            console.log("is grouped",chat);
            if(chat.isGroupChat){
                isGroupChat = true
            }else{
                isGroupChat= false
            }
            selectedChatRoom = chat;
            openChat(chat._id);
        });

        chatList.appendChild(listItem);
    });
}


// Listen for chat list from the server
socket.on('chat_list', (chats) => {
    console.log("Received chat list:", chats);
    populateChatList(chats);
});

// socket.on('chat_list', (chats) => {
//     populateChatList(chats);
// });

socket.on('chat details',(data)=>{
    displayChatMessages(data)
})


socket.on('message recieved',(data)=>{
    const oldMessage = JSON.parse(localStorage.getItem('chatMessages'));
    console.log("Old message received",oldMessage)
    const allMessages = [...oldMessage,data]
    displayChatMessages(allMessages);
})

// Function to open a chat
function openChat(chatId) {
    console.log("Opening chat:", chatId);
    currentChatId = chatId;
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = 'block'; 
    socket.emit('fetch chat details',chatId)
    
}

// Sending messages
document.getElementById("send-message").addEventListener("click", () => {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;
    socket.emit("new message", { content: message, chatId: currentChatId, sender: user._id, users: selectedChatRoom.users });
    console.log("Message sent:", message);
    messageInput.value = ""; 
});



document.getElementById("user-search").addEventListener("input", async function() {
  const searchTerm = this.value;

  if (searchTerm.length === 0) {
    //   populateChatList();
      return;
  }

  // Retrieve the token from local storage
//   const token = localStorage.getItem('token');

  try {
      const response = await fetch(`${baseUrl}/api/user?search=${searchTerm}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const users = await response.json();
         displaySearchUser(users)
  } catch (error) {
      console.error('Error fetching users:', error);
  }
});


document.getElementById("chat-list").addEventListener("click", async (event) => {
  const userId = event.target.getAttribute("data-user-id");

  if (!userId) return;

  try {
      // Fetch the chat history with the selected user
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/chat/${userId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
      });

      const chatHistory = await response.json();

      // Display the chat messages
      displayChatMessages(chatHistory);
  } catch (error) {
      console.error('Error fetching chat history:', error);
  }
});

// Function to display chat messages in the chat window
// function displayChatMessages(messages) {
//     localStorage.setItem('chatMessages', JSON.stringify(messages));
//   const chatMessagesDiv = document.getElementById("chat-messages");
//   const chatUser = document.getElementById("chat-user");
//   const findRecipient = selectedChatRoom.users.find(elem => elem._id != user._id);
//   chatUser.innerHTML = `
//   <div class="recipient-info">
//     <span class="recipient-name">${findRecipient.name}</span>
//   </div>
// `;
//   console.log("messagess: ", messages)
//   chatMessagesDiv.innerHTML = '';
//   messages.forEach((message) => {
//       console.log("recipient>>>>>>>>>>>>>>>>>>>>>>>>: ", message)
//       const messageElement = document.createElement("div");
//       messageElement.textContent = message.content; // Assuming the message object has a "content" field
//       chatMessagesDiv.appendChild(messageElement);
//   });
// }


// function displayChatMessages(messages) {
//     localStorage.setItem('chatMessages', JSON.stringify(messages));
  
//     const chatMessagesDiv = document.getElementById("chat-messages");
//     const chatUser = document.getElementById("chat-user");
    
//     console.log("selected chat ",selectedChatRoom)
//     chatUser.innerHTML= ''
//     if(selectedChatRoom.isGroupChat){
//         chatUser.innerHTML = `
//         <div class="recipient-info">
//           <span class="recipient-name">${selectedChatRoom.chatName}</span>
//         </div>
//       `;
//     }else{
//         const findRecipient = selectedChatRoom.users.find(elem => elem._id != user._id);
    
//     // Display the recipient's name
//     chatUser.innerHTML = `
//       <div class="recipient-info">
//         <span class="recipient-name">${findRecipient.name}</span>
//       </div>
//     `;
//     }
    
    
//     // Clear previous messages
//     chatMessagesDiv.innerHTML = '';
//      console.log("Group messaes",messages)
//     // Loop through messages and display them
//     messages.forEach((message) => {
//         const messageElement = document.createElement("div");
//         messageElement.classList.add("message");
        
//         // Differentiate between the recipient and the logged-in user's messages
//         if (message.sender._id === user._id) {
//             messageElement.classList.add("sent-message"); // For the logged-in user's messages
//         } else {
//             messageElement.classList.add("received-message"); // For the recipient's messages
//         }
        
//         // Add the message content
//         messageElement.textContent = message.content;
//         chatMessagesDiv.appendChild(messageElement);
//     });
    
//     // Scroll to the bottom after displaying messages
//     chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
// }

function displayChatMessages(messages) {
    localStorage.setItem('chatMessages', JSON.stringify(messages));

    const chatMessagesDiv = document.getElementById("chat-messages");
    const chatUser = document.getElementById("chat-user");

    console.log("selected chat ", selectedChatRoom);
    chatUser.innerHTML = '';

    if (selectedChatRoom.isGroupChat) {
        chatUser.innerHTML = `
        <div class="recipient-info">
          <span class="recipient-name">${selectedChatRoom.chatName}</span>
        </div>
      `;
    } else {
        const findRecipient = selectedChatRoom.users.find(elem => elem._id != user._id);

        // Display the recipient's name
        chatUser.innerHTML = `
      <div class="recipient-info">
        <span class="recipient-name">${findRecipient.name}</span>
      </div>
    `;
    }

    // Clear previous messages
    chatMessagesDiv.innerHTML = '';
    console.log("Group messages", messages);

    // Loop through messages and display them
    messages.forEach((message) => {
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");

        const messageElement = document.createElement("div");
        messageElement.classList.add("message");

        if (message.sender._id === user._id) {
            messageElement.classList.add("sent-message");

            // Display "You" for logged-in user's messages
            if(isGroupChat){
                const senderLabel = document.createElement("div");
                senderLabel.classList.add("sender-label", "right-align");
                senderLabel.textContent = "You";
                messageContainer.appendChild(senderLabel);
            }
           
        } else {
            messageElement.classList.add("received-message");

            // Display the sender's name for other users
            if(isGroupChat){
                const senderLabel = document.createElement("div");
                senderLabel.classList.add("sender-label", "left-align");
                senderLabel.textContent = message.sender.name;
                messageContainer.appendChild(senderLabel);
            }
           
        }

        // Add the message content
        messageElement.textContent = message.content;
        messageContainer.appendChild(messageElement);
        chatMessagesDiv.appendChild(messageContainer);
    });

    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}




// Function to display fetched users
function displayUsers(users) {
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = ''; // Clear existing chat list
  
    users.forEach(user => {
      console.log("user is >>>>>>",user)
        const listItem = document.createElement("li");
        listItem.textContent = user.name; // Adjust according to your user object
        listItem.addEventListener("click", () =>{ 
            // openChat(user._id)
            accessChat(user._id)
        }); 
        chatList.appendChild(listItem);
    });
  }


// Function to display fetched users
// function displaySearchUser(users) {
//     const chatList = document.getElementById("search-list");
//     chatList.innerHTML = ''; // Clear existing chat list
  
//     users.forEach(user => {
//       console.log("user is >>>>>>",user)
//         const listItem = document.createElement("li");
//         listItem.textContent = user.name; 
//         listItem.addEventListener("click", () =>{ 
//             accessChat(user._id)
//         }); 
//         chatList.appendChild(listItem);
//     });
//   }


// Function to display fetched users in search modal
function displaySearchUser(users) {
    const searchModal = document.getElementById("search-modal");
    const searchList = document.getElementById("search-list");
    
    // Show the search modal
    searchModal.style.display = "block";
    
    // Clear existing search results
    searchList.innerHTML = '';
    
    // Populate search results
    users.forEach(user => {
      const listItem = document.createElement("li");
      listItem.textContent = user.name;
      listItem.addEventListener("click", () => { 
        accessChat(user._id);
        searchModal.style.display = "none"; // Close modal after selecting a user
      });
      searchList.appendChild(listItem);
    });
  }
  
  // Close the search modal when the close button is clicked
  document.getElementById("close-search").addEventListener("click", () => {
    document.getElementById("search-modal").style.display = "none";
  });
  
  // Hide the search modal if the user clicks outside the modal content
  window.addEventListener("click", (event) => {
    const searchModal = document.getElementById("search-modal");
    if (event.target !== searchModal && !searchModal.contains(event.target) && event.target.id !== "user-search") {
      searchModal.style.display = "none";
    }
  });
  

async function accessChat(userId){
    try {
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
            },
            body: JSON.stringify({ userId }),
        });
  
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
  
        const res = await response.json();
        socket.emit('fetch chat details',res._id)
        if(res.isGroupChat){
            isGroupChat = true
        }else{
            isGroupChat= false
        }
        selectedChatRoom = res
        openChat(res._id)
       
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// create new group chat
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("group-modal");
    const openModalBtn = document.getElementById("open-modal");
    const closeModalBtn = document.getElementsByClassName("close")[0];
    const createGroupBtn = document.getElementById("create-group");
  
    // Open the modal when the plus icon is clicked
    openModalBtn.onclick = function() {
      modal.style.display = "block";
      fetchUsers(); // Load the user list dynamically
    }
  
    // Close the modal when the close button is clicked
    closeModalBtn.onclick = function() {
      modal.style.display = "none";
    }
  
    // Close the modal if the user clicks outside of the modal content
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  

    // Fetch users and display them in the modal
    async function fetchUsers() {
      const userListDiv = document.getElementById("user-list");
      userListDiv.innerHTML = ''; // Clear previous user list
      const token = localStorage.getItem('token');
  
      try {
        const response = await fetch(`${baseUrl}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const users = await response.json();
        
        // Display users as checkboxes
        users.forEach(user => {
          const label = document.createElement('label');
          label.innerHTML = `<input type="checkbox" value="${user._id}"> ${user.name}`;
          userListDiv.appendChild(label);
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
  
    // Handle group creation
    createGroupBtn.onclick = async function() {
      const groupName = document.getElementById("group-name").value;
      const selectedUsers = Array.from(document.querySelectorAll('#user-list input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
      
      if (!groupName || selectedUsers.length === 0) {
        alert("Please enter a group name and select users.");
        return;
      }
     
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${baseUrl}/api/chat/group`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name:groupName, users: selectedUsers })
        });
  
        if (!response.ok) {
          throw new Error('Failed to create group');
        }
  
        const group = await response.json();
        socket.emit("fetch chat list", user._id );
        alert(`Group "${groupName}" created successfully`);
        modal.style.display = "none";
      } catch (error) {
        console.error('Error creating group:', error);
      }
    }
  });
  



