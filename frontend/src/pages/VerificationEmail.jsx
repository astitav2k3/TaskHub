import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const VerificationEmail = () => {
  const token = window.location.search.slice(7);
  const history = useNavigate();
  const verifyEmail = async () => {
    try {
      const res = await axios.get(
        `${window.location.origin}/api/v1/verify-email?token=${token}`
      );
      // alert(res.data.message); // No longer needed, success page will show the message
      history("/email-verified-successfully");
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  return (
    <div className="flex items-center justify-center h-[100%]">
      <button
        className="text-xl text-blue-400 hover:text-blue-300 transition-all duration-300"
        onClick={verifyEmail}
      >
        <u>Click here to verify your account</u>
      </button>
    </div>
  );
};

export default VerificationEmail;
