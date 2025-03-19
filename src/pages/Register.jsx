import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://auction-app-production-7a6a.up.railway.app/api/v1/users/register",
        { fullName, email, username, password }
      );
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="container bg-green-600/50 rounded-2xl mt-10 mx-auto p-4 max-w-md">
      {console.log("Backend URL:", import.meta.env.VITE_SERVER)}
      <h1 className="text-2xl text-white font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="flex flex-col rounded-2xl">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 mb-2 rounded-2xl text-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-2 rounded-2xl text-white"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-2 rounded-2xl text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 rounded-2xl text-white"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-lime-700 text-white p-2 rounded-2xl mt-3"
        >
          Register
        </button>

        {/* Styled Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-green-600 px-2 text-white text-sm">OR</span>
          </div>
        </div>

        {/* Already a User Section */}
        <h1 className="text-lg text-white text-center font-semibold mb-2">
          Already a user?
        </h1>
        <Link to="/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-2xl w-full">
            Login
          </button>
        </Link>
      </form>
    </div>
  );
};

export default Register;
