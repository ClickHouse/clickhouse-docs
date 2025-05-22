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

`ON CLUSTER` 子句允许在集群上创建用户，请参见 [分布式 DDL](../../../sql-reference/distributed-ddl.md)。

## 身份验证 {#identification}

有多种用户身份验证方式：

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

密码复杂性要求可以在 [config.xml](/operations/configuration-files) 中编辑。以下是一个示例配置，它要求密码至少为 12 个字符长，并包含 1 个数字。每个密码复杂性规则需要一个正则表达式与密码匹配，以及该规则的描述。

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
- 至少 12 个字符
- 至少包含 1 个数字字符
- 至少包含 1 个大写字符
- 至少包含 1 个小写字符
- 至少包含 1 个特殊字符
:::

## 示例 {#examples}

1. 下面的用户名是 `name1`，并不需要密码 - 这显然提供的安全性不高：

```sql
CREATE USER name1 NOT IDENTIFIED
```

2. 要指定明文密码：

```sql
CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
```

    :::tip
    密码存储在 `/var/lib/clickhouse/access` 中的 SQL 文本文件中，因此使用 `plaintext_password` 并不是一个好主意。请尝试使用 `sha256_password`，如下面所示...
    :::

3. 最常见的选项是使用使用 SHA-256 哈希的密码。指定 `IDENTIFIED WITH sha256_password` 时，ClickHouse 会为您哈希密码。例如：

```sql
CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
```

    `name3` 用户现在可以使用 `my_password` 登录，但密码以上面的哈希值存储。以下 SQL 文件在 `/var/lib/clickhouse/access` 中创建，并在服务器启动时执行：

```bash
/var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
```

    :::tip
    如果您已经为用户名创建了哈希值和相应的盐值，那么可以使用 `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`。对于使用 `sha256_hash` 的身份验证，哈希必须从 `'password'` 和 `'salt'` 的连接串中计算得出。
    :::

4. 通常情况下不需要 `double_sha1_password`，但在处理需要它的客户时（如 MySQL 接口）会很方便：

```sql
CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
```

    ClickHouse 生成并运行以下查询：

```response
CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
```

5. `bcrypt_password` 是存储密码的最安全选项。它使用 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 算法，即使密码哈希被泄露，也能抵御暴力攻击。

```sql
CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
```

    使用此方法，密码的长度限制为 72 个字符。可以在服务器配置中修改 bcrypt 工作因子参数，该参数定义了计算哈希和验证密码所需的计算量和时间：

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

    工作因子必须在 4 到 31 之间，默认值为 12。

6. 密码的类型也可以省略：

```sql
CREATE USER name6 IDENTIFIED BY 'my_password'
```

    在这种情况下，ClickHouse 将使用服务器配置中指定的默认密码类型：

```xml
<default_password_type>sha256_password</default_password_type>
```

    可用的密码类型包括：`plaintext_password`、`sha256_password`、`double_sha1_password`。

7. 可以指定多种身份验证方法：

```sql
CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
```

注意：
1. 较早版本的 ClickHouse 可能不支持多种身份验证方法的语法。因此，如果 ClickHouse 服务器包含这样的用户并降级到不支持的版本，这些用户将变得不可用，某些用户相关的操作将会中断。为了平稳降级，必须在降级前将所有用户设置为仅包含单一身份验证方法。或者，如果服务器在未执行正确程序的情况下降级，则应删除有问题的用户。
2. 出于安全原因，`no_password` 与其他身份验证方法不能共存。因此，只有在它是查询中唯一的身份验证方法时，您才能指定 `no_password`。

## 用户主机 {#user-host}

用户主机是可以与 ClickHouse 服务器建立连接的主机。主机可以通过以下方式在 `HOST` 查询部分指定：

- `HOST IP 'ip_address_or_subnetwork'` — 用户只能从指定的 IP 地址或 [子网](https://en.wikipedia.org/wiki/Subnetwork) 连接到 ClickHouse 服务器。示例：`HOST IP '192.168.0.0/16'`，`HOST IP '2001:DB8::/32'`。在生产中，只指定 `HOST IP` 元素（IP 地址及其掩码），因为使用 `host` 和 `host_regexp` 可能会导致额外延迟。
- `HOST ANY` — 用户可以从任何位置连接。这是默认选项。
- `HOST LOCAL` — 用户只能本地连接。
- `HOST NAME 'fqdn'` — 用户主机可以指定为 FQDN。例如，`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — 指定用户主机时可以使用 [pcre](http://www.pcre.org/) 正则表达式。例如，`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — 允许您使用 [LIKE](/sql-reference/functions/string-search-functions#like) 操作符来过滤用户主机。例如，`HOST LIKE '%'` 相当于 `HOST ANY`，`HOST LIKE '%.mysite.com'` 过滤所有在 `mysite.com` 域中的主机。

指定主机的另一种方法是使用 `@` 语法跟随用户名。示例：

- `CREATE USER mira@'127.0.0.1'` — 相当于 `HOST IP` 语法。
- `CREATE USER mira@'localhost'` — 相当于 `HOST LOCAL` 语法。
- `CREATE USER mira@'192.168.%.%'` — 相当于 `HOST LIKE` 语法。

:::tip
ClickHouse 将 `user_name@'address'` 视为整体用户名。因此，从技术上讲，您可以创建多个具有相同 `user_name` 和在 `@` 后不同构造的用户。然而，我们不建议这样做。
:::

## 有效直到子句 {#valid-until-clause}

允许您为身份验证方法指定过期日期，并可选指定时间。它接受字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式的日期时间。默认情况下，该参数等于 `'infinity'`。
`VALID UNTIL` 子句只能与身份验证方法一起指定，除非在查询中未指定身份验证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有现有身份验证方法。

示例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## 授权者子句 {#grantees-clause}

指定可以从此用户接收 [权限](../../../sql-reference/statements/grant.md#privileges) 的用户或角色，前提是该用户还必须授予所需的访问权限，使用 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)。`GRANTEES` 子句的选项：

- `user` — 指定该用户可以授予权限的用户。
- `role` — 指定该用户可以授予权限的角色。
- `ANY` — 该用户可以将权限授予任何人。这是默认设置。
- `NONE` — 该用户不能授予任何权限。

您可以使用 `EXCEPT` 表达式排除任何用户或角色。例如，`CREATE USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 拥有某些通过 `GRANT OPTION` 授予的权限，则它将能够将这些权限授予除 `user2` 之外的任何人。

## 示例 {#examples-1}

创建用户账户 `mira`，密码为 `qwerty`：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` 应在运行 ClickHouse 服务器的主机上启动客户端应用程序。

创建用户账户 `john`，为其分配角色并使这些角色成为默认角色：

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

创建用户账户 `john`，并使他未来的所有角色成为默认角色：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

当将某个角色分配给 `john` 时，它将自动成为默认角色。

创建用户账户 `john`，并使他未来的所有角色成为默认角色，除了 `role1` 和 `role2`：

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

创建用户账户 `john`，并允许他将自己的权限授予用户 `jack`：

```sql
CREATE USER john GRANTEES jack;
```
