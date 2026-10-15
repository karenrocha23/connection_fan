import app from './app.js';

const PORTA = process.env.PORT || 3001;

app.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
});
