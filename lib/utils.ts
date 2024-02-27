import { type ClassValue, clsx } from 'clsx';
import {
  Column,
  DrizzleTypeError,
  Equal,
  GetColumnData,
  SQL,
  Table,
  sql,
} from 'drizzle-orm';
import { twMerge } from 'tailwind-merge';
import { SelectedFields } from 'drizzle-orm/pg-core';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(value: string) {
  if (value.length === 0) return value;
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

export type SelectResultField<
  T,
  TDeep extends boolean = true
> = T extends DrizzleTypeError<any>
  ? T
  : T extends Table
  ? Equal<TDeep, true> extends true
    ? SelectResultField<T['_']['columns'], false>
    : never
  : T extends Column<any>
  ? GetColumnData<T>
  : T extends SQL | SQL.Aliased
  ? T['_']['type']
  : T extends Record<string, any>
  ? SelectResultFields<T, true>
  : never;

export type SelectResultFields<
  TSelectedFields,
  TDeep extends boolean = true
> = {
  [Key in keyof TSelectedFields & string]: SelectResultField<
    TSelectedFields[Key],
    TDeep
  >;
} & {};

export function jsonAggBuildObject<T extends SelectedFields>(
  shape: T,
  extra?: SQL<unknown>,
  distinct = false
) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);
  });

  return sql<Array<SelectResultFields<T>>>`coalesce(
      json_agg(
        ${
          distinct ? sql.raw('distinct ') : sql.raw('')
        }jsonb_build_object(${sql.join(chunks)}) ${
    (distinct === false && extra) ?? sql.raw('')
  }
        ),'[]'::json)`;
}

export function jsonBuildObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);
  });

  return sql<SelectResultFields<T>>`json_build_object(${sql.join(chunks)})`;
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}/${path}`;
}
