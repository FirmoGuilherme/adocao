# Implementation Plan: Pet Detailed Profiles

## Overview

Plano de implementação para estender os perfis de pets com informações detalhadas de saúde, temperamento e galeria de mídias. A implementação segue uma abordagem incremental: modelos de dados e schemas primeiro, depois serviços e routers no backend, seguido de testes property-based, e por fim os componentes Angular no frontend.

## Tasks

- [x] 1. Modelos de dados e schemas do backend
  - [x] 1.1 Criar modelos SQLAlchemy para PetHealthRecord, PetTemperament e PetMedia
    - Adicionar as três classes em `backend/app/models.py` seguindo o design document
    - `PetHealthRecord`: campos JSON para vaccination_records, medical_conditions, surgeries; campos escalares para special_needs, last_vet_visit, weight_kg; timestamps created_at/updated_at
    - `PetTemperament`: campos inteiros para os 7 níveis (energy_level, sociability_people, sociability_animals, training_level, independence_level, playfulness, noise_level); behavior_notes opcional; timestamps
    - `PetMedia`: campos media_type, file_name, file_path, url, file_size_bytes; timestamp uploaded_at
    - Garantir constraint `unique=True` em pet_id para PetHealthRecord e PetTemperament (relação 1:1)
    - _Requirements: 1.2, 2.2, 3.1, 3.7_

  - [x] 1.2 Criar schemas Pydantic para health, temperament e media
    - Adicionar em `backend/app/schemas.py` os schemas: `VaccinationRecord`, `MedicalCondition`, `Surgery`, `PetHealthRecordCreate`, `PetHealthRecordResponse`, `PetTemperamentCreate`, `PetTemperamentResponse`, `PetMediaResponse`
    - Implementar validações: weight_kg entre 0.01 e 200.00, níveis de temperamento entre 1 e 5, special_needs e behavior_notes com máximo de 2000 caracteres, vaccination_records com máximo 100 itens, medical_conditions e surgeries com máximo 50 itens
    - Validar campos obrigatórios: vaccine_name e date_administered em cada VaccinationRecord
    - _Requirements: 1.2, 1.10, 1.11, 1.12, 2.2, 2.6, 2.13, 3.7_

  - [x] 1.3 Criar migration Alembic para as novas tabelas
    - Gerar migration para criação das tabelas `pet_health_records`, `pet_temperaments` e `pet_media`
    - Incluir índices em pet_id, constraint unique em pet_id para health e temperament
    - Incluir foreign keys referenciando `pets.id`
    - _Requirements: 1.2, 2.2, 3.1_

- [x] 2. Serviço de armazenamento de arquivos e router de mídia
  - [x] 2.1 Implementar FileStorageService em `backend/app/file_storage.py`
    - Criar classe `FileStorageService` com métodos: `save_file(pet_id, file) -> str`, `delete_file(file_path) -> None`, `get_url(file_path) -> str`
    - Usar variável de ambiente `UPLOAD_DIR` (default `./uploads`) para diretório base
    - Estrutura de path: `{UPLOAD_DIR}/pets/{pet_id}/{uuid}.{ext}`
    - Criar diretórios automaticamente caso não existam
    - _Requirements: 3.1, 3.7_

  - [x] 2.2 Implementar router `backend/app/routers/pet_media.py`
    - Endpoint POST `/pets/{pet_id}/media`: validar content-type (image/jpeg, image/png, image/webp, video/mp4, video/webm), validar tamanho (imagem ≤ 10MB, vídeo ≤ 100MB), verificar limite de 20 mídias por pet, verificar arquivo não vazio, salvar via FileStorageService, registrar metadados no banco, retornar 201
    - Endpoint GET `/pets/{pet_id}/media`: retornar lista ordenada por uploaded_at desc
    - Endpoint DELETE `/pets/{pet_id}/media/{media_id}`: remover registro do banco e arquivo do filesystem, retornar 204
    - Incluir verificação de pet existente (404), autorização do cuidador (403)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.17, 3.18, 3.19_

  - [x] 2.3 Configurar FastAPI StaticFiles para servir uploads
    - Montar `StaticFiles` em `/static/uploads` apontando para o diretório de uploads no `backend/app/main.py`
    - Registrar o novo router `pet_media` no app principal
    - _Requirements: 3.7_

- [x] 3. Routers de saúde e temperamento
  - [x] 3.1 Implementar router `backend/app/routers/pet_health.py`
    - Endpoint GET `/pets/{pet_id}/health`: buscar registro, retornar 200 ou 404
    - Endpoint POST `/pets/{pet_id}/health`: validar pet existe, verificar duplicidade (409), criar registro, retornar 201
    - Endpoint PUT `/pets/{pet_id}/health`: validar pet e registro existem (404), atualizar, retornar 200
    - Usar helper `get_pet_or_404` para verificação padrão
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12_

  - [x] 3.2 Implementar router `backend/app/routers/pet_temperament.py`
    - Endpoint GET `/pets/{pet_id}/temperament`: buscar perfil, retornar 200 ou 404
    - Endpoint POST `/pets/{pet_id}/temperament`: validar pet existe, verificar duplicidade (409), criar perfil, retornar 201
    - Endpoint PUT `/pets/{pet_id}/temperament`: validar pet e perfil existem (404), atualizar, retornar 200
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.11, 2.12, 2.13_

  - [x] 3.3 Registrar routers de saúde e temperamento no app principal
    - Incluir `pet_health` e `pet_temperament` routers em `backend/app/main.py`
    - _Requirements: 1.1, 2.1_

