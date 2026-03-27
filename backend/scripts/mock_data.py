import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app import models

def create_mock_data():
    db = SessionLocal()
    
    try:
        # Create Tables
        models.Base.metadata.create_all(bind=engine)
        
        # Check if DB is already seeded
        if db.query(models.User).first():
            print("Database already seeded!")
            return

        print("Seeding Users and Shelters...")
        
        # Create Admins & Volunteers
        admin = models.User(name="Admin User", email="admin@adocao.com.br", city="São Paulo", state="SP", role="admin")
        vol1 = models.User(name="Carlos Volunteer", email="carlos@adocao.com.br", city="Blumenau", state="SC", role="volunteer")
        
        # Create Shelters
        shelters = [
            models.User(name="Instituto Patas do Vale", email="contato@patasdovale.org", city="Blumenau", state="SC", role="shelter"),
            models.User(name="Lar Temporário 4 Patas", email="lar4patas@gmail.com", city="Joinville", state="SC", role="shelter"),
            models.User(name="ONG Vida Animal Sul", email="vidaanimalsul@ong.org", city="Florianópolis", state="SC", role="shelter"),
            models.User(name="Casa de Resgate São Chico", email="saochico@resgate.br", city="São Francisco do Sul", state="SC", role="shelter"),
            models.User(name="Projeto Miados & Latidos", email="miados@latidos.com", city="Itajaí", state="SC", role="shelter"),
            models.User(name="Abrigo Novo Começo Pet", email="novocomeco@abrigo.com", city="Criciúma", state="SC", role="shelter")
        ]
        
        # Create Adopters
        adopter_names = ["Mariana Costa", "Felipe Rocha", "Jefferson Martins", "Luísa Almeida", 
                         "Rafael Nunes", "Camila Duarte", "Bruno Ferreira", "Isadora Teixeira",
                         "Vinícius Lopes", "Natália Moura", "Renan Carvalho", "Beatriz Teles"]
        adopters = [models.User(name=name, email=f"{name.lower().replace(' ', '.')}@email.com", city="Blumenau", state="SC", role="adopter") for name in adopter_names]
        
        db.add(admin)
        db.add(vol1)
        for s in shelters: db.add(s)
        for a in adopters: db.add(a)

        db.commit()
        
        print("Seeding Pets...")
        pets = [
            # Dogs
            models.Pet(name="Luna", species="dog", breed="Mixed Breed", age_group="young", age_description="2 years", size="medium", sex="female", color="brown", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available", description="Calm and affectionate", apartment_friendly=True, first_time_owner_friendly=True),
            models.Pet(name="Thor", species="dog", breed="Labrador Mix", age_group="adult", age_description="4 years", size="large", sex="male", color="golden", shelter_name="Lar Temporário 4 Patas", city="Joinville", status="Available", description="Energetic and playful", good_with_kids=True),
            models.Pet(name="Mel", species="dog", breed="Mixed Breed", age_group="young", age_description="1 year", size="small", sex="female", color="black/white", shelter_name="ONG Vida Animal Sul", city="Florianópolis", status="Available", description="Apartment-friendly", apartment_friendly=True),
            models.Pet(name="Bento", species="dog", breed="Mixed Breed", age_group="senior", age_description="7 years", size="medium", sex="male", color="brown", shelter_name="Casa de Resgate São Chico", city="São Francisco do Sul", status="Available", description="Very calm", apartment_friendly=True),
            models.Pet(name="Nina", species="dog", breed="Mixed Breed", age_group="adult", age_description="3 years", size="medium", sex="female", color="white", shelter_name="Projeto Miados & Latidos", city="Itajaí", status="Available", description="Shy but sweet"),
            models.Pet(name="Toby", species="dog", breed="Mixed Breed", age_group="puppy", age_description="8 months", size="small", sex="male", color="black", shelter_name="Abrigo Novo Começo Pet", city="Criciúma", status="Available", description="High energy", good_with_dogs=True),
            models.Pet(name="Amora", species="dog", breed="Mixed Breed", age_group="adult", age_description="5 years", size="medium", sex="female", color="caramel", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available", description="Ideal for families", good_with_kids=True),
            models.Pet(name="Max", species="dog", breed="Mixed Breed", age_group="adult", age_description="6 years", size="large", sex="male", color="black/tan", shelter_name="Lar Temporário 4 Patas", city="Joinville", status="Available", description="Loyal and quiet", good_with_dogs=True),
            models.Pet(name="Pipoca", species="dog", breed="Mixed Breed", age_group="young", age_description="2 years", size="small", sex="female", color="white", shelter_name="ONG Vida Animal Sul", city="Florianópolis", status="Available", description="Sociable", good_with_kids=True, apartment_friendly=True),
            models.Pet(name="Zeca", species="dog", breed="Mixed Breed", age_group="adult", age_description="3 years", size="medium", sex="male", color="brown", shelter_name="Casa de Resgate São Chico", city="São Francisco do Sul", status="Available", description="Good with kids", good_with_kids=True),
            
            # Cats
            models.Pet(name="Mia", species="cat", breed="Domestic Shorthair", age_group="young", age_description="2 years", size="small", sex="female", color="white / grey", shelter_name="Projeto Miados & Latidos", city="Itajaí", status="Available", description="Calm indoor cat", apartment_friendly=True, good_with_cats=True),
            models.Pet(name="Tom", species="cat", breed="Domestic Shorthair", age_group="young", age_description="1 year", size="small", sex="male", color="orange", shelter_name="Abrigo Novo Começo Pet", city="Criciúma", status="Available", description="Playful and curious", apartment_friendly=True),
            models.Pet(name="Frida", species="cat", breed="Domestic Shorthair", age_group="adult", age_description="4 years", size="small", sex="female", color="tortoiseshell", shelter_name="Instituto Patas do Vale", city="Blumenau", status="Available", description="Independent but affectionate", apartment_friendly=True),
            models.Pet(name="Nino", species="cat", breed="Domestic Shorthair", age_group="kitten", age_description="6 months", size="small", sex="male", color="black", shelter_name="Lar Temporário 4 Patas", city="Joinville", status="Available", description="Kitten", apartment_friendly=True),
            models.Pet(name="Olívia", species="cat", breed="Domestic Shorthair", age_group="senior", age_description="7 years", size="small", sex="female", color="calico", shelter_name="ONG Vida Animal Sul", city="Florianópolis", status="Available", description="Senior cat", apartment_friendly=True),
            models.Pet(name="Salem", species="cat", breed="Domestic Shorthair", age_group="adult", age_description="3 years", size="small", sex="male", color="black", shelter_name="Casa de Resgate São Chico", city="São Francisco do Sul", status="Available", description="Gentle temperament", apartment_friendly=True)
        ]
        
        for p in pets: db.add(p)
        db.commit()
        print("Mock Data Seeded Successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data()
