---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: 'パフォーマンス最適化'
title: 'S3 の書き込みおよび読み取りパフォーマンスの最適化'
description: 'S3 の読み取りおよび書き込みパフォーマンスの最適化'
doc_type: 'guide'
keywords: ['s3', 'performance', 'optimization', 'object storage', 'data loading']
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

このセクションでは、[s3 テーブル関数](/sql-reference/table-functions/s3) を使用して S3 からデータを読み取りおよび挿入する際のパフォーマンス最適化に焦点を当てます。

:::info
**本ガイドで説明する手法は、[GCS](/sql-reference/table-functions/gcs) や [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage) など、独自の専用テーブル関数を持つ他のオブジェクトストレージ実装にも適用できます。**
:::

挿入パフォーマンスを向上させるためにスレッド数やブロックサイズをチューニングする前に、まずは S3 への INSERT の仕組みを理解することをお勧めします。すでに INSERT の仕組みに慣れている場合や、すぐに役立つヒントだけを知りたい場合は、以下の[サンプルデータセット](/integrations/s3/performance#example-dataset)に進んでください。

## 挿入メカニズム（単一ノード） {#insert-mechanics-single-node}

ハードウェアの規模に加えて、ClickHouse のデータ挿入メカニズム（単一ノード）のパフォーマンスとリソース使用量に影響を与える主な要因は 2 つあります。**挿入ブロックサイズ** と **挿入の並列度** です。

### 挿入ブロックサイズ {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouse における挿入ブロックサイズのメカニズム" />

`INSERT INTO SELECT` を実行する際、ClickHouse はデータの一部を受け取り、受信したデータから ① メモリ上に（少なくとも 1 つ、[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) ごとに）挿入ブロックを形成します。ブロック内のデータはソートされ、テーブルエンジン固有の最適化が適用されます。その後、データは圧縮され、② 新しい data part の形式でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouse サーバーの [ディスクファイル I/O 使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems) とメモリ使用量の両方に影響します。より大きな挿入ブロックはより多くのメモリを使用しますが、より大きく数の少ない初期の data part を生成します。大量のデータをロードする際に ClickHouse が作成する必要がある part の数が少ないほど、必要なディスクファイル I/O と自動[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)は少なくなります。

`INSERT INTO SELECT` クエリをインテグレーションテーブルエンジンまたはテーブル関数と組み合わせて使用する場合、データは ClickHouse サーバー側からプルされます。

<Image img={Pull} size="lg" border alt="ClickHouse における外部ソースからのデータプル" />

データが完全にロードされるまで、サーバーはループを実行し続けます。

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

①では、サイズは挿入ブロックサイズに依存し、これは次の 2 つの設定で制御できます。

* [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（デフォルト: `1048545` 百万行）
* [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（デフォルト: `256 MiB`）

挿入ブロック内に指定した行数が集まるか、設定したデータ量に到達すると（先に到達した方）、そのタイミングでブロックが新しいパートとして書き込まれます。挿入ループはステップ ① に戻ります。

`min_insert_block_size_bytes` の値は、圧縮前のメモリ上のブロックサイズ（オンディスクの圧縮後パートサイズではない）を表す点に注意してください。また、ClickHouse はデータを行単位ではなく[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングおよび[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、作成されるブロックおよびパートが設定された行数やバイト数を厳密に満たすことはほとんどありません。そのため、これらの設定は最小しきい値を指定するものです。

#### マージに注意する {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量データロード時に作成される初期パートの数が増え、データのインジェストと同時にバックグラウンドのパートマージがより多く実行されます。これにより、リソース（CPU とメモリ）の競合が発生し、インジェスト完了後に[健全な](/operations/settings/merge-tree-settings#parts_to_throw_insert)（3000）パート数に到達するまでに追加の時間が必要になる可能性があります。

:::important
パート数が[推奨上限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouse のクエリパフォーマンスは悪化します。
:::

ClickHouse は、圧縮サイズが約 150 GiB に[到達](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)するまで、継続的に[パートをマージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)して、より大きなパートにまとめます。次の図は、ClickHouse サーバーがどのようにパートをマージするかを示しています。

<Image img={Merges} size="lg" border alt="ClickHouse におけるバックグラウンドマージ" />

1 台の ClickHouse サーバーは、複数の[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を使用して、同時に[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行します。各スレッドはループを実行します。

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

③ マージされたブロックをディスク上の新しいパートに書き込む。

① に戻る

````bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```bash
① 未処理のファイルデータの次の部分を取得し（部分サイズは設定されたブロックサイズに基づく）、そこからインメモリのデータブロックを作成する。

② そのブロックをストレージ上の新しいパーツに書き込む。

① に戻る。 
````sql
-- Top usernames
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 3.013 sec. Processed 59.82 million rows, 24.03 GB (19.86 million rows/s., 7.98 GB/s.)
Peak memory usage: 603.64 MiB.

-- Load into posts table
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```sql
-- トップユーザー名
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 行が返されました。経過時間: 3.013 秒。処理: 59.82 百万行、24.03 GB (19.86 百万行/秒、7.98 GB/秒)。
ピーク時メモリ使用量: 603.64 MiB。

-- posts テーブルにロード
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 行が返されました。経過時間: 191.692 秒。処理: 59.82 百万行、24.03 GB (312.06 千行/秒、125.37 MB/秒)。
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 1.505 sec. Processed 59.82 million rows, 24.03 GB (39.76 million rows/s., 15.97 GB/s.)
Peak memory usage: 178.58 MiB.

SETTINGS max_threads = 32

5 rows in set. Elapsed: 0.779 sec. Processed 59.82 million rows, 24.03 GB (76.81 million rows/s., 30.86 GB/s.)
Peak memory usage: 369.20 MiB.

SETTINGS max_threads = 64

5 rows in set. Elapsed: 0.674 sec. Processed 59.82 million rows, 24.03 GB (88.81 million rows/s., 35.68 GB/s.)
Peak memory usage: 639.99 MiB.
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 1.505 sec. Processed 59.82 million rows, 24.03 GB (39.76 million rows/s., 15.97 GB/s.)
Peak memory usage: 178.58 MiB.

SETTINGS max_threads = 32

5 rows in set. Elapsed: 0.779 sec. Processed 59.82 million rows, 24.03 GB (76.81 million rows/s., 30.86 GB/s.)
Peak memory usage: 369.20 MiB.

SETTINGS max_threads = 64

5 rows in set. Elapsed: 0.674 sec. Processed 59.82 million rows, 24.03 GB (88.81 million rows/s., 35.68 GB/s.)
Peak memory usage: 639.99 MiB.
```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```bash
• max_insert_threads: 挿入スレッド用に利用可能なCPUコアの約半分を選択します（バックグラウンドマージ用に十分な専用コアを確保するため）

• peak_memory_usage_in_bytes: 想定されるピークメモリ使用量を選択します。独立した取り込み処理の場合は利用可能なRAMをすべて使用するか、他の同時実行タスク用の余地を残すために半分以下にします

次に:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 67.294 sec. Processed 59.82 million rows, 24.03 GB (888.93 thousand rows/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 rows in set. Elapsed: 0.421 sec. Processed 59.82 million rows, 24.03 GB (142.08 million rows/s., 57.08 GB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 67.294 sec. Processed 59.82 million rows, 24.03 GB (888.93 thousand rows/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 rows in set. Elapsed: 0.421 sec. Processed 59.82 million rows, 24.03 GB (142.08 million rows/s., 57.08 GB/s.)
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 0.622 sec. Processed 59.82 million rows, 24.03 GB (96.13 million rows/s., 38.62 GB/s.)
Peak memory usage: 176.74 MiB.
```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 0.622 sec. Processed 59.82 million rows, 24.03 GB (96.13 million rows/s., 38.62 GB/s.)
Peak memory usage: 176.74 MiB.
```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## その他の注意事項 {#misc-notes}

* メモリが限られた環境では、S3 へのデータ挿入時に `max_insert_delayed_streams_for_parallel_write` の値を下げることを検討してください。
