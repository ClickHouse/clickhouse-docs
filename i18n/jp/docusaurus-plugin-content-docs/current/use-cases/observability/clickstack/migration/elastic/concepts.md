---
slug: /use-cases/observability/clickstack/migration/elastic/concepts
title: 'ClickStack と Elastic における対応する概念'
pagination_prev: null
pagination_next: null
sidebar_label: '対応する概念'
sidebar_position: 1
description: '対応する概念 - ClickStack と Elastic'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import elasticsearch from '@site/static/images/use-cases/observability/elasticsearch.png';
import clickhouse from '@site/static/images/use-cases/observability/clickhouse.png';
import clickhouse_execution from '@site/static/images/use-cases/observability/clickhouse-execution.png';
import elasticsearch_execution from '@site/static/images/use-cases/observability/elasticsearch-execution.png';
import elasticsearch_transforms from '@site/static/images/use-cases/observability/es-transforms.png';
import clickhouse_mvs from '@site/static/images/use-cases/observability/ch-mvs.png';


## Elastic Stack vs ClickStack {#elastic-vs-clickstack}

Elastic StackとClickStackはどちらもオブザーバビリティプラットフォームの中核的な役割をカバーしていますが、それぞれ異なる設計思想でこれらの役割にアプローチしています。これらの役割には以下が含まれます:

- **UIとアラート**: データのクエリ、ダッシュボードの構築、アラートの管理を行うツール。
- **ストレージとクエリエンジン**: オブザーバビリティデータの保存と分析クエリの実行を担当するバックエンドシステム。
- **データ収集とETL**: テレメトリデータを収集し、取り込み前に処理するエージェントとパイプライン。

以下の表は、各スタックがこれらの役割にコンポーネントをどのようにマッピングしているかを示しています:

| **役割**                    | **Elastic Stack**                                           | **ClickStack**                                                   | **コメント**                                                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UIとアラート**           | **Kibana** — ダッシュボード、検索、アラート                 | **HyperDX** — リアルタイムUI、検索、アラート                   | どちらもビジュアライゼーションやアラート管理を含む、ユーザーの主要なインターフェースとして機能します。HyperDXはオブザーバビリティ専用に構築され、OpenTelemetryのセマンティクスと密接に統合されています。                          |
| **ストレージとクエリエンジン**  | **Elasticsearch** — 転置インデックスを持つJSONドキュメントストア | **ClickHouse** — ベクトル化エンジンを持つカラム指向データベース | Elasticsearchは検索に最適化された転置インデックスを使用します。ClickHouseは構造化データおよび半構造化データに対する高速分析のために、カラムナストレージとSQLを使用します。                                            |
| **データ収集**         | **Elastic Agent**、**Beats** (例: Filebeat、Metricbeat)    | **OpenTelemetry Collector** (エッジ + ゲートウェイ)                     | Elasticはカスタムシッパーと、Fleetで管理される統合エージェントをサポートしています。ClickStackはOpenTelemetryに依存し、ベンダー中立的なデータ収集と処理を可能にします。                                                |
| **計装SDK**    | **Elastic APMエージェント** (プロプライエタリ)                        | **OpenTelemetry SDK** (ClickStackによって配布)               | Elastic SDKはElasticスタックに紐付いています。ClickStackは主要言語でのログ、メトリクス、トレースのためにOpenTelemetry SDKを基盤としています。                                                                             |
| **ETL / データ処理**   | **Logstash**、インジェストパイプライン                              | **OpenTelemetry Collector** + ClickHouseマテリアライズドビュー      | Elasticは変換のためにインジェストパイプラインとLogstashを使用します。ClickStackはマテリアライズドビューとOTel Collectorプロセッサーを介して挿入時に計算処理を実行し、データを効率的かつ段階的に変換します。 |
| **アーキテクチャ思想** | 垂直統合型、プロプライエタリなエージェントとフォーマット       | オープン標準ベース、疎結合なコンポーネント                  | Elasticは緊密に統合されたエコシステムを構築しています。ClickStackは柔軟性とコスト効率のために、モジュール性と標準(OpenTelemetry、SQL、オブジェクトストレージ)を重視しています。                                           |

ClickStackはオープン標準と相互運用性を重視し、収集からUIまで完全にOpenTelemetryネイティブです。対照的に、Elasticはプロプライエタリなエージェントとフォーマットを持つ、緊密に結合されたより垂直統合型のエコシステムを提供しています。

**Elasticsearch**と**ClickHouse**はそれぞれのスタックにおいてデータストレージ、処理、クエリを担当する中核エンジンであるため、両者の違いを理解することが不可欠です。これらのシステムは、オブザーバビリティアーキテクチャ全体のパフォーマンス、スケーラビリティ、柔軟性を支えています。次のセクションでは、ElasticsearchとClickHouseの主要な違い(データのモデル化、取り込み処理、クエリ実行、ストレージ管理の方法を含む)について説明します。


