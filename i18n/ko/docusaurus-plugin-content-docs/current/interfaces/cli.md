---
'description': 'ClickHouse 명령줄 클라이언트 인터페이스에 대한 문서'
'sidebar_label': 'ClickHouse 클라이언트'
'sidebar_position': 17
'slug': '/interfaces/cli'
'title': 'ClickHouse 클라이언트'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse는 ClickHouse 서버에 직접 SQL 쿼리를 실행하기 위한 네이티브 명령줄 클라이언트를 제공합니다.
이 클라이언트는 대화형 모드(실시간 쿼리 실행용)와 배치 모드(스크립팅 및 자동화용)를 모두 지원합니다.
쿼리 결과는 터미널에 표시되거나 파일로 내보낼 수 있으며, Pretty, CSV, JSON 등 모든 ClickHouse 출력 [형식](formats.md)을 지원합니다.

이 클라이언트는 진행률 표시 줄과 읽힌 행 수, 처리된 바이트 수, 쿼리 실행 시간을 제공하여 쿼리 실행에 대한 실시간 피드백을 제공합니다.
[명령줄 옵션](#command-line-options)과 [구성 파일](#configuration_files)을 모두 지원합니다.
## 설치 {#install}

ClickHouse를 다운로드하려면 다음을 실행하십시오:

```bash
curl https://clickhouse.com/ | sh
```

설치하려면 다음을 실행하십시오:

```bash
sudo ./clickhouse install
```

더 많은 설치 옵션에 대해서는 [ClickHouse 설치](../getting-started/install/install.mdx)를 참조하십시오.

클라이언트와 서버의 서로 다른 버전은 호환되지만, 일부 기능은 오래된 클라이언트에서 사용할 수 없을 수 있습니다. 클라이언트와 서버에 동일한 버전을 사용하는 것이 좋습니다.
## 실행 {#run}

:::note
ClickHouse를 다운로드했으나 설치하지 않았다면 `clickhouse-client` 대신 `./clickhouse client`를 사용하십시오.
:::

ClickHouse 서버에 연결하려면 다음을 실행하십시오:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

필요에 따라 추가 연결 세부정보를 지정하십시오:

| 옵션                            | 설명                                                                                                                                                                          |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--port <포트>`                | ClickHouse 서버가 연결을 수락하는 포트. 기본 포트는 9440(TLS) 및 9000(비 TLS)입니다. ClickHouse 클라이언트는 HTTP(S)가 아닌 기본 프로토콜을 사용합니다.                    |
| `-s [ --secure ]`             | TLS를 사용할지 여부(일반적으로 자동 감지됨).                                                                                                                                 |
| `-u [ --user ] <username>`     | 연결할 데이터베이스 사용자. 기본적으로 `default` 사용자로 연결됩니다.                                                                                                       |
| `--password <비밀번호>`        | 데이터베이스 사용자의 비밀번호. 구성 파일에서 연결에 대한 비밀번호를 지정할 수도 있습니다. 비밀번호를 지정하지 않으면 클라이언트가 물어봅니다.                                 |
| `-c [ --config ] <file 경로>` | ClickHouse 클라이언트의 구성 파일 위치, 기본 위치에 없을 경우. [구성 파일](#configuration_files)을 참조하십시오.                                                        |
| `--connection <이름>`          | [구성 파일](#connection-credentials)에서 미리 구성된 연결 세부정보의 이름입니다.                                                                                                                   |

전체 명령줄 옵션 목록은 [명령줄 옵션](#command-line-options)을 참조하십시오.
### ClickHouse Cloud에 연결 {#connecting-cloud}

ClickHouse Cloud 서비스의 세부정보는 ClickHouse Cloud 콘솔에 있습니다. 연결할 서비스를 선택하고 **Connect**를 클릭하십시오:

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud 서비스 연결 버튼"
/>

<br/><br/>

**Native**를 선택하면 세부정보와 예제 `clickhouse-client` 명령이 표시됩니다:

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud Native TCP 연결 세부정보"
/>
### 구성 파일에 연결 저장 {#connection-credentials}

하나 이상의 ClickHouse 서버에 대한 연결 세부정보를 [구성 파일](#configuration_files)에 저장할 수 있습니다.

형식은 다음과 같습니다:

```xml
<config>
    <connections_credentials>
        <connection>
            <name>default</name>
            <hostname>hostname</hostname>
            <port>9440</port>
            <secure>1</secure>
            <user>default</user>
            <password>password</password>
            <!-- <history_file></history_file> -->
            <!-- <history_max_entries></history_max_entries> -->
            <!-- <accept-invalid-certificate>false</accept-invalid-certificate> -->
            <!-- <prompt></prompt> -->
        </connection>
    </connections_credentials>
</config>
```

자세한 내용은 [구성 파일 섹션](#configuration_files)을 참조하십시오.

:::note
예제에서는 쿼리 구문에 집중하기 위해 연결 세부정보(`--host`, `--port`, 등)을 생략합니다. 명령을 사용할 때 이를 추가해야 한다는 점을 기억하세요.
:::
## 대화형 모드 {#interactive-mode}
### 대화형 모드 사용 {#using-interactive-mode}

ClickHouse를 대화형 모드로 실행하려면 다음을 실행하십시오:

```bash
clickhouse-client
```

그러면 SQL 쿼리를 대화형으로 입력할 수 있는 Read-Eval-Print Loop (REPL)가 열립니다.
연결되면 쿼리를 입력할 수 있는 프롬프트가 표시됩니다:

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

대화형 모드에서는 기본 출력 형식이 `PrettyCompact`입니다.
쿼리의 `FORMAT` 절에서 형식을 변경하거나 `--format` 명령줄 옵션을 지정하여 변경할 수 있습니다.
세로 형식을 사용하려면 `--vertical`을 사용하거나 쿼리 끝에 `\G`를 지정할 수 있습니다.
이 형식에서는 각 값이 별도의 행에 인쇄되어 와이드 테이블에 편리합니다.

대화형 모드에서는 기본적으로 입력된 내용을 `Enter` 키를 눌렀을 때 실행합니다.
쿼리 끝에 세미콜론이 필요하지 않습니다.

클라이언트를 `-m, --multiline` 매개변수와 함께 시작할 수 있습니다.
여러 행의 쿼리를 입력하려면 줄 바꿈 전에 백슬래시 `\`를 입력하십시오.
`Enter` 키를 누르면 쿼리의 다음 행을 입력하라는 요청이 나타납니다.
쿼리를 실행하려면 세미콜론으로 끝내고 `Enter` 키를 누르십시오.

ClickHouse Client는 `replxx`( `readline` 유사)를 기반으로 하므로 익숙한 키보드 단축키를 사용하며 이력이 유지됩니다.
기본적으로 이력은 `~/.clickhouse-client-history`에 기록됩니다.

클라이언트를 종료하려면 `Ctrl+D`를 누르거나 쿼리 대신 다음 중 하나를 입력하십시오:
- `exit` 또는 `exit;`
- `quit` 또는 `quit;`
- `q`, `Q` 또는 `:q`
- `logout` 또는 `logout;`
### 쿼리 처리 정보 {#processing-info}

쿼리를 처리할 때 클라이언트는 다음을 보여줍니다:

1. 진행률, 기본적으로 초당 10회 이상 업데이트되지 않습니다.
   빠른 쿼리의 경우 진행률이 표시될 시간 없이 진행되기도 합니다.
2. 디버깅을 위해 구문 분석 이후의 형식이 지정된 쿼리.
3. 지정된 형식의 결과.
4. 결과의 행 수, 경과 시간, 쿼리 처리의 평균 속도.
   모든 데이터 양은 압축되지 않은 데이터에 대한 것입니다.

긴 쿼리는 `Ctrl+C`를 눌러 취소할 수 있습니다.
그러나 서버가 요청을 중단할 때까지 잠시 기다려야 합니다.
특정 단계에서는 쿼리를 취소할 수 없습니다.
기다리지 않고 두 번째로 `Ctrl+C`를 누르면 클라이언트가 종료됩니다.

ClickHouse Client는 쿼리를 위해 외부 데이터(외부 임시 테이블)를 전달할 수 있습니다.
자세한 내용은 [쿼리 처리를 위한 외부 데이터](../engines/table-engines/special/external-data.md) 섹션을 참조하십시오.
### 별칭 {#cli_aliases}

REPL 내에서 다음 별칭을 사용할 수 있습니다:

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 마지막 쿼리 반복
### 키보드 단축키 {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - 현재 쿼리로 편집기 열기. 사용할 편집기는 환경 변수 `EDITOR`로 지정할 수 있습니다. 기본적으로 `vim`이 사용됩니다.
- `Alt (Option) + #` - 줄을 주석 처리합니다.
- `Ctrl + r` - 퍼지 이력 검색.

사용 가능한 모든 키보드 단축키의 전체 목록은 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)에서 확인할 수 있습니다.

