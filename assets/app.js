import { database, auth, update, set, ref, get, onValue, signOut, onAuthStateChanged } from './database.js';

lucide.createIcons();

// Kullanıcı oturum durumunu kontrol et
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login";
    } else {
        const tabs = document.getElementById("tabs");
        const uid = user.uid;    
        
        localStorage.setItem("uid", uid);
        localStorage.setItem("creationTime", user.metadata.creationTime);
        get(ref(database, `duvar/${uid}/pp`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    localStorage.setItem("pp", snapshot.val())
                    const ppUrl = snapshot.val();
                    document.getElementById("avatar").src = ppUrl;
                    document.getElementById("avatarMobile").src = ppUrl;
                } else {
                    console.log("Profil resmi bulunamadı.");
                }
            })
            .catch((error) => {
                console.error("Hata:", error);
            });
            
        get(ref(database, `duvar/${uid}/username`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    localStorage.setItem("username", snapshot.val())
                } else {
                    console.log("Kullanıcı adı bulunamadı.");
                }
            })
            .catch((error) => {
                console.error("Hata:", error);
            });

        get(ref(database, `duvar/${uid}/chatStatus`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    localStorage.setItem("chatStatus", snapshot.val())
                } else {
                    console.log("Dm durumu bulunamadı.");
                }
            })
            .catch((error) => {
                console.error("Hata:", error);
            });
        
        get(ref(database, `duvar/${uid}/followTags`)).then(snapshot => {
            if (snapshot.exists()) {
                const followTags = snapshot.val();
                localStorage.setItem("table", snapshot.val())
                followTags.forEach(tag => {
                    const button = document.createElement("button");
                    button.classList.add("tab");
                    button.innerText = tag.startsWith("@") ? tag : "#"+tag;
                    tabs.appendChild(button);
                });
                startTags();
            } else {
                const defaultFollowTags = ["duyurular", "@" + localStorage.getItem("username")];
                set(ref(database, `duvar/${uid}/followTags`), defaultFollowTags)
                    .then(() => {
                        localStorage.setItem("table", defaultFollowTags);
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error("Veri Firebase'e kaydedilirken bir hata oluştu:", error);
                    });
                    }
                }).catch(error => {
                    console.error("Veri alınırken bir hata oluştu:", error);
                });
            }
});

document.getElementById("logoutButton").addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log("Kullanıcı çıkış yaptı.");
        // Çıkış sonrası yönlendirme veya işlem yapılabilir
    }).catch((error) => {
        console.error("Çıkış yapılırken hata oluştu:", error);
    });
    window.location.reload();
});

document.getElementById("chatButton").addEventListener("click", () => {
    window.location.href = `?dm=${document.getElementById("profileUsername").innerText}`;
});

document.getElementById("chatStatusButton").addEventListener("click", () => {
    const user = auth.currentUser;
    if (user) {
        const userRef = ref(database, `duvar/${user.uid}`);
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const currentStatus = snapshot.val().chatStatus;
                    // chatStatus'u toggle et
                    update(userRef, { chatStatus: !currentStatus })
                        .then(() => console.log("Chat status toggled!"))
                        .catch((error) => console.error("Error toggling chat status: ", error));
                        if (!currentStatus == false) {
                            document.getElementById("profileAbout").innerHTML = `<span>Merhaba, adım ${localStorage.getItem("username")}. Katıldığım masalar aşağıda. </span><p>${localStorage.getItem("table")}</p>`;
                            document.getElementById("chatStatusButton").innerHTML = "<i data-lucide='message-circle-off'></i>";
                            lucide.createIcons();
                        } else {
                            document.getElementById("profileAbout").innerHTML = `<span>Merhaba, adım ${localStorage.getItem("username")}. Katıldığım masalar aşağıda. Bana dm gönderebilirsiniz 😊</span><p>${localStorage.getItem("table")}</p>`;
                            document.getElementById("chatStatusButton").innerHTML = "<i data-lucide='message-circle'></i>";
                            lucide.createIcons();
                        }
                    } else {
                    console.log("No user data found");
                }
            })
            .catch((error) => console.error("Error fetching user data: ", error));
    } else {
        console.log("No user signed in");
    }
});

// Veri çekme
const messageFeed = document.querySelector(".message-feed");
let selectedTable = null;

