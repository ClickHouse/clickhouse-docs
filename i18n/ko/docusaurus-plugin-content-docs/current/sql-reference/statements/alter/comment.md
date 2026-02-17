---
description: 'ALTER TABLE ... MODIFY COMMENT에 대한 문서로, 테이블 주석을 추가, 수정 또는 제거하는 방법을 설명합니다'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER TABLE ... MODIFY COMMENT \{#alter-table-modify-comment\}

테이블 comment를, 이전에 설정되어 있었는지와 관계없이 추가, 수정 또는 제거합니다. comment 변경 사항은 [`system.tables`](../../../operations/system-tables/tables.md)와 `SHOW CREATE TABLE` 쿼리 모두에 반영됩니다.



## 구문 \{#syntax\}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 예시 \{#examples\}

주석이 포함된 테이블을 생성하려면 다음과 같이 합니다:

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT 'The temporary table';
```

테이블 주석을 수정하려면 다음과 같이 합니다:

```sql
ALTER TABLE table_with_comment 
MODIFY COMMENT 'new comment on a table';
```

수정된 주석을 확인하려면 다음을 실행합니다.

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment────────────────┐
│ new comment on a table │
└────────────────────────┘
```

테이블 주석을 제거하려면 다음을 실행하십시오:

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

주석이 제거되었는지 확인하려면 다음을 수행하십시오:

```sql title="Query"
SELECT comment 
FROM system.tables 
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="Response"
┌─comment─┐
│         │
└─────────┘
```


## 주의사항 \{#caveats\}

복제된 테이블(Replicated Table)에서는 레플리카마다 주석이 서로 다를 수 있습니다. 
주석을 수정하면 단일 레플리카에만 적용됩니다.

이 기능은 23.9 버전부터 사용할 수 있습니다. 이전 ClickHouse 버전에서는 동작하지 않습니다.



## 관련 콘텐츠 \{#related-content\}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 절
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
