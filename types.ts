import { Card, List } from './lib/schema';

export type ListWithCards = List & { cards: Card[] };
