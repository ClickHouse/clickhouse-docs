---
description: '用户文档'
sidebar_label: 'USER'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'CREATE USER'
doc_type: 'reference'
---

创建[用户账号](../../../guides/sre/user-management/index.md#user-account-management)。

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

`ON CLUSTER` 子句可用于在整个集群中创建用户，参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

## 身份验证 {#identification}

可以通过多种方式对用户进行身份验证：

* `IDENTIFIED WITH no_password`
* `IDENTIFIED WITH plaintext_password BY 'qwerty'`
* `IDENTIFIED WITH sha256_password BY 'qwerty'` 或 `IDENTIFIED BY 'password'`
* `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
* `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
* `IDENTIFIED WITH double_sha1_hash BY 'hash'`
* `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
* `IDENTIFIED WITH bcrypt_hash BY 'hash'`
* `IDENTIFIED WITH ldap SERVER 'server_name'`
* `IDENTIFIED WITH kerberos` 或 `IDENTIFIED WITH kerberos REALM 'realm'`
* `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
* `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
* `IDENTIFIED WITH http SERVER 'http_server'` 或 `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
* `IDENTIFIED BY 'qwerty'`

密码复杂度要求可以在 [config.xml](/operations/configuration-files) 中进行配置。下面是一个示例配置，要求密码长度至少为 12 个字符，并且至少包含 1 个数字。每条密码复杂度规则都需要提供一个用于匹配密码的正则表达式以及该规则的描述。

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
在 ClickHouse Cloud 中，默认情况下，密码必须符合以下复杂度要求：

* 长度至少为 12 个字符
* 至少包含 1 个数字
* 至少包含 1 个大写字母
* 至少包含 1 个小写字母
* 至少包含 1 个特殊字符
  :::

## 示例 {#examples}

1. 以下用户名为 `name1`，且不需要密码——显然几乎没有任何安全保障：

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. 指定明文密码：

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    密码会以 SQL 文本文件的形式存储在 `/var/lib/clickhouse/access` 中，因此使用 `plaintext_password` 并不是一个好主意。请改用 `sha256_password`，如下一个示例所示……
    :::

3. 最常见的选项是使用经 SHA-256 哈希后的密码。当你指定 `IDENTIFIED WITH sha256_password` 时，ClickHouse 会帮你对密码进行哈希。例如：

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    现在，`name3` 用户可以使用 `my_password` 登录，但密码会以上述哈希值的形式进行存储。以下 SQL 文件会被创建在 `/var/lib/clickhouse/access` 中，并在服务器启动时执行：

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    如果你已经为某个用户名生成了哈希值以及对应的 salt，那么可以使用 `IDENTIFIED WITH sha256_hash BY 'hash'` 或 `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`。对于使用 `SALT` 的 `sha256_hash` 认证，哈希值必须从 `'password'` 与 `'salt'` 拼接后的字符串计算得到。
    :::

4. `double_sha1_password` 通常不是必须的，但在处理某些需要它的客户端（例如通过 MySQL 接口的客户端）时会派上用场：

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse 将生成并运行如下查询：

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` 是存储密码时最安全的选项。它使用 [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) 算法，即便密码哈希被泄露，该算法仍能抵抗暴力破解攻击。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    使用该方法时，密码长度限制为 72 个字符。  
    bcrypt 的工作因子参数（work factor）定义了计算哈希和验证密码所需的计算量和时间，可以在服务器配置中进行修改：

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    工作因子必须在 4 到 31 之间，默认值为 12。

   :::warning
   对于认证频率较高的应用，
   请考虑使用其他认证方法，
   以避免在较高工作因子下 bcrypt 的计算开销。
   :::
6. 
6. 也可以省略密码类型：

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    在这种情况下，ClickHouse 将使用服务器配置中指定的默认密码类型：

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    可用的密码类型包括：`plaintext_password`、`sha256_password`、`double_sha1_password`。

7. 可以指定多种认证方法：

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

Notes:
1. 较旧版本的 ClickHouse 可能不支持多种认证方法的语法。因此，如果 ClickHouse 服务器中已经存在此类用户并被降级到不支持该语法的版本，这些用户将变得不可用，且部分与用户相关的操作将无法正常工作。为了平滑降级，必须在降级之前将所有用户配置为仅包含单一认证方法。或者，如果服务器在未按正确流程操作的情况下已经被降级，则应删除这些有问题的用户。
2. 出于安全原因，`no_password` 不能与其他认证方法共存。因此，只有在 `no_password` 是查询中唯一的认证方法时，才能指定 `no_password`。 

## 用户主机 {#user-host}

用户主机是指可以与 ClickHouse 服务器建立连接的主机。可以在查询中的 `HOST` 子句中通过以下方式指定主机：

- `HOST IP 'ip_address_or_subnetwork'` — 用户只能从指定的 IP 地址或[子网](https://en.wikipedia.org/wiki/Subnetwork)连接到 ClickHouse 服务器。示例：`HOST IP '192.168.0.0/16'`、`HOST IP '2001:DB8::/32'`。在生产环境中，只使用 `HOST IP` 元素（IP 地址及其掩码），因为使用 `host` 和 `host_regexp` 可能会引入额外的延迟。
- `HOST ANY` — 用户可以从任意位置连接。这是默认选项。
- `HOST LOCAL` — 用户只能从本地连接。
- `HOST NAME 'fqdn'` — 用户主机可以指定为 FQDN。例如：`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — 指定用户主机时可以使用 [pcre](http://www.pcre.org/) 正则表达式。例如：`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — 允许使用 [LIKE](/sql-reference/functions/string-search-functions#like) 运算符过滤用户主机。例如：`HOST LIKE '%'` 等价于 `HOST ANY`，`HOST LIKE '%.mysite.com'` 会筛选出 `mysite.com` 域中的所有主机。

另一种指定主机的方式是在用户名后使用 `@` 语法。示例：

- `CREATE USER mira@'127.0.0.1'` — 等价于 `HOST IP` 语法。
- `CREATE USER mira@'localhost'` — 等价于 `HOST LOCAL` 语法。
- `CREATE USER mira@'192.168.%.%'` — 等价于 `HOST LIKE` 语法。

:::tip
ClickHouse 会将 `user_name@'address'` 视为一个完整的用户名。因此，从技术上讲，可以创建多个具有相同 `user_name`、但在 `@` 后部分不同的用户。不过，不建议这样做。
:::

## VALID UNTIL 子句 {#valid-until-clause}

用于为某个认证方法指定过期日期，以及可选的过期时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式表示日期时间。默认情况下，该参数为 `'infinity'`。
`VALID UNTIL` 子句只能与某个认证方法一起指定，除非查询中未指定任何认证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有已存在的认证方法。

示例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`

## GRANTEES Clause {#grantees-clause}

Specifies users or roles which are allowed to receive [privileges](../../../sql-reference/statements/grant.md#privileges) from this user on the condition this user has also all required access granted with [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax). Options of the `GRANTEES` clause:

- `user` — Specifies a user this user can grant privileges to.
- `role` — Specifies a role this user can grant privileges to.
- `ANY` — This user can grant privileges to anyone. It's the default setting.
- `NONE` — This user can grant privileges to none.

You can exclude any user or role by using the `EXCEPT` expression. For example, `CREATE USER user1 GRANTEES ANY EXCEPT user2`. It means if `user1` has some privileges granted with `GRANT OPTION` it will be able to grant those privileges to anyone except `user2`.

## Examples {#examples-1}

Create the user account `mira` protected by the password `qwerty`:

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` should start client app at the host where the ClickHouse server runs.

Create the user account `john`, assign roles to it and make this roles default:

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

Create the user account `john` and make all his future roles default:

```sql
CREATE USER john DEFAULT ROLE ALL;
```

When some role is assigned to `john` in the future, it will become default automatically.

Create the user account `john` and make all his future roles default excepting `role1` and `role2`:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

Create the user account `john` and allow him to grant his privileges to the user with `jack` account:

```sql
CREATE USER john GRANTEES jack;
```

Use a query parameter to create the user account `john`:

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
