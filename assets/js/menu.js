document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', function() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.classList.toggle('bx-moon');
        themeToggle.classList.toggle('bx-sun');
    });
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
        popup.style.display = "block";
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

function soon() {
    alert("Yakında bu özellik gelecek...")
}


