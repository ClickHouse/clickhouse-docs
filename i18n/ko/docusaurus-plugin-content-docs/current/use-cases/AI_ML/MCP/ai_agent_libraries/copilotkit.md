---
slug: /use-cases/AI/MCP/ai-agent-libraries/copilotkit
sidebar_label: 'CopilotKit 통합'
title: 'CopilotKit과 ClickHouse MCP Server로 AI 에이전트 구축하기'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP와 CopilotKit을 사용하여 ClickHouse에 저장된 데이터를 기반으로 에이전트 기반 애플리케이션을 구축하는 방법을 알아봅니다'
keywords: ['ClickHouse', 'MCP', 'copilotkit']
show_related_blogs: true
doc_type: 'guide'
---

# CopilotKit과 ClickHouse MCP Server로 AI 에이전트를 빌드하는 방법 \{#how-to-build-an-ai-agent-with-copilotkit-and-the-clickhouse-mcp-server\}

이 예제는 ClickHouse에 저장된 데이터를 활용하여 에이전트형 애플리케이션을 빌드하는 방법을 보여줍니다. 
이 예제에서는 [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)를 사용하여 
ClickHouse에서 데이터를 쿼리하고, 해당 데이터를 기반으로 차트를 생성합니다.

[CopilotKit](https://github.com/CopilotKit/CopilotKit)은 UI를 빌드하고 
채팅 인터페이스를 제공하는 데 사용됩니다.

:::note 예제 코드
이 예제에 사용된 코드는 [examples 저장소](https://github.com/ClickHouse/examples/edit/main/ai/mcp/copilotkit)에서 확인할 수 있습니다.
:::

## 사전 요구 사항 \{#prerequisites\}

- `Node.js >= 20.14.0`
- `uv >= 0.1.0`

## 의존성 설치 \{#install-dependencies\}

프로젝트를 로컬로 클론합니다. `git clone https://github.com/ClickHouse/examples`을 실행한 다음 
`ai/mcp/copilotkit` 디렉터리로 이동합니다.

이 섹션을 건너뛰고 `./install.sh` 스크립트를 실행하여 의존성을 설치할 수도 있습니다. 
의존성을 수동으로 설치하려면 아래 지침을 따르십시오.

## 종속성 수동 설치 \{#install-dependencies-manually\}

1. 종속성을 설치합니다:

`npm install`을 실행하여 Node.js 종속성을 설치합니다.

2. mcp-clickhouse를 설치합니다:

새 폴더 `external`을 만들고 그 안에 mcp-clickhouse 저장소를 클론합니다.

```sh
mkdir -p external
git clone https://github.com/ClickHouse/mcp-clickhouse external/mcp-clickhouse
```

Python 종속성을 설치하고 fastmcp CLI 도구를 추가합니다.

```sh
cd external/mcp-clickhouse
uv sync
uv add fastmcp
```


## 애플리케이션 구성 \{#configure-the-application\}

`env.example` 파일을 `.env`로 복사한 후, `ANTHROPIC_API_KEY`를 설정하도록 내용을 수정합니다.

## 자체 LLM 사용하기 \{#use-your-own-llm\}

Anthropic이 아닌 다른 LLM 제공업체를 사용하려면 
Copilotkit 런타임을 수정하여 다른 LLM 어댑터를 사용하도록 설정하면 됩니다.
지원되는 제공업체 목록은 [여기](https://docs.copilotkit.ai/guides/bring-your-own-llm)에서 확인할 수 있습니다.

## 자체 ClickHouse 클러스터 사용하기 \{#use-your-own-clickhouse-cluster\}

기본적으로 이 예제는 
[ClickHouse demo cluster](https://sql.clickhouse.com/)에 연결하도록 구성되어 있습니다. 아래 환경 변수를 설정하면 
보유한 ClickHouse 클러스터를 사용할 수도 있습니다:

- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT`
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD`
- `CLICKHOUSE_SECURE`

# 애플리케이션 실행 \{#run-the-application\}

개발 서버를 시작하려면 `npm run dev`를 실행합니다.

다음과 같은 프롬프트로 Agent를 테스트할 수 있습니다.

> "지난 10년 동안 맨체스터의 가격 추이를 보여줘."

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인합니다.