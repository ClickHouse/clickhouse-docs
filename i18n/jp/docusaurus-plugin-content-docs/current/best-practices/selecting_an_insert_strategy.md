---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': '挿入戦略の選択'
'title': '挿入戦略の選択'
'description': 'ClickHouseにおける挿入戦略の選び方を説明するページ'
'keywords':
- 'INSERT'
- 'asynchronous inserts'
- 'compression'
- 'batch inserts'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

効率的なデータ取り込みは、高性能な ClickHouse デプロイメントの基盤を形成します。適切な挿入戦略を選択することで、スループット、コスト、および信頼性に大きな影響を与えることができます。このセクションでは、ワークロードに対する正しい決定を下すためのベストプラクティス、トレードオフ、および構成オプションを概説します。

:::note
以下は、クライアントを介して ClickHouse にデータをプッシュしていることを前提としています。もし、[s3](/sql-reference/table-functions/s3) や [gcs](/sql-reference/table-functions/gcs) のような組み込みのテーブル関数を使用して、ClickHouse にデータをプルしている場合は、当社のガイド「["S3 の挿入と読み取りパフォーマンスの最適化"](/integrations/s3/performance)」をお勧めします。
:::

## デフォルトでの同期挿入 {#synchronous-inserts-by-default}

デフォルトでは、ClickHouse への挿入は同期的です。各挿入クエリは、メタデータとインデックスを含むストレージパートをすぐにディスク上に作成します。

