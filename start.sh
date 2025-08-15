#!/bin/bash

# ---- Wait for Postgres to be ready ---- #
echo "Waiting for database to be ready..."
while ! nc -z $(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+)\/.*$/\1/') $(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+)\/.*$/\2/'); do
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
