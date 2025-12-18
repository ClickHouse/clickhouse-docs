---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: 'INSERT 戦略の選び方'
title: 'INSERT 戦略の選び方'
description: 'ClickHouse での INSERT 戦略の選び方を説明するページ'
keywords: ['INSERT', 'asynchronous inserts', 'compression', 'batch inserts']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

効率的なデータのインジェストは、高性能な ClickHouse デプロイメントの基盤となります。適切なデータ挿入戦略を選択することで、スループット、コスト、および信頼性は大きく左右されます。本セクションでは、ワークロードに最適な判断を行うためのベストプラクティス、トレードオフ、および設定オプションについて説明します。

:::note
以下の内容は、クライアント経由で ClickHouse にデータをプッシュしていることを前提としています。組み込みのテーブル関数 [s3](/sql-reference/table-functions/s3) や [gcs](/sql-reference/table-functions/gcs) などを使用して ClickHouse にデータをプルしている場合は、「[S3 への挿入および読み取りパフォーマンスの最適化](/integrations/s3/performance)」ガイドを参照することを推奨します。
:::


## デフォルトでは同期インサート {#synchronous-inserts-by-default}

デフォルトでは、ClickHouse へのインサートは同期的に行われます。各インサートクエリは、メタデータおよびインデックスを含むストレージパーツを即座にディスク上に作成します。

