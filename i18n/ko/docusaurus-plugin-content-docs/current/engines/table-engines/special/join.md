---
'description': 'JOIN 작업에서 사용하기 위한 선택적 준비된 데이터 구조.'
'sidebar_label': 'Join'
'sidebar_position': 70
'slug': '/engines/table-engines/special/join'
'title': '조인 테이블 엔진'
'doc_type': 'reference'
---


# Join 테이블 엔진

[JOIN](/sql-reference/statements/select/join) 작업에 사용되는 선택적 준비 데이터 구조입니다.

:::note
ClickHouse Cloud에서 서비스가 25.4 이전 버전으로 생성된 경우, `SET compatibility=25.4`를 사용하여 호환성을 최소 25.4로 설정해야 합니다.
:::

## 테이블 생성하기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

## 엔진 매개변수 {#engine-parameters}

### `join_strictness` {#join_strictness}

`join_strictness` – [JOIN 엄격성](/sql-reference/statements/select/join#supported-types-of-join).

### `join_type` {#join_type}

`join_type` – [JOIN 유형](/sql-reference/statements/select/join#supported-types-of-join).

### 키 컬럼 {#key-columns}

`k1[, k2, ...]` – `JOIN` 작업이 수행되는 `USING` 절의 키 컬럼입니다.

`join_strictness` 및 `join_type` 매개변수를 따옴표 없이 입력하십시오. 예: `Join(ANY, LEFT, col1)`. 이들은 테이블이 사용될 `JOIN` 작업과 일치해야 합니다. 매개변수가 일치하지 않으면 ClickHouse는 예외를 발생시키지 않으며 잘못된 데이터를 반환할 수 있습니다.

## 세부사항 및 권장사항 {#specifics-and-recommendations}

### 데이터 저장 {#data-storage}

`Join` 테이블 데이터는 항상 RAM에 위치합니다. 테이블에 행을 삽입할 때 ClickHouse는 데이터 블록을 디스크의 디렉토리에 쓰며, 서버 재시작 시 복구할 수 있도록 합니다.

서버가 잘못 재시작되면 디스크의 데이터 블록이 손실되거나 손상될 수 있습니다. 이 경우 손상된 데이터가 있는 파일을 수동으로 삭제해야 할 수 있습니다.

### 데이터 선택 및 삽입 {#selecting-and-inserting-data}

`INSERT` 쿼리를 사용하여 `Join` 엔진 테이블에 데이터를 추가할 수 있습니다. 테이블이 `ANY` 엄격성으로 생성된 경우 중복 키에 대한 데이터는 무시됩니다. `ALL` 엄격성을 사용하는 경우 모든 행이 추가됩니다.

`Join` 엔진 테이블의 주요 사용 사례는 다음과 같습니다:

- `JOIN` 절의 오른쪽에 테이블을 배치합니다.
- [joinGet](/sql-reference/functions/other-functions.md/#joinGet) 함수를 호출하여 딕셔너리와 같은 방식으로 테이블에서 데이터를 추출합니다.

### 데이터 삭제 {#deleting-data}

`Join` 엔진 테이블에 대한 `ALTER DELETE` 쿼리는 [변경](/sql-reference/statements/alter/index.md#mutations)으로 구현됩니다. `DELETE` 변경은 필터링된 데이터를 읽고 메모리와 디스크의 데이터를 덮어씁니다.

### 제한 사항 및 설정 {#join-limitations-and-settings}

테이블을 생성할 때 다음 설정이 적용됩니다:

#### `join_use_nulls` {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### `max_rows_in_join` {#max_rows_in_join}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### `max_bytes_in_join` {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### `join_overflow_mode` {#join_overflow_mode}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### `join_any_take_last_row` {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)

#### `join_use_nulls` {#join_use_nulls-1}

#### 지속성 {#persistent}

Join 및 [Set](/engines/table-engines/special/set.md) 테이블 엔진에 대한 지속성을 비활성화합니다.

I/O 오버헤드를 줄입니다. 성능을 추구하고 지속성이 필요하지 않은 시나리오에 적합합니다.

가능한 값:

- 1 — 활성화됨.
- 0 — 비활성화됨.

기본값: `1`.

`Join` 엔진 테이블은 `GLOBAL JOIN` 작업에 사용할 수 없습니다.

`Join` 엔진은 `CREATE TABLE` 문에서 [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) 설정을 지정할 수 있습니다. [SELECT](/sql-reference/statements/select/index.md) 쿼리는 동일한 `join_use_nulls` 값을 가져야 합니다.

## 사용 예제 {#example}

왼쪽 테이블 생성하기:

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

오른쪽 `Join` 테이블 생성하기:

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

테이블 조인하기:

```sql
SELECT * FROM id_val ANY LEFT JOIN id_val_join USING (id);
```

```text
┌─id─┬─val─┬─id_val_join.val─┐
│  1 │  11 │              21 │
│  2 │  12 │               0 │
│  3 │  13 │              23 │
└────┴─────┴─────────────────┘
```

대안으로, 조인 키 값을 지정하여 `Join` 테이블에서 데이터를 검색할 수 있습니다:

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

`Join` 테이블에서 행 삭제하기:

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
