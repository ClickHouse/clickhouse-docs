---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/chainlit'
'sidebar_label': 'Chainlit 통합'
'title': 'Chainlit와 ClickHouse MCP SERVER로 AI 에이전트 구축하는 방법'
'pagination_prev': null
'pagination_next': null
'description': 'Chainlit을 사용하여 ClickHouse MCP SERVER와 함께 LLM 기반 채팅 앱을 구축하는 방법을 배워보세요.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Chainlit'
'show_related_blogs': true
'doc_type': 'guide'
---


# Chainlit 및 ClickHouse MCP 서버로 AI 에이전트 구축하는 방법

이 가이드는 Chainlit의 강력한 채팅 인터페이스 프레임워크와 ClickHouse 모델 컨텍스트 프로토콜(MCP) 서버를 결합하여 대화형 데이터 애플리케이션을 만드는 방법을 탐구합니다. Chainlit은 최소한의 코드로 AI 애플리케이션을 위한 대화형 인터페이스를 구축할 수 있게 해주며, ClickHouse MCP 서버는 ClickHouse의 고성능 컬럼형 데이터베이스와의 원활한 통합을 제공합니다.

## 전제 조건 {#prerequisites}
- Anthropic API 키가 필요합니다.
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)가 설치되어 있어야 합니다.

## 기본 Chainlit 앱 {#basic-chainlit-app}

다음 명령어를 실행하여 기본 채팅 앱의 예제를 볼 수 있습니다:

```sh
uv run --with anthropic --with chainlit chainlit run chat_basic.py -w -h
```

그런 다음 `http://localhost:8000`로 이동하세요.

## ClickHouse MCP 서버 추가 {#adding-clickhouse-mcp-server}

ClickHouse MCP 서버를 추가하면 더 흥미롭습니다. `uv` 명령어를 사용할 수 있도록 `.chainlit/config.toml` 파일을 업데이트해야 합니다:

```toml
[features.mcp.stdio]
    enabled = true
    # Only the executables in the allow list can be used for MCP stdio server.
    # Only need the base name of the executable, e.g. "npx", not "/usr/bin/npx".
    # Please don't comment this line for now, we need it to parse the executable name.
    allowed_executables = [ "npx", "uvx", "uv" ]
```

:::note config.toml
전체 `config.toml` 파일은 [예제 리포지토리](https://github.com/ClickHouse/examples/blob/main/ai/mcp/chainlit/.chainlit/config.toml)에서 확인할 수 있습니다.
:::

Chainlit과 함께 MCP 서버가 작동하도록 하는 일부 코드가 있으므로, 대신 이 명령어를 실행하여 Chainlit을 시작해야 합니다:

```sh
uv run --with anthropic --with chainlit chainlit run chat_mcp.py -w -h
```

MCP 서버를 추가하려면 채팅 인터페이스의 플러그인 아이콘을 클릭한 다음, ClickHouse SQL 플레이그라운드에 연결하기 위해 다음 명령어를 추가하세요:

```sh
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com CLICKHOUSE_USER=demo CLICKHOUSE_PASSWORD= CLICKHOUSE_SECURE=true uv run --with mcp-clickhouse --python 3.13 mcp-clickhouse
```

자신의 ClickHouse 인스턴스를 사용하려면 환경 변수의 값을 조정할 수 있습니다.

그런 다음 다음과 같은 질문을 할 수 있습니다:

* 쿼리할 수 있는 테이블에 대해 말해 주세요.
* 뉴욕 택시에 대한 흥미로운 점은 무엇인가요?
