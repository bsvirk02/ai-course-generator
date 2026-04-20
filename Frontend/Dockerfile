ARG DEBUG=false

FROM node:18

WORKDIR /app
COPY . /app/

EXPOSE 5173

RUN npm install --prefix /app/my-auth-project

CMD ["npm", "run", "--prefix", "/app/my-auth-project", "dev", "--", "--host", "0.0.0.0"]
