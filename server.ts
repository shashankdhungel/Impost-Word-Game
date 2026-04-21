import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";


const WORDS_DATABASE = {
  "Food": ["Pizza", "Sushi", "Burger", "Pasta", "Taco", "Pancake", "Waffle", "Ice Cream", "Salad", "Steak", "Sandwich", "Soup", "Cake", "Cookie", "Bread", "Cheese", "Chicken", "Fish", "Rice", "Noodles"],
  "Animals": ["Elephant", "Giraffe", "Penguin", "Kangaroo", "Lion", "Dolphin", "Panda", "Koala", "Zebra", "Octopus", "Tiger", "Bear", "Wolf", "Fox", "Rabbit", "Deer", "Horse", "Cow", "Sheep", "Goat"],
  "Movies": ["Inception", "Titanic", "Avatar", "Gladiator", "Matrix", "Frozen", "Jaws", "Up", "Cars", "Coco", "Batman", "Superman", "Wonder Woman", "Iron Man", "Captain America", "Thor", "Hulk", "Spider-Man", "Black Widow", "Doctor Strange"],
  "Places": ["Paris", "Tokyo", "London", "New York", "Cairo", "Sydney", "Rome", "Rio", "Moscow", "Dubai", "Berlin", "Madrid", "Amsterdam", "Vienna", "Prague", "Budapest", "Athens", "Istanbul", "Bangkok", "Singapore"],
  "Objects": ["Smartphone", "Umbrella", "Backpack", "Toaster", "Flashlight", "Compass", "Key", "Wallet", "Spectacles", "Bicycle", "Laptop", "Mouse", "Keyboard", "Monitor", "Chair", "Table", "Pen", "Pencil", "Book", "Lamp"],
  "Sports": ["Soccer", "Basketball", "Baseball", "Football", "Tennis", "Golf", "Swimming", "Running", "Cycling", "Volleyball", "Hockey", "Cricket", "Rugby", "Boxing", "Wrestling", "Skiing", "Snowboarding", "Surfing", "Skateboarding", "Badminton"],
  "Fruits": ["Apple", "Banana", "Orange", "Grape", "Strawberry", "Blueberry", "Pineapple", "Mango", "Kiwi", "Peach", "Pear", "Cherry", "Lemon", "Lime", "Watermelon", "Cantaloupe", "Honeydew", "Plum", "Apricot", "Fig"],
  "Countries": ["USA", "Canada", "Mexico", "Brazil", "Argentina", "UK", "France", "Germany", "Italy", "Spain", "Russia", "China", "Japan", "India", "Australia", "South Africa", "Egypt", "Nigeria", "Kenya", "Morocco"],
  "Professions": ["Doctor", "Teacher", "Engineer", "Nurse", "Lawyer", "Chef", "Pilot", "Firefighter", "Police Officer", "Scientist", "Artist", "Musician", "Actor", "Writer", "Programmer", "Designer", "Mechanic", "Farmer", "Dentist", "Pharmacist"],
  "Superheroes": ["Superman", "Batman", "Wonder Woman", "Spider-Man", "Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Flash", "Aquaman", "Green Lantern", "Martian Manhunter", "Cyborg", "Deadpool", "Wolverine", "Storm", "Jean Grey", "Professor X"]
};

type GameState = "LOBBY" | "ROLES" | "CLUES" | "VOTE_DECISION" | "VOTING" | "RESULT";

interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  role?: "PLAYER" | "IMPOSTER";
  clue?: string;
  votedFor?: string;
  score: number;
}

interface Room {
  code: string;
  players: Player[];
  state: GameState;
  category?: string;
  word?: string;
  imposterId?: string;
  currentTurnIndex: number;
  winner?: "PLAYERS" | "IMPOSTER";
  imposterGuess?: string;
  caught?: boolean;
  voteDecisions?: Record<string, 'VOTE' | 'SKIP'>;
}

