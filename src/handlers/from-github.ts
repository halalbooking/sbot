import { IRequest } from "itty-router"
import { postNewThread, replyToThread, updateMessage } from "../util/slack"
import { addIssue, getIssueByNumber, updateIssue } from "../db/db"
import { Env } from ".."
import { Issue } from "../db/db"
import { convertMarkdown } from "../util/markdown"

type GithubEvent = {
  action: string
  issue: EventIssue
}

type EventIssue = {
  number: number
  id: number
  title: string
  body: string
}

const STATUS = {
  open: "`🔥 Open`",
  closed: "`📦 Closed`",
}

export default async (request: IRequest, env: Env) => {
  let event = undefined

  try {
    event = await request.json()
  } catch (error) {
    return handleNoJSON()
  }

  if (event.action === "opened") await handleIssueOpened(event, env)
  if (event.action === "reopened") await handleIssueReopened(event, env)
  if (event.action === "closed") await handleIssueClosed(event, env)
  if (event.action === "edited") await handleIssueRenamed(event, env)

  return new Response("OK")
}

function handleNoJSON() {
  return new Response("JSON expected", {
    status: 400,
  })
}

async function handleIssueOpened(event: GithubEvent, env: Env) {
  const { number, title, body, id } = event.issue

  const blocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `\`🔥 Open\` \`#${number}\` ${title}` },
    },
  ]

  const convertedBody = convertMarkdown(body)

  const replyBlocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: convertedBody },
    },
  ]

  const threadId = await postNewThread(blocks, env)

  if (threadId.length > 0) {
    const issue: Issue = {
      issueId: id,
      issueNum: number,
      title,
      status: "open",
      threadId,
    }

    await Promise.all([
      replyToThread(replyBlocks, threadId, env),
      addIssue(issue, env),
    ])
  }
}

async function handleIssueClosed(event: GithubEvent, env: Env) {
  const { number, title } = event.issue

  const newPostContent = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `Incident resolved` },
    },
  ]

  const updatedPostContent = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${STATUS.closed} \`#${number}\` ${title}`,
      },
    },
  ]

  const issue = await getIssueByNumber(number, env)
  if (!issue) throw new Error("Issue is not found in DB")
  issue.status = "closed"

  await Promise.all([
    updateIssue(issue, env),
    replyToThread(newPostContent, issue.threadId, env),
    updateMessage(updatedPostContent, issue.threadId, env),
  ])
}

async function handleIssueReopened(event: GithubEvent, env: Env) {
  const { number, title } = event.issue

  const newPostContent = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `Incident reopened` },
    },
  ]

  const updatedPostContent = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `${STATUS.open} \`#${number}\` ${title}` },
    },
  ]

  const issue = await getIssueByNumber(number, env)
  if (!issue) throw new Error("Issue is not found in DB")
  issue.status = "open"

  await Promise.all([
    updateIssue(issue, env),
    replyToThread(newPostContent, issue.threadId, env),
    updateMessage(updatedPostContent, issue.threadId, env),
  ])
}

async function handleIssueRenamed(event: GithubEvent, env: Env) {
  const { number, title } = event.issue

  const newPostContent = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `Incident renamed` },
    },
  ]
  const issue = await getIssueByNumber(number, env)
  if (!issue) throw new Error("Issue is not found in DB")

  issue.title = title
  const statusText = STATUS[issue.status]
  const updatedPostContent = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `${statusText} \`#${number}\` ${title}` },
    },
  ]

  await Promise.all([
    updateIssue(issue, env),
    replyToThread(newPostContent, issue.threadId, env),
    updateMessage(updatedPostContent, issue.threadId, env),
  ])
}
