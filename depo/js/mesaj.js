// karakter sınırı
function karaktersiniri() {
  var val = document.getElementById("sender").value;

  var tt = val.split(" ");
  var kesa = tt.length;

  var kalankarakter = 1000 - val.length;

  if (kalankarakter >= 0) {
      document.getElementById("ksayac").innerHTML = kalankarakter;
  }
}

// Tarih

var n = new Date();
var month = new Array();
month[0] = "Ocak";
month[1] = "Şubat";
month[2] = "Mart";
month[3] = "Nisan";
month[4] = "Mayıs";
month[5] = "Haziran";
month[6] = "Temmuz";
month[7] = "Ağustos";
month[8] = "Eylül";
month[9] = "Ekim";
month[10] = "Kasım";
month[11] = "Aralık";

// firebase
const firebaseConfig = {apiKey: "AIzaSyBM4YWWGOhN0u_AX9QzGOm5qclRZ4YPMjA" ,projectId: "nar-masa",};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.getElementById("send-box").addEventListener("submit", postChat);
function postChat(e) {
  e.preventDefault();
  const timestamp = Date.now();
  const chatTxt = document.getElementById("sender");
  const message = chatTxt.value;
  chatTxt.value = "";
  db.ref("mesaj/" + timestamp).set({
      usr: document.getElementById("user").value,
      pp: document.getElementById("avatar").src,
      msg: "<img onerror='this.style.display = none' onclick='if (this.style.width != full) {this.style.width= full} else {this.style.width = normal}' src=" + document.getElementById("pic").value + "></img>" + message + "<a href=' " + document.getElementById("lnk").value + " '> Eklenmiş Linke Git</a>",
      id: timestamp,
      time: n.getHours() + ":" + n.getMinutes() + " - " + n.getDate() + " " + month[n.getMonth()] + " " + n.getFullYear(),
  });
  document.getElementById("pic").value = "";
  document.getElementById("lnk").value = "";
  closeBox()
}

const fetchChat = db.ref("mesaj/");
fetchChat.on("child_added", function (snapshot) {
  const messages = snapshot.val();
  document.getElementById("messages").innerHTML =
      "<li class='msgb' ondragstart='dragStart(event)' ondrag='dragging(event)' draggable='true' id='" +
      messages.id +
      "'>" +
      "<table width='100%' >" +
      "<tr width='100%'>" +
      "<td width='50px'><img src='" +
      messages.pp +
      "' class='msga'></td>" +
      "<td><h3 class='msgu'>" +
      messages.usr +
      "</h3></td><td><p class='msgt'>" +
      messages.time +
      "</p></td>" +
      "</tr>" +
      "<td></td>" +
      "<td colspan='2'><p class='msgm'>" +
      messages.msg +
      "</p></td>" +
      "</table>" +
      "</li>" +
      document.getElementById("messages").innerHTML;
});