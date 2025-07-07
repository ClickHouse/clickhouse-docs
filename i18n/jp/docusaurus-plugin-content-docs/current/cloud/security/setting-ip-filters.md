---
'sidebar_label': 'Setting IP Filters'
'slug': '/cloud/security/setting-ip-filters'
'title': 'Setting IP Filters'
'description': 'This page explains how to set IP filters in ClickHouse Cloud to control
  access to ClickHouse services.'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## IPフィルターを設定する {#setting-ip-filters}

IPアクセスリストは、どのソースアドレスがあなたのClickHouseサービスに接続できるかを指定することによって、ClickHouseサービスへのトラフィックをフィルタリングします。リストは各サービスのために設定可能です。リストはサービスの展開時に設定することも、その後に設定することもできます。プロビジョニング中にIPアクセスリストを設定しない場合や、初期リストを変更したい場合は、サービスを選択し、次に**セキュリティ**タブを選択することで変更を行うことができます。

:::important
ClickHouse CloudサービスのためにIPアクセスリストを作成しないと、そのサービスにはトラフィックが許可されません。
:::

## 準備 {#prepare}
作業を始める前に、アクセスリストに追加するべきIPアドレスまたは範囲を収集してください。リモート作業者、オンコールの場所、VPNなどを考慮に入れてください。IPアクセスリストのユーザーインターフェースでは、個別のアドレスとCIDR表記を受け付けます。

クラスレス・インタードメイン・ルーティング（CIDR）表記を利用すると、従来のクラスA、B、C（8、6、または24）サブネットマスクサイズよりも小さなIPアドレス範囲を指定できます。 [ARIN](https://account.arin.net/public/cidrCalculator)などのいくつかの組織はCIDR計算機を提供していますので、必要な場合は利用してください。また、CIDR表記に関する詳細については、[クラスレス・インタードメイン・ルーティング（CIDR）](https://www.rfc-editor.org/rfc/rfc4632.html) RFCをご覧ください。

## IPアクセスリストの作成または変更 {#create-or-modify-an-ip-access-list}

ClickHouse Cloudサービスのリストからサービスを選択し、次に**設定**を選択します。**セキュリティ**セクションの下に、IPアクセスリストがあります。「*このサービスに接続できます* **（どこからでも | x 特定の場所から）**」というテキストのハイパーリンクをクリックします。

構成するためのオプションが表示されるサイドバーが表示されます：

- サービスへのすべての場所からの着信トラフィックを許可する
- 特定の場所からのサービスへのアクセスを許可する
- サービスへのすべてのアクセスを拒否する

このスクリーンショットは、"NY Office range"として説明されたIPアドレスの範囲からのトラフィックを許可するアクセスリストを示しています：

<Image img={ip_filtering_after_provisioning} size="md" alt="ClickHouse Cloudの既存のアクセスリスト" border/>

### 可能なアクション {#possible-actions}

1. 追加のエントリを追加するには、**+ 新しいIPを追加**を使用します。

  この例では、`London server`の説明を持つ単一のIPアドレスを追加します：

<Image img={ip_filter_add_single_ip} size="md" alt="ClickHouse Cloudのアクセスリストに単一のIPを追加" border/>

1. 既存のエントリを削除します。

  クロス（x）をクリックすると、エントリが削除されます。

1. 既存のエントリを編集します。

  エントリを直接変更します。

1. **どこからでも**アクセスを許可するに切り替えます。

  これは推奨されませんが、許可されています。ClickHouseの上に構築されたアプリケーションを公開し、バックエンドのClickHouse Cloudサービスへのアクセスを制限することをお勧めします。

変更を適用するには、**保存**をクリックする必要があります。

## 検証 {#verification}

フィルタを作成したら、範囲内からの接続を確認し、許可されていない範囲からの接続が拒否されていることを確認します。`curl`コマンドを利用して確認できます：
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
