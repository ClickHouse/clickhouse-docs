---
sidebar_label: '원격 MCP 서버'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud의 원격 MCP'
description: 'ClickHouse Cloud의 원격 MCP 기능 설명'
keywords: ['AI', 'ClickHouse Cloud', 'MCP', 'Model Context Protocol', '원격 MCP']
doc_type: 'reference'
---

# Cloud의 원격 MCP 서버 \{#remote-mcp-server-in-cloud\}

모든 사용자가 ClickHouse를 Cloud 콘솔을 통해서만 사용하는 것은 아닙니다.
예를 들어, 많은 개발자는 선호하는 코드 편집기, CLI 에이전트에서 직접 작업하거나 사용자 정의 설정을 통해 데이터베이스에 연결하며, 다른 사용자들은 대부분의 탐색 작업에 Anthropic Claude와 같은 범용 AI 어시스턴트에 의존합니다.
이러한 사용자와 이들을 대신해 동작하는 에이전트 기반 워크로드에는 복잡한 설정이나 별도 인프라 없이도 ClickHouse Cloud에 안전하게 접근하고 쿼리할 수 있는 방법이 필요합니다.

ClickHouse Cloud의 원격 MCP 서버 기능은 외부 에이전트가 분석 컨텍스트를 조회할 수 있도록 표준 인터페이스를 제공함으로써 이를 해결합니다.
MCP(Model Context Protocol)는 LLM으로 구동되는 AI 애플리케이션이 구조화된 데이터에 접근하기 위한 표준입니다.
이 통합을 통해 외부 에이전트는 데이터베이스와 테이블을 나열하고, 스키마를 검사하며, 범위가 제한된 읽기 전용 `SELECT` 쿼리를 실행할 수 있습니다.
인증은 OAuth를 통해 처리됩니다. 서버는 ClickHouse Cloud에서 완전 관리형으로 운영되므로 별도의 설정이나 유지 관리가 필요하지 않습니다.

이를 통해 에이전트 기반 도구가 ClickHouse에 보다 쉽게 연결하여 분석, 요약, 코드 생성, 탐색 등 필요한 작업에 사용할 데이터를 가져올 수 있습니다.

## 원격 MCP 서버와 오픈소스 MCP 서버 비교 \{#remote-vs-oss\}

ClickHouse는 두 가지 MCP 서버를 제공합니다.

