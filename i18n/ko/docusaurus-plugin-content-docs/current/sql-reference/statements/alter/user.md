---
description: 'USER 문서'
sidebar_label: 'USER'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
doc_type: 'reference'
---

ClickHouse 사용자 계정을 변경합니다.

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


## GRANTEES Clause \{#grantees-clause\}

이 사용자로부터 [privileges](../../../sql-reference/statements/grant.md#privileges)를 부여받을 수 있는 사용자 또는 역할을 지정합니다. 단, 이 사용자에게도 모든 필요한 접근 권한이 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)으로 부여되어 있어야 합니다. `GRANTEES` 절의 옵션은 다음과 같습니다.

- `user` — 이 사용자가 권한을 부여할 수 있는 사용자를 지정합니다.
- `role` — 이 사용자가 권한을 부여할 수 있는 역할을 지정합니다.
- `ANY` — 이 사용자는 누구에게나 권한을 부여할 수 있습니다. 기본 설정입니다.
- `NONE` — 이 사용자는 누구에게도 권한을 부여할 수 없습니다.

`EXCEPT` 식을 사용하여 특정 사용자 또는 역할을 제외할 수 있습니다. 예: `ALTER USER user1 GRANTEES ANY EXCEPT user2`. 이는 `user1`에게 `GRANT OPTION`으로 부여된 권한이 있으면 `user2`를 제외한 누구에게나 해당 권한을 부여할 수 있음을 의미합니다.



## 예시 \{#examples\}

할당된 역할을 기본값으로 지정합니다:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

역할이 사용자에게 사전에 할당되지 않은 경우 ClickHouse는 예외를 던집니다.

할당된 모든 역할을 기본 역할로 설정하십시오:

```sql
ALTER USER user DEFAULT ROLE ALL
```

역할이 나중에 사용자에게 할당되면 자동으로 기본값이 됩니다.

`role1`과 `role2`를 제외하고 할당된 모든 역할을 기본값으로 설정합니다:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john` 계정 사용자가 자신의 권한을 `jack` 계정 사용자에게 부여할 수 있도록 설정합니다:

```sql
ALTER USER john GRANTEES jack;
```

기존 인증 방법은 유지한 채 USER에 새로운 인증 방법을 추가합니다:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

주의사항:

1. 이전 버전의 ClickHouse는 여러 인증 메서드 구문을 지원하지 않을 수 있습니다. 따라서 ClickHouse 서버에 이러한 사용자가 존재하는 상태에서 지원하지 않는 버전으로 다운그레이드하면, 해당 사용자는 더 이상 사용할 수 없게 되고 사용자 관련 일부 작업이 실패하게 됩니다. 원활하게 다운그레이드하려면, 다운그레이드 전에 모든 사용자가 단일 인증 메서드만 사용하도록 설정해야 합니다. 또는 올바른 절차 없이 서버를 다운그레이드했다면, 문제가 있는 사용자를 삭제해야 합니다.
2. 보안상의 이유로 `no_password`는 다른 인증 메서드와 동시에 존재할 수 없습니다.
   이 때문에 `no_password` 인증 메서드를 `ADD`하는 것은 불가능합니다. 아래 쿼리는 오류를 발생시킵니다:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

사용자에 대한 인증 방법을 삭제하고 `no_password`만 사용하려면, 아래의 대체 구문에서 이를 지정해야 합니다.

인증 방법을 초기화한 다음, 쿼리에서 지정한 인증 방법만 추가합니다(ADD 키워드 없이 선행하는 IDENTIFIED 절을 사용했을 때와 동일한 효과입니다).

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

인증 방법을 초기화하고 가장 최근에 추가된 것만 유지합니다.

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```


## VALID UNTIL 절 \{#valid-until-clause\}

인증 방법의 만료 날짜와, 선택적으로 만료 시간을 지정할 수 있습니다. 문자열 매개변수를 받습니다. datetime 값에는 `YYYY-MM-DD [hh:mm:ss] [timezone]` 형식의 사용을 권장합니다. 기본적으로 이 매개변수의 값은 `'infinity'`입니다.
`VALID UNTIL` 절은 쿼리에서 어떤 인증 방법도 지정되지 않은 경우를 제외하고, 항상 인증 방법과 함께만 사용할 수 있습니다. 이 경우 `VALID UNTIL` 절은 기존의 모든 인증 방법에 적용됩니다.

예:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
