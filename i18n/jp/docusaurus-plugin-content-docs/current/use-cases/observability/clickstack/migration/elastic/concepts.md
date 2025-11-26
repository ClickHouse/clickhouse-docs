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


## Elastic Stack と ClickStack {#elastic-vs-clickstack}

Elastic Stack と ClickStack はどちらもオブザーバビリティプラットフォームの中核的な役割をカバーしていますが、その役割に対する設計思想は異なります。これらの役割には次のものが含まれます:

- **UI とアラート**: データのクエリ、ダッシュボードの構築、アラートの管理を行うツール。
- **ストレージとクエリエンジン**: オブザーバビリティデータの保存と分析クエリの提供を担うバックエンドシステム。
- **データ収集と ETL**: テレメトリデータを収集し、インジェスト前に処理するエージェントおよびパイプライン。

以下の表は、それぞれのスタックがこれらの役割にどのようにコンポーネントを対応づけているかを示します:

| **Role** | **Elastic Stack** | **ClickStack** | **Comments** |
|--------------------------|--------------------------------------------------|--------------------------------------------------|--------------|
| **UI & Alerting** | **Kibana** — ダッシュボード、検索、アラート      | **HyperDX** — リアルタイム UI、検索、アラート   | どちらもユーザーに対する主要なインターフェースとして機能し、可視化とアラート管理を提供します。HyperDX はオブザーバビリティ向けに特化しており、OpenTelemetry のセマンティクスと密接に結び付いています。 |
| **Storage & Query Engine** | **Elasticsearch** — 倒立インデックスを用いた JSON ドキュメントストア | **ClickHouse** — ベクトル化エンジンを持つカラム指向データベース | Elasticsearch は検索に最適化された倒立インデックスを使用し、ClickHouse はカラム型ストレージと SQL を用いて構造化データおよび半構造化データに対する高速な分析処理を行います。 |
| **Data Collection** | **Elastic Agent**、**Beats** (例: Filebeat, Metricbeat) | **OpenTelemetry Collector** (edge + gateway)     | Elastic はカスタムシッパーと、Fleet により管理される統合エージェントをサポートします。ClickStack は OpenTelemetry を採用しており、ベンダーニュートラルなデータ収集と処理を可能にします。 |
| **Instrumentation SDKs** | **Elastic APM agents** (プロプライエタリ)             | **OpenTelemetry SDKs** (ClickStack により配布) | Elastic の SDK は Elastic Stack に結び付いています。ClickStack は主要言語でのログ、メトリクス、トレースのために OpenTelemetry SDKs をベースとして構築されています。 |
| **ETL / Data Processing** | **Logstash**、ingest pipelines                   | **OpenTelemetry Collector** + ClickHouse materialized views | Elastic は変換のために ingest パイプラインと Logstash を使用します。ClickStack はマテリアライズドビューと OTel collector の processor により計算を挿入時にシフトし、データを効率的かつ増分的に変換します。 |
| **Architecture Philosophy** | 垂直統合された、プロプライエタリなエージェントとフォーマット | オープン標準に基づく疎結合なコンポーネント   | Elastic は密に統合されたエコシステムを構築しています。ClickStack は柔軟性とコスト効率のために、モジュール性と標準規格 (OpenTelemetry, SQL, オブジェクトストレージ) を重視しています。 |

ClickStack はオープン標準と相互運用性を重視しており、収集から UI まで完全に OpenTelemetry ネイティブな設計です。対照的に、Elastic はプロプライエタリなエージェントとフォーマットを用いた、より垂直統合された密結合のエコシステムを提供します。

**Elasticsearch** と **ClickHouse** は、それぞれのスタックでデータの保存、処理、およびクエリを担う中核エンジンであるため、その違いを理解することは重要です。これらのシステムは、オブザーバビリティアーキテクチャ全体のパフォーマンス、スケーラビリティ、柔軟性を支えています。次のセクションでは、Elasticsearch と ClickHouse の主な違いを掘り下げます。具体的には、データモデル、インジェスト処理、クエリ実行、およびストレージ管理の方法の違いを解説します。



## Elasticsearch vs ClickHouse {#elasticsearch-vs-clickhouse}

ClickHouse と Elasticsearch は、データの構造化およびクエリ実行に異なる内部モデルを採用していますが、多くの中核概念は同様の目的を果たします。このセクションでは、Elastic に慣れたユーザー向けに、主要な概念対応を示し、それらを ClickHouse における同等概念へマッピングします。用語は異なるものの、ほとんどのオブザーバビリティのワークフローは ClickStack 上で再現でき、多くの場合はより効率的に実行できます。

### Core structural concepts {#core-structural-concepts}

