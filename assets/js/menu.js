document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme == 'light') {themeToggle.classList.toggle('bx-sun');themeToggle.classList.toggle('bx-moon')}

    themeToggle.addEventListener('click', function() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.classList.toggle('bx-moon');
        themeToggle.classList.toggle('bx-sun');
    });

    if (isPc()) {
        toggleBookmarks();
    }
});

function main() {
    window.location.href = "index.html"
}

function pencil() {
    window.location.href = "editor.html"
}

function toggleProfilePopup() {
    var popup = document.getElementById("profile-popup");
    if (popup.style.display === "none" || popup.style.display === "") {
        const user = firebase.auth().currentUser;
        if (user && user.uid) {
            updateUserProfile(user.uid);
            popup.style.display = "block";
        } else {
            window.location.href = "sign.html"
            popup.style.display = "none";
        }
    } else {
        popup.style.display = "none";
    }
}

window.onclick = function(event) {
    var popup = document.getElementById("profile-popup");
    if (event.target !== popup && !popup.contains(event.target) && event.target !== document.getElementById("profile-pic")) {
        popup.style.display = "none";
    }
}

function toggleBookmarks() {
    var bookmark = document.getElementById("sidebar");
    if (bookmark.style.display === "none" || bookmark.style.display === "") {
        updateBookmarks()
        bookmark.style.display = "block";
    } else {
        bookmark.style.display = "none";
    }
}

function bookmarked(id) {
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    if (!bookmarks.includes(id)) {
        bookmarks.push(id);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }
    updateBookmarks();
}

function updateBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const bookmarksList = document.getElementById('bookmarks-list');
    bookmarksList.innerHTML = '';

    bookmarks.forEach(bookmark => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${bookmark}`; 
        link.innerText = bookmark;
        listItem.appendChild(link);
        bookmarksList.appendChild(listItem);
    });
}

function clearBookmarks() {
    localStorage.removeItem("bookmarks");
    updateBookmarks()
}

function isPc() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function redirectToEditor(redirect) {
    const [source, id, username] = redirect.split('#');
    window.location.href = `editor.html?source=${encodeURIComponent(source)}&replyTo=${id}&username=${username}`;
}

function flag(a) {
    const email = "devnar@duck.com";
    const subject = a + " Mesajı ile ilgi 🏳️";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

function soon() {
    alert("Yakında bu özellik gelecek...")
}