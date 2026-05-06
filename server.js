const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // versão 2.6.7

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 SEUS DADOS
const PIXEL_ID = '1639841107057853';
const ACCESS_TOKEN = 'EAASBGFXZB1GwBRXZAx2OB9GUIhT92ZAe9trD8J4FZBADrkofZAQNdicTDbRhbURSoTfdoeOpNun14WQKWKTWj5K5pq8zE5ZAH0ZAZBmuX0SR0tKcODXzKPRYNEkZBDZC6tyNN8ISxVb9v3Yyn3lvoqiN5lBMI66EZCS7VcvdIZCAkiiKZB82LNJPDoCPsOVnjLjfTyDGSnQZDZD';

app.post('/capi', async (req, res) => {
    console.log('Recebeu evento:', req.body);

    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: [
                        {
                            event_name: req.body.event_name,
                            event_time: Math.floor(Date.now() / 1000),
                            event_id: req.body.event_id,
                            action_source: 'website',

                            // 🔥 AQUI FOI CORRIGIDO
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
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        console.log('Resposta do Meta:', data);

        res.status(200).json({ ok: true });

    } catch (err) {
        console.error('Erro ao enviar pro Meta:', err);
        res.status(500).json({ error: true });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Servidor rodando na porta ' + PORT);
});
