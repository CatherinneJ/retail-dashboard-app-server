import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], 
      imgSrc: ["'self'", "data:"],
      scriptSrcAttr: ["'unsafe-inline'"] 
    }
  }
}));

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

app.use(express.static(path.join(__dirname, '../client')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));




// File paths
const PRODUCT_FILE = './data/products.json';
const REVIEWS_FILE = './data/reviews.json';


// Loads all products
app.get('/api/products', async (req, res) => {
  try {
    const data = await fs.readFile(PRODUCT_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Load one product detail
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const products = JSON.parse(await fs.readFile(PRODUCT_FILE, 'utf-8'));
    const product = products.find(p => p.id === id);
    res.json(product || {});
  } catch (err) {
    console.error('Error loading product:', err);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// Add a review
app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, 'utf-8'));
    reviews.push({ productId, rating, comment });
    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

//Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error loading reviews:', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// Purchasing items - updating inventory
app.post('/api/purchase', async (req, res) => {
   try {
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
  } catch (err) {
    console.error('Error processing purchase:', err);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

// Keyword analysis
app.get('/api/keywords', async (req, res) => {
   try {
  const reviews = JSON.parse(await fs.readFile(REVIEWS_FILE, 'utf-8'));
  const keywords = {
    positive: ['great', 'good', 'excellent'],
    negative: ['bad', 'disappointment', 'broken']
  };
  const stats = { positive: 0, negative: 0 };

  for (const { comment } of reviews) {
      const lower = comment?.toLowerCase() || '';
      for (const word of keywords.positive) {
        if (lower.includes(word)) stats.positive++;
      }
      for (const word of keywords.negative) {
        if (lower.includes(word)) stats.negative++;
      }
    }

  res.json(stats);
  } catch (err) {
    console.error('Error analyzing keywords:', err);
    res.status(500).json({ error: 'Failed to analyze keywords' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//Sales GRAF
const SALES_FILE = './data/sales.json';

app.get('/api/sales/:id', async (req, res) => {
  try {
    const sales = JSON.parse(await fs.readFile(SALES_FILE, 'utf-8'));
    const id = req.params.id;
    const data = sales[id];
    if (!data) return res.status(404).json({ error: 'Sales not found' });

    res.json({
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [{
        label: 'Sales (€)',
        data,
        background: 'rgb(190, 32, 185)',
        borderColor: 'rgb(242, 50, 88)',
        borderWidth: 1
      }]
    });
  } catch (err) {
    console.error('Error loading sales data:', err);
    res.status(500).json({ error: 'Failed to load sales data' });
  }
});
