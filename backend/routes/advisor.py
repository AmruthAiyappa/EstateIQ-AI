import os
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from backend.db import get_db_cursor
from backend.models import (
    RecommendationRequest, RecommendationResponse, AlternativeOption,
    ObjectionRequest, ObjectionResponse, Property
)
from backend.routes.properties import calculate_investment_score, map_db_to_property

router = APIRouter(prefix="/api/advisor", tags=["AI Advisor"])

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
openai_client = None
if api_key:
    try:
        openai_client = OpenAI(api_key=api_key)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")

def calculate_alignment_score(prop: Property, req: RecommendationRequest) -> float:
    """
    Adjusts the base investment score based on client-specific alignment criteria:
    - Rental Yield: 30% default, 50% for Yield goals, 15% for Appreciation goals
    - Appreciation: 25% default, 10% for Yield goals, 45% for Appreciation goals
    - Risk Penalty: Penalizes high-risk properties for low-risk clients
    """
    base_yield = prop.rental_yield
    base_appreciation = prop.future_appreciation
    dev_rating = prop.developer_rating
    demand = prop.demand
    liquidity = prop.liquidity
    metro = prop.metro_distance
    school = prop.school_distance
    hospital = prop.hospital_distance
    mall = prop.mall_distance

    # Base scores
    yield_score = min(100.0, base_yield * 11.0)
    appreciation_score = min(100.0, base_appreciation * 11.0)
    total_dist = metro + school + hospital + mall
    infra_score = max(0.0, min(100.0, 100.0 - (total_dist * 8.0)))
    dev_score = dev_rating * 10.0

    # Adjust weights based on goal
    if req.investment_goal == "Yield":
        w_yield, w_appr, w_infra, w_dev, w_dem, w_liq = 0.50, 0.10, 0.15, 0.10, 0.10, 0.05
    elif req.investment_goal == "Appreciation":
        w_yield, w_appr, w_infra, w_dev, w_dem, w_liq = 0.15, 0.45, 0.10, 0.10, 0.10, 0.10
    else:  # Balanced
        w_yield, w_appr, w_infra, w_dev, w_dem, w_liq = 0.30, 0.25, 0.15, 0.10, 0.10, 0.10

    score = (
        (yield_score * w_yield) +
        (appreciation_score * w_appr) +
        (infra_score * w_infra) +
        (dev_score * w_dev) +
        (demand * w_dem) +
        (liquidity * w_liq)
    )

    # Apply Risk Penalty
    # Client Low, Property High -> Subtract 30 points
    # Client Low, Property Medium -> Subtract 10 points
    # Client Medium, Property High -> Subtract 15 points
    c_risk = req.risk_level
    p_risk = prop.risk

    if c_risk == "Low":
        if p_risk == "High":
            score -= 30.0
        elif p_risk == "Medium":
            score -= 10.0
    elif c_risk == "Medium":
        if p_risk == "High":
            score -= 15.0

    return max(0.0, min(100.0, round(score, 1)))

def get_fallback_recommendation(prop: Property, req: RecommendationRequest) -> tuple:
    """Generates highly realistic local-based recommendation text if OpenAI fails."""
    community = prop.community
    name = prop.property_name
    dev = prop.developer
    price = f"{prop.price/1000000:.2f}M"
    yield_val = prop.rental_yield
    appr_val = prop.future_appreciation
    
    explanation = (
        f"This asset in {community} is recommended as your primary investment. "
        f"For a client with a {req.risk_level.lower()}-risk tolerance, {name} (developed by {dev}) "
        f"offers a very defensive position with a base rental yield of {yield_val}% and historical "
        f"capital growth in {community} projected at {appr_val}% annually. "
        f"The property stands out due to its proximity to transit networks ({prop.metro_distance} km to Metro) "
        f"and strong infrastructure (scoring {prop.developer_rating}/10 developer rating), making it highly liquid "
        f"on the secondary exit market."
    )
    
    pitch = (
        f"Subject: Premium Investment Opportunity: {name} in {community}\n\n"
        f"Dear Client,\n\n"
        f"Following up on our discussions regarding a secure entry into the Dubai real estate market, "
        f"I have analyzed several assets that match your budget. I strongly recommend {name} by {dev} in {community}.\n\n"
        f"Key Highlights:\n"
        f"- Purchase Price: {price} AED\n"
        f"- Projected Rental Yield: {yield_val}% p.a. (superior cash flow profile)\n"
        f"- Annual Capital Growth Forecast: {appr_val}%\n"
        f"- Strategic Location: Close to schools and retail nodes.\n\n"
        f"This property aligns perfectly with your preference for a {req.risk_level.lower()}-risk holding profile while yielding "
        f"steady passive income. Let's connect this week to discuss the payment structure and booking process.\n\n"
        f"Best regards,\n"
        f"EstateIQ Advisory Team"
    )
    return explanation, pitch

