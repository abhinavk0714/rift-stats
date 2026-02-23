# api/main.py
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from business.base_service import NotFoundError

from api.routers import teams, players, team_roster, matches, match_stats

app = FastAPI(title="Rift Stats API", version="0.1.0")

app.include_router(teams.router)
app.include_router(players.router)
app.include_router(team_roster.router)
app.include_router(matches.router)
app.include_router(match_stats.router)

@app.exception_handler(ValueError)
def handle_value_error(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

@app.exception_handler(NotFoundError)
def handle_not_found(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

@app.get("/")
def root():
    return {"message": "Rift Stats API", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run("api.main:app", host=host, port=port, reload=True)
