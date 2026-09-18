const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operations ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching operations:', error.message);
    res.status(500).json({ message: 'Unable to fetch operations.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Operation not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching operation:', error.message);
    res.status(500).json({ message: 'Unable to fetch operation.' });
  }
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO operations (title, description) VALUES ($1, $2) RETURNING *',
      [title.trim(), description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating operation:', error.message);
    res.status(500).json({ message: 'Unable to create operation.' });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !title.trim() || !status) {
    return res.status(400).json({ message: 'Title and status are required.' });
  }

  try {
    const result = await pool.query(
      'UPDATE operations SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
      [title.trim(), description || null, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Operation not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating operation:', error.message);
    res.status(500).json({ message: 'Unable to update operation.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM operations WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Operation not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting operation:', error.message);
    res.status(500).json({ message: 'Unable to delete operation.' });
  }
});

module.exports = router;
