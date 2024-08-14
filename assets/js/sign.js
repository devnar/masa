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

document.getElementById("signup-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const tags = ["duyurular", "@" + username];

    // Kullanıcı adı benzersizliğini kontrol et
    db.ref("duvar")
        .orderByChild("username")
        .equalTo(username)
        .once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                // Kullanıcı adı zaten alınmış
                alert("Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seçin.");
            } else {
                // Kullanıcı adı benzersiz, yeni kullanıcı oluştur
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;

                        // Kullanıcı profilini "duvar" koleksiyonuna kaydet
                        db.ref("duvar/" + user.uid)
                            .set({
                                username: username,
                                pp: "https://pbs.twimg.com/profile_images/1545518896874242055/s8icSRfU_400x400.jpg",
                                followTags: tags,
                            })
                            .then(() => {
                                // Başarılı işlem sonrası yönlendirme
                                window.location.href = "index.html";
                            })
                            .catch((error) => {
                                alert("Profil kaydında hata: " + error.message);
                            });
                    })
                    .catch((error) => {
                        alert("Kullanıcı oluşturma hatası: " + error.message);
                    });
            }
        })
        .catch((error) => {
            alert("Kullanıcı adı kontrolü hatası: " + error.message);
        });
});

// Sign in event
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Sign in successful!");
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});
