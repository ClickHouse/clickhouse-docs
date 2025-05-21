---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: '挿入戦略の選択'
title: '挿入戦略の選択'
description: 'ClickHouseにおける挿入戦略の選択方法を説明したページ'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/docs/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/docs/best-practices/_snippets/_bulk_inserts.md';

効率的なデータ取り込みは、高性能の ClickHouse デプロイメントの基盤を形成します。適切な挿入戦略を選択することで、スループット、コスト、信頼性に大きな影響を与えることができます。このセクションでは、ワークロードに適した決定を行うためのベストプラクティス、トレードオフ、および構成オプションを概説します。

:::note
以下は、クライアントを介してデータを ClickHouse にプッシュすることを前提としています。もし、[s3](/sql-reference/table-functions/s3) や [gcs](/sql-reference/table-functions/gcs) などの組み込みテーブル関数を使用して ClickHouse にデータをプルする場合、私たちのガイド「["S3の挿入および読み取りパフォーマンスの最適化"](/integrations/s3/performance)」をお勧めします。
:::

## デフォルトでは同期挿入 {#synchronous-inserts-by-default}

デフォルトでは、ClickHouse への挿入は同期的です。各挿入クエリは直ちにディスク上にストレージパーツを作成し、メタデータとインデックスを含みます。

