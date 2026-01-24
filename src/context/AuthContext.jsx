import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // restore session on refresh
  useEffect(() => {
    const savedUser = sessionStorage.getItem("auth_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    const res = await axios.get(
      `http://localhost:3000/users?email=${email}`
    );

    if (res.data.length === 0) {
      throw new Error("Invalid email");
    }

    const user = res.data[0];

    if (user.password !== password) {
      throw new Error("Incorrect password");
    }

    if (user.status !== "active") {
      throw new Error("Account blocked");
    }

    const authUser = {
      id: user.id,
      name: user.fullName,
      email: user.email,
    };

    sessionStorage.setItem("auth_user", JSON.stringify(authUser));
    setUser(authUser);
  };

  // 🆕 SIGNUP  ❗ THIS WAS MISSING ❗
  const signup = async (data) => {
    // check email
    const check = await axios.get(
      `http://localhost:3000/users?email=${data.email}`
    );

    if (check.data.length > 0) {
      throw new Error("Email already exists");
    }

    // create user
    await axios.post("http://localhost:3000/users", {
      ...data,
      status: "active",
    });
  };

  // LOGOUT
  const logout = () => {
    sessionStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
