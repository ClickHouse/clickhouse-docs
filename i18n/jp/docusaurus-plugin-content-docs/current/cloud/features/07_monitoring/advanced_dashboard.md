---
description: 'ClickHouse Cloud の高度なダッシュボード'
keywords: ['モニタリング', 'オブザーバビリティ', '高度なダッシュボード', 'ダッシュボード', 'オブザーバビリティダッシュボード']
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

本番環境でデータベースシステムを監視することは、デプロイメントの健全性を把握し、障害の発生を未然に防いだり、発生した障害を解決したりするうえで極めて重要です。

Advanced Dashboard は、ClickHouse システムとその周辺環境について深いインサイトを得られるよう設計された軽量ツールであり、パフォーマンスボトルネックやシステム障害、非効率な箇所を早期に把握するのに役立ちます。

Advanced Dashboard は ClickHouse OSS（Open Source Software）と Cloud の両方で利用できます。本記事では、Cloud で Advanced Dashboard を使用する方法を説明します。

## 高度なダッシュボードへのアクセス {#accessing-the-advanced-dashboard}

高度なダッシュボードには、次の手順でアクセスできます。

* 左側パネル
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>

## ネイティブの高度なダッシュボードへのアクセス {#accessing-the-native-advanced-dashboard}

ネイティブの高度なダッシュボードには、次の手順でアクセスできます。

* 左側のパネル
  * `Monitoring` → `Advanced dashboard`
  * `You can still access the native advanced dashboard.` をクリックします

これにより、新しいタブでネイティブの高度なダッシュボードが開きます。ダッシュボードにアクセスするには認証が必要です。

<Image img={NativeAdvancedDashboard} size="lg" alt="高度なダッシュボード"/>

各ビジュアライゼーションには、その表示内容を構成するための SQL クエリが対応付けられています。ペンのアイコンをクリックすると、このクエリを編集できます。

<Image img={EditVisualization} size="lg" alt="高度なダッシュボード"/>

## すぐに使える可視化 {#out-of-box-visualizations}

Advanced Dashboard のデフォルトチャートは、ClickHouse システムの状態をリアルタイムに
可視化できるよう設計されています。以下は各チャートの一覧と説明です。
チャートは参照しやすいよう、3 つのカテゴリにグループ化されています。

### ClickHouse 固有 {#clickhouse-specific}

これらのメトリクスは、ClickHouse インスタンスの健全性とパフォーマンスを監視するために最適化されています。

| Metric                    | Description                                                                                          |
|---------------------------|------------------------------------------------------------------------------------------------------|
| Queries Per Second        | 処理されているクエリのレートを追跡します                                                             |
| Selected Rows/Sec         | クエリによって読み取られている行数を示します                                                         |
| Inserted Rows/Sec         | データのインジェストレートを測定します                                                               |
| Total MergeTree Parts     | MergeTree テーブル内のアクティブなパーツ数を表示し、バッチ化されていない挿入の特定に役立ちます       |
| Max Parts for Partition   | 任意のパーティション内のパーツ数の最大値を示します                                                   |
| Queries Running           | 現在実行中のクエリ数を表示します                                                                     |
| Selected Bytes Per Second | クエリによって読み取られているデータ量を示します                                                     |

### システムヘルス固有 {#system-health-specific}

基盤となるシステムの監視は、ClickHouse 自体の監視と同じくらい重要です。

| Metric                    | Description                                                              |
|---------------------------|--------------------------------------------------------------------------|
| IO Wait                   | I/O の待ち時間を追跡します                                               |
| CPU Wait                  | CPU リソース競合によって生じる遅延を測定します                           |
| Read From Disk            | ディスクまたはブロックデバイスから読み取られたバイト数を追跡します      |
| Read From Filesystem      | ページキャッシュを含むファイルシステムから読み取られたバイト数を追跡します |
| Memory (tracked, bytes)   | ClickHouse によって追跡されているプロセスのメモリ使用量を表示します      |
| Load Average (15 minutes) | システムの現在の 15 分間のロードアベレージ（負荷平均）を表示します       |
| OS CPU Usage (Userspace)  | ユーザー空間コード実行時の CPU 使用率を示します                         |
| OS CPU Usage (Kernel)     | カーネルコード実行時の CPU 使用率を示します                             |

## ClickHouse Cloud 固有 {#clickhouse-cloud-specific}

ClickHouse Cloud はオブジェクトストレージ（S3 タイプ）を使ってデータを保存します。このインターフェイスを監視することで、問題の検知に役立ちます。

