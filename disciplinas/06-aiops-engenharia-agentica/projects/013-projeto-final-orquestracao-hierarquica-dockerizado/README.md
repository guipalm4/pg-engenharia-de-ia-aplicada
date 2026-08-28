# Exemplo 013 — Projeto Final Dockerizado: o Nexus-Bot no Kubernetes

> A crew hierárquica do Nexus-Bot empacotada como imagem Docker e implantada num cluster Minikube, ao lado de uma nuvem simulada com LocalStack e de um painel de controle em Streamlit servido pelo próprio cluster.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Até aqui a trilha inteira rodou como script no host: `uv run`, um `.venv` compartilhado, o `.env` lido do disco. Esta aula pega o mesmo pipeline agêntico e o trata como **carga de trabalho de plataforma** — um artefato imutável que sobe num cluster, com os mesmos objetos que qualquer outro serviço de produção usaria.

O caminho é o dos módulos 13.1 a 13.5. Primeiro a **dockerização**: uma imagem `python:3.12-slim` com `PYTHONPATH=/app` e um `.dockerignore` que impede o `.env` de entrar na camada. Depois o **cluster**: `minikube start --driver=docker`, a imagem construída dentro do daemon do próprio Minikube e os manifestos aplicados — `Secret` para a chave da Groq, `Deployment` para o serviço de longa duração e `Job` para a execução que tem fim. Em seguida a **nuvem simulada**: o LocalStack sobe como `Deployment` + `Service`, e o endpoint da AWS deixa de ser `localhost:4566` para virar `http://localstack:4566`, resolvido pelo DNS interno do Kubernetes. Por fim a **interface**: `ui/app.py` roda a mesma imagem com o `command` sobrescrito para `python -m streamlit run`, expondo um painel com o quadro de agentes, um explorador de buckets S3 do LocalStack e um sandbox que submete Terraform HCL à validação de políticas OPA de `tools/security_scan.py`.

O módulo 13.5 fecha com a hipótese de **soberania digital** — trocar a Groq por um Ollama rodando dentro do cluster, acessado por `http://ollama:11434`. O manifesto está em `k8s/ollama.yaml`, inteiramente comentado: o projeto continua usando a Groq como provedor, e o arquivo documenta o dimensionamento de memória que um LLM local exige do node.

Em relação à aula 012, o código dos agentes é o mesmo — o que esta acrescenta é a camada de empacotamento e implantação: `Dockerfile`, `requirements.txt`, `k8s/` e `ui/`.

## Tecnologias e Ferramentas

- [x] **Docker** — imagem `python:3.12-slim`, build em camadas com `requirements.txt` antes do código
- [x] **Minikube** (driver `docker`) — cluster Kubernetes local de nó único
- [x] **kubectl** — `Secret`, `Deployment`, `Job`, `Service` e `LoadBalancer`
- [x] **LocalStack 3.0** — S3, SQS e IAM simulados dentro do cluster (`SERVICES=s3,sqs,iam`, `ACTIVATE_PRO=0`)
- [x] **Streamlit** — painel de controle servido a partir da mesma imagem do bot
- [x] **boto3** — cliente S3 da UI apontado para o endpoint do LocalStack
- [x] **CrewAI** (`Process.hierarchical`, `manager_agent`) — a crew herdada da aula 012
- [x] **Groq** — motor de inferência; modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **Ollama** — apenas o manifesto comentado em `k8s/ollama.yaml`; nenhum Pod é criado e os agentes seguem na Groq

## Pré-requisitos

