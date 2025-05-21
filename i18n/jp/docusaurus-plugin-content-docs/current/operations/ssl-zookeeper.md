---
description: 'ClickHouseとZooKeeper間の安全なSSL/TLS通信を設定するためのガイド'
sidebar_label: 'Zookeeperとの安全な通信'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'ClickHouseとZookeeper間のオプションとしての安全な通信'
---


# ClickHouseとZookeeper間のオプションとしての安全な通信
import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouseクライアントとのSSLを介した通信には、`ssl.keyStore.location`、`ssl.keyStore.password`、`ssl.trustStore.location`、`ssl.trustStore.password`を指定する必要があります。これらのオプションはZookeeperバージョン3.5.2から利用可能です。

`zookeeper.crt`を信頼された証明書に追加できます。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml`のクライアントセクションは次のようになります:

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

ClickHouse設定にZookeeperをクラスタとマクロで追加します:

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

`clickhouse-server`を開始します。ログには次のように表示されるはずです:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

`secure://`プレフィックスは、接続がSSLで保護されていることを示しています。

トラフィックが暗号化されていることを確認するには、セキュアなポートで`tcpdump`を実行します:

```bash
tcpdump -i any dst port 2281 -nnXS
```

そして、`clickhouse-client`でクエリを実行します:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

暗号化されていない接続では、`tcpdump`の出力に次のような内容が表示されます:

```text
..../zookeeper/quota.
```

暗号化された接続ではこれを見ることはできません。
