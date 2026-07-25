/* ==================================
   KAUSHALYA GUEST HOUSE
   Premium Script v5.0 CLEAN
================================== */


// ===============================
// EMAIL JS INIT
// ===============================

emailjs.init("XkkCrNFvEe1DQzBvG");


// ===============================
// BACKEND URL
// ===============================

const BACKEND_URL =
"https://kaushalya-backend.onrender.com";


// ===============================
// DARK MODE
// ===============================

const darkBtn = document.getElementById("darkBtn");

if(darkBtn){

darkBtn.onclick = () => {

document.body.classList.toggle("dark");

darkBtn.innerHTML =
document.body.classList.contains("dark")
? "☀️"
: "🌙";

};

}



// ===============================
// LANGUAGE BUTTON
// ===============================

const langBtn = document.getElementById("langBtn");

let english = true;


if(langBtn){

langBtn.onclick = ()=>{


english = !english;


if(english){

langBtn.innerHTML="हिन्दी";

document.querySelector(".hero h1").innerHTML =
"Kaushalya Guest House";

document.querySelector(".hero p").innerHTML =
"Comfortable Stay in the Heart of Gomoh";


}
else{


langBtn.innerHTML="English";

document.querySelector(".hero h1").innerHTML =
"कौशल्या गेस्ट हाउस";

document.querySelector(".hero p").innerHTML =
"गोमो के मुख्य बाजार में आरामदायक ठहराव";


}


};

}



// ===============================
// BOOKING SYSTEM
// ===============================


const form =
document.getElementById("bookingForm");


if(form){


form.addEventListener("submit", async function(e){


e.preventDefault();



const room =
document.getElementById("room").value;


const roomPrice =
room === "AC Room"
? 1500
: 1200;



const paymentMethod =
document.querySelector(
'input[name="payment_method"]:checked'
).value;



const bookingData = {


customer_name:
document.getElementById("name").value,


phone:
document.getElementById("phone").value,


email:
document.getElementById("email").value,


room_type:
room,


check_in:
document.getElementById("checkin").value,


check_out:
document.getElementById("checkout").value,


adults:1,


children:0,


payment_type:
paymentMethod === "advance"
?
"Advance Payment"
:
"Pay Later",


payment_status:"Pending",


razorpay_payment_id:null,


amount:
roomPrice,


special_request:
document.getElementById("request").value


};



// ===============================
// PAY LATER
// ===============================


if(paymentMethod==="later"){


createBooking(bookingData);


return;


}



// ===============================
// ADVANCE PAYMENT
// ===============================


try{


const orderResponse =
await fetch(

BACKEND_URL + "/create-order",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

amount:
roomPrice * 0.30

})

}

);



const order =
await orderResponse.json();



if(!order.success){

alert("Payment order failed");

return;

}



const options = {


key:
"rzp_live_THSQSxsz10dlWB",


amount:
order.amount,


currency:"INR",


name:
"Kaushalya Guest House",


description:
"30% Advance Booking Payment",


order_id:
order.order_id,


handler:function(response){



bookingData.razorpay_payment_id =
response.razorpay_payment_id;


bookingData.payment_status =
"Paid";


createBooking(bookingData);



},


prefill:{


name:
bookingData.customer_name,


email:
bookingData.email,


contact:
bookingData.phone


},


theme:{


color:"#0B2545"

}


};



const razor =
new Razorpay(options);


razor.open();



}


catch(error){


console.log(error);

alert("Payment Error");


}



});


}

/* ===============================
   CREATE BOOKING FUNCTION
=============================== */


async function createBooking(data){


try{


const response =
await fetch(

BACKEND_URL + "/create-booking",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(data)

}

);



const result =
await response.json();



if(result.success){


alert(

"Booking Confirmed!\n\nBooking ID: "
+
result.booking_id

);



// ===============================
// CUSTOMER EMAIL
// ===============================


const emailParams = {


customer_name:
data.customer_name,


customer_email:
data.email,


booking_id:
result.booking_id,


room_type:
data.room_type,


check_in:
data.check_in,


check_out:
data.check_out,


payment_type:
data.payment_type


};



emailjs.send(

"service_k4u106n",

"template_gmf6drc",

emailParams

)

.then(()=>{

console.log("Confirmation Email Sent");

})

.catch(err=>{

console.log("Email Error:",err);

});





// ===============================
// WHATSAPP MESSAGE
// ===============================


const message =

"New Booking - Kaushalya Guest House\n\n"

+

"Booking ID: "
+
result.booking_id

+

"\nName: "
+
data.customer_name

+

"\nPhone: "
+
data.phone

+

"\nRoom: "
+
data.room_type

+

"\nCheck In: "
+
data.check_in

+

"\nCheck Out: "
+
data.check_out

+

"\nPayment: "
+
data.payment_type;



window.open(

"https://wa.me/916205416451?text="
+
encodeURIComponent(message),

"_blank"

);



form.reset();



}

else{


alert(

"Booking Failed:\n"
+
result.message

);


}



}

catch(error){


console.log(error);


alert("Server Error");


}



}




// ===============================
// GALLERY LIGHTBOX
// ===============================


const galleryImages =
document.querySelectorAll(".gallery img");


const lightbox =
document.createElement("div");


lightbox.style.cssText = `

position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,.9);
display:none;
align-items:center;
justify-content:center;
z-index:99999;

`;



lightbox.innerHTML = `

<img style="
max-width:90%;
max-height:90%;
border-radius:15px;
">

`;



document.body.appendChild(lightbox);



const lightImage =
lightbox.querySelector("img");



galleryImages.forEach(img=>{


img.onclick=()=>{


lightbox.style.display="flex";

lightImage.src =
img.src;


};


});



