# Prompt Chaining Article Generator

Demonstration of **prompt engineering** with LangChain using structured outputs and conditional edges to generate high-quality technical articles through multiple AI agents reviewing each other.

## 🎯 Goals

This project exemplifies:
- **Structured Outputs**: Using Zod schemas to prevent hallucinations
- **Prompt Chaining**: Three-stage pipeline with quality feedback loop
- **Minimal Code**: Let AI agents review each other instead of complex logic
- **Real API Testing**: Integration tests with actual OpenRouter calls
- **Quality Assurance**: Automatic retry until score ≥ 8/10

## Features

- 🎨 **3-Stage Pipeline**: Plan → Draft → Review (with quality loop)
- 📊 **Structured Validation**: Zod schemas at every step
- 🔄 **Conditional Edges**: Retry review until quality threshold met
- 📝 **Template System**: JSON prompts with variable interpolation
- 🧪 **Real API Tests**: No mocks, actual LLM calls
- 📁 **Organized Outputs**: `outputs/timestamp-topic/output.md`

## Architecture

### LangGraph Workflow

```
START → plan → draft → review ⟲ (if score < 8) → END
         ↓       ↓       ↓
      outline  article  final + scores
```

### Project Structure

```
src/
  ├── config.ts                 # Configuration with env vars
  ├── index.ts                  # CLI entry point
  ├── graph/
  │   ├── graph.ts             # StateGraph with conditional edges
  │   ├── factory.ts           # Graph builder
  │   └── nodes/
  │       ├── planNode.ts      # Outline generation (Zod validated)
  │       ├── draftNode.ts     # Article drafting
  │       └── reviewNode.ts    # Quality scoring & improvement
  ├── services/
  │   └── openrouter-service.ts  # LLM client
  └── utils/
      └── prompt-loader.ts     # Template loading & interpolation
prompts/
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