| **Elasticsearch** | **ClickHouse / SQL** | **Description** |
|-------------------|----------------------|------------------|
| **Field** | **Column** | データの基本単位であり、特定の型の 1 つ以上の値を保持します。Elasticsearch のフィールドは、プリミティブ型に加えて配列およびオブジェクトも格納できます。フィールドは 1 つの型しか持てません。ClickHouse も配列およびオブジェクト（`Tuples`、`Maps`、`Nested`）に加え、1 つのカラムに複数の型を持たせることができる [`Variant`](/sql-reference/data-types/variant) や [`Dynamic`](/sql-reference/data-types/dynamic) のような動的型をサポートします。 |
| **Document** | **Row** | フィールド（カラム）の集合です。Elasticsearch のドキュメントはデフォルトでより柔軟であり、データに基づいて新しいフィールドが動的に追加されます（型はデータから推論されます）。ClickHouse の行はデフォルトでスキーマに拘束されており、ユーザーは行に対してすべてのカラム、またはそのサブセットを挿入する必要があります。ClickHouse の [`JSON`](/integrations/data-formats/json/overview) 型は、挿入されたデータに基づく同等の半構造化・動的カラム作成をサポートします。 |
| **Index** | **Table** | クエリ実行およびストレージの単位です。両システムとも、クエリは行/ドキュメントを格納するインデックスまたはテーブルに対して実行されます。 |
| *Implicit* | Schema (SQL)         | SQL のスキーマは、テーブルをネームスペースにグループ化し、多くの場合アクセス制御に利用されます。Elasticsearch と ClickHouse はスキーマという概念自体は持ちませんが、どちらもロールと RBAC による行レベルおよびテーブルレベルのセキュリティをサポートしています。 |
| **Cluster** | **Cluster / Database** | Elasticsearch クラスタは、1 つ以上のインデックスを管理するランタイムインスタンスです。ClickHouse では、データベースがテーブルを論理的なネームスペース内に整理し、Elasticsearch におけるクラスタと同じ論理的グルーピングを提供します。ClickHouse クラスタはノードの分散セットであり、Elasticsearch と類似していますが、データ自体とは分離・独立しています。 |

### Data modeling and flexibility {#data-modeling-and-flexibility}

