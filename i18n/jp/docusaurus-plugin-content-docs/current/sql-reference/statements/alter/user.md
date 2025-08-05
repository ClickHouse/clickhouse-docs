---
description: 'ユーザーのためのドキュメント'
sidebar_label: 'ユーザー'
sidebar_position: 45
slug: '/sql-reference/statements/alter/user'
title: 'ALTER USER'
---



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

`ALTER USER` を使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management) 権限が必要です。

## GRANTEES Clause {#grantees-clause}

このクエリを使用するユーザーが、[privileges](../../../sql-reference/statements/grant.md#privileges)を受け取ることを許可されたユーザーまたはロールを指定します。条件として、このユーザーには[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で必要なアクセス権がすべて与えられている必要があります。`GRANTEES` エクスプレスのオプション：

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。これはデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT` 式を使用することで、任意のユーザーまたはロールを除外できます。例えば、`ALTER USER user1 GRANTEES ANY EXCEPT user2` という意味は、`user1`に権限が付与されていれば、`user2`を除く誰にでもその権限を付与できることを示します。

## Examples {#examples}

割り当てられたロールをデフォルトとして設定：

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

ユーザーにロールが以前に割り当てられていない場合、ClickHouseは例外をスローします。

すべての割り当てられたロールをデフォルトとして設定：

```sql
ALTER USER user DEFAULT ROLE ALL
```

将来的にロールがユーザーに割り当てられると、自動的にデフォルトになります。

`role1` と `role2` を除いてすべての割り当てられたロールをデフォルトとして設定：

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john` アカウントを持つユーザーが `jack` アカウントを持つユーザーに権限を付与できるようにします：

```sql
ALTER USER john GRANTEES jack;
```

既存の認証方法を保持しながら、新しい認証方法を追加：

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注：
1. 以前のバージョンの ClickHouse は、複数の認証方法の構文をサポートしていない可能性があります。したがって、ClickHouse サーバーにそのようなユーザーが含まれている場合、サーバーをサポートされていないバージョンにダウングレードすると、そのようなユーザーは使えなくなり、一部のユーザー関連の操作が壊れます。適切にダウングレードするためには、ダウングレード前にすべてのユーザーが単一の認証方法を含むように設定する必要があります。あるいは、適切な手順なしでサーバーがダウングレードされた場合、問題のあるユーザーは削除する必要があります。
2. `no_password` は、セキュリティ上の理由から他の認証方法と共存できません。そのため、`no_password` 認証方法を `ADD` することはできません。以下のクエリはエラーをスローします：

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方法を削除し、`no_password` に依存したい場合は、以下の置換形式で指定する必要があります。

認証方法をリセットし、クエリで指定されたものを追加（`ADD` キーワードなしの先頭の IDENTIFIED の効果）：

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

認証方法をリセットし、最新の追加された方法を保持：

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL Clause {#valid-until-clause}

認証方法の有効期限を指定できるようにします。パラメータとして文字列を受け取ります。日付時刻には `YYYY-MM-DD [hh:mm:ss] [timezone]` フォーマットを使用することをお勧めします。デフォルトでは、このパラメータは `'infinity'` に等しくなります。
`VALID UNTIL` 句は、認証方法と共にのみ指定可能であり、クエリ内に認証方法が指定されていない場合を除きます。このシナリオでは、`VALID UNTIL` 句がすべての既存の認証方法に適用されます。

例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
