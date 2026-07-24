/* ==================================
   KAUSHALYA GUEST HOUSE
   Premium Script v1.0
================================== */

emailjs.init("XkkCrNFvEe1DQzBvG");

// DARK MODE

const darkBtn = document.getElementById("darkBtn");

darkBtn.addEventListener("click", () => {

document.body.classList.toggle("dark");

if(document.body.classList.contains("dark")){

darkBtn.innerHTML="☀️";

}else{

darkBtn.innerHTML="🌙";

}

});


// LANGUAGE SWITCH

let english=true;

const langBtn=document.getElementById("langBtn");

langBtn.addEventListener("click",()=>{

english=!english;

if(english){

document.documentElement.lang="en";

langBtn.innerHTML="हिन्दी";

document.querySelector(".hero h1").innerHTML="Kaushalya Guest House";

document.querySelector(".hero p").innerHTML="Comfortable Stay in the Heart of Gomoh";

}else{

document.documentElement.lang="hi";

langBtn.innerHTML="English";

document.querySelector(".hero h1").innerHTML="कौशल्या गेस्ट हाउस";

document.querySelector(".hero p").innerHTML="गोमो के मुख्य बाजार में आरामदायक ठहराव";

}

});


// BOOKING FORM TO WHATSAPP

const form = document.getElementById("bookingForm");

form.addEventListener("submit", function(e){

e.preventDefault();


const name = document.getElementById("name").value;
const phone = document.getElementById("phone").value;
const email = document.getElementById("email").value;
const checkin = document.getElementById("checkin").value;
const checkout = document.getElementById("checkout").value;
const room = document.getElementById("room").value;
const request = document.getElementById("request").value;


const message =
"New Booking Request - Kaushalya Guest House\n\n" +
"Name: " + name +
"\nPhone: " + phone +
"\nEmail: " + email +
"\nRoom: " + room +
"\nCheck In: " + checkin +
"\nCheck Out: " + checkout +
"\nSpecial Request: " + request;


// WhatsApp

window.open(
"https://wa.me/916205416451?text=" +
encodeURIComponent(message),
"_blank"
);


// Email (after EmailJS setup)

emailjs.send(
"service_k4u106n",
"template_gmf6drc",
{
customer_email: email,
customer_name: name,
booking_details: message
}
)
.then(function(){

alert("Booking request sent successfully!");

})
.catch(function(error){

alert("Email sending failed. Please try again.");

console.log(error);

});

});

// GALLERY LIGHTBOX

const images=document.querySelectorAll(".gallery img");

const lightbox=document.createElement("div");

lightbox.style.position="fixed";

lightbox.style.left="0";

lightbox.style.top="0";

lightbox.style.width="100%";

lightbox.style.height="100%";

lightbox.style.background="rgba(0,0,0,.92)";

lightbox.style.display="none";

lightbox.style.alignItems="center";

lightbox.style.justifyContent="center";

lightbox.style.zIndex="99999";

lightbox.innerHTML="<img style='max-width:90%;max-height:90%;border-radius:15px;'>";

document.body.appendChild(lightbox);

const lightImg=lightbox.querySelector("img");

images.forEach(img=>{

img.onclick=()=>{

lightbox.style.display="flex";

lightImg.src=img.src;

}

});

lightbox.onclick=()=>{

lightbox.style.display="none";

};



// SCROLL ANIMATION

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0px)";

}

});

},{threshold:.2});

document.querySelectorAll("section").forEach(sec=>{

sec.style.opacity="0";

sec.style.transform="translateY(60px)";

sec.style.transition=".8s";

observer.observe(sec);

});



// IMAGE AUTO CHANGE

const hero=document.querySelector(".hero");

const heroImages=[

"Outside front.jpg",

"Reception.jpg",

"Room3.JPG",

"Restaurant1.JPG"

];

let current=0;

setInterval(()=>{

current++;

if(current>=heroImages.length){

current=0;

}

hero.style.backgroundImage="url('"+heroImages[current]+"')";

},5000);



// SCROLL TO TOP BUTTON

const topBtn=document.createElement("button");

topBtn.innerHTML="↑";

topBtn.style.position="fixed";

topBtn.style.left="20px";

topBtn.style.bottom="20px";

topBtn.style.width="55px";

topBtn.style.height="55px";

topBtn.style.borderRadius="50%";

topBtn.style.background="#0B2545";

topBtn.style.color="white";

topBtn.style.border="none";

topBtn.style.cursor="pointer";

topBtn.style.display="none";

topBtn.style.zIndex="999";

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

topBtn.style.display="block";

}else{

topBtn.style.display="none";

}

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};



// NAVIGATION ACTIVE LINK

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

let currentSection="";

sections.forEach(section=>{

const top=section.offsetTop-120;

if(window.scrollY>=top){

currentSection=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#"+currentSection){

link.classList.add("active");

}

});

});



console.log("Kaushalya Guest House Premium Website Loaded Successfully");
