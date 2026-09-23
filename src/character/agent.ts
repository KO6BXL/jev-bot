import { OpenRouter } from "@openrouter/sdk";
import secret from "../secret.ts";
import type { Persona } from "./character.ts";
import { generateText, type LanguageModel, type Provider } from "ai";
import { createOpenAICompatible, OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";

export type Message = {
    Author: string,
    Content: string,
}


export class Agent {
    private openRouter = new OpenRouter({apiKey: secret.OR_KEY})
    private nanogpt_key = secret.NANOGPT_KEY
    private subscriptions: ((response: string) => void)[]
    public model: string
    public info: Persona
    private provider
    private constructor(model: string, info: Persona) {
        this.model = model
        this.provider = createOpenAICompatible({
            name: "nano-gpt",
            apiKey: this.nanogpt_key,
            baseURL: "https://nano-gpt.com/api/v1"
        })
        this.subscriptions = []
        this.info = info
    }
    static async Create(model: string, info: Persona) {
        return new Agent(model, info)
    }

    subscribe(callback: (response: string) => void){
        this.subscriptions.push(callback)
    }

    async Call(context: Message[]) {
        const jev_context = context.slice(-15) 
        console.log(`JEV START\n${jev_context.map(msg => `${msg.Author}:${msg.Content}\n`)}\nJEV END`)
        const name = this.info.Name
        const descrip = this.info.Description
        console.log("Evaluating request with jev...")
        const result = await this.openRouter.alpha.decisions.create({
            decisionsRequest: {
                model: "typesafe/jev-1.13",
                questions: {
                    "respond": {
                        criteria: {
                            false: `${name} shouldn't respond to the latest message`,
                            true: `${name} should respond to the latest message`
                        },
                        instructions: `Should ${name} respond to the latest message based on the provided context of the conversation. Don't assume that if ${name} didn't respond before he wouldn't now. If someone mentions ${name}, chances are ${name} would respond.`,
                        type: "noul"
                    }
                },
                state: {
                    "Description": descrip,
                    "last-15-messages": jev_context,
                }
            }
        })
        const shouldRespond = result.answers["respond"]
        if (shouldRespond && shouldRespond.type == "noul") {
            console.log(`Confidence: ${shouldRespond.noul}`)
        }
        if (shouldRespond && shouldRespond.type == "noul" && shouldRespond.noul > 0.7 ) {
            console.log("Generating...")
            const {text} = await generateText({
                model: this.provider(this.model),
                system: `Respond to the latest message in the json as ${name} is described. Do not prefix, do not format, respond in clean, short English. This isn't roleplay. Respond as if you were truley ${name}. Do not encourage or engage in explicit, illegal, or otherwise unsafe conversation. Do not use slurs. \n${name}'s Description:\n ${descrip}`,
                prompt: JSON.stringify(context)
            })
            return {score: shouldRespond.noul, text}
        } else if(shouldRespond && shouldRespond.type == "noul") {
            return {score: shouldRespond.noul, text: ""}
        }
    }
}