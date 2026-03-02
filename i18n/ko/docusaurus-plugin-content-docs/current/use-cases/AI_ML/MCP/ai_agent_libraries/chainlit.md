---
slug: /use-cases/AI/MCP/ai-agent-libraries/chainlit
sidebar_label: 'Chainlit 통합'
title: 'Chainlit과 ClickHouse MCP Server로 AI 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server와 함께 Chainlit을 사용하여 LLM 기반 채팅 앱을 구축하는 방법을 배웁니다'
keywords: ['ClickHouse', 'MCP', 'Chainlit']
show_related_blogs: true
doc_type: 'guide'
---



# Chainlit과 ClickHouse MCP Server로 AI 에이전트 구축하기 \{#how-to-build-an-ai-agent-with-chainlit-and-the-clickhouse-mcp-server\}

이 가이드에서는 Chainlit의 강력한 채팅 인터페이스용 프레임워크와
ClickHouse Model Context Protocol(MCP) Server를 결합하여 대화형 데이터
애플리케이션을 구축하는 방법을 다룹니다. Chainlit은 최소한의 코드로 AI
애플리케이션을 위한 대화형 인터페이스를 구축할 수 있도록 해주며, ClickHouse MCP Server는 ClickHouse의 고성능 컬럼형 데이터베이스와의 원활한
통합을 제공합니다.



## 사전 준비 사항 \{#prerequisites\}
- Anthropic API 키가 필요합니다
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)가 설치되어 있어야 합니다



## 기본 Chainlit 앱 \{#basic-chainlit-app\}

다음 명령을 실행하면 기본 채팅 앱 예제를 볼 수 있습니다:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

그런 다음 웹 브라우저에서 `http://localhost:8000`으로 이동합니다


## ClickHouse MCP Server 추가하기 \{#adding-clickhouse-mcp-server\}

ClickHouse MCP Server를 추가하면 구성이 더 흥미로워집니다.
`uv` 명령을 사용할 수 있도록 `.chainlit/config.toml` 파일을 업데이트해야 합니다.

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
전체 `config.toml` 파일은 [examples 리포지토리](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)에서 확인할 수 있습니다.
:::

MCP Server를 Chainlit과 함께 동작시키기 위한 약간의 연결 코드가 있으므로,
대신 Chainlit을 다음 명령으로 실행해야 합니다.

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

MCP 서버를 추가하려면 채팅 인터페이스에서 플러그 아이콘을 클릭한 다음,
ClickHouse SQL Playground에 연결해 사용하려면 다음 명령을 추가하십시오:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

직접 운영 중인 ClickHouse 인스턴스를 사용하려면 환경 변수 값을 조정하면 됩니다.

이후에는 다음과 같은 질문을 할 수 있습니다:

* 쿼리할 수 있는 테이블에 대해 설명해 주세요
* 뉴욕 택시에 대해 흥미로운 점을 알려 주세요
