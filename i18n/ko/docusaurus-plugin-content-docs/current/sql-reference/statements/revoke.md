---
description: 'REVOKE SQL 문 문서'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'REVOKE SQL 문'
doc_type: 'reference'
---



# REVOKE 구문 \{#revoke-statement\}

사용자나 역할로부터 권한을 회수합니다.



## 구문 \{#syntax\}

**USER의 권한 취소**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**사용자에게서 역할 취소**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```


## Description \{#description\}

일부 권한을 회수할 때 실제로 회수하려는 범위보다 더 넓은 범위의 권한을 지정해 회수할 수 있습니다. 예를 들어 어떤 사용자가 `SELECT (x,y)` 권한을 가지고 있는 경우, 관리자는 이 권한을 회수하기 위해 `REVOKE SELECT(x,y) ...` 또는 `REVOKE SELECT * ...`, 심지어 `REVOKE ALL PRIVILEGES ...` 쿼리를 실행할 수도 있습니다.

### Partial Revokes \{#partial-revokes\}

권한의 일부만 회수할 수 있습니다. 예를 들어 어떤 사용자가 `SELECT *.*` 권한을 가지고 있는 경우, 특정 테이블이나 데이터베이스의 데이터를 읽을 수 있는 권한만 선택적으로 회수할 수 있습니다.



## 예시 \{#examples\}

`john` 사용자 계정에 `accounts` 데이터베이스를 제외하고 모든 데이터베이스에서의 SELECT 권한을 부여합니다:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira` 사용자 계정에 `accounts.staff` 테이블에서 `wage` 컬럼을 제외한 모든 컬럼에 대한 SELECT 권한을 부여합니다.

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[원문 문서](/operations/settings/settings/)
