
const express = require('express');
const { Pool } = require('pg');

const app = express();

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432
});

app.get('/', (req, res) => {
    res.send('API conectada ao Docker!');
});

app.get('/dados', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT NOW() AS horario'
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: 'Erro ao consultar o banco'
        });
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log('API rodando na porta 3000');
});
