---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'connect', 'integrate', 'ui', 'analytics', 'embedded', 'dashboard', 'visualization']
description: 'Databrain は、ClickHouse とシームレスに連携し、顧客向けのダッシュボード、メトリクス、データ可視化を構築するための組み込みアナリティクスプラットフォームです。'
title: 'Databrain を ClickHouse に接続する'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Databrain を ClickHouse に接続する

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) は、インタラクティブなダッシュボード、メトリクス、データ可視化をエンドユーザー向けに構築・共有できる埋め込み型アナリティクスプラットフォームです。Databrain は HTTPS インターフェイスを使って ClickHouse に接続し、モダンで使いやすい UI から ClickHouse のデータを簡単に可視化・分析できるようにします。

<Image size="md" img={databrain_01} alt="ClickHouse データの可視化を表示する Databrain ダッシュボード インターフェイス" border />

<br/>

このガイドでは、Databrain を ClickHouse インスタンスに接続する手順を説明します。



## 前提条件 {#pre-requisites}

- 自社インフラストラクチャまたは[ClickHouse Cloud](https://clickhouse.com/)でホストされているClickHouseデータベース
- [Databrainアカウント](https://app.usedatabrain.com/users/sign-up)
- データソースを接続するためのDatabrainワークスペース


## DatabrainをClickHouseに接続する手順 {#steps-to-connect-databrain-to-clickhouse}

### 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. DatabrainのIPアドレスを許可する(必要な場合) {#2-allow-databrain-ip-addresses}

ClickHouseインスタンスでIPフィルタリングが有効になっている場合は、DatabrainのIPアドレスを許可リストに登録する必要があります。

ClickHouse Cloudユーザーの場合:

1. ClickHouse Cloudコンソールでサービスに移動します
2. **Settings** → **Security**に移動します
3. DatabrainのIPアドレスを許可リストに追加します

:::tip
許可リストに登録するIPアドレスの最新リストについては、[DatabrainのIPホワイトリスト登録ドキュメント](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip)を参照してください。
:::

### 3. DatabrainでClickHouseをデータソースとして追加する {#3-add-clickhouse-as-a-data-source}

1. Databrainアカウントにログインし、データソースを追加するワークスペースに移動します。

2. ナビゲーションメニューで**Data Sources**をクリックします。

<Image size='md' img={databrain_02} alt='Databrain data sources menu' border />

3. **Add a Data Source**または**Connect Data Source**をクリックします。

4. 利用可能なコネクタのリストから**ClickHouse**を選択します。

<Image
  size='md'
  img={databrain_03}
  alt='Databrain connector selection showing ClickHouse option'
  border
/>

5. 接続情報を入力します:
   - **Destination Name**: この接続のわかりやすい名前を入力します(例: "Production ClickHouse"または"Analytics DB")
   - **Host**: ClickHouseホストのURLを入力します(例: `https://your-instance.region.aws.clickhouse.cloud`)
   - **Port**: `8443`を入力します(ClickHouseのデフォルトHTTPSポート)
   - **Username**: ClickHouseのユーザー名を入力します
   - **Password**: ClickHouseのパスワードを入力します

<Image
  size='md'
  img={databrain_04}
  alt='Databrain ClickHouse connection form with configuration fields'
  border
/>

6. **Test Connection**をクリックして、DatabrainがClickHouseインスタンスに接続できることを確認します。

7. 接続が成功したら、**Save**または**Connect**をクリックしてデータソースを追加します。

### 4. ユーザー権限を設定する {#4-configure-user-permissions}

接続に使用するClickHouseユーザーが必要な権限を持っていることを確認してください:

```sql
-- スキーマ情報を読み取る権限を付与
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- データベースとテーブルへの読み取りアクセスを付与
GRANT SELECT ON your_database.* TO your_databrain_user;
```

`your_databrain_user`と`your_database`を実際のユーザー名とデータベース名に置き換えてください。


## ClickHouseでDatabrainを使用する {#using-databrain-with-clickhouse}

### データの探索 {#explore-your-data}

1. 接続後、Databrainのワークスペースに移動します。

2. データエクスプローラーにClickHouseテーブルの一覧が表示されます。

<Image
  size='md'
  img={databrain_05}
  alt='ClickHouseテーブルを表示するDatabrainデータエクスプローラー'
  border
/>

3. テーブルをクリックして、スキーマを確認しデータをプレビューします。

### メトリクスと可視化の作成 {#create-metrics-and-visualizations}

1. **Create Metric**をクリックして、ClickHouseデータからの可視化の構築を開始します。

2. ClickHouseデータソースを選択し、可視化するテーブルを選択します。

3. Databrainの直感的なインターフェースを使用して以下を実行します:
   - ディメンションとメジャーの選択
   - フィルターと集計の適用
   - 可視化タイプの選択（棒グラフ、折れ線グラフ、円グラフ、テーブルなど）
   - 高度な分析のためのカスタムSQLクエリの追加

4. メトリクスを保存して、複数のダッシュボード間で再利用します。

### ダッシュボードの構築 {#build-dashboards}

1. **Create Dashboard**をクリックして、ダッシュボードの構築を開始します。

2. 保存したメトリクスをドラッグアンドドロップして、ダッシュボードにメトリクスを追加します。

3. ダッシュボードのレイアウトと外観をカスタマイズします。

<Image
  size='md'
  img={databrain_06}
  alt='複数のClickHouse可視化を含むDatabrainダッシュボード'
  border
/>

4. ダッシュボードをチームと共有するか、アプリケーションに埋め込みます。

### 高度な機能 {#advanced-features}

DatabrainはClickHouseを使用する際に、以下の高度な機能を提供します:

- **カスタムSQLコンソール**: ClickHouseデータベースに対して直接カスタムSQLクエリを記述および実行
- **マルチテナンシーとシングルテナンシー**: シングルテナントとマルチテナントの両方のアーキテクチャでClickHouseデータベースを接続
- **レポートスケジューリング**: 自動レポートをスケジュールし、関係者にメールで送信
- **AI駆動のインサイト**: AIを使用してデータから要約とインサイトを生成
- **組み込み分析**: ダッシュボードとメトリクスをアプリケーションに直接埋め込み
- **セマンティックレイヤー**: 再利用可能なデータモデルとビジネスロジックを作成


## トラブルシューティング {#troubleshooting}

### 接続に失敗する {#connection-fails}

ClickHouseに接続できない場合:

1. **認証情報の確認**: ユーザー名、パスワード、ホストURLを再確認してください
2. **ポートの確認**: HTTPSの場合はポート`8443`を使用していることを確認してください(SSLを使用しない場合はHTTPでポート`8123`)
3. **IPホワイトリスト**: DatabrainのIPアドレスがClickHouseのファイアウォール/セキュリティ設定でホワイトリストに登録されていることを確認してください
4. **SSL/TLS**: HTTPSを使用している場合は、SSL/TLSが適切に設定されていることを確認してください
5. **ユーザー権限**: ユーザーが`information_schema`と対象データベースに対するSELECT権限を持っていることを確認してください

### クエリのパフォーマンスが遅い {#slow-query-performance}

クエリの実行が遅い場合:

1. **クエリの最適化**: フィルタと集計を効率的に使用してください
2. **マテリアライズドビューの作成**: 頻繁にアクセスされる集計については、ClickHouseでマテリアライズドビューの作成を検討してください
3. **適切なデータ型の使用**: ClickHouseスキーマが最適なデータ型を使用していることを確認してください
4. **インデックスの最適化**: ClickHouseのプライマリキーとスキッピングインデックスを活用してください


## 詳細情報 {#learn-more}

Databrainの機能と強力な分析の構築方法については、以下を参照してください:

- [Databrainドキュメント](https://docs.usedatabrain.com/)
- [ClickHouse統合ガイド](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [ダッシュボードの作成](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [メトリクスの構築](https://docs.usedatabrain.com/guides/metrics/create-metrics)
