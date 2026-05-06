const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // versão 2.6.7

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 SEUS DADOS
const PIXEL_ID = '1639841107057853';
const ACCESS_TOKEN = 'EAASBGFXZB1GwBRXZAx2OB9GUIhT92ZAe9trD8J4FZBADrkofZAQNdicTDbRhbURSoTfdoeOpNun14WQKWKTWj5K5pq8zE5ZAH0ZAZBmuX0SR0tKcODXzKPRYNEkZBDZC6tyNN8ISxVb9v3Yyn3lvoqiN5lBMI66EZCS7VcvdIZCAkiiKZB82LNJPDoCPsOVnjLjfTyDGSnQZDZD'; // ⚠️ recomendo trocar depois por segurança

// 🔥 FUNÇÃO PADRÃO PRA ENVIAR PRO META
async function enviarMeta(event) {
    const response = await fetch(
        `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [event]
            })
        }
    );

    const data = await response.json();
    console.log('Resposta do Meta:', data);
}

// ===============================
// 🔵 CAPI (CLIQUE DO BOTÃO)
// ===============================
app.post('/capi', async (req, res) => {
    console.log('Recebeu evento:', req.body);

    try {
        await enviarMeta({
            event_name: req.body.event_name,
            event_time: Math.floor(Date.now() / 1000),
            event_id: req.body.event_id,
            action_source: 'website',

            user_data: {
                client_user_agent: req.headers['user-agent'],
                client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                fbp: req.body.fbp || undefined,
                fbc: req.body.fbc || undefined
            },

            custom_data: {
                value: Number(req.body.value),
                currency: 'BRL'
            }
        });

        res.status(200).json({ ok: true });

    } catch (err) {
        console.error('Erro ao enviar pro Meta:', err);
        res.status(500).json({ error: true });
    }
});

// ===============================
// 🔴 WEBHOOK TRIBOPAY (COMPRA)
// ===============================
app.post('/webhook', async (req, res) => {
    console.log('🔥 WEBHOOK RECEBIDO:', req.body);

    try {
        const data = req.body;

        // ⚠️ AJUSTE dependendo do Tribopay
        if (data.status === 'paid' || data.status === 'approved') {

            const valor = data.amount || data.value || 0;

            await enviarMeta({
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                event_id: 'purchase_' + Date.now(),
                action_source: 'website',

                user_data: {
                    client_user_agent: req.headers['user-agent'],
                    client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
                },

                custom_data: {
                    value: Number(valor),
                    currency: 'BRL'
                }
            });

            console.log('✅ Purchase enviado pro Meta');
        }

        res.sendStatus(200);

    } catch (err) {
        console.error('❌ Erro webhook:', err);
        res.sendStatus(500);
    }
});

// ===============================
// 🚀 SERVER
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Servidor rodando na porta ' + PORT);
});
