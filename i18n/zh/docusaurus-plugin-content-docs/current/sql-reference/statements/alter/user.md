---
slug: /sql-reference/statements/alter/user
sidebar_position: 45
sidebar_label: USER
title: "ALTER USER"
---

更改 ClickHouse 用户帐户。

语法：

``` sql
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

要使用 `ALTER USER`，您必须具有 [ALTER USER](../../../sql-reference/statements/grant.md#access-management) 权限。

## GRANTEES 子句 {#grantees-clause}

指定允许从此用户接收 [权限](../../../sql-reference/statements/grant.md#privileges) 的用户或角色，前提是该用户还拥有所有必需的访问权限，并带有 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)。`GRANTEES` 子句的选项：

- `user` — 指定此用户可以授予权限的用户。
- `role` — 指定此用户可以授予权限的角色。
- `ANY` — 此用户可以授予权限给任何人。默认设置为此。
- `NONE` — 此用户无法授予任何权限。

您可以使用 `EXCEPT` 表达式排除任何用户或角色。例如，`ALTER USER user1 GRANTEES ANY EXCEPT user2`。这意味着，如果 `user1` 授予了一些带有 `GRANT OPTION` 的权限，则它将能够将这些权限授予除了 `user2` 之外的任何人。

## 示例 {#examples}

将分配的角色设置为默认：

``` sql
ALTER USER user DEFAULT ROLE role1, role2
```

如果用户之前未分配角色，ClickHouse 会抛出异常。

将所有分配的角色设置为默认：

``` sql
ALTER USER user DEFAULT ROLE ALL
```

如果将来为用户分配角色，则该角色将自动成为默认角色。

将所有分配的角色设置为默认，排除 `role1` 和 `role2`：

``` sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

允许 `john` 帐户的用户将其权限授予 `jack` 帐户的用户：

``` sql
ALTER USER john GRANTEES jack;
```

在保留现有身份验证方法的同时为用户添加新身份验证方法：

``` sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意：
1. 较旧版本的 ClickHouse 可能不支持多个身份验证方法的语法。因此，如果 ClickHouse 服务器中包含此类用户并降级到不支持的版本，则此类用户将变得不可用，并且某些与用户相关的操作将中断。为了平稳降级，必须先将所有用户设置为包含单一身份验证方法。如果服务器在没有适当程序的情况下被降级，则应删除有问题的用户。
2. `no_password` 由于安全原因不能与其他身份验证方法共存。因此，不可能 `ADD` 一个 `no_password` 身份验证方法。下面的查询将抛出错误：

``` sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

如果您想要删除用户的身份验证方法并依赖 `no_password`，必须在下面的替换形式中指定。

重置身份验证方法并添加查询中指定的身份验证方法（带有 `IDENTIFIED` 前缀而不使用 `ADD` 关键字的效果）：

``` sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

重置身份验证方法并保留最近添加的一个：
``` sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 子句 {#valid-until-clause}

允许您指定身份验证方法的到期日期和（可选）时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式的日期时间。默认情况下，此参数等于 `'infinity'`。
`VALID UNTIL` 子句只能与身份验证方法一起指定，除非查询中未指定身份验证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有现有的身份验证方法。

示例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`
