import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Loader from "../components/Home/Loader";

const Signup = () => {
  const history = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  if (isLoggedIn === true) {
    history("/");
  }
  const [Data, setData] = useState({ username: "", email: "", password: "" });
  const [Message, setMessage] = useState("");
  const [Loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...Data, [name]: value });
  };

  const submit = async () => {
    try {
      if (Data.username === "" || Data.email === "" || Data.password === "") {
        alert("All fields are required");
      } else {
        setLoading(true);
        const response = await axios.post(
          `${window.location.origin}/api/v1/sign-in`,
          Data
        );
        setData({ username: "", email: "", password: "" });
        setLoading(false);
        setMessage(response.data.message);
      }
    } catch (error) {
      alert(error.response.data.message);
      setLoading(false);
    }
  };

  return (
    <>
      {Loading && (
        <div className="flex h-[100%] items-center justify-center">
          <Loader />
        </div>
      )}
      {Message && Message.length > 0 && Loading === false && (
        <div className="h-[98vh] flex items-center justify-center">
          <div className="text-yellow-500 text-xl bg-zinc-800 border border-yellow-500 font-semibold rounded px-4 py-3 ">
            {Message}
          </div>
        </div>
      )}
      {Message.length === 0 && Loading === false && (
        <div className="h-[98vh] flex items-center justify-center">
          <div className="p-4 w-full max-w-md rounded bg-gray-800">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-blue-400">TaskHub</h1>
            </div>
            <div className="text-2xl font-semibold text-white mb-6 text-center">Signup</div>
            <input
              type="text"
              placeholder="Username"
              className="bg-gray-700 px-3 py-2 mb-3 w-full rounded text-white"
              name="username"
              value={Data.username}
              onChange={change}
            />
            <input
              type="email"
              placeholder="Email"
              className="bg-gray-700 px-3 py-2 mb-3 w-full rounded text-white"
              name="email"
              required
              onChange={change}
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-gray-700 px-3 py-2 mb-3 w-full rounded text-white"
              name="password"
              value={Data.password}
              onChange={change}
            />
            <p className="text-gray-400 text-sm mb-3">
              Enter a password that contains at least one number, one capital letter, and one special character.
            </p>
            <div className="w-full flex items-center justify-between">
              <button
                className="bg-blue-400 font-semibold text-black px-3 py-2 rounded"
                onClick={submit}
              >
                SignUp
              </button>
              <Link to="/login" className="text-gray-400 hover:text-gray-200">
                Already have an account? Login here
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
