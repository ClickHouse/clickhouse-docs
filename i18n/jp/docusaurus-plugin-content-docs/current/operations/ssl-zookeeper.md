---
'description': 'Guide to configuring secure SSL/TLS communication between ClickHouse
  and ZooKeeper'
'sidebar_label': 'Secured Communication with Zookeeper'
'sidebar_position': 45
'slug': '/operations/ssl-zookeeper'
'title': 'Optional secured communication between ClickHouse and Zookeeper'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse と Zookeeper の間のオプションの安全な通信
<SelfManaged />

ClickHouse クライアントとの SSL 通信のために、`ssl.keyStore.location`、`ssl.keyStore.password`、`ssl.trustStore.location`、`ssl.trustStore.password` を指定する必要があります。これらのオプションは Zookeeper バージョン 3.5.2 以降で使用可能です。

信頼された証明書に `zookeeper.crt` を追加できます。

```bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml` のクライアントセクションは次のようになります。

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

いくつかのクラスターとマクロを使用して、ClickHouse の設定に Zookeeper を追加します。

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

`clickhouse-server` を起動します。ログには次のように表示されるはずです。

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

接続が SSL によって保護されていることを示すには、接頭辞 `secure://` が表示されます。

トラフィックが暗号化されていることを確認するには、保護されたポートで `tcpdump` を実行します。

```bash
tcpdump -i any dst port 2281 -nnXS
```

そして、`clickhouse-client` でクエリを実行します。

```sql
SELECT * FROM system.zookeeper WHERE path = '/';
```

暗号化されていない接続では、`tcpdump` の出力に次のようなものが表示されます。

```text
..../zookeeper/quota.
```

暗号化された接続では、これが表示されないはずです。
