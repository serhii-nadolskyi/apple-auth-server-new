const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

const APPLE_KEY_PATH = path.join(__dirname, 'keys', 'AuthKey_6387SY59T6.p8');
const APPLE_PUBLIC_KEY = fs.readFileSync(APPLE_KEY_PATH, 'utf8');

// Настройка логирования с использованием winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

app.use(bodyParser.json());
app.use(morgan('dev')); // Логирование запросов

app.post('/auth/callback', (req, res) => {
  const { token } = req.body;

  // Логика верификации токена
  jwt.verify(token, APPLE_PUBLIC_KEY, (err, decoded) => {
    if (err) {
      logger.error('Token verification failed:', { error: err });
      return res.status(401).json({ message: 'Unauthorized' });
    }
    logger.info('Decoded token:', { decoded });
    
    // Логируем информацию о запросе
    logger.info('User authenticated successfully', { userId: decoded.sub });
    
    // Здесь можно добавить логику для обработки аутентифицированного пользователя
    res.status(200).json({ message: 'Authenticated', user: decoded });
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});