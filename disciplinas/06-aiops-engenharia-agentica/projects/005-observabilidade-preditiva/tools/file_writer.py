import re

from crewai.tools import tool

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
    with open(filename, "w", encoding="utf-8") as file:
        file.write(_remover_cercas(content))
    return f"✅ File '{filename}' saved successfully."