const rooms: Record<string, Room> = {};

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create_room", ({ nickname }) => {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      const player: Player = { id: socket.id, nickname, isHost: true, score: 0 };
      rooms[code] = {
        code,
        players: [player],
        state: "LOBBY",
        currentTurnIndex: 0,
      };
      socket.join(code);
      socket.emit("joined_room", { room: rooms[code], player });
    });

    socket.on("join_room", ({ code, nickname }) => {
      const roomCode = code.toUpperCase();
      const room = rooms[roomCode];
      
      if (!room) {
        return socket.emit("error", { message: "Room not found" });
      }
      
      if (room.state !== "LOBBY") {
        return socket.emit("error", { message: "Game already in progress" });
      }

      if (room.players.some(p => p.nickname === nickname)) {
        return socket.emit("error", { message: "Nickname already taken" });
      }

      const player: Player = { id: socket.id, nickname, isHost: false, score: 0 };
      room.players.push(player);
      socket.join(roomCode);
      
      socket.emit("joined_room", { room, player });
      io.to(roomCode).emit("room_updated", room);
    });

    socket.on("start_game", ({ code }) => {
      const room = rooms[code];
      if (!room || socket.id !== room.players.find(p => p.isHost)?.id) return;

      const categories = Object.keys(WORDS_DATABASE);
      const category = categories[Math.floor(Math.random() * categories.length)];
      //@ts-ignore
      const words = WORDS_DATABASE[category];
      const word = words[Math.floor(Math.random() * words.length)];
      
      const imposterIndex = Math.floor(Math.random() * room.players.length);
      room.imposterId = room.players[imposterIndex].id;
      
      room.players.forEach((p, idx) => {
        p.role = idx === imposterIndex ? "IMPOSTER" : "PLAYER";
        p.clue = undefined;
        p.votedFor = undefined;
      });

      // Shuffle players array using Fisher-Yates
      for (let i = room.players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [room.players[i], room.players[j]] = [room.players[j], room.players[i]];
      }

      room.currentTurnIndex = 0;

      room.state = "ROLES";
      room.category = category;
      room.word = word;
      room.winner = undefined;
      room.imposterGuess = undefined;
      room.caught = false;
      room.voteDecisions = {};

      io.to(code).emit("room_updated", room);

      // Auto-transition to clues after 5 seconds
      setTimeout(() => {
        if (rooms[code]?.state === "ROLES") {
          rooms[code].state = "CLUES";
          io.to(code).emit("room_updated", rooms[code]);
        }
      }, 7000);
    });

    socket.on("submit_clue", ({ code, clue }) => {
      const room = rooms[code];
      if (!room || room.state !== "CLUES") return;

      const player = room.players[room.currentTurnIndex];
      if (player.id !== socket.id) return;

      player.clue = clue;
      room.currentTurnIndex++;

      if (room.currentTurnIndex >= room.players.length) {
        room.state = "VOTE_DECISION";
      }

      io.to(code).emit("room_updated", room);
    });

    socket.on("vote_decision", ({ code, decision }) => {
      const room = rooms[code];
      if (!room || room.state !== "VOTE_DECISION") return;

      // Any player can submit their decision
      room.voteDecisions = room.voteDecisions || {};
      room.voteDecisions[socket.id] = decision;

      // Emit after every decision so players see live count
      io.to(code).emit("room_updated", room);

      // Check if all players have submitted a decision
      const allDecided = room.players.every(p => room.voteDecisions![p.id]);
      if (allDecided) {
        // Tally the votes
        let voteCount = 0;
        let skipCount = 0;
        Object.values(room.voteDecisions).forEach(d => {
          if (d === "VOTE") voteCount++;
          else if (d === "SKIP") skipCount++;
        });

        // Majority decision
        if (voteCount > skipCount) {
          room.state = "VOTING";
        } else {
          // skipCount >= voteCount
          room.state = "CLUES";
          room.currentTurnIndex = 0;
          room.players.forEach(p => {
            p.clue = undefined;
          });
          room.voteDecisions = {};
        }

        io.to(code).emit("room_updated", room);
      }
    });

    socket.on("submit_vote", ({ code, targetId }) => {
      const room = rooms[code];
      if (!room || room.state !== "VOTING") return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.votedFor) return;

      player.votedFor = targetId;

      const allVoted = room.players.every(p => p.votedFor);
      if (allVoted) {
        // Tally votes
        const tallies: Record<string, number> = {};
        room.players.forEach(p => {
          if (p.votedFor) {
            tallies[p.votedFor] = (tallies[p.votedFor] || 0) + 1;
          }
        });

        // Find most voted
        let mostVotedId = "";
        let maxVotes = 0;
        let tie = false;
        
        Object.entries(tallies).forEach(([id, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            mostVotedId = id;
            tie = false;
          } else if (count === maxVotes) {
            tie = true;
          }
        });

        // In this simple version, tie or wrong vote means imposter wins
        // If imposter is exactly the one with most votes (no tie)
        if (!tie && mostVotedId === room.imposterId) {
          room.caught = true;
          // Wait for imposter guess
        } else {
          room.caught = false;
          room.winner = "IMPOSTER";
          updateScores(room, "IMPOSTER");
          room.state = "RESULT";
        }
      }

      io.to(code).emit("room_updated", room);
    });

    socket.on("imposter_guess", ({ code, guess }) => {
      const room = rooms[code];
      if (!room || !room.caught || room.state !== "VOTING") return;

      if (socket.id !== room.imposterId) return;

      room.imposterGuess = guess;
      const isCorrect = guess.toLowerCase().trim() === room.word?.toLowerCase().trim();
      
      room.winner = isCorrect ? "IMPOSTER" : "PLAYERS";
      updateScores(room, room.winner);
      room.state = "RESULT";
      
      io.to(code).emit("room_updated", room);
    });

    socket.on("next_round", ({ code }) => {
      const room = rooms[code];
      if (!room || room.state !== "RESULT") return;
      if (socket.id !== room.players.find(p => p.isHost)?.id) return;

      room.state = "LOBBY";
      io.to(code).emit("room_updated", room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      Object.keys(rooms).forEach(code => {
        const room = rooms[code];
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        
        if (playerIndex !== -1) {
          const wasHost = room.players[playerIndex].isHost;
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            delete rooms[code];
          } else {
            if (wasHost && room.players.length > 0) {
              room.players[0].isHost = true;
            }
            if (room.state !== "LOBBY") {
              // Reset game if someone leaves mid-game for simplicity
              room.state = "LOBBY";
            }
            io.to(code).emit("room_updated", room);
          }
        }
      });
    });
  });

  function updateScores(room: Room, winner: "PLAYERS" | "IMPOSTER") {
    room.players.forEach(p => {
      if (winner === "IMPOSTER" && p.role === "IMPOSTER") {
        p.score += 3;
      } else if (winner === "PLAYERS" && p.role === "PLAYER") {
        p.score += 1;
      }
    });
  }

  // Vite + API
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
