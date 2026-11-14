from typing import List
from fastapi import APIRouter, HTTPException, Body
from backend.db import get_db_cursor
from backend.models import Client, ClientCreate, Lead, LeadCreate, LeadUpdateStage, ClientUpdateNotes

router = APIRouter(prefix="/api/crm", tags=["CRM"])

# Client Endpoints
@router.get("/clients", response_model=List[Client])
def list_clients():
    """Retrieve all clients under advisory."""
    query = "SELECT * FROM clients ORDER BY name ASC"
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            return [Client(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.post("/clients", response_model=Client)
def create_client(client: ClientCreate):
    """Add a new client profile."""
    query = """
        INSERT INTO clients (name, phone, email, budget, requirements, interested_properties, meeting_notes, follow_up_date, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Active')
        RETURNING *
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                query,
                (
                    client.name, client.phone, client.email, client.budget,
                    client.requirements, client.interested_properties,
                    client.meeting_notes, client.follow_up_date
                )
            )
            row = cursor.fetchone()
            columns = [col[0] for col in cursor.description]
            return Client(**dict(zip(columns, row)))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


# Lead / Kanban Endpoints
@router.get("/leads", response_model=List[Lead])
def list_leads():
    """Retrieve all leads in the pipeline, joining property names."""
    query = """
        SELECT l.*, p.property_name 
        FROM leads l
        LEFT JOIN properties p ON l.property_id = p.id
        ORDER BY l.id ASC
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            return [Lead(**dict(zip(columns, row))) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.post("/leads", response_model=Lead)
def create_lead(lead: LeadCreate):
    """Create a new sales opportunity in the pipeline."""
    query = """
        INSERT INTO leads (client_name, email, phone, budget, property_id, value, stage, last_contact, next_action)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(
                query,
                (
                    lead.client_name, lead.email, lead.phone, lead.budget,
                    lead.property_id, lead.value, lead.stage,
                    lead.last_contact, lead.next_action
                )
            )
            row = cursor.fetchone()
            
            # Fetch property name to return complete lead model
            cursor.execute("SELECT property_name FROM properties WHERE id = %s", (lead.property_id,))
            prop_row = cursor.fetchone()
            prop_name = prop_row[0] if prop_row else None
            
            columns = [col[0] for col in cursor.description]
            lead_dict = dict(zip(columns, row))
            lead_dict["property_name"] = prop_name
            return Lead(**lead_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.put("/leads/{lead_id}/stage", response_model=Lead)
def update_lead_stage(lead_id: int, payload: LeadUpdateStage = Body(...)):
    """Move a deal across pipeline stages (e.g. via Kanban Drag-and-Drop)."""
    valid_stages = ["New Lead", "Contacted", "Meeting Scheduled", "Negotiation", "Closed", "Lost"]
    if payload.stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of {valid_stages}")
        
    query = """
        UPDATE leads 
        SET stage = %s
        WHERE id = %s
        RETURNING *
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query, (payload.stage, lead_id))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Lead not found")
                
            columns = [col[0] for col in cursor.description]
            lead_dict = dict(zip(columns, row))
            
            # Get property name
            if lead_dict["property_id"]:
                cursor.execute("SELECT property_name FROM properties WHERE id = %s", (lead_dict["property_id"],))
                prop_row = cursor.fetchone()
                lead_dict["property_name"] = prop_row[0] if prop_row else None
            else:
                lead_dict["property_name"] = None
                
            return Lead(**lead_dict)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.put("/clients/{client_id}/notes", response_model=Client)
def update_client_notes(client_id: int, payload: ClientUpdateNotes = Body(...)):
    """Appends/Updates the meeting notes and follow-up date for a client."""
    query = """
        UPDATE clients
        SET meeting_notes = %s, follow_up_date = %s
        WHERE id = %s
        RETURNING *
    """
    try:
        with get_db_cursor() as cursor:
            cursor.execute(query, (payload.meeting_notes, payload.follow_up_date, client_id))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Client not found")
            columns = [col[0] for col in cursor.description]
            return Client(**dict(zip(columns, row)))
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
