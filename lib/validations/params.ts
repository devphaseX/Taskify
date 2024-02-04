import { TypeOf, object, string } from 'zod';

export const BoardIdPageParamsSchema = object({
  boardId: string().uuid(),
});

export type BoardIdPageParams = TypeOf<typeof BoardIdPageParamsSchema>;

export const CardIdRouteParamSchema = object({ cardId: string().uuid() });
export type CardIdRouteParam = TypeOf<typeof CardIdRouteParamSchema>;
