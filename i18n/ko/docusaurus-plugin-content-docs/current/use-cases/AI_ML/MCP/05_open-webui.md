---
'slug': '/use-cases/AI/MCP/open-webui'
'sidebar_label': 'Open WebUI 통합하기'
'title': 'ClickHouse MCP 서버를 Open WebUI 및 ClickHouse Cloud와 함께 설정하기'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 Docker를 사용하여 ClickHouse MCP 서버와 Open WebUI를 설정하는 방법을 설명합니다.'
'keywords':
- 'AI'
- 'Open WebUI'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import Endpoints from '@site/static/images/use-cases/AI_ML/MCP/0_endpoints.png';
import Settings from '@site/static/images/use-cases/AI_ML/MCP/1_settings.png';
import ToolsPage from '@site/static/images/use-cases/AI_ML/MCP/2_tools_page.png';
import AddTool from '@site/static/images/use-cases/AI_ML/MCP/3_add_tool.png';
import ToolsAvailable from '@site/static/images/use-cases/AI_ML/MCP/4_tools_available.png';
import ListOfTools from '@site/static/images/use-cases/AI_ML/MCP/5_list_of_tools.png';
import Connections from '@site/static/images/use-cases/AI_ML/MCP/6_connections.png';
import AddConnection from '@site/static/images/use-cases/AI_ML/MCP/7_add_connection.png';
import OpenAIModels from '@site/static/images/use-cases/AI_ML/MCP/8_openai_models_more.png';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/9_conversation.png';


# ClickHouse MCP 서버와 Open WebUI 사용하기

> 이 가이드는 ClickHouse MCP 서버와 [Open WebUI](https://github.com/open-webui/open-webui)를 설정하고 ClickHouse 예제 데이터세트에 연결하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## uv 설치하기 {#install-uv}

이 가이드를 따르기 위해 [uv](https://docs.astral.sh/uv/)를 설치해야 합니다.  
uv를 사용하고 싶지 않다면, 대체 패키지 관리자를 사용하도록 MCP 서버 구성을 업데이트해야 합니다.

## Open WebUI 시작하기 {#launch-open-webui}

Open WebUI를 시작하려면 다음 명령어를 실행할 수 있습니다:

```bash
uv run --with open-webui open-webui serve
```

http://localhost:8080/로 이동하여 UI를 확인하세요.

## ClickHouse MCP 서버 구성하기 {#configure-clickhouse-mcp-server}

ClickHouse MCP 서버를 설정하려면 MCP 서버를 Open API 엔드포인트로 변환해야 합니다.  
먼저 ClickHouse SQL Playground에 연결할 수 있도록 환경 변수를 설정합시다:

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

이제 `mcpo`를 실행하여 Open API 엔드포인트를 생성할 수 있습니다:

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

생성된 엔드포인트의 목록은 http://localhost:8000/docs로 이동하여 확인할 수 있습니다.

<Image img={Endpoints} alt="Open API endpoints" size="md"/>

Open WebUI에서 이러한 엔드포인트를 사용하려면 설정으로 이동해야 합니다:

<Image img={Settings} alt="Open WebUI settings" size="md"/>

`Tools`를 클릭하세요:

<Image img={ToolsPage} alt="Open WebUI tools" size="md"/>

http://localhost:8000 을 도구 URL로 추가합니다:

<Image img={AddTool} alt="Open WebUI tool" size="md"/>

이 작업을 마치면 채팅 바의 도구 아이콘 옆에 `1`이 표시되어야 합니다:

<Image img={ToolsAvailable} alt="Open WebUI tools available" size="md"/>

도구 아이콘을 클릭하면 사용 가능한 도구 목록을 볼 수 있습니다:

<Image img={ListOfTools} alt="Open WebUI tool listing" size="md"/>

## OpenAI 구성하기 {#configure-openai}

기본적으로 Open WebUI는 Ollama 모델과 함께 작동하지만, OpenAI 호환 엔드포인트도 추가할 수 있습니다.  
이들은 설정 메뉴를 통해 구성되지만, 이 때는 `Connections` 탭을 클릭해야 합니다:

<Image img={Connections} alt="Open WebUI connections" size="md"/>

엔드포인트와 OpenAI 키를 추가해 봅시다:

<Image img={AddConnection} alt="Open WebUI - Add OpenAI as a connection" size="md"/>

OpenAI 모델은 이후 상단 메뉴에서 사용할 수 있습니다:

<Image img={OpenAIModels} alt="Open WebUI - Models" size="md"/>

## Open WebUI로 ClickHouse MCP 서버와 대화하기 {#chat-to-clickhouse-mcp-server}

그런 다음 대화를 나누고 Open WebUI는 필요시 MCP 서버를 호출할 수 있습니다:

<Image img={Conversation} alt="Open WebUI - Chat with ClickHouse MCP Server" size="md"/>

</VerticalStepper>
