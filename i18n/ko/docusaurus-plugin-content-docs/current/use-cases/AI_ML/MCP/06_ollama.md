---
'slug': '/use-cases/AI/MCP/ollama'
'sidebar_label': 'Ollama 통합하기'
'title': 'ClickHouse MCP 서버와 Ollama 설정하기'
'pagination_prev': null
'pagination_next': null
'description': '이 가이드는 ClickHouse MCP 서버와 Ollama를 설정하는 방법을 설명합니다.'
'keywords':
- 'AI'
- 'Ollama'
- 'MCP'
'show_related_blogs': true
'doc_type': 'guide'
---

import {CardHorizontal} from '@clickhouse/click-ui/bundled'
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';


# Using ClickHouse MCP server with Ollama

> 이 가이드는 ClickHouse MCP 서버를 Ollama와 함께 사용하는 방법을 설명합니다.

<VerticalStepper headerLevel="h2">

## Install Ollama {#install-ollama}

Ollama는 자체 서버에서 대규모 언어 모델(LLM)을 실행하기 위한 라이브러리입니다.
다양한 모델이 [제공되고](https://ollama.com/library) 사용하기 쉽습니다.

Mac, Windows 또는 Linux용 Ollama는 [다운로드 페이지](https://ollama.com/download)에서 다운로드할 수 있습니다.

Ollama를 실행하면 모델을 실행할 수 있는 백그라운드에서 로컬 서버가 시작됩니다.
또는 `ollama serve`를 실행하여 수동으로 서버를 실행할 수 있습니다.

설치가 완료되면, 다음과 같이 모델을 머신으로 다운로드할 수 있습니다:

```bash
ollama pull qwen3:8b
```

모델이 없으면 로컬 머신으로 모델이 다운로드됩니다.
다운로드가 완료되면, 다음과 같이 모델을 실행할 수 있습니다:

```bash
ollama run qwen3:8b
```

:::note
도구 지원이 있는 [모델들만](https://ollama.com/search?c=tools) MCP 서버와 함께 작동합니다.
:::

다운로드한 모델을 다음과 같이 목록으로 확인할 수 있습니다:

```bash
ollama ls
```

```text
NAME                       ID              SIZE      MODIFIED
qwen3:latest               500a1f067a9f    5.2 GB    3 days ago
```

다음 명령어를 사용하여 다운로드한 모델에 대한 추가 정보를 볼 수 있습니다:

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

이 출력에서 기본 qwen3 모델은 80억 개 이상의 파라미터를 가지고 있음을 알 수 있습니다.

## Install MCPHost {#install-mcphost}

이 문서를 작성하는 시점(2025년 7월)에는 Ollama를 MCP 서버와 함께 사용할 수 있는 네이티브 기능이 없습니다.
그러나 [MCPHost](https://github.com/mark3labs/mcphost)를 사용하여 Ollama 모델을 MCP 서버와 함께 실행할 수 있습니다.

MCPHost는 Go 애플리케이션이므로 머신에 [Go가 설치되어](https://go.dev/doc/install) 있는지 확인해야 합니다.
그 후, 다음 명령어로 MCPHost를 설치할 수 있습니다:

```bash
go install github.com/mark3labs/mcphost@latest
```

바이너리는 `~/go/bin`에 설치되므로, 이 디렉토리가 PATH에 포함되어 있어야 합니다.

## Configuring ClickHouse MCP Server {#configure-clickhouse-mcp-server}

MCPHost를 사용하여 YAML 또는 JSON 파일로 MCP 서버를 구성할 수 있습니다. 
MCPHost는 홈 디렉토리에서 다음 순서로 설정 파일을 찾습니다:

1. `.mcphost.yml` 또는 `.mcphost.json` (권장)
2. `.mcp.yml` 또는 `.mcp.json` (하위 호환성)

표준 MCP 구성 파일에서 사용되는 구문과 유사한 구문을 사용합니다.
다음은 ClickHouse MCP 서버 구성의 예로, `~/.mcphost.json` 파일에 저장할 것입니다:

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
이 타입은 MCP 서버에서 사용하는 전송 유형을 나타내는 데 사용됩니다.

* `local` → stdio 전송
* `remote` → 스트리밍 전송
* `builtin` → 프로세스 내 전송

다음 환경 변수를 구성해야 합니다:

```bash
export CLICKHOUSE_HOST=sql-clickhouse.clickhouse.com
export CLICKHOUSE_USER=demo
export CLICKHOUSE_PASSWORD=""
```

:::note
이론적으로는 MCP 구성 파일의 `environment` 키 아래에서 이러한 변수를 제공할 수 있지만, 이는 작동하지 않는 경우가 많습니다.
:::

## Running MCPHost {#running-mcphost}

ClickHouse MCP 서버를 구성한 후, 다음 명령어로 MCPHost를 실행할 수 있습니다:

```bash
mcphost --model ollama:qwen3
```

또는 특정 구성 파일을 사용하려면:

```bash
mcphost --model ollama:qwen3 --config ~/.mcphost.json 
```

:::warning
`--model`을 제공하지 않으면, MCPHost는 환경 변수에서 `ANTHROPIC_API_KEY`를 찾고 `anthropic:claude-sonnet-4-20250514` 모델을 사용합니다.
:::

다음과 같은 출력이 표시되어야 합니다:

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

`/servers` 명령어를 사용하여 MCP 서버 목록을 확인할 수 있습니다:

```text
┃                                                                                      ┃
┃  ## Configured MCP Servers                                                           ┃
┃                                                                                      ┃
┃  1. mcp-ch                                                                           ┃
┃   MCPHost System (10:00)                                                             ┃
┃
```

`/tools`를 사용하여 사용 가능한 도구 목록을 확인할 수 있습니다:

```text
┃  ## Available Tools                                                                  ┃
┃                                                                                      ┃
┃  1. mcp-ch__list_databases                                                           ┃
┃  2. mcp-ch__list_tables                                                              ┃
┃  3. mcp-ch__run_select_query
```

그 후, ClickHouse SQL 플레이그라운드에서 사용할 수 있는 데이터베이스/테이블에 대해 모델에게 질문할 수 있습니다.

작은 모델(기본 qwen3 모델은 80억 개의 파라미터를 가집니다)을 사용할 때, 원하는 작업에 대해 보다 구체적으로 요청해야 합니다.
예를 들어, 특정 테이블을 쿼리하는 것을 바로 요청하는 대신 데이터베이스와 테이블 목록을 나열해 달라고 명시적으로 요청해야 합니다.
이 문제는 큰 모델(예: qwen3:14b)을 사용하여 일부 완화할 수 있지만, 소비자 하드웨어에서 느리게 실행됩니다.

</VerticalStepper>
