---
'description': 'REVOKE 语句에 대한 문서'
'sidebar_label': 'REVOKE'
'sidebar_position': 39
'slug': '/sql-reference/statements/revoke'
'title': 'REVOKE 문'
'doc_type': 'reference'
---


# REVOKE 문

사용자 또는 역할로부터 권한을 철회합니다.

## 구문 {#syntax}

**사용자에게서 권한 철회하기**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**사용자에게서 역할 철회하기**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```

## 설명 {#description}

특정 권한을 철회하려면, 철회하려는 권한보다 더 넓은 범위의 권한을 사용할 수 있습니다. 예를 들어, 사용자가 `SELECT (x,y)` 권한을 가지고 있는 경우, 관리자는 `REVOKE SELECT(x,y) ...`, 또는 `REVOKE SELECT * ...`, 심지어는 `REVOKE ALL PRIVILEGES ...` 쿼리를 실행하여 이 권한을 철회할 수 있습니다.

### 부분 철회 {#partial-revokes}

권한의 일부를 철회할 수 있습니다. 예를 들어, 사용자가 `SELECT *.*` 권한을 가지고 있는 경우, 특정 테이블이나 데이터베이스의 데이터를 읽을 수 있는 권한을 철회할 수 있습니다.

## 예제 {#examples}

`john` 사용자 계정에 모든 데이터베이스에서, `accounts` 데이터베이스를 제외하고 선택할 수 있는 권한을 부여합니다:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

`mira` 사용자 계정에 `accounts.staff` 테이블의 모든 컬럼에서, `wage` 컬럼을 제외하고 선택할 수 있는 권한을 부여합니다.

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[원본 기사](/operations/settings/settings/)
