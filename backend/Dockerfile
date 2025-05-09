FROM python:3.11-slim

WORKDIR /app

# Установка Poetry
RUN pip install poetry

# Копируем файлы конфигурации Poetry
COPY pyproject.toml poetry.lock ./

# Настраиваем Poetry для работы в контейнере
RUN poetry config virtualenvs.create false

# Устанавливаем зависимости
RUN poetry install --no-root

# Копируем остальные файлы проекта
COPY . .

# Создаем скрипт для запуска
RUN echo '#!/bin/bash\n\
echo "Waiting for database..."\n\
sleep 10\n\
echo "Running migrations..."\n\
alembic upgrade head\n\
echo "Starting application..."\n\
uvicorn main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"] 