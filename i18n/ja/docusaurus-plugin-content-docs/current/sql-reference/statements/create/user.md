---
slug: /sql-reference/statements/create/user
sidebar_position: 39
sidebar_label: ユーザー
title: "CREATE USER"
---

[ユーザーアカウント](../../../guides/sre/user-management/index.md#user-account-management)を作成します。

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

`ON CLUSTER`句を使用すると、クラスター上にユーザーを作成できます。詳細は[Distributed DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

## 識別 {#identification}

ユーザーの識別には複数の方法があります。

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

パスワードの複雑さ要件は、[config.xml](/operations/configuration-files)で編集できます。以下は、パスワードが少なくとも12文字で、1つの数字を含むことを要求する例の構成です。各パスワード複雑さルールは、パスワードに対して一致する正規表現とルールの説明が必要です。

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
ClickHouse Cloudでは、デフォルトでパスワードは以下の複雑さ要件を満たす必要があります：
- 12文字以上であること
- 少なくとも1つの数字を含むこと
- 少なくとも1つの大文字を含むこと
- 少なくとも1つの小文字を含むこと
- 少なくとも1つの特殊文字を含むこと
:::

## 例 {#examples}

1. 次のユーザー名は `name1` で、パスワードは必要ありません - これは明らかにあまり安全ではありません。

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. プレーンテキストパスワードを指定するには：

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    パスワードは `/var/lib/clickhouse/access` にあるSQLテキストファイルに保存されるため、`plaintext_password` を使用するのは良くありません。次に示すように `sha256_password` を試してください...
    :::

3. 最も一般的なオプションは、SHA-256を使用してハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password` を指定すると、ClickHouseが自動的にパスワードをハッシュ化します。例えば：

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    `name3` ユーザーは `my_password` を使用してログインできますが、パスワードは上記のハッシュ値として保存されます。以下のSQLファイルが `/var/lib/clickhouse/access` に作成され、サーバーの起動時に実行されます：

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    すでにユーザー名に対してハッシュ値と対応するソルト値を作成した場合は、`IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'` を使用できます。`SALT`を使用した`sha256_hash`での識別には、'password'と'salt'の連結からハッシュが計算される必要があります。
    :::

4. `double_sha1_password` は通常は必要ありませんが、そのようなクライアント（MySQLインターフェイスなど）と作業する際には便利です：

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouseは次のクエリを生成して実行します：

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` はパスワードを保存するための最も安全なオプションです。これは、[bcrypt](https://en.wikipedia.org/wiki/Bcrypt)アルゴリズムを使用しており、パスワードハッシュが侵害されてもブルートフォース攻撃に対して耐性があります。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    この方法では、パスワードの長さは72文字に制限されています。ハッシュを計算し、パスワードを確認するために必要な計算と時間を定義する bcrypt のワークファクターパラメータは、サーバーの構成で変更できます：

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    ワークファクターは4から31の範囲で設定でき、デフォルト値は12です。

6. パスワードのタイプを省略することもできます：

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    この場合、ClickHouseはサーバーの構成で指定されたデフォルトのパスワードタイプを使用します：

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    使用可能なパスワードタイプは `plaintext_password`、`sha256_password`、`double_sha1_password` です。

7. 複数の認証方法を指定できます：

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

注意事項：
1. 古いバージョンのClickHouseは複数の認証方法の構文をサポートしていない場合があります。したがって、そのようなユーザーを含むClickHouseサーバーが、サポートしていないバージョンにダウングレードされると、そのユーザーは使用できなくなり、一部のユーザー関連の操作が破損する可能性があります。ダウングレードを円滑に行うには、ダウングレードの前にすべてのユーザーを単一の認証方法に設定する必要があります。あるいは、適切な手順を踏まずにサーバーがダウングレードされた場合、不具合のあるユーザーは削除する必要があります。
2. `no_password` は、セキュリティ上の理由から他の認証方法と共存できません。したがって、クエリ内で唯一の認証方法として `no_password` を指定することができます。

## ユーザーホスト {#user-host}

ユーザーホストは、ClickHouseサーバーに接続できるホストです。ホストは次の方法で `HOST` クエリセクションに指定できます：

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは指定されたIPアドレスまたは[サブネットワーク](https://en.wikipedia.org/wiki/Subnetwork)からのみClickHouseサーバーに接続できます。例: `HOST IP '192.168.0.0/16'`、`HOST IP '2001:DB8::/32'`。本番環境での使用には、`HOST IP` 要素（IPアドレスとそのマスク）だけを指定してください。`host` と `host_regexp` を使用すると余分なレイテンシーが発生する可能性があります。
- `HOST ANY` — ユーザーは任意の場所から接続できます。これはデフォルトのオプションです。
- `HOST LOCAL` — ユーザーはローカルからのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストをFQDNとして指定できます。例: `HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に[pcre](http://www.pcre.org/)正規表現を使用できます。例: `HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — [LIKE](../../../sql-reference/functions/string-search-functions.md#function-like)オペレーターを使用してユーザーホストをフィルタリングできます。例: `HOST LIKE '%'` は `HOST ANY` と同等であり、`HOST LIKE '%.mysite.com'` は `mysite.com` ドメイン内のすべてのホストをフィルタリングします。

ホストを指定する別の方法は、ユーザー名の後に `@` 構文を使用することです。例：

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 構文と同等です。
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 構文と同等です。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 構文と同等です。

:::tip
ClickHouseは`user_name@'address'`を全体としてユーザー名として扱います。したがって、技術的には同じ `user_name` を持ち、`@`の後に異なる構成を持つ複数のユーザーを作成することが可能ですが、そのようなことはお勧めしません。
:::

## VALID UNTIL句 {#valid-until-clause}

認証方法の有効期限を指定することができます。文字列をパラメーターとして受け入れます。日付時刻のフォーマットは `YYYY-MM-DD [hh:mm:ss] [timezone]` を使用することが推奨されます。デフォルトでこのパラメータは `'infinity'` に設定されています。
`VALID UNTIL` 句は、クエリに認証方法が指定されている場合にのみ指定できます。ただし、クエリに認証方法が指定されていないケースでは、`VALID UNTIL` 句はすべての既存の認証方法に適用されます。

例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES句 {#grantees-clause}

このユーザーからの[特権](../../../sql-reference/statements/grant.md#privileges)を受け取ることができるユーザーまたは役割を指定します。ただし、このユーザーが必要なすべてのアクセス権を[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で付与されている必要があります。`GRANTEES`句のオプション：

- `user` — このユーザーが特権を付与できるユーザーを指定します。
- `role` — このユーザーが特権を付与できる役割を指定します。
- `ANY` — このユーザーは誰にでも特権を付与できます。デフォルトの設定です。
- `NONE` — このユーザーは特権を誰にも付与できません。

`EXCEPT`式を使用して、特定のユーザーや役割を除外できます。例：`CREATE USER user1 GRANTEES ANY EXCEPT user2`。これは、`user1` が `GRANT OPTION` で特権を付与されている場合に、`user2` を除く誰にでもその特権を付与できることを意味します。

## 例 {#examples-1}

アカウント `mira` を作成し、パスワード `qwerty` で保護します：

``` sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` はClickHouseサーバーが実行されているホストでクライアントアプリを起動する必要があります。

アカウント `john` を作成し、役割を割り当ててデフォルトに設定します：

``` sql
CREATE USER john DEFAULT ROLE role1, role2;
```

アカウント `john` を作成し、すべての将来の役割をデフォルトにします：

``` sql
CREATE USER john DEFAULT ROLE ALL;
```

将来 `john` に役割が割り当てられると、それは自動的にデフォルトになります。

アカウント `john` を作成し、すべての将来の役割をデフォルトに設定しますが、`role1` と `role2` は除外します：

``` sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

アカウント `john` を作成し、ユーザー `jack` に特権を付与できるようにします：

``` sql
CREATE USER john GRANTEES jack;
```
