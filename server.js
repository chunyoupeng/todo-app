import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
const { Pool } = pg;
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 设置 PostgreSQL 连接池
const pool = new Pool({
  user: 'postgres', // 使用您的 PostgreSQL 用户名
  host: 'localhost',
  database: 'todo-db', // 指定您的数据库名
  password: '119900', // 输入您的数据库密码
  port: 5432,
});

// 获取所有待办事项
app.get('/todos', async (req, res) => {
  try {
    const todos = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(todos.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 创建新的待办事项
app.post('/todos', async (req, res) => {
  try {
    const { content, priority, completed } = req.body;
    const newTodo = await pool.query(
      'INSERT INTO todos(content, priority, completed, added_date) VALUES($1, $2, $3, $4) RETURNING *',
      [content, priority, completed, new Date()]
    );
    res.status(201).json(newTodo.rows[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 更新待办事项的完成状态
app.patch('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const todo = await pool.query(
      'UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    if (todo.rows.length > 0) {
      res.json(todo.rows[0]);
    } else {
      res.status(404).send('Todo not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 删除待办事项
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 监听端口
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});