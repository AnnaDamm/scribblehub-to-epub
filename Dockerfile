FROM node:19-alpine
LABEL maintainer="Anna Damm <anna.damm87@googlemail.com>"

WORKDIR /script
ENTRYPOINT ["npm"]
