FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /srv
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/

# LIBRARY_ROOT: the folder mounted from the NAS; the font folder is picked inside it in Settings.
# DATA_DIR: tags, index, settings and preview cache.
ENV LIBRARY_ROOT=/library \
    DATA_DIR=/data \
    HOME=/data

EXPOSE 8095
USER 568:568

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8095/api/status', timeout=5)"

CMD ["uvicorn", "main:app", "--app-dir", "/srv/app", "--host", "0.0.0.0", "--port", "8095"]
