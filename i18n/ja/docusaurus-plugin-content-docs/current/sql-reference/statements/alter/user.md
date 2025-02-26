---
slug: /sql-reference/statements/alter/user
sidebar_position: 45
sidebar_label: USER
title: "ALTER USER"
---

ClickHouseのユーザーアカウントを変更します。

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

`ALTER USER`を使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management)権限が必要です。

## GRANTEES句 {#grantees-clause}

このユーザーからの[権限](../../../sql-reference/statements/grant.md#privileges)を受け取ることができるユーザーまたはロールを指定します。このユーザーは、[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で必要なアクセス権をすべて持っている必要があります。`GRANTEES`句のオプション：

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。これはデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT`演算子を使用して特定のユーザーまたはロールを除外することができます。例えば、`ALTER USER user1 GRANTEES ANY EXCEPT user2`という形で、`user1`が`GRANT OPTION`で付与された権限を`user2`以外の誰かに付与できることを意味します。

## 例 {#examples}

割り当てられたロールをデフォルトとして設定します：

``` sql
ALTER USER user DEFAULT ROLE role1, role2
```

ロールがユーザーに以前に割り当てられていない場合、ClickHouseは例外をスローします。

割り当てられたすべてのロールをデフォルトに設定します：

``` sql
ALTER USER user DEFAULT ROLE ALL
```

将来的にロールがユーザーに割り当てられた場合、自動的にデフォルトとなります。

`role1`と`role2`を除外してすべての割り当てられたロールをデフォルトに設定します：

``` sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john`アカウントを持つユーザーが`jack`アカウントを持つユーザーに自分の権限を付与できるようにします：

``` sql
ALTER USER john GRANTEES jack;
```

既存の認証方法を保持しつつ、新しい認証方法をユーザーに追加します：

``` sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意：
1. 古いバージョンのClickHouseは、複数の認証方法の構文をサポートしていないかもしれません。そのため、ClickHouseサーバーにそのようなユーザーが存在し、サポートしていないバージョンにダウングレードされると、そのようなユーザーは使用できなくなり、一部のユーザー関連の操作が破損します。スムーズにダウングレードするためには、ダウングレード前にすべてのユーザーが単一の認証方法を持つように設定する必要があります。逆に、適切な手順なしでサーバーがダウングレードされた場合、不良ユーザーは削除されるべきです。
2. `no_password`はセキュリティ上の理由から他の認証方法と共存できません。したがって、`ADD`で`no_password`認証方法を追加することはできません。以下のクエリはエラーをスローします：

``` sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方法を削除し、`no_password`に依存したい場合は、以下の置き換え形式を指定する必要があります。

認証方法をリセットし、クエリで指定された方法を追加します（`ADD`キーワードなしの先行するIDENTIFIEDの効果）：

``` sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

最新の追加された認証方法を保持して認証方法をリセットします：

``` sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL句 {#valid-until-clause}

認証方法の有効期限の日付と、オプションで時間を指定できるようにします。パラメータとして文字列を受け取ります。日付時刻には`YYYY-MM-DD [hh:mm:ss] [timezone]`形式を使用することをお勧めします。デフォルトでは、このパラメータは`'infinity'`と等しくなります。
`VALID UNTIL`句は、認証方法と一緒にのみ指定できますが、認証方法がクエリに指定されていない場合は例外です。このシナリオでは、`VALID UNTIL`句はすべての既存の認証方法に適用されます。

例：

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

