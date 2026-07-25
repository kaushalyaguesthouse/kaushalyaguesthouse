/* ==================================
   KAUSHALYA GUEST HOUSE
   Premium Script v3.0
================================== */


// EMAIL JS INIT

emailjs.init("XkkCrNFvEe1DQzBvG");


// BACKEND

const BACKEND_URL =
"https://kaushalya-backend.onrender.com";



// DARK MODE

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



// LANGUAGE BUTTON

const langBtn = document.getElementById("langBtn");

let english = true;

if(langBtn){

langBtn.onclick = () => {

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



// BOOKING SYSTEM


const form =
document.getElementById("bookingForm");


if(form){


form.addEventListener("submit", async(e)=>{


e.preventDefault();



const room =
document.getElementById("room").value;


const amount =
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
? "Advance Payment"
: "Pay Later",


amount:amount,


special_request:
document.getElementById("request").value

};




// PAY LATER FLOW


if(paymentMethod === "later"){


createBooking(bookingData);

return;


}




// ADVANCE PAYMENT FLOW


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
amount * 0.30

})

});


const order =
await orderResponse.json();



if(!order.success){

alert("Payment order creation failed");

return;

}



const options = {


key:
"rzp_live_THSQSxsz10dlWB",


amount:
order.order.amount,


currency:"INR",


name:
"Kaushalya Guest House",


description:
"Room Booking Advance Payment",


order_id:
order.order.id,



handler:function(response){


bookingData.payment_id =
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

alert(
"Payment error. Please try again."
);


}



});


}




// CREATE BOOKING FUNCTION


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



// EMAIL


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
.catch(err=>{

console.log(
"Email Error",
err
);

});




// WHATSAPP


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
data.check_out;



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
JSON.stringify(result)
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





// GALLERY LIGHTBOX


const images =
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



lightbox.innerHTML =
`
<img style="
max-width:90%;
max-height:90%;
border-radius:15px;">
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




// HERO IMAGE SLIDER


const hero =
document.querySelector(".hero");


if(hero){


const heroImages=[

"Outside front.jpg",
"Reception.jpg",
"Room3.JPG",
"Restaurant1.JPG"

];


let i=0;


setInterval(()=>{


i++;

if(i>=heroImages.length)
i=0;



hero.style.backgroundImage =
"url('"+heroImages[i]+"')";


},5000);


}




console.log(
"Kaushalya Guest House v3 Loaded"
);
