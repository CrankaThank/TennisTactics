import { players } from "../lib/players";
import { matches } from "../lib/matches";
import H2HClient from "./h2h-client";

export default function H2HPage() {
  return <H2HClient players={players} matches={matches} />;
}
