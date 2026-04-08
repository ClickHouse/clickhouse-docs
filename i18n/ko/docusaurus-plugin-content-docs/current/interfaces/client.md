---
description: 'ClickHouse command-line client 인터페이스 문서'
sidebar_label: 'ClickHouse 클라이언트'
sidebar_position: 18
slug: /interfaces/client
title: 'ClickHouse 클라이언트'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse는 ClickHouse 서버에서 SQL 쿼리를 직접 실행할 수 있는 기본 제공 command-line client를 제공합니다.
이 도구는 대화형 모드(실시간 쿼리 실행용)와 배치 모드(스크립팅 및 자동화용)를 모두 지원합니다.
쿼리 결과는 터미널에 표시하거나 파일로 내보낼 수 있으며, Pretty, CSV, JSON 등을 포함한 모든 ClickHouse 출력 [형식](formats.md)을 지원합니다.

이 클라이언트는 진행률 표시줄, 읽은 행 수, 처리된 바이트 수, 쿼리 실행 시간을 통해 쿼리 실행 상태를 실시간으로 보여줍니다.
또한 [명령줄 옵션](#command-line-options)과 [설정 파일](#configuration_files)을 모두 지원합니다.

## 설치 \{#install\}

ClickHouse를 다운로드하려면 다음 명령을 실행하십시오:

```bash
curl https://clickhouse.com/ | sh
```

추가로 설치하려면 다음을 실행하십시오:

```bash
sudo ./clickhouse install
```

추가 설치 옵션은 [Install ClickHouse](../getting-started/install/install.mdx)를 참조하십시오.

서로 다른 클라이언트 버전과 서버 버전도 서로 호환되지만, 일부 기능은 구버전 클라이언트에서 사용할 수 없을 수 있습니다. 클라이언트와 서버에는 동일한 버전을 사용하는 것이 좋습니다.

## 실행 \{#run\}

:::note
ClickHouse를 설치하지 않고 다운로드만 했다면 `clickhouse-client` 대신 `./clickhouse client`를 사용하십시오.
:::

ClickHouse 서버에 연결하려면 다음 명령을 실행하십시오:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

필요에 따라 추가 연결 정보를 지정하십시오:

| 옵션                               | 설명                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | ClickHouse 서버가 연결을 수락하는 포트입니다. 기본 포트는 9440(TLS) 및 9000(TLS 미사용)입니다. ClickHouse 클라이언트는 HTTP(S)가 아니라 네이티브 프로토콜을 사용한다는 점에 유의하십시오. |
| `-s [ --secure ]`                | TLS 사용 여부입니다(일반적으로 자동 감지됨).                                                                                                     |
| `-u [ --user ] <username>`       | 연결 시 사용할 데이터베이스 사용자입니다. 기본적으로 `default` 사용자로 연결됩니다.                                                                             |
| `--password <password>`          | 데이터베이스 사용자의 비밀번호입니다. 설정 파일에서 연결 비밀번호를 지정할 수도 있습니다. 비밀번호를 지정하지 않으면 클라이언트가 입력을 요청합니다.                                             |
| `-c [ --config ] <path-to-file>` | ClickHouse 클라이언트의 설정 파일이 기본 위치 중 하나에 없을 경우 해당 설정 파일의 위치입니다. [설정 파일](#configuration_files)을 참조하십시오.                             |
| `--connection <name>`            | [설정 파일](#connection-credentials)에 미리 구성된 연결 정보의 이름입니다.                                                                          |

명령줄 옵션의 전체 목록은 [명령줄 옵션](#command-line-options)을 참조하십시오.

### ClickHouse Cloud에 연결하기 \{#connecting-cloud\}

ClickHouse Cloud 서비스 세부 정보는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 연결할 서비스를 선택한 다음 **Connect**를 클릭하십시오:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 서비스 연결 버튼" />

<br />

<br />

**Native**를 선택하면 예시 `clickhouse-client` 명령어와 함께 세부 정보가 표시됩니다:

<Image img={connection_details_native} size="md" alt="ClickHouse Cloud Native TCP 연결 세부 정보" />

### 설정 파일에 연결 정보 저장 \{#connection-credentials\}

하나 이상의 ClickHouse 서버에 대한 연결 정보를 [설정 파일](#configuration_files)에 저장할 수 있습니다.

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

자세한 내용은 [설정 파일](#configuration_files) 섹션을 참조하십시오.

:::note
쿼리 구문에 집중할 수 있도록, 나머지 예시에서는 연결 정보(`--host`, `--port` 등)를 생략했습니다. 명령어를 사용할 때는 이를 추가하십시오.
:::

## 대화형 모드 \{#interactive-mode\}

### 대화형 모드 사용 \{#using-interactive-mode\}

ClickHouse를 대화형 모드로 실행하려면 다음 명령을 실행하십시오:

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

대화형 모드에서 기본 출력 포맷은 `PrettyCompact`입니다.
포맷은 쿼리의 `FORMAT` 절에서 변경하거나 `--format` 명령줄 옵션을 지정하여 바꿀 수 있습니다.
Vertical 포맷을 사용하려면 `--vertical`을 사용하거나 쿼리 끝에 `\G`를 지정하면 됩니다.
이 포맷에서는 각 값이 별도의 줄에 출력되므로 열이 많은 테이블에 편리합니다.

대화형 모드에서는 기본적으로 입력한 내용이 `Enter`를 누르면 실행됩니다.
쿼리 끝에 세미콜론은 필요하지 않습니다.

클라이언트는 `-m, --multiline` 매개변수와 함께 시작할 수 있습니다.
여러 줄 쿼리를 입력하려면 줄바꿈 전에 백슬래시 `\`를 입력하십시오.
`Enter`를 누르면 쿼리의 다음 줄을 입력하라는 프롬프트가 표시됩니다.
쿼리를 실행하려면 끝에 세미콜론을 붙이고 `Enter`를 누르십시오.

ClickHouse 클라이언트는 `replxx`(`readline`과 유사)를 기반으로 하므로 익숙한 키보드 단축키를 지원하고 입력 기록을 유지합니다.
기본적으로 입력 기록은 `~/.clickhouse-client-history`에 저장됩니다.

클라이언트를 종료하려면 `Ctrl+D`를 누르거나, 쿼리 대신 다음 중 하나를 입력하십시오.

* `exit` 또는 `exit;`
* `quit` 또는 `quit;`
* `q`, `Q` 또는 `:q`
* `logout` 또는 `logout;`

### 쿼리 처리 정보 \{#processing-info\}

쿼리를 처리할 때 클라이언트는 다음을 표시합니다.

1. 진행 상황. 기본적으로 초당 10회를 넘지 않도록 업데이트됩니다.
   쿼리가 매우 빠르면 진행 상황이 표시되지 않을 수 있습니다.
2. 디버깅용으로, 파싱 후 포맷된 쿼리.
3. 지정된 형식의 결과.
4. 결과의 줄 수, 경과 시간, 쿼리 처리의 평균 속도.
   모든 데이터 양은 압축되지 않은 데이터를 기준으로 합니다.

오래 걸리는 쿼리는 `Ctrl+C`를 눌러 취소할 수 있습니다.
하지만 서버가 요청을 중단할 때까지 잠시 더 기다려야 합니다.
특정 단계에서는 쿼리를 취소할 수 없습니다.
기다리지 않고 `Ctrl+C`를 한 번 더 누르면 클라이언트가 종료됩니다.

ClickHouse 클라이언트에서는 쿼리에 사용할 외부 데이터(외부 임시 테이블)를 전달할 수 있습니다.
추가 정보는 [쿼리 처리용 외부 데이터](../engines/table-engines/special/external-data.md) 섹션을 참조하십시오.

### 別名 \{#cli_aliases\}

REPL 내에서 다음 別名을 사용할 수 있습니다:

* `\l` - SHOW DATABASES
* `\d` - SHOW TABLES
* `\c <DATABASE>` - USE DATABASE
* `.` - 마지막 쿼리를 반복합니다

### 키보드 단축키 \{#keyboard_shortcuts\}

* `Alt (Option) + Shift + e` - 현재 쿼리로 편집기를 엽니다. 환경 변수 `EDITOR`로 사용할 편집기를 지정할 수 있습니다. 기본적으로 `vim`을 사용합니다.
* `Alt (Option) + #` - 줄을 주석 처리합니다.
* `Ctrl + r` - 퍼지 히스토리 검색.

사용 가능한 모든 키보드 단축키의 전체 목록은 [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262)에서 확인할 수 있습니다.

:::tip
MacOS에서 메타 키(Option)가 올바르게 동작하도록 설정하려면 다음과 같이 하십시오.

iTerm2: Preferences -&gt; Profile -&gt; Keys -&gt; Left Option key로 이동한 다음 Esc+를 클릭하십시오.
:::

## 배치 모드 \{#batch-mode\}

### 배치 모드 사용 \{#using-batch-mode\}

ClickHouse 클라이언트를 대화형으로 사용하는 대신 배치 모드로 실행할 수 있습니다.
배치 모드에서는 ClickHouse가 단일 쿼리를 실행한 후 즉시 종료되며, 대화형 프롬프트나 반복 처리가 없습니다.

다음과 같이 단일 쿼리를 지정할 수 있습니다:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

`--query` 명령줄 옵션도 사용할 수 있습니다:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

`stdin`으로 쿼리를 전달할 수 있습니다:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

`messages` 테이블이 있다고 가정하면, 명령줄에서 데이터를 삽입할 수도 있습니다:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

`--query`가 지정되면 모든 입력이 줄바꿈 문자 뒤에 요청에 추가됩니다.

### 원격 ClickHouse 서비스에 CSV 파일 삽입 \{#cloud-example\}

이 예시에서는 샘플 데이터세트 CSV 파일 `cell_towers.csv`를 `default` 데이터베이스의 기존 테이블 `cell_towers`에 삽입합니다:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### 명령줄에서 데이터 삽입 예시 \{#more-examples\}

명령줄에서 데이터를 삽입하는 방법은 여러 가지가 있습니다.
다음 예시에서는 배치 모드를 사용해 CSV 데이터 2행을 ClickHouse 테이블에 삽입합니다:

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

아래 예시에서 `cat <<_EOF`는 `_EOF`가 다시 나올 때까지 모든 내용을 읽는 heredoc을 시작하고, 그 내용을 출력합니다:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

아래 예시에서는 `cat`을 사용해 file.csv의 내용을 stdout으로 출력한 뒤, 이를 파이프로 `clickhouse-client`에 입력으로 전달합니다:

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

배치 모드에서는 기본 데이터 [형식](formats.md)이 `TabSeparated`입니다.
위 예시와 같이 쿼리의 `FORMAT` 절에서 형식을 설정할 수 있습니다.

## 매개변수가 있는 쿼리 \{#cli-queries-with-parameters\}

쿼리에서 매개변수를 지정하고 명령줄 옵션으로 값을 전달할 수 있습니다.
이렇게 하면 클라이언트 측에서 특정 동적 값을 사용해 쿼리를 직접 구성하지 않아도 됩니다.
예시:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

[대화형 세션](#interactive-mode)에서도 매개변수를 설정할 수 있습니다:

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

쿼리에서 명령줄 매개변수로 지정할 값을 다음 형식으로 중괄호 안에 넣으십시오.

```sql
{<name>:<data type>}
```

| Parameter   | 설명                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | 플레이스홀더 식별자입니다. 해당하는 명령줄 옵션은 `--param_<name> = value`입니다.                                                                                                                                                                                                                                                                                           |
| `data type` | 매개변수의 [데이터 타입](../sql-reference/data-types/index.md)입니다. <br /><br />예를 들어 `(integer, ('string', integer))`와 같은 데이터 구조는 `Tuple(UInt8, Tuple(String, UInt8))` 데이터 타입이 될 수 있습니다([integer](../sql-reference/data-types/int-uint.md)의 다른 타입도 사용할 수 있습니다). <br /><br />테이블 이름, 데이터베이스 이름, 컬럼 이름도 매개변수로 전달할 수 있으며, 이 경우 데이터 타입으로 `Identifier`를 사용해야 합니다. |

### 예시 \{#cli-queries-with-parameters-examples\}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## AI 기반 SQL 생성 \{#ai-sql-generation\}

ClickHouse 클라이언트에는 자연어 설명을 바탕으로 SQL 쿼리를 생성하는 내장 AI 지원 기능이 포함되어 있습니다. 이 기능을 사용하면 SQL을 깊이 있게 알지 못해도 복잡한 쿼리를 작성할 수 있습니다.

`OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있으면 AI 지원이 즉시 작동합니다. 더 고급 설정은 [설정](#ai-sql-generation-configuration) 섹션을 참조하십시오.

### 사용 방법 \{#ai-sql-generation-usage\}

AI SQL 생성을 사용하려면 자연어 쿼리 앞에 `??`를 붙이십시오:

```bash
:) ?? show all users who made purchases in the last 30 days
```

AI는 다음 작업을 수행합니다:

1. 데이터베이스 schema를 자동으로 탐색합니다
2. 탐색된 테이블과 컬럼을 바탕으로 적절한 SQL을 생성합니다
3. 생성된 쿼리를 즉시 실행합니다

### 예시 \{#ai-sql-generation-example\}

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

### 설정 \{#ai-sql-generation-configuration\}

AI SQL 생성을 사용하려면 ClickHouse 클라이언트 설정 파일에서 AI 제공업체를 설정해야 합니다. OpenAI, Anthropic 또는 OpenAI 호환 API 서비스를 사용할 수 있습니다.

#### 환경 변수 기반 대체 동작 \{#ai-sql-generation-fallback\}

설정 파일에 AI 설정이 지정되어 있지 않으면, ClickHouse 클라이언트는 자동으로 환경 변수를 사용하려고 시도합니다:

1. 먼저 `OPENAI_API_KEY` 환경 변수를 확인합니다
2. 찾지 못하면 `ANTHROPIC_API_KEY` 환경 변수를 확인합니다
3. 둘 다 찾지 못하면 AI 기능이 비활성화됩니다

이렇게 하면 설정 파일 없이도 빠르게 설정할 수 있습니다:

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### 설정 파일 \{#ai-sql-generation-configuration-file\}

AI 설정을 더 세밀하게 제어하려면 다음 위치에 있는 ClickHouse 클라이언트 설정 파일에서 설정하십시오.

* `$XDG_CONFIG_HOME/clickhouse/config.xml` (`XDG_CONFIG_HOME`이 설정되지 않은 경우 `~/.config/clickhouse/config.xml`) (XML 형식)
* `$XDG_CONFIG_HOME/clickhouse/config.yaml` (`XDG_CONFIG_HOME`이 설정되지 않은 경우 `~/.config/clickhouse/config.yaml`) (YAML 형식)
* `~/.clickhouse-client/config.xml` (XML 형식, 레거시 위치)
* `~/.clickhouse-client/config.yaml` (YAML 형식, 레거시 위치)
* 또는 `--config-file`로 사용자 지정 위치를 지정하십시오

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- 필수: API 키(또는 환경 변수로 설정) -->
            <api_key>your-api-key-here</api_key>

            <!-- 필수: 프로바이더 유형(openai, anthropic) -->
            <provider>openai</provider>

            <!-- 사용할 모델(기본값은 프로바이더에 따라 다름) -->
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

            <!-- 선택 사항: 사용자 지정 시스템 프롬프트 -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # 필수: API 키(또는 환경 변수로 설정)
      api_key: your-api-key-here

      # 필수: 프로바이더 유형(openai, anthropic)
      provider: openai

      # 사용할 모델
      model: gpt-4o

      # 선택 사항: OpenAI 호환 서비스용 사용자 지정 API 엔드포인트
      # base_url: https://openrouter.ai/api

      # 스키마 액세스 활성화 - AI가 데이터베이스/테이블 정보를 쿼리할 수 있도록 허용
      enable_schema_access: true

      # 생성 파라미터
      temperature: 0.0      # 무작위성 제어(0.0 = 결정론적)
      max_tokens: 1000      # 최대 응답 길이
      timeout_seconds: 30   # 요청 타임아웃
      max_steps: 10         # 최대 스키마 탐색 단계 수

      # 선택 사항: 사용자 지정 시스템 프롬프트
      # system_prompt: |
      #   ClickHouse SQL 전문가 도우미입니다. 자연어를 SQL로 변환하십시오.
      #   성능에 중점을 두고 ClickHouse 특화 최적화를 사용하십시오.
      #   설명 없이 항상 실행 가능한 SQL만 반환하십시오.
    ```
  </TabItem>
</Tabs>

<br />

**OpenAI 호환 API 사용(예: OpenRouter):**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**최소 구성 예시:**

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

  * `api_key` - AI 서비스용 API key입니다. 환경 변수로 설정한 경우 생략할 수 있습니다:
    * OpenAI: `OPENAI_API_KEY`
    * Anthropic: `ANTHROPIC_API_KEY`
    * 주의: 설정 파일의 API key가 환경 변수보다 우선합니다
  * `provider` - AI 제공업체입니다: `openai` 또는 `anthropic`
    * 생략하면 사용 가능한 환경 변수를 기준으로 자동 대체(fallback)를 사용합니다
</details>

<details>
  <summary>모델 설정</summary>

  * `model` - 사용할 모델입니다(기본값: 제공업체별 기본값)
    * OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` 등
    * Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` 등
    * OpenRouter: `anthropic/claude-3.5-sonnet`과 같은 모델 이름을 사용합니다
</details>

<details>
  <summary>연결 설정</summary>

  * `base_url` - OpenAI 호환 서비스용 사용자 지정 API 엔드포인트입니다(선택 사항)
  * `timeout_seconds` - 초 단위 요청 타임아웃입니다(기본값: `30`)
</details>

<details>
  <summary>스키마 탐색</summary>

  * `enable_schema_access` - AI가 데이터베이스 스키마를 탐색할 수 있도록 허용합니다(기본값: `true`)
  * `max_steps` - 스키마 탐색을 위한 최대 도구 호출 단계 수입니다(기본값: `10`)
</details>

<details>
  <summary>생성 매개변수</summary>

  * `temperature` - 무작위성을 제어합니다. 0.0 = 결정론적, 1.0 = 창의적(기본값: `0.0`)
  * `max_tokens` - tokens 기준 최대 응답 길이입니다(기본값: `1000`)
  * `system_prompt` - AI에 대한 사용자 지정 지침입니다(선택 사항)
</details>

### 작동 방식 \{#ai-sql-generation-how-it-works\}

AI SQL 생성기는 여러 단계의 프로세스로 작동합니다:

<VerticalStepper headerLevel="list">
  1. **스키마 탐색**

  AI는 내장 도구를 사용해 데이터베이스를 탐색합니다

  * 사용 가능한 데이터베이스를 나열합니다
  * 관련 데이터베이스 내 테이블을 탐색합니다
  * `CREATE TABLE` 문을 통해 테이블 구조를 확인합니다

  2. **쿼리 생성**

  탐색된 schema를 바탕으로 AI는 다음과 같은 SQL을 생성합니다:

  * 자연어로 표현한 의도에 맞습니다
  * 올바른 테이블 및 컬럼 이름을 사용합니다
  * 적절한 조인 및 집계를 적용합니다

  3. **실행**

  생성된 SQL은 자동으로 실행되며 결과가 표시됩니다
</VerticalStepper>

### 제한 사항 \{#ai-sql-generation-limitations\}

* 활성화된 인터넷 연결이 필요합니다
* API 사용에는 AI 제공업체의 요청 제한 및 비용이 적용됩니다
* 복잡한 쿼리는 여러 번의 수정이 필요할 수 있습니다
* AI는 실제 데이터가 아니라 스키마 정보에만 읽기 전용으로 접근할 수 있습니다

### 보안 \{#ai-sql-generation-security\}

* API 키는 ClickHouse 서버로 전송되지 않습니다
* AI는 실제 데이터가 아니라 스키마 정보(테이블/컬럼 이름과 유형)만 볼 수 있습니다
* 생성된 모든 쿼리는 기존 데이터베이스 권한을 준수합니다

## 연결 문자열 \{#connection_string\}

### 사용 \{#connection-string-usage\}

ClickHouse 클라이언트는 [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/), [PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING), [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri)와 유사한 연결 문자열을 사용해 ClickHouse 서버에 연결할 수도 있습니다. 구문은 다음과 같습니다:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| 구성 요소(모두 선택 사항)    | 설명                                                                                                         | 기본값              |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| `user`             | 데이터베이스 사용자 이름입니다.                                                                                          | `default`        |
| `password`         | 데이터베이스 사용자 비밀번호입니다. `:`가 지정되고 비밀번호가 비어 있으면 클라이언트에서 사용자 비밀번호 입력을 요청합니다.                                     | -                |
| `hosts_and_ports`  | 호스트와 선택적 포트 목록입니다. `host[:port] [, host:[port]], ...`.                                                     | `localhost:9000` |
| `database`         | 데이터베이스 이름입니다.                                                                                              | `default`        |
| `query_parameters` | key-value 쌍 목록입니다. `param1=value1[,&param2=value2], ...`. 일부 파라미터에는 값이 필요하지 않습니다. 파라미터 이름과 값은 대소문자를 구분합니다. | -                |

### 참고 사항 \{#connection-string-notes\}

연결 문자열에 사용자 이름, 비밀번호 또는 데이터베이스를 지정한 경우 `--user`, `--password` 또는 `--database`로는 지정할 수 없습니다(반대의 경우도 동일합니다).

host 부분에는 호스트명, IPv4 주소 또는 IPv6 주소를 사용할 수 있습니다.
IPv6 주소는 `[]`로 감싸야 합니다:

```text
clickhouse://[2001:db8::1234]
```

연결 문자열에는 여러 호스트를 포함할 수 있습니다.
ClickHouse 클라이언트는 이 호스트들에 정의된 순서대로(왼쪽에서 오른쪽으로) 연결을 시도합니다.
연결이 설정된 후에는 나머지 호스트에 대한 연결은 시도하지 않습니다.

연결 문자열은 `clickHouse-client`의 첫 번째 인수로 지정해야 합니다.
연결 문자열은 `--host` 및 `--port`를 제외한 다른 [명령줄 옵션](#command-line-options)과 임의의 개수로 함께 사용할 수 있습니다.

`query_parameters`에는 다음 키를 사용할 수 있습니다:

| 키                 | 설명                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `secure` (or `s`) | 지정하면 클라이언트는 보안 연결(TLS)을 통해 서버에 연결합니다. [명령줄 옵션](#command-line-options)의 `--secure`를 참조하십시오. |

**퍼센트 인코딩**

다음 매개변수에 포함된 US-ASCII 이외의 문자, 공백 및 특수 문자는 [퍼센트 인코딩](https://en.wikipedia.org/wiki/URL_encoding)해야 합니다:

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`

### 예시 \{#connection_string_examples\}

포트 9000의 `localhost`에 연결한 다음 쿼리 `SELECT 1`을 실행합니다.

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

사용자 `john`, 비밀번호 `secret`, 호스트 `127.0.0.1`, 포트 `9000`으로 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

`default` 사용자로 IPV6 주소 `[::1]` 및 포트 `9000`의 호스트 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://[::1]:9000
```

`localhost`의 9000번 포트에 멀티라인 모드로 연결합니다.

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

`default` 사용자로 포트 9000을 통해 `localhost`에 연결합니다.

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

`localhost`의 9000번 포트에 연결하고 기본 데이터베이스로 `my_database`를 사용합니다.

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

포트 9000에서 `localhost`에 연결하고, 연결 문자열에 지정된 `my_database`를 기본 데이터베이스로 사용하며, 축약형 `s` 매개변수로 보안 연결을 사용합니다.

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

기본 포트와 기본 사용자, 기본 데이터베이스를 사용해 기본 호스트에 연결합니다.

```bash
clickhouse-client clickhouse:
```

기본 호스트의 기본 포트에 `my_user` 사용자로 비밀번호 없이 연결합니다.

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

이메일 주소를 사용자 이름으로 사용해 `localhost`에 연결합니다. `@` 기호는 퍼센트 인코딩되어 `%40`으로 표시됩니다.

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

다음 두 호스트 중 하나에 연결하세요: `192.168.1.15`, `192.168.1.25`.

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## Query ID 형식 \{#query-id-format\}

대화형 모드에서 ClickHouse 클라이언트는 모든 쿼리의 Query ID를 표시합니다. 기본적으로 ID는 다음과 같은 형식으로 표시됩니다:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

사용자 지정 형식은 `query_id_formats` 태그 내의 설정 파일에서 지정할 수 있습니다. 형식 문자열의 `{query_id}` 플레이스홀더는 쿼리 ID로 대체됩니다. 이 태그 안에는 여러 개의 형식 문자열을 지정할 수 있습니다.
이 기능을 사용하면 쿼리 성능 분석을 더 쉽게 할 수 있도록 URL을 생성할 수 있습니다.

**예시**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

위 설정을 적용하면 쿼리 ID가 다음 형식으로 표시됩니다:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## 설정 파일 \{#configuration_files\}

ClickHouse 클라이언트는 다음 파일 중 먼저 존재하는 파일을 사용합니다:

* `-c [ -C, --config, --config-file ]` 매개변수로 지정한 파일
* `./clickhouse-client.[xml|yaml|yml]`
* `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (`XDG_CONFIG_HOME`이 설정되지 않은 경우 `~/.config/clickhouse/config.[xml|yaml|yml]`)
* `~/.clickhouse-client/config.[xml|yaml|yml]`
* `/etc/clickhouse-client/config.[xml|yaml|yml]`

ClickHouse 저장소의 예제 설정 파일을 참조하십시오: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

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

사용자 이름, 비밀번호 및 호스트는 환경 변수 `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_HOST`로 설정할 수 있습니다.
명령줄 인수 `--user`, `--password`, `--host` 또는 [연결 문자열](#connection_string)이 지정된 경우, 환경 변수보다 우선 적용됩니다.

## 명령줄 옵션 \{#command-line-options\}

모든 명령줄 옵션은 명령줄에서 직접 지정하거나 [설정 파일](#configuration_files)에 기본값으로 지정할 수 있습니다.

### 일반 옵션 \{#command-line-options-general\}

| 옵션                                                  | 설명                                                                                   | 기본값                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| `-c [ -C, --config, --config-file ] <path-to-file>` | 클라이언트의 설정 파일이 기본 위치에 없으면 해당 설정 파일의 위치를 지정합니다. [설정 파일](#configuration_files)을 참조하십시오. | -                  |
| `--help`                                            | 사용 요약을 출력하고 종료합니다. `--verbose`와 함께 사용하면 쿼리 설정을 포함한 모든 옵션을 표시합니다.                     | -                  |
| `--history_file <path-to-file>`                     | 명령어 기록이 저장된 파일의 경로입니다.                                                               | -                  |
| `--history_max_entries`                             | 기록 파일에 저장할 수 있는 최대 항목 수입니다.                                                          | `1000000` (100만)   |
| `--prompt <prompt>`                                 | 사용자 지정 프롬프트를 지정합니다.                                                                  | 서버의 `display_name` |
| `--verbose`                                         | 출력의 상세 수준을 높입니다.                                                                     | -                  |
| `-V [ --version ]`                                  | 버전을 출력하고 종료합니다.                                                                      | -                  |

### 연결 옵션 \{#command-line-options-connection\}

| Option                               | Description                                                                                                                                                                                                                                                | Default                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `--connection <name>`                | 설정 파일에 미리 구성된 연결 세부 정보의 이름입니다. [연결 자격 증명](#connection-credentials)을 참조하십시오.                                                                                                                                                                                | -                                                                                             |
| `-d [ --database ] <database>`       | 이 연결의 기본 데이터베이스로 사용할 데이터베이스를 선택합니다.                                                                                                                                                                                                                        | 서버 설정의 현재 데이터베이스(기본값은 `default`)                                                              |
| `-h [ --host ] <host>`               | 연결할 ClickHouse 서버의 호스트명입니다. 호스트명, IPv4 주소 또는 IPv6 주소를 사용할 수 있습니다. 여러 인수를 지정하여 여러 호스트를 전달할 수도 있습니다.                                                                                                                                                         | `localhost`                                                                                   |
| `--jwt <value>`                      | 인증에 JSON Web Token (JWT)을 사용합니다. <br /><br />서버 JWT 인증은 ClickHouse Cloud에서만 사용할 수 있습니다.                                                                                                                                                                    | -                                                                                             |
| `login`                              | IDP를 통해 인증하기 위한 device grant OAuth 흐름을 시작합니다. <br /><br />ClickHouse Cloud 호스트의 경우 OAuth 변수는 자동으로 추론되며, 그 외의 경우에는 `--oauth-url`, `--oauth-client-id`, `--oauth-audience`로 지정해야 합니다.                                                                        | -                                                                                             |
| `--no-warnings`                      | 클라이언트가 서버에 연결할 때 `system.warnings`의 경고를 표시하지 않습니다.                                                                                                                                                                                                         | -                                                                                             |
| `--no-server-client-version-message` | 클라이언트가 서버에 연결할 때 서버-클라이언트 버전 불일치 메시지를 표시하지 않습니다.                                                                                                                                                                                                           | -                                                                                             |
| `--password <password>`              | 데이터베이스 사용자의 비밀번호입니다. 설정 파일에서 연결의 비밀번호를 지정할 수도 있습니다. 비밀번호를 지정하지 않으면 클라이언트가 입력을 요청합니다.                                                                                                                                                                       | -                                                                                             |
| `--port <port>`                      | 서버가 연결을 수락하는 포트입니다. 기본 포트는 9440(TLS)과 9000(TLS 미사용)입니다. <br /><br />주의: 클라이언트는 HTTP(S)가 아니라 네이티브 프로토콜을 사용합니다.                                                                                                                                              | `--secure`가 지정되면 `9440`, 그렇지 않으면 `9000`입니다. 호스트명이 `.clickhouse.cloud`로 끝나면 기본값은 항상 `9440`입니다. |
| `-s [ --secure ]`                    | TLS 사용 여부입니다. <br /><br />포트 9440(기본 보안 포트) 또는 ClickHouse Cloud에 연결할 때 자동으로 활성화됩니다. <br /><br />[설정 파일](#configuration_files)에서 CA 인증서를 구성해야 할 수 있습니다. 사용 가능한 설정은 [서버 측 TLS 설정](../operations/server-configuration-parameters/settings.md#openssl)과 동일합니다. | 포트 9440 또는 ClickHouse Cloud에 연결할 때 자동으로 활성화됩니다                                                |
| `--ssh-key-file <path-to-file>`      | 서버에 인증할 때 사용할 SSH 개인 키가 들어 있는 파일입니다.                                                                                                                                                                                                                       | -                                                                                             |
| `--ssh-key-passphrase <value>`       | `--ssh-key-file`에 지정된 SSH 개인 키의 암호입니다.                                                                                                                                                                                                                     | -                                                                                             |
| `--tls-sni-override <server name>`   | TLS를 사용하는 경우 핸드셰이크 중에 전달할 서버 이름(SNI)입니다.                                                                                                                                                                                                                   | `-h` 또는 `--host`로 지정한 호스트입니다.                                                                 |
| `-u [ --user ] <username>`           | 연결에 사용할 데이터베이스 사용자입니다.                                                                                                                                                                                                                                     | `default`                                                                                     |

:::note
클라이언트는 `--host`, `--port`, `--user`, `--password` 옵션 대신 [연결 문자열](#connection_string)도 지원합니다.
:::

### 쿼리 옵션 \{#command-line-options-query\}

| Option                          | Description                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--param_<name>=<value>`        | [파라미터가 있는 쿼리](#cli-queries-with-parameters)의 파라미터에 대한 치환 값입니다.                                                                                                                                                                                                                                                                   |
| `-q [ --query ] <query>`        | 배치 모드에서 실행할 쿼리입니다. 여러 번 지정할 수 있으며(`--query "SELECT 1" --query "SELECT 2"`), 세미콜론으로 구분된 여러 쿼리를 포함하여 한 번만 지정할 수도 있습니다(`--query "SELECT 1; SELECT 2;"`). 후자의 경우 `VALUES` 이외의 형식을 사용하는 `INSERT` 쿼리는 빈 줄로 구분해야 합니다. <br /><br />인자 없이 단일 쿼리를 지정할 수도 있습니다: `clickhouse-client "SELECT 1"` <br /><br />`--queries-file`과 함께 사용할 수 없습니다. |
| `--queries-file <path-to-file>` | 쿼리가 들어 있는 파일의 경로입니다. `--queries-file`은 여러 번 지정할 수 있습니다. 예: `--queries-file queries1.sql --queries-file queries2.sql`. <br /><br />`--query`와 함께 사용할 수 없습니다.                                                                                                                                                                      |
| `-m [ --multiline ]`            | 지정하면 여러 줄 쿼리를 허용합니다(Enter를 눌러도 쿼리를 전송하지 않음). 쿼리는 세미콜론으로 끝날 때만 전송됩니다.                                                                                                                                                                                                                                                             |

### 쿼리 설정 \{#command-line-options-query-settings\}

쿼리 설정은 클라이언트의 명령줄 옵션으로 지정할 수 있습니다. 예시는 다음과 같습니다:

```bash
$ clickhouse-client --max_threads 1
```

[설정](../operations/settings/settings.md)에서 설정 목록을 확인하십시오.

### 형식 옵션 \{#command-line-options-formatting\}

| 옵션                         | 설명                                                                                                                                            | 기본값            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `-f [ --format ] <format>` | 지정한 형식을 사용해 결과를 출력합니다. <br /><br />지원되는 형식 목록은 [입력 및 출력 데이터 형식](formats.md)을 참조하십시오.                                                          | `TabSeparated` |
| `--pager <command>`        | 모든 출력을 이 명령어로 보냅니다. 일반적으로 `less`(예: 열이 많은 결과 집합을 표시할 때는 `less -S`) 또는 이와 유사한 명령어를 사용합니다.                                                      | -              |
| `-E [ --vertical ]`        | [Vertical 형식](/interfaces/formats/Vertical)을 사용해 결과를 출력합니다. 이는 `--format Vertical`과 동일합니다. 이 형식에서는 각 값이 별도의 줄에 출력되므로, 열이 많은 테이블을 표시할 때 유용합니다. | -              |

### 실행 세부 정보 \{#command-line-options-execution-details\}

| 옵션                               | 설명                                                                                                                                                                                                        | 기본값                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `--enable-progress-table-toggle` | 제어 키(Space)를 눌러 진행률 테이블 표시를 전환할 수 있도록 합니다. 진행률 테이블 출력이 활성화된 대화형 모드에서만 적용됩니다.                                                                                                                              | `enabled`                             |
| `--hardware-utilization`         | 진행률 표시줄에 하드웨어 사용률 정보를 출력합니다.                                                                                                                                                                              | -                                     |
| `--memory-usage`                 | 지정하면 비대화형 모드에서 메모리 사용량을 `stderr`에 출력합니다. <br /><br />가능한 값: <br />• `none` - 메모리 사용량을 출력하지 않습니다 <br />• `default` - 바이트 수를 출력합니다 <br />• `readable` - 사람이 읽기 쉬운 형식으로 메모리 사용량을 출력합니다                       | -                                     |
| `--print-profile-events`         | `ProfileEvents` 패킷을 출력합니다.                                                                                                                                                                                | -                                     |
| `--progress`                     | 쿼리 실행 진행률을 출력합니다. <br /><br />가능한 값: <br />• `tty\|on\|1\|true\|yes` - 대화형 모드에서 터미널에 출력합니다 <br />• `err` - 비대화형 모드에서 `stderr`에 출력합니다 <br />• `off\|0\|false\|no` - 진행률 출력을 비활성화합니다                        | 대화형 모드에서는 `tty`, 비대화형(배치) 모드에서는 `off` |
| `--progress-table`               | 쿼리 실행 중 변하는 메트릭을 포함한 진행률 테이블을 출력합니다. <br /><br />가능한 값: <br />• `tty\|on\|1\|true\|yes` - 대화형 모드에서 터미널에 출력합니다 <br />• `err` - 비대화형 모드에서 `stderr`에 출력합니다 <br />• `off\|0\|false\|no` - 진행률 테이블 출력을 비활성화합니다 | 대화형 모드에서는 `tty`, 비대화형(배치) 모드에서는 `off` |
| `--stacktrace`                   | 예외의 스택 트레이스를 출력합니다.                                                                                                                                                                                       | -                                     |
| `-t [ --time ]`                  | 비대화형 모드에서 쿼리 실행 시간을 `stderr`에 출력합니다(벤치마크용).                                                                                                                                                               | -                                     |