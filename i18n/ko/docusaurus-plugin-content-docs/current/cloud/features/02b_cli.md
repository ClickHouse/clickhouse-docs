---
sidebar_label: 'ClickHouse CLI'
slug: /cloud/features/cli
title: 'ClickHouse CLI'
description: 'ClickHouse CLI를 사용하여 ClickHouse Cloud 서비스와 로컬 ClickHouse 인스턴스를 관리합니다'
keywords: ['clickhousectl', 'CLI', '클라우드 관리', '로컬 개발']
doc_type: 'reference'
---

# ClickHouse CLI \{#clickhouse-cli\}

ClickHouse CLI(`clickhousectl`)는 ClickHouse Cloud 리소스 관리와 ClickHouse를 사용한 로컬 개발을 위한 통합 명령줄 도구입니다.

## 설치 \{#installation\}

```bash
curl https://clickhouse.com/cli | sh
```

편의를 위해 `chctl` 별칭이 자동으로 생성됩니다.

## Cloud 관리 \{#cloud-management\}

ClickHouse Cloud에 로그인하고 명령줄에서 직접 서비스를 관리합니다.

### 인증 \{#authentication\}

```bash
clickhousectl cloud auth
```

API key와 시크릿을 입력하라는 메시지가 표시되며, 입력한 정보는 `.clickhouse/credentials.json`에 저장됩니다(프로젝트 로컬, Git에서 무시됨).

환경 변수도 사용할 수 있습니다:

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

### 서비스 \{#services\}

```bash
# List services
clickhousectl cloud service list

# Create a service
clickhousectl cloud service create --name my-service \
  --provider aws \
  --region us-east-1

# Get service details
clickhousectl cloud service get <service-id>

# Scale a service
clickhousectl cloud service scale <service-id> \
  --min-replica-memory-gb 24 \
  --max-replica-memory-gb 48 \
  --num-replicas 3

# Start/stop a service
clickhousectl cloud service start <service-id>
clickhousectl cloud service stop <service-id>

# Delete a service
clickhousectl cloud service delete <service-id>
```

### 조직 \{#organizations\}

```bash
clickhousectl cloud org list
clickhousectl cloud org get <org-id>
```

### API 키 \{#api-keys\}

```bash
clickhousectl cloud key list
clickhousectl cloud key create --name ci-key --role-id <role-id>
clickhousectl cloud key delete <key-id>
```

### 구성원 및 초대 \{#members-and-invitations\}

```bash
clickhousectl cloud member list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
```

### 백업 \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### JSON 출력 \{#json-output\}

모든 클라우드 명령어에서 JSON 형식의 응답을 받으려면 `--json` 플래그를 사용하세요:

```bash
clickhousectl cloud --json service list
```

## 로컬 개발 \{#local-development\}

CLI는 로컬 ClickHouse 설치와 서버 관리도 지원합니다. 로컬 개발을 시작하려면 [빠른 설치](/install/quick-install) 페이지를 참조하십시오.

## 요구 사항 \{#requirements\}

* macOS (aarch64, x86&#95;64) 또는 Linux (aarch64, x86&#95;64)
* Cloud 명령어를 사용하려면 [ClickHouse Cloud API key](/cloud/manage/openapi)가 필요합니다