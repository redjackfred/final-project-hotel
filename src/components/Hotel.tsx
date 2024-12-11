import { Map, MapCameraChangedEvent, Marker } from "@vis.gl/react-google-maps";
import { Button } from "./ui/button";
import { useState } from 'react';

export default function Hotel({ name, onClick, liked, hotelId, username, lat, lng }:
  { name: string; onClick: () => void; liked: boolean; hotelId: string; username: string; lat: number; lng: number }) {
  const [like, setLike] = useState(liked);
  const [isGoogleMapOpen, setIsGoogleMapOpen] = useState(false);

  const handleLikeClick = () => {

    if (like === false) {
      const endpoint = "http://localhost:8080/like_hotel";
      const formBody = `hotelid=${hotelId}&username=${username}`;
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: formBody,
      }).then((response) => {
        if (response.ok) {
          console.log("Successfully liked a hotel");
        } else if (response.status === 403) {
          console.error("Unauthorized access");
          window.location.reload();
        } else {
          console.error("Failed to search for hotels");
        }
      })
        .catch((error) => {
          console.error("Failed to like a review", error);
        });
    } else {
      const endpoint = `http://localhost:8080/like_hotel?hotelid=${hotelId}&username=${username}`;
      fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
      }).then((response) => {
        if (response.ok) {
          console.log("Successfully disliked a hotel");
        } else if (response.status === 403) {
          console.error("Unauthorized access");
          window.location.reload();
        } else {
          console.error("Failed to search for hotels");
        }
      }).catch((error) => {
        console.error("Failed to like/dislike a hotel", error);
      });
    }

    setLike((pre) => !pre);
  };

  return (
    <div className="flex w-full h-full items-center justify-between">
      <Button
        onClick={onClick}
        className="border p-8 h-24 rounded-lg text-md flex-grow mr-2 hover:bg-secondary/90 bg-white text-black text-wrap"
      >
        <div className="w-full">{name}</div>

        <div className="w-full h-24">
          {isGoogleMapOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 z-50" onClick={(e) => {
              setIsGoogleMapOpen(false)
              e.stopPropagation();
            }}>
              <div className="fixed top-1/4 left-1/4 w-1/2 h-1/2 z-60" onClick={(e)=>e.stopPropagation()}>
                <Map
                  defaultZoom={12}
                  defaultCenter={{ lat: lat, lng: lng }}
                  disableDefaultUI
                  controlled={false}
                  onCameraChanged={(ev: MapCameraChangedEvent) =>
                    console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
                  }>
                  <Marker position={{ lat: lat, lng: lng }} />
                </Map>
              </div>
            </div>
          )}
          <img src="pin.png" width={60} height={60} className="relative left-24 top-4 p-2 rounded-full z-10 hover:bg-gray-200" onClick={(e) => {
            setIsGoogleMapOpen(prev => !prev);
            e.stopPropagation();
          }} />
        </div>
      </Button>
      <button onClick={handleLikeClick} className="p-2 rounded-full hover:bg-gray-200">
        {like ? '❤️' : '🤍'}  {/* Heart emoji for liked/unliked state */}
      </button>
    </div>
  );
}  