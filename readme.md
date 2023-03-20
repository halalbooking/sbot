## About SBot

SBot is a Cloudflare worker providing bidirectional Slack <=> Github interaction with issues. It creates a thread in the specified Slack channel whenever issue created in the specified GitHub repository and updates its status in the main message. It also allows to close or reopen an issue by mentioning SBot with a text 'this is resolved' or 'reopen this' respectively.

# Configuration

Run `pnpm i` to install all the dependencies.

Copy `secrets.json.example` file in the project's root folder and rename it to `secrets.json`. This is where you'll add your tokens and some other configuration variables.

## D1 Database

Log into your Cloudflare account with `wrangler login` command.

Create a D1 database (replace `<DATABASE_NAME>` with desired DB name):

```bash
wrangler d1 create <DATABASE_NAME>
```

After successfull creation of the DB you'll get the values for `database_name` and `database_id`. Copy them to the corresponding fields in the `wrangler.toml` file, leaving the `binding` value as `DB`:

```toml
[[ d1_databases ]]
binding = "DB"
database_name = ""
database_id = ""
```

You can always check the name and id of your database in the 'Workers > D1' section of Cloudflare Dashboard.

Create an empty `issues` table by executing the command below (replace `sbot-db` with the database name you used earlier). **Be careful, as it will drop any existing `issues` table in this database!**

```bash
wrangler d1 execute "sbot-db" --file=./src/db/schema.sql
```

Publish your worker with `wrangler publish` command.

## GitHub

#### Token

Create a personal access token in the Settings > Developer Settings > Personal access tokens > Fine-grained tokens ([link](https://github.com/settings/tokens?type=beta)). Set the repository access to the repository you need. As for the permissions select Issues > Read and Write. Copy the token you'll get and add it as a value for `GITHUB_TOKEN` field in the `secrets.json` file.

#### Webhook

Go to the repository you want to monitor and in its menu select Settings > Webhooks (or open https://github.com/OWNER/REPO/settings/hooks). Click 'Add Webhook'.

For the 'Payload URL' set your worker url with `/from-github` path, i.e: `https://sbot.username.workers.dev/from-github`.
For the 'Content type' select `application/json`.
For the events select `Let me select individual events` and tick the 'Issues'. Click 'Add Webhook'.

#### Owner and Repo

Copy the owner and repo names and add them as a values for the `REPO_OWNER` and `REPO_NAME` fields respectively in the `secrets.json` file in the project folder.

## Slack

Go to https://api.slack.com/apps and click 'Create New App'. Select 'From Scratch'. Specify 'App Name' (i.e. SBot) and select a workspace you want to add bot to. Click 'Create'.

#### Tokens

In App menu on the left select OAuth & Permissions.

Scroll down to 'Scopes'. In 'Bot Token Scopes' add the following scopes:

- app_mentions:read
- chat:write
- users.profile:read

In the 'User Token Scopes' add the following scope:

- users.profile:read

Scroll up to 'OAuth Tokens for Your Workspace' and click 'Install to Workspace'. Confirm app's permissions. Copy 'User OAuth Token' and 'Bot User OAuth Token' values to the `SLACK_USER_TOKEN` and `SLACK_BOT_TOKEN` fields respectively in the `secrets.json` file in the project folder.

#### Webhook

In the App menu on the left select 'Event Subscription' and enable events. In the 'Request URL' set your worker url with `/from-slack` path, i.e: `https://sbot.username.workers.dev/from-slack`. **Slack will require a response from this URL, so if you haven't yet, publish your worker now with `wrangler publish` command.**
In the 'Subscribe to bot events' click 'Add Bot User Event' and select `app_mention`. Click 'Save changes'.

#### Channel

Copy ID of the channel you want to add bot to and set it as a value for the `SLACK_CHANNEL_ID` field in the `secrets.json` file in the project folder. To find channel id go to your Slack client (or its browser version), right click on the channel, select 'View channel details' and scroll down to the bottom of opened window.

Add bot to your channel. On the left panel of your Slack client in the Apps section (under the channels list) right click on your bot and select 'View app details'. Click 'Add this app to a channel', select the desired channel and click 'Add'.

## Setting up secrets

At this stage all the values in the `secrets.json` file should be filled up. Run the command below to add all the secrets from the file to your worker:

```bash
wrangler secret:bulk secrets.json
```

## Publishing

Once all the configuration is done, publish you worker with `wrangler publish` command.
