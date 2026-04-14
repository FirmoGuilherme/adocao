# Plano de Implementação: pet-adoption-core

## Visão Geral

Implementação incremental das funcionalidades de cadastro de pets, listagem com filtros, visualização de detalhes e candidatura de adoção. O backend usa FastAPI + SQLAlchemy + PostgreSQL; o frontend usa Angular standalone components.

## Tarefas

- [x] 1. Completar o endpoint POST /pets no backend
  - Adicionar a rota `POST /pets` em `routers/pets.py` usando o schema `PetCreate` e retornando o pet criado com HTTP 201
  - Garantir que o modelo `Pet` em `models.py` e o schema `PetCreate` em `schemas.py` estão completos e consistentes
  - _Requisitos: 1.1, 1.2, 1.5_

  - [x] 1.1 Escrever testes unitários para POST /pets
    - Testar criação com payload válido → 201 + objeto retornado
    - Testar criação com campo obrigatório ausente → 422
    - Usar `httpx.AsyncClient` com banco SQLite em memória
    - _Requisitos: 1.2, 1.3_

  - [x] 1.2 Escrever teste de propriedade: Persistência e recuperação de pet (round-trip)
    - **Propriedade 2: Persistência e recuperação de pet (round-trip)**
    - **Valida: Requisitos 1.2, 1.5, 3.1, 3.2**
    - Usar `hypothesis` para gerar pets válidos aleatórios, criar via POST e recuperar via GET `/pets/{id}`, verificar equivalência
    - Tag: `Feature: pet-adoption-core, Propriedade 2`

  - [x] 1.3 Escrever teste de propriedade: Campos obrigatórios ausentes geram 422
    - **Propriedade 5: Campos obrigatórios ausentes geram erro de validação**
    - **Valida: Requisitos 1.3, 4.5**
    - Usar `hypothesis` para gerar payloads com subconjuntos de campos obrigatórios removidos, verificar HTTP 422
    - Tag: `Feature: pet-adoption-core, Propriedade 5`

- [x] 2. Completar o endpoint GET /pets com filtros no backend
  - Verificar e ajustar a lógica de filtragem em `routers/pets.py` para os filtros: `species`, `size`, `age_group`, `city`, `apartment_friendly`, `good_with_kids`
  - Garantir que múltiplos filtros combinados aplicam lógica AND
  - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 2.1 Escrever teste de propriedade: Filtros retornam subconjunto consistente
    - **Propriedade 1: Filtros retornam subconjunto consistente**
    - **Valida: Requisitos 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9**
    - Usar `hypothesis` para gerar conjuntos de pets e combinações de filtros, verificar que todos os retornados satisfazem os filtros e nenhum elegível é omitido
    - Tag: `Feature: pet-adoption-core, Propriedade 1`

- [x] 3. Completar o endpoint GET /pets/{pet_id} no backend
  - Verificar a rota existente em `routers/pets.py`
  - Garantir retorno HTTP 404 com `{"detail": "Pet not found"}` para IDs inexistentes
  - _Requisitos: 3.1, 3.2, 3.3_

  - [x] 3.1 Escrever teste de propriedade: Pet inexistente retorna 404
    - **Propriedade 3: Pet inexistente retorna 404**
    - **Valida: Requisito 3.3**
    - Usar `hypothesis` para gerar IDs inteiros que não existam no banco, verificar HTTP 404
    - Tag: `Feature: pet-adoption-core, Propriedade 3`

- [x] 4. Checkpoint — Garantir que todos os testes do backend passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 5. Criar o ApplicationService no frontend
  - Criar `adocao/frontend/src/app/core/services/application.service.ts`
  - Implementar `createApplication(payload: ApplicationCreate): Observable<ApplicationResponse>`
  - Implementar `getUserApplications(userId: number): Observable<ApplicationResponse[]>`
  - Definir as interfaces `ApplicationCreate` e `ApplicationResponse` no mesmo arquivo
  - _Requisitos: 4.2, 4.8_

  - [x] 5.1 Escrever testes unitários para ApplicationService
    - Usar `HttpClientTestingModule` para mockar chamadas HTTP
    - Testar `createApplication` com payload válido
    - Testar `getUserApplications` retornando lista
    - _Requisitos: 4.2, 4.8_

