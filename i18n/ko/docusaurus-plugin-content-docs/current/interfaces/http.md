---
'description': 'ClickHouse의 HTTP 인터페이스에 대한 문서로, 모든 플랫폼 및 프로그래밍 언어에서 ClickHouse에 대한
  REST API 접근을 제공합니다.'
'sidebar_label': 'HTTP 인터페이스'
'sidebar_position': 15
'slug': '/interfaces/http'
'title': 'HTTP 인터페이스'
'doc_type': 'reference'
---

import PlayUI from '@site/static/images/play.png';
import Image from '@theme/IdealImage';



# HTTP 인터페이스

## 전제 조건 {#prerequisites}

이 문서의 예제를 사용하려면 다음이 필요합니다:
- ClickHouse 서버의 실행 인스턴스가 있어야 합니다.
- `curl`이 설치되어 있어야 합니다. Ubuntu 또는 Debian에서는 `sudo apt install curl`을 실행하거나 이 [문서](https://curl.se/download.html)를 참고하여 설치 지침을 확인하세요.

## 개요 {#overview}

HTTP 인터페이스는 ClickHouse를 REST API 형태로 모든 플랫폼에서 어떤 프로그래밍 언어로도 사용할 수 있게 해줍니다. HTTP 인터페이스는 네이티브 인터페이스보다 제한적이지만 더 나은 언어 지원이 있습니다.

기본적으로 `clickhouse-server`는 다음 포트에서 수신 대기합니다:
- HTTP를 위한 포트 8123
- HTTPS를 위한 포트 8443는 활성화할 수 있습니다.

매개변수 없이 `GET /` 요청을 하면 200 응답 코드와 함께 "Ok."라는 문자열이 반환됩니다:

```bash
$ curl 'http://localhost:8123/'
Ok.
```

"Ok."는 [`http_server_default_response`](../operations/server-configuration-parameters/settings.md#http_server_default_response)에서 정의된 기본값이며, 필요에 따라 변경할 수 있습니다.

또한 참조하세요: [HTTP 응답 코드 주의사항](#http_response_codes_caveats).

## 웹 사용자 인터페이스 {#web-ui}

ClickHouse에는 웹 사용자 인터페이스가 포함되어 있으며, 다음 주소에서 접근할 수 있습니다:

```text
http://localhost:8123/play
```

웹 UI는 쿼리 런타임 동안 진행 상황 표시, 쿼리 취소 및 결과 스트리밍을 지원합니다.
쿼리 파이프라인에 대한 차트와 그래프를 표시하는 비밀 기능이 있습니다.

웹 UI는 여러분과 같은 전문가를 위해 설계되었습니다.

<Image img={PlayUI} size="md" alt="ClickHouse Web UI 스크린샷" />

헬스 체크 스크립트에서는 `GET /ping` 요청을 사용하세요. 이 핸들러는 항상 "Ok."를 반환합니다 (끝에 줄 바꿈 포함). 버전 18.12.13부터 사용 가능합니다. 복제본의 지연을 확인하려면 `/replicas_status`도 참조하세요.

```bash
$ curl 'http://localhost:8123/ping'
Ok.
$ curl 'http://localhost:8123/replicas_status'
Ok.
```

## HTTP/HTTPS를 통한 쿼리 {#querying}

HTTP/HTTPS를 통해 쿼리하려면 세 가지 옵션이 있습니다:
- URL의 'query' 매개변수로 요청을 전송합니다.
- POST 메서드를 사용합니다.
- 쿼리의 시작 부분을 'query' 매개변수에 포함시키고 나머지는 POST를 사용하여 전송합니다.

:::note
URL의 크기는 기본적으로 1 MiB로 제한되어 있으며, `http_max_uri_size` 설정으로 변경할 수 있습니다.
:::

성공적으로 요청을 처리하면 200 응답 코드와 결과가 응답 본문에 포함됩니다.
오류가 발생하면 500 응답 코드와 오류 설명 텍스트가 응답 본문에 포함됩니다.

GET을 사용하는 요청은 '읽기 전용'입니다. 이는 데이터를 수정하는 쿼리에는 POST 메서드만 사용할 수 있음을 의미합니다. 
쿼리 자체를 POST 본문이나 URL 매개변수로 전송할 수 있습니다. 몇 가지 예를 살펴보겠습니다.

아래의 예제에서는 `curl`을 사용하여 쿼리 `SELECT 1`을 전송합니다. 공백에 대한 URL 인코딩도 주목하세요: `%20`.

```bash title="command"
curl 'http://localhost:8123/?query=SELECT%201'
```

```response title="Response"
1
```

이 예에서는 wget이 `-nv` (비verbose) 및 `-O-` 매개변수를 사용하여 결과를 터미널에 출력합니다.
이 경우 공백에 대해 URL 인코딩을 사용할 필요는 없습니다:

```bash title="command"
wget -nv -O- 'http://localhost:8123/?query=SELECT 1'
```

```response
1
```

이 예에서는 순수 HTTP 요청을 netcat에 파이프합니다:

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

보시다시피, `curl` 명령은 공백을 URL로 이스케이프해야 하기 때문에 다소 불편합니다.
`wget`은 모든 것을 스스로 이스케이프하지만, keep-alive 및 Transfer-Encoding: chunked를 사용할 때 HTTP 1.1에서 잘 작동하지 않기 때문에 사용하는 것을 권장하지 않습니다.

```bash
$ echo 'SELECT 1' | curl 'http://localhost:8123/' --data-binary @-
1

$ echo 'SELECT 1' | curl 'http://localhost:8123/?query=' --data-binary @-
1

$ echo '1' | curl 'http://localhost:8123/?query=SELECT' --data-binary @-
1
```

쿼리의 일부가 매개변수로 전송되고 나머지가 POST로 전송되면, 이 두 데이터 부분 사이에 줄 바꿈이 삽입됩니다.
예를 들어 이건 작동하지 않습니다:

```bash
$ echo 'ECT 1' | curl 'http://localhost:8123/?query=SEL' --data-binary @-
Code: 59, e.displayText() = DB::Exception: Syntax error: failed at position 0: SEL
ECT 1
, expected One of: SHOW TABLES, SHOW DATABASES, SELECT, INSERT, CREATE, ATTACH, RENAME, DROP, DETACH, USE, SET, OPTIMIZE., e.what() = DB::Exception
```

기본적으로 데이터는 [`TabSeparated`](/interfaces/formats/TabSeparated) 형식으로 반환됩니다.

`FORMAT` 절은 쿼리에서 다른 형식을 요청하는데 사용됩니다. 예를 들어:

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

`default_format` URL 매개변수나 `X-ClickHouse-Format` 헤더를 사용하여 `TabSeparated` 이외의 기본 형식을 지정할 수 있습니다.

```bash
$ echo 'SELECT 1 FORMAT Pretty' | curl 'http://localhost:8123/?' --data-binary @-
┏━━━┓
┃ 1 ┃
┡━━━┩
│ 1 │
└───┘
```

매개변수화된 쿼리와 함께 POST 메서드를 사용할 수 있습니다. 매개변수는 매개변수 이름과 유형을 사용하여 중괄호로 지정합니다, 예: `{name:Type}`. 매개변수 값은 `param_name`으로 전달됩니다:

```bash
$ curl -X POST -F 'query=select {p1:UInt8} + {p2:UInt8}' -F "param_p1=3" -F "param_p2=4" 'http://localhost:8123/'

7
```

## HTTP/HTTPS를 통한 INSERT 쿼리 {#insert-queries}

데이터 전송에 대한 `POST` 메서드는 `INSERT` 쿼리에 필요합니다. 이 경우 쿼리의 시작 부분을 URL 매개변수에 작성하고, POST를 사용하여 삽입할 데이터를 전달합니다. 삽입할 데이터는 예를 들어 MySQL에서 가져온 탭으로 구분된 덤프일 수 있습니다. 이 방식으로 `INSERT` 쿼리는 MySQL의 `LOAD DATA LOCAL INFILE`로 대체됩니다.

### 예제 {#examples}

테이블을 생성하려면:

```bash
$ echo 'CREATE TABLE t (a UInt8) ENGINE = Memory' | curl 'http://localhost:8123/' --data-binary @-
```

데이터 삽입을 위해 익숙한 `INSERT` 쿼리를 사용하려면:

```bash
$ echo 'INSERT INTO t VALUES (1),(2),(3)' | curl 'http://localhost:8123/' --data-binary @-
```

쿼리와 별도로 데이터를 전송하려면:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

모든 데이터 형식을 지정할 수 있습니다. 예를 들어, 'Values' 형식, 즉 `INSERT INTO t VALUES`에 사용할 때와 같은 형식을 지정할 수 있습니다:

```bash
$ echo '(7),(8),(9)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20Values' --data-binary @-
```

탭으로 구분된 덤프에서 데이터를 삽입하려면 해당 형식을 지정하세요:

```bash
$ echo -ne '10\n11\n12\n' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20FORMAT%20TabSeparated' --data-binary @-
```

테이블 내용을 읽으려면:

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
쿼리 병렬 처리로 인해 데이터가 임의 순서로 출력됩니다.
:::

테이블을 삭제하려면:

```bash
$ echo 'DROP TABLE t' | curl 'http://localhost:8123/' --data-binary @-
```

성공적인 요청이지만 데이터 테이블이 반환되지 않으면 빈 응답 본문이 반환됩니다.

## 압축 {#compression}

압축은 많은 양의 데이터를 전송할 때 네트워크 트래픽을 줄이거나 즉시 압축되는 덤프 생성에 사용할 수 있습니다.

데이터 전송 시 ClickHouse의 내부 압축 형식을 사용할 수 있습니다. 압축된 데이터는 비표준 형식을 가지며, 이를 작업하기 위해 `clickhouse-compressor` 프로그램이 필요합니다. 이 프로그램은 `clickhouse-client` 패키지에 기본적으로 설치됩니다.

데이터 삽입의 효율성을 높이기 위해 [`http_native_compression_disable_checksumming_on_decompress`](../operations/settings/settings.md#http_native_compression_disable_checksumming_on_decompress) 설정을 사용하여 서버 측 체크섬 검증을 비활성화하세요.

URL에 `compress=1`을 지정하면, 서버는 클라이언트에게 보내는 데이터를 압축합니다. URL에 `decompress=1`을 지정하면, 서버는 `POST` 메서드로 전달된 데이터를 압축 해제합니다.

또한 [HTTP 압축](https://en.wikipedia.org/wiki/HTTP_compression)을 사용할 수 있습니다. ClickHouse는 다음 [압축 방법](https://en.wikipedia.org/wiki/HTTP_compression#Content-Encoding_tokens)을 지원합니다:

- `gzip`
- `br`
- `deflate`
- `xz`
- `zstd`
- `lz4`
- `bz2`
- `snappy`

압축된 `POST` 요청을 보내려면 요청 헤더 `Content-Encoding: compression_method`를 추가하세요.

ClickHouse가 응답을 압축하도록 하려면 `Accept-Encoding: compression_method` 헤더를 요청에 추가하세요.

모든 압축 방법에 대한 데이터 압축 수준을 [`http_zlib_compression_level`](../operations/settings/settings.md#http_zlib_compression_level) 설정을 사용하여 조정할 수 있습니다.

:::info
일부 HTTP 클라이언트는 기본적으로 서버의 데이터를 압축 해제할 수 있으며 (gzip 및 deflate와 함께) 압축 설정을 올바르게 사용하더라도 압축 해제된 데이터를 받을 수 있습니다.
:::

## 예제 {#examples-compression}

서버에 압축된 데이터를 보내려면:

```bash
echo "SELECT 1" | gzip -c | \
curl -sS --data-binary @- -H 'Content-Encoding: gzip' 'http://localhost:8123/'
```

서버로부터 압축된 데이터 아카이브를 받으려면:

```bash
curl -vsS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' --output result.gz -d 'SELECT number FROM system.numbers LIMIT 3'

zcat result.gz
0
1
2
```

서버에서 압축된 데이터를 수신하고, gunzip을 사용하여 압축 해제된 데이터를 받으려면:

```bash
curl -sS "http://localhost:8123/?enable_http_compression=1" \
-H 'Accept-Encoding: gzip' -d 'SELECT number FROM system.numbers LIMIT 3' | gunzip -
0
1
2
```

## 기본 데이터베이스 {#default-database}

`database` URL 매개변수 또는 `X-ClickHouse-Database` 헤더를 사용하여 기본 데이터베이스를 지정할 수 있습니다.

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

기본적으로 서버 설정에 등록된 데이터베이스가 기본 데이터베이스로 사용됩니다. 기본적으로 이는 `default`라는 데이터베이스입니다. 또는 테이블 이름 앞에 점을 사용하여 항상 데이터베이스를 지정할 수 있습니다.

## 인증 {#authentication}

사용자 이름과 비밀번호는 세 가지 방법 중 하나로 표시할 수 있습니다:

1. HTTP Basic Authentication을 사용합니다.

예시:

```bash
echo 'SELECT 1' | curl 'http://user:password@localhost:8123/' -d @-
```

2. `user` 및 `password` URL 매개변수에 포함합니다.

:::warning
이 방법은 사용하지 않는 것이 좋습니다. 매개변수가 웹 프록시에서 기록되고 브라우저에 캐시될 수 있습니다.
:::

예시:

```bash
echo 'SELECT 1' | curl 'http://localhost:8123/?user=user&password=password' -d @-
```

3. 'X-ClickHouse-User' 및 'X-ClickHouse-Key' 헤더를 사용합니다.

예시:

```bash
echo 'SELECT 1' | curl -H 'X-ClickHouse-User: user' -H 'X-ClickHouse-Key: password' 'http://localhost:8123/' -d @-
```

사용자 이름이 지정되지 않으면 `default` 이름이 사용됩니다. 비밀번호가 지정되지 않으면 빈 비밀번호가 사용됩니다.
단일 쿼리 또는 전체 설정 프로파일을 처리하기 위한 설정을 지정하기 위해 URL 매개변수를 사용할 수도 있습니다. 

예시:

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

자세한 정보는 다음을 참조하세요:
- [설정](/operations/settings/settings)
- [SET](/sql-reference/statements/set)

## HTTP 프로토콜에서 ClickHouse 세션 사용하기 {#using-clickhouse-sessions-in-the-http-protocol}

HTTP 프로토콜에서 ClickHouse 세션도 사용할 수 있습니다. 이를 위해 요청에 `session_id` `GET` 매개변수를 추가해야 합니다. 세션 ID로 어떤 문자열도 사용할 수 있습니다. 

기본적으로 세션은 60초의 비활성 상태 이후 종료됩니다. 이 대기 시간을 변경하려면 서버 구성에서 `default_session_timeout` 설정을 수정하거나 요청에 `session_timeout` `GET` 매개변수를 추가하세요. 

세션 상태를 확인하려면 `session_check=1` 매개변수를 사용하세요. 하나의 세션 내에서는 한 번에 하나의 쿼리만 실행될 수 있습니다.

쿼리 진행 상황에 대한 정보는 `X-ClickHouse-Progress` 응답 헤더에서 받을 수 있습니다. 이를 위해 [`send_progress_in_http_headers`](../operations/settings/settings.md#send_progress_in_http_headers)를 활성화하세요.

아래는 헤더 시퀀스의 예입니다:

```text
X-ClickHouse-Progress: {"read_rows":"261636","read_bytes":"2093088","total_rows_to_read":"1000000","elapsed_ns":"14050417","memory_usage":"22205975"}
X-ClickHouse-Progress: {"read_rows":"654090","read_bytes":"5232720","total_rows_to_read":"1000000","elapsed_ns":"27948667","memory_usage":"83400279"}
X-ClickHouse-Progress: {"read_rows":"1000000","read_bytes":"8000000","total_rows_to_read":"1000000","elapsed_ns":"38002417","memory_usage":"80715679"}
```

가능한 헤더 필드는 다음과 같습니다:

| 헤더 필드            | 설명                              |
|----------------------|----------------------------------|
| `read_rows`          | 읽은 행 수.                      |
| `read_bytes`         | 읽은 데이터의 바이트 양.       |
| `total_rows_to_read` | 읽어야 할 총 행 수.            |
| `written_rows`       | 쓴 행 수.                      |
| `written_bytes`      | 쓴 데이터의 바이트 양.        |
| `elapsed_ns`         | 쿼리 런타임(나노초 단위).     |
| `memory_usage`       | 쿼리에서 사용된 메모리(바이트). |

HTTP 연결이 끊겨도 실행 중인 요청은 자동으로 중지되지 않습니다. 파싱 및 데이터 포맷팅은 서버 측에서 수행되며, 네트워크 사용이 비효율적일 수 있습니다.

다음과 같은 선택적 매개변수가 존재합니다:

| 매개변수               | 설명                                   |
|------------------------|---------------------------------------|
| `query_id` (선택적)   | 쿼리 ID로 전달할 수 있습니다 (문자열). [`replace_running_query`](/operations/settings/settings#replace_running_query) |
| `quota_key` (선택적)  | 할당량 키로 전달할 수 있습니다 (문자열). ["할당량"](/operations/quotas) |

HTTP 인터페이스를 통해 쿼리를 위한 외부 데이터 (외부 임시 테이블)를 전달할 수 있습니다. 자세한 정보는 ["쿼리 처리용 외부 데이터"](/engines/table-engines/special/external-data)를 참조하세요.

## 응답 버퍼링 {#response-buffering}

응답 버퍼링은 서버 측에서 활성화할 수 있습니다. 이를 위한 URL 매개변수는 다음과 같습니다:
- `buffer_size`
- `wait_end_of_query`

다음 설정을 사용할 수 있습니다:
- [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size)
- [`http_wait_end_of_query`](/operations/settings/settings#http_wait_end_of_query)

`buffer_size`는 결과를 서버 메모리에 버퍼링할 바이트 수를 결정합니다. 결과 본문이 이 임계값보다 크면, 버퍼가 HTTP 채널로 기록되고 나머지 데이터는 직접 HTTP 채널로 전송됩니다.

전체 응답이 버퍼링되도록 하려면 `wait_end_of_query=1`로 설정하세요. 이 경우, 메모리에 저장되지 않은 데이터는 임시 서버 파일에 버퍼링됩니다.

예시:

```bash
curl -sS 'http://localhost:8123/?max_result_bytes=4000000&buffer_size=3000000&wait_end_of_query=1' -d 'SELECT toUInt8(number) FROM system.numbers LIMIT 9000000 FORMAT RowBinary'
```

:::tip
버퍼링을 사용하여 응답 코드와 HTTP 헤더가 클라이언트에 전송된 후 쿼리 처리 오류가 발생하는 상황을 피하세요. 이 경우 오류 메시지가 응답 본문의 끝에 기록되며, 클라이언트 측에서 오류를 감지할 수 있는 것은 파싱 단계에서만 가능합니다.
:::

## 쿼리 매개변수로 역할 설정 {#setting-role-with-query-parameters}

이 기능은 ClickHouse 24.4에서 추가되었습니다.

특정 시나리오에서는 문장을 실행하기 전에 부여된 역할을 먼저 설정해야 할 수도 있습니다.
그러나 `SET ROLE`과 문장을 함께 보낼 수는 없으며, 다중 문장은 허용되지 않습니다:

```bash
curl -sS "http://localhost:8123" --data-binary "SET ROLE my_role;SELECT * FROM my_table;"
```

위 명령은 오류를 발생시킵니다:

```sql
Code: 62. DB::Exception: Syntax error (Multi-statements are not allowed)
```

이 제한을 극복하려면 대신 `role` 쿼리 매개변수를 사용하세요:

```bash
curl -sS "http://localhost:8123?role=my_role" --data-binary "SELECT * FROM my_table;"
```

이는 문장 전 `SET ROLE my_role`을 실행하는 것과 같습니다.

추가로, 여러 `role` 쿼리 매개변수를 지정할 수도 있습니다:

```bash
curl -sS "http://localhost:8123?role=my_role&role=my_other_role" --data-binary "SELECT * FROM my_table;"
```

이 경우 `?role=my_role&role=my_other_role`는 문장 이전에 `SET ROLE my_role, my_other_role`을 실행하는 것과 유사하게 작동합니다.

## HTTP 응답 코드 주의사항 {#http_response_codes_caveats}

HTTP 프로토콜의 제한으로 인해 HTTP 200 응답 코드는 쿼리가 성공했다는 보장을 하지 않습니다.

여기 하나의 예가 있습니다:

```bash
curl -v -Ss "http://localhost:8123/?max_block_size=1&query=select+sleepEachRow(0.001),throwIf(number=2)from+numbers(5)"
*   Trying 127.0.0.1:8123...
...
< HTTP/1.1 200 OK
...
Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: while executing 'FUNCTION throwIf(equals(number, 2) :: 1) -> throwIf(equals(number, 2))
```

이러한 동작의 이유는 HTTP 프로토콜의 특성 때문입니다. HTTP 헤더는 먼저 HTTP 코드 200과 함께 전송되며, 그 다음 HTTP 본문이 전달되고, 오류는 본문에 일반 텍스트로 삽입됩니다.

이 동작은 `Native`, `TSV` 또는 `JSON`과 같은 형식에 관계없이 동일하며, 오류 메시지는 항상 응답 스트림의 중간에 표시됩니다.

이 문제를 완화하려면 `wait_end_of_query=1`을 활성화하세요 ([응답 버퍼링](#response-buffering)). 이 경우 HTTP 헤더의 전송이 전체 쿼리가 해결될 때까지 지연됩니다. 그러나 이는 문제를 완전히 해결하지 못합니다. 결과는 여전히 [`http_response_buffer_size`](/operations/settings/settings#http_response_buffer_size) 내에 있어야 하며, [`send_progress_in_http_headers`](/operations/settings/settings#send_progress_in_http_headers)와 같은 다른 설정이 헤더 지연에 간섭할 수 있습니다.

:::tip
모든 오류를 포착하는 유일한 방법은 요청 본문을 형식에 따라 파싱하기 전에 분석하는 것입니다.
:::

ClickHouse의 이러한 예외는 `http_write_exception_in_output_format=0` (기본값)일 때 어느 형식에서든 일관된 예외 형식을 가지고 있습니다 (예: `Native`, `TSV`, `JSON` 등). 이는 클라이언트 측에서 오류 메시지를 파싱하고 추출하기 쉽게 만듭니다.

```text
\r\n
__exception__\r\n
<TAG>\r\n
<error message>\r\n
<message_length> <TAG>\r\n
__exception__\r\n

```

여기서 `<TAG>`는 16바이트 랜덤 태그로, `X-ClickHouse-Exception-Tag` 응답 헤더에 전송된 동일한 태그입니다. `<error message>`는 실제 예외 메시지이며 (정확한 길이는 `<message_length>`에서 찾을 수 있음), 위에서 설명한 전체 예외 블록은 최대 16 KiB까지 가능합니다.

여기 `JSON` 형식의 예가 있습니다:

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

여기 비슷한 예이지만 `CSV` 형식입니다:

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

## 매개변수가 있는 쿼리 {#cli-queries-with-parameters}

매개변수가 있는 쿼리를 생성하고 해당 HTTP 요청 매개변수에서 값을 전달할 수 있습니다. 더 많은 정보는 [CLI를 위한 매개변수가 있는 쿼리](../interfaces/cli.md#cli-queries-with-parameters)에서 확인하세요.

### 예제 {#example-3}

```bash
$ curl -sS "<address>?param_id=2&param_phrase=test" -d "SELECT * FROM table WHERE int_column = {id:UInt8} and string_column = {phrase:String}"
```

### URL 매개변수의 탭 {#tabs-in-url-parameters}

쿼리 매개변수는 "이스케이프된" 형식에서 파싱됩니다. 이는 몇 가지 이점을 가지며, 예를 들어 null을 `\N`으로 명확하게 파싱할 수 있습니다. 이는 탭 문자가 `\t` (또는 `\`와 탭)로 인코딩되어야 함을 의미합니다. 예를 들어, 다음 문자열에는 `abc`와 `123` 사이에 실제 탭이 포함되어 있으며, 입력 문자열은 두 개의 값으로 분할됩니다:

```bash
curl -sS "http://localhost:8123" -d "SELECT splitByChar('\t', 'abc      123')"
```

```response
['abc','123']
```

그러나 URL 매개변수에서 `%09`를 사용하여 실제 탭을 인코딩하려고 하면 제대로 파싱되지 않습니다:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%09123" -d "SELECT splitByChar('\t', {arg1:String})"
Code: 457. DB::Exception: Value abc    123 cannot be parsed as String for query parameter 'arg1' because it isn't parsed completely: only 3 of 7 bytes was parsed: abc. (BAD_QUERY_PARAMETER) (version 23.4.1.869 (official build))
```

URL 매개변수를 사용하고 있다면 `\t`를 `%5C%09`로 인코딩해야 합니다. 예를 들어:

```bash
curl -sS "http://localhost:8123?param_arg1=abc%5C%09123" -d "SELECT splitByChar('\t', {arg1:String})"
```

```response
['abc','123']
```

## 미리 정의된 HTTP 인터페이스 {#predefined_http_interface}

ClickHouse는 HTTP 인터페이스를 통해 특정 쿼리를 지원합니다. 예를 들어, 다음과 같이 테이블에 데이터를 쓸 수 있습니다:

```bash
$ echo '(4),(5),(6)' | curl 'http://localhost:8123/?query=INSERT%20INTO%20t%20VALUES' --data-binary @-
```

ClickHouse는 또한 [Prometheus exporter](https://github.com/ClickHouse/clickhouse_exporter)와 같은 타사 도구와 통합할 수 있도록 더 쉽게 도와주는 미리 정의된 HTTP 인터페이스를 지원합니다. 예제를 살펴보겠습니다.

먼저, 이 섹션을 서버 구성 파일에 추가하세요.

`http_handlers`는 여러 `rule`을 포함하도록 구성됩니다. ClickHouse는 수신된 HTTP 요청을 미리 정의된 `rule` 유형과 일치시킵니다. 일치하는 첫 번째 규칙이 핸들러를 실행합니다. 그런 다음 ClickHouse는 일치가 성공하면 해당 미리 정의된 쿼리를 실행합니다.

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

이제 Prometheus 형식으로 데이터를 요청하기 위해 URL에 직접 요청할 수 있습니다:

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

`http_handlers`의 구성 옵션은 다음과 같습니다.

`rule`을 사용하면 다음 매개변수를 구성할 수 있습니다:
- `method`
- `headers`
- `url`
- `full_url`
- `handler`

각각 아래에서 논의됩니다:

- `method`는 HTTP 요청의 메서드 부분을 일치시키는 역할을 합니다. `method`는 HTTP 프로토콜에서 [`method`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)의 정의를 완전히 준수합니다. 선택적 구성입니다. 구성 파일에 정의되지 않은 경우 HTTP 요청의 메서드 부분과 일치하지 않습니다.

- `url`은 HTTP 요청의 URL 부분(경로 및 쿼리 문자열)을 일치시키는 역할을 합니다.
  `url`이 `regex:`로 접두사가 붙으면 [RE2](https://github.com/google/re2)의 정규식을 기대합니다.
  선택적 구성입니다. 구성 파일에 정의되지 않은 경우 HTTP 요청의 URL 부분과 일치하지 않습니다.

- `full_url`은 `url`과 동일하지만 전체 URL을 포함합니다. 즉, `schema://host:port/path?query_string`입니다.
  Note, ClickHouse는 "가상 호스트"를 지원하지 않으므로 `host`는 IP 주소입니다 (헤더의 `Host` 값이 아님).

- `empty_query_string` - 요청에 쿼리 문자열(`?query_string`)이 없음을 보장합니다.

- `headers`는 HTTP 요청의 헤더 부분과 일치시키는 역할을 합니다. RE2의 정규식과 호환됩니다. 선택적 구성입니다. 구성 파일에 정의되지 않은 경우 HTTP 요청의 헤더 부분과 일치하지 않습니다.

- `handler`는 주 처리 부분을 포함합니다.

  다음과 같은 `type`을 가질 수 있습니다:
  - [`predefined_query_handler`](#predefined_query_handler)
  - [`dynamic_query_handler`](#dynamic_query_handler)
  - [`static`](#static)
  - [`redirect`](#redirect)

  다음과 같은 매개변수를 가질 수 있습니다:
  - `query` — `predefined_query_handler` 유형과 함께 사용할 때, 핸들러가 호출될 때 쿼리를 실행합니다.
  - `query_param_name` — `dynamic_query_handler` 유형과 함께 사용할 때, HTTP 요청 매개변수에서 `query_param_name` 값에 해당하는 값을 추출하고 실행합니다.
  - `status` — `static` 유형과 함께 사용할 때, 응답 상태 코드.
  - `content_type` — 모든 유형과 함께 사용할 때, 응답 [content-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type).
  - `http_response_headers` — 모든 유형과 함께 사용할 때, 응답 헤더 맵. 콘텐츠 유형을 설정하는 데 사용할 수 있습니다.
  - `response_content` — `static` 유형과 함께 사용할 때, 클라이언트에 전송된 응답 콘텐츠. 'file://' 또는 'config://' 접두사를 사용할 경우, 파일 또는 구성에서 콘텐츠를 찾아 클라이언트에 전송합니다.
  - `user` - 쿼리를 실행할 사용자 (기본 사용자는 `default`입니다).
    **노트**, 이 사용자의 비밀번호를 지정할 필요는 없습니다.

각기 다른 `type`에 대한 구성 방법이 다음에서 논의됩니다.

### predefined_query_handler {#predefined_query_handler}

`predefined_query_handler`는 `Settings` 및 `query_params` 값을 설정할 수 있도록 지원합니다. `predefined_query_handler` 유형에서 `query`를 구성할 수 있습니다.

`query` 값은 HTTP 요청이 일치할 때 ClickHouse가 실행하는 `predefined_query_handler`의 미리 정의된 쿼리입니다. 이는 필수 구성입니다.

다음 예제는 [`max_threads`](../operations/settings/settings.md#max_threads) 및 [`max_final_threads`](/operations/settings/settings#max_final_threads) 설정의 값을 정의한 다음, 이 설정이 성공적으로 설정되었는지 확인하기 위해 시스템 테이블을 쿼리합니다.

:::note
`query`, `play`, `ping`과 같은 기본 `handlers`를 유지하려면 `<defaults/>` 규칙을 추가하세요.
:::

예시:

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

:::note
하나의 `predefined_query_handler`에서 지원되는 `query`는 단 하나만 있습니다.
:::

### dynamic_query_handler {#dynamic_query_handler}

`dynamic_query_handler`에서는 쿼리가 HTTP 요청의 매개변수 형태로 작성됩니다. `predefined_query_handler`와의 차이점은 쿼리가 구성 파일에 작성되어 있다는 점입니다. `query_param_name`은 `dynamic_query_handler`에서 구성할 수 있습니다.

ClickHouse는 HTTP 요청의 URL에서 `query_param_name` 값에 해당하는 값을 추출하고 실행합니다. `query_param_name`의 기본 값은 `/query`입니다. 선택적 구성입니다. 구성 파일에 정의되어 있지 않으면 매개변수가 전달되지 않습니다.

이 기능을 실험하기 위해 다음 예제는 [`max_threads`](../operations/settings/settings.md#max_threads) 및 `max_final_threads`의 값을 정의한 다음, 이 설정이 성공적으로 설정되었는지 쿼리합니다.

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

### static {#static}

`static`은 [`content_type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), [status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 및 `response_content`를 반환할 수 있습니다. `response_content`는 지정된 콘텐츠를 반환할 수 있습니다.

예를 들어, "Say Hi!"라는 메시지를 반환하려면:

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

`http_response_headers`는 `content_type` 대신 콘텐츠 유형을 설정하는 데 사용할 수 있습니다.

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

구성에서 클라이언트로 보낼 콘텐츠를 찾아보세요.

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

클라이언트에 보낼 파일에서 콘텐츠를 찾으려면:

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

### redirect {#redirect}

`redirect`는 `location`으로 `302` 리디렉션을 수행합니다.

예를 들어, ClickHouse play를 위해 사용자 설정을 자동으로 추가하는 방법은 다음과 같습니다:

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

## HTTP 응답 헤더 {#http-response-headers}

ClickHouse는 구성할 수 있는 모든 종류의 핸들러에 적용할 수 있는 사용자 정의 HTTP 응답 헤더를 구성할 수 있도록 지원합니다. 이 헤더는 키-값 쌍을 통해 헤더 이름과 해당 값으로 설정할 수 있는 `http_response_headers` 설정을 사용하여 설정할 수 있습니다. 이 기능은 사용자 정의 보안 헤더, CORS 정책 또는 ClickHouse HTTP 인터페이스에 걸쳐 필요한 기타 HTTP 헤더를 구현하는 데 특히 유용합니다.

예를 들어, 다음에 대한 헤더를 구성할 수 있습니다:
- 일반 쿼리 엔드포인트
- 웹 UI
- 헬스 체크.

`common_http_response_headers`를 지정하는 것도 가능합니다. 이 헤더는 구성에서 정의된 모든 http 핸들러에 적용됩니다.

헤더는 구성된 모든 핸들러에 대해 HTTP 응답에 포함됩니다.

아래의 예에서, 모든 서버 응답은 두 개의 사용자 정의 헤더인 `X-My-Common-Header`와 `X-My-Custom-Header`를 포함하게 됩니다.

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

## HTTP 스트리밍 중 예외 발생 시 유효한 JSON/XML 응답 {#valid-output-on-exception-http-streaming}

HTTP를 통한 쿼리 실행 중에는 데이터의 일부가 이미 전송된 경우 예외가 발생할 수 있습니다. 일반적으로 예외는 클라이언트에게 일반 텍스트로 전송됩니다.
특정 데이터 형식을 사용하여 데이터를 출력하였더라도 출력이 지정된 데이터 형식 관점에서 유효하지 않게 될 수 있습니다.
이를 방지하려면 [`http_write_exception_in_output_format`](/operations/settings/settings#http_write_exception_in_output_format) 설정(기본적으로 비활성화됨)을 사용하여 ClickHouse에게 지정된 형식으로 예외를 기록하도록 지시하세요 (현재 XML 및 JSON 형식에서 지원됨).

예시들:

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
