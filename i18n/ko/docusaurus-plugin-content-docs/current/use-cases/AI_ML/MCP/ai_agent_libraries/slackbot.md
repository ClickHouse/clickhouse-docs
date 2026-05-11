---
slug: /use-cases/AI/MCP/ai-agent-libraries/slackbot
sidebar_label: 'SlackBot 통합'
title: 'ClickHouse MCP 서버를 사용하여 SlackBot 에이전트를 구축하는 방법'
pagination_prev: null
pagination_next: null
description: 'ClickHouse MCP 서버와 상호 작용할 수 있는 SlackBot 에이전트를 구축하는 방법에 대해 알아봅니다.'
keywords: ['ClickHouse', 'MCP', 'Slack', 'SlackBot', 'PydanticAI']
show_related_blogs: true
doc_type: 'guide'
---

# ClickHouse MCP 서버를 사용하여 SlackBot 에이전트를 구축하는 방법 \{#how-to-build-a-slackbot-agent-using-clickhouse-mcp-server\}

이 가이드에서는 [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) 에이전트를 구축하는 방법을 안내합니다.
이 봇을 사용하면 자연어로 Slack에서 ClickHouse 데이터에 대해 직접 질문할 수 있습니다. 이 봇은
[ClickHouse MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)와 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1)를 사용합니다.

:::note 예시 프로젝트
이 예시의 코드는 [examples 저장소](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md)에서 확인할 수 있습니다.
:::

## 사전 요구 사항 \{#prerequisites\}

* [`uv`](https://docs.astral.sh/uv/getting-started/installation/)가 설치되어 있어야 합니다.
* Slack 워크스페이스에 액세스할 수 있어야 합니다.
* Anthropic API key 또는 다른 LLM 프로바이더의 API key가 필요합니다.

<VerticalStepper headerLevel="h2">
  ## Slack 앱 만들기 \{#create-a-slack-app\}

  1. [slack.com/apps](https://slack.com/apps)로 이동한 다음 `Create New App`을 클릭합니다.
  2. `From scratch` 옵션을 선택하고 앱 이름을 지정합니다.
  3. Slack 워크스페이스를 선택합니다.

  ## 앱을 워크스페이스에 설치 \{#install-the-app-to-your-workspace\}

  다음으로, 이전 단계에서 만든 앱을 워크스페이스에 추가해야 합니다.
  Slack 문서의 [&quot;Add apps to your Slack workspace&quot;](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace)
  안내를 따르십시오.

  ## Slack 앱 설정 구성 \{#configure-slack-app-settings\}

  * `App Home`으로 이동합니다.
    * `Show Tabs` → `Messages Tab`에서 `Allow users to send Slash commands and messages from the messages tab`을 활성화합니다.
    * `Socket Mode`로 이동합니다.
      * `Socket Mode`를 활성화합니다.
      * 환경 변수 `SLACK_APP_TOKEN`에 사용할 `Socket Mode Handler` 값을 기록해 둡니다.
    * `OAuth & Permissions`로 이동합니다.
      * 다음 `Bot Token Scopes`를 추가합니다.
        * `app_mentions:read`
        * `assistant:write`
        * `chat:write`
        * `im:history`
        * `im:read`
        * `im:write`
        * `channels:history`
      * 앱을 워크스페이스에 설치한 후, 환경 변수 `SLACK_BOT_TOKEN`에 사용할 `Bot User OAuth Token` 값을 기록해 둡니다.
    * `Event Subscriptions`로 이동합니다.
      * `Events`를 활성화합니다.
      * `Subscribe to bot events`에서 다음 이벤트를 추가합니다.
        * `app_mention`
        * `assistant_thread_started`
        * `message:im`
      * 변경 사항을 저장합니다.

  ## 환경 변수 추가 (`.env`) \{#add-env-vars\}

  다음 환경 변수를 포함하는 `.env` 파일을 프로젝트 루트에 생성합니다.
  이 파일을 사용하면 앱이 [ClickHouse의 SQL playground](https://sql.clickhouse.com/)에 연결할 수 있습니다.

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

  원한다면 ClickHouse 변수를 조정하여 자체 ClickHouse 서버
  또는 Cloud 인스턴스를 사용할 수 있습니다.

  ## 봇 사용 \{#using-the-bot\}

  1. **봇 시작:**

     ```sh
     uv run main.py
     ```
  2. **Slack에서:**
     * 채널에서 봇을 멘션합니다: `@yourbot Who are the top contributors to the ClickHouse git repo?`
     * 스레드에서 봇을 멘션해 답글합니다: `@yourbot how many contributions did these users make last week?`
     * 봇에 DM을 보냅니다: `Show me all tables in the demo database.`

  필요한 경우 봇은 이전 스레드 메시지를 모두 컨텍스트로 사용하여
  스레드에 답글합니다.

  **스레드 컨텍스트:**
  스레드에 답글할 때 봇은 이전 메시지(현재 메시지 제외)를 모두 불러와 AI의 컨텍스트로 포함합니다.

  **도구 사용:**
  봇은 MCP를 통해 사용할 수 있는 도구(예: schema 검색, SQL 실행)만 사용하며, 사용한 SQL과 답변을 찾은 방법에 대한 요약을 항상 표시합니다.
</VerticalStepper>