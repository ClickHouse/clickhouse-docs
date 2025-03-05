---
slug: /sql-reference/statements/create/user
sidebar_position: 39
sidebar_label: USER
title: "CREATE USER"
---

ユーザー [アカウント](../../../guides/sre/user-management/index.md#user-account-management) を作成します。

構文:

``` sql
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

`ON CLUSTER` 句を使用すると、クラスター上にユーザーを作成できます。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

## Identification {#identification}

ユーザーの識別方法はいくつかあります:

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

パスワードの複雑さの要件は [config.xml](/operations/configuration-files) で編集できます。以下は、パスワードが少なくとも12文字であり、1つの数字を含む必要があるという設定の例です。各パスワード複雑さルールには、パスワードに対して一致させるための正規表現と、ルールの説明が含まれます。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>12文字以上である必要があります</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>少なくとも1つの数字を含む必要があります</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloud では、デフォルトでパスワードは次の複雑さ要件を満たさなければなりません:
- 12文字以上であること
- 少なくとも1つの数字を含むこと
- 少なくとも1つの大文字を含むこと
- 少なくとも1つの小文字を含むこと
- 少なくとも1つの特殊文字を含むこと
:::

## Examples {#examples}

1. 次のユーザー名は `name1` で、パスワードは不要です - 明らかにセキュリティはあまり提供されません:

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. プレーンテキストパスワードを指定するには:

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    パスワードは `/var/lib/clickhouse/access` の SQL テキストファイルに保存されるため、 `plaintext_password` を使用するのはあまりお勧めできません。代わりに次に示すように `sha256_password` を試してみてください...
    :::

3. 最も一般的なオプションは、SHA-256を用いてハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password` を指定すると、ClickHouseがパスワードをハッシュ化します。例えば:

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    ユーザー `name3` は現在、 `my_password` を使用してログインできますが、パスワードは上記のハッシュ値として保存されています。次の SQL ファイルが `/var/lib/clickhouse/access` に作成され、サーバー起動時に実行されます:

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    すでにユーザー名のためのハッシュ値と対応するソルト値を作成している場合は、 `IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'` を使用できます。`SALT` を使用して `sha256_hash` で識別する場合、ハッシュは 'password' と 'salt' の連結から計算される必要があります。
    :::

4. `double_sha1_password` は通常必要ありませんが、それを必要とするクライアント（MySQL インターフェースなど）と作業する際に便利です:

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouseは次のクエリを生成し、実行します:

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` はパスワードを保存するための最も安全なオプションです。これは、[bcrypt](https://en.wikipedia.org/wiki/Bcrypt) アルゴリズムを使用し、パスワードハッシュが危殆化した場合でもブルートフォース攻撃に対して耐性があります。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    この方法では、パスワードの長さは72文字に制限されています。bcryptの作業ファクターパラメータは、ハッシュを計算し、パスワードを確認するのに必要な計算と時間の量を定義し、サーバーの設定で変更できます:

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    作業ファクターは4から31の間で設定する必要があり、デフォルト値は12です。

6. パスワードのタイプを省略することもできます:

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    この場合、ClickHouseはサーバー設定で指定されたデフォルトのパスワードタイプを使用します:

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    利用可能なパスワードタイプは: `plaintext_password`, `sha256_password`, `double_sha1_password` です。

7. 複数の認証方法を指定できます: 

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

注意:
1. 古いバージョンの ClickHouse は、複数の認証方法の構文をサポートしていない場合があります。そのため、ClickHouse サーバーにそのようなユーザーが存在し、それがサポートされていないバージョンにダウングレードされると、そのユーザーは無効になり、いくつかのユーザー関連の操作が壊れます。ダウングレードを適切に行うには、ダウングレード前にすべてのユーザーが1つの認証方法を含むように設定する必要があります。そうでない場合、サーバーが適切な手順なしにダウングレードされた場合は、故障したユーザーを削除する必要があります。
2. `no_password` は、セキュリティ上の理由から他の認証方法と共存することはできません。したがって、`no_password` を指定できるのは、それがクエリ内の唯一の認証方法である場合のみです。

## User Host {#user-host}

ユーザーホストは、ClickHouseサーバーへの接続が確立できるホストです。ホストは、次の方法で `HOST` クエリセクションに指定できます:

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは、指定された IP アドレスまたは [サブネット](https://en.wikipedia.org/wiki/Subnetwork) からのみ ClickHouse サーバーに接続できます。例: `HOST IP '192.168.0.0/16'`、`HOST IP '2001:DB8::/32'`。本番環境で使用するには、 `HOST IP` 要素（IP アドレスとそのマスク）のみを指定し、 `host` と `host_regexp` を使用することでさらなるレイテンシが発生するのを避けます。
- `HOST ANY` — ユーザーはどこからでも接続できます。これはデフォルトオプションです。
- `HOST LOCAL` — ユーザーはローカルからのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストを FQDN として指定できます。例えば、 `HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に [pcre](http://www.pcre.org/) 正規表現を使用できます。例えば、 `HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — ユーザーホストをフィルタリングするために [LIKE](../../../sql-reference/functions/string-search-functions.md#function-like) 演算子を使用できます。例えば、 `HOST LIKE '%'` は `HOST ANY` と同等であり、 `HOST LIKE '%.mysite.com'` は `mysite.com` ドメイン内のすべてのホストをフィルタリングします。

ホストを指定する別の方法は、ユーザー名の後に `@` 構文を使用することです。例:

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 構文と同等です。
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 構文と同等です。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 構文と同等です。

:::tip
ClickHouse は `user_name@'address'` を1つのユーザー名として扱います。したがって、技術的には同じ `user_name` を持つ複数のユーザーを `@` の後に異なる構文で作成できます。しかし、そうすることはお勧めできません。
:::

## VALID UNTIL Clause {#valid-until-clause}

認証方法の有効期限を指定できるオプションです。パラメータには文字列を受け入れます。日付時刻のフォーマットには `YYYY-MM-DD [hh:mm:ss] [timezone]` を使用することをお勧めします。デフォルトでは、このパラメータは `'infinity'` に等しいです。
`VALID UNTIL` 句は、認証方法と一緒にのみ指定できます。ただし、クエリに認証方法が指定されていない場合は、すべての既存の認証方法に `VALID UNTIL` 句が適用されます。

例:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES Clause {#grantees-clause}

このユーザーから [特権](../../../sql-reference/statements/grant.md#privileges) を受け取ることができるユーザーまたはロールを指定します。この場合、対象のユーザーはすべての必要なアクセス権も持っている必要があります [GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)。`GRANTEES` 句のオプション:

- `user` — 特権を付与できるユーザーを指定します。
- `role` — 特権を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも特権を付与できます。デフォルト設定です。
- `NONE` — このユーザーは特権を誰にも付与できません。

`EXCEPT` 式を使用して、任意のユーザーまたはロールを除外できます。例えば、 `CREATE USER user1 GRANTEES ANY EXCEPT user2`。これは、`user1` が `GRANT OPTION` で付与された特権を持っている場合、`user2` 以外の誰にでもその特権を付与することができることを意味します。

## Examples {#examples-1}

ユーザーアカウント `mira` を作成し、パスワード `qwerty` で保護します:

``` sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` は、ClickHouse サーバーが実行されているホストでクライアントアプリを起動する必要があります。

ユーザーアカウント `john` を作成し、ロールを割り当て、これらをデフォルトに設定します:

``` sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント `john` を作成し、すべての将来のロールをデフォルトにします:

``` sql
CREATE USER john DEFAULT ROLE ALL;
```

将来的に `john` にロールが割り当てられると、それは自動的にデフォルトになります。

ユーザーアカウント `john` を作成し、すべての将来のロールをデフォルトにしますが、 `role1` と `role2` を除外します:

``` sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント `john` を作成し、彼の特権を `jack` アカウントのユーザーに付与できるようにします:

``` sql
CREATE USER john GRANTEES jack;
```
