# Requirements Document

## Introduction

Este documento descreve os requisitos funcionais para a extensão dos perfis de pets na plataforma de adoção. As funcionalidades cobrem três áreas principais: informações detalhadas de saúde (histórico médico, vacinação, necessidades especiais), perfil de temperamento e comportamento (nível de energia, sociabilidade, nível de treinamento), e capacidade de upload de mídias (fotos e vídeos) por parte de ONGs e cuidadores. O objetivo é fornecer informações mais completas aos adotantes para facilitar decisões de adoção mais seguras e compatíveis.

## Glossary

- **Sistema**: A plataforma de adoção de pets (backend FastAPI + frontend Angular).
- **API**: O serviço backend FastAPI.
- **Adotante**: Usuário com papel `adopter` que busca adotar um pet.
- **Cuidador**: Entidade (ONG, abrigo ou voluntário) cadastrada como `shelter` responsável por um pet.
- **Pet**: Animal cadastrado no sistema com perfil existente contendo dados básicos.
- **Registro_de_Saúde**: Conjunto de informações médicas detalhadas associadas a um pet (vacinas, condições, cirurgias, necessidades especiais).
- **Perfil_de_Temperamento**: Conjunto de características comportamentais e de personalidade associadas a um pet.
- **Mídia**: Arquivo de foto ou vídeo associado ao perfil de um pet.
- **PetDetailsComponent**: Componente Angular que exibe os detalhes completos de um pet.
- **MediaUploadComponent**: Componente Angular que permite ao cuidador fazer upload de fotos e vídeos.
- **HealthInfoComponent**: Componente Angular que exibe as informações de saúde do pet.
- **TemperamentComponent**: Componente Angular que exibe o perfil de temperamento do pet.

---

## Requirements

### Requirement 1: Registro de Informações de Saúde do Pet

**User Story:** Como adotante, quero ver informações completas de saúde do pet, para tomar uma decisão de adoção segura e informada.

#### Acceptance Criteria

1. THE API SHALL expor um endpoint GET em `/pets/{pet_id}/health` que retorna o Registro_de_Saúde completo de um pet.
2. THE API SHALL aceitar requisições POST em `/pets/{pet_id}/health` com os campos: `vaccination_records` (lista de até 100 vacinas com nome, data e validade), `medical_conditions` (lista de até 50 condições médicas diagnosticadas), `surgeries` (lista de até 50 cirurgias realizadas com data e descrição), `special_needs` (texto descritivo de necessidades especiais com no máximo 2000 caracteres), `last_vet_visit` (data da última visita veterinária) e `weight_kg` (peso em quilogramas, valor entre 0.01 e 200.00).
3. WHEN um Registro_de_Saúde é criado com sucesso, THE API SHALL retornar o objeto criado com código HTTP 201.
4. WHEN o endpoint GET `/pets/{pet_id}/health` é chamado para um pet com Registro_de_Saúde cadastrado, THE API SHALL retornar o registro completo com código HTTP 200.
5. IF o `pet_id` informado não corresponder a nenhum pet cadastrado, THEN THE API SHALL retornar o código HTTP 404.
6. IF o endpoint GET `/pets/{pet_id}/health` for chamado para um pet que não possui Registro_de_Saúde cadastrado, THEN THE API SHALL retornar o código HTTP 404 com uma mensagem indicando que o registro de saúde não foi encontrado.
7. WHEN o Registro_de_Saúde é atualizado com sucesso via PUT em `/pets/{pet_id}/health`, THE API SHALL retornar o objeto atualizado com código HTTP 200.
8. IF uma requisição PUT for enviada para `/pets/{pet_id}/health` e o pet não possuir Registro_de_Saúde cadastrado, THEN THE API SHALL retornar o código HTTP 404 com uma mensagem indicando que não existe registro para atualizar.
9. IF uma requisição POST for enviada para `/pets/{pet_id}/health` e o pet já possuir um Registro_de_Saúde cadastrado, THEN THE API SHALL retornar o código HTTP 409 com uma mensagem indicando que o registro já existe.
10. WHEN o campo `vaccination_records` contém entradas, THE API SHALL validar que cada entrada possua os campos `vaccine_name` e `date_administered`.
11. IF uma entrada em `vaccination_records` não possuir os campos obrigatórios, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem descrevendo o campo inválido.
12. IF o campo `weight_kg` possuir valor fora do intervalo de 0.01 a 200.00, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem indicando o intervalo válido.
13. THE HealthInfoComponent SHALL exibir o histórico de vacinação, condições médicas, cirurgias, necessidades especiais, data da última visita ao veterinário e peso do pet.
14. WHEN o pet não possui Registro_de_Saúde cadastrado, THE HealthInfoComponent SHALL exibir uma mensagem informando que as informações de saúde ainda não foram preenchidas pelo cuidador.

