---
description: 'ClickHouse Cloudの高度なダッシュボード'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: '高度なダッシュボード'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'ClickHouse Cloudの高度なダッシュボード'
doc_type: 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

本番環境でデータベースシステムを監視することは、デプロイメントの健全性を
理解し、障害を予防または解決するために不可欠です。

高度なダッシュボードは、ClickHouseシステムとその環境に関する深い洞察を
提供するための軽量ツールで、パフォーマンスのボトルネック、システム障害、
非効率性を事前に把握するのに役立ちます。

高度なダッシュボードは、ClickHouse OSS（オープンソースソフトウェア）と
Cloudの両方で利用可能です。この記事では、Cloudでの高度なダッシュボードの
使用方法を説明します。

## 高度なダッシュボードへのアクセス {#accessing-the-advanced-dashboard}

高度なダッシュボードには以下の方法でアクセスできます：

* 左側のパネル
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

## ネイティブ高度なダッシュボードへのアクセス {#accessing-the-native-advanced-dashboard}

ネイティブ高度なダッシュボードには以下の方法でアクセスできます：

* 左側のパネル
  * `Monitoring` → `Advanced dashboard`
  * `You can still access the native advanced dashboard.`をクリック

これにより、新しいタブでネイティブ高度なダッシュボードが開きます。
ダッシュボードにアクセスするには認証が必要です。

