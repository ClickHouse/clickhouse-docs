---
'description': 'ClickHouse Cloudの高度なダッシュボード'
'keywords':
- 'monitoring'
- 'observability'
- 'advanced dashboard'
- 'dashboard'
- 'observability dashboard'
'sidebar_label': '高度なダッシュボード'
'sidebar_position': 45
'slug': '/cloud/manage/monitor/advanced-dashboard'
'title': 'ClickHouse Cloudの高度なダッシュボード'
'doc_type': 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';
import Image from '@theme/IdealImage';

データベースシステムを本番環境で監視することは、展開の健康状態を理解し、障害を防止または解決するために不可欠です。

高度なダッシュボードは、ClickHouseシステムとその環境に深い洞察を提供するために設計された軽量ツールであり、パフォーマンスのボトルネック、システムの障害、非効率性を事前に把握するのに役立ちます。

高度なダッシュボードは、ClickHouse OSS（オープンソースソフトウェア）およびクラウドの両方で利用可能です。この記事では、クラウドでの高度なダッシュボードの使用方法を示します。

## 高度なダッシュボードへのアクセス {#accessing-the-advanced-dashboard}

高度なダッシュボードには、次のようにナビゲートしてアクセスできます：

* 左側のパネル
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

## ネイティブ高度なダッシュボードへのアクセス {#accessing-the-native-advanced-dashboard}

ネイティブ高度なダッシュボードには、次のようにナビゲートしてアクセスできます：

* 左側のパネル
  * `Monitoring` → `Advanced dashboard`
  * `You can still access the native advanced dashboard.`をクリック

これにより、ネイティブ高度なダッシュボードが新しいタブで開きます。ダッシュボードにアクセスするには認証が必要です。