:::tip
MacOS에서 메타 키(Option)의 올바른 작동을 구성하려면:

iTerm2: 기본 설정 -> 프로파일 -> 키 -> 왼쪽 Option 키로 이동 후 Esc+ 클릭
:::
## 배치 모드 {#batch-mode}
### 배치 모드 사용 {#using-batch-mode}

ClickHouse Client를 대화형으로 사용하는 대신 배치 모드에서 실행할 수 있습니다.
배치 모드에서는 ClickHouse가 단일 쿼리를 실행하고 즉시 종료됩니다 - 대화형 프롬프트나 루프가 없습니다.

단일 쿼리는 다음과 같이 지정할 수 있습니다:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query` 명령줄 옵션을 사용할 수도 있습니다:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`에 쿼리를 제공할 수 있습니다:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

테이블 `messages`가 존재한다고 가정하면, 명령 행에서 데이터를 삽입할 수도 있습니다:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`가 지정되면 입력은 줄 바꿈 후 요청에 추가됩니다.
### 원격 ClickHouse 서비스로 CSV 파일 삽입 {#cloud-example}

이 예는 샘플 데이터셋 CSV 파일 `cell_towers.csv`을 `default` 데이터베이스의 기존 테이블 `cell_towers`에 삽입하는 것입니다:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```
### 명령행에서 데이터 삽입 예제 {#more-examples}

명령행에서 데이터를 삽입하는 몇 가지 방법이 있습니다.
아래 예에서는 배치 모드를 사용하여 ClickHouse 테이블에 두 행의 CSV 데이터를 삽입합니다:

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

아래 예에서 `cat <<_EOF`는 `_EOF`를 다시 볼 때까지 모든 것을 읽고 출력하는 heredoc을 시작합니다:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

아래 예에서는 file.csv의 내용을 `cat`을 사용하여 stdout으로 출력하고, `clickhouse-client`에 입력으로 파이프합니다:

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

배치 모드에서 기본 데이터 [형식](formats.md)은 `TabSeparated`입니다.
위의 예에서와 같이 쿼리의 `FORMAT` 절에서 형식을 설정할 수 있습니다.
## 매개변수가 있는 쿼리 {#cli-queries-with-parameters}

쿼리에서 매개변수를 지정하고 명령줄 옵션으로 값을 전달할 수 있습니다.
이렇게 하면 클라이언트 측에서 특정 동적 값으로 쿼리를 형식화하지 않아도 됩니다.
예를 들어:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[대화형 세션](#interactive-mode) 내에서 매개변수를 설정하는 것도 가능합니다:

```text
$ clickhouse-client
ClickHouse client version 25.X.X.XXX (official build).

#highlight-next-line
:) SET param_parName='[1, 2]';

SET param_parName = '[1, 2]'

Query id: 7ac1f84e-e89a-4eeb-a4bb-d24b8f9fd977

Ok.

0 rows in set. Elapsed: 0.000 sec.

#highlight-next-line
:) SELECT {parName:Array(UInt16)}

SELECT {parName:Array(UInt16)}

Query id: 0358a729-7bbe-4191-bb48-29b063c548a7

   ┌─_CAST([1, 2]⋯y(UInt16)')─┐
1. │ [1,2]                    │
   └──────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```
### 쿼리 구문 {#cli-queries-with-parameters-syntax}

쿼리에서 명령줄 매개변수로 채우고 싶은 값은 다음 형식의 중괄호에 배치하십시오:

```sql
{<name>:<data type>}
```

| 매개변수   | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`     | 자리 표시자 식별자. 해당 명령줄 옵션은 `--param_<name> = value`입니다.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `data type`| [데이터 유형](../sql-reference/data-types/index.md)입니다.<br/><br/>예를 들어, `(integer, ('string', integer))`와 같은 데이터 구조는 `Tuple(UInt8, Tuple(String, UInt8))` 데이터 유형을 가질 수 있습니다(다른 [정수](../sql-reference/data-types/int-uint.md) 유형도 사용할 수 있습니다).<br/><br/>테이블 이름, 데이터베이스 이름 및 컬럼 이름을 매개변수로 전달하는 것도 가능하며, 이 경우 데이터 유형으로 `Identifier`를 사용해야 합니다. |
### 예제 {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```
## AI 기반 SQL 생성 {#ai-sql-generation}

ClickHouse 클라이언트에는 자연어 설명에서 SQL 쿼리를 생성하기 위한 내장 AI 지원이 포함되어 있습니다. 이 기능은 사용자가 깊이 있는 SQL 지식 없이 복잡한 쿼리를 작성하는 데 도움이 됩니다.

AI 지원은 `OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있으면 즉시 작동합니다. 더 고급 구성을 원하시면 [구성](#ai-sql-generation-configuration) 섹션을 참조하세요.
### 사용법 {#ai-sql-generation-usage}

AI SQL 생성을 사용하려면 자연어 쿼리 앞에 `??`를 붙이십시오:

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI는 다음을 수행합니다:
1. 데이터베이스 스키마를 자동으로 탐색합니다.
2. 발견된 테이블과 컬럼에 따라 적절한 SQL을 생성합니다.
3. 생성된 쿼리를 즉시 실행합니다.
### 예제 {#ai-sql-generation-example}

```bash
:) ?? count orders by product category

Starting AI SQL generation with schema discovery...
──────────────────────────────────────────────────

🔍 list_databases
   ➜ system, default, sales_db

🔍 list_tables_in_database
   database: sales_db
   ➜ orders, products, categories

🔍 get_schema_for_table
   database: sales_db
   table: orders
   ➜ CREATE TABLE orders (order_id UInt64, product_id UInt64, quantity UInt32, ...)

✨ SQL query generated successfully!
──────────────────────────────────────────────────

SELECT 
    c.name AS category,
    COUNT(DISTINCT o.order_id) AS order_count
FROM sales_db.orders o
JOIN sales_db.products p ON o.product_id = p.product_id
JOIN sales_db.categories c ON p.category_id = c.category_id
GROUP BY c.name
ORDER BY order_count DESC
```
### 구성 {#ai-sql-generation-configuration}

AI SQL 생성을 위해 ClickHouse 클라이언트 구성 파일에 AI 제공자를 구성해야 합니다. OpenAI, Anthropic 또는 OpenAI 호환 API 서비스를 사용할 수 있습니다.
#### 환경 기반 대체 {#ai-sql-generation-fallback}

구성 파일에 AI 구성사항이 지정되지 않은 경우 ClickHouse 클라이언트는 환경 변수를 사용하려고 자동으로 시도합니다:

1. 먼저 `OPENAI_API_KEY` 환경 변수가 있는지 확인합니다.
2. 없으면 `ANTHROPIC_API_KEY` 환경 변수가 있는지 확인합니다.
3. 둘 다 없으면 AI 기능이 비활성화됩니다.

이렇게 하면 구성 파일 없이 빠르게 설정할 수 있습니다:
```bash

# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client


# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```
#### 구성 파일 {#ai-sql-generation-configuration-file}

AI 설정을 보다 세밀하게 구성하려면 ClickHouse 클라이언트 구성 파일에 구성하면 됩니다:
- `~/.clickhouse-client/config.xml` (XML 형식)
- `~/.clickhouse-client/config.yaml` (YAML 형식)
- 또는 `--config-file`로 사용자 지정 위치를 지정할 수 있습니다.

<Tabs>
  <TabItem value="xml" label="XML" default>
```xml
<config>
    <ai>
        <!-- Required: Your API key (or set via environment variable) -->
        <api_key>your-api-key-here</api_key>

        <!-- Required: Provider type (openai, anthropic) -->
        <provider>openai</provider>

        <!-- Model to use (defaults vary by provider) -->
        <model>gpt-4o</model>

        <!-- Optional: Custom API endpoint for OpenAI-compatible services -->
        <!-- <base_url>https://openrouter.ai/api</base_url> -->

        <!-- Schema exploration settings -->
        <enable_schema_access>true</enable_schema_access>

        <!-- Generation parameters -->
        <temperature>0.0</temperature>
        <max_tokens>1000</max_tokens>
        <timeout_seconds>30</timeout_seconds>
        <max_steps>10</max_steps>

        <!-- Optional: Custom system prompt -->
        <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
    </ai>
</config>
```
  </TabItem>
  <TabItem value="yaml" label="YAML">
```yaml
ai:
  # Required: Your API key (or set via environment variable)
  api_key: your-api-key-here

  # Required: Provider type (openai, anthropic)
  provider: openai

  # Model to use
  model: gpt-4o

  # Optional: Custom API endpoint for OpenAI-compatible services
  # base_url: https://openrouter.ai/api

  # Enable schema access - allows AI to query database/table information
  enable_schema_access: true

  # Generation parameters
  temperature: 0.0      # Controls randomness (0.0 = deterministic)
  max_tokens: 1000      # Maximum response length
  timeout_seconds: 30   # Request timeout
  max_steps: 10         # Maximum schema exploration steps

  # Optional: Custom system prompt
  # system_prompt: |
  #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
  #   Focus on performance and use ClickHouse-specific optimizations.
  #   Always return executable SQL without explanations.
```
  </TabItem>
</Tabs>

<br/>

**OpenAI 호환 API 사용(예: OpenRouter):**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**최소 구성 예제:**

```yaml

# Minimal config - uses environment variable for API key
ai:
  provider: openai  # Will use OPENAI_API_KEY env var


# No config at all - automatic fallback

# (Empty or no ai section - will try OPENAI_API_KEY then ANTHROPIC_API_KEY)


# Only override model - uses env var for API key
ai:
  provider: openai
  model: gpt-3.5-turbo
```
### 매개변수 {#ai-sql-generation-parameters}

<details>
<summary>필수 매개변수</summary>

- `api_key` - AI 서비스의 API 키. 환경 변수로 설정된 경우 생략할 수 있습니다:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 참고: 구성 파일의 API 키는 환경 변수를 우선합니다.
- `provider` - AI 제공자: `openai` 또는 `anthropic`
  - 생략할 경우 사용 가능한 환경 변수에 따라 자동으로 대체됩니다.

