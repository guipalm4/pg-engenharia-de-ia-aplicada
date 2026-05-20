import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph';
import { config } from '../config.ts';

export class Neo4jService {
  private graph: Neo4jGraph | null = null;
  private initializing: Promise<Neo4jGraph> | null = null;

  private async getGraph(): Promise<Neo4jGraph> {
    if (this.graph) {
      return this.graph;
    }

    // Prevent multiple concurrent initializations
    if (this.initializing) {
      return this.initializing;
    }

    this.initializing = Neo4jGraph.initialize({
      url: config.neo4j.uri,
      username: config.neo4j.username,
      password: config.neo4j.password,
      enhancedSchema: false,
    });

    this.graph = await this.initializing;
    this.initializing = null;
    return this.graph;
  }

  async getSchema(): Promise<string> {
    try {
      const graph = await this.getGraph();
      return await graph.getSchema();
    } catch (error) {
      console.error('❌ Error getting schema:', error);
      return '';
    }
  }

  async validateQuery(query: string): Promise<boolean> {
    try {
      const graph = await this.getGraph();
      await graph.query(`EXPLAIN ${query}`);
      return true;
    } catch (error) {
      console.error('❌ Query validation failed:', error);
      return false;
    }
  }

  async query<T = any>(cypherQuery: string, parameters?: any): Promise<T[]> {
    try {
      const graph = await this.getGraph();
      const result = await graph.query(cypherQuery, parameters);
      return result as T[];
    } catch (error) {
      console.error('❌ Error executing query:', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<void> {
    try {
      const graph = await this.getGraph();
      await graph.query('MATCH (n) DETACH DELETE n');
      console.log('✅ Database cleared');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      // Wait for any pending initialization
      if (this.initializing) {
        await this.initializing;
      }

      if (this.graph) {
        await this.graph.close();
        this.graph = null;
      }
    } catch (error) {
      console.error('Error closing Neo4j connection:', error);
      this.graph = null;
    }
  }
}
