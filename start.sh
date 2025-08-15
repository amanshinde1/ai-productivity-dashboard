#!/usr/bin/env bash

# ---- Parse DATABASE_URL ---- #
export PGHOST=$(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+)\/.*$/\1/')
export PGPORT=$(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+)\/.*$/\2/')
export PGUSER=$(echo $DATABASE_URL | sed -E 's/^.*\/\/([^:]+):.*@.*$/\1/')
export PGPASSWORD=$(echo $DATABASE_URL | sed -E 's/^.*:([^@]+)@.*$/\1/')

echo "Waiting for database to be ready..."

max_attempts=60   # Retry for up to 2 minutes (60×2s)
attempt=1

while ! pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
  echo "Database not ready, sleeping 2 seconds... attempt $attempt/$max_attempts"
  sleep 2
  attempt=$((attempt + 1))
  if [ "$attempt" -gt "$max_attempts" ]; then
    echo "ERROR: Database never became ready after $((max_attempts * 2)) seconds. Exiting."
    exit 1
  fi
done

echo "Database is ready! Running migrations..."

# ---- Run Django migrations ---- #
python manage.py migrate --noinput

# ---- Collect static files ---- #
python manage.py collectstatic --noinput

# ---- Start Gunicorn ---- #
echo "Starting Gunicorn..."
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
