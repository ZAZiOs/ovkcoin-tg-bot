import { connection } from '../login_server/index.js'
import s from './strings.js'
import { log, isDebug } from './small_func.js'
import bcrypt from 'bcrypt'
import fs from 'fs'
import crypto from 'crypto'

import { Scenes } from 'telegraf'

const ctch = (err) => console.log(err)

export const chequeWizard = new Scenes.WizardScene(
    "create-cheque",
    async (ctx) => {

        const results = await connection.promise().query('SELECT * FROM users')
        const db_data = results[0].find((e) => e.telegram == ctx.message.from.id);

        if (!db_data) {
            ctx.replyWithHTML(s.wizard_unauthorized).catch(ctch)
            return ctx.scene.leave()
        }

        ctx.wizard.state.db_data = db_data

        const message = await ctx.replyWithHTML(s.wizard_start).catch(ctch)
        ctx.wizard.state.msgid = message.message_id
        return ctx.wizard.next()
    },
    (ctx) => {
        if (ctx.message.text == "/exit") { ctx.reply(s.wizard_cancel).catch(ctch); return ctx.scene.leave().catch(ctch) }
        else {
        ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgid, null, s.wizard_limit, { parse_mode: 'HTML'}).catch(ctch)
        if (!parseInt(ctx.message.text)) {
            ctx.telegram.deleteMessage(ctx.from.id, ctx.wizard.state.msgid).catch(ctch)
            ctx.reply(s.wizard_NAN).catch(ctch)
            return ctx.scene.leave()
        }

        if (parseInt(ctx.message.text) < 0) {
            ctx.telegram.deleteMessage(ctx.from.id, ctx.wizard.state.msgid).catch(ctch)
            ctx.reply(s.wizard_negative)
            return ctx.scene.leave()
        }

        if (parseInt(ctx.wizard.state.db_data.balance) < parseInt(ctx.message.text)) {
            ctx.telegram.deleteMessage(ctx.from.id, ctx.wizard.state.msgid).catch(ctch)
            ctx.reply(s.wizard_not_enough.replace('%BALANCE%', ctx.wizard.state.db_data.balance))
            return ctx.scene.leave()
        }

        ctx.session.__scenes.state.amount = ctx.message.text
        ctx.telegram.deleteMessage(ctx.from.id, ctx.message.message_id).catch(ctch)

        return ctx.wizard.next()
        }
    },
    (ctx) => {
        if (ctx.message.text == "/exit") { ctx.reply(s.wizard_cancel).catch(ctch); return ctx.scene.leave() }
        else {
            ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgid, null, s.wizard_pass, { parse_mode: 'HTML'}).catch(ctch)
            if (!parseInt(ctx.message.text)) {
                ctx.telegram.deleteMessage(ctx.from.id, ctx.wizard.state.msgid).catch(ctch)
                ctx.reply(s.wizard_NAN).catch(ctch)
                return ctx.scene.leave()
            }
            ctx.session.__scenes.state.act_lim = ctx.message.text
            if (parseInt(ctx.wizard.state.amount) % parseInt(ctx.wizard.state.act_lim) != 0) {
                ctx.telegram.deleteMessage(ctx.from.id, ctx.wizard.state.msgid).catch(ctch)
                ctx.replyWithHTML(s.wizard_cheque_mod_error).catch(ctch)
                return ctx.scene.leave()
            }

            ctx.telegram.deleteMessage(ctx.from.id, ctx.message.message_id).catch(ctch)
            return ctx.wizard.next()
        }
    },
    (ctx) => {

        if (ctx.message.text == "/exit") { ctx.reply(s.wizard_cancel).catch(ctch); return ctx.scene.leave() }
        else {
            ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgid, null, s.wizard_passhint, { parse_mode: 'HTML'}).catch(ctch)
            ctx.session.__scenes.state.pass = ctx.message.text
            ctx.telegram.deleteMessage(ctx.from.id, ctx.message.message_id).catch(ctch)
            return ctx.wizard.next()
        }
    },
    (ctx) => {
        ctx.session.__scenes.state.passhint = ctx.message.text
        let data = ctx.session.__scenes.state
        let passdata = { pass: '<b>Нет</b>', passhint: '<b>Нет</b>' }
        if (data.pass != '/skip') {passdata.pass = data.pass}
        if (data.passhint != '/skip') {passdata.passhint = data.passhint}

        const parsed_message = s.wizard_check
        .replace('%TGID%', ctx.message.from.id)
        .replace('%AMOUNT%', data.amount)
        .replace('%LIMIT%', parseInt(data.act_lim))
        .replace('%PASS%', passdata.pass)
        .replace('%PASSHINT%', passdata.passhint)
        ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgid, null, parsed_message, {parse_mode: 'HTML'}).catch(ctch)
        ctx.telegram.deleteMessage(ctx.from.id, ctx.message.message_id).catch(ctch)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (ctx.message.text != "/yes") { ctx.reply(s.wizard_cancel_on_confirm).catch(ctch); return ctx.scene.leave() }
        else {
            ctx.session.__scenes.state.tid = ctx.message.from.id
            let data = ctx.session.__scenes.state
            const created = await create_cheque(data)

            if (created.error) {
                ctx.reply("Error: ", created.error).catch(ctch)
            } else {

                let message = s.cheque_base
                .replace('%CHEQUE_AMOUNT%', s.cheque_amount.replace('%AMOUNT%', data.amount))
                
                if (parseInt(data.act_lim) > 1) {
                    message = message.replace('%CHEQUE_LIMITS%', s.cheque_limits.replace('%LIMIT%', parseInt(data.act_lim)).replace('%AM_PER_LIM%', data.amount / data.act_lim))
                } else {message = message.replace('%CHEQUE_LIMITS%', '')}

                if (!(data.pass == 'NULL')) {
                    message = message.replace('%CHEQUE_HASPAS%', s.cheque_haspass)
                } else {message = message.replace('%CHEQUE_HASPAS%', '')}

                if (!(data.passhint == 'NULL')) {
                    message = message.replace('%CHEQUE_PASHIN%', s.cheque_passhint.replace('%PASSHINT%', data.passhint))
                } else {message = message.replace('%CHEQUE_PASHIN%', '')}

                ctx.telegram.deleteMessage(ctx.from.id, ctx.wizard.state.msgid).catch(ctch)
                ctx.telegram.deleteMessage(ctx.from.id, ctx.message.message_id).catch(ctch)
                connection.promise().query(`UPDATE users SET balance='${ctx.wizard.state.db_data.balance - parseInt(ctx.wizard.state.amount)}' WHERE id = '${ctx.wizard.state.db_data.id}'`)
                ctx.replyWithHTML(message, {
                    reply_markup: {
                        inline_keyboard: [
                                [ { text: s.cheque_claim_btn, url: "https://t.me/ovkcbot?start=cheque-" + created.insertId } ]
                            ]
                        },
                        disable_web_page_preview: true
                    }).catch(ctch)
            }
            
            
            return ctx.scene.leave()
        }
    },
  )




