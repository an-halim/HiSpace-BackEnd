import express from 'express';
import fs from 'fs';

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile('index.html', { root: './src/views', });
});

router.get('/reset-password/:code', (req, res) => {

  fetch(`http://localhost:3000/api/verify-token/${req.params.code}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    return response.json();
  }).then((data) => {
    console.log(data);
    if(data.status === 'success') {
      res.sendFile('index.html', { root: './src/views/forgot', });
    } else {
      res.sendFile('failed-token.html', { root: './src/views/forgot', });
    }
  }).catch((err) => {
    console.log(err);
  });
});


router.get('*', (req, res) => {
  res.redirect('/');
})
export default router;