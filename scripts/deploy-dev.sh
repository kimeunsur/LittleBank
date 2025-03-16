#!/bin/bash
AWS_PROFILE=$1
IMAGE_NAME=littlebank-dev-backend
STACK_NAME=littlebank-dev
TARGET=backend
REGISTRY_URL=905418439565.dkr.ecr.ap-northeast-2.amazonaws.com/${IMAGE_NAME}:latest
HOST=ubuntu@54.180.151.152
APP_PATH=/home/ubuntu/${STACK_NAME}
DOCKER_COMPOSE=docker-compose.yml
PEM_FILE=~/.ssh/littlebank.pem

function printUsage() {
    echo "Usage: deploy-dev.sh {profileName}"
    echo ""
}

function errorCheck() {
    if [[ $? -ne 0 ]]; then
    exit 1
fi
}

if [[ -z ${AWS_PROFILE} ]]; then
  printUsage
  exit 1
fi

set -e

docker build -t "${IMAGE_NAME}" -f docker/"${TARGET}.dockerfile" --platform linux/amd64 .
errorCheck

echo "1"

docker tag ${IMAGE_NAME}:latest ${REGISTRY_URL}
errorCheck

AWS_ID=$(aws sts get-caller-identity --query Account --output text --profile ${AWS_PROFILE})
errorCheck

echo "2"

aws ecr get-login-password --region ap-northeast-2 --profile ${AWS_PROFILE} | docker login --username AWS --password-stdin "${AWS_ID}.dkr.ecr.ap-northeast-2.amazonaws.com"
errorCheck

echo "3"

docker push ${REGISTRY_URL}
errorCheck

echo "4"

ssh ${HOST} -i ${PEM_FILE} "mkdir -p ${APP_PATH}"
errorCheck

echo "5"

scp -i ${PEM_FILE} -d docker/${DOCKER_COMPOSE} ${HOST}:${APP_PATH}
errorCheck

echo "6"

ssh ${HOST} -i ${PEM_FILE} "sudo aws ecr get-login-password --region ap-northeast-2 | sudo docker login --username AWS --password-stdin 905418439565.dkr.ecr.ap-northeast-2.amazonaws.com \
                            && sudo docker pull ${REGISTRY_URL} \
                            && sudo docker stack deploy -c ${APP_PATH}/${DOCKER_COMPOSE} ${STACK_NAME} --prune --with-registry-auth \
                            && sudo docker service update ${STACK_NAME}_${TARGET} --with-registry-auth -q"
errorCheck

echo "7"

ssh ${HOST} -i ${PEM_FILE} "sudo docker system prune -f"
docker image prune -f

echo "Deploy Success!"
