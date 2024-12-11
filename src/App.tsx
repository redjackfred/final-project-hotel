import { useState } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import HotelService from "./components/HotelService";
import LogoutButton from "./components/LogoutButton";
import { Button } from "./components/ui/button";
import ExpediaHistoryModal from "./components/ExpediaHistoryModal";
import { APIProvider } from '@vis.gl/react-google-maps';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastLoginTime, setLastLoginTime] = useState("");
  const [username, setUsername] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [histories, setHistories] = useState<{ link: string; time: string }[]>([]);
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
      {isLoggedIn && (
        <>
         <ExpediaHistoryModal
            isOpen={isHistoryModalOpen}
            closeModal={() => setIsHistoryModalOpen(false)}
            histories={histories}
            setHistories={setHistories}
            username={username}
            onLoggedIn={setIsLoggedIn}></ExpediaHistoryModal>
          <div className="fixed top-4 right-4">
            <LogoutButton onLogoutClick={setIsLoggedIn} />
          </div>
          <div className="fixed top-4 right-28">
            <Button onClick={() => {
              setIsHistoryModalOpen(prev => !prev)
              fetch(`http://localhost:8080/expedia_history?username=${username}`, {
                method: "GET",
                credentials: "include",
              })
                .then((response) => {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error("Failed to fetch history");
                  }
                })
                .then((data) => {
                  setHistories(data.history);
                })
                .catch((error) => {
                  console.error("Failed to fetch history", error);
                });
            }}> History </Button>
          </div>         
        </>
      )}
      <div className="w-full m-auto">
        {isLoggedIn ? (
          <HotelService onLoggedIn={setIsLoggedIn} username={username} lastLoginTime={lastLoginTime} />
        ) : (
          <>
            <LoginForm onLoginClick={setIsLoggedIn} onUserChanged={setUsername} onLoginTimeChange={setLastLoginTime} />            
          </>
        )}
      </div>
    </APIProvider>
  );
}

export default App;
