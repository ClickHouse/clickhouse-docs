---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', '接続', '統合', 'ui', 'アナリティクス', '埋め込み', 'ダッシュボード', '可視化']
description: 'Databrainは、ClickHouseとシームレスに連携し、顧客向けダッシュボード、メトリクス、データ可視化を構築するための埋め込み型アナリティクスプラットフォームです。'
title: 'Databrain を ClickHouse に接続する'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Databrain を ClickHouse に接続する {#connecting-databrain-to-clickhouse}

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) は、組み込み型のアナリティクスプラットフォームであり、インタラクティブなダッシュボード、メトリクス、データ可視化を作成して顧客と共有できます。Databrain は HTTPS インターフェース経由で ClickHouse に接続し、モダンでユーザーフレンドリーなインターフェースから ClickHouse データを容易に可視化・分析できるようにします。

<Image size="md" img={databrain_01} alt="ClickHouse データの可視化を表示している Databrain ダッシュボードのインターフェース" border />

<br/>

このガイドでは、Databrain を ClickHouse インスタンスに接続する手順を説明します。



## 前提条件 {#pre-requisites}

- 独自のインフラストラクチャ上で、または [ClickHouse Cloud](https://clickhouse.com/) 上でホストされている ClickHouse データベース。
- [Databrain アカウント](https://app.usedatabrain.com/users/sign-up)。
- データソースを接続するための Databrain ワークスペース。



## Databrain を ClickHouse に接続する手順 {#steps-to-connect-databrain-to-clickhouse}

### 1. 接続情報を準備する {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Databrain の IP アドレスを許可する（必要な場合） {#2-allow-databrain-ip-addresses}

ClickHouse インスタンスで IP フィルタリングが有効になっている場合は、Databrain の IP アドレスを許可リストに追加する必要があります。

ClickHouse Cloud をご利用の場合:

1. ClickHouse Cloud コンソールで対象のサービスに移動します
2. **Settings** → **Security** に進みます
3. Databrain の IP アドレスを許可リストに追加します

:::tip
最新の許可対象 IP アドレス一覧については、[Databrain の IP アドレス許可設定ドキュメント](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip)を参照してください。
:::

### 3. Databrain で ClickHouse をデータソースとして追加する {#3-add-clickhouse-as-a-data-source}

1. Databrain アカウントにログインし、データソースを追加したいワークスペースに移動します。

2. ナビゲーションメニューで **Data Sources** をクリックします。

<Image size="md" img={databrain_02} alt="Databrain のデータソースメニュー" border />

3. **Add a Data Source** または **Connect Data Source** をクリックします。

4. 利用可能なコネクタ一覧から **ClickHouse** を選択します。

<Image size="md" img={databrain_03} alt="ClickHouse オプションが表示された Databrain のコネクタ選択画面" border />

5. 接続情報を入力します:
   * **Destination Name**: この接続を識別しやすい名前を入力します（例: &quot;Production ClickHouse&quot; や &quot;Analytics DB&quot;）
   * **Host**: ClickHouse のホスト URL を入力します（例: `https://your-instance.region.aws.clickhouse.cloud`）
   * **Port**: `8443` を入力します（ClickHouse のデフォルト HTTPS ポート）
   * **Username**: ClickHouse のユーザー名を入力します
   * **Password**: ClickHouse のパスワードを入力します

<Image size="md" img={databrain_04} alt="設定フィールドが表示された Databrain の ClickHouse 接続フォーム" border />

6. **Test Connection** をクリックして、Databrain から ClickHouse インスタンスへ接続できることを確認します。

7. 接続が成功したら、**Save** または **Connect** をクリックしてデータソースを追加します。

### 4. ユーザー権限を構成する {#4-configure-user-permissions}

接続に使用する ClickHouse ユーザーに、必要な権限が付与されていることを確認します。

```sql
-- スキーマ情報を読み取る権限を付与します
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- データベースおよびテーブルを読み取る権限を付与します
GRANT SELECT ON your_database.* TO your_databrain_user;
```

`your_databrain_user` と `your_database` を、実際に使用するユーザー名とデータベース名に置き換えてください。


## ClickHouse で Databrain を使用する {#using-databrain-with-clickhouse}

### データを探索する {#explore-your-data}

1. 接続後、Databrain のワークスペースに移動します。

2. データエクスプローラーに ClickHouse のテーブル一覧が表示されます。

<Image size="md" img={databrain_05} alt="ClickHouse テーブルを表示している Databrain のデータエクスプローラー" border />

3. テーブルをクリックして、そのスキーマを確認し、データをプレビューします。

### メトリクスと可視化を作成する {#create-metrics-and-visualizations}

1. **Create Metric** をクリックして、ClickHouse データから可視化の作成を開始します。

2. ClickHouse のデータソースを選択し、可視化したいテーブルを選びます。

3. Databrain の直感的なインターフェースを使用して、次の操作を行います。
   - ディメンションとメジャーを選択する
   - フィルターと集約を適用する
   - 可視化タイプを選択する（棒グラフ、折れ線グラフ、円グラフ、テーブルなど）
   - 高度な分析のためにカスタム SQL クエリを追加する

4. メトリクスを保存して、複数のダッシュボードで再利用できるようにします。

### ダッシュボードを作成する {#build-dashboards}

1. **Create Dashboard** をクリックして、ダッシュボードの作成を開始します。

2. 保存済みメトリクスをドラッグ＆ドロップして、ダッシュボードにメトリクスを追加します。

3. ダッシュボードのレイアウトと外観をカスタマイズします。

<Image size="md" img={databrain_06} alt="複数の ClickHouse 可視化を含む Databrain ダッシュボード" border />

4. ダッシュボードをチームと共有するか、アプリケーションに埋め込みます。

### 高度な機能 {#advanced-features}

Databrain は、ClickHouse を使用する際にいくつかの高度な機能を提供します。

- **Custom SQL Console**: ClickHouse データベースに対してカスタム SQL クエリを直接作成・実行できます
- **マルチテナンシーおよびシングルテナンシー**: シングルテナントおよびマルチテナントアーキテクチャのいずれでも ClickHouse データベースに接続できます
- **レポートスケジューリング**: 自動レポートをスケジュールし、ステークホルダーにメール送信できます
- **AI によるインサイト**: AI を使用して、データからサマリーやインサイトを自動生成できます
- **埋め込みアナリティクス**: ダッシュボードとメトリクスをアプリケーションに直接埋め込めます
- **セマンティックレイヤー**: 再利用可能なデータモデルとビジネスロジックを作成できます



## トラブルシューティング {#troubleshooting}

### 接続に失敗する {#connection-fails}

ClickHouse に接続できない場合は、次の点を確認してください。

1. **認証情報の確認**: ユーザー名、パスワード、ホスト URL を再確認してください
2. **ポートの確認**: HTTPS を利用している場合はポート `8443` を、SSL を使用しない HTTP の場合は `8123` を使用していることを確認してください
3. **IP ホワイトリスト**: Databrain の IP アドレスが ClickHouse のファイアウォール／セキュリティ設定でホワイトリストに登録されていることを確認してください
4. **SSL/TLS**: HTTPS を使用している場合は SSL/TLS が正しく構成されていることを確認してください
5. **ユーザー権限**: 対象ユーザーが `information_schema` および対象データベースに対する SELECT 権限を持っていることを確認してください

### クエリのパフォーマンスが低い {#slow-query-performance}

クエリの実行が遅い場合は、次の点を検討してください。

1. **クエリの最適化**: フィルターや集約を効率的に使用してください
2. **マテリアライズドビューの作成**: 頻繁に参照される集約に対しては、ClickHouse にマテリアライズドビューを作成することを検討してください
3. **適切なデータ型の使用**: ClickHouse のスキーマで最適なデータ型を使用していることを確認してください
4. **インデックスの最適化**: ClickHouse のプライマリキーとスキップインデックスを活用してください



## さらに詳しく {#learn-more}

Databrain の機能や、強力な分析機能を構築する方法の詳細については、以下を参照してください。

- [Databrain ドキュメント](https://docs.usedatabrain.com/)
- [ClickHouse 連携ガイド](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [ダッシュボードの作成](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [メトリクスの作成](https://docs.usedatabrain.com/guides/metrics/create-metrics)
