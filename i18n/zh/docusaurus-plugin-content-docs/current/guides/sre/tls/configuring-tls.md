---
slug: /guides/sre/tls/configuring-tls
sidebar_label: '配置 TLS'
sidebar_position: 20
title: '配置 TLS'
description: '本指南提供一些简单且精简的配置，用于将 ClickHouse 配置为使用 OpenSSL 证书来验证连接。'
keywords: ['SSL 配置', 'TLS 设置', 'OpenSSL 证书', '安全连接', 'SRE 指南']
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';


# 配置 TLS \{#configuring-tls\}

<SelfManaged />

本指南提供了一些简单且最基本的设置，用于配置 ClickHouse 使用 OpenSSL 证书来验证连接。出于演示目的，我们将创建自签名的证书颁发机构（CA）证书和密钥，并为各节点生成证书，以便在适当的配置下建立连接。

:::note
TLS 的实现较为复杂，要确保部署的安全性和健壮性，需要综合权衡多种选项。本文仅为基础教程，展示基本的 TLS 配置示例。请咨询您的 PKI/安全团队，为贵组织生成合适的证书。

如需入门概览，可先阅读这篇[关于证书使用的基础教程](https://ubuntu.com/server/docs/security-certificates)。
:::

## 1. 创建 ClickHouse 部署 \\{#1-create-a-clickhouse-deployment\\}

本指南以 Ubuntu 20.04 为基础环境编写，并在以下主机上通过 DEB 软件包（使用 apt）安装了 ClickHouse。域名为 `marsnet.local`：

|Host |IP Address|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
请参阅[快速开始](/getting-started/install/install.mdx)以了解有关安装 ClickHouse 的更多详细说明。
:::

## 2. 创建 TLS 证书 \\{#2-create-tls-certificates\\}

:::note
本文使用自签名证书仅用于演示目的，不应在生产环境中使用。生产环境中应创建证书请求，由组织签发证书，并使用将在设置中配置的 CA 链进行验证。不过，这些步骤可用于先配置和测试相关设置，之后再替换为实际要使用的证书。
:::

1. 为新的 CA 生成将要使用的密钥：
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. 生成新的自签名 CA 证书。以下命令将创建一个新证书，该证书将使用 CA 密钥来签署其他证书：
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    将密钥和 CA 证书备份到集群之外的安全位置。在生成节点证书之后，应从集群节点中删除该密钥。
    :::

3. 验证新 CA 证书的内容：
    ```bash
    openssl x509 -in marsnet_ca.crt -text
    ```

4. 为每个节点创建证书请求（CSR）并生成密钥：
    ```bash
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode1" -addext "subjectAltName = DNS:chnode1.marsnet.local,IP:192.168.1.221" -keyout chnode1.key -out chnode1.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode2" -addext "subjectAltName = DNS:chnode2.marsnet.local,IP:192.168.1.222" -keyout chnode2.key -out chnode2.csr
    openssl req -newkey rsa:2048 -nodes -subj "/CN=chnode3" -addext "subjectAltName = DNS:chnode3.marsnet.local,IP:192.168.1.223" -keyout chnode3.key -out chnode3.csr
    ```

5. 使用 CSR 和 CA 创建新的证书与密钥对：
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. 验证证书的 subject 和 issuer：
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. 检查新证书能否通过 CA 证书验证：
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 3. 创建并配置用于存储证书和密钥的目录。 \\{#3-create-and-configure-a-directory-to-store-certificates-and-keys\\}

:::note
必须在每个节点上执行此操作。在每个主机上使用相应的证书和密钥。
:::

1. 在每个节点上 ClickHouse 可访问的目录中创建一个子目录。我们推荐使用默认配置目录（例如 `/etc/clickhouse-server`）：
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. 将 CA 证书、每个节点对应的节点证书和密钥复制到新的 certs 目录中。

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

## 4. 使用 ClickHouse Keeper 配置基础集群环境 \\{#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper\\}

在此部署环境中，每个节点上都使用以下 ClickHouse Keeper 设置。每台服务器都有自己的 `<server_id>`。（例如，节点 `chnode1` 的 `<server_id>1</server_id>`，其余节点依此类推。）

:::note
ClickHouse Keeper 推荐使用的端口为 `9281`。不过，该端口是可配置的，如果该端口已被环境中的其他应用程序占用，可以改为使用其他端口。

有关所有选项的详细说明，请访问 https://clickhouse.com/docs/operations/clickhouse-keeper/
:::

1. 在 ClickHouse 服务器的 `config.xml` 中，将以下内容添加到 `<clickhouse>` 标签内部

    :::note
    在生产环境中，建议在 `config.d` 目录中使用单独的 `.xml` 配置文件。
    更多信息参见 https://clickhouse.com/docs/operations/configuration-files/
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

2. 在所有节点上取消注释并更新 keeper 设置，并将 `<secure>` 标志设置为 1：
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

3. 在 `chnode1` 和 `chnode2` 上更新并添加以下集群设置。`chnode3` 将用于 ClickHouse Keeper 仲裁。

    :::note
    对于此配置，只配置了一个示例集群。测试样例集群必须删除或注释掉；或者如果存在正在测试的现有集群，则必须更新端口并添加 `<secure>` 选项。如果在安装过程中或在 `users.xml` 文件中将 `default` 用户配置为有密码，则必须设置 `<user>` 和 `<password>`。
    :::

    以下配置会在两台服务器上创建一个拥有 1 个分片和 2 个副本的集群（两个副本分别位于每个节点上）。
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

4. 定义宏的值，以便能够创建一个用于测试的 ReplicatedMergeTree 表。在 `chnode1` 上：
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

## 5. 在 ClickHouse 节点上配置 TLS 接口 \\{#5-configure-tls-interfaces-on-clickhouse-nodes\\}

以下设置在 ClickHouse 服务器的 `config.xml` 中进行配置。

1.  设置部署的显示名称（可选）：
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. 将 ClickHouse 设置为监听所有地址上的连接：
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 在每个节点上配置 `https` 端口并禁用 `http` 端口：
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. 在每个节点上配置 ClickHouse 原生的安全 TCP 端口并禁用默认的非加密端口：
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. 在每个节点上配置 `interserver https` 端口并禁用默认的非加密端口：
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. 使用证书和路径配置 OpenSSL

    :::note
    每个文件名和路径都必须根据正在配置的节点进行更新。
    例如，在 `chnode2` 主机上进行配置时，需要将 `<certificateFile>` 条目更新为 `chnode2.crt`。
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

    更多信息请参阅：https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-openssl

7. 在每个节点上为 gRPC 配置 TLS：
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

    更多信息请参阅：https://clickhouse.com/docs/interfaces/grpc/

8. 至少在其中一个节点上，在其自身的 `config.xml` 文件中（默认路径为 `/etc/clickhouse-client/`），配置 ClickHouse 客户端在连接时使用 TLS：
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

## 6. 测试 \{#6-testing\}

1. 依次启动所有节点：
   ```bash
   service clickhouse-server start
   ```

2. 确认安全端口已经打开并处于监听状态，每个节点上的输出应类似如下示例：

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

   | ClickHouse 端口 | 说明                        |
   | ------------- | ------------------------- |
   | 8443          | HTTPS 接口                  |
   | 9010          | 服务器间 HTTPS 端口             |
   | 9281          | ClickHouse Keeper 安全端口    |
   | 9440          | 安全的原生 TCP 协议端口            |
   | 9444          | ClickHouse Keeper Raft 端口 |

3. 验证 ClickHouse Keeper 的健康状态
   使用不带 TLS 的 `echo` 无法执行常见的 [4 letter word (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) 命令，以下示例展示了如何配合 `openssl` 使用这些命令。
   * 使用 `openssl` 启动交互式会话

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

* 在 OpenSSL 会话中发送 4LW 命令

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


4. 使用 `--secure` 参数和 TLS 端口启动 ClickHouse 客户端：
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. 通过 `https://chnode1.marsnet.local:8443/play` 使用 `https` 接口登录 Play UI。

    <Image img={configuringSsl01} alt="配置 TLS" size="md" border />

    :::note
    浏览器会显示证书不受信任，因为是从工作站访问，并且这些证书未被加入客户端机器的根 CA 信任存储中。
    当使用公共证书机构（公共 CA）或企业 CA 签发的证书时，则应显示为受信任。
    :::

6. 创建一个复制表：
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

7. 在 `chnode1` 上添加几行数据：
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. 在 `chnode2` 上查看这些行以验证复制：
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

## 摘要 \\{#summary\\}

本文重点介绍了如何在 ClickHouse 环境中配置 TLS。针对生产环境中的不同需求（例如证书验证级别、协议、密码套件等），具体配置会有所差异。但现在你应该已经对配置和实现安全连接所需的各个步骤有了清晰的理解。