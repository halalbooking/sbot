type Command = {
  prompt: string
  description: string
}

type Commands = {
  close: Command
  reopen: Command
  rename: Command
  help: Command
}

export const commands: Commands = {
  close: {
    prompt: "this is resolved",
    description: "closes the issue",
  },
  reopen: {
    prompt: "reopen this",
    description: "reopens the issue",
  },
  rename: {
    prompt: "rename this to",
    description: "set the text after command as a new issue title",
  },
  help: {
    prompt: "help",
    description: "shows all available bot commands",
  },
}
