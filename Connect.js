const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;
const https = require('https');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'UX23Y24%@&2aMb';
const fs = require('fs');

const privateKey = fs.readFileSync('privatekey.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };



const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123_321",
    database: "shopdee"
});

db.connect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', function (req, res) {
    res.send('Hello World!');
});




app.post('/product', function (req, res) {
    const { productName, productDetail, price, cost, quantity } = req.body;
    let sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [productName, productDetail, price, cost, quantity], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'เกิดข้อผิดพลาดในระบบ', status: false });
        }
        res.send({ message: 'บันทึกข้อมูลสำเร็จ', status: true });
    });
});




app.get('/product/:id', function (req, res) {
    const productID = req.params.id;
    let sql = "SELECT * FROM product WHERE productID = ?";
    db.query(sql, [productID], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'เกิดข้อผิดพลาดในระบบ', status: false });
        }
        res.send(result);
    });
});

app.post('/login', async function (req, res) {
    const { username, password } = req.body;
    let sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1";
    db.query(sql, [username], async function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'เกิดข้อผิดพลาดในระบบ', status: false });
        }
        if (result.length > 0) {
            const customer = result[0];
            const passwordMatch = await bcrypt.compare(password, customer.password);
            if (passwordMatch) {
                customer.message = "เข้าสู่ระบบสำเร็จ";
                customer.status = true;
                res.send(customer);
            } else {
                res.send({ message: "กรุณาระบุรหัสผ่านใหม่อีกครั้ง", status: false });
            }
        } else {
            res.send({ message: "ไม่พบผู้ใช้งาน", status: false });
        }
    });
});


// app.listen(port, function () {
//     console.log(`Server listening on port ${port}`);
// });

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
    console.log(`HTTPS Server listening on port ${port}`);
});
