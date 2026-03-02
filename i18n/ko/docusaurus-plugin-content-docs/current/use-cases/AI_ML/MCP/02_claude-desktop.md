---
slug: /use-cases/AI/MCP/claude-desktop
sidebar_label: 'Claude Desktop 통합'
title: 'Claude Desktop과 함께 ClickHouse MCP 서버 설정하기'
pagination_prev: null
pagination_next: null
description: '이 가이드는 ClickHouse MCP 서버와 함께 Claude Desktop을 설정하는 방법을 설명합니다.'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';


# Claude Desktop에서 ClickHouse MCP 서버 사용하기 \{#using-clickhouse-mcp-server-with-claude-desktop\}

> 이 가이드에서는 uv를 사용하여 Claude Desktop에 ClickHouse MCP 서버를 설정하고
> ClickHouse 예제 데이터셋에 연결하는 방법을 설명합니다.

<iframe
  width='768'
  height='432'
  src='https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q'
  title='YouTube video player'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

<VerticalStepper headerLevel="h2">


## uv 설치 \{#install-uv\}

이 가이드의 안내를 따르려면 [uv](https://docs.astral.sh/uv/)를 설치해야 합니다.
uv를 사용하지 않으려면 MCP Server 구성을 다른 패키지 관리자를 사용하도록 업데이트해야 합니다.



## Claude Desktop 다운로드 \{#download-claude-desktop\}

또한 [Claude Desktop 웹사이트](https://claude.ai/desktop)에서 다운로드할 수 있는 Claude Desktop 앱을 설치해야 합니다.



## ClickHouse MCP 서버 구성하기 \{#configure-clickhouse-mcp-server\}

Claude Desktop를 설치한 후에는 이제 [ClickHouse MCP server](https://github.com/ClickHouse/mcp-clickhouse)를 구성해야 합니다.
이는 [Claude Desktop configuration file](https://claude.ai/docs/configuration)을 통해 수행할 수 있습니다.

이 파일을 찾으려면 먼저 설정 페이지로 이동합니다(Mac에서는 `Cmd+,` 사용), 그런 다음 왼쪽 메뉴에서 `Developer` 탭을 클릭합니다.
그러면 다음과 같은 화면이 표시되며, 여기에서 `Edit config` 버튼을 클릭합니다:

<Image img={ClaudeDesktopConfig} alt="Claude Desktop configuration" size="md" />

해당 버튼을 클릭하면 구성 파일(`claude_desktop_config.json`)이 포함된 디렉터리로 이동합니다.
처음 이 파일을 열면, 다음과 같은 내용이 포함되어 있을 가능성이 높습니다:

```json
{
  "mcpServers": {}
}
```

`mcpServers` 딕셔너리는 MCP 서버의 이름을 키로 사용하고, 값으로는 설정 옵션을 담은 딕셔너리를 사용합니다.
예를 들어, ClickHouse Playground에 연결하는 ClickHouse MCP 서버 설정은 다음과 같습니다.

```json
{
  "mcpServers": {
    "mcp-clickhouse": {
      "command": "uv",
      "args": [
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
      ],
      "env": {
        "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
        "CLICKHOUSE_PORT": "8443",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": "",
        "CLICKHOUSE_SECURE": "true",
        "CLICKHOUSE_VERIFY": "true",
        "CLICKHOUSE_CONNECT_TIMEOUT": "30",
        "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
      }
    }
  }
}
```

구성을 업데이트한 후에는 변경 사항이 적용되도록 Claude Desktop을 다시 시작해야 합니다.

:::warning
`uv`를 설치한 방식에 따라 Claude Desktop을 다시 시작할 때 다음과 같은 오류가 발생할 수 있습니다:

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

그런 경우 `command`를 `uv`의 전체 경로로 업데이트해야 합니다. 예를 들어 Cargo를 통해 설치한 경우 경로는 `/Users/<username>/.cargo/bin/uv`가 됩니다.
:::


## ClickHouse MCP 서버 사용 \{#using-clickhouse-mcp-server\}

Claude Desktop을 재시작한 후 `Search and tools` 아이콘을 클릭하면 ClickHouse MCP 서버를 찾을 수 있습니다:

<Image img={FindMCPServers} alt='MCP 서버 찾기' size='md' />
<br />

이후 모든 도구를 비활성화할지 또는 일부 도구만 비활성화할지 선택할 수 있습니다.

이제 Claude에게 ClickHouse MCP 서버를 사용하는 질문을 할 준비가 되었습니다.
예를 들어 `What's the most interesting dataset in the SQL playground?`라고 질문할 수 있습니다.

Claude는 MCP 서버의 각 도구가 처음 호출될 때 사용 확인을 요청합니다:

<Image
  img={MCPPermission}
  alt='list_databases 도구 사용 권한 부여'
  size='md'
/>

아래에서 ClickHouse MCP 서버에 대한 도구 호출이 포함된 대화의 일부를 확인할 수 있습니다:

<Image img={ClaudeConversation} alt='Claude 대화' size='md' />

</VerticalStepper>