- [x] 6. Completar o ApplyComponent no frontend
  - Verificar e ajustar `adocao/frontend/src/app/pages/apply/apply.component.ts`
  - Garantir que o formulário possui os campos `housing_type` e `motivation` com validação de obrigatoriedade
  - Injetar `ApplicationService` e chamar `createApplication` no submit
  - Exibir mensagem de confirmação em caso de sucesso
  - Exibir mensagem de erro em caso de falha
  - _Requisitos: 4.1, 4.2, 4.6, 4.7_

  - [x] 6.1 Escrever testes de componente para ApplyComponent
    - Testar renderização do formulário com campos obrigatórios
    - Testar que submit chama ApplicationService com dados corretos
    - Testar exibição de confirmação após sucesso (mock do serviço)
    - Testar exibição de erro após falha (mock do serviço com erro)
    - _Requisitos: 4.1, 4.2, 4.6, 4.7_

- [x] 7. Completar o ExploreComponent no frontend
  - Verificar e ajustar `adocao/frontend/src/app/pages/explore/explore.component.ts`
  - Garantir que `ngOnInit` chama `PetService.getPets()`
  - Garantir que mudança de qualquer filtro dispara nova chamada ao serviço com os filtros ativos
  - Garantir exibição de mensagem quando a lista retornada for vazia
  - _Requisitos: 2.10, 2.11, 2.12, 2.13_

  - [x] 7.1 Escrever testes de componente para ExploreComponent
    - Testar que ngOnInit chama PetService
    - Testar que mudança de filtro dispara nova chamada com filtros corretos
    - Testar renderização de N cartões para lista com N pets
    - Testar exibição de mensagem de "nenhum pet encontrado" para lista vazia
    - _Requisitos: 2.10, 2.11, 2.12, 2.13_

- [x] 8. Completar o PetDetailsComponent no frontend
  - Verificar e ajustar `adocao/frontend/src/app/pages/pet-details/pet-details.component.ts`
  - Garantir que todos os atributos do pet são exibidos (name, breed, age_description, size, color, species, age_group, sex, shelter_name, city, status, description, is_vaccinated, is_neutered, good_with_kids, good_with_dogs, good_with_cats, apartment_friendly, first_time_owner_friendly)
  - Garantir exibição de mensagem de erro quando o carregamento falhar
  - _Requisitos: 3.4, 3.5, 3.6_

  - [x] 8.1 Escrever testes de componente para PetDetailsComponent
    - Testar que ngOnInit chama PetService.getPet com o ID da rota
    - Testar que todos os atributos obrigatórios são renderizados no template
    - Testar exibição de mensagem de erro quando o serviço retorna erro
    - _Requisitos: 3.4, 3.5, 3.6_

- [ ] 9. Completar o endpoint POST /applications e mover modelo para models.py
  - Mover a classe `AdoptionApplication` de `routers/applications.py` para `models.py`
  - Mover os schemas `ApplicationCreate` e `ApplicationResponse` para `schemas.py`
  - Verificar e ajustar a rota POST `/applications` para retornar HTTP 201
  - _Requisitos: 4.3, 4.4, 4.5, 4.8_

  - [-] 9.1 Escrever testes unitários para POST /applications
    - Testar criação com payload válido → status "New"
    - Testar criação com campo ausente → 422
    - Testar recuperação via GET /applications/user/{user_id}
    - _Requisitos: 4.4, 4.5, 4.8_

  - [-] 9.2 Escrever teste de propriedade: Candidatura persiste com status "New"
    - **Propriedade 4: Candidatura persiste com status inicial "New"**
    - **Valida: Requisitos 4.4, 4.8**
    - Usar `hypothesis` para gerar candidaturas válidas, criar via POST e recuperar via GET, verificar status "New" e presença na lista do usuário
    - Tag: `Feature: pet-adoption-core, Propriedade 4`

- [~] 10. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes de backend e frontend passam, perguntar ao usuário se houver dúvidas.

## Notas

- Todas as tarefas de teste são obrigatórias para cobertura completa
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Os testes de propriedade usam `hypothesis` (backend) com mínimo de 100 iterações
- Os testes de componente Angular usam mocks dos serviços via `jasmine.createSpyObj` ou `jest.fn()`
