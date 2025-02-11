import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    createdAt: text('createdAt')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updatedAt')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index('Post_name_idx').on(table.name)],
);
