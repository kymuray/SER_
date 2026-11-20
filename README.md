SER 

Descrição
O SER é uma aplicação web criada para facilitar o acesso dos alunos aos atendimentos de escuta e acolhimento do Programa SER. Pelo sistema, os estudantes podem consultar horários disponíveis e agendar seus atendimentos, enquanto a responsável consegue organizar a agenda e acompanhar os registros.

Objetivo
Facilitar o agendamento dos atendimentos, tornando o processo mais simples e organizado tanto para os alunos quanto para a responsável pelo Programa SER.

Tecnologias Utilizadas
Frontend
* React
* TypeScript
* Vite
* React Router
* HTML e CSS
Backend e banco de dados
* Firebase Authentication
* Firebase Firestore
Desenvolvimento e hospedagem
* Node.js
* npm
* Git e GitHub
* Vercel

Funcionalidades
Para os alunos
* Página inicial com apresentação do Programa SER.
* Cadastro com nome completo, CPF e senha.
* Login com CPF e senha.
* Consulta de datas e horários disponíveis.
* Agendamento de atendimentos de 30 minutos.
* Confirmação dos agendamentos.
* Consulta, cancelamento e reagendamento.
* Perfil com dados cadastrais.
Para a responsável
* Login exclusivo com e-mail e senha.
* Acesso à área administrativa.
* Visualização da agenda por data.
* Cadastro e gerenciamento de horários disponíveis.
* Consulta dos agendamentos.
* Registro de presença e ausência.
* Registro de resumo dos atendimentos.
* Marcação de atendimentos como concluídos.
* Consulta ao histórico de atendimentos.

Estrutura do Projeto
SER_/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── home/
│   │   └── layout/
│   ├── contexts/
│   ├── pages/
│   │   ├── Agendar/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── MeusAgendamentos/
│   │   ├── Profile/
│   │   ├── Responsavel/
│   │   └── StudentAuth/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── firestore.rules
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
A pasta pages reúne as telas do sistema; components contém os componentes reutilizáveis; contexts organiza a autenticação; services reúne as operações com o Firebase; e styles contém os arquivos de estilo.

Banco de Dados
O SER utiliza o Firebase Authentication para gerenciar o acesso dos usuários e o Cloud Firestore para armazenar os dados do sistema, como alunos, agendamentos, horários disponíveis e registros de atendimento.
O acesso às informações é controlado por regras de segurança, considerando as permissões de alunos e responsável.

Deploy
Aplicação Web — Vercel
https://ser-sigma.vercel.app/

Integrantes
* Julia Bandeira Freitas da Silva
* Kyara Murayama de Oliveira
* Laila Camile Gonçalves de Menezes
* Laura Santos Marques

Sobre o Projeto
O SER foi desenvolvido como parte do projeto de Computação em Nuvem, com a proposta de facilitar o acesso dos estudantes aos atendimentos de escuta e acolhimento, reunindo agendamentos e organização da agenda em uma única plataforma.

Links Importantes
* Repositório GitHub: https://github.com/kymuray/SER_
* Sistema publicado: https://ser-sigma.vercel.app/
* Firebase: https://firestore.googleapis.com/v1/projects/serr-ef0b4/databases/(default)/documents/alunos


