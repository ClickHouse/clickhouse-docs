---
description: 'CHECK GRANT에 대한 문서'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'CHECK GRANT SQL 문'
doc_type: 'reference'
---

`CHECK GRANT` 쿼리는 현재 사용자나 역할에 특정 권한이 부여되어 있는지 확인하는 데 사용합니다.



## 구문 \{#syntax\}

쿼리의 기본 구문은 다음과 같습니다.

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

* `privilege` — 권한의 종류입니다.


## 예시 \{#examples\}

이전에 해당 권한이 부여되어 있었다면 응답 값 `check_grant`가 `1`이 됩니다. 그렇지 않으면 응답 값 `check_grant`가 `0`이 됩니다.

`table_1.col1` 이 존재하고 현재 사용자에게 `SELECT`/`SELECT(con)` 권한 또는 해당 권한이 포함된 역할이 부여되어 있는 경우, 응답은 `1`이 됩니다.

```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```

`table_2.col2`가 존재하지 않거나, 현재 사용자에게 `SELECT`/`SELECT(con)` 권한 또는 해당 권한을 가진 역할이 부여되지 않은 경우, 응답은 `0`입니다.

```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```


## Wildcard \{#wildcard\}
권한을 지정할 때 테이블 이름이나 데이터베이스 이름 대신 별표(`*`)를 사용할 수 있습니다. 와일드카드 사용 규칙은 [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants)를 참고하십시오.
