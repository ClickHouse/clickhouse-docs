---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: 'パフォーマンスの最適化'
title: 'S3の挿入および読み取りパフォーマンスの最適化'
description: 'S3の読み取りおよび挿入のパフォーマンスを最適化する'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

このセクションでは、[s3 テーブル関数](/sql-reference/table-functions/s3) を使用して S3 からデータを読み込み、挿入する際のパフォーマンス最適化に焦点を当てています。

:::info
**このガイドで説明されているレッスンは、[GCS](/sql-reference/table-functions/gcs) や [Azure Blob ストレージ](/sql-reference/table-functions/azureBlobStorage) など、独自の専用テーブル関数を持つ他のオブジェクトストレージの実装にも適用できます。**
:::

スレッドやブロックサイズを調整して挿入パフォーマンスを向上させる前に、ユーザーは S3 挿入のメカニズムを理解することをお勧めします。挿入メカニズムに精通している場合や、簡単なヒントが必要な場合は、[以下の例](/integrations/s3/performance#example-dataset)にスキップしてください。
## 挿入メカニズム (単一ノード) {#insert-mechanics-single-node}

ハードウェアサイズに加えて、ClickHouse のデータ挿入メカニズム (単一ノードの場合) のパフォーマンスとリソース使用量に影響を与える二つの主な要因は、**挿入ブロックサイズ** と **挿入の並列性** です。
### 挿入ブロックサイズ {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouseにおける挿入ブロックサイズのメカニズム" />

`INSERT INTO SELECT` を実行すると、ClickHouse はデータ部分を受信して、① 受信したデータから (少なくとも) 1 つのインメモリ挿入ブロックを形成します (各 [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key) ごとに)。ブロックのデータはソートされ、テーブルエンジン特有の最適化が適用されます。その後、データは圧縮され、② 新しいデータパーツの形でデータベースストレージに書き込まれます。

挿入ブロックサイズは、ClickHouse サーバーの [ディスクファイル I/O 使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems) とメモリ使用量の両方に影響を及ぼします。大きな挿入ブロックはより多くのメモリを使用しますが、大きくて少ない初期パーツを生成します。ClickHouse が大量のデータを読み込むために作成する必要のあるパーツが少ないほど、ディスクファイル I/O と自動 [バックグラウンドマージが必要](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) ではなくなります。

インテグレーションテーブルエンジンまたはテーブル関数と組み合わせて `INSERT INTO SELECT` クエリを使用する場合、データは ClickHouse サーバーによってプルされます。

<Image img={Pull} size="lg" border alt="ClickHouseにおける外部ソースからのデータのプル" />

データが完全に読み込まれるまで、サーバーはループを実行します:

```bash
① 次のデータ部分をプルして解析し、それからインメモリデータブロック (パーティショニングキーごとに 1 つ) を形成します。

② ブロックをストレージの新しいパーツに書き込みます。

1 に戻る
```

① では、サイズは挿入ブロックサイズに依存し、2 つの設定で制御できます:

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (デフォルト: `1048545` 行)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (デフォルト: `256 MiB`)

指定された行数が挿入ブロックに収集されるか、構成されたデータ量が達成されると (どちらか早く発生した方)、これによりブロックが新しいパーツに書き込まれるトリガーとなります。挿入ループはステップ ① で続行されます。

`min_insert_block_size_bytes` の値は、圧縮されていないインメモリブロックサイズを示していることに注意してください (圧縮済みのディスク上のパーツサイズではありません)。また、作成されたブロックやパーツは、ClickHouse がデータを行-[ブロック](/operations/settings/settings#max_block_size)単位でストリーミングおよび [処理](https://clickhouse.com/company/events/query-performance-introspection)するため、設定した行数やバイト数を正確に含むことはほとんどありません。したがって、これらの設定は最小閾値を指定します。
#### マージに注意 {#be-aware-of-merges}

設定された挿入ブロックサイズが小さいほど、大量データの読み込みのために作成される初期パーツが増え、データの取り込みと同時にバックグラウンドのパートマージがより多く実行されます。これによりリソースの競合 (CPU およびメモリ) が発生し、取り込みが終了した後に（[健康的](https://operations/settings/merge-tree-settings#parts_to_throw_insert)なパーツ数 (3000) に到達するために）追加時間が必要になる場合があります。

:::important
パーツ数が [推奨制限](/operations/settings/merge-tree-settings#parts_to_throw_insert) を超えると、ClickHouse のクエリパフォーマンスに悪影響を与えます。
:::

ClickHouse は、圧縮サイズが ~150 GiB に達するまで、[パーツをマージし続けます](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)。この図は、ClickHouse サーバーがパーツをマージする方法を示しています。

<Image img={Merges} size="lg" border alt="ClickHouseにおけるバックグラウンドマージ" />

単一の ClickHouse サーバーは、複数の [バックグラウンドマージスレッド](/operations/server-configuration-parameters/settings#background_pool_size) を利用して並行して [パートをマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) します。各スレッドはループを実行します:

```bash
① 次にマージするパーツを決定し、これらのパーツをブロックとしてメモリに読み込みます。

② 読み込んだブロックをメモリ内でマージして大きなブロックにします。

③ マージしたブロックをディスクの新しいパーツに書き込みます。

1 に戻る
```

[増加させる](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size)ことで、CPU コアの数と RAM のサイズがバックグラウンドマージのスループットを向上させます。

大きなパーツにマージされたパーツは [非アクティブ](/operations/system-tables/parts) としてマークされ、最終的には [構成可能な](/operations/settings/merge-tree-settings#old_parts_lifetime)分数分後に削除されます。時間が経つにつれて、これによりマージされたパーツのツリーが作成されます (これが [`MergeTree`](/engines/table-engines/mergetree-family) テーブルの名前の由来です)。
### 挿入の並列性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="挿入の並列性におけるリソース使用量" />

ClickHouse サーバーはデータを並列に処理および挿入できます。挿入の並列性のレベルは、ClickHouse サーバーの取り込みスループットおよびメモリ使用量に影響を与えます。データを並列に読み込んで処理するには、メインメモリがより多く必要ですが、データをより早く処理するため、取り込みスループットが向上します。

s3 などのテーブル関数では、グロブパターンを介して読み込むファイル名のセットを指定できます。グロブパターンが複数の既存ファイルにマッチする場合、ClickHouse はこれらのファイル内およびファイル間で読み取りを並列化し、サーバーごとに並行して挿入スレッドを利用してテーブルにデータを挿入できます。

<Image img={InsertThreads} size="lg" border alt="ClickHouseにおける並列挿入スレッド" />

すべてのファイルのデータが処理されるまで、各挿入スレッドはループを実行します:

```bash
① 未処理のファイルデータの次の部分を取得し (部分サイズは設定されたブロックサイズに基づく)、それからインメモリデータブロックを作成します。

② ブロックを新しいパーツにストレージに書き込みます。

1 に戻る。
```

そのような並列挿入スレッドの数は、[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 設定で構成できます。オープンソースの ClickHouse のデフォルト値は `1` で、[ClickHouse Cloud](https://clickhouse.com/cloud) の場合は 4 です。

多数のファイルがある場合、複数の挿入スレッドによる並列処理はうまく機能します。これは、利用可能な CPU コアとネットワーク帯域幅 (並行ファイルダウンロード用) を完全に飽和させることができます。一部の大きなファイルのみをテーブルに読み込む場合、ClickHouse は自動的にデータ処理の並列性を高め、大きなファイル内のより異なる範囲を並行して読み取るために、各挿入スレッドごとに追加のリーダースレッドを起動することでネットワーク帯域幅の使用を最適化します。

s3 関数とテーブルのために、個々のファイルの並列ダウンロードは [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) と [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) の値によって決定されます。ファイルサイズが `2 * max_download_buffer_size` より大きい場合のみ、ファイルは並列にダウンロードされます。デフォルトでは、`max_download_buffer_size` のデフォルトは 10MiB に設定されています。場合によっては、各ファイルが単一のスレッドによってダウンロードされることを保証するために、このバッファサイズを 50 MB (`max_download_buffer_size=52428800`) に安全に増やすことができます。これにより、各スレッドが S3 コールを行うために費やす時間を減らし、S3 の待機時間を短縮できます。さらに、パラレルリーディングにはサイズが小さすぎるファイルがある場合、スループットを向上させるために、ClickHouse は非同期でそのようなファイルを事前読み込みしてデータをプフェッチします。
## パフォーマンスの測定 {#measuring-performance}

S3 テーブル関数を使用したクエリパフォーマンスの最適化は、データが元の形式のまま S3 に残っている ad-hoc クエリを実行する場合と S3 から ClickHouse MergeTree テーブルエンジンにデータを挿入する場合の両方で必要です。特に指定されない限り、以下の推奨事項は両方のシナリオに適用されます。
## ハードウェアサイズの影響 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="ClickHouseのパフォーマンスにおけるハードウェアサイズの影響" />

利用可能な CPU コアの数と RAM のサイズは次のことに影響します:

- サポートされている [パーツの初期サイズ](#insert-block-size)
- 可能な [挿入の並列性のレベル](#insert-parallelism)
- [バックグラウンドパートマージのスループット](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

したがって、全体的な取り込みスループットに影響を与えます。
## 地域のローカリティ {#region-locality}

バケットは ClickHouse インスタンスと同じ地域に配置されていることを確認してください。このシンプルな最適化は、特に ClickHouse インスタンスを AWS インフラ上に展開する場合、スループットパフォーマンスを劇的に改善できます。
## フォーマット {#formats}

ClickHouse は、`s3` 機能および `S3` エンジンを使用して、S3 バケットに格納されたファイルを [サポートされているフォーマット](/interfaces/formats#formats-overview) で読み取ることができます。生のファイルを読み取る場合、これらのフォーマットのいくつかには明確な利点があります:

* Native、Parquet、CSVWithNames、TabSeparatedWithNames のようにエンコードされたカラム名を持つフォーマットは、`s3` 関数でカラム名を指定する必要がないため、クエリがあまり冗長になりません。カラム名は、この情報を推測することを可能にします。
* フォーマットによって読み取りおよび書き込みのスループット性能が異なります。Native と parquet は、すでに列指向であり、よりコンパクトであるため、読み取り性能の最も最適なフォーマットを表します。さらに、ネイティブフォーマットは、ClickHouse がメモリ内にデータを格納する方法に整合しているため、データが ClickHouse にストリーミングされる際の処理オーバーヘッドを削減します。
* ブロックサイズは、大きなファイルの読み取りの待機時間に影響を与えます。これは、データのサンプリング（例: 上位 N 行の返却）のみを行う場合に特に明らかです。CSV や TSV のようなフォーマットの場合、行のセットを返すためにファイルを解析する必要があります。Native および Parquet のようなフォーマットでは、結果としてより早いサンプリングが可能です。
* 各圧縮フォーマットには利点と欠点があり、圧縮レベルと速度をバランスさせ、圧縮または解凍性能を偏らせます。CSV や TSV などの生ファイルを圧縮する場合、lz4 は最も早い解凍性能を提供しますが、圧縮レベルを犠牲にします。Gzip は、読み取り速度がわずかに遅くなる代わりに、通常はより良好に圧縮されます。XZは、通常は最も優れた圧縮を提供するものの、最も遅い圧縮および解凍性能を持っています。エクスポートする場合、Gz と lz4 は比較可能な圧縮速度を提供します。これは、接続速度とバランスをとることができます。より早い解凍または圧縮の利点は、S3 バケットへの遅い接続によって簡単に相殺されます。
* Native や Parquet のようなフォーマットは、通常、圧縮のオーバーヘッドを正当化しません。これらのフォーマットは本質的にコンパクトであるため、データサイズの削減はごくわずかです。圧縮および解凍に費やす時間は、特に S3 がグローバルに利用可能でネットワーク帯域幅が高いため、ネットワーク転送時間を相殺することはほとんどありません。
## 例データセット {#example-dataset}

さらなる潜在的な最適化を示すため、[Stack Overflow データセットの投稿](/data-modeling/schema-design#stack-overflow-dataset)を使用して、このデータのクエリおよび挿入パフォーマンスを最適化します。

このデータセットは、2008 年 7 月から 2024 年 3 月までの各月ごとに 1 つの Parquet ファイルから構成され、189 のファイルがあります。

パフォーマンスを考慮して、[前述の推奨事項](#formats) に従って Parquet を使用し、このクラスタはバケットと同じリージョンに配置された ClickHouse クラスタ上でクエリを実行します。このクラスタには 3 つのノードがあり、それぞれ 32GiB の RAM と 8 vCPUs を持っています。

調整を行わず、このデータセットを MergeTree テーブルエンジンに挿入するパフォーマンスを示し、最も多くの質問をするユーザーを計算するためのクエリを実行します。これらのクエリは意図的にデータの完全なスキャンを必要とします。

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

5 行を返しました。経過時間: 3.013 秒。59.82百万行、24.03 GBを処理済み (19.86百万行/秒、7.98 GB/秒)。
ピークメモリ使用量: 603.64 MiB。

-- 投稿テーブルにデータをロード
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 行を返しました。経過時間: 191.692 秒。59.82百万行、24.03 GBを処理済み (312.06千行/秒、125.37 MB/秒)
```

私たちの例では、ごく少ない行を返します。大量のデータがクライアントに返される場合に `SELECT` クエリのパフォーマンスを測定するには、クエリに対して [null format](/interfaces/formats/#null) を利用するか、結果を [`Null` engine](/engines/table-engines/special/null.md) に向けてダイレクトに設定します。これにより、クライアントがデータで圧倒されることやネットワークが飽和状態になるのを避けることができます。

:::info
クエリを読み取る場合、初期クエリは同じクエリが繰り返される場合よりも遅く表示されることがあります。これは、S3 のキャッシングや、[ClickHouse スキーマ推論キャッシュ](/operations/system-tables/schema_inference_cache) が影響しているためです。これは、ファイルの推定スキーマを保存し、次回のアクセス時に推論ステップをスキップできるため、クエリ時間を短縮することができます。
:::
## 読み取り用にスレッドを使用する {#using-threads-for-reads}

S3 の読み取りパフォーマンスは、ネットワーク帯域幅やローカル I/O に制限されていない限り、コアの数に合わせて線形にスケールします。スレッドの数を増やすと、ユーザーが認識するべきメモリオーバーヘッドの変化もあります。読み取りスループット性能を改善するために次のことを変更できます。

* 通常、`max_threads` のデフォルト値はコアの数、つまり十分です。クエリに使用されるメモリ量が高く、この値を減らす必要がある場合や、結果の `LIMIT` が低い場合は、この値を低く設定できます。メモリがたくさんあるユーザーは、この値を増やして S3 からの読み取りスループットを向上させることを試してみるかもしれません。通常、これはコアの数が少ないマシン (例: &lt; 10) でのみ有益です。さらなる並列化の利点は、通常、他のリソースがボトルネックとして作用するため、緩やかに薄れることがあります。
* ClickHouse のバージョン 22.3.1 より前のものでは、`s3` 関数や `S3` テーブルエンジンを使用する際に、複数のファイルにわたってのみ読み取りを並列化しました。これにより、ユーザーはファイルが S3 でチャンクに分割され、最適な読み取り性能を実現するためにグロブパターンを使用して読み込まれることを保証する必要があります。後のバージョンでは、ファイル内でのダウンロードも並列化されています。
* スレッド数の少ないシナリオでは、ユーザーは `remote_filesystem_read_method` を "read" に設定することで、S3 からファイルを同期的に読み込む利点を得られるかもしれません。
* s3 関数およびテーブルの個々のファイルの並列ダウンロードは、[`max_download_threads`](/operations/settings/settings#max_download_threads) と [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) の値によって決定されます。[`max_download_threads`](/operations/settings/settings#max_download_threads) は、使用されるスレッド数を制御します。ファイルは、サイズが 2 * `max_download_buffer_size` より大きい場合にのみ並列にダウンロードされます。デフォルトでは、`max_download_buffer_size` のデフォルト値は 10MiB に設定されています。場合によっては、より小さなファイルが単一のスレッドによってのみダウンロードされるように、このバッファサイズを 50 MB (`max_download_buffer_size=52428800`) に安全に増やすことができます。これによって、各スレッドが S3 コールを行う時間を減らし、S3 の待機時間も降低できるかもしれません。これについては [このブログ記事](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge) を参照してください。

パフォーマンスを改善するために変更を加える前に、適切に測定されていることを確認してください。S3 API コールはレイテンシに敏感であり、クライアントのタイミングにも影響を与える可能性があるため、パフォーマンスメトリクスとしてクエリログを使用します。例: `system.query_log`。

前述のクエリを考慮し、`max_threads` を `16` に倍増させると (デフォルトの `max_thread` はノードのコアの数)、読み取りクエリ性能が 2 倍向上し、メモリが高くなる代償を払います。さらに `max_threads` を増やすと、リターンが減少します。

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

5 行を返しました。経過時間: 1.505 秒。59.82百万行、24.03 GBを処理済み (39.76百万行/秒、15.97 GB/秒)。
ピークメモリ使用量: 178.58 MiB。

SETTINGS max_threads = 32

5 行を返しました。経過時間: 0.779 秒。59.82百万行、24.03 GBを処理済み (76.81百万行/秒、30.86 GB/秒)。
ピークメモリ使用量: 369.20 MiB。

SETTINGS max_threads = 64

5 行を返しました。経過時間: 0.674 秒。59.82百万行、24.03 GBを処理済み (88.81百万行/秒、35.68 GB/秒)。
ピークメモリ使用量: 639.99 MiB。
```
## 挿入のためのスレッドとブロックサイズの調整 {#tuning-threads-and-block-size-for-inserts}

最大の取り込みパフォーマンスを実現するには、(1) 挿入ブロックサイズと (2) 使用可能な CPU コア数と RAM に基づいた適切な挿入並列性のレベルを選択する必要があります。まとめると:

- 挿入ブロックサイズを [構成](#insert-block-size) する際に大きくするほど、ClickHouse が作成する必要のあるパーツが少なくなり、必要な [ディスクファイル I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) および [バックグラウンドマージ](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) が必要なくなります。  
- [挿入スレッドの数](#insert-parallelism) を高く構成するほど、データ処理が速くなります。

これらの二つの性能要因 (およびバックグラウンドパートマージとのトレードオフ) の間には相反する関係があります。ClickHouse サーバーの利用可能なメインメモリ量は限られています。大きなブロックはより多くのメインメモリを使用し、並列挿入スレッドを利用できる数を制限します。逆に、高い数の並列挿入スレッドはより多くのメインメモリが必要であり、挿入スレッドの数がインメモリで並行して作成される挿入ブロックの数を決定します。これにより、挿入ブロックの可能なサイズが制限されることになります。さらに、挿入スレッドとバックグラウンドマージスレッドの間でリソースの競合が発生する可能性があります。設定された挿入スレッドの数が高いほど (1) マージする必要のあるパーツが増え、(2) バックグラウンドマージスレッドから CPU コアとメモリのスペースを奪います。

これらのパラメータの動作がパフォーマンスとリソースに及ぼす影響について詳しく知りたい場合は、[このブログ記事](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)を読むことをお勧めします。このブログ記事で述べられているように、調整ではこれら 2 つのパラメータの慎重なバランスが関与することがあります。これらの詳細なテストは通常実用的ではないため、要約として次の推奨事項を示します:

```bash
• max_insert_threads: 挿入スレッドに対して利用可能な CPU コアの約半数を選定する (バックグラウンドマージのために十分なコアを残すため)。

• peak_memory_usage_in_bytes: 意図したピークメモリ使用量を選定する。孤立した取り込み場合は全メモリ (100%) （または 50% またはそれ以下）を選定する (他の同時タスクのために余地を残す)。

次に:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

この公式を使用すると、`min_insert_block_size_rows` を 0 に設定して (行ベースの閾値を無効にする)、`max_insert_threads` を選択した値に設定し、`min_insert_block_size_bytes` を上記の公式から計算された結果に設定できます。

前述の Stack Overflow の例を使用してこの公式を適用します。

- `max_insert_threads=4` (ノードあたり 8 コア)
- `peak_memory_usage_in_bytes` - 32 GiB (ノードリソースの 100%) または `34359738368` バイト。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 行を返しました。経過時間: 128.566 秒。59.82百万行、24.03 GBを処理済み (465.28千行/秒、186.92 MB/秒)。
```

示されたように、これらの設定の調整により、挿入パフォーマンスが 33% 以上向上しました。単一ノードのパフォーマンスをさらに向上させられるか、読者に任せます。
## リソースとノードとのスケーリング {#scaling-with-resources-and-nodes}

リソースとノードのスケーリングは、読み取りおよび挿入クエリの両方に適用されます。
### 垂直スケーリング {#vertical-scaling}

これまでの調整とクエリは、ClickHouse Cloud クラスタの単一ノードでのみ実行されました。ユーザーは通常、利用可能な ClickHouse のノードを複数持っています。初めは垂直スケーリングをお勧めします。コアの数に合わせて S3 スループットを線形に改善できます。前述の挿入および読み取りクエリを、リソースが 2 倍 (64GiB、16 vCPUs) の大きな ClickHouse Cloud ノードで繰り返すと、両方のクエリが約 2 倍の速度で実行されます。

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 行を返しました。経過時間: 67.294 秒。59.82百万行、24.03 GBを処理済み (888.93千行/秒、357.12 MB/秒)。

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 行を返しました。経過時間: 0.421 秒。59.82百万行、24.03 GBを処理済み (142.08百万行/秒、57.08 GB/秒)。
```

:::note
個々のノードは、ネットワークや S3 GET リクエストによってボトルネック化され、垂直にパフォーマンスを線形にスケールするのを妨げる可能性があります。
:::
### 水平スケーリング {#horizontal-scaling}

最終的には、ハードウェアの可用性とコスト効率の要因から水平スケーリングが必要になります。ClickHouse Cloud のプロダクションクラスタには、少なくとも 3 つのノードがあります。そのため、ユーザーは挿入にすべてのノードを活用することを希望するかもしれません。

S3 からの読み取りにクラスタを利用するには、[クラスタの利用](/integrations/s3#utilizing-clusters)で説明されているように `s3Cluster` 関数を使用する必要があります。これにより、ノード間で読み取りが分散されます。

挿入クエリを最初に受信したサーバーは、最初にグロブパターンを解決し、動的に一致する各ファイルの処理を自分自身と他のサーバーにディスパッチします。

<Image img={S3Cluster} size="lg" border alt="ClickHouseにおけるs3Cluster関数" />

前述の読み取りクエリを繰り返し、3 つのノードにわたって負荷を分散させるように調整し、クエリを `s3Cluster` を使用するように調整します。これは、ClickHouse Cloud では `default` クラスタを参照することによって自動的に行われます。

[クラスタの利用](/integrations/s3#utilizing-clusters) で述べたように、この作業はファイルレベルで分散されます。この機能の恩恵を受けるには、ノードの数よりもファイルの数が十分である必要があります。

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

5 行を返しました。経過時間: 0.622 秒。59.82百万行、24.03 GBを処理済み (96.13百万行/秒、38.62 GB/秒)。
ピークメモリ使用量: 176.74 MiB。
```

同様に、挿入クエリでも、単一ノードに対して特定された改善された設定を使用することで分散できます:

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 行を返しました。経過時間: 171.202 秒。59.82百万行、24.03 GBを処理済み (349.41千行/秒、140.37 MB/秒)
```

読者は、ファイルの読み取りがクエリを改善したことに気づく一方で、挿入パフォーマンスは改善しなかったことに気づくでしょう。デフォルトでは、`s3Cluster` を使用して読み取りが分散される一方で、挿入はイニシエーターノードに対して行われます。つまり、読み取りは各ノードで発生しますが、結果として得られた行は、イニシエーターにルーティングされて分配されます。高スループットのシナリオでは、これがボトルネックになる可能性があります。これに対処するために、`s3cluster` 関数の `parallel_distributed_insert_select` パラメータを設定します。

これを `parallel_distributed_insert_select=2` に設定すると、`SELECT` と `INSERT` が各ノードの分散エンジンの基になるテーブルからそれぞれ実行されることが保証されます。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 行を返しました。経過時間: 54.571 秒。59.82百万行、24.03 GBを処理済み (1.10 百万行/秒、440.38 MB/秒)。
ピークメモリ使用量: 11.75 GiB。
```

予想通り、これによって挿入パフォーマンスが 3 倍削減されます。
## さらなる調整 {#further-tuning}
### 重複排除を無効にする {#disable-de-duplication}

挿入操作は時折、タイムアウトなどのエラーによって失敗することがあります。挿入に失敗すると、データが正常に挿入されたかどうかはわかりません。クライアントによって挿入を安全に再試行できるように、ClickHouse Cloud のような分散デプロイメントでは、デフォルトで ClickHouse はデータがすでに正常に挿入されたかどうかを判断しようとします。挿入されたデータが重複としてマークされている場合、ClickHouse はそれを目的のテーブルに挿入しません。しかし、ユーザーはデータが正常に挿入されたかのように操作の成功状態を受け取ります。

この動作は、クライアントまたはバッチからデータを読み込む際に挿入のオーバーヘッドを引き起こすことは理解できますが、オブジェクトストレージからの `INSERT INTO SELECT` を行う際には不要となることがあります。この機能を挿入時に無効にすることで、パフォーマンスを向上させることができます。以下に示します:

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 行を返しました。経過時間: 52.992 秒。59.82百万行、24.03 GBを処理済み (1.13 百万行/秒、453.50 MB/秒)。
ピークメモリ使用量: 26.57 GiB。
```
### インサート時の最適化 {#optimize-on-insert}

ClickHouse では、`optimize_on_insert` 設定がデータパーツがインサートプロセス中にマージされるかどうかを制御します。有効な場合（デフォルトでは `optimize_on_insert = 1`）、小さなパーツはインサートされるときに大きなパーツにマージされ、読み取る必要のあるパーツの数を減らすことでクエリパフォーマンスが向上します。ただし、このマージにはインサートプロセスへのオーバーヘッドが追加され、高スループットのインサートが遅くなる可能性があります。

この設定を無効にすると（`optimize_on_insert = 0`）、インサート中のマージがスキップされ、特に頻繁に小さなインサートを扱う際にデータがより迅速に書き込まれることができます。マージプロセスはバックグラウンドに委譲され、インサートパフォーマンスが向上しますが、一時的に小さなパーツの数が増加し、バックグラウンドのマージが完了するまでクエリが遅くなる可能性があります。この設定は、インサートパフォーマンスが優先され、バックグラウンドのマージプロセスが後で最適化を効率的に処理できる場合に理想的です。以下に示すように、設定を無効にするとインサートスループットが向上する場合があります：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 行がセットに含まれています。経過時間: 49.688 秒。59.82 百万行、24.03 GB を処理しました (1.20 百万行/s., 483.66 MB/s.)
```
## その他の注意事項 {#misc-notes}

* メモリが少ないシナリオでは、S3 にインサートするときに `max_insert_delayed_streams_for_parallel_write` を下げることを検討してください。
