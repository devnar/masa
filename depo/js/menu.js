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

(async () => {
    // create and show the notification
    const showNotification = () => {
        // create a new notification
        const notification = new Notification("MASA ya hoş geldin", {
            body: "",
            icon: "https://devnar.github.io/logos/masa.png",
        });

        // close the notification after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10 * 1000);

        // navigate to a URL when clicked
        notification.addEventListener("click", () => {
            window.open("https://devnar.github.io/masa/", "_blank");
        });
    };

    // show an error message
    const showError = () => {
        const error = document.querySelector(".error");
        error.style.display = "block";
        error.textContent = "You blocked the notifications";
    };

    // check notification permission
    let granted = false;

    if (Notification.permission === "granted") {
        granted = true;
    } else if (Notification.permission !== "denied") {
        let permission = await Notification.requestPermission();
        granted = permission === "granted" ? true : false;
    }

    // show notification or error
    granted ? showNotification() : showError();
})();