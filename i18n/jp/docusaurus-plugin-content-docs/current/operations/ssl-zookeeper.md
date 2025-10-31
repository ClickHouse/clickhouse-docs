---
'description': 'ClickHouseとZooKeeper間のセキュアなSSL/TLS通信を設定するためのガイド'
'sidebar_label': 'Zookeeperとのセキュアな通信'
'sidebar_position': 45
'slug': '/operations/ssl-zookeeper'
'title': 'ClickHouseとZookeeper間のオプションのセキュアな通信'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouseとZookeeper間のオプションの安全な通信
<SelfManaged />

ClickHouseクライアントとのSSL通信のために、`ssl.keyStore.location`、`ssl.keyStore.password`、`ssl.trustStore.location`、`ssl.trustStore.password`を指定する必要があります。これらのオプションはZookeeperバージョン3.5.2から利用可能です。

`zookeeper.crt`を信頼された証明書に追加することができます。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml`内のクライアントセクションは次のようになります:

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

クラスターとマクロを持つClickHouse設定にZookeeperを追加します:

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

`clickhouse-server`を開始します。ログには次のように表示されます:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

プレフィックス`secure://`は接続がSSLによって保護されていることを示します。

トラフィックが暗号化されていることを確認するためには、保護されたポートで`tcpdump`を実行します:

```bash
tcpdump -i any dst port 2281 -nnXS
```

そして、`clickhouse-client`でクエリを実行します:

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

暗号化されていない接続では、`tcpdump`の出力に次のようなものが表示されます:

```text
..../zookeeper/quota.
```

暗号化された接続では、これを表示してはいけません。