<Image img={NativeAdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

各ビジュアライゼーションには、データを取得するSQLクエリが関連付けられています。
ペンアイコンをクリックすることで、このクエリを編集できます。

<Image img={EditVisualization} size="lg" alt="高度なダッシュボード"/>

## 標準搭載のビジュアライゼーション {#out-of-box-visualizations}

高度なダッシュボードのデフォルトチャートは、ClickHouseシステムの
リアルタイムの可視性を提供するように設計されています。以下は各チャートの
説明付きリストです。ナビゲーションを容易にするため、3つのカテゴリに
分類されています。

### ClickHouse固有 {#clickhouse-specific}

これらのメトリクスは、ClickHouseインスタンスの健全性とパフォーマンスを
監視するために調整されています。

| メトリクス | 説明 |
|-----------|------|
| Queries Per Second | 処理されているクエリのレートを追跡 |
| Selected Rows/Sec | クエリによって読み取られている行数を示す |
| Inserted Rows/Sec | データ取り込みレートを測定 |
| Total MergeTree Parts | MergeTreeテーブル内のアクティブなパーツ数を表示し、バッチ化されていないインサートの特定に役立つ |
| Max Parts for Partition | 任意のパーティション内の最大パーツ数を強調表示 |
| Queries Running | 現在実行中のクエリ数を表示 |
| Selected Bytes Per Second | クエリによって読み取られているデータ量を示す |

### システムヘルス固有 {#system-health-specific}

基盤となるシステムの監視は、ClickHouse自体の監視と同様に重要です。

| メトリクス | 説明 |
|-----------|------|
| IO Wait | I/O待機時間を追跡 |
| CPU Wait | CPUリソース競合による遅延を測定 |
| Read From Disk | ディスクまたはブロックデバイスから読み取られたバイト数を追跡 |
| Read From Filesystem | ページキャッシュを含む、ファイルシステムから読み取られたバイト数を追跡 |
| Memory (tracked, bytes) | ClickHouseによって追跡されているプロセスのメモリ使用量を表示 |
| Load Average (15 minutes) | システムからの現在の15分間のロードアベレージを報告 |
| OS CPU Usage (Userspace) | ユーザースペースコードを実行しているCPU使用率 |
| OS CPU Usage (Kernel) | カーネルコードを実行しているCPU使用率 |

## ClickHouse Cloud固有 {#clickhouse-cloud-specific}

ClickHouse Cloudはオブジェクトストレージ（S3タイプ）を使用してデータを
保存します。このインターフェースを監視することで、問題の検出に役立ちます。

| メトリクス | 説明 |
|-----------|------|
| S3 Read wait | S3への読み取りリクエストのレイテンシを測定 |
| S3 read errors per second | 読み取りエラー率を追跡 |
| Read From S3 (bytes/sec) | S3ストレージからのデータ読み取りレートを追跡 |
| Disk S3 write req/sec | S3ストレージへの書き込み操作の頻度を監視 |
| Disk S3 read req/sec | S3ストレージからの読み取り操作の頻度を監視 |
| Page cache hit rate | ページキャッシュのヒット率 |
| Filesystem cache hit rate | ファイルシステムキャッシュのヒット率 |
| Filesystem cache size | ファイルシステムキャッシュの現在のサイズ |
| Network send bytes/sec | 受信ネットワークトラフィックの現在の速度を追跡 |
| Network receive bytes/sec | 送信ネットワークトラフィックの現在の速度を追跡 |
| Concurrent network connections | 現在の同時ネットワーク接続数を追跡 |

## 高度なダッシュボードを使用した問題の特定 {#identifying-issues-with-the-advanced-dashboard}

ClickHouseサービスの健全性をリアルタイムで把握できることは、ビジネスに
影響を与える前に問題を軽減したり、解決したりするのに大いに役立ちます。
以下は、高度なダッシュボードを使用して発見できる問題の例です。

### バッチ化されていないインサート {#unbatched-inserts}

[ベストプラクティスドキュメント](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)に
記載されているように、同期的に行える場合は常にClickHouseへの一括インサートを
推奨します。

適切なバッチサイズでの一括インサートは、取り込み時に作成されるパーツの数を
減らし、より効率的なディスク書き込みとマージ操作の削減につながります。

最適化されていないインサートを発見するための主要なメトリクスは
**Inserted Rows/sec**と**Max Parts for Partition**です。

<Image img={InsertedRowsSec} size="lg" alt="バッチ化されていないインサート"/>

上記の例では、13時から14時の間に**Inserted Rows/sec**と
**Max Parts for Partition**に2つのスパイクが見られます。
これは、適切な速度でデータを取り込んでいることを示しています。

その後、16時以降に**Max Parts for Partition**で大きなスパイクがありますが、
**Inserted Rows/sec**の速度は非常に遅くなっています。生成されるデータが
非常に少ないにもかかわらず、多くのパーツが作成されており、パーツのサイズが
最適でないことを示しています。

### リソース集約型クエリ {#resource-intensive-query}

CPUやメモリなど、大量のリソースを消費するSQLクエリを実行することはよくあります。
ただし、これらのクエリを監視し、デプロイメント全体のパフォーマンスへの
影響を理解することが重要です。

クエリスループットの変化なしにリソース消費が急激に変化した場合、より高コストな
クエリが実行されていることを示している可能性があります。実行しているクエリの
種類によってはこれは想定内かもしれませんが、高度なダッシュボードから
これらを発見することは重要です。

以下は、1秒あたりに実行されるクエリ数に大きな変化がないにもかかわらず、
CPU使用率がピークに達している例です。

<Image img={ResourceIntensiveQuery} size="lg" alt="リソース集約型クエリ"/>

### 不適切なプライマリキー設計 {#bad-primary-key-design}

高度なダッシュボードを使用して発見できるもう1つの問題は、不適切なプライマリキー
設計です。["ClickHouseにおけるプライマリインデックスの実践的入門"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)に
記載されているように、ユースケースに最適なプライマリキーを選択することで、
ClickHouseがクエリを実行するために読み取る必要のある行数を減らし、
パフォーマンスを大幅に向上させることができます。

プライマリキーの潜在的な改善点を発見するために追跡できるメトリクスの1つは
**Selected Rows per second**です。選択された行数の急激なピークは、
全体的なクエリスループットの一般的な増加と、クエリを実行するために
大量の行を選択しているクエリの両方を示している可能性があります。

<Image img={SelectedRowsPerSecond} size="lg" alt="リソース集約型クエリ"/>

タイムスタンプをフィルターとして使用することで、`system.query_log`テーブルで
ピーク時に実行されたクエリを見つけることができます。

例えば、特定の日の午前11時から11時30分の間に実行されたすべてのクエリを
表示し、どのクエリが多くの行を読み取っているかを理解するクエリを実行します：

```sql title="クエリ"
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

```response title="レスポンス"
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

この例では、同じクエリが2つのテーブル`amazon_reviews_no_pk`と
`amazon_reviews_pk`に対して実行されていることがわかります。
誰かがテーブル`amazon_reviews`のプライマリキーオプションをテストしていたと
結論付けることができます。