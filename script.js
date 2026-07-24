/* ==================================
   KAUSHALYA GUEST HOUSE
   Premium Script v1.0
================================== */

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

const form=document.querySelector("form");

form.addEventListener("submit",function(e){

e.preventDefault();

const inputs=form.querySelectorAll("input,select,textarea");

const name=inputs[0].value;

const phone=inputs[1].value;

const checkin=inputs[2].value;

const checkout=inputs[3].value;

const room=inputs[4].value;

const request=inputs[5].value;

const message=`Hello Kaushalya Guest House,

I would like to book a room.

Name: ${name}

Phone: ${phone}

Room: ${room}

Check In: ${checkin}

Check Out: ${checkout}

Special Request:
${request}`;

window.open(

"https://wa.me/916205416451?text="+encodeURIComponent(message),

"_blank"

);

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

"images/hero.jpg",

"images/gallery1.jpg",

"images/gallery2.jpg",

"images/gallery3.jpg"

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
