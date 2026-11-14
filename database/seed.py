import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database connection details
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "postgres"
# Common default passwords to try
PASSWORDS = ["postgres", "admin", "password", "root", "123456", "1234", "12345", "Postgres123", ""]

# Check for .env file in project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
env_path = os.path.join(project_root, ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if line.strip().startswith("DB_PASSWORD="):
                pwd_val = line.strip().split("=", 1)[1].strip("'\"")
                if pwd_val:
                    # Insert at the beginning of passwords to try
                    PASSWORDS.insert(0, pwd_val)

def get_connection(db_name="postgres"):
    conn = None
    for pwd in PASSWORDS:
        try:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=pwd,
                dbname=db_name
            )
            print(f"Connected to {db_name} using password: '{'***' if pwd else ''}'")
            return conn
        except psycopg2.OperationalError as e:
            continue
    
    # Try password-less or environment fallback
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            dbname=db_name
        )
        print(f"Connected to {db_name} without password")
        return conn
    except Exception as e:
        print(f"Failed to connect to PostgreSQL: {e}")
        return None

def create_database():
    conn = get_connection("postgres")
    if not conn:
        print("Could not connect to postgres server to create database.")
        sys.exit(1)
        
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'estateiq';")
    exists = cursor.fetchone()
    
    if not exists:
        print("Creating database 'estateiq'...")
        cursor.execute("CREATE DATABASE estateiq;")
    else:
        print("Database 'estateiq' already exists.")
        
    cursor.close()
    conn.close()

def run_schema():
    conn = get_connection("estateiq")
    if not conn:
        print("Could not connect to 'estateiq' database.")
        sys.exit(1)
        
    cursor = conn.cursor()
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    
    with open(schema_path, "r") as f:
        schema_sql = f.read()
        
    print("Running schema.sql...")
    cursor.execute(schema_sql)
    conn.commit()
    cursor.close()
    conn.close()
    print("Database schema initialized successfully.")

