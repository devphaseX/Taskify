import { TypeOf, object, string } from 'zod';

export const BoardIdPageParamsSchema = object({
  boardId: string().uuid(),
});

export type BoardIdPageParams = TypeOf<typeof BoardIdPageParamsSchema>;
