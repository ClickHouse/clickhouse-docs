---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: 'Optimizing for performance'
title: 'Optimizing for S3 Insert and Read Performance'
description: 'Optimizing the performance of S3 read and insert'
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

このセクションでは、[s3 テーブル関数](/sql-reference/table-functions/s3)を使用して S3 からデータを読み取りおよび挿入する際のパフォーマンスの最適化に焦点を当てています。

:::info
**このガイドで説明されているレッスンは、[GCS](/sql-reference/table-functions/gcs) や [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage) など、専用のテーブル関数を持つ他のオブジェクトストレージ実装にも適用できます。**
:::

挿入パフォーマンスを向上させるためにスレッドとブロックサイズを調整する前に、S3 挿入のメカニズムを理解することをユーザーに推奨します。挿入メカニズムに精通している場合、または単に簡単なヒントが必要な場合は、[以下](#example-dataset)の例にスキップしてください。

## 挿入メカニズム(シングルノード) {#insert-mechanics-single-node}

ハードウェアサイズに加えて、ClickHouse のデータ挿入メカニズムのパフォーマンスとリソース使用量(シングルノードの場合)に影響を与える主な要因は2つあります:**挿入ブロックサイズ**と**挿入並列性**です。

### 挿入ブロックサイズ {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="Insert block size mechanics in ClickHouse" />

`INSERT INTO SELECT` を実行すると、ClickHouse はデータの一部を受信し、①受信したデータから([パーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごとに少なくとも)1つのインメモリ挿入ブロックを形成します。ブロックのデータはソートされ、テーブルエンジン固有の最適化が適用されます。その後、データは圧縮され、②新しいデータパートの形式でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouse サーバーの[ディスクファイル I/O 使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)とメモリ使用量の両方に影響を与えます。より大きな挿入ブロックはより多くのメモリを使用しますが、より大きく少ない初期パートを生成します。大量のデータをロードするために ClickHouse が作成する必要があるパートが少ないほど、ディスクファイル I/O と自動[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)の必要性が少なくなります。

統合テーブルエンジンまたはテーブル関数と組み合わせて `INSERT INTO SELECT` クエリを使用する場合、データは ClickHouse サーバーによってプルされます:

<Image img={Pull} size="lg" border alt="Pulling data from external sources in ClickHouse" />

データが完全にロードされるまで、サーバーはループを実行します:

```bash
① 次のデータ部分をプルして解析し、そこからインメモリデータブロック(パーティションキーごとに1つ)を形成します。

② ブロックをストレージ上の新しいパートに書き込みます。

① に戻る
```

①では、サイズは挿入ブロックサイズに依存し、2つの設定で制御できます:

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (デフォルト: `1048545` 百万行)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (デフォルト: `256 MiB`)

挿入ブロックで指定された行数が収集されるか、設定されたデータ量に達すると(どちらか先に発生した方)、ブロックが新しいパートに書き込まれます。挿入ループはステップ①で続行されます。

`min_insert_block_size_bytes` 値は、非圧縮のインメモリブロックサイズを示します(圧縮されたディスク上のパートサイズではありません)。また、ClickHouse はデータを行-[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングおよび[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、作成されたブロックとパートが設定された行数またはバイト数を正確に含むことはめったにありません。したがって、これらの設定は最小しきい値を指定します。

#### マージに注意する {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量のデータロードに対してより多くの初期パートが作成され、データ取り込みと同時により多くのバックグラウンドパートマージが実行されます。これにより、リソースの競合(CPU とメモリ)が発生し、取り込みが完了した後に[健全な](/operations/settings/merge-tree-settings#parts_to_throw_insert)(3000)パート数に達するまでに追加の時間が必要になる場合があります。

:::important
パート数が[推奨制限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouse クエリのパフォーマンスが悪影響を受けます。
:::

ClickHouse は、圧縮サイズが約 150 GiB に[達する](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)まで、継続的にパートをより大きなパートに[マージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)します。この図は、ClickHouse サーバーがパートをマージする方法を示しています:

<Image img={Merges} size="lg" border alt="Background merges in ClickHouse" />

単一の ClickHouse サーバーは、並行[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行するために、いくつかの[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を利用します。各スレッドはループを実行します:

```bash
① 次にマージするパートを決定し、これらのパートをブロックとしてメモリにロードします。

② ロードされたブロックをメモリ内でより大きなブロックにマージします。

③ マージされたブロックをディスク上の新しいパートに書き込みます。

① に戻る
```

CPU コアの数と RAM のサイズを[増やす](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size)と、バックグラウンドマージのスループットが向上することに注意してください。

より大きなパートにマージされたパートは[非アクティブ](/operations/system-tables/parts)としてマークされ、最終的に[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)分数後に削除されます。時間の経過とともに、これによりマージされたパートのツリーが作成されます(したがって、[`MergeTree`](/engines/table-engines/mergetree-family) テーブルという名前になります)。

### 挿入並列性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="Resource usage for insert parallelism" />

ClickHouse サーバーは、並列でデータを処理および挿入できます。挿入並列性のレベルは、ClickHouse サーバーの取り込みスループットとメモリ使用量に影響を与えます。データを並列でロードおよび処理するには、より多くのメインメモリが必要ですが、データがより速く処理されるため、取り込みスループットが向上します。

s3 などのテーブル関数では、グロブパターンを介してロードするファイル名のセットを指定できます。グロブパターンが複数の既存のファイルに一致する場合、ClickHouse は、(サーバーごとに)並列実行される挿入スレッドを利用して、これらのファイル全体および内部で読み取りを並列化し、データをテーブルに並列で挿入できます:

<Image img={InsertThreads} size="lg" border alt="Parallel insert threads in ClickHouse" />

すべてのファイルからすべてのデータが処理されるまで、各挿入スレッドはループを実行します:

```bash
① 未処理のファイルデータの次の部分を取得し(部分サイズは設定されたブロックサイズに基づく)、そこからインメモリデータブロックを作成します。

② ブロックをストレージ上の新しいパートに書き込みます。

① に戻ります。
```

このような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 設定で構成できます。デフォルト値は、オープンソースの ClickHouse では `1`、[ClickHouse Cloud](https://clickhouse.com/cloud) では 4 です。

多数のファイルがある場合、複数の挿入スレッドによる並列処理がうまく機能します。使用可能な CPU コアとネットワーク帯域幅(並列ファイルダウンロード用)の両方を完全に飽和させることができます。少数の大きなファイルのみがテーブルにロードされるシナリオでは、ClickHouse は自動的に高レベルのデータ処理並列性を確立し、大きなファイル内のより多くの異なる範囲を並列で読み取る(ダウンロードする)ための挿入スレッドごとに追加のリーダースレッドを生成することにより、ネットワーク帯域幅の使用を最適化します。

s3 関数とテーブルの場合、個々のファイルの並列ダウンロードは、[max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) および [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) の値によって決まります。ファイルは、サイズが `2 * max_download_buffer_size` より大きい場合にのみ並列でダウンロードされます。デフォルトでは、`max_download_buffer_size` のデフォルトは 10MiB に設定されています。場合によっては、このバッファサイズを 50 MB(`max_download_buffer_size=52428800`)に安全に増やすことができ、各ファイルが単一のスレッドによってダウンロードされるようにすることを目的としています。これにより、各スレッドが S3 呼び出しに費やす時間を短縮し、S3 待機時間も短縮できます。さらに、並列読み取りには小さすぎるファイルの場合、スループットを向上させるために、ClickHouse はこのようなファイルを非同期に事前読み取りすることでデータを自動的にプリフェッチします。

## パフォーマンスの測定 {#measuring-performance}

S3 テーブル関数を使用したクエリのパフォーマンスの最適化は、データをその場でクエリする場合、つまり ClickHouse コンピュートのみが使用され、データが元のフォーマットで S3 に残っているアドホッククエリの場合と、S3 から ClickHouse MergeTree テーブルエンジンにデータを挿入する場合の両方で必要です。特に指定されていない限り、以下の推奨事項は両方のシナリオに適用されます。

## ハードウェアサイズの影響 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="Impact of hardware size on ClickHouse performance" />

使用可能な CPU コアの数と RAM のサイズは、次のことに影響を与えます:

- サポートされる[パートの初期サイズ](#insert-block-size)
- 可能な[挿入並列性](#insert-parallelism)のレベル
- [バックグラウンドパートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)のスループット

したがって、全体的な取り込みスループットに影響を与えます。

## リージョンのローカリティ {#region-locality}

バケットが ClickHouse インスタンスと同じリージョンに配置されていることを確認してください。この単純な最適化により、特に AWS インフラストラクチャに ClickHouse インスタンスをデプロイする場合、スループットパフォーマンスが劇的に向上します。

## フォーマット {#formats}

ClickHouse は、`s3` 関数と `S3` エンジンを使用して、S3 バケットに保存されたファイルを[サポートされているフォーマット](/interfaces/formats#formats-overview)で読み取ることができます。生ファイルを読み取る場合、これらのフォーマットの一部には明確な利点があります:

* Native、Parquet、CSVWithNames、TabSeparatedWithNames などのエンコードされた列名を持つフォーマットは、ユーザーが `s3` 関数で列名を指定する必要がないため、クエリの冗長性が低くなります。列名により、この情報を推測できます。
* フォーマットは、読み取りおよび書き込みスループットに関してパフォーマンスが異なります。Native と parquet は、すでに列指向でよりコンパクトであるため、読み取りパフォーマンスに最適なフォーマットを表します。Native フォーマットは、ClickHouse がメモリにデータを格納する方法との整合性からさらに恩恵を受け、データが ClickHouse にストリーミングされるときの処理オーバーヘッドが削減されます。
* ブロックサイズは、大きなファイルの読み取りのレイテンシに影響を与えることがよくあります。これは、データをサンプリングするだけの場合、たとえば上位 N 行を返す場合に非常に明白です。CSV や TSV などのフォーマットの場合、行のセットを返すためにファイルを解析する必要があります。Native や Parquet などのフォーマットは、その結果、より高速なサンプリングを可能にします。
* 各圧縮フォーマットには長所と短所があり、多くの場合、圧縮レベルと速度のバランスを取り、圧縮または解凍のパフォーマンスを優先します。CSV や TSV などの生ファイルを圧縮する場合、lz4 は圧縮レベルを犠牲にして最速の解凍パフォーマンスを提供します。Gzip は通常、読み取り速度がわずかに遅くなる代わりに、より優れた圧縮を実現します。Xz は、通常、最も遅い圧縮および解凍パフォーマンスで最高の圧縮を提供することにより、これをさらに進めます。エクスポートする場合、Gz と lz4 は同等の圧縮速度を提供します。これを接続速度とバランスを取ってください。高速な解凍または圧縮による利点は、s3 バケットへの低速な接続によって簡単に無効になります。
* native や parquet などのフォーマットは、通常、圧縮のオーバーヘッドを正当化しません。これらのフォーマットは本質的にコンパクトであるため、データサイズの節約は最小限である可能性が高いです。圧縮と解凍に費やす時間は、ネットワーク転送時間をめったに相殺しません - 特に、s3 はより高いネットワーク帯域幅でグローバルに利用できるためです。

## サンプルデータセット {#example-dataset}

さらなる潜在的な最適化を説明するために、[Stack Overflow データセットからの投稿](/data-modeling/schema-design#stack-overflow-dataset)を使用します - このデータのクエリおよび挿入パフォーマンスの両方を最適化します。

このデータセットは、2008年7月から2024年3月までの毎月1つずつ、189個の Parquet ファイルで構成されています。

上記の[推奨事項](#formats)に従って、パフォーマンスのために Parquet を使用し、バケットと同じリージョンにある ClickHouse クラスタですべてのクエリを実行することに注意してください。このクラスタには、それぞれ 32GiB の RAM と 8 vCPU を備えた 3 つのノードがあります。

チューニングなしで、このデータセットを MergeTree テーブルエンジンに挿入するパフォーマンスと、最も多くの質問をしているユーザーを計算するクエリを実行するパフォーマンスを示します。これらのクエリは両方とも、意図的にデータの完全スキャンを必要とします。

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

5 rows in set. Elapsed: 3.013 sec. Processed 59.82 million rows, 24.03 GB (19.86 million rows/s., 7.98 GB/s.)
Peak memory usage: 603.64 MiB.

-- posts テーブルにロード
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```

この例では、わずかな行のみを返します。大量のデータがクライアントに返される `SELECT` クエリのパフォーマンスを測定する場合は、クエリに [null フォーマット](/interfaces/formats/Null)を利用するか、結果を [`Null` エンジン](/engines/table-engines/special/null.md)に送信してください。これにより、クライアントがデータに圧倒されたり、ネットワークが飽和したりするのを避けることができます。

:::info
クエリから読み取る場合、最初のクエリは、同じクエリが繰り返された場合よりも遅く見えることがよくあります。これは、S3 独自のキャッシングと [ClickHouse スキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache)の両方に起因する可能性があります。これにより、ファイルの推論されたスキーマが保存され、推論ステップを後続のアクセスでスキップできるため、クエリ時間が短縮されます。
:::

## 読み取りにスレッドを使用する {#using-threads-for-reads}

S3 での読み取りパフォーマンスは、ネットワーク帯域幅またはローカル I/O によって制限されない限り、コア数に対して線形にスケールします。スレッド数を増やすと、注意すべきメモリオーバーヘッドの影響もあります。読み取りスループットパフォーマンスを潜在的に改善するために、次のものを変更できます:

* 通常、`max_threads` のデフォルト値、つまりコアの数で十分です。クエリに使用されるメモリの量が多く、これを削減する必要がある場合、または結果の `LIMIT` が低い場合は、この値を低く設定できます。十分なメモリを持つユーザーは、S3 からの読み取りスループットを高める可能性があるため、この値を増やすことを試すことをお勧めします。通常、これはコア数が少ないマシン、つまり10未満でのみ有益です。ネットワークや CPU の競合など、他のリソースがボトルネックとして機能するため、さらなる並列化からの利点は通常減少します。
* 22.3.1 より前のバージョンの ClickHouse は、`s3` 関数または `S3` テーブルエンジンを使用する場合、複数のファイル間でのみ読み取りを並列化しました。これにより、ユーザーは、最適な読み取りパフォーマンスを実現するために、ファイルを S3 上のチャンクに分割し、グロブパターンを使用して読み取ることを確実にする必要がありました。後のバージョンでは、ファイル内でダウンロードを並列化するようになりました。
* スレッド数が少ないシナリオでは、S3 からのファイルの同期読み取りを引き起こすために、`remote_filesystem_read_method` を "read" に設定することで恩恵を受ける場合があります。
* s3 関数とテーブルの場合、個々のファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads) および [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) の値によって決まります。[`max_download_threads`](/operations/settings/settings#max_download_threads) は使用されるスレッド数を制御しますが、ファイルは、サイズが 2 * `max_download_buffer_size` より大きい場合にのみ並列でダウンロードされます。デフォルトでは、`max_download_buffer_size` のデフォルトは 10MiB に設定されています。場合によっては、このバッファサイズを 50 MB(`max_download_buffer_size=52428800`)に安全に増やすことができ、小さいファイルが単一のスレッドによってのみダウンロードされるようにすることを目的としています。これにより、各スレッドが S3 呼び出しに費やす時間を短縮し、S3 待機時間も短縮できます。この例については、[このブログ投稿](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)を参照してください。

パフォーマンスを向上させるための変更を行う前に、適切に測定してください。S3 API 呼び出しはレイテンシに敏感であり、クライアントのタイミングに影響を与える可能性があるため、パフォーマンスメトリックにはクエリログ、つまり `system.query_log` を使用してください。

以前のクエリを考えてみると、`max_threads` を `16`(デフォルトの `max_thread` はノード上のコア数)に倍増すると、より高いメモリを犠牲にして、読み取りクエリのパフォーマンスが 2 倍向上します。`max_threads` をさらに増やすと、示されているように収益が減少します。

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

## 挿入のためのスレッドとブロックサイズの調整 {#tuning-threads-and-block-size-for-inserts}

最大の取り込みパフォーマンスを達成するには、使用可能な CPU コアと RAM の量に基づいて、(1) 挿入ブロックサイズと (2) 適切なレベルの挿入並列性を選択する必要があります。要約すると:

- [挿入ブロックサイズ](#insert-block-size)を大きく設定するほど、ClickHouse が作成する必要があるパートが少なくなり、必要な[ディスクファイル I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) と[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)が少なくなります。
- [並列挿入スレッドの数](#insert-parallelism)を高く設定するほど、データが高速に処理されます。

これら2つのパフォーマンス要因の間には競合するトレードオフがあります(さらに、バックグラウンドパートマージとのトレードオフもあります)。ClickHouse サーバーの使用可能なメインメモリの量は限られています。より大きなブロックはより多くのメインメモリを使用し、利用できる並列挿入スレッドの数を制限します。逆に、より多くの並列挿入スレッドは、挿入スレッドの数が同時にメモリ内に作成される挿入ブロックの数を決定するため、より多くのメインメモリを必要とします。これにより、挿入ブロックの可能なサイズが制限されます。さらに、挿入スレッドとバックグラウンドマージスレッドの間にリソースの競合が発生する可能性があります。設定された挿入スレッドの数が多いと、(1) マージする必要があるパートがより多く作成され、(2) バックグラウンドマージスレッドから CPU コアとメモリスペースを奪います。

これらのパラメータの動作がパフォーマンスとリソースに与える影響の詳細な説明については、[このブログ投稿を読む](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)ことをお勧めします。このブログ投稿で説明されているように、チューニングには2つのパラメータの慎重なバランスが必要になる場合があります。この徹底的なテストは多くの場合実用的ではないため、要約すると、次のことをお勧めします:

```bash
• max_insert_threads: 挿入スレッドに使用可能な CPU コアの約半分を選択します(バックグラウンドマージ用に十分な専用コアを残すため)

• peak_memory_usage_in_bytes: 意図されたピークメモリ使用量を選択します。すべての使用可能な RAM(分離された取り込みの場合)または半分以下(他の並行タスクのためにスペースを残すため)

次に:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この式を使用して、`min_insert_block_size_rows` を 0(行ベースのしきい値を無効にするため)に設定し、`max_insert_threads` を選択した値に、`min_insert_block_size_bytes` を上記の式から計算された結果に設定できます。

以前の Stack Overflow の例でこの式を使用します。

- `max_insert_threads=4`(ノードあたり 8 コア)
- `peak_memory_usage_in_bytes` - 32 GiB(ノードリソースの 100%)または `34359738368` バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

示されているように、これらの設定のチューニングにより、挿入パフォーマンスが `33%` 以上向上しました。シングルノードのパフォーマンスをさらに向上させることができるかどうか、読者に任せます。

## リソースとノードでのスケーリング {#scaling-with-resources-and-nodes}

リソースとノードでのスケーリングは、読み取りおよび挿入クエリの両方に適用されます。

### 垂直スケーリング {#vertical-scaling}

これまでのすべてのチューニングとクエリは、ClickHouse Cloud クラスタ内の単一のノードのみを使用してきました。多くの場合、複数の ClickHouse ノードを使用できます。最初は垂直にスケールし、コア数に対して線形に S3 スループットを向上させることをお勧めします。適切な設定で、リソースが 2 倍の大きなClickHouse Cloud ノード(64GiB、16 vCPU)で以前の挿入および読み取りクエリを繰り返すと、両方とも約 2 倍高速に実行されます。

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
個々のノードは、ネットワークと S3 GET リクエストによってボトルネックになる可能性もあり、垂直方向のパフォーマンスの線形スケーリングが妨げられます。
:::

### 水平スケーリング {#horizontal-scaling}

最終的に、ハードウェアの可用性とコスト効率のために、水平スケーリングがしばしば必要になります。ClickHouse Cloud では、本番クラスタには少なくとも 3 つのノードがあります。したがって、挿入にすべてのノードを利用することもできます。

S3 読み取りにクラスタを利用するには、[クラスタの利用](/integrations/s3#utilizing-clusters)で説明されているように、`s3Cluster` 関数を使用する必要があります。これにより、読み取りをノード間で分散できます。

挿入クエリを最初に受信するサーバーは、まずグロブパターンを解決し、次に一致する各ファイルの処理を自身と他のサーバーに動的にディスパッチします。

<Image img={S3Cluster} size="lg" border alt="s3Cluster function in ClickHouse" />

以前の読み取りクエリを 3 つのノードに分散して繰り返し、クエリを調整して `s3Cluster` を使用します。これは、`default` クラスタを参照することにより、ClickHouse Cloud で自動的に実行されます。

[クラスタの利用](/integrations/s3#utilizing-clusters)で説明されているように、この作業はファイルレベルで分散されます。この機能の恩恵を受けるには、十分な数のファイル、つまり少なくともノード数よりも多いファイルが必要です。

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

同様に、シングルノードで以前に特定した改善された設定を使用して、挿入クエリを分散できます:

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

読者は、ファイルの読み取りがクエリを改善したが、挿入パフォーマンスは改善していないことに気付くでしょう。デフォルトでは、`s3Cluster` を使用して読み取りが分散されますが、挿入はイニシエーターノードに対して発生します。これは、各ノードで読み取りが発生しますが、結果の行は分散のためにイニシエーターにルーティングされることを意味します。高スループットのシナリオでは、これがボトルネックになる可能性があります。これに対処するには、`s3cluster` 関数のパラメータ `parallel_distributed_insert_select` を設定します。

これを `parallel_distributed_insert_select=2` に設定すると、各ノード上の分散エンジンの基になるテーブルから/への `SELECT` と `INSERT` が各シャードで実行されます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

予想どおり、これにより挿入パフォーマンスが 3 倍削減されます。

## さらなるチューニング {#further-tuning}

### 重複排除を無効にする {#disable-de-duplication}

タイムアウトなどのエラーにより、挿入操作が失敗する場合があります。挿入が失敗した場合、データが正常に挿入されたかどうかが不明な場合があります。ClickHouse Cloud などの分散デプロイメントでは、デフォルトで、クライアントが挿入を安全に再試行できるようにするために、ClickHouse はデータがすでに正常に挿入されているかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouse はそれを宛先テーブルに挿入しません。ただし、ユーザーは、データが正常に挿入されたかのように、成功した操作ステータスを受け取ります。

この動作は挿入オーバーヘッドを引き起こしますが、クライアントからデータをロードする場合やバッチでロードする場合には意味がありますが、オブジェクトストレージから `INSERT INTO SELECT` を実行する場合には不要な場合があります。挿入時にこの機能を無効にすることで、以下に示すようにパフォーマンスを向上させることができます:

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```

### 挿入時に最適化する {#optimize-on-insert}

ClickHouse では、`optimize_on_insert` 設定は、挿入プロセス中にデータパートをマージするかどうかを制御します。有効にすると(`optimize_on_insert = 1` がデフォルト)、小さなパートは挿入時により大きなパートにマージされ、読み取る必要があるパートの数を減らすことでクエリパフォーマンスが向上します。ただし、このマージにより挿入プロセスにオーバーヘッドが追加され、高スループットの挿入が遅くなる可能性があります。

この設定を無効にする(`optimize_on_insert = 0`)と、挿入中のマージがスキップされ、特に頻繁な小さな挿入を処理する場合に、データをより速く書き込むことができます。マージプロセスはバックグラウンドに延期され、挿入パフォーマンスが向上しますが、一時的に小さなパートの数が増加し、バックグラウンドマージが完了するまでクエリが遅くなる可能性があります。この設定は、挿入パフォーマンスが優先され、バックグラウンドマージプロセスが後で効率的に最適化を処理できる場合に最適です。以下に示すように、設定を無効にすると挿入スループットが向上します:

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## その他の注意事項 {#misc-notes}

* 低メモリシナリオの場合、S3 に挿入する場合は `max_insert_delayed_streams_for_parallel_write` を下げることを検討してください。
