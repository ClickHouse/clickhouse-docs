---
slug: /native-protocol/server
sidebar_position: 3
title: '서버 패킷'
description: '네이티브 프로토콜 서버'
doc_type: 'reference'
keywords: ['네이티브 프로토콜', 'TCP 프로토콜', '클라이언트-서버', '프로토콜 명세', '네트워킹']
---



# 서버 패킷 \{#server-packets\}

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | 서버 핸드셰이크 응답                                            |
| 1     | Data                             | [클라이언트 데이터](./client.md#data)와 동일                     |
| 2     | [Exception](#exception)          | 쿼리 처리 예외                                                  |
| 3     | [Progress](#progress)            | 쿼리 진행 상황                                                  |
| 4     | [Pong](#pong)                    | Ping 요청에 대한 응답                                           |
| 5     | [EndOfStream](#end-of-stream)    | 모든 패킷이 전송됨                                              |
| 6     | [ProfileInfo](#profile-info)     | 프로파일링 데이터                                               |
| 7     | Totals                           | 총계 값                                                         |
| 8     | Extremes                         | 극단값(최솟값, 최댓값)                                          |
| 9     | TablesStatusResponse             | TableStatus 요청에 대한 응답                                    |
| 10    | [Log](#log)                      | 쿼리 시스템 로그                                                |
| 11    | TableColumns                     | 컬럼에 대한 설명                                                |
| 12    | UUIDs                            | 고유한 파트 ID 목록                                             |
| 13    | ReadTaskRequest                  | 다음 태스크가 필요한 요청을 설명하는 문자열(UUID)              |
| 14    | [ProfileEvents](#profile-events) | 서버의 프로파일 이벤트가 담긴 패킷                              |

`Data`, `Totals`, `Extremes` 패킷은 압축될 수 있습니다.



## Hello \{#hello\}

[client hello](./client.md#hello)에 대한 응답입니다.

| field         | type    | value           | description          |
|---------------|---------|-----------------|----------------------|
| name          | String  | `Clickhouse`    | 서버 이름            |
| version_major | UVarInt | `21`            | 서버 주 버전         |
| version_minor | UVarInt | `12`            | 서버 부 버전         |
| revision      | UVarInt | `54452`         | 서버 리비전          |
| tz            | String  | `Europe/Moscow` | 서버 시간대          |
| display_name  | String  | `Clickhouse`    | UI용 서버 이름       |
| version_patch | UVarInt | `3`             | 서버 패치 버전       |



## Exception \{#exception\}

쿼리 처리 중 서버 예외가 발생했습니다.

| field       | type   | value                                  | description                  |
|-------------|--------|----------------------------------------|------------------------------|
| code        | Int32  | `60`                                   | [ErrorCodes.cpp][codes]를 참조하십시오. |
| name        | String | `DB::Exception`                        | 서버 메이저 버전             |
| message     | String | `DB::Exception: Table X doesn't exist` | 서버 마이너 버전             |
| stack_trace | String | ~                                      | C++ 스택 트레이스            |
| nested      | Bool   | `true`                                 | 추가 오류                    |

`nested`가 `false`가 될 때까지 예외가 연속해서 나열될 수 있습니다.

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "오류 코드 목록"



## 진행 상황 \{#progress\}

쿼리 실행 진행 상황이 서버에 의해 주기적으로 보고됩니다.

:::tip
진행 상황은 **증분(delta)**으로 보고됩니다. 총계를 얻으려면 클라이언트에서 누적하십시오.
:::

| field       | type    | value    | description                |
|-------------|---------|----------|----------------------------|
| rows        | UVarInt | `65535`  | 행 수                      |
| bytes       | UVarInt | `871799` | 바이트 수                  |
| total_rows  | UVarInt | `0`      | 총 행 수                   |
| wrote_rows  | UVarInt | `0`      | 클라이언트에서 전송된 행 수 |
| wrote_bytes | UVarInt | `0`      | 클라이언트에서 전송된 바이트 수 |



## Pong \{#pong\}

[클라이언트 ping](./client.md#ping)에 대한 응답이며, 패킷 본문은 없습니다.



## 스트림 종료 \{#end-of-stream\}

더 이상 **Data** 패킷이 전송되지 않으며, 쿼리 결과가 서버에서 클라이언트로 모두 전송되었습니다.

패킷 본문은 없습니다.



## 프로필 정보 \{#profile-info\}

| field                        | type    |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |



## 로그 \{#log\}

서버 로그를 담는 **데이터 블록**입니다.

:::tip
컬럼으로 구성된 **데이터 블록**으로 인코딩되지만, 압축되지는 않습니다.
:::

| 컬럼       | 타입     |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |



## 프로파일 이벤트 \{#profile-events\}

프로파일 이벤트가 포함된 **데이터 블록**입니다.

:::tip
컬럼으로 구성된 **데이터 블록**으로 인코딩되지만, 압축되지는 않습니다.

`value` 타입은 서버 리비전에 따라 `UInt64` 또는 `Int64`입니다.
:::

| 컬럼         | 타입            |
|--------------|-----------------|
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 or Int64 |
