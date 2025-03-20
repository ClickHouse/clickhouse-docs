---
sidebar_label: IPフィルターの設定
slug: /cloud/security/setting-ip-filters
title: IPフィルターの設定
---

import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## IPフィルターの設定 {#setting-ip-filters}

IPアクセスリストは、どのソースアドレスがあなたのClickHouseサービスに接続することを許可されているかを指定することで、あなたのClickHouseサービスへのトラフィックをフィルタリングします。リストは各サービスに対して設定可能です。リストはサービスのデプロイ時、またはその後に設定できます。プロビジョニング中にIPアクセスリストを設定しなかった場合、または初期リストを変更したい場合は、サービスを選択した後に**Security**タブを選択することで変更を行うことができます。

:::important
ClickHouse CloudサービスのIPアクセスリストの作成をスキップすると、そのサービスへのトラフィックは許可されません。
:::

## 準備 {#prepare}
始める前に、アクセスリストに追加すべきIPアドレスまたは範囲を収集してください。リモートワーカー、オンコールの場所、VPNなどを考慮に入れてください。IPアクセスリストのユーザーインターフェースは、個々のアドレスとCIDR表記を受け付けます。

クラスレス・インターネット間ルーティング (CIDR) 表記では、従来のクラスA、B、またはC（8、6、または24）サブネットマスクサイズよりも小さいIPアドレス範囲を指定することができます。 [ARIN](https://account.arin.net/public/cidrCalculator) や他のいくつかの組織がCIDR電卓を提供しているので、必要であれば利用してください。また、CIDR表記に関する詳しい情報は、[クラスレス・インターネット間ルーティング (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFCを参照してください。

## IPアクセスリストの作成または変更 {#create-or-modify-an-ip-access-list}

ClickHouse Cloudサービスのリストからサービスを選択し、次に**Settings**を選択します。**Security**セクションの下に、IPアクセスリストがあります。*あなたはこのサービスに接続できます* **(どこからでも | x 特定の場所から)** と書かれたハイパーリンクをクリックします。

構成のオプションとして以下が表示されます：

- サービスへのすべての場所からの受信トラフィックを許可
- サービスへの特定の場所からのアクセスを許可
- サービスへのすべてのアクセスを拒否

このスクリーンショットは、"NY Office range"として説明されたIPアドレス範囲からのトラフィックを許可するアクセスリストを示しています：

<img src={ip_filtering_after_provisioning} alt="ClickHouse Cloudでの既存のアクセスリスト" />

### 可能なアクション {#possible-actions}

1. 追加エントリを追加するには、**+ Add new IP**を使用できます。

  この例は、`London server`という説明とともに単一のIPアドレスを追加します：

<img src={ip_filter_add_single_ip} alt="ClickHouse Cloudでのアクセスリストに単一のIPを追加" />

2. 既存のエントリを削除

  クロス（x）をクリックすると、エントリを削除できます。

3. 既存のエントリを編集

  エントリを直接修正します。

4. **Anywhere**からのアクセスを許可に切り替え

  これは推奨されませんが、許可されています。私たちは、ClickHouse上に構築されたアプリケーションを公開し、バックエンドのClickHouse Cloudサービスへのアクセスを制限することを推奨します。

変更を適用するには、**Save**をクリックする必要があります。

## 検証 {#verification}

フィルターを作成したら、範囲内からの接続の確認を行い、許可された範囲外からの接続が拒否されることを確認してください。シンプルな`curl`コマンドを使用して確認できます：
```bash title="許可リスト外からの接続試行"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
または
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="許可リスト内からの接続試行"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## 制限事項 {#limitations}

- 現在、IPアクセスリストはIPv4のみをサポートしています。
