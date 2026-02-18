---
description: 'USER에 대한 문서'
sidebar_label: 'USER'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'CREATE USER'
doc_type: 'reference'
---

[사용자 계정](../../../guides/sre/user-management/index.md#user-account-management)을 생성합니다.

구문:

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

`ON CLUSTER` 절을 사용하면 클러스터 전체에서 사용자를 생성할 수 있습니다. 자세한 내용은 [분산 DDL](../../../sql-reference/distributed-ddl.md)을 참조하십시오.


## 식별 \{#identification\}

USER를 식별하는 방법은 여러 가지가 있습니다:

* `IDENTIFIED WITH no_password`
* `IDENTIFIED WITH plaintext_password BY 'qwerty'`
* `IDENTIFIED WITH sha256_password BY 'qwerty'` 또는 `IDENTIFIED BY 'password'`
* `IDENTIFIED WITH sha256_hash BY 'hash'` 또는 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
* `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
* `IDENTIFIED WITH double_sha1_hash BY 'hash'`
* `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
* `IDENTIFIED WITH bcrypt_hash BY 'hash'`
* `IDENTIFIED WITH ldap SERVER 'server_name'`
* `IDENTIFIED WITH kerberos` 또는 `IDENTIFIED WITH kerberos REALM 'realm'`
* `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
* `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
* `IDENTIFIED WITH http SERVER 'http_server'` 또는 `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
* `IDENTIFIED BY 'qwerty'`

비밀번호 복잡도 요구 사항은 [config.xml](/operations/configuration-files)에서 수정할 수 있습니다. 아래는 비밀번호가 최소 12자 이상이고 숫자를 1개 이상 포함하도록 요구하는 예시 구성입니다. 각 비밀번호 복잡도 규칙에는 비밀번호와 매칭할 정규식(regex)과 규칙에 대한 설명이 필요합니다.

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
ClickHouse Cloud에서는 기본적으로 비밀번호가 다음 복잡성 요건을 충족해야 합니다:

* 길이가 12자 이상이어야 합니다
* 숫자가 최소 1개 포함되어야 합니다
* 대문자가 최소 1개 포함되어야 합니다
* 소문자가 최소 1개 포함되어야 합니다
* 특수 문자가 최소 1개 포함되어야 합니다
  :::


## 예제 \{#examples\}

1. 다음 사용자 이름은 `name1`이며 비밀번호가 필요하지 않습니다. 보안 측면에서는 거의 도움이 되지 않습니다.

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. 평문 비밀번호를 지정하려면:

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    비밀번호는 `/var/lib/clickhouse/access`의 SQL 텍스트 파일에 저장되므로 `plaintext_password`를 사용하는 것은 좋지 않습니다. 다음 예시와 같이 `sha256_password` 사용을 권장합니다.
    :::

3. 가장 일반적인 옵션은 SHA-256으로 해시된 비밀번호를 사용하는 것입니다. ClickHouse는 `IDENTIFIED WITH sha256_password`를 지정하면 비밀번호를 자동으로 해시합니다. 예시는 다음과 같습니다:

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    이제 `name3` 사용자는 `my_password`로 로그인할 수 있지만, 비밀번호는 위에 표시된 해시 값으로 저장됩니다. 다음 SQL 파일이 `/var/lib/clickhouse/access`에 생성되며 서버 시작 시 실행됩니다:

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    이미 사용자 이름에 대한 해시 값과 해당 salt 값을 만들어 둔 경우 `IDENTIFIED WITH sha256_hash BY 'hash'` 또는 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`를 사용할 수 있습니다. `SALT`와 함께 `sha256_hash`로 식별하는 경우, 해시는 'password'와 'salt'를 이어 붙인 값에서 계산해야 합니다.
    :::

4. `double_sha1_password`는 일반적으로 필요하지 않지만 (MySQL 인터페이스와 같이) 이를 요구하는 클라이언트와 작업할 때 유용합니다.

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse는 다음 쿼리를 생성하여 실행합니다:

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password`는 비밀번호 저장 방식 중 가장 안전한 옵션입니다. 비밀번호 해시가 유출되더라도 무차별 대입 공격에 견딜 수 있는 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 알고리즘을 사용합니다.

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    이 방식에서는 비밀번호 길이가 최대 72자까지로 제한됩니다. 해시 계산 및 비밀번호 검증에 필요한 연산량과 시간을 정의하는 bcrypt work factor 파라미터는 서버 설정에서 변경할 수 있습니다:

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    work factor는 4에서 31 사이의 값이어야 하며, 기본값은 12입니다.

   :::warning
   인증 요청 빈도가 높은 애플리케이션에서는,
   높은 work factor에서 bcrypt의 연산 오버헤드를 고려하여
   다른 인증 방식을 사용하는 것을 고려하는 것이 좋습니다.
   :::

6. 비밀번호 유형은 생략할 수도 있습니다:

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    이 경우 ClickHouse는 서버 설정에 지정된 기본 비밀번호 유형을 사용합니다:

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    사용 가능한 비밀번호 유형은 다음과 같습니다: `plaintext_password`, `sha256_password`, `double_sha1_password`.

7. 여러 인증 방법을 함께 지정할 수도 있습니다: 

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

참고:

1. 이전 버전의 ClickHouse는 여러 인증 방법을 지정하는 구문을 지원하지 않을 수 있습니다. 따라서 ClickHouse 서버에 이러한 사용자가 있는 상태에서 이를 지원하지 않는 버전으로 다운그레이드하면, 해당 사용자는 사용할 수 없게 되고 사용자 관련 일부 작업이 실패하게 됩니다. 원활하게 다운그레이드하려면 다운그레이드 전에 모든 사용자가 하나의 인증 방법만 사용하도록 설정해야 합니다. 또는 위 절차 없이 서버를 다운그레이드한 경우, 문제가 있는 사용자는 삭제해야 합니다.
2. 보안상의 이유로 `no_password`는 다른 인증 방법과 함께 사용할 수 없습니다. 따라서 `no_password`는 쿼리에서 유일한 인증 방법인 경우에만 지정할 수 있습니다. 

## User Host \{#user-host\}

User host는 ClickHouse 서버로의 연결을 허용하는 호스트를 의미합니다. 호스트는 `HOST` 쿼리 섹션에서 다음과 같은 방식으로 지정할 수 있습니다:

- `HOST IP 'ip_address_or_subnetwork'` — 사용자는 지정된 IP 주소 또는 [서브네트워크](https://en.wikipedia.org/wiki/Subnetwork)에서만 ClickHouse 서버에 연결할 수 있습니다. 예를 들면 `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`와 같습니다. 운영 환경에서는 `host` 및 `host_regexp`를 사용하면 추가 지연이 발생할 수 있으므로, `HOST IP` 요소(IP 주소 및 해당 마스크)만 지정하는 것이 좋습니다.
- `HOST ANY` — 사용자는 어느 위치에서든 연결할 수 있습니다. 기본 옵션입니다.
- `HOST LOCAL` — 사용자는 로컬에서만 연결할 수 있습니다.
- `HOST NAME 'fqdn'` — User host를 FQDN으로 지정할 수 있습니다. 예: `HOST NAME 'mysite.com'`.
- `HOST REGEXP 'regexp'` — user host를 지정할 때 [pcre](http://www.pcre.org/) 정규식을 사용할 수 있습니다. 예: `HOST REGEXP '.*\.mysite\.com'`.
- `HOST LIKE 'template'` — user host를 필터링하기 위해 [LIKE](/sql-reference/functions/string-search-functions#like) 연산자를 사용할 수 있습니다. 예를 들어, `HOST LIKE '%'`는 `HOST ANY`와 같으며, `HOST LIKE '%.mysite.com'`은 `mysite.com` 도메인에 속한 모든 호스트를 필터링합니다.

호스트를 지정하는 또 다른 방법은 사용자 이름 뒤에 `@` 구문을 사용하는 것입니다. 예:

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 구문과 동일합니다.
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 구문과 동일합니다.
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 구문과 동일합니다.

:::tip
ClickHouse는 `user_name@'address'` 전체를 하나의 사용자 이름으로 취급합니다. 따라서 기술적으로는 동일한 `user_name`에 대해 `@` 뒤에 서로 다른 표기를 사용해 여러 사용자를 생성할 수 있습니다. 그러나 이러한 방식은 권장하지 않습니다.
:::

## VALID UNTIL 절 \{#valid-until-clause\}

인증 방법의 만료 날짜와 필요에 따라 시간을 지정할 수 있습니다. 이 절은 문자열을 인수로 받습니다. datetime에는 `YYYY-MM-DD [hh:mm:ss] [timezone]` 형식을 사용할 것을 권장합니다. 기본적으로 이 파라미터의 값은 `'infinity'`입니다.
`VALID UNTIL` 절은 쿼리에서 인증 방법이 전혀 지정되지 않은 경우를 제외하고, 인증 방법과 함께만 지정할 수 있습니다. 이와 같은 경우에는 `VALID UNTIL` 절이 기존의 모든 인증 방법에 적용됩니다.

예:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`

## GRANTEES 절 \{#grantees-clause\}

이 사용자가 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)을 통해 필요한 모든 권한을 부여받았다는 조건에서, 이 사용자로부터 [권한(privileges)](../../../sql-reference/statements/grant.md#privileges)을 받을 수 있는 사용자 또는 역할을 지정합니다. `GRANTEES` 절의 옵션은 다음과 같습니다:

- `user` — 이 사용자가 권한을 부여할 수 있는 사용자를 지정합니다.
- `role` — 이 사용자가 권한을 부여할 수 있는 역할을 지정합니다.
- `ANY` — 이 사용자는 누구에게나 권한을 부여할 수 있습니다. 기본 설정입니다.
- `NONE` — 이 사용자는 누구에게도 권한을 부여할 수 없습니다.

`EXCEPT` 식을 사용하여 특정 사용자나 역할을 제외할 수 있습니다. 예를 들어, `CREATE USER user1 GRANTEES ANY EXCEPT user2`는 `user1`에게 일부 권한이 `GRANT OPTION`과 함께 부여되어 있다면, `user2`를 제외한 누구에게나 해당 권한을 부여할 수 있음을 의미합니다.

## 예제 \{#examples-1\}

비밀번호 `qwerty`로 보호되는 `mira` 사용자 계정을 생성합니다:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira`는 ClickHouse 서버가 실행 중인 호스트에서 클라이언트 애플리케이션을 시작해야 합니다.

사용자 계정 `john`을 생성하고 해당 계정에 역할을 할당한 뒤, 이 역할들을 기본 역할로 지정하십시오:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

`john` 사용자 계정을 생성하고, 이후 이 사용자에게 부여될 모든 역할을 기본 역할로 설정합니다.

```sql
CREATE USER john DEFAULT ROLE ALL;
```

향후 `john`에게 어떤 역할이 부여되면 자동으로 기본 역할이 됩니다.

사용자 계정 `john`을 생성하고, 앞으로 부여될 역할 중에서 `role1`과 `role2`를 제외한 나머지 모든 역할을 기본 역할로 설정합니다:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

`john` 사용자 계정을 생성하고, 이 계정의 권한을 `jack` 계정 사용자에게 부여할 수 있도록 설정합니다:

```sql
CREATE USER john GRANTEES jack;
```

쿼리 파라미터를 사용하여 사용자 계정 `john`을 생성합니다:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
