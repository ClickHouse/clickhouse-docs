---
'slug': '/use-cases/AI/MCP/claude-desktop'
'sidebar_label': 'Claude Desktop 통합'
'title': 'ClickHouse MCP 서버를 Claude Desktop으로 설정하기'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 ClickHouse MCP 서버와 Claude Desktop을 설정하는 방법을 설명합니다.'
'keywords':
- 'AI'
- 'Librechat'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import ClaudeDesktopConfig from '@site/static/images/use-cases/AI_ML/MCP/claude-desktop-config.png';
import FindMCPServers from '@site/static/images/use-cases/AI_ML/MCP/find-mcp-servers.gif';
import MCPPermission from '@site/static/images/use-cases/AI_ML/MCP/mcp-permission.png';
import ClaudeConversation from '@site/static/images/use-cases/AI_ML/MCP/claude-conversation.png';


# ClickHouse MCP 서버를 Claude Desktop과 함께 사용하는 방법

> 이 가이드는 Claude Desktop을 ClickHouse MCP 서버와 함께 설정하는 방법을 설명하며, uv를 사용하고 ClickHouse 예제 데이터 세트에 연결하는 방법을 포함합니다.

<iframe width="768" height="432" src="https://www.youtube.com/embed/y9biAm_Fkqw?si=9PP3-1Y1fvX8xy7q" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<VerticalStepper headerLevel="h2">

## uv 설치하기 {#install-uv}

이 가이드를 따라하기 위해서는 [uv](https://docs.astral.sh/uv/)를 설치해야 합니다.  
uv를 사용하고 싶지 않다면, MCP 서버 구성에서 대체 패키지 관리자를 사용하도록 업데이트해야 합니다.

## Claude Desktop 다운로드 {#download-claude-desktop}

또한 Claude Desktop 앱을 설치해야 하며, 이는 [Claude Desktop 웹사이트](https://claude.ai/desktop)에서 다운로드할 수 있습니다.

## ClickHouse MCP 서버 구성 {#configure-clickhouse-mcp-server}

Claude Desktop을 설치한 후, [ClickHouse MCP 서버](https://github.com/ClickHouse/mcp-clickhouse)를 구성할 차례입니다.  
이는 [Claude Desktop 구성 파일](https://claude.ai/docs/configuration)을 통해 할 수 있습니다.

이 파일을 찾으려면 먼저 설정 페이지(`Cmd+,` Mac에서)를 열고, 좌측 메뉴에서 `Developer` 탭을 클릭하십시오.  
그럼 다음 화면이 나타나고, `Edit config` 버튼을 클릭해야 합니다:

<Image img={ClaudeDesktopConfig} alt="Claude Desktop 구성" size="md" />

이것은 구성 파일(`claude_desktop_config.json`)이 포함된 디렉토리로 이동합니다.  
처음으로 그 파일을 열면 다음과 같은 내용이 포함되어 있을 것입니다:

```json
{
  "mcpServers": {}
}
```

`mcpServers` 사전은 MCP 서버의 이름을 키로 하고 구성 옵션의 사전을 값으로 가집니다.  
예를 들어 ClickHouse Playground에 연결하는 ClickHouse MCP 서버 구성은 다음과 같을 것입니다:

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

구성을 업데이트한 후, 변경 사항이 적용되도록 Claude Desktop을 재시작해야 합니다.

:::warning
`uv`를 설치한 방법에 따라 Claude Desktop을 재시작할 때 다음과 같은 오류가 발생할 수 있습니다:

```text
MCP mcp-clickhouse: spawn uv ENOENT
```

그럴 경우, `command`를 `uv`의 전체 경로로 업데이트해야 합니다. 예를 들어 Cargo를 통해 설치한 경우 경로는 `/Users/<username>/.cargo/bin/uv`가 됩니다.
:::

## ClickHouse MCP 서버 사용하기 {#using-clickhouse-mcp-server}

Claude Desktop을 재시작한 후, `Search and tools` 아이콘을 클릭하여 ClickHouse MCP 서버를 찾을 수 있습니다:

<Image img={FindMCPServers} alt="MCP 서버 찾기" size="md" />
<br/>

그 후 모든 도구 또는 일부 도구의 사용을 비활성화할 수 있습니다.

이제 Claude에게 ClickHouse MCP 서버를 사용하여 답변을 요청할 준비가 되었습니다.  
예를 들어, 'SQL 놀이터에서 가장 흥미로운 데이터셋은 무엇인가요?'라는 질문을 할 수 있습니다.

Claude는 MCP 서버에서 각 도구를 처음 사용할 때 그 사용을 확인하도록 요청합니다:

<Image img={MCPPermission} alt="list_databases 도구 사용 허가" size="md" />

아래는 ClickHouse MCP 서버에 대한 도구 호출을 포함한 대화의 일부입니다:

<Image img={ClaudeConversation} alt="Claude 대화" size="md" />

</VerticalStepper>
