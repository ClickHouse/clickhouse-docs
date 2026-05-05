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

<VerticalStepper headerLevel="h2">

## 创建 ClickHouse 部署 \{#1-create-a-clickhouse-deployment\}

本指南基于 Ubuntu 20.04 编写，ClickHouse 通过 DEB 软件包（使用 apt）安装在以下主机上。域名为 `marsnet.local`：

|Host |IP Address|
|--------|-------------|
|`chnode1` |192.168.1.221|
|`chnode2` |192.168.1.222|
|`chnode3` |192.168.1.223|

:::note
请参阅 [Quick Start](/getting-started/install/install.mdx) 了解有关如何安装 ClickHouse 的更多详细信息。
:::

## 创建 TLS 证书 \{#2-create-tls-certificates\}
:::note
使用自签名证书仅用于演示目的，不应在生产环境中使用。应创建证书请求，并由组织签名，同时使用将在设置中配置的 CA 链进行验证。不过，这些步骤可用于配置和测试设置，之后再替换为实际要使用的证书。
:::

1. 生成一个将用于新 CA 的密钥：
    ```bash
    openssl genrsa -out marsnet_ca.key 2048
    ```

2. 生成一个新的自签名 CA 证书。以下命令将创建一个新证书，该证书将使用 CA 密钥对其他证书进行签名：
    ```bash
    openssl req -x509 -subj "/CN=marsnet.local CA" -nodes -key marsnet_ca.key -days 1095 -out marsnet_ca.crt
    ```

    :::note
    将密钥和 CA 证书备份到集群外的安全位置。生成节点证书后，应从集群节点中删除该密钥。
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

5. 使用 CSR 和 CA 创建新的证书和密钥对：
    ```bash
    openssl x509 -req -in chnode1.csr -out chnode1.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode2.csr -out chnode2.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    openssl x509 -req -in chnode3.csr -out chnode3.crt -CA marsnet_ca.crt -CAkey marsnet_ca.key -days 365 -copy_extensions copy
    ```

6. 验证证书的 subject 和 issuer：
    ```bash
    openssl x509 -in chnode1.crt -text -noout
    ```

7. 检查新证书是否可通过 CA 证书验证：
    ```bash
    openssl verify -CAfile marsnet_ca.crt chnode1.crt
    chnode1.crt: OK
    ```

## 创建并配置用于存储证书和密钥的目录。 \{#3-create-and-configure-a-directory-to-store-certificates-and-keys\}

:::note
这必须在每个节点上完成。请在每台主机上使用相应的证书和密钥。
:::

1. 在每个节点上，于 ClickHouse 可访问的目录中创建一个文件夹。我们建议使用默认配置目录（例如 `/etc/clickhouse-server`）：
    ```bash
    mkdir /etc/clickhouse-server/certs
    ```

2. 将 CA 证书、节点证书以及与每个节点对应的密钥复制到新的 certs 目录中。

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

## 使用 ClickHouse Keeper 配置包含基础集群的环境 \{#4-configure-the-environment-with-basic-clusters-using-clickhouse-keeper\}

对于此部署环境，每个节点都使用以下 ClickHouse Keeper 设置。每台服务器都会有自己的 `<server_id>`。（例如，节点 `chnode1` 使用 `<server_id>1</server_id>`，依此类推。）

:::note
ClickHouse Keeper 的推荐端口是 `9281`。不过，该端口是可配置的；如果此端口在该环境中已被其他应用程序占用，则可以设置为其他端口。

有关所有选项的完整说明，请访问 https://clickhouse.com/docs/operations/clickhouse-keeper/
:::

