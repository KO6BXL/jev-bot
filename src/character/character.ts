import { Client, Events, GatewayIntentBits, messageLink } from "discord.js"
import secret from "../secret.ts"
import { Agent, type Message } from "./agent.ts"

export type Persona = {
    Name: string,
    Description: string,
}

export class Character {
    public info: Persona
    private client: Client
    private agent: Agent
    private key = secret.DISCORD_KEY
    private constructor(info: Persona, client: Client, agent: Agent) {
        this.info = info
        this.client = client
        this.agent = agent
    }

    static async Create(info: Persona) {
        const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]})
        const agent = await Agent.Create("z-ai/glm-5.2:thinking", info)
        client.once(Events.ClientReady, (readyClient) => {
            console.log(`${readyClient.user.tag} is ready.`)
        })

        client.on(Events.MessageCreate, async (msg) => {
            const log: Message[] = []
            if (msg.author.id == client.user?.id) {
                return
            }
            console.log(`New Message:\n${msg.author.tag}:${msg.content}`)
            const lastmsgs = await msg.channel.messages.fetch({limit: 10})
            lastmsgs.forEach((m) => {
                log.push({
                    Author: m.author.tag,
                    Content: m.content
                })
            })
            log.reverse()
            console.log("Going to the agent flow...")
            const reply = await agent.Call(log)
            if (reply) {
                msg.reply(reply)
            }
        })
        return new Character(info, client, agent)
    }

    async Serve() {
        return await this.client.login(this.key)
    }
}