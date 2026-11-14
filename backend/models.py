from typing import List, Optional
from pydantic import BaseModel, Field

# Property Schema
class Property(BaseModel):
    id: int
    property_name: str
    developer: str
    community: str
    price: float
    bedrooms: int
    bathrooms: int
    sqft: int
    property_type: str
    roi: float
    rental_yield: float
    future_appreciation: float
    developer_rating: float
    liquidity: float
    risk: str
    demand: float
    metro_distance: float
    school_distance: float
    hospital_distance: float
    mall_distance: float
    latitude: float
    longitude: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    investment_score: Optional[float] = None  # Calculated dynamically

# CRM Client Schemas
class Client(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    email: str
    budget: float
    requirements: Optional[str] = None
    interested_properties: Optional[str] = None  # comma-separated IDs
    meeting_notes: Optional[str] = None
    follow_up_date: Optional[str] = None
    status: str

class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: str
    budget: float
    requirements: Optional[str] = None
    interested_properties: Optional[str] = None
    meeting_notes: Optional[str] = None
    follow_up_date: Optional[str] = None

# Lead / Pipeline Schemas
class Lead(BaseModel):
    id: int
    client_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    budget: float
    property_id: Optional[int] = None
    value: float
    stage: str
    last_contact: Optional[str] = None
    next_action: Optional[str] = None
    property_name: Optional[str] = None  # Joined from properties

class LeadCreate(BaseModel):
    client_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    budget: float
    property_id: Optional[int] = None
    value: float
    stage: str = "New Lead"
    last_contact: Optional[str] = None
    next_action: Optional[str] = None

class LeadUpdateStage(BaseModel):
    stage: str

# AI Advisor Request / Response Schemas
class RecommendationRequest(BaseModel):
    budget: float
    investment_goal: str  # "Yield", "Appreciation", "Balanced"
    risk_level: str  # "Low", "Medium", "High"
    bedrooms: Optional[int] = None
    property_type: Optional[str] = None  # "Apartment", "Villa", "Penthouse", "Townhouse"
    preferred_community: Optional[str] = None  # "All" or specific community name
    holding_period: int = 5  # Years

class AlternativeOption(BaseModel):
    property: Property
    investment_score: float
    match_reason: str

class RecommendationResponse(BaseModel):
    best_property: Property
    investment_score: float
    rental_yield: float
    expected_appreciation: float
    roi: float
    risk: str
    liquidity: float
    ai_explanation: str
    client_pitch: str
    alternatives: List[AlternativeOption]

class ObjectionRequest(BaseModel):
    property_id: int
    objection_type: str  # "Price too high", "Yield is low", "Not Emaar", "Location far from Metro"

class ObjectionResponse(BaseModel):
    objection_type: str
    rebuttal: str

class ClientUpdateNotes(BaseModel):
    meeting_notes: str
    follow_up_date: Optional[str] = None

