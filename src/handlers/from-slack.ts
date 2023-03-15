import { IRequest } from "itty-router"
import { Env } from ".."
import { getIssueByThreadId, updateIssue } from "../db/db"
import {
  closeIssue,
  commentIssue,
  renameIssue,
  reopenIssue,
} from "../util/github"
import { getUserEmailById, replyToThread } from "../util/slack"
import { commands as cmd, commands } from "../util/commands"

type EventData = {
  thread_ts: string
  text: string
  type: string
  user: string
}

export default async (request: IRequest, env: Env) => {
  const json = await request.json()

  if (!json) return

  // One time URL confirmation for Slack
  if (json.challenge) return handleChallenge(json.challenge)

  const event: EventData = json.event

  if (isAppMentioned(event)) {
    if (shouldCloseIssue(event.text)) await handleIssueResolved(event, env)
    if (shouldReopenIssue(event.text)) await handleIssueReopen(event, env)
    if (shouldRenameIssue(event.text)) await handleIssueRename(event, env)
    if (shouldShowCommands(event.text)) await handleShowCommands(event, env)
  }

  return new Response("OK", {
    status: 200,
  })
}

async function handleIssueResolved(event: EventData, env: Env) {
  const { thread_ts, user } = event
  const [email, issue] = await Promise.all([
    getUserEmailById(user, env),
    getIssueByThreadId(thread_ts, env),
  ])
  if (!issue) throw new Error("Issue not found in database")
  const comment = `Closed by ${email}`
  await commentIssue(issue.issueNum, comment, env)
  await closeIssue(issue.issueNum, env)
}

async function handleIssueReopen(event: EventData, env: Env) {
  const { thread_ts, user } = event
  const [email, issue] = await Promise.all([
    getUserEmailById(user, env),
    getIssueByThreadId(thread_ts, env),
  ])
  if (!issue) throw new Error("Issue not found in database")
  const comment = `Reopened by ${email}`
  await commentIssue(issue.issueNum, comment, env)
  await reopenIssue(issue.issueNum, env)
}

async function handleIssueRename(event: EventData, env: Env) {
  const { thread_ts, user, text } = event
  const [email, issue] = await Promise.all([
    getUserEmailById(user, env),
    getIssueByThreadId(thread_ts, env),
  ])
  if (!issue) throw new Error("Issue not found in database")

  const regex = new RegExp(cmd.rename.prompt, "i") // "i" means any capitalization
  const newTitle = removeUserIdFromText(text).replace(regex, "").trim()
  if (newTitle.length === 0) throw new Error("No new title found")

  const comment = `Renamed by ${email}`
  issue.title = newTitle

  await Promise.all([
    renameIssue(issue.issueNum, newTitle, env),
    commentIssue(issue.issueNum, comment, env),
  ])
}

async function handleShowCommands(event: EventData, env: Env) {
  const { thread_ts } = event

  const newPostContent = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Here are commands you may use along with mentioning the bot:*`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${commands.close.prompt}\` - ${commands.close.description}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${commands.reopen.prompt}\` - ${commands.reopen.description}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${commands.rename.prompt}\` _New Title Name_ - ${commands.rename.description}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`${commands.help.prompt}\` - ${commands.help.description}`,
      },
    },
  ]

  await replyToThread(newPostContent, thread_ts, env)
}

function shouldCloseIssue(text: string): boolean {
  text = removeUserIdFromText(text)
  return text.toLowerCase().startsWith(cmd.close.prompt)
}

function shouldReopenIssue(text: string): boolean {
  text = removeUserIdFromText(text)
  return text.toLowerCase().startsWith(cmd.reopen.prompt)
}

function shouldRenameIssue(text: string): boolean {
  text = removeUserIdFromText(text)
  return text.toLowerCase().startsWith(cmd.rename.prompt)
}

function shouldShowCommands(text: string): boolean {
  text = removeUserIdFromText(text)
  return text.toLowerCase().startsWith(cmd.help.prompt)
}

function handleChallenge(challenge: any) {
  return new Response(challenge, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}

function isAppMentioned(event: EventData): boolean {
  return event && event.type === "app_mention"
}

function removeUserIdFromText(text: string): string {
  const userIdPattern = new RegExp(/<@\w+>/g)

  return text.replace(userIdPattern, "").trim()
}
