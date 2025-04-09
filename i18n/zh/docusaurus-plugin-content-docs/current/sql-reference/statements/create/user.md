---
slug: /sql-reference/statements/create/user
sidebar_position: 39
sidebar_label: 用户
title: '创建用户'
---

创建 [用户账户](../../../guides/sre/user-management/index.md#user-account-management)。

语法：

``` sql
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

`ON CLUSTER` 子句允许在集群上创建用户，参见 [分布式 DDL](../../../sql-reference/distributed-ddl.md)。

## 身份认证 {#identification}

用户身份认证有多种方式：

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` 或 `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` 或 `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` 或 `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

密码复杂性要求可以在 [config.xml](/operations/configuration-files) 中编辑。以下是一个配置示例，要求密码至少 12 个字符长度且包含 1 个数字。每个密码复杂性规则需要一个正则表达式来匹配密码和对规则的描述。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>至少 12 个字符长</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>至少包含 1 个数字字符</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
在 ClickHouse Cloud 中，默认情况下，密码必须满足以下复杂性要求：
- 至少 12 个字符长
- 至少包含 1 个数字字符
- 至少包含 1 个大写字母
- 至少包含 1 个小写字母
- 至少包含 1 个特殊字符
:::

## 示例 {#examples}

1. 以下用户名为 `name1`，并且不需要密码——显然这并没有提供太多安全性：

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. 指定一个明文密码：

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    密码存储在 `/var/lib/clickhouse/access` 中的 SQL 文本文件中，因此使用 `plaintext_password` 不是一个好主意。尝试使用 `sha256_password`，如下所示...
    :::

3. 最常见的选项是使用 SHA-256 哈希的密码。当您指定 `IDENTIFIED WITH sha256_password` 时，ClickHouse 会为您哈希密码。例如：

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    `name3` 用户现在可以使用 `my_password` 登录，但密码以哈希值的形式存储如下。以下 SQL 文件在 `/var/lib/clickhouse/access` 中创建，并在服务器启动时执行：

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    如果您已经为某个用户名创建了哈希值和对应的盐值，则可以使用 `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`。使用 `SALT` 进行 `sha256_hash` 身份认证时——哈希必须通过 'password' 和 'salt' 的连接计算得出。
    :::

4. `double_sha1_password` 通常不需要，但在处理需要它的客户端时（比如 MySQL 接口）会派上用场：

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse 生成并执行以下查询：

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` 是存储密码的最安全选项。它使用 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 算法，该算法能够抵御暴力破解攻击，即使密码哈希被泄露。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    使用此方法，密码长度限制为 72 个字符。bcrypt 工作因子参数，定义了计算哈希和验证密码所需的计算量和时间，可以在服务器配置中修改：

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    工作因子必须在 4 和 31 之间，默认值为 12。

6. 密码的类型也可以省略：

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    在这种情况下，ClickHouse 将使用服务器配置中指定的默认密码类型：

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    可用的密码类型有：`plaintext_password`、`sha256_password`、`double_sha1_password`。

7. 可以指定多种身份认证方法：

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
   ```

注意：
1. 旧版本的 ClickHouse 可能不支持多个身份认证方法的语法。因此，如果 ClickHouse 服务器包含此类用户并降级到不支持它的版本，这些用户将变得无效，一些与用户相关的操作将受到影响。为了安全降级，必须在降级前将所有用户设置为包含单一身份认证方法。或者，如果服务器在没有适当程序的情况下被降级，则应删除故障用户。
2. 出于安全考虑，`no_password` 不能与其他身份认证方法共存。因此，您只能在查询中指定 `no_password` 作为唯一身份认证方法。

## 用户主机 {#user-host}

用户主机是可以与 ClickHouse 服务器建立连接的主机。可以在 `HOST` 查询部分以以下方式指定主机：

- `HOST IP 'ip_address_or_subnetwork'` — 用户只能从指定的 IP 地址或 [子网](https://en.wikipedia.org/wiki/Subnetwork) 连接到 ClickHouse 服务器。例如：`HOST IP '192.168.0.0/16'`，`HOST IP '2001:DB8::/32'`。在生产环境中，只有指定 `HOST IP` 元素（IP 地址及其掩码），因为使用 `host` 和 `host_regexp` 可能会造成额外的延迟。
- `HOST ANY` — 用户可以从任何位置连接。这是默认选项。
- `HOST LOCAL` — 用户仅能本地连接。
- `HOST NAME 'fqdn'` — 用户主机可以指定为 FQDN。例如：`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — 指定用户主机时，可以使用 [pcre](http://www.pcre.org/) 正则表达式。例如：`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — 允许使用 [LIKE](/sql-reference/functions/string-search-functions#like) 运算符过滤用户主机。例如：`HOST LIKE '%'` 相当于 `HOST ANY`，`HOST LIKE '%.mysite.com'` 过滤所有在 `mysite.com` 域中的主机。

指定主机的另一种方式是使用 `@` 语法跟随用户名。示例：

- `CREATE USER mira@'127.0.0.1'` — 相当于 `HOST IP` 语法。
- `CREATE USER mira@'localhost'` — 相当于 `HOST LOCAL` 语法。
- `CREATE USER mira@'192.168.%.%'` — 相当于 `HOST LIKE` 语法。

:::tip
ClickHouse 将 `user_name@'address'` 视为一个整体的用户名。因此，从技术上讲，您可以使用相同的 `user_name` 和 `@` 后不同的构造创建多个用户。然而，我们不推荐这样做。
:::

## VALID UNTIL 子句 {#valid-until-clause}

允许您指定身份认证方法的到期日期，以及可选的时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式表示日期时间。默认情况下，该参数等于 `'infinity'`。
`VALID UNTIL` 子句只能与身份认证方法一起指定，除非查询中未指定任何身份认证方法。在这种情况下，`VALID UNTIL` 子句将适用于所有现有的身份认证方法。

示例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES 子句 {#grantees-clause}

指定此用户可以将 [权限](../../../sql-reference/statements/grant.md#privileges) 赋予的用户或角色，前提是此用户也被授予了所有必需的访问权限，且具备 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)。`GRANTEES` 子句的选项：

- `user` — 指定此用户可以授予权限的用户。
- `role` — 指定此用户可以授予权限的角色。
- `ANY` — 此用户可以将权限授予任何人。这是默认设置。
- `NONE` — 此用户不能授予任何权限。

您可以使用 `EXCEPT` 表达式排除任何用户或角色。例如，`CREATE USER user1 GRANTEES ANY EXCEPT user2`。这意味着，如果 `user1` 拥有一些通过 `GRANT OPTION` 授予的权限，则可以将这些权限授予除 `user2` 以外的任何人。

## 示例 {#examples-1}

创建受密码 `qwerty` 保护的用户账户 `mira`：

``` sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` 应在运行 ClickHouse 服务器的主机上启动客户端应用。

创建用户账户 `john`，分配角色并使这些角色为默认角色：

``` sql
CREATE USER john DEFAULT ROLE role1, role2;
```

创建用户账户 `john` 并使他未来的所有角色为默认角色：

``` sql
CREATE USER john DEFAULT ROLE ALL;
```

当将某个角色分配给 `john` 时，这个角色将自动成为默认角色。

创建用户账户 `john` 并使他未来的所有角色为默认角色，排除 `role1` 和 `role2`：

``` sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

创建用户账户 `john` 并允许他将他的权限授予用户 `jack`：

``` sql
CREATE USER john GRANTEES jack;
```
