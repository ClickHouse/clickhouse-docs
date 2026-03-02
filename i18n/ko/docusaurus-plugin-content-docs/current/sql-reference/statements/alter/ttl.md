---
description: '테이블 TTL 관리 문서'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: '테이블 TTL 관리'
doc_type: 'reference'
---

# 테이블 TTL 작업 \{#manipulations-with-table-ttl\}

:::note
TTL을 사용한 오래된 데이터 관리 방법에 대한 자세한 내용은 [TTL로 데이터 관리하기](/guides/developer/ttl.md) 사용자 가이드를 참조하십시오. 아래 내용에서는 기존 TTL 규칙을 변경하거나 제거하는 방법을 설명합니다.
:::

## TTL 수정 \{#modify-ttl\}

다음 형식의 쿼리를 사용하여 [테이블 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)을 변경할 수 있습니다:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## TTL 제거 \{#remove-ttl\}

다음 쿼리를 사용하여 테이블의 TTL 속성을 제거하십시오:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**예시**

테이블 `TTL`이 설정된 테이블이 있다고 가정합니다:

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

강제로 `TTL` 정리를 수행하려면 `OPTIMIZE`를 실행하십시오:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

테이블의 두 번째 행이 삭제되었습니다.

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

이제 다음 쿼리를 사용하여 테이블의 `TTL`을 제거합니다:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

삭제된 행을 다시 삽입한 뒤 `OPTIMIZE`를 사용해 `TTL` 정리를 다시 강제로 수행합니다:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL`이 더 이상 설정되어 있지 않으므로 두 번째 행은 삭제되지 않습니다:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**추가 참고**

* [TTL 표현식](../../../sql-reference/statements/create/table.md#ttl-expression)에 대해 자세히 알아보려면 이 문서를 참조하십시오.
* 컬럼을 [TTL과 함께](/sql-reference/statements/alter/ttl) 수정하는 방법.
