---
'description': '이 엔진은 애플리케이션 로그 파일을 기록의 스트림으로 처리할 수 있게 합니다.'
'sidebar_label': 'FileLog'
'sidebar_position': 160
'slug': '/engines/table-engines/special/filelog'
'title': 'FileLog 테이블 엔진'
'doc_type': 'reference'
---


# FileLog 테이블 엔진 {#filelog-engine}

이 엔진은 애플리케이션 로그 파일을 레코드 스트림으로 처리할 수 있게 해줍니다.

`FileLog`를 사용하면:

- 로그 파일에 구독할 수 있습니다.
- 구독한 로그 파일에 레코드가 추가될 때 새로운 레코드를 처리할 수 있습니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = FileLog('path_to_logs', 'format_name') SETTINGS
    [poll_timeout_ms = 0,]
    [poll_max_batch_size = 0,]
    [max_block_size = 0,]
    [max_threads = 0,]
    [poll_directory_watch_events_backoff_init = 500,]
    [poll_directory_watch_events_backoff_max = 32000,]
    [poll_directory_watch_events_backoff_factor = 2,]
    [handle_error_mode = 'default']
```

엔진 인자:

- `path_to_logs` – 구독할 로그 파일의 경로입니다. 로그 파일이 있는 디렉터리 경로 또는 단일 로그 파일 경로일 수 있습니다. ClickHouse는 `user_files` 디렉터리 내의 경로만 허용합니다.
- `format_name` - 레코드 형식입니다. `FileLog`는 파일의 각 라인을 별도의 레코드로 처리하므로 모든 데이터 형식이 적합한 것은 아닙니다.

선택적 매개변수:

- `poll_timeout_ms` - 로그 파일에서 단일 폴을 위한 타임아웃. 기본값: [stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
- `poll_max_batch_size` — 단일 폴에서 폴링할 최대 레코드 수. 기본값: [max_block_size](/operations/settings/settings#max_block_size).
- `max_block_size` — 폴을 위한 최대 배치 크기(레코드 기준). 기본값: [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size).
- `max_threads` - 파일을 파싱하는 최대 스레드 수, 기본값은 0이며, 이는 max(1, physical_cpu_cores / 4)를 의미합니다.
- `poll_directory_watch_events_backoff_init` - 감시 디렉토리 스레드의 초기 대기 값. 기본값: `500`.
- `poll_directory_watch_events_backoff_max` - 감시 디렉토리 스레드의 최대 대기 값. 기본값: `32000`.
- `poll_directory_watch_events_backoff_factor` - 백오프 속도, 기본값은 지수적입니다. 기본값: `2`.
- `handle_error_mode` — FileLog 엔진의 오류 처리 방법. 가능한 값: default (메시지 파싱 실패 시 예외가 발생함), stream (예외 메시지와 원시 메시지가 가상 컬럼 `_error`와 `_raw_message`에 저장됨).

## 설명 {#description}

전달된 레코드는 자동으로 추적되므로 로그 파일의 각 레코드는 한 번만 계산됩니다.

`SELECT`는 레코드를 읽기 위해 그다지 유용하지 않습니다(디버깅을 제외하고), 왜냐하면 각 레코드는 한 번만 읽을 수 있기 때문입니다. [물리화된 뷰](../../../sql-reference/statements/create/view.md)를 사용하여 실시간 스레드를 생성하는 것이 더 실용적입니다. 이를 위해:

1. 엔진을 사용하여 FileLog 테이블을 생성하고 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조의 테이블을 생성합니다.
3. 엔진에서 데이터를 변환하여 이전에 생성된 테이블에 넣는 물리화된 뷰를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 연결되면 백그라운드에서 데이터를 수집하기 시작합니다. 이렇게 하면 로그 파일에서 레코드를 지속적으로 수신하고 `SELECT`를 사용하여 필요한 형식으로 변환할 수 있습니다.
하나의 FileLog 테이블은 원하는 만큼의 물리화된 뷰를 가질 수 있으며, 이들은 테이블에서 데이터를 직접 읽지 않고 새로운 레코드(블록 단위)를 수신하므로, 서로 다른 세부 수준으로 여러 테이블에 쓸 수 있습니다(그룹화 - 집계 포함 및 제외).

예시:

```sql
CREATE TABLE logs (
  timestamp UInt64,
  level String,
  message String
) ENGINE = FileLog('user_files/my_app/app.log', 'JSONEachRow');

CREATE TABLE daily (
  day Date,
  level String,
  total UInt64
) ENGINE = SummingMergeTree(day, (day, level), 8192);

CREATE MATERIALIZED VIEW consumer TO daily
  AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
  FROM queue GROUP BY day, level;

SELECT level, sum(total) FROM daily GROUP BY level;
```

스트림 데이터를 수신 중지하거나 변환 논리를 변경하려면 물리화된 뷰를 분리합니다:

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

`ALTER`를 사용하여 대상 테이블을 변경하려면, 물리화된 뷰를 비활성화하여 대상 테이블과 뷰의 데이터 간의 불일치를 피하는 것이 좋습니다.

## 가상 컬럼 {#virtual-columns}

- `_filename` - 로그 파일의 이름. 데이터 유형: `LowCardinality(String)`.
- `_offset` - 로그 파일 내의 오프셋. 데이터 유형: `UInt64`.

`handle_error_mode='stream'`일 때 추가 가상 컬럼:

- `_raw_record` - 성공적으로 파싱되지 못한 원시 레코드. 데이터 유형: `Nullable(String)`.
- `_error` - 파싱 실패 중 발생한 예외 메시지. 데이터 유형: `Nullable(String)`.

참고: `_raw_record`와 `_error` 가상 컬럼은 파싱 중 예외가 발생한 경우에만 채워지며, 메시지가 성공적으로 파싱되었을 때는 항상 `NULL`입니다.
