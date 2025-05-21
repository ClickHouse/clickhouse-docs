---
description: 'ユーザーのためのドキュメンテーション'
sidebar_label: 'ユーザー'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'ユーザーの作成'
---

[userアカウント](../../../guides/sre/user-management/index.md#user-account-management)を作成します。

構文:

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

`ON CLUSTER`句は、クラスタ上でユーザーを作成することを可能にします。詳細は[Distributed DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

## Identification {#identification}

ユーザーの認証方法は複数あります。

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'`または`IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'`または`IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos`または`IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'`または`IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

パスワードの複雑さに関する要件は[config.xml](/operations/configuration-files)で編集できます。以下は、パスワードが少なくとも12文字であり、1つの数字を含む必要があるという設定の例です。各パスワード複雑性ルールは、パスワードに対して一致させるための正規表現とルールの説明が必要です。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>少なくとも12文字でなければなりません</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>少なくとも1つの数字を含む必要があります</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloudでは、デフォルトでパスワードは次の複雑性要件を満たす必要があります：
- 少なくとも12文字であること
- 少なくとも1つの数字を含むこと
- 少なくとも1つの大文字を含むこと
- 少なくとも1つの小文字を含むこと
- 少なくとも1つの特殊文字を含むこと
:::

## 例 {#examples}

1. 次のユーザー名は`name1`で、パスワードを必要としません — これは明らかにあまり安全ではありません。

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. プレーンテキストのパスワードを指定するには：

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    パスワードは`/var/lib/clickhouse/access`のSQLテキストファイルに保存されているため、`plaintext_password`を使用するのは良いアイデアではありません。次のように、代わりに`sha256_password`を試してください...
    :::

3. 最も一般的なオプションは、SHA-256を使用してハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password`を指定すると、ClickHouseがパスワードをハッシュ化します。例えば：

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    `name3`ユーザーは`my_password`を使用してログインできますが、パスワードは上記のハッシュされた値として保存されます。次のSQLファイルが`/var/lib/clickhouse/access`に作成され、サーバー起動時に実行されます：

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    すでにユーザー名用のハッシュ値と対応するソルト値を作成している場合は、`IDENTIFIED WITH sha256_hash BY 'hash'`または`IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`を使用できます。`SALT`を使用して`sha256_hash`で認証する場合は、ハッシュは「password」と「salt」の連結から計算される必要があります。
    :::

4. `double_sha1_password`は一般的には必要ありませんが、これが必要なクライアント（MySQLインターフェースなど）と作業する際に便利です：

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouseは以下のクエリを生成して実行します：

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password`はパスワードを保存する中で最も安全なオプションです。これは、パスワードハッシュが侵害されてもブルートフォース攻撃に対して耐性のある[bcrypt](https://en.wikipedia.org/wiki/Bcrypt)アルゴリズムを使用します。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    この方法では、パスワードの長さは72文字に制限されます。ハッシュを計算しパスワードを確認するのに必要な計算や時間の量を定義するbcrypt作業係数パラメータは、サーバー設定で変更できます：

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    作業係数は4から31の間でなければならず、デフォルト値は12です。

6. パスワードのタイプは省略することもできます：

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    この場合、ClickHouseはサーバー設定で指定されたデフォルトのパスワードタイプを使用します：

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    使用可能なパスワードタイプは：`plaintext_password`、`sha256_password`、`double_sha1_password`です。

7. 複数の認証方法を指定することができます：

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

注意:
1. 古いバージョンのClickHouseでは複数の認証方法の構文がサポートされていない場合があります。したがって、ClickHouseサーバーにそのようなユーザーが含まれており、サポートされていないバージョンにダウングレードされると、これらのユーザーは使用できなくなり、一部のユーザー関連の操作が破損します。滑らかにダウングレードするためには、ダウングレード前にすべてのユーザーを単一の認証方法に設定する必要があります。あるいは、適切な手続きなしにサーバーがダウングレードされた場合、不完全なユーザーは削除されるべきです。
2. `no_password`はセキュリティ上の理由から他の認証方法と共存することはできません。したがって、`no_password`を指定できるのは、それがクエリの中で唯一の認証方法であるときだけです。

## ユーザーのホスト {#user-host}

ユーザーホストは、ClickHouseサーバーへの接続が確立できるホストです。ホストは、`HOST`クエリセクションで以下の方法で指定できます：

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは指定されたIPアドレスまたは[subnetwork](https://en.wikipedia.org/wiki/Subnetwork)からのみClickHouseサーバーに接続できます。例: `HOST IP '192.168.0.0/16'`、`HOST IP '2001:DB8::/32'`。本番環境で使用するには、`HOST IP`要素（IPアドレスとそのマスク）のみを指定してください。`host`や`host_regexp`を使用すると追加のレイテンシーが発生する可能性があります。
- `HOST ANY` — ユーザーはどこからでも接続できます。これはデフォルトのオプションです。
- `HOST LOCAL` — ユーザーはローカルからのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストはFQDNとして指定できます。例: `HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に[pcre](http://www.pcre.org/)正規表現を使用できます。例: `HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — [LIKE](/sql-reference/functions/string-search-functions#like)演算子を使用してユーザーホストをフィルタリングできます。例: `HOST LIKE '%'`は`HOST ANY`と同等で、`HOST LIKE '%.mysite.com'`は`mysite.com`ドメイン内のすべてのホストをフィルタリングします。

ホストを指定する別の方法は、ユーザー名に続いて`@`構文を使用することです。例：

- `CREATE USER mira@'127.0.0.1'` — `HOST IP`構文と同等です。
- `CREATE USER mira@'localhost'` — `HOST LOCAL`構文と同等です。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE`構文と同等です。

:::tip
ClickHouseは`user_name@'address'`を全体のユーザー名として扱います。したがって、技術的には、同じ`user_name`で異なる`@`以降の構造を持つ複数のユーザーを作成することができます。ただし、その作成はお勧めしません。
:::

## VALID UNTIL句 {#valid-until-clause}

認証方法の有効期限を指定することができます。これは、パラメータとして文字列を受け取ります。日付時刻のためには、`YYYY-MM-DD [hh:mm:ss] [timezone]`形式を使用することをお勧めします。デフォルトでは、このパラメータは`'infinity'`に等しいです。
`VALID UNTIL`句は、認証方法と共に指定される必要がありますが、クエリに認証方法が指定されていない場合は、その場合に限りすべての既存の認証方法に適用されます。

例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES句 {#grantees-clause}

このユーザーに対して[privileges](../../../sql-reference/statements/grant.md#privileges)を受け取ることができるユーザーまたはロールを指定します。条件として、このユーザーが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で必要なすべてのアクセス権を持っている必要があります。`GRANTEES`句のオプション：

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。これはデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT`式を使用して任意のユーザーまたはロールを除外することができます。例えば、`CREATE USER user1 GRANTEES ANY EXCEPT user2`。これは、`user1`が`GRANT OPTION`で付与された権限を持っている場合、`user2`を除く誰にでもその権限を与えることができることを意味します。

## 例 {#examples-1}

ユーザーアカウント`mira`をパスワード`qwerty`で保護して作成します：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira`はClickHouseサーバーが実行されているホストでクライアントアプリを起動する必要があります。

ユーザーアカウント`john`を作成し、ロールを割り当ててこれらのロールをデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント`john`を作成し、将来のすべてのロールをデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

将来、`john`にロールが割り当てられると、それは自動的にデフォルトになります。

ユーザーアカウント`john`を作成し、将来のすべてのロールをデフォルトにし、`role1`と`role2`を除外します：

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント`john`を作成し、`jack`アカウントを持つユーザーに権限を付与できるようにします：

```sql
CREATE USER john GRANTEES jack;
```
