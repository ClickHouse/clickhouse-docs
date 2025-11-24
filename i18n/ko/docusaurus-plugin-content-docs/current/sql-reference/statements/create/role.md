---
'description': 'ROLE에 대한 문서'
'sidebar_label': 'ROLE'
'sidebar_position': 40
'slug': '/sql-reference/statements/create/role'
'title': 'CREATE ROLE'
'doc_type': 'reference'
---

새로운 [역할](../../../guides/sre/user-management/index.md#role-management)을 생성합니다. 역할은 [권한](/sql-reference/statements/grant#granting-privilege-syntax)의 집합입니다. 역할이 할당된 [사용자](../../../sql-reference/statements/create/user.md)는 이 역할의 모든 권한을 갖습니다.

구문:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## 역할 관리 {#managing-roles}

사용자는 여러 개의 역할을 할당받을 수 있습니다. 사용자는 [SET ROLE](../../../sql-reference/statements/set-role.md) 문을 통해 할당된 역할을 임의의 조합으로 사용할 수 있습니다. 최종 권한의 범위는 모든 적용된 역할의 모든 권한의 결합된 집합입니다. 사용자가 사용자 계정에 대해 직접 부여된 권한을 갖고 있다면, 이는 역할에 의해 부여된 권한과도 결합됩니다.

사용자는 로그인할 때 적용되는 기본 역할을 가질 수 있습니다. 기본 역할을 설정하려면 [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 문이나 [ALTER USER](/sql-reference/statements/alter/user) 문을 사용하십시오.

역할을 취소하려면 [REVOKE](../../../sql-reference/statements/revoke.md) 문을 사용하십시오.

역할을 삭제하려면 [DROP ROLE](/sql-reference/statements/drop#drop-role) 문을 사용하십시오. 삭제된 역할은 할당되었던 모든 사용자와 역할에서 자동으로 취소됩니다.

## 예제 {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

이 쿼리 시퀀스는 `db` 데이터베이스에서 데이터를 읽는 권한을 가진 역할 `accountant`를 생성합니다.

사용자 `mira`에게 역할을 할당합니다:

```sql
GRANT accountant TO mira;
```

역할이 할당된 후, 사용자는 이를 적용하고 허용된 쿼리를 실행할 수 있습니다. 예를 들어:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
