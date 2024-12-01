import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import HotelService from "./components/HotelService";
import LogoutButton from "./components/LogoutButton";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  return (
    <>
      {isLoggedIn && (
        <div className="fixed top-4 right-4">
          <LogoutButton onLogoutClick={setIsLoggedIn}/>
        </div>
      )}
      <div className="w-full m-auto">
        {isLoggedIn ? (
          <HotelService onLoggedIn={setIsLoggedIn} username={username}/>
        ) : (
          <LoginForm onLoginClick={setIsLoggedIn} onUserChanged={setUsername}/>
        )}
      </div>
    </>
  );
}

export default App;
