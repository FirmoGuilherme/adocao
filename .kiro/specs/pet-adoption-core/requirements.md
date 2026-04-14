# Documento de Requisitos

## Introdução

Este documento descreve os requisitos funcionais para o núcleo de adoção de pets da plataforma. As funcionalidades cobrem o ciclo básico que permite a um adotante descobrir pets disponíveis, visualizar seus detalhes e iniciar contato com o responsável para dar início ao processo de adoção. O sistema é composto por um backend FastAPI, um banco de dados PostgreSQL e um frontend Angular.

## Glossário

- **Sistema**: A plataforma de adoção de pets (backend FastAPI + frontend Angular).
- **API**: O serviço backend FastAPI exposto em `/pets` e `/applications`.
- **Adotante**: Usuário com papel `adopter` que busca adotar um pet.
- **Responsável**: Entidade (abrigo ou voluntário) cadastrada como `shelter` responsável por um pet.
- **Pet**: Animal cadastrado no sistema com status `Available`, `Reserved` ou `Adopted`.
- **Candidatura**: Registro de interesse formal de um adotante em adotar um pet específico (`AdoptionApplication`).
- **Filtro**: Parâmetro de consulta enviado à API para restringir a listagem de pets.
- **PetService**: Serviço Angular responsável pela comunicação com a API de pets.
- **ExploreComponent**: Componente Angular que exibe a listagem de pets com filtros.
- **PetDetailsComponent**: Componente Angular que exibe os detalhes de um pet específico.
- **ApplyComponent**: Componente Angular que exibe o formulário de candidatura à adoção.

---

## Requisitos

### Requisito 1: Cadastro de Pets

**User Story:** Como responsável por um abrigo, quero cadastrar pets no sistema, para que adotantes possam encontrá-los e iniciar o processo de adoção.

#### Critérios de Aceitação

1. THE API SHALL aceitar requisições POST em `/pets` com os campos obrigatórios: `name`, `species`, `breed`, `age_group`, `age_description`, `size`, `sex`, `color`, `shelter_name`, `city` e `status`.
2. WHEN um pet é cadastrado com sucesso, THE API SHALL retornar o objeto do pet criado com seu `id` gerado e o código HTTP 201.
3. IF um campo obrigatório estiver ausente na requisição de cadastro, THEN THE API SHALL retornar o código HTTP 422 com uma mensagem descrevendo o campo inválido.
4. IF o valor de `status` não for um dos valores permitidos (`Available`, `Reserved`, `Adopted`), THEN THE API SHALL retornar o código HTTP 422.
5. THE API SHALL persistir o pet cadastrado no banco de dados PostgreSQL de forma que ele seja recuperável em consultas subsequentes.

---

### Requisito 2: Listagem de Pets Disponíveis

**User Story:** Como adotante, quero visualizar uma lista de pets disponíveis para adoção, para que eu possa encontrar um animal compatível com meu perfil.

#### Critérios de Aceitação

1. THE API SHALL expor um endpoint GET em `/pets` que retorna uma lista de pets em formato JSON.
2. WHEN o endpoint GET `/pets` é chamado sem filtros, THE API SHALL retornar todos os pets cadastrados no banco de dados.
3. WHEN o endpoint GET `/pets` é chamado com o filtro `species`, THE API SHALL retornar apenas pets cuja espécie corresponda ao valor informado.
4. WHEN o endpoint GET `/pets` é chamado com o filtro `size`, THE API SHALL retornar apenas pets cujo porte corresponda ao valor informado.
5. WHEN o endpoint GET `/pets` é chamado com o filtro `age_group`, THE API SHALL retornar apenas pets cujo grupo etário corresponda ao valor informado.
6. WHEN o endpoint GET `/pets` é chamado com o filtro `city`, THE API SHALL retornar apenas pets cuja cidade corresponda ao valor informado.
7. WHEN o endpoint GET `/pets` é chamado com o filtro `apartment_friendly=true`, THE API SHALL retornar apenas pets com o atributo `apartment_friendly` igual a `true`.
8. WHEN o endpoint GET `/pets` é chamado com o filtro `good_with_kids=true`, THE API SHALL retornar apenas pets com o atributo `good_with_kids` igual a `true`.
9. WHEN múltiplos filtros são combinados, THE API SHALL retornar apenas pets que satisfaçam todos os filtros simultaneamente.
10. THE ExploreComponent SHALL exibir os pets retornados pela API em uma grade de cartões.
11. WHEN o ExploreComponent é carregado, THE ExploreComponent SHALL chamar o PetService para buscar a lista de pets.
12. WHEN o adotante altera qualquer filtro na interface, THE ExploreComponent SHALL recarregar a lista de pets aplicando os filtros selecionados.
13. WHEN nenhum pet é encontrado com os filtros aplicados, THE ExploreComponent SHALL exibir uma mensagem informando que nenhum pet foi encontrado.

---

### Requisito 3: Visualização de Detalhes do Pet

**User Story:** Como adotante, quero ver os detalhes completos (idade, raça, fotos, características) de um pet, para que eu possa decidir se tenho interesse em adotá-lo.

#### Critérios de Aceitação

1. THE API SHALL expor um endpoint GET em `/pets/{pet_id}` que retorna os dados completos de um pet específico.
2. WHEN o endpoint GET `/pets/{pet_id}` é chamado com um `pet_id` existente, THE API SHALL retornar o objeto completo do pet com código HTTP 200.
3. IF o `pet_id` informado não corresponder a nenhum pet cadastrado, THEN THE API SHALL retornar o código HTTP 404 com a mensagem `"Pet not found"`.
4. THE PetDetailsComponent SHALL exibir os seguintes atributos do pet: `name`, `breed`, `age_description`, `size`, `color`, `species`, `age_group`, `sex`, `shelter_name`, `city`, `status`, `description`, `is_vaccinated`, `is_neutered`, `good_with_kids`, `good_with_dogs`, `good_with_cats`, `apartment_friendly` e `first_time_owner_friendly`.
5. WHEN o PetDetailsComponent é carregado com um `pet_id` válido na rota, THE PetDetailsComponent SHALL chamar o PetService para buscar os dados do pet correspondente.
6. IF o PetDetailsComponent falhar ao carregar os dados do pet, THEN THE PetDetailsComponent SHALL exibir uma mensagem de erro ao adotante.

---

### Requisito 4: Contato Básico com o Responsável (Candidatura)

**User Story:** Como adotante, quero entrar em contato com o responsável pelo pet, para que eu possa iniciar o processo formal de adoção.

#### Critérios de Aceitação

1. THE ApplyComponent SHALL exibir um formulário com os campos `housing_type` e `motivation` para o adotante preencher.
2. WHEN o adotante submete o formulário com todos os campos preenchidos, THE ApplyComponent SHALL enviar uma requisição POST para `/applications` com os dados da candidatura.
3. THE API SHALL aceitar requisições POST em `/applications` com os campos `user_id`, `pet_id`, `housing_type` e `motivation`.
4. WHEN uma candidatura é criada com sucesso, THE API SHALL retornar o objeto da candidatura com `id`, `status` igual a `"New"` e código HTTP 200.
5. IF um campo obrigatório da candidatura estiver ausente, THEN THE API SHALL retornar o código HTTP 422.
6. WHEN a candidatura é enviada com sucesso, THE ApplyComponent SHALL exibir uma confirmação ao adotante.
7. IF o envio da candidatura falhar, THEN THE ApplyComponent SHALL exibir uma mensagem de erro ao adotante.
8. THE API SHALL persistir a candidatura no banco de dados de forma que ela seja recuperável pelo endpoint GET `/applications/user/{user_id}`.
