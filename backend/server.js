import { createApp } from './createApp.js';

const port = process.env.BACKEND_PORT || process.env.PORT || 5000;

const app = await createApp();

app.listen(port, () => {
  console.log(`Server is listening on port ${port}! 🚀`);
});
