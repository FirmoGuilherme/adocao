import sys
import os
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app import models

def create_mock_data():
    db = SessionLocal()
    
    try:
        models.Base.metadata.create_all(bind=engine)
        
        if db.query(models.User).first():
            print("Banco de dados já populado!")
            return

        print("Populando Usuários e Abrigos...")
        
        admin = models.User(name="Admin", email="admin@adocao.com.br", city="São Paulo", state="SP", role="admin")
        vol1 = models.User(name="Carlos Voluntário", email="carlos@adocao.com.br", city="Blumenau", state="SC", role="volunteer")
        
        shelters = [
            models.User(name="Instituto Patas do Vale", email="contato@patasdovale.org", city="Blumenau", state="SC", role="shelter"),
            models.User(name="Lar Temporário 4 Patas", email="lar4patas@gmail.com", city="Joinville", state="SC", role="shelter"),
            models.User(name="ONG Vida Animal Sul", email="vidaanimalsul@ong.org", city="Florianópolis", state="SC", role="shelter"),
            models.User(name="Casa de Resgate São Chico", email="saochico@resgate.br", city="São Francisco do Sul", state="SC", role="shelter"),
            models.User(name="Projeto Miados & Latidos", email="miados@latidos.com", city="Itajaí", state="SC", role="shelter"),
            models.User(name="Abrigo Novo Começo Pet", email="novocomeco@abrigo.com", city="Criciúma", state="SC", role="shelter"),
        ]
        
        adopter_names = ["Mariana Costa", "Felipe Rocha", "Jefferson Martins", "Luísa Almeida", 
                         "Rafael Nunes", "Camila Duarte", "Bruno Ferreira", "Isadora Teixeira",
                         "Vinícius Lopes", "Natália Moura", "Renan Carvalho", "Beatriz Teles"]
        adopters = [models.User(name=name, email=f"{name.lower().replace(' ', '.')}@email.com", city="Blumenau", state="SC", role="adopter") for name in adopter_names]
        
        db.add(admin)
        db.add(vol1)
        for s in shelters: db.add(s)
        for a in adopters: db.add(a)
        db.commit()
        
        print("Populando Pets...")
        pets = [
            # Cães
            models.Pet(name="Luna", species="dog", breed="SRD", age_group="young", age_description="2 anos", size="medium", sex="female", color="marrom", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available",
                       description="Luna é uma cadela calma e carinhosa que adora ficar no sofá. Ideal para apartamento e donos de primeira viagem. Já castrada e vacinada.",
                       apartment_friendly=True, first_time_owner_friendly=True, good_with_cats=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Thor", species="dog", breed="Labrador Mix", age_group="adult", age_description="4 anos", size="large", sex="male", color="dourado", shelter_name="Lar Temporário 4 Patas", city="Joinville", status="Available",
                       description="Thor é um cão enérgico e brincalhão que adora crianças. Precisa de espaço para correr e passeios diários. Muito leal e protetor.",
                       good_with_kids=True, good_with_dogs=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Mel", species="dog", breed="SRD", age_group="young", age_description="1 ano", size="small", sex="female", color="preto e branco", shelter_name="ONG Vida Animal Sul", city="Florianópolis", status="Available",
                       description="Mel é uma cadelinha pequena e sociável, perfeita para apartamento. Adora brincar e é muito dócil com todos.",
                       apartment_friendly=True, good_with_kids=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Bento", species="dog", breed="SRD", age_group="senior", age_description="7 anos", size="medium", sex="male", color="marrom", shelter_name="Casa de Resgate São Chico", city="São Francisco do Sul", status="Available",
                       description="Bento é um senhor muito calmo e tranquilo. Ideal para quem busca companhia sem muita agitação. Adora carinho e cochilos.",
                       apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Nina", species="dog", breed="SRD", age_group="adult", age_description="3 anos", size="medium", sex="female", color="branco", shelter_name="Projeto Miados & Latidos", city="Itajaí", status="Available",
                       description="Nina é tímida no início mas muito doce quando ganha confiança. Precisa de um lar paciente e amoroso.",
                       good_with_dogs=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Toby", species="dog", breed="SRD", age_group="puppy", age_description="8 meses", size="small", sex="male", color="preto", shelter_name="Abrigo Novo Começo Pet", city="Criciúma", status="Available",
                       description="Toby é um filhote cheio de energia que adora brincar com outros cães. Está aprendendo comandos básicos e é muito inteligente.",
                       good_with_dogs=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=False),
            models.Pet(name="Amora", species="dog", breed="SRD", age_group="adult", age_description="5 anos", size="medium", sex="female", color="caramelo", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available",
                       description="Amora é a companheira ideal para famílias. Muito paciente com crianças e convive bem com outros animais.",
                       good_with_kids=True, good_with_dogs=True, good_with_cats=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Max", species="dog", breed="Pastor Alemão Mix", age_group="adult", age_description="6 anos", size="large", sex="male", color="preto e marrom", shelter_name="Lar Temporário 4 Patas", city="Joinville", status="Available",
                       description="Max é um cão leal e quieto. Excelente guardião e companheiro fiel. Precisa de espaço e passeios regulares.",
                       good_with_dogs=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Pipoca", species="dog", breed="SRD", age_group="young", age_description="2 anos", size="small", sex="female", color="branco", shelter_name="ONG Vida Animal Sul", city="Florianópolis", status="Available",
                       description="Pipoca é super sociável e alegre! Adora festas e receber visitas. Perfeita para apartamento e famílias com crianças.",
                       good_with_kids=True, apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Zeca", species="dog", breed="SRD", age_group="adult", age_description="3 anos", size="medium", sex="male", color="marrom", shelter_name="Casa de Resgate São Chico", city="São Francisco do Sul", status="Available",
                       description="Zeca é um cão brincalhão que adora crianças. Muito ativo e precisa de passeios diários. Convive bem com outros cães.",
                       good_with_kids=True, good_with_dogs=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Pretinha", species="dog", breed="SRD", age_group="adult", age_description="4 anos", size="small", sex="female", color="preto", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available",
                       description="Pretinha é uma cadelinha dócil e carinhosa. Adora colo e é muito apegada ao dono. Ideal para apartamento.",
                       apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Bob", species="dog", breed="Vira-lata Caramelo", age_group="young", age_description="1 ano e meio", size="medium", sex="male", color="caramelo", shelter_name="Abrigo Novo Começo Pet", city="Criciúma", status="Available",
                       description="Bob é o clássico vira-lata caramelo brasileiro! Alegre, brincalhão e cheio de amor para dar. Convive bem com todos.",
                       good_with_kids=True, good_with_dogs=True, apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),

            # Gatos
            models.Pet(name="Mia", species="cat", breed="SRD", age_group="young", age_description="2 anos", size="small", sex="female", color="branco e cinza", shelter_name="Projeto Miados & Latidos", city="Itajaí", status="Available",
                       description="Mia é uma gata calma e independente, perfeita para apartamento. Convive bem com outros gatos e adora janelas.",
                       apartment_friendly=True, good_with_cats=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Tom", species="cat", breed="SRD", age_group="young", age_description="1 ano", size="small", sex="male", color="laranja", shelter_name="Abrigo Novo Começo Pet", city="Criciúma", status="Available",
                       description="Tom é um gato brincalhão e curioso que adora explorar. Muito carinhoso quando quer e adora brinquedos interativos.",
                       apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Frida", species="cat", breed="SRD", age_group="adult", age_description="4 anos", size="small", sex="female", color="tricolor", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available",
                       description="Frida é independente mas carinhosa nos seus termos. Adora observar pássaros pela janela e cochilar em lugares altos.",
                       apartment_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Nino", species="cat", breed="SRD", age_group="puppy", age_description="6 meses", size="small", sex="male", color="preto", shelter_name="Lar Temporário 4 Patas", city="Joinville", status="Available",
                       description="Nino é um filhote cheio de energia! Adora brincar, correr e escalar tudo. Precisa de um lar com paciência e amor.",
                       apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=False),
            models.Pet(name="Olívia", species="cat", breed="SRD", age_group="senior", age_description="7 anos", size="small", sex="female", color="malhada", shelter_name="ONG Vida Animal Sul", city="Florianópolis", status="Available",
                       description="Olívia é uma gata idosa muito tranquila e carinhosa. Ideal para quem busca uma companhia calma e afetuosa.",
                       apartment_friendly=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Salem", species="cat", breed="SRD", age_group="adult", age_description="3 anos", size="small", sex="male", color="preto", shelter_name="Casa de Resgate São Chico", city="São Francisco do Sul", status="Available",
                       description="Salem é um gato de temperamento gentil. Muito elegante e silencioso, adora carinho e ronrona alto quando está feliz.",
                       apartment_friendly=True, good_with_cats=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Mingau", species="cat", breed="Siamês Mix", age_group="young", age_description="1 ano e meio", size="small", sex="male", color="creme e marrom", shelter_name="Projeto Miados & Latidos", city="Itajaí", status="Available",
                       description="Mingau é um gato vocal e sociável que adora conversar com seus humanos. Muito inteligente e brincalhão.",
                       apartment_friendly=True, good_with_cats=True, first_time_owner_friendly=True, is_vaccinated=True, is_neutered=True),
            models.Pet(name="Lua", species="cat", breed="SRD", age_group="adult", age_description="2 anos", size="small", sex="female", color="cinza", shelter_name="Abrigo Novo Começo Pet", city="Criciúma", status="Available",
                       description="Lua é uma gata tímida que precisa de tempo para se adaptar, mas quando confia, é extremamente carinhosa e leal.",
                       apartment_friendly=True, is_vaccinated=True, is_neutered=True),
        ]
        
        for p in pets: db.add(p)
        db.commit()
        print(f"Dados populados com sucesso! {len(pets)} pets cadastrados.")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data()
