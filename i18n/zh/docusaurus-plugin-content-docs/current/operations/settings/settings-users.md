---
description: '用于配置用户和角色的相关设置。'
sidebar_label: '用户设置'
sidebar_position: 63
slug: /operations/settings/settings-users
title: '用户和角色设置'
doc_type: 'reference'
---

# 用户和角色设置 \{#users-and-roles-settings\}

`users.xml` 配置文件中的 `users` 部分包含用户配置。

:::note
ClickHouse 也支持用于管理用户的 [基于 SQL 的工作流](/operations/access-rights#access-control-usage)，我们建议优先采用这种方式。
:::

`users` 部分的结构：

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

可以以明文或 SHA256（十六进制格式）指定密码。

- 若要以明文形式指定密码（**不推荐**），请将其放在 `password` 元素中。

    例如，`<password>qwerty</password>`。密码可以留空。

<a id="password_sha256_hex"></a>

- 若要使用密码的 SHA256 哈希值进行指定，请将其放在 `password_sha256_hex` 元素中。

    例如，`<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`。

    在 shell 中生成密码的示例：

    ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
    ```

    结果的第一行是密码。第二行是对应的 SHA256 哈希值。

<a id="password_double_sha1_hex"></a>

- 为了与 MySQL 客户端兼容，可以以双重 SHA1 哈希的形式指定密码。将其放在 `password_double_sha1_hex` 元素中。

    例如：`<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`。

    从 shell 生成密码的示例：

    ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
    ```

    结果的第一行是密码。第二行是对应的双重 SHA1 哈希值。

### TOTP 认证配置 \{#totp-authentication-configuration\}

基于时间的一次性密码（Time-Based One-Time Password，TOTP）可用于为 ClickHouse 用户进行身份验证，通过生成在有限时间内有效的临时访问验证码来完成认证。
这种 TOTP 认证方法符合 [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238) 标准，因此可以与 Google Authenticator、1Password 等常见 TOTP 应用程序兼容。
它可以通过 `users.xml` 配置文件进行设置，以补充基于密码的认证方式。
目前在基于 SQL 的访问控制中尚不支持该功能。

要使用 TOTP 进行认证，用户必须在提供主密码的同时，提供其 TOTP 应用程序生成的一次性密码，可以通过 `--one-time-password` 命令行参数传递，或者在主密码后追加一个 `+` 字符并与之拼接后一起提供。
例如，如果主密码为 `some_password`，生成的 TOTP 代码为 `345123`，用户可以在连接 ClickHouse 时指定 `--password some_password+345123` 或 `--password some_password --one-time-password 345123`。如果未指定密码，`clickhouse-client` 将以交互方式提示输入。

要为某个用户启用 TOTP 认证，请在 `users.xml` 中配置 `time_based_one_time_password` 部分。该部分定义了 TOTP 设置，例如密钥、有效期、位数以及哈希算法。

**示例**

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

该命令会生成一个 base32 编码的密钥，可添加到 users.xml 中的 secret 字段。

要为特定用户启用 TOTP，请在任意现有的基于密码的字段（例如 `password` 或 `password_sha256_hex`）中再添加一个 `time_based_one_time_password` 部分。

可以使用 [qrencode](https://linux.die.net/man/1/qrencode) 工具为该 TOTP 密钥生成二维码。

```bash
$ qrencode -t ansiutf8 'otpauth://totp/ClickHouse?issuer=ClickHouse&secret=JBSWY3DPEHPK3PXP'
```

为用户配置好 TOTP 之后，可以按照上述说明，在身份验证过程中将一次性密码作为认证要素之一使用。


### username/ssh-key

此设置允许使用 SSH 密钥进行身份验证。

给定一个 SSH 密钥（由 `ssh-keygen` 生成），例如

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```

`ssh_key` 元素应配置为

```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

将 `ssh-ed25519` 替换为 `ssh-rsa` 或 `ecdsa-sha2-nistp256`，以使用其他受支持的算法。


### access_management {#access_management-user-setting}

此设置用于启用或禁用对该用户使用 SQL 驱动的[访问控制和账户管理](/operations/access-rights#access-control-usage)。

可能的取值：

- 0 — 禁用。
- 1 — 启用。

默认值：0。

### grants

此设置允许为选定用户授予任意权限。
列表中的每个元素都应为未指定任何被授权者的 `GRANT` 查询。

示例：

```xml
<user1>
    <grants>
        <query>GRANT SHOW ON *.*</query>
        <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        <query>GRANT SELECT ON system.*</query>
    </grants>
</user1>
```

此设置不能与 `dictionaries`、`access_management`、`named_collection_control`、`show_named_collections_secrets` 和 `allow_databases` 设置同时指定。


### user_name/networks

允许用户连接到 ClickHouse 服务器的网络列表。

列表中的每个元素可以具有以下形式之一：

* `<ip>` — IP 地址或网络掩码。

  示例：`213.180.204.3`、`10.0.0.1/8`、`10.0.0.1/255.255.255.0`、`2a02:6b8::3`、`2a02:6b8::3/64`、`2a02:6b8::3/ffff:ffff:ffff:ffff::`。

* `<host>` — 主机名。

  示例：`example01.host.ru`。

  为了检查访问权限，系统会执行一次 DNS 查询，并将所有返回的 IP 地址与对端地址进行比较。

* `<host_regexp>` — 主机名的正则表达式。

  示例：`^example\d\d-\d\d-\d\.host\.ru$`

  为了检查访问权限，系统会针对对端地址执行一次 [DNS PTR 查询](https://en.wikipedia.org/wiki/Reverse_DNS_lookup)，然后应用指定的正则表达式。接着，会对 PTR 查询结果再次执行 DNS 查询，并将收到的所有地址与对端地址进行比较。我们强烈建议正则表达式以 $ 结尾。

所有 DNS 请求的结果都会被缓存，直到服务器重启。

**示例**

若要为来自任意网络的用户开放访问权限，请指定：

```xml
<ip>::/0</ip>
```

:::note
除非已正确配置防火墙，或服务器未直接连接到互联网，否则对任意网络开放访问是不安全的。
:::

若只允许从 localhost 访问，请指定：

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```


### user_name/profile {#user-nameprofile}

您可以为用户分配一个设置配置文件。设置配置文件在 `users.xml` 文件的单独部分中进行配置。有关更多信息，请参阅[设置配置文件](../../operations/settings/settings-profiles.md)。

### user_name/quota {#user-namequota}

配额允许您在一段时间内跟踪或限制资源使用。配额在 `users.xml` 配置文件的 `quotas` 部分中进行配置。

您可以为用户分配一组配额。有关配额配置的详细说明，请参阅[配额](/operations/quotas)。

### user_name/databases

在此部分中，您可以限制当前用户执行 `SELECT` 查询时 ClickHouse 返回的行，从而实现基本的行级安全。

**示例**

以下配置会使用户 `user1` 在执行 `SELECT` 查询时，仅能看到 `table1` 中 `id` 字段值为 1000 的那些行。

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

`filter` 可以是任意返回 [UInt8](../../sql-reference/data-types/int-uint.md) 类型值的表达式。它通常包含比较和逻辑运算符。对于该用户，`database_name.table1` 中 `filter` 结果为 0 的行将不会返回。该过滤机制与 `PREWHERE` 操作不兼容，并会禁用 `WHERE→PREWHERE` 优化。


## 角色

可以在 `user.xml` 配置文件的 `roles` 部分中创建任意预定义角色。

`roles` 部分的结构：

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

也可以在 `users` 部分为用户授予这些角色：

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
