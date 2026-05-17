# 🪙 Central Cripto (ou o nome em português que você escolheu)

Uma aplicação Full-Stack moderna para monitoramento e rastreamento de criptomoedas em tempo real. O sistema consome dados do mercado financeiro digital e permite aos usuários gerenciar de forma persistente uma lista de moedas favoritas.

---

## 🚀 Tecnologias Utilizadas

### Front-end (React)
* **React.js** + **Vite** (Construção de interface rápida, moderna e SPA)
* **React Router Dom** (Gerenciamento de rotas e navegação entre Home e Favoritos)
* **Axios** (Consumo assíncrono das rotas da nossa API própria)
* **React Toastify** (Notificações animadas com barras de progresso customizadas para ações de sucesso)
* **CSS3** (Estilização dark moderna, painel de filtros elegante e layout responsivo)

### Back-end & Banco de Dados (Node.js)
* **Node.js** + **Express** (Criação da API RESTful e gerenciamento de endpoints)
* **MongoDB Atlas** (Banco de dados NoSQL em nuvem para salvar os favoritos)
* **Mongoose** (Modelagem de dados e conexão direta com o banco de dados)
* **Cors** (Segurança para permitir a comunicação entre o Front-end e o Back-end)
* **Dotenv** (Proteção de chaves privadas através de variáveis de ambiente)

---

## ⚙️ Arquitetura e Funcionalidades

* **Proxy de API Seguro:** O Front-end não faz requisições diretas para serviços externos nem expõe chaves. Ele conversa com o nosso Back-end, que protege a credencial da API de cripto de forma oculta no servidor.
* **Persistência Real com MongoDB:** Chega de `localStorage`! Agora, quando o usuário clica na estrela para favoritar, os dados são salvos de forma definitiva em um cluster na nuvem (MongoDB Atlas).
* **Painel de Controle e Ordenação:** Filtros avançados no Front-end que permitem ordenar as moedas por preço, relevância de mercado (Market Cap) e ordem alfabética.
* **Interface Premium:** Notificações flutuantes integradas ao tema dark com barras de progresso que esvaziam dinamicamente em um degradê roxo e verde.

---

