# Song Recommender with LangGraph Memory

Demonstration of **LangGraph memory persistence** using conversational AI to recommend music based on user preferences. This project showcases how to build stateful, multi-turn conversations where the AI remembers context across messages.

## 🎯 Goals

This project exemplifies:
- **Memory Persistence**: Using LangGraph's `MemorySaver` for conversation history
- **Thread-based Sessions**: Separate conversation contexts per user/session
- **Conversational AI**: Natural dialogue that asks questions and builds context
- **Minimal Architecture**: Simple single-node graph focusing on memory
- **Real LLM Integration**: Live testing with actual OpenRouter API calls

## Features

- 🎵 **Smart Recommendations**: AI suggests songs based on learned preferences
- 💬 **Conversational Memory**: Remembers user name, favorite bands, genres, etc.
- 🔄 **Thread Isolation**: Different users/sessions maintain separate memories
- 📝 **Dynamic Learning**: Updates understanding as conversation progresses
- 🧪 **Integration Tests**: Real API tests verify memory persistence

## Architecture

### LangGraph Workflow

https://docs.langchain.com/oss/javascript/integrations/vectorstores/libsql
https://docs.langchain.com/oss/javascript/langgraph/persistence#memory-store

```
START → chat (with memory) → END
         ↓
   Checkpointer persists state
   across invocations
```

### Project Structure

```
src/
  ├── config.ts                     # Configuration with memory settings
  ├── index.ts                      # Interactive CLI chat interface
  ├── graph/
  │   ├── graph.ts                  # Simple graph with one chat node
  │   └── factory.ts                # Graph builder with memory service
  ├── services/
  │   ├── memory-service.ts         # MemorySaver initialization
  │   └── openrouter-service.ts     # LLM client with chat method
  └── utils/
      └── prompt-loader.ts          # Template loading
prompts/
  └── system.txt                    # System prompt for song recommender
tests/
  └── chat-memory.test.ts           # Integration tests with real LLM
```

## How Memory Works

This project demonstrates **two types of memory**:

### 1. Conversation Memory (MemorySaver)
- **Thread ID**: Each conversation has a unique `thread_id` for isolation
- **In-Memory Storage**: Conversation history stored in memory during the session
- **Automatic Replay**: Previous messages included when invoking with same `thread_id`

### 2. User Preferences (LibSQL Vector Store)
- **Vector Embeddings**: User preferences stored as embedded documents using OpenAI embeddings
- **Semantic Search**: Uses `@libsql/client` with vector similarity for intelligent matching
- **Persistent Storage**: Preferences persisted to SQLite database across restarts
- **Document Structure**: Each preference stored with rich metadata (name, bands, genres, age, mood)

**Why Vector Store for Preferences?**
- Better semantic understanding of user taste
- Can find similar music preferences across users
- Enables more intelligent recommendations based on embedded meaning
- Scalable approach for large user bases

This demonstrates production-ready patterns:
- Conversation state for short-term context
- Vector store for long-term, searchable user data
- Hybrid memory approach for AI applications

```typescript
// First message
await graph.invoke(
  { messages: [new HumanMessage("Hi! I'm Alex")] },
  { configurable: { thread_id: "user-123" } }
);

// Second message - AI remembers "Alex" from previous message
await graph.invoke(
  { messages: [new HumanMessage("Recommend some songs")] },
  { configurable: { thread_id: "user-123" } }
);
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (`.env`):
   ```bash
   OPENROUTER_API_KEY=your_openrouter_key_here
   OPENROUTER_HTTP_REFERER=http://localhost:3000
   OPENROUTER_X_TITLE=Song Recommender
   OPENAI_API_KEY=your_openai_key_here  # For embeddings
   ```

3. **Run the chat interface**:
   ```bash
   npm run chat
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Example Conversation

```
You: Hi!
AI: Hello there! It's great to see you! What's your name, and what kind of music do you enjoy?

You: My name is Alex and I love rock music, especially Foo Fighters.
AI: Nice to meet you, Alex! Foo Fighters are amazing! Do you have any other favorite bands or specific rock subgenres you enjoy?

You: Can you recommend some songs for me?
AI: Absolutely, Alex! Since you love Foo Fighters, you might enjoy "Everlong" for its powerful energy...
```

## Key Learnings

- **Stateful Conversations**: Memory enables natural multi-turn dialogues
- **Thread Management**: Separate threads isolate different users/sessions
- **Simple Architecture**: One node + memory checkpointer is all you need
- **Testing Strategy**: Integration tests with real LLM verify behavior

## Next Steps

- Add SQLite/PostgreSQL persistence for production use
- Implement conversation summarization for long histories
- Add structured data extraction to store preferences explicitly
- Build web interface with session management
  └── v1/
      ├── plan.json           # Outline generation prompt
      ├── draft.json          # Section writing prompt
      └── review.json         # Quality review prompt
tests/
  └── article-generator.test.ts  # Real API integration test
