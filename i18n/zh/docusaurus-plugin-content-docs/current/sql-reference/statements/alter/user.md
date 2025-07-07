---
'description': '用户的文档'
'sidebar_label': 'USER'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/user'
'title': 'ALTER USER'
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

指定允许从此用户接收 [特权](../../../sql-reference/statements/grant.md#privileges) 的用户或角色，前提是此用户也拥有所有通过 [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax) 授予的所需访问权限。`GRANTEES` 子句的选项：

- `user` — 指定此用户可以授予特权的用户。
- `role` — 指定此用户可以授予特权的角色。
- `ANY` — 此用户可以将特权授予任何人。这是默认设置。
- `NONE` — 此用户不能授予任何特权。

您可以使用 `EXCEPT` 表达式排除任何用户或角色。例如，`ALTER USER user1 GRANTEES ANY EXCEPT user2`。这意味着如果 `user1` 已获得某些通过 `GRANT OPTION` 授予的特权，它将能够将这些特权授予除 `user2` 之外的任何人。

## 示例 {#examples}

将分配的角色设置为默认：

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

如果没有之前分配的角色，ClickHouse 将抛出异常。

将所有分配的角色设置为默认：

```sql
ALTER USER user DEFAULT ROLE ALL
```

如果将来为用户分配角色，它将自动成为默认角色。

将所有分配的角色设置为默认，排除 `role1` 和 `role2`：

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

允许具有 `john` 账户的用户将自己的特权授予具有 `jack` 账户的用户：

```sql
ALTER USER john GRANTEES jack;
```

在保留现有身份验证方法的情况下向用户添加新的身份验证方法：

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意：
1. 较旧版本的 ClickHouse 可能不支持多重身份验证方法的语法。因此，如果 ClickHouse 服务器包含此类用户并降级到不支持该功能的版本，则此类用户将变为不可用，并且某些与用户相关的操作将中断。为了优雅地降级，必须在降级之前将所有用户设置为包含单一身份验证方法。或者，如果服务器在没有适当程序的情况下降级，则应删除有问题的用户。
2. 出于安全原因，`no_password` 不能与其他身份验证方法共存。因为这样，无法 `ADD` `no_password` 身份验证方法。以下查询将抛出错误：

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

如果您想为用户删除身份验证方法并依赖 `no_password`，您必须以以下替换形式指定。

重置身份验证方法并添加查询中指定的方法（效果类似于省略 ADD 关键字的 IDENTIFIED）：

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

重置身份验证方法并保留最近添加的一个：
```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 子句 {#valid-until-clause}

允许您指定身份验证方法的到期日期和可选时间。它接受一个字符串作为参数。建议使用 `YYYY-MM-DD [hh:mm:ss] [timezone]` 格式指定日期时间。默认情况下，该参数等于 `'infinity'`。
`VALID UNTIL` 子句只能与身份验证方法一起指定，除非查询中未指定任何身份验证方法。在这种情况下，`VALID UNTIL` 子句将应用于所有现有身份验证方法。

示例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01'`