:::note クライアント側でデータをバッチすることができる場合は、同期挿入を使用してください
そうでない場合は、下記の[非同期挿入](#asynchronous-inserts)を参照してください。
:::

以下では、ClickHouse の MergeTree 挿入メカニズムについて簡単にレビューします：

<Image img={insert_process} size="lg" alt="Insert processes" background="black"/>

#### クライアント側のステップ {#client-side-steps}

最適なパフォーマンスを達成するためには、データは ①[バッチ化](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)される必要があり、バッチサイズは **最初の決定** です。

ClickHouse は挿入されたデータをディスクに[整列](https://guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)して保存します。**2 番目の決定**は、② データをサーバーに送信する前に事前ソートするかどうかです。バッチが主キーのカラムで事前ソートされて到着すると、ClickHouse は⑨ソートステップを[スキップ](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)でき、取り込みが早くなります。

取り込まれるデータに事前定義されたフォーマットがない場合、**主な決定**はフォーマットの選択です。ClickHouse は[70 以上のフォーマット](/interfaces/formats)でのデータ挿入をサポートしています。しかし、ClickHouse コマンドラインクライアントやプログラミング言語のクライアントを使用する場合、この選択はしばしば自動的に処理されます。必要があれば、この自動選択を明示的にオーバーライドすることもできます。

次の**主な決定**は、④ データを ClickHouse サーバーに送信する前に圧縮するかどうかです。圧縮は転送サイズを削減し、ネットワーク効率を改善します。これにより、大規模データセットにおいてデータ転送が早くなり、帯域幅の使用量が少なくなります。

データは ⑤ ClickHouse ネットワークインターフェースに送信されます。これには、[ネイティブ](/interfaces/tcp)インターフェースまたは[HTTP](/interfaces/http)インターフェースが含まれます（これについては後で[比較](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)します）。

#### サーバー側のステップ {#server-side-steps}

データを⑥受信した後、ClickHouse は圧縮が使用された場合は⑦それを解凍し、元の送信形式から⑧解析します。

そのフォーマットデータからの値とターゲットテーブルの[DDL](/sql-reference/statements/create/table) ステートメントを使用して、ClickHouse は⑨メモリ内の[ブロック](/development/architecture#block)を MergeTree フォーマットで構築し、主キーのカラムがすでに事前ソートされていない場合は⑩[ソート](/parts#what-are-table-parts-in-clickhouse)し、⑪[スパース主キーインデックス](/guides/best-practices/sparse-primary-indexes)を作成し、⑫[カラムごとの圧縮](/parts#what-are-table-parts-in-clickhouse)を適用し、⑬データを新しい⑭[データパート](/parts)としてディスクに書き込みます。

### 同期の場合はバッチ挿入を行う {#batch-inserts-if-synchronous}

<BulkInserts/>

### 冪等性のある再試行を確保する {#ensure-idempotent-retries}

同期挿入は **冪等** でもあります。MergeTree エンジンを使用する場合、ClickHouse はデフォルトで挿入を重複排除します。これにより、次のような曖昧な失敗ケースに対して保護が提供されます：

* 挿入は成功したが、ネットワークの中断によりクライアントが確認応答を受け取らなかった。
* サーバー側で挿入が失敗し、タイムアウトした。

両方のケースで、**挿入を再試行する**のは安全です - バッチの内容と順序が一致する限り。したがって、クライアントが一貫して再試行し、データを変更または再編成しないことが重要です。

### 適切な挿入ターゲットを選択する {#choose-the-right-insert-target}

シャードクラスタの場合、2 つのオプションがあります：

* **MergeTree** または **ReplicatedMergeTree** テーブルに直接挿入します。これがクライアントがシャード間で負荷分散を行える場合に最も効率的なオプションです。`internal_replication = true` が設定されていると、ClickHouse はレプリケーションを透過的に処理します。
* [分散テーブル](/engines/table-engines/special/distributed)に挿入します。これにより、クライアントは任意のノードにデータを送信し、ClickHouse がそれを正しいシャードに転送します。これが単純ですが、余分な転送ステップのため、わずかにパフォーマンスが低くなります。`internal_replication = true` は引き続き推奨されます。

**ClickHouse Cloud では、すべてのノードが同じ単一のシャードに対して読み書きします。挿入は自動的にノード間でバランスが取られます。ユーザーは公開エンドポイントに挿入を送信するだけです。**

### 適切なフォーマットを選ぶ {#choose-the-right-format}

適切な入力フォーマットの選択は、ClickHouse での効率的なデータ取り込みにとって重要です。70 を超えるサポートされているフォーマットから、最もパフォーマンスの良いオプションを選択することで、挿入速度、CPU とメモリの使用量、システム全体の効率に大きな影響を与えることができます。

柔軟性はデータエンジニアリングやファイルベースのインポートにとって有用ですが、**アプリケーションはパフォーマンス重視のフォーマットを優先すべきです**：

* **ネイティブフォーマット** (推奨)：最も効率的。列指向で、サーバー側の解析が最小限に抑えられます。Go および Python クライアントでデフォルトで使用されます。
* **RowBinary**：効率的な行ベースのフォーマットで、クライアント側での列指向変換が難しい場合に最適です。Java クライアントで使用されます。
* **JSONEachRow**：使いやすいですが、解析コストが高いです。低ボリュームのユースケースや迅速な統合に適しています。

### 圧縮を使用する {#use-compression}

圧縮はネットワークオーバーヘッドを削減し、挿入速度を上げ、ClickHouse のストレージコストを下げる重要な役割を果たします。効果的に使用すると、データフォーマットやスキーマに変更を加えることなく、取り込みパフォーマンスを向上させます。

挿入データの圧縮は、ネットワークを介して送信されるペイロードのサイズを削減し、帯域幅の使用量を最小化し、送信を加速します。

挿入において、圧縮はネイティブフォーマットと組み合わせて使用した場合に特に効果的です。このフォーマットはすでに ClickHouse の内部列指向ストレージモデルに適合しています。このセットアップでは、サーバーは効率的にデータを解凍し、最小限の変換で直接ストアできます。

#### スピードには LZ4、圧縮比には ZSTD を使用 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse はデータ転送中にいくつかの圧縮コーデックをサポートしています。一般的な選択肢は次のとおりです：

* **LZ4**：高速で軽量。最小限の CPU オーバーヘッドでデータサイズを大幅に削減でき、高スループットの挿入に理想的で、ほとんどの ClickHouse クライアントでデフォルトとして設定されています。
* **ZSTD**：圧縮比が高いが、CPU 負荷が大きい。ネットワーク転送コストが高い場合、特にクロスリージョンやクラウドプロバイダーシナリオにおいて便利ですが、クライアントサイドのコンピュートとサーバーサイドの解凍時間がわずかに増加します。

ベストプラクティス：帯域幅が制約されているか、データの出口コストが発生する場合を除き、LZ4 を使用してください。その場合は ZSTD を検討してください。

:::note
[FastFormats ベンチマーク](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)のテストでは、LZ4 で圧縮されたネイティブ挿入がデータサイズを 50% 以上削減し、5.6 GiB のデータセットの取り込み時間を 150 秒から 131 秒に短縮しました。同じデータセットを ZSTD に切り替えると、1.69 GiB に圧縮できましたが、サーバー側の処理時間がわずかに増加しました。
:::

#### 圧縮はリソース使用量を削減する {#compression-reduces-resource-usage}

圧縮はネットワークトラフィックを削減するだけでなく、サーバーでの CPU およびメモリ効率も向上させます。圧縮データを使用すると、ClickHouse は受信するバイト数が少なく、大きな入力の解析にかかる時間が短縮されます。この利点は、特にオブザーバビリティのシナリオなど、複数のクライアントから同時に取り込む場合に重要です。

LZ4 に対する CPU とメモリの影響は控えめであり、ZSTD に対しては中程度です。負荷がかかっている場合でも、データボリュームの削減によりサーバー側の効率は向上します。

**圧縮、バッチ処理、効率的な入力フォーマット（ネイティブなど）を組み合わせることで、最適な取り込みパフォーマンスが得られます。**

ネイティブインターフェース（例：[clickhouse-client](/interfaces/cli)）を使用する際、LZ4 圧縮はデフォルトで有効になっています。オプションとして、設定を通じて ZSTD に切り替えることもできます。

[HTTP インターフェース](/interfaces/http)では、Content-Encoding ヘッダーを使用して圧縮を適用します（例：Content-Encoding: lz4）。ペイロード全体は送信する前に圧縮される必要があります。

### 低コストの場合は事前ソート {#pre-sort-if-low-cost}

主キーでデータを挿入前に事前ソートすると、特に大規模なバッチの場合、ClickHouse での取り込み効率が向上します。

データが事前ソートされて到着した場合、ClickHouse はパート作成中の内部ソートステップをスキップまたは簡素化でき、CPU 使用量を削減し、挿入プロセスを加速します。事前ソートは、類似の値がグループ化されるため、圧縮効率を向上させます - このことで、LZ4 や ZSTD などのコーデックがより良い圧縮比を達成することができます。これは、大規模なバッチ挿入や圧縮と組み合わせると、処理オーバーヘッドと転送されるデータ量の両方を削減するため、特に有益です。

**とはいえ、事前ソートはオプションの最適化であり、必須ではありません。** ClickHouse は並列処理を利用してデータを非常に効率的にソートし、多くの場合、サーバー側でのソートがクライアント側での事前ソートよりも速いか、便利です。

**データがほぼ整列されている場合、またはクライアント側のリソース（CPU、メモリ）が十分で未使用の場合にのみ、事前ソートを推奨します。** 遅延に敏感なユースケースや高スループットユースケース（オブザーバビリティなど）では、データが順不同で到着したり多くのエージェントから送信されたりする場合、事前ソートをスキップし、ClickHouse の内蔵パフォーマンスに頼るほうが良いです。

## 非同期挿入 {#asynchronous-inserts}

<AsyncInserts />

## インターフェースを選択する - HTTP またはネイティブ {#choose-an-interface}

### ネイティブ {#choose-an-interface-native}

ClickHouse はデータ取り込みのために、**ネイティブインターフェース**と **HTTP インターフェース**という 2 つの主なインターフェースを提供しており、それぞれパフォーマンスと柔軟性のトレードオフがあります。ネイティブインターフェースは、[clickhouse-client](/interfaces/cli) や Go や C++ のような選択された言語クライアントによって使用されており、パフォーマンスのために特別に設計されています。常に ClickHouse の非常に効率的なネイティブフォーマットでデータを送信し、LZ4 や ZSTD でブロック単位の圧縮をサポートし、解析やフォーマット変換などの作業をクライアントにオフロードすることでサーバー側の処理を最小限に抑えます。

さらに、MATERIALIZED および DEFAULT カラムの値のクライアント側計算を可能にし、サーバーがこれらのステップを完全にスキップできるようにします。これにより、効率が重要な高スループットな取り込みシナリオに最適なネイティブインターフェースとなります。

### HTTP {#choose-an-interface-http}

多くの従来のデータベースとは異なり、ClickHouse は HTTP インターフェースもサポートしています。**これに対して、互換性と柔軟性を優先します。** データは、[任意のサポートされたフォーマット](/integrations/data-formats)（JSON、CSV、Parquet など）で送信でき、Python、Java、JavaScript、Rust を含むほとんどの ClickHouse クライアントで広くサポートされています。

これは、トラフィックをロードバランサーで簡単に切り替えられるため、ClickHouse のネイティブプロトコルよりも好まれることがよくあります。ネイティブプロトコルでは、わずかにオーバーヘッドが少ないため、挿入パフォーマンスに小さな差が期待されます。

ただし、ネイティブプロトコルの深い統合が欠けており、マテリアライズされた値の計算やネイティブフォーマットへの自動変換などのクライアント側最適化を行うことができません。HTTP 挿入は、標準 HTTP ヘッダー（例：`Content-Encoding: lz4`）を使用して圧縮することもできますが、圧縮は個々のデータブロックではなく、ペイロード全体に適用されます。このインターフェースは、プロトコルのシンプルさ、負荷分散、または広範なフォーマット互換性が、純粋なパフォーマンスよりも重要な環境で好まれることが多いです。

これらのインターフェースの詳細な説明については、[こちら](/interfaces/overview)をご覧ください。
