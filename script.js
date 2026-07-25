/* ==================================
   KAUSHALYA GUEST HOUSE
   Premium Script v2.0
================================== */


// EMAIL JS

emailjs.init("XkkCrNFvEe1DQzBvG");


// DARK MODE

const darkBtn = document.getElementById("darkBtn");

if(darkBtn){

darkBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark");

darkBtn.innerHTML =
document.body.classList.contains("dark")
? "☀️"
: "🌙";

});

}


// LANGUAGE SWITCH

let english = true;

const langBtn = document.getElementById("langBtn");

if(langBtn){

langBtn.addEventListener("click",()=>{

english = !english;


if(english){

document.documentElement.lang="en";

langBtn.innerHTML="हिन्दी";

document.querySelector(".hero h1").innerHTML =
"Kaushalya Guest House";

document.querySelector(".hero p").innerHTML =
"Comfortable Stay in the Heart of Gomoh";


}else{

document.documentElement.lang="hi";

langBtn.innerHTML="English";

document.querySelector(".hero h1").innerHTML =
"कौशल्या गेस्ट हाउस";

document.querySelector(".hero p").innerHTML =
"गोमो के मुख्य बाजार में आरामदायक ठहराव";

}


});

}



// BOOKING SYSTEM

const form = document.getElementById("bookingForm");

const BACKEND_URL =
"https://kaushalya-backend.onrender.com";


if(form){


form.addEventListener("submit", async function(e){


e.preventDefault();



const bookingData = {


customer_name:
document.getElementById("name").value,


phone:
document.getElementById("phone").value,


email:
document.getElementById("email").value,


room_type:
document.getElementById("room").value,


check_in:
document.getElementById("checkin").value,


check_out:
document.getElementById("checkout").value,


adults:1,


children:0,


payment_type:"Pay Later",


amount:
document.getElementById("room").value === "AC Room"
? 1500
: 1200,


special_request:
document.getElementById("request").value

};



try{


const response = await fetch(

BACKEND_URL + "/create-booking",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(bookingData)

}

);



const result = await response.json();



if(result.success){


alert(

"Booking Created Successfully!\n\nBooking ID: "
+
result.booking_id

);



const message =

"New Booking - Kaushalya Guest House\n\n"

+

"Booking ID: "
+
result.booking_id

+

"\nName: "
+
bookingData.customer_name

+

"\nRoom: "
+
bookingData.room_type

+

"\nCheck In: "
+
bookingData.check_in

+

"\nCheck Out: "
+
bookingData.check_out;



window.open(

"https://wa.me/916205416451?text="
+
encodeURIComponent(message),

"_blank"

);



form.reset();



}else{


alert(

"Booking failed:\n"
+
JSON.stringify(result)

);


}



}

catch(error){


console.log(error);


alert(

"Server error. Please try again later."

);


}



});


}



// GALLERY LIGHTBOX


const images =
document.querySelectorAll(".gallery img");


const lightbox =
document.createElement("div");


lightbox.style.cssText =

`

position:fixed;
left:0;
top:0;
width:100%;
height:100%;
background:rgba(0,0,0,.92);
display:none;
align-items:center;
justify-content:center;
z-index:99999;

`;



lightbox.innerHTML =

`

<img style="
max-width:90%;
max-height:90%;
border-radius:15px;
">

`;



document.body.appendChild(lightbox);



const lightImg =
lightbox.querySelector("img");



images.forEach(img=>{


img.onclick=()=>{


lightbox.style.display="flex";

lightImg.src=img.src;


};


});



lightbox.onclick=()=>{


lightbox.style.display="none";


};




// SCROLL ANIMATION


const observer =
new IntersectionObserver(entries=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.style.opacity="1";

entry.target.style.transform="translateY(0px)";


}


});


},{threshold:.2});



document.querySelectorAll("section")
.forEach(sec=>{


sec.style.opacity="0";

sec.style.transform="translateY(60px)";

sec.style.transition=".8s";


observer.observe(sec);


});




// HERO IMAGE AUTO CHANGE


const hero =
document.querySelector(".hero");


if(hero){


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



hero.style.backgroundImage =

"url('" + heroImages[current] + "')";



},5000);


}



// SCROLL TO TOP


const topBtn =
document.createElement("button");


topBtn.innerHTML="↑";


topBtn.style.cssText=

`

position:fixed;
left:20px;
bottom:20px;
width:55px;
height:55px;
border-radius:50%;
background:#0B2545;
color:white;
border:none;
display:none;
z-index:999;

`;



document.body.appendChild(topBtn);



window.addEventListener("scroll",()=>{


topBtn.style.display =
window.scrollY>500
? "block"
: "none";


});



topBtn.onclick=()=>{


window.scrollTo({

top:0,

behavior:"smooth"

});


};




// NAV ACTIVE LINK


const sections =
document.querySelectorAll("section");


const navLinks =
document.querySelectorAll("nav a");



window.addEventListener("scroll",()=>{


let currentSection="";



sections.forEach(section=>{


if(window.scrollY >= section.offsetTop-120){


currentSection =
section.getAttribute("id");


}


});



navLinks.forEach(link=>{


link.classList.remove("active");


if(
link.getAttribute("href")
===
"#"+currentSection
){


link.classList.add("active");


}


});


});



console.log(
"Kaushalya Guest House Premium Website Loaded Successfully"
);
