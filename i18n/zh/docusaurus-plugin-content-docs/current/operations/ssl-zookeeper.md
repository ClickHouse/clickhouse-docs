slug: /operations/ssl-zookeeper
sidebar_position: 45
sidebar_label: 与 Zookeeper 的安全通信
keywords: ['ClickHouse', 'Zookeeper', 'SSL', '安全通信']
description: '关于 ClickHouse 与 Zookeeper 之间的可选安全通信的说明。'
```


# 与 Zookeeper 的可选安全通信
import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

您需要为与 ClickHouse 客户端通过 SSL 进行通信指定 `ssl.keyStore.location`、`ssl.keyStore.password` 和 `ssl.trustStore.location`、`ssl.trustStore.password`。这些选项可从 Zookeeper 版本 3.5.2 开始使用。

您可以将 `zookeeper.crt` 添加到受信任的证书中。

``` bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

在 `config.xml` 中的客户端部分将如下所示：

``` xml
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

将 Zookeeper 添加到 ClickHouse 配置中，并包含一些集群和宏：

``` xml
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

启动 `clickhouse-server`。在日志中您应该看到：

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

前缀 `secure://` 表示连接通过 SSL 进行安全保护。

为了确保流量被加密，可以在安全端口上运行 `tcpdump`：

```bash
tcpdump -i any dst port 2281 -nnXS
```

并在 `clickhouse-client` 中查询：

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

在未加密连接的情况下，您将在 `tcpdump` 输出中看到类似如下内容：

```text
..../zookeeper/quota.
```

在加密连接中，您不应该看到这些内容。