def get_fallback_objection(prop: Property, obj_type: str) -> str:
    """Generates highly realistic sales responses based on real-estate metrics."""
    price_formatted = f"{prop.price/1000000:.2f}M"
    yield_val = prop.rental_yield
    appr_val = prop.future_appreciation
    dev = prop.developer
    comm = prop.community
    
    if obj_type == "Price too high":
        return (
            f"I understand your perspective on the {price_formatted} AED price point. However, looking at the fundamentals "
            f"of {comm}, this asset trades at a premium due to its developer pedigree ({dev}) and exceptional infrastructure. "
            f"With an expected annual capital appreciation of {appr_val}%, the entry price is justified as historical data "
            f"shows that prime properties in {comm} absorb market corrections far better than lower-tier properties. "
            f"In addition, the high rental yield of {yield_val}% offsets the carrying cost, giving you a net positive cash flow."
        )
    elif obj_type == "Yield is low":
        return (
            f"It's true that a {yield_val}% yield is slightly lower than some high-density projects in outer areas. "
            f"However, this property is situated in {comm}, which is a blue-chip community. The lower yield reflects the "
            f"safety and liquidity of this location. Crucially, the tradeoff is a significantly higher capital appreciation "
            f"rate of {appr_val}% per year. When you calculate the Total Return (Yield + Appreciation = {yield_val + appr_val}%), "
            f"it actually outperforms high-yield, low-appreciation projects while keeping your capital highly liquid."
        )
    elif obj_type == "Not Emaar":
        return (
            f"Emaar is indeed the market benchmark, but {dev} is a top-tier luxury developer rated at {prop.developer_rating}/10. "
            f"By investing in a project by {dev}, you are securing a higher level of bespoke finishing and interior design "
            f"compared to bulk Emaar developments. Furthermore, developments by {dev} in {comm} have historically commanded "
            f"a 12-15% rental premium on the secondary market because tenants are willing to pay for this superior quality."
        )
    else:  # Location far from Metro
        return (
            f"While this property is {prop.metro_distance} km from the nearest metro, this is actually a positive driver "
            f"for this specific asset class. Luxury buyers and high-income family tenants in {comm} prefer the tranquility "
            f"and privacy of residential enclaves, away from heavy foot-traffic areas near transit hubs. Proximity to schools "
            f"({prop.school_distance} km) and premium retail malls ({prop.mall_distance} km) has a much higher correlation "
            f"with rental retention and capital appreciation in this specific family-oriented luxury segment."
        )