1. 在 ClickHouse 服务器 `config.xml` 的 `<clickhouse>` 标签内添加以下内容

    :::note
    对于生产环境，建议在 `config.d` 目录中使用单独的 `.xml` 配置文件。
    有关更多信息，请访问 https://clickhouse.com/docs/operations/configuration-files/
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

    :::note
    当 ClickHouse Keeper 嵌入在 ClickHouse 服务器中时（如上所示），Keeper 使用在 [Configure TLS interfaces on ClickHouse nodes](#5-configure-tls-interfaces-on-clickhouse-nodes) 的 OpenSSL 部分中定义的服务器 OpenSSL 配置。如果您将 ClickHouse Keeper 作为独立进程运行，则必须在 Keeper 配置文件中添加一个 `<openSSL>` 部分，并使用相同的 CA 证书以及节点证书/密钥设置。有关详细信息，请参阅下方的 [Configure OpenSSL for standalone ClickHouse Keeper](#configure-openssl-for-standalone-clickhouse-keeper)。
    :::

2. 取消所有节点上的 keeper 设置注释并进行更新，然后将 `<secure>` 标志设置为 1：
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

3. 在 `chnode1` 和 `chnode2` 上更新并添加以下集群设置。`chnode3` 将用于 ClickHouse Keeper 法定人数。

    :::note
    对于此配置，只配置了一个示例集群。测试示例集群必须删除或注释掉；或者如果存在一个正在测试的现有集群，则必须更新端口并添加 `<secure>` 选项。如果在安装期间或在 `users.xml` 文件中，最初已将 `default` 用户配置为带有密码，则必须设置 `<user` 和 `<password>`。
    :::

    以下将创建一个包含一个分片、两个服务器副本的集群（每个节点上一个）。
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

4. 定义宏值，以便创建一个 `ReplicatedMergeTree` 表用于测试。在 `chnode1` 上：
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

## 在 ClickHouse 节点上配置 TLS 接口 \{#5-configure-tls-interfaces-on-clickhouse-nodes\}
以下设置在 ClickHouse 服务器的 `config.xml` 中配置

1.  为部署设置显示名称（可选）：
    ```xml
    <display_name>clickhouse</display_name>
    ```

2. 将 ClickHouse 设置为监听外部端口：
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 在每个节点上配置 `https` 端口并禁用 `http` 端口：
    ```xml
    <https_port>8443</https_port>
    <!--<http_port>8123</http_port>-->
    ```

4. 在每个节点上配置 ClickHouse Native 安全 TCP 端口，并禁用默认的非安全端口：
    ```xml
    <tcp_port_secure>9440</tcp_port_secure>
    <!--<tcp_port>9000</tcp_port>-->
    ```

5. 在每个节点上配置 `interserver https` 端口，并禁用默认的非安全端口：
    ```xml
    <interserver_https_port>9010</interserver_https_port>
    <!--<interserver_http_port>9009</interserver_http_port>-->
    ```

6. 使用证书和路径配置 OpenSSL

    :::note
    每个文件名和路径都必须更新为与其配置所在的节点匹配。
    例如，在 `chnode2` 主机上配置时，将 `<certificateFile>` 条目更新为 `chnode2.crt`。
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

    有关更多信息，请访问 https://clickhouse.com/docs/interfaces/grpc/

8. 在至少一个节点上配置 ClickHouse 客户端，使其在自身的 `config.xml` 文件中使用 TLS 进行连接（默认位于 `/etc/clickhouse-client/`）：
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

6. 禁用默认的 MySQL 和 PostgreSQL 模拟端口：
    ```xml
    <!--mysql_port>9004</mysql_port-->
    <!--postgresql_port>9005</postgresql_port-->
    ```

## 测试 \{#6-testing\}
1. 逐个启动所有节点：
    ```bash
    service clickhouse-server start
    ```

2. 验证安全端口已启动并处于监听状态，每个节点上的结果应与以下示例类似：
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

    |ClickHouse Port |Description|
    |--------|-------------|
    |8443 | https 接口|
    |9010 | interserver https 端口|
    |9281 | ClickHouse Keeper 安全端口|
    |9440 | 安全 Native TCP 协议|
    |9444 | ClickHouse Keeper Raft 端口 |

3. 验证 ClickHouse Keeper 健康状况
The typical [4 letter word (4lW)](/guides/sre/keeper/index.md#four-letter-word-commands) 命令在不使用 TLS 的情况下无法通过 `echo` 使用，以下介绍如何结合 `openssl` 使用这些命令。
   - 启动一个 `openssl` 交互式会话

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

- 在 OpenSSL 会话中发送 4LW 命令

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

4. 使用 `--secure` 标志和 TLS 端口启动 ClickHouse 客户端：
    ```bash
    root@chnode1:/etc/clickhouse-server# clickhouse-client --user default --password ClickHouse123! --port 9440 --secure --host chnode1.marsnet.local
    ClickHouse client version 22.3.3.44 (official build).
    Connecting to chnode1.marsnet.local:9440 as user default.
    Connected to ClickHouse server version 22.3.3 revision 54455.

    clickhouse :)
    ```

5. 使用位于 `https://chnode1.marsnet.local:8443/play` 的 `https` 接口登录 Play UI。

    <Image img={configuringSsl01} alt="配置 TLS" size="md" border />

    :::note
    浏览器会显示不受信任的证书，因为这是从工作站访问的，而这些证书不在客户端计算机的根 CA 存储中。
    使用由公共机构或企业 CA 签发的证书时，应显示为受信任。
    :::

6. 创建复制表：
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

7. 在 `chnode1` 上添加几行：
    ```sql
    INSERT INTO repl_table
    (id, column1, column2)
    VALUES
    (1,'2022-04-01','abc'),
    (2,'2022-04-02','def');
    ```

8. 通过查看 `chnode2` 上的行来验证复制：
    ```sql
    SELECT * FROM repl_table
    ```

    ```response
    ┌─id─┬────column1─┬─column2─┐
    │  1 │ 2022-04-01 │ abc     │
    │  2 │ 2022-04-02 │ def     │
    └────┴────────────┴─────────┘
    ```

</VerticalStepper>

## 为独立运行的 ClickHouse Keeper 配置 OpenSSL \{#configure-openssl-for-standalone-clickhouse-keeper\}

当 ClickHouse Keeper 作为独立进程运行时 (而不是嵌入在 ClickHouse 服务器中) ，必须在 Keeper 配置文件中单独配置 OpenSSL 证书和相关设置。否则，Keeper 将无法为客户端通信 (`tcp_port_secure`) 或 Keeper 节点之间的 Raft 复制建立安全连接。

在每个节点的独立 ClickHouse Keeper 配置文件中添加以下 `<openSSL>` 部分：

:::note
必须将每个文件名更新为与当前配置的节点相匹配。
例如，在 `chnode2` 主机上进行配置时，将 `<certificateFile>` 条目更新为 `chnode2.crt`。
:::

```xml
<openSSL>
    <server>
        <certificateFile>/etc/clickhouse-keeper/certs/chnode1.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-keeper/certs/chnode1.key</privateKeyFile>
        <verificationMode>relaxed</verificationMode>
        <caConfig>/etc/clickhouse-keeper/certs/marsnet_ca.crt</caConfig>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>false</loadDefaultCAFile>
        <caConfig>/etc/clickhouse-keeper/certs/marsnet_ca.crt</caConfig>
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

`<server>` 部分用于安全的 Keeper 端口 (`tcp_port_secure`) 上的入站客户端连接。`<client>` 部分用于 Raft 复制期间 Keeper 节点之间的出站连接。

:::note
上述证书路径使用 `/etc/clickhouse-keeper/certs/`，这是独立部署 Keeper 时的典型路径。如果你通过其他路径安装了 Keeper，请相应调整。证书本身与[步骤 2](#2-create-tls-certificates)中创建的证书相同。
:::


## 摘要 \{#summary\}

本文重点介绍了如何在 ClickHouse 环境中配置 TLS。针对生产环境中的不同需求（例如证书验证级别、协议、密码套件等），具体配置会有所差异。但现在你应该已经对配置和实现安全连接所需的各个步骤有了清晰的理解。