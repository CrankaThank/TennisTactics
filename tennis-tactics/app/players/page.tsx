import { players } from "../lib/players";
import PlayersClient from "./players-client";

export default function PlayersPage() {
  return <PlayersClient players={players} />;
}
