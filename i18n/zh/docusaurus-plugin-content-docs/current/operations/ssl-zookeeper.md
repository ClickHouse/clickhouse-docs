---
'description': '配置 ClickHouse 和 ZooKeeper 之间安全的 SSL/TLS 通信的指南'
'sidebar_label': '与 Zookeeper 的安全通信'
'sidebar_position': 45
'slug': '/operations/ssl-zookeeper'
'title': '与 Zookeeper 的可选安全通信'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# 可选的 ClickHouse 与 Zookeeper 之间的安全通信
<SelfManaged />

您应该为通过 SSL 与 ClickHouse 客户端的通信指定 `ssl.keyStore.location`、`ssl.keyStore.password` 以及 `ssl.trustStore.location`、`ssl.trustStore.password`。这些选项在 Zookeeper 版本 3.5.2 中可用。

您可以将 `zookeeper.crt` 添加到受信任的证书中。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml` 中的客户端部分看起来如下：

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

将 Zookeeper 添加到 ClickHouse 配置中，并指定某个集群和宏：

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

启动 `clickhouse-server`。在日志中您应该会看到：

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

前缀 `secure://` 表示连接是通过 SSL 进行安全的。

为了确保流量被加密，请在安全端口上运行 `tcpdump`：

```bash
tcpdump -i any dst port 2281 -nnXS
```

并在 `clickhouse-client` 中执行查询：

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

在未加密的连接中，您将在 `tcpdump` 输出中看到类似这样的内容：

```text
..../zookeeper/quota.
```

在加密的连接中，您不应该看到这些内容。
