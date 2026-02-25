---
slug: /use-cases/AI/MCP/ollama
sidebar_label: 'Ollama 연동'
title: 'Ollama와 함께 사용하는 ClickHouse MCP 서버 설정하기'
pagination_prev: null
pagination_next: null
description: '이 가이드는 Ollama와 함께 사용할 ClickHouse MCP 서버를 설정하는 방법을 설명합니다.'
keywords: ['AI', 'Ollama', 'MCP']
show_related_blogs: true
doc_type: 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';

# Ollama와 함께 ClickHouse MCP 서버를 사용하는 방법 \{#using-clickhouse-mcp-server-with-ollama\}

> 이 문서에서는 Ollama와 함께 ClickHouse MCP 서버를 사용하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">
  ## Ollama 설치 \{#install-ollama\}

  Ollama는 로컬 머신에서 대규모 언어 모델(Large Language Model, LLM)을 실행하기 위한 라이브러리입니다.
  [다양한 모델](https://ollama.com/library)을 제공하며 사용이 간편합니다.

  Mac, Windows 또는 Linux용 Ollama는 [다운로드 페이지](https://ollama.com/download)에서 다운로드하실 수 있습니다.

  Ollama를 실행하면 백그라운드에서 로컬 서버가 시작되며, 이를 사용하여 모델을 실행할 수 있습니다.
  또는 `ollama serve` 명령을 실행하여 수동으로 서버를 시작할 수도 있습니다.

  설치가 완료되면 다음과 같이 모델을 로컬 머신으로 다운로드할 수 있습니다:

  ```bash
  ollama pull qwen3:8b
  ```

  모델이 로컬 머신에 없는 경우 이 명령을 실행하면 모델을 다운로드합니다.
  다운로드가 완료되면 다음과 같이 모델을 실행하세요:

  ```bash
  ollama run qwen3:8b
  ```

  :::note
  [도구 지원 기능이 있는 모델](https://ollama.com/search?c=tools)만 MCP Server와 함께 사용할 수 있습니다.
  :::

  다운로드한 모델 목록은 다음과 같이 확인하실 수 있습니다:

  ```bash
  ollama ls
  ```

  ```text
  NAME                       ID              SIZE      MODIFIED
  qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
  ```

  다음 명령어를 사용하여 다운로드한 모델에 대한 자세한 정보를 확인하세요:

  ```bash
  ollama show qwen3
  ```

  ```text
    Model
      architecture        qwen3
      parameters          8.2B
      context length      40960
      embedding length    4096
      quantization        Q4_K_M

    Capabilities
      completion
      tools

    Parameters
      repeat_penalty    1
      stop              "<|im_start|>"
      stop              "<|im_end|>"
      temperature       0.6
      top_k             20
      top_p             0.95

    License
      Apache License
      Version 2.0, January 2004
  ```

  이 출력 결과에서 기본 qwen3 모델이 80억 개가 조금 넘는 파라미터를 가지고 있음을 확인할 수 있습니다.

  ## MCPHost 설치 \{#install-mcphost\}

  이 문서 작성 시점(2025년 7월) 기준으로 Ollama를 MCP Server와 함께 사용하는 네이티브 기능은 제공되지 않습니다.
  그러나 [MCPHost](https://github.com/mark3labs/mcphost)를 사용하면 MCP Server에서 Ollama 모델을 실행할 수 있습니다.

  MCPHost는 Go 애플리케이션이므로, 머신에 [Go가 설치](https://go.dev/doc/install)되어 있어야 합니다.
  이후 다음 명령을 실행하여 MCPHost를 설치하십시오:

  ```bash
  go install github.com/mark3labs/mcphost@latest
  ```

  바이너리는 `~/go/bin` 디렉터리에 설치되므로 해당 디렉터리가 PATH에 포함되어 있는지 확인하십시오.

  ## ClickHouse MCP 서버 구성 \{#configure-clickhouse-mcp-server\}

  MCPHost를 사용하여 YAML 또는 JSON 파일로 MCP Server를 구성할 수 있습니다.
  MCPHost는 홈 디렉토리에서 다음 순서로 구성 파일을 검색합니다:

  1. `.mcphost.yml` 또는 `.mcphost.json`  (권장)
  2. `.mcp.yml` 또는 `.mcp.json` (이전 버전과의 호환성)

  표준 MCP 구성 파일에서 사용하는 구문과 유사한 구문을 사용합니다.
  다음은 `~/.mcphost.json` 파일에 저장할 ClickHouse MCP 서버 구성 예시입니다:

  ```json
  {
    "mcpServers": {
      "mcp-ch": {
        "type": "local",
        "command": ["uv",
          "run",
          "--with",
          "mcp-clickhouse",
          "--python",
          "3.10",
          "mcp-clickhouse"
        ]
      }
    }
  }
  ```

  표준 MCP 구성 파일과의 주요 차이점은 `type`을 지정해야 한다는 점입니다.
  `type`은 MCP Server가 사용하는 전송 유형을 나타냅니다.

  * `local` → stdio 전송 방식
  * `remote` → 스트리밍 가능한 전송 방식
  * `builtin` → 인프로세스(inprocess) 전송

  다음 환경 변수도 구성해야 합니다:

  ```bash
  export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
  export CLICKHOUSE_USER=demo
  export CLICKHOUSE_PASSWORD=""
  ```

  :::note
  이론적으로는 MCP 구성 파일의 `environment` 키 아래에 해당 변수들을 제공할 수 있어야 하지만, 실제로는 작동하지 않는 것으로 확인되었습니다.
  :::

  ## MCPHost 실행 \{#running-mcphost\}

  ClickHouse MCP 서버를 구성한 후, 다음 명령을 실행하여 MCPHost를 실행하세요:

  ```bash
  mcphost --model ollama:qwen3
  ```

  또는 특정 설정 파일을 사용하려면:

  ```bash
  mcphost --model ollama:qwen3 --config ~/.mcphost.json 
  ```

  :::warning
  `--model`을 제공하지 않을 경우, MCPHost는 환경 변수에서 `ANTHROPIC_API_KEY`를 찾아 `anthropic:claude-sonnet-4-20250514` 모델을 사용합니다.
  :::

  다음과 같은 출력이 표시됩니다:

  ```text
    ┃                                                                                     ┃
    ┃  Model loaded: ollama (qwen3)                                                       ┃
    ┃   MCPHost System (09:52)                                                            ┃
    ┃                                                                                     ┃

    ┃                                                                                     ┃
    ┃  Model loaded successfully on GPU                                                   ┃
    ┃   MCPHost System (09:52)                                                            ┃
    ┃                                                                                     ┃

    ┃                                                                                     ┃
    ┃  Loaded 3 tools from MCP servers                                                    ┃
    ┃   MCPHost System (09:52)                                                            ┃
    ┃                                                                                     ┃

    Enter your prompt (Type /help for commands, Ctrl+C to quit, ESC to cancel generation)
  ```

  `/servers` 명령을 사용하여 MCP 서버 목록을 확인할 수 있습니다:

  ```text
    ┃                                                                                      ┃
    ┃  ## Configured MCP Servers                                                           ┃
    ┃                                                                                      ┃
    ┃  1. mcp-ch                                                                           ┃
    ┃   MCPHost System (10:00)                                                             ┃
    ┃
  ```

  그리고 `/tools`를 사용하여 사용 가능한 도구를 확인하세요:

  ```text
    ┃  ## Available Tools                                                                  ┃
    ┃                                                                                      ┃
    ┃  1. mcp-ch__list_databases                                                           ┃
    ┃  2. mcp-ch__list_tables                                                              ┃
    ┃  3. mcp-ch__run_select_query
  ```

  이후 ClickHouse SQL 플레이그라운드에서 사용 가능한 데이터베이스/테이블에 대한 질문을 모델에 할 수 있습니다.

  소규모 모델을 사용하는 경우(기본 qwen3 모델은 80억 개의 파라미터를 보유하고 있습니다), 수행할 작업을 더 구체적으로 명시해야 합니다.
  예를 들어, 특정 테이블에 대한 쿼리를 바로 요청하기보다는 데이터베이스와 테이블 목록을 먼저 명시적으로 요청해야 합니다.
  대규모 모델(예: qwen3:14b)을 사용하면 이 문제를 부분적으로 완화할 수 있지만, 일반 소비자용 하드웨어에서는 실행 속도가 느려집니다.
</VerticalStepper>