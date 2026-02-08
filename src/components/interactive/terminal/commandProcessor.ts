import {
  type TerminalLine,
  FILE_SYSTEM,
  FORTUNE_QUOTES,
  NEOFETCH_OUTPUT,
  WATER_ASCII,
  HELP_TEXT,
} from "./terminalData";

export function processCommand(input: string): TerminalLine[] {
  const trimmed = input.trim();
  const [command, ...args] = trimmed.split(" ");

  switch (command.toLowerCase()) {
    case "help":
      return [{ text: HELP_TEXT, type: "output" }];

    case "ls":
      return [{ text: Object.keys(FILE_SYSTEM).join("  "), type: "output" }];

    case "cat": {
      const fileName = args.join(" ");
      if (!fileName) {
        return [{ text: "Usage: cat <filename>", type: "error" }];
      }
      const content = FILE_SYSTEM[fileName];
      if (!content) {
        return [{ text: `cat: ${fileName}: No such file`, type: "error" }];
      }
      return [{ text: content, type: "output" }];
    }

    case "whoami":
      return [{ text: "Marcelo B. Diani — Senior Full Stack & DevOps | Team Lead | Founder | E-commerce & AI Specialist", type: "output" }];

    case "neofetch":
      return [{ text: NEOFETCH_OUTPUT, type: "system" }];

    case "uptime": {
      const startYear = 2019;
      const yearsOfExperience = new Date().getFullYear() - startYear;
      return [{ text: `up ${yearsOfExperience} years, coding since ${startYear}. Load average: water, bugs, deploys.`, type: "output" }];
    }

    case "fortune":
      return [{ text: `🔮 ${FORTUNE_QUOTES[Math.floor(Math.random() * FORTUNE_QUOTES.length)]}`, type: "system" }];

    case "water":
      return [{ text: WATER_ASCII, type: "system" }];

    case "sudo":
      return [{ text: "Nice try! But you don't have root access on this portfolio. 😏", type: "error" }];

    case "exit":
      return [{ text: "There is no escape. You're stuck in my portfolio forever. Try 'cat contact.txt' instead. 😄", type: "system" }];

    case "rm":
      return [{ text: "🚨 Permission denied. This portfolio is protected by 1000+ tests. Nothing gets deleted here.", type: "error" }];

    case "pwd":
      return [{ text: "/home/marcelo/portfolio", type: "output" }];

    case "date":
      return [{ text: new Date().toString(), type: "output" }];

    case "echo":
      return [{ text: args.join(" ") || "", type: "output" }];

    case "clear":
      return [];

    case "":
      return [];

    default:
      return [{ text: `command not found: ${command}. Type "help" for available commands.`, type: "error" }];
  }
}
