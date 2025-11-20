---
'slug': '/use-cases/AI/MCP/librechat'
'sidebar_label': 'LibreChat 통합하기'
'title': 'LibreChat 및 ClickHouse MCP 서버 설정하기'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 Docker를 사용하여 LibreChat을 ClickHouse MCP 서버와 설정하는 방법을 설명합니다.'
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
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';


# ClickHouse MCP 서버와 LibreChat 사용하기

> 이 가이드는 Docker를 사용하여 ClickHouse MCP 서버와 LibreChat을 설정하고 ClickHouse 예제 데이터 세트에 연결하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## Docker 설치하기 {#install-docker}

LibreChat과 MCP 서버를 실행하려면 Docker가 필요합니다. Docker를 얻으려면:
1. [docker.com](https://www.docker.com/products/docker-desktop) 방문
2. 운영 체제에 맞는 Docker 데스크톱 다운로드
3. 운영 체제에 대한 지침을 따라 Docker 설치
4. Docker Desktop을 열고 실행 중인지 확인
<br/>
더 많은 정보는 [Docker 문서](https://docs.docker.com/get-docker/)를 참조하세요.

## LibreChat 리포지토리 클론하기 {#clone-librechat-repo}

터미널(명령 프롬프트, 터미널 또는 PowerShell)을 열고 다음 명령을 사용하여 
LibreChat 리포지토리를 클론합니다:

```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```

## .env 파일 생성 및 수정하기 {#create-and-edit-env-file}

`.env.example`에서 예제 구성 파일을 `.env`로 복사합니다:

```bash
cp .env.example .env
```

가장 좋아하는 텍스트 편집기로 `.env` 파일을 열면 OpenAI, Anthropic, AWS bedrock 등 여러 인기 LLM 제공업체를 위한 섹션이 나타납니다, 예를 들어:

```text title=".venv"
#============#

# Anthropic  #
#============#
#highlight-next-line
ANTHROPIC_API_KEY=user_provided

# ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307

# ANTHROPIC_REVERSE_PROXY=
```

`user_provided`를 사용하려는 LLM 제공업체의 API 키로 교체하십시오.

:::note 로컬 LLM 사용하기
API 키가 없는 경우 Ollama와 같은 로컬 LLM을 사용할 수 있습니다. 이를 사용하는 방법은 나중에 ["Ollama 설치하기"](#add-local-llm-using-ollama) 단계에서 설명합니다. 현재는 .env 파일을 수정하지 말고 다음 단계로 진행하세요.
:::

## librechat.yaml 파일 생성하기 {#create-librechat-yaml-file}

다음 명령을 실행하여 새 `librechat.yaml` 파일을 생성합니다:

```bash
cp librechat.example.yaml librechat.yaml
```

이는 LibreChat의 주요 [구성 파일](https://www.librechat.ai/docs/configuration/librechat_yaml)을 생성합니다.

## Docker Compose에 ClickHouse MCP 서버 추가하기 {#add-clickhouse-mcp-server-to-docker-compose}

다음으로, LLM이 [ClickHouse SQL 플레이그라운드](https://sql.clickhouse.com/)와 상호작용할 수 있도록 LibreChat Docker Compose 파일에 ClickHouse MCP 서버를 추가합니다.

`docker-compose.override.yml`이라는 파일을 만들고 다음 구성을 추가합니다:

```yml title="docker-compose.override.yml"
services:
  api:
    volumes:
      - ./librechat.yaml:/app/librechat.yaml
  mcp-clickhouse:
    image: mcp/clickhouse
    container_name: mcp-clickhouse
    ports:
      - 8001:8000
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
      - CLICKHOUSE_USER=demo
      - CLICKHOUSE_PASSWORD=
      - CLICKHOUSE_MCP_SERVER_TRANSPORT=sse
      - CLICKHOUSE_MCP_BIND_HOST=0.0.0.0
```

자신의 데이터를 탐색하고 싶다면, 자신의 ClickHouse Cloud 서비스의 [호스트, 사용자 이름 및 비밀번호](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)를 사용하여 그렇게 할 수 있습니다.

<Link to="https://cloud.clickhouse.com/">
<CardHorizontal
badgeIcon="cloud"
badgeIconDir=""
badgeState="default"
badgeText=""
description="
ClickHouse Cloud 계정이 아직 없다면 오늘 ClickHouse Cloud를 시작하고 
$300의 크레딧을 받으세요. 30일 무료 체험이 끝나면, 사용한 만큼 지불하는 요금제로 계속하시거나,
볼륨 기반 할인에 대한 자세한 내용을 알아보려면 저희에게 문의하세요.
요금제 페이지를 방문하여 자세한 내용을 보세요.
"
icon="cloud"
infoText=""
infoUrl=""
title="ClickHouse Cloud 시작하기"
isSelected={true}
/>
</Link>

## librechat.yaml에서 MCP 서버 설정하기 {#configure-mcp-server-in-librechat-yaml}

`librechat.yaml`을 열고 파일 끝에 다음 구성을 추가합니다:

```yml
mcpServers:
  clickhouse-playground:
    type: sse
    url: http://host.docker.internal:8001/sse
```

이것은 Docker에서 실행 중인 MCP 서버에 연결하도록 LibreChat을 구성합니다.

다음 줄을 찾습니다: 

```text title="librechat.yaml"
socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
```

편의상, 지금은 인증이 필요하지 않도록 설정하겠습니다:

```text title="librechat.yaml"
socialLogins: []
```

## Ollama를 사용하여 로컬 LLM 추가하기 (선택 사항) {#add-local-llm-using-ollama}

### Ollama 설치하기 {#install-ollama}

[Ollama 웹사이트](https://ollama.com/download)로 가서 시스템에 맞는 Ollama를 설치합니다.

설치가 완료되면 다음과 같이 모델을 실행할 수 있습니다:

```bash
ollama run qwen3:32b
```

이렇게 하면 모델이 로컬 머신으로 다운로드됩니다(모델이 없는 경우).

모델 목록은 [Ollama 라이브러리](https://ollama.com/library)에서 확인할 수 있습니다.

### librechat.yaml에서 Ollama 구성하기 {#configure-ollama-in-librechat-yaml}

모델이 다운로드된 후, `librechat.yaml`에서 다음과 같이 구성합니다:

```text title="librechat.yaml"
custom:
  - name: "Ollama"
    apiKey: "ollama"
    baseURL: "http://host.docker.internal:11434/v1/"
    models:
      default:
        [
          "qwen3:32b"
        ]
      fetch: false
    titleConvo: true
    titleModel: "current_model"
    summarize: false
    summaryModel: "current_model"
    forcePrompt: false
    modelDisplayLabel: "Ollama"
```

## 모든 서비스 시작하기 {#start-all-services}

LibreChat 프로젝트 폴더의 루트에서 다음 명령을 실행하여 서비스를 시작합니다:

```bash
docker compose up
```

모든 서비스가 완전히 실행될 때까지 대기합니다.

## 브라우저에서 LibreChat 열기 {#open-librechat-in-browser}

모든 서비스가 실행 중이면 브라우저를 열고 `http://localhost:3080/`로 이동합니다.

아직 계정이 없다면 무료 LibreChat 계정을 만들고 로그인합니다. 이제 ClickHouse MCP 서버에 연결된 LibreChat 인터페이스와 선택적으로 로컬 LLM을 볼 수 있습니다.

채팅 인터페이스에서 `clickhouse-playground`를 MCP 서버로 선택합니다:

<Image img={LibreInterface} alt="MCP 서버 선택하기" size="md"/>

이제 LLM을 프롬프트하여 ClickHouse 예제 데이터 세트를 탐색할 수 있습니다. 한 번 시도해 보세요:

```text title="Prompt"
What datasets do you have access to?
```

</VerticalStepper>
