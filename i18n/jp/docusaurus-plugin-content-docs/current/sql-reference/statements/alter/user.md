---
slug: /sql-reference/statements/alter/user
sidebar_position: 45
sidebar_label: USER
title: "ALTER USER"
---

ClickHouse のユーザーアカウントを変更します。

構文：

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

`ALTER USER` を使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management) 権限が必要です。

## GRANTEES 句 {#grantees-clause}

このユーザーから特定のユーザーまたはロールに [特権](../../../sql-reference/statements/grant.md#privileges) を付与できることを指定します。このユーザーがすべての必要なアクセスを [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax) によって付与されていることが条件です。`GRANTEES` 句のオプション：

- `user` — このユーザーが特権を付与できるユーザーを指定します。
- `role` — このユーザーが特権を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも特権を付与できます。これはデフォルトの設定です。
- `NONE` — このユーザーは特権を付与できません。

`EXCEPT` 式を使用して、任意のユーザーやロールを除外できます。たとえば、`ALTER USER user1 GRANTEES ANY EXCEPT user2` のように指定します。これは、`user1` が `GRANT OPTION` によって特権を付与されている場合、それを `user2` を除く誰にでも付与できることを意味します。

## 例 {#examples}

割り当てられたロールをデフォルトに設定します：

``` sql
ALTER USER user DEFAULT ROLE role1, role2
```

ロールが以前にユーザーに割り当てられていない場合、ClickHouse は例外をスローします。

割り当てられたすべてのロールをデフォルトに設定します：

``` sql
ALTER USER user DEFAULT ROLE ALL
```

将来的にロールがユーザーに割り当てられた場合、それは自動的にデフォルトになります。

`role1` と `role2` を除いて、割り当てられたすべてのロールをデフォルトに設定します：

``` sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john` アカウントを持つユーザーが `jack` アカウントを持つユーザーに自分の特権を付与できるようにします：

``` sql
ALTER USER john GRANTEES jack;
```

既存の認証方法を保持しながら、新しい認証方法をユーザーに追加します：

``` sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注：
1. 古いバージョンの ClickHouse は複数の認証方法の構文をサポートしていないかもしれません。そのため、ClickHouse サーバーがそのようなユーザーを含んでいて、サポートされていないバージョンにダウングレードされると、そのようなユーザーは無効になり、一部のユーザー関連の操作が壊れる可能性があります。ダウングレードをスムーズに行うには、ダウングレード前にすべてのユーザーが単一の認証方法を含むように設定する必要があります。あるいは、適切な手順を経ずにサーバーがダウングレードされた場合、故障したユーザーは削除されるべきです。
2. `no_password` は他の認証方法と共存できないため、セキュリティ上の理由から、`no_password` 認証方法を `ADD` することはできません。以下のクエリはエラーをスローします：

``` sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方法を削除して `no_password` に依存したい場合は、以下の置き換え形式で指定する必要があります。

認証方法をリセットし、クエリで指定されたものを追加します（`ADD` キーワードなしの先頭の IDENTIFIED の効果）：

``` sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

認証方法をリセットし、最近追加されたものを保持します：
``` sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 句 {#valid-until-clause}

認証方法の有効期限日およびオプションで時刻を指定できます。文字列をパラメータとして受け入れます。日時には `YYYY-MM-DD [hh:mm:ss] [timezone]` 形式の使用が推奨されます。デフォルトでは、このパラメータは `'infinity'` です。
`VALID UNTIL` 句は、クエリで認証方法が指定されていない場合を除き、認証方法とともにのみ指定できます。このシナリオでは、`VALID UNTIL` 句はすべての既存の認証方法に適用されます。

例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01'`
