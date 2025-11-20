---
'slug': '/native-protocol/server'
'sidebar_position': 3
'title': '서버 패킷'
'description': '네이티브 프로토콜 서버'
'doc_type': 'reference'
'keywords':
- 'native protocol'
- 'tcp protocol'
- 'client-server'
- 'protocol specification'
- 'networking'
---


# 서버 패킷

| 값   | 이름                               | 설명                                                         |
|------|------------------------------------|-------------------------------------------------------------|
| 0    | [Hello](#hello)                    | 서버 핸드셰이크 응답                                       |
| 1    | Data                               | [클라이언트 데이터](./client.md#data)와 동일                 |
| 2    | [Exception](#exception)            | 쿼리 처리 예외                                            |
| 3    | [Progress](#progress)              | 쿼리 진행 상황                                            |
| 4    | [Pong](#pong)                      | 핑 응답                                                   |
| 5    | [EndOfStream](#end-of-stream)      | 모든 패킷이 전송됨                                        |
| 6    | [ProfileInfo](#profile-info)       | 프로파일링 데이터                                        |
| 7    | Totals                             | 총 값                                                     |
| 8    | Extremes                           | 극단적 값 (최소, 최대)                                    |
| 9    | TablesStatusResponse               | TableStatus 요청에 대한 응답                             |
| 10   | [Log](#log)                        | 쿼리 시스템 로그                                         |
| 11   | TableColumns                       | 컬럼 설명                                               |
| 12   | UUIDs                              | 고유 파트 ID 목록                                        |
| 13   | ReadTaskRequest                    | 다음 작업이 필요한 요청을 설명하는 문자열 (UUID)       |
| 14   | [ProfileEvents](#profile-events)   | 서버에서의 프로파일 이벤트 패킷                          |

`Data`, `Totals`, `Extremes` 는 압축될 수 있습니다.

## Hello {#hello}

[클라이언트 헬로우](./client.md#hello)에 대한 응답입니다.

| 필드           | 타입     | 값                | 설명                  |
|----------------|----------|------------------|-----------------------|
| name           | 문자열   | `Clickhouse`     | 서버 이름             |
| version_major  | UVarInt  | `21`             | 서버 주요 버전       |
| version_minor  | UVarInt  | `12`             | 서버 부가 버전       |
| revision       | UVarInt  | `54452`          | 서버 수정 버전       |
| tz             | 문자열   | `Europe/Moscow`  | 서버 시간대          |
| display_name   | 문자열   | `Clickhouse`     | UI용 서버 이름       |
| version_patch  | UVarInt  | `3`              | 서버 패치 버전       |

## Exception {#exception}

쿼리 처리 중 서버 예외입니다.

| 필드         | 타입    | 값                                      | 설명                            |
|--------------|---------|----------------------------------------|---------------------------------|
| code         | Int32   | `60`                                   | [ErrorCodes.cpp][codes] 참조. |
| name         | 문자열   | `DB::Exception`                        | 서버 주요 버전                 |
| message      | 문자열   | `DB::Exception: Table X doesn't exist` | 서버 부가 버전                 |
| stack_trace  | 문자열   | ~                                      | C++ 스택 추적                  |
| nested       | Bool    | `true`                                 | 더 많은 오류                   |

`nested`가 `false`가 될 때까지 예외의 연속 목록이 될 수 있습니다.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "오류 코드 목록"

## Progress {#progress}

서버에 의해 주기적으로 보고된 쿼리 실행 진행 상태입니다.

:::tip
진행 상황은 **delta**로 보고됩니다. 총계는 클라이언트에서 축적하십시오.
:::

| 필드          | 타입     | 값      | 설명                |
|---------------|----------|----------|---------------------|
| rows          | UVarInt  | `65535`  | 행 수              |
| bytes         | UVarInt  | `871799` | 바이트 수           |
| total_rows    | UVarInt  | `0`      | 총 행               |
| wrote_rows    | UVarInt  | `0`      | 클라이언트에서의 행 |
| wrote_bytes   | UVarInt  | `0`      | 클라이언트에서의 바이트 |

## Pong {#pong}

[클라이언트 핑](./client.md#ping)에 대한 응답, 패킷 본문 없음.

## 스트림 종료 {#end-of-stream}

더 이상 **Data** 패킷이 전송되지 않으며, 쿼리 결과가 서버에서 클라이언트로 완전히 스트리밍됩니다.

패킷 본문 없음.

## 프로파일 정보 {#profile-info}

| 필드                        | 타입     |
|------------------------------|----------|
| rows                         | UVarInt  |
| blocks                       | UVarInt  |
| bytes                        | UVarInt  |
| applied_limit                | Bool     |
| rows_before_limit            | UVarInt  |
| calculated_rows_before_limit | Bool     |

## 로그 {#log}

서버 로그와 함께하는 **데이터 블록**입니다.

:::tip
**데이터 블록**의 열로 인코딩되지만 결코 압축되지 않습니다.
:::

| 열         | 타입     |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | 문자열   |
| query_id   | 문자열   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | 문자열   |
| text       | 문자열   |

## 프로파일 이벤트 {#profile-events}

프로파일 이벤트와 함께하는 **데이터 블록**입니다.

:::tip
**데이터 블록**의 열로 인코딩되지만 결코 압축되지 않습니다.

`value` 유형은 서버 수정에 따라 `UInt64` 또는 `Int64`입니다.
:::

| 열            | 타입             |
|---------------|------------------|
| host_name     | 문자열           |
| current_time  | DateTime         |
| thread_id     | UInt64           |
| type          | Int8             |
| name          | 문자열           |
| value         | UInt64 또는 Int64 |