export const passcheckWizard = new Scenes.WizardScene(
    "check-pass",
    async (ctx) => {
        let message = s.claim_pass_protected
        if (ctx.wizard.state.cheque_data.PASSHINT != 'NULL') {
            message += s.claim_passhinted.replace('%PASSHINT%', ctx.wizard.state.cheque_data.PASSHINT)
        }
        message += s.claim_input_here
        await ctx.replyWithHTML(message).catch(ctch)
        return ctx.wizard.next()
    },
    async (ctx) => {
        const input_pass = ctx.message.text

        const compared_pass = await bcrypt.compare(input_pass, ctx.wizard.state.cheque_data.PASS)

        if (!compared_pass) {
            ctx.replyWithHTML(s.claim_wrong_pass).catch(ctch)
            return ctx.scene.leave()
        }
        else {
            if (isDebug()) {ctx.replyWithHTML(`Активация чека...\n\n<pre language="json">${JSON.stringify(ctx.wizard.state.cheque_data, null, 4)}</pre>`)}

            let result = await addCoins(ctx.wizard.state.cheque_data, ctx.wizard.state.db_data)
    
            ctx.replyWithHTML(s.claim_pass_success.replace('%AMOUNT%', result.added).replace('%BALANCE%', result.result_balance)).catch(ctch)
            return ctx.scene.leave()
        }   
    }

)

export const addBetaUserWizard =  new Scenes.WizardScene(
    "add-beta-user",
    (ctx) => {
        ctx.replyWithHTML('Введите ID пользователя которого хотите добавить. Отмена - /cancel').catch(ctch)
        ctx.wizard.next()
    },
    (ctx) => {
        let input = ctx.message.text
        if (ctx.message.text == '/cancel') {ctx.replyWithHTML('Отменено.'); return ctx.scene.leave()}

        if (Number(input)) {
            let db = JSON.parse(fs.readFileSync('./app/db.json'))
            db.hasBetaAccess.push(Number(input))
            fs.writeFileSync('./app/db.json', JSON.stringify(db, null, 4))
            ctx.replyWithHTML('Успешно.')
        } else {
            ctx.replyWithHTML('Введённый айди - не число.')
        }
        
        return ctx.scene.leave()
    }
)




