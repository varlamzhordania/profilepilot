import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  credits: integer('credits').default(30).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profileAudits = pgTable('profile_audits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  targetApp: text('target_app').notNull(),
  overallScore: integer('overall_score').notNull(),
  archetype: text('archetype'),
  auditData: jsonb('audit_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  audits: many(profileAudits),
}));

export const profileAuditsRelations = relations(profileAudits, ({ one }) => ({
  user: one(users, {
    fields: [profileAudits.userId],
    references: [users.id],
  }),
}));
