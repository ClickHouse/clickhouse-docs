---
slug: /use-cases/observability/clickstack/mcp
title: 'ClickStack MCP 서버'
sidebar_label: 'MCP Server'
pagination_prev: null
pagination_next: null
description: 'Model Context Protocol (MCP) 서버를 사용하여 AI 도우미를 ClickStack에 연결합니다'
doc_type: 'guide'
keywords: ['ClickStack', 'MCP', 'Model Context Protocol', 'AI', '관측성', 'HyperDX', 'Claude', 'Cursor']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack에는 AI 어시스턴트가 관측성 데이터와 상호작용할 수 있도록 기본 제공되는 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 서버가 포함되어 있습니다. 연결되면 AI 어시스턴트는 자연어를 통해 로그, 트레이스, 메트릭을 쿼리하고, 대시보드와 알림을 관리하며, 데이터 소스를 탐색하고, 저장된 검색으로 작업할 수 있습니다.

이를 통해 [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://www.cursor.com/), 또는 MCP 호환 클라이언트를 사용하여 개발 환경을 벗어나지 않고도 인시던트를 조사하고, 대시보드를 구축하고, 관측성 구성을 관리할 수 있습니다.

## 지원 현황 \{#availability\}

MCP 서버는 다음 ClickStack 배포 유형에서 사용할 수 있습니다:

| 배포                                                | 상태      |
| ------------------------------------------------- | ------- |
| **Open Source ClickStack**                        | 사용 가능   |
| **BYOC (Bring Your Own Cloud)**                   | 사용 가능   |
| **Managed ClickStack**                            | 곧 지원 예정 |
| **HyperDX v1** ([hyperdx.io](https://hyperdx.io)) | 지원되지 않음 |

:::note[Managed ClickStack]
Managed ClickStack의 MCP 서버 지원은 현재 활발히 개발 중이며 곧 제공될 예정입니다. 이 페이지의 지침은 Open Source 및 BYOC 배포에 적용됩니다.
:::

## 사전 요구 사항 \{#prerequisites\}

MCP 클라이언트를 연결하기 전에 다음이 필요합니다.

* 실행 중인 ClickStack 인스턴스(설정 옵션은 [배포](/use-cases/observability/clickstack/deployment)를 참조하십시오)
* **Personal API Access Key** — HyperDX의 **Team Settings → API Keys → Personal API Access Key**에서 확인할 수 있습니다

<Image img={api_key} alt="Team Settings의 Personal API Access Key" size="md" border />

:::note
Personal API Access Key는 Team Settings에서 확인할 수 있는 **수집 API key**와 다릅니다. 수집 API key는 OpenTelemetry collector로 전송되는 telemetry 데이터를 인증하는 데 사용됩니다.
:::

## 엔드포인트 \{#endpoint\}

MCP 서버는 ClickStack 프런트엔드 URL의 `/api/mcp` 경로에서 사용할 수 있습니다:

예를 들어, 기본 로컬 배포에서는 다음과 같습니다:

기본값을 변경한 경우 `localhost:8080`을 인스턴스의 호스트와 포트로 바꾸십시오.

:::note
이 페이지의 예시는 프런트엔드 앱 URL(기본 포트는 `8080`)을 사용합니다. `<BACKEND_URL>/mcp`를 통해 백엔드로 MCP 서버에 직접 연결할 수도 있지만, 모든 배포에서 백엔드를 노출하는 것은 아니므로 이 문서에서는 프런트엔드 경로를 사용합니다.
:::

MCP 서버는 **Bearer token** 인증을 사용하는 **Streamable HTTP** 전송을 사용합니다.

## MCP 클라이언트 연결 \{#connecting-a-client\}

아래 예시는 널리 사용되는 MCP 클라이언트를 구성하는 방법을 보여줍니다. `<YOUR_CLICKSTACK_URL>`은 인스턴스 URL(예: `http://localhost:8080`)로, `<YOUR_API_KEY>`는 Personal API Access Key로 각각 바꾸십시오.

### Claude code \{#claude-code\}

```shell
claude mcp add --transport http hyperdx <YOUR_CLICKSTACK_URL>/api/mcp \
  --header "Authorization: Bearer <YOUR_API_KEY>"
```

### Cursor \{#cursor\}

프로젝트의 `.cursor/mcp.json` 파일 또는 Cursor 전역 설정에 다음 내용을 추가하십시오:

```json
{
  "mcpServers": {
    "hyperdx": {
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

### OpenCode \{#opencode\}

다음을 `opencode.json` 설정에 추가하십시오:

```json
{
  "mcp": {
    "hyperdx": {
      "type": "http",
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

### 기타 클라이언트 \{#other-clients\}

**Streamable HTTP** 전송을 지원하는 모든 MCP 클라이언트에서 연결할 수 있습니다. 다음과 같이 설정하세요.

* **URL:** `<YOUR_CLICKSTACK_URL>/api/mcp`
* **헤더:** `Authorization: Bearer <YOUR_API_KEY>`

## MCP로 무엇을 할 수 있나요? \{#capabilities\}

연결되면 AI 어시스턴트는 ClickStack의 핵심 영역 전반에 걸친 다양한 도구를 사용할 수 있습니다. 여기에는 다음이 포함됩니다.

* **데이터 쿼리** — ClickStack의 쿼리 빌더, 검색 구문 또는 raw SQL을 사용해 로그, 트레이스, 메트릭을 검색하고 집계합니다.
* **데이터 소스** — 사용 가능한 데이터 소스, 데이터베이스 연결, 컬럼 스키마, 속성 키를 나열합니다.
* **대시보드** — 타일과 함께 대시보드를 생성, 업데이트, 삭제하고 확인합니다.
* **알림** — 평가 이력과 함께 알림을 생성, 업데이트하고 확인합니다.
* **저장된 검색** — 재사용 가능한 저장된 검색 정의를 생성, 업데이트하고 확인합니다.
* **웹훅** — 알림 전송에 사용할 수 있는 웹훅 대상을 나열합니다.
* **팀** — 현재 사용자가 속한 팀을 나열하고 활성 팀을 식별합니다.

사용 가능한 도구 집합은 시간이 지나면서 확장될 수 있습니다. MCP 클라이언트는 연결 시 사용 가능한 도구를 자동으로 검색합니다.

## 여러 팀 사용 \{#multi-team\}

기본적으로 MCP 요청은 기본 팀의 Context에서 처리됩니다. 여러 팀에 속해 있는 경우 `Authorization` header와 함께 팀 ID로 설정한 `x-hdx-team` header를 전달하여 특정 팀을 대상으로 지정할 수 있습니다. header를 생략하면 기본 팀이 사용됩니다. 속해 있지 않은 팀을 지정하면 요청이 `401` 오류와 함께 거부됩니다.

MCP 클라이언트의 팀 목록 도구를 사용하여 액세스할 수 있는 팀과 현재 활성화된 팀을 확인하십시오.

## 문제 해결 \{#troubleshooting\}

<details>
  <summary>403 인증 오류가 발생합니다</summary>

  * **Personal API Access Key**를 사용 중인지 확인하십시오(**수집 API key**가 아닙니다).
  * 키가 `Authorization` 헤더에 `Bearer` 토큰으로 포함되어 있는지 확인하십시오.
  * 구성한 URL에서 ClickStack 인스턴스가 실행 중이며 접근 가능한지 확인하십시오.
</details>

<details>
  <summary>속도 제한이 적용됩니다</summary>

  MCP 서버는 사용자당 **분당 600개의 요청**으로 속도 제한을 적용합니다. 이 한도를 초과하면 요청이 일시적으로 거부됩니다. 요청 빈도를 줄이거나 다시 시도하기 전에 잠시 기다리십시오.
</details>

<details>
  <summary>`x-hdx-team` 헤더와 함께 401 오류가 발생합니다</summary>

  팀 ID가 올바른지, 그리고 사용자 계정이 해당 팀의 구성원인지 확인하십시오.
</details>

<details>
  <summary>MCP 서버에 연결할 수 없습니다</summary>

  * MCP 클라이언트가 **Streamable HTTP** 전송을 지원하는지 확인하십시오. stdio 전송만 지원하는 구버전 클라이언트는 작동하지 않습니다.
  * ClickStack을 로컬에서 실행 중인 경우, 구성된 URL에서 앱에 접근할 수 있는지 확인하십시오(기본값은 `http://localhost:8080`입니다).
  * 로드 밸런서 또는 리버스 프록시 뒤에 있는 BYOC 배포의 경우, `/api/mcp` 경로가 차단되거나 재작성되지 않는지 확인하십시오.
</details>