## ElasticsearchとClickHouseの比較 {#elasticsearch-vs-clickhouse}

ClickHouseとElasticsearchは異なる基盤モデルを使用してデータを整理およびクエリしますが、多くのコア概念は類似した目的を果たします。このセクションでは、Elasticに精通しているユーザー向けに、主要な対応関係を概説し、ClickHouseの対応する概念にマッピングします。用語は異なりますが、ほとんどのオブザーバビリティワークフローはClickStackで再現可能であり、多くの場合より効率的に実現できます。

### コア構造概念 {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL**   | **説明**                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Field**         | **Column**             | データの基本単位で、特定の型の1つ以上の値を保持します。Elasticsearchのフィールドはプリミティブ型、配列、オブジェクトを格納できます。フィールドは1つの型のみを持つことができます。ClickHouseも配列とオブジェクト（`Tuples`、`Maps`、`Nested`）をサポートし、さらに[`Variant`](/sql-reference/data-types/variant)や[`Dynamic`](/sql-reference/data-types/dynamic)のような動的型もサポートしており、カラムが複数の型を持つことを可能にします。              |
| **Document**      | **Row**                | フィールド(カラム)の集合です。Elasticsearchのドキュメントはデフォルトでより柔軟性があり、データに基づいて新しいフィールドが動的に追加されます(型はデータから推論されます)。ClickHouseの行はデフォルトでスキーマに束縛されており、ユーザーは行のすべてのカラムまたはサブセットを挿入する必要があります。ClickHouseの[`JSON`](/integrations/data-formats/json/overview)型は、挿入されたデータに基づいて同等の半構造化動的カラム作成をサポートします。 |
| **Index**         | **Table**              | クエリ実行とストレージの単位です。両システムにおいて、クエリはインデックスまたはテーブルに対して実行され、これらは行/ドキュメントを格納します。                                                                                                                                                                                                                                                                                                                       |
| _暗黙的_        | Schema (SQL)           | SQLスキーマはテーブルを名前空間にグループ化し、アクセス制御によく使用されます。ElasticsearchとClickHouseにはスキーマがありませんが、両方ともロールとRBACを介して行レベルおよびテーブルレベルのセキュリティをサポートします。                                                                                                                                                                                                                                                                                                                                        |
| **Cluster**       | **Cluster / Database** | Elasticsearchクラスタは1つ以上のインデックスを管理するランタイムインスタンスです。ClickHouseでは、データベースが論理的な名前空間内でテーブルを整理し、Elasticsearchのクラスタと同じ論理的なグループ化を提供します。ClickHouseクラスタはElasticsearchと同様に分散ノードのセットですが、データ自体から分離され独立しています。                                                                                           |

### データモデリングと柔軟性 {#data-modeling-and-flexibility}