</details>

<details>
<summary>모델 구성</summary>

- `model` - 사용될 모델 (기본값: 제공자별)
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` 등
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` 등
  - OpenRouter: `anthropic/claude-3.5-sonnet`와 같은 모델 이름 사용

</details>

<details>
<summary>연결 설정</summary>

- `base_url` - OpenAI 호환 서비스의 사용자 지정 API 엔드포인트 (선택 사항)
- `timeout_seconds` - 요청 시간 초과(초) (기본값: `30`)

</details>

<details>
<summary>스키마 탐색</summary>

- `enable_schema_access` - AI가 데이터베이스 스키마를 탐색할 수 있도록 허용 (기본값: `true`)
- `max_steps` - 스키마 탐색을 위한 최대 도구 호출 단계 (기본값: `10`)

</details>

<details>
<summary>생성 매개변수</summary>

- `temperature` - 무작위성 제어, 0.0 = 결정적, 1.0 = 창의적 (기본값: `0.0`)
- `max_tokens` - 최대 응답 길이(토큰 수) (기본값: `1000`)
- `system_prompt` - AI에 대한 사용자 정의 지침 (선택 사항)

</details>
### 작동 방식 {#ai-sql-generation-how-it-works}

AI SQL 생성기는 다단계 프로세스를 사용합니다:

<VerticalStepper headerLevel="list">

1. **스키마 검색**

AI는 내장 도구를 사용하여 데이터베이스를 탐색합니다.
- 사용 가능한 데이터베이스를 나열합니다.
- 관련 데이터베이스 내의 테이블을 검색합니다.
- `CREATE TABLE` 문을 통해 테이블 구조를 조사합니다.

2. **쿼리 생성**

발견된 스키마를 기반으로 AI는 SQL을 생성하여:
- 사용자의 자연어 의도에 맞춥니다.
- 올바른 테이블 및 열 이름을 사용합니다.
- 적절한 조인 및 집계를 적용합니다.

3. **실행**

생성된 SQL이 자동으로 실행되며 결과가 표시됩니다.

</VerticalStepper>
### 제한 사항 {#ai-sql-generation-limitations}

- 활성 인터넷 연결이 필요합니다.
- API 사용은 AI 제공자로부터의 요금 및 비율 제한의 적용을 받습니다.
- 복잡한 쿼리는 여러 번의 수정을 요구할 수 있습니다.
- AI는 스키마 정보(테이블/열 이름 및 유형)에 대해서만 읽기 전용 접근이 가능하며 실제 데이터에 대한 접근은 불가능합니다.
### 보안 {#ai-sql-generation-security}

- API 키는 ClickHouse 서버에 전송되지 않습니다.
- AI는 오직 스키마 정보(테이블/열 이름 및 유형)만을 보고 실제 데이터는 보지 않습니다.
- 모든 생성된 쿼리는 기존의 데이터베이스 권한을 존중합니다.
## 연결 문자열 {#connection_string}
### 사용법 {#connection-string-usage}

ClickHouse 클라이언트는 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/), [PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING), [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)와 유사한 연결 문자열을 사용하여 ClickHouse 서버에 연결하는 것을 지원합니다. 해당 구문은 다음과 같습니다:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| 구성 요소 (모두 선택사항) | 설명                                                                                                                                    | 기본값               |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `user`                    | 데이터베이스 사용자 이름.                                                                                                          | `default`           |
| `password`                | 데이터베이스 사용자 비밀번호. `:`가 지정되고 비밀번호가 비어 있으면 클라이언트는 사용자 비밀번호를 요청합니다.               | -                   |
| `hosts_and_ports`         | 호스트 및 선택적 포트 목록 `host[:port] [, host:[port]], ...`.                                                                         | `localhost:9000`    |
| `database`                | 데이터베이스 이름.                                                                                                                  | `default`           |
| `query_parameters`        | 키-값 쌍 목록 `param1=value1[,&param2=value2], ...`. 일부 매개변수는 값이 필요하지 않습니다. 매개변수 이름과 값은 대소문자 구분됩니다. | -                   |
### 주의 사항 {#connection-string-notes}

연결 문자열에서 사용자 이름, 비밀번호 또는 데이터베이스가 지정된 경우 `--user`, `--password` 또는 `--database`를 사용하여 지정할 수 없습니다(그 반대도 마찬가지입니다).

호스트 구성 요소는 호스트 이름 또는 IPv4 또는 IPv6 주소일 수 있습니다.
IPv6 주소는 대괄호 안에 있어야 합니다:

```text
clickhouse://[2001:db8::1234]
```