def seed_data():
    conn = get_connection("estateiq")
    if not conn:
        print("Could not connect to 'estateiq' database for seeding.")
        sys.exit(1)
        
    cursor = conn.cursor()
    
    # 45 realistic properties
    properties = [
        # Palm Jumeirah (8M - 45M AED, lower yields 4.2% - 5.5%, high appreciation, developer Nakheel/Omniyat)
        {
            "property_name": "One Palm Residences Penthouse",
            "developer": "Omniyat",
            "community": "Palm Jumeirah",
            "price": 28500000.0,
            "bedrooms": 4,
            "bathrooms": 5,
            "sqft": 4850,
            "property_type": "Penthouse",
            "roi": 6.8,
            "rental_yield": 4.5,
            "future_appreciation": 8.5,
            "developer_rating": 9.4,
            "liquidity": 75.0,
            "risk": "Low",
            "demand": 82.0,
            "metro_distance": 2.5,
            "school_distance": 3.8,
            "hospital_distance": 1.2,
            "mall_distance": 0.8,
            "latitude": 25.1112,
            "longitude": 55.1388,
            "description": "Ultra-luxury penthouse featuring panoramic skyline and Arabian Gulf views. Designed by SOMA Architects with interiors by Super Potato. Absolute privacy and premium amenities.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Royal Atlantis Garden Suite",
            "developer": "Kerzner International",
            "community": "Palm Jumeirah",
            "price": 38000000.0,
            "bedrooms": 3,
            "bathrooms": 4,
            "sqft": 3950,
            "property_type": "Apartment",
            "roi": 7.2,
            "rental_yield": 4.2,
            "future_appreciation": 9.5,
            "developer_rating": 9.8,
            "liquidity": 80.0,
            "risk": "Low",
            "demand": 89.0,
            "metro_distance": 3.2,
            "school_distance": 4.5,
            "hospital_distance": 2.1,
            "mall_distance": 1.5,
            "latitude": 25.1380,
            "longitude": 55.1275,
            "description": "A landmark property at the iconic Royal Atlantis. Features private sky pool, landscaped terrace, and access to all Atlantis amenities and Michelin-starred restaurants.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Signature Villa Frond M",
            "developer": "Nakheel",
            "community": "Palm Jumeirah",
            "price": 45000000.0,
            "bedrooms": 6,
            "bathrooms": 7,
            "sqft": 7500,
            "property_type": "Villa",
            "roi": 6.5,
            "rental_yield": 4.0,
            "future_appreciation": 9.0,
            "developer_rating": 8.5,
            "liquidity": 65.0,
            "risk": "Medium",
            "demand": 75.0,
            "metro_distance": 4.0,
            "school_distance": 5.0,
            "hospital_distance": 3.0,
            "mall_distance": 2.2,
            "latitude": 25.1220,
            "longitude": 55.1290,
            "description": "Beachfront custom-built villa on the premium fronds. Private pool, pristine sandy beach access, beautifully landscaped gardens, and high security.",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Jumeirah Zabeel Saray Villa",
            "developer": "Nakheel",
            "community": "Palm Jumeirah",
            "price": 22000000.0,
            "bedrooms": 4,
            "bathrooms": 5,
            "sqft": 5200,
            "property_type": "Villa",
            "roi": 6.7,
            "rental_yield": 4.8,
            "future_appreciation": 7.8,
            "developer_rating": 8.5,
            "liquidity": 70.0,
            "risk": "Low",
            "demand": 78.0,
            "metro_distance": 3.8,
            "school_distance": 4.8,
            "hospital_distance": 2.5,
            "mall_distance": 2.0,
            "latitude": 25.1015,
            "longitude": 55.1185,
            "description": "Ottoman-inspired beachfront villa within the resort grounds. Exquisite marble work, private lagoon access, and five-star resort butler service.",
            "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Orla Residences by Omniyat",
            "developer": "Omniyat",
            "community": "Palm Jumeirah",
            "price": 18500000.0,
            "bedrooms": 3,
            "bathrooms": 4,
            "sqft": 3400,
            "property_type": "Apartment",
            "roi": 7.4,
            "rental_yield": 5.2,
            "future_appreciation": 8.8,
            "developer_rating": 9.4,
            "liquidity": 72.0,
            "risk": "Low",
            "demand": 85.0,
            "metro_distance": 2.8,
            "school_distance": 4.0,
            "hospital_distance": 1.8,
            "mall_distance": 1.2,
            "latitude": 25.1090,
            "longitude": 55.1210,
            "description": "Designed by Foster + Partners. Curated luxury apartments located on the crescent of Palm Jumeirah. Large floor-to-ceiling windows and premium smart home systems.",
            "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Serenia Residences Palm",
            "developer": "Palma Holding",
            "community": "Palm Jumeirah",
            "price": 8200000.0,
            "bedrooms": 2,
            "bathrooms": 3,
            "sqft": 1850,
            "property_type": "Apartment",
            "roi": 7.5,
            "rental_yield": 5.4,
            "future_appreciation": 7.0,
            "developer_rating": 8.8,
            "liquidity": 78.0,
            "risk": "Low",
            "demand": 80.0,
            "metro_distance": 3.0,
            "school_distance": 4.2,
            "hospital_distance": 2.0,
            "mall_distance": 1.4,
            "latitude": 25.1295,
            "longitude": 55.1520,
            "description": "Boutique residential community offering a peaceful resort lifestyle. Great secondary market demand and consistent rental pool performance.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },

        # Downtown Dubai (2M - 15M AED, yields 5.5% - 7.0%, high demand, developer Emaar)
        {
            "property_name": "Burj Crown Highfloor",
            "developer": "Emaar",
            "community": "Downtown Dubai",
            "price": 2800000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1050,
            "property_type": "Apartment",
            "roi": 8.2,
            "rental_yield": 6.8,
            "future_appreciation": 6.5,
            "developer_rating": 9.5,
            "liquidity": 92.0,
            "risk": "Low",
            "demand": 95.0,
            "metro_distance": 0.6,
            "school_distance": 1.5,
            "hospital_distance": 0.9,
            "mall_distance": 0.4,
            "latitude": 25.1950,
            "longitude": 55.2760,
            "description": "Stunning apartment with full views of the Burj Khalifa and Dubai Fountain. Located within walking distance of the Opera District and Dubai Mall.",
            "image_url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Opera Grand Luxury Suite",
            "developer": "Emaar",
            "community": "Downtown Dubai",
            "price": 6400000.0,
            "bedrooms": 3,
            "bathrooms": 4,
            "sqft": 2040,
            "property_type": "Apartment",
            "roi": 8.0,
            "rental_yield": 6.2,
            "future_appreciation": 7.2,
            "developer_rating": 9.5,
            "liquidity": 88.0,
            "risk": "Low",
            "demand": 91.0,
            "metro_distance": 0.3,
            "school_distance": 1.2,
            "hospital_distance": 0.8,
            "mall_distance": 0.3,
            "latitude": 25.1965,
            "longitude": 55.2740,
            "description": "Exclusive high-rise residential building in the heart of the Opera District. Features temperature-controlled rooftop pool and keyless smart door locks.",
            "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Il Primo Premium Penthouse",
            "developer": "Emaar",
            "community": "Downtown Dubai",
            "price": 14500000.0,
            "bedrooms": 5,
            "bathrooms": 6,
            "sqft": 5300,
            "property_type": "Penthouse",
            "roi": 7.8,
            "rental_yield": 5.5,
            "future_appreciation": 8.0,
            "developer_rating": 9.5,
            "liquidity": 78.0,
            "risk": "Low",
            "demand": 85.0,
            "metro_distance": 0.2,
            "school_distance": 1.4,
            "hospital_distance": 0.7,
            "mall_distance": 0.2,
            "latitude": 25.1970,
            "longitude": 55.2750,
            "description": "Spacious penthouse spanning half a floor. Elegant marble finishes, private elevator, state-of-the-art home theater, and direct views of the Burj Khalifa.",
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Downtown Views II",
            "developer": "Emaar",
            "community": "Downtown Dubai",
            "price": 2100000.0,
            "bedrooms": 1,
            "bathrooms": 2,
            "sqft": 850,
            "property_type": "Apartment",
            "roi": 8.5,
            "rental_yield": 7.0,
            "future_appreciation": 6.2,
            "developer_rating": 9.5,
            "liquidity": 94.0,
            "risk": "Low",
            "demand": 96.0,
            "metro_distance": 0.5,
            "school_distance": 1.6,
            "hospital_distance": 1.1,
            "mall_distance": 0.1,
            "latitude": 25.2030,
            "longitude": 55.2810,
            "description": "Directly connected to Dubai Mall Extension. High floor 1-bed ideal for short-term rental yields and corporate professionals.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "DT1 Luxury Residence",
            "developer": "Ellington Properties",
            "community": "Downtown Dubai",
            "price": 4200000.0,
            "bedrooms": 2,
            "bathrooms": 3,
            "sqft": 1500,
            "property_type": "Apartment",
            "roi": 8.4,
            "rental_yield": 6.6,
            "future_appreciation": 7.0,
            "developer_rating": 9.2,
            "liquidity": 85.0,
            "risk": "Low",
            "demand": 88.0,
            "metro_distance": 0.8,
            "school_distance": 1.0,
            "hospital_distance": 1.2,
            "mall_distance": 0.6,
            "latitude": 25.1915,
            "longitude": 55.2690,
            "description": "Award-winning boutique design with semi-open custom kitchens, integrated Miele appliances, and a highly sophisticated lobby lounge.",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "The Residence Burj Khalifa",
            "developer": "Emaar",
            "community": "Downtown Dubai",
            "price": 9500000.0,
            "bedrooms": 3,
            "bathrooms": 4,
            "sqft": 3100,
            "property_type": "Apartment",
            "roi": 7.6,
            "rental_yield": 5.8,
            "future_appreciation": 7.8,
            "developer_rating": 9.5,
            "liquidity": 82.0,
            "risk": "Low",
            "demand": 87.0,
            "metro_distance": 0.4,
            "school_distance": 1.1,
            "hospital_distance": 0.8,
            "mall_distance": 0.2,
            "latitude": 25.1960,
            "longitude": 55.2745,
            "description": "Classic luxury residences adjacent to the main boulevard. High occupancy rate and prestige branding value.",
            "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        },

        # Dubai Marina / JBR (1.5M - 8M AED, yields 6.2% - 8.0%, stable demand, developer Select Group/Emaar/Sobha)
        {
            "property_name": "Marina Gate Tower I",
            "developer": "Select Group",
            "community": "Dubai Marina",
            "price": 3400000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1320,
            "property_type": "Apartment",
            "roi": 8.7,
            "rental_yield": 7.2,
            "future_appreciation": 5.5,
            "developer_rating": 9.0,
            "liquidity": 93.0,
            "risk": "Low",
            "demand": 94.0,
            "metro_distance": 0.2,
            "school_distance": 2.5,
            "hospital_distance": 0.5,
            "mall_distance": 0.8,
            "latitude": 25.0885,
            "longitude": 55.1430,
            "description": "Premium development at the entrance of Dubai Marina. Features high-quality finishing, a large temperature-controlled infinity pool, and direct access to the Marina Walk.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "52|42 Towers Highfloor",
            "developer": "Emaar",
            "community": "Dubai Marina",
            "price": 2600000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1150,
            "property_type": "Apartment",
            "roi": 8.5,
            "rental_yield": 7.0,
            "future_appreciation": 5.8,
            "developer_rating": 9.5,
            "liquidity": 91.0,
            "risk": "Low",
            "demand": 92.0,
            "metro_distance": 0.9,
            "school_distance": 3.0,
            "hospital_distance": 1.2,
            "mall_distance": 1.1,
            "latitude": 25.0740,
            "longitude": 55.1290,
            "description": "Two iconic towers overlooking the Marina and the sea. High demand from tenants due to unobstructed sunset views and standard premium infrastructure.",
            "image_url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Sobha Marina Tower",
            "developer": "Sobha Realty",
            "community": "Dubai Marina",
            "price": 5800000.0,
            "bedrooms": 3,
            "bathrooms": 4,
            "sqft": 2200,
            "property_type": "Apartment",
            "roi": 8.9,
            "rental_yield": 6.8,
            "future_appreciation": 6.8,
            "developer_rating": 9.3,
            "liquidity": 86.0,
            "risk": "Low",
            "demand": 89.0,
            "metro_distance": 0.4,
            "school_distance": 2.2,
            "hospital_distance": 0.7,
            "mall_distance": 0.9,
            "latitude": 25.0850,
            "longitude": 55.1415,
            "description": "Ultra-premium quality finishes. Smart home technology integration, solid teak wood doors, and fully fitted Siemens kitchen appliances.",
            "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "La Vie Residences JBR",
            "developer": "Dubai Properties",
            "community": "JBR",
            "price": 7200000.0,
            "bedrooms": 3,
            "bathrooms": 4,
            "sqft": 2050,
            "property_type": "Apartment",
            "roi": 8.3,
            "rental_yield": 6.4,
            "future_appreciation": 6.2,
            "developer_rating": 8.8,
            "liquidity": 83.0,
            "risk": "Low",
            "demand": 87.0,
            "metro_distance": 0.8,
            "school_distance": 3.2,
            "hospital_distance": 1.5,
            "mall_distance": 0.5,
            "latitude": 25.0775,
            "longitude": 55.1320,
            "description": "Miami-inspired beachfront living in Jumeirah Beach Residence. Infinite ocean views and private beach access.",
            "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Sadaf 4 Apartment JBR",
            "developer": "Dubai Properties",
            "community": "JBR",
            "price": 1950000.0,
            "bedrooms": 1,
            "bathrooms": 2,
            "sqft": 980,
            "property_type": "Apartment",
            "roi": 8.8,
            "rental_yield": 7.6,
            "future_appreciation": 4.5,
            "developer_rating": 8.8,
            "liquidity": 90.0,
            "risk": "Low",
            "demand": 93.0,
            "metro_distance": 0.5,
            "school_distance": 2.8,
            "hospital_distance": 0.9,
            "mall_distance": 0.3,
            "latitude": 25.0790,
            "longitude": 55.1335,
            "description": "Spacious, established residence in JBR with high rental velocity. Popular for holiday home short-term yields.",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Marina Promenade Tower",
            "developer": "Emaar",
            "community": "Dubai Marina",
            "price": 4100000.0,
            "bedrooms": 2,
            "bathrooms": 3,
            "sqft": 1450,
            "property_type": "Apartment",
            "roi": 8.6,
            "rental_yield": 7.0,
            "future_appreciation": 5.5,
            "developer_rating": 9.5,
            "liquidity": 91.0,
            "risk": "Low",
            "demand": 92.0,
            "metro_distance": 0.3,
            "school_distance": 2.4,
            "hospital_distance": 0.6,
            "mall_distance": 0.7,
            "latitude": 25.0800,
            "longitude": 55.1380,
            "description": "Premium Emaar enclave in the heart of the Marina. High-quality fixtures, excellent pool decks, and Squash courts.",
            "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        },

        # Business Bay (1.2M - 5M AED, yields 7.0% - 8.5%, close to Downtown, developer DAMAC/Omniyat/Deyaar)
        {
            "property_name": "The Opus Luxury Suite",
            "developer": "Omniyat",
            "community": "Business Bay",
            "price": 4800000.0,
            "bedrooms": 2,
            "bathrooms": 3,
            "sqft": 1650,
            "property_type": "Apartment",
            "roi": 8.9,
            "rental_yield": 7.4,
            "future_appreciation": 6.8,
            "developer_rating": 9.4,
            "liquidity": 84.0,
            "risk": "Low",
            "demand": 88.0,
            "metro_distance": 0.7,
            "school_distance": 1.8,
            "hospital_distance": 1.0,
            "mall_distance": 0.9,
            "latitude": 25.1843,
            "longitude": 55.2670,
            "description": "An architectural masterpiece designed by Dame Zaha Hadid. Fully furnished with bespoke furniture, outstanding canvas views of the canal, and premium hotel facilities.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "DAMAC Privé Water Canal",
            "developer": "DAMAC Properties",
            "community": "Business Bay",
            "price": 1450000.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "sqft": 820,
            "property_type": "Apartment",
            "roi": 9.1,
            "rental_yield": 8.2,
            "future_appreciation": 5.0,
            "developer_rating": 8.8,
            "liquidity": 92.0,
            "risk": "Medium",
            "demand": 94.0,
            "metro_distance": 1.1,
            "school_distance": 2.0,
            "hospital_distance": 1.3,
            "mall_distance": 1.2,
            "latitude": 25.1810,
            "longitude": 55.2810,
            "description": "Waterfront serviced apartment offering direct views of the Dubai Water Canal. Fully managed by DAMAC rental program to yield optimal returns.",
            "image_url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Regalia Premium Tower",
            "developer": "Deyaar",
            "community": "Business Bay",
            "price": 2200000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1250,
            "property_type": "Apartment",
            "roi": 8.7,
            "rental_yield": 7.8,
            "future_appreciation": 5.4,
            "developer_rating": 8.2,
            "liquidity": 88.0,
            "risk": "Medium",
            "demand": 90.0,
            "metro_distance": 0.8,
            "school_distance": 2.2,
            "hospital_distance": 1.6,
            "mall_distance": 1.4,
            "latitude": 25.1795,
            "longitude": 55.2715,
            "description": "Smart-home enabled apartments. Features a infinity pool, private cinema, retail arcade, and comprehensive fitness center.",
            "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Vela by Omniyat",
            "developer": "Omniyat",
            "community": "Business Bay",
            "price": 12500000.0,
            "bedrooms": 4,
            "bathrooms": 5,
            "sqft": 4200,
            "property_type": "Apartment",
            "roi": 8.2,
            "rental_yield": 5.8,
            "future_appreciation": 9.2,
            "developer_rating": 9.4,
            "liquidity": 70.0,
            "risk": "Low",
            "demand": 82.0,
            "metro_distance": 1.3,
            "school_distance": 2.5,
            "hospital_distance": 1.9,
            "mall_distance": 1.8,
            "latitude": 25.1850,
            "longitude": 55.2930,
            "description": "Ultra-luxury water canal residences managed by Dorchester Collection. Double height ceilings and private pools.",
            "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Peninsula One Residences",
            "developer": "Select Group",
            "community": "Business Bay",
            "price": 1850000.0,
            "bedrooms": 1,
            "bathrooms": 1,
            "sqft": 740,
            "property_type": "Apartment",
            "roi": 9.0,
            "rental_yield": 8.0,
            "future_appreciation": 6.0,
            "developer_rating": 9.0,
            "liquidity": 91.0,
            "risk": "Low",
            "demand": 93.0,
            "metro_distance": 0.9,
            "school_distance": 1.9,
            "hospital_distance": 1.4,
            "mall_distance": 1.0,
            "latitude": 25.1880,
            "longitude": 55.2750,
            "description": "Premium mid-rise water-facing apartments. Modern open-plan layouts built by select group, highly popular with young professionals.",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Merano Tower Studio",
            "developer": "DAMAC Properties",
            "community": "Business Bay",
            "price": 850000.0,
            "bedrooms": 0, # Studio
            "bathrooms": 1,
            "sqft": 480,
            "property_type": "Apartment",
            "roi": 9.4,
            "rental_yield": 8.8,
            "future_appreciation": 4.2,
            "developer_rating": 8.8,
            "liquidity": 95.0,
            "risk": "Medium",
            "demand": 97.0,
            "metro_distance": 0.4,
            "school_distance": 2.4,
            "hospital_distance": 1.1,
            "mall_distance": 1.3,
            "latitude": 25.1830,
            "longitude": 55.2630,
            "description": "High yield studio right next to the Business Bay metro. Extremely fast rental occupancy turnaround.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },

        # JVC (750k - 2.5M AED, yields 7.5% - 9.5%, moderate appreciation, developer Binghatti/Ellington)
        {
            "property_name": "Binghatti Crest Resident",
            "developer": "Binghatti",
            "community": "JVC",
            "price": 950000.0,
            "bedrooms": 1,
            "bathrooms": 2,
            "sqft": 780,
            "property_type": "Apartment",
            "roi": 9.6,
            "rental_yield": 8.9,
            "future_appreciation": 4.5,
            "developer_rating": 8.0,
            "liquidity": 94.0,
            "risk": "Medium",
            "demand": 96.0,
            "metro_distance": 3.5,
            "school_distance": 0.5,
            "hospital_distance": 1.8,
            "mall_distance": 0.9,
            "latitude": 25.0650,
            "longitude": 55.2040,
            "description": "Signature Binghatti design elements. Promising investment opportunity yielding stable rental cash flows. Quick access to major roads.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Belgravia III Boutique",
            "developer": "Ellington Properties",
            "community": "JVC",
            "price": 1600000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1280,
            "property_type": "Apartment",
            "roi": 9.4,
            "rental_yield": 8.2,
            "future_appreciation": 5.8,
            "developer_rating": 9.2,
            "liquidity": 89.0,
            "risk": "Low",
            "demand": 91.0,
            "metro_distance": 4.0,
            "school_distance": 0.3,
            "hospital_distance": 2.0,
            "mall_distance": 0.7,
            "latitude": 25.0590,
            "longitude": 55.1980,
            "description": "Premium boutique living in JVC. Ellington's focus on design-led properties delivers high tenant retention and above-average community premiums.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Danube Elitz Residences",
            "developer": "Danube Properties",
            "community": "JVC",
            "price": 1150000.0,
            "bedrooms": 1,
            "bathrooms": 2,
            "sqft": 820,
            "property_type": "Apartment",
            "roi": 9.5,
            "rental_yield": 8.6,
            "future_appreciation": 4.0,
            "developer_rating": 8.0,
            "liquidity": 91.0,
            "risk": "Medium",
            "demand": 93.0,
            "metro_distance": 3.8,
            "school_distance": 0.8,
            "hospital_distance": 2.2,
            "mall_distance": 0.6,
            "latitude": 25.0605,
            "longitude": 55.2010,
            "description": "Fully furnished luxury apartments with a unique 1% monthly payment plan option. Yielding excellent short-term ROI stats.",
            "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Plazzo Residence 2 Bed",
            "developer": "Plazzo",
            "community": "JVC",
            "price": 1380000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1150,
            "property_type": "Apartment",
            "roi": 9.2,
            "rental_yield": 8.4,
            "future_appreciation": 3.8,
            "developer_rating": 7.5,
            "liquidity": 87.0,
            "risk": "Medium",
            "demand": 89.0,
            "metro_distance": 4.2,
            "school_distance": 0.6,
            "hospital_distance": 2.5,
            "mall_distance": 0.8,
            "latitude": 25.0630,
            "longitude": 55.2060,
            "description": "Spacious family layout in the heart of JVC. Rooftop pool and walking distance to the Circle Mall.",
            "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Ellington Plaza Smart Townhouse",
            "developer": "Ellington Properties",
            "community": "JVC",
            "price": 2400000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2100,
            "property_type": "Townhouse",
            "roi": 9.1,
            "rental_yield": 7.5,
            "future_appreciation": 6.5,
            "developer_rating": 9.2,
            "liquidity": 80.0,
            "risk": "Low",
            "demand": 88.0,
            "metro_distance": 4.5,
            "school_distance": 0.2,
            "hospital_distance": 2.8,
            "mall_distance": 1.1,
            "latitude": 25.0570,
            "longitude": 55.1950,
            "description": "Boutique townhouse development with premium wood paneling, private gardens, and energy-efficient lighting.",
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Binghatti Heights 2 Bed",
            "developer": "Binghatti",
            "community": "JVC",
            "price": 1250000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1050,
            "property_type": "Apartment",
            "roi": 9.5,
            "rental_yield": 8.7,
            "future_appreciation": 4.3,
            "developer_rating": 8.0,
            "liquidity": 92.0,
            "risk": "Medium",
            "demand": 94.0,
            "metro_distance": 3.7,
            "school_distance": 0.7,
            "hospital_distance": 1.9,
            "mall_distance": 0.8,
            "latitude": 25.0645,
            "longitude": 55.2025,
            "description": "Featuring signature geometric balconies and high floor-to-ceiling windows. Prime location close to exit.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },

        # Dubai Hills Estate (2.8M - 18M AED, yields 6.2% - 7.5%, excellent infra, developer Emaar)
        {
            "property_name": "Park Horizon Boulevard",
            "developer": "Emaar",
            "community": "Dubai Hills Estate",
            "price": 3200000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1180,
            "property_type": "Apartment",
            "roi": 8.3,
            "rental_yield": 6.8,
            "future_appreciation": 7.0,
            "developer_rating": 9.5,
            "liquidity": 90.0,
            "risk": "Low",
            "demand": 92.0,
            "metro_distance": 1.8,
            "school_distance": 0.8,
            "hospital_distance": 0.5,
            "mall_distance": 0.6,
            "latitude": 25.1180,
            "longitude": 55.2750,
            "description": "Stunning apartment overlooking Dubai Hills Park. Located near the championship golf course and Kings College Hospital, representing top-tier infrastructure score.",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Golf Heights Residence",
            "developer": "Emaar",
            "community": "Dubai Hills Estate",
            "price": 5400000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2020,
            "property_type": "Apartment",
            "roi": 8.1,
            "rental_yield": 6.4,
            "future_appreciation": 7.6,
            "developer_rating": 9.5,
            "liquidity": 85.0,
            "risk": "Low",
            "demand": 89.0,
            "metro_distance": 2.2,
            "school_distance": 1.0,
            "hospital_distance": 0.8,
            "mall_distance": 1.0,
            "latitude": 25.1140,
            "longitude": 55.2790,
            "description": "High-rise tower facing the championship golf course. Excellent family layouts and top-end wellness amenities.",
            "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Hills Grove Luxury Villa",
            "developer": "Emaar",
            "community": "Dubai Hills Estate",
            "price": 18000000.0,
            "bedrooms": 6,
            "bathrooms": 7,
            "sqft": 8200,
            "property_type": "Villa",
            "roi": 7.4,
            "rental_yield": 5.5,
            "future_appreciation": 8.5,
            "developer_rating": 9.5,
            "liquidity": 68.0,
            "risk": "Low",
            "demand": 80.0,
            "metro_distance": 3.0,
            "school_distance": 1.2,
            "hospital_distance": 1.4,
            "mall_distance": 1.5,
            "latitude": 25.1090,
            "longitude": 55.2710,
            "description": "Ultra-exclusive golf course mansion. Features private wellness club, personal gymnasium, grand double-height foyer, and massive landscaped plot.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Maple Townhouse Phase 2",
            "developer": "Emaar",
            "community": "Dubai Hills Estate",
            "price": 3800000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2220,
            "property_type": "Townhouse",
            "roi": 8.0,
            "rental_yield": 7.2,
            "future_appreciation": 6.0,
            "developer_rating": 9.5,
            "liquidity": 89.0,
            "risk": "Low",
            "demand": 93.0,
            "metro_distance": 2.5,
            "school_distance": 0.4,
            "hospital_distance": 1.0,
            "mall_distance": 1.2,
            "latitude": 25.1220,
            "longitude": 55.2810,
            "description": "Highly demanded townhouse community connected by lush green corridors. Excellent school district coordinates.",
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Acacia Park Residences",
            "developer": "Emaar",
            "community": "Dubai Hills Estate",
            "price": 2500000.0,
            "bedrooms": 1,
            "bathrooms": 2,
            "sqft": 920,
            "property_type": "Apartment",
            "roi": 8.4,
            "rental_yield": 7.0,
            "future_appreciation": 6.5,
            "developer_rating": 9.5,
            "liquidity": 92.0,
            "risk": "Low",
            "demand": 94.0,
            "metro_distance": 1.7,
            "school_distance": 0.7,
            "hospital_distance": 0.6,
            "mall_distance": 0.8,
            "latitude": 25.1165,
            "longitude": 55.2730,
            "description": "Lush parkland settings. Large open balcony, high occupancy rate with long-term tenant agreements.",
            "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Park Field 2 Bed",
            "developer": "Emaar",
            "community": "Dubai Hills Estate",
            "price": 2900000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1100,
            "property_type": "Apartment",
            "roi": 8.3,
            "rental_yield": 6.7,
            "future_appreciation": 6.8,
            "developer_rating": 9.5,
            "liquidity": 90.0,
            "risk": "Low",
            "demand": 91.0,
            "metro_distance": 2.0,
            "school_distance": 0.9,
            "hospital_distance": 0.7,
            "mall_distance": 0.8,
            "latitude": 25.1190,
            "longitude": 55.2760,
            "description": "Modern apartments next to Dubai Hills Boulevard. High-grade infrastructure score and proximity to shopping hub.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },

        # Arabian Ranches (4M - 15M AED, yields 5.5% - 6.8%, family-first, developer Emaar)
        {
            "property_name": "Caya Villa Executive",
            "developer": "Emaar",
            "community": "Arabian Ranches",
            "price": 5500000.0,
            "bedrooms": 4,
            "bathrooms": 5,
            "sqft": 4100,
            "property_type": "Villa",
            "roi": 7.9,
            "rental_yield": 6.2,
            "future_appreciation": 6.8,
            "developer_rating": 9.5,
            "liquidity": 80.0,
            "risk": "Low",
            "demand": 86.0,
            "metro_distance": 6.5,
            "school_distance": 0.4,
            "hospital_distance": 1.5,
            "mall_distance": 2.5,
            "latitude": 25.0449,
            "longitude": 55.2638,
            "description": "Premium standalone villa with spacious rooftop terrace, private backyard garden, and proximity to the Arabian Ranches Golf Club.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Joy Townhouses Phase 1",
            "developer": "Emaar",
            "community": "Arabian Ranches",
            "price": 3200000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 1950,
            "property_type": "Townhouse",
            "roi": 8.2,
            "rental_yield": 6.8,
            "future_appreciation": 5.4,
            "developer_rating": 9.5,
            "liquidity": 88.0,
            "risk": "Low",
            "demand": 90.0,
            "metro_distance": 7.0,
            "school_distance": 0.6,
            "hospital_distance": 2.0,
            "mall_distance": 3.0,
            "latitude": 25.0410,
            "longitude": 55.2610,
            "description": "Lovely family townhouse in a secure gated community. Features splash pads, outdoor cinema, clubhouses, and multiple children play areas.",
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Yasmin Luxury Villa",
            "developer": "Emaar",
            "community": "Arabian Ranches",
            "price": 9800000.0,
            "bedrooms": 5,
            "bathrooms": 5,
            "sqft": 5400,
            "property_type": "Villa",
            "roi": 7.6,
            "rental_yield": 5.8,
            "future_appreciation": 7.2,
            "developer_rating": 9.5,
            "liquidity": 74.0,
            "risk": "Low",
            "demand": 82.0,
            "metro_distance": 6.2,
            "school_distance": 0.5,
            "hospital_distance": 1.2,
            "mall_distance": 2.2,
            "latitude": 25.0470,
            "longitude": 55.2660,
            "description": "Arabian-themed villa featuring elegant arches and high woodwork. Massive landscaped garden and custom pool.",
            "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Reem Townhouses",
            "developer": "Emaar",
            "community": "Arabian Ranches",
            "price": 2800000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2200,
            "property_type": "Townhouse",
            "roi": 8.4,
            "rental_yield": 7.0,
            "future_appreciation": 5.0,
            "developer_rating": 9.5,
            "liquidity": 89.0,
            "risk": "Low",
            "demand": 91.0,
            "metro_distance": 7.5,
            "school_distance": 0.8,
            "hospital_distance": 2.2,
            "mall_distance": 3.2,
            "latitude": 25.0380,
            "longitude": 55.2580,
            "description": "Affordable luxury townhouse for young families. Access to the Arabian Ranches lake and central park.",
            "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Saheel Golf Villa",
            "developer": "Emaar",
            "community": "Arabian Ranches",
            "price": 8500000.0,
            "bedrooms": 5,
            "bathrooms": 6,
            "sqft": 5100,
            "property_type": "Villa",
            "roi": 7.7,
            "rental_yield": 5.9,
            "future_appreciation": 7.0,
            "developer_rating": 9.5,
            "liquidity": 76.0,
            "risk": "Low",
            "demand": 83.0,
            "metro_distance": 6.8,
            "school_distance": 0.3,
            "hospital_distance": 1.7,
            "mall_distance": 2.8,
            "latitude": 25.0460,
            "longitude": 55.2650,
            "description": "Right on the golf course with beautiful view of fairways. Highly requested model with large family lounge.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        },
        {
            "property_name": "Alma Townhouse",
            "developer": "Emaar",
            "community": "Arabian Ranches",
            "price": 2900000.0,
            "bedrooms": 2,
            "bathrooms": 2,
            "sqft": 1900,
            "property_type": "Townhouse",
            "roi": 8.3,
            "rental_yield": 7.1,
            "future_appreciation": 4.8,
            "developer_rating": 9.5,
            "liquidity": 90.0,
            "risk": "Low",
            "demand": 92.0,
            "metro_distance": 7.2,
            "school_distance": 0.5,
            "hospital_distance": 1.9,
            "mall_distance": 2.9,
            "latitude": 25.0400,
            "longitude": 55.2600,
            "description": "Spanish style townhouse close to community center. Walkable to school and community retail.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        },

        # Extra Premium properties to fill out the 45 count cleanly
        # Palm Jumeirah Extra
        {
            "property_name": "Ellington Beach House",
            "developer": "Ellington Properties",
            "community": "Palm Jumeirah",
            "price": 11200000.0,
            "bedrooms": 2,
            "bathrooms": 3,
            "sqft": 2100,
            "property_type": "Apartment",
            "roi": 7.7,
            "rental_yield": 5.1,
            "future_appreciation": 8.9,
            "developer_rating": 9.2,
            "liquidity": 76.0,
            "risk": "Low",
            "demand": 84.0,
            "metro_distance": 2.9,
            "school_distance": 4.1,
            "hospital_distance": 1.9,
            "mall_distance": 1.3,
            "latitude": 25.1205,
            "longitude": 55.1480,
            "description": "Iconic beach house style with private cabanas, wellness center, hydrotherapy pool, and high boutique finishing levels.",
            "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
        },
        # Downtown Dubai Extra
        {
            "property_name": "Address Residences Opera",
            "developer": "Emaar",
            "community": "Downtown Dubai",
            "price": 8200000.0,
            "bedrooms": 3,
            "bathrooms": 3,
            "sqft": 2400,
            "property_type": "Apartment",
            "roi": 7.9,
            "rental_yield": 6.0,
            "future_appreciation": 7.5,
            "developer_rating": 9.5,
            "liquidity": 86.0,
            "risk": "Low",
            "demand": 90.0,
            "metro_distance": 0.4,
            "school_distance": 1.3,
            "hospital_distance": 0.9,
            "mall_distance": 0.3,
            "latitude": 25.1955,
            "longitude": 55.2755,
            "description": "Fully serviced luxury hotel apartment by the Address brand, adjacent to the Dubai Opera. Top-tier luxury services.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        },
        # JVC Extra
        {
            "property_name": "Belgravia Square Modern",
            "developer": "Ellington Properties",
            "community": "JVC",
            "price": 1050000.0,
            "bedrooms": 1,
            "bathrooms": 2,
            "sqft": 850,
            "property_type": "Apartment",
            "roi": 9.5,
            "rental_yield": 8.7,
            "future_appreciation": 5.2,
            "developer_rating": 9.2,
            "liquidity": 91.0,
            "risk": "Low",
            "demand": 93.0,
            "metro_distance": 3.9,
            "school_distance": 0.4,
            "hospital_distance": 2.1,
            "mall_distance": 0.8,
            "latitude": 25.0620,
            "longitude": 55.1990,
            "description": "Sleek and minimalist design with custom lighting, built-in wardrobes, and beautiful courtyard pool views.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
        }
    ]
    
    # Insert properties
    print(f"Seeding {len(properties)} properties...")
    for prop in properties:
        cursor.execute(
            """
            INSERT INTO properties (
                property_name, developer, community, price, bedrooms, bathrooms, sqft, property_type,
                roi, rental_yield, future_appreciation, developer_rating, liquidity, risk, demand,
                metro_distance, school_distance, hospital_distance, mall_distance, latitude, longitude,
                description, image_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (
                prop["property_name"], prop["developer"], prop["community"], prop["price"], prop["bedrooms"],
                prop["bathrooms"], prop["sqft"], prop["property_type"], prop["roi"], prop["rental_yield"],
                prop["future_appreciation"], prop["developer_rating"], prop["liquidity"], prop["risk"],
                prop["demand"], prop["metro_distance"], prop["school_distance"], prop["hospital_distance"],
                prop["mall_distance"], prop["latitude"], prop["longitude"], prop["description"], prop["image_url"]
            )
        )
    
    # 5 Sample CRM Clients
    clients = [
        ("Sarah Jenkins", "+971 50 123 4567", "sarah.j@outlook.com", 3500000.0, "Wants high rental yield in JVC or Business Bay. Prefers 1 or 2 bedrooms, fully furnished.", "13,20", "Discussed Belgravia II, likes Ellington build quality. Next follow-up is on Tuesday.", "2026-07-29", "Active"),
        ("Marcus Aurelius", "+44 7911 123456", "marcus.aurelius@rome.com", 25000000.0, "Looking for a luxury beachfront villa/penthouse in Palm Jumeirah. Holding period: 7+ years.", "1,2,3", "Prefers Kerzner or Omniyat projects. Not interested in JVC. Cash buyer.", "2026-08-01", "Active"),
        ("Tariq Al-Mansoor", "+971 52 987 6543", "t.almansoor@emirates.ae", 8000000.0, "Wants Downtown views and Emaar quality. A 3-bed for family use and asset protection.", "8,14", "Wants to meet in the Downtown office to review payment plans. Likes Address brand.", "2026-07-28", "Active"),
        ("Yuki Tanaka", "+81 90 1234 5678", "yuki.tanaka@tokyo.jp", 1800000.0, "Passive income investor. Target yield: > 7.5%. Prefers studio or 1-bed near Metro.", "10,18", "Emailed details on Regalia. Concerned about school distances. Explained that business professionals don't need schools nearby.", "2026-08-03", "Active"),
        ("Michael Chang", "+1 415 555 0199", "mchang@sf-invest.com", 5000000.0, "Wants high appreciation potential. Moderate risk, looking at Dubai Hills Estate.", "19,25", "Reviewing golf heights details. Likes the hospital proximity.", "2026-07-31", "Active")
    ]
    
    print(f"Seeding {len(clients)} CRM clients...")
    for name, phone, email, budget, reqs, iprops, notes, fdate, status in clients:
        cursor.execute(
            """
            INSERT INTO clients (name, phone, email, budget, requirements, interested_properties, meeting_notes, follow_up_date, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (name, phone, email, budget, reqs, iprops, notes, fdate, status)
        )
        
    # Seed Leads for Kanban Pipeline
    leads = [
        # New Lead
        ("Sarah Jenkins", "sarah.j@outlook.com", "+971 50 123 4567", 3500000.0, 13, 3400000.0, "New Lead", "2026-07-24", "Schedule introductory call"),
        # Contacted
        ("Yuki Tanaka", "yuki.tanaka@tokyo.jp", "+81 90 1234 5678", 1800000.0, 18, 1850000.0, "Contacted", "2026-07-23", "Send ROI calculations comparison table"),
        # Meeting Scheduled
        ("Tariq Al-Mansoor", "t.almansoor@emirates.ae", "+971 52 987 6543", 8000000.0, 8, 8200000.0, "Meeting Scheduled", "2026-07-25", "Property viewing Downtown at 2 PM"),
        # Negotiation
        ("Michael Chang", "mchang@sf-invest.com", "+1 415 555 0199", 5000000.0, 19, 4800000.0, "Negotiation", "2026-07-22", "Finalize payment plan structuring"),
        # Closed
        ("Elena Petrova", "elena.p@moscow.ru", "+7 903 123 4567", 12000000.0, 5, 12500000.0, "Closed", "2026-07-15", "SPA signed and deposit received"),
        # Lost
        ("John Doe", "john.doe@gmail.com", "+1 555 0190", 2000000.0, None, 0.0, "Lost", "2026-07-10", "Lost to developer direct sales team")
    ]
    
    print(f"Seeding {len(leads)} pipeline deals...")
    for client_name, email, phone, budget, prop_id, value, stage, last_contact, next_action in leads:
        cursor.execute(
            """
            INSERT INTO leads (client_name, email, phone, budget, property_id, value, stage, last_contact, next_action)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (client_name, email, phone, budget, prop_id, value, stage, last_contact, next_action)
        )
        
    conn.commit()
    cursor.close()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    create_database()
    run_schema()
    seed_data()