:::note クライアント側でデータをバッチ処理できる場合は同期挿入を使用してください
そうでない場合は、以下の[非同期挿入](#asynchronous-inserts)を参照してください。
:::

以下に ClickHouse の MergeTree 挿入メカニズムを簡単に説明します：

<Image img={insert_process} size="lg" alt="挿入プロセス" background="black"/>

#### クライアント側のステップ {#client-side-steps}

最適なパフォーマンスを得るためには、データを ①[バッチ処理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)する必要があり、バッチサイズが **最初の決定** となります。

ClickHouse は挿入されたデータをディスク上に、テーブルの主キーのカラムによって[順序付けて](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)保存します。**2番目の決定** は、サーバーへの送信前にデータを ②事前にソートするかどうかです。バッチが主キーのカラムによって事前にソートされて到着すると、ClickHouse は[ソート](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)ステップを⑨スキップでき、取り込みが速くなります。

挿入されるデータに事前定義されたフォーマットがない場合、**重要な決定** はフォーマットを選択することです。ClickHouse は [70以上のフォーマット](/interfaces/formats)でデータの挿入をサポートしています。ただし、ClickHouse コマンドラインクライアントやプログラミング言語クライアントを使用する場合、この選択はしばしば自動的に処理されます。必要に応じて、この自動選択を明示的に上書きすることもできます。

次の**重要な決定** は、④データを ClickHouse サーバーに送信する前に圧縮するかどうかです。圧縮は転送サイズを減少させ、ネットワーク効率を改善し、大規模データセットでは特に迅速なデータ転送と低い帯域幅使用を促進します。

データは ⑤ ClickHouse のネットワークインターフェース—[ネイティブ](/interfaces/tcp) または[HTTP](/interfaces/http)インターフェース（後で[比較](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)します）に送信されます。

#### サーバー側のステップ {#server-side-steps}

データを ⑥受信した後、ClickHouse は圧縮が使用されている場合はそれを ⑦解凍し、その後 ⑧元のフォーマットから解析します。

そのフォーマットデータからの値とターゲットテーブルの[DDL](/sql-reference/statements/create/table) ステートメントを使用して、ClickHouse は⑨メモリ内[ブロック](/development/architecture#block)を MergeTree 形式で構築し、主キーのカラムによって行を ⑩[ソート](/parts#what-are-table-parts-in-clickhouse)し、事前にソートされていない場合は、⑪[スパース主キーインデックス](/guides/best-practices/sparse-primary-indexes)を作成し、⑫[カラムごとの圧縮](/parts#what-are-table-parts-in-clickhouse)を適用し、⑬新しい⑭[データパーツ](/parts)をディスクに書き込みます。


### 同期の場合のバッチ挿入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 冪等性のある再試行を確保 {#ensure-idempotent-retries}

同期挿入はまた**冪等性**を持ちます。MergeTree エンジンを使用する場合、ClickHouse はデフォルトで挿入を重複排除します。これは、次のようなあいまいな失敗ケースから保護します：

* 挿入に成功したが、ネットワーク干渉のためクライアントが確認応答を受信しなかった。
* サーバー側で挿入に失敗し、タイムアウトした。

両方のケースで、**挿入を再試行することは安全です** - バッチの内容と順序が同じであれば。したがって、クライアントが一貫して再試行し、データを変更または再配置しないことが重要です。

### 適切な挿入ターゲットを選択 {#choose-the-right-insert-target}

シャーディングされたクラスターの場合、次の二つのオプションがあります：

* **MergeTree** または **ReplicatedMergeTree** テーブルに直接挿入します。これは、クライアントがシャード間で負荷分散を行える場合に最も効率的です。`internal_replication = true` の場合、ClickHouse はレプリケーションを透過的に処理します。
* [分散テーブル](/engines/table-engines/special/distributed)に挿入します。これにより、クライアントは任意のノードにデータを送信し、ClickHouse がそれを適切なシャードに転送することができます。これはシンプルですが、追加の転送ステップのため、若干パフォーマンスが低下します。`internal_replication = true` は引き続き推奨されます。

**ClickHouse Cloud では、すべてのノードが同じ単一のシャードに読み書きします。挿入は自動的にノード間でバランスされます。ユーザーは単に公開されたエンドポイントに挿入を送信できます。**

### 適切なフォーマットを選択 {#choose-the-right-format}

適切な入力フォーマットを選択することは、ClickHouse における効率的なデータ取り込みにとって重要です。70 を超えるサポートされているフォーマットの中で、最もパフォーマンスが高いオプションを選択することが挿入速度、CPU およびメモリ使用量、全体的なシステム効率に大きな影響を与える可能性があります。

データエンジニアリングやファイルベースのインポートに柔軟性があることは有益ですが、**アプリケーションはパフォーマンス重視のフォーマットを優先すべきです**：

* **ネイティブフォーマット**（推奨）：最も効率的。列指向で、サーバー側の解析が最小限で済みます。Go および Python クライアントでデフォルトで使用されます。
* **RowBinary**：効率的な行ベースのフォーマットで、クライアント側での列指向変換が難しい場合に最適です。Java クライアントによって使用されます。
* **JSONEachRow**：使いやすいが、解析が高コストです。低ボリュームのユースケースや迅速な統合に適しています。

### 圧縮を使用する {#use-compression}

圧縮は、ネットワークオーバーヘッドを削減し、挿入を速め、ClickHouse におけるストレージコストを下げる重要な役割を果たします。効果的に使用すれば、データフォーマットやスキーマの変更を必要とせずに、取り込みパフォーマンスを向上させることができます。

挿入データを圧縮することで、ネットワーク経由で送信されるペイロードのサイズが減少し、帯域幅使用量が最小化され、転送が加速されます。

挿入の場合、圧縮はネイティブフォーマットと一緒に使用することで特に効果的です。このフォーマットはすでに ClickHouse の内部の列指向ストレージモデルに一致します。このセットアップでは、サーバーは効率良くデータを解凍し、最小限の変換で直接ストレージに保存できます。

#### 速度には LZ4 を、圧縮比には ZSTD を使用 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse は、データ送信中にいくつかの圧縮コーデックをサポートしています。一般的な二つのオプションは：

* **LZ4**：高速で軽量です。CPU のオーバーヘッドは最小限で、データサイズを大幅に削減します。高スループットの挿入に最適で、ほとんどの ClickHouse クライアントでデフォルトです。
* **ZSTD**：圧縮比が高いですが、CPU 集約的です。ネットワーク転送コストが高い場合（地域を越えた転送やクラウドプロバイダーのシナリオなど）に有用ですが、クライアント側の計算およびサーバー側の解凍時間がわずかに増加します。

ベストプラクティス：帯域幅の制約がない限り LZ4 を使用し、データの egress コストがかかる場合には ZSTD を検討してください。

:::note
[FastFormats ベンチマーク](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)のテストでは、LZ4 圧縮されたネイティブ挿入がデータサイズを 50% 以上削減し、5.6 GiB のデータセットの取り込み時間を 150 秒から 131 秒に短縮しました。ZSTD に切り替えると、同じデータセットを 1.69 GiB に圧縮しましたが、サーバー側の処理時間はわずかに増加しました。
:::

#### 圧縮はリソース使用を削減 {#compression-reduces-resource-usage}

圧縮はネットワークトラフィックを減少させるだけではなく、サーバー上の CPU およびメモリ効率も改善します。圧縮されたデータを使用すると、ClickHouse はより少ないバイトを受信し、大きな入力を解析するのにかかる時間が短縮されます。この利点は、観測シナリオなどで複数の同時クライアントから取り込む場合には特に重要です。

LZ4 の CPU およびメモリへの影響はわずかで、ZSTD の場合は適度です。負荷がかかっていても、データ量が減少するためサーバー側の効率が向上します。

**圧縮をバッチ処理と効率的な入力フォーマット（ネイティブなど）と組み合わせることで、最良の取り込みパフォーマンスを得ることができます。**

ネイティブインターフェース（例：[clickhouse-client](/interfaces/cli)）を使用する場合、LZ4 圧縮はデフォルトで有効になっています。設定により ZSTD に切り替えることもできます。

[HTTP インターフェース](/interfaces/http)を使用する場合、Content-Encoding ヘッダーを使用して圧縮を適用します（例：Content-Encoding: lz4）。ペイロード全体は送信前に圧縮される必要があります。

### 低コストの場合は事前ソート {#pre-sort-if-low-cost}

挿入前に主キーでデータを事前にソートすることで、特に大規模なバッチでは ClickHouse での取り込み効率が向上します。

データが事前にソートされて到着すると、ClickHouse はパート作成中の内部ソートステップをスキップまたは簡略化でき、CPU 使用量が削減され、挿入プロセスが加速されます。事前ソートは圧縮効率も改善します。類似の値がまとめられるため、LZ4 や ZSTD のようなコーデックがより良い圧縮比を達成できるようになります。これは、大規模なバッチ挿入や圧縮と組み合わせると特に有益であり、処理オーバーヘッドと転送されるデータ量の両方を減少させます。

**とはいえ、事前ソートはオプションの最適化であり、必須ではありません。** ClickHouse は並列処理を使用してデータを非常に効率的にソートし、多くの場合、サーバー側のソートはクライアント側の事前ソートよりも速いか、便利です。

**データがすでにほぼ順序付けられている場合や、クライアント側のリソース（CPU またはメモリ）が十分で利用されていない場合にのみ、事前ソートを推奨します。** レイテンシに敏感なケースや高スループットのユースケース（観測など）では、データが順不同または多くのエージェントから到着するため、事前ソートをスキップし、ClickHouse の組み込みのパフォーマンスに依存する方が良いことがよくあります。

## 非同期挿入 {#asynchronous-inserts}

<AsyncInserts />

## インターフェースを選択 - HTTP またはネイティブ {#choose-an-interface}

### ネイティブ {#choose-an-interface-native}

ClickHouse はデータ取り込みのために 2 つの主要なインターフェースを提供しています：**ネイティブインターフェース**と **HTTP インターフェース** - 各々がパフォーマンスと柔軟性の間でトレードオフがあります。ネイティブインターフェースは、[clickhouse-client](/interfaces/cli) や Go、C++ のような特定のプログラミング言語クライアントによって使用されており、パフォーマンスのために目的に設計されています。これは常に ClickHouse の非常に効率的なネイティブフォーマットでデータを転送し、LZ4 または ZSTD でのブロック単位の圧縮をサポートし、解析やフォーマット変換などの作業をクライアントにオフロードすることにより、サーバー側の処理を最小限に抑えます。

これにより、MATERIALIZED および DEFAULT カラムの値のクライアント側での計算が可能になり、サーバーはこれらのステップを完全にスキップできます。このため、ネイティブインターフェースは、高スループットの取り込みシナリオに最適です。

### HTTP {#choose-an-interface-http}

多くの伝統的なデータベースとは異なり、ClickHouse は HTTP インターフェースもサポートしています。**対照的に、これは互換性と柔軟性を優先します。** データを[サポートされた任意のフォーマット](/integrations/data-formats)（JSON、CSV、Parquet などを含めて）で送信でき、Python、Java、JavaScript、Rust などのほとんどの ClickHouse クライアントで広くサポートされています。

これは、トラフィックをロードバランサーで容易に切り替えられるため、ClickHouse のネイティブプロトコルよりもしばしば好まれます。ネイティブプロトコルに伴う少しのオーバーヘッドのため、挿入パフォーマンスには小さな差異が期待されます。

しかし、ネイティブプロトコルのより深い統合が欠けており、クライアント側での最適化（マテリアライズされた値の計算やネイティブフォーマットへの自動変換など）ができません。HTTP 挿入は、標準の HTTP ヘッダー（例：`Content-Encoding: lz4`）を使用して圧縮を適用できますが、圧縮は個々のデータブロックではなく、ペイロード全体に適用されます。このインターフェースは、プロトコルの単純性、ロードバランシング、または広範なフォーマット互換性が生のパフォーマンスよりも重要な環境でしばしば好まれます。

これらのインターフェースの詳細な説明については、[こちら](/interfaces/overview)をご覧ください。
