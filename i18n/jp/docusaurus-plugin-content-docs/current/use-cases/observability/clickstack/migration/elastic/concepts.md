---
'slug': '/use-cases/observability/clickstack/migration/elastic/concepts'
'title': 'ClickStack と Elastic の同等の概念'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '同等の概念'
'sidebar_position': 1
'description': '同等の概念 - ClickStack と Elastic'
'show_related_blogs': true
'keywords':
- 'Elasticsearch'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import elasticsearch from '@site/static/images/use-cases/observability/elasticsearch.png';
import clickhouse from '@site/static/images/use-cases/observability/clickhouse.png';
import clickhouse_execution from '@site/static/images/use-cases/observability/clickhouse-execution.png';
import elasticsearch_execution from '@site/static/images/use-cases/observability/elasticsearch-execution.png';
import elasticsearch_transforms from '@site/static/images/use-cases/observability/es-transforms.png';
import clickhouse_mvs from '@site/static/images/use-cases/observability/ch-mvs.png';


## Elastic Stack vs ClickStack {#elastic-vs-clickstack}

Elastic Stack と ClickStack は、観測プラットフォームのコア機能を扱いますが、それぞれ異なる設計哲学でアプローチしています。これらの役割には以下が含まれます：

- **UI とアラート**：データをクエリし、ダッシュボードを構築し、アラートを管理するためのツール。
- **ストレージとクエリエンジン**：観測データを保存し、分析クエリに応じるバックエンドシステム。
- **データ収集と ETL**：テレメトリデータを収集し、取り込む前に処理するエージェントやパイプライン。

以下の表は、それぞれのスタックがどのようにコンポーネントをこれらの役割にマッピングしているかを示しています：

| **役割** | **Elastic Stack** | **ClickStack** | **コメント** |
|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------|
| **UI & アラート** | **Kibana** — ダッシュボード、検索、およびアラート      | **HyperDX** — リアルタイム UI、検索、およびアラート   | 両者は主にユーザーのインターフェースを提供しており、ビジュアライゼーションとアラート管理を含みます。HyperDX は観測のために特別に設計されており、OpenTelemetry セマンティクスに緊密に関連しています。 |
| **ストレージ & クエリエンジン** | **Elasticsearch** — JSON ドキュメントストアで反転インデックスを使用 | **ClickHouse** — 列指向データベースでベクトル化エンジンを使用 | Elasticsearch は検索に最適化された反転インデックスを使用し、ClickHouse は構造化データと半構造化データに対する高速分析のために列指向ストレージと SQL を使用します。 |
| **データ収集** | **Elastic Agent**、**Beats**（例：Filebeat、Metricbeat） | **OpenTelemetry Collector**（エッジ + ゲートウェイ）     | Elastic はカスタムシッパーと Fleet によって管理される統一エージェントをサポートしています。ClickStack は OpenTelemetry に依存し、ベンダー中立のデータ収集と処理を可能にします。 |
| **計測 SDK** | **Elastic APM エージェント**（独自）             | **OpenTelemetry SDKs**（ClickStack によって配布） | Elastic の SDK は Elastic スタックに結びついています。ClickStack は主要なプログラミング言語におけるログ、メトリクス、およびトレースのために OpenTelemetry SDKs を基に構築しています。 |
| **ETL / データ処理** | **Logstash**、取り込みパイプライン                   | **OpenTelemetry Collector** + ClickHouse マテリアライズドビュー | Elastic は変換のために取り込みパイプラインと Logstash を使用します。ClickStack はマテリアライズドビューと OTel コレクタプロセッサーを介して計算を挿入時にシフトし、効率的かつ段階的にデータを変換します。 |
| **アーキテクチャ哲学** | 垂直統合、独自のエージェントとフォーマット | オープンスタンダードベース、緩やかに結合されたコンポーネント   | Elastic は緊密に統合されたエコシステムを構築します。ClickStack は柔軟性とコスト効率のためにモジュール性と標準（OpenTelemetry、SQL、オブジェクトストレージ）を重視しています。 |

ClickStack はオープンスタンダードと相互運用性を強調しており、収集から UI まで完全に OpenTelemetry ネイティブです。それに対して、Elastic は独自のエージェントとフォーマットを持つ緊密に関連したがより垂直に統合されたエコシステムを提供しています。

**Elasticsearch** と **ClickHouse** はそれぞれのスタックにおいてデータのストレージ、処理、クエリを担当するコアエンジンであるため、それぞれの違いを理解することは重要です。これらのシステムは全体の観測アーキテクチャのパフォーマンス、スケーラビリティ、柔軟性を支えています。次のセクションでは Elasticsearch と ClickHouse の主な違いを探ります - データのモデリング、取り込み、クエリの実行、およびストレージの管理方法を含みます。
## Elasticsearch vs ClickHouse {#elasticsearch-vs-clickhouse}

