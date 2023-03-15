import { Env } from ".."

export async function closeIssue(issueNum: number, env: Env) {
  const endpoint = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/issues/${issueNum}`

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      state: "closed",
      state_reason: "completed",
    }),
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "MyApp",
    },
  })

  if (response.status !== 200) {
    throw new Error("Failed to close the issue")
  }
}

export async function reopenIssue(issueNum: number, env: Env) {
  const endpoint = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/issues/${issueNum}`
  const response = await fetch(endpoint, {
    body: JSON.stringify({
      state: "open",
      state_reason: "reopened",
    }),
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "MyApp",
    },
  })
  if (response.status !== 200) {
    throw new Error("Failed to reopen the issue")
  }
}

export async function commentIssue(issueNum: number, text: string, env: Env) {
  const endpoint = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/issues/${issueNum}/comments`

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      body: text,
    }),
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "MyApp",
    },
  })

  if (response.status !== 201) {
    throw new Error("Failed to create a comment")
  }
}

export async function renameIssue(
  issueNum: number,
  newTitle: string,
  env: Env
) {
  const endpoint = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/issues/${issueNum}`

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      title: newTitle,
    }),
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "MyApp",
    },
  })

  if (response.status !== 200) {
    throw new Error("Failed to rename issue")
  }
}
