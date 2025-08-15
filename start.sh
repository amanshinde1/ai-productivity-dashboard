#!/usr/bin/env bash

# ---- Parse DATABASE_URL ---- #
export PGHOST=$(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+)\/.*$/\1/')
export PGPORT=$(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+)\/.*$/\2/')
export PGUSER=$(echo $DATABASE_URL | sed -E 's/^.*\/\/([^:]+):.*@.*$/\1/')
export PGPASSWORD=$(echo $DATABASE_URL | sed -E 's/^.*:([^@]+)@.*$/\1/')

echo "Waiting for database to be ready..."
until pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do
  echo "Database not ready, sleeping 2 seconds..."
  sleep 2
done

echo "Database is ready! Running migrations..."

# ---- Run Django migrations ---- #
python manage.py migrate --noinput

# ---- Collect static files ---- #
python manage.py collectstatic --noinput

# ---- Start Gunicorn ---- #
echo "Starting Gunicorn..."
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT
