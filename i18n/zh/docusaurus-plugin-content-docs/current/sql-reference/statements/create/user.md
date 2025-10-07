---
'description': '用户的文档'
'sidebar_label': 'USER'
'sidebar_position': 39
'slug': '/sql-reference/statements/create/user'
'title': 'CREATE USER'
'doc_type': 'reference'
---

创建 [用户账户](../../../guides/sre/user-management/index.md#user-account-management)。

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

`ON CLUSTER` 子句允许在集群上创建用户，参见 [分布式DDL](../../../sql-reference/distributed-ddl.md)。

## 身份识别 {#identification}

用户身份识别有多种方式：

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

密码复杂性要求可在 [config.xml](/operations/configuration-files) 中进行编辑。下面是一个示例配置，要求密码至少为 12 个字符长，并包含 1 个数字。每个密码复杂性规则需要一个正则表达式与密码进行匹配，并提供规则的描述。

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
在 ClickHouse Cloud 中，默认情况下，密码必须满足以下复杂性要求：
- 至少 12 个字符长
- 至少包含 1 个数字字符
- 至少包含 1 个大写字符
- 至少包含 1 个小写字符
- 至少包含 1 个特殊字符
:::

## 示例 {#examples}

1. 以下用户名是 `name1`，不需要密码——显然这并没有提供太多安全性：

```sql
CREATE USER name1 NOT IDENTIFIED
```

2. 要指定一个明文密码：

```sql
CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
```

    :::tip
    密码存储在 `/var/lib/clickhouse/access` 中的 SQL 文本文件中，因此使用 `plaintext_password` 不是一个好主意。请尝试使用 `sha256_password`，如下所示...
    :::

3. 最常用的选项是使用一个以 SHA-256 哈希的密码。当您指定 `IDENTIFIED WITH sha256_password` 时，ClickHouse 将为您哈希密码。例如：

```sql
CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
```

    当前 `name3` 用户可以使用 `my_password` 登录，但密码存储为上述哈希值。以下 SQL 文件已在 `/var/lib/clickhouse/access` 中创建并在服务器启动时执行：

```bash
/var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
```

    :::tip
    如果您已经为用户名创建了哈希值和相应的盐值，则可以使用 `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`。对于使用 `SALT` 的 `sha256_hash` 身份验证——哈希必须是从‘password’和‘salt’的串联计算得出的。
    :::

4. `double_sha1_password` 通常不需要，但在处理需要此功能的客户端（如 MySQL 接口）时，这一点很方便：

```sql
CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
```

    ClickHouse 生成并运行以下查询：

```response
CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
```

5. `bcrypt_password` 是存储密码的最安全选项。它使用 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 算法，在密码哈希被破解的情况下仍然能抵御暴力攻击。

```sql
CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
```

    此方法的密码长度限制为 72 个字符。
    bcrypt 的工作因子参数，定义计算哈希和验证密码所需的计算量和时间，可以在服务器配置中进行修改：

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

    工作因子必须在 4 到 31 之间，默认值为 12。

   :::warning
   对于高频身份验证的应用程序，
   由于 bcrypt 在较高工作因子下的计算开销，
   请考虑其他身份验证方法。
   :::

6. 密码类型也可以省略：

```sql
CREATE USER name6 IDENTIFIED BY 'my_password'
```

    在这种情况下，ClickHouse 将使用服务器配置中指定的默认密码类型：

```xml
<default_password_type>sha256_password</default_password_type>
```

    可用的密码类型有：`plaintext_password`，`sha256_password`，`double_sha1_password`。

7. 可以指定多种身份验证方法：

```sql
CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
```

注意：
1. 较旧版本的 ClickHouse 可能不支持多种身份验证方法的语法。因此，如果 ClickHouse 服务器包含这样的用户并降级到不支持它的版本，这些用户将变得不可用，某些与用户相关的操作将会出现故障。为了平稳降级，必须在降级之前将所有用户设为只包含单一身份验证方法。或者，如果在没有适当程序的情况下降级了服务器，则应删除有问题的用户。
2. 出于安全原因，`no_password` 不能与其他身份验证方法共存。因此，您只能在查询中指定 `no_password`，如果它是唯一的身份验证方法。

## 用户主机 {#user-host}

用户主机是可以与 ClickHouse 服务器建立连接的主机。主机可以在 `HOST` 查询部分以以下方式指定：

- `HOST IP 'ip_address_or_subnetwork'` — 用户只能从指定的 IP 地址或 [子网](https://en.wikipedia.org/wiki/Subnetwork) 连接到 ClickHouse 服务器。例如：`HOST IP '192.168.0.0/16'`，`HOST IP '2001:DB8::/32'`。在生产中，只应指定 `HOST IP` 元素（IP 地址及其掩码），因为使用 `host` 和 `host_regexp` 可能会造成额外的延迟。
- `HOST ANY` — 用户可以从任何位置连接。这是默认选项。
- `HOST LOCAL` — 用户只能在本地连接。
- `HOST NAME 'fqdn'` — 用户主机可以指定为 FQDN。例如，`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — 在指定用户主机时，可以使用 [pcre](http://www.pcre.org/) 正则表达式。例如，`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — 允许您使用 [LIKE](/sql-reference/functions/string-search-functions#like) 运算符来过滤用户主机。例如，`HOST LIKE '%'` 等同于 `HOST ANY`，`HOST LIKE '%.mysite.com'` 过滤所有在 `mysite.com` 域中的主机。

指定主机的另一种方法是使用 `@` 语法跟在用户名后面。例如：

- `CREATE USER mira@'127.0.0.1'` — 等同于 `HOST IP` 语法。
- `CREATE USER mira@'localhost'` — 等同于 `HOST LOCAL` 语法。
- `CREATE USER mira@'192.168.%.%'` — 等同于 `HOST LIKE` 语法。

:::tip
ClickHouse 将 `user_name@'address'` 作为一个整体用户名。因此，技术上您可以创建多个具有相同 `user_name` 和不同 `@` 后构造的用户。然而，我们不推荐这样做。
:::

## 有效直到子句 {#valid-until-clause}

允许您指定身份验证方法的到期日期，并可选择性地指定时间。它接受一个字符串作为参数。推荐使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式进行日期时间。默认情况下，此参数等于 `'infinity'`。
`VALID UNTIL` 子句只能与身份验证方法一起指定，除非查询中未指定任何身份验证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有现有身份验证方法。

示例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## 授权人子句 {#grantees-clause}

指定可以从该用户获得 [权限](../../../sql-reference/statements/grant.md#privileges) 的用户或角色，前提是该用户也具有所有必需的访问权限，并附加 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)。`GRANTEES` 子句的选项：

- `user` — 指定该用户可以授予权限的用户。
- `role` — 指定该用户可以授予权限的角色。
- `ANY` — 该用户可以向任何人授予权限。这是默认设置。
- `NONE` — 该用户无法授予权限。

您可以通过使用 `EXCEPT` 表达式排除任何用户或角色。例如，`CREATE USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 拥有某些授予了 `GRANT OPTION` 的权限，它将能够向任何人授予这些权限，除了 `user2`。

## 示例 {#examples-1}

创建用户账户 `mira`，密码为 `qwerty`：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` 应在 ClickHouse 服务器运行的主机上启动客户端应用程序。

创建用户账户 `john`，并为其分配角色，使这些角色成为默认角色：

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

创建用户账户 `john`，使他所有未来的角色成为默认角色：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

当将某些角色在未来分配给 `john` 时，它将自动成为默认。

创建用户账户 `john`，使他所有未来的角色成为默认角色，除了 `role1` 和 `role2`：

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

创建用户账户 `john`，并允许他将其权限授予 `jack` 账户的用户：

```sql
CREATE USER john GRANTEES jack;
```

使用查询参数创建用户账户 `john`：

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
