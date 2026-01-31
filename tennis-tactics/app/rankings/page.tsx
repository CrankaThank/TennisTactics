import { rankings } from "../lib/rankings";
import RankingsClient from "./rankings-client";

export default function RankingsPage() {
  return <RankingsClient rankings={rankings} />;
}
