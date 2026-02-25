---
description: 'ClickHouse 명령줄 클라이언트 인터페이스 문서'
sidebar_label: 'ClickHouse 클라이언트'
sidebar_position: 17
slug: /interfaces/cli
title: 'ClickHouse 클라이언트'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse는 ClickHouse 서버에 직접 SQL 쿼리를 실행하기 위한 네이티브 명령줄 클라이언트를 제공합니다.
이 클라이언트는 대화형 모드(실시간 쿼리 실행용)와 배치 모드(스크립팅 및 자동화용)를 모두 지원합니다.
쿼리 결과는 터미널에 표시하거나 파일로 내보낼 수 있으며, Pretty, CSV, JSON 등을 포함한 모든 ClickHouse 출력 [형식](formats.md)을 지원합니다.

클라이언트는 진행률 표시줄, 읽은 행 수, 처리한 바이트 수, 쿼리 실행 시간 등을 통해 쿼리 실행에 대한 실시간 피드백을 제공합니다.
또한 [명령줄 옵션](#command-line-options)과 [설정 파일](#configuration_files)을 모두 지원합니다.


## 설치 \{#install\}

ClickHouse를 다운로드하려면 다음을 실행하십시오.

```bash
curl https://clickhouse.com/ | sh
```

함께 설치하려면 다음 명령을 실행하십시오:

```bash
sudo ./clickhouse install
```

추가 설치 방법은 [Install ClickHouse](../getting-started/install/install.mdx)를 참조하십시오.

클라이언트와 서버는 버전이 서로 달라도 호환되지만, 일부 기능은 오래된 클라이언트에서는 사용할 수 없습니다. 클라이언트와 서버 모두에서 동일한 버전을 사용할 것을 권장합니다.


## 실행 \{#run\}

:::note
ClickHouse를 다운로드만 하고 설치하지 않았다면 `clickhouse-client` 대신 `./clickhouse client`를 사용하십시오.
:::

ClickHouse 서버에 연결하려면 다음을 실행하십시오.

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

필요에 따라 추가 연결 세부 정보를 지정합니다:

| Option                           | Description                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse 서버가 연결을 수락하는 포트입니다. 기본 포트는 9440(TLS)와 9000(TLS 미사용)입니다. ClickHouse Client는 HTTP(S)가 아닌 네이티브 프로토콜을 사용한다는 점에 유의하십시오. |
| `-s [ --secure ]`                | TLS를 사용할지 여부입니다(일반적으로 자동으로 감지됩니다).                                                                                            |
| `-u [ --user ] <username>`       | 연결에 사용할 데이터베이스 사용자입니다. 기본적으로 `default` 사용자로 연결합니다.                                                                            |
| `--password <password>`          | 데이터베이스 사용자의 비밀번호입니다. 연결에 사용할 비밀번호는 설정 파일에서도 지정할 수 있습니다. 비밀번호를 지정하지 않으면 클라이언트가 비밀번호 입력을 요청합니다.                                 |
| `-c [ --config ] <path-to-file>` | ClickHouse Client용 설정 파일의 위치입니다. 기본 위치 중 하나에 없을 경우 이 옵션을 사용합니다. [설정 파일](#configuration_files)을 참조하십시오.                        |
| `--connection <name>`            | [설정 파일](#connection-credentials)에 미리 구성해 둔 연결 설정의 이름입니다.                                                                      |

명령줄 옵션의 전체 목록은 [명령줄 옵션](#command-line-options)을 참조하십시오.


### ClickHouse Cloud에 연결하기 \{#connecting-cloud\}

ClickHouse Cloud 서비스에 대한 세부 정보는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 연결할 서비스를 선택한 다음 **Connect**를 클릭합니다.

<Image img={cloud_connect_button}
  size="md"
  alt="ClickHouse Cloud 서비스 연결 버튼"
/>

<br/>

<br/>

**Native**를 선택하면 예시 `clickhouse-client` 명령과 함께 세부 정보가 표시됩니다.

<Image img={connection_details_native}
  size="md"
  alt="ClickHouse Cloud Native TCP 연결 세부 정보"
/>

### 구성 파일에 연결 정보 저장하기 \{#connection-credentials\}

하나 이상의 ClickHouse 서버에 대한 연결 정보를 [구성 파일](#configuration_files)에 저장할 수 있습니다.

형식은 다음과 같습니다.

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

자세한 내용은 [설정 파일에 관한 섹션](#configuration_files)을 참조하십시오.

:::note
쿼리 구문에 집중할 수 있도록, 나머지 예제에서는 연결 옵션(`--host`, `--port` 등)을 생략합니다. 명령을 사용할 때는 이러한 옵션을 반드시 추가해야 합니다.
:::


## 인터랙티브 모드 \{#interactive-mode\}

### 대화형 모드 사용 \{#using-interactive-mode\}

ClickHouse를 대화형 모드로 실행하려면 다음을 실행하십시오:

```bash
clickhouse-client
```

이 명령은 Read-Eval-Print Loop(REPL)을 열어 SQL 쿼리를 대화식으로 입력해 실행할 수 있게 합니다.
연결되면 쿼리를 입력할 수 있는 프롬프트가 표시됩니다.

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

대화형 모드에서는 기본 출력 형식이 `PrettyCompact`입니다.
`FORMAT` 절이나 `--format` 명령줄 옵션을 지정하여 형식을 변경할 수 있습니다.
Vertical 형식을 사용하려면 `--vertical`을 사용하거나, 쿼리 끝에 `\G`를 지정하면 됩니다.
이 형식에서는 각 값이 개별 줄에 출력되므로, 폭이 넓은 테이블을 다룰 때 편리합니다.

대화형 모드에서는 기본적으로 입력한 내용이 `Enter`를 누르면 바로 실행됩니다.
쿼리 끝에 세미콜론은 필요하지 않습니다.

클라이언트를 `-m, --multiline` 매개변수와 함께 시작할 수 있습니다.
여러 줄 쿼리를 입력하려면 줄바꿈 전에 역슬래시 `\`를 입력합니다.
`Enter`를 누르면, 다음 쿼리 줄을 입력하라는 메시지가 표시됩니다.
쿼리를 실행하려면 세미콜론으로 쿼리를 끝낸 뒤 `Enter`를 누르십시오.

ClickHouse Client는 `replxx`(`readline`과 유사함)를 기반으로 하므로 익숙한 키보드 단축키를 사용할 수 있고, 명령 이력을 유지합니다.
이력은 기본적으로 `~/.clickhouse-client-history`에 기록됩니다.

클라이언트를 종료하려면 `Ctrl+D`를 누르거나, 쿼리 대신 다음 중 하나를 입력하십시오:

* `exit` 또는 `exit;`
* `quit` 또는 `quit;`
* `q`, `Q` 또는 `:q`
* `logout` 또는 `logout;`


### 쿼리 처리 정보 \{#processing-info\}

쿼리를 처리할 때 클라이언트는 다음을 표시합니다:

1.  기본적으로 초당 최대 10회까지 업데이트되는 진행 상황입니다.
    빠르게 완료되는 쿼리의 경우 진행 상황이 표시될 시간이 없을 수 있습니다.
2.  디버깅을 위해 파싱된 후 서식이 적용된 쿼리입니다.
3.  지정된 형식의 결과입니다.
4.  결과 행 수, 경과 시간, 쿼리 처리 평균 속도입니다.
    모든 데이터 양은 압축되지 않은 데이터 기준입니다.

긴 쿼리는 `Ctrl+C`를 눌러 취소할 수 있습니다.
그러나 서버가 요청을 중단할 때까지 잠시 기다려야 합니다.
일부 단계에서는 쿼리를 취소할 수 없습니다.
기다리지 않고 `Ctrl+C`를 한 번 더 누르면 클라이언트가 종료됩니다.

ClickHouse Client는 쿼리 실행을 위해 외부 데이터(외부 임시 테이블)를 전달할 수 있습니다.
자세한 내용은 [쿼리 처리를 위한 외부 데이터](../engines/table-engines/special/external-data.md) 섹션을 참조하십시오.

### 별칭 \{#cli_aliases\}

REPL 내에서 다음 별칭을 사용할 수 있습니다.

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - 마지막에 실행한 쿼리를 다시 실행합니다.

### 키보드 단축키 \{#keyboard_shortcuts\}

- `Alt (Option) + Shift + e` - 현재 쿼리로 편집기를 엽니다. 환경 변수 `EDITOR`로 사용할 편집기를 지정할 수 있습니다. 기본값은 `vim`입니다.
- `Alt (Option) + #` - 현재 줄을 주석 처리합니다.
- `Ctrl + r` - 퍼지 방식의 히스토리 검색을 수행합니다.

사용 가능한 키보드 단축키의 전체 목록은 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)에서 확인할 수 있습니다.

:::tip
macOS에서 메타 키(Option)가 올바르게 동작하도록 설정하려면:

iTerm2: Preferences -> Profile -> Keys -> Left Option key로 이동한 후 Esc+를 클릭하십시오.
:::

## 배치 모드 \{#batch-mode\}

### 배치 모드 사용 \{#using-batch-mode\}

ClickHouse Client를 대화형 모드로 사용하는 대신, 배치 모드로 실행할 수 있습니다.
배치 모드에서는 ClickHouse가 단일 쿼리를 실행한 뒤 즉시 종료하며, 대화형 프롬프트나 반복 루프는 제공되지 않습니다.

다음과 같이 단일 쿼리를 지정할 수 있습니다:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

명령줄 옵션인 `--query`를 사용할 수도 있습니다:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`으로 쿼리를 입력할 수 있습니다:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

`messages` 테이블이 이미 존재한다고 가정하면 명령줄에서 데이터를 삽입할 수도 있습니다.

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`를 지정하면, 줄 바꿈 문자 이후에 입력되는 모든 내용이 요청에 추가됩니다.


### 원격 ClickHouse 서비스에 CSV 파일 삽입하기 \{#cloud-example\}

이 예제에서는 샘플 데이터셋 CSV 파일인 `cell_towers.csv`를 `default` 데이터베이스의 기존 테이블 `cell_towers`에 삽입하는 방법을 보여 줍니다:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```


### 명령줄에서 데이터를 삽입하는 예제 \{#more-examples\}

명령줄에서 데이터를 삽입하는 방법에는 여러 가지가 있습니다.
다음 예제는 배치 모드를 사용하여 CSV 데이터 2행을 ClickHouse 테이블에 삽입합니다.

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

아래 예제에서 `cat <<_EOF`는 heredoc을 시작하고 `_EOF`를 다시 만나기 전까지의 모든 내용을 읽은 뒤, 이를 출력합니다:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

아래 예제에서는 `cat`을 사용해 file.csv의 내용을 표준 출력(stdout)으로 출력한 뒤, 파이프로 연결하여 `clickhouse-client`의 입력으로 전달합니다.

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

배치 모드에서는 기본 데이터 [형식](formats.md)이 `TabSeparated`입니다.
위 예시와 같이 쿼리의 `FORMAT` 절에서 형식을 지정할 수 있습니다.


## 매개변수가 있는 쿼리 \{#cli-queries-with-parameters\}

쿼리에 매개변수를 지정하고 명령줄 옵션으로 값을 전달할 수 있습니다.
이렇게 하면 클라이언트 측에서 특정 동적 값을 사용해 쿼리의 서식을 지정하지 않아도 됩니다.
예를 들어:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[대화형 세션](#interactive-mode) 내에서 매개변수를 설정할 수도 있습니다.

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


### 쿼리 구문 \{#cli-queries-with-parameters-syntax\}

쿼리에서 명령줄 매개변수로 지정할 값을 다음 형식으로 중괄호 안에 넣습니다:

```sql
{<name>:<data type>}
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`      | 플레이스홀더 식별자입니다. 해당 명령줄 옵션은 `--param_<name> = value`입니다.                                                                                                                                                                                                                                                                                                 |
| `data type` | 매개변수의 [데이터 타입](../sql-reference/data-types/index.md)입니다. <br /><br />예를 들어 `(integer, ('string', integer))`와 같은 데이터 구조는 `Tuple(UInt8, Tuple(String, UInt8))` 데이터 타입을 가질 수 있습니다(다른 [integer](../sql-reference/data-types/int-uint.md) 타입도 사용할 수 있습니다). <br /><br />또한 테이블 이름, 데이터베이스 이름, 컬럼 이름을 매개변수로 전달할 수도 있으며, 이 경우 데이터 타입으로 `Identifier`를 사용해야 합니다. |


### 예시 \{#cli-queries-with-parameters-examples\}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## AI 기반 SQL 생성 \{#ai-sql-generation\}

ClickHouse Client에는 자연어 설명을 기반으로 SQL 쿼리를 생성할 수 있는 AI 기반 지원 기능이 포함되어 있습니다. 이 기능은 사용자가 깊은 SQL 지식이 없어도 복잡한 쿼리를 작성하는 데 도움이 됩니다.

AI 지원 기능은 `OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있으면 추가 설정 없이 바로 동작합니다. 보다 고급 설정이 필요한 경우 [구성](#ai-sql-generation-configuration) 섹션을 참조하십시오.

### 사용법 \{#ai-sql-generation-usage\}

AI SQL 생성을 사용하려면 자연어 쿼리 앞에 `??`를 붙이십시오.

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI는 다음을 수행합니다.

1. 데이터베이스 스키마를 자동으로 탐색합니다
2. 발견된 테이블과 컬럼을 기반으로 적합한 SQL을 생성합니다
3. 생성된 쿼리를 즉시 실행합니다


### 예제 \{#ai-sql-generation-example\}

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


### 구성 \{#ai-sql-generation-configuration\}

AI SQL 생성을 사용하려면 ClickHouse Client 구성 파일에서 AI 제공자를 설정해야 합니다. OpenAI, Anthropic 또는 OpenAI 호환 API 서비스를 사용할 수 있습니다.

#### 환경 기반 폴백(fallback) \{#ai-sql-generation-fallback\}

설정 파일에 AI 구성이 지정되지 않은 경우, ClickHouse Client는 자동으로 환경 변수를 사용하려고 합니다:

1. 먼저 `OPENAI_API_KEY` 환경 변수를 확인합니다.
2. 없으면 `ANTHROPIC_API_KEY` 환경 변수를 확인합니다.
3. 둘 다 없으면 AI 기능이 비활성화됩니다.

이를 통해 설정 파일 없이도 빠르게 설정할 수 있습니다:

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```


#### 구성 파일 \{#ai-sql-generation-configuration-file\}

AI 설정을 더 세밀하게 제어하려면 다음 위치에 있는 ClickHouse Client 구성 파일에서 설정합니다:

* `$XDG_CONFIG_HOME/clickhouse/config.xml` (`XDG_CONFIG_HOME`이 설정되지 않은 경우 `~/.config/clickhouse/config.xml`) (XML 형식)
* `$XDG_CONFIG_HOME/clickhouse/config.yaml` (`XDG_CONFIG_HOME`이 설정되지 않은 경우 `~/.config/clickhouse/config.yaml`) (YAML 형식)
* `~/.clickhouse-client/config.xml` (XML 형식, 레거시 위치)
* `~/.clickhouse-client/config.yaml` (YAML 형식, 레거시 위치)
* 또는 `--config-file`로 사용자 지정 위치를 지정합니다

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 필수: API 키 (또는 환경 변수로 설정) -->
            <api_key>your-api-key-here</api_key>

            <!-- 필수: Provider 유형 (openai, anthropic) -->
            <provider>openai</provider>

            <!-- 사용할 모델 (기본값은 provider별로 다름) -->
            <model>gpt-4o</model>

            <!-- 선택 사항: OpenAI 호환 서비스용 사용자 지정 API 엔드포인트 -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- 스키마 탐색 설정 -->
            <enable_schema_access>true</enable_schema_access>

            <!-- 생성 파라미터 -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- 선택 사항: 사용자 지정 system prompt -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 필수: API 키 (또는 환경 변수로 설정)
      api_key: your-api-key-here

      # 필수: Provider 유형 (openai, anthropic)
      provider: openai

      # 사용할 모델
      model: gpt-4o

      # 선택 사항: OpenAI 호환 서비스용 사용자 지정 API 엔드포인트
      # base_url: https://openrouter.ai/api

      # 스키마 접근 활성화 - AI가 데이터베이스/테이블 정보를 쿼리할 수 있도록 허용
      enable_schema_access: true

      # 생성 파라미터
      temperature: 0.0      # 무작위성 제어 (0.0 = 결정적)
      max_tokens: 1000      # 최대 응답 길이
      timeout_seconds: 30   # 요청 타임아웃
      max_steps: 10         # 최대 스키마 탐색 단계 수

      # 선택 사항: 사용자 지정 system prompt
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```
  </TabItem>
</Tabs>

<br />

**OpenAI 호환 API(예: OpenRouter) 사용:**

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


### 매개변수 \{#ai-sql-generation-parameters\}

<details>
<summary>필수 매개변수</summary>

- `api_key` - AI 서비스용 API 키입니다. 환경 변수로 설정된 경우 생략할 수 있습니다:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - 참고: 설정 파일에 지정된 API 키가 환경 변수보다 우선합니다
- `provider` - AI 제공자: `openai` 또는 `anthropic`
  - 생략된 경우, 사용 가능한 환경 변수를 기준으로 자동으로 제공자를 결정합니다

</details>

<details>
<summary>모델 구성</summary>

- `model` - 사용할 모델 (기본값: 제공자별 기본값)
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` 등
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` 등
  - OpenRouter: `anthropic/claude-3.5-sonnet`과 같은 해당 서비스의 모델 이름을 사용합니다

</details>

<details>
<summary>연결 설정</summary>

- `base_url` - OpenAI 호환 서비스용 사용자 지정 API 엔드포인트 (선택 사항)
- `timeout_seconds` - 요청 타임아웃(초) (기본값: `30`)

</details>

<details>
<summary>스키마 탐색</summary>

- `enable_schema_access` - AI가 데이터베이스 스키마를 탐색할 수 있도록 허용합니다 (기본값: `true`)
- `max_steps` - 스키마 탐색을 위한 도구 호출 단계의 최대값 (기본값: `10`)

</details>

<details>
<summary>생성 매개변수</summary>

- `temperature` - 랜덤성을 제어합니다. 0.0 = 결정적, 1.0 = 창의적 (기본값: `0.0`)
- `max_tokens` - 토큰 기준 최대 응답 길이 (기본값: `1000`)
- `system_prompt` - AI에 대한 사용자 지정 지시문 (선택 사항)

</details>

### 작동 방식 \{#ai-sql-generation-how-it-works\}

AI SQL 생성기는 여러 단계를 통해 동작합니다:

<VerticalStepper headerLevel="list">

1. **스키마 탐색**

AI는 내장 도구를 사용해 데이터베이스를 탐색합니다
- 사용 가능한 데이터베이스를 나열합니다
- 관련 데이터베이스에 포함된 테이블을 확인합니다
- `CREATE TABLE` SQL 문을 통해 테이블 구조를 검사합니다

2. **쿼리 생성**

탐색된 스키마를 기반으로 AI가 다음과 같은 SQL을 생성합니다:
- 자연어로 표현한 의도를 반영합니다
- 올바른 테이블 및 컬럼 이름을 사용합니다
- 적절한 조인과 집계를 적용합니다

3. **실행**

생성된 SQL이 자동으로 실행되고 결과가 표시됩니다

</VerticalStepper>

### 제한 사항 \{#ai-sql-generation-limitations\}

- 인터넷에 연결되어 있어야 합니다
- API 사용에는 AI 제공자가 부과하는 요청 제한 및 비용이 적용됩니다
- 복잡한 쿼리는 여러 차례의 수정이 필요할 수 있습니다
- AI는 실제 데이터에는 접근하지 못하며, 스키마 정보에 대해서만 읽기 전용으로 접근할 수 있습니다

### 보안 \{#ai-sql-generation-security\}

- API 키는 ClickHouse 서버로 전송되지 않습니다.
- AI는 실제 데이터가 아니라 스키마 정보(테이블/컬럼 이름과 타입)만 볼 수 있습니다.
- 생성된 모든 쿼리는 기존 데이터베이스 권한을 준수합니다.

## 연결 문자열 \{#connection_string\}

### 사용 방법 \{#connection-string-usage\}

ClickHouse Client는 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/), [PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING), [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)에서 사용하는 것과 유사한 연결 문자열(connection string)을 사용해 ClickHouse 서버에 접속하는 것도 지원합니다. 구문은 다음과 같습니다.

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| Component (all optional) | Description                                                                                           | Default          |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------- |
| `user`                   | 데이터베이스 사용자 이름.                                                                                        | `default`        |
| `password`               | 데이터베이스 사용자 비밀번호. `:`를 지정했고 비밀번호를 비워 두면, 클라이언트가 비밀번호 입력을 요청합니다.                                        | -                |
| `hosts_and_ports`        | 호스트와 선택적 포트 목록 `host[:port] [, host:[port]], ...`.                                                    | `localhost:9000` |
| `database`               | 데이터베이스 이름.                                                                                            | `default`        |
| `query_parameters`       | key-value 쌍 목록 `param1=value1[,&param2=value2], ...`. 일부 파라미터는 값이 필요하지 않습니다. 파라미터 이름과 값은 대소문자를 구분합니다. | -                |


### 참고 \{#connection-string-notes\}

username, password 또는 database가 연결 문자열에 지정된 경우 `--user`, `--password` 또는 `--database`로 다시 지정할 수 없습니다(그 반대의 경우도 마찬가지입니다).

host 구성 요소는 호스트 이름 또는 IPv4 혹은 IPv6 주소가 될 수 있습니다.
IPv6 주소는 대괄호로 감싸야 합니다:

```text
clickhouse://[2001:db8::1234]
```

연결 문자열에는 여러 개의 호스트를 포함할 수 있습니다.
ClickHouse Client는 이러한 호스트에 대해 왼쪽에서 오른쪽 순서대로 연결을 시도합니다.
한 번 연결이 성립되면 나머지 호스트에는 더 이상 연결을 시도하지 않습니다.

연결 문자열은 `clickHouse-client`의 첫 번째 인수로 지정해야 합니다.
연결 문자열은 `--host` 및 `--port`를 제외한 임의 개수의 다른 [command-line options](#command-line-options)과 함께 사용할 수 있습니다.

`query_parameters`에 사용할 수 있는 키는 다음과 같습니다:

| Key               | Description                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| `secure` (또는 `s`) | 지정된 경우, 클라이언트는 보안 연결(TLS)을 통해 서버에 연결합니다. 자세한 내용은 [command-line options](#command-line-options)의 `--secure`를 참조하십시오. |

**Percent encoding**

다음 매개변수에 포함된 Non-US ASCII 문자, 공백 및 특수 문자는 [percent-encoded](https://en.wikipedia.org/wiki/URL_encoding) 형태여야 합니다:

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`


### 예시 \{#connection_string_examples\}

`localhost`의 9000 포트에 연결하고 쿼리 `SELECT 1`을 실행합니다.

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

`localhost`에 호스트 `127.0.0.1`, 포트 `9000`으로 사용자 `john`, 비밀번호 `secret`을 사용하여 접속합니다

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default` USER로, IPv6 주소 `[::1]` 및 포트 `9000`을 사용하는 호스트 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://[::1]:9000
```

멀티라인 모드로 `localhost`의 9000번 포트에 연결합니다.

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

포트 9000을 통해 사용자 `default`로 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

`localhost`의 9000번 포트로 접속하고 기본 데이터베이스를 `my_database`로 설정합니다.

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

`localhost`의 9000 포트에 연결하고, 연결 문자열에 지정된 `my_database`를 기본 데이터베이스로 사용하며, 축약형 `s` 매개변수를 사용하여 보안 연결을 설정합니다.

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

기본 호스트에 기본 포트, 기본 사용자, 기본 데이터베이스를 사용해 연결합니다.

```bash
clickhouse-client clickhouse:
```

기본 호스트의 기본 포트로, 비밀번호 없이 `my_user` 사용자로 접속합니다.

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

이메일 주소를 사용자 이름으로 사용하여 `localhost`에 연결합니다. `@` 기호는 퍼센트 인코딩되어 `%40`으로 표시됩니다.

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

다음 두 호스트 중 하나에 연결합니다: `192.168.1.15`, `192.168.1.25`.

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## 쿼리 ID 형식 \{#query-id-format\}

인터랙티브 모드에서 ClickHouse Client는 각 쿼리에 대한 쿼리 ID를 표시합니다. 기본적으로 ID는 다음과 같은 형식입니다.

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

사용자 지정 형식은 설정 파일의 `query_id_formats` 태그 안에서 지정할 수 있습니다. 형식 문자열의 `{query_id}` 플레이스홀더는 쿼리 ID로 대체됩니다. 이 태그 안에는 여러 개의 형식 문자열을 사용할 수 있습니다.
이 기능을 사용하면 쿼리 프로파일링을 쉽게 할 수 있도록 하는 URL을 생성할 수 있습니다.

**예시**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

위의 설정에서는 쿼리 ID가 다음과 같은 형식으로 표시됩니다:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```


## 설정 파일 \{#configuration_files\}

ClickHouse Client는 다음 순서로 파일을 확인하여, 처음 발견된 파일을 사용합니다:

- `-c [ -C, --config, --config-file ]` 매개변수로 지정된 파일
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (`XDG_CONFIG_HOME`이 설정되지 않은 경우 `~/.config/clickhouse/config.[xml|yaml|yml]`)
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

설정 파일 예시는 ClickHouse 저장소의 다음 파일을 참고하십시오: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

## 환경 변수 옵션 \{#environment-variable-options\}

사용자 이름, 비밀번호 및 호스트는 환경 변수 `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_HOST`를 통해 설정할 수 있습니다.
명령줄 인수 `--user`, `--password`, `--host` 또는 [connection string](#connection_string)이 지정된 경우 이 값들이 환경 변수보다 우선 적용됩니다.

## 명령줄 옵션 \{#command-line-options\}

모든 명령줄 옵션은 명령줄에서 직접 지정하거나 [구성 파일](#configuration_files)에서 기본값으로 지정할 수 있습니다.

### 일반 옵션 \{#command-line-options-general\}

| Option                                              | Description                                                                                                                        | Default                      |
|-----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | 클라이언트 설정 파일의 위치입니다. 기본 위치 어느 곳에도 없을 경우에 사용합니다. [설정 파일](#configuration_files)을 참조하십시오. | -                            |
| `--help`                                            | 사용 방법 요약을 출력하고 종료합니다. `--verbose`와 함께 사용하면 쿼리 설정을 포함하여 가능한 모든 옵션을 표시합니다.                  | -                            |
| `--history_file <path-to-file>`                     | 명령 이력을 저장하는 파일의 경로입니다.                                                                                     | -                            |
| `--history_max_entries`                             | 이력 파일에 저장할 수 있는 최대 항목 수입니다.                                                                                     | `1000000` (100만)        |
| `--prompt <prompt>`                                 | 사용자 지정 프롬프트를 지정합니다.                                                                                                           | 서버의 `display_name` |
| `--verbose`                                         | 출력 상세 수준을 높입니다.                                                                                                         | -                            |
| `-V [ --version ]`                                  | 버전을 출력하고 종료합니다.                                                                                                            | -                            |

### 연결 옵션 \{#command-line-options-connection\}

| Option                           | Description                                                                                                                                                                                                                                                                                                                        | Default                                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | 구성 파일에 미리 정의된 연결 세부 정보를 식별하는 이름입니다. [Connection credentials](#connection-credentials)를 참조하십시오.                                                                                                                                                                                                    | -                                                                                                                |
| `-d [ --database ] <database>`   | 이 연결에 대해 기본으로 사용할 데이터베이스를 선택합니다.                                                                                                                                                                                                                                                                          | 서버 설정의 현재 데이터베이스입니다 (`default`가 기본값).                                                       |
| `-h [ --host ] <host>`           | 연결할 ClickHouse 서버의 호스트 이름입니다. 호스트 이름 또는 IPv4/IPv6 주소를 사용할 수 있습니다. 여러 개의 호스트는 인수를 여러 번 지정하여 전달할 수 있습니다.                                                                                                                                                                     | `localhost`                                                                                                      |
| `--jwt <value>`                  | 인증에 JSON Web Token (JWT)를 사용합니다. <br/><br/>서버 측 JWT 인증은 ClickHouse Cloud에서만 사용 가능합니다.                                                                                                                                                                                                                     | -                                                                                                                |
| `login`                  | IDP를 통해 인증하기 위해 device grant OAuth 플로우를 호출합니다. <br/><br/>ClickHouse Cloud 호스트의 경우 OAuth 변수는 자동으로 추론되며, 그렇지 않은 경우 `--oauth-url`, `--oauth-client-id`, `--oauth-audience`로 지정해야 합니다.                                                                                                                                                                                           | -                                                                                                                |
| `--no-warnings`                  | 클라이언트가 서버에 연결할 때 `system.warnings`의 경고 표시를 비활성화합니다.                                                                                                                                                                                                                                                     | -                                                                                                                |
| `--no-server-client-version-message`                  | 클라이언트가 서버에 연결할 때 서버-클라이언트 버전 불일치 메시지를 표시하지 않습니다.                                                                                                                                                                                                                                          | -                                                                                                                |
| `--password <password>`          | 데이터베이스 사용자의 비밀번호입니다. 구성 파일에서 연결에 대한 비밀번호를 지정할 수도 있습니다. 비밀번호를 지정하지 않으면 클라이언트가 비밀번호 입력을 요청합니다.                                                                                                                                                                   | -                                                                                                                |
| `--port <port>`                  | 서버가 연결을 수락하는 포트입니다. 기본 포트는 9440(TLS) 및 9000(비 TLS)입니다. <br/><br/>참고: 클라이언트는 HTTP(S)가 아닌 네이티브 프로토콜을 사용합니다.                                                                                                                                                                        | `--secure`가 지정되면 `9440`, 그렇지 않으면 `9000`. 호스트 이름이 `.clickhouse.cloud`로 끝나면 항상 `9440`이 기본값입니다. |
| `-s [ --secure ]`                | TLS 사용 여부입니다. <br/><br/>포트 9440(기본 보안 포트) 또는 ClickHouse Cloud에 연결할 때 자동으로 활성화됩니다. <br/><br/>[configuration file](#configuration_files)에서 CA 인증서를 구성해야 할 수도 있습니다. 사용 가능한 구성 설정은 [server-side TLS configuration](../operations/server-configuration-parameters/settings.md#openssl)과 동일합니다. | 포트 9440 또는 ClickHouse Cloud에 연결할 때 자동 활성화                                                          |
| `--ssh-key-file <path-to-file>`  | 서버 인증에 사용할 SSH 개인 키가 들어 있는 파일입니다.                                                                                                                                                                                                                                                                            | -                                                                                                                |
| `--ssh-key-passphrase <value>`   | `--ssh-key-file`로 지정된 SSH 개인 키의 암호 문구입니다.                                                                                                                                                                                                                                                                            | -                                                                                                                |
| `--tls-sni-override <server name>`       | TLS를 사용하는 경우, 핸드셰이크에 전달할 서버 이름(SNI)입니다.                                                                                                                                                                                                                                                                                                    | `-h` 또는 `--host`로 제공된 호스트입니다.                                                                                                        |
| `-u [ --user ] <username>`       | 연결에 사용할 데이터베이스 사용자 이름입니다.                                                                                                                                                                                                                                                                                      | `default`                                                                                                        |

:::note
`--host`, `--port`, `--user`, `--password` 옵션 대신 [connection string](#connection_string)도 지원합니다.
:::

### 쿼리 옵션 \{#command-line-options-query\}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | [매개변수가 있는 쿼리](#cli-queries-with-parameters)의 매개변수에 사용할 대체 값입니다.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `-q [ --query ] <query>`        | 배치 모드에서 실행할 쿼리입니다. 여러 번 지정할 수 있습니다(`--query "SELECT 1" --query "SELECT 2"`) 또는 세미콜론으로 구분된 여러 개의 쿼리를 한 번에 지정할 수도 있습니다(`--query "SELECT 1; SELECT 2;"`). 후자의 경우, `VALUES` 이외의 형식을 사용하는 `INSERT` 쿼리는 빈 줄로 구분해야 합니다. <br/><br/>단일 쿼리는 매개변수 없이도 지정할 수 있습니다: `clickhouse-client "SELECT 1"` <br/><br/>`--queries-file`과 함께 사용할 수 없습니다.                               |
| `--queries-file <path-to-file>` | 쿼리가 포함된 파일의 경로입니다. `--queries-file`은 `--queries-file queries1.sql --queries-file queries2.sql`처럼 여러 번 지정할 수 있습니다. <br/><br/>`--query`와 함께 사용할 수 없습니다.                                                                                                                                                                                                                                                                                            |
| `-m [ --multiline ]`            | 지정하면 여러 줄로 된 쿼리(멀티라인 쿼리)를 허용합니다(Enter를 눌렀을 때 쿼리를 전송하지 않습니다). 쿼리는 세미콜론으로 끝날 때만 전송됩니다.                                                                                                                                                                                                                                                                                                                                                           |

### 쿼리 설정 \{#command-line-options-query-settings\}

쿼리 설정은 클라이언트에서 명령줄 옵션으로 지정할 수 있습니다. 예를 들면 다음과 같습니다.

```bash
$ clickhouse-client --max_threads 1
```

사용 가능한 설정 목록은 [Settings](../operations/settings/settings.md)을 참조하십시오.


### 서식 옵션 \{#command-line-options-formatting\}

| 옵션                      | 설명                                                                                                                                                                                                                            | 기본값         |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| `-f [ --format ] <format>` | 결과를 출력할 때 지정한 형식(format)을 사용합니다. <br/><br/>지원되는 형식 목록은 [입출력 데이터 형식](formats.md)을 참고하십시오.                                                                                               | `TabSeparated` |
| `--pager <command>`       | 모든 출력을 이 명령으로 파이프로 전달합니다. 일반적으로 `less`(예: 열이 많은 결과 집합을 표시하기 위한 `less -S`)와 같은 명령을 사용합니다.                                                                                                    | -              |
| `-E [ --vertical ]`       | 결과를 출력할 때 [Vertical 형식](/interfaces/formats/Vertical)을 사용합니다. 이는 `–-format Vertical`과 동일합니다. 이 형식에서는 각 값이 별도의 줄에 출력되며, 열이 많은 테이블을 표시할 때 유용합니다.                                | -              |

### Execution details \{#command-line-options-execution-details\}

| Option                            | Description                                                                                                                                                                                                                                                                                                         | Default                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Control 키(스페이스바)를 눌러 progress 테이블 토글을 활성화합니다. progress 테이블 출력이 활성화된 대화형 모드에서만 적용됩니다.                                                                                                                                                                                      | `enabled`                                                           |
| `--hardware-utilization`          | 진행률 표시줄에 하드웨어 사용률 정보를 출력합니다.                                                                                                                                                                                                                                                                  | -                                                                   |
| `--memory-usage`                  | 지정된 경우 비대화형 모드에서 메모리 사용량을 `stderr`에 출력합니다. <br/><br/>가능한 값: <br/>• `none` - 메모리 사용량을 출력하지 않음 <br/>• `default` - 바이트 수를 출력 <br/>• `readable` - 사람이 읽기 쉬운 형식으로 메모리 사용량을 출력                                                | -                                                                   |
| `--print-profile-events`          | `ProfileEvents` 패킷을 출력합니다.                                                                                                                                                                                                                                                                                  | -                                                                   |
| `--progress`                      | 쿼리 실행 진행 상태를 출력합니다. <br/><br/>가능한 값: <br/>• `tty\|on\|1\|true\|yes` - 대화형 모드에서 터미널로 출력 <br/>• `err` - 비대화형 모드에서 `stderr`로 출력 <br/>• `off\|0\|false\|no` - 진행 상태 출력 비활성화                                                                             | 대화형 모드에서는 `tty`, 비대화형(배치) 모드에서는 `off`            |
| `--progress-table`                | 쿼리 실행 중 변경되는 메트릭을 표시하는 progress 테이블을 출력합니다. <br/><br/>가능한 값: <br/>• `tty\|on\|1\|true\|yes` - 대화형 모드에서 터미널로 출력 <br/>• `err` - 비대화형 모드에서 `stderr`로 출력 <br/>• `off\|0\|false\|no` - progress 테이블 비활성화                                 | 대화형 모드에서는 `tty`, 비대화형(배치) 모드에서는 `off`            |
| `--stacktrace`                    | 예외의 스택 트레이스를 출력합니다.                                                                                                                                                                                                                                                                                  | -                                                                   |
| `-t [ --time ]`                   | 비대화형 모드에서 쿼리 실행 시간을 `stderr`에 출력합니다(벤치마크용).                                                                                                                                                                                                                                               | -                                                                   |