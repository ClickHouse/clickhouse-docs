---
description: 'ユーザーおよびロールの構成設定。'
sidebar_label: 'ユーザー設定'
sidebar_position: 63
slug: /operations/settings/settings-users
title: 'ユーザーおよびロールの設定'
doc_type: 'reference'
---

# ユーザーとロールの設定 \{#users-and-roles-settings\}

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


### user_name/password \{#user-namepassword\}

パスワードは平文または SHA256（16進数形式）で指定できます。

- パスワードを平文で設定する場合（**非推奨**）、`password` 要素に指定します。

    例えば、`<password>qwerty</password>` のように指定します。パスワードは空のままにすることもできます。

<a id="password_sha256_hex"></a>

- パスワードを SHA256 ハッシュで設定する場合は、`password_sha256_hex` 要素に指定します。

    たとえば、`<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>` のようになります。

    シェルでパスワードを生成する例:

    ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'
    ```

    結果の1行目はパスワードです。2行目は対応する SHA256 ハッシュです。

<a id="password_double_sha1_hex"></a>

- MySQL クライアントとの互換性のために、パスワードはダブル SHA1 ハッシュで指定できます。その場合は `password_double_sha1_hex` 要素に設定します。

    例えば、`<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>` のように指定します。

    シェルでパスワードを生成する例:

    ```bash
    PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
    ```

    結果の1行目がパスワードです。2行目が対応するダブル SHA1 ハッシュです。

### TOTP 認証の設定 \{#totp-authentication-configuration\}

Time-Based One-Time Password (TOTP) は、一定時間のみ有効な一時アクセスコードを生成することで、ClickHouse ユーザーの認証に利用できます。
この TOTP 認証方式は [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238) 規格に準拠しており、Google Authenticator、1Password などの一般的な TOTP アプリケーションと互換性があります。
パスワードベースの認証に加えて、`users.xml` 設定ファイルで構成できます。
SQL 駆動の Access Control ではまだサポートされていません。

TOTP で認証するには、ユーザーはメインパスワード（プライマリパスワード）に加えて、TOTP アプリケーションで生成されたワンタイムパスワードを、`--one-time-password` コマンドラインオプションで指定するか、メインパスワードに `+` 文字で連結して指定する必要があります。
たとえば、メインパスワードが `some_password` で、生成された TOTP コードが `345123` の場合、ユーザーは ClickHouse へ接続する際に `--password some_password+345123` または `--password some_password --one-time-password 345123` を指定できます。パスワードが指定されていない場合は、`clickhouse-client` が対話的にパスワードの入力を促します。

ユーザーに対して TOTP 認証を有効にするには、`users.xml` 内で `time_based_one_time_password` セクションを設定します。このセクションで、シークレット、有効期間、桁数、ハッシュアルゴリズムなどの TOTP 設定を定義します。

**例**

````xml
<clickhouse>
    <!-- ... -->
    <users>
        <my_user>
            <!-- Primary password-based authentication: -->
            <password>some_password</password>
            <password_sha256_hex>1464acd6765f91fccd3f5bf4f14ebb7ca69f53af91b0a5790c2bba9d8819417b</password_sha256_hex>
            <!-- ... or any other supported authentication method ... -->

            <!-- TOTP authentication configuration -->
            <time_based_one_time_password>
                <secret>JBSWY3DPEHPK3PXP</secret>      <!-- Base32-encoded TOTP secret -->
                <period>30</period>                    <!-- Optional: OTP validity period in seconds -->
                <digits>6</digits>                     <!-- Optional: Number of digits in the OTP -->
                <algorithm>SHA1</algorithm>            <!-- Optional: Hash algorithm: SHA1, SHA256, SHA512 -->
            </time_based_one_time_password>
        </my_user>
    </users>
</clickhouse>

Parameters:

- secret - (Required) The base32-encoded secret key used to generate TOTP codes.
- period - Optional. Sets the validity period of each OTP in seconds. Must be a positive number not exceeding 120. Default is 30.
- digits - Optional. Specifies the number of digits in each OTP. Must be between 4 and 10. Default is 6.
- algorithm - Optional. Defines the hash algorithm for generating OTPs. Supported values are SHA1, SHA256, and SHA512. Default is SHA1.

Generating a TOTP Secret

To generate a TOTP-compatible secret for use with ClickHouse, run the following command in the terminal:

```bash
$ base32 -w32 < /dev/urandom | head -1
````

このコマンドは、users.xml の secret フィールドに追加できる、Base32 でエンコードされたシークレットを生成します。

特定のユーザーに対して TOTP を有効にするには、既存のパスワードベースのフィールド（`password` や `password_sha256_hex` など）に、`time_based_one_time_password` セクションを追加します。

TOTP シークレット用の QR コードを生成するには、[qrencode](https://linux.die.net/man/1/qrencode) ツールを使用できます。

```bash
$ qrencode -t ansiutf8 'otpauth://totp/ClickHouse?issuer=ClickHouse&secret=JBSWY3DPEHPK3PXP'
```

ユーザーに TOTP を設定すると、前述のとおり、ワンタイムパスワードを認証プロセスの一部として使用できるようになります。


### username/ssh-key

この設定では、SSH 鍵による認証が行えます。

`ssh-keygen` で生成された次のような SSH 鍵があるとします。

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```

`ssh_key` 要素は次のようになります

```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

他のサポートされているアルゴリズムを用いる場合は、`ssh-ed25519` を `ssh-rsa` または `ecdsa-sha2-nistp256` に置き換えてください。


### access_management {#access_management-user-setting}

この設定は、ユーザーに対して SQL 駆動の[アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage)を使用するかどうかを有効または無効にします。

取りうる値:

- 0 — 無効。
- 1 — 有効。

デフォルト値: 0。

### grants

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


### user_name/networks

ユーザーが ClickHouse サーバーに接続できるネットワークの一覧です。

一覧の各要素は次のいずれかの形式をとります。

* `<ip>` — IP アドレスまたはネットワークマスク。

  例: `213.180.204.3`, `10.0.0.1/8`, `10.0.0.1/255.255.255.0`, `2a02:6b8::3`, `2a02:6b8::3/64`, `2a02:6b8::3/ffff:ffff:ffff:ffff::`。

* `<host>` — ホスト名。

  例: `example01.host.ru`。

  アクセスを確認するために DNS クエリが実行され、返されたすべての IP アドレスがピアアドレスと照合されます。

* `<host_regexp>` — ホスト名用の正規表現。

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

### user_name/quota {#user-namequota}

クオータを使用すると、一定期間にわたるリソース使用量を追跡したり、制限したりできます。クオータは、`users.xml` 設定ファイルの `quotas`
セクションで設定します。

ユーザーに一連のクオータを割り当てることができます。クオータ設定の詳細な説明については、[Quotas](/operations/quotas) を参照してください。

### user_name/databases

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


## ロール

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
