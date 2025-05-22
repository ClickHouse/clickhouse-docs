---
'sidebar_label': 'SSLユーザー証明書認証'
'sidebar_position': 3
'slug': '/guides/sre/ssl-user-auth'
'title': 'SSLユーザー証明書を使用した認証の構成'
'description': 'このガイドでは、SSLユーザー証明書を使用した認証を構成するためのシンプルで最小限の設定を提供します。'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# SSLユーザー証明書による認証の設定
<SelfManaged />

このガイドでは、SSLユーザー証明書を使用した認証を設定するためのシンプルで最小限の設定を提供します。このチュートリアルは、[SSL-TLSの設定ガイド](../configuring-ssl.md)に基づいています。

:::note
SSLユーザー認証は、`https`、`native`、`mysql`、および`postgresql`インターフェースを使用する際にサポートされています。

ClickHouseノードには、セキュアな認証のために`<verificationMode>strict</verificationMode>`を設定する必要があります（ただし、テスト目的で`relaxed`は機能します）。

AWS NLBをMySQLインターフェースで使用する場合、AWSサポートに文書化されていないオプションを有効にするよう依頼する必要があります：

> `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`として、NLBプロキシプロトコルv2を設定できるようにしたいです。
:::

## 1. SSLユーザー証明書の作成 {#1-create-ssl-user-certificates}

:::note
この例では、自己署名CAを用いた自己署名証明書を使用します。本番環境では、CSRを作成し、PKIチームまたは証明書プロバイダに提出して適切な証明書を取得してください。
:::

1. 証明書署名要求（CSR）とキーを生成します。基本的な形式は次のとおりです：
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    この例では、このサンプル環境で使用されるドメインとユーザーに対して次のようにします：
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    CNは任意であり、証明書の識別子として任意の文字列を使用できます。これは、次のステップでユーザーを作成する際に使用されます。
    :::

2. 認証に使用する新しいユーザー証明書を生成して署名します。基本的な形式は次のとおりです：
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    この例では、このサンプル環境で使用されるドメインとユーザーに対して次のようにします：
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```

## 2. SQLユーザーを作成し、権限を付与する {#2-create-a-sql-user-and-grant-permissions}

:::note
SQLユーザーを有効にし、ロールを設定する方法の詳細については、[SQLユーザーとロールの定義](index.md)ユーザーガイドを参照してください。
:::

1. 証明書認証を使用するように定義されたSQLユーザーを作成します：
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. 新しい証明書ユーザーに権限を付与します：
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    この演習では、デモ目的のためにユーザーにフル管理者権限が付与されます。権限設定については、ClickHouseの[RBACドキュメント](/guides/sre/user-management/index.md)を参照してください。
    :::

    :::note
    ユーザーとロールを定義するためにSQLを使用することをお勧めします。ただし、現在設定ファイルでユーザーとロールを定義している場合、ユーザーは次のようになります：
    ```xml
    <users>
        <cert_user>
            <ssl_certificates>
                <common_name>chnode1.marsnet.local:cert_user</common_name>
            </ssl_certificates>
            <networks>
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <access_management>1</access_management>
            <!-- additional options-->
        </cert_user>
    </users>
    ```
    :::


## 3. テスト {#3-testing}

1. ユーザー証明書、ユーキー、およびCA証明書をリモートノードにコピーします。

2. ClickHouseの[クライアント設定](/interfaces/cli.md#configuration_files)で証明書とパスを使用してOpenSSLを構成します。

    ```xml
    <openSSL>
        <client>
            <certificateFile>my_cert_name.crt</certificateFile>
            <privateKeyFile>my_cert_name.key</privateKeyFile>
            <caConfig>my_ca_cert.crt</caConfig>
        </client>
    </openSSL>
    ```

3. `clickhouse-client`を実行します。
    ```bash
    clickhouse-client --user <my_user> --query 'SHOW TABLES'
    ```
    :::note
    証明書が設定に指定されている場合、clickhouse-clientに渡されたパスワードは無視されることに注意してください。
    :::


## 4. HTTPをテストする {#4-testing-http}

1. ユーザー証明書、ユーキー、およびCA証明書をリモートノードにコピーします。

2. `curl`を使用してサンプルSQLコマンドをテストします。基本的な形式は次のとおりです：
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    例えば：
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    出力は次のようになります：
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    パスワードが指定されていないことに注意してください。証明書がパスワードの代わりに使用され、ClickHouseがユーザーを認証する方法です。
    :::


## まとめ {#summary}

この記事では、SSL証明書認証のためのユーザーを作成および設定する基本を示しました。この方法は、`clickhouse-client`や`https`インターフェースをサポートする任意のクライアントで使用でき、HTTPヘッダーを設定できます。生成された証明書とキーはプライベートに保ち、限定的なアクセス権を持たせるべきです。なぜなら、証明書はユーザーのClickHouseデータベースに対する操作を認証および承認するために使用されるからです。証明書とキーはパスワードのように扱ってください。
