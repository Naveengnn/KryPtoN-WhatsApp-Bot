const {
    WAConnection, MessageType
} = require('@adiwajshing/baileys')
const { Collection } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const { start, success } = require('./utils/functions')
const { color } = require('./utils/color')
const fs = require('fs')

async function krypton () {
    const client = new WAConnection()
    client.cmd = new Collection()
    const cooldowns = new Collection()
    client.logger.level = 'warn'
    // console.log(banner.string)
    await client.on('qr', () => {
        console.log(color('[', 'white'), color('!', 'red'), color(']', 'white'), color(' Scan the QR code above'))
    })

    // Connect to sessions if already exist
    if (fs.existsSync('./sessions/krypton-sessions.json')) {
        await client.loadAuthInfo('./sessions/krypton-sessions.json')
        await client.on('connecting', () => {
            start('1', ' [SERVER] Connecting to exist sessions...')
        })
    }

    // Server connecting
    if (!fs.existsSync('./sessions/krypton-sessions.json')) {
        await client.on('connecting', () => {
            start('1', ' [SERVER] Waitting scan QR to connecting...')
        })
    }

    // Server connected
    await client.on('open', () => {
        success('1', ' [SERVER] Connected')
    })

    // Create file for sessions
    await client.connect({ timeoutMs: 30 * 1000 })
    fs.writeFileSync('./sessions/krypton-sessions.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))

    await client.on('chat-update', async (chat) => {
        if (!chat.hasNewMessage) return
        const prefix = '!'
        chat = JSON.parse(JSON.stringify(chat)).messages[0]
        if (!chat.message) return
        if (chat.key && chat.key.remoteJid == 'status@broadcast') return
        if (chat.key.fromMe) return
        const from = chat.key.remoteJid
        const type = Object.keys(chat.message)[0]
        body = (type === 'conversation' && chat.message.conversation.startsWith(prefix)) ? chat.message.conversation : (type == 'imageMessage') && chat.message.imageMessage.caption.startsWith(prefix) ? chat.message.imageMessage.caption : (type == 'videoMessage') && chat.message.videoMessage.caption.startsWith(prefix) ? chat.message.videoMessage.caption : (type == 'extendedTextMessage') && chat.message.extendedTextMessage.text.startsWith(prefix) ? chat.message.extendedTextMessage.text : ''
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const commandName = body.slice(1).trim().split(/ +/).shift().toLowerCase()

        /**
            * Import all commands
        */
        const commandFiles = readdirSync(join(__dirname, 'command')).filter((file) => file.endsWith('.js'))
        for (const file of commandFiles) {
            const command = require(join(__dirname, 'command', `${file}`))
            client.cmd.set(command.name, command)
        }

        if (!isCmd) return

        const command =
        client.cmd.get(commandName) ||
        client.cmd.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

        if (!command) return

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection())
        }

        const now = Date.now()
        const timestamps = cooldowns.get(command.name)
        const cooldownAmount = (command.cooldown || 1) * 1000

        if (timestamps.has(from)) {
            const expirationTime = timestamps.get(from) + cooldownAmount

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000
                return message.reply(
                    `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
                )
            }
        }

        timestamps.set(from, now)
        setTimeout(() => timestamps.delete(from), cooldownAmount)

        try {
            command.execute(client, from, args)
        } catch (error) {
            console.error(error)
            client.sendMessage(from, 'There was an error executing that command.', MessageType.text).catch(console.error)
        }
    })
}

krypton().catch((err) => console.log(err))