- **Docker Desktop** em execução
- **[minikube](https://minikube.sigs.k8s.io/docs/start/)** e **kubectl**
- Uma **chave de API da Groq** — no `Secret` do cluster e, para o modo local, em `projects/.env`

> O `k8s/secrets.yaml` versionado é um **placeholder**. Gere o seu com
> `echo -n "gsk_SUA_CHAVE" | base64` e substitua o valor antes de aplicar.
> `data:` em um `Secret` é **base64, não criptografia** — qualquer um que leia o
> manifesto lê a chave.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects/013-projeto-final-orquestracao-hierarquica-dockerizado
```

**1. Docker puro (módulo 13.1)**

```bash
docker build -t nexus-bot:v1 .
docker run --rm --env-file ../.env nexus-bot:v1
```

**2. Cluster e imagem (módulo 13.2)**

```bash
minikube start --driver=docker
eval $(minikube docker-env)      # aponta o shell para o daemon do Minikube
docker build -t nexus-bot:v1 .   # a imagem passa a existir dentro do cluster

kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deploy.yaml
kubectl get pods
```

O `Deployment` mantém o bot de pé; para rodar a missão como execução única, troque pelo `Job`:

```bash
kubectl delete -f k8s/deploy.yaml
kubectl apply -f k8s/job.yaml
kubectl describe job nexus-bot-run
kubectl logs -l job-name=nexus-bot-run -f
```

**3. Nuvem simulada (módulo 13.3)**

```bash
kubectl apply -f k8s/localstack.yaml
kubectl get pods -l app=localstack

kubectl exec -it deployment/localstack -- awslocal s3 mb s3://nexus-logs
kubectl exec -it deployment/localstack -- sh -c "echo 'Relatorio Nexus v2' > teste.txt && awslocal s3 cp teste.txt s3://nexus-logs"
kubectl exec -it deployment/localstack -- awslocal s3 ls

# valida a ponte entre o bot e a "AWS" pelo Service Discovery
kubectl apply -f k8s/connect-test.yaml
kubectl logs -l job-name=nexus-conn-test
```

**4. Painel de controle (módulo 13.4)**

```bash
docker build -t nexus-bot:v3 .   # tag que k8s/streamlit.yaml consome
kubectl apply -f k8s/streamlit.yaml
minikube service nexus-ui        # abre o túnel e o navegador
```

**5. LLM no cluster (módulo 13.5)**

`k8s/ollama.yaml` está comentado por padrão. Para experimentar, descomente o manifesto e siga o dimensionamento descrito no cabeçalho do arquivo:

```bash
kubectl apply -f k8s/ollama.yaml
kubectl exec deployment/ollama -- ollama pull llama3.2:3b
kubectl exec deployment/nexus-ui -- curl http://ollama:11434/api/tags
```

**Testes** (rodam no host, sem cluster e sem API key):

```bash
uv run pytest -v
```

Funcionando, o `Job` do bot escreve nos logs o `🚀 [NEXUS-BOT] INICIANDO OPERAÇÃO HIERÁRQUICA...` seguido das delegações do manager, e `minikube service nexus-ui` abre o painel Nexus com os cards dos agentes, a lista de buckets do LocalStack e o formulário de auditoria OPA.

## Estrutura do Projeto

```
013-projeto-final-orquestracao-hierarquica-dockerizado/
├── Dockerfile                    # python:3.12-slim, PYTHONPATH=/app, CMD projeto_final.py
├── .dockerignore                 # mantém .env, .venv, slides/ e tests/ fora da imagem
├── requirements.txt              # dependências do container, espelhando o uv.lock do workspace
├── projeto_final.py              # entrypoint da crew hierárquica (herdado da 012)
├── core/                         # fábricas de agentes + Groq/RateLimitAwareLLM
├── tools/                        # tools das aulas 001–006; `validate_opa_policies` alimenta a UI
├── tests/                        # testes herdados das aulas 003–005
├── ui/
│   └── app.py                    # painel Streamlit: agentes, S3 do LocalStack e sandbox OPA
├── k8s/
│   ├── secrets.yaml              # Secret nexus-secrets com GROQ_API_KEY em base64
│   ├── deploy.yaml               # Deployment do bot, com requests/limits de CPU e memória
│   ├── job.yaml                  # a mesma carga como execução única (restartPolicy: OnFailure)
│   ├── localstack.yaml           # Service + Deployment da nuvem simulada na porta 4566
│   ├── connect-test.yaml         # Job efêmero que valida a ponte bot → localstack via boto3
│   ├── streamlit.yaml            # Service LoadBalancer + Deployment da UI, com probes de health
│   └── ollama.yaml               # manifesto comentado do módulo 13.5 (LLM local)
└── slides/                       # material dos módulos 13.1 a 13.5
```

## Como funciona

```
        imagem única  nexus-bot  (Dockerfile)
                 │
   ┌─────────────┼──────────────────────────┐
   │             │                          │
   ▼             ▼                          ▼
 Job          Deployment                Deployment
nexus-bot-run  nexus-bot                 nexus-ui
   │             │                          │  command sobrescrito:
   │             │                          │  python -m streamlit run ui/app.py
CMD do Dockerfile: projeto_final.py         │
   │                                        │
   │  GROQ_API_KEY ◀── Secret nexus-secrets │
   │                                        │
   └──────► AWS_ENDPOINT_URL ───────────────┘
                     │
                     ▼
             Service  localstack:4566  ──▶  Deployment localstack (S3, SQS, IAM)

                                    Service nexus-ui (LoadBalancer :8501)
                                                  │
                                        minikube service nexus-ui
                                                  ▼
                                            navegador do host
```

1. **Uma imagem, três workloads** — o `Dockerfile` define `CMD ["python", "projeto_final.py"]`, e é isso que o `Deployment` e o `Job` executam. A UI usa a mesma imagem com o `command` do manifesto sobrescrevendo o `CMD`; nada precisa ser reconstruído para trocar de papel.
2. **Imagem sem registry** — `eval $(minikube docker-env)` redireciona o cliente Docker para o daemon do nó, e `imagePullPolicy: Never` proíbe o kubelet de procurar a tag num registry externo. As duas coisas juntas fazem o `docker build` local ser suficiente para o cluster.
3. **Segredo fora da imagem** — o `.dockerignore` barra `.env` no build e a chave chega por `env.valueFrom.secretKeyRef`, lida do `Secret` em tempo de execução. A imagem continua publicável sem carregar credencial.
4. **Endpoint por nome de Service** — `ui/app.py` e o `connect-test` leem `AWS_ENDPOINT_URL`; dentro do cluster o valor é `http://localstack:4566`, resolvido pelo DNS do Kubernetes. Fora dele, o mesmo código aponta para `http://localhost:4566`.
5. **Saúde e recursos** — a UI declara `readinessProbe`/`livenessProbe` em `/_stcore/health` e todos os Pods trazem `requests`/`limits` de CPU e memória, o que dá ao scheduler onde encaixar cada carga.

## Conceitos trabalhados

- [x] **Artefato imutável** — o agente vira imagem versionada por tag, e não script dependente do `.venv` do host
- [x] **Build em camadas** — `COPY requirements.txt` antes de `COPY . .` para que mudança de código não invalide a camada de dependências
- [x] **`.dockerignore` como controle de segredo** — o que não entra na imagem não pode vazar por ela
- [x] **`Secret` do Kubernetes** — injeção de credencial por `secretKeyRef`, com `data:` em base64
- [x] **`Deployment` vs. `Job`** — serviço de longa duração contra carga que termina, com `restartPolicy: OnFailure` e `ttlSecondsAfterFinished`
- [x] **Service Discovery** — o nome do `Service` como hostname estável entre Pods
- [x] **`imagePullPolicy: Never`** — usar a imagem do daemon local em vez de buscar num registry
- [x] **`requests` e `limits`** — reserva para o agendamento e teto de cgroup para o container
- [x] **Probes de saúde** — `readinessProbe` e `livenessProbe` decidindo quando o Pod recebe tráfego e quando é reiniciado
- [x] **`LoadBalancer` no Minikube** — exposto ao host por `minikube service`, que abre o túnel

## Aprendizados

- [x] Um pipeline agêntico que termina é um `Job`, não um `Deployment`: o controller de `Deployment` interpreta o processo concluído como falha e reinicia o Pod indefinidamente.
- [x] `eval $(minikube docker-env)` com `imagePullPolicy: Never` substitui um registry inteiro no laboratório — a imagem nasce dentro do nó e o kubelet é proibido de procurá-la fora.
- [x] Trocar `localhost` pelo nome do `Service` é a única mudança que o código de nuvem precisa para sair do laptop e entrar no cluster, o que faz do endpoint uma variável de ambiente e não uma constante.
- [x] O `data:` de um `Secret` é base64, não criptografia: versionar o manifesto com a chave preenchida equivale a versionar a chave em texto puro.
- [x] Quando o nó do Kubernetes é ele próprio um container, o `limits.memory` do Pod não é o teto real — um LLM local pode ser morto pelo cgroup do Minikube com o Pod seguindo `Running` e `RESTARTS 0`.

## Referências

- [Docker Docs — Best practices for writing Dockerfiles](https://docs.docker.com/build/building/best-practices/)
- [Minikube — Docker driver e `minikube docker-env`](https://minikube.sigs.k8s.io/docs/handbook/pushing/)
- [Kubernetes Docs — Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Kubernetes Docs — Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [Kubernetes Docs — DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/)
- [LocalStack Docs — Kubernetes](https://docs.localstack.cloud/getting-started/installation/#localstack-in-kubernetes)
- [Streamlit Docs — Deploy with Docker](https://docs.streamlit.io/deploy/tutorials/docker)
- [Ollama — Docker & Kubernetes](https://github.com/ollama/ollama/blob/main/docs/docker.md)
