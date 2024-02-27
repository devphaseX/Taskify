import { createSafeActionClient } from 'next-safe-action';

const serverAction = createSafeActionClient({
  handleServerErrorLog: console.error.bind(console),
  handleReturnedServerError: (error) => error.message,
});

export { serverAction };
