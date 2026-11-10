import { redirect } from "next/navigation";

export default function AccessPage() {
  redirect("/dashboard#courses");
}
