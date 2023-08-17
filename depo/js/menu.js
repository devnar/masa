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
    //pid
    if (localStorage.getItem("pid") == 'null') {
        localStorage.setItem("pid", "mesaj")
    } 
    if (localStorage.getItem("pid") == null) {
        localStorage.setItem("pid", "mesaj")
    } 
}

function pp() {
    var newVal = prompt("Profil Fotoğrafı'nın URL'si");
    if (newVal == null || newVal == "") {
    } else {
        localStorage.setItem("pp", newVal);
    }
    window.location.reload();
}

function pinboxdel() {
    localStorage.removeItem("pinbox")
    window.location.reload();
}

function dragStart(event) {
    event.dataTransfer.setData("Text", event.target.id);
}
function dragging(event) {
    openPin();
}
function allowDrop(event) {
    event.preventDefault();
}
function drop(event) {
    event.preventDefault();
    event.target.appendChild(document.getElementById(event.dataTransfer.getData("Text")));
    localStorage.setItem("pinbox", document.getElementById("myPinbox").innerHTML)
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
    function x () {document.getElementById("myPinbox").style.width = "55%"}
    setTimeout(x, 100);
    document.getElementById("myPinbox").style.display = "block";
    if (window.innerWidth < 1400) {
        document.getElementById("pinCloser").style.width = "100%";
        document.getElementById("myPinbox").style.display = "block";
    }
}

function closePin() {
    document.getElementById("myPinbox").style.width = "0";
    document.getElementById("pinCloser").style.width = "0";
    function x () {document.getElementById("myPinbox").style.display = "none"}
    setTimeout(x, 500);
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
    var r = document.getElementById("cod")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
    var f = document.getElementById("Icod")
    var s = document.getElementById("ksayac")
        
    if (p.style.display == none) {
        p.style.display = "inline-block";
        x.style.display = "inline-block";
        l.style.display = "none";
        r.style.display = "none";
        i.style.display = "none";
        y.style.display = "none";
        f.style.display = "none";
        s.style.display = "none";
    } else {
        p.style.display = "none";
        i.style.display = "inline-block";
        y.style.display = "inline-block";
        f.style.display = "inline-block";
        s.style.display = "inline-block";
    }
}

function inputCod() {    
    var p = document.getElementById("pic")
    var l = document.getElementById("lnk")
    var r = document.getElementById("cod")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
    var f = document.getElementById("Icod")
    var s = document.getElementById("ksayac")
        
    if (r.style.display == none) {
        r.style.display = "inline-block";
        x.style.display = "inline-block";
        p.style.display = "none";
        l.style.display = "none";
        i.style.display = "none";
        y.style.display = "none";
        f.style.display = "none";
        s.style.display = "none";
    } else {
        r.style.display = "none";
        i.style.display = "inline-block";
        y.style.display = "inline-block";
        f.style.display = "inline-block";
        s.style.display = "inline-block";
    }
}

function inputLnk() {
    var p = document.getElementById("pic")
    var l = document.getElementById("lnk")
    var r = document.getElementById("cod")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
    var f = document.getElementById("Icod")
    var s = document.getElementById("ksayac")
        
    if (p.style.display == none) {
        l.style.display = "inline-block";
        x.style.display = "inline-block";
        p.style.display = "none";
        r.style.display = "none";
        i.style.display = "none";
        y.style.display = "none";
        f.style.display = "none";
        s.style.display = "none";
    } else {
        l.style.display = "none";
        i.style.display = "inline-block";
        y.style.display = "inline-block";
        f.style.display = "inline-block";
        s.style.display = "inline-block";
    }
}

function clsInput() {
    var p = document.getElementById("pic")
    var l = document.getElementById("lnk")
    var r = document.getElementById("cod")
    var x = document.getElementById("x")
    var i = document.getElementById("Iimg")
    var y = document.getElementById("Ilnk")
    var f = document.getElementById("Icod")
    var s = document.getElementById("ksayac")
        
    i.style.display = "inline-block";
    y.style.display = "inline-block";
    f.style.display = "inline-block";
    s.style.display = "inline-block";
    p.style.display = "none";
    l.style.display = "none";
    r.style.display = "none";
    x.style.display = "none";
}