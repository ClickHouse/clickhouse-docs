---
description: 'ユーザーのためのドキュメント'
sidebar_label: 'ユーザー'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
---

ClickHouseのユーザーアカウントを変更します。

構文:

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

`ALTER USER`を使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management)権限が必要です。

## GRANTEES句 {#grantees-clause}

このユーザーからの[権限](../../../sql-reference/statements/grant.md#privileges)を付与できるユーザーまたはロールを指定します。このユーザーは、必要なすべてのアクセスが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で付与されている必要があります。`GRANTEES`句のオプション:

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。これはデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT`式を使用して任意のユーザーまたはロールを除外できます。たとえば、`ALTER USER user1 GRANTEES ANY EXCEPT user2`です。これは、`user1`が`GRANT OPTION`で付与された権限を持っている場合、`user2`を除く誰にでもその権限を付与できることを意味します。

## 例 {#examples}

割り当てられたロールをデフォルトとして設定します:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

ロールがユーザーに以前に割り当てられていない場合、ClickHouseは例外をスローします。

すべての割り当てられたロールをデフォルトとして設定します:

```sql
ALTER USER user DEFAULT ROLE ALL
```

将来的にロールがユーザーに割り当てられると、それは自動的にデフォルトになります。

割り当てられたすべてのロールをデフォルトとして設定しますが、`role1`と`role2`を除外します:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john`アカウントを持つユーザーが`jack`アカウントを持つユーザーに自分の権限を付与できるようにします:

```sql
ALTER USER john GRANTEES jack;
```

ユーザーに新しい認証方法を追加し、既存の方法を保持します:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注:
1. 古いバージョンのClickHouseは複数の認証方法の構文をサポートしていない可能性があります。そのため、ClickHouseサーバーがそのようなユーザーを含んでいて、サポートされていないバージョンにダウングレードされた場合、そのようなユーザーは無効になり、いくつかのユーザー関連の操作が壊れることになります。ダウングレードを円滑に行うためには、ダウングレードする前にすべてのユーザーを1つの認証方法を含むように設定する必要があります。あるいは、適切な手順なしでサーバーがダウングレードされた場合、問題のあるユーザーは削除する必要があります。
2. `no_password`はセキュリティ上の理由から他の認証方法と共存できません。そのため、`no_password`認証方法を`ADD`することはできません。以下のクエリはエラーを投げます:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方法を削除し、`no_password`に依存したい場合は、以下の置き換え形式で指定する必要があります。

認証方法をリセットし、クエリで指定されたものを追加します（`ADD`キーワードなしの先行`IDENTIFIED`の効果）:

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

認証方法をリセットし、最近追加された方法を保持します:

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL句 {#valid-until-clause}

認証方法の有効期限を指定することができ、オプションで時間も指定できます。パラメータとして文字列を受け入れます。datetimeには、`YYYY-MM-DD [hh:mm:ss] [timezone]`形式を使用することをお勧めします。デフォルトでは、このパラメータは`'infinity'`です。
`VALID UNTIL`句は、認証方法とともにのみ指定できます。クエリで認証方法が指定されていない場合を除いて、この場合、`VALID UNTIL`句はすべての既存の認証方法に適用されます。

例:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