lightbox.onclick=()=>{


lightbox.style.display="none";


};





// ===============================
// HERO IMAGE SLIDER
// ===============================


const hero =
document.querySelector(".hero");


if(hero){


const heroImages=[

"Outside front.jpg",

"Reception.jpg",

"Room3.JPG",

"Restaurant1.JPG"

];


let heroIndex=0;



setInterval(()=>{


heroIndex++;


if(heroIndex >= heroImages.length){

heroIndex=0;

}


hero.style.backgroundImage =

"url('" + heroImages[heroIndex] + "')";


},5000);


}





// ===============================
// BACK TO TOP BUTTON
// ===============================


const topButton =
document.createElement("button");


topButton.innerHTML="↑";


topButton.style.cssText = `

position:fixed;
right:20px;
bottom:20px;
width:55px;
height:55px;
border-radius:50%;
border:none;
background:#0B2545;
color:white;
font-size:25px;
cursor:pointer;
display:none;
z-index:9999;

`;



document.body.appendChild(topButton);



window.addEventListener("scroll",()=>{


if(window.scrollY > 500){

topButton.style.display="block";

}

else{

topButton.style.display="none";

}


});



topButton.onclick=()=>{


window.scrollTo({

top:0,

behavior:"smooth"

});


};





// ===============================
// DATE VALIDATION
// ===============================


const checkin =
document.getElementById("checkin");


const checkout =
document.getElementById("checkout");



if(checkin && checkout){


checkin.addEventListener("change",()=>{


checkout.min =
checkin.value;


});


}





console.log(
"Kaushalya Guest House Script v5 Loaded Successfully"
);

// ===============================
// CREATE BOOKING FUNCTION
// ===============================


async function createBooking(data){


try{


const response =
await fetch(

BACKEND_URL + "/create-booking",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify(data)

}

);



const result =
await response.json();



if(result.success){


alert(

"Booking Confirmed!\n\nBooking ID: "
+
result.booking_id

);



// ===============================
// EMAIL CONFIRMATION
// ===============================


const emailParams = {


customer_name:
data.customer_name,


customer_email:
data.email,


booking_id:
result.booking_id,


room_type:
data.room_type,


check_in:
data.check_in,


check_out:
data.check_out,


payment_type:
data.payment_type


};



emailjs.send(

"service_k4u106n",

"template_gmf6drc",

emailParams

)

.then(()=>{

console.log(
"Confirmation Email Sent"
);

})

.catch(error=>{

console.log(
"Email Error:",
error
);

});




// ===============================
// WHATSAPP NOTIFICATION
// ===============================


const message =

"New Booking - Kaushalya Guest House\n\n"

+

"Booking ID: "
+
result.booking_id

+

"\nName: "
+
data.customer_name

+

"\nPhone: "
+
data.phone

+

"\nRoom: "
+
data.room_type

+

"\nCheck In: "
+
data.check_in

+

"\nCheck Out: "
+
data.check_out

+

"\nPayment: "
+
data.payment_type;



window.open(

"https://wa.me/916205416451?text="
+
encodeURIComponent(message),

"_blank"

);



form.reset();



}

else{


alert(

"Booking Failed:\n"
+
result.message

);


}



}

catch(error){


console.log(error);


alert(

"Server Error"

);


}



}




// ===============================
// GALLERY LIGHTBOX
// ===============================


const galleryImages =
document.querySelectorAll(".gallery img");



const lightbox =
document.createElement("div");



lightbox.style.cssText = `

position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,.9);
display:none;
align-items:center;
justify-content:center;
z-index:99999;

`;



lightbox.innerHTML = `

<img style="
max-width:90%;
max-height:90%;
border-radius:15px;
">

`;



document.body.appendChild(lightbox);



const lightImage =
lightbox.querySelector("img");



galleryImages.forEach(img=>{


img.onclick=()=>{


lightbox.style.display="flex";


lightImage.src =
img.src;


};


});



lightbox.onclick=()=>{


lightbox.style.display="none";


};




// ===============================
// HERO IMAGE SLIDER
// ===============================


const hero =
document.querySelector(".hero");



if(hero){


const heroImages=[

"Outside front.jpg",

"Reception.jpg",

"Room3.JPG",

"Restaurant1.JPG"

];



let heroIndex=0;



setInterval(()=>{


heroIndex++;


if(heroIndex >= heroImages.length){

heroIndex=0;

}



hero.style.backgroundImage =

"url('" + heroImages[heroIndex] + "')";


},5000);



}




// ===============================
// SCROLL ANIMATION
// ===============================


const sections =
document.querySelectorAll("section");


const animationObserver =
new IntersectionObserver((entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add("show");


}


});


},

{

threshold:0.15

});



sections.forEach(section=>{


animationObserver.observe(section);


});




// ===============================
// BACK TO TOP BUTTON
// ===============================


const topButton =
document.createElement("button");



topButton.innerHTML="↑";



topButton.className="backTop";



document.body.appendChild(topButton);



window.addEventListener("scroll",()=>{


if(window.scrollY > 500){


topButton.style.display="flex";


}

else{


topButton.style.display="none";


}


});



topButton.onclick=()=>{


window.scrollTo({

top:0,

behavior:"smooth"

});


};




// ===============================
// DATE VALIDATION
// ===============================


const checkin =
document.getElementById("checkin");


const checkout =
document.getElementById("checkout");



if(checkin && checkout){


checkin.addEventListener("change",()=>{


checkout.min =
checkin.value;


});


}




console.log(
"Kaushalya Guest House Script v6 Loaded Successfully"
);
