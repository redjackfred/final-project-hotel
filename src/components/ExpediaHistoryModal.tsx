import { set } from "zod";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    histories: { link: string; time: string }[];
    setHistories: (histories: { link: string; time: string }[]) => void;
    username: string;
    onLoggedIn: (isLoggedIn: boolean) => void;
}

export default function ExpediaHistoryModal({
    isOpen,
    closeModal,
    histories,
    setHistories,
    username,
    onLoggedIn,
}: ModalProps) {

    function handleDelete(time: string, username: string) {
        const endpoint = `http://localhost:8080/expedia_history?username=${username}&time=${time}`;  
        fetch(endpoint, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
        }).then((response) => {
          if (response.ok) {
            console.log("Successfully deleted a link history");
          } else if (response.status === 403) {
            onLoggedIn(false);
            console.error("Unauthorized access");
            window.location.reload();
          } else {
            console.error("Failed to search for hotels");
          }
        })
          .catch((error) => {
            console.error("Failed to delete a link history", error);
          });
    }

    function handleExpediaLink(link: string) {      
        const endpoint = "http://localhost:8080/expedia_history";
        const formBody = `username=${username}&link=${link}`;
        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: formBody,
        }).then((response) => {
          if (response.ok) {
            console.log("Successfully saved a link history");
          } else if (response.status === 403) {
            onLoggedIn(false);
            console.error("Unauthorized access");
            window.location.reload();
          } else {
            console.error("Failed to search for hotels");
          }
        })
          .catch((error) => {
            console.error("Failed to save a link history", error);
          });
    
    
        window.open(link, '_blank');
      }

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed w-screen inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50"
                onClick={closeModal}
            >
                <div
                    className="absolute w-[92vw] bg-white p-6 rounded-lg shadow-lg max-h-[80%] overflow-y-auto "
                    onClick={(e) => e.stopPropagation()}
                >                    
                    <button className="absolute top-0 right-2" onClick={closeModal}>
                        &times;
                    </button>       
                    {histories?.map((history, id) => (
                        <div key={id} className="my-6">
                            <button onClick={()=>handleExpediaLink(history.link)} className="hover:bg-slate-100 inline-block">{history.link}</button>
                            <button className="hover:bg-slate-100 inline-block float-right" onClick={()=>{
                                handleDelete(history.time, username)
                                setHistories(histories.filter((item) => item.time !== history.time))
                                }}>&times;</button>
                            <div>{history.time}</div>
                        </div>
                    ))}
                </div>               
            </div>
        </>
    );
}