const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client')));
app.use('/images', express.static(path.join(__dirname, 'public')));



const dataPath = path.join(__dirname, 'data');

//API all products 
app.get('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync(path.join(dataPath, 'products.json')));
  res.json(products);
});

//API one product ID
app.get('/api/products/:id', (req, res) => {
  const products = JSON.parse(fs.readFileSync(path.join(dataPath, 'products.json')));
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'The product does not exist' });
  res.json(product);
});

//all reviews
app.get('/api/reviews', (req, res) => {
  const reviews = JSON.parse(fs.readFileSync(path.join(dataPath, 'reviews.json')));
  res.json(reviews);
});

//add new review
app.post('/api/reviews', (req, res) => {
  const reviewsPath = path.join(dataPath, 'reviews.json');
  const reviews = JSON.parse(fs.readFileSync(reviewsPath));
  const newReview = req.body;
  reviews.push(newReview);
  fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
  res.status(201).json({ message: 'Review added' });
});

//Purchase API
app.post('/api/purchase', (req, res) => {
  const cart = req.body.cart;
  const productsPath = path.join(dataPath, 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath));

  cart.forEach(item => {
    const found = products.find(p => p.id === item.id);
    if (found && found.stock >= item.qty) {
      found.stock -= item.qty;
    }
  });

   fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  res.json({ message: 'The purchase was successful.' });
});

// Root route
app.get('/', (req, res) => {
  res.send('Server running right!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});