import { Button } from "./ui/button";
import ReviewModal from "./ReviewModal";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  updateReviews: (hotelId: string) => void;
  openAddReviewModal: () => void;
  isAddReviewModalOpen: boolean;
  closeAddReviewModal: () => void;
  hotelId: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  closeModal,
  updateReviews,
  openAddReviewModal,
  isAddReviewModalOpen,
  closeAddReviewModal,
  hotelId,
  children,
}: ModalProps) {
  

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
          <Button
            onClick={openAddReviewModal}
            className="absolute top-2 left-2"
          >
            Add
          </Button>
          <button className="absolute top-0 right-2" onClick={closeModal}>
            &times;
          </button>
          <div className="flex flex-col items-center justify-center">
            {children}
          </div>
        </div>
        <ReviewModal
          isOpen={isAddReviewModalOpen}
          closeModal={closeAddReviewModal}
          updateReviews={updateReviews}
          hotelId={hotelId}
          method="POST"
          reviewId=""
        />
      </div>
    </>
  );
}
