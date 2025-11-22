---
description: 'ユーザー向けドキュメント'
sidebar_label: 'USER'
sidebar_position: 45
slug: /sql-reference/statements/alter/user
title: 'ALTER USER'
doc_type: 'reference'
---

ClickHouse のユーザーアカウントを変更します。

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

`ALTER USER` コマンドを使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management) 権限が必要です。


## GRANTEES句 {#grantees-clause}

このユーザーが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で必要なアクセス権限をすべて付与されている条件下で、このユーザーから[権限](../../../sql-reference/statements/grant.md#privileges)を受け取ることが許可されるユーザーまたはロールを指定します。`GRANTEES`句のオプション:

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。これがデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT`式を使用して、任意のユーザーまたはロールを除外できます。例えば、`ALTER USER user1 GRANTEES ANY EXCEPT user2`とします。これは、`user1`が`GRANT OPTION`で付与された権限を持っている場合、`user2`を除く誰にでもその権限を付与できることを意味します。


## 例 {#examples}

割り当てられたロールをデフォルトとして設定します:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

ロールが事前にユーザーに割り当てられていない場合、ClickHouseは例外をスローします。

割り当てられたすべてのロールをデフォルトに設定します:

```sql
ALTER USER user DEFAULT ROLE ALL
```

将来ロールがユーザーに割り当てられた場合、自動的にデフォルトになります。

`role1`と`role2`を除く、割り当てられたすべてのロールをデフォルトに設定します:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john`アカウントのユーザーが、`jack`アカウントのユーザーに自身の権限を付与できるようにします:

```sql
ALTER USER john GRANTEES jack;
```

既存の認証方法を保持しながら、ユーザーに新しい認証方法を追加します:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意事項:

1. ClickHouseの古いバージョンでは、複数の認証方法の構文をサポートしていない場合があります。そのため、ClickHouseサーバーにそのようなユーザーが含まれている状態で、それをサポートしていないバージョンにダウングレードすると、そのようなユーザーは使用できなくなり、一部のユーザー関連操作が正常に動作しなくなります。正常にダウングレードするには、ダウングレード前にすべてのユーザーを単一の認証方法のみを含むように設定する必要があります。または、適切な手順なしでサーバーがダウングレードされた場合は、問題のあるユーザーを削除する必要があります。
2. セキュリティ上の理由から、`no_password`は他の認証方法と共存できません。
   そのため、`no_password`認証方法を`ADD`することはできません。以下のクエリはエラーをスローします:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方法を削除して`no_password`に依存する場合は、以下の置換形式で指定する必要があります。

認証方法をリセットし、クエリで指定されたものを追加します(`ADD`キーワードなしで先頭に`IDENTIFIED`を置いた場合の効果):

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

認証方法をリセットし、最後に追加されたものを保持します:

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```


## VALID UNTIL句 {#valid-until-clause}

認証方法の有効期限日と、オプションで時刻を指定できます。パラメータとして文字列を受け取ります。日時の形式には `YYYY-MM-DD [hh:mm:ss] [timezone]` の使用を推奨します。デフォルトでは、このパラメータは `'infinity'` です。
`VALID UNTIL` 句は認証方法と併せて指定する必要がありますが、クエリで認証方法が指定されていない場合は例外です。この場合、`VALID UNTIL` 句は既存のすべての認証方法に適用されます。

例:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
