export {}
const { MessageType } = require('@adiwajshing/baileys')
const { getBuffer } = require('../utils/functions')
const { fetchJson } = require('../utils/fetcher')

module.exports = {
    name: 'nulis',
    aliases: ['n'],
    cooldown: 50,
    description: 'Untuk menuliskan di buku bot\nPenggunaan !nulis _tulisan_',
    execute (client: any, chat: any, pesan: any, args: any) {
        const value = args.slice().join(' ')
        fetchJson(`https://mhankbarbar.tech/nulis?text=${value}&apiKey=${client.apiKey}`, { method: 'get' })
            .then(async (hasil: any) => {
                client.reply(pesan.tunggu)
                const buffer = await getBuffer(hasil.result)
                client.sendMessage(client.from, buffer, MessageType.image, { quoted: chat, caption: pesan.berhasil })
            }).catch((err: string) => {
                console.log(err)
                client.log(err)
            })
    }
}
