---
description: 'ClickHouse Cloud の高度なダッシュボード'
keywords: ['monitoring', 'observability', 'advanced dashboard', 'dashboard', 'observability
    dashboard']
sidebar_label: '高度なダッシュボード'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'ClickHouse Cloud の高度なダッシュボード'
doc_type: 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

本番環境でデータベースシステムを監視することは、障害を未然に防いだり、発生した障害を解決したりするために、デプロイ環境の健全性を把握するうえで不可欠です。

Advanced Dashboard は、ClickHouse システムとその周辺環境の状況を深く把握できるように設計された軽量なツールであり、パフォーマンスボトルネックやシステム障害、非効率な点を早期に検知するのに役立ちます。

Advanced Dashboard は、ClickHouse OSS（Open Source Software）と Cloud の両方で利用できます。本記事では、Cloud で Advanced Dashboard を使用する方法を説明します。


## 高度なダッシュボードへのアクセス {#accessing-the-advanced-dashboard}

高度なダッシュボードには、以下の手順でアクセスできます：

- 左側パネル
  - `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size='lg' alt='高度なダッシュボード' />


## ネイティブ高度ダッシュボードへのアクセス {#accessing-the-native-advanced-dashboard}

ネイティブ高度ダッシュボードには、以下の手順でアクセスできます:

- 左側パネル
  - `Monitoring` → `Advanced dashboard`
  - `You can still access the native advanced dashboard.` をクリック

これにより、ネイティブ高度ダッシュボードが新しいタブで開きます。ダッシュボードにアクセスするには認証が必要です。

<Image img={NativeAdvancedDashboard} size='lg' alt='高度ダッシュボード' />

各ビジュアライゼーションには、データを取得するSQLクエリが関連付けられています。ペンアイコンをクリックすることで、このクエリを編集できます。

<Image img={EditVisualization} size='lg' alt='高度ダッシュボード' />


## すぐに使える可視化機能 {#out-of-box-visualizations}

Advanced Dashboardのデフォルトチャートは、ClickHouseシステムをリアルタイムで可視化できるように設計されています。以下は各チャートの説明です。3つのカテゴリに分類されており、目的のチャートを見つけやすくなっています。

### ClickHouse固有のメトリクス {#clickhouse-specific}

これらのメトリクスは、ClickHouseインスタンスの健全性とパフォーマンスを監視するために特化されています。

| メトリクス                    | 説明                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Queries Per Second        | 処理されているクエリの実行速度を追跡します                                               |
| Selected Rows/Sec         | クエリによって読み取られている行数を示します                                       |
| Inserted Rows/Sec         | データ取り込み速度を測定します                                                         |
| Total MergeTree Parts     | MergeTreeテーブル内のアクティブなパート数を表示し、バッチ化されていない挿入の特定に役立ちます |
| Max Parts for Partition   | 任意のパーティション内の最大パート数を示します                                  |
| Queries Running           | 現在実行中のクエリ数を表示します                                       |
| Selected Bytes Per Second | クエリによって読み取られているデータ量を示します                                       |

### システムヘルス固有のメトリクス {#system-health-specific}

基盤となるシステムの監視は、ClickHouse自体の監視と同じくらい重要です。

| Metric                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| IO Wait                   | I/O待機時間を追跡します                                                     |
| CPU Wait                  | CPUリソースの競合によって引き起こされる遅延を測定します                         |
| Read From Disk            | ディスクまたはブロックデバイスから読み取られたバイト数を追跡します               |
| Read From Filesystem      | ページキャッシュを含む、ファイルシステムから読み取られたバイト数を追跡します |
| Memory (tracked, bytes)   | ClickHouseによって追跡されているプロセスのメモリ使用量を表示します                    |
| Load Average (15 minutes) | システムの現在の15分間のロードアベレージを報告します                        |
| OS CPU Usage (Userspace)  | ユーザースペースコードを実行しているCPU使用率                                          |
| OS CPU Usage (Kernel)     | カーネルコードを実行しているCPU使用率                                             |


## ClickHouse Cloud固有 {#clickhouse-cloud-specific}

ClickHouse Cloudはオブジェクトストレージ(S3タイプ)を使用してデータを保存します。このインターフェースを監視することで、問題の検出に役立ちます。

| メトリック                         | 説明                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| S3 Read wait                   | S3への読み取りリクエストのレイテンシを測定します                 |
| S3 read errors per second      | 読み取りエラー率を追跡します                                 |
| Read From S3 (bytes/sec)       | S3ストレージからデータが読み取られる速度を追跡します                |
| Disk S3 write req/sec          | S3ストレージへの書き込み操作の頻度を監視します    |
| Disk S3 read req/sec           | S3ストレージからの読み取り操作の頻度を監視します     |
| Page cache hit rate            | ページキャッシュのヒット率                              |
| Filesystem cache hit rate      | ファイルシステムキャッシュのヒット率                            |
| Filesystem cache size          | ファイルシステムキャッシュの現在のサイズ                    |
| Network send bytes/sec         | 送信ネットワークトラフィックの現在の速度を追跡します        |
| Network receive bytes/sec      | 受信ネットワークトラフィックの現在の速度を追跡します        |
| Concurrent network connections | 現在の同時ネットワーク接続数を追跡します |


## 高度なダッシュボードを使用した問題の特定 {#identifying-issues-with-the-advanced-dashboard}

ClickHouseサービスの健全性をリアルタイムで把握することで、ビジネスに影響を与える前に問題を軽減したり、解決したりすることができます。以下は、高度なダッシュボードを使用して発見できる問題の例です。

### バッチ化されていない挿入 {#unbatched-inserts}

[ベストプラクティスドキュメント](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)で説明されているように、同期的に実行できる場合は、常にClickHouseにデータを一括挿入することが推奨されます。

適切なバッチサイズでの一括挿入により、取り込み中に作成されるパート数が削減され、ディスクへの書き込みがより効率的になり、マージ操作も少なくなります。

最適化されていない挿入を発見するための主要なメトリクスは、**Inserted Rows/sec**と**Max Parts for Partition**です。

<Image img={InsertedRowsSec} size='lg' alt='Unbatched inserts' />

上記の例では、13時から14時の間に**Inserted Rows/sec**と**Max Parts for Partition**に2つのスパイクが見られます。これは、適切な速度でデータを取り込んでいることを示しています。

その後、16時以降に**Max Parts for Partition**に別の大きなスパイクが見られますが、**Inserted Rows/sec speed**は非常に遅くなっています。生成されるデータ量が非常に少ないにもかかわらず、多くのパートが作成されており、これはパートのサイズが最適でないことを示しています。

### リソース集約的なクエリ {#resource-intensive-query}

CPUやメモリなど、大量のリソースを消費するSQLクエリを実行することは一般的です。しかし、これらのクエリを監視し、デプロイメント全体のパフォーマンスへの影響を理解することが重要です。

クエリスループットの変化がないにもかかわらず、リソース消費量が突然変化する場合、より高コストなクエリが実行されていることを示している可能性があります。実行しているクエリの種類によっては予想されることですが、高度なダッシュボードからそれらを発見することは有益です。

以下は、実行される1秒あたりのクエリ数が大きく変化していないにもかかわらず、CPU使用率がピークに達している例です。

<Image img={ResourceIntensiveQuery} size='lg' alt='Resource intensive query' />

### 不適切なプライマリキー設計 {#bad-primary-key-design}

高度なダッシュボードを使用して発見できるもう1つの問題は、不適切なプライマリキー設計です。["ClickHouseにおけるプライマリインデックスの実践的な入門"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)で説明されているように、ユースケースに最適なプライマリキーを選択することで、クエリを実行するためにClickHouseが読み取る必要がある行数を削減し、パフォーマンスが大幅に向上します。

プライマリキーの潜在的な改善点を発見するために追跡できるメトリクスの1つは、**Selected Rows per second**です。選択される行数の突然のピークは、全体的なクエリスループットの一般的な増加と、クエリを実行するために大量の行を選択するクエリの両方を示している可能性があります。

<Image img={SelectedRowsPerSecond} size='lg' alt='Resource intensive query' />

タイムスタンプをフィルタとして使用することで、`system.query_log`テーブル内のピーク時に実行されたクエリを見つけることができます。

例えば、特定の日の午前11時から午前11時30分の間に実行されたすべてのクエリを表示するクエリを実行して、どのクエリが過剰な行数を読み取っているかを理解します。

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

```


Row 2:
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:26:50
query&#95;duration&#95;ms: 7325
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;no&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         150957260
tables:            [&#39;default.amazon&#95;reviews&#95;no&#95;pk&#39;]

Row 3:
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:24:10
query&#95;duration&#95;ms: 3270
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         6242304
tables:            [&#39;default.amazon&#95;reviews&#95;pk&#39;]

Row 4:
──────
type:              QueryFinish
event&#95;time:        2024-12-23 11:28:10
query&#95;duration&#95;ms: 2786
query:             SELECT
toStartOfMonth(review&#95;date) AS month,
any(product&#95;title),
avg(star&#95;rating) AS avg&#95;stars
FROM amazon&#95;reviews&#95;pk
WHERE
product&#95;category = &#39;Home&#39;
GROUP BY
month,
product&#95;id
ORDER BY
month DESC,
product&#95;id ASC
LIMIT 20
read&#95;rows:         6242304
tables:            [&#39;default.amazon&#95;reviews&#95;pk&#39;]

```

この例では、同じクエリが2つのテーブル `amazon_reviews_no_pk` と `amazon_reviews_pk` に対して実行されていることがわかります。これから、`amazon_reviews` テーブルのプライマリキーオプションをテストしていたことが推測できます。
```
