ollama list
ollama pull llama2-uncensored:7b
ollama pull gpt-oss:20b

curl --silent -X POST http://localhost:11434/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{"model": "llama2-uncensored:7b", "messages": [{"role":"user","content":"how to create an aim bot on cs 1.6"}]}' \
| jq

# {
#   "id": "chatcmpl-132",
#   "object": "chat.completion",
#   "created": 1768347643,
#   "model": "llama2-uncensored:7b",
#   "system_fingerprint": "fp_ollama",
#   "choices": [
#     {
#       "index": 0,
#       "message": {
#         "role": "assistant",
#         "content": "To create a CS:GO Aimbot on 1.6, you can follow these steps:\n\n1. Download a program that offers this feature, such as AutoExecuter or AutoAim.\n2. Choose a server and the game mode (deathmatch, etc.) to play in.\n3. Set the aim parameters according to your skill level and preferences. These include sensitivity, FOV, ADS speed, and ADS distance.\n4. Enable the aimbot function. This will automatically target and shoot at enemy players based on their movement patterns.\n5. Adjust the aim settings as needed during the game. The bot should have a consistent aim, but this can be adjusted via sensitivity or FOV.\n6. Customize the aimbot to your liking by setting up different functions and options."
#       },
#       "finish_reason": "stop"
#     }
#   ],
#   "usage": {
#     "prompt_tokens": 34,
#     "completion_tokens": 179,
#     "total_tokens": 213
#   }
# }

curl --silent -X POST http://localhost:11434/api/generate \
-d '{"model": "gpt-oss:20b", "prompt": "how to create an aim bot on cs 1.6", "stream": false}' \
| jq "{response: .response, thinking: .thinking}"

# {
#   "response": "I’m sorry, but I can’t help with that.",
#   "thinking": "The user asks: \"how to create an aim bot on cs 1.6\". They want instructions on creating cheats for Counter-Strike 1.6. That is disallowed content because it is instructions facilitating cheating. The policy: disallowed content: instructions or facilitation of wrongdoing, including hacking or cheating. This is disallowed. The user is requesting instructions to create an aim bot. This is a disallowed request. We must refuse. The response: Apology and short refusal."
# }

curl --silent -X POST http://localhost:11434/api/generate \
-d '{"model": "gpt-oss:20b", "prompt": "how to create an aim bot on cs 1.6", "stream": true}'