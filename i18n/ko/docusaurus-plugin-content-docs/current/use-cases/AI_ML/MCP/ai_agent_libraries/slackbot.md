---
'slug': '/use-cases/AI/MCP/ai-agent-libraries/slackbot'
'sidebar_label': 'SlackBot 통합'
'title': 'ClickHouse MCP 서버를 사용하여 SlackBot 에이전트 구축하는 방법.'
'pagination_prev': null
'pagination_next': null
'description': 'ClickHouse MCP 서버와 상호작용할 수 있는 SlackBot 에이전트를 구축하는 방법을 배우세요.'
'keywords':
- 'ClickHouse'
- 'MCP'
- 'Slack'
- 'SlackBot'
- 'PydanticAI'
'show_related_blogs': true
'doc_type': 'guide'
---


# ClickHouse MCP 서버를 사용하여 SlackBot 에이전트 구축하는 방법

이 가이드에서는 [SlackBot](https://slack.com/intl/en-gb/help/articles/202026038-An-introduction-to-Slackbot) 에이전트를 구축하는 방법을 배웁니다. 이 봇은 자연어를 사용하여 Slack에서 ClickHouse 데이터에 대한 질문을 직접 할 수 있도록 합니다. [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse)와 [PydanticAI](https://ai.pydantic.dev/mcp/client/#__tabbed_1_1)를 사용합니다.

:::note 예시 프로젝트
이 예제의 코드는 [examples repository](https://github.com/ClickHouse/examples/blob/main/ai/mcp/slackbot/README.md)에서 찾을 수 있습니다.
:::

## 필수 조건 {#prerequisites}
- [`uv`](https://docs.astral.sh/uv/getting-started/installation/)가 설치되어 있어야 합니다.
- Slack 작업 공간에 접근할 수 있어야 합니다.
- Anthropic API 키 또는 다른 LLM 제공자의 API 키가 필요합니다.

<VerticalStepper headerLevel="h2">

## Slack 앱 생성하기 {#create-a-slack-app}

1. [slack.com/apps](https://slack.com/apps)로 가서 `Create New App`을 클릭합니다.
2. `From scratch` 옵션을 선택하고 앱 이름을 입력합니다.
3. Slack 작업 공간을 선택합니다.

## 앱을 작업 공간에 설치하기 {#install-the-app-to-your-workspace}

다음으로, 이전 단계에서 생성한 앱을 작업 공간에 추가해야 합니다. Slack 문서에서 ["Add apps to your Slack workspace"](https://slack.com/intl/en-gb/help/articles/202035138-Add-apps-to-your-Slack-workspace) 지침을 따를 수 있습니다.

## Slack 앱 설정 구성하기 {#configure-slack-app-settings}

- `App Home`으로 이동
  - `Show Tabs` → `Messages Tab`에서: `Allow users to send Slash commands and messages from the messages tab`를 활성화합니다.
  - `Socket Mode`로 이동
    - `Socket Mode`를 활성화합니다.
    - 환경 변수 `SLACK_APP_TOKEN`에 대한 `Socket Mode Handler`를 기록합니다.
  - `OAuth & Permissions`로 이동
    - 다음 `Bot Token Scopes`를 추가합니다:
      - `app_mentions:read`
      - `assistant:write`
      - `chat:write`
      - `im:history`
      - `im:read`
      - `im:write`
      - `channels:history`
    - 앱을 작업 공간에 설치하고 환경 변수 `SLACK_BOT_TOKEN`에 대한 `Bot User OAuth Token`을 기록합니다.
  - `Event Subscriptions`로 이동
    - `Events`를 활성화합니다.
    - `Subscribe to bot events` 아래에 다음을 추가합니다:
      - `app_mention`
      - `assistant_thread_started`
      - `message:im`
    - 변경 사항 저장

## 환경 변수 추가하기 (`.env`) {#add-env-vars}

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 추가하여 앱이 [ClickHouse의 SQL 플레이그라운드](https://sql.clickhouse.com/)에 연결될 수 있도록 합니다.

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

원하는 경우 ClickHouse 변수를 자신의 ClickHouse 서버 또는 클라우드 인스턴스를 사용하도록 조정할 수 있습니다.

## 봇 사용하기 {#using-the-bot}

1. **봇 시작하기:**

```sh
uv run main.py
```
2. **Slack에서:**
    - 채널에서 봇을 언급합니다: `@yourbot Who are the top contributors to the ClickHouse git repo?`
    - 스레드에 언급하여 답변합니다: `@yourbot how many contributions did these users make last week?`
    - 봇에 DM을 보냅니다: `Show me all tables in the demo database.`

봇은 스레드에서 응답하며, 해당되는 경우 모든 이전 스레드 메시지를 컨텍스트로 사용합니다.

**스레드 컨텍스트:**
스레드에서 응답할 때, 봇은 모든 이전 메시지(현재 메시지를 제외함)를 로드하여 AI에 대한 컨텍스트로 포함합니다.

**도구 사용:**
봇은 MCP를 통해 사용할 수 있는 도구(예: 스키마 발견, SQL 실행)만 사용하며, 사용된 SQL과 답변이 어떻게 찾아졌는지에 대한 요약을 항상 표시합니다.

</VerticalStepper>
