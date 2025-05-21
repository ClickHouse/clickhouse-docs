---
'description': 'Guide to configuring secure SSL/TLS communication between ClickHouse
  and ZooKeeper'
'sidebar_label': 'Secured Communication with Zookeeper'
'sidebar_position': 45
'slug': '/operations/ssl-zookeeper'
'title': 'Optional secured communication between ClickHouse and Zookeeper'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';


# 可选的 ClickHouse 和 Zookeeper 之间的安全通信
<SelfManaged />

您应该为通过 SSL 与 ClickHouse 客户端的通信指定 `ssl.keyStore.location`、`ssl.keyStore.password` 和 `ssl.trustStore.location`、`ssl.trustStore.password`。这些选项从 Zookeeper 版本 3.5.2 开始可用。

您可以将 `zookeeper.crt` 添加到受信任的证书中。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml` 中的客户端部分应如下所示：

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

使用一些集群和宏将 Zookeeper 添加到 ClickHouse 配置中：

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

启动 `clickhouse-server`。在日志中，您应该看到：

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

前缀 `secure://` 表示连接是通过 SSL 进行安全保护的。

为了确保流量被加密，请在安全端口上运行 `tcpdump`：

```bash
tcpdump -i any dst port 2281 -nnXS
```

并在 `clickhouse-client` 中查询：

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

在未加密连接中，您将在 `tcpdump` 输出中看到类似如下内容：

```text
..../zookeeper/quota.
```

在加密连接中，您不应看到这些内容。
