FROM cypress/included:12.4.0

WORKDIR /e2e

RUN apt-get -y update; apt-get -y install curl
COPY gwa /usr/local/bin
