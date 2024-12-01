import { Button } from '@/components/ui/button';

export default function LogoutButton({onLogoutClick}: {onLogoutClick: (isLoggedIn: boolean) => void}) {
    return(
        <Button onClick={() => {
            fetch("http://localhost:8080/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                credentials: "include",
            }).then((response) => {
                if (response.ok) {
                    console.log("Successfully logged out");       
                    onLogoutClick(false);             
                } else {
                    console.error("Failed to log out");
                }
            });
        }}>
            Logout
        </Button>
    );
};
