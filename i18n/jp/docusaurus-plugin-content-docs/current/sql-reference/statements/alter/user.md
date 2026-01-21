---
description: 'ユーザーのドキュメント'
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

`ALTER USER` を使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management) 権限が必要です。

## GRANTEES 句 \{#grantees-clause\}

このユーザー自身が `GRANT OPTION` 付きで必要なすべてのアクセス権を付与されていることを条件として、このユーザーから [権限](../../../sql-reference/statements/grant.md#privileges) を受け取ることが許可されているユーザーまたはロールを指定します。`GRANTEES` 句のオプションは次のとおりです:

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは任意のユーザーまたはロールに権限を付与できます。これはデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT` 式を使用して任意のユーザーまたはロールを除外できます。たとえば、`ALTER USER user1 GRANTEES ANY EXCEPT user2` のように指定します。これは、`user1` が `GRANT OPTION` 付きで何らかの権限を付与されている場合、それらの権限を `user2` を除く誰にでも付与できることを意味します。

詳しくは [GRANT の構文](../../../sql-reference/statements/grant.md#granting-privilege-syntax) を参照してください。

## 例 \{#examples\}

割り当てられたロールをデフォルトに設定する：

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

ユーザーにロールがあらかじめ割り当てられていない場合、ClickHouse は例外を発生させます。

割り当てられているすべてのロールをデフォルトとして設定します。

```sql
ALTER USER user DEFAULT ROLE ALL
```

将来そのロールがユーザーに割り当てられた場合、そのロールは自動的にデフォルトになります。

`role1` と `role2` を除く、割り当て済みのすべてのロールをデフォルトに設定します。

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john` アカウントを持つユーザーが、自身の権限を `jack` アカウントを持つユーザーに付与できるようにします：

```sql
ALTER USER john GRANTEES jack;
```

既存の認証方法を維持したまま、ユーザーに新しい認証方法を追加します。

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

Notes:

1. 古いバージョンの ClickHouse では、複数の認証方式を指定する構文をサポートしていない場合があります。したがって、ClickHouse サーバーにそのようなユーザーが存在する状態で、その構文をサポートしていないバージョンにダウングレードすると、そのユーザーは使用不能となり、ユーザー関連の一部の操作が正しく動作しなくなります。正常にダウングレードするには、ダウングレードを行う前に、すべてのユーザーが 1 つの認証方式のみを持つように設定しておく必要があります。あるいは、適切な手順を踏まずにサーバーをダウングレードしてしまった場合は、問題のあるユーザーを削除する必要があります。
2. セキュリティ上の理由から、`no_password` は他の認証方式と共存させることはできません。
   そのため、`no_password` 認証方式を `ADD` することはできません。以下のクエリはエラーになります:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方式を削除して `no_password` のみにしたい場合は、以下の置換構文で指定する必要があります。

認証方式をリセットし、クエリで指定された方式のみを追加します（先頭に ADD キーワードを付けずに IDENTIFIED を使用した場合と同じ効果）:

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

認証方法をリセットし、最後に追加したものだけを保持します：

```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL 句 \{#valid-until-clause\}

認証方式に対して、有効期限の日付と（必要に応じて）時刻を指定できます。パラメータとして文字列値を受け取ります。日時には `YYYY-MM-DD [hh:mm:ss] [timezone]` 形式の使用を推奨します。デフォルトでは、このパラメータの値は `'infinity'` です。
`VALID UNTIL` 句は、クエリ内で認証方式が一切指定されていない場合を除き、必ず認証方式と併せて指定する必要があります。この場合、`VALID UNTIL` 句は既存のすべての認証方式に適用されます。

例:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL'2025-01-01''`
