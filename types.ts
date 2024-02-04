import { Card, List } from './lib/schema';

export type ListWithCards = List & { cards: Card[] };
export type CardWithList = Card & {
  list: List;
};
