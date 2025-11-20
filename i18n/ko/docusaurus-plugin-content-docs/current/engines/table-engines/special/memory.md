---
'description': 'Memory 엔진은 데이터를 RAM에 비압축 형태로 저장합니다. 데이터는 읽을 때 수신된 것과 정확히 동일한 형태로 저장됩니다.
  즉, 이 테이블에서 읽는 것은 완전히 무료입니다.'
'sidebar_label': 'Memory'
'sidebar_position': 110
'slug': '/engines/table-engines/special/memory'
'title': '메모리 테이블 엔진'
'doc_type': 'reference'
---


# 메모리 테이블 엔진

:::note
ClickHouse Cloud에서 Memory 테이블 엔진을 사용할 때, 데이터는 모든 노드에 복제되지 않습니다(설계상). 모든 쿼리가 동일한 노드로 라우팅되고 Memory 테이블 엔진이 예상대로 작동하도록 보장하려면 다음 중 하나를 수행할 수 있습니다:
- 동일한 세션에서 모든 작업 실행
- TCP 또는 패스 인터페이스(지속 연결 지원)를 사용하는 클라이언트를 사용합니다. 예: [clickhouse-client](/interfaces/cli)
:::

Memory 엔진은 데이터를 RAM에 압축되지 않은 형태로 저장합니다. 데이터는 읽을 때 수신되는 것과 정확히 동일한 형태로 저장됩니다. 다시 말해, 이 테이블에서 읽는 것은 전혀 비용이 들지 않습니다.
동시 데이터 접근은 동기화됩니다. 잠금은 짧습니다: 읽기 및 쓰기 작업은 서로를 차단하지 않습니다.
인덱스는 지원되지 않습니다. 읽기는 병렬화됩니다.

최대 생산성(초당 10GB 이상)은 간단한 쿼리에서 달성되며, 디스크에서 읽거나, 데이터를 압축 해제하거나, 역직렬화할 필요가 없기 때문입니다. (많은 경우 MergeTree 엔진의 생산성도 거의 비슷하다는 점에 유의해야 합니다.)
서버를 재시작할 때, 데이터는 테이블에서 사라지고 테이블은 비어 있게 됩니다.
일반적으로 이 테이블 엔진을 사용하는 것은 정당화되지 않습니다. 그러나 테스트 및 상대적으로 적은 수의 행(약 100,000,000개까지)에서 최대 속도가 필요한 작업에 사용할 수 있습니다.

Memory 엔진은 시스템에서 외부 쿼리 데이터와 함께 임시 테이블을 위해 사용되며(섹션 "쿼리 처리를 위한 외부 데이터" 참조), `GLOBAL IN` 구현에도 사용됩니다(섹션 "IN 연산자" 참조).

테이블 크기를 제한하기 위해 Memory 엔진의 상한 및 하한을 지정할 수 있으며, 효과적으로 원형 버퍼로 작동할 수 있습니다(참고: [엔진 매개변수](#engine-parameters)).

## 엔진 매개변수 {#engine-parameters}

- `min_bytes_to_keep` — 메모리 테이블의 크기가 제한될 때 유지해야 할 최소 바이트 수.
  - 기본값: `0`
  - `max_bytes_to_keep` 필수
- `max_bytes_to_keep` — 삽입 시 가장 오래된 행이 삭제되는 메모리 테이블 내에서 유지해야 할 최대 바이트 수(즉, 원형 버퍼). 최대 바이트는 큰 블록을 추가할 때 삭제할 가장 오래된 행 배치가 `min_bytes_to_keep` 제한에 해당할 경우 지정된 제한을 초과할 수 있습니다.
  - 기본값: `0`
- `min_rows_to_keep` — 메모리 테이블의 크기가 제한될 때 유지해야 할 최소 행 수.
  - 기본값: `0`
  - `max_rows_to_keep` 필수
- `max_rows_to_keep` — 삽입 시 가장 오래된 행이 삭제되는 메모리 테이블 내에서 유지해야 할 최대 행 수(즉, 원형 버퍼). 최대 행은 큰 블록을 추가할 때 삭제할 가장 오래된 행 배치가 `min_rows_to_keep` 제한에 해당할 경우 지정된 제한을 초과할 수 있습니다.
  - 기본값: `0`
- `compress` - 메모리에 데이터를 압축할지 여부.
  - 기본값: `false`

## 사용법 {#usage}

**설정 초기화**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**설정 수정**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**참고:** `bytes` 및 `rows` 한정 매개변수는 동시에 설정할 수 있지만, `max` 및 `min`의 하한은 준수됩니다.

## 예제 {#examples}
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

또한, 행에 대해서는:

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
