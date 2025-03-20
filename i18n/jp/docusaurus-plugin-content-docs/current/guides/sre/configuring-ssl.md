---
slug: /guides/sre/configuring-ssl
sidebar_label: SSL-TLSの設定
sidebar_position: 20
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';


# SSL-TLSの設定

<SelfManaged />

このガイドでは、ClickHouseをOpenSSL証明書を使用して接続を検証するために構成するための簡単かつ最小限の設定を提供します。このデモでは、自己署名の認証局 (CA) 証明書とキーを作成し、適切な設定で接続を確立するためのノード証明書を作成します。

:::note
TLSの実装は複雑であり、完全に安全で堅牢な展開を確保するために考慮すべきオプションが多数あります。これは基礎的なSSL/TLS設定の例を含む基本的なチュートリアルです。適切な証明書を生成するために、PKI/securityチームに相談してください。

証明書の使用に関する[基本的なチュートリアル](https://ubuntu.com/server/docs/security-certificates)を確認して、基本的な概要を把握してください。
:::

## 1. ClickHouseのデプロイメントを作成 {#1-create-a-clickhouse-deployment}

このガイドは、Ubuntu 20.04および以下のホストにDEBパッケージ（aptを使用）でインストールされたClickHouseを使用して作成されました。ドメインは `marsnet.local` です:

|Host |IP Address|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|


:::note
ClickHouseのインストール方法に関する詳細は、[クイックスタート](/getting-started/install.md)を参照してください。
:::


## 2. SSL証明書を作成 {#2-create-ssl-certificates}
:::note
自己署名証明書の使用はデモンストレーション目的のみであり、本番環境では使用すべきではありません。証明書要求は、組織によって署名され、設定で構成されるCAチェーンによって検証されるべきです。ただし、これらの手順を使用して設定を構成およびテストし、その後、使用される実際の証明書に置き換えることができます。
:::

1. 新しいCAに使用するキーを生成します:
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. 新しい自己署名CA証明書を生成します。以下のコマンドは、CAキーを使用して他の証明書に署名するために使用される新しい証明書を作成します:
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    キーとCA証明書をクラスター外の安全な場所にバックアップしてください。ノード証明書の生成後、キーはクラスターのノードから削除するべきです。
    :::

3. 新しいCA証明書の内容を確認します:
    ```bash
    openssl x509 -in marsnet_ca.crt -text
    ```

4. 各ノード用の証明書要求 (CSR) を作成し、キーを生成します:
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
    ```

5. CSRおよびCAを使用して、新しい証明書とキーのペアを作成します:
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. 主題と発行者を確認します:
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. 新しい証明書がCA証明書に対して検証できるか確認します:
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. 証明書とキーを保存するためのディレクトリを作成し、構成します。 {#3-create-and-configure-a-directory-to-store-certificates-and-keys}

:::note
これは各ノードで実行する必要があります。各ホストで適切な証明書とキーを使用してください。
:::

1. 各ノードのClickHouseがアクセスできるディレクトリにフォルダーを作成します。デフォルトの設定ディレクトリ (例: `/etc/clickhouse-server`) を推奨します:
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. 各ノードに対応するCA証明書、ノード証明書、およびキーを新しいcertsディレクトリにコピーします。

3. ClickHouseが証明書を読み取れるように所有者と権限を更新します:
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

## 4. ClickHouse Keeperを使用して基本クラスターを用意し、環境を構成します {#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper}

このデプロイメント環境では、各ノードで以下のClickHouse Keeper設定が使用されます。各サーバーには独自の `<server_id>` が必要です（例: ノード `chnode1` は `<server_id>1</server_id>` になります）。

:::note
ClickHouse Keeperの推奨ポートは `9281` です。ただし、このポートは構成可能で、環境内の他のアプリケーションですでに使用されている場合は別のポートを設定できます。

すべてのオプションについての完全な説明は、https://clickhouse.com/docs/operations/clickhouse-keeper/ を訪れてください。
:::


1. ClickHouseサーバーの `config.xml` の `<clickhouse>` タグ内に次の内容を追加します。

    :::note
    本番環境では、`config.d` ディレクトリに別の `.xml` 設定ファイルを使用することを推奨します。
    詳細については、https://clickhouse.com/docs/operations/configuration-files/ を訪れてください。
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

2. すべてのノードでkeeper設定のコメントを解除し、`<secure>` フラグを1に設定します:
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

3. `chnode1` と `chnode2` に次のクラスター設定を更新し、追加します。 `chnode3` はClickHouse Keeperの過半数に使用されます。

    :::note
    この構成では、1つの例のクラスターしか構成されていません。テストサンプルクラスターは削除、コメント解除、またはテスト中の既存のクラスターがある場合はポートを更新し、 `<secure>` オプションを追加する必要があります。`<user>` と `<password>` は、デフォルトユーザーに初期設定時にパスワードが付与されている場合には設定する必要があります。
    :::

    次の内容は、2つのサーバーで1つのシャードレプリカを持つクラスターを作成します（各ノードに1つずつ）。
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

4. テストのためにReplicatedMergeTreeテーブルを作成できるようにマクロの値を定義します。 `chnode1` で:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
    ```

    `chnode2` で:
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_2</replica>
    </macros>
    ```

## 5. ClickHouseノードのSSL-TLSインターフェイスを構成します {#5-configure-ssl-tls-interfaces-on-clickhouse-nodes}
以下の設定は、ClickHouseサーバーの `config.xml` に構成されています。

1. デプロイメントの表示名を設定します（任意）:
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. ClickHouseが外部ポートをリッスンするように設定します:
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 各ノードで `https` ポートを構成し、`http` ポートを無効にします:
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. 各ノードでClickHouse Nativeの安全なTCPポートを構成し、デフォルトの非安全ポートを無効にします:
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. 各ノードで `interserver https` ポートを構成し、デフォルトの非安全ポートを無効にします:
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. OpenSSLを証明書とパスで構成します

    :::note
    各ファイル名とパスは、設定されているノードに合わせて更新する必要があります。
    たとえば、`chnode2` ホストで構成する際には、`<certificateFile>` のエントリを `chnode2.crt` に更新します。
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

    詳細については、https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl を訪れてください。

7. 各ノードでgRPCをSSL用に構成します:
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

    詳細については、https://clickhouse.com/docs/interfaces/grpc/ を訪れてください。

8. 少なくとも1つのノードでClickHouseクライアントを構成し、`config.xml` ファイル（デフォルトは `/etc/clickhouse-client/`）で接続にSSLを使用させます:
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

9. MySQLおよびPostgreSQLのデフォルトエミュレーションポートを無効にします:
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```

## 6. テスト {#6-testing}
1. すべてのノードを1つずつ起動します:
    ```bash
    service clickhouse-server start
    ```

2. 安全なポートが起動してリッスンしているか確認し、各ノードで次のように表示されるはずです:
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

    |ClickHouseポート |説明|
    |--------|-------------|
    |8443 | httpsインターフェイス|
    |9010 | interserver httpsポート|
    |9281 | ClickHouse Keeper安全ポート|
    |9440 | 安全なNative TCPプロトコル|
    |9444 | ClickHouse Keeper Raftポート |

3. ClickHouse Keeperの健康状態を確認します
一般的な[4文字のコマンド (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands)は、TLSなしで`echo`を使用しては機能しません。ここでは、`openssl`を使用してコマンドを実行する方法を示します。
   - `openssl`でインタラクティブセッションを開始します

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

   - opensslセッション内で4LWコマンドを送信します

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

4. `--secure`フラグとSSLポートを使用してClickHouseクライアントを起動します:
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. `https` インターフェイスを通して `https://chnode1.marsnet.local:8443/play` でPlay UIにログインします。

    <img src={configuringSsl01}
      alt="SSLの設定" />

    :::note
    ブラウザは信頼されていない証明書を表示します。これは、ワークステーションからアクセスされており、クライアントマシンのルートCAストアに証明書がないためです。
    公的機関または企業CAから発行された証明書を使用する場合、信頼されていることを示すべきです。
    :::

6. 複製テーブルを作成します:
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

7. `chnode1` でいくつかの行を追加します:
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. `chnode2` で行を表示して複製を確認します:
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## まとめ {#summary}

この記事は、SSL/TLSで構成されたClickHouse環境のセットアップに焦点を当てました。本番環境での要件によって設定は異なります。たとえば、証明書の検証レベル、プロトコル、暗号などです。しかし、これで安全な接続の設定と実装に関する手順についての良い理解が得られるはずです。
