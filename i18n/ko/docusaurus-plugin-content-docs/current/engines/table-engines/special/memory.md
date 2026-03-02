---
description: 'Memory 엔진은 압축되지 않은 형태로 데이터를 RAM에 저장합니다. 데이터는 읽을 때 입력된 그대로의 형태로 저장됩니다. 다시 말해, 이 테이블에서 데이터를 읽는 작업에는 전혀 비용이 들지 않습니다.'
sidebar_label: 'Memory'
sidebar_position: 110
slug: /engines/table-engines/special/memory
title: 'Memory 테이블 엔진'
doc_type: 'reference'
---



# Memory table engine \{#memory-table-engine\}

:::note
ClickHouse Cloud에서 Memory table engine을 사용할 때, 데이터는 (설계상) 모든 노드에 레플리카로 저장되지 않습니다. 모든 쿼리가 동일한 노드로 라우팅되고 Memory table engine이 의도한 대로 동작하도록 보장하려면 다음 중 하나를 수행해야 합니다:
- 동일한 세션에서 모든 작업을 실행합니다.
- [clickhouse-client](/interfaces/cli)와 같이 TCP 또는 네이티브 인터페이스(스티키 연결을 지원함)를 사용하는 클라이언트를 사용합니다.
:::

Memory engine은 데이터를 압축되지 않은 형태로 RAM에 저장합니다. 데이터는 읽을 때 수신된 것과 정확히 동일한 형태로 저장됩니다. 다시 말해, 이 테이블에서 읽는 작업에는 전혀 비용이 들지 않습니다.
동시 데이터 접근은 동기화됩니다. 잠금은 매우 짧으며, 읽기 및 쓰기 작업이 서로를 차단하지 않습니다.
인덱스는 지원되지 않습니다. 읽기 작업은 병렬로 수행됩니다.

디스크에서 읽기, 압축 해제, 데이터 역직렬화가 필요 없기 때문에 간단한 쿼리에서는 최대 10 GB/sec 이상의 처리량을 달성할 수 있습니다. (많은 경우에는 MergeTree engine의 처리량도 거의 이와 비슷하다는 점을 참고하십시오.)
서버를 재시작하면 테이블의 데이터는 사라지고 테이블은 비어 있게 됩니다.
일반적으로 이 테이블 엔진을 사용하는 것은 그다지 적절하지 않습니다. 그러나 테스트 용도나 상대적으로 적은 수의 행(대략 100,000,000행까지)에 대해 최대 속도가 필요한 작업에는 사용할 수 있습니다.

Memory engine은 외부 쿼리 데이터가 있는 임시 테이블(「쿼리 처리를 위한 외부 데이터」 절 참조)과 `GLOBAL IN` 구현(「IN 연산자」 절 참조)에 시스템에서 사용됩니다.

Memory engine 테이블 크기를 제한하기 위해 상한과 하한을 지정할 수 있으며, 이를 통해 사실상 순환 버퍼처럼 동작하도록 할 수 있습니다( [Engine Parameters](#engine-parameters) 참조).



## 엔진 매개변수 \{#engine-parameters\}

- `min_bytes_to_keep` — 메모리 테이블에 크기 제한이 설정된 경우 유지해야 하는 최소 바이트 수입니다.
  - 기본값: `0`
  - `max_bytes_to_keep` 설정이 필요합니다.
- `max_bytes_to_keep` — 메모리 테이블 내에서 유지할 수 있는 최대 바이트 수로, 각 삽입 시 가장 오래된 행이 삭제되어 순환 버퍼처럼 동작합니다. 큰 블록을 추가할 때 제거 대상인 가장 오래된 행 배치가 `min_bytes_to_keep` 한계 미만에 해당하는 경우, 최대 바이트 수가 설정된 한계를 초과할 수 있습니다.
  - 기본값: `0`
- `min_rows_to_keep` — 메모리 테이블에 크기 제한이 설정된 경우 유지해야 하는 최소 행 수입니다.
  - 기본값: `0`
  - `max_rows_to_keep` 설정이 필요합니다.
- `max_rows_to_keep` — 메모리 테이블 내에서 유지할 수 있는 최대 행 수로, 각 삽입 시 가장 오래된 행이 삭제되어 순환 버퍼처럼 동작합니다. 큰 블록을 추가할 때 제거 대상인 가장 오래된 행 배치가 `min_rows_to_keep` 한계 미만에 해당하는 경우, 최대 행 수가 설정된 한계를 초과할 수 있습니다.
  - 기본값: `0`
- `compress` — 메모리에서 데이터를 압축할지 여부입니다.
  - 기본값: `false`



## 사용 방법 \{#usage\}

**설정 초기화**

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**설정 변경**

```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**참고:** `bytes`와 `rows` 제한 파라미터는 동시에 설정할 수 있으며, 이 경우 `max`와 `min` 가운데 더 작은 값이 적용됩니다.


## 예제 \{#examples\}

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 bytes

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 bytes

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 bytes

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 bytes

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

또한 행의 경우:

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 rows

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 rows

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 rows

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 rows

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
