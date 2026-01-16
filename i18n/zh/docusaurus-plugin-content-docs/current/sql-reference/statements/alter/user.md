---
description: '用户文档'
sidebar_label: 'USER'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
doc_type: 'reference'
---

修改 ClickHouse 用户账户。

语法：

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

要使用 `ALTER USER` 语句，您必须具有 [ALTER USER](../../../sql-reference/statements/grant.md#access-management) 权限。

## GRANTEES 子句 \\{#grantees-clause\\}

指定允许从该用户处接收[权限](../../../sql-reference/statements/grant.md#privileges)的用户或角色，前提是该用户自身也已通过带有 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax) 的授权获得所有必需的访问权限。`GRANTEES` 子句的选项：

- `user` — 指定该用户可以向其授予权限的用户。
- `role` — 指定该用户可以向其授予权限的角色。
- `ANY` — 该用户可以向任意用户或角色授予权限。此为默认设置。
- `NONE` — 该用户不能向任何用户或角色授予权限。

您可以使用 `EXCEPT` 表达式排除任意用户或角色。例如，`ALTER USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 拥有一些通过 `GRANT OPTION` 授予的权限，则它可以将这些权限授予除 `user2` 之外的任意用户或角色。

## 示例 \\{#examples\\}

将已分配的角色设为默认角色：

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

如果事先没有为用户分配任何角色，ClickHouse 会抛出异常。

将所有已分配的角色设为默认角色：

```sql
ALTER USER user DEFAULT ROLE ALL
```

如果今后为某个用户分配某个角色，该角色会自动设为默认角色。

将所有已分配的角色设为默认，除了 `role1` 和 `role2` 之外：

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

允许用户 `john` 将自己的权限授予用户 `jack`：

```sql
ALTER USER john GRANTEES jack;
```

在保留现有认证方式的前提下，为用户添加新的认证方式：

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Notes:

1. 旧版本的 ClickHouse 可能不支持多种认证方法的语法。因此，如果 ClickHouse 服务器中包含此类用户并被降级到不支持该语法的版本，这些用户将无法使用，与用户相关的一些操作也将无法正常工作。为了平滑降级，必须在降级前将所有用户都设置为仅包含单一认证方法。或者，如果服务器在未按正确流程操作的情况下已经降级，则应删除这些存在问题的用户。
2. 出于安全原因，`no_password` 不能与其他认证方法共存。
   因此，无法通过 `ADD` 添加 `no_password` 认证方法。下面的查询将报错：

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

如果你想为某个用户删除认证方法并仅依赖 `no_password`，必须在下面的替代表达式中进行指定。

重置认证方法，并仅保留查询中指定的那些方法（等同于前面使用不带 ADD 关键字的 IDENTIFIED 时的效果）：

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

重置身份验证方式，并仅保留最近添加的那一种：

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 子句 \\{#valid-until-clause\\}

用于为身份验证方法指定到期日期以及（可选的）时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式表示日期时间。默认情况下，此参数为 `'infinity'`。
`VALID UNTIL` 子句只能与某种身份验证方法一起指定，除非查询中未指定任何身份验证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有现有的身份验证方法。

示例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
