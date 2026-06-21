# Prompt para gerar o Relatório de Sprint Final (PDF)

Cole este prompt no Claude para gerar o relatório formatado:

---

**PROMPT:**

Gere um relatório acadêmico em formato de documento (para PDF) seguindo EXATAMENTE a estrutura abaixo. O projeto é uma plataforma web de adoção responsável de pets chamada "Adoção", desenvolvida na disciplina Projeto de Software II da FURB (Universidade Regional de Blumenau), Professor André Felipe Bürger.

**Contexto do Projeto:**
- Plataforma SaaS de adoção de animais com 4 perfis: Adotante, Abrigo/ONG, Voluntário, Admin
- Stack: Backend Python (FastAPI + SQLAlchemy + PostgreSQL), Frontend TypeScript (Angular 17 standalone components)
- Docker Compose para orquestração
- Tema social: conectar adotantes, abrigos e pets resgatados para adoções seguras e compatíveis

**Equipe:** [PREENCHER COM NOMES DOS INTEGRANTES]

---

## SEÇÃO 1.1 — Histórias planejadas para a Versão 03

Liste as seguintes histórias de usuário que foram comprometidas para a V03:

1. Como cuidador, quero cadastrar pets com personalidade obrigatória e upload de fotos no momento do cadastro, para que o perfil do animal já fique completo desde o início.
2. Como cuidador, quero preencher informações de saúde (vacinação, peso, necessidades especiais) e temperamento (7 escalas de 1-5) ao cadastrar o pet, para que adotantes tenham dados completos.
3. Como cuidador, quero visualizar e gerenciar meus pets em um painel com filtros por status e espécie, para ter controle do inventário de animais.
4. Como cuidador, quero gerenciar candidaturas de adoção em um fluxo de estágios (Nova → Triagem → Entrevista → Aprovada), para acompanhar o processo de forma organizada.
5. Como cuidador, quero dar baixa em animais (adotado, transferido, devolvido, falecido, fugiu) para manter o inventário atualizado.
6. Como cuidador, quero aprovar/rejeitar voluntários e avaliá-los com estrelas (1-5), para proteger os animais.
7. Como adotante, quero visualizar minhas candidaturas com barra de progresso real (Enviada → Análise → Entrevista → Aprovada), para acompanhar o status.
8. Como adotante, quero contestar rejeições enviando um texto breve, ou descartar candidaturas rejeitadas.
9. Como adotante, quero preencher meu perfil de personalidade e preferências de pet, para que o score de compatibilidade seja mais assertivo.
10. Como voluntário, quero ver lista de abrigos com endereço e me candidatar, para escolher onde ajudar.
11. Como voluntário, quero preencher meu perfil com disponibilidade e habilidades, para que abrigos me conheçam antes de aprovar.
12. Como admin, quero aprovar ou rejeitar cadastros de abrigos (que exigem CNPJ, responsável legal, CPF, endereço), para evitar que qualquer pessoa crie um abrigo.
13. Como admin, quero visualizar estatísticas reais da plataforma (usuários, pets, adoções, candidaturas, voluntários).
14. Como sistema, quero calcular score de compatibilidade baseado no perfil do adotante vs temperamento do pet (espécie, porte, idade, energia, sociabilidade, moradia, crianças, outros pets, experiência).
15. Como usuário, quero que a navbar seja contextual ao meu perfil (adotante, ONG, voluntário, admin) com opções relevantes e botão de logout.

---

## SEÇÃO 1.2 — Histórico completo de histórias — V01 até V03

Gere uma tabela com o seguinte formato. Use dados REALISTAS para um projeto de 4 meses (março a junho 2026):

| História | Versão | Data Prevista | Data Conclusão | Status |
|----------|--------|---------------|----------------|--------|

**V01 (março/abril 2026) — Funcionalidades base:**
- Cadastro e login de usuários (adopter, shelter)
- Listagem de pets com filtros (espécie, porte, cidade)
- Visualização de detalhes do pet
- Formulário de candidatura para adoção
- Página landing e navegação básica

