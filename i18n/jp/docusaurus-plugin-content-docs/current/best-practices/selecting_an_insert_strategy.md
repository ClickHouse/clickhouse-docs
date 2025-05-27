---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': 'インサートストラテジーの選択'
'title': 'インサートストラテジーの選択'
'description': 'ClickHouse でインサートストラテジーを選択する方法について説明したページ'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

効率的なデータ取り込みは、高性能のClickHouse展開の基盤を形成します。適切な挿入戦略を選択することで、スループット、コスト、信頼性に大きな影響を与えることができます。このセクションでは、ワークロードに最適な決定を下すためのベストプラクティス、トレードオフ、および設定オプションについて概説します。

:::note
以下は、クライアントを介してClickHouseにデータをプッシュすることを想定しています。例えば、[s3](/sql-reference/table-functions/s3)や[gcs](/sql-reference/table-functions/gcs)などの組み込みテーブル関数を使用してClickHouseにデータをプルしている場合は、私たちのガイド["S3挿入および読み取りパフォーマンスの最適化"](/integrations/s3/performance)をお勧めします。
:::

## デフォルトで同期挿入 {#synchronous-inserts-by-default}

デフォルトでは、ClickHouseへの挿入は同期的です。各挿入クエリは即座にディスク上にストレージパーツを作成し、メタデータやインデックスを含みます。

