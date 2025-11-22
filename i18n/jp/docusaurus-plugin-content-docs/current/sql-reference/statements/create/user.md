---
description: 'ユーザー向けドキュメント'
sidebar_label: 'USER'
sidebar_position: 39
slug: /sql-reference/statements/create/user
title: 'CREATE USER'
doc_type: 'reference'
---

[ユーザーアカウント](../../../guides/sre/user-management/index.md#user-account-management)を作成します。

構文：

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

`ON CLUSTER` 句を使用すると、クラスタ全体でユーザーを作成できます。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。


## 識別 {#identification}

ユーザー識別には複数の方法があります:

- `IDENTIFIED WITH no_password`
- `IDENTIFIED WITH plaintext_password BY 'qwerty'`
- `IDENTIFIED WITH sha256_password BY 'qwerty'` or `IDENTIFIED BY 'password'`
- `IDENTIFIED WITH sha256_hash BY 'hash'` or `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
- `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
- `IDENTIFIED WITH double_sha1_hash BY 'hash'`
- `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
- `IDENTIFIED WITH bcrypt_hash BY 'hash'`
- `IDENTIFIED WITH ldap SERVER 'server_name'`
- `IDENTIFIED WITH kerberos` or `IDENTIFIED WITH kerberos REALM 'realm'`
- `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
- `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
- `IDENTIFIED WITH http SERVER 'http_server'` or `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
- `IDENTIFIED BY 'qwerty'`

パスワードの複雑性要件は[config.xml](/operations/configuration-files)で編集できます。以下は、パスワードが12文字以上で、1つの数字を含むことを要求する設定例です。各パスワード複雑性ルールには、パスワードに対してマッチする正規表現とルールの説明が必要です。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>12文字以上であること</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>1つ以上の数字を含むこと</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloudでは、デフォルトでパスワードは以下の複雑性要件を満たす必要があります:

- 12文字以上であること
- 1つ以上の数字を含むこと
- 1つ以上の大文字を含むこと
- 1つ以上の小文字を含むこと
- 1つ以上の特殊文字を含むこと
  :::


## 例 {#examples}

1. 以下のユーザー名は `name1` でパスワードを必要としません。これは明らかにセキュリティ上好ましくありません:

   ```sql
   CREATE USER name1 NOT IDENTIFIED
   ```

2. 平文パスワードを指定する場合:

   ```sql
   CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
   ```

   :::tip
   パスワードは `/var/lib/clickhouse/access` 内のSQLテキストファイルに保存されるため、`plaintext_password` の使用は推奨されません。次に示すように、代わりに `sha256_password` を使用してください...
   :::

3. 最も一般的なオプションは、SHA-256を使用してハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password` を指定すると、ClickHouseが自動的にパスワードをハッシュ化します。例:

   ```sql
   CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
   ```

   `name3` ユーザーは `my_password` を使用してログインできますが、パスワードは上記のハッシュ値として保存されます。以下のSQLファイルが `/var/lib/clickhouse/access` に作成され、サーバー起動時に実行されます:

   ```bash
   /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
   ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
   ```

   :::tip
   ユーザー名に対してハッシュ値と対応するソルト値を既に作成している場合は、`IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'` を使用できます。`SALT` を使用した `sha256_hash` による識別では、ハッシュは 'password' と 'salt' の連結から計算される必要があります。
   :::

4. `double_sha1_password` は通常必要ありませんが、これを必要とするクライアント(MySQLインターフェースなど)を使用する場合に便利です:

   ```sql
   CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
   ```

   ClickHouseは以下のクエリを生成して実行します:

   ```response
   CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
   ```

5. `bcrypt_password` はパスワードを保存する最も安全なオプションです。[bcrypt](https://en.wikipedia.org/wiki/Bcrypt) アルゴリズムを使用しており、パスワードハッシュが漏洩した場合でもブルートフォース攻撃に対して耐性があります。

   ```sql
   CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
   ```

   この方式ではパスワードの長さは72文字に制限されます。
   ハッシュの計算とパスワードの検証に必要な計算量と時間を定義するbcryptワークファクターパラメータは、サーバー設定で変更できます:

   ```xml
   <bcrypt_workfactor>12</bcrypt_workfactor>
   ```

   ワークファクターは4から31の間である必要があり、デフォルト値は12です。

   :::warning
   高頻度の認証を行うアプリケーションでは、
   高いワークファクターにおけるbcryptの計算オーバーヘッドのため、
   代替の認証方式を検討してください。
   :::

6.
7. パスワードのタイプは省略することもできます:

   ```sql
   CREATE USER name6 IDENTIFIED BY 'my_password'
   ```

   この場合、ClickHouseはサーバー設定で指定されたデフォルトのパスワードタイプを使用します:

   ```xml
   <default_password_type>sha256_password</default_password_type>
   ```

   使用可能なパスワードタイプは: `plaintext_password`、`sha256_password`、`double_sha1_password` です。

8. 複数の認証方式を指定できます:

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```


注意事項:
1. 古いバージョンの ClickHouse では、複数の認証方式を指定する構文をサポートしていない場合があります。そのため、ClickHouse サーバーにそのようなユーザーが存在した状態で、それをサポートしないバージョンへダウングレードすると、そのユーザーは利用不能となり、ユーザー関連のいくつかの操作が正常に動作しなくなります。安全にダウングレードするには、ダウングレード前に、すべてのユーザーが単一の認証方式のみを含むように設定しておく必要があります。あるいは、適切な手順を踏まずにサーバーをダウングレードしてしまった場合は、問題のあるユーザーを削除する必要があります。
2. セキュリティ上の理由から、`no_password` は他の認証方式と同時に使用することはできません。したがって、クエリ内で `no_password` を指定できるのは、それが唯一の認証方式である場合に限られます。 



## ユーザーホスト {#user-host}

ユーザーホストとは、ClickHouseサーバーへの接続を確立できるホストのことです。ホストは`HOST`クエリセクションで以下の方法で指定できます：

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは指定されたIPアドレスまたは[サブネットワーク](https://en.wikipedia.org/wiki/Subnetwork)からのみClickHouseサーバーに接続できます。例：`HOST IP '192.168.0.0/16'`、`HOST IP '2001:DB8::/32'`。本番環境で使用する場合は、`HOST IP`要素（IPアドレスとそのマスク）のみを指定してください。`host`や`host_regexp`を使用すると追加のレイテンシが発生する可能性があるためです。
- `HOST ANY` — ユーザーは任意の場所から接続できます。これがデフォルトオプションです。
- `HOST LOCAL` — ユーザーはローカルからのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストはFQDNとして指定できます。例：`HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に[pcre](http://www.pcre.org/)正規表現を使用できます。例：`HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — [LIKE](/sql-reference/functions/string-search-functions#like)演算子を使用してユーザーホストをフィルタリングできます。例えば、`HOST LIKE '%'`は`HOST ANY`と同等であり、`HOST LIKE '%.mysite.com'`は`mysite.com`ドメイン内のすべてのホストをフィルタリングします。

ホストを指定する別の方法として、ユーザー名の後に`@`構文を使用する方法があります。例：

- `CREATE USER mira@'127.0.0.1'` — `HOST IP`構文と同等です。
- `CREATE USER mira@'localhost'` — `HOST LOCAL`構文と同等です。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE`構文と同等です。

:::tip
ClickHouseは`user_name@'address'`を全体として1つのユーザー名として扱います。したがって、技術的には同じ`user_name`で`@`以降の構成が異なる複数のユーザーを作成できますが、推奨されません。
:::


## VALID UNTIL句 {#valid-until-clause}

認証方式の有効期限日と、オプションで時刻を指定できます。パラメータとして文字列を受け取ります。日時の形式には`YYYY-MM-DD [hh:mm:ss] [timezone]`の使用を推奨します。デフォルトでは、このパラメータは`'infinity'`です。
`VALID UNTIL`句は認証方式と共に指定する必要がありますが、クエリで認証方式が指定されていない場合は例外となります。この場合、`VALID UNTIL`句は既存のすべての認証方式に適用されます。

例:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ``CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'``
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`


## GRANTEES句 {#grantees-clause}

このユーザーが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で必要なアクセス権限をすべて付与されている条件下で、このユーザーから[権限](../../../sql-reference/statements/grant.md#privileges)を受け取ることが許可されるユーザーまたはロールを指定します。`GRANTEES`句のオプション:

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは誰にでも権限を付与できます。これがデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT`式を使用して、任意のユーザーまたはロールを除外できます。例えば、`CREATE USER user1 GRANTEES ANY EXCEPT user2`とします。これは、`user1`が`GRANT OPTION`で付与された権限を持っている場合、`user2`を除く誰にでもその権限を付与できることを意味します。


## 例 {#examples-1}

パスワード`qwerty`で保護されたユーザーアカウント`mira`を作成します：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira`はClickHouseサーバーが実行されているホストでクライアントアプリを起動する必要があります。

ユーザーアカウント`john`を作成し、ロールを割り当て、それらをデフォルトロールにします：

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント`john`を作成し、将来割り当てられるすべてのロールをデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

今後`john`にロールが割り当てられると、自動的にデフォルトになります。

ユーザーアカウント`john`を作成し、`role1`と`role2`を除く将来のすべてのロールをデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント`john`を作成し、`jack`アカウントを持つユーザーに権限を付与できるようにします：

```sql
CREATE USER john GRANTEES jack;
```

クエリパラメータを使用してユーザーアカウント`john`を作成します：

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
