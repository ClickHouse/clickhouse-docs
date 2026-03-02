---
description: '모든 플랫폼과 프로그래밍 언어에서 REST API 형태로 ClickHouse에 접근할 수 있게 해 주는 HTTP 인터페이스에 대한 문서입니다'
sidebar_label: 'HTTP 인터페이스'
sidebar_position: 15
slug: /interfaces/http
title: 'HTTP 인터페이스'
doc_type: 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';


# HTTP 인터페이스 \{#http-interface\}

## 전제 조건 \{#prerequisites\}

이 문서의 예제를 따라 하려면 다음이 필요합니다.

- 실행 중인 ClickHouse 서버 인스턴스가 있어야 합니다.
- `curl`이 설치되어 있어야 합니다. Ubuntu 또는 Debian에서는 `sudo apt install curl`을 실행하거나, 설치 방법은 이 [문서](https://curl.se/download.html)를 참조하십시오.

## 개요 \{#overview\}

HTTP 인터페이스는 REST API 형태로 어떤 플랫폼, 어떤 프로그래밍 언어에서든 ClickHouse를 사용할 수 있게 합니다. HTTP 인터페이스는 네이티브 인터페이스보다 기능은 제한되지만, 언어 지원은 더 우수합니다.

기본적으로 `clickhouse-server`는 다음 포트에서 요청을 수신합니다:

* HTTP용 포트 8123
* HTTPS용 포트 8443 (옵션으로 활성화 가능)

어떤 매개변수도 지정하지 않고 `GET /` 요청을 보내면, 문자열 「Ok.」와 함께 200 응답 코드가 반환됩니다.

```bash
$ curl 'http://localhost:8123/'
Ok.
```

&quot;Ok.&quot;는 [`http_server_default_response`](../../operations/server-configuration-parameters/settings.md#http_server_default_response)에 정의된 기본값이며, 원하는 경우 변경할 수 있습니다.

또한 [HTTP response codes caveats](#http_response_codes_caveats)도 참조하십시오.


## 웹 사용자 인터페이스 \{#web-ui\}

ClickHouse에는 웹 사용자 인터페이스가 포함되어 있으며, 다음 주소에서 접속할 수 있습니다:

```text
http://localhost:8123/play
```

웹 UI는 쿼리 실행 중 진행 상황 표시, 쿼리 취소, 결과 스트리밍을 지원합니다.
또한 쿼리 파이프라인에 대한 차트와 그래프를 표시하는 숨겨진 기능이 있습니다.

쿼리가 성공적으로 실행되면 다운로드 버튼이 나타나며, 이를 통해 CSV, TSV, JSON, JSONLines, Parquet, Markdown 또는 ClickHouse에서 지원하는 사용자 정의 형식을 포함한 다양한 형식으로 쿼리 결과를 다운로드할 수 있습니다. 다운로드 기능은 쿼리 캐시를 사용하여 쿼리를 다시 실행하지 않고 효율적으로 결과를 가져옵니다. UI에서 여러 페이지 중 한 페이지만 표시되었더라도 전체 결과 집합을 다운로드합니다.

웹 UI는 전문 사용자용으로 설계되었습니다.

<Image img={PlayUI} size="md" alt="ClickHouse 웹 UI 스크린샷" />

헬스 체크 스크립트에서는 `GET /ping` 요청을 사용합니다. 이 핸들러는 항상 &quot;Ok.&quot; (마지막에 줄 바꿈 포함)을 반환합니다. 18.12.13 버전부터 사용 가능합니다. 레플리카의 지연 시간을 확인하려면 `/replicas_status`도 참고하십시오.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```


## HTTP/HTTPS를 통한 쿼리 실행 \{#querying\}

HTTP/HTTPS를 통해 쿼리를 실행하는 방법은 세 가지입니다.

* 요청을 URL의 &#39;query&#39; 매개변수로 전송합니다.
* POST 메서드를 사용합니다.
* 쿼리의 앞부분을 &#39;query&#39; 매개변수로 보내고, 나머지는 POST로 전송합니다.

:::note
URL 크기는 기본적으로 1 MiB로 제한되며, `http_max_uri_size` 설정으로 변경할 수 있습니다.
:::

성공하면 200 응답 코드를 받고, 응답 본문에 결과가 포함됩니다.
오류가 발생하면 500 응답 코드를 받고, 응답 본문에 오류 설명 텍스트가 포함됩니다.

GET을 사용하는 요청은 &quot;readonly&quot;입니다. 이는 데이터를 수정하는 쿼리에는 POST 메서드만 사용할 수 있음을 의미합니다.
쿼리는 POST 본문에 넣어 보내거나 URL 매개변수로 보낼 수 있습니다. 몇 가지 예제를 살펴보겠습니다.

아래 예제에서는 curl을 사용하여 `SELECT 1` 쿼리를 전송합니다. 공백에 대한 URL 인코딩인 `%20` 사용에 유의하십시오.

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

이 예제에서는 결과를 터미널에 출력하기 위해 wget을 `-nv`(non-verbose)와 `-O-` 파라미터와 함께 사용합니다.
이 경우 공백에 대해 URL 인코딩을 사용할 필요가 없습니다:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

이 예제에서는 원시 HTTP 요청을 netcat으로 파이프합니다.

```bash title="command"
echo -ne 'GET /?query=SELECT%201 HTTP/1.0\r\n\r\n' | nc localhost 8123
```

```response title="response"
HTTP/1.0 200 OK
X-ClickHouse-Summary: {"read_rows":"1","read_bytes":"1","written_rows":"0","written_bytes":"0","total_rows_to_read":"1","result_rows":"0","result_bytes":"0","elapsed_ns":"4505959","memory_usage":"1111711"}
Date: Tue, 11 Nov 2025 18:16:01 GMT
Connection: Close
Content-Type: text/tab-separated-values; charset=UTF-8
Access-Control-Expose-Headers: X-ClickHouse-Query-Id,X-ClickHouse-Summary,X-ClickHouse-Server-Display-Name,X-ClickHouse-Format,X-ClickHouse-Timezone,X-ClickHouse-Exception-Code,X-ClickHouse-Exception-Tag
X-ClickHouse-Server-Display-Name: MacBook-Pro.local
X-ClickHouse-Query-Id: ec0d8ec6-efc4-4e1d-a14f-b748e01f5294
X-ClickHouse-Format: TabSeparated
X-ClickHouse-Timezone: Europe/London
X-ClickHouse-Exception-Tag: dngjzjnxkvlwkeua

1
```

보시다시피 `curl` 명령은 공백을 URL로 이스케이프해야 해서 다소 불편합니다.
`wget`은 모든 문자를 자동으로 이스케이프해 주지만, keep-alive와 Transfer-Encoding: chunked를 사용할 때 HTTP 1.1에서 잘 동작하지 않으므로 사용을 권장하지 않습니다.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

쿼리의 일부는 파라미터로, 나머지는 POST 본문으로 전송되는 경우 이 두 데이터 파트 사이에 줄 바꿈 문자가 삽입됩니다.
예를 들어, 다음은 동작하지 않습니다:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

기본적으로는 데이터가 [`TabSeparated`](/interfaces/formats/TabSeparated) 형식으로 반환됩니다.

쿼리에서 다른 형식을 요청하려면 `FORMAT` 절을 사용합니다. 예를 들어:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1, 2, 3 FORMAT JSON'
```


```response title="Response"
{
    "meta":
    [
        {
            "name": "1",
            "type": "UInt8"
        },
        {
            "name": "2",
            "type": "UInt8"
        },
        {
            "name": "3",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "1": 1,
            "2": 2,
            "3": 3
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.000515,
        "rows_read": 1,
        "bytes_read": 1
    }
}
```

기본 형식을 `TabSeparated`가 아닌 다른 값으로 지정하려면 `default_format` URL 매개변수 또는 `X-ClickHouse-Format` 헤더를 사용할 수 있습니다.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

매개변수화된 쿼리와 함께 POST 메서드를 사용할 수 있습니다. 매개변수는 `{name:Type}`과 같이 중괄호 안에 매개변수 이름과 형식을 사용하여 지정합니다. 매개변수 값은 `param_name`으로 전달합니다:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```


## HTTP/HTTPS를 통한 INSERT 쿼리 \{#insert-queries\}

데이터 전송에는 `INSERT` 쿼리에 `POST` 메서드를 사용해야 합니다. 이 경우 URL 파라미터에 쿼리의 시작 부분을 지정하고, POST를 사용하여 삽입할 데이터를 전달할 수 있습니다. 삽입할 데이터는 예를 들어 MySQL에서 생성한 탭으로 구분된 덤프일 수 있습니다. 이러한 방식으로 `INSERT` 쿼리는 MySQL의 `LOAD DATA LOCAL INFILE`을 대체합니다.

### 예시 \{#examples\}

테이블을 생성하려면:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

익숙한 `INSERT` 쿼리를 사용해 데이터를 삽입하려면 다음과 같이 하면 됩니다:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

쿼리와 별도로 데이터를 전송하려면:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

임의의 데이터 포맷을 지정할 수 있습니다. 예를 들어, `INSERT INTO t VALUES`를 작성할 때 사용하는 것과 동일한 포맷인 &#39;Values&#39; 포맷을 지정할 수 있습니다.

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

탭으로 구분된 덤프 파일에서 데이터를 삽입하려면, 해당 포맷을 지정하십시오:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

테이블 내용을 조회하려면:

```bash
$ curl 'http://localhost:8123/?query=SELECT%20a%20FROM%20t'
7
8
9
10
11
12
1
2
3
4
5
6
```

:::note
병렬 쿼리 처리로 인해 데이터가 임의의 순서로 출력됩니다
:::

테이블을 삭제하려면 다음을 수행합니다:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

데이터 테이블을 반환하지 않는 성공한 요청의 경우, 비어 있는 응답 본문이 반환됩니다.


## Compression \{#compression\}

압축은 대량의 데이터를 전송할 때 네트워크 트래픽을 줄이거나, 생성 즉시 압축된 덤프를 만들 때 사용할 수 있습니다.

데이터를 전송할 때 내부 ClickHouse 압축 포맷을 사용할 수 있습니다. 압축된 데이터는 비표준 포맷을 가지며, 이를 처리하려면 `clickhouse-compressor` 프로그램이 필요합니다. 이 프로그램은 기본적으로 `clickhouse-client` 패키지와 함께 설치됩니다. 

데이터 삽입 효율을 높이기 위해서는 [`http_native_compression_disable_checksumming_on_decompress`](../../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 설정을 사용하여 서버 측 체크섬 검증을 비활성화하십시오.

URL에 `compress=1`을 지정하면 서버가 전송하는 데이터를 압축합니다. URL에 `decompress=1`을 지정하면 `POST` 메서드로 전달하는 데이터를 서버가 압축 해제합니다.

[HTTP compression](https://en.wikipedia.org/wiki/HTTP_compression)을 사용할 수도 있습니다. ClickHouse는 다음 [compression methods](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)를 지원합니다:

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

압축된 `POST` 요청을 보내려면 요청 헤더에 `Content-Encoding: compression_method`를 추가하십시오.

ClickHouse가 응답을 압축하도록 하려면 요청에 `Accept-Encoding: compression_method` 헤더를 추가하십시오. 

[`http_zlib_compression_level`](../../operations/settings/settings.md#http_zlib_compression_level) 설정을 사용하여 모든 압축 방식에 대해 데이터 압축 수준을 설정할 수 있습니다.

:::info
일부 HTTP 클라이언트는 기본적으로 서버의 데이터를 (`gzip` 및 `deflate` 사용 시) 자동으로 압축 해제하므로, 압축 설정을 올바르게 사용하더라도 압축 해제된 데이터를 받게 될 수 있습니다.
:::

## 예제 \{#examples-compression\}

압축된 데이터를 서버로 전송하려면 다음과 같이 합니다:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

서버에서 압축된 데이터 아카이브를 받으려면 다음과 같이 하십시오:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

서버에서 전송되는 압축 데이터를 gunzip으로 압축 해제하여 수신하려면 다음과 같이 합니다:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```


## 기본 데이터베이스 \{#default-database\}

기본 데이터베이스를 지정하려면 `database` URL 매개변수 또는 `X-ClickHouse-Database` 헤더를 사용할 수 있습니다.

```bash
echo 'SELECT number FROM numbers LIMIT 10' | curl 'http://localhost:8123/?database=system' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

기본적으로 서버 설정에 등록된 데이터베이스가 기본 데이터베이스로 사용됩니다. 기본 제공 설정에서는 `default`라는 이름의 데이터베이스가 사용됩니다. 또는 테이블 이름 앞에 마침표(.)를 붙여 데이터베이스를 항상 명시할 수도 있습니다.


## 인증 \{#authentication\}

사용자 이름과 비밀번호는 세 가지 방법 가운데 하나로 지정할 수 있습니다.

1. HTTP Basic 인증을 사용하는 방법입니다.

예를 들어 다음과 같습니다.

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. `user` 및 `password` URL 매개변수에서

:::warning
이 방법은 매개변수가 웹 프록시에 의해 로그로 남거나 브라우저에 캐시될 수 있으므로 권장하지 않습니다.
:::

예를 들면 다음과 같습니다.

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. &#39;X-ClickHouse-User&#39; 및 &#39;X-ClickHouse-Key&#39; 헤더 사용

예를 들어:

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

사용자 이름을 지정하지 않으면 `default` 이름이 사용됩니다. 비밀번호를 지정하지 않으면 빈 비밀번호가 사용됩니다.
URL 매개변수를 사용하여 단일 쿼리 처리나 전체 설정 프로필에 대한 각종 설정을 지정할 수도 있습니다.

예를 들어:

```text
http://localhost:8123/?profile=web&max_rows_to_read=1000000000&query=SELECT+1
```

```bash
$ echo 'SELECT number FROM system.numbers LIMIT 10' | curl 'http://localhost:8123/?' --data-binary @-
0
1
2
3
4
5
6
7
8
9
```

추가 정보는 다음 문서를 참고하십시오:

* [Settings](/operations/settings/settings)
* [SET](/sql-reference/statements/set)


## HTTP 프로토콜에서 ClickHouse 세션 사용 \{#using-clickhouse-sessions-in-the-http-protocol\}

HTTP 프로토콜에서도 ClickHouse 세션을 사용할 수 있습니다. 이를 위해 요청의 `GET` 매개변수로 `session_id`를 추가하면 됩니다. 세션 ID로는 임의의 문자열을 사용할 수 있습니다.

기본적으로 세션은 60초 동안 아무 작업이 없으면 종료됩니다. 이 타임아웃(초 단위)을 변경하려면 서버 설정에서 `default_session_timeout` 설정을 수정하거나, 요청에 `session_timeout` `GET` 매개변수를 추가합니다.

세션 상태를 확인하려면 `session_check=1` 매개변수를 사용합니다. 하나의 세션에서는 한 번에 하나의 쿼리만 실행할 수 있습니다.

쿼리 진행 상황은 `X-ClickHouse-Progress` 응답 헤더에서 확인할 수 있습니다. 이를 위해 [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers)를 활성화합니다.

아래는 헤더 순서 예시입니다:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

가능한 헤더 필드는 다음과 같습니다:

| Header field         | Description                               |
| -------------------- | ----------------------------------------- |
| `read_rows`          | 읽은 행 수.                                   |
| `read_bytes`         | 바이트 단위로 읽은 데이터 양.                         |
| `total_rows_to_read` | 읽어야 할 총 행 수.                              |
| `written_rows`       | 기록한 행 수.                                  |
| `written_bytes`      | 바이트 단위로 기록한 데이터 양.                        |
| `elapsed_ns`         | 나노초 단위의 쿼리 실행 시간.                         |
| `memory_usage`       | 쿼리가 사용한 메모리(바이트 단위). (**v25.11부터 사용 가능**) |

실행 중인 요청은 HTTP 연결이 끊어지더라도 자동으로 중지되지 않습니다. 파싱과 데이터 포맷팅은 서버 측에서 수행되며, 네트워크 사용이 비효율적일 수 있습니다.

다음과 같은 선택적 매개변수가 있습니다:

| Parameters             | Description                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `query_id` (optional)  | 쿼리 ID(임의의 문자열)로 전달할 수 있습니다. [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (optional) | QUOTA 키(임의의 문자열)로 전달할 수 있습니다. [&quot;Quotas&quot;](/operations/quotas)                                     |

HTTP 인터페이스는 쿼리에서 사용할 외부 데이터(외부 임시 테이블)를 함께 전달하는 것을 허용합니다. 자세한 내용은 [&quot;External data for query processing&quot;](/engines/table-engines/special/external-data)를 참고하십시오.


## 응답 버퍼링 \{#response-buffering\}

응답 버퍼링은 서버 측에서 사용하도록 설정할 수 있습니다. 이를 위해 다음 URL 매개변수를 사용할 수 있습니다:

* `buffer_size`
* `wait_end_of_query`

다음 설정을 사용할 수 있습니다:

* [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
* [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size`는 서버 메모리에서 버퍼링할 결과의 바이트 수를 결정합니다. 결과 본문이 이 임계값보다 큰 경우, 버퍼는 HTTP 채널로 기록되고 나머지 데이터는 직접 HTTP 채널로 전송됩니다.

전체 응답이 버퍼링되도록 하려면 `wait_end_of_query=1`로 설정하십시오. 이 경우 메모리에 저장되지 않은 데이터는 임시 서버 파일에 버퍼링됩니다.

예를 들어:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
버퍼링을 사용하여 응답 코드와 HTTP 헤더가 클라이언트로 전송된 이후에 쿼리 처리 오류가 발생하는 상황을 방지하십시오. 이러한 경우 오류 메시지는 응답 본문 끝에 기록되며, 클라이언트에서는 파싱 단계에 이르러서야 오류를 감지할 수 있습니다.
:::


## 쿼리 매개변수로 역할 설정하기 \{#setting-role-with-query-parameters\}

이 기능은 ClickHouse 24.4에서 추가되었습니다.

특정 시나리오에서는 SQL 문을 실행하기 전에 먼저 부여된 역할을 설정해야 할 수 있습니다.
그러나 다중 SQL 문이 허용되지 않기 때문에 `SET ROLE`과 해당 SQL 문을 하나의 요청으로 함께 전송할 수는 없습니다.

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

위 명령을 실행하면 오류가 발생합니다.

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

이 제한을 피하려면 `role` 쿼리 매개변수를 대신 사용하십시오.

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

이는 해당 구문을 실행하기 전에 `SET ROLE my_role`을(를) 실행하는 것과 같습니다.

또한 여러 개의 `role` 쿼리 매개변수를 지정할 수도 있습니다:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

이 경우 `?role=my_role&role=my_other_role`은(는) 해당 문을 실행하기 전에 `SET ROLE my_role, my_other_role`을(를) 실행하는 것과 유사하게 동작합니다.


## HTTP 응답 코드 주의사항 \{#http_response_codes_caveats\}

HTTP 프로토콜의 제한 사항으로 인해 HTTP 200 응답 코드는 쿼리가 성공적으로 수행되었음을 보장하지 않습니다.

다음은 예시입니다:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

이 동작이 발생하는 이유는 HTTP 프로토콜의 특성 때문입니다. HTTP 헤더는 HTTP 코드 200과 함께 먼저 전송되고, 그 다음 HTTP 바디가 전송되며, 이후 오류가 일반 텍스트 형식으로 바디에 삽입됩니다.

이 동작은 사용된 포맷과는 무관하며, `Native`, `TSV`, `JSON` 중 어떤 것을 사용하더라도 오류 메시지는 항상 응답 스트림 중간에 포함됩니다.

`wait_end_of_query=1`을 활성화하여 이 문제를 완화할 수 있습니다([Response Buffering](#response-buffering)). 이 경우 전체 쿼리가 처리될 때까지 HTTP 헤더 전송이 지연됩니다. 그러나 결과가 여전히 [`http_response_buffer_size`](../../operations/settings/settings.md#http_response_buffer_size)를 초과하지 않아야 하고, [`send_progress_in_http_headers`](../../operations/settings/settings.md#send_progress_in_http_headers)와 같은 다른 설정이 헤더 지연에 영향을 줄 수 있기 때문에 이 방법만으로는 문제를 완전히 해결할 수는 없습니다.

:::tip
모든 오류를 포착하는 유일한 방법은 필요한 포맷으로 파싱하기 전에 HTTP 바디를 먼저 분석하는 것입니다.
:::

ClickHouse에서는 `http_write_exception_in_output_format=0`(기본값)일 때, 사용된 포맷(예: `Native`, `TSV`, `JSON` 등)과 관계없이 아래와 같이 일관된 예외 형식을 사용합니다. 따라서 클라이언트 측에서 오류 메시지를 파싱하고 추출하기가 쉽습니다.

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

여기서 `<TAG>`는 16바이트 길이의 임의 태그이며, `X-ClickHouse-Exception-Tag` 응답 헤더로 전송되는 태그와 동일합니다.
`<error message>`는 실제 예외 메시지이며, 정확한 길이는 `<message_length>`에서 확인할 수 있습니다. 위에서 설명한 전체 예외 블록의 크기는 최대 16 KiB입니다.

다음은 `JSON` 형식의 예시입니다.

```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+JSON"
...
{
    "meta":
    [
        {
            "name": "sleepEachRow(0.001)",
            "type": "UInt8"
        },
        {
            "name": "throwIf(equals(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        },
        {
            "sleepEachRow(0.001)": 0,
            "throwIf(equals(number, 2))": 0
        }
__exception__
dmrdfnujjqvszhav
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 dmrdfnujjqvszhav
__exception__
```

다음은 `CSV` 형식의 유사한 예입니다


```bash
$ curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)+FORMAT+CSV"
...
<
0,0
0,0

__exception__
rumfyutuqkncbgau
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(__table1.number, 2_UInt8) :: 1) -> throwIf(equals(__table1.number, 2_UInt8)) UInt8 : 0'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 25.11.1.1)
262 rumfyutuqkncbgau
__exception__
```


## 매개변수가 있는 쿼리 \{#cli-queries-with-parameters\}

매개변수가 있는 쿼리를 작성하고, 해당 매개변수에 대한 값을 대응하는 HTTP 요청 매개변수로부터 전달할 수 있습니다. 자세한 내용은 [CLI용 매개변수가 있는 쿼리](../../interfaces/cli.md#cli-queries-with-parameters)를 참조하십시오.

### 예제 \{#example-3\}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```


### URL 매개변수에서의 탭 문자 \{#tabs-in-url-parameters\}

쿼리 매개변수는 「이스케이프된(escaped)」 형식에서 파싱됩니다. 이러한 형식을 사용하면 `\N`으로 null을 명확하게 파싱할 수 있는 등의 이점이 있습니다. 이는 탭 문자가 `\t` (또는 `\`와 탭 문자)로 인코딩되어야 함을 의미합니다. 예를 들어, 다음 예시에서는 `abc`와 `123` 사이에 실제 탭 문자가 들어 있으며, 입력 문자열은 두 개의 값으로 분리됩니다:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

그러나 URL 매개변수에서 실제 탭 문자를 `%09`로 인코딩하면 제대로 파싱되지 않습니다:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URL 매개변수를 사용하는 경우 `\t`를 `%5C%09`로 인코딩해야 합니다. 예를 들어:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```


## 사전 정의된 HTTP 인터페이스 \{#predefined_http_interface\}

ClickHouse는 HTTP 인터페이스를 통해 특정 종류의 쿼리를 지원합니다. 예를 들어 다음과 같이 테이블에 데이터를 기록할 수 있습니다.

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse에는 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)와 같은 서드파티 도구와 더 쉽게 통합할 수 있도록 해주는 사전 정의된 HTTP 인터페이스도 있습니다. 예제를 살펴보겠습니다.

먼저, 이 섹션을 서버 설정 파일에 추가합니다.

`http_handlers`는 여러 개의 `rule`을 포함하도록 구성합니다. ClickHouse는 수신된 HTTP 요청을 각 `rule`에 정의된 사전 정의 타입과 비교하여 매칭하고, 처음으로 일치하는 `rule`이 핸들러를 실행합니다. 그런 다음 매칭에 성공하면 ClickHouse가 해당 사전 정의된 쿼리를 실행합니다.

```yaml title="config.xml"
<http_handlers>
    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.metrics LIMIT 5 FORMAT Template SETTINGS format_template_resultset = 'prometheus_template_output_format_resultset', format_template_row = 'prometheus_template_output_format_row', format_template_rows_between_delimiter = '\n'</query>
        </handler>
    </rule>
    <rule>...</rule>
    <rule>...</rule>
</http_handlers>
```

이제 Prometheus 형식 데이터에 대한 URL을 직접 요청할 수 있습니다.

```bash
$ curl -v 'http://localhost:8123/predefined_query'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /predefined_query HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Tue, 28 Apr 2020 08:52:56 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< X-ClickHouse-Server-Display-Name: i-mloy5trc
< Transfer-Encoding: chunked
< X-ClickHouse-Query-Id: 96fe0052-01e6-43ce-b12a-6b7370de6e8a
< X-ClickHouse-Format: Template
< X-ClickHouse-Timezone: Asia/Shanghai
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
# HELP "Query" "Number of executing queries"
# TYPE "Query" counter
"Query" 1

# HELP "Merge" "Number of executing background merges"
# TYPE "Merge" counter
"Merge" 0

# HELP "PartMutation" "Number of mutations (ALTER DELETE/UPDATE)"
# TYPE "PartMutation" counter
"PartMutation" 0

# HELP "ReplicatedFetch" "Number of data parts being fetched from replica"
# TYPE "ReplicatedFetch" counter
"ReplicatedFetch" 0

# HELP "ReplicatedSend" "Number of data parts being sent to replicas"
# TYPE "ReplicatedSend" counter
"ReplicatedSend" 0

* Connection #0 to host localhost left intact

* Connection #0 to host localhost left intact
```

`http_handlers`에 대한 구성 옵션은 다음과 같이 동작합니다.

`rule`에서는 다음 매개변수를 설정할 수 있습니다.

* `method`
* `headers`
* `url`
* `full_url`
* `handler`

각 항목에 대해서는 아래에서 설명합니다.


- `method`는 HTTP 요청의 메서드 부분을 일치시키는 역할을 합니다. `method`는 HTTP 프로토콜에서 [`method`]    
  (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)의 정의를 완전히 준수합니다. 선택적 설정입니다. 설정 파일에 정의되지 않은 경우, HTTP 요청의 메서드 부분과는 일치시키지 않습니다.

- `url`은 HTTP 요청의 URL 부분(경로와 쿼리 문자열)을 일치시키는 역할을 합니다.
  `url`이 `regex:`로 시작하는 경우 [RE2](https://github.com/google/re2)의 정규식으로 해석됩니다.
  선택적 설정입니다. 설정 파일에 정의되지 않은 경우, HTTP 요청의 URL 부분과는 일치시키지 않습니다.

- `full_url`은 `url`과 동일하지만, 전체 URL, 즉 `schema://host:port/path?query_string`을 포함합니다.
  참고로, ClickHouse는 "virtual hosts"를 지원하지 않으므로 `host`는 IP 주소입니다(즉, `Host` 헤더의 값이 아닙니다).

- `empty_query_string` - 요청에 쿼리 문자열(`?query_string`)이 없도록 보장합니다.

- `headers`는 HTTP 요청의 헤더 부분을 일치시키는 역할을 합니다. RE2의 정규식과 호환됩니다. 선택적 설정입니다. 설정 파일에 정의되지 않은 경우, HTTP 요청의 헤더 부분과는 일치시키지 않습니다.

- `handler`에는 주요 처리 로직이 포함됩니다.

  다음과 같은 `type`을 가질 수 있습니다:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  그리고 다음과 같은 파라미터를 가집니다:
  - `query` — `predefined_query_handler` 타입에서 사용하며, 핸들러가 호출될 때 쿼리를 실행합니다.
  - `query_param_name` — `dynamic_query_handler` 타입에서 사용하며, HTTP 요청 파라미터에서 `query_param_name`에 해당하는 값을 추출하여 실행합니다.
  - `status` — `static` 타입에서 사용하며, 응답 상태 코드를 지정합니다.
  - `content_type` — 모든 타입에서 사용하며, 응답의 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)을 지정합니다.
  - `http_response_headers` — 모든 타입에서 사용하며, 응답 헤더 맵입니다. 콘텐츠 타입 설정에도 사용할 수 있습니다.
  - `response_content` — `static` 타입에서 사용하며, 클라이언트로 전송할 응답 콘텐츠입니다. 'file://' 또는 'config://' 접두어를 사용하는 경우, 파일 또는 설정에서 해당 콘텐츠를 찾아 클라이언트로 전송합니다.
  - `user` - 쿼리를 실행할 사용자입니다(기본 사용자는 `default`입니다).
    **참고**, 이 사용자에 대한 비밀번호는 지정할 필요가 없습니다.

서로 다른 `type`에 대한 설정 방법은 다음에서 설명합니다.

### predefined_query_handler \{#predefined_query_handler\}

`predefined_query_handler`에서는 `Settings` 및 `query_params` 값을 설정할 수 있습니다. `predefined_query_handler` 유형에서 `query`를 구성할 수 있습니다.

`query` 값은 `predefined_query_handler`에 미리 정의된 쿼리이며, HTTP 요청이 매치되면 ClickHouse가 이 쿼리를 실행하고 결과를 반환합니다. 반드시 구성해야 하는 항목입니다.

다음 예시는 [`max_threads`](../../operations/settings/settings.md#max_threads) 및 [`max_final_threads`](../../operations/settings/settings.md#max_final_threads) 설정 값을 지정한 후, 시스템 테이블을 조회하여 이러한 설정이 성공적으로 적용되었는지 확인합니다.

:::note
`query`, `play`, `ping`과 같은 기본 `handlers`를 유지하려면 `<defaults/>` 규칙을 추가하십시오.
:::

예를 들어:

```yaml
<http_handlers>
    <rule>
        <url><![CDATA[regex:/query_param_with_url/(?P<name_1>[^/]+)]]></url>
        <methods>GET</methods>
        <headers>
            <XXX>TEST_HEADER_VALUE</XXX>
            <PARAMS_XXX><![CDATA[regex:(?P<name_2>[^/]+)]]></PARAMS_XXX>
        </headers>
        <handler>
            <type>predefined_query_handler</type>
            <query>
                SELECT name, value FROM system.settings
                WHERE name IN ({name_1:String}, {name_2:String})
            </query>
        </handler>
    </rule>
    <defaults/>
</http_handlers>
```

```bash
curl -H 'XXX:TEST_HEADER_VALUE' -H 'PARAMS_XXX:max_final_threads' 'http://localhost:8123/query_param_with_url/max_threads?max_threads=1&max_final_threads=2'
max_final_threads    2
max_threads    1
```


#### 가상 파라미터 `_request_body` \{#virtual-param-request-body\}

URL 파라미터, 헤더, 쿼리 파라미터 외에도 `predefined_query_handler`는 `_request_body`라는 특별한 가상 파라미터를 지원합니다.
이 파라미터에는 HTTP 요청 본문의 원본 내용이 문자열 형태로 그대로 포함됩니다.
이를 통해 임의의 데이터 형식을 수신하고 쿼리 내에서 처리할 수 있는 유연한 REST API를 구현할 수 있습니다.

예를 들어 `_request_body`를 사용하여 POST 요청으로 JSON 데이터를 수신한 뒤, 이를 테이블에 삽입하는 REST 엔드포인트를 구현할 수 있습니다:

```yaml
<http_handlers>
    <rule>
        <methods>POST</methods>
        <url>/api/events</url>
        <handler>
            <type>predefined_query_handler</type>
            <query>
                INSERT INTO events (id, data)
                SELECT {id:UInt32}, {_request_body:String}
            </query>
        </handler>
    </rule>
    <defaults/>
</http_handlers>
```

이제 다음 엔드포인트로 데이터를 전송할 수 있습니다.

```bash
curl -X POST 'http://localhost:8123/api/events?id=123' \
  -H 'Content-Type: application/json' \
  -d '{"user": "john", "action": "login", "timestamp": "2024-01-01T10:00:00Z"}'
```

:::note
하나의 `predefined_query_handler`에는 하나의 `query`만 지원됩니다.
:::


### dynamic_query_handler \{#dynamic_query_handler\}

`dynamic_query_handler`에서는 쿼리를 HTTP 요청의 파라미터 형태로 작성합니다. `predefined_query_handler`와의 차이점은 쿼리를 설정 파일에 작성하느냐입니다. `query_param_name`은 `dynamic_query_handler`에서 설정할 수 있습니다.

ClickHouse는 HTTP 요청 URL에서 `query_param_name`에 해당하는 값을 추출하여 실행합니다. `query_param_name`의 기본값은 `/query`입니다. 이는 선택적인 설정입니다. 설정 파일에 정의되어 있지 않으면 해당 파라미터는 전달되지 않습니다.

이 기능을 시험해 보기 위해, 다음 예시에서는 [`max_threads`](../../operations/settings/settings.md#max_threads)와 `max_final_threads`의 값을 정의하고, 설정이 성공적으로 적용되었는지 확인하는 쿼리를 실행합니다.

예시:

```yaml
<http_handlers>
    <rule>
    <headers>
        <XXX>TEST_HEADER_VALUE_DYNAMIC</XXX>    </headers>
    <handler>
        <type>dynamic_query_handler</type>
        <query_param_name>query_param</query_param_name>
    </handler>
    </rule>
    <defaults/>
</http_handlers>
```

```bash
curl  -H 'XXX:TEST_HEADER_VALUE_DYNAMIC'  'http://localhost:8123/own?max_threads=1&max_final_threads=2&param_name_1=max_threads&param_name_2=max_final_threads&query_param=SELECT%20name,value%20FROM%20system.settings%20where%20name%20=%20%7Bname_1:String%7D%20OR%20name%20=%20%7Bname_2:String%7D'
max_threads 1
max_final_threads   2
```


### static \{#static\}

`static`은 [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 및 `response_content`를 반환할 수 있습니다. `response_content`에는 반환할 콘텐츠를 지정합니다.

예를 들어, &quot;Say Hi!&quot;라는 메시지를 반환하려면 다음과 같이 합니다:

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #highlight-next-line
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

`content_type` 대신 `http_response_headers`를 사용하여 콘텐츠 유형을 설정할 수 있습니다.

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/hi</url>
            <handler>
                <type>static</type>
                <status>402</status>
                #begin-highlight
                <http_response_headers>
                    <Content-Type>text/html; charset=UTF-8</Content-Type>
                    <Content-Language>en</Content-Language>
                    <X-My-Custom-Header>43</X-My-Custom-Header>
                </http_response_headers>
                #end-highlight
                <response_content>Say Hi!</response_content>
            </handler>
        </rule>
        <defaults/>
</http_handlers>
```

```bash
curl -vv  -H 'XXX:xxx' 'http://localhost:8123/hi'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /hi HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 402 Payment Required
< Date: Wed, 29 Apr 2020 03:51:26 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
Say Hi!%
```

설정에 지정된 콘텐츠를 찾아 클라이언트로 전송합니다.

```yaml
<get_config_static_handler><![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]></get_config_static_handler>

<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_config_static_handler</url>
            <handler>
                <type>static</type>
                <response_content>config://get_config_static_handler</response_content>
            </handler>
        </rule>
</http_handlers>
```


```bash
$ curl -v  -H 'XXX:xxx' 'http://localhost:8123/get_config_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_config_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:01:24 GMT
< Connection: Keep-Alive
< Content-Type: text/plain; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
* Connection #0 to host localhost left intact
<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>%
```

클라이언트로 전송되는 파일의 내용을 확인하려면:

```yaml
<http_handlers>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_absolute_path_static_handler</url>
            <handler>
                <type>static</type>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <ETag>737060cd8c284d8af7ad3082f209582d</ETag>
                </http_response_headers>
                <response_content>file:///absolute_path_file.html</response_content>
            </handler>
        </rule>
        <rule>
            <methods>GET</methods>
            <headers><XXX>xxx</XXX></headers>
            <url>/get_relative_path_static_handler</url>
            <handler>
                <type>static</type>
                <content_type>text/html; charset=UTF-8</content_type>
                <http_response_headers>
                    <ETag>737060cd8c284d8af7ad3082f209582d</ETag>
                </http_response_headers>
                <response_content>file://./relative_path_file.html</response_content>
            </handler>
        </rule>
</http_handlers>
```


```bash
$ user_files_path='/var/lib/clickhouse/user_files'
$ sudo echo "<html><body>Relative Path File</body></html>" > $user_files_path/relative_path_file.html
$ sudo echo "<html><body>Absolute Path File</body></html>" > $user_files_path/absolute_path_file.html
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_absolute_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_absolute_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:16 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Absolute Path File</body></html>
* Connection #0 to host localhost left intact
$ curl -vv -H 'XXX:xxx' 'http://localhost:8123/get_relative_path_static_handler'
*   Trying ::1...
* Connected to localhost (::1) port 8123 (#0)
> GET /get_relative_path_static_handler HTTP/1.1
> Host: localhost:8123
> User-Agent: curl/7.47.0
> Accept: */*
> XXX:xxx
>
< HTTP/1.1 200 OK
< Date: Wed, 29 Apr 2020 04:18:31 GMT
< Connection: Keep-Alive
< Content-Type: text/html; charset=UTF-8
< Transfer-Encoding: chunked
< Keep-Alive: timeout=10
< X-ClickHouse-Summary: {"read_rows":"0","read_bytes":"0","written_rows":"0","written_bytes":"0","total_rows_to_read":"0","elapsed_ns":"662334","memory_usage":"8451671"}
<
<html><body>Relative Path File</body></html>
* Connection #0 to host localhost left intact
```


### redirect \{#redirect\}

`redirect`는 `location`으로 `302` 리다이렉트를 수행합니다.

예를 들어, ClickHouse play에서 `play`에 set user를 자동으로 추가하려면 다음과 같이 합니다:

```xml
<clickhouse>
    <http_handlers>
        <rule>
            <methods>GET</methods>
            <url>/play</url>
            <handler>
                <type>redirect</type>
                <location>/play?user=play</location>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP 응답 헤더 \{#http-response-headers\}

ClickHouse에서는 구성 가능한 모든 종류의 핸들러에 적용할 수 있는 사용자 정의 HTTP 응답 헤더를 설정할 수 있습니다. 이러한 헤더는 헤더 이름과 값을 나타내는 key-value 쌍을 값으로 받는 `http_response_headers` 설정을 사용해 지정합니다. 이 기능은 특히 사용자 정의 보안 헤더, CORS 정책 또는 ClickHouse HTTP 인터페이스 전반에 필요한 기타 HTTP 헤더 요구 사항을 구현하는 데 유용합니다.

예를 들어, 다음과 같은 대상에 대해 헤더를 구성할 수 있습니다.

* 일반 쿼리 엔드포인트
* Web UI
* 상태 확인(health check)

또한 `common_http_response_headers`를 지정할 수도 있습니다. 이는 설정에서 정의된 모든 HTTP 핸들러에 적용됩니다.

이러한 헤더는 구성된 모든 핸들러의 HTTP 응답에 포함됩니다.

아래 예시에서는 모든 서버 응답에 두 개의 사용자 정의 헤더인 `X-My-Common-Header`와 `X-My-Custom-Header`가 포함됩니다.

```xml
<clickhouse>
    <http_handlers>
        <common_http_response_headers>
            <X-My-Common-Header>Common header</X-My-Common-Header>
        </common_http_response_headers>
        <rule>
            <methods>GET</methods>
            <url>/ping</url>
            <handler>
                <type>ping</type>
                <http_response_headers>
                    <X-My-Custom-Header>Custom indeed</X-My-Custom-Header>
                </http_response_headers>
            </handler>
        </rule>
    </http_handlers>
</clickhouse>
```


## HTTP 스트리밍 중 예외 발생 시 유효한 JSON/XML 응답 \{#valid-output-on-exception-http-streaming\}

HTTP를 통해 쿼리를 실행하는 동안 일부 데이터가 이미 전송된 이후에 예외가 발생할 수 있습니다. 일반적으로 예외는 클라이언트에 일반 텍스트 형식으로 전송됩니다.
특정 데이터 포맷을 사용하여 데이터를 출력한 경우, 이렇게 되면 지정된 데이터 포맷을 기준으로 볼 때 출력이 유효하지 않게 될 수 있습니다.
이를 방지하기 위해 기본적으로 비활성화되어 있는 설정 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format)을 사용하면, ClickHouse가 예외를 지정된 포맷(현재 XML 및 JSON* 포맷 지원)으로 기록하도록 할 수 있습니다.

예시:

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>3)+from+system.numbers+format+JSON+settings+max_block_size=1&http_write_exception_in_output_format=1'
{
    "meta":
    [
        {
            "name": "number",
            "type": "UInt64"
        },
        {
            "name": "throwIf(greater(number, 2))",
            "type": "UInt8"
        }
    ],

    "data":
    [
        {
            "number": "0",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "1",
            "throwIf(greater(number, 2))": 0
        },
        {
            "number": "2",
            "throwIf(greater(number, 2))": 0
        }
    ],

    "rows": 3,

    "exception": "Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)"
}
```

```bash
$ curl 'http://localhost:8123/?query=SELECT+number,+throwIf(number>2)+from+system.numbers+format+XML+settings+max_block_size=1&http_write_exception_in_output_format=1'
<?xml version='1.0' encoding='UTF-8' ?>
<result>
    <meta>
        <columns>
            <column>
                <name>number</name>
                <type>UInt64</type>
            </column>
            <column>
                <name>throwIf(greater(number, 2))</name>
                <type>UInt8</type>
            </column>
        </columns>
    </meta>
    <data>
        <row>
            <number>0</number>
            <field>0</field>
        </row>
        <row>
            <number>1</number>
            <field>0</field>
        </row>
        <row>
            <number>2</number>
            <field>0</field>
        </row>
    </data>
    <rows>3</rows>
    <exception>Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(greater(number, 2) :: 2) -> throwIf(greater(number, 2)) UInt8 : 1'. (FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 23.8.1.1)</exception>
</result>
```
