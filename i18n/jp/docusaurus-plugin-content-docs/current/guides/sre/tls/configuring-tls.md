---
slug: /guides/sre/tls/configuring-tls
sidebar_label: 'TLS の構成'
sidebar_position: 20
title: 'TLS の構成'
description: 'このガイドでは、ClickHouse が接続を検証するために OpenSSL 証明書を使用するための、シンプルで最小限の設定方法を説明します。'
keywords: ['SSL 構成', 'TLS 設定', 'OpenSSL 証明書', 'セキュアな接続', 'SRE 向けガイド']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';


# TLS の設定 \{#configuring-tls\}

<SelfManaged />

このガイドでは、ClickHouse が接続を検証するために OpenSSL 証明書を使用するよう構成するための、シンプルで最小限の設定方法を説明します。このデモンストレーションでは、自己署名の認証局 (CA) 証明書と秘密鍵を作成し、ノード証明書とともに使用して、適切な設定で接続を確立します。

:::note
TLS の実装は複雑であり、完全に安全で堅牢なデプロイメントを実現するには、多くのオプションを検討する必要があります。ここでは、基本的な TLS 構成例のみを扱う入門的なチュートリアルです。組織に適した証明書を生成するには、PKI / セキュリティチームに相談してください。

概要レベルの導入として、この [証明書の利用に関する基本チュートリアル](https://ubuntu.com/server/docs/security-certificates) を参照してください。
:::

## 1. ClickHouse デプロイメントを作成する \\{#1-create-a-clickhouse-deployment\\}

このガイドは、Ubuntu 20.04 上で、以下のホストに apt を用いて DEB パッケージから ClickHouse をインストールした環境を前提としています。ドメインは `marsnet.local` です。

|Host |IP Address|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
ClickHouse のインストール方法の詳細については、[クイックスタート](/getting-started/install/install.mdx) を参照してください。
:::

## 2. TLS 証明書を作成する \\{#2-create-tls-certificates\\}

:::note
自己署名証明書の使用はデモ目的に限定され、本番環境では使用すべきではありません。証明書要求は組織によって署名されるように作成し、設定で構成する予定の CA チェーンを使って検証される必要があります。ただし、これらの手順は設定の構成とテストに使用でき、その後、実際に使用する証明書に置き換えることができます。
:::

1. 新しい CA に使用する秘密鍵を生成します:
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. 新しい自己署名 CA 証明書を生成します。以下のコマンドは、CA 秘密鍵を使って他の証明書に署名するために使用される新しい証明書を作成します:
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    秘密鍵と CA 証明書は、クラスタ外の安全な場所にバックアップしてください。ノード証明書を生成した後、この秘密鍵はクラスタノードから削除する必要があります。
    :::

3. 新しい CA 証明書の内容を検証します:
    ```bash
    openssl x509 -in marsnet_ca.crt -text
    ```

4. 各ノード用に証明書要求 (CSR) を作成し、秘密鍵を生成します:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
    ```

5. CSR と CA を使用して、新しい証明書と秘密鍵のペアを作成します:
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. 証明書のサブジェクト (subject) と発行者 (issuer) を確認します:
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. 新しい証明書が CA 証明書に対して正しく検証されることを確認します:
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. 証明書と鍵を保存するディレクトリを作成して設定します。 \\{#3-create-and-configure-a-directory-to-store-certificates-and-keys\\}

:::note
これは各ノードで実行する必要があります。各ホストで適切な証明書と鍵を使用してください。
:::

1. 各ノードで、ClickHouse からアクセス可能なディレクトリ内にディレクトリを作成します。デフォルトの設定ディレクトリ（例: `/etc/clickhouse-server`）の利用を推奨します:
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. 各ノードに対応する CA 証明書、ノード証明書、および鍵を、新しく作成した `certs` ディレクトリにコピーします。

3. ClickHouse が証明書を読み込めるように、所有者とパーミッションを更新します:
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

## 4. ClickHouse Keeper を使用して基本クラスタで環境を構成する \\{#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper\\}

このデプロイ環境では、各ノードで次の ClickHouse Keeper の設定を使用します。各サーバーにはそれぞれ固有の `<server_id>` が割り当てられます（たとえば、ノード `chnode1` には `<server_id>1</server_id>` を割り当てます）。

:::note
ClickHouse Keeper に推奨されるポートは `9281` です。ただし、このポートは設定可能であり、環境内の別のアプリケーションですでに使用されている場合は、別のポート番号に変更して設定できます。

すべてのオプションの詳細な説明については、https://clickhouse.com/docs/operations/clickhouse-keeper/ を参照してください。
:::

1. ClickHouse サーバーの `config.xml` 内にある `<clickhouse>` タグの内側に、次の設定を追加します。

    :::note
    本番環境では、`config.d` ディレクトリ内の個別の `.xml` 設定ファイルを使用することを推奨します。
    詳細は https://clickhouse.com/docs/operations/configuration-files/ を参照してください。
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

2. すべてのノードで Keeper の設定をコメント解除して更新し、`<secure>` フラグを 1 に設定します。
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

3. 次のクラスタ設定を `chnode1` と `chnode2` に追加・更新します。`chnode3` は ClickHouse Keeper のクォーラム用として使用します。

    :::note
    この構成では、1 つの例示用クラスタのみを設定します。テスト用のサンプルクラスタは削除するかコメントアウトするか、既存クラスタでテストを行う場合は、そのポートを更新し、`<secure>` オプションを追加する必要があります。インストール時や `users.xml` ファイルで `default` USER にパスワードを設定している場合は、`<user` および `<password>` を設定する必要があります。
    :::

    次の設定により、2 台のサーバー（各ノード 1 台ずつ）に、1 分片・2 レプリカ構成のクラスタが作成されます。
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

4. テスト用に ReplicatedMergeTree テーブルを作成できるよう、マクロの値を定義します。`chnode1` の設定:

    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
    ```

    `chnode2` の設定:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_2</replica>
    </macros>
    ```

## 5. ClickHouse ノード上での TLS インターフェースの設定 \\{#5-configure-tls-interfaces-on-clickhouse-nodes\\}

以下の設定は ClickHouse サーバーの `config.xml` で行います。

1.  デプロイメントの表示名を設定します（任意）:
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. ClickHouse が外部からの接続を受け付けるように設定します:
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 各ノードで `https` ポートを設定し、`http` ポートを無効にします:
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. 各ノードで ClickHouse ネイティブのセキュア TCP ポートを設定し、デフォルトの非セキュアポートを無効にします:
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. 各ノードで `interserver https` ポートを設定し、デフォルトの非セキュアポートを無効にします:
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. OpenSSL を証明書およびパスとともに設定します:

    :::note
    各ファイル名およびパスは、設定対象のノードに合わせて更新する必要があります。
    例えば、`chnode2` ホストを設定する場合は、`<certificateFile>` エントリを `chnode2.crt` に更新します。
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

7. すべてのノードで gRPC 用の TLS を設定します:
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

8. 少なくとも 1 つのノード上で、ClickHouse クライアントが接続に TLS を使用するよう、そのノード自身の `config.xml` ファイル（デフォルトでは `/etc/clickhouse-client/`）を設定します:
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

6. MySQL および PostgreSQL のデフォルトのエミュレーション用ポートを無効にします:
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```

## 6. テスト \{#6-testing\}

1. すべてのノードを、1 つずつ起動します:
   ```bash
   service clickhouse-server start
   ```

2. セキュアなポートが起動して待ち受けていることを確認します。各ノードで、次の例と同様の出力が得られます:

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

   | ClickHouse ポート | 説明                         |
   | -------------- | -------------------------- |
   | 8443           | HTTPS インターフェース             |
   | 9010           | サーバー間 HTTPS ポート            |
   | 9281           | ClickHouse Keeper セキュアポート  |
   | 9440           | セキュア Native TCP プロトコル      |
   | 9444           | ClickHouse Keeper Raft ポート |

3. ClickHouse Keeper の状態を確認します
   一般的な [4 letter word (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) コマンドは、TLS なしで `echo` を使っても動作しません。`openssl` を使ってこれらのコマンドを実行する方法を以下に示します。
   * `openssl` で対話型セッションを開始します

```bash
  openssl s_client -connect chnode1.marsnet.local:9281
```


```response
  CONNECTED(00000003)
  depth=0 CN = chnode1
  verify error:num=20:unable to get local issuer certificate
  verify return:1
  depth=0 CN = chnode1
  verify error:num=21:unable to verify the first certificate
  verify return:1
  ---
  Certificate chain
   0 s:CN = chnode1
     i:CN = marsnet.local CA
  ---
  Server certificate
  -----BEGIN CERTIFICATE-----
  MIICtDCCAZwCFD321grxU3G5pf6hjitf2u7vkusYMA0GCSqGSIb3DQEBCwUAMBsx
  ...
```

* OpenSSL セッション内で 4LW コマンドを実行します

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


4. `--secure` フラグと TLS ポートを使用して ClickHouse クライアントを起動します:
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. `https://chnode1.marsnet.local:8443/play` の `https` インターフェイスを使用して Play UI にログインします。

    <Image img={configuringSsl01} alt="TLS の構成" size="md" border />

    :::note
    ワークステーションからアクセスしており、証明書がクライアントマシンのルート CA ストアに存在しないため、ブラウザには信頼されていない証明書である旨の警告が表示されます。
    パブリック認証局または企業内 CA が発行した証明書を使用する場合は、信頼された証明書として扱われます。
    :::

6. レプリケーション対応テーブルを作成します:
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

7. `chnode1` 上で数行のデータを追加します:
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. `chnode2` 上で行を表示し、レプリケーションを検証します:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## 要約 \\{#summary\\}

この記事では、ClickHouse 環境で TLS を用いた設定方法に焦点を当てました。本番環境では要件に応じて、証明書検証レベル、プロトコル、暗号スイートなどの設定が異なります。ここまでの内容により、安全な接続を構成し実装するための手順について十分に理解できているはずです。