"""Regressão da limpeza de cercas de markdown do write_file.

A versão anterior tratava só ```hcl. Esta aula é a primeira a gravar YAML por
essa tool, e é onde o defeito aparecia.
"""
import pytest

from tools.file_writer import _remover_cercas

MANIFESTO = "apiVersion: apps/v1\nkind: Deployment"


class TestRemoverCercas:

    def test_cerca_yaml_nao_deixa_a_palavra_yaml_no_arquivo(self):
        """O bug: `.replace('```','')` deixava 'yaml' como primeira linha."""
        assert _remover_cercas(f"```yaml\n{MANIFESTO}\n```") == MANIFESTO

    def test_cerca_hcl_continua_funcionando(self):
        """Regressão: era o único caso coberto antes."""
        assert _remover_cercas('```hcl\nprovider "aws" {}\n```') == 'provider "aws" {}'

    @pytest.mark.parametrize("linguagem", ["yaml", "yml", "hcl", "terraform", "json", ""])
    def test_qualquer_linguagem_na_cerca(self, linguagem):
        assert _remover_cercas(f"```{linguagem}\n{MANIFESTO}\n```") == MANIFESTO

    def test_conteudo_sem_cerca_passa_intacto(self):
        assert _remover_cercas(MANIFESTO) == MANIFESTO

    def test_espacos_em_volta_sao_aparados(self):
        assert _remover_cercas(f"\n\n```yaml\n{MANIFESTO}\n```\n\n") == MANIFESTO

    def test_nao_come_crases_internas(self):
        """Cerca é só nas bordas; crases no meio do conteúdo ficam."""
        conteudo = "cmd: echo ```oi```"
        assert "```oi```" in _remover_cercas(conteudo)
