---
description: 'ClickHouse と ZooKeeper 間の安全な SSL/TLS 通信を構成するためのガイド'
sidebar_label: 'ZooKeeper とのセキュア通信'
sidebar_position: 45
slug: /operations/ssl-zookeeper
title: 'ClickHouse と ZooKeeper 間のオプションのセキュア通信'
doc_type: 'guide'
---

# ClickHouse と ZooKeeper 間のセキュア通信（オプション）

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

SSL 経由で ClickHouse クライアントと通信するには、`ssl.keyStore.location`、`ssl.keyStore.password`、`ssl.trustStore.location`、`ssl.trustStore.password` を指定する必要があります。これらのオプションは ZooKeeper バージョン 3.5.2 以降で利用可能です。

`zookeeper.crt` を信頼済み証明書ストアに追加できます。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml` の client セクションは次のようになります。

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

いくつかのクラスタ設定やマクロとあわせて、Zookeeper を ClickHouse の設定に追加します：

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

`clickhouse-server` を起動します。ログに次のようなメッセージが出力されているはずです:

```text
<Trace> ZooKeeper: 初期化済み、ホスト: secure://localhost:2281
```

`secure://` プレフィックスは、接続が SSL によって保護されていることを示します。

トラフィックが暗号化されていることを確認するには、セキュアなポートで `tcpdump` を実行します。

```bash
tcpdump -i any dst port 2281 -nnXS
```

次に、`clickhouse-client` でクエリを実行します:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

暗号化されていない接続の場合、`tcpdump` の出力には次のようなものが表示されます。

```text
..../zookeeper/quota.
```

暗号化された接続の場合、これは表示されないはずです。