function fetchUserProfile(uid) {
    const userRef = ref(database, "duvar/" + uid);
    return get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            return userData;
        } else {
            return { pp: "https://pbs.twimg.com/profile_images/1545518896874242055/s8icSRfU_400x400.jpg", usr: "Unknown" }; // Default fallback
        }
    });
}

async function fetchAllMessages() {
    const rawData = localStorage.getItem("table");
    let followTags = [];

    if (rawData) {
        try {
            followTags = rawData.includes(",") ? rawData.split(",") : JSON.parse(rawData);
        } catch (error) {
            console.error("Geçersiz veri formatı. Lütfen 'table' verisini kontrol edin.");
            return;
        }
    } else {
        console.log("Hiçbir takip edilen masa bulunamadı.");
        return;
    }

    followTags = followTags.map(tag => tag.startsWith("@") ? "dm/" + tag.substring(1) : tag);
    const allMessages = [];

    const fetchPromises = followTags.map(async (tag) => {
        const tableRef = ref(database, tag);
        try {
            const snapshot = await get(tableRef);
            if (snapshot.exists()) {
                const messages = snapshot.val();
                for (const key in messages) {
                    const message = messages[key];
                    message.table = tag;
                    message.key = key;
                    allMessages.push(message);
                }
            }
        } catch (error) {
            console.error(`Masa (${tag}) verisi alınırken hata oluştu:`, error);
        }
    });

    await Promise.all(fetchPromises);

    allMessages.sort((a, b) => b.id - a.id);
    displayMessages(allMessages);
}

async function displayMessages(messages) {
    messageFeed.innerHTML = "";

    const userId = auth.currentUser ? auth.currentUser.uid : localStorage.getItem("uid");

    if (!userId) {
        console.error("Kullanıcı kimliği alınamadı!");
        return;
    }

    // 📌 Kullanıcı verilerini **tek seferde** al
    const uniqueUserIds = [...new Set(messages.map(msg => msg.uid))];
    const userProfiles = {};
    await Promise.all(uniqueUserIds.map(async (uid) => {
        userProfiles[uid] = await fetchUserProfile(uid);
    }));

    // 📌 Bookmark verilerini **tek seferde** al
    const bookmarkRefs = messages.map(msg => {
        const bookmarkPath = msg.table.startsWith("dm/") ? `dm/${userProfiles[msg.uid].username}` : msg.table;
        return `${bookmarkPath}/${msg.key}/bookmarked`;
    });

    const bookmarks = {};
    await Promise.all(bookmarkRefs.map(async (path) => {
        const bookmarkRef = ref(database, path); 
        try {
            const snapshot = await get(bookmarkRef);
            bookmarks[path] = snapshot.val() || [];
        } catch (error) {
            console.error("Bookmark verisi alınamadı:", error);
        }
    }));

    // 📌 HTML işlemleri tek seferde yap
    let htmlContent = "";
    messages.forEach((message) => {
        const userData = userProfiles[message.uid];
        const timeDisplay = new Date(Number(message.key)).toLocaleString("tr-TR", {
            hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric"
        });
        const tableDisplay = message.table.startsWith('dm/') ? `@${message.table.slice(3)}` : `#${message.table}`;
        const bookmarkPath = message.table.startsWith("dm/") ? `dm/${userData.username}` : message.table;
        const bookmarkKey = `${bookmarkPath}/${message.key}/bookmarked`;

        const isBookmarked = Array.isArray(bookmarks[bookmarkKey]) && bookmarks[bookmarkKey].includes(userId);
        const bookmarkFill = isBookmarked ? "white" : "none";

        htmlContent += `
            <div class="message" id="${message.key}">
                <div class="message-header">
                    <div class="avatar">
                        <img src="${userData.pp}" alt="${userData.username}" onclick="profileUidLoad('${message.uid}')"/>
                    </div>
                    <span class="message-author">${userData.username}</span>
                    <span class="message-table">${tableDisplay}</span>
                    <span class="message-timestamp">${timeDisplay}</span>
                </div>
                <div class="message-box">
                    <div class="message-icon">
                        <i data-lucide="reply" onclick="redirectToEditor('${bookmarkPath}$${message.key}')"></i>
                        <i data-lucide="bookmark" msg-bookmark="${bookmarkPath}$${message.key}" fill="${bookmarkFill}"></i>
                    </div>
                    <div class="message-content">${message.msg}</div>
                </div>
            </div>
        `;
    });

    messageFeed.innerHTML = htmlContent;
    lucide.createIcons();
}

