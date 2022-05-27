function loaded() {
    if (localStorage.getItem("thema") == null) {
        localStorage.setItem("thema","depo/css/l-main.css")
    } else {
        document.getElementById("l-d").href = localStorage.getItem("thema");
    }
}

// menü aç kapat

function openNav() {
document.getElementById("mySidenav").style.width = "50%";
}

function closeNav() {
document.getElementById("mySidenav").style.width = "0";
}

// Paylaşım kutusu aç kapat

function openShareBox() {
document.getElementById("mySidebox").style.width = "100%";
document.getElementById("mySidenav").style.width = "0";
}

function closeBox() {
document.getElementById("mySidebox").style.width = "0";
}

// tema karanlığa geç

function tema() {
var css = document.getElementById("thema").value;
localStorage.setItem("thema",css);
window.location.reload()
}
