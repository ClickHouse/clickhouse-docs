---
'slug': '/native-protocol/client'
'sidebar_position': 2
'title': '네이티브 클라이언트 패킷'
'description': '네이티브 프로토콜 클라이언트'
'doc_type': 'reference'
'keywords':
- 'client packets'
- 'native protocol client'
- 'protocol packets'
- 'client communication'
- 'TCP client'
---


# 클라이언트 패킷

| 값   | 이름               | 설명                       |
|------|--------------------|----------------------------|
| 0    | [Hello](#hello)    | 클라이언트 핸드셰이크 시작  |
| 1    | [Query](#query)    | 쿼리 요청                  |
| 2    | [Data](#data)      | 데이터가 포함된 블록       |
| 3    | [Cancel](#cancel)  | 쿼리 취소                  |
| 4    | [Ping](#ping)      | 핑 요청                    |
| 5    | TableStatus        | 테이블 상태 요청           |

`Data`는 압축될 수 있습니다.

## Hello {#hello}

예를 들어, 우리는 `Go Client` v1.10이며 `54451` 프로토콜 버전을 지원하고
`default` 데이터베이스에 `default` 사용자와 `secret` 비밀번호로 연결하고 싶습니다.

| 필드              | 유형     | 값               | 설명                         |
|-------------------|----------|-------------------|------------------------------|
| client_name       | String   | `"Go Client"`     | 클라이언트 구현 이름          |
| version_major     | UVarInt  | `1`               | 클라이언트 주요 버전         |
| version_minor     | UVarInt  | `10`              | 클라이언트 부가 버전         |
| protocol_version   | UVarInt  | `54451`           | TCP 프로토콜 버전            |
| database          | String   | `"default"`       | 데이터베이스 이름            |
| username          | String   | `"default"`       | 사용자 이름                 |
| password          | String   | `"secret"`        | 비밀번호                    |

### 프로토콜 버전 {#protocol-version}

프로토콜 버전은 클라이언트의 TCP 프로토콜 버전입니다.

일반적으로 최신 호환 서버 버전과 같지만
혼동해서는 안 됩니다.

### 기본값 {#defaults}

모든 값은 **명시적으로 설정**되어야 하며, 서버 측에서는 기본값이 없습니다.
클라이언트 측에서는 `"default"` 데이터베이스, `"default"` 사용자 이름 및 `""` (빈 문자열) 비밀번호를 기본값으로 사용합니다.

## 쿼리 {#query}

| 필드           | 유형                       | 값          | 설명                        |
|----------------|----------------------------|--------------|-----------------------------|
| query_id       | String                     | `1ff-a123`   | 쿼리 ID, UUIDv4일 수 있음   |
| client_info    | [ClientInfo](#client-info) | 유형 참조    | 클라이언트에 대한 데이터     |
| settings       | [Settings](#settings)      | 유형 참조    | 설정 목록                   |
| secret         | String                     | `secret`     | 서버 간 비밀                 |
| [stage](#stage)| UVarInt                    | `2`          | 쿼리 단계까지 실행          |
| compression     | UVarInt                    | `0`          | 비활성화=0, 활성화=1      |
| body           | String                     | `SELECT 1`   | 쿼리 텍스트                 |

### 클라이언트 정보 {#client-info}

| 필드             | 유형            | 설명                            |
|-------------------|-----------------|-------------------------------|
| query_kind        | byte            | 없음=0, 초기=1, 보조=2       |
| initial_user      | String          | 초기 사용자                    |
| initial_query_id  | String          | 초기 쿼리 ID                  |
| initial_address   | String          | 초기 주소                     |
| initial_time      | Int64           | 초기 시간                     |
| interface         | byte            | TCP=1, HTTP=2                 |
| os_user           | String          | OS 사용자                     |
| client_hostname   | String          | 클라이언트 호스트 이름         |
| client_name       | String          | 클라이언트 이름                |
| version_major     | UVarInt         | 클라이언트 주요 버전          |
| version_minor     | UVarInt         | 클라이언트 부가 버전          |
| protocol_version   | UVarInt         | 클라이언트 프로토콜 버전      |
| quota_key         | String          | 쿼타 키                       |
| distributed_depth  | UVarInt         | 분산 깊이                     |
| version_patch     | UVarInt         | 클라이언트 패치 버전          |
| otel              | Bool            | 트레이스 필드가 존재함         |
| trace_id          | FixedString(16) | 트레이스 ID                   |
| span_id           | FixedString(8)  | 스팬 ID                       |
| trace_state       | String          | 트레이싱 상태                 |
| trace_flags       | Byte            | 트레이싱 플래그               |

### 설정 {#settings}

| 필드       | 유형   | 값                 | 설명                      |
|------------|--------|---------------------|---------------------------|
| key        | String | `send_logs_level`   | 설정의 키                 |
| value      | String | `trace`             | 설정의 값                 |
| important  | Bool   | `true`              | 무시될 수 있는지 여부     |

리스트로 인코딩되며, 빈 키와 값은 리스트의 끝을 나타냅니다.

### 단계 {#stage}

| 값   | 이름                  | 설명                                    |
|------|-----------------------|-----------------------------------------|
| 0    | FetchColumns          | 컬럼 유형만 가져오기                    |
| 1    | WithMergeableState    | 병합 가능한 상태까지                     |
| 2    | Complete              | 전체 완료될 때까지 (기본값이어야 함)    |

## 데이터 {#data}

| 필드    | 유형                 | 설명                     |
|---------|----------------------|--------------------------|
| info    | BlockInfo            | 인코딩된 블록 정보       |
| columns | UVarInt              | 컬럼 수                  |
| rows    | UVarInt              | 행 수                    |
| columns | [[]Column](#column)  | 데이터가 포함된 컬럼     |

### 컬럼 {#column}

| 필드  | 유형   | 값                | 설명                     |
|-------|--------|--------------------|--------------------------|
| name  | String | `foo`              | 컬럼 이름                |
| type  | String | `DateTime64(9)`    | 컬럼 유형                |
| data  | bytes  | ~                  | 컬럼 데이터              |

## 취소 {#cancel}

패킷 본문 없음. 서버는 쿼리를 취소해야 합니다.

## 핑 {#ping}

패킷 본문 없음. 서버는 [pong으로 응답해야 합니다](./server.md#pong).
