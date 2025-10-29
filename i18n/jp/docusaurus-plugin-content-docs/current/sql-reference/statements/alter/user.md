---
'description': 'ユーザーのためのドキュメンテーション'
'sidebar_label': 'USER'
'sidebar_position': 45
'slug': '/sql-reference/statements/alter/user'
'title': 'ALTER USER'
'doc_type': 'reference'
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

`ALTER USER`を使用するには、[ALTER USER](../../../sql-reference/statements/grant.md#access-management)特権が必要です。

## GRANTEES Clause {#grantees-clause}

このユーザーからの[特権](../../../sql-reference/statements/grant.md#privileges)を受け取ることができるユーザーまたはロールを指定します。このユーザーが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)によって必要なアクセス権をすべて持っている場合に限ります。`GRANTEES`句のオプション:

- `user` — このユーザーが特権を付与できるユーザーを指定します。
- `role` — このユーザーが特権を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも特権を付与できます。これはデフォルトの設定です。
- `NONE` — このユーザーは特権を付与できません。

``EXCEPT``式を使用して、任意のユーザーまたはロールを除外できます。たとえば、`ALTER USER user1 GRANTEES ANY EXCEPT user2`。これは、`user1`が`GRANT OPTION`で付与された特権を持つ場合、`user2`を除いて誰にでもその特権を付与できることを意味します。

## Examples {#examples}

割り当てられたロールをデフォルトとして設定:

```sql
ALTER USER user DEFAULT ROLE role1, role2
```

ロールがユーザーに事前に割り当てられていない場合、ClickHouseは例外をスローします。

すべての割り当てられたロールをデフォルトとして設定:

```sql
ALTER USER user DEFAULT ROLE ALL
```

将来的にロールがユーザーに割り当てられた場合、それは自動的にデフォルトになります。

`role1`および`role2`を除いてすべての割り当てられたロールをデフォルトに設定:

```sql
ALTER USER user DEFAULT ROLE ALL EXCEPT role1, role2
```

`john`アカウントを持つユーザーが`jack`アカウントを持つユーザーに特権を付与できるようにします:

```sql
ALTER USER john GRANTEES jack;
```

既存の認証方法を保持しながらユーザーに新しい認証方法を追加:

```sql
ALTER USER user1 ADD IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

注意:
1. 古いバージョンのClickHouseでは複数の認証方法の構文がサポートされていない場合があります。そのため、そのようなユーザーが含まれるClickHouseサーバーが、これをサポートしないバージョンにダウングレードされると、そのユーザーは使用できなくなり、一部のユーザー関連の操作が壊れます。適切にダウングレードするためには、ダウングレード前にすべてのユーザーが単一の認証方法を持つように設定する必要があります。あるいは、適切な手順なしにサーバーがダウングレードされた場合、不良ユーザーを削除する必要があります。
2. `no_password`は、セキュリティ上の理由から他の認証方法と共存できません。そのため、`no_password`認証方法を`ADD`することはできません。以下のクエリはエラーをスローします:

```sql
ALTER USER user1 ADD IDENTIFIED WITH no_password
```

ユーザーの認証方法を削除し、`no_password`に依存する場合は、以下の置換形式で指定する必要があります。

認証方法をリセットし、クエリで指定されたものを追加します（ADDキーワードなしのIDENTIFIEDの効果）:

```sql
ALTER USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
```

認証方法をリセットし、最も最近追加されたものを保持します:
```sql
ALTER USER user1 RESET AUTHENTICATION METHODS TO NEW
```

## VALID UNTIL Clause {#valid-until-clause}

認証方法の有効期限を指定でき、その日付と時間をオプションで設定できます。パラメーターとして文字列を受け付けます。日付および時刻には`YYYY-MM-DD [hh:mm:ss] [timezone]`形式を使用することをお勧めします。デフォルトでは、このパラメーターは`'infinity'`に等しいです。
`VALID UNTIL`句は、認証方法と一緒にのみ指定できますが、クエリで認証方法が指定されていない場合を除きます。このシナリオでは、`VALID UNTIL`句はすべての既存の認証方法に適用されます。

例:

- `ALTER USER name1 VALID UNTIL '2025-01-01'`
- `ALTER USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `ALTER USER name1 VALID UNTIL 'infinity'`
- `ALTER USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`