**V02 (abril/maio 2026) — Perfis detalhados de pets:**
- Modelos de dados para saúde, temperamento e mídia
- Upload de fotos/vídeos com validação de tipo e tamanho
- Endpoints de saúde e temperamento (CRUD)
- Galeria de mídia com carrossel e modal
- Dashboard do abrigo (mockup estático)
- Dashboard do adotante (mockup estático)

**V03 (junho 2026) — Gestão completa e inteligência:**
- Todas as 15 histórias listadas na seção 1.1

Marque TODAS como "Entregue" exceto: "Integração com API de geolocalização para busca por proximidade" (ficou fora do escopo) e "Chat em tempo real entre adotante e abrigo" (dívida técnica).

---

## SEÇÃO 1.3 — Melhorias e dívidas técnicas identificadas

Elabore uma lista com pelo menos 8 itens entre melhorias técnicas e funcionais:

**Técnicas:**
- Implementar autenticação JWT com tokens (atualmente usa localStorage simples)
- Adicionar testes end-to-end (Cypress/Playwright)
- Migrar armazenamento de arquivos de filesystem local para S3/MinIO
- Implementar cache com Redis para listagens frequentes
- Adicionar CI/CD com GitHub Actions
- Refatorar o score de compatibilidade com modelo ML treinado em dados reais

**Funcionais:**
- Chat em tempo real entre adotante e abrigo (WebSocket)
- Geolocalização para busca de pets por proximidade
- Notificações push quando candidatura avança de estágio
- Sistema de doações para abrigos
- Integração com redes sociais para compartilhar pets
- Formulário de acompanhamento pós-adoção

---

## SEÇÃO 1.4 — Reflexão da equipe

Escreva um parágrafo de ~100 palavras refletindo sobre:
- A importância de ter um MVP funcional antes de adicionar complexidade
- Como o Docker facilitou o setup e a consistência entre ambientes
- O valor de separar backend (FastAPI) e frontend (Angular) para paralelismo de trabalho
- Como o tema social (adoção responsável) motivou a equipe a ir além do mínimo
- Se fosse começar do zero: começaria com autenticação JWT desde o início e investiria mais em testes automatizados desde a V01

---

## INFORMAÇÕES TÉCNICAS DO PROJETO (para contexto):

**Banco de dados (9 tabelas):** users, pets, applications, pet_health_records, pet_temperaments, pet_media, user_profiles, volunteer_applications, volunteer_ratings

**Backend (10 routers):** auth, pets, shelters, applications, pet_health, pet_temperament, pet_media, user_profile, volunteers, admin

**Frontend (15+ componentes):** Landing, Explore, PetDetails, Apply, Login, Signup, ShelterDashboard, AdopterDashboard, VolunteerDashboard, AdminDashboard, AddPet, Profile, HealthInfo, Temperament, MediaGallery, MediaUpload

**Funcionalidades implementadas:**
- 4 perfis com painéis distintos (adotante, ONG, voluntário, admin)
- Cadastro de pets com foto, personalidade, saúde e temperamento
- Galeria de mídia com carrossel, upload drag-and-drop, modal full-size
- Fluxo de candidatura com 4 estágios + contestação + descarte
- Score de compatibilidade real (algoritmo com 9 critérios, 0-100%)
- Gestão de voluntários com candidatura, aprovação e avaliação por estrelas
- Aprovação de abrigos pelo admin (CNPJ, responsável legal obrigatório)
- Navbar contextual por perfil com logout
- Filtros avançados na exploração de pets
- Layout responsivo (tabs em desktop, empilhado em mobile)

---

Formate o documento com cabeçalho da FURB, título "Relatório de Sprint Final — Versão 03", nome da disciplina, e estruture de forma profissional. Ao final, deixe um espaço para "[LINK DO VÍDEO DEMONSTRATIVO NO YOUTUBE]".
