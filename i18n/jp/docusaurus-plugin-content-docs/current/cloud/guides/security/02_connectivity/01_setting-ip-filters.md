---
sidebar_label: 'IP フィルターの設定'
slug: /cloud/security/setting-ip-filters
title: 'IP フィルターの設定'
description: 'このページでは、ClickHouse Cloud で ClickHouse サービスへのアクセスを制御するための IP フィルターの設定方法について説明します。'
doc_type: 'guide'
keywords: ['IP フィルター', 'IP アクセスリスト']
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';


## IPフィルターの設定 {#setting-ip-filters}

IPアクセスリストは、接続を許可する送信元アドレスを指定することで、ClickHouseサービスまたはAPIキーへのトラフィックをフィルタリングします。これらのリストは、サービスごと、APIキーごとに設定可能です。リストは、サービスまたはAPIキーの作成時、または作成後に設定できます。

:::important
ClickHouse CloudサービスのIPアクセスリストの作成を省略した場合、サービスへのトラフィックは一切許可されません。ClickHouseサービスのIPアクセスリストを`Allow from anywhere`に設定している場合、パブリックIPを探索するインターネットクローラーやスキャナーによって、サービスが定期的にアイドル状態からアクティブ状態に移行される可能性があり、わずかな予期しないコストが発生する場合があります。
:::


## 準備 {#prepare}

開始する前に、アクセスリストに追加するIPアドレスまたはアドレス範囲を収集してください。リモートワーカー、オンコール拠点、VPNなどを考慮してください。IPアクセスリストのユーザーインターフェースは、個別のアドレスとCIDR表記に対応しています。

Classless Inter-domain Routing (CIDR)表記を使用すると、従来のクラスA、B、またはC(8、16、または24ビット)のサブネットマスクサイズよりも小さいIPアドレス範囲を指定できます。必要に応じて、[ARIN](https://account.arin.net/public/cidrCalculator)や他のいくつかの組織がCIDR計算ツールを提供しています。CIDR表記の詳細については、[Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFCを参照してください。


## IPアクセスリストの作成または変更 {#create-or-modify-an-ip-access-list}

:::note PrivateLink外部からの接続にのみ適用
IPアクセスリストは、[PrivateLink](/cloud/security/connectivity/private-networking)外部のパブリックインターネットからの接続にのみ適用されます。
PrivateLinkからのトラフィックのみを許可する場合は、IP許可リストに`DenyAll`を設定してください。
:::

<details>
  <summary>ClickHouseサービスのIPアクセスリスト</summary>

ClickHouseサービスを作成する際、IP許可リストのデフォルト設定は「どこからも許可しない」です。

ClickHouse Cloudサービスリストからサービスを選択し、**Settings**を選択します。**Security**セクションにIPアクセスリストがあります。Add IPsボタンをクリックしてください。

サイドバーが表示され、以下の設定オプションが利用できます:

- あらゆる場所からサービスへの受信トラフィックを許可
- 特定の場所からサービスへのアクセスを許可
- サービスへのすべてのアクセスを拒否

</details>
<details>
  <summary>APIキーのIPアクセスリスト</summary>

APIキーを作成する際、IP許可リストのデフォルト設定は「どこからでも許可」です。

APIキーリストから、**Actions**列のAPIキーの横にある3つのドットをクリックし、**Edit**を選択します。画面下部にIPアクセスリストと以下の設定オプションがあります:

- あらゆる場所からサービスへの受信トラフィックを許可
- 特定の場所からサービスへのアクセスを許可
- サービスへのすべてのアクセスを拒否

</details>

このスクリーンショットは、「NY Office range」と記述されたIPアドレス範囲からのトラフィックを許可するアクセスリストを示しています:

<Image
  img={ip_filtering_after_provisioning}
  size='md'
  alt='ClickHouse Cloudの既存のアクセスリスト'
  border
/>

### 実行可能なアクション {#possible-actions}

1. エントリを追加するには、**+ Add new IP**を使用します

この例では、`London server`という説明を付けて単一のIPアドレスを追加しています:

<Image
  img={ip_filter_add_single_ip}
  size='md'
  alt='ClickHouse Cloudのアクセスリストへの単一IPの追加'
  border
/>

2. 既存のエントリを削除

バツ印(x)をクリックするとエントリが削除されます

3. 既存のエントリを編集

エントリを直接変更します

4. **Anywhere**からのアクセスを許可するように切り替え

これは推奨されませんが、許可されています。ClickHouse上に構築されたアプリケーションを公開し、バックエンドのClickHouse Cloudサービスへのアクセスを制限することを推奨します。

変更を適用するには、**Save**をクリックする必要があります。


## 検証 {#verification}

フィルタを作成したら、指定した範囲内からサービスへの接続が可能であることを確認し、許可された範囲外からの接続が拒否されることを確認します。簡単な`curl`コマンドで検証できます:

```bash title="許可リスト外からの試行は拒否される"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```

または

```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="許可リスト内からの試行は許可される"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```

```response
Ok.
```


## 制限事項 {#limitations}

- 現在、IPアクセスリストはIPv4のみに対応しています
