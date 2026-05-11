import pkg from 'knex';
const { knex } = pkg;
import type { Knex } from 'knex';
import type { ConversationSummary } from '../prompts/v1/summarization.ts';
import type { UserPreferences } from '../prompts/v1/chatResponse.ts';

export class PreferencesService {
  private db: Knex;
  private isSetup = false;

  constructor(dbPath: string) {
    this.db = knex({
      client: 'better-sqlite3',
      connection: {
        filename: dbPath.replace('file:', ''),
      },
      useNullAsDefault: true,
    });
  }

  async setup(): Promise<void> {
    if (this.isSetup) return;

    const hasTable = await this.db.schema.hasTable('user_preferences');

    if (!hasTable) {
      await this.db.schema.createTable('user_preferences', (table) => {
        table.increments('id').primary();
        table.string('user_id').unique().notNullable();
        table.string('name');
        table.integer('age');
        table.json('favorite_genres');
        table.json('favorite_bands');
        table.text('key_preferences');
        table.text('important_context');
        table.timestamp('updated_at').defaultTo(this.db.fn.now());
      });
    }

    this.isSetup = true;
  }

  async mergePreferences(userId: string, prefs: UserPreferences): Promise<void> {
    await this.setup();

    const existing = await this.getSummary(userId);

    const mergedGenres = prefs.favoriteGenres?.length
      ? [...new Set([...(existing?.favoriteGenres || []), ...prefs.favoriteGenres])]
      : existing?.favoriteGenres;

    const mergedBands = prefs.favoriteBands?.length
      ? [...new Set([...(existing?.favoriteBands || []), ...prefs.favoriteBands])]
      : existing?.favoriteBands;

    const contextParts = [
      existing?.importantContext,
      prefs.mood && `Mood: ${prefs.mood}`,
      prefs.listeningContext && `Context: ${prefs.listeningContext}`,
      prefs.additionalInfo
    ].filter(Boolean);

    const data = {
      user_id: userId,
      name: prefs.name || existing?.name || null,
      age: prefs.age || existing?.age || null,
      favorite_genres: mergedGenres ? JSON.stringify(mergedGenres) : null,
      favorite_bands: mergedBands ? JSON.stringify(mergedBands) : null,
      key_preferences: existing?.keyPreferences || null,
      important_context: contextParts.length > 0 ? contextParts.join('. ') : null,
      updated_at: this.db.fn.now(),
    };

    await this.db('user_preferences')
      .insert(data)
      .onConflict('user_id')
      .merge();
  }

  async storeSummary(userId: string, summary: ConversationSummary): Promise<void> {
    await this.setup();

    const data = {
      user_id: userId,
      name: summary.name || null,
      age: summary.age || null,
      favorite_genres: summary.favoriteGenres ? JSON.stringify(summary.favoriteGenres) : null,
      favorite_bands: summary.favoriteBands ? JSON.stringify(summary.favoriteBands) : null,
      key_preferences: summary.keyPreferences,
      important_context: summary.importantContext || null,
      updated_at: this.db.fn.now(),
    };

    await this.db('user_preferences')
      .insert(data)
      .onConflict('user_id')
      .merge();
  }

  async getSummary(userId: string): Promise<ConversationSummary | null> {
    await this.setup();

    const row = await this.db('user_preferences')
      .where({ user_id: userId })
      .first();

    if (!row) return null;

    return {
      name: row.name || undefined,
      age: row.age || undefined,
      favoriteGenres: row.favorite_genres ? JSON.parse(row.favorite_genres) : undefined,
      favoriteBands: row.favorite_bands ? JSON.parse(row.favorite_bands) : undefined,
      keyPreferences: row.key_preferences,
      importantContext: row.important_context || undefined,
    };
  }

  async getBasicInfo(userId: string): Promise<string | undefined> {
    const summary = await this.getSummary(userId);
    if (!summary) return undefined;

    const parts: string[] = [];

    if (summary.name) parts.push(`Nome: ${summary.name}`);
    if (summary.age) parts.push(`Idade: ${summary.age}`);
    if (summary.favoriteGenres?.length) {
      parts.push(`Gêneros Favoritos: ${summary.favoriteGenres.join(', ')}`);
    }
    if (summary.favoriteBands?.length) {
      parts.push(`Artistas/Bandas Favoritas: ${summary.favoriteBands.join(', ')}`);
    }
    if (summary.keyPreferences) {
      parts.push(`\nPreferências: ${summary.keyPreferences}`);
    }

    return parts.length > 0 ? parts.join('\n') : undefined;
  }

  async close(): Promise<void> {
    await this.db.destroy();
  }
}
