// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBUVIPi-kduciF6h25AXoaJSyTXR1WAyzo",
    authDomain: "masa-nar.firebaseapp.com",
    databaseURL: "https://masa-nar-default-rtdb.firebaseio.com",
    projectId: "masa-nar",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// Listen for auth state changes
auth.onAuthStateChanged(updateUI);

// Month names for date formatting
const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// Load messages from Firebase
document.addEventListener("DOMContentLoaded", () => {
    const tags = localStorage.getItem("tags");
    const userSources = tags ? JSON.parse(tags) : [];
    const allMessages = [];
    const promises = userSources.map((source) =>
        db
            .ref(source)
            .once("value")
            .then((snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const messages = childSnapshot.val();
                    allMessages.push({ source, ...messages });
                });
            })
            .catch((error) => {
                console.error(`Error fetching data from ${source}:`, error);
            })
    );

    Promise.all(promises)
        .then(() => {
            allMessages.sort((a, b) => b.id - a.id);
            const messagesContainer = document.getElementById("messages");
            const messageFragments = document.createDocumentFragment();

            allMessages.forEach((message) => {
                const messageHTML = document.createElement("div");
                messageHTML.classList.add("post");
                messageHTML.id = message.id;
                const formattedSource = message.source.startsWith("@") ? message.source : `#${message.source}`;
                const formatRedirect = `${message.source}#${message.id}#${message.usr}`;
                
                messageHTML.innerHTML = `
                    <div class='user-info' >
                        <img src='${message.pp}' alt='user' onclick='updateUserProfile("${message.uid}")'>
                        <span class='username'>${message.usr}</span>
                        <div class='server'>${formattedSource}</div>
                        <span class='date'>${message.time}</span>
                    </div>
                    <div class='post-content'>
                        <div class='post-icons'>
                            <li class='bx bx-share' onclick='redirectToEditor("${formatRedirect}")'></li>
                            <li class='bx bx-bookmark' onclick='bookmarked(${message.id})'></li>
                            <li class='bx bx-flag' onclick='flag("${formatRedirect}")'></li>
                        </div>
                        <div class='post-body'>
                            <img onerror='this.style.display = "none"' src='${message.img}'></img>
                            <p>${message.msg}</p>
                        </div>
                    </div>
                `;
                messageFragments.appendChild(messageHTML);
            });            

            messagesContainer.appendChild(messageFragments);
        })
        .catch((error) => {
            console.error("Error loading all data:", error);
        });
});

