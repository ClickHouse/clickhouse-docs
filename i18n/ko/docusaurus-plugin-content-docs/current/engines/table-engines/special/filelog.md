---
description: '이 엔진은 애플리케이션 로그 파일을 레코드 스트림 형태로 처리할 수 있게 합니다.'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'FileLog 테이블 엔진'
doc_type: 'reference'
---



# FileLog 테이블 엔진 \{#filelog-engine\}

이 엔진은 애플리케이션 로그 파일을 레코드 스트림 형태로 처리할 수 있게 해줍니다.

`FileLog`를 사용하면 다음을 수행할 수 있습니다:

- 로그 파일을 구독할 수 있습니다.
- 구독한 로그 파일에 새 레코드가 추가될 때 이를 처리할 수 있습니다.



## 테이블 생성 \{#creating-a-table\}

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

Engine arguments:

* `path_to_logs` – 구독할 로그 파일의 경로입니다. 로그 파일이 있는 디렉터리 경로이거나 단일 로그 파일의 경로일 수 있습니다. ClickHouse는 `user_files` 디렉터리 내부의 경로만 허용한다는 점에 유의해야 합니다.
* `format_name` - 레코드 형식입니다. FileLog는 파일의 각 줄을 개별 레코드로 처리하므로, 모든 데이터 형식이 이에 적합한 것은 아니라는 점에 유의해야 합니다.

Optional parameters:

* `poll_timeout_ms` - 로그 파일에서 단일 poll을 수행할 때의 타임아웃입니다. 기본값: [stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
* `poll_max_batch_size` — 단일 poll에서 가져올 수 있는 최대 레코드 수입니다. 기본값: [max&#95;block&#95;size](/operations/settings/settings#max_block_size).
* `max_block_size` — poll 시 배치 크기의 최대값(레코드 수 기준)입니다. 기본값: [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size).
* `max_threads` - 파일을 파싱할 최대 스레드 수입니다. 기본값은 0이며, 이 경우 max(1, physical&#95;cpu&#95;cores / 4) 값이 사용됩니다.
* `poll_directory_watch_events_backoff_init` - 디렉터리 감시 스레드의 초기 대기 시간 값입니다. 기본값: `500`.
* `poll_directory_watch_events_backoff_max` - 디렉터리 감시 스레드의 최대 대기 시간 값입니다. 기본값: `32000`.
* `poll_directory_watch_events_backoff_factor` - backoff 속도입니다. 기본적으로 지수(exponential) backoff입니다. 기본값: `2`.
* `handle_error_mode` — FileLog 엔진의 오류 처리 방식입니다. 가능한 값: default(메시지 파싱에 실패하면 예외를 발생시킵니다), stream(예외 메시지와 원시 메시지를 가상 컬럼 `_error` 및 `_raw_message`에 저장합니다).


## Description \{#description\}

전달된 레코드는 자동으로 추적되므로 로그 파일의 각 레코드는 한 번만 집계됩니다.

`SELECT`는 각 레코드를 한 번만 읽을 수 있기 때문에(디버깅 목적을 제외하면) 레코드를 읽는 데 그다지 유용하지 않습니다. 대신 [materialized views](../../../sql-reference/statements/create/view.md)를 사용하여 실시간 스레드를 생성하는 것이 더 실용적입니다. 이를 위해서는 다음을 수행합니다.

1. 엔진을 사용하여 FileLog 테이블을 생성하고 이를 데이터 스트림으로 간주합니다.
2. 원하는 구조의 테이블을 생성합니다.
3. 엔진에서 나온 데이터를 변환하여 미리 생성한 테이블에 적재하는 materialized view를 생성합니다.

`MATERIALIZED VIEW`가 엔진에 연결되면 백그라운드에서 데이터를 수집하기 시작합니다. 이를 통해 로그 파일에서 레코드를 지속적으로 수신하고, `SELECT`를 사용하여 필요한 형식으로 변환할 수 있습니다.
하나의 FileLog 테이블은 원하는 만큼 많은 materialized view를 가질 수 있으며, 이들은 테이블에서 직접 데이터를 읽지 않고 새로운 레코드(블록 단위)를 수신합니다. 이렇게 하면 서로 다른 상세 수준(그룹화·집계 포함 및 미포함)의 여러 테이블에 데이터를 기록할 수 있습니다.

예:

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

스트림 데이터 수신을 중지하거나 변환 로직을 변경하려면 materialized view를 분리하십시오.

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

`ALTER`를 사용해 대상 테이블을 변경하려는 경우, 대상 테이블과 뷰에서 입력되는 데이터 간의 불일치를 방지하기 위해 구체화된 뷰(Materialized View)를 비활성화하는 것이 좋습니다.


## 가상 컬럼 \{#virtual-columns\}

- `_filename` - 로그 파일 이름입니다. 데이터 타입: `LowCardinality(String)`.
- `_offset` - 로그 파일에서의 오프셋입니다. 데이터 타입: `UInt64`.

`handle_error_mode='stream'`인 경우 추가되는 가상 컬럼:

- `_raw_record` - 정상적으로 파싱되지 않은 원시 레코드입니다. 데이터 타입: `Nullable(String)`.
- `_error` - 파싱에 실패하는 동안 발생한 예외 메시지입니다. 데이터 타입: `Nullable(String)`.

참고: `_raw_record`와 `_error` 가상 컬럼은 파싱 과정에서 예외가 발생한 경우에만 값이 채워지며, 메시지가 성공적으로 파싱된 경우에는 항상 `NULL`입니다.
