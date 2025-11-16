---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/copilotkit'
'sidebar_label': 'CopilotKit 통합하기'
'title': 'CopilotKit 및 ClickHouse MCP 서버로 AI 에이전트 구축하는 방법'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse에 저장된 데이터를 사용하여 ClickHouse MCP 및 CopilotKit와 함께 에이전트 애플리케이션을
  구축하는 방법을 배워보세요.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'copilotkit'
'show_related_blogs': true
'doc_type': 'guide'
---


# How to build an AI agent with CopilotKit and the ClickHouse MCP Server

이 문서는 ClickHouse에 저장된 데이터를 사용하여 에이전트 애플리케이션을 구축하는 방법의 예시입니다. ClickHouse에서 데이터를 쿼리하고 데이터를 기반으로 차트를 생성하기 위해 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용합니다.

[CopilotKit](https://github.com/CopilotKit/CopilotKit)은 UI를 구축하고 사용자에게 채팅 인터페이스를 제공하는 데 사용됩니다.

:::note 예제 코드
이 예제의 코드는 [examples repository](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit)에서 찾을 수 있습니다.
:::

## Prerequisites {#prerequisites}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`

## Install dependencies {#install-dependencies}

프로젝트를 로컬로 클론합니다: `git clone https://github.com/ClickHouse/examples` 그리고 `ai/mcp/copilotkit` 디렉토리로 이동합니다.

이 섹션을 건너뛰고 `./install.sh` 스크립트를 실행하여 종속성을 설치할 수 있습니다. 종속성을 수동으로 설치하려면 아래의 지침을 따르십시오.

## Install dependencies manually {#install-dependencies-manually}

1. 종속성 설치:

`npm install`을 실행하여 노드 종속성을 설치합니다.

2. mcp-clickhouse 설치:

새 폴더 `external`을 생성하고 그 안에 mcp-clickhouse 리포지토리를 클론합니다.

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Python 종속성을 설치하고 fastmcp cli 도구를 추가합니다.

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```

## Configure the application {#configure-the-application}

`env.example` 파일을 `.env`로 복사하고, `ANTHROPIC_API_KEY`를 제공하도록 편집합니다.

## Use your own LLM {#use-your-own-llm}

Anthropic 대신 다른 LLM 제공자를 사용하려면 Copilotkit 런타임을 수정하여 다른 LLM 어댑터를 사용할 수 있습니다. [여기](https://docs.copilotkit.ai/guides/bring-your-own-llm)에서 지원되는 제공자 목록을 확인할 수 있습니다.

## Use your own ClickHouse cluster {#use-your-own-clickhouse-cluster}

기본적으로 이 예제는 [ClickHouse 데모 클러스터](https://sql.clickhouse.com/)에 연결되도록 구성되어 있습니다. 다음 환경 변수를 설정하여 자신의 ClickHouse 클러스터를 사용할 수도 있습니다:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`


# Run the application {#run-the-application}

`npm run dev`를 실행하여 개발 서버를 시작합니다.

아래와 같은 프롬프트를 사용하여 에이전트를 테스트할 수 있습니다: 

> "Show me the price evolution in 
Manchester for the last 10 years."

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하십시오.
