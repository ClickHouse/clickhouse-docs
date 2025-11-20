---
'description': '사용자 및 역할 구성을 위한 설정.'
'sidebar_label': '사용자 설정'
'sidebar_position': 63
'slug': '/operations/settings/settings-users'
'title': '사용자 및 역할 설정'
'doc_type': 'reference'
---


# 사용자 및 역할 설정

`users.xml` 구성 파일의 `users` 섹션에는 사용자 설정이 포함되어 있습니다.

:::note
ClickHouse는 사용자 관리를 위한 [SQL 기반 워크플로우](/operations/access-rights#access-control-usage)도 지원합니다. 사용을 권장합니다.
:::

`users` 섹션의 구조:

```xml
<users>
    <!-- If user name was not specified, 'default' user is used. -->
    <user_name>
        <password></password>
        <!-- Or -->
        <password_sha256_hex></password_sha256_hex>

        <ssh_keys>
            <ssh_key>
                <type>ssh-ed25519</type>
                <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
            </ssh_key>
            <ssh_key>
                <type>ecdsa-sha2-nistp256</type>
                <base64_key>AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNxeV2uN5UY6CUbCzTA1rXfYimKQA5ivNIqxdax4bcMXz4D0nSk2l5E1TkR5mG8EBWtmExSPbcEPJ8V7lyWWbA8=</base64_key>
            </ssh_key>
            <ssh_key>
                <type>ssh-rsa</type>
                <base64_key>AAAAB3NzaC1yc2EAAAADAQABAAABgQCpgqL1SHhPVBOTFlOm0pu+cYBbADzC2jL41sPMawYCJHDyHuq7t+htaVVh2fRgpAPmSEnLEC2d4BEIKMtPK3bfR8plJqVXlLt6Q8t4b1oUlnjb3VPA9P6iGcW7CV1FBkZQEVx8ckOfJ3F+kI5VsrRlEDgiecm/C1VPl0/9M2llW/mPUMaD65cM9nlZgM/hUeBrfxOEqM11gDYxEZm1aRSbZoY4dfdm3vzvpSQ6lrCrkjn3X2aSmaCLcOWJhfBWMovNDB8uiPuw54g3ioZ++qEQMlfxVsqXDGYhXCrsArOVuW/5RbReO79BvXqdssiYShfwo+GhQ0+aLWMIW/jgBkkqx/n7uKLzCMX7b2F+aebRYFh+/QXEj7SnihdVfr9ud6NN3MWzZ1ltfIczlEcFLrLJ1Yq57wW6wXtviWh59WvTWFiPejGjeSjjJyqqB49tKdFVFuBnIU5u/bch2DXVgiAEdQwUrIp1ACoYPq22HFFAYUJrL32y7RxX3PGzuAv3LOc=</base64_key>
            </ssh_key>
        </ssh_keys>

        <access_management>0|1</access_management>

        <networks incl="networks" replace="replace">
        </networks>

        <profile>profile_name</profile>

        <quota>default</quota>
        <default_database>default</default_database>
        <databases>
            <database_name>
                <table_name>
                    <filter>expression</filter>
                </table_name>
            </database_name>
        </databases>

        <grants>
            <query>GRANT SELECT ON system.*</query>
        </grants>
    </user_name>
    <!-- Other users settings -->
</users>
```

### user_name/password {#user-namepassword}

비밀번호는 일반 텍스트 또는 SHA256(16진수 형식)으로 지정할 수 있습니다.

- 일반 텍스트로 비밀번호를 지정하려면 (**권장하지 않음**) `password` 요소에 넣습니다.

    예: `<password>qwerty</password>`. 비밀번호는 공백으로 남겨둘 수 있습니다.

<a id="password_sha256_hex"></a>

- 비밀번호의 SHA256 해시를 사용하여 비밀번호를 지정하려면 `password_sha256_hex` 요소에 넣습니다.

    예: `<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`.

    셸에서 비밀번호를 생성하는 방법의 예:

```bash
PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
```

    결과의 첫 번째 줄은 비밀번호입니다. 두 번째 줄은 해당 SHA256 해시입니다.

<a id="password_double_sha1_hex"></a>

- MySQL 클라이언트와의 호환성을 위해 비밀번호를 이중 SHA1 해시로 지정할 수 있습니다. `password_double_sha1_hex` 요소에 넣습니다.

    예: `<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`.

    셸에서 비밀번호를 생성하는 방법의 예:

```bash
PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

    결과의 첫 번째 줄은 비밀번호입니다. 두 번째 줄은 해당 이중 SHA1 해시입니다.

### username/ssh-key {#user-sshkey}

이 설정은 SSH 키를 사용한 인증을 허용합니다.

`ssh-keygen`으로 생성된 SSH 키가 주어지면

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```
`ssh_key` 요소는 다음과 같아야 합니다.
```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

지원되는 다른 알고리즘에 대해 `ssh-ed25519`를 `ssh-rsa` 또는 `ecdsa-sha2-nistp256`으로 대체하십시오.

### access_management {#access_management-user-setting}

이 설정은 사용자가 SQL 기반의 [접근 제어 및 계정 관리](/operations/access-rights#access-control-usage)를 사용하게 할지 여부를 결정합니다.

가능한 값:

- 0 — 비활성화.
- 1 — 활성화.

기본값: 0.

### grants {#grants-user-setting}

이 설정은 선택한 사용자에게 모든 권한을 부여할 수 있습니다. 목록의 각 요소는 지정된 수혜자 없이 `GRANT` 쿼리여야 합니다.

예:

```xml
<user1>
    <grants>
        <query>GRANT SHOW ON *.*</query>
        <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        <query>GRANT SELECT ON system.*</query>
    </grants>
</user1>
```

이 설정은 `dictionaries`, `access_management`, `named_collection_control`, `show_named_collections_secrets` 및 `allow_databases` 설정과 동시에 지정할 수 없습니다.

### user_name/networks {#user-namenetworks}

사용자가 ClickHouse 서버에 연결할 수 있는 네트워크 목록입니다.

목록의 각 요소는 다음 형식 중 하나를 가질 수 있습니다:

- `<ip>` — IP 주소 또는 네트워크 마스크.

    예: `213.180.204.3`, `10.0.0.1/8`, `10.0.0.1/255.255.255.0`, `2a02:6b8::3`, `2a02:6b8::3/64`, `2a02:6b8::3/ffff:ffff:ffff:ffff::`.

- `<host>` — 호스트 이름.

    예: `example01.host.ru`.

    접근을 확인하기 위해 DNS 쿼리가 수행되며, 반환된 모든 IP 주소가 피어 주소와 비교됩니다.

- `<host_regexp>` — 호스트 이름에 대한 정규 표현식.

    예: `^example\d\d-\d\d-\d\.host\.ru$`

    접근을 확인하기 위해 피어 주소에 대한 [DNS PTR 쿼리](https://en.wikipedia.org/wiki/Reverse_DNS_lookup)가 수행되며, 그 후 지정된 정규 표현식이 적용됩니다. 그런 다음 PTR 쿼리의 결과에 대해 또 다른 DNS 쿼리가 수행되어 수신된 모든 주소가 피어 주소와 비교됩니다. 정규 표현식이 $로 끝나게 하는 것을 강력히 권장합니다.

DNS 요청의 모든 결과는 서버가 재시작될 때까지 캐시됩니다.

**예제**

어떤 네트워크에서든 사용자에게 접근을 열려면 다음을 지정합니다:

```xml
<ip>::/0</ip>
```

:::note
방화벽이 올바르게 구성되어 있지 않거나 서버가 인터넷에 직접 연결되어 있지 않는 한, 모든 네트워크에서 접근을 여는 것은 안전하지 않습니다.
:::

로컬 호스트에서만 접근을 열려면 다음을 지정합니다:

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```

### user_name/profile {#user-nameprofile}

사용자에게 설정 프로파일을 할당할 수 있습니다. 설정 프로파일은 `users.xml` 파일의 별도 섹션에서 구성됩니다. 자세한 정보는 [설정 프로파일](../../operations/settings/settings-profiles.md)을 참조하십시오.

### user_name/quota {#user-namequota}

할당량은 일정 기간 동안 자원 사용량을 추적하거나 제한할 수 있도록 합니다. 할당량은 `users.xml` 구성 파일의 `quotas` 섹션에서 구성됩니다.

사용자에게 할당량 세트를 할당할 수 있습니다. 할당량 구성에 대한 자세한 설명은 [할당량](/operations/quotas)을 참조하십시오.

### user_name/databases {#user-namedatabases}

이 섹션에서는 현재 사용자가 수행한 `SELECT` 쿼리에 대한 ClickHouse에서 반환되는 행을 제한하여 기본적인 행 수준 보안을 구현할 수 있습니다.

**예제**

다음 구성은 사용자 `user1`이 `SELECT` 쿼리의 결과로 `table1`의 행을 `id` 필드의 값이 1000인 경우에만 볼 수 있도록 합니다.

```xml
<user1>
    <databases>
        <database_name>
            <table1>
                <filter>id = 1000</filter>
            </table1>
        </database_name>
    </databases>
</user1>
```

`filter`는 [UInt8](../../sql-reference/data-types/int-uint.md) 유형 값으로 결과가 나오는 모든 표현식일 수 있습니다. 일반적으로 비교 및 논리 연산자가 포함됩니다. `database_name.table1`의 행이 필터 결과가 0인 경우 이 사용자에게 반환되지 않습니다. 필터링은 `PREWHERE` 작업과 호환되지 않으며 `WHERE→PREWHERE` 최적화를 비활성화합니다.

## 역할 {#roles}

`user.xml` 구성 파일의 `roles` 섹션을 사용하여 미리 정의된 역할을 생성할 수 있습니다.

`roles` 섹션의 구조:

```xml
<roles>
    <test_role>
        <grants>
            <query>GRANT SHOW ON *.*</query>
            <query>REVOKE SHOW ON system.*</query>
            <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        </grants>
    </test_role>
</roles>
```

이 역할은 `users` 섹션의 사용자에게 부여될 수도 있습니다:

```xml
<users>
    <user_name>
        ...
        <grants>
            <query>GRANT test_role</query>
        </grants>
    </user_name>
<users>
```
