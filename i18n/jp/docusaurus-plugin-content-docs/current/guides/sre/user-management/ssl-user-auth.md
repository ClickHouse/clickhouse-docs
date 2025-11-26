---
sidebar_label: 'SSL ユーザー証明書認証'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'SSL ユーザー証明書による認証の設定'
description: 'このガイドでは、SSL ユーザー証明書を用いた認証を構成するための、シンプルで最小限の設定について説明します。'
doc_type: 'guide'
keywords: ['ssl', 'authentication', 'security', 'certificates', 'user management']
---



# SSL ユーザー証明書を使用した認証の設定

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

このガイドでは、SSL ユーザー証明書を用いた認証を構成するための、シンプルで最小限の設定例を示します。このチュートリアルは [Configuring SSL-TLS user guide](../configuring-ssl.md) を前提としています。

:::note
SSL ユーザー認証は、`https`、`native`、`mysql`、`postgresql` インターフェイスを使用する場合にサポートされています。

安全な認証を行うには、ClickHouse ノードで `<verificationMode>strict</verificationMode>` を設定する必要があります（テスト目的であれば `relaxed` でも動作します）。

MySQL インターフェイスで AWS NLB を使用する場合、以下の非公開オプションを有効にするよう AWS サポートに依頼する必要があります。

> I would like to be able to configure our NLB proxy protocol v2 as below `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
> :::


## 1. SSL ユーザー証明書を作成する {#1-create-ssl-user-certificates}

:::note
この例では、自己署名 CA が発行した自己署名証明書を使用します。本番環境では、CSR を作成して PKI チームまたは証明書プロバイダーに提出し、適切な証明書を取得してください。
:::

1. 証明書署名要求 (CSR) とキーを生成します。基本的な形式は次のとおりです。
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
    ```
    このサンプル環境で使用するドメインとユーザーに対しては、次のように実行します。
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
    ```
    :::note
    CN の値は任意であり、証明書の識別子として任意の文字列を使用できます。後続の手順でユーザーを作成する際に使用します。
    :::

2. 認証に使用される新しいユーザー証明書を生成し、署名します。基本的な形式は次のとおりです。
    ```bash
    openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
    ```
    このサンプル環境で使用するドメインとユーザーに対しては、次のように実行します。
    ```bash
    openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
    ```



## 2. SQL ユーザーを作成して権限を付与する {#2-create-a-sql-user-and-grant-permissions}

:::note
SQL ユーザーを有効化する方法やロールの設定方法の詳細については、ユーザーガイドの [Defining SQL Users and Roles](index.md) を参照してください。
:::

1. 証明書ベースの認証を使用するように定義された SQL ユーザーを作成します:
    ```sql
    CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
    ```

2. 新しい証明書ユーザーに権限を付与します:
    ```sql
    GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
    ```
    :::note
    この演習ではデモ目的のため、このユーザーには管理者権限（フルアクセス）が付与されています。権限設定については ClickHouse の [RBAC ドキュメント](/guides/sre/user-management/index.md) を参照してください。
    :::

    :::note
    ユーザーとロールの定義には SQL の使用を推奨します。ただし、現在ユーザーとロールを設定ファイルで定義している場合は、ユーザーの定義は次のようになります:
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
            <!-- 追加オプション -->
        </cert_user>
    </users>
    ```
    :::



## 3. テスト {#3-testing}

1. ユーザー証明書、ユーザー鍵、および CA 証明書をリモートノードにコピーします。

2. ClickHouse の [クライアント設定](/interfaces/cli.md#configuration_files) で、証明書とそのパスを指定して OpenSSL を構成します。

    ```xml
    <openSSL>
        <client>
            <certificateFile>my_cert_name.crt</certificateFile>
            <privateKeyFile>my_cert_name.key</privateKeyFile>
            <caConfig>my_ca_cert.crt</caConfig>
        </client>
    </openSSL>
    ```

3. `clickhouse-client` を実行します。
    ```bash
    clickhouse-client --user <my_user> --query 'SHOW TABLES'
    ```
    :::note
    設定で証明書が指定されている場合、clickhouse-client に渡されたパスワードは無視されることに注意してください。
    :::



## 4. HTTP をテストする {#4-testing-http}

1. ユーザー証明書、ユーザー秘密鍵、および CA 証明書をリモートノードにコピーします。

2. `curl` を使用してサンプルの SQL コマンドをテストします。基本的な形式は次のとおりです。
    ```bash
    echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
    ```
    例:
    ```bash
    echo 'SHOW TABLES' | curl 'https://chnode1:8443' --cert chnode1_cert_user.crt --key chnode1_cert_user.key --cacert marsnet_ca.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: cert_user" --data-binary @-
    ```
    出力は次のようになります。
    ```response
    INFORMATION_SCHEMA
    default
    information_schema
    system
    ```
    :::note
    パスワードを指定していない点に注意してください。証明書がパスワードの代わりとして使用され、ClickHouse はこれを用いてユーザーを認証します。
    :::



## まとめ {#summary}

この記事では、SSL 証明書認証用のユーザーを作成および設定するための基本的な手順を説明しました。この方法は、`clickhouse-client` や、`https` インターフェイスをサポートし、HTTP ヘッダーを設定できるあらゆるクライアントで使用できます。生成された証明書と鍵は、ClickHouse データベース上でユーザーを認証および認可するために使用されるため、秘匿し、アクセス権を制限する必要があります。証明書と鍵はパスワードと同様に扱ってください。
