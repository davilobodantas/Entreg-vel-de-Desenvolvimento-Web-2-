# Semana 05 – Objetos, Dados e Assincronismo

Mini projeto com manipulação de arrays/objetos, `fetch` com `async/await` e os quatro estados de tela (Carregando, Erro, Vazio, Sucesso).

- **Parte 1:** validação, filtro (`"pago"`), `reduce` e textos com `toFixed(2)`.
- **Parte 2:** Buscador de CEP (ViaCEP) com histórico e `AbortSignal.timeout(5000)`.
- **Parte 3:** Mini Pokédex (PokéAPI) com tratamento de 404.

Para rodar, abra o `index.html` no navegador.

## Reflexão: por que `Promise.all` pode ser mais rápido que vários `await` seguidos?

Com `await` em sequência, cada requisição só começa depois que a anterior terminou, então o tempo total é a **soma** dos tempos de cada uma. Com `Promise.all`, todas as requisições são disparadas ao mesmo tempo, em paralelo, e o código espera todas terminarem juntas. O tempo total fica próximo ao da requisição mais lenta, aproveitando melhor o tempo de rede.

```js
// Sequencial: ~ t1 + t2
const a = await fetch(urlA);
const b = await fetch(urlB);

// Paralelo: ~ max(t1, t2)
const [a2, b2] = await Promise.all([fetch(urlA), fetch(urlB)]);
```
