source .env

API_URL="https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME="My Example"

NLP_MODEL="google/gemma-3-27b-it:free"

curl --silent -X POST "$API_URL" \
-H "Content-Type: applicaton/json" \
-H "Authorization: Bearer $OPENROUTER_API_KEY" \
-H "HTTP-Referer: $OPENROUTER_SITE_URL" \
-H "X-Title: $OPENROUTER_SITE_NAME" \
-d '
    {
        "model": '"'$NLP_MODEL'"',
        "messages": [
            {
                "role":"user",
                "content":"Me conte uma curiosidade sobre LLMs"
            }
        ],
        "temperature": 0.3,
        "max_tokens": 1000
}' | jq


# {
#   "id": "gen-1768350223-TGhNha2xp2OhQfHxwTkA",
#   "provider": "Google AI Studio",
#   "model": "google/gemma-3-27b-it:free",
#   "object": "chat.completion",
#   "created": 1768350223,
#   "choices": [
#     {
#       "logprobs": null,
#       "finish_reason": "stop",
#       "native_finish_reason": "STOP",
#       "index": 0,
#       "message": {
#         "role": "assistant",
#         "content": "Uma curiosidade fascinante sobre os LLMs (Large Language Models, ou Grandes Modelos de Linguagem) é que eles **não \"pensam\" ou \"entendem\" como humanos**. Apesar de serem capazes de gerar textos incrivelmente coerentes e responder a perguntas de forma convincente, eles funcionam essencialmente como **máquinas de predição de texto**.\n\nO que acontece é que LLMs são treinados em quantidades massivas de dados textuais. Durante esse treinamento, eles aprendem a identificar padrões estatísticos na linguagem: quais palavras tendem a aparecer juntas, quais frases seguem outras, etc. \n\nQuando você faz uma pergunta a um LLM, ele usa esses padrões para **prever qual sequência de palavras é mais provável que seja uma resposta adequada**, com base no que ele \"viu\" nos dados de treinamento.\n\nEm outras palavras, eles são mestres em **imitar a linguagem humana**, mas não possuem consciência, crenças ou compreensão real do mundo. É como um papagaio que aprende a repetir frases, mas não sabe o que elas significam.\n\nEssa característica levanta questões importantes sobre a natureza da inteligência e os limites da IA, e é um tópico de debate constante entre pesquisadores e especialistas.\n",
#         "refusal": null,
#         "reasoning": null,
#         "annotations": []
#       }
#     }
#   ],
#   "usage": {
#     "prompt_tokens": 9,
#     "completion_tokens": 0,
#     "total_tokens": 9,
#     "cost": 0,
#     "is_byok": false,
#     "prompt_tokens_details": {
#       "cached_tokens": 0,
#       "audio_tokens": 0,
#       "video_tokens": 0
#     },
#     "cost_details": {
#       "upstream_inference_cost": null,
#       "upstream_inference_prompt_cost": 0,
#       "upstream_inference_completions_cost": 0
#     },
#     "completion_tokens_details": {
#       "reasoning_tokens": 0,
#       "image_tokens": 0
#     }
#   }
# }