@router.post("/recommend", response_model=RecommendationResponse)
def get_recommendation(request: RecommendationRequest):
    """
    Processes client constraints, ranks properties by alignment score,
    and returns recommendations with AI analysis and copyable pitches.
    """
    # Fetch properties
    query = "SELECT * FROM properties"
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            db_properties = [map_db_to_property(row, cursor.description) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
        
    # Filter properties
    # 1. Price check (budget + 15% broker flexibility)
    filtered = [p for p in db_properties if p.price <= request.budget * 1.15]
    
    # If empty, relax price check to find closest assets
    if not filtered:
        filtered = sorted(db_properties, key=lambda x: x.price)[:5]
        
    # 2. Community check
    if request.preferred_community and request.preferred_community != "All":
        community_filtered = [p for p in filtered if p.community == request.preferred_community]
        if community_filtered:
            filtered = community_filtered
            
    # 3. Property Type check
    if request.property_type and request.property_type != "All":
        type_filtered = [p for p in filtered if p.property_type == request.property_type]
        if type_filtered:
            filtered = type_filtered
            
    # 4. Bedrooms check
    if request.bedrooms is not None:
        beds_filtered = [p for p in filtered if p.bedrooms == request.bedrooms]
        if beds_filtered:
            filtered = beds_filtered
            
    # Compute alignment scores
    scored_properties = []
    for prop in filtered:
        align_score = calculate_alignment_score(prop, request)
        scored_properties.append((prop, align_score))
        
    # Sort by alignment score descending
    scored_properties.sort(key=lambda x: x[1], reverse=True)
    
    if not scored_properties:
        raise HTTPException(status_code=404, detail="No suitable properties found matching the requirements.")
        
    best_prop, best_score = scored_properties[0]
    
    # Compile alternatives
    alternatives = []
    for prop, score in scored_properties[1:3]:
        reason = (
            f"Offers a stable {prop.rental_yield}% yield in {prop.community} with a "
            f"lower price profile of {prop.price/1000000:.2f}M AED."
        )
        alternatives.append(AlternativeOption(
            property=prop,
            investment_score=score,
            match_reason=reason
        ))
        
    # AI Text Generation
    explanation = ""
    pitch = ""
    
    if openai_client:
        try:
            # Call OpenAI GPT
            prompt = (
                f"You are a Senior Real Estate Investment Manager in Dubai advising a client.\n"
                f"Client Profile:\n"
                f"- Budget: {request.budget:,.2f} AED\n"
                f"- Investment Goal: {request.investment_goal} (e.g. rental income vs capital gains)\n"
                f"- Risk Profile: {request.risk_level}\n"
                f"- Target Hold Period: {request.holding_period} years\n\n"
                f"Recommended Property Profile:\n"
                f"- Name: {best_prop.property_name}\n"
                f"- Developer: {best_prop.developer}\n"
                f"- Community: {best_prop.community}\n"
                f"- Price: {best_prop.price:,.2f} AED\n"
                f"- Bedrooms: {best_prop.bedrooms}\n"
                f"- Rental Yield: {best_prop.rental_yield}%\n"
                f"- Projected Appreciation: {best_prop.future_appreciation}%\n"
                f"- Developer Rating: {best_prop.developer_rating}/10\n"
                f"- Proximity distances: Metro ({best_prop.metro_distance}km), School ({best_prop.school_distance}km), Mall ({best_prop.mall_distance}km)\n\n"
                f"Provide two JSON fields: 'explanation' and 'pitch'.\n"
                f"1. 'explanation': Under 4 sentences, explain from an investment manager's perspective why this property matches their budget, goal, and risk tolerance.\n"
                f"2. 'pitch': A professional email/text pitch draft that the investment manager can copy and send directly to the client. Keep it polished and action-oriented.\n"
                f"Output ONLY valid JSON matching this schema: {{\"explanation\": \"...\", \"pitch\": \"...\"}}"
            )
            
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Stable and cost-effective
                messages=[
                    {"role": "system", "content": "You are a professional real estate investment advisor. You speak in a highly sophisticated, metrics-driven tone."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                timeout=12.0
            )
            
            result = json.loads(response.choices[0].message.content)
            explanation = result.get("explanation", "")
            pitch = result.get("pitch", "")
        except Exception as e:
            print(f"OpenAI API failed, using fallback: {e}")
            explanation, pitch = get_fallback_recommendation(best_prop, request)
    else:
        explanation, pitch = get_fallback_recommendation(best_prop, request)
        
    return RecommendationResponse(
        best_property=best_prop,
        investment_score=best_score,
        rental_yield=best_prop.rental_yield,
        expected_appreciation=best_prop.future_appreciation,
        roi=best_prop.roi,
        risk=best_prop.risk,
        liquidity=best_prop.liquidity,
        ai_explanation=explanation,
        client_pitch=pitch,
        alternatives=alternatives
    )

@router.post("/objection", response_model=ObjectionResponse)
def handle_objection(request: ObjectionRequest):
    """Generates an objection handling rebuttal targeting a specific asset and client concern."""
    # Fetch property
    query = "SELECT * FROM properties WHERE id = %s"
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query, (request.property_id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Property not found")
            prop = map_db_to_property(row, cursor.description)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
        
    rebuttal = ""
    
    if openai_client:
        try:
            prompt = (
                f"You are a Senior Real Estate Investment Advisor in Dubai.\n"
                f"Your client has raised an objection regarding the property: '{prop.property_name}' in {prop.community}.\n"
                f"Objection raised: '{request.objection_type}'.\n\n"
                f"Property Metrics:\n"
                f"- Price: {prop.price:,.2f} AED\n"
                f"- Rental Yield: {prop.rental_yield}%\n"
                f"- Expected Appreciation: {prop.future_appreciation}%\n"
                f"- Developer: {prop.developer} (Rating: {prop.developer_rating}/10)\n"
                f"- Metro Distance: {prop.metro_distance}km\n\n"
                f"Write a persuasive, highly professional, and respectful rebuttal that handles this objection. "
                f"Acknowledge the client's concern, but use the property's metrics and market fundamentals to explain "
                f"why this remains a highly lucrative investment over the long term. Keep it under 5 sentences."
            )
            
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional real estate sales closer. Your responses are respectful, analytical, and convincing."},
                    {"role": "user", "content": prompt}
                ],
                timeout=8.0
            )
            rebuttal = response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API failed, using fallback: {e}")
            rebuttal = get_fallback_objection(prop, request.objection_type)
    else:
        rebuttal = get_fallback_objection(prop, request.objection_type)
        
    return ObjectionResponse(
        objection_type=request.objection_type,
        rebuttal=rebuttal
    )
