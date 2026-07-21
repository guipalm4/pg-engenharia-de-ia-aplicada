Responsividade: Temos dois ajustes para mobile (telas menores que 600px). 
1) No @pix-history.component.css, o layout horizontal da lista está espremendo os valores. Mude o item da lista para coluna (flex-direction: column). 
2) O menu lateral (@app.component.ts, .html e .css) está esmagando a tela. Transforme-o em um menu colapsável. Crie um Signal 'isMenuOpen' no TypeScript. No mobile, esconda o menu lateral e exiba um botão de 'menu hambúrguer' do @material-symbols-outlined no topo para abrir/fechar a navegação.


Temos um problema de acessibilidade no nosso recibo de Pix. O texto está com uma cor escura sobre o fundo azul noturno, impossibilitando a leitura. Por favor, corrija o CSS do recibo, aplicando a nossa variável var(--color-text-light) para garantir o contraste e a legibilidade.