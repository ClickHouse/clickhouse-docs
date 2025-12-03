---
description: 'ユーザー用ドキュメント'
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

`ON CLUSTER` 句を使用すると、クラスター全体にユーザーを作成できます。詳しくは [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。


## 識別 {#identification}

ユーザーを識別する方法には、以下のようなものがあります:

* `IDENTIFIED WITH no_password`
* `IDENTIFIED WITH plaintext_password BY 'qwerty'`
* `IDENTIFIED WITH sha256_password BY 'qwerty'` または `IDENTIFIED BY 'password'`
* `IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'`
* `IDENTIFIED WITH double_sha1_password BY 'qwerty'`
* `IDENTIFIED WITH double_sha1_hash BY 'hash'`
* `IDENTIFIED WITH bcrypt_password BY 'qwerty'`
* `IDENTIFIED WITH bcrypt_hash BY 'hash'`
* `IDENTIFIED WITH ldap SERVER 'server_name'`
* `IDENTIFIED WITH kerberos` または `IDENTIFIED WITH kerberos REALM 'realm'`
* `IDENTIFIED WITH ssl_certificate CN 'mysite.com:user'`
* `IDENTIFIED WITH ssh_key BY KEY 'public_key' TYPE 'ssh-rsa', KEY 'another_public_key' TYPE 'ssh-ed25519'`
* `IDENTIFIED WITH http SERVER 'http_server'` または `IDENTIFIED WITH http SERVER 'http_server' SCHEME 'basic'`
* `IDENTIFIED BY 'qwerty'`

パスワードの複雑性要件は [config.xml](/operations/configuration-files) で編集できます。以下は、パスワードを少なくとも 12 文字以上とし、1 つ以上の数字を含める必要がある設定例です。各パスワード複雑性ルールでは、パスワードと照合するための正規表現と、そのルールの説明を指定します。

```xml
<clickhouse>
    <password_complexity>
        <rule>
            <pattern>.{12}</pattern>
            <message>12文字以上であること</message>
        </rule>
        <rule>
            <pattern>\p{N}</pattern>
            <message>数字を1文字以上含むこと</message>
        </rule>
    </password_complexity>
</clickhouse>
```

:::note
ClickHouse Cloud では、パスワードは既定で次の複雑性要件を満たす必要があります。

* 12文字以上であること
* 少なくとも1文字の数字を含むこと
* 少なくとも1文字の大文字を含むこと
* 少なくとも1文字の小文字を含むこと
* 少なくとも1文字の特殊文字を含むこと
  :::


## 例 {#examples}

1. 次のユーザー名は `name1` であり、パスワードは不要です。つまり、当然ながらセキュリティはほとんど確保されません。

    ```sql
    CREATE USER name1 NOT IDENTIFIED
    ```

2. プレーンテキストのパスワードを指定するには:

    ```sql
    CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
    ```

    :::tip
    パスワードは `/var/lib/clickhouse/access` の SQL テキストファイルに保存されるため、`plaintext_password` を使うのは推奨されません。代わりに、次の例で示すように `sha256_password` を使用してください。
    :::

3. 最も一般的なオプションは、SHA-256 でハッシュされたパスワードを使用する方法です。`IDENTIFIED WITH sha256_password` を指定すると、ClickHouse がパスワードをハッシュします。例えば:

    ```sql
    CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
    ```

    これで `name3` ユーザーは `my_password` を使ってログインできますが、パスワードは上記のハッシュ値として保存されます。次の SQL ファイルが `/var/lib/clickhouse/access` に作成され、サーバー起動時に実行されます。

    ```bash
    /var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
    ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
    ```

    :::tip
    すでに特定のユーザー名に対するハッシュ値と、それに対応する salt 値を作成済みの場合は、`IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'` を使用できます。`SALT` を使って `sha256_hash` で識別する場合、ハッシュは 'password' と 'salt' を連結した値から計算する必要があります。
    :::

4. `double_sha1_password` は通常は不要ですが、(MySQL インターフェイスのような)それを必要とするクライアントを扱う際に便利です。

    ```sql
    CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
    ```

    ClickHouse は次のクエリを生成して実行します。

    ```response
    CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
    ```

5. `bcrypt_password` はパスワードを保存する方法として最も安全なオプションです。[bcrypt](https://en.wikipedia.org/wiki/Bcrypt) アルゴリズムを使用しており、パスワードハッシュが漏洩した場合でも総当たり攻撃に対して強固です。

    ```sql
    CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
    ```

    この方法では、パスワード長は 72 文字に制限されます。
    ハッシュの計算およびパスワード検証に必要な計算量と時間を定義する bcrypt のワークファクター (work factor) パラメータは、サーバー設定で変更できます。

    ```xml
    <bcrypt_workfactor>12</bcrypt_workfactor>
    ```

    ワークファクターは 4〜31 の範囲で指定でき、デフォルト値は 12 です。

   :::warning
   高頻度で認証が発生するアプリケーションでは、
   高いワークファクター時の bcrypt の計算オーバーヘッドを考慮し、
   別の認証方式の利用も検討してください。
   :::
6. 
6. パスワードのタイプを省略することもできます。

    ```sql
    CREATE USER name6 IDENTIFIED BY 'my_password'
    ```

    この場合、ClickHouse はサーバー設定で指定されたデフォルトのパスワードタイプを使用します。

    ```xml
    <default_password_type>sha256_password</default_password_type>
    ```

    利用可能なパスワードタイプは、`plaintext_password`、`sha256_password`、`double_sha1_password` です。

7. 複数の認証方式を指定することもできます。

   ```sql
   CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
   ```



Notes:
1. 古いバージョンの ClickHouse では、複数の認証方式を用いる構文をサポートしていない場合があります。そのため、ClickHouse サーバーにそのようなユーザーが存在した状態で、これをサポートしないバージョンにダウングレードすると、そのユーザーは利用不能になり、一部のユーザー関連の操作が失敗します。正常にダウングレードするには、ダウングレード前にすべてのユーザーが単一の認証方式のみを持つように設定しておく必要があります。あるいは、適切な手順を踏まずにサーバーをダウングレードしてしまった場合は、問題のあるユーザーを削除する必要があります。
2. セキュリティ上の理由から、`no_password` は他の認証方式と同時に使用することはできません。したがって、クエリ内で `no_password` を指定できるのは、それが唯一の認証方式である場合に限られます。 



## ユーザーホスト {#user-host}

ユーザーホストとは、ClickHouse サーバーへの接続を確立できるホストを指します。ホストはクエリ内の `HOST` セクションで次のように指定できます。

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは、指定された IP アドレスまたは[サブネットワーク](https://en.wikipedia.org/wiki/Subnetwork)からのみ ClickHouse サーバーに接続できます。例: `HOST IP '192.168.0.0/16'`, `HOST IP '2001:DB8::/32'`。本番環境では、`host` や `host_regexp` を使用すると追加のレイテンシが発生する可能性があるため、`HOST IP` 要素（IP アドレスとそのマスク）のみを指定することを推奨します。
- `HOST ANY` — ユーザーは任意の場所から接続できます。これがデフォルトのオプションです。
- `HOST LOCAL` — ユーザーはローカルからのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストを FQDN として指定できます。例: `HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストの指定時に [pcre](http://www.pcre.org/) の正規表現を使用できます。例: `HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — ユーザーホストを絞り込むために [LIKE](/sql-reference/functions/string-search-functions#like) 演算子を使用できます。例えば、`HOST LIKE '%'` は `HOST ANY` と等価であり、`HOST LIKE '%.mysite.com'` は `mysite.com` ドメイン内のすべてのホストを対象にします。

ホストを指定する別の方法として、ユーザー名の後に `@` 構文を使用する方法があります。例:

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 構文と等価です。
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 構文と等価です。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 構文と等価です。

:::tip
ClickHouse は `user_name@'address'` 全体を 1 つのユーザー名として扱います。そのため、技術的には同じ `user_name` に対して、`@` の後ろの指定が異なる複数のユーザーを作成できます。ただし、そのような運用は推奨しません。
:::



## VALID UNTIL 句 {#valid-until-clause}

認証方式に対して、有効期限日と、必要に応じて有効期限の時刻を指定できます。文字列をパラメーターとして受け取ります。日時の指定には `YYYY-MM-DD [hh:mm:ss] [timezone]` 形式を使用することを推奨します。デフォルトでは、このパラメーターは `'infinity'` です。
`VALID UNTIL` 句は、クエリ内で認証方式が一切指定されていない場合を除き、認証方式と一緒にのみ指定できます。この場合、`VALID UNTIL` 句は既存のすべての認証方式に適用されます。

例:

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01''`



## GRANTEES 句 {#grantees-clause}

このユーザーが、`GRANT OPTION` 付きで必要なすべてのアクセス権を付与されていることを条件に、このユーザーから [権限](../../../sql-reference/statements/grant.md#privileges) を付与されることが許可されているユーザーまたはロールを指定します。`GRANTEES` 句のオプションは次のとおりです。

- `user` — このユーザーが権限を付与できるユーザーを指定します。
- `role` — このユーザーが権限を付与できるロールを指定します。
- `ANY` — このユーザーは任意のユーザーに権限を付与できます。これがデフォルト設定です。
- `NONE` — このユーザーは誰にも権限を付与できません。

`EXCEPT` 式を使用して任意のユーザーやロールを除外できます。たとえば、`CREATE USER user1 GRANTEES ANY EXCEPT user2` のように指定します。これは、`user1` が `GRANT OPTION` 付きでいくつかの権限を付与されている場合、それらの権限を `user2` を除く全員に付与できることを意味します。

さらに詳しくは [GRANT ステートメントの権限に関する項目](../../../sql-reference/statements/grant.md#privileges) と [GRANT OPTION の説明](../../../sql-reference/statements/grant.md#granting-privilege-syntax) を参照してください。



## 例 {#examples-1}

パスワード `qwerty` で保護されたユーザーアカウント `mira` を作成します：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` は、ClickHouse サーバーが稼働しているホスト上でクライアントアプリケーションを起動する必要があります。

ユーザーアカウント `john` を作成し、そのアカウントにロールを割り当て、これらのロールをデフォルトとして設定します。

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント `john` を作成し、その後付与するすべてのロールをデフォルトロールとして設定します：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

将来 `john` にロールを割り当てると、それらは自動的にデフォルトロールになります。

ユーザーアカウント `john` を作成し、将来割り当てられるロールのうち `role1` と `role2` 以外はすべて自動的にデフォルトロールになるように設定します:

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント `john` を作成し、`john` が自分の権限を `jack` アカウントのユーザーに付与できるようにします：

```sql
CREATE USER john GRANTEES jack;
```

クエリパラメータを使用してユーザーアカウント `john` を作成します。

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
