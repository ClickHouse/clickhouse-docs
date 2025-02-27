---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: パフォーマンスの最適化
title: S3の挿入および読み取りパフォーマンスの最適化
description: S3の読み取りおよび挿入のパフォーマンスを最適化する
---

このセクションでは、[s3テーブル関数](/sql-reference/table-functions/s3)を使用してS3からデータを読み込みおよび挿入する際のパフォーマンスを最適化することに焦点を当てています。

:::info
**このガイドで説明するレッスンは、[GCS](/sql-reference/table-functions/gcs)や[Azure Blob storage](/sql-reference/table-functions/azureBlobStorage)などの専用テーブル関数を持つ他のオブジェクトストレージの実装にも適用できます。**
:::

挿入パフォーマンスを向上させるためにスレッドやブロックサイズを調整する前に、ユーザーはS3挿入のメカニズムを理解することをお勧めします。挿入メカニズムに精通している場合や、ちょっとしたヒントが欲しいだけの場合は、以下の例[にスキップしてください](/integrations/s3/performance#example-dataset)。

## 挿入メカニズム（単一ノード） {#insert-mechanics-single-node}

ハードウェアのサイズに加えて、ClickHouseのデータ挿入メカニズム（単一ノード）のパフォーマンスとリソース使用に影響を与える主な要素は2つあります：**挿入ブロックサイズ**と**挿入の並列性**です。

### 挿入ブロックサイズ {#insert-block-size}

![insert_mechanics](./images/insert_mechanics.png)

`INSERT INTO SELECT`を実行すると、ClickHouseはデータの一部を受信し、①受信したデータから（少なくとも）1つのインメモリ挿入ブロックを形成します（[パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごと）。ブロックのデータはソートされ、テーブルエンジン特有の最適化が適用されます。その後、データは圧縮され、②新しいデータパーツの形でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouseサーバーの[ディスクファイルI/O使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)とメモリ使用量の両方に影響します。大きな挿入ブロックはより多くのメモリを使用しますが、初期パーツがより大きく、少なくなります。大量のデータをロードするためにClickHouseが作成するパーツが少ないほど、ディスクファイルI/Oおよび自動[バックグラウンドマージの必要性](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)は少なくなります。

`INSERT INTO SELECT`クエリを統合テーブルエンジンまたはテーブル関数と組み合わせて使用する場合、データはClickHouseサーバーによってプルされます：

![pull data](./images/pull.png)

データが完全にロードされるまで、サーバーはループを実行します：

```bash
① 次の未処理のデータの部分をプルし、そこからインメモリのデータブロックを形成します（パーティショニングキーごとに1つ）。

② ブロックをストレージの新しいパートに書き込みます。

①に戻る
```

①では、サイズは挿入ブロックサイズに依存し、以下の2つの設定で制御できます：

- [`min_insert_block_size_rows`](/operations/settings/settings#min-insert-block-size-rows)（デフォルト：`1048545`百万行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min-insert-block-size-bytes)（デフォルト：`256 MiB`）

挿入ブロック内に指定された行数が収集されるか、設定されたデータ量に達すると（どちらか早く発生した方）、ブロックが新しいパートに書き込まれます。挿入ループはステップ①を続けます。

`min_insert_block_size_bytes`の値は、圧縮されていないインメモリブロックサイズを示します（圧縮されたディスク上のパートサイズではありません）。また、作成されたブロックとパーツは、ClickHouseがデータを行-[ブロック](/operations/settings/settings#setting-max_block_size)単位でストリームして[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、設定された行数またはバイト数を正確に含むことはほとんどありません。したがって、これらの設定は最小閾値を指定します。

#### マージに注意 {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量のデータローディングのために作成される初期パーツが多くなり、データ取り込み中にバックグラウンドパートのマージが同時に多く実行されます。これにより、リソースの競合（CPUおよびメモリ）が発生し、取り込みが終了した後に[健全な](/operations/settings/merge-tree-settings#parts-to-throw-insert)（3000）数のパーツに到達するまでに追加の時間が必要になる場合があります。

:::important
パーツ数が[推奨された制限](/operations/settings/merge-tree-settings#parts-to-throw-insert)を超えると、ClickHouseのクエリパフォーマンスに悪影響を及ぼします。
:::

ClickHouseは、継続的に[パーツをマージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)してより大きなパーツにし、[最大](https://operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool)約150 GiBの圧縮サイズに達するまでマージを行います。この図は、ClickHouseサーバーがパーツをマージする方法を示しています：

![merges](./images/merges.png)

単一のClickHouseサーバーは、いくつかの[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を利用して同時に[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行します。各スレッドはループを実行します：

```bash
① 次にマージするパーツを決定し、これらのパーツをブロックとしてメモリにロードします。

② メモリ内のロードされたブロックをより大きなブロックにマージします。

③ マージされたブロックをディスクの新しいパートに書き込みます。

①に戻る
```

[増加させる](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size)ことにより、CPUコアの数とRAMのサイズを増やすと、バックグラウンドマージのスループットが増加します。

より大きなパーツにマージされたパーツは、[非アクティブ](/operations/system-tables/parts)としてマークされ、最終的に[設定可能な](https://operations/settings/merge-tree-settings#old-parts-lifetime)数分後に削除されます。時間が経つにつれて、マージされたパーツのツリーが作成されます（したがって[`MergeTree`](/engines/table-engines/mergetree-family)テーブルという名前が付けられています）。

### 挿入の並列性 {#insert-parallelism}

![resource_usage](./images/resource_usage.png)

ClickHouseサーバーは、データを並列に処理および挿入できます。挿入の並列性のレベルは、ClickHouseサーバーの取り込みスループットとメモリ使用量に影響を与えます。データを並列にロードおよび処理するには、メインメモリがより多く必要ですが、データが迅速に処理されるため、取り込みスループットが向上します。

s3のようなテーブル関数では、読み込むファイル名のセットをグロブパターンを使用して指定できます。グロブパターンが複数の既存のファイルに一致すると、ClickHouseはこれらのファイル間およびファイル内で読み取りを並列化し、並行してテーブルにデータを挿入するために、並行して実行される挿入スレッドを使用します（サーバーごと）：

![insert_threads](./images/insert_threads.png)

すべてのファイルからのデータが処理されるまで、各挿入スレッドはループを実行します：

```bash
① 未処理のファイルデータの次の部分を取得し（部分サイズは設定されたブロックサイズに基づく）、そこからインメモリデータブロックを作成します。

② ブロックを新しいパートに書き込みます。

①に戻る。
```

このような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#settings-max-insert-threads)設定で構成できます。オープンソースのClickHouseのデフォルト値は`1`であり、[ClickHouse Cloud](https://clickhouse.com/cloud)では4です。

多数のファイルがある場合、複数の挿入スレッドによる並列処理がうまく機能します。これにより、利用可能なCPUコアとネットワーク帯域幅（並行ファイルダウンロードのため）が完全に飽和状態になります。少数の大きなファイルのみをテーブルにロードするシナリオでは、ClickHouseは自動的に高いデータ処理の並列性を確立し、並行して大きなファイル内の異なる範囲を読み取るために各挿入スレッドごとに追加のリーダースレッドを生成してネットワーク帯域幅の使用を最適化します。

s3関数およびテーブルの場合、個々のファイルの並列ダウンロードは、[max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads)および[max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size)の値によって決まります。ファイルのサイズが`2 * max_download_buffer_size`を超える場合にのみ、ファイルは並列にダウンロードされます。デフォルトでは、`max_download_buffer_size`は10MiBに設定されています。場合によっては、このバッファサイズを50MB（`max_download_buffer_size=52428800`）に安全に増やすことができ、各ファイルが単一のスレッドによってダウンロードされることを保証します。これにより、各スレッドがS3コールを行うのに費やす時間が減り、S3の待機時間も短縮できます。さらに、並列読み取りには小さすぎるファイルについては、ClickHouseが自動的にデータをプリフェッチすることで、スループットを向上させるために非同期にこのようなファイルを再読み込みします。

## パフォーマンスの測定 {#measuring-performance}

S3テーブル関数を使用してクエリのパフォーマンスを最適化することは、データがその場で実行されるクエリ、すなわちClickHouseの計算だけが使用され、データがS3にオリジナルフォーマットのまま残る場合と、ClickHouseのMergeTreeテーブルエンジンにデータを挿入する場合の両方に必要です。特に指定されない限り、次の推奨事項は両方のシナリオに適用されます。

## ハードウェアのサイズの影響 {#impact-of-hardware-size}

![Hardware size](./images/hardware_size.png)

利用可能なCPUコアの数とRAMのサイズは、次の要素に影響を与えます：

- サポートされる[初期パーツサイズ](#insert-block-size)
- 可能な[挿入の並列性](#insert-parallelism)
- [バックグラウンドパートマージのスループット](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

したがって、全体の取り込みスループットに影響を与えます。

## リージョンのローカリティ {#region-locality}

バケットがClickHouseインスタンスと同じリージョンにあることを確認してください。この簡単な最適化により、特にClickHouseインスタンスをAWSインフラストラクチャに展開する場合、スループットパフォーマンスが劇的に改善されることがあります。

## フォーマット {#formats}

ClickHouseは、`s3`関数および`S3`エンジンを使用して、S3バケットに保存されたファイルを[サポートされているフォーマット](/interfaces/formats.md/#data-formatting)で読み取ることができます。生のファイルを読み取る場合、これらのフォーマットのいくつかには独自の利点があります：

* Native、Parquet、CSVWithNames、TabSeparatedWithNamesなどのエンコードされたカラム名を持つフォーマットは、`s3`関数でカラム名を指定する必要がないため、クエリが冗長でなくなります。カラム名によりこの情報が推測可能になります。
* 読み取りおよび書き込みスループットに関して、フォーマットごとにパフォーマンスが異なります。NativeおよびParquetは、すでに列指向でよりコンパクトであるため、読み取りパフォーマンスに最適なフォーマットです。Nativeフォーマットは、ClickHouseがメモリ内にデータを保存する方法に合わせた調整の恩恵を受け、データがClickHouseにストリームされる際の処理オーバーヘッドを削減します。
* ブロックサイズは、大きなファイルの読み取りのレイテンシに影響を与えます。これは、データをサンプルするだけの場合、例えば、上位N行を返す場合に非常に明らかです。CSVやTSVのようなフォーマットの場合、行セットを返すためにファイルを解析する必要があります。NativeやParquetのようなフォーマットでは、その結果、より早くサンプリングすることができます。
* 各圧縮フォーマットには長所と短所があり、しばしば速度のために圧縮レベルとのトレードオフがあります。また、圧縮または解凍パフォーマンスを偏らせることもあります。生のファイル（CSVやTSVなど）を圧縮する場合、lz4は最速の解凍パフォーマンスを提供しますが、圧縮レベルは犠牲になります。Gzipは、わずかにスピードが遅くなる代わりに、通常はより良い圧縮を行います。Xzは、通常は最も良い圧縮を提供しますが、圧縮と解凍のパフォーマンスは最も遅くなります。エクスポートする場合、Gzとlz4は比較可能な圧縮速度を提供します。これを接続速度とバランスを取る必要があります。圧縮または解凍の高速化によるつかみは、S3バケットへの遅い接続によって簡単に台無しにされてしまいます。
* NativeやParquetのようなフォーマットは、通常、圧縮のオーバーヘッドを正当化することはありません。データサイズの節約は最小限である可能性が高いため、これらのフォーマットは本質的にコンパクトです。圧縮や解凍に費やす時間は、ネットワーク転送時間を埋め合わせることはほとんどありません。特に、s3はグローバルに利用可能で高いネットワーク帯域幅を持っているためです。

## 例データセット {#example-dataset}

さらなる最適化の可能性を示すために、[Stack Overflowデータセットのポスト](/data-modeling/schema-design#stack-overflow-dataset)を使用します。このデータのクエリおよび挿入の両方のパフォーマンスを最適化します。

このデータセットは、2008年7月から2024年3月までの各月に1つずつ、189のParquetファイルで構成されています。

パフォーマンスを考慮し、上記の[推奨事項](#formats)に従い、すべてのクエリをバケットと同じリージョンにあるClickHouseクラスタで実行しています。このクラスタは3つのノードで構成されており、それぞれ32GiBのRAMと8つのvCPUを持っています。

調整なしで、このデータセットをMergeTreeテーブルエンジンに挿入し、最も多くの質問をしたユーザーを計算するクエリを実行するパフォーマンスを示します。これらのクエリは、意図的にデータの完全なスキャンを必要とします。

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

5行がセットにあります。経過時間: 3.013秒. 処理された行: 59820000行, 24.03 GB (19.86百万行/s., 7.98 GB/s.)
ピークメモリ使用量: 603.64 MiB.

-- postsテーブルに読み込む
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0行がセットにあります。経過時間: 191.692秒. 処理された行: 59820000行, 24.03 GB (312.06千行/s., 125.37 MB/s.)
```

この例では、いくつかの行のみを返します。大量のデータがクライアントに返される`SELECT`クエリのパフォーマンスを測定する場合は、クエリに対して[nullフォーマット](/interfaces/formats/#null)を利用するか、直接結果を[`Null`エンジン](/engines/table-engines/special/null.md)にルーティングしてください。これにより、クライアントがデータの流入に圧倒されることとネットワークの過負荷を回避できます。

:::info
クエリから読み取る際、初期クエリが同じクエリを繰り返すよりも遅く表示されることがよくあります。これは、S3のキャッシングに加えて、[ClickHouseスキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache)にも起因します。これにより、ファイルの推論スキーマが保存されるため、以降のアクセス時に推論ステップをスキップでき、クエリ時間が短縮されます。
:::

## 読み取りのためのスレッドの使用 {#using-threads-for-reads}

S3の読み取りパフォーマンスは、コアの数に応じて線形にスケールします。ただし、ネットワーク帯域幅やローカルI/Oに制約されていない場合です。スレッドの数を増やすことは、また、ユーザーが認識しておくべきメモリオーバーヘッドの変動をもたらします。次の設定を変更することで、読み取りスループットを改善できる可能性があります：

* 通常、`max_threads`のデフォルト値は、コアの数、つまり十分です。クエリのメモリ使用量が高く、これを減らす必要がある場合や、結果の`LIMIT`が低い場合には、この値を下げることができます。メモリが十分にあるユーザーは、この値を増やすことでS3からの可能な読み取りスループットを向上させるために実験を希望するかもしれません。一般的に、これはコア数が10未満のマシンでのみ有効です。さらに並列化による恩恵は、他のリソースがボトルネックになるため、通常は疑わしくなります。
* ClickHouseのバージョン22.3.1以前では、`s3`関数または`S3`テーブルエンジンを使用しているときのみ、複数のファイルにわたって読み取りが並列化されました。これには、ユーザーがファイルをS3でチャンクに分割し、最適な読み取りパフォーマンスを実現するためにグロブパターンを使用して読み取ることを保証する必要がありました。後のバージョンでは、ファイル内でのダウンロードも並行実行されるようになりました。
* スレッド数が少ないシナリオでは、ユーザーは`remote_filesystem_read_method`を"read"に設定することで、S3からのファイルの同期読み取りが実行される利点が得られるかもしれません。
* s3関数およびテーブルの場合、指定されているファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads)および[`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size)の値によって判断されます。[`max_download_threads`](/operations/settings/settings#max_download_threads)は使用するスレッドの数を制御しますが、ファイルのサイズが`2 * max_download_buffer_size`を超える場合にのみ、ファイルは並列にダウンロードされます。デフォルトでは、`max_download_buffer_size`は10MiBに設定されています。場合によっては、このバッファサイズを50MB（`max_download_buffer_size=52428800`）に安全に増やすことができ、より小さなファイルは単一のスレッドによってのみダウンロードされるようにすることができます。これは、各スレッドがS3呼び出しに費やす時間を減らし、S3の待機時間を短縮する可能性があります。この例については、[このブログ投稿](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)をご覧ください。

パフォーマンスを向上させる変更を行う前に、適切に測定してください。S3 API呼び出しはレイテンシに敏感であり、クライアントのタイミングに影響を及ぼす可能性があるため、パフォーマンスメトリックにはクエリログを使用します。つまり、`system.query_log`です。

先ほどのクエリを考慮し、`max_threads`を`16`に倍増させることにより（デフォルトの`max_thread`はノード上のコアの数です）、読み取りクエリのパフォーマンスが2倍向上しますが、メモリの消費量は増加します。さらに`max_threads`を増加させると、次のようにリターンが減少します。

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

5行がセットにあります。経過時間: 1.505秒. 処理された行: 59820000行, 24.03 GB (39.76百万行/s., 15.97 GB/s.)
ピークメモリ使用量: 178.58 MiB.

SETTINGS max_threads = 32

5行がセットにあります。経過時間: 0.779秒. 処理された行: 59820000行, 24.03 GB (76.81百万行/s., 30.86 GB/s.)
ピークメモリ使用量: 369.20 MiB.

SETTINGS max_threads = 64

5行がセットにあります。経過時間: 0.674秒. 処理された行: 59820000行, 24.03 GB (88.81百万行/s., 35.68 GB/s.)
ピークメモリ使用量: 639.99 MiB.
```

## 挿入のためのスレッドとブロックサイズの調整 {#tuning-threads-and-block-size-for-inserts}

最大の取り込みパフォーマンスを達成するには、（1）挿入ブロックサイズ、（2）利用可能なCPUコアとRAMに基づく挿入の適切なレベルを選択する必要があります。要約すると：

- 挿入ブロックサイズを[構成](#insert-block-size)する際、より大きいほど、ClickHouseが作成しなければならないパーツが少なくなり、[ディスクファイルI/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems)および[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)の必要が減少します。  
- 並列挿入スレッドの数を[構成](#insert-parallelism)する際、高ければ高いほどデータが迅速に処理されます。

これら2つのパフォーマンス要因には対立するトレードオフがあり（さらにバックグラウンドパートマージとのトレードオフがあります）。ClickHouseサーバーの利用可能なメインメモリは限られています。大きなブロックはより多くのメインメモリを使用し、並列挿入スレッドの数に制限を加えます。逆に、より多くの並列挿入スレッドは、挿入スレッドの数がメモリ内で同時に作成される挿入ブロックの数を決定するため、メインメモリをより多く必要とします。これにより、挿入ブロックのサイズに制限がかかります。さらに、挿入スレッドとバックグラウンドマージスレッド間でリソースの競合が生じる可能性があります。設定された高い挿入スレッド数（1）は、マージが必要なパーツをより多く作成し、バックグラウンドマージスレッドからCPUコアとメモリを奪います。

これらのパラメータの動作がパフォーマンスとリソースに与える影響の詳細な説明については、[このブログ投稿](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)をお読みいただくことをお勧めします。このブログ投稿で説明されているように、調整は2つのパラメータの慎重なバランスが必要です。この徹底的なテストはしばしば実用的ではないため、要約して、次のようにお勧めします：

```bash
• max_insert_threads: 利用可能なCPUコアの約半分を選択（バックグラウンドマージ用に十分な専用コアを残すため）

• peak_memory_usage_in_bytes: 意図したピークメモリ使用量を選択；孤立した取り込みの場合は、すべての利用可能なRAM（最大使用メモリ）を使用するか、半分以下を選択（他の同時タスクのために余地を残す）

次に：
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この公式を使用すると、`min_insert_block_size_rows`を0に設定（行ベースのしきい値を無効にする）し、`max_insert_threads`を選択した値に設定し、`min_insert_block_size_bytes`を上述の公式から計算された結果に設定できます。

先に述べたStack Overflowの例でこの公式を使用します。

- `max_insert_threads=4`（ノードあたり8コア）
- `peak_memory_usage_in_bytes` - 32 GiB（ノードリソースの100%）または`34359738368`バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0行がセットにあります。経過時間: 128.566秒. 処理された行: 59820000行, 24.03 GB (465.28千行/s., 186.92 MB/s.)
```

ご覧のとおり、これらの設定の調整により挿入パフォーマンスが33％以上向上しました。読者が単一ノードのパフォーマンスをさらに向上させることができるかどうかは、特に記述しません。

## リソースとノードを使ったスケーリング {#scaling-with-resources-and-nodes}

リソースとノードを使ったスケーリングは、読み取りおよび挿入クエリの両方に適用されます。

### 垂直スケーリング {#vertical-scaling}

これまでのすべての調整とクエリは、ClickHouse Cloudクラスタ内の単一ノードのみを使用しています。ユーザーは通常、複数のClickHouseノードを持つこともあります。ユーザーには、最初に垂直にスケールすることをお勧めします。コアの数に対してS3スループットが線形に改善されます。適切な設定で、2倍のリソース（64GiB、16 vCPU）を持つ大きなClickHouse Cloudノードで、先ほどの挿入および読み取りクエリを繰り返すと、両方は約2倍の速度で実行されます。

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0行がセットにあります。経過時間: 67.294秒. 処理された行: 59820000行, 24.03 GB (888.93千行/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5行がセットにあります。経過時間: 0.421秒. 処理された行: 59820000行, 24.03 GB (142.08百万行/s., 57.08 GB/s.)
```

:::note
個々のノードもネットワークやS3のGETリクエストによってボトルネックになる可能性があり、垂直方向のパフォーマンスの線形スケーリングが妨げられることがあります。
:::

### 水平スケーリング {#horizontal-scaling}

最終的には、ハードウェアの可用性やコスト効率のために水平スケーリングが必要となります。ClickHouse Cloudでは、プロダクションクラスタは少なくとも3つのノードを持っています。ユーザーは挿入にすべてのノードを利用することを希望する場合もあります。

S3の読み込みにクラスタを利用するには、[Utilizing Clusters](/integrations/s3#utilizing-clusters)で説明されているように`s3Cluster`関数を使用する必要があります。これにより、ノード間で読み取りを分散できます。

挿入クエリを最初に受信したサーバーは、最初にグロブパターンを解決し、次に一致した各ファイルの処理を動的に自分自身および他のサーバーにディスパッチします。

![s3Cluster](./images/s3Cluster.png)

3つのノードに負荷を分散して以前の読み取りクエリを繰り返し、`s3Cluster`を使用するようにクエリを調整します。これは、ClickHouse Cloudで自動的に行われ、`default`クラスタを参照することによって行われます。

[Utilizing Clusters](/integrations/s3#utilizing-clusters)で述べたように、この作業はファイルレベルで分散されます。この機能を利用するには、ユーザーには十分な数のファイル、つまりノード数を超える必要があります。

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

5行がセットにあります。経過時間: 0.622秒. 処理された行: 59820000行, 24.03 GB (96.13百万行/s., 38.62 GB/s.)
ピークメモリ使用量: 176.74 MiB.
```

同様に、以前に特定した改善設定を使用して、挿入クエリを分散させることもできます。単一ノードに関して：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0行がセットにあります。経過時間: 171.202秒. 処理された行: 59820000行, 24.03 GB (349.41千行/s., 140.37 MB/s.)
```

読み取りファイルの改善により、クエリパフォーマンスが向上したことがわかりますが、挿入パフォーマンスは向上していません。デフォルトでは、`s3Cluster`を使用して読み取りが分散されますが、挿入は開始ノードに対して行われます。つまり、読み取りは各ノードで行われる一方で、結果の行は分配のために開始ノードにルーティングされることになります。高スループットシナリオでは、これがボトルネックとなる可能性があります。これに対処するために、`s3cluster`関数のパラメータ`parallel_distributed_insert_select`を設定します。

これを`parallel_distributed_insert_select=2`に設定することで、`SELECT`および`INSERT`が各ノードの分散エンジンの基になるテーブルに対して各シャードで実行されることを確認できます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0行がセットにあります。経過時間: 54.571秒. 処理された行: 59820000行, 24.03 GB (1.10百万行/s., 440.38 MB/s.)
ピークメモリ使用量: 11.75 GiB.
```

予想通り、これによって挿入パフォーマンスが3倍に減少します。

## さらなる調整 {#further-tuning}

### デデュプリケーションを無効化 {#disable-de-duplication}

挿入操作は、タイムアウトなどのエラーが発生する場合、失敗することがあります。挿入が失敗すると、データが正常に挿入されたかどうかは不明です。クライアントによる安全な再試行を可能にするために、ClickHouse Cloudのような分散デプロイメントでは、デフォルトでClickHouseはデータが正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされると、ClickHouseはそれを宛先テーブルに挿入しません。しかし、ユーザーはデータが通常のように挿入されたかのように、成功した操作ステータスを受け取ります。

クライアントまたはバッチからデータをロードする場合、この挙動は挿入オーバーヘッドが発生しますが、オブジェクトストレージからの`INSERT INTO SELECT`を実行する場合には不要である可能性があります。挿入時にこの機能を無効にすることで、次のようにパフォーマンスを向上させることができます：

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0行がセットにあります。経過時間: 52.992秒. 処理された行: 59820000行, 24.03 GB (1.13百万行/s., 453.50 MB/s.)
ピークメモリ使用量: 26.57 GiB.
```

### 挿入時の最適化 {#optimize-on-insert}

ClickHouseでは、`optimize_on_insert`設定が挿入プロセス中にデータパーツがマージされるかどうかを制御します。有効（デフォルトは`optimize_on_insert = 1`）にすると、小さなパーツが挿入されるときに大きなパーツにマージされ、読み取りのために読む必要のあるパーツの数を減少させることによってクエリパフォーマンスを向上させます。ただし、このマージ処理は挿入プロセスにオーバーヘッドを追加し、高スループットの挿入を遅くする可能性があります。

この設定を無効化（`optimize_on_insert = 0`）すると、挿入中のマージがスキップされ、特に頻繁な小さな挿入を処理する際にデータがより迅速に書き込まれるようになります。マージ処理はバックグラウンドに委ねられ、挿入パフォーマンスを向上させますが、小さなパーツの数は一時的に増加し、バックグラウンドマージが完了するまでクエリが遅くなる可能性があります。この設定は、挿入パフォーマンスが優先され、バックグラウンドマージプロセスがその後の最適化を効率的に処理できる場合に最適です。次のように、設定を無効化すると挿入スループットが向上することが見込まれます：
```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 行がセットに含まれています。経過時間: 49.688 秒。59.82 百万行、24.03 GB を処理しました (1.20 百万行/秒、483.66 MB/秒)。
```

## 雑記 {#misc-notes}

* メモリが少ないシナリオでは、S3への挿入時に `max_insert_delayed_streams_for_parallel_write` を低く設定することを検討してください。
