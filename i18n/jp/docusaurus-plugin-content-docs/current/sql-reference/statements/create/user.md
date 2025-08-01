---
description: 'Documentation for User'
sidebar_label: 'ユーザー'
sidebar_position: 39
slug: '/sql-reference/statements/create/user'
title: 'CREATE USER'
---



Creates [ユーザーアカウント](../../../guides/sre/user-management/index.md#user-account-management).

Syntax:

```sql
CREATE USER [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [NOT IDENTIFIED | IDENTIFIED {[WITH {plaintext_password | sha256_password | sha256_hash | double_sha1_password | double_sha1_hash}] BY {'password' | 'hash'}} | WITH NO_PASSWORD | {WITH ldap SERVER 'server_name'} | {WITH kerberos [REALM 'realm']} | {WITH ssl_certificate CN 'common_name' | SAN 'TYPE:subject_alt_name'} | {WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa|...'} | {WITH http SERVER 'server_name' [SCHEME 'Basic']} [VALID UNTIL datetime] 
    [, {[{plaintext_password | sha256_password | sha256_hash | ...}] BY {'password' | 'hash'}} | {ldap SERVER 'server_name'} | {...} | ... [,...]]]
    [HOST {LOCAL | NAME 'name' | REGEXP 'name_regexp' | IP 'address' | LIKE 'pattern'} [,...] | ANY | NONE]
    [VALID UNTIL datetime]
    [IN access_storage_type]
    [DEFAULT ROLE role [,...]]
    [DEFAULT DATABASE database | NONE]
    [GRANTEES {user | role | ANY | NONE} [,...] [EXCEPT {user | role} [,...]]]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [READONLY | WRITABLE] | PROFILE 'profile_name'] [,...]
```

`ON CLUSTER` 句は、クラスター上でユーザーを作成することを許可します。詳しくは [分散DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

## Identification {#identification}

ユーザーの識別にはいくつかの方法があります：

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` または `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` または `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` または `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

パスワードの複雑性要件は [config.xml](/operations/configuration-files) で編集可能です。以下は、パスワードが12文字以上で、数字が1つ含まれていることを要求する設定の例です。各パスワードの複雑性ルールには、パスワードに対して一致させるための正規表現とルールの説明が必要です。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>12文字以上である必要があります</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>少なくとも1つの数値を含む必要があります</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloud では、デフォルトでパスワードは以下の複雑性要件を満たす必要があります：
- 12文字以上であること
- 少なくとも1つの数値を含むこと
- 少なくとも1つの大文字を含むこと
- 少なくとも1つの小文字を含むこと
- 少なくとも1つの特殊文字を含むこと
:::

## Examples {#examples}

1. 次のユーザー名は `name1` で、パスワードは不要です。これは明らかにあまり安全ではありません：

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. プレーンテキストパスワードを指定するには：

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    パスワードは `/var/lib/clickhouse/access` のSQLテキストファイルに保存されるため、`plaintext_password` を使用するのは良いアイデアではありません。次の例のように `sha256_password` を試してください...
    :::

3. 最も一般的なオプションは、SHA-256を使用してハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password` を指定すると、ClickHouse がパスワードをハッシュ化します。例えば：

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    `name3` ユーザーは `my_password` を使用してログインできるようになりますが、パスワードは上記のハッシュ値として保存されます。次のSQLファイルが `/var/lib/clickhouse/access` に作成され、サーバー起動時に実行されます：

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    すでにユーザー名のハッシュ値と対応するソルト値を作成した場合は、`IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'` を使用できます。`SALT` を使用した `sha256_hash` の識別については、ハッシュは 'password' と 'salt' の連結から計算されなければなりません。
    :::

4. `double_sha1_password` は通常必要ありませんが、これを必要とするクライアントとの作業時に便利です（MySQL インターフェースのように）：

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse は次のクエリを生成して実行します：

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` は、パスワードを保存するための最も安全なオプションです。これは [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) アルゴリズムを使用しており、パスワードハッシュが侵害された場合でもブルートフォース攻撃に対して耐性があります。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    この方法では、パスワードの長さは72文字に制限されています。ハッシュを計算し、パスワードを検証するために必要な計算と時間を定義するbcryptの作業ファクターのパラメータは、サーバー設定で変更できます：

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    作業ファクターは4から31の間でなければならず、デフォルト値は12です。

6. パスワードの型も省略可能です：

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    この場合、ClickHouse はサーバー設定で指定されたデフォルトのパスワードタイプを使用します：

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    利用可能なパスワードタイプは： `plaintext_password`, `sha256_password`, `double_sha1_password` です。

7. 複数の認証メソッドを指定できます：

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3'
   ```

注意：
1. ClickHouse の古いバージョンでは複数の認証方法の構文がサポートされていない場合があります。そのため、ClickHouse サーバーにそのようなユーザーが存在し、サポートされていないバージョンにダウングレードされると、そのユーザーは使用できなくなり、いくつかのユーザー関連の操作が壊れてしまいます。ダウングレードをスムーズに行うためには、ダウングレード前にすべてのユーザーを単一の認証方式に設定する必要があります。そうでない場合、サーバーが適切な手順なしにダウングレードされた場合は、その不具合のあるユーザーを削除する必要があります。
2. 複数の認証メソッドのためのセキュリティ上、 `no_password` は他の認証メソッドと共存することはできません。そのため、`no_password` はクエリ内で唯一の認証方式である場合にのみ指定できます。 

## User Host {#user-host}

ユーザーのホストとは、ClickHouse サーバーへの接続を確立できるホストを指します。ホストは、次の方法でクエリの `HOST` セクションに指定できます：

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは指定されたIPアドレスまたは [サブネットワーク](https://en.wikipedia.org/wiki/Subnetwork) からのみ ClickHouse サーバーに接続できます。例： `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`。本番用には、`HOST IP` 要素（IPアドレスおよびそのマスク）のみを指定してください。`host` と `host_regexp` を使用すると追加のレイテンシが発生する可能性があります。
- `HOST ANY` — ユーザーはどこからでも接続できます。これはデフォルトのオプションです。
- `HOST LOCAL` — ユーザーはローカルでのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストはFQDNとして指定できます。例えば、`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に [pcre](http://www.pcre.org/) 正規表現を使用できます。例えば、`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — [LIKE](/sql-reference/functions/string-search-functions#like) 演算子を使用してユーザーホストをフィルタリングできます。たとえば、`HOST LIKE '%'` は `HOST ANY` と等しく、`HOST LIKE '%.mysite.com'` は `mysite.com` ドメイン内のすべてのホストをフィルタリングします。

ホストを指定する別の方法は、ユーザー名の後に `@` 構文を使用することです。例：

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 構文と同等です。
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 構文と同等です。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 構文と同等です。

:::tip
ClickHouse は `user_name@'address'` をユーザー名全体として扱います。したがって、技術的には同じ `user_name` で異なる構文を持つ複数のユーザーを作成できますが、それは推奨しません。
:::

## VALID UNTIL Clause {#valid-until-clause}

検証メソッドの有効期限を指定することができます。このクエリは、パラメータとして文字列を受け取ります。日付の形式は `YYYY-MM-DD [hh:mm:ss] [timezone]` を使用することが推奨されます。デフォルトでは、このパラメータは `'infinity'` に等しいです。
`VALID UNTIL` 句は、認証方法と共にのみ指定可能で、クエリに認証方法が指定されていない場合を除きます。このシナリオでは、すべての既存の認証方法に `VALID UNTIL` 句が適用されます。

例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES Clause {#grantees-clause}

このユーザーから [権限](../../../sql-reference/statements/grant.md#privileges) を受け取ることが許可されているユーザーまたはロールを指定します。このユーザーには、[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax) で必要なアクセスが付与されています。`GRANTEES` 句のオプション：

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。デフォルトの設定です。
- `NONE` — このユーザーは権限を一切付与できません。

`EXCEPT` 式を使うことで任意のユーザーやロールを除外できます。例えば、`CREATE USER user1 GRANTEES ANY EXCEPT user2`。これは、`user1` が `GRANT OPTION` でいくつかの権限を持っている場合、`user2` を除く誰にでもその権限を付与できることを意味します。

## Examples {#examples-1}

ユーザーアカウント `mira` を、パスワード `qwerty` で保護して作成します：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` は、ClickHouse サーバーが稼働するホストでクライアントアプリを起動する必要があります。

ユーザーアカウント `john` を作成し、ロールを割り当て、そしてこれらのロールをデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント `john` を作成し、今後のすべてのロールをデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

将来的に `john` に割り当てられたロールは自動的にデフォルトになります。

ユーザーアカウント `john` を作成し、今後のすべてのロールをデフォルトにし、`role1` と `role2` を除外します：

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント `john` を作成し、`jack` アカウントを持つユーザーに権限を付与できるようにします：

```sql
CREATE USER john GRANTEES jack;
```
