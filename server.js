const express = require('express');
const app = express();

app.use(express.json());

app.post('/capi', (req, res) => {
    console.log('Recebeu evento:', req.body);
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Servidor rodando...');
});