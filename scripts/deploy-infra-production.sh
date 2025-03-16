#!/bin/bash
HOST=$1
AWS_PROFILE=$2
HOST_ACCOUNT=ubuntu@${HOST}
APP_PATH=/home/ubuntu/infra
DOCKER_COMPOSE=docker-compose-infra-production.yml
PEM_FILE=~/.ssh/littlebank.pem
STACK_NAME=infra

set -e

function printUsage() {
  echo "Usage: deploy-infra-production.sh {host} {profileName}"
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

if [[ -z ${HOST} ]]; then
  printUsage
  exit 1
fi

# --- 
# echo "1111"
# docker build -t "rapopoo-fluentd-prod" -f docker/fluentd/"fluentd.dockerfile" .
# errorCheck

# echo "2222"

# docker tag rapopoo-fluentd-prod:latest 627748179549.dkr.ecr.ap-southeast-3.amazonaws.com/rapopoo-fluentd-prod:latest
# errorCheck
# echo "3333"
# ---
echo "1111 ${AWS_PROFILE}"

AWS_ID=$(aws sts get-caller-identity --query Account --output text --profile "${AWS_PROFILE}")
errorCheck

echo "2222"

aws ecr get-login-password --region ap-northeast-2 --profile "${AWS_PROFILE}" | docker login --username AWS --password-stdin "${AWS_ID}.dkr.ecr.ap-northeast-2.amazonaws.com"
errorCheck

echo "3333"
# ---
# echo "4444"
# docker push 627748179549.dkr.ecr.ap-southeast-3.amazonaws.com/rapopoo-fluentd-prod:latest
# errorCheck
# echo "5555"
# ---

ssh "${HOST_ACCOUNT}" -i ${PEM_FILE} "mkdir -p ${APP_PATH}"
errorCheck

echo "4444"

scp -i ${PEM_FILE} -d docker/${DOCKER_COMPOSE} "${HOST_ACCOUNT}":${APP_PATH}
errorCheck

echo "5555"

ssh "${HOST_ACCOUNT}" -i ${PEM_FILE} "sudo aws ecr get-login-password --region ap-northeast-2 | sudo docker login --username AWS --password-stdin ${AWS_ID}.dkr.ecr.ap-northeast-2.amazonaws.com \
                            && sudo docker stack deploy -c ${APP_PATH}/${DOCKER_COMPOSE} ${STACK_NAME} --prune --with-registry-auth"

echo "6666"

ssh "${HOST_ACCOUNT}" -i ${PEM_FILE} "sudo docker system prune -f"
docker image prune -f

echo "Deploy Success!"