| Metric                         | Description                                           |
|--------------------------------|-------------------------------------------------------|
| S3 Read wait                   | S3 への読み取りリクエストのレイテンシ                 |
| S3 read errors per second      | 秒あたりの読み取りエラー数                            |
| Read From S3 (bytes/sec)       | S3 ストレージから読み取られるデータレート（バイト/秒） |
| Disk S3 write req/sec          | S3 ストレージへの書き込み操作頻度                     |
| Disk S3 read req/sec           | S3 ストレージからの読み取り操作頻度                   |
| Page cache hit rate            | ページキャッシュのヒット率                            |
| Filesystem cache hit rate      | ファイルシステムキャッシュのヒット率                  |
| Filesystem cache size          | ファイルシステムキャッシュの現在のサイズ              |
| Network send bytes/sec         | 送信ネットワークトラフィックの現在の速度              |
| Network receive bytes/sec      | 受信ネットワークトラフィックの現在の速度              |
| Concurrent network connections | 現在の同時ネットワーク接続数                          |

## 高度なダッシュボードを使用した問題の特定 {#identifying-issues-with-the-advanced-dashboard}

ClickHouse サービスのヘルスをリアルタイムで可視化することで、ビジネスに影響が出る前に問題を緩和したり、発生した問題の解決に大きく役立ちます。以下では、高度なダッシュボードを使って検知できる代表的な問題をいくつか紹介します。

### バッチ化されていない挿入 {#unbatched-inserts}

[ベストプラクティスのドキュメント](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)で説明している通り、同期的に処理できる場合は、常にデータを一括で ClickHouse に挿入することが推奨されます。

適切なバッチサイズでの一括挿入は、インジェスト中に作成されるパーツ数を減らし、ディスクへの書き込みをより効率化するとともに、マージ処理の回数も減らします。

最適化されていない挿入を見つけるための主要なメトリクスは **Inserted Rows/sec** と
**Max Parts for Partition** です。

<Image img={InsertedRowsSec} size="lg" alt="バッチ化されていない挿入" />

上の例では、13 時から 14 時の間に **Inserted Rows/sec** と **Max Parts for Partition** に 2 回のスパイクがあることが分かります。これは、妥当な速度でデータを取り込めていることを示しています。

その後、16 時以降に **Max Parts for Partition** に大きなスパイクがある一方で、
**Inserted Rows/sec の速度** は非常に遅くなっていることが分かります。ごく少量のデータしか生成していないにもかかわらず、多数のパーツが作成されており、パーツのサイズが最適化されていないことを示しています。

### リソース負荷の高いクエリ {#resource-intensive-query}

CPU やメモリなど、多量のリソースを消費する SQL クエリを実行することは一般的です。しかし、これらのクエリを監視し、デプロイメント全体のパフォーマンスへの影響を理解することが重要です。

クエリスループットが変化していないにもかかわらず、リソース消費に急激な変化が見られる場合、より高コストなクエリが実行されている可能性があります。実行しているクエリの種類によっては想定内であることもありますが、高度なダッシュボードからそれらを検知できるのは有用です。

以下は、1 秒あたりに実行されるクエリ数が大きく変化していないにもかかわらず、CPU 使用率だけがピークに達している例です。

<Image img={ResourceIntensiveQuery} size="lg" alt="リソース負荷の高いクエリ" />

### 不適切なプライマリキー設計 {#bad-primary-key-design}

高度なダッシュボードを使うことで、不適切なプライマリキー設計も検知できます。
[&quot;A practical introduction to primary indexes in ClickHouse&quot;](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key) で説明しているように、利用ケースに最も適したプライマリキーを選択することで、ClickHouse がクエリ実行時に読み取る必要のある行数を減らし、大幅なパフォーマンス向上が期待できます。

プライマリキーの改善余地を見極めるために追跡できるメトリクスの 1 つが
**Selected Rows per second** です。選択された行数に突然のピークが見られる場合、全体的なクエリスループットの増加だけでなく、クエリの実行に大量の行を選択しているクエリが存在している可能性を示します。

<Image img={SelectedRowsPerSecond} size="lg" alt="リソース負荷の高いクエリ" />

タイムスタンプをフィルタとして使用すると、ピーク時に実行されたクエリを
`system.query_log` テーブルから特定できます。

例えば、ある日の 11 時台に実行されたすべてのクエリを表示するクエリを実行し、どのクエリが過剰な行数を読み取っているのかを把握できます。

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
```

2 行目:
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

3 行目:
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

4 行目:
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

この例では、同じクエリが2つのテーブル `amazon_reviews_no_pk` と `amazon_reviews_pk` に対して実行されています。これにより、`amazon_reviews` テーブルのプライマリキーオプションがテストされていたことがわかります。
```
