---
description: 'ClickHouse에서 Apache Arrow Flight 인터페이스를 설명하는 문서로, Flight SQL 클라이언트가 ClickHouse에 연결할 수 있도록 합니다'
sidebar_label: 'Arrow Flight 인터페이스'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight 인터페이스'
doc_type: 'reference'
---

# Apache Arrow Flight 인터페이스 \{#apache-arrow-flight-interface\}

## 개요 \{#overview\}

ClickHouse는 [gRPC](https://grpc.io/)를 통해 [Arrow IPC](https://arrow.apache.org/docs/format/Columnar.html#serialization-and-interprocess-communication-ipc) 형식을 사용해 열 지향 데이터를 효율적으로 전송할 수 있는 고성능 RPC 프레임워크인 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 프로토콜을 지원합니다.

이 구현에는 [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) 지원도 포함되어 있어, Flight SQL 프로토콜을 사용하는 BI 도구와 애플리케이션이 ClickHouse를 직접 쿼리할 수 있습니다.

주요 기능:

* SQL 쿼리를 실행하고 결과를 Apache Arrow 형식으로 가져옵니다.
* Arrow 형식을 사용하여 테이블에 데이터를 삽입합니다.
* Flight SQL 명령어를 통해 메타데이터(카탈로그, schema, 테이블, 기본 키)를 쿼리합니다.
* Flight SQL 작업을 통해 세션과 설정을 관리합니다.
* TLS 암호화 및 사용자 이름/비밀번호 인증.
* `PollFlightInfo`를 통한 점진적 결과 조회.
* `CancelFlightInfo`를 통한 쿼리 취소.

## Arrow Flight 서버 활성화 \{#enabling-server\}

Arrow Flight 서버를 활성화하려면 ClickHouse 서버 구성에 `arrowflight_port` 설정을 추가하세요:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
</clickhouse>
```

시작되면 인터페이스가 활성 상태임을 확인하는 로그 메시지가 출력됩니다:

```text
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9090
```

## TLS 설정 \{#tls-configuration\}

Arrow Flight 인터페이스에서 TLS를 사용하려면 다음과 같이 설정하십시오:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
    <arrowflight>
        <enable_ssl>true</enable_ssl>
        <ssl_cert_file>/path/to/server-cert.pem</ssl_cert_file>
        <ssl_key_file>/path/to/server-key.pem</ssl_key_file>
    </arrowflight>
</clickhouse>
```

TLS가 활성화된 경우, 클라이언트는 `grpc://` 대신 `grpc+tls://` 스키마로 연결해야 합니다.

## 인증 \{#authentication\}

Arrow Flight 인터페이스는 다음 두 가지 인증 방식을 지원합니다:

### 기본 인증 \{#basic-auth\}

클라이언트는 표준 HTTP `Authorization: Basic` 헤더를 사용해 사용자 이름과 비밀번호로 인증합니다. 인증에 성공하면 서버는 응답 헤더에 Bearer 토큰을 반환합니다.

### Bearer 토큰 인증 \{#bearer-auth\}

이후 요청에서는 `Authorization: Bearer <token>` 헤더를 사용해 Basic 인증에서 반환된 Bearer 토큰을 사용할 수 있습니다. 토큰은 사용할 때마다 자동으로 갱신되며, `default_session_timeout` 서버 설정에 따라 만료됩니다(기본값: 60초).

### Python 예시 \{#auth-python-example\}

```python
import pyarrow.flight as flight

client = flight.FlightClient("grpc://localhost:9090")

# Basic auth returns a bearer token for subsequent calls
token_pair = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token_pair])
```

TLS 사용 시:

```python
import pyarrow.flight as flight

with open("ca-cert.pem", "rb") as f:
    tls_root_certs = f.read()

client = flight.FlightClient(
    "grpc+tls://localhost:9090",
    tls_root_certs=tls_root_certs,
)

token_pair = client.authenticate_basic_token("default", "password")
options = flight.FlightCallOptions(headers=[token_pair])
```

## 세션 관리 \{#session-management\}

Arrow Flight 인터페이스는 사용자 지정 gRPC 메타데이터 헤더를 통해 ClickHouse 세션을 지원합니다.

| Header                         | Description                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `x-clickhouse-session-id`      | 세션 식별자입니다. 이 값이 제공되면 여러 요청이 동일한 세션 상태(임시 테이블, 설정)를 공유합니다.                                  |
| `x-clickhouse-session-timeout` | 초 단위 세션 타임아웃입니다. `max_session_timeout`을 초과할 수 없습니다.                                        |
| `x-clickhouse-session-check`   | 세션을 생성하지 않고 세션이 존재하는지 확인하려면 `1`로 설정합니다.                                                    |
| `x-clickhouse-session-close`   | 요청이 완료된 후 세션을 닫으려면 `1`로 설정합니다. 서버 구성에서 `enable_arrow_close_session`이 `true`로 설정되어 있어야 합니다. |

:::note
Arrow Flight는 HTTP/2 기반 gRPC를 사용하므로 메타데이터 헤더 이름은 대소문자를 구분하며, 아래에 표시된 것처럼 정확히 소문자로 지정해야 합니다(예: `X-ClickHouse-Session-Id`가 아니라 `x-clickhouse-session-id`). 이는 HTTP/2 필드 이름에 소문자만 포함되어야 한다고 규정하는 [RFC 9113, Section 8.2](https://www.rfc-editor.org/rfc/rfc9113#section-8.2) 요구 사항 때문입니다. 이는 헤더 이름이 대소문자를 구분하지 않는 HTTP/1.1과 다릅니다.
:::

세션을 사용하면 `SetSessionOptions` 작업을 통해 ClickHouse 설정을 지속적으로 적용할 수 있습니다([DoAction](#doaction) 참조).

## 서버 구성 참조 \{#configuration-reference\}

| 설정                                                            | 기본값     | 설명                                                                        |
| ------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `arrowflight_port`                                            | —       | Arrow Flight 서버에 사용할 포트입니다. 이 설정을 지정한 경우에만 서버가 시작됩니다.                     |
| `arrowflight.enable_ssl`                                      | `false` | TLS 암호화를 활성화합니다.                                                          |
| `arrowflight.ssl_cert_file`                                   | —       | TLS 인증서 파일 경로입니다. TLS가 활성화된 경우 필요합니다.                                     |
| `arrowflight.ssl_key_file`                                    | —       | TLS 개인 키 파일 경로입니다. TLS가 활성화된 경우 필요합니다.                                    |
| `arrowflight.tickets_lifetime_seconds`                        | `600`   | Flight 티켓이 만료되어 정리되기까지의 시간(초)입니다. 자동 티켓 만료를 비활성화하려면 `0`으로 설정하십시오. |
| `arrowflight.cancel_ticket_after_do_get`                      | `false` | `true`이면 `DoGet`이 티켓을 소비한 직후 티켓이 취소되어 메모리가 해제됩니다.                 |
| `arrowflight.poll_descriptors_lifetime_seconds`               | `600`   | poll descriptor가 만료되기까지의 시간(초)입니다. 자동 만료를 비활성화하려면 `0`으로 설정하십시오.           |
| `arrowflight.cancel_flight_descriptor_after_poll_flight_info` | `false` | `true`이면 `PollFlightInfo`가 poll descriptor를 소비한 후 해당 descriptor가 취소됩니다.   |
| `enable_arrow_close_session`                                  | `true`  | 클라이언트가 `x-clickhouse-session-close` 헤더를 통해 세션을 종료할 수 있도록 허용합니다.           |
| `default_session_timeout`                                     | `60`    | 기본 세션 타임아웃(초)입니다. Bearer 토큰 만료도 함께 제어합니다.                                 |
| `max_session_timeout`                                         | `3600`  | 허용되는 최대 세션 타임아웃(초)입니다.                                                    |

## 지원되는 RPC 메서드 \{#rpc-methods\}

### GetFlightInfo \{#getflightinfo\}

쿼리를 실행하고 결과 schema, 데이터 검색용 티켓이 포함된 엔드포인트, 행 수, 바이트 수가 담긴 `FlightInfo`를 반환합니다.

다음 중 하나인 `FlightDescriptor`를 받습니다.

* **PATH 디스크립터**: 테이블 이름으로 해석되는 단일 구성 요소 경로입니다. `SELECT * FROM <table>`를 생성합니다.
* **CMD 디스크립터**: raw SQL 쿼리 문자열이거나 직렬화된 Flight SQL protobuf 명령어입니다([Flight SQL 명령어](#flight-sql-commands) 참조).

쿼리는 완전히 실행되며, 결과는 서버 측 티켓에 저장됩니다. 각 데이터 block은 별도의 엔드포인트/티켓을 생성하므로 클라이언트가 데이터를 병렬로 가져올 수 있습니다.

```python
# Query by table name
descriptor = flight.FlightDescriptor.for_path("my_table")
info = client.get_flight_info(descriptor, options)

# Query by SQL
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM my_table WHERE id > 100"
)
info = client.get_flight_info(descriptor, options)

# Retrieve results
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

### PollFlightInfo \{#pollflightinfo\}

장시간 실행되는 쿼리의 결과를 점진적으로 가져올 수 있도록 합니다. 전체 쿼리가 완료될 때까지 기다리는 대신(`GetFlightInfo`의 방식), `PollFlightInfo`는 결과를 블록 단위로 반환합니다.

첫 번째 호출에서 쿼리 실행이 시작됩니다. 응답에는 다음이 포함됩니다.

* 현재까지 사용 가능한 데이터 블록에 대한 엔드포인트가 포함된 `FlightInfo`
* 다음 폴링에 사용할 `FlightDescriptor`(추가 결과가 예상되는 경우)

반환된 디스크립터를 사용한 후속 호출에서는 추가 블록을 가져옵니다. 더 이상 사용 가능한 데이터가 없으면 응답에 다음 디스크립터가 포함되지 않습니다.

:::note
현재 구현은 데이터 블록을 사용할 수 있을 때까지 대기하며, 데이터 없이 즉시 반환하지는 않습니다.
:::

### GetSchema \{#getschema\}

전체 쿼리를 실행하지 않고도 쿼리 결과의 Arrow schema를 반환합니다. `GetFlightInfo`와 동일한 디스크립터 타입을 받습니다.

```python
descriptor = flight.FlightDescriptor.for_command(
    "SELECT 1 AS x, 'hello' AS y"
)
schema_result = client.get_schema(descriptor, options)
schema = schema_result.schema
print(schema)  # x: int32, y: string
```

### DoGet \{#doget\}

지정된 티켓에 대한 데이터를 가져옵니다. 다음 중 하나를 사용할 수 있습니다:

* `GetFlightInfo` 또는 `PollFlightInfo`에서 반환된 티켓
* 티켓 값으로 사용하는 Raw SQL 쿼리 문자열

```python
# Using a ticket from GetFlightInfo
reader = client.do_get(endpoint.ticket, options)
table = reader.read_all()

# Using a raw SQL query as ticket
ticket = flight.Ticket("SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket, options)
table = reader.read_all()
```

### DoPut \{#doput\}

ClickHouse로 데이터를 전송합니다. `FlightDescriptor`와 Arrow 레코드 배치 스트림을 받습니다.

**테이블 이름으로 삽입** (PATH 디스크립터):

```python
schema = pa.schema([("id", pa.int64()), ("name", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3]), pa.array(["Alice", "Bob", "Charlie"])],
    schema=schema,
)

descriptor = flight.FlightDescriptor.for_path("my_table")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**SQL을 사용한 삽입** (CMD 디스크립터):

```python
descriptor = flight.FlightDescriptor.for_command(
    "INSERT INTO my_table FORMAT Arrow"
)
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**Flight SQL `CommandStatementUpdate`를 사용한 DDL/DML 실행:**

Flight SQL 클라이언트는 DDL/DML SQL 문(CREATE, INSERT, ALTER 등)을 실행할 때 `CommandStatementUpdate`를 사용합니다. 응답에는 영향을 받은 행 수가 포함됩니다.

**Flight SQL `CommandStatementIngest`를 사용한 대량 수집:**

기존 테이블에 행을 추가하는 방식만 지원됩니다(`TABLE_NOT_EXIST_OPTION_FAIL` + `TABLE_EXISTS_OPTION_APPEND`). 이 명령어는 카탈로그와 임시 테이블을 지원하지 않습니다.

:::note
데이터 전송에는 `Arrow` 형식만 허용됩니다. SQL에서 다른 형식(예: `FORMAT JSON`)을 지정하면 오류가 발생합니다.
:::

### DoAction \{#doaction\}

지정된 작업을 실행합니다. 다음 작업을 지원합니다:

#### CancelFlightInfo \{#cancelflightinfo\}

`FlightInfo`와 연결된 실행 중인 쿼리를 취소합니다. 쿼리 ID는 `FlightInfo`의 `app_metadata` 필드에서 추출됩니다. 또한 해당 쿼리와 연결된 모든 폴링 디스크립터도 취소합니다.

```python
# Start a long-running query via PollFlightInfo, then cancel it
cancel_request = flight.CancelFlightInfoRequest(info)
result = client.cancel_flight_info(cancel_request, options)
# result.status is CancelStatus.CANCELLED if successful
```

#### SetSessionOptions \{#setsessionoptions\}

현재 세션에 대한 ClickHouse 서버 설정을 지정합니다. `x-clickhouse-session-id` header를 통해 세션 ID가 설정되어 있어야 합니다.

지원되는 값 타입: string, boolean, integer, double 및 string list입니다.

설정 이름이 올바르지 않으면 `INVALID_NAME` 오류가 반환됩니다. 값을 파싱할 수 없으면 `INVALID_VALUE` 오류가 반환됩니다.

#### GetSessionOptions \{#getsessionoptions\}

현재 세션의 모든 ClickHouse 설정과 해당 값을 반환합니다. 설정 이름과 문자열 값을 매핑한 맵을 반환합니다(내부적으로 `system.settings`를 쿼리합니다).

## Flight SQL 명령어 \{#flight-sql-commands\}

`CMD` 디스크립터에 직렬화된 [Flight SQL protobuf](https://arrow.apache.org/docs/format/FlightSql.html) 메시지가 포함되어 있으면 ClickHouse는 다음 명령어를 처리합니다:

### GetFlightInfo / GetSchema를 통해 지원됨 \{#flightsql-getflightinfo\}

| Command                 | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `CommandStatementQuery` | 임의의 SQL 쿼리를 실행합니다.                                                      |
| `CommandGetSqlInfo`     | 서버 메타데이터(이름, 버전, Arrow 버전, 기능)를 조회합니다.                                  |
| `CommandGetCatalogs`    | 카탈로그 목록을 반환합니다. 빈 결과를 반환합니다(ClickHouse는 카탈로그를 사용하지 않습니다).         |
| `CommandGetDbSchemas`   | 데이터베이스 목록을 반환합니다. 선택적 `db_schema_filter_pattern`(SQL `LIKE` 패턴)을 지원합니다. |
| `CommandGetTables`      | 테이블 목록을 반환합니다. schema, 테이블 이름, 테이블 타입 및 선택적 schema 포함에 대한 필터를 지원합니다.    |
| `CommandGetTableTypes`  | 테이블 엔진 타입 목록을 반환합니다(`system.table_engines` 기준).                         |
| `CommandGetPrimaryKeys` | 지정한 테이블의 기본 키 컬럼을 조회합니다.                                                |

### DoPut으로 지원 \{#flightsql-doput\}

| 명령어                      | 설명                                                            |
| ------------------------ | ------------------------------------------------------------- |
| `CommandStatementUpdate` | DDL/DML 문(CREATE, INSERT, ALTER 등)을 실행합니다. 영향을 받은 행 수를 반환합니다. |
| `CommandStatementIngest` | 기존 테이블에 Arrow 데이터를 대량으로 삽입합니다. 추가(append) 모드만 지원됩니다.          |

### 아직 구현되지 않음 \{#flightsql-not-implemented\}

| 명령어                              | 상태                           |
| -------------------------------- | ---------------------------- |
| `CommandGetCrossReference`       | 구현되지 않음                      |
| `CommandGetExportedKeys`         | 구현되지 않음                      |
| `CommandGetImportedKeys`         | 구현되지 않음                      |
| `CommandStatementSubstraitPlan`  | 지원되지 않음 (Substrait는 지원되지 않음) |
| `CommandPreparedStatementQuery`  | 구현되지 않음                      |
| `CommandPreparedStatementUpdate` | 구현되지 않음                      |

## 전체 예시 \{#complete-example\}

```python
import pyarrow as pa
import pyarrow.flight as flight

# Connect and authenticate
client = flight.FlightClient("grpc://localhost:9090")
token = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token])

# Insert data using DoPut with a PATH descriptor
schema = pa.schema([("id", pa.uint32()), ("value", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3], type=pa.uint32()), pa.array(["a", "b", "c"])],
    schema=schema,
)
descriptor = flight.FlightDescriptor.for_path("test")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()

# Query data using GetFlightInfo + DoGet
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM test ORDER BY id"
)
info = client.get_flight_info(descriptor, options)
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

출력:

```text
   id value
0   1     a
1   2     b
2   3     c
```

## 데이터 형식 \{#data-format\}

모든 데이터는 Apache Arrow IPC 형식으로 전송됩니다. `Arrow` 형식만 지원되며, 다른 ClickHouse 형식(예: `FORMAT JSON`, `FORMAT CSV`)을 지정하면 오류가 발생합니다.

직렬화 중 ClickHouse 데이터 타입은 Arrow 타입에 매핑됩니다. `output_format_arrow_unsupported_types_as_binary` 설정은 지원되지 않는 ClickHouse 타입을 바이너리 blob으로 직렬화할지 여부를 제어합니다.

## 호환성 \{#compatibility\}

Arrow Flight 인터페이스는 다음을 포함해 Arrow Flight 또는 Arrow Flight SQL 프로토콜을 지원하는 모든 클라이언트 또는 도구와 호환됩니다.

* Python (`pyarrow`)
* Java (`org.apache.arrow.flight`)
* C++ (`arrow::flight`)
* Go (`apache/arrow/go`)
* ADBC (Arrow Database Connectivity) 드라이버
* DBeaver 및 Flight SQL을 지원하는 기타 도구

사용 중인 도구에 네이티브 ClickHouse 커넥터(예: JDBC, ODBC, 네이티브 프로토콜)가 있다면, 성능 또는 형식 호환성 때문에 Arrow Flight가 특별히 필요한 경우가 아니라면 해당 커넥터를 우선 사용하는 것이 좋습니다.

## 클라이언트 측 ArrowFlight 기능 \{#client-side\}

ClickHouse는 Flight 클라이언트로도 작동하여 외부 Arrow Flight 서버에서 데이터를 읽을 수 있습니다. 다음을 참조하십시오:

* [ArrowFlight 테이블 엔진](/engines/table-engines/integrations/arrowflight)
* [arrowFlight 테이블 함수](/sql-reference/table-functions/arrowflight)

## 관련 항목 \{#see-also\}

* [Apache Arrow Flight 사양](https://arrow.apache.org/docs/format/Flight.html)
* [Apache Arrow Flight SQL 사양](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse의 Arrow 형식](/interfaces/formats/Arrow)