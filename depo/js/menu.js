function loaded() {
    if (localStorage.getItem("thema") == null) {
        localStorage.setItem("thema", "depo/css/l-main.css");
    } else {
        document.getElementById("l-d").href = localStorage.getItem("thema");
    }

    //pn
    if (localStorage.getItem("pn") == null) {
        localStorage.setItem("pn", "Anonim");
    } else {
        document.getElementById("user").value = localStorage.getItem("pn");
    }
    //pp
    if (localStorage.getItem("pp") == null) {
        localStorage.setItem("pp", "https://devnar.github.io/masa/depo/resimler/anonim.png");
    } else {
        document.getElementById("avatar").src = localStorage.getItem("pp");
    }
}

// menü aç kapat

function openNav() {
    document.getElementById("mySidenav").style.width = "50%";
    document.getElementById("navCloser").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("navCloser").style.width = "0";
}

// Pin aç kapat

function openPin() {
    document.getElementById("myPinbox").style.width = "50%";
    document.getElementById("pinCloser").style.width = "100%";
}

function closePin() {
    document.getElementById("myPinbox").style.width = "0";
    document.getElementById("pinCloser").style.width = "0";
}

// Paylaşım aç kapat

function openBox() {
    document.getElementById("mySidebox").style.width = "100%";
    document.getElementById("mySidenav").style.width = "0";
}

function closeBox() {
    document.getElementById("mySidebox").style.width = "0";
    document.getElementById("navCloser").style.width = "0";
}

// tema karanlığa geç

function tema() {
    var css = document.getElementById("thema").value;
    localStorage.setItem("thema", css);
    window.location.reload();
}