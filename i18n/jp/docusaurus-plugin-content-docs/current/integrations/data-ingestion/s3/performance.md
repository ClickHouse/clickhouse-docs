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


## 挿入メカニズム（単一ノード） \\{#insert-mechanics-single-node\\}

ハードウェアの規模に加えて、ClickHouse のデータ挿入メカニズム（単一ノード）のパフォーマンスとリソース使用量に影響を与える主な要因は 2 つあります。**挿入ブロックサイズ** と **挿入の並列度** です。

### 挿入ブロックサイズ \{#insert-block-size\}

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

挿入ブロック内に指定した行数が集まるか、設定したデータ量に到達すると（先に到達した方）、その時点でブロックが新しいパートとして書き込まれます。挿入ループはステップ ① に戻ります。

`min_insert_block_size_bytes` の値は、圧縮前のメモリ上のブロックサイズ（オンディスクの圧縮後パートサイズではない）を表す点に注意してください。また、ClickHouse はデータを行単位ではなく[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングおよび[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、作成されるブロックおよびパートが設定された行数やバイト数を厳密に満たすことはほとんどありません。そのため、これらの設定は最小しきい値を指定するものです。


#### マージに注意する \{#be-aware-of-merges\}

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

CPU コア数と RAM サイズを[増やす](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size)と、バックグラウンドマージのスループットが向上します。

より大きなパートにマージされたパートは [inactive](/operations/system-tables/parts) としてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime) 分単位の時間が経過すると最終的に削除されます。時間の経過とともに、これによってマージされたパートのツリーが構築されます（これが [`MergeTree`](/engines/table-engines/mergetree-family) テーブルという名前の由来です）。


### 挿入の並列性 \{#insert-parallelism\}

<Image img={ResourceUsage} size="lg" border alt="Insert parallelism におけるリソース使用量" />

ClickHouse サーバーは、データを並列に処理して挿入できます。挿入の並列度は、ClickHouse サーバーの取り込みスループットとメモリ使用量に影響します。データを並列に読み込み・処理するにはより多くのメインメモリが必要ですが、データ処理が高速になるため取り込みスループットが向上します。

s3 のようなテーブル関数では、グロブパターンを使って読み込み対象ファイル名の集合を指定できます。グロブパターンが複数の既存ファイルにマッチする場合、ClickHouse はそれらのファイル間およびファイル内で読み取りを並列化し、サーバーごとに並列で実行される挿入スレッドを利用して、データをテーブルに並列挿入できます。

<Image img={InsertThreads} size="lg" border alt="ClickHouse における並列挿入スレッド" />

すべてのファイルのすべてのデータが処理されるまで、各挿入スレッドは次のループを実行します:

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

このような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 設定で指定できます。デフォルト値は、オープンソース版 ClickHouse では `1`、[ClickHouse Cloud](https://clickhouse.com/cloud) では `4` です。

大量のファイルがある場合、複数の挿入スレッドによる並列処理が有効に機能します。これにより、利用可能な CPU コアおよびネットワーク帯域幅（ファイルの並列ダウンロード）を十分に使い切ることができます。少数の大きなファイルだけをテーブルにロードするシナリオでは、ClickHouse は自動的に高いレベルのデータ処理並列性を実現し、各挿入スレッドごとに追加のリーダースレッドを生成して、大きなファイル内のより多くの別々の範囲を並列に読み取り（ダウンロード）することでネットワーク帯域幅の使用を最適化します。

`s3` 関数およびテーブルの場合、個々のファイルの並列ダウンロードは [max&#95;download&#95;threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) と [max&#95;download&#95;buffer&#95;size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) の値によって決まります。ファイルサイズが `2 * max_download_buffer_size` より大きい場合にのみ、ファイルは並列でダウンロードされます。デフォルトでは、`max_download_buffer_size` は 10MiB に設定されています。場合によっては、各ファイルが単一スレッドによってダウンロードされるようにすることを目的として、このバッファサイズを 50 MB（`max_download_buffer_size=52428800`）まで安全に増やすことができます。これにより、各スレッドが行う S3 呼び出しに要する時間を短縮でき、その結果として S3 の待ち時間も短縮されます。さらに、並列読み取りには小さすぎるファイルについてスループットを向上させるために、ClickHouse はそのようなファイルを非同期に先読みすることでデータを自動的にプリフェッチします。


## パフォーマンスの測定 \\{#measuring-performance\\}

S3 テーブル関数を使用するクエリのパフォーマンス最適化は、次の 2 つのケースで必要になります。1 つ目は、S3 上のデータをその場に置いたままクエリする場合、すなわちデータは元の形式のまま S3 に残し、ClickHouse の計算リソースのみを使用するアドホッククエリの場合、2 つ目は、S3 から ClickHouse の MergeTree テーブルエンジンにデータを挿入する場合です。特に明記がない限り、以下の推奨事項は両方のシナリオに適用されます。

## ハードウェア規模の影響 \\{#impact-of-hardware-size\\}

<Image img={HardwareSize} size="lg" border alt="ハードウェア規模が ClickHouse のパフォーマンスに与える影響" />

利用可能な CPU コア数と RAM 容量は、次の点に影響します。

- サポートされる[パーツの初期サイズ](#insert-block-size)
- 可能な[挿入処理の並列度](#insert-parallelism)
- [バックグラウンドでのパーツマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)のスループット

したがって、取り込み全体のスループットにも影響します。

## リージョンのローカリティ \\{#region-locality\\}

バケットが ClickHouse インスタンスと同じリージョンに存在することを確認してください。この簡単な最適化により、特に ClickHouse インスタンスを AWS のインフラストラクチャ上にデプロイしている場合、スループットが大幅に向上する可能性があります。

## フォーマット \\{#formats\\}

ClickHouse は、`s3` 関数および `S3` エンジンを使用して、S3 バケットに保存されたファイルを [サポートされているフォーマット](/interfaces/formats#formats-overview) で読み取ることができます。元のファイルを直接読み取る場合、これらのフォーマットにはいくつかの明確な利点があります。

* Native、Parquet、CSVWithNames、TabSeparatedWithNames のようにカラム名がエンコードされているフォーマットでは、ユーザーが `s3` 関数にカラム名を指定する必要がないため、クエリが簡潔になります。カラム名からこの情報を推論できます。
* フォーマットごとに、読み書きスループットの観点で性能が異なります。Native と Parquet はすでにカラム指向であり、よりコンパクトであるため、読み取り性能の点で最適なフォーマットです。Native フォーマットはさらに、ClickHouse がメモリ内にデータを格納する方法と整合しているため、データが ClickHouse にストリーミングされる際の処理オーバーヘッドを削減できます。
* ブロックサイズは、大きなファイルの読み取りレイテンシにしばしば影響します。これは、たとえば先頭 N 行だけを返すなど、データをサンプリングする場合に顕著です。CSV や TSV のようなフォーマットでは、行の集合を返すためにファイルをパースする必要があります。Native や Parquet のようなフォーマットでは、この結果としてより高速なサンプリングが可能になります。
* 各圧縮フォーマットには一長一短があり、多くの場合、圧縮率と速度、および圧縮・解凍それぞれの性能のバランスを取ります。CSV や TSV のような元のファイルを圧縮する場合、lz4 は圧縮率を犠牲にする代わりに、最速の解凍性能を提供します。Gzip は一般的に、読み取り速度がわずかに低下する代わりに、より高い圧縮率を実現します。Xz はこれをさらに推し進め、通常は最も高い圧縮率を提供しますが、圧縮および解凍の性能は最も低くなります。エクスポートする場合、Gz と lz4 は概ね同程度の圧縮速度を提供します。これを接続速度と比較して検討してください。解凍や圧縮が高速になることによる利点は、S3 バケットへの接続が遅いと簡単に相殺されてしまいます。
* Native や Parquet のようなフォーマットでは、通常、圧縮のオーバーヘッドを正当化できません。これらのフォーマットは本質的にコンパクトであるため、データサイズ削減の効果は小さいことが多いです。圧縮および解凍に費やす時間は、ネットワーク転送時間を相殺することはほとんどありません。特に S3 はグローバルに利用可能であり、高いネットワーク帯域幅を持つため、なおさらです。

## 例となるデータセット \{#example-dataset\}

さらなる最適化の可能性を示すために、ここでは [Stack Overflow データセットの投稿](/data-modeling/schema-design#stack-overflow-dataset) を利用し、このデータに対するクエリおよび書き込みパフォーマンスの両方を最適化していきます。

このデータセットは 189 個の Parquet ファイルで構成されており、2008 年 7 月から 2024 年 3 月までの各月につき 1 ファイルずつ存在します。

[上記の推奨事項](#formats) に従い、パフォーマンス向上のために Parquet を使用し、すべてのクエリをバケットと同じリージョンに配置された ClickHouse クラスター上で実行しています。このクラスターは 3 ノードで構成され、各ノードは 32GiB の RAM と 8 vCPU を備えています。

チューニングなしの状態で、このデータセットを MergeTree テーブルエンジンに挿入する際のパフォーマンスと、最も多く質問を投稿しているユーザーを算出するクエリを実行する際のパフォーマンスを示します。これら 2 つのクエリはいずれも、意図的にデータのフルスキャンを必要とします。

```sql
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
```

この例では、数行のみを返しています。大量のデータをクライアントに返す `SELECT` クエリのパフォーマンスを測定する場合は、クエリで [null format](/interfaces/formats/Null) を利用するか、結果を [`Null` engine](/engines/table-engines/special/null.md) に送るようにしてください。これにより、クライアントが過剰なデータ量で圧迫されたり、ネットワークが飽和したりすることを防げます。

:::info
クエリを実行して読み取りを行う際、同じクエリを繰り返し実行した場合と比べて、最初のクエリが遅く見えることがよくあります。これは、S3 側のキャッシュと [ClickHouse Schema Inference Cache](/operations/system-tables/schema_inference_cache) の両方によるものです。後者はファイルに対して推論されたスキーマを保存するため、後続のアクセスではスキーマ推論ステップを省略でき、その結果クエリ時間を短縮できます。
:::


## 読み取りにスレッドを使用する \{#using-threads-for-reads\}

S3 上での読み取りパフォーマンスは、ネットワーク帯域幅やローカル I/O によって制限されない限り、コア数に比例してスケールします。スレッド数を増やすと追加のメモリオーバーヘッドも発生するため、ユーザーはこれを理解しておく必要があります。読み取りスループットを向上させるために、次の項目を調整できます。

* 通常、`max_threads` のデフォルト値、すなわちコア数で十分です。クエリで使用されるメモリ量が多く、これを削減する必要がある場合、あるいは結果に対する `LIMIT` が小さい場合には、この値をより小さく設定できます。メモリに十分な余裕がある環境では、S3 からの読み取りスループット向上の可能性を確認するために、この値を増やしてみることもできます。一般的に、これはコア数が少ないマシン、すなわち 10 未満の場合にのみ有益です。さらなる並列化によるメリットは、ネットワークや CPU の競合など、他のリソースがボトルネックとして働くにつれて通常は減少します。
* ClickHouse 22.3.1 より前のバージョンでは、`s3` 関数または `S3` テーブルエンジンを使用した場合にのみ、複数ファイルにまたがる読み取りが並列化されていました。このため、ユーザーは最適な読み取り性能を達成するために、S3 上のファイルをチャンクに分割し、glob パターンを使って読み取る必要がありました。後続のバージョンでは、ファイル内でのダウンロードも並列化されるようになっています。
* スレッド数が少ないシナリオでは、`remote_filesystem_read_method` を &quot;read&quot; に設定して、S3 からのファイル読み取りを同期的に実行することでメリットを得られる場合があります。
* `s3` 関数およびテーブルにおいて、個々のファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads) と [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) の値によって決定されます。[`max_download_threads`](/operations/settings/settings#max_download_threads) は使用されるスレッド数を制御しますが、ファイルが並列にダウンロードされるのは、そのサイズが 2 * `max_download_buffer_size` より大きい場合のみです。デフォルトでは、`max_download_buffer_size` は 10MiB に設定されています。場合によっては、このバッファサイズを安全に 50 MB (`max_download_buffer_size=52428800`) まで増やし、小さなファイルが単一スレッドによってのみダウンロードされるようにすることができます。これにより、各スレッドが S3 呼び出しに費やす時間を減らし、S3 の待機時間も短縮できます。具体例については [このブログ記事](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge) を参照してください。

パフォーマンス改善のために変更を加える前に、適切に計測していることを確認してください。S3 API コールはレイテンシに敏感であり、クライアント側のタイミングに影響を与える可能性があるため、パフォーマンスメトリクスには `system.query_log` などのクエリログを使用してください。

先ほどのクエリを例に取ると、`max_threads` を `16` に倍増させることで（デフォルトの `max_thread` はノード上のコア数）、メモリ消費が増える代わりに読み取りクエリ性能を 2 倍に向上させることができます。`max_threads` をそれ以上増やしても、以下に示すように効果は逓減します。

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
```


## INSERT におけるスレッド数とブロックサイズのチューニング \{#tuning-threads-and-block-size-for-inserts\}

インジェスト性能を最大化するには、(1) INSERT のブロックサイズ、(2) INSERT の並列度を、(3) 利用可能な CPU コア数と RAM 容量に基づいて選択・設定する必要があります。まとめると次のとおりです。

* [INSERT のブロックサイズ](#insert-block-size) を大きく設定すればするほど、ClickHouse が作成しなければならないパーツの数が減り、必要となる [ディスクファイル I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) と[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) の回数も減少します。
* [並列 INSERT スレッド数](#insert-parallelism) を多く設定すればするほど、データはより高速に処理されます。

これら 2 つの性能要因の間には、互いに相反するトレードオフ（さらにバックグラウンドでのパーツマージとのトレードオフ）があります。ClickHouse サーバーで利用可能なメインメモリ量には上限があります。ブロックを大きくするとメインメモリの使用量が増えるため、利用可能な並列 INSERT スレッド数が制限されます。逆に、並列 INSERT スレッド数を増やすと、メモリ内で同時に生成される INSERT ブロック数が増えるため、より多くのメインメモリを必要とします。その結果、設定できる INSERT ブロックサイズが制限されます。さらに、INSERT スレッドとバックグラウンドマージスレッドの間でリソース競合が発生する可能性があります。INSERT スレッド数を多く設定すると、(1) マージ対象となるパーツがより多く作成され、(2) バックグラウンドマージスレッドが利用できる CPU コアとメモリ領域が奪われます。

これらのパラメータの動作がパフォーマンスとリソースにどのような影響を与えるかについての詳細な説明は、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2) を参照してください。このブログ記事で説明されているように、チューニングには 2 つのパラメータ間の慎重なバランス調整が関わります。このような網羅的なテストを行うのは実務上困難な場合が多いため、要約として次の推奨事項があります。

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この式を使うと、`min_insert_block_size_rows` を 0（行ベースのしきい値を無効にする）に設定しつつ、`max_insert_threads` を任意の値に設定し、`min_insert_block_size_bytes` を上記の式から計算された結果に設定できます。

先ほどの Stack Overflow の例にこの式を適用します。

* `max_insert_threads=4`（ノードあたり 8 コア）
* `peak_memory_usage_in_bytes` は 32 GiB（ノードリソースの 100%）、すなわち `34359738368` バイト
* `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

示したように、これらの設定を調整することで、挿入パフォーマンスは `33%` 以上向上しました。単一ノードでのパフォーマンスをさらに向上できるかどうかは、読者の検証に委ねます。


## リソースおよびノードによるスケーリング \\{#scaling-with-resources-and-nodes\\}

リソースおよびノードによるスケーリングは、読み取りクエリと挿入クエリの両方に適用されます。

### 垂直スケーリング \{#vertical-scaling\}

これまでのすべてのチューニングとクエリは、ClickHouse Cloud クラスター内の単一ノードのみを使用していました。実際には、多くの場合、複数の ClickHouse ノードを利用できるでしょう。まずは垂直スケーリングを行い、コア数に応じて S3 のスループットを線形に向上させることを推奨します。以前の挿入クエリと読み取りクエリを、リソースを 2 倍（64GiB、16 vCPU）にした、より大きな ClickHouse Cloud ノード上で適切な設定とともに再実行すると、どちらもおおよそ 2 倍の速度で実行されます。

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
```

:::note
個々のノードはネットワークや S3 の GET リクエストによってボトルネックとなる場合もあり、その結果、垂直方向の性能が線形にはスケールしなくなります。
:::


### 水平スケーリング \{#horizontal-scaling\}

最終的には、ハードウェアの入手性やコスト効率の観点から、水平スケーリングが必要になることがよくあります。ClickHouse Cloud では、本番クラスターは少なくとも 3 ノードで構成されています。そのため、挿入処理にすべてのノードを利用したい場合もあるでしょう。

S3 からの読み取りにクラスターを利用するには、[Utilizing Clusters](/integrations/s3#utilizing-clusters) で説明されているように `s3Cluster` 関数を使用する必要があります。これにより、読み取りをノード間で分散できます。

挿入クエリを最初に受信したサーバーは、まずグロブパターンを解決してから、一致した各ファイルの処理を自分自身および他のサーバーに動的に割り当てます。

<Image img={S3Cluster} size="lg" border alt="ClickHouse における s3Cluster 関数" />

以前の読み取りクエリを再度実行し、`s3Cluster` を使用するようにクエリを調整して、ワークロードを 3 ノードに分散します。ClickHouse Cloud では、`default` クラスターを参照することで、これは自動的に実行されます。

[Utilizing Clusters](/integrations/s3#utilizing-clusters) で述べたように、この処理はファイル単位で分散されます。この機能の恩恵を受けるには、ユーザーは十分な数のファイル、つまり少なくともノード数を上回るファイル数を用意する必要があります。

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
```

同様に、単一ノード向けに前述で調整した改善済みの設定を使用して、挿入クエリも分散実行できます。

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

読者は、ファイル読み取りのクエリ性能は向上した一方で、挿入性能は改善していないことに気付くでしょう。デフォルトでは、読み取りは `s3Cluster` を使用して分散されますが、挿入はイニシエーターノードに対して行われます。これは、各ノードで読み取りが実行されても、結果の行は分散のためにイニシエーターノードへルーティングされることを意味します。高スループットなシナリオでは、これがボトルネックとなる可能性があります。これに対処するには、`s3cluster` 関数に対してパラメーター `parallel_distributed_insert_select` を設定します。

これを `parallel_distributed_insert_select=2` に設定すると、各ノード上の分散エンジンの基になるテーブルに対して、`SELECT` と `INSERT` が各分片で実行されるようになります。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

予想どおり、これにより挿入性能は 3 倍低下します。


## さらなるチューニング \\{#further-tuning\\}

### 重複排除の無効化 \{#disable-de-duplication\}

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが実際に挿入されたかどうかは分からないことがあります。クライアント側で安全に挿入を再試行できるようにするため、ClickHouse Cloud のような分散デプロイメントでは、デフォルトで ClickHouse がそのデータがすでに正常に挿入されているかどうかを確認しようとします。挿入されたデータが重複とマークされた場合、ClickHouse はそれを宛先テーブルに挿入しません。ただし、ユーザー側には、あたかもデータが通常どおり挿入されたかのように、操作成功ステータスが返されます。

この挙動は、クライアントからのデータロードやバッチ処理では挿入時のオーバーヘッドがかかるものの妥当ですが、オブジェクトストレージ上のデータに対して `INSERT INTO SELECT` を実行する場合には不要な場合があります。挿入時にこの機能を無効にすることで、以下に示すようにパフォーマンスを向上できます。

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```


### 挿入時の最適化 \{#optimize-on-insert\}

ClickHouse では、`optimize_on_insert` 設定は挿入処理中にデータパーツをマージするかどうかを制御します。有効な場合（デフォルトで `optimize_on_insert = 1`）、小さなパーツは挿入時により大きなパーツにマージされ、読み取る必要があるパーツ数を減らすことでクエリ性能を向上させます。ただし、このマージ処理は挿入処理にオーバーヘッドを追加するため、高スループットの挿入を遅くする可能性があります。

この設定を無効化すると（`optimize_on_insert = 0`）、挿入時のマージがスキップされ、特に小さな挿入が頻繁に発生する場合にデータを書き込みやすくなります。マージ処理はバックグラウンドに延期されるため、挿入性能は向上しますが、その完了までの間は小さなパーツ数が一時的に増加し、バックグラウンドマージが完了するまでクエリが遅くなる可能性があります。この設定は、挿入性能を優先し、後でバックグラウンドマージ処理によって効率的に最適化できる場合に最適です。以下に示すように、この設定を無効化することで挿入スループットを向上できます。

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```


## その他の注意事項 \\{#misc-notes\\}

* メモリが制約された環境では、S3 へのデータ挿入時に `max_insert_delayed_streams_for_parallel_write` の値を下げることを検討してください。