---

### Requirement 2: Perfil de Temperamento e Comportamento do Pet

**User Story:** Como adotante, quero entender o temperamento do animal, para saber se ele combina com meu estilo de vida.

#### Acceptance Criteria

1. THE API SHALL expor um endpoint GET em `/pets/{pet_id}/temperament` que retorna o Perfil_de_Temperamento de um pet.
2. THE API SHALL aceitar requisições POST em `/pets/{pet_id}/temperament` com os campos obrigatórios: `energy_level` (inteiro entre 1 e 5), `sociability_people` (inteiro entre 1 e 5), `sociability_animals` (inteiro entre 1 e 5), `training_level` (inteiro entre 1 e 5), `independence_level` (inteiro entre 1 e 5), `playfulness` (inteiro entre 1 e 5), `noise_level` (inteiro entre 1 e 5), e o campo opcional `behavior_notes` (texto livre com no máximo 2000 caracteres).
3. WHEN um Perfil_de_Temperamento é criado com sucesso, THE API SHALL retornar o objeto criado com código HTTP 201.
4. WHEN o endpoint GET `/pets/{pet_id}/temperament` é chamado para um pet com Perfil_de_Temperamento cadastrado, THE API SHALL retornar o perfil completo com código HTTP 200.
5. IF o `pet_id` informado não corresponder a nenhum pet cadastrado, THEN THE API SHALL retornar o código HTTP 404.
6. IF algum campo numérico de nível possuir valor fora do intervalo de 1 a 5, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem indicando o campo inválido e o intervalo válido (1 a 5).
7. THE API SHALL aceitar requisições PUT em `/pets/{pet_id}/temperament` para atualizar o Perfil_de_Temperamento existente, retornando o objeto atualizado com código HTTP 200.
8. THE TemperamentComponent SHALL exibir os níveis de energia, sociabilidade com pessoas, sociabilidade com animais, treinamento, independência, brincadeira e barulho em formato visual de escala (1 a 5).
9. WHEN o pet possui observações comportamentais preenchidas, THE TemperamentComponent SHALL exibir o campo `behavior_notes` abaixo das escalas.
10. WHEN o pet não possui Perfil_de_Temperamento cadastrado, THE TemperamentComponent SHALL exibir uma mensagem informando que o perfil de temperamento ainda não foi preenchido pelo cuidador.
11. IF o endpoint GET `/pets/{pet_id}/temperament` for chamado para um pet existente que não possui Perfil_de_Temperamento cadastrado, THEN THE API SHALL retornar o código HTTP 404.
12. IF uma requisição PUT for enviada para `/pets/{pet_id}/temperament` quando o pet não possui Perfil_de_Temperamento cadastrado, THEN THE API SHALL retornar o código HTTP 404.
13. IF o campo `behavior_notes` possuir mais de 2000 caracteres, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem indicando o limite máximo permitido.

---

### Requirement 3: Upload de Fotos e Vídeos do Pet

**User Story:** Como ONG/cuidador, quero adicionar fotos e vídeos ao perfil do pet, para aumentar as chances de adoção ao mostrar o animal em ação.

#### Acceptance Criteria

