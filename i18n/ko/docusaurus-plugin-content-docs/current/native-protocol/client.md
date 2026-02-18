---
slug: /native-protocol/client
sidebar_position: 2
title: '네이티브 클라이언트 패킷'
description: '네이티브 프로토콜 클라이언트'
doc_type: 'reference'
keywords: ['클라이언트 패킷', '네이티브 프로토콜 클라이언트', '프로토콜 패킷', '클라이언트 통신', 'TCP 클라이언트']
---

# 클라이언트 패킷 \{#client-packets\}

| value | name              | description        |
|-------|-------------------|--------------------|
| 0     | [Hello](#hello)   | 클라이언트 핸드셰이크 시작 |
| 1     | [Query](#query)   | 쿼리 요청          |
| 2     | [Data](#data)     | 데이터 블록        |
| 3     | [Cancel](#cancel) | 쿼리 취소          |
| 4     | [Ping](#ping)     | 핑(Ping) 요청      |
| 5     | TableStatus       | 테이블 상태 요청   |

`Data` 패킷은 압축할 수 있습니다.

## Hello \{#hello\}

예를 들어, `54451` 프로토콜 버전을 지원하는 `Go Client` v1.10을 사용하며
`default` 데이터베이스에 `default` 사용자와 `secret` 비밀번호로 연결하려고 합니다.

| field            | type    | value         | description          |
|------------------|---------|---------------|----------------------|
| client_name      | String  | `"Go Client"` | 클라이언트 구현 이름 |
| version_major    | UVarInt | `1`           | 클라이언트 메이저 버전 |
| version_minor    | UVarInt | `10`          | 클라이언트 마이너 버전 |
| protocol_version | UVarInt | `54451`       | TCP 프로토콜 버전     |
| database         | String  | `"default"`   | 데이터베이스 이름     |
| username         | String  | `"default"`   | 사용자 이름           |
| password         | String  | `"secret"`    | 비밀번호             |

### 프로토콜 버전 \{#protocol-version\}

프로토콜 버전은 클라이언트의 TCP 프로토콜 버전입니다.

일반적으로 최신 호환 서버 리비전과 동일하지만, 서버 리비전 자체와 혼동해서는 안 됩니다.

### 기본값 \{#defaults\}

모든 값은 **명시적으로 설정**해야 하며, 서버 측에는 기본값이 설정되어 있지 않습니다.
클라이언트 측에서는 `"default"` 데이터베이스, `"default"` 사용자 이름, `""`(빈 문자열) 비밀번호를 기본값으로 사용합니다.

## Query \{#query\}

| field           | type                       | value      | description                    |
|-----------------|----------------------------|------------|--------------------------------|
| query_id        | String                     | `1ff-a123` | 쿼리 ID, UUIDv4일 수 있음        |
| client_info     | [ClientInfo](#client-info) | See type   | 클라이언트 데이터                |
| settings        | [Settings](#settings)      | See type   | 설정 목록                       |
| secret          | String                     | `secret`   | 서버 간 통신에 사용하는 secret   |
| [stage](#stage) | UVarInt                    | `2`        | 해당 쿼리 단계까지 실행           |
| compression     | UVarInt                    | `0`        | 비활성화=0, 활성화=1             |
| body            | String                     | `SELECT 1` | 쿼리 텍스트                     |

### 클라이언트 정보 \{#client-info\}

| field             | type            | description                    |
|-------------------|-----------------|--------------------------------|
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | 초기 사용자                    |
| initial_query_id  | String          | 초기 쿼리 ID                   |
| initial_address   | String          | 초기 주소                      |
| initial_time      | Int64           | 초기 시간                      |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | OS 사용자                      |
| client_hostname   | String          | 클라이언트 호스트명           |
| client_name       | String          | 클라이언트 이름               |
| version_major     | UVarInt         | 클라이언트 메이저 버전        |
| version_minor     | UVarInt         | 클라이언트 마이너 버전        |
| protocol_version  | UVarInt         | 클라이언트 프로토콜 버전      |
| quota_key         | String          | QUOTA 키                       |
| distributed_depth | UVarInt         | 분산 쿼리 깊이                 |
| version_patch     | UVarInt         | 클라이언트 패치 버전          |
| otel              | Bool            | Trace 필드가 존재하는지 여부  |
| trace_id          | FixedString(16) | Trace ID                       |
| span_id           | FixedString(8)  | Span ID                        |
| trace_state       | String          | 트레이싱 상태                  |
| trace_flags       | Byte            | 트레이싱 플래그                |

### 설정 \{#settings\}

| field     | type   | value             | description               |
|-----------|--------|-------------------|---------------------------|
| key       | String | `send_logs_level` | 설정 키                   |
| value     | String | `trace`           | 설정 값                   |
| important | Bool   | `true`            | 무시 가능 여부            |

목록으로 인코딩되며, key와 value가 비어 있으면 목록의 끝을 나타냅니다.

### 단계 \{#stage\}

| value | name               | description                                      |
|-------|--------------------|--------------------------------------------------|
| 0     | FetchColumns       | 컬럼 유형만 가져옵니다                           |
| 1     | WithMergeableState | 병합 가능한 상태까지 처리합니다                  |
| 2     | Complete           | 완전히 완료될 때까지 처리합니다(기본값이어야 합니다) |

## 데이터 \{#data\}

| field   | type                | description        |
|---------|---------------------|--------------------|
| info    | BlockInfo           | 인코딩된 블록 정보 |
| columns | UVarInt             | 컬럼 수            |
| rows    | UVarInt             | 행 수              |
| columns | [[]Column](#column) | 데이터가 포함된 컬럼들 |

### 컬럼 \{#column\}

| field | type   | value           | description |
|-------|--------|-----------------|-------------|
| name  | String | `foo`           | 컬럼 이름   |
| type  | String | `DateTime64(9)` | 컬럼 유형   |
| data  | bytes  | ~               | 컬럼 데이터 |

## 취소 \{#cancel\}

패킷 본문은 없습니다. 서버는 쿼리를 취소해야 합니다.

## Ping \{#ping\}

패킷 본문은 없습니다. 서버는 [pong으로 응답해야 합니다](./server.md#pong).