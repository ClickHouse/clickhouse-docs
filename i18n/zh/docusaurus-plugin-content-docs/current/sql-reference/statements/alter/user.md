Changes ClickHouse user accounts.

Syntax:

```sql
ALTER USER [IF EXISTS] name1 [RENAME TO new_name |, name2 [,...]] 
    [ON CLUSTER cluster_name]
    [NOT IDENTIFIED | RESET AUTHENTICATION METHODS TO NEW | {IDENTIFIED | ADD IDENTIFIED} {[WITH {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] BY {'password' | 'hash'}} | WITH NO_PASSWORD | {WITH ldap SERVER 'server_name'} | {WITH kerberos [REALM 'realm']} | {WITH ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa|...'} | {WITH http SERVER 'server_name' [SCHEME 'Basic']} [VALID UNTIL datetime]
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] BY {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [[ADD | DROP] HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [VALID UNTIL datetime]
    [DEFAULT ROLE role [,...] | ALL | ALL EXCEPT role [,...] ]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [DROP ALL PROFILES]
    [DROP ALL SETTINGS]
    [DROP SETTINGS variable [,...] ]
    [DROP PROFILES 'profile_name' [,...] ]
    [ADD|MODIFY SETTINGS variable [=value] [MIN [=] min_value] [MAX [=] max_value] [READONLY|WRITABLE|CONST|CHANGEABLE_IN_READONLY] [,...] ]
    [ADD PROFILES 'profile_name' [,...] ]
```

要使用 `ALTER USER`，您必须拥有 [ALTER USER](../../../sql-reference/statements/grant.md#access-management) 权限。

## GRANTEES Clause {#grantees-clause}

指定允许接收此用户 [privileges](../../../sql-reference/statements/grant.md#privileges) 的用户或角色，前提是此用户也获得了所有必需的访问权限，并具有 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)。`GRANTEES` 子句的选项：

- `user` — 指定此用户可以授予权限的用户。
- `role` — 指定此用户可以授予权限的角色。
- `ANY` — 此用户可以授予任何人权限。这是默认设置。
- `NONE` — 此用户不能授予任何权限。

您可以通过使用 `EXCEPT` 表达式排除任何用户或角色。例如，`ALTER USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 拥有某些授予了 `GRANT OPTION` 的权限，它将能够授予这些权限给任何人，但不能授予给 `user2`。

## Examples {#examples}

将分配的角色设置为默认：

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

如果角色未事先分配给用户，ClickHouse 将抛出异常。

将所有已分配的角色设置为默认：

```sql
ALTER USER user DEFAULT ROLE ALL
```

如果将来将角色分配给用户，它将自动成为默认。

将所有已分配的角色设置为默认，但排除 `role1` 和 `role2`：

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

允许 `john` 账户的用户将他的权限授予 `jack` 账户的用户：

```sql
ALTER USER john GRANTEES jack;
```

在保持现有身份验证方法的同时，向用户添加新的身份验证方法：

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意：
1. 旧版本的 ClickHouse 可能不支持多重身份验证方法的语法。因此，如果 ClickHouse 服务器包含这样的用户并降级到不支持的版本，这些用户将变得不可用，并且一些与用户相关的操作将出现问题。为了平稳降级，必须在降级之前将所有用户设置为只包含单一身份验证方法。或者，如果服务器在没有正确程序的情况下降级，则应删除有问题的用户。
2. 出于安全原因，`no_password` 不能与其他身份验证方法共存。
因此，不可能 `ADD` 一个 `no_password` 身份验证方法。以下查询将抛出错误：

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

如果您想为用户删除身份验证方法并依赖于 `no_password`，则必须在以下替换形式中指定。

重置身份验证方法并添加查询中指定的方法（效果如同前缀 IDENTIFIED 而没有 ADD 关键字）：

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

重置身份验证方法并保留最近添加的一个：

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL Clause {#valid-until-clause}

允许您为身份验证方法指定过期日期，及可选的时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式表示日期时间。默认情况下，该参数等于 `'infinity'`。`VALID UNTIL` 子句只能与身份验证方法一起指定，除非查询中未指定任何身份验证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有现有的身份验证方法。

示例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