:::note クライアント側でデータをバッチ処理できる場合は、同期挿入を使用してください。そうでない場合は、以下の[非同期挿入](#asynchronous-inserts)を参照してください。
:::

以下にClickHouseのMergeTree挿入メカニクスを簡単に説明します。

<Image img={insert_process} size="lg" alt="Insert processes" background="black"/>

#### クライアント側のステップ {#client-side-steps}

最適なパフォーマンスを得るためには、データを① [バッチ処理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)し、バッチサイズを**最初の決定**とします。

ClickHouseは挿入されたデータをディスクに、テーブルの主キー列によって[順序付けて](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)格納します。**2番目の決定**は、サーバーへの送信前にデータを②事前にソートするかどうかです。バッチが主キー列によって事前にソートされた状態で到着した場合、ClickHouseは⑨ソートステップを[スキップ](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)でき、取り込みが迅速になります。

取り込むデータに事前定義された形式がない場合、**主要な決定**は形式を選択することです。ClickHouseは[70以上の形式](/interfaces/formats)でデータの挿入をサポートしています。ただし、ClickHouseのコマンドラインクライアントまたはプログラミング言語クライアントを使用する場合、この選択はしばしば自動的に処理されます。必要に応じて、この自動選択を明示的にオーバーライドすることも可能です。

次の**主要な決定**は、④データをClickHouseサーバーに送信する前に圧縮するかどうかです。圧縮は転送サイズを減少させ、ネットワークの効率を向上させ、特に大規模なデータセットにおいて、より迅速なデータ転送と帯域幅使用量の低下をもたらします。

データは⑤ClickHouseのネットワークインターフェースに転送されます—[ネイティブ](/interfaces/tcp)または[HTTP](/interfaces/http)インターフェースのいずれか（この投稿で後ほど[比較](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)します）。

#### サーバー側のステップ {#server-side-steps}

データを⑥受信した後、ClickHouseは圧縮が使用されている場合は⑦それを解凍し、次に元の送信形式から⑧解析します。

そのフォーマットデータの値とターゲットテーブルの[DDL](/sql-reference/statements/create/table)ステートメントを使用して、ClickHouseは⑨メモリ内の[ブロック](/development/architecture#block)をMergeTree形式で構築し、もしそれらが事前にソートされていない場合は⑩[主キー列で](/parts#what-are-table-parts-in-clickhouse)行をソートし、⑪[sparse primary index](/guides/best-practices/sparse-primary-indexes)を作成し、⑫[列ごとの圧縮](/parts#what-are-table-parts-in-clickhouse)を適用し、⑬データを新しい⑭[データパーツ](/parts)としてディスクに書き込みます。

### 同期の場合はバッチ挿入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 冪等性のあるリトライを確保 {#ensure-idempotent-retries}

同期挿入は**冪等性**があります。MergeTreeエンジンを使用すると、ClickHouseはデフォルトで挿入を重複排除します。これにより、ネットワーク中断によってクライアントが応答を受け取れなかったなど、不明瞭な障害ケースに対して保護されます。

* 挿入が成功したが、ネットワーク中断によりクライアントが確認を受け取れなかった。
* サーバー側で挿入が失敗し、タイムアウトした。

どちらのケースでも、**挿入をリトライするのは安全です** - バッチ内容と順序が同じである限り。したがって、クライアントが一貫してリトライし、データを変更または順序を変更しないことが重要です。

### 正しい挿入ターゲットを選択 {#choose-the-right-insert-target}

シャードクラスターの場合、2つのオプションがあります：

* **MergeTree**または**ReplicatedMergeTree**テーブルに直接挿入します。クライアントがシャード間で負荷分散を行える場合、これは最も効率的なオプションです。`internal_replication = true`により、ClickHouseはレプリケーションを透明に処理します。
* [Distributed table](/engines/table-engines/special/distributed)に挿入します。これにより、クライアントは任意のノードにデータを送信し、ClickHouseがそれを正しいシャードに転送します。これは単純ですが、追加の転送ステップによりややパフォーマンスが低下します。`internal_replication = true`は引き続き推奨されます。

**ClickHouse Cloudでは、すべてのノードが同一の単一シャードに対して読み書きします。挿入はノード間で自動的にバランスされます。ユーザーは単に公開されたエンドポイントに挿入を送信することができます。**

### 正しい形式を選択 {#choose-the-right-format}

効率的なデータ取り込みにおいて、適切な入力形式を選択することが重要です。70以上のサポートされている形式があるため、最もパフォーマンスの高いオプションを選ぶことは、挿入速度、CPUおよびメモリ使用量、全体的なシステム効率に大きな影響を及ぼします。 

柔軟性はデータエンジニアリングやファイルベースのインポートに役立ちますが、**アプリケーションはパフォーマンス志向の形式を優先すべきです**：

* **ネイティブ形式**（推奨）：最も効率的。列指向で、サーバー側で必要な解析が最小限です。デフォルトでGoおよびPythonクライアントで使用されます。
* **RowBinary**：効率的な行ベースの形式で、カラム指向への変換がクライアント側で難しい場合に最適です。Javaクライアントで使用されます。
* **JSONEachRow**：使いやすいが解析コストが高いです。低ボリュームのユースケースや迅速な統合に適しています。

### 圧縮を使用 {#use-compression}

圧縮は、ネットワークのオーバーヘッドを削減し、挿入を加速し、ClickHouseにおけるストレージコストを低下させる上で重要な役割を果たします。効果的に使用することで、データ形式やスキーマを変更することなく、取り込みパフォーマンスを向上させます。

挿入データを圧縮すると、ネットワーク経由で送信されるペイロードのサイズが減少し、帯域幅使用量が最小化され、伝送が加速されます。

挿入においては、ネイティブ形式で使用すると特に効果的です。この形式はClickHouseの内部の列指向ストレージモデルにすでにマッチしています。この設定では、サーバーは迅速にデータを解凍し、最小限の変換で直接データを保存できます。

#### スピードにはLZ4を、圧縮率にはZSTDを使用 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouseはデータ転送中にいくつかの圧縮コーデックをサポートしています。一般的なオプションは2つあります：

* **LZ4**：高速で軽量。CPUオーバーヘッドが最小限で、データサイズを大幅に削減します。高スループットの挿入に最適で、ほとんどのClickHouseクライアントでデフォルトになっています。
* **ZSTD**：より高い圧縮率を持ちますが、よりCPU集約的です。ネットワーク転送コストが高い場合（地域間やクラウドプロバイダーのシナリオなど）に役立ちますが、クライアント側の計算およびサーバー側の解凍時間をわずかに増加させます。

ベストプラクティス：帯域幅が制約されている場合やデータ流出コストがかかる場合を除き、LZ4を使用してください。その場合はZSTDを検討してください。

:::note
[FastFormatsベンチマーク](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)からのテストでは、LZ4圧縮されたネイティブ挿入がデータサイズを50％以上削減し、5.6 GiBのデータセットに対して取り込み時間を150秒から131秒に短縮しました。ZSTDに切り替えた場合、同じデータセットは1.69 GiBに圧縮されましたが、サーバー側の処理時間はわずかに増加しました。
:::

#### 圧縮はリソース使用量を削減 {#compression-reduces-resource-usage}

圧縮はネットワークトラフィックを削減するだけでなく、サーバー上でのCPUおよびメモリの効率も向上させます。圧縮されたデータを使用すると、ClickHouseは少ないバイト数を受け取り、大きな入力の解析に費やす時間も減少します。この利点は、特に可観測性シナリオなど、複数の同時クライアントからの取り込み時に重要です。

LZ4では圧縮によるCPUおよびメモリへの影響は控えめで、ZSTDでは中程度です。負荷がかかっている場合でも、サーバー側の効率はデータ量の減少により改善されます。

**圧縮とバッチ処理、効率的な入力形式（ネイティブのような）を組み合わせることで、最良の取り込みパフォーマンスが得られます。**

ネイティブインターフェース（例：[clickhouse-client](/interfaces/cli)）を使用している場合、デフォルトでLZ4圧縮が有効になっています。必要に応じて設定からZSTDに切り替えることができます。

[HTTPインターフェース](/interfaces/http)を使用する場合、Content-Encodingヘッダーを使用して圧縮を適用します（例：Content-Encoding: lz4）。全てのペイロードは送信前に圧縮される必要があります。

### 低コストの場合は事前ソートしてください {#pre-sort-if-low-cost}

挿入の前に主キーでデータを事前にソートすると、特に大規模なバッチにおいて、ClickHouseでの取り込み効率が向上します。

データが事前にソートされた状態で到着すると、ClickHouseはパート作成中に内部ソートステップをスキップまたは簡略化でき、CPU使用量を削減し、挿入プロセスを加速します。事前ソートは、似たような値がまとめられるため、圧縮効率も向上させます。これによりLZ4やZSTDなどのコーデックがより良い圧縮率を達成できます。特に、大規模なバッチ挿入および圧縮と組み合わせると、処理オーバーヘッドと転送データ量の両方を削減するのに役立ちます。

**ただし、事前ソートはオプションの最適化であり、必須ではありません。** ClickHouseは並列処理を利用してデータを非常に効率的にソートし、多くの場合、サーバー側のソートはクライアント側の事前ソートよりも速いか、便利です。

**データがほぼ順序付けられている、またはクライアント側のリソース（CPU、メモリ）が十分で未使用である場合のみ、事前ソートを推奨します。** 遅延に敏感な高スループットのユースケース（可観測性など）では、データが順不同または多数のエージェントから到着するため、事前ソートをスキップし、ClickHouseの内蔵されたパフォーマンスに依存する方がしばしば良いです。

## 非同期挿入 {#asynchronous-inserts}

<AsyncInserts />

## インターフェースを選択 - HTTPまたはネイティブ {#choose-an-interface}

### ネイティブ {#choose-an-interface-native}

ClickHouseはデータ取り込みのために、**ネイティブインターフェース**と**HTTPインターフェース**の2つの主なインターフェースを提供しています - それぞれパフォーマンスと柔軟性の間でトレードオフがあります。ネイティブインターフェースは、[clickhouse-client](/interfaces/cli)やGo、C++などの一部の言語クライアントによって使用され、パフォーマンスのために特別に設計されています。常にClickHouseの非常に効率的なネイティブ形式でデータを送信し、LZ4またはZSTDによるブロック単位の圧縮をサポートし、解析や形式変換などの作業をクライアントにオフロードしてサーバー側の処理を最小限に抑えます。

このインターフェースは、MATERIALIZEDおよびDEFAULT列の値のクライアント側の計算を可能にし、サーバーがこれらのステップを完全にスキップできるようにします。これにより、高スループットの取り込みシナリオに最適です。

### HTTP {#choose-an-interface-http}

多くの従来のデータベースとは異なり、ClickHouseはHTTPインターフェースもサポートしています。**これに対して、互換性と柔軟性を優先します。** データは[任意のサポートされた形式](/integrations/data-formats)で送信でき、JSON、CSV、Parquetなどを含み、Python、Java、JavaScript、RustなどのほとんどのClickHouseクライアントで広くサポートされています。

これは、トラフィックをロードバランサーで容易に切り替えることができるため、ClickHouseのネイティブプロトコルよりも好まれることがよくあります。ネイティブプロトコルでは、少しだけオーバーヘッドが低い場合、挿入性能に小さな差異が生じると期待しています。

ただし、クライアント側の最適化、例えばマテリアライズされた値の計算やネイティブ形式への自動変換を行うことはできません。HTTP挿入は標準のHTTPヘッダーを使用して圧縮を行うことができますが（例：`Content-Encoding: lz4`）、圧縮は個々のデータブロックではなく全ペイロードに適用されます。このインターフェースは、プロトコルのシンプルさ、負荷分散、または広範な形式互換性が生のパフォーマンスよりも重要とされる環境で好まれることがよくあります。

これらのインターフェースの詳細な説明については、[こちら](/interfaces/overview)をご覧ください。
