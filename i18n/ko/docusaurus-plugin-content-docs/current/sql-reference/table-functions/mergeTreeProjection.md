---
description: 'MergeTree 테이블에서 특정 프로젝션(projection)의 내용을 나타냅니다.
  인트로스펙션(introspection)에 사용할 수 있습니다.'
sidebar_label: 'mergeTreeProjection'
sidebar_position: 77
slug: /sql-reference/table-functions/mergeTreeProjection
title: 'mergeTreeProjection'
doc_type: 'reference'
---



# mergeTreeProjection Table Function \{#mergetreeprojection-table-function\}

MergeTree 테이블에서 특정 프로젝션의 내용을 나타냅니다. 내부 구조를 조회하는 용도로 사용할 수 있습니다.



## 구문 \{#syntax\}

```sql
mergeTreeProjection(database, table, projection)
```


## Arguments \{#arguments\}

| Argument     | Description                                       |
|--------------|---------------------------------------------------|
| `database`   | PROJECTION을 읽어올 데이터베이스 이름입니다.         |
| `table`      | PROJECTION을 읽어올 테이블 이름입니다.              |
| `projection` | 읽어올 PROJECTION입니다.                           |



## 반환 값 \{#returned_value\}

지정된 프로젝션이 제공하는 컬럼을 포함한 테이블 객체입니다.



## 사용 예 \{#usage-example\}

```sql
CREATE TABLE test
(
    `user_id` UInt64,
    `item_id` UInt64,
    PROJECTION order_by_item_id
    (
        SELECT _part_offset
        ORDER BY item_id
    )
)
ENGINE = MergeTree
ORDER BY user_id;

INSERT INTO test SELECT number, 100 - number FROM numbers(5);
```

```sql
SELECT *, _part_offset FROM mergeTreeProjection(currentDatabase(), test, order_by_item_id);
```

```text
   ┌─item_id─┬─_parent_part_offset─┬─_part_offset─┐
1. │      96 │                   4 │            0 │
2. │      97 │                   3 │            1 │
3. │      98 │                   2 │            2 │
4. │      99 │                   1 │            3 │
5. │     100 │                   0 │            4 │
   └─────────┴─────────────────────┴──────────────┘
```

```sql
DESCRIBE mergeTreeProjection(currentDatabase(), test, order_by_item_id) SETTINGS describe_compact_output = 1;
```

```text
   ┌─name────────────────┬─type───┐
1. │ item_id             │ UInt64 │
2. │ _parent_part_offset │ UInt64 │
   └─────────────────────┴────────┘
```
