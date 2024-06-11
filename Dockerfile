FROM dockurr/windows

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV HOST 0.0.0.0

EXPOSE 3000

ENV DATABASE_URL="mysql://root:Yr^{CZlpN:X&ra&o@34.128.91.10:3306/financyq-db"

ENV HOST_MAIL='financyqworkspace@gmail.com'

ENV PASS_MAIL='cymi ejxi vmcw vkag'

ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/keyCredentials.json

ENV BUCKET_NAME='bucket-storage-financyq'

ENV SECRET_SESSION_TOKEN="jbdjbd772"

ENV REFRESH_TOKEN_SECRET="297258fd79fba3fb84b6961d1d5cbfde0392004c1e488ad360a1eb2531a16df856c10efbc555156c9d6bcc066c0d3e641a8b4592f3e3619555015b38e8da7870"

RUN npx prisma generate && npm run seed

CMD ["npm","run","start-prod"]




