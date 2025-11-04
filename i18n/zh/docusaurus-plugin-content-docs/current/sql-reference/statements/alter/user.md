---
'description': '用户的文档'
'sidebar_label': 'USER'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/user'
'title': 'ALTER USER'
'doc_type': 'reference'
---

Changes ClickHouse 用户账户。

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

要使用 `ALTER USER`，您必须具有 [ALTER USER](../../../sql-reference/statements/grant.md#access-management) 特权。

## GRANTEES 子句 {#grantees-clause}

指定可以从此用户接收 [特权](../../../sql-reference/statements/grant.md#privileges) 的用户或角色，前提是此用户也具有使用 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax) 授予的所有所需访问权限。 `GRANTEES` 子句的选项：

- `user` — 指定此用户可以授予特权的用户。
- `role` — 指定此用户可以授予特权的角色。
- `ANY` — 该用户可以将特权授予任何人。这是默认设置。
- `NONE` — 该用户不能授予任何特权。

您可以使用 `EXCEPT` 表达式排除任何用户或角色。例如，`ALTER USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 被授予了一些具有 `GRANT OPTION` 的特权，它将能够将这些特权授予任何人，除了 `user2`。

## 示例 {#examples}

将分配的角色设置为默认：

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

如果角色未被先前分配给用户，ClickHouse 将抛出异常。

将所有分配的角色设置为默认：

```sql
ALTER USER user DEFAULT ROLE ALL
```

如果将来将角色分配给用户，它将自动成为默认角色。

将所有分配的角色设置为默认，除了 `role1` 和 `role2`：

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

允许 `john` 账户的用户将其特权授予 `jack` 账户的用户：

```sql
ALTER USER john GRANTEES jack;
```

在保留现有认证方式的同时，向用户添加新的认证方式：

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意：
1. 旧版本的 ClickHouse 可能不支持多个认证方式的语法。因此，如果 ClickHouse 服务器包含这种用户并被降级到不支持该功能的版本，这些用户将变得不可用，并且某些与用户相关的操作将出现故障。为了平稳降级，必须在降级之前将所有用户设置为包含单个认证方式。或者，如果服务器在没有正确程序的情况下被降级，则应删除有问题的用户。
2. 出于安全原因，`no_password` 不能与其他认证方式共存。因此，无法 `ADD` 一个 `no_password` 认证方式。以下查询将引发错误：

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

如果您想删除用户的认证方式并依赖于 `no_password`，必须在下面的替换形式中指定。

重置认证方式并添加查询中指定的方式（与前导 IDENTIFIED 具有相同效果，不带 ADD 关键字）：

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

重置认证方式并保留最近添加的方式：
```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 子句 {#valid-until-clause}

允许您指定认证方式的过期日期和（可选的）时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式的日期时间。默认情况下，该参数等于 `'infinity'`。`VALID UNTIL` 子句只能与认证方式一起指定，除了在查询中没有指定认证方式的情况。在这种情况下，`VALID UNTIL` 子句将适用于所有现有的认证方式。

示例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`