- [x] 4. Checkpoint - Verificação do backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4.1 Escrever property test: Health record serialization round-trip
    - **Property 1: Health record serialization round-trip**
    - Usar Hypothesis para gerar dados válidos de health record (vaccination_records com vaccine_name e date_administered, weight_kg entre 0.01 e 200.00, special_needs ≤ 2000 chars)
    - Criar registro via POST, buscar via GET, comparar todos os campos persistidos
    - Arquivo: `backend/tests/test_pet_health.py`
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.7**

- [x] 4.2 Escrever property test: Health record input validation rejects invalid data
    - **Property 2: Health record input validation rejects invalid data**
    - Usar Hypothesis para gerar payloads com violações: vaccination_records sem vaccine_name ou date_administered, weight_kg fora de [0.01, 200.00]
    - Enviar via POST, verificar resposta HTTP 422
    - Arquivo: `backend/tests/test_pet_health.py`
    - **Validates: Requirements 1.10, 1.11, 1.12**

- [x] 4.3 Escrever property test: Temperament profile serialization round-trip
    - **Property 3: Temperament profile serialization round-trip**
    - Usar Hypothesis para gerar perfis válidos (todos os níveis entre 1 e 5, behavior_notes ≤ 2000 chars)
    - Criar perfil via POST, buscar via GET, comparar todos os campos
    - Arquivo: `backend/tests/test_pet_temperament.py`
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.7**

- [x] 4.4 Escrever property test: Temperament profile input validation rejects invalid data
    - **Property 4: Temperament profile input validation rejects invalid data**
    - Usar Hypothesis para gerar payloads com pelo menos um nível fora de [1, 5] ou behavior_notes > 2000 caracteres
    - Enviar via POST, verificar resposta HTTP 422
    - Arquivo: `backend/tests/test_pet_temperament.py`
    - **Validates: Requirements 2.6, 2.13**

- [x] 4.5 Escrever property test: Invalid media content-type rejected
    - **Property 5: Invalid media content-type rejected**
    - Usar Hypothesis para gerar content-types aleatórios que não estão na whitelist (image/jpeg, image/png, image/webp, video/mp4, video/webm)
    - Enviar upload via POST, verificar resposta HTTP 415
    - Arquivo: `backend/tests/test_pet_media.py`
    - **Validates: Requirements 3.4**

- [x] 4.6 Escrever property test: Media list ordering invariant
    - **Property 6: Media list ordering invariant**
    - Usar Hypothesis para gerar quantidade variável de mídias (2 a 20), criar todas via POST
    - Buscar lista via GET, verificar que para todo par consecutivo, uploaded_at[i] >= uploaded_at[i+1]
    - Arquivo: `backend/tests/test_pet_media.py`
    - **Validates: Requirements 3.8**

- [x] 4.7 Escrever testes unitários para edge cases do backend
    - Testar: pet não encontrado (404), registro duplicado (409), cuidador não autorizado (403), arquivo vazio (422), campo de arquivo ausente (422), limite de 20 mídias (409), arquivo > 10MB imagem (413), arquivo > 100MB vídeo (413)
    - Testar PUT em registro inexistente (404)
    - Arquivos: `backend/tests/test_pet_health.py`, `backend/tests/test_pet_temperament.py`, `backend/tests/test_pet_media.py`
    - _Requirements: 1.5, 1.6, 1.8, 1.9, 2.5, 2.11, 2.12, 3.5, 3.6, 3.11, 3.12, 3.17, 3.18, 3.19_

- [x] 5. Extensão do PetService Angular e interfaces TypeScript
  - [x] 5.1 Criar interfaces TypeScript para os novos modelos de dados
    - Criar arquivo `frontend/src/app/core/models/pet-details.models.ts`
    - Definir interfaces: `VaccinationRecord`, `MedicalCondition`, `Surgery`, `PetHealthRecord`, `PetTemperament`, `PetMedia`
    - _Requirements: 1.2, 2.2, 3.7_

  - [x] 5.2 Estender PetService com métodos para os novos endpoints
    - Adicionar em `frontend/src/app/core/services/pet.service.ts`: `getHealthRecord(petId)`, `getTemperament(petId)`, `getMedia(petId)`, `uploadMedia(petId, file)`, `deleteMedia(petId, mediaId)`
    - Configurar timeout de 10 segundos nas chamadas HTTP
    - _Requirements: 1.1, 2.1, 3.1, 3.8, 3.9, 5.2_

