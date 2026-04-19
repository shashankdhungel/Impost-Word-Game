import { Socket } from "socket.io-client";
import { Room, Player } from "../types";
import Lobby from "./Lobby";
import RolesScreen from "./RolesScreen";
import ClueScreen from "./ClueScreen";
import VotingScreen from "./VotingScreen";
import ResultScreen from "./ResultScreen";
import { AnimatePresence } from "motion/react";

interface Props {
  room: Room;
  player: Player;
  socket: Socket;
  key?: string;
}

export default function GameView({ room, player, socket }: Props) {
  const renderScreen = () => {
    switch (room.state) {
      case "LOBBY":
        return <Lobby key="lobby" room={room} player={player} socket={socket} />;
      case "ROLES":
        return <RolesScreen key="roles" room={room} player={player} />;
      case "CLUES":
        return <ClueScreen key="clues" room={room} player={player} socket={socket} />;
      case "VOTING":
        return <VotingScreen key="voting" room={room} player={player} socket={socket} />;
      case "RESULT":
        return <ResultScreen key="result" room={room} player={player} socket={socket} />;
      default:
        return <div>Unknown State</div>;
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
