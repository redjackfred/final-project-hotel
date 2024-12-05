import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import Hotel from "./Hotel";
import Modal from "./Modal";
import ReviewModal from "./ReviewModal";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const formSchema = z.object({
  search: z.string().min(2).max(20),
});

interface Hotel {
  hotelId: string;
  name: string;
  addr: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

interface Review {
  reviewId: string;
  title: string;
  reviewText: string;
  rating: number;
  user: string;
  date: string;
}

export default function HotelService({
  onLoggedIn,
  username,
}: {
  onLoggedIn: (isLoggedIn: boolean) => void;
  username: string;
}) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [method, setMethod] = useState("POST");
  const [reviewId, setReviewId] = useState("");
  const reviewIdRef = useRef(reviewId);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });
  const resultRef = useRef<HTMLDivElement>(null);

  const openAddReviewModal = () => {
    setIsAddReviewModalOpen(true);
  };

  const closeAddReviewModal = () => {
    setIsAddReviewModalOpen(false);
  };

  function handleDeleteReview() {
    fetch(
      `http://localhost:8080/reviews/${selectedHotel!.hotelId}?reviewid=${
        reviewIdRef.current
      }`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          console.log("Successfully deleted a review");
          fetchReviews(selectedHotel!.hotelId);
        } else {
          console.error("Failed to delete a review");
        }
      })
      .catch((error) => {
        console.error("Failed to delete a review", error);
      });
  }

  function handleSearch(values: z.infer<typeof formSchema>) {
    const endpoint =
      "http://localhost:8080/hotels/" + encodeURIComponent(values.search);
    console.log("Searching for hotels:" + endpoint);
    fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          onLoggedIn(true);
          console.log("Successfully searched for hotels");
          return response.json();
        } else if (response.status === 403) {
          onLoggedIn(false);
          console.error("Unauthorized access");
          window.location.reload();
        } else {
          console.error("Failed to search for hotels");
        }
      })
      .then((data) => {
        console.log(data);
        setHotels(data.hotels);
      })
      .catch((error) => {
        console.error("Failed to search for hotels", error);
      });
  }

  useEffect(() => {
    if (hotels.length > 0 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [hotels]);

  const openModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHotel(null);
    setReviews([]);
    setAverageRating(0);
  };

  useEffect(() => {
    if (selectedHotel) {
      console.log("Fetching reviews for hotel: " + selectedHotel.hotelId);
      fetchReviews(selectedHotel.hotelId);
    }
  }, [selectedHotel]);

  async function calculateAverageRating(reviews: Review[]) {
    let sum = 0;
    for (let i = 0; i < reviews.length; i++) {
      sum += reviews[i].rating;
    }

    return sum / reviews.length;
  }

  async function fetchReviews(hotelId: string) {
    const response = await fetch(`http://localhost:8080/reviews/${hotelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
    });

    if (response.ok) {
      const data = await response.json();
      await calculateAverageRating(data.reviews).then((averageRating) =>
        setAverageRating(averageRating)
      );
      setReviews(data.reviews);
    } else {
      setAverageRating(0);
      console.error("Failed to fetch hotel details");
      window.location.reload();
    }
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="w-96 h-48 border p-6 rounded-lg">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSearch)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Hotel</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Search</Button>
            </form>
          </Form>
        </div>
      </div>
      {hotels && hotels.length > 0 && (
        <div
          ref={resultRef}
          className="grid grid-cols-1 gap-8 p-12 lg:grid-cols-2"
        >
          {hotels.map((hotel) => (
            <Hotel
              name={hotel.name}
              key={hotel.hotelId}
              onClick={() => openModal(hotel)}
            />
          ))}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        hotelId={selectedHotel ? selectedHotel.hotelId : ""}
        updateReviews={fetchReviews}
        closeAddReviewModal={closeAddReviewModal}
        openAddReviewModal={openAddReviewModal}
        isAddReviewModalOpen={isAddReviewModalOpen}
      >
        {selectedHotel && (
          <>
            <h2 className="text-xl font-bold">{selectedHotel.name}</h2>
            <p className="text-sm">ID : {selectedHotel.hotelId}</p>
            <p className="text-md">
              {selectedHotel.addr}, {selectedHotel.city}, {selectedHotel.state}
            </p>
          </>
        )}
        {reviews ? (
          <div className="w-1/2">
            <p className="text-md mb-4">Average Rating : {averageRating}</p>

            <div className="flex flex-col justify-between">              
              {reviews.map((review: Review) => (
                <div
                  key={review.reviewId}
                  className="w-full my-4 border rounded-lg p-4"
                >
                  <h3 className="text-xl text-slate-700 my-4">
                    {review.title}
                  </h3>
                    <p className="break-words">{review.reviewText}</p>
                  <p className="mt-2">Rating: {review.rating}</p>
                  <p>{review.date}</p>
                  {review.user === username && (
                    <div className="flex gap-8 justify-center mt-4">
                      <Button
                        onClick={() => {
                          setIsReviewModalOpen(true);
                          setReviewId(review.reviewId);
                          setMethod("PUT");
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setReviewId(review.reviewId);
                          reviewIdRef.current = review.reviewId;
                          console.log("Review ID: " + reviewIdRef.current);
                          handleDeleteReview();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  <p className="text-right">{review.user}</p>
                </div>
              ))}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        <div className="w-full h-full">
          <ReviewModal
            isOpen={isReviewModalOpen}
            closeModal={() => setIsReviewModalOpen(false)}
            updateReviews={fetchReviews}
            hotelId={selectedHotel ? selectedHotel.hotelId : ""}
            method={method}
            reviewId={reviewId}
          />
        </div>
      </Modal>
    </>
  );
}
