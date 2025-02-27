---
sidebar_label: IPフィルターの設定
slug: /cloud/security/setting-ip-filters
title: IPフィルターの設定
---

## IPフィルターの設定 {#setting-ip-filters}

IPアクセスリストは、どのソースアドレスがあなたのClickHouseサービスに接続を許可されるかを指定することで、ClickHouseサービスへのトラフィックをフィルタリングします。リストは各サービスごとに構成可能です。リストはサービスのデプロイメント時またはその後に設定できます。プロビジョニング中にIPアクセスリストを設定しなかった場合や、最初のリストを変更したい場合は、サービスを選択し、**セキュリティ**タブを選択することで変更できます。

:::important
ClickHouse CloudサービスのIPアクセスリストの作成をスキップした場合、サービスへのトラフィックは許可されません。
:::

## 準備 {#prepare}
始める前に、アクセスリストに追加する必要があるIPアドレスまたは範囲を収集してください。リモートワーカー、呼び出し場所、VPNなどを考慮に入れてください。IPアクセスリストのユーザーインターフェースは、個別のアドレスとCIDR表記を受け入れます。

クラスレス・インタードメイン・ルーティング（CIDR）表記を使用すると、従来のクラスA、B、C（8、6、または24）サブネットマスクサイズよりも小さいIPアドレス範囲を指定できます。[ARIN](https://account.arin.net/public/cidrCalculator)を含むいくつかの組織がCIDR計算機を提供しているので、必要に応じて利用できます。また、CIDR表記についての詳細は、[Classless Inter-domain Routing (CIDR)](https://www.rfc-editor.org/rfc/rfc4632.html) RFCを参照してください。

## IPアクセスリストの作成または変更 {#create-or-modify-an-ip-access-list}

ClickHouse Cloudサービスのリストからサービスを選択し、次に**設定**を選択します。**セキュリティ**セクションの下にIPアクセスリストがあります。*このサービスに接続できる場所は* **(どこからでも | x 特定の場所)** と記載されたハイパーリンクをクリックします。

サイドバーが表示され、設定するためのオプションが表示されます：

- サービスへのすべてのトラフィックを許可
- 特定の場所からサービスへのアクセスを許可
- サービスへのすべてのアクセスを拒否

このスクリーンショットは、"NY Office range"と説明されるIPアドレスの範囲からのトラフィックを許可するアクセスリストを示しています：

  ![既存のアクセスリスト](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/ip-filtering-after-provisioning.png)

### 可能なアクション {#possible-actions}

1. 追加のエントリを追加するには、**+ 新しいIPを追加**を使用できます。

   この例では、`London server`の説明付きで単一のIPアドレスを追加しています：

   ![アクセスリストに単一のIPを追加](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/ip-filter-add-single-ip.png)

2. 既存のエントリを削除

   ×（エックス）をクリックするとエントリが削除されます。

3. 既存のエントリを編集

   エントリを直接修正します。

4. **どこからでも**のアクセスを許可に切り替え

   これは推奨されませんが、許可されています。ClickHouseの上に構築されたアプリケーションを公開し、バックエンドのClickHouse Cloudサービスへのアクセスを制限することを推奨します。

作成した変更を適用するには、**保存**をクリックする必要があります。

## 検証 {#verification}

フィルターを作成したら、範囲内からの接続を確認し、許可された範囲外からの接続が拒否されることを確認してください。単純な`curl`コマンドを使用して検証できます：
```bash title="許可リスト外からの試行が拒否される"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
curl: (35) error:02FFF036:system library:func(4095):Connection reset by peer
```
または
```response
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to HOSTNAME.clickhouse.cloud:8443
```

```bash title="許可リスト内からの試行が許可される"
curl https://<HOSTNAME>.clickhouse.cloud:8443
```
```response
Ok.
```

## 制限事項 {#limitations}

- 現在、IPアクセスリストはIPv4のみをサポートしています。