<Image img={NativeAdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

各ビジュアライゼーションには、それを構成するSQLクエリが関連付けられています。このクエリはペンアイコンをクリックすることで編集できます。

<Image img={EditVisualization} size="lg" alt="高度なダッシュボード"/>

## デフォルトのビジュアライゼーション {#out-of-box-visualizations}

高度なダッシュボードのデフォルトチャートは、ClickHouseシステムのリアルタイムの可視性を提供するように設計されています。以下は各チャートの説明を含むリストです。これらはナビゲーションを助けるために3つのカテゴリにグループ化されています。

### ClickHouse固有 {#clickhouse-specific}

これらのメトリックは、ClickHouseインスタンスの健康状態とパフォーマンスを監視するためにカスタマイズされています。

| メトリック                  | 説明                                                                                       |
|---------------------------|------------------------------------------------------------------------------------------|
| 1秒あたりのクエリ数       | 処理されるクエリの割合を追跡                                                              |
| 選択された行/秒            | クエリによって読み込まれる行の数を示す                                                     |
| 挿入された行/秒            | データ取り込み速度を測定                                                                  |
| MergeTreeテーブルの総パーツ  | MergeTreeテーブルのアクティブなパーツの数を示し、バッチされていない挿入を特定するのに役立ちます  |
| パーティション内の最大パーツ | 任意のパーティション内の最大パーツ数を強調                                                  |
| 実行中のクエリ数            | 現在実行中のクエリの数を表示                                                                |
| 1秒あたりの選択バイト数    | クエリによって読み込まれるデータの量を示す                                                 |

### システム健康固有 {#system-health-specific}

基盤となるシステムを監視することは、ClickHouse自体を監視することと同じくらい重要です。

| メトリック                        | 説明                                                               |
|---------------------------------|--------------------------------------------------------------------|
| I/O待機                          | I/O待機時間を追跡                                                   |
| CPU待機                          | CPUリソースの競合によって引き起こされる遅延を測定                  |
| ディスクからの読み取り           | ディスクまたはブロックデバイスから読み取られたバイト数を追跡       |
| ファイルシステムからの読み取り   | ページキャッシュを含むファイルシステムから読み取られたバイト数を追跡 |
| メモリ（トラッキング、バイト）   | ClickHouseによってトラッキングされたプロセスのメモリ使用量を表示   |
| 負荷平均（15分）                | システムの現在の負荷平均を報告                                     |
| OS CPU使用率（ユーザースペース） | ユーザースペースコードを実行しているCPU使用率                     |
| OS CPU使用率（カーネル）        | カーネルコードを実行しているCPU使用率                             |

## ClickHouse Cloud固有 {#clickhouse-cloud-specific}

ClickHouse Cloudは、オブジェクトストレージ（S3タイプ）を使用してデータを保存します。このインターフェイスを監視することで問題を検出するのに役立ちます。

| メトリック                      | 説明                                                         |
|-------------------------------|-------------------------------------------------------------|
| S3読み取り待機                 | S3への読み取りリクエストのレイテンシを測定                   |
| S3 1秒あたりの読み取りエラー   | 読み取りエラーの割合を追跡                                   |
| S3からの読み取り（バイト/秒）   | S3ストレージから読み取られるデータの速度を追跡             |
| ディスクS3書き込み要求/秒      | S3ストレージへの書き込み操作の頻度を監視                     |
| ディスクS3読み取り要求/秒      | S3ストレージへの読み取り操作の頻度を監視                     |
| ページキャッシュヒット率      | ページキャッシュのヒット率                                   |
| ファイルシステムキャッシュヒット率 | ファイルシステムキャッシュのヒット率                         |
| ファイルシステムキャッシュサイズ | 現在のファイルシステムキャッシュのサイズ                     |
| ネットワーク送信バイト/秒      | 入力ネットワークトラフィックの現在の速度を追跡               |
| ネットワーク受信バイト/秒      | 出力ネットワークトラフィックの現在の速度を追跡               |
| 同時ネットワーク接続数        | 現在の同時ネットワーク接続数を追跡                           |

## 高度なダッシュボードを使用して問題を特定する {#identifying-issues-with-the-advanced-dashboard}

ClickHouseサービスの健康状態をリアルタイムで把握することは、ビジネスに影響を与える前に問題を軽減するのに非常に役立ちます。以下は高度なダッシュボードを使用して発見できるいくつかの問題です。

### バッチされていない挿入 {#unbatched-inserts}

[bests practices documentation](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)に記載されているように、可能であれば常にClickHouseにデータをバルク挿入することが推奨されます。

合理的なバッチサイズのバルク挿入によって、取り込み中に作成されるパーツ数が減少し、ディスクへの書き込み効率が向上し、マージ操作が少なくなります。

挿入を最適化できていないことを示す主要なメトリックは、**挿入された行/秒**と**パーティション内の最大パーツ**です。

<Image img={InsertedRowsSec} size="lg" alt="バッチされていない挿入"/>

上記の例では、13時から14時の間に**挿入された行/秒**と**パーティション内の最大パーツ**が2回のスパイクを示しています。これは、データが合理的な速度で挿入されていることを示しています。

次に、16時以降に**パーティション内の最大パーツ**で別の大きなスパイクが見られますが、**挿入された行/秒の速度**は非常に遅くなっています。多くのパーツが生成されているのに対し、生成されるデータは非常に少なく、パーツのサイズが最適ではないことを示しています。

### リソースを大量に消費するクエリ {#resource-intensive-query}

CPUやメモリなどのリソースを大量に消費するSQLクエリを実行することは一般的ですが、これらのクエリを監視し、デプロイメント全体のパフォーマンスに対する影響を理解することが重要です。

リソース消費の突然の変化がクエリのスループットの変化なしに発生する場合、よりコストのかかるクエリが実行されていることを示している可能性があります。実行しているクエリの種類によっては想定内かもしれませんが、高度なダッシュボードでそれらを特定するのは良いことです。

以下は、実行されるクエリの数がほとんど変わらずにCPU使用量がピークに達する例です。

<Image img={ResourceIntensiveQuery} size="lg" alt="リソースを大量に消費するクエリ"/>

### 不適切な主キー設計 {#bad-primary-key-design}

高度なダッシュボードを使用して特定できる別の問題は、主キー設計が不適切であることです。["ClickHouseにおける主インデックスの実用的な紹介"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)に記載されているように、使用ケースに最適な主キーを選択すると、ClickHouseがクエリを実行するために読み取る行数が減少し、パフォーマンスが大幅に向上します。

主キーの改善の可能性を特定するために追跡できるメトリックの一つは、**選択された行の数/秒**です。選択された行数の突然のピークは、全体的なクエリスループットの増加と、クエリを実行するために多くの行を選択するクエリの両方を示すことができます。

<Image img={SelectedRowsPerSecond} size="lg" alt="リソースを大量に消費するクエリ"/>

タイムスタンプをフィルタとして使用することで、ピーク時に実行されたクエリを`system.query_log`テーブルで特定できます。

たとえば、特定の日に11時から11時の間に実行されたすべてのクエリを表示するクエリを実行して、どのクエリが多くの行を読み込んでいるかを理解します：

```sql title="Query"
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM system.query_log
WHERE has(databases, 'default') AND (event_time >= '2024-12-23 11:20:00') AND (event_time <= '2024-12-23 11:30:00') AND (type = 'QueryFinish')
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

```response title="Response"
Row 1:
──────
type:              QueryFinish
event_time:        2024-12-23 11:22:55
query_duration_ms: 37407
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

Row 2:
──────
type:              QueryFinish
event_time:        2024-12-23 11:26:50
query_duration_ms: 7325
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

Row 3:
──────
type:              QueryFinish
event_time:        2024-12-23 11:24:10
query_duration_ms: 3270
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         6242304
tables:            ['default.amazon_reviews_pk']

Row 4:
──────
type:              QueryFinish
event_time:        2024-12-23 11:28:10
query_duration_ms: 2786
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         6242304
tables:            ['default.amazon_reviews_pk']
```

この例では、2つのテーブル`amazon_reviews_no_pk`および`amazon_reviews_pk`に対して同じクエリが実行されていることがわかります。これは、誰かが`amazon_reviews`テーブルの主キーオプションを試していたことを示唆しています。
