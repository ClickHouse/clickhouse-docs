---
description: '로컬 및 클라우드용 ClickHouse CLI인 clickhousectl 문서'
sidebar_label: 'clickhousectl'
sidebar_position: 17
slug: /interfaces/cli
title: 'clickhousectl'
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

`clickhousectl`은 로컬 및 클라우드용 ClickHouse CLI입니다.

`clickhousectl`로 다음 작업을 수행할 수 있습니다:

* 로컬 ClickHouse 버전을 설치하고 관리
* 로컬 ClickHouse 서버를 실행하고 관리
* ClickHouse 서버에 대해 쿼리 실행
* ClickHouse Cloud를 설정하고 클라우드에서 관리되는 ClickHouse 클러스터 생성
* ClickHouse Cloud 리소스 관리
* 지원되는 코딩 에이전트에 공식 ClickHouse 에이전트 Skills 설치
* 로컬 ClickHouse 개발 작업을 클라우드로 푸시

`clickhousectl`은 사람과 AI 에이전트가 ClickHouse로 개발할 수 있도록 지원합니다.

## 설치 \{#installation\}

### 빠른 설치 \{#quick-install\}

```bash
curl https://clickhouse.com/cli | sh
```

설치 스크립트는 사용 중인 OS에 맞는 버전을 다운로드하여 `~/.local/bin/clickhousectl`에 설치합니다. 또한 편의를 위해 `chctl` 별칭도 자동으로 생성됩니다.

## 요구 사항 \{#requirements\}

