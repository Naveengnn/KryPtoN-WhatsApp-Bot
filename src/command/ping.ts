export {}
const { MessageType } = require('@adiwajshing/baileys')
const moment = require('moment-timezone')
const { processTime } = require('../utils/functions')

module.exports = {
    name: 'ping',
    cooldown: 10,
    description: 'Menampilkan rata-rata bot merespon',
    execute (client: any) {
        client.sendMessage(client.from, `Pong!!\n${processTime(client.pingStart, moment())} _detik_`, MessageType.text).catch(console.error)
    }
}
