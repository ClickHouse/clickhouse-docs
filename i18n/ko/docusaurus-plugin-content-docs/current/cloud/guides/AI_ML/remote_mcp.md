---
slug: /use-cases/AI/MCP/remote_mcp
sidebar_label: '원격 MCP 서버 활성화'
title: 'ClickHouse Cloud Remote MCP Server 활성화 및 연결'
pagination_prev: null
pagination_next: null
description: '이 가이드에서는 ClickHouse Cloud Remote MCP를 활성화하고 사용하는 방법을 설명합니다'
keywords: ['AI', 'ClickHouse Cloud', 'MCP']
show_related_blogs: true
sidebar_position: 1
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import img1 from '@site/static/images/use-cases/AI_ML/MCP/1connectmcpmodal.png';
import img2 from '@site/static/images/use-cases/AI_ML/MCP/2enable_mcp.png';
import img3 from '@site/static/images/use-cases/AI_ML/MCP/3oauth.png';
import img4 from '@site/static/images/use-cases/AI_ML/MCP/4oauth_success.png';
import img5 from '@site/static/images/use-cases/AI_ML/MCP/5connected_mcp_claude.png';
import img6 from '@site/static/images/use-cases/AI_ML/MCP/6slash_mcp_claude.png';
import img7 from '@site/static/images/use-cases/AI_ML/MCP/7usage_mcp.png';

이 가이드에서는 ClickHouse Cloud Remote MCP Server를 활성화하고, 일반적인 개발자 도구에서 사용할 수 있도록 설정하는 방법을 설명합니다.

**사전 요구 사항**

* 실행 중인 [ClickHouse Cloud 서비스](/getting-started/quick-start/cloud)
* 사용 중인 IDE 또는 에이전트 기반 개발 도구


## Cloud용 원격 MCP 서버 활성화 \{#enable-remote-mcp-server\}

원격 MCP 서버를 활성화할 ClickHouse Cloud 서비스에 연결한 다음, 왼쪽 메뉴에서 `Connect` 버튼을 클릭하세요.
연결 세부 정보가 표시된 상자가 열립니다.

&quot;Connect with MCP&quot;를 선택하세요:

<Image img={img1} alt="Connect 모달에서 MCP 선택" size="md" />

서비스에서 MCP를 활성화하려면 버튼을 켜세요:

<Image img={img2} alt="MCP 서버 활성화" size="md" />

표시된 URL을 복사하세요. 아래 URL과 동일합니다:

```bash
https://mcp.clickhouse.cloud/mcp
```


## 개발용 원격 MCP 설정 \{#setup-clickhouse-cloud-remote-mcp-server\}

아래에서 IDE 또는 도구를 선택한 후 해당 설정 지침을 따르십시오.

### Claude Code \{#claude-code\}

작업 디렉터리에서 다음 명령을 실행하여 Claude Code에 ClickHouse Cloud MCP 서버 구성을 추가하십시오:

```bash
claude mcp add --transport http clickhouse-cloud https://mcp.clickhouse.cloud/mcp
```

그런 다음 Claude Code를 실행합니다:

```bash
claude
```

다음 명령을 실행하여 MCP 서버 목록을 확인합니다:

```bash
/mcp
```

`clickhouse-cloud`를 선택하고 ClickHouse Cloud 자격 증명을 사용해 OAuth로 인증하세요.

### Claude 웹 UI \{#claude-web\}

1. **Customize** &gt; **Connectors**로 이동합니다
2. &quot;+&quot; 아이콘을 클릭한 다음 **사용자 지정 connector 추가**를 클릭합니다
3. 사용자 지정 connector에 `clickhouse-cloud`와 같은 이름을 지정한 후 추가합니다
4. 새로 추가한 `clickhouse-cloud` connector를 클릭한 다음 **Connect**를 클릭합니다
5. OAuth를 통해 ClickHouse Cloud 자격 증명으로 인증합니다

### Cursor \{#cursor\}

1. [Cursor Marketplace](https://cursor.com/marketplace)에서 MCP 서버를 찾아 설치합니다.
2. ClickHouse를 검색한 다음, 원하는 서버에서 &quot;Add to Cursor&quot;를 클릭하여 설치합니다.
3. OAuth로 인증합니다.

### Visual Studio Code \{#visual-studio-code\}

다음 구성을 `.vscode/mcp.json` 파일에 추가하세요:

```json
{
  "servers": {
    "clickhouse-cloud": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

자세한 내용은 [Visual Studio Code 문서](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)를 참조하십시오.


### Windsurf \{#windsurf\}

다음 구성을 사용하여 `mcp_config.json` 파일을 편집하세요:

```json
{
  "mcpServers": {
    "clickhouse-cloud": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.clickhouse.cloud/mcp"]
    }
  }
}
```

자세한 내용은 [Windsurf 문서](https://docs.windsurf.com/windsurf/cascade/mcp#adding-a-new-mcp)를 참조하십시오.


### Zed \{#zed\}

ClickHouse를 사용자 지정 서버로 추가합니다.
Zed 설정의 **context&#95;servers** 아래에 다음 내용을 추가하십시오:

```json
{
  "context_servers": {
    "clickhouse-cloud": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

그러면 Zed는 서버에 처음 연결할 때 OAuth를 통해 인증하라는 메시지를 표시합니다.
자세한 내용은 [Zed 문서](https://zed.dev/docs/ai/mcp#as-custom-servers)를 참조하십시오.


### Codex \{#codex\}

CLI를 사용해 ClickHouse Cloud MCP 서버를 추가하려면 다음 명령을 실행하세요:

```bash
codex mcp add clickhouse-cloud --url https://mcp.clickhouse.cloud/mcp
```


## 관련 콘텐츠 \{#related-content\}

* [ClickHouse agent skills](https://github.com/ClickHouse/agent-skills)