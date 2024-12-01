import { Button } from "./ui/button";


export default function Hotel({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <Button onClick={onClick} className="border p-4 rounded-lg text-md p-8 flex items-center justify-center hover:bg-secondary/90 bg-white text-black">
      {name}
    </Button>
  );
}