fetchAllMessages()

function startTags() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            if (tab.innerText.startsWith("@")) {
                selectedTable = "dm/" + tab.innerText.slice(1);
            } else if (tab.innerText.startsWith("#")) {
                selectedTable = tab.innerText.slice(1);
            } else if (tab.innerText == "Tümü") {
                fetchAllMessages();
                selectedTable = null;
            }
            filter(tab.innerText);
        });
    });
}

function filter(tableName) {
    const messages = document.querySelectorAll("#feed .message");
    messages.forEach((message) => {
        const messageTable = message.querySelector(".message-table");
        if (messageTable && messageTable.innerText.includes(tableName)) {
            message.style.display = "";
        } else {
            message.style.display = "none";
        }
    });
}

document.getElementById("loadBookmark").addEventListener("click", () => {
    const icon = document.querySelector("#loadBookmark");
    const messages = document.querySelectorAll("#feed .message");

    messages.forEach((message) => {
        const bookmarkIcon = message.querySelector(".message-icon .lucide-bookmark");
        let fill = "";

        if (icon.querySelector(".lucide-bookmark").getAttribute("fill") == "none") {
            fill = "white";
        } else {
            fill = "";
        }
        
        if (bookmarkIcon && bookmarkIcon.getAttribute("fill") === fill) {
            message.style.display = "";
        } else {
            if (!fill) {
                message.style.display = "";
            } else {
                message.style.display = "none";
            }
        }
    });

    if (icon.querySelector(".lucide-bookmark").getAttribute("fill") == "none") {
        document.querySelector("#loadBookmark").querySelector(".lucide-bookmark").setAttribute("fill", "white");
    } else {
        document.querySelector("#loadBookmark").querySelector(".lucide-bookmark").setAttribute("fill", "none");
    }
});

function originalMessageLoad(table, id) {
    const messageRef = ref(database, `${table}/${id}`);
    onValue(messageRef, (snapshot) => {
        if (snapshot.exists()) {
            const message = snapshot.val();
            fetchUserProfile(message.uid).then((userData) => {
            const timestamp = new Date(Number(id)).toLocaleString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
            document.getElementById("originalMessage").innerHTML = `
                    <a href="#${message.id}">
                        <div class="message-header">
                            <span class="message-author">${userData.username}</span>
                            <span class="message-timestamp">${timestamp}</span>
                        </div>
                        <div class="message-content">${message.msg}</div>
                    </a>
            `;
        }
    )}}, (error) => {
        console.error("Veri çekilirken bir hata oluştu:", error);
        document.getElementById("originalMessage").innerHTML = "";
    });
}

function fetchUser(uid) {
    const messageRef = ref(database, `duvar/${uid}`);
    onValue(messageRef, (snapshot) => {
        if (snapshot.exists()) {
            const foundUser = snapshot.val();
            profilePhotos.src = foundUser.pp;
            if (foundUser.chatStatus == false) {
                profileAbout.innerHTML = `<span>Merhaba, adım ${foundUser.username}. Katıldığım masalar aşağıda. </span><p>${foundUser.followTags}</p>`;
                document.getElementById("chatButton").style.display = "none";
            } else {
                profileAbout.innerHTML = `<span>Merhaba, adım ${foundUser.username}. Katıldığım masalar aşağıda. Bana dm gönderebilirsiniz 😊</span><p>${foundUser.followTags}</p>`;
                document.getElementById("chatButton").style.display = "";
            }
            profileUsername.textContent = foundUser.username;
        }
    }, (error) => {
        console.error("Veri çekilirken bir hata oluştu:", error);
    });
}

document.getElementById("profilePhotoUpdateInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function() {
        const base64String = reader.result; // Base64 formatındaki veri

        // Eğer profilePhotoUrl öğesi varsa, dataset.base64 olarak kaydet
        const profilePhotoUrlInput = document.getElementById("profilePhotoUrl");
        if (profilePhotoUrlInput) {
            profilePhotoUrlInput.dataset.base64 = base64String;
        }

        const user = auth.currentUser;

        if (user && base64String) {
            update(ref(database, "duvar/" + user.uid), { pp: base64String })
                .then(() => {
                    document.getElementById("profilePhotos").src = base64String;
                    window.location.reload();
                })
                .catch((error) => alert("Hata: " + error.message));
        } else {
            alert("Lütfen geçerli bir dosya seçin.");
        }
    };

    reader.onerror = function(error) {
        alert("Dosya okunurken hata oluştu: " + error.message);
    };
});

