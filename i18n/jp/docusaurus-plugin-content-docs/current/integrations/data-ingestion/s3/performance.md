---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: パフォーマンスの最適化
title: S3の挿入および読み取りパフォーマンスの最適化
description: S3の読み取りと挿入のパフォーマンスを最適化する
---

import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

このセクションでは、[s3 テーブル関数](/sql-reference/table-functions/s3)を使用して、S3からデータを読み込み、挿入するときのパフォーマンスを最適化する方法に焦点を当てます。

:::info
**このガイドに記載されているレッスンは、[GCS](/sql-reference/table-functions/gcs)や[Azure Blob ストレージ](/sql-reference/table-functions/azureBlobStorage)のような独自の専用テーブル関数を持つ他のオブジェクトストレージ実装に適用できます。**
:::

スレッドやブロックサイズを調整して挿入パフォーマンスを向上させる前に、ユーザーはS3挿入のメカニズムを理解することをお勧めします。挿入メカニズムに精通している場合や、すぐに役立つヒントが必要な場合は、下記の例にスキップしてください。[example](/integrations/s3/performance#example-dataset)。
## 挿入メカニズム（単一ノード） {#insert-mechanics-single-node}

ハードウェアサイズに加えて、ClickHouseのデータ挿入メカニズム（単一ノード）のパフォーマンスとリソース使用に影響を与える主な要因は2つです：**挿入ブロックサイズ**と**挿入の並列性**。
### 挿入ブロックサイズ {#insert-block-size}

<img src={InsertMechanics} alt="ClickHouseにおける挿入ブロックサイズメカニズム" />

`INSERT INTO SELECT`を実行すると、ClickHouseはデータの一部を受け取り、①受信したデータから（少なくとも）1つのメモリ内挿入ブロック（[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごとに）を形成します。ブロックのデータはソートされ、テーブルエンジン固有の最適化が適用されます。データは圧縮された後、②新しいデータパーツの形でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouseサーバの[ディスクファイルI/O使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)とメモリ使用量の両方に影響を与えます。大きな挿入ブロックはより多くのメモリを使用しますが、初期パーツが大きくなり、数が少なくなります。ClickHouseが大量のデータをロードするために作成する必要があるパーツが少ないほど、ディスクファイルI/Oや自動[バックグラウンドマージが必要](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)になります。

`INSERT INTO SELECT`クエリを統合テーブルエンジンまたはテーブル関数と組み合わせて使用する場合、データはClickHouseサーバによって取得されます：

<img src={Pull} alt="ClickHouseにおける外部ソースからのデータ取得" />

データが完全に読み込まれるまで、サーバはループを実行します：

```bash
① 次の未処理のデータの部分を取得して解析し、それからメモリ内データブロックを形成します（パーティショニングキーごとに1つ）。

② ブロックをストレージの新しいパートに書き込みます。

①に戻る
```

①では、サイズは挿入ブロックサイズに依存し、2つの設定で制御できます：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（デフォルト: `1048545`百万行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（デフォルト: `256 MiB`）

挿入ブロックに指定された行数が収集されるか、設定されたデータ量に達した（どちらか早く発生した方）場合、新しいパートに書き込まれるトリガーとなります。挿入ループはステップ①で続行されます。

`min_insert_block_size_bytes`の値は、圧縮されていないメモリ内ブロックサイズを示すことに注意してください（圧縮されたディスク上のパートサイズではない）。また、生成されたブロックやパーツは、ClickHouseがデータを行-[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングおよび[処理](https://clickhouse.com/company/events/query-performance-introspection)を行うため、設定された行数またはバイトの数を正確に含むことはあまりありません。このため、これらの設定は最小しきい値を指定します。
#### マージに注意する {#be-aware-of-merges}

設定されている挿入ブロックサイズが小さいほど、大量のデータロードに対してより多くの初期パーツが作成され、データ取り込みと同時にバックグラウンドパートマージがより多く実行されます。これにより、リソースの競合（CPUとメモリ）が発生し、取り込みが終了した後に（健全な[状態](/operations/settings/merge-tree-settings#parts-to-throw-insert)である3000個のパーツ）に達するのに追加の時間が必要になる場合があります。

:::important
パート数が[推奨リミット](/operations/settings/merge-tree-settings#parts-to-throw-insert)を超えると、ClickHouseのクエリパフォーマンスが悪化します。
:::

ClickHouseは、より大きなパーツに継続的に[マージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を行い、[達するまで](https://operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)約150 GiBの圧縮サイズにします。この図は、ClickHouseサーバがどのようにパーツをマージするかを示しています：

<img src={Merges} alt="ClickHouseにおけるバックグラウンドマージ" />

単一のClickHouseサーバは、いくつかの[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を使用して並行して[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行します。各スレッドはループを実行します：

```bash
① 次にどのパーツをマージするかを決定し、それらのパーツをブロックとしてメモリに読み込みます。

② メモリ内で読み込んだブロックをより大きなブロックにマージします。

③ マージしたブロックをディスクの新しいパートに書き込みます。

①に戻る
```

[増加する](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) CPUコア数とRAMのサイズは、バックグラウンドマージスループットを増加させます。

より大きなパーツにマージされたパーツは[非アクティブ](/operations/system-tables/parts)としてマークされ、最終的には[構成可能な](https://operations/settings/merge-tree-settings#old-parts-lifetime)分の時間が経過した後に削除されます。これは、時間の経過とともにマージされたパーツのツリーを作成します（これが[`MergeTree`](/engines/table-engines/mergetree-family)テーブルの名前の由来です）。
### 挿入の並列性 {#insert-parallelism}

<img src={ResourceUsage} alt="挿入の並列性におけるリソース使用量" />

ClickHouseサーバは、データを並行して処理し、挿入することができます。挿入の並列性レベルは、ClickHouseサーバの取り込みスループットとメモリ使用量に影響を与えます。データを並行してロードおよび処理するためには、より多くのメインメモリが必要ですが、データがより早く処理されるため、取り込みスループットが向上します。

s3のようなテーブル関数では、グロブパターンを介して読み込むファイル名のセットを指定できます。グロブパターンが複数の既存ファイルに一致する場合、ClickHouseはこれらのファイル間およびファイル内での読み取りを並列化し、サーバごとに並行して挿入スレッドを利用してテーブルにデータを挿入します：

<img src={InsertThreads} alt="ClickHouseにおける並行挿入スレッド" />

すべてのファイルからのデータが処理されるまで、各挿入スレッドはループを実行します：

```bash
① 次の未処理のファイルデータの部分を取得（部分のサイズは設定されたブロックサイズに基づく）し、それからメモリ内データブロックを作成します。

② ブロックをストレージの新しいパートに書き込みます。

①に戻る。 
```

このような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#max_insert_threads)設定で構成できます。デフォルト値は、オープンソースのClickHouseでは`1`、[ClickHouse Cloud](https://clickhouse.com/cloud)では`4`です。

大量のファイルがある場合、複数の挿入スレッドによる並列処理がうまく機能します。これは、利用可能なCPUコアとネットワーク帯域幅（並行したファイルダウンロードのため）を完全に飽和させることができます。少数の大きなファイルをテーブルにロードするシナリオでは、ClickHouseは自動的に高いデータ処理の並列性を確立し、大きなファイル内の異なる範囲を並行して読み取るために、各挿入スレッドごとに追加のリーダースレッドを生成してネットワーク帯域幅の使用を最適化します。

s3関数およびテーブルの個別ファイルの並列ダウンロードは、[max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads)および[max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size)の値によって決まります。ファイルのサイズが`2 * max_download_buffer_size`より大きい場合にのみ、ファイルは並行してダウンロードされます。デフォルトでは、`max_download_buffer_size`は10MiBに設定されています。場合によっては、バッファサイズを50MB（`max_download_buffer_size=52428800`）に安全に増加させ、各ファイルが1つのスレッドによってダウンロードされることを確実にすることができます。これにより、各スレッドがS3コールを行う時間が短縮され、S3の待機時間も短縮されます。さらに、並行して読み取るには小さすぎるファイルの場合、ClickHouseは自動的にデータをプリアンシェンシを使用して先読みします。
## パフォーマンスの測定 {#measuring-performance}

S3テーブル関数を使用したクエリのパフォーマンスを最適化する必要があります。これは、データがそのまま使用される場合、つまりClickHouseコンピュートのみが使用され、データがS3内にそのままの形式で残る場合、またはS3からClickHouseのMergeTreeテーブルエンジンにデータを挿入する場合に行われます。特に指定がない限り、以下の推奨事項は両方のシナリオに適用されます。
## ハードウェアサイズの影響 {#impact-of-hardware-size}

<img src={HardwareSize} alt="ハードウェアサイズがClickHouseのパフォーマンスに与える影響" />

利用可能なCPUコア数とRAMのサイズは、以下に影響を与えます：

- サポートされている[パーツの初期サイズ](#insert-block-size)
- 可能な[挿入の並列性](#insert-parallelism)
- [バックグラウンドパートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)のスループット

したがって、全体的な取り込みスループットにも影響を及ぼします。
## リージョンのローカリティ {#region-locality}

バケットがClickHouseインスタンスと同じリージョンにあることを確認してください。この単純な最適化により、特にAWSインフラストラクチャにClickHouseインスタンスを展開する場合、スループットのパフォーマンスを劇的に改善できます。
## フォーマット {#formats}

ClickHouseは、`s3`関数および`S3`エンジンを使用して、S3バケットに保存されたファイルを[サポートされているフォーマット](/interfaces/formats#formats-overview)で読み込むことができます。生のファイルを読み込む場合、これらのフォーマットの中には明確な利点があるものもあります：

* Native、Parquet、CSVWithNames、TabSeparatedWithNamesのようなエンコードされたカラム名を持つフォーマットは、ユーザーが`s3`関数でカラム名を指定する必要がないため、クエリが冗長になりません。カラム名により、この情報が推測可能になります。
* フォーマットによって、読み取りおよび書き込みのスループットに関するパフォーマンスが異なります。NativeおよびParquetは、すでに列指向であり、よりコンパクトであるため、読み取りパフォーマンスに最も最適なフォーマットです。Nativeフォーマットは、ClickHouseがメモリ内にデータを格納する方法と整合しているため、データがClickHouseにストリーミングされる際の処理オーバーヘッドを削減することにも利点があります。
* ブロックサイズはしばしば大きなファイルの読み取りのレイテンシに影響を与えます。これは、データをサンプリングする場合、例えば、上位N行を返すだけの場合には非常に顕著です。CSVやTSVのようなフ
ォーマットでは、行のセットを返すためにファイルを解析する必要があります。しかし、NativeやParquetのようなフォーマットでは、結果としてより早くサンプリングすることができます。
* 各圧縮フォーマットには長所と短所があり、パフォーマンスによるバイアスを持つ圧縮レベルのバランスをとります。生のファイル（CSVやTSVなど）を圧縮する場合、lz4は圧縮レベルを犠牲にしても最も速い解凍パフォーマンスを提供します。Gzipは通常、わずかに遅い読み取り速度の代償に、より良い圧縮を提供します。Xzはさらに進んで、通常は最も良い圧縮を提供しますが、最も遅い圧縮および解凍パフォーマンスを持っています。エクスポートの場合、Gzとlz4は comparable圧縮速度を提供します。これを接続速度と比較して調整してください。解凍や圧縮のスピードからの利得は、S3バケットへの接続が遅いと簡単に相殺されます。
* NativeやParquetのようなフォーマットは通常、圧縮のオーバーヘッドを正当化することはありません。データサイズの削減はこれらのフォーマットが本質的にコンパクトであるため、最小限になる可能性が高いです。圧縮と解凍にかかる時間は、ネットワーク転送時間を相殺することはほとんどありません。特にS3はグローバルに利用可能で、高いネットワーク帯域幅を持つためです。
## 例データセット {#example-dataset}

さらなる最適化の可能性を示すため、[Stack Overflowデータセットの投稿](/data-modeling/schema-design#stack-overflow-dataset)を使用します。これは、このデータのクエリと挿入パフォーマンスを最適化する目的があります。

このデータセットは、2008年7月から2024年3月までの毎月の1つのParquetファイルから構成されています。

パフォーマンスのためにParquetを使用し、[前述の推奨事項](#formats)に従って、バケットと同じリージョンにあるClickHouseクラスタで全てのクエリを実行します。このクラスタは3ノードで構成され、各ノードには32GiBのRAMと8 vCPUがあります。

チューニングなしで、このデータセットをMergeTreeテーブルエンジンに挿入するパフォーマンスと、最も多くの質問をしたユーザーを計算するクエリを実行するパフォーマンスを示します。これらのクエリは、意図的にデータの完全なスキャンを必要とします。

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

5行がセットに含まれています。経過時間: 3.013秒。処理された行数: 59.82百万、サイズ: 24.03GB（19.86百万行/s、7.98GB/s）。
ピークメモリ使用量: 603.64 MiB。

-- 投稿テーブルにロード
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0行がセットに含まれています。経過時間: 191.692秒。処理された行数: 59.82百万、サイズ: 24.03GB（312.06千行/s、125.37MB/s）。
```

この例では、いくつかの行だけを返します。大量のデータがクライアントに戻される場合の`SELECT`クエリのパフォーマンスを測定する場合、クエリで[nullフォーマット](/interfaces/formats/#null)を利用するか、結果を[`Null`エンジン](/engines/table-engines/special/null.md)に直接送ることを検討してください。これにより、クライアントがデータで圧倒されることやネットワーク飽和を避けることができます。

:::info
クエリから読み取りを行うとき、初期クエリは同じクエリを繰り返すよりも遅く見えることがあります。これはS3自身のキャッシュだけでなく、[ClickHouseスキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache)にも起因しています。これは、ファイルの推論されたスキーマを格納し、次回のアクセス時に推論ステップをスキップできるため、クエリ時間を短縮します。
:::
## 読み取り専用スレッドの使用 {#using-threads-for-reads}

S3での読み取りパフォーマンスは、コア数に比例してスケールします。ただし、ネットワーク帯域幅やローカルI/Oが制限されていない場合に限ります。スレッド数を増やすこともメモリオーバーヘッドの組み合わせを持つため、ユーザーは注意が必要です。以下を変更して、読み取りスループットパフォーマンスを改善できます：

* 通常、`max_threads`のデフォルト値は十分であり、つまりコア数です。クエリで使用されるメモリ量が多い場合、これを減らす必要がある場合や、結果に対する`LIMIT`が少ない場合、この値を低く設定できます。メモリが十分にあるユーザーは、S3からの読み取りスループットを向上させるために、この値を増やして実験することを希望するかもしれません。通常、これはコア数が少ないマシン（すなわち、< 10）でのみ有効です。他のリソース（ネットワークやCPU競合など）がボトルネックとなるため、さらに並列化から得られる利益は一般的に減少します。
* 22.3.1以前のClickHouseでは、`s3`関数や`S3`テーブルエンジンを使用した場合にのみ、複数のファイルにわたって読み取りを並列化していました。これには、ユーザーがS3でファイルをチャンクに分割し、グロブパターンを使用して最適な読み取りパフォーマンスを実現する必要がありました。後のバージョンでは、ファイル内でのダウンロードが並列化されるようになりました。
* スレッド数が少ないシナリオでは、ユーザーは`remote_filesystem_read_method`を"read"に設定することで、S3からのファイルの同期読み込みを引き起こすことができるかもしれません。
* s3関数およびテーブルにおける個別ファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads)および[`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size)の値によって決まります。`[`max_download_threads`](/operations/settings/settings#max_download_threads)`は使用するスレッドの数を制御しますが、ファイルのサイズが`2 * max_download_buffer_size`より大きくない限り、ファイルは並行してダウンロードされません。デフォルトでは、`max_download_buffer_size`は10MiBに設定されています。場合によっては、バッファサイズを50MB（`max_download_buffer_size=52428800`）に安全に増加させ、小さなファイルが1つのスレッドによってのみダウンロードされるようにできます。これにより、各スレッドがS3コールを行う時間が短縮され、S3の待機時間も低下します。この点に関しては、[このブログ投稿](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)を参照してください。

パフォーマンスを向上させるための変更を加える前に、適切に測定を行ってください。S3 APIコールはレイテンシに敏感で、クライアントのタイミングに影響を与える可能性があるため、パフォーマンスメトリックの取得にはクエリログを使用してください。すなわち、`system.query_log`を参照してください。

前述のクエリを考慮し、`max_threads`を`16`（デフォルトの`max_thread`はノードのコア数です）に倍増させると、メモリが増える代償として読み取りクエリのパフォーマンスが2倍になります。`max_threads`をさらに増やすことは、次のようにリターンが減少します。

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

5行がセットに含まれています。経過時間: 1.505秒。処理された行数: 59.82百万、サイズ: 24.03GB（39.76百万行/s、15.97GB/s）。
ピークメモリ使用量: 178.58 MiB。

SETTINGS max_threads = 32

5行がセットに含まれています。経過時間: 0.779秒。処理された行数: 59.82百万、サイズ: 24.03GB（76.81百万行/s、30.86GB/s）。
ピークメモリ使用量: 369.20 MiB。

SETTINGS max_threads = 64

5行がセットに含まれています。経過時間: 0.674秒。処理された行数: 59.82百万、サイズ: 24.03GB（88.81百万行/s、35.68GB/s）。
ピークメモリ使用量: 639.99 MiB。
```
## 挿入用のスレッドとブロックサイズの調整 {#tuning-threads-and-block-size-for-inserts}

最大のデータ取り込み性能を達成するには、（1）挿入ブロックサイズ、（2）利用可能なCPUコアおよびRAMの量に基づいた適切な挿入の並列性レベルを選択する必要があります。要約すると：

- 挿入ブロックサイズを[構成する](/insert-block-size)ほど、ClickHouseが作成する必要のあるパーツが少なくなり、[ディスクファイルI/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems)と[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)が必要なくなります。  
- [並列挿入スレッド数](#insert-parallelism)を高く設定するほど、データが早く処理されます。

これら2つのパフォーマンス要因の間には競合するトレードオフがあります（加えてバックグラウンドパートマージとのトレードオフもあります）。ClickHouseサーバーのメインメモリの量には限りがあります。ブロックが大きくなればなるほど、メインメモリをより多く使用し、それにより利用可能な挿入並列スレッドの数が制限されます。逆に、より高い数の並列挿入スレッドは、メモリをより多く必要とします。挿入スレッドの数が、メモリ内で同時に作成される挿入ブロックの数を決定するためです。これにより挿入ブロックの可能なサイズが制限されます。さらに、挿入スレッドとバックグラウンドマージスレッドの間でリソース競合が発生する可能性があります。設定された挿入スレッドの数が（1）マージする必要があるパーツが増え、（2）バックグラウンドマージスレッドからCPUコアとメモリ空間を奪います。

これらのパラメータの動作がパフォーマンスとリソースに与える影響についての詳細な説明については、[このブログ投稿を読むことをお勧めします。](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2) このブログ投稿では、チューニングは2つのパラメータの慎重なバランスを伴う場合があると説明されています。この徹底的なテストは非常に実用的ではなく、要するに、次のようにお勧めします：

```bash
• max_insert_threads: 利用可能なCPUコアの約半分を挿入スレッドに選択して、バックグラウンドマージのために十分な専用コアを確保します。

• peak_memory_usage_in_bytes: 意図したピークメモリ使用量を選択します。独立した取り込みの場合は、利用可能なRAMすべて（または、より少ないRAMを使用する場合は半分）を選択します。

次に：
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この式を使用して、`min_insert_block_size_rows`を0（行ベースのしきい値を無効にするため）に設定し、`max_insert_threads`を選択した値に設定し、`min_insert_block_size_bytes`を上記の式から計算した結果に設定できます。

先ほどのStack Overflowの例を使用して、この式を使用します。

- `max_insert_threads=4`（ノードあたり8コア）
- `peak_memory_usage_in_bytes` - 32 GiB（ノードリソースの100％）または`34359738368`バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0行がセットに含まれています。経過時間: 128.566秒。処理された行数: 59.82百万、サイズ: 24.03GB（465.28千行/s、186.92MB/s）。
```

設定を調整することで、挿入パフォーマンスが33％以上向上したことが示されています。読者は、単一ノード性能をさらに改善できるかどうか試してみてください。
## リソースとノードとのスケーリング {#scaling-with-resources-and-nodes}

リソースとノードとのスケーリングは、読み取りおよび挿入クエリの両方に適用されます。
### 垂直スケーリング {#vertical-scaling}

これまでの全てのチューニングとクエリは、ClickHouse Cloudクラスタ内の単一ノードを使用して実行されてきました。ユーザーはたいていClickHouseのノードが複数あります。まずは、ユーザーが垂直にスケールすることを推奨し、コア数に応じてS3スループットを線形に改善します。以前の挿入および読み取りクエリを、適切な設定を使用してリソースが2倍のClickHouse Cloudノードで繰り返すと、両方のクエリが約2倍の速度で実行されます。

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0行がセットに含まれています。経過時間: 67.294秒。処理された行数: 59.82百万、サイズ: 24.03GB（888.93千行/s、357.12MB/s）。

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5行がセットに含まれています。経過時間: 0.421秒。処理された行数: 59.82百万、サイズ: 24.03GB（142.08百万行/s、57.08GB/s）。
```

:::note
個別のノードが、ネットワークやS3 GETリクエストによってボトルネックになることもあり、垂直スケーリングのパフォーマンスの線形スケーリングを妨げる場合があります。
:::
### 水平スケーリング {#horizontal-scaling}

最終的に、ハードウェアの可用性とコスト効率のために水平スケーリングが必要です。ClickHouse Cloudでは、プロダクションクラスターは少なくとも3ノードで構成されています。したがって、ユーザーは挿入にすべてのノードを利用したいと考えるかもしれません。

S3読み込みのためにクラスターを利用するには、[クラスターの利用](/integrations/s3#utilizing-clusters)で説明されているように`s3Cluster`関数を使用する必要があります。これにより、読み取りがノード間で分配されます。

最初に挿入クエリを受け取ったサーバは、最初にグロブパターンを解決し、その後、各一致するファイルの処理を自身と他のサーバに動的に分配します。

<img src={S3Cluster} alt="ClickHouseにおけるs3Cluster関数" />

以前の読み取りクエリを繰り返す際に、ワークロードを3ノードに分配し、クエリを`s3Cluster`を使用するように調整します。ClickHouse Cloudでは、この操作が自動的に行われ、`default`クラスタを参照します。

[クラスターの利用](/integrations/s3#utilizing-clusters)で指摘されているように、この作業はファイルレベルで分散されています。この機能を利用するためには、ユーザーは十分な数のファイル、つまりノードの数よりも多い必要があります。

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

5行がセットに含まれています。経過時間: 0.622秒。処理された行数: 59.82百万、サイズ: 24.03GB（96.13百万行/s、38.62GB/s）。
ピークメモリ使用量: 176.74 MiB。
```

同様に、挿入クエリも分配できます。これは、単一ノードのために特定された改善された設定を使用します。

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0行がセットに含まれています。経過時間: 171.202秒。処理された行数: 59.82百万、サイズ: 24.03GB（349.41千行/s、140.37MB/s）。
```

読者は、ファイルの読み込みがクエリを改善しましたが、挿入パフォーマンスには改善が見られないことに注意するでしょう。デフォルトでは、読み取りは`s3Cluster`を使用して分散されますが、挿入はイニシエーター ノードに対して行われます。これは、すべてのノードで読み取られるのに対し、結果となる行がイニシエーターに送信されるためです。高スループットシナリオでは、これがボトルネックになる可能性があります。この問題に対処するためには、`s3cluster`関数の`parallel_distributed_insert_select`パラメータを設定します。

これを`parallel_distributed_insert_select=2`に設定すると、`SELECT`と`INSERT`が各ノードの分散エンジンの基盤テーブルから各シャードに対して実行されることが保証されます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0行がセットに含まれています。経過時間: 54.571秒。処理された行数: 59.82百万、サイズ: 24.03GB（1.10百万行/s、440.38MB/s）。
ピークメモリ使用量: 11.75 GiB。
```

予想通り、これにより挿入パフォーマンスが3倍低下します。
## さらなる調整 {#further-tuning}
### デュプリケート除去の無効化 {#disable-de-duplication}

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されたかどうかは明確ではありません。クライアントによって挿入を安全に再試行できるように、ClickHouse Cloudのような分散デプロイメントでは、デフォルトでClickHouseはデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouseはそれを宛先テーブルに挿入しません。ただし、ユーザーにはデータが通常のように挿入されたかのように、正常な操作ステータスが返されます。

この動作は、クライアントやバッチからデータを読み込むときには意味がありますが、オブジェクトストレージからの`INSERT INTO SELECT`を実行する場合には不必要な場合があります。この機能を挿入時に無効にすることで、パフォーマンスを向上させることができます。以下に示します：

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0行がセットに含まれています。経過時間: 52.992秒。処理された行数: 59.82百万、サイズ: 24.03GB（1.13百万行/s、453.50MB/s）。
ピークメモリ使用量: 26.57 GiB。
```
### 挿入時の最適化 {#optimize-on-insert}

ClickHouseでは、`optimize_on_insert`設定は、データパーツが挿入プロセス中にマージされるかどうかを制御します。有効にすると（デフォルトで`optimize_on_insert = 1`）、小さなパーツが挿入される際に大きなパーツにマージされ、読み取る必要のあるパーツの数が減ることでクエリ性能が向上します。ただし、このマージは挿入プロセスにオーバーヘッドを追加し、高スループットの挿入が遅くなる可能性があります。

この設定を無効にすると（`optimize_on_insert = 0`）、挿入中のマージをスキップし、特に頻繁な小さな挿入を扱う場合にデータがより迅速に書き込まれるようになります。マージプロセスはバックグラウンドに遅延されるため、より良い挿入性能が得られますが、一時的に小さなパーツの数が増加し、バックグラウンドマージが完了するまでクエリが遅くなることがあります。この設定は、挿入性能が優先され、バックグラウンドマージプロセスが後で効果的に最適化を処理できるときに理想的です。以下に示すように、設定を無効にすることで挿入スループットが向上する可能性があります：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 行がセットに含まれました。経過時間: 49.688秒。59.82百万行、24.03 GBが処理されました（1.20百万行/秒、483.66 MB/秒）。
```
## その他の注意事項 {#misc-notes}

* メモリが少ないシナリオでは、S3への挿入時に`max_insert_delayed_streams_for_parallel_write`を低くすることを検討してください。