|           | 원격 MCP 서버 (Cloud)                                | 오픈소스 MCP 서버                                                            |
| --------- | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| **출처**    | ClickHouse Cloud에서 완전 관리형으로 제공                       | GitHub의 [mcp-clickhouse](https://github.com/ClickHouse/mcp-clickhouse) |
| **전송**    | Streamable HTTP (`https://mcp.clickhouse.cloud/mcp`) | 로컬 stdio                                                               |
| **지원 대상** | ClickHouse Cloud 서비스                                 | 모든 ClickHouse 인스턴스(셀프 호스팅 또는 Cloud)                                    |
| **인증**    | Cloud 자격 증명을 사용한 OAuth 2.0                           | 환경 변수                                                                  |
| **도구**    | 쿼리, 스키마 탐색, 서비스 관리, 백업, ClickPipes, 과금을 포괄하는 13개의 도구 | 3개의 도구: `run_select_query`, `list_databases`, `list_tables`            |
| **설정**    | 설치가 필요 없습니다. MCP 클라이언트를 엔드포인트로 지정하고 인증하세요.           | 서버를 로컬에 설치하고 실행                                                        |

원격 MCP 서버는 관리할 인프라 없이 서비스 관리, 백업 모니터링, ClickPipe 확인, 과금 데이터 등을 포함해 ClickHouse Cloud와 가장 폭넓게 통합됩니다.
셀프 호스팅 ClickHouse 인스턴스의 경우 [오픈소스 MCP 서버 가이드](/use-cases/AI/MCP)를 참조하십시오.

## 원격 MCP 서버 활성화 \{#enabling\}

원격 MCP 서버가 연결을 수락하려면 각 서비스에서 먼저 활성화해야 합니다.
ClickHouse Cloud 콘솔에서 서비스를 연 다음 **Connect** 버튼을 클릭하고 **MCP**를 선택하여 활성화하세요.
자세한 단계와 스크린샷은 [설정 가이드](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)를 참조하세요.

## 엔드포인트 \{#endpoint\}

활성화되면 원격 MCP 서버는 다음 주소에서 사용할 수 있습니다:

```text
https://mcp.clickhouse.cloud/mcp
```

## 인증 \{#authentication\}

원격 MCP 서버에 대한 모든 접근은 OAuth 2.0으로 인증됩니다.
MCP 클라이언트가 처음 연결되면 OAuth 흐름이 시작되고, 사용자가 ClickHouse Cloud 자격 증명으로 로그인할 수 있도록 브라우저 창이 열립니다.
접근 범위는 인증된 사용자가 접근 권한을 가진 조직과 서비스로 제한됩니다. 추가 API key 구성은 필요하지 않습니다.

## 안전 \{#safety\}

원격 MCP 서버에 노출된 모든 도구는 **읽기 전용**입니다. 각 도구의 MCP 메타데이터에는 `readOnlyHint: true`가 지정되어 있습니다. 어떤 도구도 데이터를 수정하거나 서비스 구성을 변경하거나 파괴적인 작업을 수행할 수 없습니다.

## 사용 가능한 도구 \{#available-tools\}

원격 MCP 서버는 다음 범주로 구성된 13개의 도구를 제공합니다.

### 쿼리 및 스키마 탐색 \{#query-and-schema\}

이 도구를 사용하면 에이전트가 사용 가능한 데이터를 확인하고 분석 쿼리를 실행할 수 있습니다.

| Tool               | Description                               | Parameters                                                                     |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------ |
| `run_select_query` | ClickHouse 서비스에서 읽기 전용 SELECT 쿼리를 실행합니다.  | `query`, 유효한 ClickHouse SQL SELECT 쿼리; `serviceId`                             |
| `list_databases`   | ClickHouse 서비스에서 사용 가능한 모든 데이터베이스를 나열합니다. | `serviceId`                                                                    |
| `list_tables`      | 데이터베이스의 모든 테이블을 컬럼 정의와 함께 나열합니다.          | `serviceId`; `database`; 선택적으로 `like` 또는 `notLike` (테이블 이름을 필터링하는 SQL LIKE 패턴) |

### 조직 \{#organizations\}

| 도구                         | 설명                                                | 매개변수             |
| -------------------------- | ------------------------------------------------- | ---------------- |
| `get_organizations`        | 인증된 사용자가 액세스할 수 있는 모든 ClickHouse Cloud 조직을 조회합니다. | 없음               |
| `get_organization_details` | 특정 조직의 상세 정보를 반환합니다.                              | `organizationId` |

### 서비스 \{#services\}

| 도구                    | 설명                                  | 매개변수                          |
| --------------------- | ----------------------------------- | ----------------------------- |
| `get_services_list`   | ClickHouse Cloud 조직의 모든 서비스를 나열합니다. | `organizationId`              |
| `get_service_details` | 특정 서비스의 세부 정보를 반환합니다.               | `organizationId`; `serviceId` |

### 백업 \{#backups\}

| Tool                               | 설명                             | 매개변수                                      |
| ---------------------------------- | ------------------------------ | ----------------------------------------- |
| `list_service_backups`             | 서비스의 모든 백업을 가장 최근 백업부터 나열합니다.  | `organizationId`; `serviceId`             |
| `get_service_backup_details`       | 단일 백업의 세부 정보를 반환합니다.           | `organizationId`; `serviceId`; `backupId` |
| `get_service_backup_configuration` | 서비스의 백업 구성(일정 및 보존 설정)을 반환합니다. | `organizationId`; `serviceId`             |

### ClickPipes \{#clickpipes\}

| 도구                | 설명                             | 매개변수                                         |
| ----------------- | ------------------------------ | -------------------------------------------- |
| `list_clickpipes` | 서비스에 구성된 모든 ClickPipes를 나열합니다. | `organizationId`; `serviceId`                |
| `get_clickpipe`   | 특정 ClickPipe의 상세 정보를 반환합니다.    | `organizationId`; `serviceId`; `clickPipeId` |

### 청구 \{#billing\}

| Tool                    | 설명                                                    | 매개변수                                                                     |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `get_organization_cost` | 조직의 청구 및 사용량 비용 데이터를 조회합니다. 총액과 엔터티별 일일 비용 기록을 반환합니다. | `organizationId`; 필요에 따라 `from_date` 및 `to_date` (YYYY-MM-DD, 최대 31일 범위) |

## 시작하기 \{#getting-started\}

원격 MCP 서버를 활성화하고 이를 MCP 클라이언트에 연결하는 단계별 안내는 [설정 가이드](/use-cases/AI/MCP/remote_mcp)를 참조하십시오.