---
slug: '/guides/sre/configuring-ssl'
sidebar_label: '配置 SSL-TLS'
sidebar_position: 20
---
import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';


# 配置 SSL-TLS

<SelfManaged />

本指南提供了简单且最小的设置，以配置 ClickHouse 使用 OpenSSL 证书来验证连接。在本演示中，创建了自签名的证书授权 (CA) 证书和密钥，并使用节点证书进行连接，并设置了适当的配置。

:::note
TLS 实现是复杂的，必须考虑许多选项以确保完全安全和稳健的部署。这是一个基本教程，包含基本的 SSL/TLS 配置示例。请咨询您的 PKI/安全团队，以生成适合您组织的正确证书。

查看这个 [关于证书使用的基础教程](https://ubuntu.com/server/docs/security-certificates)，以获取入门概述。
:::

## 1. 创建 ClickHouse 部署 {#1-create-a-clickhouse-deployment}

本指南是在 Ubuntu 20.04 下编写的，ClickHouse 安装在使用 DEB 包（使用 apt）的以下主机上。域名为 `marsnet.local`：

|主机 |IP 地址|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|


:::note
查看 [快速入门](/getting-started/install.md) 以获取有关如何安装 ClickHouse 的更多详细信息。
:::


## 2. 创建 SSL 证书 {#2-create-ssl-certificates}
:::note
使用自签名证书仅供演示，并不应在生产中使用。证书请求应由组织创建并使用将配置在设置中的 CA 链进行验证。然而，这些步骤可以用于配置和测试设置，然后可以用实际将使用的证书替换。
:::

1. 生成将用于新 CA 的密钥：
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. 生成新的自签名 CA 证书。以下命令将创建一个新的证书，该证书将用于使用 CA 密钥签署其他证书：
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    在集群外的安全位置备份密钥和 CA 证书。在生成节点证书之后，应从集群节点中删除密钥。
    :::

3. 验证新 CA 证书的内容：
    ```bash
    openssl x509 -in marsnet_ca.crt -text
    ```

4. 为每个节点创建证书请求 (CSR) 并生成密钥：
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
    ```

5. 使用 CSR 和 CA 创建新的证书和密钥对：
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. 验证证书的主题和颁发者：
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. 检查新证书是否经过 CA 证书验证：
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. 创建和配置一个目录以存储证书和密钥。 {#3-create-and-configure-a-directory-to-store-certificates-and-keys}

:::note
这必须在每个节点上完成。在每个主机上使用适当的证书和密钥。
:::

1. 在每个节点上创建一个 ClickHouse 可以访问的目录中的文件夹。我们建议使用默认配置目录（例如 `/etc/clickhouse-server`）：
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. 将 CA 证书、节点证书和相应节点的密钥复制到新的证书目录中。

3. 更新所有者和权限，以允许 ClickHouse 读取证书：
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

## 4. 使用 ClickHouse Keeper 配置基本集群的环境 {#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper}

在该部署环境中，每个节点使用以下 ClickHouse Keeper 设置。每个服务器将具有自己的 `<server_id>`。（例如，`<server_id>1</server_id>` 用于节点 `chnode1`，依此类推。）

:::note
建议的端口是 `9281` 用于 ClickHouse Keeper。然而，如果该端口已经被环境中的其他应用程序使用，则可以配置该端口。

有关所有选项的完整说明，请访问 https://clickhouse.com/docs/operations/clickhouse-keeper/
:::


1. 在 ClickHouse 服务器的 `config.xml` 的 `<clickhouse>` 标签内添加以下内容：

    :::note
    对于生产环境，建议在 `config.d` 目录中使用单独的 `.xml` 配置文件。
    欲了解更多信息，访问 https://clickhouse.com/docs/operations/configuration-files/
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

2. 在所有节点上取消注释并更新 Keeper 设置，并将 `<secure>` 标志设置为 1：
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

3. 更新并添加以下集群设置到 `chnode1` 和 `chnode2`。`chnode3` 将用于 ClickHouse Keeper 多数。

    :::note
    对于此配置，仅配置了一个示例集群。测试样本集群必须被删除、注释掉，或者如果存在正在测试的现有集群，则必须更新端口并添加 `<secure>` 选项。如果在安装或 `users.xml` 文件中最初配置了 `default` 用户以具有密码，则必须设置 `<user>` 和 `<password>`。
    :::

    以下内容在两个服务器上创建一个带有一个分片副本的集群（每个节点一个）。
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

4. 定义宏值，以能够创建一个用于测试的 ReplicatedMergeTree 表。在 `chnode1` 上：
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
    ```

    在 `chnode2` 上：
    ```xml
    <macros>
        <shard>1</shard>
        <replica>replica_2</replica>
    </macros>
    ```

## 5. 在 ClickHouse 节点上配置 SSL-TLS 接口 {#5-configure-ssl-tls-interfaces-on-clickhouse-nodes}
以下设置在 ClickHouse 服务器的 `config.xml` 中配置

1.  设置部署的显示名称（可选）：
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. 设置 ClickHouse 监听外部端口：
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 在每个节点上配置 `https` 端口并禁用 `http` 端口：
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. 在每个节点上配置 ClickHouse 原生安全 TCP 端口并禁用默认不安全端口：
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. 在每个节点上配置 `interserver https` 端口并禁用默认不安全端口：
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. 使用证书和路径配置 OpenSSL

    :::note
    每个文件名和路径必须更新以匹配正在配置的节点。
    例如，更新 `<certificateFile>` 项为 `chnode2.crt` 当在 `chnode2` 主机上配置时。
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

    有关更多信息，请访问 https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl



7. 为每个节点配置 gRPC 的 SSL：
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

    有关更多信息，请访问 https://clickhouse.com/docs/interfaces/grpc/

8. 在至少一个节点上配置 ClickHouse 客户端以使用 SSL 进行连接，在其自己的 `config.xml` 文件中（默认在 `/etc/clickhouse-client/`）：
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

6. 禁用 MySQL 和 PostgreSQL 的默认仿真端口：
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```

## 6. 测试 {#6-testing}
1. 启动所有节点，一次一个：
    ```bash
    service clickhouse-server start
    ```

2. 验证安全端口是否已启动并在监听，应该在每个节点上看起来类似于此示例：
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

    |ClickHouse 端口 |描述|
    |--------|-------------|
    |8443 | https 接口|
    |9010 | interserver https 端口|
    |9281 | ClickHouse Keeper 安全端口|
    |9440 | 安全原生 TCP 协议|
    |9444 | ClickHouse Keeper Raft 端口 |

3. 验证 ClickHouse Keeper 健康状态
典型的 [四字命令 (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) 命令在没有 TLS 的情况下使用 `echo` 将无法工作，以下是如何使用 `openssl` 来使用这些命令。
   - 使用 `openssl` 启动交互式会话

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

   - 在 openssl 会话中发送 4LW 命令

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

4. 使用 `--secure` 标志和 SSL 端口启动 ClickHouse 客户端：
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. 使用 `https` 接口登录 Play UI，地址为 `https://chnode1.marsnet.local:8443/play`。

    <img src={configuringSsl01}
      alt="配置 SSL" />

    :::note
    浏览器将显示一个不受信任的证书，因为它是从工作站访问的，并且证书不在客户端机器的根 CA 存储中。
    当使用由公共机构或企业 CA 颁发的证书时，应该显示为受信任的。
    :::

6. 创建一个副本表：
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

7. 在 `chnode1` 上插入几行：
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. 通过在 `chnode2` 上查看行来验证复制：
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## 总结 {#summary}

本文重点介绍了如何配置具有 SSL/TLS 的 ClickHouse 环境。对于生产环境的不同要求，设置可能会有所不同；例如，证书验证级别、协议、密码等。但是您现在应该对配置和实施安全连接的步骤有一个清晰的理解。
