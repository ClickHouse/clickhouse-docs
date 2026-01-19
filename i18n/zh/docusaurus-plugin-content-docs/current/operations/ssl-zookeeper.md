---
description: '在 ClickHouse 与 ZooKeeper 之间配置安全 SSL/TLS 通信的指南'
sidebar_label: '与 ZooKeeper 的安全通信'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'ClickHouse 与 ZooKeeper 之间可选的安全通信'
doc_type: 'guide'
---

# 可选的 ClickHouse 与 Zookeeper 之间的安全通信 \{#optional-secured-communication-between-clickhouse-and-zookeeper\}

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

你需要在通过 SSL 与 ClickHouse 客户端通信时指定 `ssl.keyStore.location`、`ssl.keyStore.password` 以及 `ssl.trustStore.location`、`ssl.trustStore.password`。这些选项从 Zookeeper 3.5.2 版本开始可用。

你可以将 `zookeeper.crt` 添加到受信任证书列表中。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml` 中的 client 配置段如下所示：`

```xml
<client>
    <certificateFile>/etc/clickhouse-server/client.crt</certificateFile>
    <privateKeyFile>/etc/clickhouse-server/client.key</privateKeyFile>
    <loadDefaultCAFile>true</loadDefaultCAFile>
    <cacheSessions>true</cacheSessions>
    <disableProtocols>sslv2,sslv3</disableProtocols>
    <preferServerCiphers>true</preferServerCiphers>
    <invalidCertificateHandler>
        <name>RejectCertificateHandler</name>
    </invalidCertificateHandler>
</client>
```

在 ClickHouse 配置中添加 Zookeeper，并配置相应的集群和宏：

```xml
<clickhouse>
    <zookeeper>
        <node>
            <host>localhost</host>
            <port>2281</port>
            <secure>1</secure>
        </node>
    </zookeeper>
</clickhouse>
```

启动 `clickhouse-server`。在日志中应看到：

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

前缀 `secure://` 表示连接已通过 SSL 加密保护。

要验证流量已加密，可在该安全端口上运行 `tcpdump`：

```bash
tcpdump -i any dst port 2281 -nnXS
```

然后在 `clickhouse-client` 中执行查询：

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

在未加密的连接中，可以在 `tcpdump` 的输出中看到类似如下的内容：

```text
..../zookeeper/quota.
```

在加密连接下，你不应该看到此内容。
