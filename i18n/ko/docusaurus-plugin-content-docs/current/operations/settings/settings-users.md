---
description: '사용자 및 역할을 구성하기 위한 설정입니다.'
sidebar_label: '사용자 설정'
sidebar_position: 63
slug: /operations/settings/settings-users
title: '사용자 및 역할 설정'
doc_type: 'reference'
---

# 사용자 및 역할 설정 \{#users-and-roles-settings\}

`users.xml` 설정 파일의 `users` 섹션에는 사용자 설정이 포함되어 있습니다.

:::note
ClickHouse는 사용자 관리를 위한 [SQL 기반 워크플로](/operations/access-rights#access-control-usage)도 지원합니다. 이 방식을 사용할 것을 권장합니다.
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


### user_name/password \{#user-namepassword\}

비밀번호는 평문 또는 SHA256(16진수 형식)으로 지정할 수 있습니다.

- 평문으로 비밀번호를 지정하려면(**권장하지 않음**) `password` 요소 안에 넣습니다.

    예: `<password>qwerty</password>`. 비밀번호는 비워둘 수도 있습니다.

<a id="password_sha256_hex"></a>

- 비밀번호의 SHA256 해시를 사용하여 지정하려면 `password_sha256_hex` 요소 안에 넣습니다.

    예: `<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`.

    셸에서 비밀번호를 생성하는 방법 예시는 다음과 같습니다.

    ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
    ```

    결과의 첫 번째 줄은 비밀번호이고, 두 번째 줄은 해당 SHA256 해시입니다.

<a id="password_double_sha1_hex"></a>

- MySQL 클라이언트와의 호환성을 위해 비밀번호를 이중 SHA1 해시로 지정할 수 있습니다. 이 경우 `password_double_sha1_hex` 요소 안에 넣습니다.

    예: `<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`.

    셸에서 비밀번호를 생성하는 방법 예시는 다음과 같습니다.

    ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
    ```

    결과의 첫 번째 줄은 비밀번호이고, 두 번째 줄은 해당 이중 SHA1 해시입니다.

### TOTP 인증 구성 \{#totp-authentication-configuration\}

Time-Based One-Time Password(TOTP)는 제한된 시간 동안만 유효한 임시 액세스 코드를 생성하여 ClickHouse 사용자를 인증하는 데 사용할 수 있습니다.
이 TOTP 인증 방식은 [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238) 표준을 준수하므로 Google Authenticator, 1Password와 같은 널리 사용되는 TOTP 애플리케이션 및 유사한 도구와 호환됩니다.
비밀번호 기반 인증과 함께 `users.xml` 구성 파일을 통해 설정할 수 있습니다.
아직 SQL 기반 Access Control(액세스 제어)에서는 지원되지 않습니다.

TOTP를 사용하여 인증하려면 사용자는 기본 비밀번호와 함께 TOTP 애플리케이션에서 생성된 일회용 비밀번호를 `--one-time-password` 명령줄 옵션으로 제공하거나, 기본 비밀번호에 `+` 문자를 붙여 하나로 이어 입력해야 합니다.
예를 들어 기본 비밀번호가 `some_password`이고 생성된 TOTP 코드가 `345123`인 경우, ClickHouse에 접속할 때 `--password some_password+345123` 또는 `--password some_password --one-time-password 345123`와 같이 지정할 수 있습니다. 비밀번호를 지정하지 않으면 `clickhouse-client`가 대화형으로 비밀번호 입력을 요청합니다.

특정 사용자에 대해 TOTP 인증을 활성화하려면 `users.xml`에서 `time_based_one_time_password` 섹션을 구성합니다. 이 섹션에서 secret, 유효 기간, 자릿수, 해시 알고리즘과 같은 TOTP 설정을 정의합니다.

**예시**

````xml
<clickhouse>
    <!-- ... -->
    <users>
        <my_user>
            <!-- Primary password-based authentication: -->
            <password>some_password</password>
            <password_sha256_hex>1464acd6765f91fccd3f5bf4f14ebb7ca69f53af91b0a5790c2bba9d8819417b</password_sha256_hex>
            <!-- ... or any other supported authentication method ... -->

            <!-- TOTP authentication configuration -->
            <time_based_one_time_password>
                <secret>JBSWY3DPEHPK3PXP</secret>      <!-- Base32-encoded TOTP secret -->
                <period>30</period>                    <!-- Optional: OTP validity period in seconds -->
                <digits>6</digits>                     <!-- Optional: Number of digits in the OTP -->
                <algorithm>SHA1</algorithm>            <!-- Optional: Hash algorithm: SHA1, SHA256, SHA512 -->
            </time_based_one_time_password>
        </my_user>
    </users>
</clickhouse>

Parameters:

- secret - (Required) The base32-encoded secret key used to generate TOTP codes.
- period - Optional. Sets the validity period of each OTP in seconds. Must be a positive number not exceeding 120. Default is 30.
- digits - Optional. Specifies the number of digits in each OTP. Must be between 4 and 10. Default is 6.
- algorithm - Optional. Defines the hash algorithm for generating OTPs. Supported values are SHA1, SHA256, and SHA512. Default is SHA1.

Generating a TOTP Secret

To generate a TOTP-compatible secret for use with ClickHouse, run the following command in the terminal:

```bash
$ base32 -w32 < /dev/urandom | head -1
````

이 명령은 users.xml의 secret 필드에 추가할 수 있는 base32로 인코딩된 secret 값을 생성합니다.

특정 사용자에 대해 TOTP를 활성화하려면, 기존 비밀번호 기반 필드(예: `password` 또는 `password_sha256_hex`)에 `time_based_one_time_password` 섹션을 하나 더 추가하면 됩니다.

[qrencode](https://linux.die.net/man/1/qrencode) 도구를 사용하여 TOTP secret용 QR 코드를 생성할 수 있습니다.

```bash
$ qrencode -t ansiutf8 'otpauth://totp/ClickHouse?issuer=ClickHouse&secret=JBSWY3DPEHPK3PXP'
```

USER에 TOTP를 구성한 후에는 앞에서 설명한 대로 인증 절차의 일부로 일회용 비밀번호를 사용할 수 있습니다.


### username/ssh-key

이 설정을 사용하면 SSH 키로 인증할 수 있습니다.

`ssh-keygen`으로 생성된 다음과 같은 SSH 키가 있다고 가정합니다.

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```

`ssh_key` 요소는 다음과 같은 형식이어야 합니다

```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

다른 지원되는 알고리즘을 사용하려면 `ssh-ed25519`를 `ssh-rsa` 또는 `ecdsa-sha2-nistp256`로 대체하십시오.


### access_management {#access_management-user-setting}

이 설정은 사용자에 대해 SQL 기반 [액세스 제어 및 계정 관리](/operations/access-rights#access-control-usage)를 사용할지 여부를 설정합니다.

가능한 값:

- 0 — 사용 안 함.
- 1 — 사용함.

기본값: 0.

### grants

이 설정을 사용하면 선택한 사용자에게 임의의 권한을 부여할 수 있습니다.
목록의 각 요소는 권한을 부여받는 대상(그랜티, grantee)을 지정하지 않은 `GRANT` 쿼리여야 합니다.

예시:

```xml
<user1>
    <grants>
        <query>GRANT SHOW ON *.*</query>
        <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        <query>GRANT SELECT ON system.*</query>
    </grants>
</user1>
```

이 SETTING은 `dictionaries`, `access_management`, `named_collection_control`, `show_named_collections_secrets`, `allow_databases` SETTING들과 동시에 지정할 수 없습니다.


### user_name/networks

사용자가 ClickHouse 서버에 연결할 수 있는 네트워크 목록입니다.

목록의 각 요소는 다음 형태 중 하나가 될 수 있습니다.

* `<ip>` — IP 주소 또는 네트워크 마스크.

  예: `213.180.204.3`, `10.0.0.1/8`, `10.0.0.1/255.255.255.0`, `2a02:6b8::3`, `2a02:6b8::3/64`, `2a02:6b8::3/ffff:ffff:ffff:ffff::`.

* `<host>` — 호스트 이름.

  예: `example01.host.ru`.

  접근을 확인하기 위해 DNS 쿼리를 수행하고, 반환된 모든 IP 주소를 피어 주소와 비교합니다.

* `<host_regexp>` — 호스트 이름에 대한 정규 표현식.

  예: `^example\d\d-\d\d-\d\.host\.ru$`

  접근을 확인하기 위해 피어 주소에 대해 [DNS PTR 쿼리](https://en.wikipedia.org/wiki/Reverse_DNS_lookup)를 수행한 뒤, 해당 결과에 지정된 정규식(regexp)을 적용합니다. 그런 다음 PTR 쿼리 결과에 대해 다시 DNS 쿼리를 수행하고, 수신한 모든 주소를 피어 주소와 비교합니다. 정규식이 반드시 $ 기호로 끝나도록 설정할 것을 강력히 권장합니다.

DNS 요청의 모든 결과는 서버가 재시작될 때까지 캐시됩니다.

**예시**

임의의 네트워크에서 해당 사용자에 대한 접속을 허용하려면 다음과 같이 지정합니다.

```xml
<ip>::/0</ip>
```

:::note
방화벽이 올바르게 구성되어 있지 않고 서버가 인터넷에 직접 연결되어 있는 경우, 모든 네트워크에서의 접근을 허용하는 것은 안전하지 않습니다.
:::

localhost에서만 접근을 허용하려면 다음과 같이 지정합니다.

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```


### user_name/profile {#user-nameprofile}

사용자에 Settings profile을 할당할 수 있습니다. Settings profile은 `users.xml` 파일의 별도 섹션에서 설정합니다. 자세한 내용은 [Profiles of Settings](../../operations/settings/settings-profiles.md)를 참조하십시오.

### user_name/quota {#user-namequota}

쿼터(quota)는 일정 기간 동안 리소스 사용량을 추적하거나 제한하는 데 사용할 수 있습니다. 쿼터는 `users.xml` 설정 파일의 `quotas` 섹션에서 구성합니다.

사용자에게 쿼터 집합을 할당할 수 있습니다. 쿼터 구성에 대한 자세한 설명은 [Quotas](/operations/quotas)를 참조하십시오.

### user_name/databases

이 섹션에서는 현재 사용자가 수행하는 `SELECT` 쿼리에 대해 ClickHouse가 반환하는 행을 제한하여 기본적인 행 수준 보안을 구현할 수 있습니다.

**예시**

다음 구성은 사용자 `user1`이 `SELECT` 쿼리를 실행했을 때 `id` 필드의 값이 1000인 행만 `table1`의 결과에서 볼 수 있도록 강제합니다.

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

`filter`는 [UInt8](../../sql-reference/data-types/int-uint.md) 타입 값을 결과로 내는 아무 표현식이나 될 수 있습니다. 일반적으로 비교 및 논리 연산자를 포함합니다. `database_name.table1`에서 `filter` 결과가 0인 행은 해당 사용자에 대해 반환되지 않습니다. 이 필터링은 `PREWHERE` 연산과 함께 사용할 수 없으며 `WHERE→PREWHERE` 최적화가 적용되지 않습니다.


## Roles

`user.xml` 설정 파일의 `roles` 섹션을 사용하여 사전 정의된 역할을 생성할 수 있습니다.

`roles` 섹션의 구조는 다음과 같습니다.

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

이러한 역할은 `users` 섹션에서도 사용자에게 부여할 수 있습니다:

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
