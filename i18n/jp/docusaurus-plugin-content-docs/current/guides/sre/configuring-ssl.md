---
slug: /guides/sre/configuring-ssl
sidebar_label: 'SSL-TLS の設定'
sidebar_position: 20
title: 'SSL-TLS の設定'
description: 'このガイドでは、ClickHouse が接続を検証するために OpenSSL 証明書を使用するように設定するための、シンプルで最小限の設定方法を説明します。'
keywords: ['SSL configuration', 'TLS setup', 'OpenSSL certificates', 'secure connections', 'SRE guide']
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';


# SSL-TLS の構成

<SelfManaged />

このガイドでは、ClickHouse が接続を検証する際に OpenSSL 証明書を使用するように構成するための、シンプルかつ最小限の設定を示します。このデモンストレーションでは、自己署名の認証局 (CA) 証明書とキーを作成し、ノード証明書と組み合わせて、適切な設定で接続を確立します。

:::note
TLS の実装は複雑であり、完全に安全かつ堅牢なデプロイを行うには、考慮すべき多くのオプションがあります。ここでは、基本的な SSL/TLS 構成例のみを扱う入門的なチュートリアルです。組織に適した証明書を生成するには、PKI/セキュリティチームに相談してください。

概要については、この[証明書の利用に関する基本的なチュートリアル](https://ubuntu.com/server/docs/security-certificates)を参照してください。
:::



## 1. ClickHouseデプロイメントの作成 {#1-create-a-clickhouse-deployment}

本ガイドは、Ubuntu 20.04を使用し、DEBパッケージ(apt使用)で以下のホストにClickHouseをインストールした環境で作成されています。ドメインは`marsnet.local`です:

| ホスト      | IPアドレス    |
| --------- | ------------- |
| `chnode1` | 192.168.1.221 |
| `chnode2` | 192.168.1.222 |
| `chnode3` | 192.168.1.223 |

:::note
ClickHouseのインストール方法の詳細については、[クイックスタート](/getting-started/install/install.mdx)を参照してください。
:::


## 2. SSL証明書の作成 {#2-create-ssl-certificates}

:::note
自己署名証明書の使用はデモンストレーション目的のみであり、本番環境では使用しないでください。証明書リクエストは組織によって署名され、設定で構成されるCA証明書チェーンを使用して検証されるように作成する必要があります。ただし、これらの手順は設定の構成とテストに使用でき、その後、実際に使用される証明書に置き換えることができます。
:::

1. 新しいCAに使用する鍵を生成します:

   ```bash
   openssl genrsa -out marsnet_ca.key 2048
   ```

2. 新しい自己署名CA証明書を生成します。以下のコマンドは、CA鍵を使用して他の証明書に署名するための新しい証明書を作成します:

   ```bash
   openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
   ```

   :::note
   鍵とCA証明書をクラスタ外の安全な場所にバックアップしてください。ノード証明書を生成した後、鍵はクラスタノードから削除する必要があります。
   :::

3. 新しいCA証明書の内容を確認します:

   ```bash
   openssl x509 -in marsnet_ca.crt -text
   ```

4. 各ノードの証明書リクエスト(CSR)を作成し、鍵を生成します:

   ```bash
   openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
   openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
   openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
   ```

5. CSRとCAを使用して、新しい証明書と鍵のペアを作成します:

   ```bash
   openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
   openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
   openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
   ```

6. サブジェクトと発行者について証明書を確認します:

   ```bash
   openssl x509 -in chnode1.crt -text -noout
   ```

7. 新しい証明書がCA証明書に対して検証されることを確認します:
   ```bash
   openssl verify -CAfile marsnet_ca.crt chnode1.crt
   chnode1.crt: OK
   ```


## 3. 証明書と鍵を保存するディレクトリの作成と設定 {#3-create-and-configure-a-directory-to-store-certificates-and-keys}

:::note
この作業は各ノードで実行する必要があります。各ホストで適切な証明書と鍵を使用してください。
:::

1. 各ノードでClickHouseがアクセス可能なディレクトリにフォルダを作成します。デフォルトの設定ディレクトリ（例：`/etc/clickhouse-server`）を推奨します：

   ```bash
   mkdir /etc/clickhouse-server/certs
   ```

2. CA証明書、ノード証明書、および各ノードに対応する鍵を新しいcertsディレクトリにコピーします。

3. ClickHouseが証明書を読み取れるように所有者と権限を更新します：

   ```bash
   chown clickhouse:clickhouse -R /etc/clickhouse-server/certs
   chmod 600 /etc/clickhouse-server/certs/*
   chmod 755 /etc/clickhouse-server/certs
   ll /etc/clickhouse-server/certs
   ```

   ```response
   total 20
   drw-r--r-- 2 clickhouse clickhouse 4096 Apr 12 20:23 ./
   drwx------ 5 clickhouse clickhouse 4096 Apr 12 20:23 ../
   -rw------- 1 clickhouse clickhouse  997 Apr 12 20:22 chnode1.crt
   -rw------- 1 clickhouse clickhouse 1708 Apr 12 20:22 chnode1.key
   -rw------- 1 clickhouse clickhouse 1131 Apr 12 20:23 marsnet_ca.crt
   ```


## 4. ClickHouse Keeperを使用した基本クラスタ環境の構成 {#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper}

このデプロイメント環境では、各ノードで以下のClickHouse Keeper設定を使用します。各サーバーは独自の`<server_id>`を持ちます（例：ノード`chnode1`には`<server_id>1</server_id>`など）。

:::note
ClickHouse Keeperの推奨ポートは`9281`です。ただし、環境内の別のアプリケーションで既にこのポートが使用されている場合は、ポートを変更することができます。

すべてのオプションの詳細については、https://clickhouse.com/docs/operations/clickhouse-keeper/ を参照してください。
:::

1. ClickHouseサーバーの`config.xml`内の`<clickhouse>`タグ内に以下を追加します

   :::note
   本番環境では、`config.d`ディレクトリ内に別の`.xml`設定ファイルを使用することを推奨します。
   詳細については、https://clickhouse.com/docs/operations/configuration-files/ を参照してください。
   :::

   ```xml
   <keeper_server>
       <tcp_port_secure>9281</tcp_port_secure>
       <server_id>1</server_id>
       <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
       <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

       <coordination_settings>
           <operation_timeout_ms>10000</operation_timeout_ms>
           <session_timeout_ms>30000</session_timeout_ms>
           <raft_logs_level>trace</raft_logs_level>
       </coordination_settings>

       <raft_configuration>
           <secure>true</secure>
           <server>
               <id>1</id>
               <hostname>chnode1.marsnet.local</hostname>
               <port>9444</port>
           </server>
           <server>
               <id>2</id>
               <hostname>chnode2.marsnet.local</hostname>
               <port>9444</port>
           </server>
           <server>
               <id>3</id>
               <hostname>chnode3.marsnet.local</hostname>
               <port>9444</port>
           </server>
       </raft_configuration>
   </keeper_server>
   ```

2. すべてのノードでkeeper設定のコメントを解除して更新し、`<secure>`フラグを1に設定します：

   ```xml
   <zookeeper>
       <node>
           <host>chnode1.marsnet.local</host>
           <port>9281</port>
           <secure>1</secure>
       </node>
       <node>
           <host>chnode2.marsnet.local</host>
           <port>9281</port>
           <secure>1</secure>
       </node>
       <node>
           <host>chnode3.marsnet.local</host>
           <port>9281</port>
           <secure>1</secure>
       </node>
   </zookeeper>
   ```

3. `chnode1`と`chnode2`に以下のクラスタ設定を更新・追加します。`chnode3`はClickHouse Keeperのクォーラムに使用されます。

   :::note
   この構成では、1つのサンプルクラスタのみを設定します。テストサンプルクラスタは削除するかコメントアウトする必要があります。テスト中の既存クラスタが存在する場合は、ポートを更新し、`<secure>`オプションを追加する必要があります。`default`ユーザーがインストール時または`users.xml`ファイルでパスワードを持つように初期設定されている場合は、`<user>`と`<password>`を設定する必要があります。
   :::

   以下は、2つのサーバー上に1つのシャードレプリカを持つクラスタを作成します（各ノードに1つずつ）。

   ```xml
   <remote_servers>
       <cluster_1S_2R>
           <shard>
               <replica>
                   <host>chnode1.marsnet.local</host>
                   <port>9440</port>
                   <user>default</user>
                   <password>ClickHouse123!</password>
                   <secure>1</secure>
               </replica>
               <replica>
                   <host>chnode2.marsnet.local</host>
                   <port>9440</port>
                   <user>default</user>
                   <password>ClickHouse123!</password>
                   <secure>1</secure>
               </replica>
           </shard>
       </cluster_1S_2R>
   </remote_servers>
   ```


4. テスト用に ReplicatedMergeTree テーブルを作成できるよう、マクロの値を定義します。`chnode1` 上で以下を設定します:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
    ```

    `chnode2` 上で以下を設定します:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_2</replica>
    </macros>
    ```



## 5. ClickHouseノードでSSL/TLSインターフェースを設定する {#5-configure-ssl-tls-interfaces-on-clickhouse-nodes}

以下の設定は、ClickHouseサーバーの`config.xml`で行います。

1.  デプロイメントの表示名を設定します(オプション):

    ```xml
    <display_name>clickhouse</display_name>
    ```

2.  ClickHouseが外部ポートでリッスンするように設定します:

    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3.  各ノードで`https`ポートを設定し、`http`ポートを無効化します:

    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4.  各ノードでClickHouse Nativeセキュアポート(TCP)を設定し、デフォルトの非セキュアポートを無効化します:

    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5.  各ノードで`interserver https`ポートを設定し、デフォルトの非セキュアポートを無効化します:

    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6.  証明書とパスを指定してOpenSSLを設定します

    :::note
    各ファイル名とパスは、設定対象のノードに合わせて更新する必要があります。
    例えば、`chnode2`ホストで設定する場合は、`<certificateFile>`エントリを`chnode2.crt`に更新してください。
    :::

    ```xml
    <openSSL>
        <server>
            <certificateFile>/etc/clickhouse-server/certs/chnode1.crt</certificateFile>
            <privateKeyFile>/etc/clickhouse-server/certs/chnode1.key</privateKeyFile>
            <verificationMode>relaxed</verificationMode>
            <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
            <cacheSessions>true</cacheSessions>
            <disableProtocols>sslv2,sslv3</disableProtocols>
            <preferServerCiphers>true</preferServerCiphers>
        </server>
        <client>
            <loadDefaultCAFile>false</loadDefaultCAFile>
            <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
            <cacheSessions>true</cacheSessions>
            <disableProtocols>sslv2,sslv3</disableProtocols>
            <preferServerCiphers>true</preferServerCiphers>
            <verificationMode>relaxed</verificationMode>
            <invalidCertificateHandler>
                <name>RejectCertificateHandler</name>
            </invalidCertificateHandler>
        </client>
    </openSSL>
    ```

    詳細については、https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl を参照してください。

7.  すべてのノードでSSL用のgRPCを設定します:

    ```xml
    <grpc>
        <enable_ssl>1</enable_ssl>
        <ssl_cert_file>/etc/clickhouse-server/certs/chnode1.crt</ssl_cert_file>
        <ssl_key_file>/etc/clickhouse-server/certs/chnode1.key</ssl_key_file>
        <ssl_require_client_auth>true</ssl_require_client_auth>
        <ssl_ca_cert_file>/etc/clickhouse-server/certs/marsnet_ca.crt</ssl_ca_cert_file>
        <transport_compression_type>none</transport_compression_type>
        <transport_compression_level>0</transport_compression_level>
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>
        <verbose_logs>false</verbose_logs>
    </grpc>
    ```

    詳細については、https://clickhouse.com/docs/interfaces/grpc/ を参照してください。

8.  少なくとも1つのノードで、ClickHouseクライアントが接続にSSLを使用するように、クライアント独自の`config.xml`ファイル(デフォルトでは`/etc/clickhouse-client/`に配置)で設定します:
    ```xml
    <openSSL>
        <client>
            <loadDefaultCAFile>false</loadDefaultCAFile>
            <caConfig>/etc/clickhouse-server/certs/marsnet_ca.crt</caConfig>
            <cacheSessions>true</cacheSessions>
            <disableProtocols>sslv2,sslv3</disableProtocols>
            <preferServerCiphers>true</preferServerCiphers>
            <invalidCertificateHandler>
                <name>RejectCertificateHandler</name>
            </invalidCertificateHandler>
        </client>
    </openSSL>
    ```


6. MySQL および PostgreSQL のデフォルトのエミュレーション用ポートを無効化します:
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```



## 6. テスト {#6-testing}

1. すべてのノードを1つずつ起動します:

   ```bash
   service clickhouse-server start
   ```

2. セキュアポートが起動してリスニング状態にあることを確認します。各ノードで以下の例のような出力が表示されます:

   ```bash
   root@chnode1:/etc/clickhouse-server# netstat -ano | grep tcp
   ```

   ```response
   tcp        0      0 0.0.0.0:9010            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:8443            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:9440            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 0.0.0.0:9281            0.0.0.0:*               LISTEN      off (0.00/0/0)
   tcp        0      0 192.168.1.221:33046     192.168.1.222:9444      ESTABLISHED off (0.00/0/0)
   tcp        0      0 192.168.1.221:42730     192.168.1.223:9444      ESTABLISHED off (0.00/0/0)
   tcp        0      0 192.168.1.221:51952     192.168.1.222:9281      ESTABLISHED off (0.00/0/0)
   tcp        0      0 192.168.1.221:22        192.168.1.210:49801     ESTABLISHED keepalive (6618.05/0/0)
   tcp        0     64 192.168.1.221:22        192.168.1.210:59195     ESTABLISHED on (0.24/0/0)
   tcp6       0      0 :::22                   :::*                    LISTEN      off (0.00/0/0)
   tcp6       0      0 :::9444                 :::*                    LISTEN      off (0.00/0/0)
   tcp6       0      0 192.168.1.221:9444      192.168.1.222:59046     ESTABLISHED off (0.00/0/0)
   tcp6       0      0 192.168.1.221:9444      192.168.1.223:41976     ESTABLISHED off (0.00/0/0)
   ```

   | ClickHouse ポート | 説明                          |
   | --------------- | ----------------------------- |
   | 8443            | HTTPS インターフェース               |
   | 9010            | サーバー間 HTTPS ポート        |
   | 9281            | ClickHouse Keeper セキュアポート |
   | 9440            | セキュア Native TCP プロトコル    |
   | 9444            | ClickHouse Keeper Raft ポート   |

3. ClickHouse Keeper の健全性を確認します
   一般的な [4文字コマンド (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) は、TLS なしで `echo` を使用しても動作しません。以下は `openssl` でコマンドを使用する方法です。
   - `openssl` で対話型セッションを開始します


```bash
  openssl s_client -connect chnode1.marsnet.local:9281
```

```response
CONNECTED(00000003)
depth=0 CN = chnode1
verify error:num=20:ローカル発行者の証明書を取得できません
verify return:1
depth=0 CN = chnode1
verify error:num=21:最初の証明書を検証できません
verify return:1
---
証明書チェーン
 0 s:CN = chnode1
   i:CN = marsnet.local CA
---
サーバー証明書
-----BEGIN CERTIFICATE-----
MIICtDCCAZwCFD321grxU3G5pf6hjitf2u7vkusYMA0GCSqGSIb3DQEBCwUAMBsx
...
```

* openssl セッション内で 4LW コマンドを送信します

  ```bash
  mntr
  ```

  ```response
  ---
  Post-Handshake New Session Ticket arrived:
  SSL-Session:
      Protocol  : TLSv1.3
  ...
  read R BLOCK
  zk_version      v22.7.3.5-stable-e140b8b5f3a5b660b6b576747063fd040f583cf3
  zk_avg_latency  0
  # highlight-next-line
  zk_max_latency  4087
  zk_min_latency  0
  zk_packets_received     4565774
  zk_packets_sent 4565773
  zk_num_alive_connections        2
  zk_outstanding_requests 0
  # highlight-next-line
  zk_server_state leader
  zk_znode_count  1087
  zk_watch_count  26
  zk_ephemerals_count     12
  zk_approximate_data_size        426062
  zk_key_arena_size       258048
  zk_latest_snapshot_size 0
  zk_open_file_descriptor_count   187
  zk_max_file_descriptor_count    18446744073709551615
  # highlight-next-line
  zk_followers    2
  zk_synced_followers     1
  closed
  ```

4. `--secure` フラグと SSL ポートを使用して ClickHouse クライアントを起動します:
   ```bash
   root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
   ClickHouse client version 22.3.3.44 (official build).
   Connecting to chnode1.marsnet.local:9440 as user default.
   Connected to ClickHouse server version 22.3.3 revision 54455.

   clickhouse :)
   ```

5. `https` インターフェイスで `https://chnode1.marsnet.local:8443/play` にアクセスして Play UI にログインします。

   <Image img={configuringSsl01} alt="SSL の構成" size="md" border />

   :::note
   ワークステーションからアクセスしており、証明書がクライアントマシンのルート CA ストアに存在しないため、ブラウザには未信頼の証明書として表示されます。
   公的認証局またはエンタープライズ CA が発行した証明書を使用する場合は、信頼された証明書として表示されるはずです。
   :::

6. レプリケートテーブルを作成します:

   ```sql
   clickhouse :) CREATE TABLE repl_table ON CLUSTER cluster_1S_2R
               (
                   id UInt64,
                   column1 Date,
                   column2 String
               )
               ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/default/repl_table', '{replica}' )
               ORDER BY (id);
   ```

   ```response
   ┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
   │ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
   │ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
   └───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
   ```

7. `chnode1` に 2 行追加します:
   ```sql
   INSERT INTO repl_table
   (id, column1, column2)
   VALUES
   (1,'2022-04-01','abc'),
   (2,'2022-04-02','def');
   ```


8. `chnode2` 上の行を表示して、レプリケーションを確認します:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```



## Summary {#summary}

本記事では、ClickHouse環境でSSL/TLSを設定する方法について説明しました。本番環境では要件に応じて設定内容が異なります（証明書検証レベル、プロトコル、暗号化方式など）。これにより、安全な接続の設定と実装に必要な手順について理解を深めることができたはずです。
