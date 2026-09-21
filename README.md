# jev-bot

This is a discord bot that uses Jev to decide whether or not to respond to messages. It looks at the last 10 messages in the sent message channel when deciding and responding.

It currently is configured as Oakley, but can be easily channged in `src/index.ts`

Oakley's original prompt was given by [Ceres](https://stick.moe), but has been edited to fit the architecture.

## models

- Jev 1.13 (Openrouter)
- GLM 5.2 (Nano-GPT)

## Env

```
OR_KEY=""
NANOGPT_KEY=""
DISCORD_KEY=""
```