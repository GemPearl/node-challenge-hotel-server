const express = require("express");
const cors = require("cors");
const moment = require("moment");
const validator = require("email-validator");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.json());
app.use(cors());

//Use this array as your (in-memory) data store.
const bookings = require("./bookings.json");

// Get all bookings matching a search term 
app.get("/bookings/search", (req, res) => {
  const {date, term} = req.query;
  
          if (date && term){
            const formattedDate = moment(date).format("YYYY-MM-DD");

            const matchingBookings = bookings.filter((booking)=>
             booking.email.toUpperCase().includes(term.toUpperCase())||
             booking.firstName.toUpperCase().includes(term.toUpperCase())||
             booking.surname.toUpperCase().includes(term.toUpperCase())
             );

          if (formattedDate !=date) {
            return res.status(400).json({
              success:false,
              msg:"Correct Date format. Format should be: 'search?date=YYYY-MM-DD'"
            });

          } else if (matchingBookings.length === 0) {
            return res.status(400).json({
            success: false,
            msg: "your search term did not return any matches",
            });

          }else { 
              const filteredBookings = bookings.filter((booking) =>
              (booking.checkInDate === formattedDate||
                booking.checkOutDate === formattedDate) && 
              (booking.email.toUpperCase().includes(term.toUpperCase()) || 
                booking.firstName.toUpperCase().includes(term.toUpperCase())|| 
                booking.surname.toUpperCase().includes(term.toUpperCase()))
              );
              
              if (filteredBookings.length===0){
                return res.status(400).json({
                  success:false,
                  msg: "there is no booking on this date",
                });
              }

              return res.status(200).json({
                success:true,
                filterBookings,
              });
            }
          } else if (date) {
            const formattedDate = moment(date).format("YYYY-MM-DD");
            if (formattedDate !== date) {
              return res.status(400).json({
              success: false,
              msg: "Please fix date search format as such: 'search?date=YYYY-MM-DD'",
            });
            }

            const matchingBookingDate = bookings.filter(
              (booking) =>
                booking.checkInDate === formattedDate ||
                booking.checkOutDate === formattedDate
            );

            if (matchingBookingDate.length === 0) {
              return res.status(404).json({
              success: false,
              msg: "It appears no bookings match your search date",
              });
            }

             return res.status(200).json({
             success: true,
             matchingBookingDate,
            });
  
          } else if (term) {
          const matchingBookings = bookings.filter((booking) =>
            booking.email.toUpperCase().includes(term.toUpperCase()) ||
            booking.firstName.toUpperCase().includes(term.toUpperCase()) ||
            booking.surname.toUpperCase().includes(term.toUpperCase())
          );

          if (matchingBookings.length === 0) {
            return res.status(400).json({
            success: false,
            msg: "your search term did not return any matches",
            });
          }

          return res.status(200).json({
          success: true,
          matchingBookings,
          });
          }
          });
// Delete a booking by id       
app.delete("/bookings/:id", (req, res) => {
  const { id } = req.params;
  const remainingBookings = bookings.filter(
    (booking) => booking.id !== parseInt(id)
  );
  const deletedBooking = bookings.find(
    (booking) => booking.id === parseInt(id)
  );

  if (remainingBookings.length === bookings.length) {
    return res.status(400).json({
      success: false,
      msg: "It appears that nothing was deleted, make sure the selected id exists...",
    });
  }

  return res.status(200).json({
    success: true,
    remainingBookings,
    deletedBooking,
  });
});

//Get one booking by id                   
app.get("/bookings/:id", (req, res) => {
  const { id } = req.params;

  const filteredBookings = bookings.filter(
    (booking) => booking.id === parseInt(id)
  );
  if (filteredBookings.length === 0) {
    return res.status(400).json({ success: false, msg: "no matching id..." });
  }
  if (filteredBookings.length > 0) {
    return res.status(200).json({ success: true, bookings: filteredBookings });
  }
});

//Create a new booking                  
app.post("/bookings", (req, res) => {
  const {
    title,
    firstName,
    surname,
    email,
    roomId,
    checkInDate,
    checkOutDate,
  } = req.body;

  if (
    !firstName ||
    !surname ||
    !email ||
    !roomId ||
    !checkInDate ||
    !checkOutDate
  ) {
    return res
      .status(404)
      .json({ success: false, msg: "required field incomplete" });
  }
  const updatedBookings = [...bookings];

  const emailValidator = validator.validate(email);
  const checkStayRange = moment(checkOutDate) - moment(checkInDate);

  if (!emailValidator) {
    return res.status(404).json({
      success: false,
      msg: "please enter a valid email...",
    });
  } else if (checkStayRange < 0) {
    return res.status(404).json({
      success: false,
      msg: "checkout date cannot be before checkin date...",
    });
  }

  updatedBookings.push({
    id: Math.random(),
    title,
    firstName,
    surname,
    email,
    roomId,
    checkInDate,
    checkOutDate,
  });

  return res.status(200).json({
    success: true,
    bookings: updatedBookings,
  });
});

app.get("/bookings", (req, res) => {
  res.status(200).json({
    success: true,
    bookings,
  });
});


app.get("/", function (req, res) {
    response.send("Hotel booking server.  Ask for /bookings, etc.");
});

app.get("/*", (req, res) => {
  res.status(400).json({
    success: false,
    msg: "Out of API reach...",
  });
});
// TODO add your routes and helper functions here
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
