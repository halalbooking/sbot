import { Router } from "itty-router"
import fromGithub from "./handlers/from-github"
import fromSlack from "./handlers/from-slack"

export interface Env {
  DB: D1Database
  GITHUB_TOKEN: string
  REPO_OWNER: string
  REPO_NAME: string
  SLACK_BOT_TOKEN: string
  SLACK_USER_TOKEN: string
  SLACK_CHANNEL_ID: string
}

const router = Router()

router.post("/from-github", fromGithub)
router.post("/from-slack", fromSlack)
router.all("*", () => new Response("404 not found!", { status: 404 }))

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return router.handle(request, env)
  },
}
