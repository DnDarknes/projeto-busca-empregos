# API de Busca de Empregos - CONEXÃO DE TALENTOS

Esta é uma API para uma plataforma de busca de empregos, onde os usuários podem se cadastrar, criar vagas, se candidatar a elas e gerenciar suas informações.

## Pré-requisitos

Antes de começar, certifique-se de que você tem o seguinte instalado:

- Node.js
- MongoDB Atlas (ou uma instância local do MongoDB)

## Instalação

1. Clone o repositório:
   git clone https://github.com/seuusuario/nome-do-repositorio.git
   cd nome-do-repositorio

2.Instale as dependências:
  npm install

3.Crie um arquivo .env na raiz do projeto e adicione as variáveis necessárias:
  MONGODB_URI="sua_string_de_conexao_mongodb"
  JWT_SECRET="sua_chave_secreta"
  PORT=5000
  
Notas sobre as variáveis:
MONGODB_URI: A URL de conexão com o MongoDB Atlas.
JWT_SECRET: Uma chave secreta utilizada para assinar tokens JWT.
PORT: A porta onde a API irá rodar.

4.Executando a API
  npm run dev
