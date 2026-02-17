---
slug: /use-cases/AI/MCP/anythingllm
sidebar_label: 'AnythingLLM 통합'
title: 'AnythingLLM 및 ClickHouse Cloud와 함께 ClickHouse MCP 서버 설정하기'
pagination_prev: null
pagination_next: null
description: '이 가이드는 Docker를 사용하여 ClickHouse MCP 서버와 함께 AnythingLLM을 설정하는 방법을 설명합니다.'
keywords: ['AI', 'AnythingLLM', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

import Conversation from '@site/static/images/use-cases/AI_ML/MCP/allm_conversation.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/allm_mcp-servers.png';
import ToolIcon from '@site/static/images/use-cases/AI_ML/MCP/alm_tool-icon.png';


# AnythingLLM과 함께 ClickHouse MCP 서버 사용하기 \{#using-clickhouse-mcp-server-with-anythingllm\}

> 본 가이드는 Docker를 사용하여 ClickHouse MCP 서버와 함께 [AnythingLLM](https://anythingllm.com/)을 설정하고
> ClickHouse 예제 데이터셋에 연결하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">


## Docker 설치 \{#install-docker\}

LibreChat과 MCP 서버를 실행하려면 Docker가 필요합니다. Docker를 설치하려면 다음을 수행하십시오.
1. [docker.com](https://www.docker.com/products/docker-desktop)에 방문합니다.
2. 사용하는 운영 체제에 맞는 Docker Desktop을 다운로드합니다.
3. 운영 체제별 안내에 따라 Docker를 설치합니다.
4. Docker Desktop을 실행하고 정상적으로 동작하는지 확인합니다.
<br/>
자세한 내용은 [Docker 문서](https://docs.docker.com/get-docker/)를 참조하십시오.



## AnythingLLM Docker 이미지 가져오기 \{#pull-anythingllm-docker-image\}

다음 명령어를 실행하여 로컬 머신으로 AnythingLLM Docker 이미지를 가져옵니다:

```bash
docker pull anythingllm/anythingllm
```


## 저장소 위치 설정 \{#setup-storage-location\}

저장소용 디렉터리를 생성하고 환경 파일을 초기화합니다:

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```


## MCP Server 설정 파일 구성 \{#configure-mcp-server-config-file\}

`plugins` 디렉터리를 생성합니다:

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

`plugins` 디렉터리에 `anythingllm_mcp_servers.json` 파일을 생성하고 다음 내용을 추가합니다:

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
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": ""
      }
    }
  }
}
```

자신의 데이터를 직접 살펴보고 싶다면 사용 중인 ClickHouse Cloud 서비스의
[host, username, password](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)를 사용하면 됩니다.


## AnythingLLM Docker 컨테이너 시작하기 \{#start-anythingllm-docker-container\}

다음 명령어를 실행하여 AnythingLLM Docker 컨테이너를 시작하십시오:

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

시작되면 브라우저에서 `http://localhost:3001`로 이동합니다.
사용하려는 모델을 선택한 후 API 키를 입력합니다.


## MCP 서버가 시작될 때까지 기다리기 \{#wait-for-mcp-servers-to-start-up\}

UI 왼쪽 하단의 도구 아이콘을 클릭합니다.

<Image img={ToolIcon} alt="도구 아이콘" size="md"/>

`Agent Skills`를 클릭한 다음 `MCP Servers` 섹션을 확인합니다. 
`Mcp ClickHouse`가 `On`으로 표시될 때까지 기다립니다.

<Image img={MCPServers} alt="MCP 서버 준비 완료" size="md"/>



## AnythingLLM으로 ClickHouse MCP 서버와 대화하기 \{#chat-with-clickhouse-mcp-server-with-anythingllm\}

이제 대화를 시작할 준비가 완료되었습니다.
대화에서 MCP 서버를 사용하려면 대화의 첫 번째 메시지 앞에 `@agent`를 입력하십시오.

<Image img={Conversation} alt='Conversation' size='md' />

</VerticalStepper>
