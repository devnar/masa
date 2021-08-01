// yasaklı kelimeler

function paylas() {
    var mak = document.getElementById("sender").value;
    var yasak1 = mak.indexOf("<script");
    var yasak2 = mak.indexOf("<SCRİPT");
    var yasak3 = mak.indexOf("<style");
    var yasak4 = mak.indexOf("<STYLE");
    var yasak5 = mak.indexOf("<html");
    var yasak6 = mak.indexOf("<HTML");
    var yasak7 = mak.indexOf("<div");
    var yasak8 = mak.indexOf("<DİV");
    var yasak9 = mak.indexOf("<link");
    var yasak10 = mak.indexOf("<LİNK");
    

   if(yasak1 != -1) {
        alert("<script> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
  if(yasak2 != -1) {
        alert("<script> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
 
   if(yasak3 != -1) {
        alert("<style> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
  if(yasak4 != -1) {
        alert("<style> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
   if(yasak5 != -1) {
        alert("<html> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
  if(yasak6 != -1) {
        alert("<html> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
 
   if(yasak7 != -1) {
        alert("<div> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
  if(yasak8 != -1) {
        alert("<div> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
      if(yasak9 != -1) {
        alert("<link> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
  
      if(yasak10 != -1) {
        alert("<link> kodunu yazamazsın")
  document.getElementById("sender").value = ""; }
}

// karakter sınırı

function karaktersiniri() {
var val = document.getElementById("sender").value;

var tt = val.split(' ');
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
const firebaseConfig = {
  apiKey: "AIzaSyAZw_BmlTSDPAQmEAe7pqdlTFem8BYpsrM",
  authDomain: "bot-11000.firebaseapp.com",
  projectId: "bot-11000",
  storageBucket: "bot-11000.appspot.com",
  messagingSenderId: "469897704425",
  appId: "1:469897704425:web:16d3b1b7aa3d6cd8cd1178",
};
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
    usr: document.getElementById("user").innerHTML,
    pp: document.getElementById("avatar").src,
    tit: document.getElementById("title").value,
    msg: message,
    time: n.getHours() + ":" + n.getMinutes() + "  " + n.getDate() + "-" + month[n.getMonth()] + "-" + n.getFullYear()
  });
document.getElementById("title").value =""
}

const fetchChat = db.ref("mesaj/");
fetchChat.on("child_added", function (snapshot) {
  const messages = snapshot.val();
  const msg2 = "<div class='msgb'>" + "<table width='100%'>" + "<tr width='100%'>" + "<td width='50px'><img src='" + messages.pp + "' class='msga'></td>" + "<td><h3 class='msgu'>" + messages.usr + "</h3></td><td><p class='msgt'>" + messages.time +"</p></td>" + "</tr>" + "<td></td>" + "<td colspan='2'><p class='msgm'>" + messages.msg + "</p></td>" + "</table>" + "</div>" + "<br>"; document.getElementById("messages").innerHTML += msg2;})
