---
'sidebar_label': 'IPフィルターの設定'
'slug': '/cloud/security/setting-ip-filters'
'title': 'IPフィルターの設定'
'description': 'このページでは、ClickHouse CloudでIPフィルターを設定して、ClickHouseサービスへのアクセスを制御する方法について説明します。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ip_filtering_after_provisioning from '@site/static/images/cloud/security/ip-filtering-after-provisioning.png';
import ip_filter_add_single_ip from '@site/static/images/cloud/security/ip-filter-add-single-ip.png';

## IPフィルタの設定 {#setting-ip-filters}

IPアクセスリストは、どのソースアドレスが接続を許可されるかを指定することによって、ClickHouseサービスまたはAPIキーへのトラフィックをフィルタリングします。これらのリストは、各サービスおよび各APIキーごとに構成可能です。リストはサービスまたはAPIキーの作成時、またはその後に構成できます。

:::important
ClickHouse CloudサービスのIPアクセスリストの作成をスキップすると、サービスへのトラフィックは許可されません。ClickHouseサービスのIPアクセスリストを`Allow from anywhere`に設定すると、インターネットのクローラーやスキャナーによってサービスが定期的にアイドル状態からアクティブ状態に移動される可能性があり、予期しないコストが発生する場合があります。
:::

## 準備 {#prepare}

始める前に、アクセスリストに追加すべきIPアドレスまたは範囲を収集してください。リモートワーカー、オンコールの場所、VPNなどを考慮に入れてください。IPアクセスリストのユーザーインターフェースは、個々のアドレスとCIDR表記を受け入れます。

クラスレスインタードメインルーティング（CIDR）表記を使用すると、従来のクラスA、B、またはC（8、6、または24）のサブネットマスクサイズよりも小さなIPアドレス範囲を指定できます。[ARIN](https://account.arin.net/public/cidrCalculator)や他のいくつかの組織が、必要な場合にCIDR計算機を提供しています。CIDR表記についての詳細は、[クラスレスインタードメインルーティング（CIDR）](https://www.rfc-editor.org/rfc/rfc4632.html) RFCを参照してください。

## IPアクセスリストの作成または変更 {#create-or-modify-an-ip-access-list}

:::note プライベートリンクの外部接続にのみ適用
IPアクセスリストは、[PrivateLink](/cloud/security/private-link-overview)の外部からのパブリックインターネットからの接続にのみ適用されます。
もしPrivateLinkからのトラフィックのみを希望する場合、IP許可リストに`DenyAll`を設定してください。
:::

<details>
  <summary>ClickHouseサービスのためのIPアクセスリスト</summary>

  ClickHouseサービスを作成すると、IP許可リストのデフォルト設定は「どこからも許可」となります。

  ClickHouse Cloudサービスのリストからサービスを選択し、次に**設定**を選択します。**セキュリティ**セクションの下にIPアクセスリストがあります。Add IPsボタンをクリックします。

  サイドバーが表示され、構成するオプションが表示されます：

- サービスへのどこからのトラフィックも許可
- 特定の場所からのサービスへのアクセスを許可
- サービスへのすべてのアクセスを拒否
  
</details>
<details>
  <summary>APIキーのためのIPアクセスリスト</summary>

  APIキーを作成すると、IP許可リストのデフォルト設定は「どこからも許可」です。

  APIキーリストから、**アクション**列のAPIキーの横にある三点リーダーをクリックし、**編集**を選択します。画面の下部にIPアクセスリストと構成オプションがあります：

- サービスへのどこからのトラフィックも許可
- 特定の場所からのサービスへのアクセスを許可
- サービスへのすべてのアクセスを拒否
  
</details>

このスクリーンショットは、「NY Office range」と説明されたIPアドレスの範囲からのトラフィックを許可するアクセスリストを示しています：

<Image img={ip_filtering_after_provisioning} size="md" alt="既存のアクセスリスト in ClickHouse Cloud" border/>

### 可能なアクション {#possible-actions}

1. 追加のエントリを追加するには、**+ 新しいIPを追加**を使用できます。

   この例では、`London server`という説明付きで単一のIPアドレスを追加します：

<Image img={ip_filter_add_single_ip} size="md" alt="ClickHouse Cloudでのアクセスリストへの単一IPの追加" border/>

2. 既存のエントリを削除

   クロス（x）をクリックするとエントリが削除されます。

3. 既存のエントリを編集

   エントリを直接変更します。

4. **どこからでもアクセスを許可**に切り替えます。

   これは推奨されませんが、許可されています。ClickHouseの上に構築されたアプリケーションを公開し、バックエンドのClickHouse Cloudサービスへのアクセスを制限することを推奨します。

変更を適用するには、**保存**をクリックする必要があります。

## 検証 {#verification}

フィルタを作成したら、範囲内のサービスへの接続を確認し、許可された範囲外からの接続が拒否されることを確認します。シンプルな`curl`コマンドを使用して確認できます：
```bash title="Attempt rejected from outside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
または
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="Attempt permitted from inside the allow list"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## 制限事項 {#limitations}

- 現在、IPアクセスリストはIPv4のみをサポートしています。