ClickHouse と Elasticsearch は異なる基盤モデルを用いてデータを整理し、クエリを実行しますが、多くのコアコンセプトは似た機能を担います。このセクションでは、Elastic に慣れたユーザー向けに主要な同等性を説明し、それらを ClickHouse の対応物にマッピングします。用語が異なるものの、ほとんどの観測ワークフローは ClickStack でも再現可能です - しばしばより効率的に。

### コア構造概念 {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL** | **説明** |
|-------------------|----------------------|------------------|
| **フィールド** | **カラム** | 特定のタイプの一つ以上の値を保持するデータの基本単位。Elasticsearch フィールドはプリミティブや配列、オブジェクトを保存できます。フィールドは一つのタイプしか持てません。ClickHouse も配列やオブジェクト（`Tuples`、`Maps`、`Nested`）をサポートし、複数のタイプを持つカラムを可能にする動的なタイプ [`Variant`](/sql-reference/data-types/variant) と [`Dynamic`](/sql-reference/data-types/dynamic) を持っています。 |
| **ドキュメント** | **行** | フィールド（カラム）の集合。Elasticsearch ドキュメントはデフォルトでより柔軟で、新しいフィールドはデータに基づいて動的に追加されます（タイプは推論されます）。ClickHouse 行はデフォルトでスキーマにバインドされており、ユーザーは行の全カラムまたはサブセットを挿入する必要があります。ClickHouse の [`JSON`](/integrations/data-formats/json/overview) タイプは挿入されたデータに基づいて半構造的動的カラムを作成できることをサポートしています。 |
| **インデックス** | **テーブル** | クエリ実行とストレージの単位。両方のシステムでは、クエリはインデックスやテーブルに対して実行され、行/ドキュメントを保存します。 |
| *暗黙的* | スキーマ（SQL）         | SQL スキーマはテーブルをネームスペースにグループ化し、アクセス制御に使用されます。Elasticsearch と ClickHouse はスキーマを持ちませんが、両者は役割と RBAC を介して行およびテーブルレベルのセキュリティをサポートしています。 |
| **クラスター** | **クラスター / データベース** | Elasticsearch クラスターは一つまたは複数のインデックスを管理するランタイムインスタンスです。ClickHouse ではデータベースがテーブルを論理ネームスペース内で整理し、Elasticsearch におけるクラスターと同じ論理的グルーピングを提供します。ClickHouse クラスターは分散ノードのセットであり、Elasticsearch と似ていますが、データ自体からは切り離されています。 |

### データモデリングと柔軟性 {#data-modeling-and-flexibility}