// Create post functionality
document.addEventListener("DOMContentLoaded", () => {
    const addText = document.getElementById("add-text");
    const addList = document.getElementById("add-list");
    const addImage = document.getElementById("add-image");
    const editableArea = document.getElementById("editable-area");

    const createElement = (type) => {
        const element = document.createElement(type);
        element.contentEditable = true;
        element.classList.add("editable-element");
        addLinkConversionListeners(element); 
        return element;
    };

    const addElementBeforeOriginalMessage = (newElement) => {
        const originalMessage = document.querySelector(".original-message"); // or another method to select the original message
        if (originalMessage) {
            editableArea.insertBefore(newElement, originalMessage);
        } else {
            editableArea.appendChild(newElement); // Fallback if #original-message is not found
        }
    };

    addText.addEventListener("click", () => {
        const textElement = createElement("div");
        textElement.innerText = "New Text";
        addElementBeforeOriginalMessage(textElement);
    });

    addList.addEventListener("click", () => {
        const listElement = createElement("ul");
        const listItem = document.createElement("li");
        listItem.innerText = "New List Item";
        listElement.appendChild(listItem);
        addElementBeforeOriginalMessage(listElement);
    });

    addImage.addEventListener("click", () => {
        document.getElementById("imageUploader").click();
    });

    document.getElementById("imageUploader").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgElement = document.createElement("img");
                imgElement.src = e.target.result;
                imgElement.alt = "Image";
                imgElement.classList.add("editable-element");
                addElementBeforeOriginalMessage(imgElement);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("sendBox").addEventListener("submit", postChat);

    function addLinkConversionListeners(element) {
        element.addEventListener("input", convertLinks);
        element.addEventListener("paste", function () {
            setTimeout(convertLinks, 0);
        });
    }

    function convertLinks() {
        const editableElement = this;

        // Split the innerHTML into parts that are already linked and those that are not
        const parts = editableElement.innerHTML.split(/(<a[^>]*>.*?<\/a>)/g);

        // Process only the non-linked parts
        const processedContent = parts
            .map((part) => {
                if (part.startsWith("<a")) {
                    return part; // Return as is if it's already a link
                } else {
                    // Regex to match URLs starting with https://
                    const urlPattern = /https:\/\/[^\s]+/g;
                    return part.replace(urlPattern, function (url) {
                        return `<a href="${url}" target="_blank">${url}</a>`;
                    });
                }
            })
            .join("");

        // Update the div content only if it has changed to prevent cursor jump
        if (editableElement.innerHTML !== processedContent) {
            editableElement.innerHTML = processedContent;
            placeCaretAtEnd(editableElement);
        }
    }

    function placeCaretAtEnd(el) {
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
});


// Create post

function postChat(e) {
    e.preventDefault();
    const timestamp = Date.now();
    const elements = document.querySelectorAll("#editable-area .editable-element");
    const user = firebase.auth().currentUser;

    const urlParams = new URLSearchParams(window.location.search);
    const replyToId = urlParams.get('replyTo');

    elements.forEach((element) => {
        element.setAttribute("contentEditable", "false");
        element.classList.remove("editable-element");
    });

    db.ref(`${document.getElementById("tags").value}/${timestamp}`)
        .set({
            uid: user.uid,
            usr: localStorage.getItem("username"),
            pp: localStorage.getItem("profilepic"),
            msg: document.getElementById("editable-area").innerHTML,
            id: timestamp,
            time: `${new Date().getHours()}:${new Date().getMinutes()} - ${new Date().getDate()} ${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`,
            replyTo: replyToId || null,
        })
        .then(() => {
            document.getElementById("editable-area").innerHTML = "";
            document.getElementById("tags").value = "";
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
}


window.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const replyToId = urlParams.get('replyTo');
    const source = urlParams.get('source');
    const username = urlParams.get('username');
    if (source && source.startsWith('@')) {
        document.getElementById('tags').value = "@"+username;
    } else {
        document.getElementById('tags').value = source;
    }

    if (replyToId && source) {
        db.ref(`${source}/${replyToId}`).once('value').then((snapshot) => {
            const originalMessage = snapshot.val();
            if (originalMessage) {
                displayOriginalMessage(originalMessage);
            }
        }).catch((error) => {
            console.error("Error fetching original message:", error);
        });
    }
});


function displayOriginalMessage(message) {
    const originalMessageDiv = document.createElement('div');
    originalMessageDiv.classList.add('original-message');
    
    originalMessageDiv.innerHTML = `
    <article><a href='#${message.id}'>
        <div class="user-info">
            <span class="username">${message.usr}</span>
            <span class="date">${message.time}</span>
        </div>
        <div class="post-content">${message.msg}</div>
    </a></article>
        
    `;

    // Insert the original message before the editable area
    originalMessageDiv.classList.add('original-message');

    // 'editable-area' ID'sine sahip elemente erişin
    const editorArea = document.getElementById('editable-area');

    // 'originalMessageDiv' öğesini 'editorArea' elementinin içine ekleyin
    editorArea.appendChild(originalMessageDiv);
}

// Fetch user profile data
function updateUI(user) {
    if (user) {
        db.ref(`duvar/${user.uid}`)
            .once("value")
            .then((snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    localStorage.setItem("profilepic", userData.pp);
                    localStorage.setItem("username", userData.username);
                    localStorage.setItem("tags", JSON.stringify(userData.followTags));
                    
                    document.getElementById("profile-pic").src = localStorage.getItem("profilepic");
                    document.getElementById("card-pfp").src = localStorage.getItem("profilepic");
                    document.getElementById("card-username").innerText = userData.username;
                    document.getElementById("card-label-content").innerText = userData.followTags;
                    document.querySelector(".logout").style.display = "inline-block";

                    // Followed tags HTML integration
                    const followedTagsContainer = document.getElementById("servers");

                    userData.followTags.slice(2).forEach(tag => {
                        followedTagsContainer.innerHTML += `<div class="server">${tag} <i class="bx bx-x" onclick="serverExit('${tag}')"></i></div>`;
                    });
                } else {
                    console.error("User data not found.");
                }
            })
            .catch((error) => {
                console.error("Error fetching profile data:", error);
            });
    } else {
        if (window.location.pathname == "/index.html" || window.location.pathname == "/masa/") {
            localStorage.setItem("profilepic", "https://pbs.twimg.com/profile_images/1545518896874242055/s8icSRfU_400x400.jpg");
            localStorage.setItem("username", "Anonim");
            localStorage.setItem("tags", JSON.stringify(["duyurular", "ortak"]));
            document.getElementById("servers").innerHTML += `<div class="server">ortak</div>`;
        } else {
            window.location.href = "sign.html";
        }
    }
}

function serverExit(serverName) {
    const userId = auth.currentUser.uid;
    const userRef = db.ref("duvar/" + userId);

    userRef.once("value")
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData && userData.followTags) {
                const updatedTags = userData.followTags.filter(tag => tag !== serverName);

                // Kullanıcının profilinde followTags listesini güncelle
                userRef.update({ followTags: updatedTags })
                    .then(() => {
                        console.log(`Başarıyla ${serverName} sunucusundan çıkıldı.`);
                        window.location.reload();
                        // UI'dan sunucu bilgisini kaldırma vb. işlemleri burada yapabilirsiniz
                    })
                    .catch(error => {
                        console.error("Sunucudan çıkış sırasında hata oluştu:", error);
                    });
            } else {
                console.error("Kullanıcı verileri bulunamadı veya kullanıcı sunucuları takip etmiyor.");
            }
        })
        .catch(error => {
            console.error("Profil alınırken hata oluştu:", error);
        });
}


function logout() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            console.log("signOut");window.location.href = "sign.html";
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
}

function updateUserProfile(userId) {
    const user = firebase.auth().currentUser
    const userRef = db.ref("duvar/" + userId);

    userRef.once("value")
        .then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById("card-pfp").src = userData.pp;
                document.getElementById("card-username").innerText = userData.username;
                document.getElementById("card-label-content").innerText = userData.followTags.join(', ');
                document.getElementById("profile-popup").style.display = "block";
                if (user.uid != userId) {
                    document.querySelector(".logout").style.display = "none";
                } else {
                    document.querySelector(".logout").style.display = "inline-block";
                }
            } else {
                console.error("Kullanıcı verileri bulunamadı.");
            }
        })
        .catch(error => {
            console.error("Profil alınırken hata oluştu:", error);
        });
}