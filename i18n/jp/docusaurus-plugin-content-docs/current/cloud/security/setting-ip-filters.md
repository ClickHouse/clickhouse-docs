---
sidebar_label: 'IPフィルターの設定'
slug: /cloud/security/setting-ip-filters
title: 'IPフィルターの設定'
description: 'このページでは、ClickHouse CloudでIPフィルターを設定して、ClickHouseサービスへのアクセスを制御する方法を説明します。'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## IPフィルターの設定 {#setting-ip-filters}

IPアクセスリストは、接続を許可するソースアドレスを指定することで、あなたのClickHouseサービスへのトラフィックをフィルタリングします。リストは各サービスごとに設定可能です。リストはサービスの展開中に構成することも、後から変更することもできます。プロビジョニング中にIPアクセスリストを設定しない場合、または初期リストに変更を加えたい場合は、サービスを選択し、次に**セキュリティ**タブを選択することで変更が行えます。

:::important
ClickHouse CloudサービスのIPアクセスリストの作成をスキップすると、そのサービスへのトラフィックは許可されません。
:::

## 準備 {#prepare}
始める前に、アクセスリストに追加すべきIPアドレスまたは範囲を収集してください。リモートワーカー、オンコールの場所、VPNなどを考慮してください。IPアクセスリストのユーザーインターフェースは、個別のアドレスとCIDR表記を受け入れます。

クラスレス・インタードメイン・ルーティング（CIDR）表記は、従来のクラスA、B、またはC（8、6、または24）サブネットマスクサイズよりも小さなIPアドレス範囲を指定することを可能にします。もし必要であれば、[ARIN](https://account.arin.net/public/cidrCalculator)などのいくつかの組織がCIDR計算機を提供しています。また、CIDR表記についてもっと情報が必要な場合は、[クラスレス・インタードメイン・ルーティング（CIDR）](https://www.rfc-editor.org/rfc/rfc4632.html) RFCを参照してください。

## IPアクセスリストの作成または変更 {#create-or-modify-an-ip-access-list}

あなたのClickHouse Cloudサービスリストからサービスを選択し、次に**設定**を選択します。**セキュリティ**セクションの下にIPアクセスリストがあります。「*このサービスへの接続は* **(どこからでも | x特定の場所から)**」と書かれたハイパーリンクをクリックしてください。

設定するためのオプションが表示されるサイドバーが現れます：

- サービスへのトラフィックをどこからでも許可する
- 特定の場所からのサービスへのアクセスを許可する
- サービスへの全アクセスを拒否する

このスクリーンショットは、"NYオフィスの範囲"として説明された一連のIPアドレスからのトラフィックを許可するアクセスリストを示しています：

<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloudの既存のアクセスリスト" border/>

### 可能なアクション {#possible-actions}

1. 追加のエントリを追加するには、**+ 新しいIPを追加**を使用します。

  この例では、`ロンドンサーバー`の説明が付いた単一のIPアドレスを追加します：

<Image img={ip_filter_add_single_ip} size="md" alt="ClickHouse Cloudのアクセスリストに単一IPを追加する" border/>

1. 既存のエントリを削除します。

  クロス（x）をクリックすると、エントリが削除されます。

1. 既存のエントリを編集します。

  エントリを直接修正します。

1. **どこからでも**のアクセスを許可するに切り替えます。

  これは推奨されませんが、許可されています。ClickHouseの上に構築されたアプリケーションを公に公開し、バックエンドのClickHouse Cloudサービスへのアクセスを制限することをお勧めします。

変更を適用するには、**保存**をクリックする必要があります。

## 検証 {#verification}

フィルターを作成したら、範囲内からの接続を確認し、許可されていない範囲からの接続が拒否されることを確認します。単純な`curl`コマンドを使用して確認できます：
```bash title="許可リスト外からの拒否された試行"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
または
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="許可リスト内からの許可された試行"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## 制限事項 {#limitations}

- 現在、IPアクセスリストはIPv4のみをサポートしています。
