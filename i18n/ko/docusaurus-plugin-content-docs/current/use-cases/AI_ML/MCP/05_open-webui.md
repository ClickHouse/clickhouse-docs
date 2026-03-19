---
slug: /use-cases/AI/MCP/open-webui
sidebar_label: 'Open WebUI 통합'
title: 'Open WebUI 및 ClickHouse Cloud와 함께 ClickHouse MCP 서버 설정하기'
pagination_prev: null
pagination_next: null
description: '이 가이드는 Docker를 사용하여 Open WebUI와 ClickHouse MCP 서버를 함께 설정하는 방법을 설명합니다.'
keywords: ['AI', 'Open WebUI', 'MCP']
show_related_blogs: true
doc_type: 'guide'
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


# Open WebUI와 함께 ClickHouse MCP 서버 사용하기 \{#using-clickhouse-mcp-server-with-open-webui\}

> 이 가이드에서는 [Open WebUI](https://github.com/open-webui/open-webui)를 ClickHouse MCP 서버와 함께 설정하고
> ClickHouse 예제 데이터셋에 연결하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">


## uv 설치 \{#install-uv\}

이 가이드의 지침을 따르려면 [uv](https://docs.astral.sh/uv/)를 설치해야 합니다.
uv를 사용하지 않으려면 MCP Server 구성을 변경하여 다른 패키지 관리자를 사용하도록 설정해야 합니다.



## Open WebUI 실행하기 \{#launch-open-webui\}

Open WebUI를 실행하려면 다음 명령을 실행하십시오.

```bash
uv run --with open-webui open-webui serve
```

http://localhost:8080/ 로 이동하여 UI를 확인하십시오.


## ClickHouse MCP 서버 구성하기 \{#configure-clickhouse-mcp-server\}

ClickHouse MCP 서버를 구성하려면 MCP 서버를 OpenAPI 엔드포인트로 변환해야 합니다.
먼저 ClickHouse SQL Playground에 연결할 수 있도록 환경 변수를 설정합니다:

```bash
export CLICKHOUSE_HOST="sql-clickhouse.clickhouse.com"
export CLICKHOUSE_USER="demo"
export CLICKHOUSE_PASSWORD=""
```

그리고 이후 `mcpo`를 실행하여 Open API 엔드포인트를 생성합니다.

```bash
uvx mcpo --port 8000 -- uv run --with mcp-clickhouse --python 3.10 mcp-clickhouse
```

http://localhost:8000/docs로 이동하면 생성된 엔드포인트 목록을 볼 수 있습니다.

<Image img={Endpoints} alt="Open API 엔드포인트" size="md" />

이 엔드포인트를 Open WebUI에서 사용하려면 설정 페이지로 이동합니다:

<Image img={Settings} alt="Open WebUI 설정" size="md" />

`Tools`를 클릭합니다:

<Image img={ToolsPage} alt="Open WebUI 도구" size="md" />

도구 URL로 `http://localhost:8000`을(를) 추가합니다:

<Image img={AddTool} alt="Open WebUI 도구" size="md" />

이 작업을 완료하면 채팅 바의 도구 아이콘 옆에 `1`이 표시됩니다:

<Image img={ToolsAvailable} alt="사용 가능한 Open WebUI 도구" size="md" />

도구 아이콘을 클릭하면 사용 가능한 도구 목록이 표시됩니다:

<Image img={ListOfTools} alt="Open WebUI 도구 목록" size="md" />


## OpenAI 구성 \{#configure-openai\}

기본적으로 Open WebUI는 Ollama 모델만 사용하지만, OpenAI 호환 엔드포인트도 추가할 수 있습니다.
이는 설정 메뉴에서 구성하며, 이번에는 `Connections` 탭을 클릭합니다:

<Image img={Connections} alt="Open WebUI 연결" size="md"/>

엔드포인트와 OpenAI 키를 추가합니다:

<Image img={AddConnection} alt="Open WebUI - OpenAI를 연결로 추가" size="md"/>

이제 상단 메뉴에서 OpenAI 모델을 선택해 사용할 수 있습니다:

<Image img={OpenAIModels} alt="Open WebUI - 모델" size="md"/>



## Open WebUI를 사용하여 ClickHouse MCP 서버와 대화하기 \{#chat-to-clickhouse-mcp-server\}

We can then have a conversation and Open WebUI will call the MCP Server if necessary:

<Image
  img={Conversation}
  alt='Open WebUI - Chat with ClickHouse MCP Server'
  size='md'
/>

</VerticalStepper>
