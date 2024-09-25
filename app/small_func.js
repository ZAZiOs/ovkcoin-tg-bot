import chalk from "chalk"
import 'dotenv/config'
import fs from 'fs'
import s from './strings.js'

export const isDebug = () => { if (process.env.debug) { return true } }

export const hasAccess = (ctx) => {
    if (process.env.beta_test) { 

        let id = 0
        if (ctx.update.inline_query) {
            id = ctx.update.inline_query.from.id
        } else if (ctx.message) {
            id = ctx.message.from.id
        }
        let db = JSON.parse(fs.readFileSync('./app/db.json'))
        
        if (db.hasBetaAccess.includes(id)) {
            return true
        }

        if (ctx.message) {
            ctx.replyWithHTML(s.beta_no_access.replace('%TID%', ctx.message.from.id)).catch(ctch)
        }
        return false
    } else {
        return true
    }   
}


export const getDate = () => {
    let time = new Date().toLocaleTimeString('ru-RU', {
        hour12: false,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });
    let date = new Date().toLocaleDateString('ru-RU', { day: "numeric", month: "numeric" });
    let result = "[" + date + "][" + time + "]"
    return chalk.gray.bold(result)
}

export const log = (message, options) => {
    let result = ``
    if (!options) {options = {}}

    if (!options.nodate) {
        result += getDate()
    }
    if (!options.uncolored) {
        result += ' ' + chalk.yellow(message)
    } else {
        result += ' ' + message
    }
    console.log(result)
}