:::note クライアント側でデータをバッチ化できる場合は同期インサートを使用する
そうでない場合は、下記の[非同期インサート](#asynchronous-inserts)を参照してください。
:::

以下では、ClickHouse の MergeTree におけるインサートの仕組みを簡単に確認します。

<Image img={insert_process} size="lg" alt="Insert processes" background="black"/>

#### クライアント側のステップ {#client-side-steps}

最適なパフォーマンスのためには、データを①[バッチ化](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)する必要があり、バッチサイズが**最初の検討事項**になります。

ClickHouse はインサートされたデータを、テーブルの主キー列で[並べ替えた状態](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)でディスクに格納します。**2つ目の検討事項**は、サーバーに送信する前にデータを②事前ソートするかどうかです。バッチが主キー列で事前にソートされた状態で届いた場合、ClickHouse はインジェストを高速化するために ⑩ のソートステップを[省略](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)できます。

インジェストするデータにあらかじめ決まったフォーマットがない場合、**重要な検討事項**はフォーマットの選択です。ClickHouse は[70 以上のフォーマット](/interfaces/formats)でのデータインサートをサポートしています。ただし、ClickHouse のコマンドラインクライアントや各種プログラミング言語のクライアントを使用する際には、この選択はしばしば自動的に処理されます。必要であれば、この自動選択を明示的に上書きすることもできます。

次の**主要な検討事項**は、ClickHouse サーバーへの送信前にデータを④圧縮するかどうかです。圧縮により転送サイズが減り、ネットワーク効率が向上するため、とくに大規模なデータセットではデータ転送が高速化され、帯域幅使用量も削減されます。

データは⑤ ClickHouse のネットワークインターフェイス、すなわち [native](/interfaces/tcp) または[ HTTP](/interfaces/http) インターフェイスのいずれかに送信されます（これらはこの記事の後半で[比較](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)します）。

#### サーバー側のステップ {#server-side-steps}

⑥ データを受信したあと、ClickHouse は圧縮が使用されていた場合に ⑦ それを解凍し、その後 ⑧ 元の送信フォーマットからパースします。

そのフォーマット済みデータの値と対象テーブルの [DDL](/sql-reference/statements/create/table) ステートメントを用いて、ClickHouse は MergeTree 形式のインメモリ[ブロック](/development/architecture#block)を ⑨ 構築し、事前にソートされていない場合は主キー列で行を ⑩ [ソート](/parts#what-are-table-parts-in-clickhouse)し、⑪ [疎な主キーインデックス](/guides/best-practices/sparse-primary-indexes)を作成し、⑫ [列単位の圧縮](/parts#what-are-table-parts-in-clickhouse)を適用し、最後にデータをディスクに ⑬ 書き込み、新しい ⑭ [データパーツ](/parts)を作成します。

### 同期インサート時はデータをバッチ化する {#batch-inserts-if-synchronous}

<BulkInserts/>

### 冪等なリトライを確保する {#ensure-idempotent-retries}

同期インサートは**冪等**でもあります。MergeTree エンジンを使用する場合、ClickHouse はデフォルトでインサートの重複排除を行います。これにより、次のようなあいまいな障害ケースから保護されます。

* インサートは成功したが、ネットワークの中断によりクライアントが応答を受信できなかった。
* インサートがサーバー側で失敗し、タイムアウトした。

いずれの場合も、バッチの内容と順序が同一である限り、**インサートをリトライ**しても安全です。このため、クライアントはデータを変更したり並べ替えたりせず、一貫した方法でリトライすることが極めて重要です。

### 適切なインサート先を選択する {#choose-the-right-insert-target}

シャード構成のクラスタでは、次の 2 つの選択肢があります。

* **MergeTree** または **ReplicatedMergeTree** テーブルに直接インサートする。これは、クライアントがシャード間でロードバランシングを行える場合に最も効率的なオプションです。`internal_replication = true` の場合、ClickHouse はレプリケーションを透過的に処理します。
* [Distributed テーブル](/engines/table-engines/special/distributed)にインサートする。これにより、クライアントは任意のノードにデータを送信し、ClickHouse に正しいシャードへの転送を任せることができます。これはよりシンプルですが、追加の転送ステップがあるため、パフォーマンスはわずかに低下します。`internal_replication = true` はこの場合でも推奨されます。

**ClickHouse Cloud では、すべてのノードが同じ単一の分片に対して読み書きを行います。インサートはノード間で自動的にバランスされるため、公開されているエンドポイントに対してインサートを送信するだけでかまいません。**

### 適切なフォーマットを選択する {#choose-the-right-format}

ClickHouse における効率的なデータのインジェストには、適切な入力フォーマットの選択が重要です。70 以上のフォーマットがサポートされているため、最も高性能なオプションを選ぶことで、INSERT の速度、CPU およびメモリ使用量、そしてシステム全体の効率に大きな影響を与えられます。

データエンジニアリングやファイルベースのインポートでは柔軟性が有用ですが、**アプリケーションではパフォーマンス重視のフォーマットを優先すべきです**。

* **Native フォーマット**（推奨）：最も効率的。カラム指向で、サーバー側で必要なパースが最小限。Go および Python クライアントでデフォルトで使用されます。
* **RowBinary**：効率的な行指向フォーマット。クライアント側でカラム指向への変換が難しい場合に最適。Java クライアントで使用されます。
* **JSONEachRow**：扱いやすい一方で、パースコストが高いフォーマット。低ボリュームなユースケースや、迅速な連携用途に適しています。

### 圧縮を使用する {#use-compression}

圧縮は、ネットワークオーバーヘッドを削減し、INSERT を高速化し、ClickHouse におけるストレージコストを抑えるうえで重要な役割を果たします。効果的に利用することで、データフォーマットやスキーマを変更することなく、インジェスト性能を向上できます。

INSERT データを圧縮すると、ネットワーク越しに送信されるペイロードサイズが小さくなり、帯域幅の使用量を最小限に抑えつつ、送信を高速化できます。

INSERT において圧縮は、すでに ClickHouse の内部カラムナストレージモデルに整合している Native フォーマットと組み合わせた場合に特に効果的です。この構成では、サーバーはデータを効率的に伸長し、最小限の変換で直接保存できます。

#### 速度重視には LZ4、圧縮率重視には ZSTD を使用する {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse はデータ送信時に複数の圧縮コーデックをサポートしています。代表的な 2 つの選択肢は次のとおりです。

* **LZ4**：高速かつ軽量。CPU オーバーヘッドを最小限に抑えつつ、データサイズを大きく削減できるため、高スループットな INSERT に理想的であり、ほとんどの ClickHouse クライアントでデフォルトとして使用されています。
* **ZSTD**：より高い圧縮率を提供しますが、CPU 負荷が増加します。リージョン間やクラウドプロバイダ間など、ネットワーク転送コストが高いシナリオで有用ですが、クライアント側の計算量とサーバー側の伸長時間がわずかに増加します。

ベストプラクティス：帯域幅が制約されている、またはデータの外向き転送コストが発生する場合を除き、LZ4 を使用してください。そのような場合には ZSTD の利用を検討します。

:::note
[FastFormats ベンチマーク](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) のテストでは、LZ4 圧縮された Native の INSERT によりデータサイズが 50% 以上削減され、5.6 GiB のデータセットに対してインジェスト時間が 150 秒から 131 秒に短縮されました。ZSTD に切り替えると、同じデータセットは 1.69 GiB まで圧縮されましたが、サーバー側の処理時間はわずかに増加しました。
:::

#### 圧縮によりリソース使用量が削減される {#compression-reduces-resource-usage}

圧縮はネットワークトラフィックを削減するだけでなく、サーバー側の CPU およびメモリ効率も向上させます。圧縮データであれば、ClickHouse が受信するバイト数が少なくなり、大きな入力をパースする時間も短縮されます。この利点は、オブザーバビリティのように多数のクライアントから同時にインジェストを行うシナリオで特に重要です。

圧縮が CPU とメモリに与える影響は、LZ4 の場合は小さく、ZSTD の場合は中程度です。負荷がかかった状態でも、データ量が削減されることでサーバー側の効率は向上します。

**圧縮をバッチ処理および効率的な入力フォーマット（Native など）と組み合わせることで、インジェスト性能を最大化できます。**

ネイティブインターフェイス（例：[clickhouse-client](/interfaces/cli)）を使用する場合、LZ4 圧縮はデフォルトで有効になっています。必要に応じて設定により ZSTD に切り替えることもできます。

[HTTP インターフェイス](/interfaces/http) を使用する場合は、`Content-Encoding` ヘッダーを使用して圧縮を適用します（例：`Content-Encoding: lz4`）。送信前にペイロード全体を圧縮しておく必要があります。

### 低コストであれば事前ソートを行う {#pre-sort-if-low-cost}

挿入前にデータを主キーで事前ソートしておくと、特に大きなバッチの場合に ClickHouse でのインジェスト効率を向上できます。

事前ソートされたデータが到着すると、ClickHouse はパーツ作成時の内部ソート処理の一部をスキップまたは単純化でき、CPU 使用量を削減しつつ INSERT 処理を高速化できます。事前ソートは圧縮効率も高めます。同種の値がまとまることで、LZ4 や ZSTD のようなコーデックがより良い圧縮率を達成できるためです。これは、大きなバッチ INSERT と圧縮を組み合わせた場合に特に有効で、処理オーバーヘッドと転送データ量の両方を削減します。

**とはいえ、事前ソートは必須ではなくオプションの最適化に過ぎません。** ClickHouse は並列処理を用いてデータを非常に効率的にソートでき、多くのケースではサーバー側でソートした方が、クライアント側で事前ソートするよりも高速、あるいは扱いやすい場合があります。 

**事前ソートは、データがすでにほぼソート済みである場合や、クライアント側リソース（CPU、メモリ）に十分な余裕があり有効活用できていない場合にのみ推奨します。** オブザーバビリティのように、レイテンシに厳しい、あるいは高スループットなユースケースで、データが順不同で到着したり多数のエージェントから到着したりする場合には、事前ソートは行わず、ClickHouse による組み込みの高パフォーマンスに任せる方がよいことが多くあります。

## 非同期 INSERT {#asynchronous-inserts}

<AsyncInserts />

## インターフェースを選択する — HTTP かネイティブか {#choose-an-interface}

### ネイティブ {#choose-an-interface-native}

ClickHouse はデータのインジェスト用に 2 つの主要なインターフェース、**ネイティブインターフェース** と **HTTP インターフェース** を提供しており、それぞれにパフォーマンスと柔軟性のトレードオフがあります。[clickhouse-client](/interfaces/cli) や Go、C++ などの一部の言語クライアントで使用されるネイティブインターフェースは、パフォーマンスを重視して設計されています。常に ClickHouse の高効率な Native 形式でデータを送信し、LZ4 または ZSTD によるブロック単位の圧縮をサポートし、パースやフォーマット変換などの処理をクライアント側にオフロードすることでサーバー側の処理を最小限に抑えます。 

さらに、MATERIALIZED および DEFAULT 列値をクライアント側で計算できるため、サーバーはこれらのステップを完全に省略できます。これにより、効率性が重要となる高スループットなインジェストシナリオにおいて、ネイティブインターフェースは理想的な選択となります。

### HTTP {#choose-an-interface-http}

多くの従来型データベースとは異なり、ClickHouse は HTTP インターフェースもサポートしています。**こちらは対照的に、互換性と柔軟性を優先します。** [サポートされている任意の形式](/integrations/data-formats) — JSON、CSV、Parquet など — でデータを送信でき、Python、Java、JavaScript、Rust を含むほとんどの ClickHouse クライアントで広くサポートされています。

トラフィックをロードバランサー経由で容易に切り替え・振り分けできるため、これは ClickHouse のネイティブプロトコルより望ましい場合がよくあります。ネイティブプロトコルの方がオーバーヘッドがわずかに少ないため、INSERT パフォーマンスには小さな差が出ると想定されます。

しかし、HTTP インターフェースにはネイティブプロトコルのような深い統合はなく、マテリアライズド値の計算や Native 形式への自動変換といったクライアント側の最適化は行えません。HTTP による挿入でも標準的な HTTP ヘッダー（例: `Content-Encoding: lz4`）を使って圧縮できますが、圧縮は個々のデータブロックではなくペイロード全体に対して適用されます。このインターフェースは、プロトコルの単純さ、ロードバランシング、幅広い形式との互換性が、生のパフォーマンスよりも重要となる環境で選好されることが多くあります。

これらのインターフェースのより詳細な説明については、[こちら](/interfaces/overview)を参照してください。