```
  │   ├── graph.ts          # StateGraph definition with co-located types
  │   ├── factory.ts        # Graph creation factory
  │   └── nodes/            # LangGraph nodes (workflow steps)
  │       ├── outline.node.ts    # Generate article structure + parsing
  │       ├── research.node.ts   # Research sections in parallel
  │       ├── write.node.ts      # Write sections + assembly
  │       └── review.node.ts     # Polish final article
  ├── services/
  │   └── openrouter-service.ts  # OpenRouter SDK wrapper (implements LLMClient)
  └── utils/
      └── prompt-loader.ts  # Load prompts from template files

prompts/                    # Prompt templates with variables
  ├── outline.txt           # Section structure generation
  ├── research.txt          # Research individual sections
  ├── write-section.txt     # Write section content
  └── review.txt            # Review and improve

tests/
  └── article-generator.test.ts  # Graph workflow tests
```

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
# OpenRouter Configuration (required)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_HTTP_REFERER=https://your-site.com
OPENROUTER_X_TITLE=Article Generator

# Model Configuration
MODEL_TIMEOUT=60000
MODEL_MAX_RETRIES=3

# Article Configuration
MIN_SECTIONS=3
MAX_SECTIONS=8
TARGET_WORDS_PER_SECTION=200

# Logging
LOG_LEVEL=info
```

## Usage

### Generate Article

```bash
# Using topic flag
npm run generate -- --topic "Test-Driven Development in TypeScript"

# With custom output path
npm run generate -- --topic "Docker Best Practices" --output my-article.md
```

### Run Tests

```bash
npm test
```

## How It Works

### 1. Outline Node

Generates article structure:
- Title
- Introduction
- Sections with key points
- Conclusion

**State Updates**: `outline`, `currentStep`

### 2. Research Node

Researches all sections **in parallel**:
```typescript
const researchPromises = sections.map(section =>
  llmClient.generate(researchPrompt)
);
const results = await Promise.all(researchPromises);
```

**State Updates**: `researchResults`, `currentStep`

### 3. Write Sections Node

Writes each section **sequentially** using research:
- Loops through sections
- Uses section research + key points
- Calculates word count
- Builds draft article

**State Updates**: `sections`, `draftArticle`, `totalWords`, `currentStep`

### 4. Review Node

Reviews and improves final article:
- Checks tone and style
- Improves transitions
- Ensures consistency
- Polishes language

**State Updates**: `finalArticle`, `currentStep`

## LangGraph Concepts

### StateGraph

Defines the workflow with typed state:
```typescript
const ArticleStateAnnotation = Annotation.Root({
  topic: Annotation<string>,
  outline: Annotation<any>,
  researchResults: Annotation<string[]>,
  sections: Annotation<any[]>,
  draftArticle: Annotation<string>,
  finalArticle: Annotation<string>,
  totalWords: Annotation<number>,
  currentStep: Annotation<string>,
});
```

### Node Functions

Each node receives state and returns partial state updates:
```typescript
export const createOutlineNode = (llmClient: LLMClient) => {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const outline = await generateOutline(state.topic);
    return {
      outline,
      currentStep: 'outline_completed',
    };
  };
};
```

### Graph Construction

```typescript
const workflow = new StateGraph({ stateSchema: ArticleStateAnnotation })
  .addNode('generateOutline', outlineNode)
  .addNode('conductResearch', researchNode)
  .addNode('writeSections', writeSectionsNode)
  .addNode('reviewArticle', reviewNode)
  .addEdge(START, 'generateOutline')
  .addEdge('generateOutline', 'conductResearch')
  .addEdge('conductResearch', 'writeSections')
  .addEdge('writeSections', 'reviewArticle')
  .addEdge('reviewArticle', END);

return workflow.compile();
```

## Testing Strategy

Uses **MockLLMClient** with deterministic responses:

```typescript
class MockLLMClient implements LLMClient {
  responses: Map<string, string>;

  async generate(prompt: string): Promise<string> {
    if (prompt.includes('outline')) return mockOutline;
    if (prompt.includes('Research')) return mockResearch;
    if (prompt.includes('Write')) return mockSection;
    if (prompt.includes('Review')) return mockReview;
  }
}
```

Tests verify:
- ✅ Complete article generation through graph
- ✅ Multiple LLM calls in chain
- ✅ Correct state flow through all nodes
- ✅ Word count calculation

## Key Patterns

### Single Responsibility Principle

- **Nodes**: One transformation per node
- **Services**: LLM interactions only
- **Utils**: Reusable helpers (prompt loading)
- **Config**: Environment management

### Dependency Injection

Nodes receive dependencies as parameters:
```typescript
createOutlineNode(llmClient: LLMClient, config: ArticleConfig)
```

### Immutable State

Nodes return new state objects, never mutate:
```typescript
return {
  ...state,
  outline: newOutline,
};
```

### Prompt Templates

Prompts stored in files, not code:
```typescript
const prompt = await PromptLoader.load('outline', {
  topic: state.topic,
  minSections: config.minSections,
  maxSections: config.maxSections,
});
```

## Learning Objectives

1. **Prompt Chaining**: Build complex outputs from simple steps
2. **LangGraph**: State management in LLM workflows
3. **Parallel Execution**: Research sections concurrently
4. **Sequential Processing**: Write sections in order
5. **State Transitions**: Track progress through workflow
6. **Testing**: Mock LLMs for deterministic tests

## Node Version

Requires Node.js >= 22.0.0 for TypeScript strip-types support.

## License

MIT
