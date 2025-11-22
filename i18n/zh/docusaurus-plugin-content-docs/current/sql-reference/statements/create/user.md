---
description: '用户文档'
sidebar_label: 'USER'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'CREATE USER'
doc_type: 'reference'
---

创建[用户账户](../../../guides/sre/user-management/index.md#user-account-management)。

语法：

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

`ON CLUSTER` 子句使得可以在集群上创建用户，参见 [分布式 DDL](../../../sql-reference/distributed-ddl.md)。


## 身份认证 {#identification}

用户身份认证有多种方式:

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` or `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` or `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` or `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` or `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

密码复杂度要求可以在 [config.xml](/operations/configuration-files) 中编辑。以下是一个示例配置,要求密码长度至少为 12 个字符且包含 1 个数字。每个密码复杂度规则都需要一个用于匹配密码的正则表达式以及该规则的描述。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>长度至少为 12 个字符</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>包含至少 1 个数字字符</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
在 ClickHouse Cloud 中,默认情况下密码必须满足以下复杂度要求:

- 长度至少为 12 个字符
- 包含至少 1 个数字字符
- 包含至少 1 个大写字符
- 包含至少 1 个小写字符
- 包含至少 1 个特殊字符
  :::


## 示例 {#examples}

1. 以下用户名为 `name1`,无需密码 - 显然这不能提供足够的安全性:

   ```sql
   CREATE USER name1 NOT IDENTIFIED
   ```

2. 指定明文密码:

   ```sql
   CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
   ```

   :::tip
   密码存储在 `/var/lib/clickhouse/access` 目录下的 SQL 文本文件中,因此不建议使用 `plaintext_password`。请尝试使用 `sha256_password`,如下所示...
   :::

3. 最常用的方式是使用 SHA-256 哈希密码。当您指定 `IDENTIFIED WITH sha256_password` 时,ClickHouse 会自动对密码进行哈希处理。例如:

   ```sql
   CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
   ```

   `name3` 用户现在可以使用 `my_password` 登录,但密码以上述哈希值形式存储。以下 SQL 文件在 `/var/lib/clickhouse/access` 目录中创建,并在服务器启动时执行:

   ```bash
   /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
   ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
   ```

   :::tip
   如果您已经为用户名创建了哈希值和相应的盐值,则可以使用 `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`。使用 `SALT` 进行 `sha256_hash` 身份验证时,哈希值必须由 'password' 和 'salt' 拼接后计算得出。
   :::

4. 通常不需要 `double_sha1_password`,但在使用需要它的客户端(如 MySQL 接口)时会很有用:

   ```sql
   CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
   ```

   ClickHouse 生成并执行以下查询:

   ```response
   CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
   ```

5. `bcrypt_password` 是存储密码最安全的选项。它使用 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 算法,即使密码哈希被泄露,该算法也能有效抵御暴力破解攻击。

   ```sql
   CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
   ```

   使用此方法时,密码长度限制为 72 个字符。
   bcrypt 工作因子参数定义了计算哈希和验证密码所需的计算量和时间,可以在服务器配置中修改:

   ```xml
   <bcrypt_workfactor>12</bcrypt_workfactor>
   ```

   工作因子必须在 4 到 31 之间,默认值为 12。

   :::warning
   对于需要高频身份验证的应用程序,
   由于 bcrypt 在较高工作因子下的计算开销较大,
   建议考虑使用其他身份验证方法。
   :::

6.
7. 密码类型也可以省略:

   ```sql
   CREATE USER name6 IDENTIFIED BY 'my_password'
   ```

   在这种情况下,ClickHouse 将使用服务器配置中指定的默认密码类型:

   ```xml
   <default_password_type>sha256_password</default_password_type>
   ```

   可用的密码类型有:`plaintext_password`、`sha256_password`、`double_sha1_password`。

8. 可以指定多种身份验证方法:

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```


Notes:
1. 较旧版本的 ClickHouse 可能不支持多种身份验证方法的语法。因此，如果 ClickHouse 服务器中包含此类用户并被降级到不支持该语法的版本，这些用户将变得不可用，且某些与用户相关的操作将会失败。为了实现平滑降级，必须在降级之前将所有用户配置为仅包含一种身份验证方法。或者，如果服务器在未遵循正确流程的情况下已被降级，则应删除这些有问题的用户。
2. 出于安全原因，`no_password` 不能与其他身份验证方法共存。因此，仅当它是查询中唯一的身份验证方法时，才能指定
`no_password`。 



## 用户主机 {#user-host}

用户主机是指可以与 ClickHouse 服务器建立连接的主机。可以通过以下方式在 `HOST` 查询部分中指定主机:

- `HOST IP 'ip_address_or_subnetwork'` — 用户只能从指定的 IP 地址或[子网](https://en.wikipedia.org/wiki/Subnetwork)连接到 ClickHouse 服务器。示例:`HOST IP '192.168.0.0/16'`、`HOST IP '2001:DB8::/32'`。在生产环境中使用时,仅应指定 `HOST IP` 元素(IP 地址及其掩码),因为使用 `host` 和 `host_regexp` 可能会导致额外的延迟。
- `HOST ANY` — 用户可以从任何位置连接。这是默认选项。
- `HOST LOCAL` — 用户只能从本地连接。
- `HOST NAME 'fqdn'` — 用户主机可以指定为 FQDN(完全限定域名)。例如,`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — 在指定用户主机时可以使用 [pcre](http://www.pcre.org/) 正则表达式。例如,`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — 允许使用 [LIKE](/sql-reference/functions/string-search-functions#like) 运算符来过滤用户主机。例如,`HOST LIKE '%'` 等同于 `HOST ANY`,`HOST LIKE '%.mysite.com'` 过滤 `mysite.com` 域中的所有主机。

另一种指定主机的方法是在用户名后使用 `@` 语法。示例:

- `CREATE USER mira@'127.0.0.1'` — 等同于 `HOST IP` 语法。
- `CREATE USER mira@'localhost'` — 等同于 `HOST LOCAL` 语法。
- `CREATE USER mira@'192.168.%.%'` — 等同于 `HOST LIKE` 语法。

:::tip
ClickHouse 将 `user_name@'address'` 作为一个整体的用户名来处理。因此,从技术上讲,您可以创建多个具有相同 `user_name` 但 `@` 后面结构不同的用户。但是,我们不建议这样做。
:::


## VALID UNTIL 子句 {#valid-until-clause}

允许您为身份验证方法指定过期日期和可选的时间。该子句接受字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式表示日期时间。默认情况下,此参数的值为 `'infinity'`。
`VALID UNTIL` 子句只能与身份验证方法一起指定,但查询中未指定任何身份验证方法时除外。在这种情况下,`VALID UNTIL` 子句将应用于所有现有的身份验证方法。

示例:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ``CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'``
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`


## GRANTEES 子句 {#grantees-clause}

指定允许从当前用户接收[权限](../../../sql-reference/statements/grant.md#privileges)的用户或角色,前提条件是当前用户也已通过 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax) 获得了所有必需的访问权限。`GRANTEES` 子句的选项:

- `user` — 指定当前用户可以向其授予权限的用户。
- `role` — 指定当前用户可以向其授予权限的角色。
- `ANY` — 当前用户可以向任何人授予权限。这是默认设置。
- `NONE` — 当前用户不能向任何人授予权限。

您可以使用 `EXCEPT` 表达式排除任何用户或角色。例如,`CREATE USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 拥有通过 `GRANT OPTION` 授予的某些权限,则可以将这些权限授予除 `user2` 之外的任何人。


## 示例 {#examples-1}

创建受密码 `qwerty` 保护的用户账户 `mira`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` 应在运行 ClickHouse 服务器的主机上启动客户端应用程序。

创建用户账户 `john`,为其分配角色并将这些角色设为默认角色:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

创建用户账户 `john` 并将其所有未来角色设为默认角色:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

当将来为 `john` 分配某个角色时,该角色将自动成为默认角色。

创建用户账户 `john` 并将其所有未来角色设为默认角色,但 `role1` 和 `role2` 除外:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

创建用户账户 `john` 并允许其将权限授予用户账户 `jack`:

```sql
CREATE USER john GRANTEES jack;
```

使用查询参数创建用户账户 `john`:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
