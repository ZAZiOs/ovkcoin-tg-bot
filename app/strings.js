const start_not_auth = `<b>Welcome to OVKCoin Bot</b>`
const start_auth = `<b>Welcome to OVKCoin Bot</b>`
const start_in_group = `<b>Приветствуем в нашем секс боте OVKCoin Bot</b>`
const login = `Для использования бота требуется авторизация.

Перейдите <a href="%AUTHLINK%">по этой ссылке</a> для авторизации.

Это - <b>ВАША ССЫЛКА</b>, вы не должны отправлять её <b>НИКОМУ.</b>
Если вам прислали эту ссылку - <b>НЕ ПЕРЕХОДИТЕ ПО НЕЙ.</b>
`
const login_in_group = `Данная команда доступна только в личных сообщениях.`
const login_success = `Вы успешно привязали аккаунт <b>%USERNAME%</b>. Приятного использования!`
const login_not = `Ваш аккаунт не был привязан.`


// cheque generator
const wizard_start = `
=====[ 1/5 ]=====

Регистрация нового чека. <i>(/exit - Выход)</i>

Введите сумму чека:

=================
`

const wizard_limit = `
=====[ 2/5 ]=====

Введите количество активаций:

=================
`
const wizard_pass = `
=====[ 3/5 ]=====

Введите пароль <i>(/skip - пропустить)</i>

=================
`
const wizard_passhint = `
=====[ 4/5 ]=====

Введите подсказку для пароля <i>(/skip - пропустить)</i>

=================
`
const wizard_check = `
=====[ 5/5 ]=====

Чек на %AMOUNT% OVKCoin
Лимит на использования - %LIMIT%
Пароль - %PASS%
Подсказка - %PASSHINT%

Если вы согласны с данными выше - введите /yes.
С вас будет списана указанная выше сумма.

Если вы не согласны - введите /exit чтобы выйти.

=================
`

const wizard_cancel = `Отмена.`
const wizard_cancel_on_confirm = `Чек отклонён.`

const wizard_cheque_mod_error = `
<b>Ошибка.</b>

Количество OVKCoin должно обязательно нацело делится на количество использований.`
const wizard_NAN = `Введено не число.`
const wizard_negative = `Введено отрицательное число.`
const wizard_not_enough = `На вашем счёте недостаточно OVKCoin для генерации чека.\nВаш баланс: %BALANCE% OVKC`
const wizard_unauthorized = `Вы не авторизованы. /login`

//cheque

const cheque_base = `
======[ <a href="https://t.me/ovkcbot"><b>OVKCoin Cheque</b></a> ]======

%CHEQUE_AMOUNT%%CHEQUE_LIMITS%%CHEQUE_HASPAS%%CHEQUE_PASHIN%
=============================
`

const cheque_amount = `Это чек на <b>%AMOUNT% OVKCoin</b>\n`
const cheque_limits = `
Количество активаций данного чека: %LIMIT%
Каждый пользователь получит %AM_PER_LIM% OVKCoin
`
const cheque_haspass = `\n<b>Данный чек защищён паролем.</b>\n`
const cheque_passhint = `Подсказка к паролю: %PASSHINT%\n`
const cheque_claim_btn = `Активировать чек`

const cheque_in_group = `Вы не можете использовать генератор чеков в группах.`

//cheque claim

const claim_not_auth = `Вы не авторизованы. Перед активацией вам нужно авторизоваться в боте. Пропишите /login`
const claim_no_cheque = `Кхм-кхм... Мы тут искали вдоль и поперёк, но похоже на то, что запрошенного чека не существует.
<b>Это очень странно... Свяжитесь с администрацией.</b>

<i>P.S. Однако на месте чека мы нашли одну интересную табличку:</i>`
const claim_is_sender = `Отправители не могут использовать свои же чеки. В этом нет смысла, ваши монетки не вернуть ;)`
const claim_limit_reached = `К сожалению данный чек уже активировали.`
const claim_user_already_active = `Вы уже активировали этот чек.`

const claim_pass_protected = `Данный чек защищён паролем.\n\n`
const claim_passhinted = `Подсказка к паролю: %PASSHINT%\n\n`
const claim_input_here = `Введите пароль:`
const claim_wrong_pass = `Неправильный пароль`

const claim_success = `
Поздравляем, чек успешно активирован, вам зачислено %AMOUNT% OVKCoin!

Теперь на вашем счету %BALANCE% OVKCoin.
`
const claim_pass_success = `
Пароль подходит, чек успешно активирован, вам зачислено %AMOUNT% OVKCoin!

Теперь на вашем счету %BALANCE% OVKCoin.
`

// Inline stats

const inline_stats_title = `Отправить стат. в чат`
const inline_stats_desc  = `Отправит ВАШУ статистику в чат`
const inline_stats_base  = `
Статистика для <b><a href="https://ovk.to/app100?%OVKID%">%USERNAME%</a></b>:

Место в топе %TOP_PLACE%
Ваш баланс: %BALANCE%
Улучшения:
- %MULTITAP% Мультитап
- %AUTOTAP% к/с Автотап
- %RESOURCE% Ресурс
`

const inline_unauth_title = `Ошибка!`
const inline_unauth_desc  = `Вы не авторизованы.`
const inline_unauth_base  = `Вы не можете использовать данную функцию без авторизации.`

const inline_beta_closed_title = `Ошибка!`
const inline_beta_closed_desc  = `У вас нет доступа к боту.`
const inline_beta_closed_base  = `Вы не принимаете участие в бета тестировании бота, так что эти функции вы использовать не можете.`

//BETA
const beta_no_access = `
Похоже на то, что у вас нет доступа к боту.

Если вы хотите поучаствовать в бета тестировании передайте администоратору этот идентификатор:

<pre language="json">%TID%</pre>

Приносим свои извинения :)
`


//errors
const db = `Database error.`

export default {
    start_not_auth,
    start_auth,
    start_in_group,
    login,
    login_in_group,
    login_success,
    login_not,
    wizard_start,
    wizard_limit,
    wizard_pass,
    wizard_passhint,
    wizard_check,
    wizard_cancel,
    wizard_cancel_on_confirm,
    wizard_cheque_mod_error,
    wizard_NAN,
    wizard_negative,
    wizard_not_enough,
    wizard_unauthorized,
    cheque_base,
    cheque_amount,
    cheque_limits,
    cheque_haspass,
    cheque_passhint,
    cheque_claim_btn,
    cheque_in_group,
    claim_not_auth,
    claim_no_cheque,
    claim_is_sender,
    claim_limit_reached,
    claim_user_already_active,
    claim_pass_protected,
    claim_passhinted,
    claim_input_here,
    claim_wrong_pass,
    claim_success,
    claim_pass_success,
    inline_stats_base,
    inline_stats_desc,
    inline_stats_title,
    inline_unauth_base,
    inline_unauth_desc,
    inline_unauth_title,
    inline_beta_closed_title,
    inline_beta_closed_desc,
    inline_beta_closed_base,
    beta_no_access,
    error: {
        db
    }
}