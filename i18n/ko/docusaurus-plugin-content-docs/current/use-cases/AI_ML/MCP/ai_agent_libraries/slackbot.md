---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'SlackBot 통합'
title: 'ClickHouse MCP Server를 사용하여 SlackBot 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP Server와 상호 작용할 수 있는 SlackBot 에이전트를 구축하는 방법에 대해 알아봅니다.'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---



# ClickHouse MCP Server를 사용해 SlackBot 에이전트를 구축하는 방법 \{#how-to-build-a-slackbot-agent-using-clickhouse-mcp-server\}

이 가이드에서는 [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) 에이전트를 구축하는 방법을 안내합니다.
이 봇을 사용하면 자연어로 Slack에서 ClickHouse 데이터에 대해 직접 질문할 수 있습니다. 이 봇은
[ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)와 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1)를 사용합니다.

:::note 예시 프로젝트
이 예시의 코드는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md)에서 확인할 수 있습니다.
:::



## 사전 요구 사항 \{#prerequisites\}

- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)가 설치되어 있어야 합니다
- Slack 워크스페이스 접근 권한이 필요합니다
- Anthropic API 키 또는 다른 LLM 제공업체의 API 키가 필요합니다

<VerticalStepper headerLevel="h2">


## Slack 앱 만들기 \{#create-a-slack-app\}

1. [slack.com/apps](https://slack.com/apps)로 이동한 뒤 `Create New App`을 클릭합니다.
2. `From scratch` 옵션을 선택하고 앱 이름을 지정합니다.
3. Slack 워크스페이스를 선택합니다.



## 워크스페이스에 앱 설치하기 \{#install-the-app-to-your-workspace\}

다음으로, 이전 단계에서 생성한 앱을 워크스페이스에 추가해야 합니다.
자세한 내용은 Slack 문서의 ["Slack 워크스페이스에 앱 추가하기"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace) 지침을 참고하십시오.



## Slack 앱 설정 구성 \{#configure-slack-app-settings\}

- `App Home`으로 이동합니다.
  - `Show Tabs` → `Messages Tab`에서 `Allow users to send Slash commands and messages from the messages tab`을 활성화합니다.
  - `Socket Mode`로 이동합니다.
    - `Socket Mode`를 활성화합니다.
    - 환경 변수 `SLACK_APP_TOKEN`에 사용할 `Socket Mode Handler` 값을 기록해 둡니다.
  - `OAuth & Permissions`로 이동합니다.
    - 다음 `Bot Token Scopes`를 추가합니다.
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - 앱을 워크스페이스에 설치한 후, 환경 변수 `SLACK_BOT_TOKEN`에 사용할 `Bot User OAuth Token` 값을 기록해 둡니다.
  - `Event Subscriptions`로 이동합니다.
    - `Events`를 활성화합니다.
    - `Subscribe to bot events`에서 다음 이벤트를 추가합니다.
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 변경 사항을 저장합니다.



## 환경 변수 추가 (`.env`) \{#add-env-vars\}

프로젝트 루트 디렉터리에 다음 환경 변수를 포함한 `.env` 파일을 생성합니다.
이 변수들은 애플리케이션이 [ClickHouse SQL playground](https://sql.clickhouse.com/)에 연결하도록 합니다.

```env
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_APP_TOKEN=your-slack-app-level-token
ANTHROPIC_API_KEY=your-anthropic-api-key
CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
CLICKHOUSE_PORT=8443
CLICKHOUSE_USER=demo
CLICKHOUSE_PASSWORD=
CLICKHOUSE_SECURE=true
```

원하는 경우 ClickHouse 관련 변수를 수정하여 자체 ClickHouse 서버나 Cloud 인스턴스를 사용하도록 설정할 수 있습니다.


## Using the bot \{#using-the-bot\}

1. **Start the bot:**

   ```sh
   uv run main.py
   ```

2. **Slack에서:**
   - 채널에서 봇을 멘션하세요: `@yourbot Who are the top contributors to the ClickHouse git repo?`
   - 스레드에서 멘션과 함께 답장하세요: `@yourbot how many contributions did these users make last week?`
   - 봇에게 DM을 보내세요: `Show me all tables in the demo database.`

The bot will reply in the thread, using all previous thread messages as context
if applicable.

**Thread Context:**
When replying in a thread, the bot loads all previous messages (except the current one) and includes them as context for the AI.

**Tool Usage:**
The bot uses only the tools available via MCP (e.g., schema discovery, SQL execution) and will always show the SQL used and a summary of how the answer was found.

</VerticalStepper>
