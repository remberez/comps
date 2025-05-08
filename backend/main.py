from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.router import router as auth_router
from categories.router import router as categories_router

app = FastAPI(
    title="Computer Store API",
    description="API для магазина компьютерной техники",
    version="1.0.0"
)

# Настройки CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",  # Vite dev server (альтернативный адрес)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Подключаем роутеры
app.include_router(auth_router)
app.include_router(categories_router)

@app.get("/")
async def root():
    return {"message": "Computer Store API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 