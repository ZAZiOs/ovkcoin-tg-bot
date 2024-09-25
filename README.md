# OVKCoin Telegram Bot
 Telegram bot for [OpenVK-Coin minigame](https://ovk.to/app100)

.env example:

```env
TOKEN      = Telegram bot API Token
DEBUG      = shows debug info (1/0)
BETA_TEST  = closed beta test (1/0)
SQLHOST    = sql host
SQLPORT    = sql port
SQLNAME    = sql username
SQLPASS    = sql password
SQLDB      = sql database
LOGIN_PORT = Login server port (Recommended: 80)
AUTHLINK   = OpenVK auth link (Recommended: https://ovk.to/authorize?client_name=ovkc_telegrambot&redirect_uri=<HOSTNAME, CHANGE THIS!! CAN BE 127.0.0.1>)
```

Admin access should be specified manually, enter your telegram id into `./app/db.json -> "admin"` array

If BETA_TEST is set to 1 users to test can be added using `/admin` command.

`node app`  runs production version

`npm start` runs nodemon, dev version