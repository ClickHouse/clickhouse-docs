---
description: '역할(Role)에 대한 문서'
sidebar_label: 'ROLE'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: 'CREATE ROLE'
doc_type: 'reference'
---

새로운 [역할](../../../guides/sre/user-management/index.md#role-management)을 생성합니다. 역할은 [권한](/sql-reference/statements/grant#granting-privilege-syntax)의 집합입니다. 역할이 할당된 [사용자](../../../sql-reference/statements/create/user.md)는 해당 역할에 속한 모든 권한을 부여받습니다.

구문:

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```


## 역할 관리 \{#managing-roles\}

사용자는 여러 개의 역할을 할당받을 수 있습니다. 사용자는 [SET ROLE](../../../sql-reference/statements/set-role.md) SQL 문을 사용하여 할당된 역할을 임의의 조합으로 적용할 수 있습니다. 최종적으로 부여되는 권한 범위는 적용된 모든 역할의 모든 권한을 합한 결과입니다. 사용자 계정에 직접 부여된 권한이 있는 경우, 해당 권한도 역할을 통해 부여된 권한과 함께 합쳐집니다.

사용자는 로그인 시 적용되는 기본 역할을 가질 수 있습니다. 기본 역할을 설정하려면 [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) SQL 문 또는 [ALTER USER](/sql-reference/statements/alter/user) SQL 문을 사용합니다.

역할을 취소하려면 [REVOKE](../../../sql-reference/statements/revoke.md) SQL 문을 사용합니다.

역할을 삭제하려면 [DROP ROLE](/sql-reference/statements/drop#drop-role) SQL 문을 사용합니다. 삭제된 역할은 해당 역할이 할당되어 있던 모든 사용자와 역할에서 자동으로 해제됩니다.



## 예제 \{#examples\}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

이 일련의 쿼리는 `db` 데이터베이스에서 데이터를 읽을 수 있는 권한을 가진 역할 `accountant`를 생성합니다.

역할을 사용자 `mira`에게 할당합니다:

```sql
GRANT accountant TO mira;
```

역할이 부여된 후에는 사용자가 해당 역할을 적용하여 허용된 쿼리를 실행할 수 있습니다. 예를 들어:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
