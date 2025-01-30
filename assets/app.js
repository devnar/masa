import { database, auth, set, ref, get, onValue,signOut, onAuthStateChanged } from './database.js';

lucide.createIcons();

// Kullanıcı oturum durumunu kontrol et
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login";
    } else {
        const tabs = document.getElementById("tabs");
        const uid = user.uid;    
        
        localStorage.setItem("uid", uid);
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

// Veri çekme
const messageFeed = document.querySelector(".message-feed");
let table = "@"+localStorage.getItem("username");
let selectedTable = null;

function fetchAllMessages() {
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

    const allMessages = []; // Tüm mesajları toplamak için bir array
    const fetchPromises = followTags.map((tag) => {
        const tableRef = ref(database, tag);
        return get(tableRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const messages = snapshot.val();
                    for (const key in messages) {
                        const message = messages[key];
                        message.table = tag;
                        message.key = key;
                        allMessages.push(message);
                    }
                }
            })
            .catch((error) => {
                console.error(`Masa (${tag}) verisi alınırken hata oluştu:`, error);
            });
    });

    Promise.all(fetchPromises).then(() => {
        allMessages.sort((a, b) => a.id - b.id);
        displayMessages(allMessages);
    });
}

function displayMessages(messages) {
    messageFeed.innerHTML = ""; // Mevcut mesajları temizle
    messages.forEach((message) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.setAttribute("id", message.key);
        
        const timeDisplay = new Date(Number(message.key)).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" });
        const tableDisplay = message.table.startsWith('@') ? message.table : `#${message.table}`;
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="avatar">
                    <img src="${message.pp}" alt="${message.usr}" onclick="profileUidLoad('${message.uid}')"/>
                </div>
                <span class="message-author">${message.usr}</span>
                <span class="message-table">${tableDisplay}</span>
                <span class="message-timestamp">${timeDisplay}</span>
            </div>
            <div class="message-box">
                <div class="message-icon">
                    <i data-lucide="reply" onclick="redirectToEditor(&quot;${message.table}$${message.key}&quot;)"></i>
                    <i data-lucide="bookmark"></i>
                </div>
                <div class="message-content">${message.msg}</div>
            </div>
        `;
        messageFeed.innerHTML = messageDiv.outerHTML + messageFeed.innerHTML;
    });

    lucide.createIcons();
}

fetchAllMessages()

function fetchMessages() {    
    const messagesRef = ref(database, table);
    onValue(messagesRef, (snapshot) => {
        messageFeed.innerHTML = ""; // Mevcut mesajları temizle
        const data = snapshot.val();
        for (const key in data) {
            const message = data[key];
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");
            messageDiv.setAttribute("id", key);

            // Eğer 'table' başında @ yoksa, # ekleyelim
            const tableDisplay = table.startsWith('dm/') ? `@${table.slice(3)}` : `#${table}`;
            const timeDisplay = new Date(Number(key)).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" });

            messageDiv.innerHTML = `
                <div class="message-header">
                    <div class="avatar">
                        <img src="${message.pp}" alt="${message.usr}" onclick="profileUidLoad('${message.uid}')"/>
                    </div>
                    <span class="message-author">${message.usr}</span>
                    <span class="message-table">${tableDisplay}</span>
                    <span class="message-timestamp">${timeDisplay}</span>
                </div>
                <div class="message-box">
                    <div class="message-icon">
                        <i data-lucide="reply" onclick="redirectToEditor(&quot;${table}#${key}&quot;)"></i>
                        <i data-lucide="bookmark"></i>
                    </div>
                    <div class="message-content">${message.msg}</div>
                </div>
            `;
            messageFeed.innerHTML = messageDiv.outerHTML + messageFeed.innerHTML;
            lucide.createIcons();
        }
    });
}

function startTags() {
    const tabs = document.querySelectorAll(".tab")
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")
        if (tab.innerText.startsWith("@")) {
            table = "dm/" + tab.innerText.slice(1);
            selectedTable = "dm/" + tab.innerText.slice(1);
        } else if (tab.innerText.startsWith("#")) {
            table = tab.innerText.slice(1);
            selectedTable = tab.innerText.slice(1);
        } else if (tab.innerText == "Tüm Mesajlar") {
            fetchAllMessages();
            selectedTable = null;
        }
        console.log(selectedTable)
        fetchMessages()
      })
    });
}

function originalMessageLoad(table, id) {
    const messageRef = ref(database, `${table}/${id}`);
    onValue(messageRef, (snapshot) => {
        if (snapshot.exists()) {
            const messageData = snapshot.val();
            const timestamp = new Date(Number(id)).toLocaleString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
            document.getElementById("originalMessage").innerHTML = `
                    <a href="#${messageData.id}">
                        <div class="message-header">
                            <span class="message-author">${messageData.usr}</span>
                            <span class="message-timestamp">${timestamp}</span>
                        </div>
                        <div class="message-content">${messageData.msg}</div>
                    </a>
            `;
        }
    }, (error) => {
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
            profileAbout.innerHTML = `<span>Hello, my name is ${foundUser.username}. Below are the table's I attended. You can send me a dm 😊</span><p>${foundUser.followTags}</p>`;
            profileUsername.textContent = foundUser.username;
        }
    }, (error) => {
        console.error("Veri çekilirken bir hata oluştu:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // const giftContent = document.getElementById("gift");
    // const openGiftButton = document.getElementById("openGift");
    // const openMobileGiftButton = document.getElementById("openMobileGift");
    const shareContent = document.getElementById("share");
    const openShareButton = document.getElementById("openShare");
    const openMobileShareButton = document.getElementById("openMobileShare");
    const shareForm = document.getElementById("shareForm");
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
        //giftContent.style.display = "none";
        feedContent.style.display = "none";
        originalMessage.style.display = "block";
        const replyToValue = params.get("replyTo");
        const [section,id] = replyToValue.split("$");
        originalMessageLoad(section,id);
    }

    if (params.has("dm")) {
        shareContent.style.display = "block";
        profileContent.style.display = "none";
        //giftContent.style.display = "none";
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
            document.getElementById("editButton").style.display = "none";
        }
        profileContent.style.display = "block";
        shareContent.style.display = "none";
        //giftContent.style.display = "none";
        feedContent.style.display = "none";
        originalMessage.style.display = "none";
    }

    /* Gift Open
    openGiftButton.addEventListener("click", () => {
        if (giftContent.style.display != "block") {
            giftContent.style.display = "block";
            profileContent.style.display = "none";
            shareContent.style.display = "none";
            feedContent.style.display = "none";
        } else {
            giftContent.style.display = "none";
            feedContent.style.display = "";
        }
    });

    openMobileGiftButton.addEventListener("click", () => {
        openShareButton.click();
    });*/
    
    // Share Open
    openShareButton.addEventListener("click", () => {
        if (shareContent.style.display != "block") {
            shareContent.style.display = "block";
            profileContent.style.display = "none";
            //giftContent.style.display = "none";
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
            //giftContent.style.display = "none";
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
        document.getElementById("editButton").style.display = "";
        profilePhotos.src = localStorage.getItem("pp")
        profileUsername.innerText = localStorage.getItem("username")
        profileTime.innerText = "Joined: 26 01 2025"
        profileAbout.innerHTML = `<span>Hello, my name is ${localStorage.getItem("username")}. Below are the table's I attended. You can send me a dm 😊</span><p>${localStorage.getItem("table")}</p>`;
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
            pp: localStorage.getItem("pp"),
            usr: localStorage.getItem("username"),
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