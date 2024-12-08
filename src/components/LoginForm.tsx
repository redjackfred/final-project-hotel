import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const formSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9]+$/),
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*()-_=+'",.?":{}|])/),
});

export default function LoginForm({
  onLoginClick, onUserChanged, onLoginTimeChange
}: {
  onLoginClick: (isLoggedIn: boolean) => void;
  onUserChanged: (username: string) => void;
  onLoginTimeChange: (time: string) => void;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const endpoint = isLogin
      ? "http://localhost:8080/login"
      : "http://localhost:8080/register";
    console.log(values);

    const formBody = new URLSearchParams(values).toString();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
        credentials: "include",
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log(data);
        console.log(response.status);
        if (isLogin) {
          onUserChanged(values.username);
          onLoginClick(true);
          onLoginTimeChange(data.lastLoginTime);
        } else {
          alert("Successfully registered");
        }
      } else {
        alert("Failed to login/register");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="w-full h-screen flex items-center">      
      <div className="w-96 flex flex-col w-96 m-auto border p-6 rounded-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Harry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*#123Abc" {...field} />
                  </FormControl>
                  <FormDescription>
                    Password must contain at least one uppercase letter, one
                    lowercase letter, one number, and one special character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-evenly">
              <Button type="submit" onClick={() => setIsLogin(true)}>
                Login
              </Button>
              <Button type="submit" onClick={() => setIsLogin(false)}>
                Register
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
