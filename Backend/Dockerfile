ARG DEBUG=false

FROM python:3.10-bullseye

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=quiz_manager.settings

WORKDIR /app
COPY requirements.txt /app/
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
COPY . /app/

EXPOSE 8000

# RUN python3 /app/manage.py makemigrations
# RUN python3 /app/manage.py migrate

RUN if [ "$DEBUG" = "true" ]; then python3 /app/manage.py check && python3 /app/manage.py test; fi

CMD ["./run.sh"]
