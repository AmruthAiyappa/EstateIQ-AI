from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.db import get_db_cursor
from backend.models import Property

router = APIRouter(prefix="/api/properties", tags=["Properties"])

def calculate_investment_score(prop_dict) -> float:
    """
    Weighted Investment Score out of 100:
    - Rental Yield: 30% (Yield * 11, capped at 100)
    - Appreciation: 25% (Appreciation * 11, capped at 100)
    - Infrastructure: 15% (Computed based on proximity to amenities)
    - Developer Rating: 10% (Rating out of 10 * 10)
    - Demand: 10% (0-100)
    - Liquidity: 10% (0-100)
    """
    rental_yield = float(prop_dict.get("rental_yield", 0))
    appreciation = float(prop_dict.get("future_appreciation", 0))
    dev_rating = float(prop_dict.get("developer_rating", 0))
    demand = float(prop_dict.get("demand", 0))
    liquidity = float(prop_dict.get("liquidity", 0))
    
    # Proximity calculations
    metro = float(prop_dict.get("metro_distance", 2.0))
    school = float(prop_dict.get("school_distance", 2.0))
    hospital = float(prop_dict.get("hospital_distance", 2.0))
    mall = float(prop_dict.get("mall_distance", 2.0))
    
    yield_score = min(100.0, rental_yield * 11.0)
    appreciation_score = min(100.0, appreciation * 11.0)
    
    # Proximity score: closer is better. If total distance = 0, score = 100. If total distance = 10km+, score = 0.
    total_dist = metro + school + hospital + mall
    infra_score = max(0.0, min(100.0, 100.0 - (total_dist * 8.0)))
    
    dev_score = dev_rating * 10.0
    
    final_score = (
        (yield_score * 0.30) +
        (appreciation_score * 0.25) +
        (infra_score * 0.15) +
        (dev_score * 0.10) +
        (demand * 0.10) +
        (liquidity * 0.10)
    )
    return round(final_score, 1)

def map_db_to_property(row, cursor_description) -> Property:
    """Helper to convert db row to Pydantic Property model."""
    columns = [col[0] for col in cursor_description]
    prop_dict = dict(zip(columns, row))
    
    # Calculate score
    score = calculate_investment_score(prop_dict)
    prop_dict["investment_score"] = score
    
    # Map to model
    return Property(**prop_dict)

@router.get("", response_model=List[Property])
def list_properties(
    community: Optional[str] = Query(None, description="Filter by community"),
    property_type: Optional[str] = Query(None, description="Filter by type (Apartment/Villa/Penthouse/Townhouse)"),
    bedrooms: Optional[int] = Query(None, description="Filter by number of bedrooms"),
    min_price: Optional[float] = Query(None, description="Minimum price in AED"),
    max_price: Optional[float] = Query(None, description="Maximum price in AED"),
    min_yield: Optional[float] = Query(None, description="Minimum rental yield percentage"),
    risk: Optional[str] = Query(None, description="Filter by risk profile (Low/Medium/High)")
):
    """Fetch properties matching optional filters with full analytical metrics."""
    query = "SELECT * FROM properties WHERE 1=1"
    params = []
    
    if community:
        query += " AND community = %s"
        params.append(community)
        
    if property_type:
        query += " AND property_type = %s"
        params.append(property_type)
        
    if bedrooms is not None:
        query += " AND bedrooms = %s"
        params.append(bedrooms)
        
    if min_price is not None:
        query += " AND price >= %s"
        params.append(min_price)
        
    if max_price is not None:
        query += " AND price <= %s"
        params.append(max_price)
        
    if min_yield is not None:
        query += " AND rental_yield >= %s"
        params.append(min_yield)
        
    if risk:
        query += " AND risk = %s"
        params.append(risk)
        
    query += " ORDER BY price ASC"
    
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            return [map_db_to_property(row, cursor.description) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.get("/{property_id}", response_model=Property)
def get_property(property_id: int):
    """Retrieve detailed analytics for a single property."""
    query = "SELECT * FROM properties WHERE id = %s"
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query, (property_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Property not found")
            return map_db_to_property(row, cursor.description)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
