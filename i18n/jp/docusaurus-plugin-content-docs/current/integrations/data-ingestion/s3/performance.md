---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: パフォーマンスの最適化
title: S3の挿入および読み取りパフォーマンスの最適化
description: S3の読み取りおよび挿入のパフォーマンスを最適化する
---

import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

このセクションでは、[S3 テーブル関数](/sql-reference/table-functions/s3) を使用して S3 からデータを読み取りおよび挿入する際のパフォーマンス最適化に焦点を当てています。

:::info
**このガイドで説明されているレッスンは、[GCS](/sql-reference/table-functions/gcs) や [Azure Blob ストレージ](/sql-reference/table-functions/azureBlobStorage) のように独自の専用テーブル関数を持つ他のオブジェクトストレージ実装にも適用できます。**
:::

スレッドやブロックサイズを調整して挿入パフォーマンスを改善する前に、ユーザーは S3 挿入のメカニクスを理解することをお勧めします。挿入のメカニクスに精通している場合や、すぐに役立つヒントが欲しい場合は、[以下の例](/integrations/s3/performance#example-dataset)にスキップしてください。
## 挿入メカニクス（単一ノード） {#insert-mechanics-single-node}

ハードウェアサイズに加えて、ClickHouse のデータ挿入メカニクス（単一ノード）のパフォーマンスとリソース使用量に影響を与える二つの主要な要素は次の通りです： **挿入ブロックサイズ** および **挿入の並列性**。
### 挿入ブロックサイズ {#insert-block-size}

<img src={InsertMechanics} alt="ClickHouseにおける挿入ブロックサイズのメカニクス" />

`INSERT INTO SELECT` を実行する際、ClickHouse は一部のデータを受信し、① 受信したデータから（少なくとも）1つのインメモリ挿入ブロック（[パーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key)ごとに1つ）を形成します。ブロックのデータはソートされ、テーブルエンジン固有の最適化が適用されます。その後、データは圧縮され、② 新しいデータパートという形でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouse サーバーの[ディスクファイル I/O 使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)およびメモリ使用量に影響します。大きな挿入ブロックはより多くのメモリを使用しますが、大きくて少ない初期パーツを生成します。ClickHouseが大量のデータをロードするために作成する必要があるパーツが少ないほど、ディスクファイル I/O と自動[バックグラウンドマージが必要](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)になることが少なくなります。

`INSERT INTO SELECT` クエリを統合テーブルエンジンまたはテーブル関数と組み合わせて使用する場合、データは ClickHouse サーバーによって引き出されます：

<img src={Pull} alt="ClickHouseにおける外部ソースからのデータの引き出し" />

データが完全にロードされるまで、サーバーはループを実行します：

```bash
① 次のデータ部分を引き出して解析し、インメモリデータブロック（パーティションキーごとに1つ）を形成します。

② ブロックをストレージに新しいパートとして書き込みます。

Go to ① 
```

① において、サイズは挿入ブロックサイズに依存し、次の二つの設定で制御できます：

- [`min_insert_block_size_rows`](/operations/settings/settings#min-insert-block-size-rows)（デフォルト: `1048545` 行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min-insert-block-size-bytes)（デフォルト: `256 MiB`）

挿入ブロック内に指定された行数が収集されるか、設定したデータ量に達する（どちらか早く起こる方）と、新しいパートに書き込まれるトリガーが発生します。挿入ループはステップ①を続行します。

`min_insert_block_size_bytes` の値は、圧縮されていないインメモリブロックサイズを示す（圧縮されたディスク上のパートサイズではありません）。また、作成されたブロックとパーツは、ClickHouseがデータを行-[ブロック](/operations/settings/settings#setting-max_block_size)単位でストリーミングし、[処理](https://clickhouse.com/company/events/query-performance-introspection)するため、設定された行数やバイト数を正確に含むことは稀です。したがって、これらの設定は最小の閾値を指定します。
#### マージに注意 {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量のデータロードのために作成される初期パーツが多くなり、データ取り込みと並行してバックグラウンドパートマージが同時に実行されます。これにより、リソースの競合（CPU とメモリ）が発生し、取り込みが終了した後、[健全な](operations/settings/merge-tree-settings#parts-to-throw-insert)（3000）のパーツ数に達するまでに追加の時間がかかる可能性があります。

:::important
パーツ数が[推奨限度](/operations/settings/merge-tree-settings#parts-to-throw-insert)を超えると、ClickHouse のクエリパフォーマンスが悪影響を受けます。
:::

ClickHouse は、[大きなパーツへマージ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を継続的に行い、圧縮されたサイズが約 150 GiB に達するまで行います。この図は、ClickHouse サーバーがパーツをマージする様子を示しています：

<img src={Merges} alt="ClickHouseにおけるバックグラウンドマージ" />

単一の ClickHouse サーバーは、複数の[バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size)を利用して、同時に[パートマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)を実行します。各スレッドはループを実行します：

```bash
① 次にマージするパーツを決定し、これらのパーツをメモリにブロックとしてロードします。

② ロードしたブロックをメモリでマージし、より大きなブロックにします。

③ マージしたブロックを新しいパートとしてディスクに書き込みます。

Go to ①
```

[増加させること](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size)により、CPU コアと RAM のサイズを増やすことで、バックグラウンドマージのスループットが向上します。

大きなパーツにマージされたパーツは[非アクティブ](/operations/system-tables/parts)としてマークされ、最終的に[構成可能](/operations/settings/merge-tree-settings#old-parts-lifetime)な時間（分）後に削除されます。時間が経つにつれて、これはマージされたパーツのツリーを生成します（このため[`MergeTree`](/engines/table-engines/mergetree-family)テーブルと呼ばれます）。
### 挿入の並列性 {#insert-parallelism}

<img src={ResourceUsage} alt="挿入の並列性におけるリソース使用量" />

ClickHouse サーバーはデータを並列に処理および挿入することができます。挿入の並列性のレベルは、ClickHouse サーバーの取り込みスループットとメモリ使用量に影響を与えます。データを並列にロードおよび処理することは、メインメモリを多く必要としますが、データがより早く処理されるため、取り込みスループットが増加します。

s3 のようなテーブル関数では、ロードするファイル名のセットをグロブパターンで指定できます。グロブパターンが複数の既存ファイルに一致する場合、ClickHouse はこれらのファイル間および内部での読み取りを並列化し、サーバーごとに並行で挿入スレッドを利用してデータをテーブルに挿入できます：

<img src={InsertThreads} alt="ClickHouseにおける並行挿入スレッド" />

すべてのファイルのデータが処理されるまで、各挿入スレッドはループを実行します：

```bash
① 処理されていないファイルデータの次の部分を取得し（部分サイズは設定されたブロックサイズに基づく）、そこからインメモリデータブロックを作成します。

② ブロックをストレージに新しいパートとして書き込みます。

Go to ①. 
```

このような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#settings-max-insert-threads) 設定で構成できます。デフォルト値は、オープンソースの ClickHouse では `1` で、[ClickHouse Cloud](https://clickhouse.com/cloud) では `4` です。

ファイル数が多い場合、複数の挿入スレッドによる並列処理はうまく機能します。これにより、利用可能な CPU コアとネットワーク帯域幅が完全に飽和される可能性があります（並列ファイルダウンロードのため）。テーブルに少数の大きなファイルしかロードされないシナリオでは、ClickHouse は自動的に高レベルのデータ処理の並列性を確立し、大きなファイル内で異なる範囲を並行して読み取る（ダウンロードする）ために、各挿入スレッドごとに追加のリーダースレッドを生成してネットワーク帯域幅の使用を最適化します。

s3 関数とテーブルでは、個々のファイルの並列ダウンロードは、[`max_download_threads`](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) と [`max_download_buffer_size`](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) の値によって決まります。ファイルのサイズが `2 * max_download_buffer_size` より大きい場合にのみ、並列にダウンロードされます。デフォルトで、`max_download_buffer_size` のデフォルト値は 10MiB に設定されています。場合によっては、このバッファサイズを 50 MB (`max_download_buffer_size=52428800`) に安全に増やすことができ、各ファイルは単一スレッドによってダウンロードされることを保証します。これにより、各スレッドが S3 呼び出しを行う時間が短縮され、S3 待機時間も短縮されます。さらに、並列での読み取りには小さすぎるファイルに対しては、ClickHouse が非同期でデータを先読みしてスループットを向上させます。
## パフォーマンスの測定 {#measuring-performance}

S3 テーブル関数を使用したクエリのパフォーマンスを最適化することは、データが S3 にそのまま存在する状況、つまり ClickHouse の計算のみを使用し、データがその元の形式で S3 に残っているアドホッククエリを実行する場合と、S3 から ClickHouse MergeTree テーブルエンジンにデータを挿入する際の両方に要求されます。特に指定されない限り、以下の推奨事項は両方のシナリオに適用されます。
## ハードウェアサイズの影響 {#impact-of-hardware-size}

<img src={HardwareSize} alt="ClickHouseパフォーマンスに対するハードウェアサイズの影響" />

利用可能な CPU コアの数と RAM のサイズは次のことに影響します：

- サポートされる[初期パーツのサイズ](#insert-block-size)
- 可能な[挿入の並列性](#insert-parallelism)
- [バックグラウンドパートマージのスループット](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

したがって、全体的な取り込みスループットにも影響を与えます。
## リージョンのローカリティ {#region-locality}

バケットは、ClickHouse インスタンスと同じリージョンに配置されていることを確認してください。このシンプルな最適化により、特に AWS インフラストラクチャに ClickHouse インスタンスをデプロイしている場合、スループットパフォーマンスが大幅に改善される可能性があります。
## フォーマット {#formats}

ClickHouse は、`s3` 関数と `S3` エンジンを使用して、S3 バケットに保存された[サポートされる形式](/interfaces/formats.md/#data-formatting)のファイルを読み取ることができます。生のファイルを読み取る場合、これらのフォーマットのいくつかには独自の利点があります：

* Native、Parquet、CSVWithNames、および TabSeparatedWithNames のような、エンコードされたカラム名を持つフォーマットは、`s3` 関数でカラム名を指定する必要がないため、クエリは冗長性が少なくなります。カラム名によりこの情報を推測できます。
* フォーマットは、読み取りおよび書き込みスループットに関して異なります。Native および Parquet は、すでに列指向でコンパクトであるため、読み取りパフォーマンスに最適です。さらに、ネイティブフォーマットは、ClickHouse がデータをメモリに保存する方法と整合しているため、データが ClickHouse にストリーミングされる際の処理オーバーヘッドを削減します。
* ブロックサイズは、大きなファイルの読み取り遅延に影響します。これは、データをサンプリングするだけの場合、たとえば上位 N 行を返す場合に非常に顕著です。CSV や TSV のようなフォーマットの場合、行のセットを返すためにファイルをパースする必要があります。Native や Parquet のようなフォーマットでは、より早くサンプリングできるようになります。
* 各圧縮フォーマットには利点と欠点があり、速度と圧縮レベルのバランスを取ることが多く、圧縮または解凍のパフォーマンスを偏らせます。CSV や TSV などの生のファイルを圧縮する場合、lz4は最も早い解凍パフォーマンスを提供しますが、圧縮レベルは犠牲にします。Gzip は、わずかに遅い読み取り速度の代わりに、通常はより良好な圧縮を提供します。Xz は、通常は最も良好な圧縮ですが、最も遅い圧縮および解凍パフォーマンスを提供します。エクスポートを行う場合、Gzip および lz4 は比較可能な圧縮速度を提供します。これを接続速度と天秤にかけて考慮してください。圧縮または解凍が迅速であっても、S3 バケットへの接続が遅ければ、その利点は容易に打ち消されます。
* Native や Parquet のようなフォーマットは、圧縮オーバーヘッドを正当化しないことが多いです。これらのフォーマットは本質的にコンパクトであるため、データサイズの節約はごくわずかです。圧縮や解凍にかかる時間は、ネットワーク転送時間に見合うものではありません。特に、S3 はグローバルで利用可能で帯域幅が高いためです。
## 例データセット {#example-dataset}

さらなる潜在的な最適化を示すために、[Stack Overflow データセットからの投稿](/data-modeling/schema-design#stack-overflow-dataset)を使用します。このデータのクエリと挿入パフォーマンスの両方を最適化します。 

このデータセットは、2008年7月から2024年3月までの各月に1つのParquetファイルで構成されており、合計189のファイルがあります。 

パフォーマンスのために Parquet を使用することに注意してください。これは、[前述の推奨事項](#formats)に従い、バケットと同じリージョンにある ClickHouse クラスタ上で全てのクエリを実行します。このクラスタは 3 ノードで構成され、各ノードには 32GiB の RAM と 8 vCPU が搭載されています。

チューニングなしで、MergeTree テーブルエンジンにこのデータセットを挿入するパフォーマンスと、最も多くの質問をするユーザーを計算するクエリを実行するパフォーマンスを示します。これらのクエリは意図的にデータの完全なスキャンを必要とします。

```sql
-- ユーザー名上位
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

5 行のセット。経過時間: 3.013秒。処理行数: 59820000 行、24.03 GB (19.86百万行/秒、7.98 GB/秒)
ピークメモリ使用量: 603.64 MiB。

-- posts テーブルにロード
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 行のセット。経過時間: 191.692秒。処理行数: 59820000 行、24.03 GB (312.06千行/秒、125.37 MB/秒)
```

この例では、わずか数行を返しています。大量のデータがクライアントに返される `SELECT` クエリのパフォーマンスを測定する際には、クエリのために[null フォーマット](/interfaces/formats/#null)を利用するか、結果を[`Null` エンジン](/engines/table-engines/special/null.md)に直接渡すことをお勧めします。これにより、クライアントがデータに圧倒されることやネットワークの飽和を回避できます。

:::info
クエリから読み取る場合、初期クエリは同じクエリが繰り返されるよりも遅く見えることがあります。これは、S3 自体のキャッシュと、[ClickHouse スキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache)の両方に起因しています。これは、ファイルの推測されたスキーマを保存し、次回のアクセス時に推論ステップをスキップできるため、クエリ時間が短縮されます。
:::
## 読み取り用スレッドの使用 {#using-threads-for-reads}

S3 からの読み取りパフォーマンスは、コアの数に対して線形にスケールします。ただし、ネットワーク帯域幅やローカル I/O に制限されていない場合に限ります。スレッド数を増やすことはメモリオーバーヘッドのバリエーションをもたらすため、ユーザーはこれに注意する必要があります。以下を変更することで、読み取りスループットパフォーマンスを改善できる可能性があります：

* 通常、`max_threads` のデフォルト値は、すなわちコアの数で十分です。クエリに使用されるメモリ量が多く、これを減らす必要がある場合や、結果の `LIMIT` が少ない場合は、この値を低く設定できます。メモリに十分な余裕があるユーザーは、S3 からの読み取りスループットの向上のためにこの値を増加させることを試みるかもしれません。通常、これはコア数が少ないマシン（10未満）でのみ有益です。さらなる並列化から得られる利益は、他のリソースがボトルネックとして機能するため、通常は減少します。
* 22.3.1 の前のバージョンの ClickHouse は、`s3` 関数や `S3` テーブルエンジンを使用する際にのみ、複数ファイル間での読み取りを並列化しました。これは、ユーザーが S3 上でファイルをチャンクに分割し、最適な読み取りパフォーマンスを得るためにグロブパターンを使用して読み取る必要があることを意味しました。後のバージョンでは、ファイル内でのダウンロードも並列化されています。
* スレッド数が少ないシナリオでは、ユーザーは `remote_filesystem_read_method` を "read" に設定すると、S3 からファイルを同期的に読み取ることができるかもしれません。
* s3 関数とテーブルの場合、個々のファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads) と [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) の値によって決まります。[`max_download_threads`](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) は使用するスレッドの数を制御しますが、ファイルのサイズが `2 * max_download_buffer_size` より大きい場合にのみ並列にダウンロードされます。デフォルトで、`max_download_buffer_size` のデフォルト値は 10MiB に設定されています。場合によっては、このバッファサイズを 50 MB (`max_download_buffer_size=52428800`) に安全に増やすことができ、より小さなファイルは単一のスレッドによってダウンロードされることを保証します。これにより、各スレッドが S3 呼び出しを行う時間が短縮され、S3 待機時間も短縮されます。これに関しては[こちらのブログ記事](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)を参照してください。

パフォーマンスを改善するために変更を加える前に、適切に測定してください。S3 API 呼び出しはレイテンシに敏感であり、クライアントのタイミングに影響を与える可能性があるため、クエリログを使用してパフォーマンスメトリクスを取得します。すなわち `system.query_log`。

以前のクエリを考えると、`max_threads` を `16` に倍増すると（デフォルトの `max_thread` はノードのコアの数）、読み取りクエリのパフォーマンスが 2 倍向上し、メモリ使用量が増加します。さらに `max_threads` を増加させることは、次のように効果が薄れます。

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

5 行のセット。経過時間: 1.505 秒。処理行数: 59820000 行、24.03 GB (39.76百万行/秒、15.97 GB/秒)
ピークメモリ使用量: 178.58 MiB。

SETTINGS max_threads = 32

5 行のセット。経過時間: 0.779 秒。処理行数: 59820000 行、24.03 GB (76.81百万行/秒、30.86 GB/秒)
ピークメモリ使用量: 369.20 MiB。

SETTINGS max_threads = 64

5 行のセット。経過時間: 0.674 秒。処理行数: 59820000 行、24.03 GB (88.81百万行/秒、35.68 GB/秒)
ピークメモリ使用量: 639.99 MiB。
```
## 挿入用のスレッドとブロックサイズの調整 {#tuning-threads-and-block-size-for-inserts}

最大取り込みパフォーマンスを達成するには、(1) 挿入ブロックサイズ、(2) 利用可能な CPU コア数および RAM に基づいて適切な挿入並列性のレベル、そして (3) を選択する必要があります。要約すると：

- 挿入ブロックサイズを[大きく設定する](#insert-block-size)ほど、ClickHouse が作成する必要があるパーツが少なくなり、[ディスクファイル I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems)および[バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)が少なくなります。  
- 挿入スレッドの[数](#insert-parallelism)を高く設定するほど、データがより速く処理されます。

これら二つのパフォーマンス要因には相反するトレードオフがあります（さらにバックグラウンドパートマージとのトレードオフもあります）。ClickHouse サーバーのメインメモリの量は制限されています。大きなブロックはより多くのメインメモリを使用し、利用できる並列挿入スレッドの数を制限します。逆に、より多くの並列挿入スレッドを設定すると、メモリの使用量が増加します。これは、挿入スレッドの数がインメモリで同時に作成される挿入ブロックの数を決定するためです。これにより、挿入ブロックのサイズの可能性が制限されます。また、挿入スレッドとバックグラウンドマージスレッドの間でリソース競合が発生する可能性があります。設定された挿入スレッド数が高い（1）の場合、より多くのパーツが作成され、マージする必要があり、さらにバックグラウンドマージスレッドから CPU コアとメモリスペースが奪われます。

これらのパラメータがパフォーマンスとリソースに与える影響についての詳細な説明については、[こちらのブログ記事を読むこと](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)をお勧めします。このブログ記事では、チューニングがこれらの二つのパラメータのバランスを注意深く取ることを含むことが述べられています。この詳細なテストはしばしば非現実的ですので、要約すると、以下の推奨を行います：

```bash
• max_insert_threads: 利用可能な CPU コアの約半分を挿入スレッドとして選択（バックグラウンドマージ用に十分な専用コアを残す）

• peak_memory_usage_in_bytes: 意図したピークメモリ使用量を選択；隔离されたインジェストであれば全ての利用可能なRAMを許可するか、あるいは半分以下を許可する（他の並行タスク用の余裕を残すために）

次に：
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この式を使用して `min_insert_block_size_rows` を 0（行ベースの閾値を無効化）に設定し、`max_insert_threads` を選択した値に設定し、`min_insert_block_size_bytes` を上記の計算結果に設定します。

これを、先ほどの Stack Overflow の例で使用してみましょう。

- `max_insert_threads=4`（ノードあたり 8 コア）
- `peak_memory_usage_in_bytes` - 32 GiB（ノードリソースの100%）または `34359738368` バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 行のセット。経過時間: 128.566 秒。処理行数: 59820000 行、24.03 GB (465.28千行/秒、186.92 MB/秒)
```

設定の調整により、挿入パフォーマンスが `33%` 以上向上したことが示されています。読者が単一ノードのパフォーマンスをさらに向上させることができるか見てみることにします。
## リソースとノードでのスケーリング {#scaling-with-resources-and-nodes}

リソースとノードでのスケーリングは、読み取りおよび挿入クエリの両方に適用されます。
### 垂直スケーリング {#vertical-scaling}

これまでの調整とクエリは、すべてクリックハウスクラウドの単一ノードを使用しています。ユーザーは、複数の ClickHouse ノードを利用できることもよくあります。ユーザーは、リソースの数に応じて S3 のスループットを線形に改善するために最初に垂直スケーリングを行うことをお勧めします。もし以前の挿入および読み取りクエリを、より大きな ClickHouse Cloud ノード（64GiB、16vCPUs）で実行して適切な設定を行うと、両方とも約2倍の速度で実行されます。

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 行のセット。経過時間: 67.294 秒。処理行数: 59820000 行、24.03 GB (888.93千行/秒、357.12 MB/秒)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 行のセット。経過時間: 0.421 秒。処理行数: 59820000 行、24.03 GB (142.08百万行/秒、57.08 GB/秒)
```

:::note
個々のノードは、ネットワークや S3 の GET リクエストによってボトルネックになることがあり、垂直スケーリングのパフォーマンスを線形にすることを妨げる場合があります。
:::
### 水平スケーリング {#horizontal-scaling}

最終的には、ハードウェアの可用性とコスト効率により、水平スケーリングが必要になります。ClickHouse Cloud の本番クラスタは、少なくとも 3 ノードを持っています。したがって、ユーザーは挿入のためにすべてのノードを利用したい場合があります。

S3 読み取りのためのクラスタの利用は、[クラスタの利用](/integrations/s3#utilizing-clusters)で説明されているように `s3Cluster` 関数を使用する必要があります。これにより、ノード間での読み取りが分散されます。

最初に挿入クエリを受け取ったサーバーは、最初にグロブパターンを解決し、その後、一致する各ファイルの処理を自分自身と他のサーバーに動的に分散させます。

<img src={S3Cluster} alt="ClickHouseにおけるs3Cluster関数" />

これまでの読み取りクエリを 3 ノードに分配して実行できます。クエリを `s3Cluster` を使用するように調整します。これは、ClickHouse Cloud では `default` クラスタに参照することで自動的に実行されます。

[クラスタの利用](/integrations/s3#utilizing-clusters)で述べたように、この作業はファイルレベルで分散されます。この機能の恩恵を受けるには、ファイル数を十分に確保する必要があります。すなわち、ノード数よりも大きい必要があります。

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

5 行のセット。経過時間: 0.622 秒。処理行数: 59820000 行、24.03 GB (96.13百万行/秒、38.62 GB/秒)
ピークメモリ使用量: 176.74 MiB。
```

同様に、以前の挿入クエリも分散できます。単一ノードのために以前に特定された改善された設定を使用します。

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 行のセット。経過時間: 171.202 秒。処理行数: 59820000 行、24.03 GB (349.41千行/秒、140.37 MB/秒)
```

読者は、ファイルの読み取りはクエリパフォーマンスを改善するが、挿入パフォーマンスには改善しないことに気付くかもしれません。デフォルトでは、`s3Cluster`を使用すると読み取りが分散されますが、挿入はイニシエータノードに対して行われます。これは読み取りが各ノードで行われますが、結果の行はイニシエータにルーティングされることを意味します。高スループットのシナリオでは、これはボトルネックになる可能性があります。これに対処するために、`s3cluster` 関数の `parallel_distributed_insert_select` パラメータを設定します。

`parallel_distributed_insert_select=2` に設定すると、`SELECT` と `INSERT` が各ノードの分散エンジンの基底テーブル上の各シャードで実行されます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 行のセット。経過時間: 54.571 秒。処理行数: 59820000 行、24.03 GB (1.10百万行/秒、440.38 MB/秒)
ピークメモリ使用量: 11.75 GiB。
```

予想通り、挿入性能が 3 倍低下します。
## さらなる調整 {#further-tuning}
### 重複排除の無効化 {#disable-de-duplication}

挿入操作は、タイムアウトなどのエラーにより失敗することがあります。挿入に失敗した場合、データが正常に挿入されているかどうかは不明です。クライアントによる再試行を安全に行えるようにするために、デフォルトでは、ClickHouse Cloud のような分散展開では、ClickHouse はデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされると、ClickHouse はそれを宛先テーブルに挿入しません。ただし、ユーザーは、データが通常通りに挿入されたかのように、成功した操作ステータスを受け取ります。

この動作は、クライアントやバッチからデータをロードする際には費用がかかりますが、オブジェクトストレージからの `INSERT INTO SELECT` を実行する場合には不必要です。この機能を挿入時に無効化することで、次のようにパフォーマンスを向上させることができます。

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 行のセット。経過時間: 52.992 秒。処理行数: 59820000 行、24.03 GB (1.13百万行/秒、453.50 MB/秒)
ピークメモリ使用量: 26.57 GiB。
```
### Optimize on insert {#optimize-on-insert}

ClickHouseでは、`optimize_on_insert`設定が、挿入プロセス中にデータパーツがマージされるかどうかを制御します。有効にすると（デフォルトは`optimize_on_insert = 1`）、小さいパーツが挿入される際に大きなパーツにマージされ、読み取る必要のあるパーツの数が減るため、クエリパフォーマンスが向上します。しかし、このマージは挿入プロセスにオーバーヘッドを追加し、高スループットの挿入を遅くする可能性があります。

この設定を無効にすると（`optimize_on_insert = 0`）、挿入中のマージがスキップされ、データがより迅速に書き込まれるようになります。特に頻繁に小さい挿入を扱う場合に効果的です。マージプロセスはバックグラウンドに委譲されるため、挿入パフォーマンスが向上しますが、一時的に小さいパーツの数が増加し、バックグラウンドマージが完了するまでクエリが遅くなる可能性があります。この設定は、挿入パフォーマンスが優先される場合に理想的であり、バックグラウンドマージプロセスが後で最適化を効率的に処理できます。以下に示すように、この設定を無効にすると挿入スループットが向上することがあります：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 行がセットにあります。経過時間: 49.688 秒。59.82 百万行、24.03 GBを処理しました（1.20 百万行/秒、483.66 MB/秒）。
```
## Misc notes {#misc-notes}

* メモリが少ないシナリオでは、S3に挿入する場合は`max_insert_delayed_streams_for_parallel_write`を下げることを検討してください。
