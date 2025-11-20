---
'description': '테이블 TTL 조작에 대한 Documentation'
'sidebar_label': 'TTL'
'sidebar_position': 44
'slug': '/sql-reference/statements/alter/ttl'
'title': '테이블 TTL 조작'
'doc_type': 'reference'
---


# 테이블 TTL 조작

:::note
구식 데이터를 관리하기 위해 TTL 사용에 대한 자세한 내용을 원하시면 [TTL로 데이터 관리](/guides/developer/ttl.md) 사용자 가이드를 확인하세요. 아래 문서는 기존 TTL 규칙을 변경하거나 제거하는 방법을 보여줍니다.
:::

## MODIFY TTL {#modify-ttl}

다음 형식의 요청으로 [테이블 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)을 변경할 수 있습니다:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## REMOVE TTL {#remove-ttl}

다음 쿼리로 테이블에서 TTL 속성을 제거할 수 있습니다:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**예제**

테이블 `TTL`을 고려해 보세요:

```sql
CREATE TABLE table_with_ttl
(
    event_time DateTime,
    UserID UInt64,
    Comment String
)
ENGINE MergeTree()
ORDER BY tuple()
TTL event_time + INTERVAL 3 MONTH
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO table_with_ttl VALUES (now(), 1, 'username1');

INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
```

`OPTIMIZE`를 실행하여 `TTL` 청소를 강제합니다:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```
두 번째 행이 테이블에서 삭제되었습니다.

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

다음 쿼리로 테이블 `TTL`을 제거합니다:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

삭제된 행을 다시 삽입하고 `OPTIMIZE`로 `TTL` 청소를 다시 강제합니다:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL`이 더 이상 존재하지 않아 두 번째 행이 삭제되지 않습니다:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**참고**

- [TTL-expression](../../../sql-reference/statements/create/table.md#ttl-expression)에 대한 자세한 정보.
- [TTL로](/sql-reference/statements/alter/ttl) 컬럼 수정.
