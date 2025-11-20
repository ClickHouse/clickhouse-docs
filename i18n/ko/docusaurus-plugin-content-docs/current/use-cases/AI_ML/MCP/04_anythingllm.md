---
'slug': '/use-cases/AI/MCP/anythingllm'
'sidebar_label': 'AnythingLLM 통합'
'title': 'AnythingLLM 및 ClickHouse MCP 서버 설정하기'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 Docker를 사용하여 ClickHouse MCP 서버와 함께 AnythingLLM을 설정하는 방법을 설명합니다.'
'keywords':
- 'AI'
- 'AnythingLLM'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import Conversation from '@site/static/images/use-cases/AI_ML/MCP/allm_conversation.png';
import MCPServers from '@site/static/images/use-cases/AI_ML/MCP/allm_mcp-servers.png';
import ToolIcon from '@site/static/images/use-cases/AI_ML/MCP/alm_tool-icon.png';


# ClickHouse MCP 서버와 AnythingLLM 사용하기

> 이 가이드는 Docker를 사용하여 ClickHouse MCP 서버와 [AnythingLLM](https://anythingllm.com/)을 설정하고 ClickHouse 예제 데이터셋에 연결하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## Docker 설치하기 {#install-docker}

LibreChat 및 MCP 서버를 실행하려면 Docker가 필요합니다. Docker를 얻으려면:
1. [docker.com](https://www.docker.com/products/docker-desktop) 방문하기
2. 운영 체제에 맞는 Docker Desktop 다운로드하기
3. 운영 체제에 대한 지침에 따라 Docker 설치하기
4. Docker Desktop을 열고 실행 중인지 확인하기
<br/>
자세한 정보는 [Docker 문서](https://docs.docker.com/get-docker/)를 참조하세요.

## AnythingLLM Docker 이미지 가져오기 {#pull-anythingllm-docker-image}

다음 명령어를 실행하여 AnythingLLM Docker 이미지를 머신으로 가져옵니다:

```bash
docker pull anythingllm/anythingllm
```

## 저장 위치 설정하기 {#setup-storage-location}

저장할 디렉토리를 만들고 환경 파일을 초기화합니다:

```bash
export STORAGE_LOCATION=$PWD/anythingllm && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" 
```

## MCP 서버 구성 파일 설정하기 {#configure-mcp-server-config-file}

`plugins` 디렉토리를 생성합니다:

```bash
mkdir -p "$STORAGE_LOCATION/plugins"
```

`plugins` 디렉토리에 `anythingllm_mcp_servers.json`라는 파일을 생성하고 다음 내용을 추가합니다:

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

자신의 데이터를 탐색하고 싶다면,
자신의 ClickHouse Cloud 서비스의 [호스트, 사용자 이름 및 비밀번호](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)를 사용하여 가능합니다.

## AnythingLLM Docker 컨테이너 시작하기 {#start-anythingllm-docker-container}

다음 명령어를 실행하여 AnythingLLM Docker 컨테이너를 시작합니다:

```bash
docker run -p 3001:3001 \
--cap-add SYS_ADMIN \
-v ${STORAGE_LOCATION}:/app/server/storage \
-v ${STORAGE_LOCATION}/.env:/app/server/.env \
-e STORAGE_DIR="/app/server/storage" \
mintplexlabs/anythingllm
```

컨테이너가 시작되면 브라우저에서 `http://localhost:3001`로 이동합니다.
사용하려는 모델을 선택하고 API 키를 제공하세요.

## MCP 서버가 시작될 때까지 기다리기 {#wait-for-mcp-servers-to-start-up}

UI의 왼쪽 하단에 있는 도구 아이콘을 클릭합니다:

<Image img={ToolIcon} alt="Tool icon" size="md"/>

`Agent Skills`를 클릭하고 `MCP Servers` 섹션을 확인하세요. 
`Mcp ClickHouse`가 `On`으로 설정될 때까지 기다립니다.

<Image img={MCPServers} alt="MCP servers ready" size="md"/>

## AnythingLLM으로 ClickHouse MCP 서버와 채팅하기 {#chat-with-clickhouse-mcp-server-with-anythingllm}

이제 채팅을 시작할 준비가 되었습니다.
MCP 서버를 채팅에서 사용할 수 있게 하려면, 대화의 첫 번째 메시지를 `@agent`로 접두사 붙여야 합니다.

<Image img={Conversation} alt="Conversation" size="md"/>

</VerticalStepper>
