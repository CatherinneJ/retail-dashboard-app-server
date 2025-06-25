import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// File paths
const PRODUCT_FILE = './data/products.json';
const REVIEWS_FILE = './data/reviews.json';

// Loads products
app.get('/api/products', async (req, res) => {
  const data = await fs.readFile(PRODUCT_FILE, 'utf-8');
  res.json(JSON.parse(data));
});

// Loads the product detail
app.get('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const products = JSON.parse(await fs.readFile(PRODUCT_FILE, 'utf-8'));
  const product = products.find(p => p.id === id);
  res.json(product || {});
});

// Add a review
app.post('/api/reviews', async (req, res) => {
  const { productId, rating, comment } = req.body;
  const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, 'utf-8'));
  reviews.push({ productId, rating, comment });
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  res.json({ success: true });
});

// Purchasing items - updating inventory
app.post('/api/purchase', async (req, res) => {
  const cart = req.body.cart;
  const products = JSON.parse(await fs.readFile(PRODUCT_FILE, 'utf-8'));

  for (const item of cart) {
    const product = products.find(p => p.id === item.id);
    if (product && product.stock >= item.qty) {
      product.stock -= item.qty;
    }
  }

  await fs.writeFile(PRODUCT_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

// Keyword analysis
app.get('/api/keywords', async (req, res) => {
  const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, 'utf-8'));
  const keywords = {
    pozitive: ['great', 'good', 'excellent'],
    negative: ['bad', 'disappointment', 'broken']
  };
  const stats = { pozitive: 0, negative: 0 };

  for (const { comment } of reviews) {
    for (const word of keywords.pozitive) {
      if (new RegExp(word, 'i').test(comment)) stats.pozitive++;
    }
    for (const word of keywords.negative) {
      if (new RegExp(word, 'i').test(comment)) stats.negative++;
    }
  }

  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
