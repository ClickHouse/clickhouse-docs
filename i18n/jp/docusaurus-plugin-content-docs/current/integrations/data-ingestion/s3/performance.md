---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: 'パフォーマンスの最適化'
title: 'S3 への挿入および読み取りパフォーマンスの最適化'
description: 'S3 の読み取りおよび挿入パフォーマンスを最適化する方法'
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

このセクションでは、[s3 テーブル関数](/sql-reference/table-functions/s3) を使用して S3 からデータを読み書きする際のパフォーマンス最適化に焦点を当てます。

:::info
**このガイドで説明している手法は、[GCS](/sql-reference/table-functions/gcs) や [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage) など、それぞれ専用のテーブル関数を持つ他のオブジェクトストレージ実装にも適用できます。**
:::

挿入パフォーマンスを向上させるためにスレッド数やブロックサイズを調整する前に、まずは S3 への挿入メカニズムを理解することを推奨します。すでに挿入メカニズムに慣れている場合や、手早くいくつかのヒントだけ知りたい場合は、以下の[サンプル](/integrations/s3/performance#example-dataset) に進んでください。


## 挿入メカニズム（単一ノード） {#insert-mechanics-single-node}

ハードウェアサイズに加えて、ClickHouseのデータ挿入メカニズム（単一ノード）のパフォーマンスとリソース使用量に影響を与える主な要因は2つあります：**挿入ブロックサイズ**と**挿入並列性**です。

### 挿入ブロックサイズ {#insert-block-size}

<Image
  img={InsertMechanics}
  size='lg'
  border
  alt='ClickHouseにおける挿入ブロックサイズのメカニズム'
/>

`INSERT INTO SELECT`を実行する際、ClickHouseはデータの一部を受信し、①受信したデータから（[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごとに）少なくとも1つのインメモリ挿入ブロックを形成します。ブロックのデータはソートされ、テーブルエンジン固有の最適化が適用されます。その後、データは圧縮され、②新しいデータパートの形式でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouseサーバーの[ディスクファイルI/O使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)とメモリ使用量の両方に影響します。より大きな挿入ブロックはより多くのメモリを使用しますが、より大きく、より少ない初期パートを生成します。大量のデータをロードするためにClickHouseが作成する必要があるパートが少ないほど、ディスクファイルI/Oと自動[バックグラウンドマージの必要性](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)が減少します。

統合テーブルエンジンまたはテーブル関数と組み合わせて`INSERT INTO SELECT`クエリを使用する場合、データはClickHouseサーバーによってプルされます：

<Image
  img={Pull}
  size='lg'
  border
  alt='ClickHouseにおける外部ソースからのデータプル'
/>

データが完全にロードされるまで、サーバーはループを実行します：

```bash
① 次のデータ部分をプルして解析し、そこから（パーティショニングキーごとに1つの）インメモリデータブロックを形成します。

② ブロックをストレージ上の新しいパートに書き込みます。

①に戻る
```

①では、サイズは挿入ブロックサイズに依存し、2つの設定で制御できます：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（デフォルト：`1048545`行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（デフォルト：`256 MiB`）

挿入ブロックに指定された行数が収集されるか、設定されたデータ量に達すると（どちらか先に発生した方）、ブロックが新しいパートに書き込まれるトリガーとなります。挿入ループはステップ①で継続されます。

`min_insert_block_size_bytes`の値は、非圧縮のインメモリブロックサイズを示すことに注意してください（圧縮されたディスク上のパートサイズではありません）。また、ClickHouseはデータを行[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングおよび[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、作成されたブロックとパートが設定された行数またはバイト数を正確に含むことはほとんどないことに注意してください。したがって、これらの設定は最小しきい値を指定します。

#### マージに注意 {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大規模なデータロードに対してより多くの初期パートが作成され、データ取り込みと同時により多くのバックグラウンドパートマージが実行されます。これにより、リソースの競合（CPUとメモリ）が発生し、取り込み完了後に[健全な](/operations/settings/merge-tree-settings#parts_to_throw_insert)パート数（3000）に到達するための追加時間が必要になる可能性があります。

:::important
パート数が[推奨制限](/operations/settings/merge-tree-settings#parts_to_throw_insert)を超えると、ClickHouseのクエリパフォーマンスに悪影響が及びます。
:::

ClickHouseは、圧縮サイズが約150 GiBに[達する](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)まで、継続的に[パートをマージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)してより大きなパートにします。この図は、ClickHouseサーバーがパートをマージする方法を示しています：

<Image img={Merges} size='lg' border alt='ClickHouseにおけるバックグラウンドマージ' />

単一のClickHouseサーバーは、複数の[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を利用して、並行[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行します。各スレッドはループを実行します：

```bash
① 次にマージするパートを決定し、これらのパートをブロックとしてメモリにロードします。

② ロードされたブロックをメモリ内でより大きなブロックにマージします。

```


③ マージされたブロックを新しいパーツとしてディスクに書き込む。

①に戻る

````

CPUコア数とRAMサイズを[増やす](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size)ことで、バックグラウンドマージのスループットが向上します。

より大きなパーツにマージされたパーツは[inactive](/operations/system-tables/parts)としてマークされ、[設定可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)時間が経過した後に削除されます。時間の経過とともに、マージされたパーツのツリー構造が形成されます（これが[`MergeTree`](/engines/table-engines/mergetree-family)テーブルという名前の由来です）。

### インサートの並列処理 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="インサート並列処理のリソース使用状況" />

ClickHouseサーバーはデータを並列に処理および挿入できます。インサートの並列度は、ClickHouseサーバーの取り込みスループットとメモリ使用量に影響します。データを並列にロードおよび処理するには、より多くのメインメモリが必要になりますが、データ処理が高速化されるため、取り込みスループットが向上します。

s3などのテーブル関数では、globパターンを使用してロード対象のファイル名セットを指定できます。globパターンが複数の既存ファイルに一致する場合、ClickHouseはこれらのファイル間およびファイル内で読み取りを並列化し、並列実行されるインサートスレッド（サーバーごと）を利用してデータをテーブルに並列挿入できます。 

<Image img={InsertThreads} size="lg" border alt="ClickHouseの並列インサートスレッド" />

すべてのファイルからすべてのデータが処理されるまで、各インサートスレッドは以下のループを実行します。 

```bash
① 未処理のファイルデータの次の部分を取得し（部分サイズは設定されたブロックサイズに基づく）、それからインメモリデータブロックを作成します。

② ブロックをストレージ上の新しいパーツに書き込みます。

①に戻ります。 
````

このような並列 `INSERT` スレッドの数は、[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 設定で構成できます。デフォルト値は、オープンソース版 ClickHouse では `1`、[ClickHouse Cloud](https://clickhouse.com/cloud) では `4` です。

ファイル数が多い場合、複数の `INSERT` スレッドによる並列処理は有効に機能します。利用可能な CPU コアとネットワーク帯域幅（並列ファイルダウンロード用）の両方を最大限に活用できます。少数の大きなファイルだけをテーブルにロードするシナリオでは、ClickHouse は自動的にデータ処理の高い並列度を確保し、各 `INSERT` スレッドごとに追加のリーダースレッドを生成して、大きなファイル内のより多くの異なる範囲を並列に読み取る（ダウンロードする）ことで、ネットワーク帯域幅の利用を最適化します。

`s3` 関数およびテーブルにおいて、個々のファイルの並列ダウンロードは、[max&#95;download&#95;threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) と [max&#95;download&#95;buffer&#95;size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) の値によって決まります。ファイルは、そのサイズが `2 * max_download_buffer_size` より大きい場合にのみ並列でダウンロードされます。デフォルトでは、`max_download_buffer_size` は 10MiB に設定されています。場合によっては、このバッファサイズを安全に 50MB（`max_download_buffer_size=52428800`）まで増やし、各ファイルが単一スレッドによってダウンロードされるようにすることができます。これにより、各スレッドが S3 コールに費やす時間を減らし、結果として S3 の待ち時間も短縮できます。さらに、並列読み取りには小さすぎるファイルについてスループットを向上させるため、ClickHouse はそのようなファイルを非同期に先読みすることで自動的にデータをプリフェッチします。


## パフォーマンスの測定 {#measuring-performance}

S3テーブル関数を使用したクエリのパフォーマンス最適化は、データをその場でクエリする場合(すなわち、ClickHouseのコンピュートリソースのみを使用し、データは元の形式でS3に保持されるアドホッククエリ)と、S3からClickHouseのMergeTreeテーブルエンジンにデータを挿入する場合の両方で必要となります。特に指定がない限り、以下の推奨事項は両方のシナリオに適用されます。


## ハードウェアサイズの影響 {#impact-of-hardware-size}

<Image
  img={HardwareSize}
  size='lg'
  border
  alt='ClickHouseのパフォーマンスに対するハードウェアサイズの影響'
/>

利用可能なCPUコア数とRAMサイズは、以下に影響を与えます：

- サポートされる[パートの初期サイズ](#insert-block-size)
- [挿入の並列度](#insert-parallelism)の可能なレベル
- [バックグラウンドパートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)のスループット

そのため、全体的なデータ取り込みスループットに影響します。


## リージョンの局所性 {#region-locality}

バケットをClickHouseインスタンスと同じリージョンに配置してください。この単純な最適化により、特にAWSインフラストラクチャ上にClickHouseインスタンスをデプロイしている場合、スループットパフォーマンスを大幅に向上させることができます。


## フォーマット {#formats}

ClickHouseは、`s3`関数と`S3`エンジンを使用して、S3バケットに保存されたファイルを[サポートされているフォーマット](/interfaces/formats#formats-overview)で読み取ることができます。生ファイルを読み取る場合、これらのフォーマットの一部には明確な利点があります:

- Native、Parquet、CSVWithNames、TabSeparatedWithNamesなど、カラム名がエンコードされているフォーマットは、`s3`関数でカラム名を指定する必要がないため、クエリがより簡潔になります。カラム名により、この情報を推測することができます。
- フォーマットによって、読み取りおよび書き込みスループットのパフォーマンスが異なります。NativeとParquetは、すでにカラム指向でよりコンパクトであるため、読み取りパフォーマンスにおいて最も最適なフォーマットです。Nativeフォーマットは、ClickHouseがメモリにデータを保存する方法と整合しているため、データがClickHouseにストリーミングされる際の処理オーバーヘッドが削減されるという追加の利点があります。
- ブロックサイズは、大きなファイルの読み取りレイテンシに影響を与えることがよくあります。これは、データをサンプリングするだけの場合、例えば上位N行を返す場合に非常に顕著です。CSVやTSVなどのフォーマットの場合、行のセットを返すためにファイルを解析する必要があります。NativeやParquetなどのフォーマットは、その結果としてより高速なサンプリングを可能にします。
- 各圧縮フォーマットには長所と短所があり、多くの場合、速度のために圧縮レベルのバランスを取り、圧縮または解凍パフォーマンスに偏りがあります。CSVやTSVなどの生ファイルを圧縮する場合、lz4は圧縮レベルを犠牲にして最速の解凍パフォーマンスを提供します。Gzipは通常、わずかに遅い読み取り速度を犠牲にして、より良い圧縮を実現します。Xzはこれをさらに進め、通常、最も遅い圧縮および解凍パフォーマンスで最良の圧縮を提供します。エクスポートする場合、GzとLz4は同等の圧縮速度を提供します。これを接続速度とバランスさせてください。より高速な解凍または圧縮による利点は、S3バケットへの接続が遅い場合、容易に相殺されます。
- NativeやParquetなどのフォーマットは、通常、圧縮のオーバーヘッドを正当化しません。これらのフォーマットは本質的にコンパクトであるため、データサイズの削減はわずかである可能性が高いです。圧縮と解凍に費やされる時間が、ネットワーク転送時間を相殺することはほとんどありません。特にS3はより高いネットワーク帯域幅でグローバルに利用可能であるためです。


## サンプルデータセット {#example-dataset}

さらなる最適化の可能性を示すため、[Stack Overflowデータセットの投稿データ](/data-modeling/schema-design#stack-overflow-dataset)を使用します。このデータに対するクエリとインサートの両方のパフォーマンスを最適化します。

このデータセットは189個のParquetファイルで構成されており、2008年7月から2024年3月までの各月ごとに1つのファイルがあります。

[上記の推奨事項](#formats)に従い、パフォーマンスのためにParquetを使用しています。すべてのクエリは、バケットと同じリージョンに配置されたClickHouseクラスタ上で実行されます。このクラスタは3ノードで構成され、各ノードは32GiBのRAMと8つのvCPUを搭載しています。

チューニングを行わない状態で、このデータセットをMergeTreeテーブルエンジンに挿入するパフォーマンスと、最も多くの質問をしているユーザーを計算するクエリを実行するパフォーマンスを示します。これらのクエリはいずれも意図的にデータの完全スキャンを必要とします。

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

5行が返されました。経過時間: 3.013秒。処理された行数: 5982万行、24.03 GB（1986万行/秒、7.98 GB/秒）
ピークメモリ使用量: 603.64 MiB。

-- postsテーブルへのロード
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0行が返されました。経過時間: 191.692秒。処理された行数: 5982万行、24.03 GB（31万2060行/秒、125.37 MB/秒）
```

この例では数行のみを返しています。大量のデータがクライアントに返される`SELECT`クエリのパフォーマンスを測定する場合は、クエリに[nullフォーマット](/interfaces/formats/Null)を使用するか、結果を[`Null`エンジン](/engines/table-engines/special/null.md)に向けてください。これにより、クライアントがデータで圧倒されたり、ネットワークが飽和したりすることを回避できます。

:::info
クエリからの読み取り時、初回のクエリは同じクエリを繰り返した場合よりも遅く見えることがよくあります。これはS3自体のキャッシングと[ClickHouseスキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache)の両方に起因します。このキャッシュはファイルの推論されたスキーマを保存するため、後続のアクセスでは推論ステップをスキップでき、クエリ時間が短縮されます。
:::


## 読み取りにおけるスレッドの使用 {#using-threads-for-reads}

S3における読み取りパフォーマンスは、ネットワーク帯域幅やローカルI/Oによる制限がない限り、コア数に比例して線形にスケールします。スレッド数を増やすとメモリオーバーヘッドが変動するため、ユーザーはこの点に注意する必要があります。読み取りスループットパフォーマンスを向上させるために、以下の設定を変更できます:

- 通常、`max_threads`のデフォルト値(コア数)で十分です。クエリで使用されるメモリ量が多くこれを削減する必要がある場合、または結果の`LIMIT`が小さい場合は、この値を低く設定できます。十分なメモリを持つユーザーは、S3からの読み取りスループットを向上させる可能性があるため、この値を増やして試すことができます。通常、これはコア数が少ないマシン(10未満)でのみ有効です。ネットワークやCPU競合などの他のリソースがボトルネックとなるため、さらなる並列化による効果は通常減少します。
- ClickHouseのバージョン22.3.1より前では、`s3`関数または`S3`テーブルエンジンを使用する際、複数ファイル間でのみ読み取りが並列化されていました。これにより、最適な読み取りパフォーマンスを実現するには、ユーザーがS3上でファイルをチャンクに分割し、globパターンを使用して読み取る必要がありました。それ以降のバージョンでは、ファイル内でのダウンロードが並列化されるようになりました。
- スレッド数が少ないシナリオでは、`remote_filesystem_read_method`を「read」に設定してS3からのファイルの同期読み取りを行うことで、パフォーマンスが向上する可能性があります。
- s3関数とテーブルの場合、個別ファイルの並列ダウンロードは[`max_download_threads`](/operations/settings/settings#max_download_threads)と[`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size)の値によって決定されます。[`max_download_threads`](/operations/settings/settings#max_download_threads)は使用されるスレッド数を制御しますが、ファイルのサイズが2 \* `max_download_buffer_size`より大きい場合にのみ並列でダウンロードされます。デフォルトでは、`max_download_buffer_size`は10MiBに設定されています。場合によっては、このバッファサイズを50MB(`max_download_buffer_size=52428800`)まで安全に増やすことができ、小さなファイルが単一のスレッドでのみダウンロードされるようにすることができます。これにより、各スレッドがS3呼び出しに費やす時間を削減し、S3の待機時間も短縮できます。この例については、[このブログ記事](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)を参照してください。

パフォーマンスを向上させるための変更を行う前に、適切に測定することを確認してください。S3 API呼び出しはレイテンシに敏感であり、クライアントのタイミングに影響を与える可能性があるため、パフォーマンスメトリクスにはクエリログ(`system.query_log`)を使用してください。

先ほどのクエリを考えると、`max_threads`を`16`に倍増させる(デフォルトの`max_thread`はノード上のコア数)ことで、メモリ使用量の増加と引き換えに読み取りクエリのパフォーマンスが2倍向上します。以下に示すように、`max_threads`をさらに増やしても効果は逓減します。

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

5行が返されました。経過時間: 1.505 秒。処理: 59.82 万行、 24.03 GB (39.76 万行/秒、 15.97 GB/s.)
ピークメモリ使用量: 178.58 MiB.

SETTINGS max_threads = 32

5行が返されました。経過時間: 0.779 秒。処理: 59.82 万行、 24.03 GB (76.81 万行/秒、 30.86 GB/s.)
ピークメモリ使用量: 369.20 MiB.

SETTINGS max_threads = 64

5行が返されました。経過時間: 0.674 秒。処理: 59.82 万行、 24.03 GB (88.81 万行/秒、 35.68 GB/s.)
ピークメモリ使用量: 639.99 MiB.
```


## 挿入のスレッド数とブロックサイズのチューニング {#tuning-threads-and-block-size-for-inserts}

最大の取り込みパフォーマンスを実現するには、(3) 利用可能なCPUコア数とRAM容量に基づいて、(1) 挿入ブロックサイズと (2) 適切な挿入並列度を選択する必要があります。要約すると以下の通りです:

- [挿入ブロックサイズ](#insert-block-size)を大きく設定するほど、ClickHouseが作成する必要のあるパート数が減少し、必要な[ディスクファイルI/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems)と[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)の回数も減少します。
- [並列挿入スレッド数](#insert-parallelism)を多く設定するほど、データの処理速度が向上します。

これら2つのパフォーマンス要因の間には相反するトレードオフが存在します(さらにバックグラウンドパートマージとのトレードオフもあります)。ClickHouseサーバーで利用可能なメインメモリ量には限りがあります。ブロックサイズを大きくするとメインメモリの使用量が増加し、利用できる並列挿入スレッド数が制限されます。逆に、並列挿入スレッド数を増やすとメインメモリの使用量が増加します。これは、挿入スレッド数によってメモリ内で同時に作成される挿入ブロック数が決まるためです。これにより、挿入ブロックの可能なサイズが制限されます。さらに、挿入スレッドとバックグラウンドマージスレッドの間でリソース競合が発生する可能性があります。挿入スレッド数を多く設定すると、(1) マージが必要なパート数が増加し、(2) バックグラウンドマージスレッドが利用できるCPUコアとメモリ領域が減少します。

これらのパラメータの動作がパフォーマンスとリソースに与える影響の詳細については、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)をお読みいただくことを推奨します。このブログ記事で説明されているように、チューニングには2つのパラメータの慎重なバランス調整が必要です。網羅的なテストは実用的でないことが多いため、要約すると以下を推奨します:

```bash
• max_insert_threads: 挿入スレッドには利用可能なCPUコアの約半分を選択します(バックグラウンドマージ用に十分な専用コアを残すため)

• peak_memory_usage_in_bytes: 想定されるピークメモリ使用量を選択します。単独の取り込みの場合は利用可能なRAMすべて、または他の同時実行タスクのための余裕を残すために半分以下を選択します

その後:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この式を使用して、`min_insert_block_size_rows`を0に設定し(行ベースの閾値を無効化)、`max_insert_threads`を選択した値に、`min_insert_block_size_bytes`を上記の式から計算された結果に設定できます。

先ほどのStack Overflowの例でこの式を使用します。

- `max_insert_threads=4`(ノードあたり8コア)
- `peak_memory_usage_in_bytes` - 32 GiB(ノードリソースの100%)または`34359738368`バイト
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

示されているように、これらの設定のチューニングにより挿入パフォーマンスが`33%`以上向上しました。単一ノードのパフォーマンスをさらに改善できるかどうかは、読者の皆様にお任せします。


## リソースとノードによるスケーリング {#scaling-with-resources-and-nodes}

リソースとノードによるスケーリングは、読み取りクエリと挿入クエリの両方に適用されます。

### 垂直スケーリング {#vertical-scaling}

これまでのチューニングとクエリは、すべてClickHouse Cloudクラスタ内の単一ノードのみを使用してきました。ユーザーは複数のClickHouseノードを利用できることも多くあります。まず垂直スケーリングを行うことを推奨します。これにより、コア数に比例してS3スループットが線形に向上します。リソースを2倍にした大規模なClickHouse Cloudノード(64GiB、16 vCPU)で、適切な設定を使用して先ほどの挿入クエリと読み取りクエリを繰り返すと、両方とも約2倍の速度で実行されます。

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
個々のノードは、ネットワークとS3 GETリクエストによってボトルネックになる可能性があり、垂直方向のパフォーマンスの線形スケーリングが妨げられることがあります。
:::

### 水平スケーリング {#horizontal-scaling}

最終的には、ハードウェアの可用性とコスト効率の観点から、水平スケーリングが必要になることがよくあります。ClickHouse Cloudでは、本番クラスタには少なくとも3つのノードがあります。そのため、ユーザーは挿入処理にすべてのノードを活用したい場合があります。

S3読み取りにクラスタを活用するには、[クラスタの活用](/integrations/s3#utilizing-clusters)で説明されている`s3Cluster`関数を使用する必要があります。これにより、読み取り処理をノード間で分散できます。

挿入クエリを最初に受信するサーバーは、まずglobパターンを解決し、次に一致する各ファイルの処理を自身と他のサーバーに動的に割り当てます。

<Image
  img={S3Cluster}
  size='lg'
  border
  alt='ClickHouseのs3Cluster関数'
/>

先ほどの読み取りクエリを3つのノードに負荷を分散して繰り返し実行します。クエリを`s3Cluster`を使用するように調整します。ClickHouse Cloudでは、`default`クラスタを参照することで、これが自動的に実行されます。

[クラスタの活用](/integrations/s3#utilizing-clusters)で述べたように、この処理はファイルレベルで分散されます。この機能を活用するには、十分な数のファイル、つまり少なくともノード数より多いファイルが必要です。

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

同様に、挿入クエリも分散できます。単一ノード用に先ほど特定した改善された設定を使用します。

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```


読者は、ファイルの読み込みによってクエリ性能は向上しているものの、挿入性能は向上していないことに気付くはずです。デフォルトでは、読み取りは `s3Cluster` を使って分散されますが、挿入はイニシエーターノードに対して行われます。これは、読み取りは各ノードで実行される一方で、得られた行は分配のためにイニシエーターノードへルーティングされることを意味します。高スループットのシナリオでは、これがボトルネックとなる可能性があります。これに対処するには、`s3cluster` 関数に対してパラメータ `parallel_distributed_insert_select` を設定します。

これを `parallel_distributed_insert_select=2` に設定すると、各ノード上の分散エンジンの基盤となるテーブルに対して、各シャードごとに `SELECT` と `INSERT` が実行されるようになります。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

予想どおり、これによって挿入パフォーマンスは3分の1になります。


## さらなるチューニング {#further-tuning}

### 重複排除の無効化 {#disable-de-duplication}

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入が失敗した場合、データが正常に挿入されたかどうかは不明です。クライアントが挿入を安全に再試行できるようにするため、ClickHouse Cloudなどの分散デプロイメントでは、デフォルトでClickHouseがデータが既に正常に挿入されているかどうかを判定しようとします。挿入されたデータが重複としてマークされている場合、ClickHouseはそれを宛先テーブルに挿入しません。ただし、ユーザーにはデータが正常に挿入されたかのように成功ステータスが返されます。

この動作は挿入のオーバーヘッドを伴いますが、クライアントからデータをロードする場合やバッチ処理では有用である一方、オブジェクトストレージから`INSERT INTO SELECT`を実行する場合には不要となることがあります。挿入時にこの機能を無効にすることで、以下に示すようにパフォーマンスを向上させることができます:

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

ClickHouseでは、`optimize_on_insert`設定が挿入プロセス中にデータパートをマージするかどうかを制御します。有効にすると(デフォルトで`optimize_on_insert = 1`)、小さなパートが挿入時に大きなパートにマージされ、読み取る必要があるパート数が減少することでクエリパフォーマンスが向上します。ただし、このマージは挿入プロセスにオーバーヘッドを追加し、高スループットの挿入を遅くする可能性があります。

この設定を無効にすると(`optimize_on_insert = 0`)、挿入中のマージがスキップされ、特に頻繁な小規模挿入を処理する際にデータをより迅速に書き込むことができます。マージプロセスはバックグラウンドに延期され、挿入パフォーマンスが向上しますが、一時的に小さなパートの数が増加し、バックグラウンドマージが完了するまでクエリが遅くなる可能性があります。この設定は、挿入パフォーマンスが優先事項であり、バックグラウンドマージプロセスが後で効率的に最適化を処理できる場合に最適です。以下に示すように、この設定を無効にすると挿入スループットが向上します:

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```


## その他の注意事項 {#misc-notes}

- メモリが限られた環境では、S3への挿入時に`max_insert_delayed_streams_for_parallel_write`の値を下げることを検討してください。
