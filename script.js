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



// EMAIL CONFIRMATION

const emailParams = {


customer_name:
bookingData.customer_name,


customer_email:
bookingData.email,


booking_id:
result.booking_id,


room_type:
bookingData.room_type,


check_in:
bookingData.check_in,


check_out:
bookingData.check_out,


payment_type:
bookingData.payment_type


};



emailjs.send(

"service_k4u106n",

"template_gmf6drc",

emailParams

)

.then(()=>{

console.log("Confirmation email sent");

})

.catch((error)=>{

console.log("Email Error:",error);

});





// WHATSAPP NOTIFICATION


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



}

else{


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