* macOS (aarch64, x86&#95;64) 또는 Linux (aarch64, x86&#95;64)
* Cloud 명령어를 실행하려면 [ClickHouse Cloud API 키](/cloud/manage/api/api-overview)가 필요합니다

## 로컬 \{#local\}

### ClickHouse 버전 설치 및 관리 \{#installing-versions\}

`clickhousectl`은 [GitHub releases](https://github.com/ClickHouse/ClickHouse/releases)에서 ClickHouse 바이너리 파일을 다운로드합니다.

```bash
# Install a version
clickhousectl local install stable          # Latest stable release
clickhousectl local install lts             # Latest LTS release
clickhousectl local install 26.3            # Latest 26.3.x.x
clickhousectl local install 26.3.4.3        # Exact version

# List versions
clickhousectl local list                    # Installed versions
clickhousectl local list --remote           # Available for download

# Manage default version
clickhousectl local use stable              # Latest stable (installs if needed)
clickhousectl local use lts                 # Latest LTS (installs if needed)
clickhousectl local use 26.3                # Latest 26.3.x.x (installs if needed)
clickhousectl local use 26.3.4.3            # Exact version
clickhousectl local which                   # Show current default

# Remove a version
clickhousectl local remove 26.3.4.3
```

#### ClickHouse 바이너리 저장 \{#binary-storage\}

ClickHouse 바이너리는 전역 저장소에 보관되므로, 저장 공간을 중복하지 않고 여러 프로젝트에서 사용할 수 있습니다. 바이너리는 `~/.clickhousectl/`에 저장됩니다:

```bash
~/.clickhousectl/
├── versions/
│   └── 26.3.4.3/
│       └── clickhouse
└── default              # tracks the active version
```

### 프로젝트 초기화 \{#initializing-project\}

```bash
clickhousectl local init
```

`init`은 현재 작업 디렉터리에 ClickHouse 프로젝트 파일용 표준 폴더 구조를 생성합니다. 이 단계는 선택 사항이며, 필요에 따라 자체 폴더 구조를 사용해도 됩니다.

다음과 같은 구조가 생성됩니다:

```bash
clickhouse/
├── tables/                 # Table definitions (CREATE TABLE ...)
├── materialized_views/     # Materialized view definitions
├── queries/                # Saved queries
└── seed/                   # Seed data / INSERT statements
```

### 쿼리 실행 \{#running-queries\}

```bash
# Connect to a running server with clickhouse-client
clickhousectl local client                           # Connects to "default" server
clickhousectl local client --name dev                # Connects to "dev" server
clickhousectl local client --query "SHOW DATABASES"  # Run a query
clickhousectl local client --queries-file schema.sql # Run queries from a file
clickhousectl local client --host remote-host --port 9000  # Connect to a specific host/port
```

### ClickHouse 서버 생성 및 관리 \{#managing-servers\}

ClickHouse 서버 인스턴스를 시작하고 관리합니다. 각 서버에는 `.clickhousectl/servers/<name>/data/` 아래에 독립적인 데이터 디렉터리가 할당됩니다.

```bash
# Start a server (runs in background by default)
clickhousectl local server start                          # Named "default"
clickhousectl local server start --name dev               # Named "dev"
clickhousectl local server start --foreground             # Run in foreground (-F / --fg)
clickhousectl local server start --http-port 8124 --tcp-port 9001  # Explicit ports
clickhousectl local server start -- --config-file=/path/to/config.xml

# List all servers (running and stopped)
clickhousectl local server list

# Stop servers
clickhousectl local server stop default                   # Stop by name
clickhousectl local server stop-all                       # Stop all running servers

# Remove a stopped server and its data
clickhousectl local server remove test
```

**서버 이름 지정:** `--name`을 지정하지 않으면 첫 번째 서버의 이름은 &quot;default&quot;가 됩니다. &quot;default&quot;가 이미 실행 중이면 임의의 이름이 생성됩니다(예: &quot;bold-crane&quot;). 반복해서 시작/중지할 수 있는 안정적인 식별자가 필요하면 `--name`을 사용하십시오.

**포트:** 기본값은 HTTP 8123 및 TCP 9000입니다. 이 포트가 이미 사용 중이면 사용 가능한 포트가 자동으로 할당되고 출력에 표시됩니다. 포트를 명시적으로 지정하려면 `--http-port` 및 `--tcp-port`를 사용하십시오.

#### 프로젝트 로컬 데이터 디렉터리 \{#project-local-data\}

모든 서버 데이터는 프로젝트 디렉터리 내의 `.clickhousectl/`에 저장됩니다:

```bash
.clickhousectl/
├── .gitignore              # auto-created, ignores everything
├── credentials.json        # cloud API credentials (if configured)
└── servers/
    ├── default/
    │   └── data/           # ClickHouse data files for "default" server
    └── dev/
        └── data/           # ClickHouse data files for "dev" server
```

이름이 지정된 각 서버는 자체 데이터 디렉터리를 가지므로 서버끼리는 완전히 격리됩니다. 데이터는 재시작 후에도 유지되므로, 서버를 이름으로 중지했다가 다시 시작하면 중단한 지점부터 작업을 이어갈 수 있습니다. 서버의 데이터를 영구적으로 삭제하려면 `clickhousectl local server remove <name>`를 사용하십시오.

## 인증 \{#authentication\}

OAuth(브라우저 기반) 또는 API 키를 사용해 ClickHouse Cloud에 인증할 수 있습니다.

### OAuth 로그인(권장) \{#oauth-login\}

```bash
clickhousectl cloud auth login
```

OAuth device flow를 통해 인증할 수 있도록 브라우저가 열립니다. 토큰은 `.clickhousectl/tokens.json`(프로젝트 로컬)에 저장됩니다.

### API 키/시크릿 \{#api-key\}

```bash
# Non-interactive (CI-friendly)
clickhousectl cloud auth login --api-key YOUR_KEY --api-secret YOUR_SECRET

# Interactive prompt
clickhousectl cloud auth login --interactive
```

자격 증명은 `.clickhousectl/credentials.json`에 저장됩니다(프로젝트 로컬).

환경 변수도 사용할 수 있습니다:

```bash
export CLICKHOUSE_CLOUD_API_KEY=your-key
export CLICKHOUSE_CLOUD_API_SECRET=your-secret
```

또는 어떤 명령어에서든 플래그로 자격 증명을 직접 전달할 수 있습니다:

```bash
clickhousectl cloud --api-key KEY --api-secret SECRET ...
```

### 인증 상태 및 로그아웃 \{#auth-status\}

```bash
clickhousectl cloud auth status    # Show current auth state
clickhousectl cloud auth logout    # Clear all saved credentials (credentials.json & tokens.json)
```

자격 증명 확인 우선순위: CLI 플래그 &gt; OAuth 토큰 &gt; `.clickhousectl/credentials.json` &gt; 환경 변수.

## Cloud \{#cloud\}

API를 통해 ClickHouse Cloud 서비스를 관리합니다.

### 조직 \{#organizations\}

```bash
clickhousectl cloud org list              # List organizations
clickhousectl cloud org get <org-id>      # Get organization details
clickhousectl cloud org update <org-id> --name "Renamed Org"
clickhousectl cloud org update <org-id> \
  --remove-private-endpoint pe-1,cloud-provider=aws,region=us-east-1 \
  --enable-core-dumps false
clickhousectl cloud org prometheus <org-id> --filtered-metrics true
clickhousectl cloud org usage <org-id> \
  --from-date 2024-01-01 \
  --to-date 2024-01-31
```

### 서비스 \{#services\}

```bash
# List services
clickhousectl cloud service list

# Get service details
clickhousectl cloud service get <service-id>

# Create a service (minimal)
clickhousectl cloud service create --name my-service

# Create with scaling options
clickhousectl cloud service create --name my-service \
  --provider aws \
  --region us-east-1 \
  --min-replica-memory-gb 8 \
  --max-replica-memory-gb 32 \
  --num-replicas 2

# Create with specific IP allowlist
clickhousectl cloud service create --name my-service \
  --ip-allow 10.0.0.0/8 \
  --ip-allow 192.168.1.0/24

# Create from backup
clickhousectl cloud service create --name restored-service --backup-id <backup-uuid>

# Create with release channel
clickhousectl cloud service create --name my-service --release-channel fast

# Start/stop a service
clickhousectl cloud service start <service-id>
clickhousectl cloud service stop <service-id>

# Connect to a cloud service with clickhouse-client
clickhousectl cloud service client --name my-service --password secret
clickhousectl cloud service client --id <service-id> -q "SELECT 1" --password secret

# Use CLICKHOUSE_PASSWORD env var (recommended for scripts/agents)
CLICKHOUSE_PASSWORD=secret clickhousectl cloud service client \
  --name my-service -q "SELECT count() FROM system.tables"

# Update service metadata and patches
clickhousectl cloud service update <service-id> \
  --name my-renamed-service \
  --add-ip-allow 10.0.0.0/8 \
  --remove-ip-allow 0.0.0.0/0 \
  --release-channel fast

# Update replica scaling
clickhousectl cloud service scale <service-id> \
  --min-replica-memory-gb 24 \
  --max-replica-memory-gb 48 \
  --num-replicas 3 \
  --idle-scaling true \
  --idle-timeout-minutes 10

# Reset password with generated credentials
clickhousectl cloud service reset-password <service-id>

# Delete a service (must be stopped first)
clickhousectl cloud service delete <service-id>

# Force delete: stops a running service then deletes
clickhousectl cloud service delete <service-id> --force
```

#### 서비스 생성 옵션 \{#service-create-options\}

| 옵션                        | 설명                                           |
| ------------------------- | -------------------------------------------- |
| `--name`                  | 서비스 이름(필수)                                   |
| `--provider`              | 클라우드 제공자: `aws`, `gcp`, `azure` (기본값: `aws`) |
| `--region`                | 리전 (기본값: `us-east-1`)                        |
| `--min-replica-memory-gb` | 레플리카당 최소 메모리(GB) (8-356, 4의 배수)              |
| `--max-replica-memory-gb` | 레플리카당 최대 메모리(GB) (8-356, 4의 배수)              |
| `--num-replicas`          | 레플리카 수 (1-20)                                |
| `--idle-scaling`          | 0까지 축소 허용 (기본값: `true`)                      |
| `--idle-timeout-minutes`  | 최소 idle 타임아웃(분) (&gt;= 5)                    |
| `--ip-allow`              | 허용할 IP CIDR (반복 지정 가능, 기본값: `0.0.0.0/0`)     |
| `--backup-id`             | 복원에 사용할 백업 ID                                |
| `--release-channel`       | 릴리스 채널: `slow`, `default`, `fast`            |

#### 쿼리용 엔드포인트 관리 \{#query-endpoints\}

```bash
clickhousectl cloud service query-endpoint get <service-id>
clickhousectl cloud service query-endpoint create <service-id> \
  --role admin \
  --open-api-key key-1 \
  --allowed-origins https://app.example.com
clickhousectl cloud service query-endpoint delete <service-id>
```

#### 프라이빗 엔드포인트 관리 \{#private-endpoints\}

```bash
clickhousectl cloud service private-endpoint create <service-id> --endpoint-id vpce-123
clickhousectl cloud service private-endpoint get-config <service-id>
```

#### 백업 설정 \{#backup-config\}

```bash
clickhousectl cloud service backup-config get <service-id>
clickhousectl cloud service backup-config update <service-id> \
  --backup-period-hours 24 \
  --backup-retention-period-hours 720 \
  --backup-start-time 02:00
```

### 백업 \{#backups\}

```bash
clickhousectl cloud backup list <service-id>
clickhousectl cloud backup get <service-id> <backup-id>
```

### 구성원 \{#members\}

```bash
clickhousectl cloud member list
clickhousectl cloud member get <user-id>
clickhousectl cloud member update <user-id> --role-id <role-id>
clickhousectl cloud member remove <user-id>
```

### 초대 \{#invitations\}

```bash
clickhousectl cloud invitation list
clickhousectl cloud invitation create --email dev@example.com --role-id <role-id>
clickhousectl cloud invitation get <invitation-id>
clickhousectl cloud invitation delete <invitation-id>
```

### 키 \{#keys\}

```bash
clickhousectl cloud key list
clickhousectl cloud key get <key-id>
clickhousectl cloud key create --name ci-key --role-id <role-id> --ip-allow 10.0.0.0/8
clickhousectl cloud key update <key-id> \
  --name renamed-key \
  --expires-at 2025-12-31T00:00:00Z \
  --state disabled \
  --ip-allow 0.0.0.0/0
clickhousectl cloud key delete <key-id>
```

### 활동 \{#activity\}

```bash
clickhousectl cloud activity list --from-date 2024-01-01 --to-date 2024-12-31
clickhousectl cloud activity get <activity-id>
```

### JSON 출력 \{#json-output\}

`--json` 플래그를 사용하면 JSON 형식으로 응답이 출력됩니다.

```bash
clickhousectl cloud --json service list
clickhousectl cloud --json service get <service-id>
```

## Skills \{#skills\}

[ClickHouse/agent-skills](https://github.com/ClickHouse/agent-skills)에서 공식 ClickHouse Agent Skills를 설치하십시오.

```bash
# Default: interactive mode for humans, choose scope, then choose agents
clickhousectl skills

# Non-interactive: install into every supported project-local agent folder
clickhousectl skills --all

# Non-interactive: install only into detected agents
clickhousectl skills --detected-only

# Non-interactive: install into every supported global agent folder
clickhousectl skills --global --all

# Non-interactive: install into specific project-local agents
clickhousectl skills --agent claude --agent codex
```

### 비대화형 플래그 \{#non-interactive-flags\}

| Flag              | Description                        |
| ----------------- | ---------------------------------- |
| `--agent <name>`  | 특정 에이전트용 Skills를 설치합니다(여러 번 지정 가능) |
| `--global`        | 전역 범위를 사용합니다. 생략하면 프로젝트 범위를 사용합니다  |
| `--all`           | 지원되는 모든 에이전트용 Skills를 설치합니다        |
| `--detected-only` | 시스템에서 감지된 지원 에이전트용 Skills를 설치합니다   |