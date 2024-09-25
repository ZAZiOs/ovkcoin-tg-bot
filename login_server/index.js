import express from 'express'
import 'dotenv/config'
import mysql from 'mysql2';
import axios from 'axios';

export const connection = mysql.createConnection({
    host: process.env.SQLHOST,
    port: process.env.SQLPORT,
    user: process.env.SQLNAME,
    database: process.env.SQLDB,
    password: process.env.SQLPASS
});

connection.connect(function (err) {
    if (err) {
        return console.error("ERROR WHILE CONNECTING TO THE DATABASE: " + err.message);
    }
    else {
        console.log("Sucksexfully connected to the MySQL database");
    }
});

const app = express();
const port = process.env.login_port

app.listen(port, () => {
    console.log(`Login server is running on port ${port}`);
});


app.get("*", async (req, res) => {
    try {
        let tgid = Number(req._parsedUrl.pathname.replace('/', ''))
        let ovkapi_data = {}
        let access_token = req.query.access_token

        if (!access_token) return res.json({ error: "not_enough_data", message: "Access_token is not specified" })

        if (!tgid) return res.json({ error: "tgid_not_number", message: "Specified telegram ID is not a number" })

        await axios.get(`https://ovk.to/method/Account.getProfileInfo`, {
            params: {
                access_token
            }
        }).then(res => {
            ovkapi_data = res.data.response
        }).catch(err => {
            return res.json({ error: err.code, message: "An error occured while fetching OVKAPI" })
        })




        connection.query('SELECT * FROM users', (err, results, fields) => {
            if (err) { return res.json({ error: err, message: 'Database Error' }) }

            let db_data = results.find((e) => e.oid == ovkapi_data.id);

            if (!db_data) return res.json({ error: 'Unregistered_user', message: 'This OpenVK user is unregistered in OVKCoin' })
			
            if (db_data) {
                connection.query(`UPDATE users SET telegram='${tgid}' WHERE id = ${db_data.id}`, (err, results, fields) => {
                    if (err) return res.json({ error: err, message: 'Database Error' })

                    return res.redirect(`http://t.me/ovkcbot?start=login-${ovkapi_data.id}`)
                })
            }
        })
    }
    catch (err) {
        console.log(err)
    }
})