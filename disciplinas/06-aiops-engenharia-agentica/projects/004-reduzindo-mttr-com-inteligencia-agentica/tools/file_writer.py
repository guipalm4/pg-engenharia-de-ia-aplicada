import os
import re

from crewai.tools import tool

# O nome do arquivo vem do LLM (a task só descreve em texto o filename
# esperado, nunca fixa o parâmetro no código). Sem ancorar a escrita a um
# diretório fixo, um "../algo.yaml" devolvido pelo modelo grava fora do
# projeto — foi o que aconteceu com o gpt-oss-20b (free tier da Groq).
_OUTPUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# O LLM costuma devolver o código embrulhado numa cerca de markdown. A versão
# anterior desta tool fazia `.replace("```hcl", "").replace("```", "")`, o que
# funcionava só para HCL: com ```yaml sobrava a palavra `yaml` como primeira
# linha do arquivo, corrompendo o manifesto. Esta aula é a primeira a gravar
# YAML por aqui, então a limpeza passou a ser agnóstica de linguagem.
# A cerca de fechamento precisa estar em linha própria: sem isso, um conteúdo
# que termina em crases inline (`cmd: echo ```oi```) perderia parte do texto.
_CERCA_ABERTURA = re.compile(r"^```[^\n]*\n")
_CERCA_FECHAMENTO = re.compile(r"\n```[ \t]*$")


def _remover_cercas(content: str) -> str:
    """Tira a cerca de markdown do conteúdo, qualquer que seja a linguagem."""
    texto = content.strip()
    texto = _CERCA_ABERTURA.sub("", texto)
    texto = _CERCA_FECHAMENTO.sub("", texto)
    return texto.strip()


@tool("write_file")
def write_file(content: str, filename: str = "main.tf") -> str:
    """Saves the generated code to a physical file on disk."""
    caminho = os.path.join(_OUTPUT_DIR, os.path.basename(filename))
    with open(caminho, "w", encoding="utf-8") as file:
        file.write(_remover_cercas(content))
    return f"✅ File '{caminho}' saved successfully."
