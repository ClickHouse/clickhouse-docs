---
'description': 'MergeTree 테이블의 일부 프로젝션 내용을 나타냅니다. 이는 내탐을 위해 사용할 수 있습니다.'
'sidebar_label': 'mergeTreeProjection'
'sidebar_position': 77
'slug': '/sql-reference/table-functions/mergeTreeProjection'
'title': 'mergeTreeProjection'
'doc_type': 'reference'
---


# mergeTreeProjection 테이블 함수

MergeTree 테이블에서 일부 프로젝션의 내용을 나타냅니다. 내부 검사를 위해 사용할 수 있습니다.

## 구문 {#syntax}

```sql
mergeTreeProjection(database, table, projection)
```

## 인수 {#arguments}

| 인수         | 설명                                       |
|--------------|--------------------------------------------|
| `database`   | 프로젝션을 읽어올 데이터베이스 이름입니다. |
| `table`      | 프로젝션을 읽어올 테이블 이름입니다.     |
| `projection` | 읽어올 프로젝션입니다.                    |

## 반환 값 {#returned_value}

주어진 프로젝션에서 제공하는 컬럼을 가진 테이블 객체입니다.

## 사용 예제 {#usage-example}

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
