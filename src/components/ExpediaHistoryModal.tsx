interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    histories: { link: string; time: string }[];
    username: string;
    onLoggedIn: (isLoggedIn: boolean) => void;
}

export default function ExpediaHistoryModal({
    isOpen,
    closeModal,
    histories,
    username,
    onLoggedIn,
}: ModalProps) {

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
                            <div>{history.time}</div>
                        </div>
                    ))}
                </div>               
            </div>
        </>
    );
}