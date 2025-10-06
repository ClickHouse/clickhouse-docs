---
'description': 'ユーザーに関するドキュメント'
'sidebar_label': 'USER'
'sidebar_position': 39
'slug': '/sql-reference/statements/create/user'
'title': 'CREATE USER'
'doc_type': 'reference'
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

`ON CLUSTER` 句は、クラスタ内でユーザーを作成することを可能にします。詳しくは [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

## Identification {#identification}

ユーザー識別の方法はいくつかあります：

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

パスワードの複雑性要件は [config.xml](/operations/configuration-files) で編集できます。以下は、パスワードが少なくとも12文字以上で、1つの数字を含む必要があるという例の設定です。各パスワードの複雑性ルールは、パスワードに対してマッチする正規表現とルールの説明を必要とします。

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
ClickHouse Cloud では、デフォルトでパスワードは次の複雑性要件を満たす必要があります：
- 最低12文字
- 少なくとも1つの数字を含む
- 少なくとも1つの大文字を含む
- 少なくとも1つの小文字を含む
- 少なくとも1つの特殊文字を含む
:::

## Examples {#examples}

1. 次のユーザー名は `name1` であり、パスワードは必要ありません - これは明らかにセキュリティを提供しません：

```sql
CREATE USER name1 NOT IDENTIFIED
```

2. プレーンテキストのパスワードを指定するには：

```sql
CREATE USER name2 IDENTIFIED WITH plaintext_password BY 'my_password'
```

    :::tip
    パスワードは `/var/lib/clickhouse/access` のSQLテキストファイルに保存されるため、`plaintext_password` の使用はお勧めしません。次に示すように `sha256_password` を試してください...
    :::

3. 最も一般的なオプションは、SHA-256を使用してハッシュ化されたパスワードを使用することです。`IDENTIFIED WITH sha256_password` を指定する際に、ClickHouseが自動的にパスワードをハッシュ化します。例えば：

```sql
CREATE USER name3 IDENTIFIED WITH sha256_password BY 'my_password'
```

    `name3` ユーザーは `my_password` を使用してログインできますが、パスワードは上記のハッシュ値として保存されます。次のSQLファイルは `/var/lib/clickhouse/access` に作成され、サーバーが起動する際に実行されます：

```bash
/var/lib/clickhouse/access $ cat 3843f510-6ebd-a52d-72ac-e021686d8a93.sql
ATTACH USER name3 IDENTIFIED WITH sha256_hash BY '0C268556C1680BEF0640AAC1E7187566704208398DA31F03D18C74F5C5BE5053' SALT '4FB16307F5E10048196966DD7E6876AE53DE6A1D1F625488482C75F14A5097C7';
```

    :::tip
    既にユーザー名用のハッシュ値と対応するソルト値を作成している場合は、`IDENTIFIED WITH sha256_hash BY 'hash'` または `IDENTIFIED WITH sha256_hash BY 'hash' SALT 'salt'` を使用できます。`SALT` を使用した `sha256_hash` による識別では、ハッシュは 'パスワード' と 'ソルト' を連結したものから計算する必要があります。
    :::

4. `double_sha1_password` は通常必要ありませんが、MySQLインターフェースのように必要とするクライアントとの作業時に役立ちます：

```sql
CREATE USER name4 IDENTIFIED WITH double_sha1_password BY 'my_password'
```

    ClickHouseは次のクエリを生成し、実行します：

```response
CREATE USER name4 IDENTIFIED WITH double_sha1_hash BY 'CCD3A959D6A004B9C3807B728BC2E55B67E10518'
```

5. `bcrypt_password` はパスワードを保存するための最も安全なオプションです。これは、パスワードハッシュが侵害されてもブルートフォース攻撃に対して耐性のある [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) アルゴリズムを使用しています。

```sql
CREATE USER name5 IDENTIFIED WITH bcrypt_password BY 'my_password'
```

    この方法では、パスワードの長さは72文字に制限されています。 
    bcryptの作業係数パラメータは、ハッシュを計算しパスワードを確認するために必要な計算量と時間を定義し、サーバーの設定で変更できます：

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

    作業係数は4から31の間で、デフォルトは12です。

   :::warning
   高頻度な認証が必要なアプリケーションの場合、
   bcryptの計算オーバーヘッドを考慮して
   代替の認証方法を検討してください。
   :::
6. 
6. パスワードのタイプも省略できます：

```sql
CREATE USER name6 IDENTIFIED BY 'my_password'
```

    この場合、ClickHouseはサーバーの設定で指定されたデフォルトのパスワードタイプを使用します：

```xml
<default_password_type>sha256_password</default_password_type>
```

    利用可能なパスワードタイプは： `plaintext_password`, `sha256_password`, `double_sha1_password` です。

7. 複数の認証方法を指定できます： 

```sql
CREATE USER user1 IDENTIFIED WITH plaintext_password by '1', bcrypt_password by '2', plaintext_password by '3''
```

注意：
1. 古いバージョンのClickHouseは複数の認証方法の構文をサポートしていない場合があります。そのため、ClickHouseサーバーにそのようなユーザーがあり、サポートされていないバージョンにダウングレードされた場合、そのユーザーは使用できなくなり、一部のユーザー関連操作が失敗します。スムーズにダウングレードするには、ダウングレード前にすべてのユーザーを単一の認証方法を含むように設定する必要があります。あるいは、適切な手順なしでサーバーがダウングレードされた場合、問題のあるユーザーは削除する必要があります。
2. `no_password` はセキュリティ上の理由から他の認証方法と共存できません。そのため、`no_password` はクエリ内で唯一の認証方法である場合にのみ指定できます。

## User Host {#user-host}

ユーザーホストは、ClickHouseサーバーに接続できるホストです。ホストは `HOST` クエリセクションで次の方法で指定できます：

- `HOST IP 'ip_address_or_subnetwork'` — ユーザーは指定されたIPアドレスまたは[サブネット](https://en.wikipedia.org/wiki/Subnetwork)からのみClickHouseサーバーに接続できます。例： `HOST IP '192.168.0.0/16'`、 `HOST IP '2001:DB8::/32'`。本番環境で使用するためには、`HOST IP` 要素（IPアドレスとそのマスク）のみを指定し、`host` や `host_regexp` を使用すると追加のレイテンシーが発生する可能性があります。
- `HOST ANY` — ユーザーは任意の場所から接続できます。これがデフォルトのオプションです。
- `HOST LOCAL` — ユーザーはローカルでのみ接続できます。
- `HOST NAME 'fqdn'` — ユーザーホストをFQDNとして指定できます。例： `HOST NAME 'mysite.com'`。
- `HOST REGEXP 'regexp'` — ユーザーホストを指定する際に[正規表現 (pcre)](http://www.pcre.org/)を使用できます。例： `HOST REGEXP '.*\.mysite\.com'`。
- `HOST LIKE 'template'` — ユーザーホストをフィルタリングするために[LIKE](/sql-reference/functions/string-search-functions#like)演算子を使用できます。例： `HOST LIKE '%'` は `HOST ANY` に相当し、 `HOST LIKE '%.mysite.com'` は `mysite.com` ドメイン内のすべてのホストをフィルタリングします。

ホストを指定する別の方法は、ユーザー名の後に `@` 構文を使用することです。例：

- `CREATE USER mira@'127.0.0.1'` — `HOST IP` 構文に相当します。
- `CREATE USER mira@'localhost'` — `HOST LOCAL` 構文に相当します。
- `CREATE USER mira@'192.168.%.%'` — `HOST LIKE` 構文に相当します。

:::tip
ClickHouseは `user_name@'address'` を全体としてユーザー名として扱います。したがって、技術的には同じ `user_name` と異なる `@` の後の構造を持つ複数のユーザーを作成できますが、そのようにすることは推奨しません。
:::

## VALID UNTIL Clause {#valid-until-clause}

認証方法の有効期限を指定するためのクローズです。文字列をパラメータとして受け付けます。日時には、`YYYY-MM-DD [hh:mm:ss] [timezone]` 形式を使用することをお勧めします。デフォルトで、このパラメータは `'infinity'` です。
`VALID UNTIL` 句は、認証方法と共にのみ指定でき、クエリ内で認証方法が指定されていない場合に限ります。このシナリオでは、`VALID UNTIL` 句がすべての既存の認証方法に適用されます。

例：

- `CREATE USER name1 VALID UNTIL '2025-01-01'`
- `CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 UTC'`
- `CREATE USER name1 VALID UNTIL 'infinity'`
- ```CREATE USER name1 VALID UNTIL '2025-01-01 12:00:00 `Asia/Tokyo`'```
- `CREATE USER name1 IDENTIFIED WITH plaintext_password BY 'no_expiration', bcrypt_password BY 'expiration_set' VALID UNTIL '2025-01-01'`

## GRANTEES Clause {#grantees-clause}

このユーザーから[特権](../../../sql-reference/statements/grant.md#privileges)を受けることができるユーザーまたはロールを指定します。このユーザーが[GRANT OPTION](../../../sql-reference/statements/grant.md#granting-privilege-syntax)で必要なアクセスをすべて持っている場合に限ります。`GRANTEES` 句のオプション：

- `user` — このユーザーが特権を付与できるユーザーを指定します。
- `role` — このユーザーが特権を付与できるロールを指定します。
- `ANY` — このユーザーは任意のユーザーに特権を付与できます。デフォルト設定です。
- `NONE` — このユーザーは誰にも特権を付与できません。

`EXCEPT` 式を使用して、任意のユーザーまたはロールを除外できます。例えば、 `CREATE USER user1 GRANTEES ANY EXCEPT user2`。これは、 `user1` が GRANT OPTION で付与された特権を持っている場合、それを `user2` 以外の誰にでも付与できることを意味します。

## Examples {#examples-1}

パスワード `qwerty` で保護されたユーザーアカウント `mira` を作成します：

```sql
CREATE USER mira HOST IP '127.0.0.1' IDENTIFIED WITH sha256_password BY 'qwerty';
```

`mira` は、ClickHouseサーバーが稼働するホストでクライアントアプリを開始する必要があります。

ユーザーアカウント `john` を作成し、それにロールを割り当て、デフォルトのロールにします：

```sql
CREATE USER john DEFAULT ROLE role1, role2;
```

ユーザーアカウント `john` を作成し、今後のロールをすべてデフォルトに設定します：

```sql
CREATE USER john DEFAULT ROLE ALL;
```

将来的に、 `john` にいずれかのロールが割り当てられた場合、自動的にデフォルトになります。

ユーザーアカウント `john` を作成し、将来のすべてのロールを `role1` と `role2` を除いてデフォルトにします：

```sql
CREATE USER john DEFAULT ROLE ALL EXCEPT role1, role2;
```

ユーザーアカウント `john` を作成し、彼に `jack` アカウントのユーザーに特権を付与することを許可します：

```sql
CREATE USER john GRANTEES jack;
```

クエリパラメータを使用してユーザーアカウント `john` を作成します：

```sql
SET param_user=john;
CREATE USER {user:Identifier};
```
