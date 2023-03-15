import { Env } from ".."

const ENDPOINTS = {
  postMessage: "https://slack.com/api/chat.postMessage",
  updateMessage: "https://slack.com/api/chat.update",
  userProfile: "https://slack.com/api/users.profile.get",
}

export async function postNewThread(
  blocks: unknown,
  env: Env
): Promise<string> {
  const response = await fetch(ENDPOINTS.postMessage, {
    body: JSON.stringify({
      blocks,
      channel: env.SLACK_CHANNEL_ID,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
  })

  const data = await response.json()

  if (data.ok) {
    return data.ts
  }

  return ""
}

export async function replyToThread(
  blocks: unknown,
  threadId: string,
  env: Env
): Promise<string> {
  const response = await fetch(ENDPOINTS.postMessage, {
    body: JSON.stringify({
      blocks,
      channel: env.SLACK_CHANNEL_ID,
      thread_ts: threadId,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
  })

  const data = await response.json()

  if (data.ok) {
    return data.ts
  }

  return ""
}

export async function updateMessage(
  blocks: unknown,
  threadId: string,
  env: Env
): Promise<string> {
  const response = await fetch(ENDPOINTS.updateMessage, {
    body: JSON.stringify({
      blocks,
      channel: env.SLACK_CHANNEL_ID,
      ts: threadId,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
  })

  const data = await response.json()

  if (data.ok) {
    return data.ts
  }

  return ""
}

export async function getUserEmailById(
  userId: string,
  env: Env
): Promise<string> {
  const stringified = `user=${userId}`

  const response = await fetch(ENDPOINTS.userProfile, {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      Authorization: `Bearer ${env.SLACK_USER_TOKEN}`,
      Body: stringified,
    },
  })

  const data = await response.json()
  if (!data.ok) {
    throw new Error("Error while trying to get user name")
  }
  return data.profile.email
}