function tableSearch() {
    const user = auth.currentUser;

    if (user) {
        const publicListRef = ref(database, "publicList"); // Açık sunucular

        // **1️⃣ LocalStorage'dan Katıldığımız Sunucuları Al ve Yazdır**
        let userJoinedTags = (localStorage.getItem("table") || "").split(",").map(tag => tag.trim()).filter(tag => tag);
        let tagsFromThirdElement = userJoinedTags.slice(2);

        if (tagsFromThirdElement.length > 0) {
            let joinedItemsHtml = tagsFromThirdElement.map(server => `
                <div class="message">
                    <div class="message-header">
                        <div class="message-icon">
                            <i data-lucide="grid-2x2-x" server-leave="${server}"></i>
                        </div>
                        <div class="message-box">
                            <div class="message-content">${server}</div>
                        </div>
                    </div>
                </div>
            `).join("");

            document.getElementById("servers").innerHTML = joinedItemsHtml;
            lucide.createIcons();
        } else {
            console.log("No servers from the third element onward.");
        }

        // **2️⃣ Firebase'den Açık Sunucuları Çek, Katılmadıklarını Göster**
        get(publicListRef).then((publicSnapshot) => {
            if (publicSnapshot.exists()) {
                const publicServers = publicSnapshot.val();

                // Kullanıcının zaten katılmadığı sunucuları filtrele
                const availableServers = publicServers.filter(server => !userJoinedTags.includes(server));

                if (availableServers.length > 0) {
                    let itemsHtml = availableServers.map(server => `
                        <div class="message">
                            <div class="message-header">
                                <div class="message-icon">
                                    <i data-lucide="grid-2x2-check" server-join="${server}"></i>
                                </div>
                                <div class="message-box">
                                    <div class="message-content">${server}</div>
                                </div>
                            </div>
                        </div>
                    `).join("");

                    document.getElementById("servers").innerHTML += itemsHtml;
                    lucide.createIcons();
                } else {
                    document.getElementById("servers").innerHTML += "<p>Yeni sunucu bulunamadı.</p>";
                }
            } else {
                console.log("Açık sunucular bulunamadı.");
            }
        }).catch((error) => {
            console.error("Açık sunucuları çekme hatası:", error);
        });
    } else {
        console.log("Kullanıcı oturum açmamış.");
    }
}

