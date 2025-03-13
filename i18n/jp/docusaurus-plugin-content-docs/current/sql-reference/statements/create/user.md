---
slug: '/sql-reference/statements/create/user'
sidebar_position: 39
sidebar_label: 'USER'
title: 'CREATE USER'
---

ユーザーアカウントを作成します。[user accounts](../../../guides/sre/user-management/index.md#user-account-management)。

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

`ON CLUSTER`句を使用すると、クラスタ内でユーザーを作成できます。詳しくは[Distributed DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

## Identification {#identification}

ユーザーの識別方法はいくつかあります。

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

パスワードの複雑さの要件は、[config.xml](/operations/configuration-files)で編集できます。以下は、パスワードが少なくとも12文字で1つ以上の数字を含む必要があるという設定の例です。各パスワードの複雑さのルールには、パスワードに対して一致させる必要のある正規表現と、ルールの説明が含まれます。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>be at least 12 characters long</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>contain at least 1 numeric character</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloudでは、デフォルトでパスワードは以下の複雑さの要件を満たす必要があります。
- 少なくとも12文字であること
- 少なくとも1つの数字を含むこと
- 少なくとも1つの大文字を含むこと
- 少なくとも1つの小文字を含むこと
- 少なくとも1つの特殊文字を含むこと
:::

## Examples {#examples}

1. 次のユーザー名は`name1`で、パスワードは必要ありません - これは明らかにあまり安全ではありません。

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. プレーンテキストのパスワードを指定するには:

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    パスワードは`/var/lib/clickhouse/access`のSQLテキストファイルに保存されるため、`plaintext_password`を使用するのはあまりおすすめできません。次に示すように`sha256_password`を試してみてください...
    :::

3. 最も一般的な選択肢は、SHA-256を使用してハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password`を指定すると、ClickHouseが自動的にパスワードをハッシュ化します。例えば:

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    `name3`ユーザーは`my_password`を使用してログインできますが、パスワードは上記のハッシュ値として保存されます。次のSQLファイルが`/var/lib/clickhouse/access`に作成され、サーバーの起動時に実行されます:

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    すでにユーザー名のハッシュ値と対応するソルト値を作成している場合、`IDENTIFIED WITH sha256_hash BY 'hash'`または`IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`を使用できます。`SALT`を使用して`sha256_hash`で識別する場合、ハッシュは'パスワード'と'ソルト'の連結から計算される必要があります。
    :::

4. `double_sha1_password`は通常必要ありませんが、（MySQLインターフェースのように）それを必要とするクライアントとの作業に役立ちます:

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouseは次のクエリを生成し、実行します:

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password`はパスワードを保存するための最も安全なオプションです。これは、パスワードハッシュが漏洩した場合でもブルートフォース攻撃に対して耐性のある[bcrypt](https://en.wikipedia.org/wiki/Bcrypt)アルゴリズムを使用します。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    この方法では、パスワードの長さは72文字に制限されます。ハッシュを計算し、パスワードを検証するために必要な計算と時間の量を定義するbcryptの作業係数パラメータは、サーバー設定で変更できます:

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    作業係数は4から31の間である必要があり、デフォルト値は12です。

6. パスワードタイプも省略できます:

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    この場合、ClickHouseはサーバー設定で指定されたデフォルトのパスワードタイプを使用します:

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    利用可能なパスワードタイプは次のとおりです: `plaintext_password`, `sha256_password`, `double_sha1_password`。

7. 複数の認証方法を指定できます:

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```

注意事項:
1. 古いバージョンのClickHouseは複数の認証方法の構文をサポートしていない場合があります。そのため、ClickHouseサーバーにそのようなユーザーが含まれていて、サポートしていないバージョンにダウングレードすると、そのようなユーザーは使用不可能になり、一部のユーザー関連の操作が壊れます。ダウングレードを適切に行うには、ダウングレードする前にすべてのユーザーを単一の認証方法を含むように設定する必要があります。または、適切な手順を踏まずにサーバーをダウングレードした場合、故障したユーザーを削除する必要があります。
2. セキュリティ上の理由から、`no_password`は他の認証方法と共存できません。したがって、クエリ内で唯一の認証方法として`no_password`を指定することができます。

## User Host {#user-host}

ユーザーホストは、ClickHouseサーバーに接続できるホストです。ホストは、次の方法で`HOST`クエリセクションで指定できます。

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは指定されたIPアドレスまたは[サブネット](https://en.wikipedia.org/wiki/Subnetwork)からのみClickHouseサーバーに接続できます。例: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`。本番環境で使用する場合は、`HOST IP`要素（IPアドレスとそのマスク）のみを指定してください。`host`や`host_regexp`を使用すると、追加のレイテンシーが発生する可能性があります。
- `HOST ANY` — ユーザーは任意の場所から接続できます。これはデフォルトオプションです。
- `HOST LOCAL` — ユーザーはローカルからのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストはFQDNとして指定できます。例えば、`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に、[pcre](http://www.pcre.org/)の正規表現を使用できます。例えば、`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — ユーザーホストをフィルタリングするために[LIKE](/sql-reference/functions/string-search-functions#like)演算子を使用できます。例えば、`HOST LIKE '%'`は`HOST ANY`と同じで、`HOST LIKE '%.mysite.com'`は`mysite.com`ドメイン内のすべてのホストをフィルタリングします。

ホストを指定するもう1つの方法は、ユーザー名の後に`@`構文を使用することです。例:

- `CREATE USER mira@'127.0.0.1'` — `HOST IP`構文に相当します。
- `CREATE USER mira@'localhost'` — `HOST LOCAL`構文に相当します。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE`構文に相当します。

:::tip
ClickHouseは`user_name@'address'`を全体としてユーザー名と見なします。したがって、技術的には同じ`user_name`を持ち、`@`の後に異なる構造を持つ複数のユーザーを作成できます。ただし、これを行うことはお勧めしません。
:::

## VALID UNTIL Clause {#valid-until-clause}

認証方法の有効期限を指定でき、オプションで時刻を指定できます。文字列をパラメータとして受け付けます。日付時刻のためには`YYYY-MM-DD [hh:mm:ss] [timezone]`形式を使用することを推奨します。デフォルトでは、このパラメータは`'infinity'`です。
`VALID UNTIL`句は、認証方法が指定されている場合にのみ指定できます。クエリに認証方法が指定されていない場合は、すべての既存の認証方法に適用されます。

例:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES Clause {#grantees-clause}

このユーザーから[privileges](../../../sql-reference/statements/grant.md#privileges)を受け取ることができるユーザーまたはロールを指定します。このユーザーにも必要なすべてのアクセスが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で付与されている場合に限ります。`GRANTEES`句のオプション:

- `user` — このユーザーが特権を付与できるユーザーを指定します。
- `role` — このユーザーが特権を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも特権を付与できます。これはデフォルト設定です。
- `NONE` — このユーザーは特権を誰にも付与できません。

`EXCEPT`式を使用して、任意のユーザーまたはロールを除外できます。例えば、`CREATE USER user1 GRANTEES ANY EXCEPT user2`。これは、`user1`が`GRANT OPTION`で付与された特権を持っている場合、`user2`を除いて誰にでもその特権を付与できることを意味します。

## Examples {#examples-1}

ユーザーアカウント`mira`をパスワード`qwerty`で保護します。

``` sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira`はClickHouseサーバーが実行されているホストでクライアントアプリを起動する必要があります。

ユーザーアカウント`john`を作成し、ロールを割り当ててこれらのロールをデフォルトにします。

``` sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント`john`を作成し、将来のすべてのロールをデフォルトにします。

``` sql
CREATE USER john DEFAULT ROLE ALL;
```

将来`john`にロールが割り当てられると、それは自動的にデフォルトになります。

ユーザーアカウント`john`を作成し、将来のすべてのロールをデフォルトにしますが、`role1`と`role2`を除きます。

``` sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント`john`を作成し、彼に`jack`アカウントのユーザーに特権を付与できるようにします。

``` sql
CREATE USER john GRANTEES jack;
```