- [x] 6. Componentes Angular de saúde e temperamento
  - [x] 6.1 Criar HealthInfoComponent standalone
    - Criar em `frontend/src/app/pages/pet-details/health-info/health-info.component.ts`
    - Input: `petId: number`
    - Implementar estados: loading (skeleton/spinner), loaded (dados renderizados), empty (mensagem informativa), error (mensagem + botão retry)
    - Exibir: histórico de vacinação em tabela/lista, condições médicas, cirurgias, necessidades especiais, última visita, peso
    - _Requirements: 1.13, 1.14, 5.3, 5.4_

  - [x] 6.2 Criar TemperamentComponent standalone
    - Criar em `frontend/src/app/pages/pet-details/temperament/temperament.component.ts`
    - Input: `petId: number`
    - Exibir os 7 níveis em barras/escalas visuais de 1 a 5 com labels descritivos
    - Exibir behavior_notes quando preenchido
    - Implementar estados: loading, loaded, empty, error com retry
    - _Requirements: 2.8, 2.9, 2.10, 5.3, 5.4_

- [x] 7. Componentes Angular de galeria e upload de mídia
  - [x] 7.1 Criar MediaGalleryComponent standalone
    - Criar em `frontend/src/app/pages/pet-details/media-gallery/media-gallery.component.ts`
    - Inputs: `media: PetMedia[]`, `defaultImageUrl: string`
    - Implementar carrossel de fotos com botões anterior/próximo
    - Implementar player de vídeo com controles (play, pause, volume), sem autoplay
    - Implementar modal de visualização em resolução original (fechar via click fora, Escape, botão X)
    - Exibir imagem padrão quando não houver mídias
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.2 Criar MediaUploadComponent standalone
    - Criar em `frontend/src/app/pages/pet-details/media-upload/media-upload.component.ts`
    - Input: `petId: number`
    - Implementar área drag-and-drop para envio de arquivos
    - Exibir prévia do arquivo selecionado antes do envio
    - Implementar progress bar durante o upload
    - Validação client-side: verificar tipo e tamanho antes de enviar
    - Exibir mensagem de erro da API em caso de falha
    - Adicionar mídia à galeria sem reload após sucesso
    - Exibir apenas para cuidador autenticado responsável pelo pet
    - _Requirements: 3.13, 3.14, 3.15, 3.16, 3.17_

- [x] 8. Extensão do PetDetailsComponent com layout integrado
  - [x] 8.1 Estender PetDetailsComponent com seções e carregamento paralelo
    - Modificar `frontend/src/app/pages/pet-details/pet-details.component.ts`
    - Adicionar seções: informações básicas, saúde (HealthInfoComponent), temperamento (TemperamentComponent), galeria (MediaGalleryComponent + MediaUploadComponent)
    - Implementar chamadas paralelas com `forkJoin` do RxJS aos 4 endpoints
    - Tratar erros individualmente por seção (graceful degradation)
    - Implementar navegação por abas em desktop (>768px) e layout empilhado em mobile (≤768px)
    - Adicionar indicador de carregamento por seção
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Checkpoint final - Testes frontend e integração
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9.1 Escrever testes de componente Angular (Jasmine/Karma)
    - `health-info.component.spec.ts`: renderização de dados, estado empty, estado error com retry
    - `temperament.component.spec.ts`: renderização de escalas, behavior_notes, estados
    - `media-gallery.component.spec.ts`: carrossel, navegação, modal, vídeo controls, imagem padrão
    - `media-upload.component.spec.ts`: drag-and-drop, preview, progress, erro, validação client-side
    - _Requirements: 1.13, 1.14, 2.8, 2.9, 2.10, 3.13, 3.14, 3.15, 3.16, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9.2 Escrever property test: Graceful degradation under partial failures
    - **Property 7: Graceful degradation under partial failures**
    - Simular combinações de falhas parciais nos endpoints de health, temperament e media (usando mocks do HttpClient)
    - Verificar que as seções cujos endpoints retornaram sucesso são renderizadas corretamente
    - Verificar que seções com falha exibem mensagem de erro e botão retry sem afetar as demais
    - Arquivo: `frontend/src/app/pages/pet-details/pet-details.component.spec.ts`
    - **Validates: Requirements 5.4**

- [x] 9.3 Escrever testes de layout responsivo do PetDetailsComponent
    - Testar breakpoint 768px: verificar abas em desktop e empilhamento em mobile
    - Verificar navegação entre seções por abas/âncoras
    - Arquivo: `frontend/src/app/pages/pet-details/pet-details.component.spec.ts`
    - _Requirements: 5.5, 5.6_

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental do progresso
- Property tests validam propriedades universais de correção definidas no design
- Testes unitários validam exemplos específicos e edge cases
- O backend usa Python (FastAPI + SQLAlchemy + pytest + Hypothesis)
- O frontend usa TypeScript (Angular standalone components + Jasmine/Karma)
- O FileStorageService é configurável via env var `UPLOAD_DIR` para facilitar migração futura para S3

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2"] },
    { "id": 3, "tasks": ["2.3", "3.3"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7"] },
    { "id": 5, "tasks": ["5.1"] },
    { "id": 6, "tasks": ["5.2", "6.1", "6.2"] },
    { "id": 7, "tasks": ["7.1", "7.2"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["9.1", "9.2", "9.3"] }
  ]
}
```