연결 문자열은 여러 호스트를 포함할 수 있습니다.
ClickHouse 클라이언트는 이 호스트들에게 순서대로(왼쪽에서 오른쪽으로) 연결하려고 시도합니다.
연결이 설정된 후 나머지 호스트에 대한 추가 연결 시도는 이루어지지 않습니다.

연결 문자열은 `clickHouse-client`의 첫 번째 인수로 지정해야 합니다.
연결 문자열은 `--host` 및 `--port`를 제외한 임의의 개수의 다른 [명령줄 옵션](#command-line-options)과 조합될 수 있습니다.

`query_parameters`에 허용되는 키는 다음과 같습니다:

| 키                | 설명                                                                                                                     |
|-------------------|--------------------------------------------------------------------------------------------------------------------------|
| `secure` (또는 `s`) | 지정된 경우 클라이언트는 안전한 연결(TLS)을 통해 서버에 연결합니다. [명령줄 옵션](#command-line-options)의 `--secure`를 참조하십시오. |

**퍼센트 인코딩**

비미국 ASCII, 공백 및 다음 매개변수 내의 특수 문자는 [퍼센트 인코딩](https://en.wikipedia.org/wiki/URL_encoding)되어야 합니다:
- `user`
- `password`
- `hosts`
- `database`
- `query parameters`
### 예제 {#connection_string_examples}

포트 9000에서 `localhost`에 연결하고 쿼리 `SELECT 1`을 실행합니다.

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

비밀번호 `secret`로 사용자 `john`으로 `localhost`에 연결하고 호스트 `127.0.0.1` 및 포트 `9000`으로 연결합니다.

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

IPv6 주소 `[::1]` 를 가진 호스트로 사용자 `default`로 `localhost`에 연결하고 포트 `9000`으로 연결합니다.

```bash
clickhouse-client clickhouse://[::1]:9000
```

멀티라인 모드로 포트 9000에 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

사용자 `default`로 포트 9000에 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

연결 문자열에서 데이터베이스 `my_database`로 기본 설정하고 포트 9000에서 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

연결 문자열에서 데이터베이스 `my_database`를 지정하고 포트 9000에서 `localhost`에 안전한 연결을 기본으로 설정하고 약어 매개변수 `s`를 사용하는 경우 연결합니다.

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

기본 호스트를 사용하여 기본 포트, 기본 사용자 및 기본 데이터베이스에 연결합니다.

```bash
clickhouse-client clickhouse:
```

기본 포트를 사용하여 기본 호스트에 연결하고 사용자 `my_user`로 비밀번호 없이 연결합니다.

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

이메일을 사용자 이름으로 사용하여 `localhost`에 연결합니다. `@` 기호는 `%40`으로 퍼센트 인코딩됩니다.

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

두 개의 호스트 중 하나에 연결: `192.168.1.15`, `192.168.1.25`.

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```
## 쿼리 ID 형식 {#query-id-format}

대화형 모드에서 ClickHouse Client는 각 쿼리에 대해 쿼리 ID를 표시합니다. 기본적으로 ID는 다음과 같이 형식화됩니다:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

사용자 지정 형식은 `query_id_formats` 태그 내의 구성 파일에 지정할 수 있습니다. 형식 문자열의 `{query_id}` 자리 표시자는 쿼리 ID로 대체됩니다. 이 기능은 쿼리 프로파일링을 용이하게 하기 위한 URL 생성을 위해 사용할 수 있습니다.

**예제**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

위의 구성으로 쿼리의 ID는 다음과 같은 형식으로 표시됩니다:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```
## 구성 파일 {#configuration_files}

ClickHouse 클라이언트는 다음 중 가장 먼저 존재하는 파일을 사용합니다:

- `-c [ -C, --config, --config-file ]` 매개변수로 정의된 파일.
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouse 레포지토리의 샘플 구성 파일을 참조하십시오: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

<Tabs>
  <TabItem value="xml" label="XML" default>
```xml
<config>
    <user>username</user>
    <password>password</password>
    <secure>true</secure>
    <openSSL>
      <client>
        <caConfig>/etc/ssl/cert.pem</caConfig>
      </client>
    </openSSL>
</config>
```
  </TabItem>
  <TabItem value="yaml" label="YAML">
```yaml
user: username
password: 'password'
secure: true
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```
  </TabItem>
</Tabs>
## 환경 변수 옵션 {#environment-variable-options}

사용자 이름, 비밀번호 및 호스트는 환경 변수 `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_HOST`를 통해 설정할 수 있습니다.
명령줄 인수 `--user`, `--password` 또는 `--host`, 또는 [연결 문자열](#connection_string) (지정된 경우) 가 환경 변수보다 우선합니다.
## 명령줄 옵션 {#command-line-options}

모든 명령줄 옵션은 명령줄에서 직접 지정하거나 [구성 파일](#configuration_files)에서 기본값으로 지정할 수 있습니다.
### 일반 옵션 {#command-line-options-general}

| 옵션                                               | 설명                                                                                                                          | 기본값                      |
|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <file 경로>` | 클라이언트의 구성 파일 위치, 기본 위치에 없을 경우. [구성 파일](#configuration_files)을 참조하십시오. | -                            |
| `--help`                                           | 사용 요약을 인쇄하고 종료합니다. 모든 가능한 옵션을 표시하려면 `--verbose`와 결합하십시오.                                   | -                            |
| `--history_file <file 경로>`                       | 명령 기록이 포함된 파일의 경로.                                                                                           | -                            |
| `--history_max_entries`                            | 기록 파일의 최대 항목 수.                                                                                                 | `1000000` (백만)            |
| `--prompt <프롬프트>`                              | 사용자 정의 프롬프트를 지정합니다.                                                                                         | 서버의 `display_name`       |
| `--verbose`                                        | 출력 세분도를 높입니다.                                                                                                     | -                            |
| `-V [ --version ]`                                 | 버전을 인쇄하고 종료합니다.                                                                                                | -                            |
### Connection options {#command-line-options-connection}

| Option                           | Description                                                                                                                                                                                                                                                                                                                        | Default                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 구성 파일에서 미리 구성된 연결 세부 정보의 이름입니다. [Connection credentials](#connection-credentials)를 참조하십시오.                                                                                                                                                                                                   | -                                                                                                                |
| `-d [ --database ] <database>`   | 이 연결에 대해 기본으로 사용할 데이터베이스를 선택합니다.                                                                                                                                                                                                                                                                             | 서버 설정에서 현재 데이터베이스 (`기본값: default`)                                             |
| `-h [ --host ] <host>`           | 연결할 ClickHouse 서버의 호스트 이름입니다. 호스트 이름 또는 IPv4 또는 IPv6 주소일 수 있습니다. 여러 호스트는 여러 인수를 통해 전달할 수 있습니다.                                                                                                                                                                    | `localhost`                                                                                                      |
| `--jwt <value>`                  | 인증을 위해 JSON 웹 토큰(JWT)을 사용합니다. <br/><br/>서버 JWT 인증은 ClickHouse Cloud에서만 사용할 수 있습니다.                                                                                                                                                                                                            | -                                                                                                                |
| `--no-warnings`                  | 클라이언트가 서버에 연결할 때 `system.warnings`의 경고를 표시하지 않도록 설정합니다.                                                                                                                                                                                                                                            | -                                                                                                                |
| `--password <password>`          | 데이터베이스 사용자 비밀번호입니다. 구성 파일에서 연결에 대한 비밀번호를 지정할 수도 있습니다. 비밀번호를 지정하지 않으면 클라이언트가 비밀번호를 요청합니다.                                                                                                                                                   | -                                                                                                                |
| `--port <port>`                  | 서버가 연결을 수신하는 포트입니다. 기본 포트는 9440(TLS) 및 9000(TLS 없음)입니다. <br/><br/>참고: 클라이언트는 HTTP(S)가 아닌 기본 프로토콜을 사용합니다.                                                                                                                                                         | `--secure`가 지정된 경우 `9440`, 그렇지 않은 경우 `9000`. 호스트 이름이 `.clickhouse.cloud`로 끝나면 항상 `9440`으로 기본 설정됩니다. |
| `-s [ --secure ]`                | TLS 사용 여부입니다. <br/><br/>포트 9440(기본 보안 포트) 또는 ClickHouse Cloud에 연결할 때 자동으로 활성화됩니다. <br/><br/>[configuration file](#configuration_files)에서 CA 인증서를 구성해야 할 수도 있습니다. 사용 가능한 구성 설정은 [server-side TLS configuration](../operations/server-configuration-parameters/settings.md#openssl)와 동일합니다. | 포트 9440 또는 ClickHouse Cloud에 연결할 때 자동으로 활성화됩니다.                                                   |
| `--ssh-key-file <path-to-file>`  | 서버 인증을 위한 SSH 개인 키가 포함된 파일입니다.                                                                                                                                                                                                                                                              | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file`에 지정된 SSH 개인 키의 암호입니다.                                                                                                                                                                                                                                                                 | -                                                                                                                |
| `-u [ --user ] <username>`       | 연결할 데이터베이스 사용자입니다.                                                                                                                                                                                                                                                                                                   | `default`                                                                                                        |

:::note
`--host`, `--port`, `--user` 및 `--password` 옵션 대신 클라이언트는 [connection strings](#connection_string)도 지원합니다.
:::
### Query options {#command-line-options-query}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | [query with parameters](#cli-queries-with-parameters)의 매개변수에 대한 치환 값입니다.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `-q [ --query ] <query>`        | 일괄 처리 모드에서 실행할 쿼리입니다. 여러 번 지정할 수 있습니다(`--query "SELECT 1" --query "SELECT 2"`) 또는 세미콜론으로 구분된 여러 쿼리를 한 번에 지정할 수 있습니다(`--query "SELECT 1; SELECT 2;"`). 후자의 경우, `VALUES` 이외의 형식을 가진 `INSERT` 쿼리는 빈 줄로 분리해야 합니다. <br/><br/>단일 쿼리는 매개변수 없이 지정할 수도 있습니다: `clickhouse-client "SELECT 1"` <br/><br/>`--queries-file`와 함께 사용할 수 없습니다.                               |
| `--queries-file <path-to-file>` | 쿼리가 포함된 파일의 경로입니다. `--queries-file`을 여러 번 지정할 수 있습니다. 예: `--queries-file queries1.sql --queries-file queries2.sql`. <br/><br/>`--query`와 함께 사용할 수 없습니다.                                                                                                                                                                                                                                                                                            |
| `-m [ --multiline ]`            | 지정된 경우 다중 행 쿼리를 허용합니다(Enter에서 쿼리를 전송하지 않음). 쿼리는 세미콜론으로 끝날 때만 전송됩니다.                                                                                                                                                                                                                                                                                                                                                           |
### Query settings {#command-line-options-query-settings}

쿼리 설정은 클라이언트에서 명령줄 옵션으로 지정할 수 있습니다. 예:
```bash
$ clickhouse-client --max_threads 1
```

[Settings](../operations/settings/settings.md)를 참조하여 설정 목록을 확인하세요.
### Formatting options {#command-line-options-formatting}

| Option                    | Description                                                                                                                                                                                                                   | Default        |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `-f [ --format ] <format>` | 지정된 형식을 사용하여 결과를 출력합니다. <br/><br/>지원되는 형식 목록은 [Formats for Input and Output Data](formats.md)를 참조하십시오.                                                                                | `TabSeparated` |
| `--pager <command>`       | 모든 출력을 이 명령으로 파이프합니다. 일반적으로 `less`(예: 넓은 결과 집합을 표시하기 위해 `less -S`)와 유사합니다.                                                                                                                | -              |
| `-E [ --vertical ]`       | 결과를 출력하기 위해 [Vertical format](/interfaces/formats/Vertical)을 사용합니다. 이는 `–-format Vertical`과 동일합니다. 이 형식에서는 각 값이 별도의 줄에 인쇄되어 넓은 테이블을 표시할 때 유용합니다. | -              |
### Execution details {#command-line-options-execution-details}

| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | 진행률 테이블의 전환을 활성화하려면 Control 키(스페이스)를 누르십시오. 진행률 테이블 인쇄가 활성화된 대화형 모드에서만 적용됩니다.                                                                                                                                                                | `enabled`                                                           |
| `--hardware-utilization`          | 진행률 바에 하드웨어 활용 정보 인쇄합니다.                                                                                                                                                                                                                                                             | -                                                                   |
| `--memory-usage`                  | 지정되는 경우 비대화식 모드에서 `stderr`에 메모리 사용량을 인쇄합니다. <br/><br/>가능한 값: <br/>• `none` - 메모리 사용량을 인쇄하지 않음 <br/>• `default` - 바이트 수 인쇄 <br/>• `readable` - 사람이 읽을 수 있는 형식으로 메모리 사용량 인쇄                                                                | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` 패킷을 인쇄합니다.                                                                                                                                                                                                                                                                                      | -                                                                   |
| `--progress`                      | 쿼리 실행의 진행 상황을 인쇄합니다. <br/><br/>가능한 값: <br/>• `tty\|on\|1\|true\|yes` - 대화형 모드에서 터미널로 출력 <br/>• `err` - 비대화식 모드에서 `stderr`로 출력 <br/>• `off\|0\|false\|no` - 진행률 인쇄 비활성화                                                       | 대화형 모드에서는 `tty`, 비대화식(배치) 모드에서는 `off`    |
| `--progress-table`                | 쿼리 실행 동안 변경되는 메트릭과 함께 진행률 테이블을 인쇄합니다. <br/><br/>가능한 값: <br/>• `tty\|on\|1\|true\|yes` - 대화형 모드에서 터미널로 출력 <br/>• `err` - 비대화식 모드에서 `stderr`로 출력 <br/>• `off\|0\|false\|no` - 진행률 테이블 비활성화                      | 대화형 모드에서는 `tty`, 비대화식(배치) 모드에서는 `off`    |
| `--stacktrace`                    | 예외의 스택 트레이스를 인쇄합니다.                                                                                                                                                                                                                                                                                   | -                                                                   |
| `-t [ --time ]`                   | 비대화식 모드에서 쿼리 실행 시간을 `stderr`에 인쇄합니다(벤치마크용).                                                                                                                                                                                                                                    | -                                                                   |
