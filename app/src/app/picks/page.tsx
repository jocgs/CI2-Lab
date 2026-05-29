import { redirect } from "next/navigation";

/** Revelación y predicciones especiales viven en Fantasy → Mi equipo. */
export default function PicksPage() {
  redirect("/fantasy/my-team");
}
