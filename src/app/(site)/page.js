import Home from "@/components/Home";
import { getSite } from "@/lib/content";

export default async function HomePage() {
  return <Home site={await getSite()} />;
}
