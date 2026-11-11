import { notFound } from "next/navigation";

// Any URL that matches no route lands here, so unknown pages render inside the
// site layout and use (site)/not-found.js with a real 404 status.
export default function CatchAll() {
  notFound();
}
