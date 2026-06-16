# DialogMaker

Editor visual de diálogos de NPCs para jogos, em estrutura de árvore/fluxograma.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- React Flow (canvas visual de árvore)
- Zustand (estado global, com persistência em `localStorage`)

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Na primeira execução, um **projeto de exemplo** é carregado automaticamente, contendo:

- 2 personagens (Guarda e Jogador)
- uma fala inicial
- uma escolha múltipla
- um input pedindo o nome do jogador (`{{playerName}}`)
- uma fala usando a variável `{{playerName}}`
- uma decisão booleana (`hasKey == true`)
- blocos de fim

## Layout

- **Canvas (80%)**: árvore de diálogo em React Flow. Arraste blocos, conecte saídas a entradas, use a paleta no canto superior esquerdo para adicionar novos blocos.
- **Sidebar direita (20%)**: edição do bloco selecionado. Sem seleção, mostra informações da cena, personagens e acesso às configurações.

## Tipos de bloco

| Tipo | Descrição |
|---|---|
| Fala | Personagem + texto + próximo bloco |
| Múltipla Escolha | Pergunta + lista de opções, cada uma com seu próximo bloco |
| Decisão Booleana | Variável + operador + valor esperado → caminhos verdadeiro/falso |
| Input do Jogador | Texto + variável de destino + placeholder + próximo bloco |
| Ação | Tipo (missão, item, loja, variável, encerrar) + valor + próximo bloco |
| Fim | Texto final opcional + tipo de encerramento |

## Variáveis

Use `{{nomeDaVariavel}}` em qualquer texto de fala/escolha/fim para exibir o valor salvo por um bloco de **Input** ou **Ação (alterar variável)**.

## Modo Preview

Botão "▶️ Preview" na barra superior. Simula a conversa a partir do bloco inicial, resolvendo variáveis, decisões booleanas e ações automaticamente, e pedindo interação do jogador em escolhas e inputs. Possui proteção contra loops infinitos e botão de reiniciar.

## Importar / Exportar

- **Exportar JSON**: gera um arquivo `.json` com todo o projeto (cena, personagens, blocos, conexões, variáveis). Bloqueado se não houver bloco inicial; avisa sobre blocos desconectados, escolhas sem destino, decisões incompletas e variáveis não declaradas.
- **Importar JSON**: carrega um projeto exportado anteriormente.

## Salvamento

O projeto é salvo automaticamente no `localStorage` do navegador a cada alteração.
