---
'slug': '/use-cases/AI/MCP/remote_mcp'
'sidebar_label': 'ClickHouse Cloud 원격 MCP'
'title': 'ClickHouse Cloud 원격 MCP 서버 활성화'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 ClickHouse Cloud 원격 MCP를 활성화하고 사용하는 방법을 설명합니다.'
'keywords':
- 'AI'
- 'ClickHouse Cloud'
- 'MCP'
'show_related_blogs': true
'sidebar_position': 1
'doc_type': 'guide'
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


# ClickHouse Cloud 원격 MCP 서버 활성화

> 이 가이드는 ClickHouse Cloud 원격 MCP 서버를 활성화하고 사용하는 방법을 설명합니다. 이 예제에서는 Claude Code를 MCP 클라이언트로 사용하지만, MCP를 지원하는 모든 LLM 클라이언트를 사용할 수 있습니다.

<VerticalStepper headerLevel="h2">

## ClickHouse Cloud 서비스에 대한 원격 MCP 서버 활성화 {#enable-remote-mcp-server}

1. ClickHouse Cloud 서비스에 연결하고 `Connect` 버튼을 클릭한 후 서비스에 대한 원격 MCP 서버를 활성화합니다.

<Image img={img1} alt="Connect Modal에서 MCP 선택" size="md"/>

<Image img={img2} alt="MCP 서버 활성화" size="md"/>

2. `Connect` 보기 또는 아래에서 ClickHouse Cloud MCP 서버의 URL을 복사합니다.

```bash
https://mcp.clickhouse.cloud/mcp
```

## Claude Code에서 ClickHouse MCP 서버 추가 {#add-clickhouse-mcp-server-claude-code}

1. 작업 디렉토리에서 다음 명령어를 실행하여 Claude Code에 ClickHouse Cloud MCP 서버 구성을 추가합니다. 이 예제에서는 Claude Code 구성에서 MCP 서버 이름을 `clickhouse_cloud`로 지정했습니다.

```bash
claude mcp add --transport http clickhouse_cloud https://mcp.clickhouse.cloud/mcp
```

1b. 사용 중인 MCP 클라이언트에 따라 JSON 구성을 직접 편집할 수도 있습니다.

```json
{
  "mcpServers": {
    "clickhouse-remote": {
      "url": "https://mcp.clickhouse.cloud/mcp"
    }
  }
}
```

2. 작업 디렉토리에서 Claude Code를 실행합니다.

```bash
[user@host ~/Documents/repos/mcp_test] $ claude
```

## OAuth를 통한 ClickHouse Cloud 인증 {#authenticate-via-oauth}

1. Claude Code는 첫 번째 세션에서 브라우저 창을 엽니다. 그렇지 않은 경우 Claude Code에서 `/mcp` 명령을 실행하고 `clickhouse_cloud` MCP 서버를 선택하여 연결을 트리거할 수 있습니다.

2. ClickHouse Cloud 자격 증명을 사용하여 인증합니다.

<Image img={img3} alt="OAuth 연결 흐름" size="sm"/>

<Image img={img4} alt="OAuth 연결 흐름 성공" size="sm"/>

## Claude Code에서 ClickHouse Cloud 원격 MCP 서버 사용 {#use-rempte-mcp-from-claude-code}

1. Claude Code에서 원격 MCP 서버가 연결되었는지 확인합니다.

<Image img={img5} alt="Claude Code MCP 성공" size="md"/>

<Image img={img6} alt="Claude Code MCP 세부정보" size="md"/>

2. 축하합니다! 이제 Claude Code에서 ClickHouse Cloud 원격 MCP 서버를 사용할 수 있습니다.

<Image img={img7} alt="Claude Code MCP 사용" size="md"/>

이 예제에서는 Claude Code를 사용했지만, 유사한 단계를 따라 MCP를 지원하는 모든 LLM 클라이언트를 사용할 수 있습니다.

</VerticalStepper>
