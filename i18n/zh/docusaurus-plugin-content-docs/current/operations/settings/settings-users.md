---
'description': '配置用户和角色的设置。'
'sidebar_label': '用户设置'
'sidebar_position': 63
'slug': '/operations/settings/settings-users'
'title': '用户和角色设置'
---


# 用户和角色设置

`users.xml` 配置文件的 `users` 部分包含用户设置。

:::note
ClickHouse 还支持 [基于SQL的工作流](/operations/access-rights#access-control-usage) 来管理用户。我们推荐使用它。
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

### user_name/password {#user-namepassword}

密码可以以明文或 SHA256 （十六进制格式）指定。

- 要以明文分配密码（**不推荐**），请将其放在 `password` 元素中。

    例如，`<password>qwerty</password>`。密码可以留空。

<a id="password_sha256_hex"></a>

- 要通过 SHA256 哈希分配密码，请将其放在 `password_sha256_hex` 元素中。

    例如，`<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`。

    从shell生成密码的示例：

```bash
PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
```

    结果的第一行是密码。第二行是相应的 SHA256 哈希。

<a id="password_double_sha1_hex"></a>

- 为了与 MySQL 客户端兼容，密码可以以双 SHA1 哈希形式指定。将其放在 `password_double_sha1_hex` 元素中。

    例如，`<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`。

    从 shell 生成密码的示例：

```bash
PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

    结果的第一行是密码。第二行是相应的双 SHA1 哈希。

### username/ssh-key {#user-sshkey}

此设置允许使用 SSH 密钥进行身份验证。

给定一个 SSH 密钥（由 `ssh-keygen` 生成），如

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```
`ssh_key` 元素应为
```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

将 `ssh-ed25519` 替换为 `ssh-rsa` 或 `ecdsa-sha2-nistp256` 以使用其他支持的算法。

### access_management {#access_management-user-setting}

此设置启用或禁用使用基于 SQL 的 [访问控制和账户管理](/operations/access-rights#access-control-usage) 功能。

可能的值：

- 0 — 禁用。
- 1 — 启用。

默认值：0。

### grants {#grants-user-setting}

此设置允许向选定用户授予任何权限。
列表中的每个元素应为不指定任何被授予者的 `GRANT` 查询。

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

允许用户从哪些网络连接到 ClickHouse 服务器的列表。

列表中的每个元素可以有以下一种形式：

- `<ip>` — IP 地址或网络掩码。

    示例：`213.180.204.3`，`10.0.0.1/8`，`10.0.0.1/255.255.255.0`，`2a02:6b8::3`，`2a02:6b8::3/64`，`2a02:6b8::3/ffff:ffff:ffff:ffff::`。

- `<host>` — 主机名。

    示例：`example01.host.ru`。

    为检查访问，将进行 DNS 查询，并将所有返回的 IP 地址与对端地址进行比较。

- `<host_regexp>` — 主机名的正则表达式。

    示例：`^example\d\d-\d\d-\d\.host\.ru$`

    为检查访问，将对对端地址进行 [DNS PTR 查询](https://en.wikipedia.org/wiki/Reverse_DNS_lookup)，然后应用指定的正则表达式。随后，将对 PTR 查询的结果进行另一次 DNS 查询，所有接收到的地址与对端地址进行比较。我们强烈建议正则表达式以 $ 结尾。

所有 DNS 请求的结果在服务器重启之前都会被缓存。

**示例**

要为任何网络的用户开放访问权限，请指定：

```xml
<ip>::/0</ip>
```

:::note
除非您适当配置了防火墙或服务器未直接连接到互联网，否则从任何网络开放访问是没有安全性的。
:::

要仅从 localhost 开放访问，请指定：

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```

### user_name/profile {#user-nameprofile}

您可以为用户分配设置配置文件。设置配置文件在 `users.xml` 文件的一个单独部分进行配置。有关更多信息，请参见 [设置的配置文件](../../operations/settings/settings-profiles.md)。

### user_name/quota {#user-namequota}

配额允许您跟踪或限制一段时间内的资源使用。配额在 `users.xml` 配置文件的 `quotas` 部分进行配置。

您可以为用户分配一组配额。有关配额配置的详细描述，请参见 [配额](/operations/quotas)。

### user_name/databases {#user-namedatabases}

在此部分中，您可以限制 ClickHouse 为当前用户返回的 `SELECT` 查询的行，从而实现基本的行级安全性。

**示例**

以下配置强制用户 `user1` 只能看到 `table1` 的行作为 `SELECT` 查询的结果，其中 `id` 字段的值为 1000。

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

`filter` 可以是任何导致 [UInt8](../../sql-reference/data-types/int-uint.md) 类型值的表达式。它通常包含比较和逻辑运算符。来自 `database_name.table1` 的行，如果过滤结果为 0，则不会返回给此用户。过滤与 `PREWHERE` 操作不兼容，并禁用 `WHERE→PREWHERE` 优化。

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

这些角色也可以授予 `users` 部分中的用户：

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
