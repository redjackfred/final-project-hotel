import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,  
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Map, MapCameraChangedEvent, Marker } from "@vis.gl/react-google-maps";
import { BackgroundGradient } from "./ui/background-gradient";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";

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
  likeFrom: string[];
}

export default function HotelService({
  onLoggedIn,
  username,
  lastLoginTime,
}: {
  onLoggedIn: (isLoggedIn: boolean) => void;
  username: string;
  lastLoginTime: string;
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
  const [activePage, setActivePage] = useState(1);
  const [likedHotels, setLikeHotels] = useState<number[]>([])
  const reviewIdRef = useRef(reviewId);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });
  const resultRef = useRef<HTMLDivElement>(null);
  const [likeArray, setLikeArray] = useState<string[][]>([]);

  useEffect(() => {
    // Update the likeArray whenever reviews change  
    const newLikeArray = reviews.map((review) => review.likeFrom);
    setLikeArray(newLikeArray);
  }, [reviews]); // Dependency array to run effect when reviews change  

  useEffect(() => {
    fetch(`http://localhost:8080/like_hotel?username=${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in the request
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data.hotelIds);
      setLikeHotels(data.hotelIds);
    });
  }, []);


  const maxReviewsPerPage = 5;
  const startIndex = (activePage - 1) * maxReviewsPerPage;
  const endIndex = Math.min(startIndex + maxReviewsPerPage, reviews.length);
  const lastPage = Math.ceil(reviews.length / maxReviewsPerPage);

  const openAddReviewModal = () => {
    setIsAddReviewModalOpen(true);
  };

  const closeAddReviewModal = () => {
    setIsAddReviewModalOpen(false);
  };

  function handlePageClick(index: number) {
    const page = index + 1;
    setActivePage(page);
  }

  function handleDeleteReview() {
    fetch(
      `http://localhost:8080/reviews/${selectedHotel!.hotelId}?reviewid=${reviewIdRef.current
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

  // Function to update a specific index  
  const updateLikeAtIndex = (index: number, newValue: string[]) => {
    // Create a copy of the current array  
    const updatedArray = [...likeArray];
    // Update the value at the specified index  
    updatedArray[index] = newValue;
    // Set the new array to state  
    setLikeArray(updatedArray);
  };

  function handleLike(review: Review, index: number) {
    const likes = [...likeArray[index]]
    var hasUser = false;
    var userIdx = -1;
    for (var i = 0; i < likes.length; i++) {
      if (likes[i] === username) {
        hasUser = true;
        userIdx = i;
        break;
      }
    }

    if (hasUser === false) {
      const endpoint = "http://localhost:8080/likes";
      const formBody = `reviewid=${review.reviewId}&username=${username}`;
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: formBody,
      }).then((response) => {
        if (response.ok) {
          likes.push(username);
          updateLikeAtIndex(index, likes);
          console.log("Successfully liked a review");
        } else if (response.status === 403) {
          onLoggedIn(false);
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
      const endpoint = `http://localhost:8080/likes?reviewid=${review.reviewId}&username=${username}`;
      fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
      }).then((response) => {
        if (response.ok) {
          likes.splice(userIdx, 1);
          updateLikeAtIndex(index, likes);
          console.log("Successfully deleted a review");
        } else if (response.status === 403) {
          onLoggedIn(false);
          console.error("Unauthorized access");
          window.location.reload();
        } else {
          console.error("Failed to search for hotels");
        }
      })
        .catch((error) => {
          console.error("Failed to like a review", error);
        });
    }
  }

  function handleExpediaLink(hotel: Hotel) {
    const expediaURL = `https://www.expedia.com/h${hotel.hotelId}.Hotel-Information`;
    const endpoint = "http://localhost:8080/expedia_history";
    const formBody = `username=${username}&link=${expediaURL}`;
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


    window.open(expediaURL, '_blank');
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

  const words = [
    {
      text: "Find",
    },
    {
      text: "your",
    },
    {
      text: "dream",
    },
    {
      text: "Hotel",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "in",
    },
    {
      text: "Heaven",
      className: "text-cyan-300 dark:text-blue-500",
    },
  ];


  return (
    <>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <TypewriterEffectSmooth words={words} />
        <BackgroundGradient className="w-96 h-48 border p-6 rounded-[22px] bg-white dark:bg-zinc-900">
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
                    <div className="my-8"></div>
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

        </BackgroundGradient>
      </div>
      {hotels && hotels.length > 0 && (
        <div className="flex flex-col justify-center items-center">
          <div className="w-[90%] h-[60vh]" ref={resultRef}>
            <Map
              defaultZoom={9}
              defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
              disableDefaultUI
              controlled={false}
              onCameraChanged={(ev: MapCameraChangedEvent) =>
                console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
              }>
              {hotels.map((hotel) => (
                <Marker position={{ lat: Number(hotel.lat), lng: Number(hotel.lng) }} />
              ))}
            </Map>
          </div>
          <div
            className="grid grid-cols-1 gap-8 p-12 lg:grid-cols-2"
          >
            {hotels.map((hotel) => (
              <Hotel
                name={hotel.name}
                key={hotel.hotelId}
                onClick={() => openModal(hotel)}
                liked={likedHotels.some((likedHotel) => { return likedHotel === Number(hotel.hotelId) })}
                hotelId={hotel.hotelId}
                username={username}
                lat={Number(hotel.lat)}
                lng={Number(hotel.lng)}
              />
            ))}
          </div>
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
            <img src="logo.svg" alt="Expedia Logo" className="absolute right-6 top-6 w-36" onClick={() => handleExpediaLink(selectedHotel)}></img>
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
              {reviews.slice(startIndex, endIndex).map((review: Review, index) => (
                <div
                  key={review.reviewId}
                  className="w-full my-4 border rounded-lg p-4"
                >
                  <h3 className="text-xl text-slate-700 my-4">
                    {review.title}
                  </h3>
                  <p className="break-words">{review.reviewText}</p>
                  <p className="mt-2">Rating: {review.rating}</p>
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
                  <div className="flex justify-between">
                    <div className="w-[33%] text-left">
                      <Button className={likeArray[startIndex + index]?.includes(username) ? "bg-red-300 text-black" : ""} onClick={() => handleLike(review, startIndex + index)}>{likeArray[startIndex + index]?.length}</Button>
                    </div>
                    <div className="w-[33%]"><div className="relative top-4">{review.date}</div></div>
                    <div className="w-[33%] text-right">{review.user}</div>
                  </div>
                </div>
              ))}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => activePage > 1 ? setActivePage(activePage - 1) : null} />
                  </PaginationItem>
                  {[...Array(lastPage)].map((_, index) => (
                    <PaginationItem key={index} onClick={() => handlePageClick(index)}>
                      <PaginationLink href="#" isActive={activePage === index + 1}>{index + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => activePage < lastPage ? setActivePage(activePage + 1) : null} />
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
      <div className="fixed bottom-8 right-8">
        {lastLoginTime == "null" ? "You haven't logged in before" : `Last login time: ${lastLoginTime}`}
      </div>
    </>
  );
}
