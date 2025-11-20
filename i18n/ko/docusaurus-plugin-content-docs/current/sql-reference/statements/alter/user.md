---
'description': '사용자에 대한 Documentation'
'sidebar_label': 'USER'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/user'
'title': 'ALTER USER'
'doc_type': 'reference'
---

변경 사항 ClickHouse 사용자 계정.

구문:

```sql
ALTER USER [IF EXISTS] name1 [RENAME TO new_name |, name2 [,...]] 
    [ON CLUSTER cluster_name]
    [NOT IDENTIFIED | RESET AUTHENTICATION METHODS TO NEW | {IDENTIFIED | ADD IDENTIFIED} {[WITH {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] BY {'password' | 'hash'}} | WITH NO_PASSWORD | {WITH ldap SERVER 'server_name'} | {WITH kerberos [REALM 'realm']} | {WITH ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa|...'} | {WITH http SERVER 'server_name' [SCHEME 'Basic']} [VALID UNTIL datetime]
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] BY {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [[ADD | DROP] HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [VALID UNTIL datetime]
    [DEFAULT ROLE role [,...] | ALL | ALL EXCEPT role [,...] ]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [DROP ALL PROFILES]
    [DROP ALL SETTINGS]
    [DROP SETTINGS variable [,...] ]
    [DROP PROFILES 'profile_name' [,...] ]
    [ADD|MODIFY SETTINGS variable [=value] [MIN [=] min_value] [MAX [=] max_value] [READONLY|WRITABLE|CONST|CHANGEABLE_IN_READONLY] [,...] ]
    [ADD PROFILES 'profile_name' [,...] ]
```

`ALTER USER`를 사용하려면 [ALTER USER](../../../sql-reference/statements/grant.md#access-management) 권한이 필요합니다.

## GRANTEES 절 {#grantees-clause}

이 사용자가 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)으로 필요한 모든 액세스 권한을 가진 조건에서 이 사용자로부터 [privileges](../../../sql-reference/statements/grant.md#privileges)를 받을 수 있는 사용자 또는 역할을 지정합니다. `GRANTEES` 절의 옵션:

- `user` — 이 사용자가 권한을 부여할 수 있는 사용자를 지정합니다.
- `role` — 이 사용자가 권한을 부여할 수 있는 역할을 지정합니다.
- `ANY` — 이 사용자가 누구에게나 권한을 부여할 수 있습니다. 기본 설정입니다.
- `NONE` — 이 사용자가 권한을 부여할 수 없습니다.

`EXCEPT` 표현식을 사용하여 모든 사용자 또는 역할을 제외할 수 있습니다. 예를 들어, `ALTER USER user1 GRANTEES ANY EXCEPT user2`와 같이 사용할 수 있습니다. 이는 `user1`이 `GRANT OPTION`으로 부여된 일부 권한을 가진 경우 `user2`를 제외한 누구에게라도 해당 권한을 부여할 수 있음을 의미합니다.

## 예제 {#examples}

할당된 역할을 기본으로 설정:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

사용자에게 이전에 역할이 할당되지 않은 경우, ClickHouse는 예외를 발생시킵니다.

할당된 모든 역할을 기본으로 설정:

```sql
ALTER USER user DEFAULT ROLE ALL
```

앞으로 사용자에게 역할이 할당되는 경우, 자동으로 기본값이 됩니다.

`role1`과 `role2`를 제외한 모든 할당된 역할을 기본으로 설정:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john` 계정을 가진 사용자가 `jack` 계정을 가진 사용자에게 자신의 권한을 부여할 수 있게 합니다:

```sql
ALTER USER john GRANTEES jack;
```

기존 방법을 유지하면서 사용자에게 새로운 인증 방법을 추가합니다:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

참고:
1. 이전 버전의 ClickHouse는 여러 인증 방법의 구문을 지원하지 않을 수 있습니다. 따라서 ClickHouse 서버에 이러한 사용자가 있고, 이를 지원하지 않는 버전으로 다운그레이드하면 이러한 사용자는 사용할 수 없게 되며, 일부 사용자 관련 작업이 중단될 수 있습니다. 원활하게 다운그레이드하기 위해서는, 다운그레이드 전에 모든 사용자가 단일 인증 방법을 포함해야 합니다. 대안으로, 서버가 적절한 절차 없이 다운그레이드된 경우, 문제가 있는 사용자는 삭제해야 합니다.
2. `no_password`는 보안상의 이유로 다른 인증 방법과 coexist할 수 없습니다. 그렇기 때문에 `no_password` 인증 방법을 `ADD`할 수 없습니다. 아래 쿼리는 오류를 발생시킬 것입니다:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

사용자의 인증 방법을 삭제하고 `no_password`에 의존하려면 아래의 대체 형식으로 지정해야 합니다.

인증 방법을 재설정하고 쿼리에 지정된 방법을 추가합니다 (ADD 키워드 없이 IDENTIFIED를 사용하는 효과):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

인증 방법을 재설정하고 가장 최근에 추가된 방법을 유지합니다:
```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 절 {#valid-until-clause}

인증 방법의 만료 날짜와 선택적으로 시간을 지정할 수 있게 합니다. 문자열을 매개변수로 사용합니다. 날짜 시간 형식으로 `YYYY-MM-DD [hh:mm:ss] [timezone]` 형식을 사용하는 것이 권장됩니다. 기본적으로 이 매개변수는 `'infinity'`로 설정되어 있습니다. `VALID UNTIL` 절은 인증 방법과 함께만 지정할 수 있으며, 쿼리에 인증 방법이 지정되지 않은 경우를 제외합니다. 이 시나리오에서 `VALID UNTIL` 절은 모든 기존 인증 방법에 적용됩니다.

예제:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