Elasticsearchは[動的マッピング](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping)によるスキーマの柔軟性で知られています。ドキュメントが取り込まれる際にフィールドが作成され、スキーマが指定されていない限り型は自動的に推論されます。ClickHouseはデフォルトでより厳格であり、テーブルは明示的なスキーマで定義されますが、[`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant)、[`JSON`](/integrations/data-formats/json/overview)型を通じて柔軟性を提供します。これらにより、Elasticsearchと同様の動的カラム作成と型推論を伴う半構造化データの取り込みが可能になります。同様に、[`Map`](/sql-reference/data-types/map)型は任意のキーと値のペアを格納できますが、キーと値の両方に単一の型が強制されます。

ClickHouseの型柔軟性へのアプローチはより透明性が高く制御されています。型の競合が取り込みエラーを引き起こす可能性があるElasticsearchとは異なり、ClickHouseは[`Variant`](/sql-reference/data-types/variant)カラムで混合型データを許可し、[`JSON`](/integrations/data-formats/json/overview)型の使用を通じてスキーマの進化をサポートします。

[`JSON`](/integrations/data-formats/json/overview)を使用しない場合、スキーマは静的に定義されます。行に値が提供されない場合、[`Nullable`](/sql-reference/data-types/nullable)として定義されるか(ClickStackでは使用されません)、型のデフォルト値(例:`String`の場合は空の値)に戻ります。

### 取り込みと変換 {#ingestion-and-transformation}

Elasticsearchは、インデックス作成前にドキュメントを変換するためにプロセッサ(例:`enrich`、`rename`、`grok`)を持つ取り込みパイプラインを使用します。ClickHouseでは、同様の機能が[**インクリメンタルマテリアライズドビュー**](/materialized-view/incremental-materialized-view)を使用して実現され、受信データを[フィルタリング、変換](/materialized-view/incremental-materialized-view#filtering-and-transformation)、または[エンリッチ](/materialized-view/incremental-materialized-view#lookup-table)し、結果をターゲットテーブルに挿入できます。マテリアライズドビューの出力のみを保存する必要がある場合は、`Null`テーブルエンジンにデータを挿入することもできます。これは、マテリアライズドビューの結果のみが保持され、元のデータは破棄されることを意味し、ストレージスペースを節約します。


エンリッチメントについて、Elasticsearchは専用の[enrich processors](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor)をサポートしており、ドキュメントにコンテキストを追加できます。ClickHouseでは、[**ディクショナリ**](/dictionary)を[クエリ時](/dictionary#query-time-enrichment)と[取り込み時](/dictionary#index-time-enrichment)の両方で使用して行をエンリッチできます。例えば、[IPアドレスを位置情報にマッピング](/use-cases/observability/schema-design#using-ip-dictionaries)したり、挿入時に[ユーザーエージェントの参照](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing)を適用したりできます。

### クエリ言語 {#query-languages}

Elasticsearchは[DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql)、[KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)(Luceneスタイル)クエリを含む[複数のクエリ言語](https://www.elastic.co/docs/explore-analyze/query-filter/languages)をサポートしていますが、結合のサポートは限定的で、[`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join)経由で**左外部結合**のみが利用可能です。ClickHouseは、[すべての結合タイプ](/sql-reference/statements/select/join#supported-types-of-join)、[ウィンドウ関数](/sql-reference/window-functions)、サブクエリ(相関サブクエリを含む)、CTEを含む**完全なSQL構文**をサポートしています。これは、オブザーバビリティシグナルとビジネスデータやインフラストラクチャデータを相関させる必要があるユーザーにとって大きな利点です。

ClickStackでは、[HyperDXがLucene互換の検索インターフェース](/use-cases/observability/clickstack/search)を提供しており、移行を容易にするとともに、ClickHouseバックエンド経由で完全なSQLサポートも提供しています。この構文は[Elasticクエリ文字列](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax)構文に相当します。この構文の詳細な比較については、[「ClickStackとElasticでの検索」](/use-cases/observability/clickstack/migration/elastic/search)を参照してください。

### ファイル形式とインターフェース {#file-formats-and-interfaces}

ElasticsearchはJSON(および[限定的なCSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor))の取り込みをサポートしています。ClickHouseはParquet、Protobuf、Arrow、CSVなどを含む**70以上のファイル形式**をサポートしており、取り込みとエクスポートの両方に対応しています。これにより、外部パイプラインやツールとの統合が容易になります。

両システムともREST APIを提供していますが、ClickHouseは低レイテンシ、高スループットのやり取りのために**ネイティブプロトコル**も提供しています。ネイティブインターフェースは、HTTPよりも効率的にクエリの進行状況、圧縮、ストリーミングをサポートし、ほとんどの本番環境での取り込みにおいてデフォルトとなっています。

### インデックス作成とストレージ {#indexing-and-storage}

<Image img={elasticsearch} alt='Elasticsearch' size='lg' />

シャーディングの概念はElasticsearchのスケーラビリティモデルの基本です。各①[**インデックス**](https://www.elastic.co/blog/what-is-an-elasticsearch-index)は**シャード**に分割され、各シャードはディスク上にセグメントとして保存される物理的なLuceneインデックスです。シャードは、耐障害性のためにレプリカシャードと呼ばれる1つ以上の物理コピーを持つことができます。スケーラビリティのために、シャードとレプリカは複数のノードに分散できます。単一のシャード②は1つ以上の不変セグメントで構成されます。セグメントはLuceneの基本的なインデックス構造であり、LuceneはElasticsearchの基盤となるインデックス作成と検索機能を提供するJavaライブラリです。

:::note Elasticsearchでの挿入処理
Ⓐ新しく挿入されたドキュメントⒷは、まずメモリ内のインデックスバッファに入り、デフォルトで1秒に1回フラッシュされます。ルーティング式を使用してフラッシュされたドキュメントのターゲットシャードが決定され、ディスク上のシャードに新しいセグメントが書き込まれます。クエリ効率を向上させ、削除または更新されたドキュメントの物理的な削除を可能にするために、セグメントは最大サイズの5GBに達するまで、バックグラウンドで継続的により大きなセグメントにマージされます。ただし、より大きなセグメントへの強制マージも可能です。
:::


Elasticsearch は、[JVM ヒープとメタデータのオーバーヘッド](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead) により、シャードサイズとしておよそ [50 GB または 2 億ドキュメント](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards) を推奨しています。また、1 シャードあたり [20 億ドキュメントのハードリミット](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit) も存在します。Elasticsearch はクエリをシャードごとに並列実行しますが、各シャードは **単一スレッド** で処理されるため、過度なシャーディングはコストが高く、かえって逆効果になります。これにより、シャーディングとスケーリングが本質的に密結合となり、性能をスケールさせるにはより多くのシャード（およびノード）が必要になります。

Elasticsearch は、高速な検索のためにすべてのフィールドを [**inverted indices**](https://www.elastic.co/docs/manage-data/data-store/index-basics) にインデックスし、必要に応じて集約、ソート、およびスクリプトフィールドアクセスのために [**doc values**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values) を使用します。数値フィールドおよび地理空間フィールドは、地理空間データや数値・日付レンジの検索のために [Block K-D trees](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf) を使用します。 

重要な点として、Elasticsearch は元の完全なドキュメントを [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field) に格納します（`LZ4`、`Deflate` または `ZSTD` で圧縮）。一方で ClickHouse は、これとは別のドキュメント表現を保持しません。データはクエリ時に列データから再構成されるため、ストレージ容量を節約できます。同様の機能は、いくつかの[制約](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)はあるものの、Elasticsearch においても [Synthetic `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source) を利用することで実現可能です。`_source` を無効化することには、ClickHouse には当てはまらない[影響](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude) もあります。

Elasticsearch では、ClickHouse におけるテーブルスキーマに相当する [index mappings](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html) が、フィールドの型や、この永続化とクエリ処理に使用されるデータ構造を制御します。

対照的に、ClickHouse は **カラム指向** です — 各カラムは独立して保存されますが、常にテーブルのプライマリキー／ソートキーで並べ替えられています。この並び順により [疎なプライマリインデックス](/primary-indexes) が可能になり、ClickHouse はクエリ実行時にデータを効率的にスキップできます。クエリがプライマリキーのフィールドでフィルタリングされる場合、ClickHouse は各カラムの関連部分のみを読み取るため、ディスク I/O を大幅に削減し、すべてのカラムに完全なインデックスがなくても性能を向上させます。 

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse は [**skip indexes**](/optimize/skipping-indexes) もサポートしており、選択したカラムに対してインデックスデータを事前計算することでフィルタリングを高速化します。これらは明示的に定義する必要がありますが、性能を大きく改善できます。さらに ClickHouse では、カラムごとに [compression codecs](/use-cases/observability/schema-design#using-codecs) や圧縮アルゴリズムを指定できます — これは Elasticsearch にはない機能であり、Elasticsearch の[圧縮](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) は `_source` の JSON 保存にのみ適用されます。

ClickHouse もシャーディングをサポートしますが、そのモデルは **垂直スケーリング** を優先するように設計されています。単一シャードで **数兆行** を格納でき、メモリ、CPU、ディスクが許す限り効率的に動作し続けます。Elasticsearch と異なり、1 シャードあたりの **行数にハードリミットはありません**。ClickHouse におけるシャードは論理的なもので、実質的には個々のテーブルであり、単一ノードのキャパシティを超えない限り、パーティショニングは不要です。これは通常、ディスク容量の制約が原因で発生し、水平方向のスケールアウトが必要になったときにのみ ① シャーディングが導入されます — これにより複雑さとオーバーヘッドが軽減されます。この場合、Elasticsearch と同様に、シャードはデータのサブセットを保持します。単一シャード内のデータは、② 不変な data parts の集合として構成されており、その内部には ③ 複数のデータ構造が含まれます。

ClickHouse のシャード内での処理は **完全に並列化** されており、ノード間のデータ移動に伴うネットワークコストを回避するために、ユーザーには垂直スケーリングを推奨しています。 



:::note ClickHouseにおける挿入処理
ClickHouseの挿入は**デフォルトで同期的**です。書き込みはコミット後にのみ確認されますが、Elasticのようなバッファリングとバッチ処理に対応するため**非同期挿入**を設定することもできます。[非同期データ挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を使用する場合、Ⓐ新しく挿入された行はまずⒷインメモリ挿入バッファに格納され、デフォルトでは200ミリ秒ごとにフラッシュされます。複数のシャードを使用する場合、[分散テーブル](/engines/table-engines/special/distributed)を使用して、新しく挿入された行を対象シャードにルーティングします。シャード用の新しいパートがディスクに書き込まれます。
:::

### 分散とレプリケーション {#distribution-and-replication}

ElasticsearchとClickHouseはどちらもクラスタ、シャード、レプリカを使用してスケーラビリティと耐障害性を確保していますが、実装とパフォーマンス特性においてそのモデルは大きく異なります。

Elasticsearchはレプリケーションに**プライマリ-セカンダリ**モデルを使用します。データがプライマリシャードに書き込まれると、1つ以上のレプリカに同期的にコピーされます。これらのレプリカ自体が完全なシャードであり、冗長性を確保するためにノード間に分散されます。Elasticsearchは、必要なすべてのレプリカが操作を確認した後にのみ書き込みを確認します。これは**順次一貫性**に近いモデルを提供しますが、完全な同期前にレプリカからの**ダーティリード**が発生する可能性があります。**マスターノード**がクラスタを調整し、シャード割り当て、ヘルス、リーダー選出を管理します。

対照的に、ClickHouseはデフォルトで**結果整合性**を採用しており、ZooKeeperの軽量な代替である**Keeper**によって調整されます。書き込みは任意のレプリカに直接送信するか、[**分散テーブル**](/engines/table-engines/special/distributed)経由で送信でき、分散テーブルは自動的にレプリカを選択します。レプリケーションは非同期です。書き込みが確認された後、変更が他のレプリカに伝播されます。より厳格な保証が必要な場合、ClickHouseは[**順次一貫性**をサポート](/migrations/postgresql/appendix#sequential-consistency)しており、レプリカ全体でコミットされた後にのみ書き込みが確認されますが、このモードはパフォーマンスへの影響により、ほとんど使用されません。分散テーブルは複数のシャードへのアクセスを統合し、`SELECT`クエリをすべてのシャードに転送して結果をマージします。`INSERT`操作では、シャード間でデータを均等にルーティングすることで負荷を分散します。ClickHouseのレプリケーションは非常に柔軟です。任意のレプリカ(シャードのコピー)が書き込みを受け入れることができ、すべての変更は他のレプリカに非同期で同期されます。このアーキテクチャにより、障害やメンテナンス中でもクエリ処理を中断することなく継続でき、再同期は自動的に処理されます。これにより、データレイヤーでのプライマリ-セカンダリの強制が不要になります。

:::note ClickHouse Cloud
**ClickHouse Cloud**では、アーキテクチャがシェアードナッシング計算モデルを導入しており、単一の**シャードがオブジェクトストレージによって支えられています**。これにより、従来のレプリカベースの高可用性が置き換えられ、シャードを**複数のノードで同時に読み書き**できるようになります。ストレージとコンピュートの分離により、明示的なレプリカ管理なしに弾力的なスケーリングが可能になります。
:::

まとめると:

- **Elastic**: シャードはJVMメモリに紐付けられた物理的なLucene構造です。過度なシャーディングはパフォーマンスペナルティを引き起こします。レプリケーションは同期的であり、マスターノードによって調整されます。
- **ClickHouse**: シャードは論理的で垂直方向にスケーラブルであり、非常に効率的なローカル実行を備えています。レプリケーションは非同期(ただし順次にすることも可能)であり、調整は軽量です。

最終的に、ClickHouseはシャードチューニングの必要性を最小限に抑えながら、必要に応じて強力な一貫性保証を提供することで、大規模環境におけるシンプルさとパフォーマンスを重視しています。

### 重複排除とルーティング {#deduplication-and-routing}

Elasticsearchはドキュメントを`_id`に基づいて重複排除し、それに応じてシャードにルーティングします。ClickHouseはデフォルトの行識別子を保存しませんが、**挿入時の重複排除**をサポートしており、ユーザーは失敗した挿入を安全に再試行できます。より細かい制御が必要な場合、`ReplacingMergeTree`やその他のテーブルエンジンにより、特定のカラムによる重複排除が可能になります。

Elasticsearchのインデックスルーティングは、特定のドキュメントが常に特定のシャードにルーティングされることを保証します。ClickHouseでは、ユーザーが**シャードキー**を定義するか、`Distributed`テーブルを使用して同様のデータ局所性を実現できます。

### 集約と実行モデル {#aggregations-execution-model}

両システムともデータの集約をサポートしていますが、ClickHouseは統計、近似、特殊な分析関数を含む、大幅に[多くの関数](/sql-reference/aggregate-functions/reference)を提供しています。

オブザーバビリティのユースケースでは、集約の最も一般的な用途の1つは、特定のログメッセージやイベントがどのくらいの頻度で発生するかをカウントすること(そして頻度が異常な場合にアラートを出すこと)です。

ClickHouseの`SELECT count(*) FROM ... GROUP BY ...` SQLクエリに相当するElasticsearchの機能は[terms集約](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html)であり、これはElasticsearchの[バケット集約](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html)です。

ClickHouseの`count(*)`を伴う`GROUP BY`とElasticsearchのterms集約は、機能的には一般的に同等ですが、実装、パフォーマンス、結果の品質において大きく異なります。


Elasticsearchのこの集約は、クエリ対象のデータが複数のシャードにまたがる場合、["top-N"クエリで結果を推定します](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error)(例:カウント数上位10ホスト)。この推定により速度は向上しますが、精度が損なわれる可能性があります。ユーザーは[`doc_count_error_upper_bound`を確認](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error)し、`shard_size`パラメータを増やすことでこの誤差を減らすことができますが、メモリ使用量の増加とクエリパフォーマンスの低下というトレードオフが伴います。

Elasticsearchはまた、すべてのバケット集約に対して[`size`設定](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)を必要とします。明示的に制限を設定せずにすべての一意のグループを返す方法はありません。高カーディナリティの集約では[`max_buckets`制限](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets)に達するリスクがあるか、[複合集約](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation)によるページネーションが必要になりますが、これはしばしば複雑で非効率的です。

対照的に、ClickHouseは標準で正確な集約を実行します。`count(*)`のような関数は設定の調整を必要とせず正確な結果を返すため、クエリの動作がよりシンプルで予測可能になります。

ClickHouseはサイズ制限を課しません。大規模なデータセットに対して無制限のGROUP BYクエリを実行できます。メモリしきい値を超えた場合、ClickHouseは[ディスクへスピルすることができます](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory)。プライマリキーのプレフィックスでグループ化する集約は特に効率的で、最小限のメモリ消費で実行されることがよくあります。

#### 実行モデル {#execution-model}

上記の違いは、ElasticsearchとClickHouseの実行モデルに起因しており、クエリ実行と並列処理に対して根本的に異なるアプローチを取っています。

ClickHouseは、最新のハードウェアで効率を最大化するように設計されています。デフォルトでは、ClickHouseはN個のCPUコアを持つマシン上で、N個の並行実行レーンでSQLクエリを実行します:

<Image img={clickhouse_execution} alt='ClickHouse execution' size='lg' />

単一ノード上で、実行レーンはデータを独立した範囲に分割し、CPUスレッド間での並行処理を可能にします。これにはフィルタリング、集約、ソートが含まれます。各レーンからのローカル結果は最終的にマージされ、クエリにLIMIT句が含まれている場合はLIMIT演算子が適用されます。

クエリ実行は以下によってさらに並列化されます:

1. **SIMDベクトル化**: カラムナーデータに対する操作は[CPU SIMD命令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)(例:[AVX512](https://en.wikipedia.org/wiki/AVX-512))を使用し、値のバッチ処理を可能にします。
2. **クラスタレベルの並列処理**: 分散セットアップでは、各ノードがローカルでクエリ処理を実行します。[部分集約状態](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states)は開始ノードにストリーミングされ、マージされます。クエリの`GROUP BY`キーがシャーディングキーと一致する場合、マージを[最小化または完全に回避](/operations/settings/settings#distributed_group_by_no_merge)できます。
   <br />
   このモデルにより、コアとノード間での効率的なスケーリングが可能になり、
   ClickHouseは大規模分析に適しています。*部分集約状態*の使用により、
   異なるスレッドやノードからの中間結果を精度を損なうことなく
   マージできます。

対照的に、Elasticsearchは、利用可能なCPUコア数に関係なく、ほとんどの集約でシャードごとに1つのスレッドを割り当てます。これらのスレッドはシャードローカルのtop-N結果を返し、コーディネーティングノードでマージされます。このアプローチはシステムリソースを十分に活用できず、特に頻出する用語が複数のシャードに分散している場合、グローバル集約に潜在的な不正確さをもたらす可能性があります。`shard_size`パラメータを増やすことで精度を向上できますが、メモリ使用量とクエリレイテンシの増加というトレードオフが伴います。

<Image img={elasticsearch_execution} alt='Elasticsearch execution' size='lg' />

要約すると、ClickHouseはより細かい粒度の並列処理とハードウェアリソースに対するより大きな制御で集約とクエリを実行するのに対し、Elasticsearchはより厳格な制約を持つシャードベースの実行に依存しています。

それぞれの技術における集約のメカニズムの詳細については、ブログ記事["ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations"](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)を参照してください。

### データ管理 {#data-management}

ElasticsearchとClickHouseは、時系列オブザーバビリティデータの管理、特にデータ保持、ロールオーバー、階層型ストレージに関して、根本的に異なるアプローチを取っています。


#### インデックスライフサイクル管理 vs ネイティブTTL {#lifecycle-vs-ttl}

Elasticsearchでは、長期的なデータ管理は**インデックスライフサイクル管理(ILM)**と**データストリーム**によって処理されます。これらの機能により、ユーザーはインデックスのロールオーバー時期(例:特定のサイズや経過時間に達した後)、古いインデックスの低コストストレージへの移動時期(例:warmまたはcoldティア)、そして最終的な削除時期を管理するポリシーを定義できます。これが必要な理由は、Elasticsearchが**リシャーディングをサポートしていない**ため、シャードはパフォーマンス低下なしに無制限に成長できないからです。シャードサイズを管理し、効率的な削除をサポートするために、新しいインデックスを定期的に作成し、古いものを削除する必要があります。これは実質的にインデックスレベルでのデータローテーションとなります。

ClickHouseは異なるアプローチを採用しています。データは通常**単一のテーブル**に格納され、カラムまたはパーティションレベルで**TTL(time-to-live)式**を使用して管理されます。データは**日付でパーティション化**でき、新しいテーブルの作成やインデックスのロールオーバーを実行することなく、効率的な削除が可能です。データが古くなりTTL条件を満たすと、ClickHouseは自動的にそれを削除します。ローテーション管理のための追加インフラストラクチャは不要です。

#### ストレージティアとホット-ウォームアーキテクチャ {#storage-tiers}

Elasticsearchは**ホット-ウォーム-コールド-フローズン**ストレージアーキテクチャをサポートしており、異なるパフォーマンス特性を持つストレージティア間でデータが移動されます。これは通常、ILMを通じて設定され、クラスタ内のノードロールに関連付けられます。

ClickHouseは`MergeTree`のようなネイティブテーブルエンジンを通じて**階層型ストレージ**をサポートしており、カスタムルールに基づいて古いデータを異なる**ボリューム**(例:SSDからHDD、オブジェクトストレージへ)間で自動的に移動できます。これはElasticのホット-ウォーム-コールドアプローチを模倣できますが、複数のノードロールやクラスタを管理する複雑さはありません。

:::note ClickHouse Cloud
**ClickHouse Cloud**では、これがさらにシームレスになります。すべてのデータは**オブジェクトストレージ(例:S3)**に格納され、コンピュートは分離されています。データはクエリされるまでオブジェクトストレージに保持され、その時点でローカル(または分散キャッシュ)にフェッチされキャッシュされます。これにより、Elasticのフローズンティアと同じコストプロファイルを提供しながら、より優れたパフォーマンス特性を実現します。このアプローチでは、ストレージティア間でのデータ移動が不要となり、ホット-ウォームアーキテクチャは冗長になります。
:::

### ロールアップ vs 増分集計 {#rollups-vs-incremental-aggregates}

Elasticsearchでは、**ロールアップ**または**集計**は[**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html)と呼ばれるメカニズムを使用して実現されます。これらは**スライディングウィンドウ**モデルを使用して、固定間隔(例:時間単位または日単位)で時系列データを要約するために使用されます。これらは、1つのインデックスからデータを集計し、結果を別の**ロールアップインデックス**に書き込む定期的なバックグラウンドジョブとして設定されます。これにより、高カーディナリティの生データの繰り返しスキャンを回避することで、長期間クエリのコストを削減できます。

次の図は、transformsがどのように機能するかを抽象的に示しています(集計値を事前計算したい同じバケットに属するすべてのドキュメントに青色を使用していることに注意してください):

<Image
  img={elasticsearch_transforms}
  alt='Elasticsearchのtransforms'
  size='lg'
/>

継続的なtransformsは、設定可能なチェック間隔時間(デフォルト値が1分のtransform[頻度](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html))に基づいてtransform[チェックポイント](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html)を使用します。上の図では、①チェック間隔時間が経過した後に新しいチェックポイントが作成されると仮定しています。次にElasticsearchはtransformsのソースインデックスの変更をチェックし、前回のチェックポイント以降に存在する3つの新しい`blue`ドキュメント(11、12、13)を検出します。そのため、ソースインデックスは既存のすべての`blue`ドキュメントでフィルタリングされ、[複合集計](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)(結果の[ページネーション](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)を利用するため)により、集計値が再計算されます(そして、宛先インデックスは以前の集計値を含むドキュメントを置き換えるドキュメントで更新されます)。同様に、②と③では、変更をチェックし、同じ'blue'バケットに属するすべての既存ドキュメントから集計値を再計算することで、新しいチェックポイントが処理されます。

ClickHouseは根本的に異なるアプローチを採用しています。データを定期的に再集計するのではなく、ClickHouseは**増分マテリアライズドビュー**をサポートしており、**挿入時**にデータを変換および集計します。新しいデータがソーステーブルに書き込まれると、マテリアライズドビューは新しく**挿入されたブロック**のみに対して事前定義されたSQL集計クエリを実行し、集計結果をターゲットテーブルに書き込みます。


このモデルは、ClickHouseの[**部分集約状態**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)のサポートによって実現されています。部分集約状態とは、集約関数の中間表現であり、保存して後でマージすることができます。これにより、ユーザーは高速にクエリでき、更新コストの低い部分集約結果を維持できます。データが到着した時点で集約が行われるため、高コストな定期ジョブを実行したり、古いデータを再集計したりする必要がありません。

インクリメンタルマテリアライズドビューの仕組みを抽象的に図示します(集約値を事前計算したい同じグループに属するすべての行を青色で表していることに注意してください):

<Image img={clickhouse_mvs} alt='ClickHouse Materialized Views' size='lg' />

上の図では、マテリアライズドビューのソーステーブルには、同じグループに属する`青`の行(1から10)を格納するデータパートがすでに含まれています。このグループに対して、ビューのターゲットテーブルにも`青`グループの[部分集約状態](https://www.youtube.com/watch?v=QDAJTKZT8y4)を格納するデータパートがすでに存在しています。①②③で新しい行がソーステーブルに挿入されると、各挿入に対応するソーステーブルのデータパートが作成され、並行して、新しく挿入された各行ブロックに対してのみ部分集約状態が計算され、データパートの形式でマテリアライズドビューのターゲットテーブルに挿入されます。④バックグラウンドでのパートマージ中に、部分集約状態がマージされ、インクリメンタルなデータ集約が実現されます。

すべての[集約関数](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)(90種類以上)は、集約関数[コンビネータ](https://www.youtube.com/watch?v=7ApwD0cfAFI)との組み合わせを含め、[部分集約状態](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction)をサポートしていることに注意してください。

インクリメンタル集約におけるElasticsearch対ClickHouseのより具体的な例については、この[例](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example)を参照してください。

ClickHouseのアプローチの利点は以下の通りです:

- **常に最新の集約結果**: マテリアライズドビューは常にソーステーブルと同期しています。
- **バックグラウンドジョブ不要**: 集約はクエリ時ではなく挿入時に実行されます。
- **優れたリアルタイムパフォーマンス**: 最新の集約結果が即座に必要とされる可観測性ワークロードやリアルタイム分析に最適です。
- **組み合わせ可能**: マテリアライズドビューは、より複雑なクエリ高速化戦略のために、他のビューやテーブルと階層化または結合できます。
- **異なるTTL設定**: マテリアライズドビューのソーステーブルとターゲットテーブルに異なるTTL設定を適用できます。

このモデルは、クエリごとに数十億の生レコードをスキャンすることなく、分単位のエラー率、レイテンシ、トップN分析などのメトリクスを計算する必要がある可観測性ユースケースで特に強力です。

### レイクハウスサポート {#lakehouse-support}

ClickHouseとElasticsearchは、レイクハウス統合に対して根本的に異なるアプローチを取っています。ClickHouseは、[Iceberg](/sql-reference/table-functions/iceberg)や[Delta Lake](/sql-reference/table-functions/deltalake)などのレイクハウス形式に対してクエリを実行できる本格的なクエリ実行エンジンであり、[AWS Glue](/use-cases/data-lake/glue-catalog)や[Unity catalog](/use-cases/data-lake/unity-catalog)などのデータレイクカタログとも統合できます。これらの形式は[Parquet](/interfaces/formats/Parquet)ファイルの効率的なクエリに依存しており、ClickHouseはこれを完全にサポートしています。ClickHouseはIcebergとDelta Lakeの両方のテーブルを直接読み取ることができ、最新のデータレイクアーキテクチャとのシームレスな統合を実現します。

対照的に、Elasticsearchは内部データ形式とLuceneベースのストレージエンジンに密結合しています。レイクハウス形式やParquetファイルを直接クエリすることができないため、最新のデータレイクアーキテクチャに参加する能力が制限されています。Elasticsearchでは、クエリを実行する前にデータを独自形式に変換してロードする必要があります。

ClickHouseのレイクハウス機能は、データの読み取りだけにとどまりません:


- **データカタログとの統合**: ClickHouse は [AWS Glue](/use-cases/data-lake/glue-catalog) などのデータカタログとの統合をサポートしており、オブジェクトストレージ内のテーブルを自動検出してアクセスできます。
- **オブジェクトストレージ対応**: [S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs)、[Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage) 上のデータに対して、データを移動することなくネイティブにクエリを実行できます。
- **クエリフェデレーション**: [external dictionaries](/dictionary) や [table functions](/sql-reference/table-functions) を使用して、レイクハウステーブル、従来型データベース、ClickHouse テーブルなど、複数のソースにまたがるデータを関連付けて扱うことができます。
- **増分ロード**: [S3Queue](/engines/table-engines/integrations/s3queue) や [ClickPipes](/integrations/clickpipes) などの機能を利用して、レイクハウステーブルからローカルの [MergeTree](/engines/table-engines/mergetree-family/mergetree) テーブルへ継続的にデータをロードすることをサポートします。
- **パフォーマンス最適化**: [cluster functions](/sql-reference/table-functions/cluster) によるレイクハウスデータに対する分散クエリ実行で、パフォーマンスを向上させます。

これらの機能により、ClickHouse はレイクハウスアーキテクチャを採用する組織にとって自然な選択肢となり、データレイクの柔軟性とカラム型データベースの高い性能の両方を活用できるようになります。 
