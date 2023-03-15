import { Env } from "../index"

export type Issue = {
  issueNum: number
  issueId: number
  threadId: string
  title: string
  status: "open" | "closed"
}

export async function getIssueByNumber(
  num: number,
  env: Env
): Promise<Issue | undefined> {
  const { results }: D1Result<Issue> = await env.DB.prepare(
    "SELECT * FROM issues WHERE issueNum = ?"
  )
    .bind(num)
    .all()

  if (!results) return undefined
  if (results.length === 0) return undefined

  return results[0]
}

export async function getIssueByThreadId(
  threadId: string,
  env: Env
): Promise<Issue | undefined> {
  const { results }: D1Result<Issue> = await env.DB.prepare(
    "SELECT * FROM issues WHERE threadId = ?"
  )
    .bind(threadId)
    .all()

  if (!results) return undefined
  if (results.length === 0) return undefined

  return results[0]
}

export async function addIssue(issue: Issue, env: Env) {
  const { issueId, issueNum, threadId, status, title } = issue
  const { success } = await env.DB.prepare(
    "INSERT INTO issues (issueId, issueNum, threadId, title, status) values (?, ?, ?, ?, ?)"
  )
    .bind(issueId, issueNum, threadId, title, status)
    .run()

  return success
}

export async function updateIssue(issue: Issue, env: Env) {
  const { issueNum, title, status } = issue
  const { success } = await env.DB.prepare(
    "UPDATE issues SET status = ?, title = ? WHERE issueNum = ?"
  )
    .bind(status, title, issueNum)
    .run()

  return success
}