Elasticsearch は [動的マッピング](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping) を通じてスキーマの柔軟性で知られています。フィールドはドキュメントが取り込まれる際に作成され、タイプは自動的に推論されます - スキーマが指定されない限り。ClickHouse はデフォルトで厳格であり、テーブルは明示的なスキーマで定義されますが、[`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant)、および [`JSON`](/integrations/data-formats/json/overview) タイプを介して柔軟性を提供しています。これらは半構造的データの取り込みを可能にし、Elasticsearch と同様に動的カラムの作成とタイプ推論を行います。同様に、[`Map`](/sql-reference/data-types/map) タイプは任意のキーと値のペアを保存することを許可します - ただし、キーと値の両方に対して単一のタイプが強制されます。

ClickHouse の型柔軟性へのアプローチは、より透明で制御されています。Elasticsearch とは異なり、型の競合が取り込みエラーを引き起こす可能性があるのに対し、ClickHouse は [`Variant`](/sql-reference/data-types/variant) カラム内に混合型データを許容し、[`JSON`](/integrations/data-formats/json/overview) タイプを使用することでスキーマの進化をサポートします。

[`JSON`](/integrations/data-formats/json/overview) を使用していない場合、スキーマは静的に定義されます。行のために値が提供されていない場合、それらは [`Nullable`](/sql-reference/data-types/nullable)（ClickStack では使用されません）として定義されるか、例えば `String` の空値のようにタイプのデフォルト値に戻ります。

### 取り込みと変換 {#ingestion-and-transformation}

Elasticsearch は、取り込みの前にドキュメントを変換するためにプロセッサを持つ取り込みパイプラインを使用します（例：`enrich`、`rename`、`grok`）。ClickHouse では、[**増分マテリアライズドビュー**](/materialized-view/incremental-materialized-view)を使って同様の機能を実現し、受信データをフィルタリング、変換、または [強化](/materialized-view/incremental-materialized-view#lookup-table)してターゲットテーブルに結果を挿入できます。また、マテリアライズドビューの出力だけを保存するために `Null` テーブルエンジンにデータを挿入することもできます。これにより、マテリアライズドビューの結果のみが保存され、元のデータは破棄されるため、ストレージスペースが節約されます。

強化について、Elasticsearch はドキュメントにコンテキストを追加するための専用の [強化プロセッサ](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor)をサポートしています。ClickHouse では [**辞書**](/dictionary) を使用して行を強化でき、例えば [IP を場所にマッピングする](/use-cases/observability/schema-design#using-ip-dictionaries)や挿入時に [ユーザーエージェントのルックアップ](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing) を適用できます。

### クエリ言語 {#query-languages}

Elasticsearch は、[DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql)、および [KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql) を含む [複数のクエリ言語](https://www.elastic.co/docs/explore-analyze/query-filter/languages)をサポートしていますが、結合のサポートは限られており、**左外部結合**のみが [`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join) を介して利用可能です。ClickHouse は **完全な SQL 構文**をサポートしており、[すべての結合タイプ](/sql-reference/statements/select/join#supported-types-of-join)、[ウィンドウ関数](/sql-reference/window-functions)、サブクエリ（および関連サブクエリ）、CTE を含みます。これは、観測信号とビジネスまたはインフラストラクチャデータとを相関させる必要があるユーザーにとって大きな利点です。

ClickStack では、[HyperDX は Lucene 対応の検索インターフェース](/use-cases/observability/clickstack/search)を提供し、ClickHouse バックエンドを介して完全な SQL サポートを追加します。この構文は [Elastic クエリ文字列](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 構文と比較可能です。この構文の正確な比較については、["ClickStack と Elastic の検索"](/use-cases/observability/clickstack/migration/elastic/search)を参照してください。

### ファイルフォーマットとインターフェース {#file-formats-and-interfaces}

Elasticsearch は JSON（および [制限された CSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor)）の取り込みをサポートしています。ClickHouse は、Parquet、Protobuf、Arrow、CSV など **70 以上のファイルフォーマット**をサポートしており、取り込みとエクスポートの両方に利用可能です。これにより、外部パイプラインやツールとの統合が容易になります。

両方のシステムは REST API を提供していますが、ClickHouse は **低遅延、高スループットのインタラクションのためのネイティブプロトコルも提供**しています。ネイティブインターフェースは、クエリの進捗、圧縮、およびストリーミングを HTTP よりも効率的にサポートし、大部分の本番環境での取り込みのデフォルトです。

### インデクシングとストレージ {#indexing-and-storage}

<Image img={elasticsearch} alt="Elasticsearch" size="lg"/>

シャーディングの概念は、Elasticsearch のスケーラビリティモデルにおいて基本的なものです。各 ① [**インデックス**](https://www.elastic.co/blog/what-is-an-elasticsearch-index) は **シャード** に分割されます。各シャードは物理的な Lucene インデックスであり、ディスク上のセグメントとして保存されます。シャードはリジリエンスのために「レプリカシャード」と呼ばれる一つ以上の物理コピーを持つことができます。スケーラビリティのために、シャードとレプリカは複数のノードに分散されます。単一のシャード ② は、一つ以上の不変セグメントからなります。セグメントは、Elasticsearch が基づいているインデクシングおよび検索機能を提供する Java ライブラリである Lucene の基本的なインデクシング構造です。

:::note Elasticsearch における挿入処理
Ⓐ 新たに挿入されたドキュメント Ⓑ は、デフォルトで一秒ごとにフラッシュされるメモリ内のインデクシングバッファに最初に入ります。ルーティングの式がフラッシュされたドキュメントのターゲットシャードを特定するために使用され、ディスク上のシャードのために新しいセグメントが書き込まれます。クエリ効率を改善し、削除または更新されたドキュメントの物理的削除を可能にするために、セグメントはバックグラウンドで引き続き大きなセグメントにマージされ、最大サイズ 5 GB に達するまで続けられます。ただし、より大きなセグメントへのマージを強制することも可能です。
:::

Elasticsearch は、[50 GB または 2 億ドキュメント](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards) までシャードのサイズを推奨しています。この制限は、[JVM ヒープおよびメタデータのオーバーヘッド](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead) のためです。また、[2 億ドキュメント/シャードのハードリミット](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit) も存在します。Elasticsearch はシャードを跨いでクエリを並列化しますが、各シャードは **単一スレッド**で処理されるため、過剰シャーディングはコストが高くなり、逆効果になります。これは本質的に、シャーディングをスケーリングに強く結びつけ、高いパフォーマンスを実現するためにより多くのシャード（およびノード）が必要です。

Elasticsearch はすべてのフィールドを高速検索のために [**反転インデックス**](https://www.elastic.co/docs/manage-data/data-store/index-basics) にインデックスし、オプションで [**ドキュメント値**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values) を使用して集約、ソート、スクリプトフィールドへのアクセスを行います。数値および地理情報フィールドは、[Block K-D ツリー](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf) を使用して地理空間データおよび数値および日付範囲の検索を行います。 

重要なことに、Elasticsearch は元のドキュメント全体を [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field) に保存し（`LZ4`、`Deflate`、または `ZSTD` で圧縮）、ClickHouse は別のドキュメント表現を保持していません。データはクエリ時間にカラムから再構築され、ストレージスペースを節約します。これは、いくつかの [制限](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions) のある [合成 `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source) を使用して Elasticsearch でも可能です。 `_source` の無効化は、ClickHouse には当てはまらない [影響](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude) があります。

Elasticsearch では、[インデックス マッピング](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)（ClickHouse のテーブルスキーマに相当）がフィールドのタイプとこの永続性およびクエリーに使用されるデータ構造を制御します。

対照的に、ClickHouse は **列指向**であり、すべてのカラムは独立して保存されますが、常にテーブルの主キーまたは順序キーでソートされます。この順序は、ClickHouse がクエリ実行中にデータを効率的にスキップできる [スパースプライマリインデックス](/primary-indexes) を可能にします。クエリがプライマリキー フィールドでフィルタリングされると、ClickHouse は各カラムの関連部分のみを読み取り、ディスク I/O を大幅に削減し、パフォーマンスを向上させます - すべてのカラムにフルインデックスがなくてもです。

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse はまた、選択されたカラムのためにインデックスデータを事前計算してフィルタリングを加速する [**スキップインデックス**](/optimize/skipping-indexes) をサポートします。これらは明示的に定義する必要がありますが、パフォーマンスを大幅に改善できます。さらに、ClickHouse はカラムごとに [圧縮コーデック](/use-cases/observability/schema-design#using-codecs) と圧縮アルゴリズムを指定できるため、Elasticsearch ではサポートされていません（Elasticsearch の [圧縮](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) は `_source` の JSON ストレージのみに適用されます）。

ClickHouse もシャーディングをサポートしていますが、そのモデルは **垂直スケーリング**を重視するように設計されています。単一のシャードは **兆単位の行**を保存でき、メモリ、CPU、ディスクが許す限り効率的に動作し続けます。Elasticsearch とは異なり、シャードあたりの **ハード行制限はありません**。ClickHouse のシャードは論理的であり、実際には個別のテーブルであり、データセットが単一ノードの容量を超えない限りパーティショニングは必要ありません。これは通常、ディスクサイズの制約により発生し、シャーディングは ① 水平スケールアウトが必要な場合にのみ導入され - 複雑さとオーバーヘッドを軽減します。この場合、Elasticsearch と同様に、シャードはのデータのサブセットを保持します。単一のシャード内のデータは、いくつかのデータ構造を含む ③ 不変のデータパーツのコレクションとして整理されます。

ClickHouse のシャード内での処理は **完全に並列化**されており、ユーザーはノード間でデータを移動する際のネットワークコストを回避するために垂直にスケールすることを推奨しています。

:::note ClickHouse における挿入処理
ClickHouse では、挿入が **デフォルトで同期的**です - コミット後にのみ書き込みが確認されます - しかし、Elastic のようなバッファリングとバッチ処理に合わせるために **非同期挿入** に設定することができます。[非同期データ挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を使用する場合、Ⓐ 新しく挿入された行は最初にⒷ メモリ内の挿入バッファに入ります。これはデフォルトで 200 ミリ秒ごとにフラッシュされます。複数のシャードを使用する場合、[分散テーブル](/engines/table-engines/special/distributed) が新しく挿入された行をターゲットシャードにルーティングします。シャードのディスクに新しいパートが書き込まれます。
:::

### 分配とレプリケーション {#distribution-and-replication}

Elasticsearch と ClickHouse は、スケーラビリティとフォールトトレランスを確保するためにクラスター、シャード、レプリカを使用しますが、それぞれのモデルは実装と性能特性において大きく異なります。

Elasticsearch はレプリケーションのため **プライマリ-セカンダリ** モデルを使用します。データがプライマリシャードに書き込まれると、それは同期的に一つ以上のレプリカにコピーされます。これらのレプリカは、冗長性を確保するためにノード間で分散された完全なシャードです。Elasticsearch はすべての必要なレプリカが操作を確認した後のみ書き込みを確認します - このモデルはほぼ **逐次的整合性**を提供しますが、レプリカからの **ダーティリード** は完全な同期の前に発生する可能性があります。**マスターノード**はクラスターを調整し、シャードの割り当て、健康、およびリーダー選出を管理します。

それに対し、ClickHouse は **最終整合性** をデフォルトで採用しており、**Keeper** によって調整されます - ZooKeeper の軽量な代替です。書き込みは、直接または [**分散テーブル**](/engines/table-engines/special/distributed) を介して任意のレプリカに送信できます。このテーブルは自動的にレプリカを選択します。レプリケーションは非同期であり、書き込みが確認された後に変更が他のレプリカに伝播されます。厳格な保証を求める場合、ClickHouse はレプリカ間にコミットされた後にのみ書き込みを確認する [**逐次整合性**](/migrations/postgresql/appendix#sequential-consistency)をサポートしていますが、そのパフォーマンスへの影響からこのモードはほとんど使用されません。分散テーブルは、複数のシャードにまたがるアクセスを統一し、すべてのシャードに `SELECT` クエリを転送し、結果をマージします。`INSERT` 操作では、データを均等にシャードにルーティングすることによって負荷が均等に分配されます。ClickHouse のレプリケーションは非常に柔軟であり、任意のレプリカ（シャードのコピー）が書き込みを受け入れることができ、すべての変更は非同期的に他に同期されます。このアーキテクチャにより、障害や保守中でもクエリの提供が中断されることはなく、再同期は自動的に処理され、データ層でのプライマリ-セカンダリの強制が不要です。

:::note ClickHouse Cloud
**ClickHouse Cloud** では、アーキテクチャが複数のノードによって同時に読み書きされる単一の **シャードがオブジェクトストレージによってバックアップされる** という共有ナッシングコンピュートモデルを導入しています。これにより、従来のレプリカベースの高可用性が置き換えられ、シャードは複数のノードから同時に読み取られ、書き込まれます。ストレージとコンピュートの分離により、明示的なレプリカ管理を行わずに弾力的なスケーリングを可能にします。
:::

まとめると：

- **Elastic**：シャードは JVM メモリに結びついた物理的な Lucene 構造です。過剰シャーディングはパフォーマンスに罰金を課します。レプリケーションは同期的で、マスターノードによって調整されます。
- **ClickHouse**：シャードは論理的で垂直にスケーラブルであり、非常に効率的なローカル実行を持ちます。レプリケーションは非同期（ただし逐次的にすることも可能）であり、調整は軽量です。

最終的に、ClickHouse はシャードのチューニングの必要を最小限に抑えつつ、大規模にシンプルさとパフォーマンスを重視していますが、必要に応じて強い整合性保証を提供します。

### 重複排除とルーティング {#deduplication-and-routing}

Elasticsearch は、文書の `_id` に基づいてドキュメントを重複排除し、それに応じてシャードにルーティングします。ClickHouse はデフォルトの行識別子を保存しませんが、**挿入時の重複排除**をサポートし、ユーザーが失敗した挿入を安全に再試行できるようにします。より詳細な制御を求める場合、`ReplacingMergeTree` や他のテーブルエンジンが特定のカラムによる重複排除を可能にします。

Elasticsearch におけるインデックスルーティングは、特定のドキュメントが常に特定のシャードにルーティングされることを保証します。ClickHouse では、ユーザーが **シャードキー** を定義したり、 `Distributed` テーブルを使用して類似のデータローカリティを達成することができます。

### 集約と実行モデル {#aggregations-execution-model}

両方のシステムはデータの集約をサポートしていますが、ClickHouse は significativamente [より多くの関数](/sql-reference/aggregate-functions/reference)を提供しています。これは、統計的、近似的、および専門的な分析関数を含みます。

観測のユースケースにおいて、集約の最も一般的な用途の一つは、特定のログメッセージやイベントがどれだけ頻繁に発生するかをカウントすることです（頻度が異常な場合にはアラートを出す）。

ClickHouse の `SELECT count(*) FROM ... GROUP BY ...` SQL クエリに相当する Elasticsearch の集約は、[terms aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html) であり、これは Elasticsearch の [bucket aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html) です。

ClickHouse の `GROUP BY` と `count(*)` も、Elasticsearch の terms aggregation も機能上は等価ですが、実装、パフォーマンス、および結果の質は大きく異なります。

この集約は、Elasticsearch では [複数のシャードにわたる "top-N" クエリ](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error) で結果を推定します（例：カウントによる上位 10 ホスト），これにより取得速度が向上しますが、正確性が損なわれる可能性があります。ユーザーは `doc_count_error_upper_bound` を [確認する](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error) ことでこのエラーを減らし、`shard_size` パラメータを増やすことができますが、メモリ使用量が増加し、クエリパフォーマンスが低下します。

Elasticsearch では、すべてのバケット集約のために [`size` 設定](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size) が要求されます - 限度を明示的に設定しない限り、すべてのユニークなグループを返す方法はありません。高カーディナリティの集約は [`max_buckets` 制限](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets) に達するリスクがあるか、[composite aggregation](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation) でページ付けを行う必要があり、これはしばしば複雑で非効率的です。

これに対して、ClickHouse は、標準で正確な集約を行います。`count(*)` のような関数は、設定変更なしで正確な結果を返し、クエリの動作をシンプルで予測可能にします。

ClickHouse にはサイズ制限がありません。大規模なデータセットに対して無制限の group-by クエリを実行できます。メモリの上限を超えた場合、ClickHouse は [ディスクにスピル](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory) できます。プライマリキーのプレフィックスに従った集約は特に効率的であり、最小限のメモリ消費で実行されることが多いです。

#### 実行モデル {#execution-model}

これらの違いは、Elasticsearch と ClickHouse の実行モデルの根本的なアプローチの違いに起因しています。ClickHouse は、最新のハードウェア上での効率を最大化するように設計されています。デフォルトで ClickHouse は、N CPU コアを持つマシン上で N 同時実行レーンで SQL クエリを実行します：

<Image img={clickhouse_execution} alt="ClickHouse execution" size="lg"/>

単一ノード上では、実行レーンはデータを独立した範囲に分割し、CPU スレッド間で同時処理を可能にします。これはフィルタリング、集約、およびソートを含みます。各レーンからのローカル結果は最終的にマージされ、クエリが制限句を持っている場合、制限オペレーターが適用されます。

クエリ実行はさらに次の方法で並列化されます：
1. **SIMD ベクトル化**：列指向データに対する操作は、[CPU SIMD 命令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)（例： [AVX512](https://en.wikipedia.org/wiki/AVX-512)）を使用し、値のバッチ処理を可能にします。
2. **クラスター全体の並列性**：分散セットアップでは、各ノードがローカルでクエリ処理を行います。[部分的な集約状態](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states)は開始ノードにストリーミングされてマージされます。クエリの `GROUP BY` キーがシャーディングキーと一致する場合、マージを [最小限にしたり完全に回避したりすることができます](/operations/settings/settings#distributed_group_by_no_merge).
<br/>
このモデルにより、コアやノードを跨いで効果的にスケーリングが可能となり、ClickHouse は大規模な分析に適しています。*部分的集約状態* の使用により、異なるスレッドとノードからの中間結果を、正確性を失うことなくマージできます。

一方、Elasticsearch は、大部分の集約に対して各シャードに1つのスレッドを割り当て、利用可能な CPU コアの数にかかわらず実行します。これらのスレッドはシャードローカルで上位 N 結果を返し、調整ノードでマージされます。このアプローチはシステムのリソースをうまく活用できず、特に頻繁な用語が複数のシャードに分散される場合に、グローバル集約の潜在的な不正確性を導入する可能性があります。精度は `shard_size` パラメータを増やすことで改善できますが、その代償としてメモリ使用量が増加し、クエリの待機時間が延びます。

<Image img={elasticsearch_execution} alt="Elasticsearch execution" size="lg"/>

要約すると、ClickHouse は集約やクエリをより微細な並列性とハードウェアリソースに対する大きな制御を持って実行しますが、Elasticsearch はより厳格な制約の下でシャードベースの実行に依存しています。

それぞれの技術における集約のメカニズムについてのさらなる詳細は、ブログ投稿 ["ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations"](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch) をお勧めします。

### データ管理 {#data-management}

Elasticsearch と ClickHouse は、特にデータ保持、ロールオーバー、階層ストレージに関して、時系列観測データの管理において根本的に異なるアプローチを持っています。

#### インデックスライフサイクル管理とネイティブの TTL {#lifecycle-vs-ttl}

Elasticsearch では、長期的なデータ管理は **インデックスライフサイクル管理 (ILM)** と **データストリーム** を通じて処理されます。これにより、ユーザーはインデックスがロールオーバーされるタイミング（特定のサイズまたは年齢に達した後）、古いインデックスが低コストストレージに移動されるタイミング（例：ウィンターやコールドティア）、および最終的に削除されるタイミングを定義するポリシーを作成できます。これは、Elasticsearch が **再シャーディングをサポートしていないため** 必要です。また、シャードは無限に成長することができず、パフォーマンスが劣化します。シャードサイズを管理し効率的な削除をサポートするために、新しいインデックスを定期的に作成し、古いインデックスを削除する必要があります - これは実質的にインデックスレベルでデータをローテーションします。

ClickHouse は異なるアプローチを取ります。データは通常 **単一テーブル** に保存され、カラムまたはパーティションレベルでの **TTL (time-to-live) 式** を使用して管理されます。データは日付で **パーティション分割** され、同じテーブルを作成する必要なく効率的に削除できます。データが経過し TTL 条件を満たすと、ClickHouse は自動的に削除します — ローテーションを管理するために追加のインフラはいりません。

#### ストレージ層とホット-ウォームアーキテクチャ {#storage-tiers}

Elasticsearch は、異なるパフォーマンス特性を持つストレージ層間でデータを移動する **ホット-ウォーム-コールド-フローズン** ストレージアーキテクチャをサポートしています。これは通常，ILM を通じて構成され、クラスター内のノードの役割に関連しています。

ClickHouse は、特定のルールに基づいて古いデータを自動的に異なる **ボリューム**（例：SSD から HDD、オブジェクトストレージへの）間で移動することができるネイティブテーブルエンジン `MergeTree` を介して **階層ストレージ** をサポートしています。これは、Elastic のホット-ウォーム-コールドアプローチを模倣できますが、複数のノード役割やクラスターを管理する複雑さはありません。

:::note ClickHouse Cloud
**ClickHouse Cloud** では、これがさらにシームレスになります：すべてのデータが **オブジェクトストレージ (例：S3)** に保存され、コンピュートはデカップルされています。データはクエリされるまでオブジェクトストレージに留まることができ、その時点で取得されてローカル（または分散キャッシュ）にキャッシュされます - Elastic のフローズンティアと同様のコストプロファイルを持ちながら、より良いパフォーマンス特性を提供します。このアプローチにより、ストレージ層間でデータを移動する必要がなくなり、ホット-ウォームアーキテクチャは冗長になります。
:::

### Rollups vs incremental aggregates {#rollups-vs-incremental-aggregates}

Elasticsearch では、**rollups** または **aggregates** は [**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html) と呼ばれるメカニズムを使用して実現されます。これらは、固定間隔（例：毎時または毎日）で時系列データを要約するために使用され、**スライディングウィンドウ**モデルを活用します。これらは、1つのインデックスからデータを集約し、結果を別の **rollup index** に書き込む定期的なバックグラウンドジョブとして構成されています。これにより、高いカーディナリティを持つ生データの反復スキャンを避けることで、長期にわたるクエリのコストが削減されます。

以下の図は、transforms の動作を抽象的に示しており（同じバケットに属し、集計値を事前計算したいドキュメントにはすべて青色を使用していることに注意してください）： 

<Image img={elasticsearch_transforms} alt="Elasticsearch transforms" size="lg"/>

継続的な transforms は、構成可能なチェック間隔時間に基づいて transform [checkpoints](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html) を使用します（transform [frequency](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html) のデフォルト値は 1 分です）。上記の図では、① チェック間隔時間が経過した後に新しいチェックポイントが作成されると仮定しています。次に Elasticsearch は transforms のソースインデックスの変更をチェックし、前回のチェックポイント以来存在する新しい `blue` ドキュメント（11、12、13）の3つを検出します。したがって、ソースインデックスはすべての既存の `blue` ドキュメントにフィルターされ、[composite aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)（結果の [pagination](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html) を利用する）を使用して、集計値が再計算され（そして、前の集計値を含むドキュメントが置き換えられる形で宛先インデックスが更新されます）、同様に②と③では、新しいチェックポイントが変更をチェックして処理され、同じ 'blue' バケットに属するすべての既存のドキュメントから集計値が再計算されます。

ClickHouse は根本的に異なるアプローチを取ります。定期的にデータを再集計するのではなく、ClickHouse は **incremental materialized views** をサポートしており、データを **挿入時に** 変換および集計します。新しいデータがソーステーブルに書き込まれると、マテリアライズドビュが新しい **挿入ブロック** のみに対して事前定義された SQL 集計クエリを実行し、集約された結果をターゲットテーブルに書き込みます。

このモデルは、ClickHouse の [**partial aggregate states**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction) — 集約関数の中間表現を格納し、後でマージできる仕組み — によって可能になります。これにより、ユーザーはクエリが迅速で更新が安価な部分的に集約された結果を維持できます。データが到着する際に集計が行われるため、高価な定期ジョブを実行したり、古いデータを再要約したりする必要がありません。

私たちは、incremental materialized views のメカニクスを抽象的に示しています（同じグループに属し、集計値を事前計算したい行にはすべて青色を使用していることに注意してください）： 

<Image img={clickhouse_mvs} alt="ClickHouse Materialized Views" size="lg"/>

上記の図では、マテリアライズドビュのソーステーブルには、同じグループに属するいくつかの `blue` 行（1 〜 10）を格納するデータパートがすでに含まれています。このグループに対しては、ビューのターゲットテーブルに `blue` グループの [partial aggregation state](https://www.youtube.com/watch?v=QDAJTKZT8y4) を格納するデータパートもすでに存在します。① ② ③ が新しい行を持つソーステーブルへの挿入を行うと、それぞれの挿入に対応するソーステーブルのデータパートが作成され、並行して（新しく挿入された各ブロックの）部分的な集約状態が計算され、マテリアライズドビューのターゲットテーブルにデータパートとして挿入されます。④ バックグラウンドのパートマージ中に部分的な集約状態がマージされ、結果としてインクリメンタルなデータ集約が行われます。

すべての [aggregate functions](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)（90種類以上）およびそれらの集約関数 [combinators](https://www.youtube.com/watch?v=7ApwD0cfAFI) との組み合わせも、[partial aggregation states](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction) をサポートしていることを覚えておいてください。

Elasticsearch と ClickHouse のインクリメンタルな集約のより具体的な例については、この [example](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example) を参照してください。

ClickHouse のアプローチの利点には以下が含まれます：

- **常に最新の集計**: マテリアライズドビューは常にソーステーブルと同期しています。
- **バックグラウンドジョブ不要**: 集計はクエリ時間ではなく、挿入時間にプッシュされます。
- **リアルタイムパフォーマンスの向上**: スナップショットで新しい集計が即時に必要な観測性ワークロードやリアルタイム分析に最適です。
- **合成可能**: マテリアライズドビューは、より複雑なクエリ加速戦略のために他のビューやテーブルと重ねたり結合したりできます。
- **異なる TTL**: マテリアライズドビューのソーステーブルとターゲットテーブルに異なる TTL 設定を適用できます。

このモデルは、ユーザーがクエリごとに数十億の生のレコードをスキャンすることなく、分単位のエラーレート、遅延、またはトップNの内訳といったメトリックを計算する必要がある観測性ユースケースに特に強力です。

### Lakehouse support {#lakehouse-support}

ClickHouse と Elasticsearch は、レイクハウス統合に根本的に異なるアプローチを取っています。ClickHouse は、[Iceberg](/sql-reference/table-functions/iceberg) や [Delta Lake](/sql-reference/table-functions/deltalake) のようなレイクハウス形式に対してクエリを実行できる完全なクエリ実行エンジンであり、[AWS Glue](/use-cases/data-lake/glue-catalog) や [Unity catalog](/use-cases/data-lake/unity-catalog) のようなデータレイクカタログとも統合されています。これらの形式は、ClickHouse が完全にサポートする [Parquet](/interfaces/formats/Parquet) ファイルの効率的なクエリに依存しています。ClickHouse は Iceberg および Delta Lake テーブルを直接読み取ることができ、最新のデータレイクアーキテクチャとのシームレスな統合を可能にします。

対照的に、Elasticsearch は内部データ形式と Lucene ベースのストレージエンジンに密接に結合されています。そのため、レイクハウス形式や Parquet ファイルを直接クエリすることはできず、最新のデータレイクアーキテクチャに参加する能力が制限されています。Elasticsearch は、独自の形式に変換し、ロードされたデータをクエリ可能にする必要があります。

ClickHouse のレイクハウス機能は、データの読み取りを超えています：

- **データカタログ統合**: ClickHouse は [AWS Glue](/use-cases/data-lake/glue-catalog) のようなデータカタログとの統合をサポートしており、オブジェクトストレージ内のテーブルへの自動発見とアクセスを可能にします。
- **オブジェクトストレージのサポート**: データの移動を必要とせずに、[S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs)、および [Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage) にあるデータをクエリするためのネイティブサポート。
- **クエリ連携**: レイクハウステーブル、従来のデータベース、および ClickHouse テーブルを [external dictionaries](/dictionary) および [table functions](/sql-reference/table-functions) を使用して、複数のソース間でデータを相関させる能力。
- **インクリメンタルローディング**: [MergeTree](/engines/table-engines/mergetree-family/mergetree) テーブルへのレイクハウステーブルからの連続ローディングをサポートし、[S3Queue](/engines/table-engines/integrations/s3queue) および [ClickPipes](/integrations/clickpipes) のような機能を使用。
- **パフォーマンス最適化**: レイクハウスデータに対する分散クエリ実行を [cluster functions](/sql-reference/table-functions/cluster) を使用して行うことで、パフォーマンスを向上。

これらの機能により、ClickHouse はレイクハウスアーキテクチャを採用する組織にとって自然な選択となり、データレイクの柔軟性と列指向データベースのパフォーマンスとの両方を活用することができます。
