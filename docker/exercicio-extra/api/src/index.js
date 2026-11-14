
const express = require('express');
const { Pool } = require('pg');

const app = express();

app.use(express.json());

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432
});

// Verificar o funcionamento da API e do banco
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.json({
            status: 'ok',
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected'
        });
    }
});

// Listar usuários
app.get('/usuarios', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM usuarios ORDER BY id'
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: 'Erro ao consultar usuários'
        });
    }
});

// Cadastrar usuário
app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                erro: 'Nome e email são obrigatórios'
            });
        }

        const result = await db.query(
            `INSERT INTO usuarios (nome, email)
             VALUES ($1, $2)
             RETURNING *`,
            [nome, email]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário'
        });
    }
});

// Criar tabela e iniciar servidor
async function iniciar() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL
        )
    `);

    app.listen(3000, '0.0.0.0', () => {
        console.log('API rodando na porta 3000');
    });
}

iniciar().catch(error => {
    console.error('Erro ao iniciar aplicação:', error);
    process.exit(1);
});