Elasticsearch は、[dynamic mappings](https://www.elastic.co/docs/manage-data/data-store/mapping/dynamic-mapping) によるスキーマの柔軟性で知られています。フィールドはドキュメントが取り込まれる際に作成され、スキーマが明示されていない限り、型は自動的に推論されます。ClickHouse はデフォルトではより厳格であり、テーブルは明示的なスキーマで定義されますが、[`Dynamic`](/sql-reference/data-types/dynamic)、[`Variant`](/sql-reference/data-types/variant)、および [`JSON`](/integrations/data-formats/json/overview) 型によって柔軟性を提供します。これらは半構造化データのインジェストを可能にし、Elasticsearch と同様に動的なカラム作成と型推論を実現します。同様に、[`Map`](/sql-reference/data-types/map) 型は任意のキーと値のペアを格納できますが、キーおよび値の両方に対して単一の型が強制されます。

ClickHouse における型の柔軟性に対するアプローチは、より透明で制御しやすいものです。インジェスト時の型衝突がエラーにつながる Elasticsearch とは異なり、ClickHouse は [`Variant`](/sql-reference/data-types/variant) カラム内での混在型データを許容し、[`JSON`](/integrations/data-formats/json/overview) 型の利用を通じてスキーマの進化をサポートします。

[`JSON`](/integrations/data-formats/json/overview) を使用しない場合、スキーマは静的に定義されます。行に対して値が提供されないカラムは、[`Nullable`](/sql-reference/data-types/nullable)（ClickStack では未使用）として定義されるか、型のデフォルト値、たとえば `String` 型では空文字列にフォールバックします。

### Ingestion and transformation {#ingestion-and-transformation}

Elasticsearch は、インデックス化前にドキュメントを変換するために、`enrich`、`rename`、`grok` などのプロセッサを備えたインジェストパイプラインを使用します。ClickHouse では、同様の機能は [**インクリメンタル マテリアライズドビュー**](/materialized-view/incremental-materialized-view) を用いて実現されます。これにより、入力データを[フィルタや変換](/materialized-view/incremental-materialized-view#filtering-and-transformation)、あるいは[ルックアップによる enrich](/materialized-view/incremental-materialized-view#lookup-table) し、結果をターゲットテーブルに挿入できます。マテリアライズドビューの出力だけを保存したい場合は、`Null` テーブルエンジンにデータを挿入することも可能です。これは、マテリアライズドビューの結果のみが永続化され、元のデータは破棄されることを意味し、その分ストレージ容量を節約できます。



For enrichment, Elasticsearch では専用の [enrich processors](https://www.elastic.co/docs/reference/enrich-processor/enrich-processor) がサポートされており、ドキュメントにコンテキストを追加できます。ClickHouse では、[**dictionaries**](/dictionary) を [クエリ時](/dictionary#query-time-enrichment) と [取り込み時](/dictionary#index-time-enrichment) の両方で使用して行をエンリッチできます。たとえば、[IP をロケーションにマッピングする](/use-cases/observability/schema-design#using-ip-dictionaries) あるいは、挿入時に [user agent のルックアップを適用する](/use-cases/observability/schema-design#using-regex-dictionaries-user-agent-parsing) といった用途です。

### Query languages {#query-languages}

Elasticsearch は [DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)、[ES|QL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/esql)、[EQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/eql)、[KQL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/kql)（Lucene スタイル）のクエリを含む[複数のクエリ言語](https://www.elastic.co/docs/explore-analyze/query-filter/languages)をサポートしていますが、結合のサポートは限定的で、[`ES|QL`](https://www.elastic.co/guide/en/elasticsearch/reference/8.x/esql-commands.html#esql-lookup-join) を通じて利用できるのは **left outer join** のみです。ClickHouse は [あらゆる結合タイプ](/sql-reference/statements/select/join#supported-types-of-join)、[ウィンドウ関数](/sql-reference/window-functions)、サブクエリ（相関サブクエリを含む）、CTE を含む **完全な SQL 構文** をサポートします。これは、オブザーバビリティシグナルと業務データやインフラデータの間を相関付ける必要があるユーザーにとって大きな利点です。

ClickStack では、[HyperDX が Lucene 互換の検索インターフェース](/use-cases/observability/clickstack/search) を提供しており、移行を容易にすると同時に、ClickHouse バックエンド経由で完全な SQL をサポートします。この構文は [Elastic query string](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 構文に類似しています。この構文の厳密な比較については、["Searching in ClickStack and Elastic"](/use-cases/observability/clickstack/migration/elastic/search) を参照してください。

### File formats and interfaces {#file-formats-and-interfaces}

Elasticsearch は JSON（および [制限付きの CSV](https://www.elastic.co/docs/reference/enrich-processor/csv-processor)）のインジェストをサポートしています。ClickHouse は Parquet、Protobuf、Arrow、CSV などを含む **70 以上のファイルフォーマット** を、インジェストとエクスポートの両方でサポートします。これにより、外部のパイプラインやツールとの統合が容易になります。

どちらのシステムも REST API を提供しますが、ClickHouse はさらに、低レイテンシかつ高スループットなやり取りのための **ネイティブプロトコル** も提供しています。ネイティブインターフェースは、HTTP よりも効率的にクエリの進捗、圧縮、ストリーミングをサポートしており、多くの本番環境におけるインジェストでデフォルトとなっています。

### Indexing and storage {#indexing-and-storage}

<Image img={elasticsearch} alt="Elasticsearch" size="lg"/>

シャーディングの概念は、Elasticsearch のスケーラビリティモデルにおいて根幹となるものです。各 ① [**index**](https://www.elastic.co/blog/what-is-an-elasticsearch-index) は **shard** に分割され、それぞれがディスク上のセグメントとして保存される物理的な Lucene インデックスとなります。各 shard は、レジリエンスのために replica shard と呼ばれる 1 つ以上の物理的コピーを持つことができます。スケーラビリティ確保のために、shard と replica は複数ノードに分散させることができます。単一の shard ② は、1 つ以上のイミュータブルなセグメントで構成されます。セグメントは Lucene の基本的なインデックス構造であり、Lucene は Elasticsearch の基盤となる、インデックス作成と検索機能を提供する Java ライブラリです。

:::note Elasticsearch における挿入処理
Ⓐ 新しく挿入されたドキュメントは、まず Ⓑ インメモリのインデックスバッファに入り、デフォルトでは 1 秒ごとにフラッシュされます。フラッシュされたドキュメントのターゲット shard を決定するためにルーティング式が使用され、shard に対して新しいセグメントがディスク上に書き込まれます。クエリ効率を高め、削除または更新されたドキュメントを物理的に削除できるようにするために、セグメントはバックグラウンドで継続的にマージされ、最大サイズ 5 GB に達するまでより大きなセグメントへと統合されます。ただし、より大きなセグメントへのマージを強制することも可能です。
:::



Elasticsearch は、[JVM ヒープとメタデータのオーバーヘッド](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#each-shard-has-overhead) のため、シャードのサイズをおよそ [50 GB または 2 億ドキュメント](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards) に設定することを推奨しています。さらに、シャードあたり [20 億ドキュメントのハードリミット](https://www.elastic.co/docs/deploy-manage/production-guidance/optimize-performance/size-shards#troubleshooting-max-docs-limit) も存在します。Elasticsearch はクエリをシャード間で並列化しますが、各シャードは **単一スレッド** で処理されるため、過度なシャーディングは高コストであるうえ、かえって逆効果になります。この設計により、シャーディングとスケーリングは本質的に密結合しており、パフォーマンスをスケールさせるには、より多くのシャード（およびノード）が必要になります。

Elasticsearch は、高速な検索のためにすべてのフィールドを [**inverted indices**](https://www.elastic.co/docs/manage-data/data-store/index-basics) にインデックスし、集約、ソート、スクリプトフィールドアクセスのためにオプションで [**doc values**](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/doc-values) を使用します。数値フィールドおよび geo フィールドは、地理空間データや数値・日付レンジ検索のために [Block K-D trees](https://users.cs.duke.edu/~pankaj/publications/papers/bkd-sstd.pdf) を使用します。 

重要な点として、Elasticsearch は [`_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field) に元のドキュメント全体を（`LZ4`、`Deflate`、`ZSTD` で圧縮して）保存しますが、ClickHouse は別個のドキュメント表現を保存しません。ClickHouse では、クエリ時にカラムからデータを再構築することで、ストレージ使用量を削減します。同様の機能は、Elasticsearch でも [Synthetic `_source`](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source) を使用することで実現できますが、いくつかの[制限事項](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#synthetic-source-restrictions)があります。`_source` を無効化することには [影響](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/mapping-source-field#include-exclude) もあり、これは ClickHouse には当てはまりません。

Elasticsearch では、[index mappings](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)（ClickHouse におけるテーブルスキーマに相当）が、永続化とクエリのために使用されるフィールドの型とデータ構造を制御します。

これに対して ClickHouse は **カラム指向** であり、各カラムは個別に保存されますが、常にテーブルの主キー／並び替えキーでソートされます。この並び順により、ClickHouse は [スパースなプライマリインデックス](/primary-indexes) を実現し、クエリ実行中にデータを効率的にスキップできます。クエリがプライマリキーのフィールドでフィルタする場合、ClickHouse は各カラムの関連する部分のみを読み取り、ディスク I/O を大幅に削減してパフォーマンスを向上させます — すべてのカラムにフルインデックスが存在しなくても同様です。 

<Image img={clickhouse} alt="ClickHouse" size="lg"/>

ClickHouse は [**skip indexes**](/optimize/skipping-indexes) もサポートしており、選択したカラムに対してインデックスデータを事前計算することでフィルタ処理を高速化します。これらは明示的に定義する必要がありますが、パフォーマンスを大幅に向上させることができます。加えて、ClickHouse ではカラムごとに [compression codecs](/use-cases/observability/schema-design#using-codecs) や圧縮アルゴリズムを指定できますが、これは Elasticsearch ではサポートされていません（Elasticsearch の[圧縮](https://www.elastic.co/docs/reference/elasticsearch/index-settings/index-modules) は `_source` JSON ストレージにのみ適用されます）。

ClickHouse もシャーディングをサポートしますが、そのモデルは **垂直スケーリング** を優先するように設計されています。単一シャードで **数兆行** を保存でき、メモリ、CPU、ディスクが許す限り効率的に動作し続けます。Elasticsearch と異なり、シャードあたりの **行数のハードリミットはありません**。ClickHouse におけるシャードは論理的なもので、実質的には個々のテーブルであり、単一ノードの容量をデータセットが超えない限りパーティショニングを必要としません。これは典型的にはディスク容量の制約によるものであり、シャーディングは水平方向へのスケールアウトが必要になったときにのみ①導入されます — その結果、複雑さとオーバーヘッドが低減されます。この場合、Elasticsearch と同様に、シャードはデータのサブセットを保持します。単一シャード内のデータは、② 変更不可能なデータパーツの集合として構成されており、それぞれが ③ 複数のデータ構造を含みます。

ClickHouse シャード内での処理は **完全に並列化** されており、ノード間でデータを移動することに伴うネットワークコストを避けるために、垂直スケールを推奨しています。 



:::note ClickHouse における挿入処理
ClickHouse での挿入は **デフォルトでは同期的** です — コミット完了後にのみ書き込みが確認されます — が、Elasticsearch のようなバッファリングやバッチ処理に合わせて **非同期挿入** に設定することもできます。[非同期データ挿入](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) を使用する場合、Ⓐ 新しく挿入された行はまず Ⓑ メモリ上の挿入バッファに入り、デフォルトでは 200 ミリ秒ごとにフラッシュされます。複数のシャードが使用されている場合は、[Distributed テーブル](/engines/table-engines/special/distributed) が使用され、新しく挿入された行が対象シャードにルーティングされます。そのシャードに対して新しいパーツがディスク上に書き込まれます。
:::

### 分散とレプリケーション {#distribution-and-replication}

Elasticsearch と ClickHouse の両方が、スケーラビリティとフォールトトレランスを確保するためにクラスター、シャード、レプリカを使用しますが、そのモデルは実装およびパフォーマンス特性の点で大きく異なります。

Elasticsearch はレプリケーションに **プライマリ-セカンダリ** モデルを採用しています。データがプライマリシャードに書き込まれると、それは 1 つ以上のレプリカに同期的にコピーされます。これらのレプリカ自体がフルシャードであり、冗長性を確保するためにノード間に分散されます。Elasticsearch は、必要なすべてのレプリカが処理を確認した後にのみ書き込みを確定します。このモデルは **シーケンシャル一貫性** に近いものを提供しますが、完全な同期前にレプリカから **ダーティリード** が発生する可能性があります。**マスターノード** がクラスターを調整し、シャード配置、ヘルス、およびリーダー選出を管理します。

対照的に、ClickHouse はデフォルトで **最終的整合性** を採用しており、**Keeper** によって調整されます。Keeper は ZooKeeper の軽量な代替です。書き込みは任意のレプリカに直接、またはレプリカを自動的に選択する [**Distributed テーブル**](/engines/table-engines/special/distributed) 経由で送信できます。レプリケーションは非同期であり、書き込みが確認された後に変更が他のレプリカへ伝播されます。より厳密な保証が必要な場合、ClickHouse は [**シーケンシャル一貫性** をサポート](/migrations/postgresql/appendix#sequential-consistency) しており、書き込みはレプリカ間でのコミットが完了した後にのみ確認されますが、このモードはパフォーマンスへの影響が大きいためあまり使用されません。Distributed テーブルは複数シャードにまたがるアクセスを統合し、`SELECT` クエリをすべてのシャードに転送して結果をマージします。`INSERT` 処理に対しては、データをシャード間に均等にルーティングすることで負荷分散を行います。ClickHouse のレプリケーションは非常に柔軟であり、どのレプリカ（シャードのコピー）も書き込みを受け付けることができ、すべての変更が他のレプリカへ非同期に同期されます。このアーキテクチャにより、障害やメンテナンス中でもクエリ提供を中断することなく、再同期は自動的に処理されます — データレイヤーでプライマリ-セカンダリ構成を強制する必要がありません。

:::note ClickHouse Cloud
**ClickHouse Cloud** では、アーキテクチャとして共有ナッシング型のコンピュートモデルが導入され、単一の **シャードがオブジェクトストレージによってバックアップされます**。これにより従来のレプリカベースの高可用性が置き換えられ、シャードを **複数ノードから同時に読み書き** できるようになります。ストレージとコンピュートの分離により、明示的なレプリカ管理なしで弾力的なスケーリングが可能になります。
:::

まとめると次のようになります。

- **Elastic**: シャードは JVM メモリに結びついた物理的な Lucene 構造です。シャードを過剰に分割するとパフォーマンスペナルティを招きます。レプリケーションは同期的で、マスターノードによって調整されます。
- **ClickHouse**: シャードは論理的で垂直方向にスケーラブルであり、ローカル実行が非常に効率的です。レプリケーションは非同期（ただしシーケンシャルにもできる）で、調整は軽量です。

最終的に、ClickHouse はシャードチューニングの必要性を最小限に抑えつつ、必要に応じて強力な一貫性保証を提供することで、大規模環境でのシンプルさと高パフォーマンスを重視しています。

### 重複排除とルーティング {#deduplication-and-routing}

Elasticsearch は `_id` に基づいてドキュメントの重複排除を行い、それに応じてシャードにルーティングします。ClickHouse はデフォルトの行識別子を保持しませんが、**挿入時の重複排除** をサポートしており、ユーザーが失敗した挿入を安全にリトライできるようにします。より詳細な制御のために、`ReplacingMergeTree` などのテーブルエンジンは特定のカラムによる重複排除を可能にします。

Elasticsearch におけるインデックスルーティングは、特定のドキュメントが常に特定のシャードにルーティングされることを保証します。ClickHouse では、ユーザーは **シャードキー** を定義するか、`Distributed` テーブルを使用して同様のデータ局所性を実現できます。

### 集約と実行モデル {#aggregations-execution-model}

両システムともデータの集約をサポートしていますが、ClickHouse は統計的、近似的、および特殊な分析用を含む、[より多くの関数](/sql-reference/aggregate-functions/reference) を提供します。

オブザーバビリティのユースケースでは、集約の最も一般的な用途の 1 つは、特定のログメッセージやイベントがどの程度の頻度で発生しているかをカウントし（頻度が異常な場合にはアラートを出す）、それを監視することです。

ClickHouse の `SELECT count(*) FROM ... GROUP BY ...` SQL クエリに相当する Elasticsearch の機能は、Elasticsearch の [bucket aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket.html) の 1 種である [terms aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html) です。

ClickHouse の `GROUP BY` と `count(*)` による集約と、Elasticsearch の terms aggregation は、機能面では概ね同等ですが、その実装、パフォーマンス、および結果の品質は大きく異なります。



Elasticsearch におけるこの集約は、クエリ対象のデータが複数のシャードにまたがる場合に、[「top-N」クエリの結果を推定します](https://www.elastic.co/docs/reference/aggregations/search-aggregations-bucket-terms-aggregation#terms-agg-doc-count-error)（例: 出現回数が多いホスト上位 10 件）。この推定により速度は向上しますが、精度が損なわれる可能性があります。ユーザーは [`doc_count_error_upper_bound` を確認](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#terms-agg-doc-count-error)し、`shard_size` パラメータを増やすことでこの誤差を減らせますが、その代償としてメモリ使用量の増加とクエリ性能の低下が発生します。

また Elasticsearch では、すべてのバケット集約に対して [`size` 設定](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-terms-aggregation.html#search-aggregations-bucket-terms-aggregation-size)が必要であり、明示的に上限を指定しない限り、すべてのユニークなグループを返す方法はありません。カーディナリティの高い集約では、[`max_buckets` 制限](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-settings.html#search-settings-max-buckets)に達するリスクがあるか、[composite aggregation](https://www.elastic.co/docs/reference/aggregations/bucket/composite-aggregation) を用いたページネーションが必要になり、これはしばしば複雑かつ非効率です。

対照的に、ClickHouse はデフォルトで正確な集約を実行します。`count(*)` のような関数は、設定を調整することなく正確な結果を返し、クエリの挙動をより単純かつ予測しやすいものにします。

ClickHouse はサイズ制限を設けていません。大規模なデータセットに対して、上限なしの GROUP BY クエリを実行できます。メモリのしきい値を超えた場合、ClickHouse は[ディスクへのスピル](https://clickhouse.com/docs/en/sql-reference/statements/select/group-by#group-by-in-external-memory)を行うことができます。プライマリキーのプレフィックスでグループ化する集約は特に効率的で、多くの場合、最小限のメモリ消費で実行されます。

#### Execution model {#execution-model}

上記の違いは、Elasticsearch と ClickHouse の実行モデルの違いに起因しており、両者はクエリ実行と並列処理に対して根本的に異なるアプローチを取っています。

ClickHouse は、モダンなハードウェア上での効率を最大化するよう設計されています。デフォルトでは、CPU コア数が N のマシン上で、ClickHouse は 1 本の SQL クエリを N 本の同時実行レーンで実行します。

<Image img={clickhouse_execution} alt="ClickHouse execution" size="lg"/>

単一ノード上では、実行レーンがデータを独立した範囲に分割し、CPU スレッド間で同時処理できるようにします。これにはフィルタリング、集約、ソートが含まれます。各レーンのローカル結果は最終的にマージされ、クエリに LIMIT 句が含まれている場合は limit オペレーターが適用されます。

クエリ実行は次のようにさらに並列化されます:
1. **SIMD ベクトル化**: 列指向データ上の処理は [CPU の SIMD 命令](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)（例: [AVX512](https://en.wikipedia.org/wiki/AVX-512)）を利用し、値をバッチ処理します。
2. **クラスタレベルの並列性**: 分散構成では、各ノードがローカルにクエリ処理を実行します。[部分集約状態](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states#working-with-aggregation-states)がクエリを開始したノードへストリーミングされ、そこでマージされます。クエリの `GROUP BY` キーがシャーディングキーと整合している場合、マージ処理は[最小化、あるいは完全に回避](/operations/settings/settings#distributed_group_by_no_merge)できます。
<br/>
このモデルにより、コアおよびノード全体にわたって効率的にスケールでき、ClickHouse は大規模分析に非常に適しています。*partial aggregation states* の活用により、異なるスレッドやノードからの中間結果を精度を失うことなくマージできます。

対照的に、Elasticsearch は多くの集約において、利用可能な CPU コア数にかかわらず、シャードごとに 1 スレッドを割り当てます。これらのスレッドはシャードローカルな top-N 結果を返し、それがコーディネーティングノードでマージされます。このアプローチは、システムリソースを十分に活用できない場合があり、特に頻出語が複数シャードに分散している場合に、グローバルな集約で不正確さを招く可能性があります。`shard_size` パラメータを増やすことで精度を改善できますが、その分メモリ使用量とクエリレイテンシが増加します。

<Image img={elasticsearch_execution} alt="Elasticsearch execution" size="lg"/>

まとめると、ClickHouse はより細かな粒度の並列性とハードウェアリソースに対する高い制御性をもって集約およびクエリを実行する一方で、Elasticsearch はより制約の厳しいシャードベースの実行に依存しています。

それぞれの技術における集約の仕組みについてさらに詳しく知りたい場合は、ブログ記事「[ClickHouse vs. Elasticsearch: The Mechanics of Count Aggregations](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#elasticsearch)」を参照してください。

### Data management {#data-management}

Elasticsearch と ClickHouse は、特にデータ保持、ロールオーバー、階層型ストレージといった観点で、時系列のオブザーバビリティデータの管理に対して根本的に異なるアプローチを取っています。



#### インデックスライフサイクル管理とネイティブ TTL の比較 {#lifecycle-vs-ttl}

Elasticsearch では、長期的なデータ管理は **Index Lifecycle Management (ILM)** と **Data Streams** によって行われます。これらの機能により、インデックスがいつロールオーバーされるか（例: 一定のサイズや経過時間に達したとき）、古いインデックスがいつ低コストなストレージ（例: warm や cold ティア）へ移動されるか、そして最終的にいつ削除されるかを定義するポリシーを設定できます。これは、Elasticsearch が **再シャーディングをサポートしておらず**、パフォーマンスの劣化なしにシャードを無制限に大きくできないために必要になります。シャードサイズを管理し効率的な削除を実現するには、新しいインデックスを定期的に作成し古いものを削除する必要があり、実質的にインデックス単位でデータをローテーションすることになります。

ClickHouse は異なるアプローチを取ります。データは通常、**単一テーブル** に保存され、カラムまたはパーティションレベルの **TTL (time-to-live) 式** を使って管理されます。データを **日付でパーティション分割** できるため、新しいテーブルを作成したりインデックスのロールオーバーを行ったりすることなく、効率的に削除できます。データが古くなり TTL 条件を満たすと、ClickHouse が自動的にそれを削除するため、ローテーションを管理するための追加インフラストラクチャは不要です。

#### ストレージティアとホット・ウォーム・アーキテクチャ {#storage-tiers}

Elasticsearch は、データを異なるパフォーマンス特性を持つストレージティア間で移動させる **hot-warm-cold-frozen** ストレージアーキテクチャをサポートしています。これは通常 ILM を通じて設定され、クラスタ内のノードロールと紐付けられます。

ClickHouse は、`MergeTree` のようなネイティブなテーブルエンジンによる **階層型ストレージ (tiered storage)** をサポートしており、カスタムルールに基づいて古いデータを異なる **ボリューム**（例: SSD から HDD、さらにオブジェクトストレージ）間で自動的に移動できます。これにより Elastic の hot-warm-cold アプローチを模倣できますが、複数のノードロールやクラスタを管理する複雑さは不要です。

:::note ClickHouse Cloud
**ClickHouse Cloud** では、これがさらにシームレスになります。すべてのデータは **オブジェクトストレージ（例: S3）** 上に保存され、コンピュートリソースは分離されています。データはクエリされるまでオブジェクトストレージ上に留まり、必要になった時点で取得されローカル（または分散キャッシュ）にキャッシュされます。これにより、Elastic の frozen ティアと同等のコストプロファイルを維持しつつ、より優れたパフォーマンス特性を提供できます。このアプローチではストレージティア間でデータを移動する必要がなくなり、hot-warm アーキテクチャは不要になります。
:::

### ロールアップとインクリメンタル集約の比較 {#rollups-vs-incremental-aggregates}

Elasticsearch では、**ロールアップ** や **集約** は [**transforms**](https://www.elastic.co/guide/en/elasticsearch/reference/current/transforms.html) と呼ばれる仕組みで実現します。これは、**スライディングウィンドウ** モデルを用いて、時系列データを固定間隔（例: 1 時間ごと、1 日ごと）で要約するために使用されます。transforms は、あるインデックスからデータを集約し、その結果を別の **ロールアップインデックス** に書き込む定期的なバックグラウンドジョブとして設定されます。これにより、高カーディナリティな生データを繰り返しスキャンすることを避けることで、長期間にわたるクエリのコストを削減できます。

次の図は、transforms がどのように動作するかを抽象的に示したものです（同じバケットに属し、あらかじめ集約値を計算しておきたいすべてのドキュメントを青色で示しています）:

<Image img={elasticsearch_transforms} alt="Elasticsearch の transforms" size="lg"/>

継続的な transforms は、設定可能なチェック間隔時間（デフォルト値 1 分の transform の [frequency](https://www.elastic.co/guide/en/elasticsearch/reference/current/put-transform.html)）に基づいた transform の [checkpoints](https://www.elastic.co/guide/en/elasticsearch/reference/current/transform-checkpoints.html) を使用します。上の図では、① チェック間隔時間の経過後に新しいチェックポイントが作成されるものと仮定しています。この時点で Elasticsearch は transform のソースインデックスの変更を確認し、前回のチェックポイント以降に存在する 3 つの新しい `blue` ドキュメント（11、12、13）を検出します。そのため、ソースインデックスは既存のすべての `blue` ドキュメントでフィルタリングされ、[composite aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)（結果の[ページネーション](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)を利用するため）を用いて集約値が再計算されます（そして、デスティネーションインデックスは、以前の集約値を含むドキュメントを置き換えるドキュメントで更新されます）。同様に、② と ③ では、新しいチェックポイントごとに変更がチェックされ、同じ `blue` バケットに属する既存すべてのドキュメントから集約値が再計算されます。

ClickHouse は本質的に異なるアプローチを取ります。データを定期的に再集約するのではなく、ClickHouse は **インクリメンタルなマテリアライズドビュー** をサポートしており、データを **挿入時に** 変換および集約します。新しいデータがソーステーブルに書き込まれると、マテリアライズドビューは、事前に定義された SQL 集約クエリを新しい **挿入ブロック** のみに対して実行し、その集約結果をターゲットテーブルに書き込みます。



このモデルは、[**partial aggregate states**](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction) をサポートする ClickHouse の機能によって実現されています。`partial aggregate states` は集約関数の中間表現であり、保存して後からマージできます。これにより、ユーザーはクエリが高速で更新コストの低い、部分的に集約済みの結果を保持できます。集約はデータ到着時に行われるため、高コストな定期ジョブを実行したり、古いデータを再集計したりする必要がありません。

以下では、インクリメンタルなマテリアライズドビューの仕組みを抽象的に概説します（同じグループに属し、事前に集約値を計算したいすべての行を青色で表しています）: 

<Image img={clickhouse_mvs} alt="ClickHouse Materialized Views" size="lg"/>

上の図では、マテリアライズドビューのソーステーブルには、すでに同じグループに属する `blue` 行（1 〜 10）を格納したデータパーツが存在しています。このグループに対しては、ビューのターゲットテーブル側にも、`blue` グループ向けの [partial aggregation state](https://www.youtube.com/watch?v=QDAJTKZT8y4) を格納したデータパーツがすでに存在しています。① ② ③ のように新しい行がソーステーブルへ挿入されるたびに、それぞれの挿入に対応するソーステーブルのデータパーツが作成されると同時に、新たに挿入された行の各ブロックごとに partial aggregation state が計算され、データパーツという形でマテリアライズドビューのターゲットテーブルへ挿入されます。④ バックグラウンドでのパーツマージ時に、これらの partial aggregation state がマージされることで、インクリメンタルなデータ集約が行われます。 

[aggregate functions](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference)（90 種類以上）および aggregate function [combinators](https://www.youtube.com/watch?v=7ApwD0cfAFI) との組み合わせはすべて、[partial aggregation states](https://clickhouse.com/docs/en/sql-reference/data-types/aggregatefunction) をサポートしていることに注意してください。 

インクリメンタルな集約における Elasticsearch と ClickHouse の、より具体的な比較例については、この [example](https://github.com/ClickHouse/examples/tree/main/blog-examples/clickhouse-vs-elasticsearch/continuous-data-transformation#continuous-data-transformation-example) を参照してください。 

ClickHouse の手法の利点は次のとおりです:

- **常に最新の集約結果**: マテリアライズドビューは常にソーステーブルと同期しています。
- **バックグラウンドジョブ不要**: 集約処理はクエリ時ではなく挿入時に実行されます。
- **優れたリアルタイム性能**: 最新の集約結果を即時に必要とするオブザーバビリティワークロードやリアルタイム分析に最適です。
- **柔軟な組み合わせ**: マテリアライズドビューはレイヤー化したり、他のビューやテーブルと結合したりして、より高度なクエリアクセラレーション戦略を構成できます。
- **異なる TTL**: マテリアライズドビューのソーステーブルとターゲットテーブルには、異なる TTL 設定を適用できます。

このモデルは、クエリごとに数十億件の生レコードをスキャンすることなく、1 分単位のエラーレート、レイテンシ、上位 N の内訳といったメトリクスを計算する必要があるオブザーバビリティユースケースにおいて、特に強力です。

### Lakehouse support {#lakehouse-support}

ClickHouse と Elasticsearch は、レイクハウス統合に対して本質的に異なるアプローチを取っています。ClickHouse は完全なクエリ実行エンジンであり、[Iceberg](/sql-reference/table-functions/iceberg) や [Delta Lake](/sql-reference/table-functions/deltalake) といったレイクハウスフォーマット上でクエリを実行できるだけでなく、[AWS Glue](/use-cases/data-lake/glue-catalog) や [Unity Catalog](/use-cases/data-lake/unity-catalog) などのデータレイクカタログとも統合できます。これらのフォーマットは [Parquet](/interfaces/formats/Parquet) ファイルへの効率的なクエリに依存しており、ClickHouse は Parquet を完全にサポートしています。ClickHouse は Iceberg および Delta Lake の両方のテーブルを直接読み取れるため、モダンなデータレイクアーキテクチャとのシームレスな統合が可能です。

対照的に、Elasticsearch は内部データフォーマットと Lucene ベースのストレージエンジンに強く結び付けられています。レイクハウスフォーマットや Parquet ファイルを直接クエリすることはできず、モダンなデータレイクアーキテクチャを活用する能力が制限されています。Elasticsearch では、クエリ可能にする前に、データを独自フォーマットへ変換・ロードする必要があります。

ClickHouse のレイクハウス機能は、単にデータを読み取るだけにはとどまりません。



- **データカタログ統合**: ClickHouse は [AWS Glue](/use-cases/data-lake/glue-catalog) のようなデータカタログとの統合をサポートしており、オブジェクトストレージ上のテーブルの自動検出およびアクセスを可能にします。
- **オブジェクトストレージ対応**: データを移動することなく、[S3](/engines/table-engines/integrations/s3)、[GCS](/sql-reference/table-functions/gcs)、[Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage) 上に存在するデータに対するクエリをネイティブにサポートします。
- **クエリフェデレーション**: [external dictionaries](/dictionary) や [table functions](/sql-reference/table-functions) を使用して、レイクハウステーブル、従来型データベース、および ClickHouse テーブルを含む複数のソースにまたがるデータを相関付ける機能を提供します。
- **増分ロード**: [S3Queue](/engines/table-engines/integrations/s3queue) や [ClickPipes](/integrations/clickpipes) などの機能を用いて、レイクハウステーブルからローカルの [MergeTree](/engines/table-engines/mergetree-family/mergetree) テーブルへの継続的なデータロードをサポートします。
- **パフォーマンス最適化**: [cluster functions](/sql-reference/table-functions/cluster) を用いてレイクハウス上のデータに対する分散クエリを実行し、パフォーマンスを向上させます。

これらの機能により、ClickHouse はレイクハウスアーキテクチャを採用する組織にとって自然な選択肢となり、データレイクの柔軟性とカラムナデータベースのパフォーマンスの両方を活用できるようになります。 