export const start_private = async (ctx) => {

    let results = await connection.promise().query('SELECT * FROM users')
    let db_data = results[0].find((e) => e.telegram == ctx.message.from.id);

    if (ctx.payload.includes('login-')) {
        if (db_data) {
            ctx.replyWithHTML(s.login_success.replace('%USERNAME%', db_data.name)).catch(ctch)
        } else {
            ctx.replyWithHTML(s.login_not).catch(ctch)
        }
    } else if (ctx.payload.includes('cheque-')) {

        let cheque_id = ctx.payload.replace('cheque-', '')
        let results = await connection.promise().query('SELECT * FROM cheques')
        let cheque_data = results[0].find((e) => e.ID == cheque_id);

        if (!db_data) {
            return ctx.replyWithHTML(s.claim_not_auth).catch(ctch)
        }

        if (!cheque_data) {
            ctx.replyWithHTML(s.claim_no_cheque).catch(ctch)
            await new Promise(r => setTimeout(r, 200));
            ctx.replyWithSticker('CAACAgIAAxkBAAEMaxtmhJFL1bEVKBIytmrDeOQslpkmsAACj0EAAgWkIUne9cfZJ6bYFjUE').catch(ctch)
            return
        }

        cheque_data.ACTIVATED_BY = JSON.parse(cheque_data.ACTIVATED_BY)

        if (cheque_data.ACTIVATED_BY.length >= cheque_data.USE_LIMIT) {
            return ctx.replyWithHTML(s.claim_limit_reached).catch(ctch)
        }

        if (Number(ctx.message.from.id) == Number(cheque_data.SENDER_ID)) {
            return ctx.replyWithHTML(s.claim_is_sender).catch(ctch)
        }

        if (cheque_data.ACTIVATED_BY.includes(Number(ctx.message.from.id))) {
            return ctx.replyWithHTML(s.claim_user_already_active).catch(ctch)
        }

        if (cheque_data.PASS != 'NULL') {
            ctx.scene.enter('check-pass', {db_data, cheque_data})
        } else {
            if (isDebug()) {ctx.replyWithHTML(`Активация чека...\n\n<pre language="json">${JSON.stringify(cheque_data, null, 4)}</pre>`).catch(ctch)}

            let result = await addCoins(cheque_data, db_data)
    
            return ctx.replyWithHTML(s.claim_success.replace('%AMOUNT%', result.added).replace('%BALANCE%', result.result_balance)).catch(ctch)
        }
    } else {
        if (db_data) {
            ctx.replyWithHTML(s.start_auth).catch(ctch)
        } else {
            ctx.replyWithHTML(s.start_not_auth).catch(ctch)
        }
    }
}

export const addCoins = async (cheque_data, db_data) => {

    let toAdd = parseInt(cheque_data.AMOUNT / cheque_data.USE_LIMIT)

    cheque_data.ACTIVATED_BY.push(db_data.telegram)

    await connection.promise().query(`UPDATE users SET balance='${db_data.balance + toAdd}' WHERE id = ${db_data.id}`)
    await connection.promise().query(`UPDATE cheques SET ACTIVATED_BY='${JSON.stringify(cheque_data.ACTIVATED_BY)}' WHERE ID = '${cheque_data.ID}'`)

    return {
        added: toAdd,
        result_balance: db_data.balance + toAdd
    }
}


export const getAuth = async (uid) => {
    let results = await connection.promise().query('SELECT * FROM users')
    let db_data = results[0].find((e) => e.telegram == uid);
    return db_data
}


export const create_cheque = async (c) => {

    if (c.db_data.balance < c.amount) { return {error: 'not_enough'} }
    if (c.amount < 0) { return {error: 'negative'} }
    if (!(parseInt(c.amount) % parseInt(c.act_lim) == 0)) {return {error: "amount_mod_limit"}}

    const ID = crypto.randomUUID()

    if (c.pass == '/skip') {c.pass = 'NULL';} else {c.pass = await bcrypt.hash(c.pass, 10)}
    if (c.passhint == '/skip') {c.passhint = 'NULL';}


    const result = await connection.promise().query(`INSERT INTO cheques 
            (ID, AMOUNT, SENDER_ID, PASS, PASSHINT, USE_LIMIT, ACTIVATED_BY) 
     VALUES ('${ID}', ${parseInt(c.amount)}, ${c.tid}, '${c.pass}', '${c.passhint}', ${parseInt(c.act_lim)},'[]')`)
    
    return {insertId: ID}
}