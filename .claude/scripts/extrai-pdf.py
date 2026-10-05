"""Extrai o texto de um ou mais PDFs, página a página.

O poppler não está instalado nesta máquina, então `pdftotext` e o `Read` de PDF não funcionam.
Uso: uvx --with pypdf --quiet python extrai-pdf.py <arquivo.pdf> [<arquivo.pdf> ...]
"""
import sys

from pypdf import PdfReader

for caminho in sys.argv[1:]:
    print(f"\n########## {caminho}")
    for i, pagina in enumerate(PdfReader(caminho).pages, 1):
        print(f"\n----- pág {i} -----\n{pagina.extract_text()}")
