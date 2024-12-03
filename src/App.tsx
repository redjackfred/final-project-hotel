import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import HotelService from "./components/HotelService";
import LogoutButton from "./components/LogoutButton";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastLoginTime, setLastLoginTime] = useState("");
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
          <LoginForm onLoginClick={setIsLoggedIn} onUserChanged={setUsername} onLoginTimeChange={setLastLoginTime}/>
        )}
      </div>
      <div className="fixed bottom-8 right-8">
        Last login time: {lastLoginTime}
      </div>
    </>
  );
}

export default App;
