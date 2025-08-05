---
slug: '/integrations/s3/performance'
sidebar_position: 2
sidebar_label: 'パフォーマンスの最適化'
title: 'S3挿入および読み取りパフォーマンスの最適化'
description: 'S3読み取りおよび挿入のパフォーマンスの最適化'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

このセクションでは、S3からデータを読み込みおよび挿入する際のパフォーマンス最適化に焦点を当てています。[s3テーブル関数](/sql-reference/table-functions/s3)を使用します。

:::info
**このガイドで説明されているレッスンは、[GCS](/sql-reference/table-functions/gcs)や[Azure Blobストレージ](/sql-reference/table-functions/azureBlobStorage)のような、専用のテーブル関数を持つ他のオブジェクトストレージの実装にも適用できます。**
:::

挿入パフォーマンスを向上させるためにスレッドやブロックサイズを調整する前に、ユーザーはS3への挿入メカニズムを理解することをお勧めします。挿入メカニズムに慣れているか、クイックなヒントが欲しい場合は、[以下の例](/integrations/s3/performance#example-dataset)に飛ばしてください。
## 挿入メカニズム（単一ノード） {#insert-mechanics-single-node}

ハードウェアサイズに加え、ClickHouseのデータ挿入メカニズムのパフォーマンスとリソース使用に影響を与える主な要因は、**挿入ブロックサイズ**と**挿入の並行性**の二つです。
### 挿入ブロックサイズ {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouseの挿入ブロックサイズメカニズム" />

`INSERT INTO SELECT`を実行する際、ClickHouseはデータの一部を受信し、①受信したデータから（少なくとも）1つのメモリ内挿入ブロックを形成します（[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごとに）。ブロックのデータはソートされ、テーブルエンジン固有の最適化が適用されます。その後、データは圧縮され、②新しいデータパーツの形でデータベースストレージに書き込まれます。

挿入ブロックサイズはClickHouseサーバーの[ディスクファイルI/O使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)とメモリ使用量の両方に影響します。大きな挿入ブロックはより多くのメモリを使用しますが、初期パーツは大きく少なく生成されます。ClickHouseが大量のデータを読み込むために作成する必要があるパーツが少ないほど、ディスクファイルI/Oと自動的な[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)が少なくなります。

`INSERT INTO SELECT`クエリをインテグレーションテーブルエンジンまたはテーブル関数と組み合わせて使用する際、データはClickHouseサーバーによってプルされます：

<Image img={Pull} size="lg" border alt="ClickHouseで外部ソースからデータをプルする" />

データが完全に読み込まれるまで、サーバーは次のループを実行します：

```bash
① 次の未処理データの部分をプルして解析し、そこからメモリ内データブロックを形成します（パーティショニングキーごとに1つ）。

② ストレージの新しいパーツにブロックを書き込みます。

次へ ① 
```

①では、サイズは挿入ブロックサイズに依存し、次の2つの設定で制御できます：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（デフォルト：`1048545`行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（デフォルト：`256 MiB`）

挿入ブロックに指定された行数が収集されるか、設定された量のデータに達すると（どちらか早い方が先に発生する場合）、これによりブロックが新しいパートに書き込まれるトリガーとなります。挿入ループは①のステップで続行されます。

`min_insert_block_size_bytes`の値は、未圧縮のメモリ内ブロックサイズを示し（圧縮されたディスク上のパートサイズではありません）、また作成されるブロックとパーツは、ClickHouseが行-[ブロック](/operations/settings/settings#max_block_size)単位でデータをストリーム処理および[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、設定された行数またはバイト数を正確に含むことは稀であることに留意してください。したがって、これらの設定は最小閾値を示しています。
#### マージに注意 {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量のデータロードの際に生成される初期パーツが多く、データ取り込みと並行してより多くのバックグラウンドパートマージが実行されることになります。これによりリソースの競合（CPUとメモリ）が発生し、取り込みが終了した後に[健康的な](/operations/settings/merge-tree-settings#parts_to_throw_insert)（3000）のパーツ数に達するのに追加の時間が必要になる場合があります。

:::important
パーツ数が[推奨限度](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouseのクエリパフォーマンスに悪影響が及びます。
:::

ClickHouseは、二つのパーツが圧縮サイズ約150 GiBに達するまで、継続的に[マージを行います](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。以下の図は、ClickHouseサーバーがパーツをマージする方法を示しています：

<Image img={Merges} size="lg" border alt="ClickHouseでのバックグラウンドマージ" />

単一のClickHouseサーバーは、いくつかの[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を利用して並行して[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行します。各スレッドは次のループを実行します：

```bash
① 次にマージするパーツを決定し、それらのパーツをメモリ内のブロックとしてロードします。

② メモリ内のロードされたブロックを大きなブロックにマージします。

③ マージしたブロックを新しいパーツとしてディスクに書き込みます。

次へ ①
```

[増加する](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) CPUコアの数およびRAMのサイズは、バックグラウンドマージスループットを増加させます。

大きなパーツにマージされたパーツは[非活性](/operations/system-tables/parts)としてマークされ、最終的には[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)分の分だけの分数が経過した後に削除されます。時間が経つにつれて、マージされたパーツのツリーが作成されます（そのため、[`MergeTree`](/engines/table-engines/mergetree-family)テーブルと呼ばれます）。
### 挿入の並行性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="挿入の並行性のリソース使用量" />

ClickHouseサーバーはデータを並行して処理および挿入できます。挿入の並行性のレベルは、ClickHouseサーバーの取り込みスループットとメモリ使用量に影響を与えます。データを並行してロードおよび処理するにはより多くのメインメモリが必要ですが、データがより迅速に処理されるため、取り込みスループットは向上します。

s3のようなテーブル関数は、グロブパターンを通じて読み込むファイル名のセットを指定することを可能にします。グロブパターンが複数の既存ファイルと一致した場合、ClickHouseはこれらのファイルの間および内部での読み取りを並列化し、並行してテーブルにデータを挿入するために、並列実行される挿入スレッドを使用します（サーバーごとに）：

<Image img={InsertThreads} size="lg" border alt="ClickHouseでの並列挿入スレッド" />

すべてのファイルからのデータが処理されるまで、各挿入スレッドは次のループを実行します：

```bash
① 未処理のファイルデータの次の部分を取得し（部分のサイズは設定されたブロックサイズに基づく）、それからメモリ内データブロックを作成します。

② ブロックを新しいパーツにストレージに書き込みます。

次へ ①. 
```

このような並行挿入スレッドの数は[`max_insert_threads`](/operations/settings/settings#max_insert_threads)設定で構成できます。オープンソースのClickHouseのデフォルト値は`1`、[ClickHouse Cloud](https://clickhouse.com/cloud)のデフォルト値は`4`です。

ファイルの数が多い場合、複数の挿入スレッドによる並行処理がうまく機能し、利用可能なCPUコアとネットワーク帯域幅（並行ファイルダウンロード用）を完全に飽和させることができます。わずか数個の大きなファイルをテーブルに読み込む場合、ClickHouseは自動的に高いデータ処理並行性を確立し、大きなファイル内の異なる範囲を並行して読み取り（ダウンロード）するために各挿入スレッドごとに追加のリーダースレッドを生成してネットワーク帯域幅の使用を最適化します。

s3関数とテーブルの場合、個々のファイルの並列ダウンロードは、[max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads)および[max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size)の値によって決まります。ファイルのサイズが`2 * max_download_buffer_size`を超えない限り、ファイルは並列にダウンロードされません。デフォルトでは、`max_download_buffer_size`のデフォルトは10MiBに設定されています。場合によっては、このバッファサイズを50 MB（`max_download_buffer_size=52428800`）に安全に増やすことで、各ファイルが単一のスレッドによってダウンロードされることを保証できます。これにより、各スレッドがS3コールを行う時間が短縮され、これによりS3の待機時間も短縮されます。さらに、並列読み込みに対してサイズが小さすぎるファイルに対しては、ClickHouseが非同期でこのようなファイルを事前に読み込むことでスループットを増加させます。
## パフォーマンスの測定 {#measuring-performance}

S3テーブル関数を使用したクエリのパフォーマンスを最適化することは、データがそのまま存在するクエリを実行する場合、すなわちClickHouseのコンピュートのみを使用し、データがS3にその元の形式で残る場合、およびS3からClickHouse MergeTreeテーブルエンジンにデータを挿入する際に必要です。指定がない限り、以下の推奨事項は両方のシナリオに適用されます。
## ハードウェアサイズの影響 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="ClickHouseのパフォーマンスに対するハードウェアサイズの影響" />

使用可能なCPUコアの数とRAMのサイズは、次に影響します：

- サポートされる[初期パーツサイズ](#insert-block-size)
- 可能な[挿入並行性](#insert-parallelism)
- [バックグラウンドパートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)のスループット

したがって、全体的な取り込みスループットに影響します。
## リージョンのローカリティ {#region-locality}

バケットがClickHouseインスタンスと同じリージョンにあることを確認してください。この単純な最適化は、特にClickHouseインスタンスをAWSのインフラストラクチャにデプロイした場合、スループットパフォーマンスを劇的に向上させることができます。
## フォーマット {#formats}

ClickHouseは、`s3`関数と`S3`エンジンを使用して、S3バケットに保存されたファイルを[サポートされているフォーマット](/interfaces/formats#formats-overview)で読み取ることができます。生のファイルを読み込む場合、これらのフォーマットのいくつかには明確な利点があります：

* Native、Parquet、CSVWithNames、TabSeparatedWithNamesなどのエンコード済みカラム名を持つフォーマットは、ユーザーが`s3`関数でカラム名を指定する必要がないため、クエリが冗長になりにくいです。カラム名はこの情報を推測可能にします。
* フォーマット間の読み取りおよび書き込みスループットにおけるパフォーマンスの差があります。NativeとParquetはすでに列指向であり、よりコンパクトなため、読み取りパフォーマンスにとって最も最適なフォーマットを表します。Nativeフォーマットは、ClickHouseがメモリ内にデータを格納する方法と整合性があるため、このため、ClickHouseにストリームされるデータの処理オーバーヘッドが削減されます。
* ブロックサイズが大きなファイルの読み取りの待機時間にしばしば影響します。これは、データの一部のみをサンプリングする場合（例：上位N行を返す場合）に非常に明らかです。CSVやTSVのようなフォーマットでは、行セットを返すためにファイルを解析する必要があります。NativeやParquetのようなフォーマットは、結果的により迅速にサンプリングを可能にします。
* 各圧縮フォーマットには利点と欠点があり、スピードとエクスパクションバイアスの圧縮レベルをバランスさせます。CSVやTSVのような生のファイルを圧縮する場合、lz4は圧縮レベルを犠牲にして最も迅速な解凍パフォーマンスを提供します。Gzipは通常、わずかに遅い読み取り速度の代償としてより良好に圧縮されます。Xzは、通常は圧縮および解凍パフォーマンスが遅い代わりに最良の圧縮を提供します。エクスポートの場合、Gzとlz4は比較可能な圧縮速度を提供します。これは接続速度に対抗してバランスを取ってください。より高速な解凍または圧縮から得られる利点は、S3バケットへの接続が遅ければ簡単に打ち消されてしまいます。
* NativeやParquetのようなフォーマットでは圧縮のオーバーヘッドを正当化することは通常ありません。これらのフォーマットは本質的にコンパクトであるため、データサイズの削減はわずかです。圧縮と解凍にかかる時間は、ネットワーク転送時間を補うことは滅多にありません - 特にS3はグローバルに利用可能で高いネットワーク帯域を持っています。
## 例となるデータセット {#example-dataset}

さらなる潜在的な最適化を示すために、[Stack Overflowデータセットの投稿](/data-modeling/schema-design#stack-overflow-dataset)を使用します - このデータのクエリと挿入パフォーマンスの両方を最適化します。

このデータセットは、2008年7月から2024年3月までの毎月の1つのParquetファイルで構成され、合計189ファイルです。

パフォーマンスのためにParquetを使用し、[上記の推奨](/formats)に従い、バケットと同じリージョンにあるClickHouseクラスターで全てのクエリを実行します。このクラスターは、32GiBのRAMと8つのvCPUを各ノードに持つ3つのノードから構成されています。

調整を行わずに、このデータセットをMergeTreeテーブルエンジンに挿入するパフォーマンスを示すとともに、最も質問しているユーザーを計算するためのクエリを実行します。これらのクエリは意図的にデータ全体のスキャンを必要とします。

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

例ではいくつかの行のみを返しています。大規模なデータをクライアントに返す`SELECT`クエリのパフォーマンスを測定する際は、[nullフォーマット](/interfaces/formats/#null)をクエリに使用するか、結果を[`Null`エンジン](/engines/table-engines/special/null.md)に直接送信することをお勧めします。これにより、クライアントがデータの量に圧倒されてネットワークが飽和するのを避けることができます。

:::info
クエリから読み取る場合、最初のクエリは同じクエリを繰り返すよりも遅く見えることがよくあります。これは、S3自身のキャッシングと、[ClickHouseスキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache)に起因する可能性があります。これにより、ファイルの推測されたスキーマが保存され、以降のアクセス時に推測ステップをスキップできるため、クエリ時間が短縮されます。
:::
## 読み取りのためのスレッドの使用 {#using-threads-for-reads}

S3での読み取りパフォーマンスは、ネットワーク帯域幅やローカルI/Oによって制限されない限り、コア数に応じて線形にスケールします。スレッドの数を増やすことは、ユーザーが意識すべきメモリオーバーヘッドの変動があります。読み取りスループットパフォーマンスを改善するために次の項目を変更できます：

* 通常、`max_threads`のデフォルト値は、すなわちコアの数として十分です。クエリに使用するメモリ量が多く、これを削減する必要がある場合、または結果の`LIMIT`が少ない場合、この値は低く設定できます。十分なメモリを持っているユーザーは、この値を上げてS3からの読み取りスループットを向上させることを試みるかもしれません。通常これは、コ ア数が少ないマシン（例：10未満）でのみ有益です。さらに並列化を進める利点は、通常は他のリソースがボトルネックとして機能する場合には減少します。例えば、ネットワークおよびCPUの競合です。
* ClickHouseの22.3.1以前のバージョンでは、`s3`関数または`S3`テーブルエンジンを使用する場合にのみ、複数のファイル全体での読み取りを並列化しました。これにより、ユーザーはS3でファイルがチャンクに分割され、最適な読み取りパフォーマンスを得るためにグロブパターンを使用して読み取られることを確認する必要がありました。後のバージョンでは、ファイル内でのダウンロードも並列化されます。
* スレッド数が少ないシナリオでは、ユーザーは`remote_filesystem_read_method`を"read"に設定することで、S3からファイルを同期的に読み取ることができる利点を得られるかもしれません。
* s3関数とテーブルの場合、個々のファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads)および[`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size)の値によって決定されます。[`max_download_threads`](/operations/settings/settings#max_download_threads)がスレッドの数を制御しますが、ファイルはサイズが`2 * max_download_buffer_size`を超えない限り並列でダウンロードされません。デフォルトで`max_download_buffer_size`のデフォルト値は10MiBに設定されています。場合によっては、このバッファサイズを50 MB（`max_download_buffer_size=52428800`）に安全に増やすことができ、小さなファイルを単一のスレッドでのみダウンロードすることが保証されます。これにより、各スレッドのS3コールに費やされる時間が短縮され、S3の待機時間も短縮されます。この件についての[このブログ投稿](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)を参照してください。

パフォーマンスを改善するために変更を加える前に、適切に測定することを確認してください。S3 APIコールはレイテンシーに敏感であり、クライアントのタイミングに影響を与える可能性があるため、パフォーマンス指標にはクエリログを使用してください。すなわち、`system.query_log`。

以前のクエリを考慮し、`max_threads`を`16`に倍増させることで（デフォルトの`max_thread`はノードあたりのコア数です）、読み取りクエリのパフォーマンスが2倍になり、より多くのメモリを消費することが分かりました。さらに`max_threads`を増やすことには収益の減少があります。

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

最大の取り込みパフォーマンスを達成するには、(1) 挿入ブロックサイズ、(2) 利用可能なCPUコアとRAMに基づく適切な挿入並行性のレベルを選択する必要があります。まとめると：

- [挿入ブロックサイズ](#insert-block-size)を大きく設定するほど、ClickHouseが作成する必要のあるパーツが少なくなり、必要な[ディスクファイルI/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems)と[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)が減ります。
- [並行挿入スレッドの数](#insert-parallelism)を多く設定するほど、データがより速く処理されます。

これら二つのパフォーマンス要因の間には、対立するトレードオフが存在します（および背景部分マージとのトレードオフも存在します）。ClickHouseサーバーのメインメモリの量は制限されています。大きなブロックはより多くのメインメモリを使用し、そのため並行に利用できる挿入スレッドの数が制限されます。逆に、より多くの並行挿入スレッドを使用するほど、メインメモリが多く必要とされ、挿入スレッドの数が同時にメモリ内で作成される挿入ブロックの数を決定するため、挿入ブロックサイズの制限が生じます。さらに、挿入スレッドとバックグラウンドマージスレッドの間にはリソースの競合が生じる可能性があります。設定された数の挿入スレッドが多くなると(1) マージする必要のあるパーツが増え、(2) バックグラウンドマージスレッドからCPUコアとメモリスペースが奪われます。

これらのパラメータの挙動がパフォーマンスとリソースに与える影響の詳細な説明については、[このブログ投稿](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)を読むことをお勧めします。ブログ記事でも説明されているように、調整はこれらの二つのパラメータのバランスを注意深く取ることを含むことがあります。このような徹底したテストはしばしば実用的ではないため、まとめると、次のことをお勧めします：

```bash
• max_insert_threads: 挿入スレッド用に利用可能なCPUコアの約半分を選択します（バックグラウンドマージ用に十分なコアを残すため）。

• peak_memory_usage_in_bytes: 計画されたピークメモリ使用量を選択します。孤立した取り込みの場合は全メモリ（利用可能なRAMのすべて）またはその他のタスクのためにスペースを確保するために半分まで（あるいはそれ以下）を選択します。

その後：
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この公式により、`min_insert_block_size_rows`を0に設定して（行ベースの閾値を無効化）、`max_insert_threads`を選択した値に設定し、`min_insert_block_size_bytes`を上記の公式から計算した結果に設定できます。

この公式を以前のStack Overflowの例に適用します。

- `max_insert_threads=4`（ノードあたり8コア）
- `peak_memory_usage_in_bytes` - 32 GiB（ノードリソースの100%）つまり、`34359738368`バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

このように、これらの設定の調整により挿入パフォーマンスが33％以上向上しました。読者は、さらに単一ノードパフォーマンスを向上させる方法を探ることができます。
## リソースとノードのスケーリング {#scaling-with-resources-and-nodes}

リソースとノードのスケーリングは、読み取りおよび挿入クエリの両方に適用されます。
### 垂直スケーリング {#vertical-scaling}

これまでの全ての調整やクエリは、ClickHouse Cloudクラスターの単一ノードを使用しています。ユーザーは通常、ClickHouseを利用できる複数のノードを持っています。初めはユーザーが縦方向にスケールすることをお勧めします。コア数が増えることで、S3のスループットが線形に向上します。もしこれまでの挿入および読み取りクエリを、リソースが2倍の大きなClickHouse Cloudノード（64GiB、16 vCPU）で実行すると、両方とも約2倍の速さになります。

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
個々のノードは、ネットワークおよびS3 GETリクエストによってボトルネックとなることがあり、垂直スケーリングのパフォーマンスが線形に上昇しない場合があります。
:::
### 水平スケーリング {#horizontal-scaling}

やがて、ハードウェアの可用性とコスト効率から水平方向のスケーリングが必要になることがほとんどです。ClickHouse Cloudの生産クラスターには、最低3ノードがあります。したがって、ユーザーは挿入にすべてのノードを利用することを希望するかもしれません。

S3の読み取りにクラスターを利用するには、[クラスターの利用](/integrations/s3#utilizing-clusters)で説明されているように`s3Cluster`関数を使用する必要があります。これにより、読み取りがノード間で分散されます。

最初に挿入クエリを受け取るサーバーは、最初にグロブパターンを解決し、その後、一致する各ファイルの処理を動的に自分自身および他のサーバーに分配します。

<Image img={S3Cluster} size="lg" border alt="ClickHouseでのs3Cluster関数" />

以前の読み取りクエリを、3ノードに負荷を分散して再実行し、クエリを`s3Cluster`を使うように調整します。これはClickHouse Cloudでは、自動的に`default`クラスタを参照することで実行されます。

[クラスターの利用](/integrations/s3#utilizing-clusters)に記載されているように、この作業はファイルレベルで分散されます。この機能を利用するには、ユーザーには十分な数のファイル、つまりノード数の少なくとも>を持っている必要があります。

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

同様に、以前の単一ノードのために特定した改善設定を利用して、挿入クエリも分散できます。

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

読者は、ファイルの読み込みがクエリを改善したのに対し、挿入パフォーマンスには改善が見られないことを認識するでしょう。デフォルトでは、読み取りは`s3Cluster`を使用して分散されますが、挿入はイニシエータノードに対して実行されます。つまり、読み取りは各ノードで行われますが、結果の行は分配のためにイニシエータにルートされます。高スループットのシナリオでは、これはボトルネックになる可能性があります。これに対処するために、`s3cluster`関数に対して`parallel_distributed_insert_select`パラメータを設定します。

これを`parallel_distributed_insert_select=2`に設定することで、`SELECT`と`INSERT`が各ノード上の分散エンジンの基盤となるテーブルに対して各シャードで実行されることが保証されます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

予想通り、これにより挿入パフォーマンスは3倍に低下します。
## さらなる調整 {#further-tuning}
### 重複排除の無効化 {#disable-de-duplication}

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されているかどうかは不明な場合があります。クライアントによる挿入の再試行を安全に行えるように、分散デプロイメント（ClickHouse Cloudなど）では、データが正常に挿入されたかどうかを確認しようとします。挿入されたデータが重複としてマークされると、ClickHouseはそれを宛先テーブルに挿入しません。ただし、ユーザーには、データが通常どおり挿入されたかのように成功の操作状況が表示されます。

この動作は挿入のオーバーヘッドを伴い、クライアントやバッチからのデータを読み込む場合は意味がありますが、オブジェクトストレージからの`INSERT INTO SELECT`を実行する際には不要であることがあります。挿入時にこの機能を無効にすることで、パフォーマンスを向上させることができます。以下のように:

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```
### Optimize on insert {#optimize-on-insert}

ClickHouseでは、`optimize_on_insert`設定は、データパーツが挿入プロセス中にマージされるかどうかを制御します。有効にすると（デフォルトでは`optimize_on_insert = 1`）、小さいパーツが挿入されると同時に大きなパーツにマージされ、読み取る必要のあるパーツの数が減ることでクエリパフォーマンスが向上します。ただし、このマージ処理は挿入プロセスにオーバーヘッドを追加するため、高スループットの挿入速度が遅くなる可能性があります。

この設定を無効にすると（`optimize_on_insert = 0`）、挿入時にマージをスキップし、特に頻繁な小規模挿入を扱う際にデータを書き込む速度が向上します。マージプロセスはバックグラウンドに延期されるため、より良い挿入パフォーマンスが得られますが、一時的に小さいパーツの数が増加し、バックグラウンドのマージが完了するまでクエリが遅くなる可能性があります。この設定は、挿入パフォーマンスが優先され、バックグラウンドのマージプロセスが後で効率的に最適化を処理できる場合に最適です。以下に示すように、設定を無効にすると挿入スループットが改善されることがあります。

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```
## Misc notes {#misc-notes}

* メモリが少ないシナリオの場合、S3に挿入する際には`max_insert_delayed_streams_for_parallel_write`を下げることを検討してください。
