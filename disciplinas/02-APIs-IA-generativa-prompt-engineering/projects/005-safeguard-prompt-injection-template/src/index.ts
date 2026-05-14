import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { buildGraph } from './graph/factory.ts';
import { getUser } from './config.ts';
import { readFileSync } from 'fs';

function parseArgs(): { username?: string; unsafe: boolean; message?: string; promptPath?: string } {
  const args = process.argv.slice(2);
  const userIndex = args.indexOf('--user');
  const messageIndex = args.indexOf('--message');
  const unsafe = args.includes('--unsafe');
  const promptPathIndex = args.indexOf('--prompt-path');
  let promptPath: string | undefined;
  if (promptPathIndex !== -1 && args[promptPathIndex + 1]) {
    promptPath = args[promptPathIndex + 1];
  }
  let username: string | undefined;
  if (userIndex !== -1 && args[userIndex + 1]) {
    username = args[userIndex + 1];
  }

  let message: string | undefined;
  if (messageIndex !== -1 && args[messageIndex + 1]) {
    message = args[messageIndex + 1];
  }

  return { username, unsafe, message, promptPath };
}

/**
 * Display security banner
 */
function displayBanner(username: string, role: string, guardrailsEnabled: boolean) {
  console.log('═'.repeat(70));
  console.log('  🔒 Guardrails & Prompt Injection Demo');
  console.log('═'.repeat(70));
  console.log();
  console.log(`👤 User: ${username} (${role})`);
  console.log(`🛡️  Guardrails: ${guardrailsEnabled ? '✅ ENABLED (Safe)' : '❌ DISABLED (Unsafe - Vulnerable!)'}`);
  console.log();

  console.log('─'.repeat(70));
  console.log();
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  try {
    // Parse arguments
    const { username, unsafe, message, promptPath } = parseArgs();

    // Validate required arguments
    if (!username || (!message && !promptPath)) {
      console.error('❌ Error: --user and (--message or --prompt-path) flags are required');
      console.error('Usage: npm run chat -- --user <username> --message "your message" [--unsafe]');
      console.error('Available users: erickwendel (admin), ananeri (member)');
      process.exit(1);
    }
    const prompt = message ?? readFileSync(promptPath!, 'utf-8')
    const user = getUser(username);
    if (!user) {
      console.error(`❌ Error: User "${username}" not found`);
      console.error('Available users: erickwendel (admin), ananeri (member)');
      process.exit(1);
    }

    // Determine guardrails state (enabled by default, disabled with --unsafe)
    const guardrailsEnabled = !unsafe;

    // Build graph
    const graph = await buildGraph();
    // Display banner
    displayBanner(user.displayName, user.role, guardrailsEnabled);
    console.log(`📋 Your permissions: ${user.permissions.length > 0 ? user.permissions.join(', ') : 'None'}`);
    console.log();
    console.log(`You: ${prompt}`);
    console.log();

    // Invoke graph with message
    const result = await graph.invoke({
      user,
      guardrailsEnabled,
      messages: [new HumanMessage(prompt)],
    });

    const messages = result.messages as BaseMessage[];
    const lastMessage = messages[messages.length - 1];
    console.log(`🤖 Assistant: ${lastMessage.content}`);
    console.log();

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the CLI
main();
