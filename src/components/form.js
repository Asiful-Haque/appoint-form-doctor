"use client"; // Ensures that this component runs on the client side

import { useState } from "react";
import "@/styles/Form.css";

export default function Form() {
  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    address: "",
    disease: "",
  });

  const [step, setStep] = useState(1); // Track form step
  const [extraFields, setExtraFields] = useState([]); // Dynamic extra fields for appointments
  const [selectedAppointment, setSelectedAppointment] = useState(""); // Track selected appointment
  const [currentDate, setCurrentDate] = useState(new Date()); // Track current date being viewed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleAppointmentChange = (e) => {
    setSelectedAppointment(e.target.value); // Handle appointment selection
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/submitForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: formValues.address,
          disease: formValues.disease,
          postSelector: 1, // Add postSelector with value 1 for the first submission
        }),
      });

      if (!response.ok) throw new Error("Error in Step 1 API call");

      const result = await response.json();
      const newFields = JSON.parse(result.data.newFields);
      console.log("initial API response: ", newFields);
      setExtraFields(newFields);
      setStep(2); // Move to step 2
    } catch (error) {
      console.error("Error in Step 1:", error.message);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    console.log("Selected appointment:", selectedAppointment);

    const finalData = {
      ...formValues,
      selectedAppointment, // Include the selected appointment
      postSelector: 2, // Add postSelector with value 2 for the final submission
    };
    console.log("Final form data:", finalData);

    try {
      const response = await fetch("/api/submitForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) throw new Error("Error in final form submission");

      const result = await response.json();
      console.log("Final API response:", result);

      setFormValues({
        firstname: "",
        lastname: "",
        address: "",
        disease: "",
      });
      setExtraFields([]); // Reset extra fields
      setStep(1); // Reset to step 1
    } catch (error) {
      console.error("Final submission error:", error.message);
    }
  };

  // Function to generate available slots for a given time range
  const generateSlots = (bookedSlots, selectedDate, currentHour,currentMinute, d, startHour = 9, endHour = 17, interval = 30) => {
    // console.log("Its ", selectedDate);
    // console.log("Its ", d);
    // console.log("current hour is ",currentHour);
    // console.log("current min is ",currentMinute);
    if(selectedDate === d){
      if(currentMinute >= 30){
        startHour = currentHour+1;
      }
      else{
        startHour = currentHour;
      }
    }
    const slots = [];
    const bookedSet = new Set(bookedSlots);

    /////////////////////////

    // for(let hour = startHour; hour <= endHour; hour++) {
    //   let minute = 0;
    //   let slotTime = `${hour.toString().padStart(2, '0')}:${minute
    //     .toString()
    //     .padStart(2, '0')}`;
    //     console.log(slotTime);

    //     if (!bookedSet.has(slotTime)) {
    //       slots.push(slotTime);
    //     }

    //   let flag;
    //   if(hour != endHour) {
    //     flag = 0;
    //     minute = 30;
    //     slotTime = `${hour.toString().padStart(2, '0')}:${minute
    //       .toString()
    //       .padStart(2, '0')}`;
    //       console.log(slotTime);
    //   }else{
    //     flag = 1;
    //   }
      

    //     if (flag == 0 && !bookedSet.has(slotTime)) {
    //       slots.push(slotTime);
    //     }
    // }
    // return slots;

    for (let hour = startHour; hour <= endHour; hour++) {
      if(hour === endHour) {
        for (let minute = 0; minute < 30; minute += interval) {
          const slotTime = `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`;
            // console.log(slotTime);
          // Add the slot if it’s not booked
          if (!bookedSet.has(slotTime)) {
            slots.push(slotTime);
          }
        }
      } else {
        for (let minute = 0; minute < 60; minute += interval) {
          const slotTime = `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`;
            // console.log(slotTime);
          // Add the slot if it’s not booked
          if (!bookedSet.has(slotTime)) {
            slots.push(slotTime);
          }
        }
      }
      
    }
    return slots;
  };

  // Handle date navigation (next and previous day)
  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction); // Change the date
    setCurrentDate(newDate);
  };

  return (
    <div className="all_container">
      <div className="container">
        {step === 1 && (
          <form onSubmit={handleInitialSubmit}>
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formValues.firstname}
              onChange={handleChange}
              required
            />

            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formValues.lastname}
              onChange={handleChange}
              required
            />

            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formValues.address}
              onChange={handleChange}
              required
            />

            <label htmlFor="disease">Your Disease</label>
            <select
              id="disease"
              name="disease"
              value={formValues.disease}
              onChange={handleChange}
              required
            >
              <option value="">Choose an option</option>
              <option value="disease1">Disease 1</option>
              <option value="disease2">Disease 2</option>
              <option value="disease3">Disease 3</option>
            </select>

            <input type="submit" value="Proceed" />
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSubmit}>
            <h2>Available appointments for {currentDate.toLocaleDateString()}:</h2>
            <div className="date-navigation">
              <button type="button" className="datebtn" onClick={() => handleDateChange(-1)}>Previous Day</button>
              <button type="button" className="datebtn" onClick={() => handleDateChange(1)}>Next Day</button>
            </div>
            <div>
              {extraFields.map((field, index) => {
                const fieldDate = new Date(field.currentDate).toDateString();
                const selectedDate = currentDate.toDateString();

                if (fieldDate !== selectedDate) {
                  return null; // Skip fields that are not for the selected date
                }

                const bookedSlots = field.appointments.map((appt) =>
                  typeof appt === "string" && appt.includes(":")
                    ? appt.substring(0, 5)
                    : null
                ).filter(Boolean); // Remove null or undefined values

                let d = new Date().toLocaleDateString()
                // console.log(d);
                const currentHour = currentDate.getHours();
                const currentMinute = currentDate.getMinutes();

                const availableSlots = generateSlots(bookedSlots,currentDate.toLocaleDateString(),currentHour,currentMinute, d);

                return (
                  <div key={index} className="appointment-block">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="radio-item">
                          <input
                            type="radio"
                            id={`appointment_${field.currentDate}_${slotIndex}`}
                            name="selectedAppointment"
                            value={`${field.currentDate}T${slot}`}
                            onChange={handleAppointmentChange}
                            required
                          />
                          <label
                            htmlFor={`appointment_${field.currentDate}_${slotIndex}`}
                          >
                            {slot}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p>No available slots</p>
                    )}
                  </div>
                );
              })}
            </div>
            <input type="submit" value="Submit Final" />
          </form>
        )}
      </div>
    </div>
  );
}
