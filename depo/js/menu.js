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
    //pin
    if (localStorage.getItem("pinbox") == null) {
        localStorage.setItem("pinbox", "<button onclick='pinboxdel()' class='pinboxdel'>Tüm kaydı sil</button>");
    } else {
        document.getElementById("myPinbox").innerHTML = localStorage.getItem("pinbox");
    }
}

// menü aç kapat

function openNav() {
    document.getElementById("mySidenav").style.width = "45%";
    if (window.innerWidth < 1400) {
        document.getElementById("navCloser").style.width = "100%";
    }
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("navCloser").style.width = "0";    
}

// Pin aç kapat

function openPin() {
    document.getElementById("myPinbox").style.width = "55%";
    if (window.innerWidth < 1400) {
        document.getElementById("pinCloser").style.width = "100%";
    }
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

// tema değiş

function tema() {
    var css = document.getElementById("thema").value;
    localStorage.setItem("thema", css);
    window.location.reload();
}

// paylaşım kutusu içeriği
function inputImg() {    
    var p = document.getElementById("pic")
    var l = document.getElementById("lnk")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
        
    if (p.style.display == none) {
        p.style.display = "inline-block";
        x.style.display = "inline-block";
        l.style.display = "none"
        i.style.display = "none"
        y.style.display = "none"
    } else {
        p.style.display = "none"
        i.style.display = "inline-block";
        y.style.display = "inline-block";
    }
}

function inputLnk() {
    var p = document.getElementById("pic")
    var l = document.getElementById("lnk")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
        
    if (p.style.display == none) {
        l.style.display = "inline-block";
        x.style.display = "inline-block";
        p.style.display = "none"
        i.style.display = "none"
        y.style.display = "none"
    } else {
        l.style.display = "none"
        i.style.display = "inline-block";
        y.style.display = "inline-block";
    }
}

function clsInput() {
    var p = document.getElementById("pic")
    var l = document.getElementById("lnk")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
        
    i.style.display = "inline-block";
    y.style.display = "inline-block";
    p.style.display = "none"
    l.style.display = "none"
    x.style.display = "none"
}