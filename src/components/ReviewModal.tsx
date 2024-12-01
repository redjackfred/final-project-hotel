import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  text: z.string().min(8).max(300), 
  rating: z.string().min(0).max(5),
  reviewId: z.string().optional(),
});


interface AddReviewModalProps {
    isOpen: boolean;
    closeModal: () => void;   
    updateReviews: (hotelId: string) => void;
    method: string;
    hotelId: string;
    reviewId: string;
  }

export default function ReviewModal({ isOpen, closeModal, updateReviews, hotelId, method, reviewId }: AddReviewModalProps) {
 
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      text: "", 
      rating: "0",
      reviewId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {   
    const formBody = new URLSearchParams({
      ...values,
      rating: values.rating.toString(),   
      reviewId: reviewId,   
    });

    console.log(formBody.toString());

    try {
      const response = await fetch(`http://localhost:8080/reviews/${hotelId}`, {
        method: method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
        credentials: "include",
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        console.log(response.status);  
        await updateReviews(hotelId);
        closeModal();
        alert("Successfully updated a review");        
      } else {
        closeModal();
        alert("Failed to update a review");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModal}>
    <div className="w-full h-screen flex items-center z-30 bg-white" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col w-96 m-auto border p-6 rounded-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Great" {...field}/>
                  </FormControl>
                  <FormDescription>
                    Write a review about your experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"              
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0-5" {...field} min="0" max="5"/>
                  </FormControl>
                  <FormDescription>
                    Rate the hotel from 0 to 5
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit">
                Ok
            </Button> 
          </form>
        </Form>
      </div>
    </div>
    </div>
  );
}
