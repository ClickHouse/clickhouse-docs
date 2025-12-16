---
description: 'ClickHouse と ZooKeeper 間の安全な SSL/TLS 通信を構成するためのガイド'
sidebar_label: 'ZooKeeper とのセキュア通信'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'ClickHouse と ZooKeeper 間のセキュア通信（オプション）'
doc_type: 'guide'
---

# ClickHouse と Zookeeper 間のオプションのセキュア通信 {#optional-secured-communication-between-clickhouse-and-zookeeper}

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse クライアントとの SSL 経由の通信のために、`ssl.keyStore.location`、`ssl.keyStore.password` および `ssl.trustStore.location`、`ssl.trustStore.password` を指定する必要があります。これらのオプションは Zookeeper バージョン 3.5.2 以降で利用可能です。

`zookeeper.crt` を信頼済み証明書に追加できます。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml` の client セクションは次のようになります：

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

クラスタ定義とマクロを含めて、ClickHouse の設定に Zookeeper を追加します:

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

`clickhouse-server` を起動します。ログに次のような出力が表示されるはずです：

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

`secure://` プレフィックスは、接続が SSL によって保護されていることを示します。

トラフィックが暗号化されていることを確認するには、セキュアなポート上で `tcpdump` を実行します。

```bash
tcpdump -i any dst port 2281 -nnXS
```

次に、`clickhouse-client` でクエリを実行します:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

暗号化されていない接続の場合、`tcpdump` の出力は次のようになります。

```text
..../zookeeper/quota.
```

暗号化された接続の場合、これは表示されないはずです。
