---
'description': 'User에 대한 문서'
'sidebar_label': 'USER'
'sidebar_position': 39
'slug': '/sql-reference/statements/create/user'
'title': 'CREATE USER'
'doc_type': 'reference'
---

Creates [사용자 계정](../../../guides/sre/user-management/index.md#user-account-management).

Syntax:

```sql
CREATE USER [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [NOT IDENTIFIED | IDENTIFIED {[WITH {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] BY {'password' | 'hash'}} | WITH NO_PASSWORD | {WITH ldap SERVER 'server_name'} | {WITH kerberos [REALM 'realm']} | {WITH ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa|...'} | {WITH http SERVER 'server_name' [SCHEME 'Basic']} [VALID UNTIL datetime] 
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] BY {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [VALID UNTIL datetime]
    [IN access_storage_type]
    [DEFAULT ROLE role [,...]]
    [DEFAULT DATABASE database | NONE]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [READONLY | WRITABLE] | PROFILE 'profile_name'] [,...]
```

`ON CLUSTER` 절은 클러스터에서 사용자를 생성할 수 있게 해줍니다. [분산 DDL](../../../sql-reference/distributed-ddl.md)을 참조하세요.

## Identification {#identification}

사용자 식별 방법에는 여러 가지가 있습니다:

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` 또는 `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` 또는 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` 또는 `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` 또는 `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

비밀번호 복잡성 요구 사항은 [config.xml](/operations/configuration-files)에서 편집할 수 있습니다. 아래는 비밀번호가 최소 12자 이상이고 숫자가 1개 포함되도록 요구하는 구성 예입니다. 각 비밀번호 복잡성 규칙에는 비밀번호에 대해 일치하는 정규 표현식과 규칙에 대한 설명이 필요합니다.

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>be at least 12 characters long</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>contain at least 1 numeric character</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloud에서는 기본적으로 비밀번호가 다음 복잡성 요구 사항을 충족해야 합니다:
- 최소 12자 이상
- 최소 1개의 숫자가 포함
- 최소 1개의 대문자가 포함
- 최소 1개의 소문자가 포함
- 최소 1개의 특수 문자가 포함
:::

## Examples {#examples}

1. 다음 사용자 이름은 `name1`이며 비밀번호가 필요 없습니다 - 이는 분명히 보안이 강하지 않습니다:

```sql
CREATE USER name1 NOT IDENTIFIED
```

2. 평문 비밀번호를 지정하려면:

```sql
CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
```

    :::tip
    비밀번호는 `/var/lib/clickhouse/access`에 있는 SQL 텍스트 파일에 저장되므로 `plaintext_password`를 사용하는 것은 좋지 않습니다. 대신 `sha256_password`를 사용해 보세요, 다음 예시에서 보입니다...
    :::

3. 가장 일반적인 옵션은 SHA-256을 사용하여 해시된 비밀번호를 사용하는 것입니다. `IDENTIFIED WITH sha256_password`를 지정하면 ClickHouse가 비밀번호를 해시합니다. 예를 들면:

```sql
CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
```

    `name3` 사용자가 이제 `my_password`를 사용하여 로그인할 수 있지만, 비밀번호는 위의 해시된 값으로 저장됩니다. `/var/lib/clickhouse/access`에 다음 SQL 파일이 생성되었고 서버 시작 시 실행됩니다:

```bash
/var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
```

    :::tip
    이미 사용자 이름에 대해 해시 값과 해당 소금 값이 생성된 경우, `IDENTIFIED WITH sha256_hash BY 'hash'` 또는 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`를 사용할 수 있습니다. `SALT`를 사용하여 `sha256_hash`로 식별하는 경우, 해시는 'password'와 'salt'를 연결하여 계산해야 합니다.
    :::

4. `double_sha1_password`는 일반적으로 필요하지 않지만, 이를 요구하는 클라이언트와 작업할 때 유용합니다 (예: MySQL 인터페이스):

```sql
CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
```

    ClickHouse는 다음 쿼리를 생성하고 실행합니다:

```response
CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
```

5. `bcrypt_password`는 비밀번호를 저장하는 가장 안전한 옵션입니다. 이는 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 알고리즘을 사용하며, 비밀번호 해시가 손상된 경우에도 무차별 대입 공격에 저항력이 있습니다.

```sql
CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
```

    이 방법으로 비밀번호의 길이는 72자로 제한됩니다. 해시를 계산하고 비밀번호를 검증하는 데 필요한 계산량과 시간을 정의하는 bcrypt 작업 계수 매개변수는 서버 구성에서 수정할 수 있습니다:

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

    작업 계수는 4에서 31 사이여야 하며, 기본값은 12입니다.

   :::warning
   높은 빈도의 인증이 필요한 응용 프로그램에서는,
   bcrypt의 계산 부담으로 인해 대체 인증 방법을 고려하세요.
   :::

6. 
   비밀번호 유형을 생략할 수도 있습니다:

```sql
CREATE USER name6 IDENTIFIED BY 'my_password'
```

    이 경우 ClickHouse는 서버 구성에서 지정된 기본 비밀번호 유형을 사용합니다:

```xml
<default_password_type>sha256_password</default_password_type>
```

    사용 가능한 비밀번호 유형은: `plaintext_password`, `sha256_password`, `double_sha1_password`입니다.

7. 여러 인증 방법을 지정할 수 있습니다:

```sql
CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
```

Notes:
1. 이전 버전의 ClickHouse는 여러 인증 방법의 구문을 지원하지 않을 수 있습니다. 따라서 ClickHouse 서버에 그러한 사용자가 있고 지원하지 않는 버전으로 다운그레이드하면 이러한 사용자는 사용 불가능하게 되고 일부 사용자 관련 작업이 중단됩니다. 원활하게 다운그레이드하려면 다운그레이드 전에 모든 사용자가 단일 인증 방법을 포함하도록 설정해야 합니다. 또는 적절한 절차 없이 서버가 다운그레이드된 경우, 문제 있는 사용자를 삭제해야 합니다.
2. 보안상의 이유로 `no_password`는 다른 인증 방법과 공존할 수 없습니다. 따라서 쿼리에서 유일한 인증 방법이 아닌 경우에만 `no_password`를 지정할 수 있습니다.

## User Host {#user-host}

사용자 호스트는 ClickHouse 서버와의 연결을 설정할 수 있는 호스트입니다. 호스트는 다음과 같은 방법으로 `HOST` 쿼리 섹션에서 지정할 수 있습니다:

- `HOST IP 'ip_address_or_subnetwork'` — 사용자는 지정된 IP 주소 또는 [서브네트워크](https://en.wikipedia.org/wiki/Subnetwork)에서만 ClickHouse 서버에 연결할 수 있습니다. 예: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`. 프로덕션 환경에서는 오직 `HOST IP` 요소(IPv4 주소와 그 마스크)만 지정하세요. `host` 및 `host_regexp`를 사용하는 경우 추가 지연이 발생할 수 있습니다.
- `HOST ANY` — 사용자는 어떤 위치에서도 연결할 수 있습니다. 이것이 기본 옵션입니다.
- `HOST LOCAL` — 사용자는 로컬에서만 연결할 수 있습니다.
- `HOST NAME 'fqdn'` — 사용자 호스트를 FQDN으로 지정할 수 있습니다. 예: `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — 사용자 호스트를 지정할 때 [pcre](http://www.pcre.org/) 정규 표현식을 사용할 수 있습니다. 예: `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — [LIKE](/sql-reference/functions/string-search-functions#like) 연산자를 사용하여 사용자 호스트를 필터링할 수 있습니다. 예: `HOST LIKE '%'`는 `HOST ANY`와 동일하며, `HOST LIKE '%.mysite.com'`은 `mysite.com` 도메인에 있는 모든 호스트를 필터링합니다.

호스트를 지정하는 또 다른 방법은 사용자 이름 뒤에 `@` 구문을 사용하는 것입니다. 예:

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 구문과 동일합니다.
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 구문과 동일합니다.
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 구문과 동일합니다.

:::tip
ClickHouse는 `user_name@'address'`를 전체 사용자 이름으로 처리합니다. 따라서 기술적으로는 동일한 `user_name`과 `@` 뒤에 다른 구조로 여러 사용자를 생성할 수 있습니다. 하지만 그렇게 하는 것은 권장하지 않습니다.
:::

## VALID UNTIL Clause {#valid-until-clause}

인증 방법의 만료 날짜와 선택적으로 시간을 지정할 수 있게 해줍니다. 문자열을 매개변수로 받습니다. 날짜 및 시간에 대해 `YYYY-MM-DD [hh:mm:ss] [timezone]` 형식을 사용하는 것이 좋습니다. 기본적으로 이 매개변수는 `'infinity'`와 같습니다.
`VALID UNTIL` 절은 인증 방법과 함께만 지정할 수 있으며, 쿼리에서 인증 방법이 지정되지 않은 경우에는 기존의 모든 인증 방법에 적용됩니다.

예시:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES Clause {#grantees-clause}

이 사용자가 [권한](../../../sql-reference/statements/grant.md#privileges)을 부여할 수 있도록 허용된 사용자 또는 역할을 지정합니다. 이 경우 사용자는 또한 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)으로 필요한 모든 액세스가 부여되어야 합니다. `GRANTEES` 절의 옵션:

- `user` — 이 사용자가 권한을 부여할 수 있는 사용자를 지정합니다.
- `role` — 이 사용자가 권한을 부여할 수 있는 역할을 지정합니다.
- `ANY` — 이 사용자는 누구에게나 권한을 부여할 수 있습니다. 기본 설정입니다.
- `NONE` — 이 사용자는 아무에게도 권한을 부여할 수 없습니다.

`EXCEPT` 표현식을 사용하여 특정 사용자나 역할을 제외할 수 있습니다. 예: `CREATE USER user1 GRANTEES ANY EXCEPT user2`. 이는 `user1`이 `GRANT OPTION`으로 부여된 권한이 있는 경우 `user2`를 제외한 누구에게든 그 권한을 부여할 수 있음을 의미합니다.

## Examples {#examples-1}

`qwerty` 비밀번호로 보호되는 사용자 계정 `mira`를 생성합니다:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira`는 ClickHouse 서버가 실행되는 호스트에서 클라이언트 앱을 시작해야 합니다.

역할을 할당하고 이 역할을 기본값으로 만들면서 사용자 계정 `john`을 생성합니다:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

사용자 계정 `john`을 생성하고 이 사용자의 모든 향후 역할을 기본값으로 설정합니다:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

미래에 어떤 역할이 `john`에게 할당되면, 그것은 자동으로 기본값이 됩니다.

사용자 계정 `john`을 생성하고 모든 향후 역할을 기본값으로 설정하되 `role1`과 `role2`는 제외합니다:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

사용자 계정 `john`을 생성하고 그가 `jack` 계정의 사용자에게 자신의 권한을 부여할 수 있도록 허용합니다:

```sql
CREATE USER john GRANTEES jack;
```

쿼리 매개변수를 사용하여 사용자 계정 `john`을 생성합니다:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
