---
description: 'ClickHouse Keeper HTTP API 및 내장 대시보드 관련 문서'
sidebar_label: 'Keeper HTTP API'
sidebar_position: 70
slug: /operations/utilities/clickhouse-keeper-http-api
title: 'Keeper HTTP API 및 대시보드'
doc_type: 'reference'
---

# Keeper HTTP API 및 대시보드 \{#keeper-http-api-and-dashboard\}

ClickHouse Keeper는 모니터링, 상태 점검, 스토리지 관리를 위한 HTTP API와 내장 웹 대시보드를 제공합니다. 
이 인터페이스를 사용하면 운영자가 웹 브라우저나 HTTP 클라이언트를 통해 클러스터 상태를 점검하고, 명령을 실행하며 Keeper 스토리지를 관리할 수 있습니다.

## 구성 \{#configuration\}

HTTP API를 활성화하려면 `keeper_server` 구성에 `http_control` 섹션을 추가합니다.

```xml
<keeper_server>
    <!-- Other keeper_server configuration -->

    <http_control>
        <port>9182</port>
        <!-- <secure_port>9443</secure_port> -->
    </http_control>
</keeper_server>
```


### 구성 옵션 \{#configuration-options\}

| 설정                                      | 기본값   | 설명                                              |
|-------------------------------------------|----------|---------------------------------------------------|
| `http_control.port`                       | -        | 대시보드와 API를 위한 HTTP 포트                   |
| `http_control.secure_port`                | -        | HTTPS 포트(SSL 구성 필요)                         |
| `http_control.readiness.endpoint`         | `/ready` | readiness 프로브를 위한 사용자 지정 경로          |
| `http_control.storage.session_timeout_ms` | `30000`  | 저장소 API 작업 세션 타임아웃(밀리초 단위)       |

## 엔드포인트 \{#endpoints\}

### 대시보드 \{#dashboard\}

- **Path**: `/dashboard`
- **Method**: GET
- **Description**: Keeper를 모니터링하고 관리하기 위한 내장 웹 대시보드를 제공합니다.

대시보드는 다음 기능을 제공합니다.

- 실시간 클러스터 상태 시각화
- 노드 모니터링(역할, 지연 시간, 연결 수)
- 스토리지 브라우저
- 명령 실행 인터페이스

### 준비 상태 프로브(Readiness Probe) \{#readiness-probe\}

* **경로(Path)**: `/ready` (변경 가능합니다)
* **메서드(Method)**: GET
* **설명(Description)**: 상태 확인(health check) 엔드포인트

성공 시 응답(HTTP 200):

```json
{
  "status": "ok",
  "details": {
    "role": "leader",
    "hasLeader": true
  }
}
```


### Commands API \{#commands-api\}

* **경로**: `/api/v1/commands/{command}`
* **메서드**: GET, POST
* **설명**: Four-Letter Word 명령어 또는 ClickHouse Keeper Client CLI 명령어를 실행합니다.

쿼리 매개변수:

* `command` - 실행할 명령어
* `cwd` - 경로 기반 명령에 사용할 현재 작업 디렉터리 (기본값: `/`)

예시:

```bash
# Four-Letter Word command
curl http://localhost:9182/api/v1/commands/stat

# ZooKeeper CLI command
curl "http://localhost:9182/api/v1/commands/ls?command=ls%20'/'&cwd=/"
```


### Storage API \{#storage-api\}

- **Base Path**: `/api/v1/storage`
- **Description**: Keeper 스토리지 작업을 위한 REST API입니다.

Storage API는 HTTP 메서드를 통해 작업 유형을 나타내는 REST 규칙을 따릅니다:

| Operation | Path                                       | Method | Status Code | Description          |
|-----------|--------------------------------------------|--------|-------------|----------------------|
| Get       | `/api/v1/storage/{path}`                   | GET    | 200         | 노드 데이터 조회     |
| List      | `/api/v1/storage/{path}?children=true`     | GET    | 200         | 하위 노드 목록 조회  |
| Exists    | `/api/v1/storage/{path}`                   | HEAD   | 200         | 노드 존재 여부 확인  |
| Create    | `/api/v1/storage/{path}`                   | POST   | 201         | 새 노드 생성         |
| Update    | `/api/v1/storage/{path}?version={v}`       | PUT    | 200         | 노드 데이터 업데이트 |
| Delete    | `/api/v1/storage/{path}?version={v}`       | DELETE | 204         | 노드 삭제            |