---
slug: /use-cases/AI/MCP/librechat
sidebar_label: 'LibreChat 통합'
title: 'LibreChat 및 ClickHouse Cloud와 함께 ClickHouse MCP 서버를 설정하기'
pagination_prev: null
pagination_next: null
description: '이 가이드는 Docker를 사용하여 LibreChat을 ClickHouse MCP 서버와 함께 설정하는 방법을 설명합니다.'
keywords: ['AI', 'Librechat', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import LibreInterface from '@site/static/images/use-cases/AI_ML/MCP/librechat.png';

# LibreChat에서 ClickHouse MCP 서버 사용하기 \{#using-clickhouse-mcp-server-with-librechat\}

> 이 가이드에서는 Docker를 사용하여 LibreChat과 ClickHouse MCP 서버를 설정하고
> ClickHouse 예제 데이터셋에 연결하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">
  ## Docker 설치하기 \{#install-docker\}

  LibreChat과 MCP 서버를 실행하려면 Docker가 필요합니다. Docker를 설치하는 방법은 다음과 같습니다:

  1. [docker.com](https://www.docker.com/products/docker-desktop)을 방문하십시오
  2. 사용 중인 운영 체제에 맞는 Docker Desktop을 다운로드하십시오
  3. 운영 체제에 맞는 안내를 따라 Docker를 설치하십시오
  4. Docker Desktop을 열고 실행 중인지 확인합니다

  <br />

  자세한 내용은 [Docker 문서](https://docs.docker.com/get-docker/)를 참조하세요.

  ## LibreChat 리포지토리 복제하기 \{#clone-librechat-repo\}

  터미널(명령 프롬프트, 터미널 또는 PowerShell)을 열고 다음 명령을 사용하여 LibreChat 리포지토리를 복제하세요:

  ```bash
  git clone https://github.com/danny-avila/LibreChat.git
  cd LibreChat
  ```

  ## .env 파일 생성 및 편집하기 \{#create-and-edit-env-file\}

  예제 구성 파일을 `.env.example`에서 `.env`로 복사하세요:

  ```bash
  cp .env.example .env
  ```

  선호하는 텍스트 편집기에서 `.env` 파일을 여세요. OpenAI, Anthropic, AWS Bedrock 등 여러 주요 LLM 제공업체에 대한 섹션을 확인할 수 있습니다. 예를 들면 다음과 같습니다:

  ```text title=".venv"
  #============#
  # Anthropic  #
  #============#
  #highlight-next-line
  ANTHROPIC_API_KEY=user_provided
  # ANTHROPIC_MODELS=claude-opus-4-20250514,claude-sonnet-4-20250514,claude-3-7-sonnet-20250219,claude-3-5-sonnet-20241022,claude-3-5-haiku-20241022,claude-3-opus-20240229,claude-3-sonnet-20240229,claude-3-haiku-20240307
  # ANTHROPIC_REVERSE_PROXY=
  ```

  `user_provided`를 사용할 LLM 제공업체의 API 키로 교체하세요.

  :::note 로컬 LLM 사용
  API 키가 없는 경우 Ollama와 같은 로컬 LLM을 사용할 수 있습니다. 이 방법은
  [&quot;Ollama 설치&quot;](#add-local-llm-using-ollama) 단계에서 확인하실 수 있습니다. 현재는
  .env 파일을 수정하지 마시고 다음 단계를 계속 진행하십시오.
  :::

  ## librechat.yaml 파일 생성하기 \{#create-librechat-yaml-file\}

  다음 명령을 실행하여 새 `librechat.yaml` 파일을 생성하세요:

  ```bash
  cp librechat.example.yaml librechat.yaml
  ```

  LibreChat의 주요 [구성 파일](https://www.librechat.ai/docs/configuration/librechat_yaml)을 생성합니다.

  ## Docker Compose에 ClickHouse MCP 서버 추가 \{#add-clickhouse-mcp-server-to-docker-compose\}

  다음으로 LibreChat Docker compose 파일에 ClickHouse MCP 서버를 추가하여
  LLM이 [ClickHouse SQL playground](https://sql.clickhouse.com/)와 상호작용할 수 있도록 하겠습니다.

  `docker-compose.override.yml` 파일을 생성하고 다음 구성을 추가하세요:

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

  자체 데이터를 탐색하려면 ClickHouse Cloud 서비스의 [호스트, 사용자 이름 및 비밀번호](https://clickhouse.com/docs/getting-started/quick-start/cloud#connect-with-your-app)를 사용하십시오.

  <Link to="https://cloud.clickhouse.com/">
    <CardHorizontal
      badgeIcon="cloud"
      badgeIconDir=""
      badgeState="default"
      badgeText=""
      description="
아직 Cloud 계정이 없다면, 지금 ClickHouse Cloud를 시작하고 300달러 상당의 크레딧을 받으십시오. 30일 무료 체험이 종료된 후에는 종량제 요금제로 계속 이용하거나, 대량 사용량 기반 할인에 대해 더 알고 싶다면 문의하십시오.
자세한 내용은 요금제 페이지를 참조하십시오.
"
      icon="cloud"
      infoText=""
      infoUrl=""
      title="ClickHouse Cloud 시작하기"
      isSelected={true}
    />
  </Link>

  ## librechat.yaml에서 MCP 서버 구성 \{#configure-mcp-server-in-librechat-yaml\}

  `librechat.yaml` 파일을 열고 파일 끝에 다음 구성을 추가하세요:

  ```yml
  mcpServers:
    clickhouse-playground:
      type: sse
      url: http://host.docker.internal:8001/sse
  ```

  Docker에서 실행 중인 MCP 서버에 연결하도록 LibreChat을 구성합니다.

  다음 라인을 찾으세요:

  ```text title="librechat.yaml"
  socialLogins: ['github', 'google', 'discord', 'openid', 'facebook', 'apple', 'saml']
  ```

  간단하게 하기 위해 우선 인증 요구 사항을 제거합니다:

  ```text title="librechat.yaml"
  socialLogins: []
  ```

  ## Ollama를 사용하여 로컬 LLM 추가 (선택 사항) \{#add-local-llm-using-ollama\}

  ### Ollama 설치하기 \{#install-ollama\}

  [Ollama 웹사이트](https://ollama.com/download)로 이동하여 시스템에 맞는 Ollama를 설치하세요.

  설치가 완료되면 다음과 같이 모델을 실행하십시오:

  ```bash
  ollama run qwen3:32b
  ```

  모델이 로컬 머신에 없는 경우 다운로드됩니다.

  모델 목록은 [Ollama library](https://ollama.com/library)를 참조하세요

  ### librechat.yaml에서 Ollama 구성 \{#configure-ollama-in-librechat-yaml\}

  모델 다운로드가 완료되면 `librechat.yaml`에서 구성하십시오:

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

  ## 모든 서비스 시작하기 \{#start-all-services\}

  LibreChat 프로젝트 폴더의 루트에서 다음 명령을 실행하여 서비스를 시작합니다:

  ```bash
  docker compose up
  ```

  모든 서비스가 완전히 실행될 때까지 기다리세요.

  ## 브라우저에서 LibreChat을 여십시오 \{#open-librechat-in-browser\}

  모든 서비스가 실행되면 브라우저를 열고 `http://localhost:3080/`로 이동하세요

  아직 LibreChat 계정이 없는 경우 무료 계정을 생성하고 로그인하십시오. 이제 ClickHouse MCP 서버에 연결된 LibreChat 인터페이스가 표시되며, 선택적으로 로컬 LLM도 표시됩니다.

  채팅 인터페이스에서 MCP 서버로 `clickhouse-playground`를 선택하세요:

  <Image img={LibreInterface} alt="사용할 MCP 서버를 선택하십시오" size="md" />

  이제 LLM에 프롬프트를 입력하여 ClickHouse 예제 데이터셋을 탐색할 수 있습니다. 시도해 보십시오:

  ```text title="Prompt"
  What datasets do you have access to?
  ```
</VerticalStepper>

:::note
LibreChat UI에 MCP 서버 옵션이 보이지 않으면
`librechat.yaml` 파일에서 올바른 권한이 설정되어 있는지 확인하십시오.
:::

`interface` 섹션의 `mcpServers`에서 `use`가 `false`로 설정되어 있으면 채팅에 MCP 선택 드롭다운이 표시되지 않습니다:

```yml title="librechat.yaml"
interface:
  mcpServers:
    use: true
    share: false
    create: false
    public: false
```
