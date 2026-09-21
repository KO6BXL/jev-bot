const eval_sec = (key: string): string => {
    const val = process.env[key]
    if (val) {
        return val
    } else {
        console.log(`Missing key: ${key}`)
        process.exit(1)
    }
}

export default {
    OR_KEY: eval_sec("OR_KEY"),
    NANOGPT_KEY: eval_sec("NANOGPT_KEY"),
    DISCORD_KEY: eval_sec("DISCORD_KEY")
}