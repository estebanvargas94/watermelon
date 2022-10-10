import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  // Subscription details
  const [numberOfSeats, setNumberOfSeats] = useState(5);
  const [subscriptionPrice, setSubscriptionPrice] = useState(50);
  const [interval, setInterval] = useState("Monthly");

  // Admin details
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");

  const [errorMessage, setErrorMessage] = useState(null);


  useEffect(() => {
    if (interval === "Monthly") {
      const calculatedPrice = numberOfSeats * 10;
      setSubscriptionPrice(calculatedPrice);
    } else if (interval === "Yearly") {
      const calculatedPrice = numberOfSeats * 10 * 12 * 0.8;
      setSubscriptionPrice(calculatedPrice);
    }
  }, [numberOfSeats, interval]);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: "https://example.com/order/123/complete",
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <br />
      <div className="d-flex flex-items-center flex-justify-center">
        <button className="btn btn-primary" id="checkout-and-portal-button" type="submit" disabled={!stripe}>
          Purchase
        </button>
      </div>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default CheckoutForm;
