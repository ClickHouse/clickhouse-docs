---
slug: /operations/ssl-zookeeper
sidebar_position: 45
sidebar_label: Zookeeperとのセキュアな通信
---

# ClickHouseとZookeeper間のオプションのセキュアな通信
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouseクライアントとのSSLを介した通信のために、`ssl.keyStore.location`、`ssl.keyStore.password`、`ssl.trustStore.location`、`ssl.trustStore.password`を指定する必要があります。これらのオプションはZookeeperバージョン3.5.2から利用可能です。

`zookeeper.crt`を信頼できる証明書に追加できます。

``` bash
sudo cp zookeeper.crt /usr/local/share/ca-certificates/zookeeper.crt
sudo update-ca-certificates
```

`config.xml`のクライアントセクションは以下のようになります:

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

いくつかのクラスターとマクロを持つClickHouseの設定にZookeeperを追加します:

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

`clickhouse-server`を起動します。ログに次のように表示されるはずです:

```text
<Trace> ZooKeeper: initialized, hosts: secure://localhost:2281
```

接続がSSLで保護されていることを示す`secure://`のプレフィックスがあります。

トラフィックが暗号化されていることを確認するには、セキュアなポートで`tcpdump`を実行します:

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

暗号化された接続では、これを見ることはできません。
