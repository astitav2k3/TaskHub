import React from 'react';
import { Link } from 'react-router-dom';
import './EmailVerifiedSuccessPage.css'; // We'll create this CSS file next

const EmailVerifiedSuccessPage = () => {
  return (
    <div className="email-verified-container">
      <div className="email-verified-card">
        <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <h1 className="success-title">Email Verified Successfully!</h1>
        <p className="success-message">Your email address has been successfully verified. You can now log in to your TaskHub account.</p>
        <Link to="/login" className="login-button-success">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default EmailVerifiedSuccessPage;