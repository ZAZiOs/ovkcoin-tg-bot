import { Telegraf, Scenes, session } from "telegraf";
import 'dotenv/config'
import s from './strings.js'
import fs from 'fs';
import { start_private, chequeWizard, passcheckWizard, addBetaUserWizard } from './func.js'
import { hasAccess } from "./small_func.js";
import { connection } from "../login_server/index.js";

const ctch = (err) => console.log(err)



const bot = new Telegraf(process.env.TOKEN)
const stage = new Scenes.Stage([chequeWizard, passcheckWizard, addBetaUserWizard])
bot.use(session())
bot.use(stage.middleware())


bot.start(ctx => {
    if (hasAccess(ctx)) {
        if (ctx.update.message.chat.type == "private") {
            start_private(ctx)
        } else {
            ctx.replyWithHTML(s.start_in_group).catch(ctch)
        }
    }
})

bot.command('login', ctx => {
    if (hasAccess(ctx)) {
        if (ctx.update.message.chat.type == "private") {
            let res = s.login.replace('%AUTHLINK%', process.env.AUTHLINK + ctx.update.message.from.id)
            ctx.replyWithHTML(res).catch(ctch)
        } else {
            ctx.replyWithHTML(s.login_in_group).catch(ctch)
        }
    }
})


bot.command('admin', ctx => {
    let db = JSON.parse(fs.readFileSync('./app/db.json'))
    if (db.admin.includes(ctx.message.from.id)) {
        ctx.scene.enter('add-beta-user')
    } else {
        ctx.replyWithHTML('Access denied.').catch(ctch)
    }
})

bot.command('list_beta', ctx => {
    let db = JSON.parse(fs.readFileSync('./app/db.json'))
    if (db.admin.includes(ctx.message.from.id)) {
        ctx.replyWithHTML(`<pre language="json">${JSON.stringify(db.hasBetaAccess, null, 4)}</pre>`).catch(ctch)
    } else {
        ctx.replyWithHTML('Access denied.').catch(ctch)
    }
})

bot.command('create', ctx => {
    if (hasAccess(ctx)) {
        if (ctx.update.message.chat.type == "private") {
            ctx.scene.enter("create-cheque").catch(ctch)
        } else {
            ctx.replyWithHTML(s.cheque_in_group).catch(ctch)
        }
    }
})

bot.on('inline_query', async ctx => {
    if (hasAccess(ctx)) {

        let results = await connection.promise().query('SELECT * FROM users ORDER BY users.balance DESC')
        let db_data = results[0].find((e) => e.telegram == ctx.update.inline_query.from.id);

        let top_place = results[0].indexOf(db_data)

        if (!db_data) {
            ctx.answerInlineQuery([{ id: '1', type: "article",
                title: s.inline_unauth_title,
                description: s.inline_unauth_desc,
                input_message_content: {message_text: s.inline_unauth_base, parse_mode: 'HTML'}}], {cache_time: 0}).catch(ctch)
        }

        let message = s.inline_stats_base
        .replace('%OVKID%', db_data.oid)
        .replace('%USERNAME%', db_data.name)
        .replace('%TOP_PLACE%', top_place)
        .replace('%BALANCE%', db_data.balance)
        .replace('%MULTITAP%', db_data.multi)
        .replace('%AUTOTAP%', db_data.ps)
        .replace('%RESOURCE%', db_data.resu * 1000)
        
        ctx.answerInlineQuery([{ id: '2', type: "article",
                title: s.inline_stats_title,
                description: s.inline_stats_desc,
                input_message_content: {message_text: message, parse_mode: 'HTML'}}], {cache_time: 0}).catch(ctch)
    } else {
        ctx.answerInlineQuery([{ id: '1', type: "article",
            title: s.inline_beta_closed_title,
            description: s.inline_beta_closed_desc,
            input_message_content: {message_text: s.inline_beta_closed_base, parse_mode: 'HTML'}}], {cache_time: 0}).catch(ctch)
    }
}
) 


bot.launch()