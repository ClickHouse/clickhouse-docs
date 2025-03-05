---
slug: /operations/settings/settings-users
sidebar_position: 63
sidebar_label: ユーザー設定
description: "ユーザーおよびロールを構成するための設定。"
title: "ユーザーとロールの設定"
---


# ユーザーとロールの設定

`users.xml` 設定ファイルの `users` セクションにはユーザー設定が含まれています。

:::note
ClickHouse はユーザー管理のための [SQL駆動型ワークフロー](/operations/access-rights#access-control-usage) もサポートしています。使用をお勧めします。
:::

`users` セクションの構造:

``` xml
<users>
    <!-- ユーザー名が指定されていない場合は、デフォルトユーザーが使用されます。 -->
    <user_name>
        <password></password>
        <!-- または -->
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
    <!-- 他のユーザー設定 -->
</users>
```

### user_name/password {#user-namepassword}

パスワードはプレーンテキストまたはSHA256（16進数形式）で指定できます。

- プレーンテキストでパスワードを指定するには（**推奨されません**）、`password` 要素において指定します。

    例: `<password>qwerty</password>`。パスワードは空白でもかまいません。

<a id="password_sha256_hex"></a>

- SHA256ハッシュを使用してパスワードを指定するには、`password_sha256_hex` 要素において指定します。

    例: `<password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex>`。

    シェルからパスワードを生成する方法の例:

          PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha256sum | tr -d '-'

    結果の最初の行がパスワードで、2行目が対応するSHA256ハッシュです。

<a id="password_double_sha1_hex"></a>

- MySQLクライアントとの互換性のために、パスワードを二重SHA1ハッシュで指定することもできます。それは`password_double_sha1_hex` 要素に指定します。

    例: `<password_double_sha1_hex>08b4a0f1de6ad37da17359e592c8d74788a83eb0</password_double_sha1_hex>`。

    シェルからパスワードを生成する方法の例:

          PASSWORD=$(base64 < /dev/urandom | head -c8); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'

    結果の最初の行がパスワードで、2行目が対応する二重SHA1ハッシュです。

### username/ssh-key {#user-sshkey}

この設定はSSHキーでの認証を可能にします。

`ssh-keygen` によって生成されたSSHキーが次のようであるとします:
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj john@example.com
```
`ssh_key` 要素は次のようであることが期待されます:
```xml
<ssh_key>
     <type>ssh-ed25519</type>
     <base64_key>AAAAC3NzaC1lZDI1NTE5AAAAIDNf0r6vRl24Ix3tv2IgPmNPO2ATa2krvt80DdcTatLj</base64_key>
 </ssh_key>
```

他のサポートされているアルゴリズムの場合、`ssh-ed25519` を `ssh-rsa` または `ecdsa-sha2-nistp256` に置き換えてください。

### access_management {#access_management-user-setting}

この設定は、ユーザーに対してSQL駆動型の [アクセス制御およびアカウント管理](/operations/access-rights#access-control-usage) を使用するかどうかを有効または無効にします。

可能な値:

- 0 — 無効。
- 1 — 有効。

デフォルト値: 0。

### grants {#grants-user-setting}

この設定は、選択されたユーザーにさまざまな権利を付与することを可能にします。
リストの各要素は、指定されたグランティーなしの `GRANT` クエリである必要があります。

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

この設定は、`dictionaries`、`access_management`、`named_collection_control`、`show_named_collections_secrets` 、および `allow_databases` 設定と同時に指定することはできません。

### user_name/networks {#user-namenetworks}

ユーザーがClickHouseサーバーに接続できるネットワークのリスト。

リストの各要素は次のいずれかの形式を持つことができます:

- `<ip>` — IPアドレスまたはネットマスク。

    例: `213.180.204.3`、`10.0.0.1/8`、`10.0.0.1/255.255.255.0`、`2a02:6b8::3`、`2a02:6b8::3/64`、`2a02:6b8::3/ffff:ffff:ffff:ffff::`。

- `<host>` — ホスト名。

    例: `example01.host.ru`。

    アクセスを確認するためにDNSクエリが実行され、返されたすべてのIPアドレスがピアアドレスと比較されます。

- `<host_regexp>` — ホスト名用の正規表現。

    例: `^example\d\d-\d\d-\d\.host\.ru$`。

    アクセスを確認するためには、ピアアドレスに対して [DNS PTR クエリ](https://en.wikipedia.org/wiki/Reverse_DNS_lookup) が実行され、その後指定された正規表現が適用されます。次に、PTRクエリの結果に対して別のDNSクエリが実行され、受信したすべてのアドレスがピアアドレスと比較されます。正規表現の末尾に $ が来ることを強く推奨します。

DNSリクエストのすべての結果は、サーバーが再起動するまでキャッシュされます。

**例**

任意のネットワークからのユーザーへのアクセスを開放するには、次のように指定します:

``` xml
<ip>::/0</ip>
```

:::note
ファイアウォールが正しく構成されていない限り、またはサーバーがインターネットに直接接続されていない限り、任意のネットワークからのアクセスを開放するのは安全でありません。
:::

ローカルホストからのみアクセスを開放するには、次のように指定します:

``` xml
<ip>::1</ip>
<ip>127.0.0.1</ip>
```

### user_name/profile {#user-nameprofile}

ユーザーに設定プロファイルを割り当てることができます。設定プロファイルは `users.xml` ファイルの別のセクションに設定されています。詳細については、[設定プロファイル](../../operations/settings/settings-profiles.md)を参照してください。

### user_name/quota {#user-namequota}

クォータは、特定の期間にわたるリソース使用率を追跡または制限できるようにします。クォータは `users.xml` 設定ファイルの `quotas` セクションで設定されます。

ユーザーに対してクォータセットを割り当てることができます。クォータ設定の詳細な説明については、[クォータ](/operations/quotas)を参照してください。

### user_name/databases {#user-namedatabases}

このセクションでは、現在のユーザーが行う `SELECT` クエリに対してClickHouseが返す行を制限し、基本的な行レベルのセキュリティを実装できます。

**例**

以下の設定により、ユーザー `user1` は `SELECT` クエリの結果として `table1` の行を `id` フィールドの値が 1000 の場合のみ見ることができます。

``` xml
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

`filter` は [UInt8](../../sql-reference/data-types/int-uint.md) 型の値を返す任意の式であり、大抵は比較演算子と論理演算子を含みます。フィルターの結果が 0 となる `database_name.table1` の行は、このユーザーには返されません。フィルタリングは `PREWHERE` 操作と互換性がなく、`WHERE→PREWHERE` 最適化を無効にします。

## ロール {#roles}

`user.xml` 設定ファイルの `roles` セクションを使用して、任意のプリセットのロールを作成できます。

`roles` セクションの構造:

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

これらのロールは `users` セクションからユーザーに付与することもできます:

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
