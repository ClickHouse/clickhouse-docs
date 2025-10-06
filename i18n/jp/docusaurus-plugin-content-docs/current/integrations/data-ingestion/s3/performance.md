---
'slug': '/integrations/s3/performance'
'sidebar_position': 2
'sidebar_label': 'パフォーマンスの最適化'
'title': 'S3 挿入と読み取りパフォーマンスの最適化'
'description': 'S3 読み取りと挿入のパフォーマンスを最適化する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

このセクションでは、[s3 テーブル関数](/sql-reference/table-functions/s3) を使用して S3 からデータを読み込み、挿入するときのパフォーマンスを最適化することに焦点を当てています。

:::info
**このガイドで説明するレッスンは、[GCS](/sql-reference/table-functions/gcs) や [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage) のような、自分専用のテーブル関数を持つ他のオブジェクトストレージの実装にも適用できます。**
:::

スレッドやブロックサイズを調整して挿入パフォーマンスを向上させる前に、ユーザーは S3 挿入のメカニクスを理解することをお勧めします。挿入メカニクスに慣れている方、またはちょっとしたヒントがほしい方は、[以下](/integrations/s3/performance#example-dataset)の例に飛んでください。

## 挿入のメカニクス (単一ノード) {#insert-mechanics-single-node}

ハードウェアサイズに加えて、ClickHouse のデータ挿入メカニクス（単一ノード用）のパフォーマンスとリソース使用に影響を与える 2 つの主要な要素は、**挿入ブロックサイズ**と**挿入の並列性**です。

### 挿入ブロックサイズ {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="Insert block size mechanics in ClickHouse" />

`INSERT INTO SELECT` を実行すると、ClickHouse はデータの一部を受信し、受信したデータから（少なくとも）1 つのインメモリ挿入ブロックを形成します（[パーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごとに）。ブロックのデータはソートされ、テーブルエンジン固有の最適化が適用されます。その後、データは圧縮され、②新しいデータパートの形でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouse サーバーの [ディスクファイル I/O 使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems) とメモリ使用量の両方に影響します。大きな挿入ブロックはより多くのメモリを使いますが、初期パーツは大きく、数は少なくなります。ClickHouse が大量のデータを読み込むために作成する必要があるパーツが少ないほど、ディスクファイル I/O と自動の [バックグラウンドマージが必要](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) になります。

`INSERT INTO SELECT` クエリを統合テーブルエンジンまたはテーブル関数と組み合わせて使用すると、データは ClickHouse サーバーによってプルされます：

<Image img={Pull} size="lg" border alt="Pulling data from external sources in ClickHouse" />

データが完全に読み込まれるまで、サーバーはループを実行します：

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

①のサイズは挿入ブロックのサイズに依存し、これは次の 2 つの設定で制御できます：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (デフォルト: `1048545` 行)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (デフォルト: `256 MiB`)

挿入ブロックに指定された行数が集められるか、構成されたデータ量に達すると（どちらか早く達成される方）、ブロックが新しいパートに書き込まれます。挿入ループはステップ ① で続行します。

`min_insert_block_size_bytes` の値は、圧縮されていないインメモリブロックサイズ（圧縮されたディスク上のパートサイズではない）を示します。また、作成されたブロックやパーツは、ClickHouse がデータを行-[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングし、[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、設定された行数やバイト数を正確に含むことはまれであることに注意してください。したがって、これらの設定は最小のしきい値を指定します。

#### マージに注意 {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量のデータロード時に初期パーツがより多く作成され、データの取り込みと同時にバックグラウンドパートマージがより多く実行されます。これにより、リソースの競合（CPU とメモリ）が発生し、取り込みが完了した後に [健康的な](https://operations/settings/merge-tree-settings#parts_to_throw_insert) (3000) パーツ数に達するのに追加の時間が必要になる場合があります。

:::important
パート数が [推奨制限](/operations/settings/merge-tree-settings#parts_to_throw_insert) を超えると、ClickHouse のクエリパフォーマンスに悪影響が及びます。
:::

ClickHouse は、圧縮サイズが ~150 GiB に達するまで、パーツを継続的に [マージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) して大きなパーツにします。この図は、ClickHouse サーバーがパーツをどのようにマージするかを示しています：

<Image img={Merges} size="lg" border alt="Background merges in ClickHouse" />

単一の ClickHouse サーバーは、[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size) をいくつか利用して、同時に [パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes) を実行します。各スレッドはループを実行します：

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

CPU コア数と RAM のサイズを増やすと、バックグラウンドマージのスループットが増加することに注意してください。

大きなパーツにマージされたパーツは [非アクティブ](/operations/system-tables/parts) としてマーキングされ、最終的に [構成可能な](/operations/settings/merge-tree-settings#old_parts_lifetime) 分の後に削除されます。これにより、時間の経過とともにマージされたパーツのツリーが作成されます（これが [`MergeTree`](/engines/table-engines/mergetree-family) テーブルの名前の由来）。

### 挿入の並列性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="Resource usage for insert parallelism" />

ClickHouse サーバーは、データを並列で処理および挿入することができます。挿入の並列性のレベルは、ClickHouse サーバーの取り込みスループットおよびメモリ使用量に影響を与えます。データの並列処理には、主メモリが多く必要ですが、データを迅速に処理するため、取り込みスループットが増加します。

s3 のようなテーブル関数は、グローブパターンを介して読み込むファイル名のセットを指定することを許可します。グローブパターンが複数の既存ファイルに一致する場合、ClickHouse はこれらのファイル間および内部での読み取りを並列化し、並列に挿入スレッドを利用してテーブルにデータを挿入できます（サーバーごと）：

<Image img={InsertThreads} size="lg" border alt="Parallel insert threads in ClickHouse" />

すべてのファイルからのデータが処理されるまで、それぞれの挿入スレッドはループを実行します：

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

このような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 設定で構成できます。デフォルト値はオープンソースの ClickHouse では `1`、[ClickHouse Cloud](https://clickhouse.com/cloud) では 4 です。

大量のファイルがある場合、複数の挿入スレッドによる並列処理はうまく機能します。これにより、利用可能な CPU コア数とネットワーク帯域幅（並列ファイルダウンロード用）を完全に活用します。大きなファイルが少数だけをテーブルに読み込む場合、ClickHouse は自動的に高レベルのデータ処理並列性を確立し、大きなファイル内でのデータのより明確な範囲を読み取るために、各挿入スレッドごとに追加のリーダースレッドを生成してネットワーク帯域幅の使用を最適化します。

s3 関数およびテーブルの場合、個々のファイルの並列ダウンロードは、[max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) および [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) によって決定されます。ファイルサイズが `2 * max_download_buffer_size` より大きい場合のみ、ファイルは並列にダウンロードされます。デフォルトで、`max_download_buffer_size` のデフォルトは 10MiB に設定されています。場合によっては、このバッファサイズを 50 MB (`max_download_buffer_size=52428800`) に安全に増やし、各ファイルが単一スレッドによってダウンロードされることを保証できます。これにより、各スレッドが S3 呼び出しを行う時間が短縮され、S3 の待機時間も短縮されます。また、並列読み取りに対して小さすぎるファイルについては、ClickHouse が自動的に非同期でこのようなファイルを事前に読み取ることでスループットを増加させます。

## パフォーマンスの測定 {#measuring-performance}

S3 テーブル関数を使用してクエリのパフォーマンスを最適化する必要があります。この場合、データはそのまま、すなわち、ClickHouse 計算のみを使用し、データが元の形式の S3 に残るアドホッククエリを実行する際と、S3 から ClickHouse MergeTree テーブルエンジンにデータを挿入する際の両方に該当します。特に指定がない限り、以下の推奨事項は両方のシナリオに適用されます。

## ハードウェアサイズの影響 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="Impact of hardware size on ClickHouse performance" />

利用可能な CPU コア数および RAM のサイズは、次のことに影響を与えます：

- [初期パーツのサポートサイズ](#insert-block-size)
- [挿入の並列性](#insert-parallelism)
- [バックグラウンドパートマージのスループット](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

したがって、全体的な取り込みスループットに影響します。

## 地域のローカリティ {#region-locality}

バケットが ClickHouse インスタンスと同じリージョンに配置されていることを確認してください。このシンプルな最適化は、特に ClickHouse インスタンスを AWS インフラストラクチャにデプロイする場合、大幅にスループットパフォーマンスを向上させることができます。

## フォーマット {#formats}

ClickHouse は、`s3` 関数および `S3` エンジンを使用して、S3 バケットに保存されている [サポートされている形式](/interfaces/formats#formats-overview) のファイルを読み込むことができます。生のファイルを読む場合、これらの形式には明確な利点があります：

* Native、Parquet、CSVWithNames、および TabSeparatedWithNames のように、カラム名がエンコードされた形式では、ユーザーは `s3` 関数でカラム名を指定する必要がなくなり、クエリが冗長でなくなります。カラム名がこの情報を推測できるようにします。
* フォーマットごとに読み書きスループットに関してパフォーマンスが異なります。Native および Parquet は、すでにカラム指向であり、よりコンパクトであるため、読み取り性能の最適な形式を表します。Native フォーマットは、ClickHouse がデータをメモリにストックする方法と整合性があるため、データが ClickHouse にストリーミングされる際の処理オーバーヘッドを減らします。
* ブロックサイズは、大きなファイルの読み取りにかかるレイテンシに影響することがよくあります。これは、データをサンプルした場合、特に顕著です。たとえば、トップ N 行を返す場合。CSV や TSV などのフォーマットでは、一連の行を返すためにファイルを解析する必要があります。Native や Parquet などのフォーマットでは、結果的により迅速なサンプリングが可能になります。
* 各圧縮形式には、スピードとバイアスの圧縮または解凍性能のバランスを取る多くの利点と欠点があります。CSV や TSV などの生ファイルを圧縮する場合、lz4 は最も高速な解凍性能を提供しますが、圧縮レベルを犠牲にします。Gzip は通常、わずかに遅い読み取り速度の代わりに圧縮性能に優れています。XZ は通常、圧縮性能が最も優れているものの、圧縮および解凍性能が最も遅くなります。エクスポート時には、Gz と lz4 が同等の圧縮スピードを提供します。これを接続速度とバランスさせてください。より高速な解凍や圧縮からの利点は、S3 バケットへの遅い接続によって簡単に打ち消されます。
* Native や Parquet のようなフォーマットは、通常、圧縮のオーバーヘッドを正当化しません。データサイズでの節約は、これらのフォーマットが固有にコンパクトであるため、最小限である可能性があります。圧縮および解凍にかかる時間は、ネットワーク転送時間を上回ることはめったになく、特に S3 はグローバルに利用可能であり、ネットワーク帯域幅が高いためです。

## 例のデータセット {#example-dataset}

さらなる最適化の可能性を示すために、[Stack Overflow データセットの投稿](/data-modeling/schema-design#stack-overflow-dataset) を使用して、このデータのクエリと挿入パフォーマンスの両方を最適化します。

このデータセットは、2008年7月から2024年3月までの各月に1つずつ、189の Parquet ファイルで構成されています。

私たちはパフォーマンス向上のために Parquet を使用し（上記の [推奨] (#formats) に従って）、このクラスターはバケットと同じリージョンにある ClickHouse クラスターで、3 ノードが各32GiB の RAM と 8 vCPU を持っています。

調整なしで、私たちはこのデータセットを MergeTree テーブルエンジンに挿入し、最も多く質問をするユーザーを計算するクエリを実行するパフォーマンスを示します。これらのクエリは意図的に、データの完全なスキャンを必要とします。

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

私たちの例では数行しか返しません。大量のデータがクライアントに返されるときの `SELECT` クエリのパフォーマンスを測定するには、[null フォーマット](/interfaces/formats/#null)を使用するか、結果を [`Null` エンジン](/engines/table-engines/special/null.md) に直接送信してください。これにより、クライアントがデータに圧倒されるのを避け、ネットワークの飽和を防ぐことができます。

:::info
クエリを読み取る際、最初のクエリが同じクエリを繰り返すよりも遅く見えることがあります。これは、S3 自身のキャッシュや [ClickHouse スキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache) に起因する可能性があります。これは、ファイルの推測されたスキーマを保存し、後続のアクセスで推論ステップをスキップできることを意味し、クエリ時間を短縮します。
:::

## スレッドを使用した読み取り {#using-threads-for-reads}

S3 での読み取りパフォーマンスは、コアの数に比例してスケールします。ただし、ネットワーク帯域幅やローカルな I/O に制限を受けていない場合です。スレッドの数を増やすことは、ユーザーが認識すべきメモリオーバーヘッドの組み合わせもあります。読み取りスループットパフォーマンスを改善するために、以下を変更することができます：

* 通常、`max_threads` のデフォルト値は、コア数と同じで十分です。クエリにかかるメモリ量が多い場合は、その値を下げることができます。十分なメモリのあるユーザーは、この値を増やして S3 からの読み取りスループットを向上させてみることをお勧めします。通常、これはコア数の少ないマシン（すなわち、コア数が10未満）でのみ有益です。リソースの競合がボトルネックとして機能する他のリソース（ネットワークおよび CPU 競合）によって、さらなる並列化のメリットは通常減少します。
* ClickHouse バージョン 22.3.1 より前は、`s3` 関数や `S3` テーブルエンジンを使用する際にのみ、ファイル間での読み取りを並列化しました。これにより、ユーザーはファイルが S3 にチャンクに分割され、最適な読み取りパフォーマンスを達成するためにグローブパターンを使用して読み取る必要がありました。その後のバージョンでは、ファイル内でのダウンロードも並列化しています。
* スレッド数が少ないシナリオでは、`remote_filesystem_read_method` を "read" に設定することで、S3 からのファイルの同期読み取りを行う利点があります。
* s3 関数およびテーブルの場合、個々のファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads) と [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) の値によって決まります。 [`max_download_threads`](/operations/settings/settings#max_download_threads) はスレッド数を制御し、ファイルサイズが 2 * `max_download_buffer_size` より大きい場合のみ、ファイルが並列にダウンロードされます。デフォルトで、`max_download_buffer_size` は 10MiB に設定されています。場合によっては、このバッファサイズを 50 MB (`max_download_buffer_size=52428800`) に安全に増やし、より小さなファイルは単一スレッドによってのみダウンロードされるようにすることができます。これにより、各スレッドが S3 呼び出しにかける時間が短縮され、S3 の待機時間も短縮されます。この件については、[このブログ記事](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)を参照してください。

パフォーマンスを向上させるために変更を加える前に、適切に測定することを確認してください。S3 API 呼び出しはレイテンシに敏感で、クライアントのタイミングに影響を与える可能性があるため、パフォーマンスメトリックのためにクエリログを使用します。すなわち、`system.query_log`。

前のクエリを考慮し、`max_threads` を `16`（デフォルトの `max_thread` はノードのコア数）に倍増すると、読み取りクエリパフォーマンスが 2 倍向上しますが、メモリの使用量が増加します。さらに `max_threads` を増やすことは、次のようにリターンを減少させます。

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

## 挿入用のスレッドとブロックサイズの調整 {#tuning-threads-and-block-size-for-inserts}

最大の取り込みパフォーマンスを達成するためには、(1)挿入ブロックサイズと (2) CPU コア数および利用可能な RAM に基づいて適切な挿入の並列性を選択する必要があります。要するに：

- [挿入ブロックサイズ](#insert-block-size)を大きく構成するほど、ClickHouse が作成する必要のあるパーツが少なくなり、[ディスクファイル I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) と [バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) が必要になります。  
- [並列挿入スレッドの数](#insert-parallelism)を高く構成するほど、データがより速く処理されます。

これらの 2 つのパフォーマンス要因（バックグラウンドパートマージとのトレードオフも含む）には相反するトレードオフがあります。ClickHouse サーバーの利用可能な主メモリの量は限られています。大きなブロックはメモリを多く使い、利用できる挿入スレッドの数に制限を設けます。一方、挿入スレッドの数を増やすことで、必要なメインメモリが増え、挿入スレッドの数はメモリ上で同時に作成される挿入ブロックの数を決定します。これにより、挿入ブロックのサイズが制限されます。また、挿入スレッドとバックグラウンドマージスレッドとの間にリソース競合が発生する場合があります。構成された挿入スレッドの数が多いほど (1)マージする必要のあるパーツが増え、(2)バックグラウンドマージスレッドから CPU コアやメモリが奪われます。

これらのパラメータの振る舞いがパフォーマンスやリソースにどのように影響するかの詳細な説明は、[このブログ記事を読むこと](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)をお勧めします。このブログ記事で述べられているように、チューニングは両方のパラメータの慎重なバランスを含むことがあります。この徹底的なテストは実用的ではないことが多いため、要約すると、以下の推奨をしています：

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この式を使用して、`min_insert_block_size_rows` を 0 に設定して（行ベースのしきい値を無効にし）、`max_insert_threads` を選択した値に、`min_insert_block_size_bytes` を上記の式から計算された結果に設定することができます。

Stack Overflow の前の例にこの式を使用します。

- `max_insert_threads=4`（ノードごとに 8 コア）
- `peak_memory_usage_in_bytes` - 32 GiB（ノードリソースの 100%）または `34359738368` バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530` 

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

このように、設定の調整により挿入パフォーマンスが `33%` 以上向上しました。これ以上の単一ノードパフォーマンスを改善できるかどうかは読者にお任せします。

## リソースとノードでのスケーリング {#scaling-with-resources-and-nodes}

リソースおよびノードでのスケーリングは、読み取りおよび挿入クエリの両方に適用されます。

### 垂直スケーリング {#vertical-scaling}

これまでのすべての調整とクエリは、ClickHouse Cloud クラスター内の単一ノードのみを使用してきました。ユーザーは通常、利用可能な指示コアが 1 ノード以上を持つことが一般的です。我々は、最初に垂直にスケールし、コア数に応じて S3 スループットを線形に改善することをお勧めします。前の挿入および読取クエリを 64GiB、16 vCPUs にプロパティを持つより大きな ClickHouse Cloud ノードで繰り返すと、どちらもおおよそ 2 倍の速度で実行されます。

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
個々のノードは、ネットワークおよび S3 の GET リクエストによってボトルネックが発生する可能性があり、性能が線形にスケールするのを妨げる可能性があります。
:::

### 水平スケーリング {#horizontal-scaling}

最終的には、ハードウェアの可用性とコスト効率により、水平スケーリングが必要になることがよくあります。ClickHouse Cloud では、プロダクションクラスターには少なくとも 3 ノードが必要です。したがって、ユーザーは挿入に全ノードを利用することを望むかもしれません。

S3 の読み取りにクラスターを利用するには、[クラスターの利用](/integrations/s3#utilizing-clusters)で説明されているように、`s3Cluster` 関数を使用する必要があります。これにより、ノード間での読み取りを分配できます。

挿入クエリを最初に受信するサーバーは、最初にグローブパターンを解決し、それから動的に処理を関連している各マッチファイルを自分自身および他のサーバーにディスパッチします。

<Image img={S3Cluster} size="lg" border alt="s3Cluster function in ClickHouse" />

私たちは、3 ノード間で作業を分配して前の読み取りクエリを繰り返します。クエリは `s3Cluster` を使用するように調整されます。これは、ClickHouse Cloud では、`default` クラスターを参照することで自動的に行われます。

[クラスターの利用](/integrations/s3#utilizing-clusters)で述べたように、この作業はファイルレベルで分散されます。この機能の恩恵を受けるためには、ユーザーには十分な数のファイル（すなわち、ノード数より多いファイル）が必要です。

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

同様に、挿入クエリも、単一ノード用に特定した設定を利用して分散できます：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

読者は、ファイル読み取りの改善がクエリのパフォーマンスを向上させたが、挿入性能の改善はないことに注意するでしょう。デフォルトでは、`s3Cluster` を使用して読み取りが分散される一方で、挿入はイニシエーター ノードに対して行われます。これは、読み取りは各ノードで行われますが、結果として得られた行はイニシエーターに配信されることを意味します。高スループットシナリオでは、これがボトルネックになる場合があります。これに対処するために、`s3cluster` 関数の `parallel_distributed_insert_select` パラメータを設定します。

これを `parallel_distributed_insert_select=2` に設定すると、SELECT および INSERT は、各ノードの分散エンジンの基になるテーブルの各シャードで実行されます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

予測通り、このことは挿入のパフォーマンスを 3 倍減少させます。

## さらなる調整 {#further-tuning}

### デデュプリケーションの無効化 {#disable-de-duplication}

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されているかどうかは不明です。クライアントが安全に挿入をリトライできるようにするために、デフォルトでは、ClickHouse Cloud などの分散展開で、ClickHouse はデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouse はそれを宛先テーブルに挿入しません。ただし、ユーザーはデータが通常のように挿入されたかのように成功操作のステータスを受け取ります。

この挙動は挿入オーバーヘッドを引き起こしますが、クライアントまたはバッチでデータを読み込む場合には理にかなりますが、オブジェクトストレージから `INSERT INTO SELECT` を実行する際には不必要です。この機能を挿入時に無効にすることで、以下のようにパフォーマンスを改善できます：

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```

### 挿入時の最適化 {#optimize-on-insert}

ClickHouse では、`optimize_on_insert` 設定が、データパートを挿入プロセス中にマージするかどうかを制御します。有効にすると（デフォルトで `optimize_on_insert = 1`）、小さなパーツが挿入されるにつれて大きなパーツにマージされ、読み取りに必要なパーツの数を減少させることでクエリパフォーマンスを向上させます。ただし、このマージ処理には挿入プロセスにオーバーヘッドが追加され、高スループット挿入の遅延を引き起こす可能性があります。

この設定を無効にすると（`optimize_on_insert = 0`）、挿入時のマージをスキップし、データをより迅速に書き込むことができ、特に頻繁な小さい挿入を処理する場合に効果的です。マージプロセスはバックグラウンドに委ねられ、挿入パフォーマンスは向上しますが、一時的に小さな部分の数が増加し、バックグラウンドマージが完了するまでクエリを遅くする可能性があります。この設定は、挿入パフォーマンスが優先され、バックグラウンドマージプロセスが後で効率的に最適化できる場合に理想的です。以下のように、設定を無効にすると挿入スループットが改善されることが示されています：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## その他の注意事項 {#misc-notes}

* メモリが少ないシナリオの場合、S3 への挿入時に `max_insert_delayed_streams_for_parallel_write` の値を下げてください。
