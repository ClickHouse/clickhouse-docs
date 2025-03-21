---
slug: /operations/settings/settings-users
sidebar_position: 63
sidebar_label: '用户设置'
description: '配置用户和角色的设置。'
title: '用户和角色设置'
---


# 用户和角色设置

`users.xml` 配置文件的 `users` 部分包含用户设置。

:::note
ClickHouse 还支持通过 [SQL 驱动的工作流](/operations/access-rights#access-control-usage) 来管理用户。我们建议使用它。
:::

`users` 部分的结构：

``` xml
<users>
    <!-- 如果未指定用户名，将使用'default'用户。 -->
    <user_name>
        <password></password>
        <!-- 或 -->
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
    <!-- 其他用户设置 -->
</users>
```

### user_name/password {#user-namepassword}

密码可以以明文或 SHA256（十六进制格式）指定。

- 要以明文分配密码（**不推荐**），请将其放入 `password` 元素中。

    例如，`<password>qwerty</password>`。密码可以留空。

<a id="password_sha256_hex"></a>

- 要使用其 SHA256 哈希分配密码，请将其放入 `password_sha256_hex` 元素中。

    例如，`<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`。

    从 shell 生成密码的示例：

          PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'

    结果的第一行是密码。第二行是相应的 SHA256 哈希。

<a id="password_double_sha1_hex"></a>

- 为了与 MySQL 客户端兼容，密码可以以双 SHA1 哈希指定。将其放入 `password_double_sha1_hex` 元素中。

    例如，`<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`。

    从 shell 生成密码的示例：

          PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'

    结果的第一行是密码。第二行是相应的双 SHA1 哈希。

### username/ssh-key {#user-sshkey}

此设置允许使用 SSH 密钥进行身份验证。

给定一个 SSH 密钥（由 `ssh-keygen` 生成），例如：
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```
`ssh_key` 元素应为：
```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

将 `ssh-ed25519` 替换为 `ssh-rsa` 或 `ecdsa-sha2-nistp256` 以支持其他算法。

### access_management {#access_management-user-setting}

此设置启用或禁用为用户使用 SQL 驱动的 [访问控制和账户管理](/operations/access-rights#access-control-usage)。

可能的值：

- 0 — 禁用。
- 1 — 启用。

默认值：0。

### grants {#grants-user-setting}

此设置允许授予选定用户的任何权限。
列表中的每个元素应为未指定任何受让人的 `GRANT` 查询。

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

### user_name/networks {#user-namenetworks}

允许用户从中连接到 ClickHouse 服务器的网络列表。

列表中的每个元素可以具有以下形式之一：

- `<ip>` — IP 地址或网络掩码。

    示例：`213.180.204.3`、`10.0.0.1/8`、`10.0.0.1/255.255.255.0`、`2a02:6b8::3`、`2a02:6b8::3/64`、`2a02:6b8::3/ffff:ffff:ffff:ffff::`。

- `<host>` — 主机名。

    示例：`example01.host.ru`。

    为了检查访问，将执行 DNS 查询，并比较所有返回的 IP 地址与对端地址。

- `<host_regexp>` — 主机名的正则表达式。

    示例：`^example\d\d-\d\d-\d\.host\.ru$`

    为了检查访问，将对对端地址执行 [DNS PTR 查询](https://en.wikipedia.org/wiki/Reverse_DNS_lookup)，然后应用指定的正则表达式。之后，将对 PTR 查询的结果执行另一个 DNS 查询，并比较所有收到的地址与对端地址。我们强烈建议正则表达式以 $ 结尾。

所有 DNS 请求的结果将在服务器重启之前被缓存。

**示例**

要开放任何网络用户的访问，请指定：

``` xml
<ip>::/0</ip>
```

:::note
从任何网络开放访问是不安全的，除非您已妥善配置防火墙或服务器未直接连接到互联网。
:::

要仅从本地主机开放访问，请指定：

``` xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```

### user_name/profile {#user-nameprofile}

您可以为用户分配设置配置文件。设置配置文件在 `users.xml` 文件的单独部分中配置。有关更多信息，请参见 [设置的配置文件](../../operations/settings/settings-profiles.md)。

### user_name/quota {#user-namequota}

配额允许您跟踪或限制在一段时间内的资源使用。配额在 `users.xml` 配置文件的 `quotas` 部分中配置。

您可以为用户分配一个配额集。有关配额配置的详细说明，请参见 [配额](/operations/quotas)。

### user_name/databases {#user-namedatabases}

在此部分，您可以限制 ClickHouse 为当前用户的 `SELECT` 查询返回的行，从而实现基本的行级安全。

**示例**

以下配置强制用户 `user1` 只能看到 `table1` 的行作为 `SELECT` 查询的结果，且 `id` 字段的值为 1000。

``` xml
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

`filter` 可以是任何结果为 [UInt8](../../sql-reference/data-types/int-uint.md) 类型值的表达式。它通常包含比较和逻辑运算符。来自 `database_name.table1` 的行，如果筛选结果为 0，将不返回给该用户。过滤与 `PREWHERE` 操作不兼容，且会禁用 `WHERE→PREWHERE` 优化。

## 角色 {#roles}

您可以使用 `user.xml` 配置文件的 `roles` 部分创建任何预定义角色。

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

这些角色也可以在 `users` 部分授予用户：

```xml
<users>
    <user_name>
        ...
        <grants>
            <query>GRANT test_role</query>
        </grants>
    </user_name>
</users>
```