document.addEventListener("click", async function (event) {
    const user = auth.currentUser;
    const joinBtn = event.target.closest("[server-join]");
    const leaveBtn = event.target.closest("[server-leave]");
    const bookmarkBtn = event.target.closest("[msg-bookmark]");

    if (joinBtn) {
        const serverName = joinBtn.getAttribute("server-join");
        const path = "duvar/" + user.uid + "/followTags";
        
        try {
            // Mevcut diziyi Firebase'den çek
            const snapshot = await get(ref(database, path));
            let currentTags = snapshot.exists() ? snapshot.val() : [];

            // Eğer currentTags array değilse, array yap
            if (!Array.isArray(currentTags)) {
                currentTags = [];
            }

            // Yeni elemanı ekle
            if (!currentTags.includes(serverName)) { // Aynı isimde varsa ekleme
                currentTags.push(serverName);
            }

            // Güncellenmiş diziyi kaydet
            await set(ref(database, path), currentTags);
            window.location.reload();
        } catch (error) {
            console.error("Hata:", error);
        }
    }

    if (leaveBtn) {
        const serverName = leaveBtn.getAttribute("server-leave");
        const path = "duvar/" + user.uid + "/followTags"; // Dizinin tutulduğu yol
        
        try {
            // Mevcut diziyi Firebase’den çek
            const snapshot = await get(ref(database, path));
            let currentTags = snapshot.exists() ? snapshot.val() : [];

            // Eğer currentTags array değilse, array yap
            if (!Array.isArray(currentTags)) {
                currentTags = [];
            }

            // Diziden çıkılacak sunucuyu kaldır
            const updatedTags = currentTags.filter(tag => tag !== serverName);

            // Güncellenmiş diziyi Firebase’e kaydet
            await set(ref(database, path), updatedTags);
            window.location.reload();
        } catch (error) {
            console.error("Hata:", error);
        }
    }

    if (bookmarkBtn) {
        const rawMessageId = bookmarkBtn.getAttribute("msg-bookmark");
        const formattedPath = rawMessageId.replace(/\$/g, "/") + "/bookmarked";
        const messageRef = ref(database, formattedPath);

        try {
            const snapshot = await get(messageRef);
            let bookmarks = snapshot.val() || [];

            if (!bookmarks.includes(user.uid)) {
                bookmarks.push(user.uid);
            } else {
                bookmarks = bookmarks.filter(uid => uid !== user.uid);
            }

            await set(messageRef, bookmarks);
            fetchAllMessages();
        } catch (error) {
            console.error("Hata:", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const shareContent = document.getElementById("share");
    const openShareButton = document.getElementById("openShare");
    const openMobileShareButton = document.getElementById("openMobileShare");
    const shareForm = document.getElementById("shareForm");
    const serversContent = document.getElementById("servers");
    const tableSearcButton = document.getElementById("tableSearcButton");

    const profileContent = document.getElementById("profile");
    const openProfileButton = document.getElementById("openProfile");
    const openMobileProfileButton = document.getElementById("openMobileProfile");
    const profilePhotos = document.getElementById("profilePhotos");
    const profileAbout = document.getElementById("profileAbout");
    const profileTime = document.getElementById("profileTime");
    const profileUsername = document.getElementById("profileUsername");
    const feedContent = document.getElementById("feed");
    const addMediaButton = document.getElementById("addMediaButton");
    const addPollButton = document.getElementById("addPollButton");
    const mediaPreview = document.getElementById("mediaPreview");
    const pollOptions = document.getElementById("pollOptions");
    const addOptionButton = document.getElementById("addOptionButton");
    const originalMessage = document.getElementById("originalMessage");
    
    const params = new URLSearchParams(window.location.search);
    if (params.has("replyTo")) {
        shareContent.style.display = "block";
        profileContent.style.display = "none";
        feedContent.style.display = "none";
        originalMessage.style.display = "block";
        const replyToValue = params.get("replyTo");
        const [section,id] = replyToValue.split("$");
        originalMessageLoad(section.startsWith("@") ? "dm/" + localStorage.getItem("username") : section,id);
        selectedTable = section.startsWith("@") ? "dm/" + section.substring(1) : section;
    }

    if (params.has("dm")) {
        shareContent.style.display = "block";
        profileContent.style.display = "none";
        feedContent.style.display = "none";
        originalMessage.style.display = "none";
        selectedTable = "dm/"+ params.get("dm");
    }

    if (params.has("u")) {
        if (localStorage.getItem("uid") == params.get("u")) {
            profileLoad();
        } else {
            fetchUser(params.get("u"));
            document.getElementById("logoutButton").style.display = "none";
            document.getElementById("tableSearcButton").style.display = "none";
            document.getElementById("chatStatusButton").style.display = "none";
        }
        profileContent.style.display = "block";
        shareContent.style.display = "none";
        feedContent.style.display = "none";
        originalMessage.style.display = "none";
    }

    // Server list Open
    tableSearcButton.addEventListener("click", () => {
        if (serversContent.style.display != "block") {
            serversContent.style.display = "block";
            tableSearch();
        } else {
            serversContent.style.display = "none";
        }
    });
    
    // Share Open
    openShareButton.addEventListener("click", () => {
        if (shareContent.style.display != "block") {
            shareContent.style.display = "block";
            profileContent.style.display = "none";
            feedContent.style.display = "none";
        } else {
            shareContent.style.display = "none";
            feedContent.style.display = "";
        }
    });

    openMobileShareButton.addEventListener("click", () => {
        openShareButton.click();
    });

    // Profile Open
    openProfileButton.addEventListener("click", () => {
        if (profileContent.style.display != "block") {
            profileContent.style.display = "block";
            shareContent.style.display = "none";
            feedContent.style.display = "none";
            profileLoad();
        } else {
            profileContent.style.display = "none";
            feedContent.style.display = "";
        }
    });

    openMobileProfileButton.addEventListener("click", () => {
        openProfileButton.click();
    });

    function profileLoad() {
        document.getElementById("logoutButton").style.display = "";
        document.getElementById("tableSearcButton").style.display = "";
        document.getElementById("chatStatusButton").style.display = "";
        document.getElementById("chatButton").style.display = "none";
        if (localStorage.getItem("chatStatus") == "false") {
            profileAbout.innerHTML = `<span>Merhaba, adım ${localStorage.getItem("username")}. Katıldığım masalar aşağıda. </span><p>${localStorage.getItem("table")}</p>`;
            document.getElementById("chatStatusButton").innerHTML = "<i data-lucide='message-circle-off'></i>";
            lucide.createIcons();
        } else {
            profileAbout.innerHTML = `<span>Merhaba, adım ${localStorage.getItem("username")}. Katıldığım masalar aşağıda. Bana dm gönderebilirsiniz 😊</span><p>${localStorage.getItem("table")}</p>`;
            document.getElementById("chatStatusButton").innerHTML = "<i data-lucide='message-circle'></i>";
            lucide.createIcons();
        }
        profilePhotos.src = localStorage.getItem("pp");
        profileUsername.innerText = localStorage.getItem("username");
        document.getElementById("profilePhotoUpdate").setAttribute("onclick", "document.getElementById('profilePhotoUpdateInput').click();");
        profileTime.innerText =  new Date(localStorage.getItem("creationTime")).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" });
    }

    // Add media
    addMediaButton.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/*";
        input.multiple = true;
        input.style.display = "none";

        input.onchange = (e) => {
            for (const file of e.target.files) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const mediaElement = file.type.startsWith("image/") ? document.createElement("img") : document.createElement("video");
                    mediaElement.src = event.target.result;
                    if (mediaElement.tagName === "VIDEO") {
                        mediaElement.setAttribute("controls", "");
                    }
                    mediaPreview.appendChild(mediaElement);
                };
                reader.readAsDataURL(file);
            }
        };

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    });

    // Toggle poll options
    addPollButton.addEventListener("click", () => {
        pollOptions.style.display = pollOptions.style.display === "none" ? "flex" : "none";
    });

    // Add new poll option
    addOptionButton.addEventListener("click", () => {
        const newOption = document.createElement("input");
        newOption.type = "text";
        newOption.placeholder = `Seçenek ${pollOptions.children.length}`;
        pollOptions.insertBefore(newOption, addOptionButton);
    });

    // Form submission
    shareForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!selectedTable) {
            alert("Lütfen paylaşım yapmadan önce bir masa seçiniz!");
            return;
        }

        const textarea = shareForm.querySelector("textarea");
        
        let messageContent = textarea.value.trim();
        const urlPattern = /https:\/\/[^\s]+/g;
        messageContent = messageContent.replace(urlPattern, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });

        if (!messageContent) {
            alert("Mesaj alanı boş bırakılamaz!");
            return;
        }
        if (originalMessage.innerHTML.trim() !== "") {
            messageContent = textarea.value.trim() + `<div class='original-message'>${originalMessage.innerHTML}</div>`;
        }
        const imgCount = mediaPreview.querySelectorAll('img').length;
        if (mediaPreview.innerHTML.trim() !== "") {
            if (imgCount === 1) {
                messageContent += mediaPreview.innerHTML;
            } else {
                messageContent += `<div class='media-preview'>${mediaPreview.innerHTML}</div>`;
            }
        }

        // Mesajı Firebase'de seçili tabloya kaydet
        const timestamp = Date.now();
        const newMessageRef = ref(database, `${selectedTable}/${timestamp}`);
        const newMessage = {
            id: timestamp,
            msg: messageContent,
            uid: localStorage.getItem("uid"),
        };

        set(newMessageRef, newMessage)
            .then(() => {
                shareForm.reset();
                return
            })
            .catch((error) => {
                console.error("Mesaj gönderilemedi:", error);
                return
            });
            console.log("Form submitted");
            // Reset form and close popup
            shareForm.reset();
            mediaPreview.innerHTML = "";
            pollOptions.style.display = "none";
            while (pollOptions.children.length > 3) {
                pollOptions.removeChild(pollOptions.children[2]);
            }
            shareContent.style.display = "none";
            feedContent.style.display = "";
        });

        document.querySelectorAll("textarea").forEach(function (textarea) {
            textarea.style.height = Math.max(textarea.scrollHeight, 96) + "px";
            textarea.style.overflowY = "hidden";
        
            textarea.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = Math.max(this.scrollHeight, 96) + "px";
            });
    });     
});