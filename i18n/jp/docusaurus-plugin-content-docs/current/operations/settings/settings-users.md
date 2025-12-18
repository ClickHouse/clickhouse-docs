---
description: 'ユーザーおよびロールの構成設定。'
sidebar_label: 'ユーザー設定'
sidebar_position: 63
slug: /operations/settings/settings-users
title: 'ユーザーおよびロールの設定'
doc_type: 'reference'
---

# ユーザーとロールの設定 {#users-and-roles-settings}

`users.xml` 設定ファイルの `users` セクションには、ユーザーの設定が含まれます。

:::note
ClickHouse は、ユーザー管理のための [SQL 駆動のワークフロー](/operations/access-rights#access-control-usage) もサポートしています。こちらの利用を推奨します。
:::

`users` セクションの構造:

```xml
<users>
    <!-- If user name was not specified, 'default' user is used. -->
    <user_name>
        <password></password>
        <!-- Or -->
        <password_sha256_hex></password_sha256_hex>

        <ssh_keys>
            <ssh_key>
                <type>ssh-ed25519</type>
                <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
            </ssh_key>
            <ssh_key>
                <type>ecdsa-sha2-nistp256</type>
                <base64_key>AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBNxeV2uN5UY6CUbCzTA1rXfYimKQA5ivNIqxdax4bcMXz4D0nSk2l5E1TkR5mG8EBWtmExSPbcEPJ8V7lyWWbA8=</base64_key>
            </ssh_key>
            <ssh_key>
                <type>ssh-rsa</type>
                <base64_key>AAAAB3NzaC1yc2EAAAADAQABAAABgQCpgqL1SHhPVBOTFlOm0pu+cYBbADzC2jL41sPMawYCJHDyHuq7t+htaVVh2fRgpAPmSEnLEC2d4BEIKMtPK3bfR8plJqVXlLt6Q8t4b1oUlnjb3VPA9P6iGcW7CV1FBkZQEVx8ckOfJ3F+kI5VsrRlEDgiecm/C1VPl0/9M2llW/mPUMaD65cM9nlZgM/hUeBrfxOEqM11gDYxEZm1aRSbZoY4dfdm3vzvpSQ6lrCrkjn3X2aSmaCLcOWJhfBWMovNDB8uiPuw54g3ioZ++qEQMlfxVsqXDGYhXCrsArOVuW/5RbReO79BvXqdssiYShfwo+GhQ0+aLWMIW/jgBkkqx/n7uKLzCMX7b2F+aebRYFh+/QXEj7SnihdVfr9ud6NN3MWzZ1ltfIczlEcFLrLJ1Yq57wW6wXtviWh59WvTWFiPejGjeSjjJyqqB49tKdFVFuBnIU5u/bch2DXVgiAEdQwUrIp1ACoYPq22HFFAYUJrL32y7RxX3PGzuAv3LOc=</base64_key>
            </ssh_key>
        </ssh_keys>

        <access_management>0|1</access_management>

        <networks incl="networks" replace="replace">
        </networks>

        <profile>profile_name</profile>

        <quota>default</quota>
        <default_database>default</default_database>
        <databases>
            <database_name>
                <table_name>
                    <filter>expression</filter>
                </table_name>
            </database_name>
        </databases>
        
        <grants>
            <query>GRANT SELECT ON system.*</query>
        </grants>
    </user_name>
    <!-- Other users settings -->
</users>
```

### user&#95;name/password {#user-namepassword}

パスワードは平文または SHA256（16進数形式）で指定できます。

* パスワードを平文で設定する場合（**非推奨**）、`password` 要素に記述します。

  例: `<password>qwerty</password>`。パスワードは空のままにしておくこともできます。

<a id="password_sha256_hex" />

* パスワードを SHA256 のハッシュ値で設定する場合、`password_sha256_hex` 要素に記述します。

たとえば、`<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>` のようになります。

シェルでパスワードを生成する例:

```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
    ```

結果の1行目はパスワードです。2行目は対応する SHA256 ハッシュです。

<a id="password_double_sha1_hex" />

* MySQL クライアントとの互換性のために、パスワードはダブル SHA1 ハッシュで指定できます。その場合は `password_double_sha1_hex` 要素に設定します。

  例えば、`<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>` のように指定します。

  シェルでパスワードを生成する例:

  ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
    ```

  結果の1行目がパスワードです。2行目が対応するダブル SHA1 ハッシュです。

### username/ssh-key {#user-sshkey}

この設定により、SSH 鍵を用いた認証を行えます。

`ssh-keygen` で生成された次のような SSH 鍵があるとします。

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```

`ssh_key` 要素は次のようであることが想定されています

```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

`ssh-ed25519` を、他のサポートされているアルゴリズムである `ssh-rsa` または `ecdsa-sha2-nistp256` に置き換えます。

### access&#95;management {#access&#95;management-user-setting}

この設定は、ユーザーに対して SQL 駆動の[アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage)を使用するかどうかを有効または無効にします。

取りうる値:

* 0 — 無効。
* 1 — 有効。

デフォルト値: 0。

### grants {#grants-user-setting}

この設定により、指定したユーザーに任意の権限を付与できます。
リストの各要素は、被付与者 (`grantees`) を指定していない `GRANT` クエリである必要があります。

例:

```xml
<user1>
    <grants>
        <query>GRANT SHOW ON *.*</query>
        <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        <query>GRANT SELECT ON system.*</query>
    </grants>
</user1>
```

この設定は、`dictionaries`、`access_management`、`named_collection_control`、`show_named_collections_secrets` および `allow_databases` の各設定と同時に指定することはできません。

### user&#95;name/networks {#user-namenetworks}

ユーザーが ClickHouse サーバーに接続できるネットワークの一覧です。

リストの各要素は、次のいずれかの形式を取ることができます。

* `<ip>` — IP アドレスまたはネットワークマスク。

  例: `213.180.204.3`, `10.0.0.1/8`, `10.0.0.1/255.255.255.0`, `2a02:6b8::3`, `2a02:6b8::3/64`, `2a02:6b8::3/ffff:ffff:ffff:ffff::`。

* `<host>` — ホスト名。

  例: `example01.host.ru`。

  アクセスを確認するために DNS クエリが実行され、返されたすべての IP アドレスが接続元アドレスと照合されます。

* `<host_regexp>` — ホスト名に対する正規表現。

  例: `^example\d\d-\d\d-\d\.host\.ru$`

アクセスを確認するために、まずピアアドレスに対して [DNS PTR クエリ](https://en.wikipedia.org/wiki/Reverse_DNS_lookup) が実行され、その結果に指定された regexp が適用されます。次に、PTR クエリの結果に対して別の DNS クエリが実行され、取得したすべてのアドレスがピアアドレスと照合されます。regexp の末尾には必ず $ を付けることを強く推奨します。

DNS クエリのすべての結果は、サーバーが再起動するまでキャッシュされます。

**例**

任意のネットワークからのユーザーへのアクセスを許可するには、次を指定します。

```xml
<ip>::/0</ip>
```

:::note
ファイアウォールが適切に構成されている場合、またはサーバーがインターネットに直接接続されていない場合を除き、任意のネットワークからのアクセスを開放するのは安全ではありません。
:::

`localhost` からのみアクセスを許可するには、次のように指定します。

```xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```

### user&#95;name/profile {#user-nameprofile}

ユーザーに設定プロファイルを割り当てることができます。設定プロファイルは `users.xml` ファイル内の別セクションで定義します。詳細については、[Profiles of Settings](../../operations/settings/settings-profiles.md) を参照してください。

### user&#95;name/quota {#user-namequota}

クオータを使用すると、一定期間にわたるリソース使用量を追跡したり、制限したりできます。クオータは、`users.xml` 設定ファイルの `quotas`
セクションで設定します。

ユーザーに一連のクオータを割り当てることができます。クオータ設定の詳細な説明については、[Quotas](/operations/quotas) を参照してください。

### user&#95;name/databases {#user-namedatabases}

このセクションでは、現在のユーザーによって実行される `SELECT` クエリに対して ClickHouse が返す行を制限することで、基本的な行レベルセキュリティを実装できます。

**例**

次の設定では、ユーザー `user1` は、`id` フィールドの値が 1000 である行のみを、`SELECT` クエリの結果として `table1` から確認できるように制限されます。

```xml
<user1>
    <databases>
        <database_name>
            <table1>
                <filter>id = 1000</filter>
            </table1>
        </database_name>
    </databases>
</user1>
```

`filter` には、[UInt8](../../sql-reference/data-types/int-uint.md) 型の値を返す任意の式を指定できます。通常は比較演算子や論理演算子を含みます。`database_name.table1` の行のうち、`filter` の結果が 0 を返すものは、このユーザーには返されません。このフィルタリングは `PREWHERE` 演算と互換性がなく、`WHERE→PREWHERE` 最適化を無効にします。

## ロール {#roles}

`user.xml` 設定ファイルの `roles` セクションを使用して、あらかじめ定義されたロールを任意に作成できます。

`roles` セクションの構造は次のとおりです。

```xml
<roles>
    <test_role>
        <grants>
            <query>GRANT SHOW ON *.*</query>
            <query>REVOKE SHOW ON system.*</query>
            <query>GRANT CREATE ON *.* WITH GRANT OPTION</query>
        </grants>
    </test_role>
</roles>
```

これらのロールは、`users` セクション内のユーザーに対して付与することもできます。

```xml
<users>
    <user_name>
        ...
        <grants>
            <query>GRANT test_role</query>
        </grants>
    </user_name>
<users>
```
