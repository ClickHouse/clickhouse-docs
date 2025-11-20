---
sidebar_label: 'SSL ユーザー証明書認証'
sidebar_position: 3
slug: /guides/sre/ssl-user-auth
title: 'SSL ユーザー証明書を用いた認証の設定'
description: 'このガイドでは、SSL ユーザー証明書による認証を構成するための、シンプルで最小限の設定について説明します。'
doc_type: 'guide'
keywords: ['ssl', 'authentication', 'security', 'certificates', 'user management']
---



# 認証用の SSL ユーザー証明書の設定

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

このガイドでは、SSL ユーザー証明書による認証を構成するための、シンプルかつ最小限の設定を説明します。このチュートリアルは、[Configuring SSL-TLS user guide](../configuring-ssl.md) を前提としています。

:::note
SSL ユーザー認証は、`https`、`native`、`mysql`、`postgresql` インターフェイスでサポートされています。

ClickHouse ノードでは、安全な認証のために `<verificationMode>strict</verificationMode>` を設定する必要があります（テスト目的であれば `relaxed` でも動作します）。

MySQL インターフェイスで AWS NLB を使用する場合、次の非公開オプションを有効にするよう AWS サポートに依頼する必要があります：

> I would like to be able to configure our NLB proxy protocol v2 as below `proxy_protocol_v2.client_to_server.header_placement,Value=on_first_ack`.
> :::


## 1. SSLユーザー証明書の作成 {#1-create-ssl-user-certificates}

:::note
この例では、自己署名CAを使用した自己署名証明書を使用しています。本番環境では、CSRを作成してPKIチームまたは証明書プロバイダーに提出し、正式な証明書を取得してください。
:::

1. 証明書署名要求(CSR)と鍵を生成します。基本的な形式は以下の通りです:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=<my_host>:<my_user>"  -keyout <my_cert_name>.key -out <my_cert_name>.csr
   ```

   この例では、サンプル環境で使用するドメインとユーザーに対して以下のコマンドを使用します:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1.marsnet.local:cert_user"  -keyout chnode1_cert_user.key -out chnode1_cert_user.csr
   ```

   :::note
   CNは任意であり、証明書の識別子として任意の文字列を使用できます。これは以降の手順でユーザーを作成する際に使用されます。
   :::

2. 認証に使用する新しいユーザー証明書を生成して署名します。基本的な形式は以下の通りです:
   ```bash
   openssl x509 -req -in <my_cert_name>.csr -out <my_cert_name>.crt -CA <my_ca_cert>.crt -CAkey <my_ca_cert>.key -days 365
   ```
   この例では、サンプル環境で使用するドメインとユーザーに対して以下のコマンドを使用します:
   ```bash
   openssl x509 -req -in chnode1_cert_user.csr -out chnode1_cert_user.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365
   ```


## 2. SQLユーザーを作成して権限を付与する {#2-create-a-sql-user-and-grant-permissions}

:::note
SQLユーザーの有効化とロールの設定方法の詳細については、[SQLユーザーとロールの定義](index.md)ユーザーガイドを参照してください。
:::

1. 証明書認証を使用するSQLユーザーを作成します:

   ```sql
   CREATE USER cert_user IDENTIFIED WITH ssl_certificate CN 'chnode1.marsnet.local:cert_user';
   ```

2. 新しい証明書ユーザーに権限を付与します:

   ```sql
   GRANT ALL ON *.* TO cert_user WITH GRANT OPTION;
   ```

   :::note
   この演習では、デモンストレーション目的でユーザーに完全な管理者権限を付与しています。権限設定の詳細については、ClickHouseの[RBACドキュメント](/guides/sre/user-management/index.md)を参照してください。
   :::

   :::note
   ユーザーとロールの定義にはSQLの使用を推奨します。ただし、現在設定ファイルでユーザーとロールを定義している場合、ユーザーは次のようになります:

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

1. ユーザー証明書、ユーザーキー、CA証明書をリモートノードにコピーします。

2. ClickHouseの[クライアント設定](/interfaces/cli.md#configuration_files)でOpenSSLを設定し、証明書とパスを指定します。

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
   設定ファイルで証明書が指定されている場合、clickhouse-clientに渡されるパスワードは無視されます。
   :::


## 4. HTTPのテスト {#4-testing-http}

1. ユーザー証明書、ユーザー鍵、CA証明書をリモートノードにコピーします。

2. `curl`を使用してサンプルSQLコマンドをテストします。基本的な形式は次のとおりです：
   ```bash
   echo 'SHOW TABLES' | curl 'https://<clickhouse_node>:8443' --cert <my_cert_name>.crt --key <my_cert_name>.key --cacert <my_ca_cert>.crt -H "X-ClickHouse-SSL-Certificate-Auth: on" -H "X-ClickHouse-User: <my_user>" --data-binary @-
   ```
   例：
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
   パスワードが指定されていない点に注意してください。証明書がパスワードの代わりに使用され、ClickHouseはこれによってユーザーを認証します。
   :::


## まとめ {#summary}

本記事では、SSL証明書認証を使用するユーザーの作成と設定の基本について説明しました。この方法は、`clickhouse-client`や、`https`インターフェースをサポートしHTTPヘッダーを設定できる任意のクライアントで使用できます。生成された証明書と秘密鍵は、ClickHouseデータベースに対する操作のためのユーザー認証と認可に使用されるため、厳重に管理し、アクセスを制限して保管する必要があります。証明書と秘密鍵はパスワードと同様に扱ってください。
