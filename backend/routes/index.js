// backend/routes/index.js
const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

// router.get('/hello/world', function (req, res) {
//   res.cookie('XSRF-TOKEN', req.csrfToken());
//   res.send('Hello World!');
// });//Hello world testing route

// Add a XSRF-TOKEN cookie
router.get('/api/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('XSRF-TOKEN', csrfToken);
  res.status(200).json({
    'XSRF-Token': csrfToken,
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    Message: 'my name is kkkkkk',
  });
});

router.use('/api', apiRouter);

module.exports = router;
