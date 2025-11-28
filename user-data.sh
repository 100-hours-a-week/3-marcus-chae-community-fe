#!/bin/bash
set -e

# 로그 출력
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting user data script..."

# 작업 디렉토리 생성
mkdir -p /home/ubuntu/app
cd /home/ubuntu/app

# compose 파일 다운로드
echo "Downloading compose file..."
curl -o compose.dev.yaml https://raw.githubusercontent.com/100-hours-a-week/3-marcus-chae-community-fe/develop/compose.dev.yaml

# 소유권 설정
chown -R ubuntu:ubuntu /home/ubuntu/app

# Docker compose로 컨테이너 실행
echo "Starting containers..."
docker compose -f compose.dev.yaml pull
docker compose -f compose.dev.yaml up -d

echo "User data script completed successfully!"