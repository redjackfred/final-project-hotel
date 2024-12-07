import { Button } from "./ui/button";
import { useState } from 'react';  

export default function Hotel({ name, onClick, liked, hotelId, username }: { name: string; onClick: () => void; liked: boolean; hotelId: string; username: string}) {  
  const [like, setLike] = useState(liked);  

  const handleLikeClick = () => {  
    setLike(!like);  
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
          console.log("Successfully liked a review");
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
  };  
  
  return (  
    <div className="flex items-center justify-between">  
      <Button  
        onClick={onClick}  
        className="border p-8 rounded-lg text-md flex-grow mr-2 hover:bg-secondary/90 bg-white text-black"  
      >  
        {name}  
      </Button>  
      <button onClick={handleLikeClick} className="p-2 rounded-full hover:bg-gray-200">  
        {like ? '❤️' : '🤍'}  {/* Heart emoji for liked/unliked state */}  
      </button>  
    </div>  
  );  
}  