1. THE API SHALL expor um endpoint POST em `/pets/{pet_id}/media` que aceita upload de um único arquivo de mídia por requisição, associado a um pet.
2. THE API SHALL aceitar arquivos nos formatos de imagem: JPEG, PNG e WebP, validados pelo content-type do arquivo enviado.
3. THE API SHALL aceitar arquivos nos formatos de vídeo: MP4 e WebM, validados pelo content-type do arquivo enviado.
4. IF o arquivo enviado possuir formato não suportado (content-type diferente de image/jpeg, image/png, image/webp, video/mp4 ou video/webm), THEN THE API SHALL retornar o código HTTP 415 com uma mensagem listando os formatos aceitos.
5. IF o tamanho do arquivo de imagem exceder 10 MB, THEN THE API SHALL retornar o código HTTP 413 com uma mensagem informando o limite de tamanho.
6. IF o tamanho do arquivo de vídeo exceder 100 MB, THEN THE API SHALL retornar o código HTTP 413 com uma mensagem informando o limite de tamanho.
7. WHEN um arquivo de mídia é enviado com sucesso, THE API SHALL retornar o objeto da mídia com `id`, `url`, `media_type` (photo ou video), `file_name` e `uploaded_at`, com código HTTP 201.
8. THE API SHALL expor um endpoint GET em `/pets/{pet_id}/media` que retorna a lista de mídias associadas a um pet, ordenada por `uploaded_at` em ordem decrescente (mais recente primeiro).
9. THE API SHALL expor um endpoint DELETE em `/pets/{pet_id}/media/{media_id}` que remove uma mídia associada ao pet.
10. WHEN uma mídia é removida com sucesso, THE API SHALL retornar o código HTTP 204.
11. IF o `pet_id` ou `media_id` informado não existir, THEN THE API SHALL retornar o código HTTP 404.
12. IF um pet já possuir 20 arquivos de mídia cadastrados, THEN THE API SHALL rejeitar novos uploads e retornar o código HTTP 409 com uma mensagem informando o limite máximo de 20 mídias por pet.
13. THE MediaUploadComponent SHALL exibir uma área de drag-and-drop para o cuidador enviar arquivos de foto e vídeo.
14. WHEN o cuidador seleciona um arquivo para upload, THE MediaUploadComponent SHALL exibir uma prévia do arquivo (imagem redimensionada para fotos, thumbnail do primeiro frame para vídeos) antes de confirmar o envio.
15. WHEN o upload é concluído com sucesso, THE MediaUploadComponent SHALL adicionar a mídia à galeria do pet sem necessidade de recarregar a página.
16. IF o upload falhar, THEN THE MediaUploadComponent SHALL exibir uma mensagem de erro ao cuidador com o motivo da falha retornado pela API.
17. IF o cuidador autenticado não for o responsável pelo pet informado no `pet_id`, THEN THE API SHALL retornar o código HTTP 403.
18. IF o arquivo enviado possuir tamanho igual a zero bytes, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem indicando que o arquivo está vazio.
19. IF o campo de arquivo não for enviado na requisição ao endpoint POST `/pets/{pet_id}/media`, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem indicando que o arquivo é obrigatório.

---

### Requirement 4: Exibição de Mídia no Perfil do Pet para o Adotante

**User Story:** Como adotante, quero ver fotos e vídeos do pet no perfil dele, para ter uma visão mais realista do animal antes de decidir pela adoção.

#### Acceptance Criteria

1. THE PetDetailsComponent SHALL exibir uma galeria de mídias (fotos e vídeos) do pet na página de detalhes.
2. WHEN o pet possui fotos cadastradas, THE PetDetailsComponent SHALL exibir as fotos em formato de carrossel com botões de navegação anterior e próximo visíveis, permitindo percorrer todas as fotos disponíveis.
3. WHEN o pet possui vídeos cadastrados, THE PetDetailsComponent SHALL exibir os vídeos com controles de reprodução (play, pause, volume) sem iniciar a reprodução automaticamente.
4. WHEN o pet não possui mídias cadastradas, THE PetDetailsComponent SHALL exibir a imagem padrão definida no campo `image_url` do pet.
5. WHEN o adotante clica em uma foto da galeria, THE PetDetailsComponent SHALL exibir a foto na resolução original (ou ajustada à viewport, mantendo proporção) em uma visualização modal que pode ser fechada pelo adotante ao clicar fora da imagem, pressionar a tecla Escape ou acionar um botão de fechar.
6. WHEN a página de detalhes do pet é inicializada, THE PetDetailsComponent SHALL carregar as mídias do pet chamando o endpoint GET `/pets/{pet_id}/media` e exibir um indicador de carregamento até que a resposta seja recebida.

---

### Requirement 5: Integração dos Dados Detalhados na Página de Detalhes

**User Story:** Como adotante, quero ver todas as informações detalhadas (saúde, temperamento, mídias) consolidadas na página do pet, para ter uma visão completa em um único lugar.

#### Acceptance Criteria

1. THE PetDetailsComponent SHALL exibir seções separadas para informações básicas, saúde, temperamento e galeria de mídias, nesta ordem de cima para baixo.
2. WHEN a página de detalhes é carregada, THE PetDetailsComponent SHALL realizar chamadas paralelas aos endpoints `/pets/{pet_id}`, `/pets/{pet_id}/health`, `/pets/{pet_id}/temperament` e `/pets/{pet_id}/media`, cada uma com timeout máximo de 10 segundos.
3. WHILE as chamadas aos endpoints estiverem em andamento, THE PetDetailsComponent SHALL exibir um indicador de carregamento em cada seção cujos dados ainda não foram recebidos.
4. IF alguma das chamadas aos endpoints de dados detalhados retornar erro HTTP (status 4xx ou 5xx), timeout ou falha de rede, THEN THE PetDetailsComponent SHALL exibir na seção correspondente uma mensagem informando que os dados não puderam ser carregados e um botão para tentar novamente, sem impedir a exibição das demais seções.
5. THE PetDetailsComponent SHALL permitir navegação entre as seções por meio de abas ou âncoras de rolagem.
6. WHILE a largura do viewport for igual ou inferior a 768px, THE PetDetailsComponent SHALL exibir as seções em formato empilhado com rolagem vertical, substituindo a navegação por abas.
