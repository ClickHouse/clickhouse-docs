---
'title': 'Rockset からの移行'
'slug': '/migrations/rockset'
'description': 'Rockset から ClickHouse への移行'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'Rockset'
---





# Rocksetからの移行

Rocksetはリアルタイム分析データベースであり、[2024年6月にOpenAIに買収されました](https://rockset.com/blog/openai-acquires-rockset/)。
ユーザーは2024年9月30日午後5時PDTまでに[サービスからオフボードする必要があります](https://docs.rockset.com/documentation/docs/faq)。

私たちはClickHouse CloudがRocksetのユーザーにとって素晴らしい選択肢を提供すると考えています。このガイドでは、RocksetからClickHouseに移行する際の考慮すべきことを説明します。

早速始めましょう！

## 即時サポート {#immediate-assistance}

即時サポートが必要な場合は、[このフォーム](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) に記入して、担当者と連絡を取ってください！ 


## ClickHouse対Rockset - 高レベルの比較 {#clickhouse-vs-rockset---high-level-comparison}

まず、ClickHouseの強みとRocksetと比較して得られる利点を簡単に見ていきます。

ClickHouseは、スキーマファーストアプローチを通じてリアルタイムパフォーマンスとコスト効率に重点を置いています。
半構造化データもサポートされていますが、私たちの哲学は、ユーザーがパフォーマンスとリソース効率を最大化するためにデータをどのように構造化するかを決定すべきであるということです。
前述のスキーマファーストアプローチの結果、私たちのベンチマークでは、ClickHouseはスケーラビリティ、取り込みスループット、クエリパフォーマンス、コスト効率においてRocksetを上回っています。

他のデータシステムとの統合に関しては、ClickHouseは[広範な機能](/integrations)を持ち、Rocksetを上回っています。

RocksetとClickHouseの両方がクラウドベースの製品と関連するサポートサービスを提供しています。
Rocksetとは異なり、ClickHouseにはオープンソースの製品とコミュニティもあります。
ClickHouseのソースコードは[github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse)にあり、執筆時点で1,500人以上の貢献者がいます。
[ClickHouseコミュニティSlack](https://clickhouse.com/slack)には7,000人以上のメンバーがいて、自分たちの経験やベストプラクティスを共有し、遭遇する問題についてお互いに助け合っています。

この移行ガイドは、RocksetからClickHouse Cloudへの移行に焦点を当てていますが、ユーザーはオープンソース機能に関する[私たちのその他のドキュメント](/)を参照できます。

## Rocksetの主要概念 {#rockset-key-concepts}

まず、[Rocksetの主要概念](https://docs.rockset.com/documentation/docs/key-concepts)を見て、それらのClickHouse Cloudにおける対応物を説明します（存在する場合）。

### データソース {#data-sources}

RocksetとClickHouseは、さまざまなソースからデータをロードすることをサポートしています。

Rocksetでは、データソースを作成し、そのデータソースに基づいて_コレクション_を作成します。
イベントストリーニングプラットフォーム、OLTPデータベース、クラウドバケットストレージ用のフルマネージドインテグレーションがあります。

ClickHouse Cloudでは、フルマネージドインテグレーションに相当するのは[ClickPipes](/integrations/clickpipes)です。
ClickPipesはイベントストリーミングプラットフォームやクラウドバケットストレージからのデータの継続的なロードをサポートします。
ClickPipesはデータを_テーブル_にロードします。

### 取り込み変換 {#ingest-transformations}

Rocksetの取り込み変換では、コレクションに保存される前にRocksetに入る生データを変換できます。
ClickHouse Cloudは同様のことをClickPipesを介して行い、ClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を利用してデータを変換します。

### コレクション {#collections}

Rocksetではコレクションをクエリします。ClickHouse Cloudではテーブルをクエリします。
両方のサービスで、クエリはSQLを使用して行われます。
ClickHouseは、SQL標準の機能に加え、データを操作し変換するための追加機能を提供します。

### クエリラムダ {#query-lambdas}

Rocksetはクエリラムダをサポートしており、Rocksetに保存された名前付きパラメータ化クエリは専用のRESTエンドポイントから実行できます。
ClickHouse Cloudの[クエリAPIエンドポイント](/cloud/get-started/query-endpoints)は類似の機能を提供します。

### ビュー {#views}

Rocksetでは、SQLクエリによって定義された仮想コレクションであるビューを作成できます。
ClickHouse Cloudは、いくつかの種類の[ビュー](/sql-reference/statements/create/view)をサポートしています。

* _通常のビュー_はデータを保存しません。クエリ時に別のテーブルから読み取るだけです。
* _パラメータ化されたビュー_は通常のビューに似ていますが、クエリ時に解決されるパラメータで作成できます。
* _マテリアライズドビュー_は、対応する `SELECT` クエリによって変換されたデータを保存します。新しいデータが参照元のデータに追加されたときに実行されるトリガーのようなものです。

### エイリアス {#aliases}

Rocksetのエイリアスは、コレクションに複数の名前を関連付けるために使用されます。
ClickHouse Cloudは同等の機能をサポートしていません。

### ワークスペース {#workspaces}

Rocksetのワークスペースは、リソース（コレクション、クエリラムダ、ビュー、エイリアスなど）や他のワークスペースを保持するコンテナーです。

ClickHouse Cloudでは、完全な分離のために異なるサービスを使用できます。
異なるテーブルやビューへのRBACアクセスを簡素化するためにデータベースを作成することもできます。

## 設計時の考慮事項 {#design-considerations}

このセクションでは、Rocksetの重要な機能のいくつかを見直し、ClickHouse Cloudを使用する際にそれらにどのように対処するかを学びます。

### JSONサポート {#json-support}

Rocksetは、Rockset特有の型を許可するJSONフォーマットの拡張版をサポートしています。

ClickHouseでは、JSONを操作するための複数の方法があります：

* JSON推論
* クエリ時のJSON抽出
* 挿入時のJSON抽出

あなたのユーザーケースに最適なアプローチを理解するには、[私たちのJSONドキュメント](/integrations/data-formats/json/overview)を参照してください。

さらに、ClickHouseは近日中に[半構造化カラムデータ型](https://github.com/ClickHouse/ClickHouse/issues/54864)を持つことになります。
この新しい型は、RocksetのJSON型が提供する柔軟性をユーザーに提供するはずです。

### フルテキスト検索 {#full-text-search}

Rocksetは`SEARCH`関数を使用したフルテキスト検索をサポートしています。
ClickHouseは検索エンジンではありませんが、[文字列内の検索のためのさまざまな関数](/sql-reference/functions/string-search-functions)を持っています。
ClickHouseはまた、[ブルームフィルタ](/optimize/skipping-indexes)をサポートしており、多くのシナリオで役立つことができます。

### ベクター検索 {#vector-search}

Rocksetには、ベクター検索アプリケーションで使用される埋め込みをインデックス化するために使用できる類似性インデックスがあります。

ClickHouseも線形スキャンを使用してベクター検索に利用できます：
- [ClickHouseを使ったベクター検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [ClickHouseを使ったベクター検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouseには[ベクター検索の類似性インデックス](/engines/table-engines/mergetree-family/annindexes)もありますが、このアプローチは現在実験的であり、[新しいクエリアナライザー](/guides/developer/understanding-query-execution-with-the-analyzer)とはまだ互換性がありません。

### OLTPデータベースからのデータの取り込み {#ingesting-data-from-oltp-databases}

Rocksetのマネージドインテグレーションは、MongoDBやDynamoDBのようなOLTPデータベースからデータを取り込むことをサポートしています。

DynamoDBからデータを取り込む場合は、こちらのDynamoDBインテグレーションガイドを参照してください[こちら](/integrations/data-ingestion/dbms/dynamodb/index.md)。

### コンピュート・コンピュート分離 {#compute-compute-separation}

コンピュート・コンピュート分離は、リアルタイム分析システムにおけるアーキテクチャ設計パターンであり、突発的なデータやクエリの急増に対処するのを可能にします。
単一のコンポーネントが取り込みとクエリを両方処理しているとしましょう。
その場合、クエリの洪水があると、取り込みのレイテンシーが増加し、取り込むデータの洪水があると、クエリのレイテンシーが増加します。

コンピュート・コンピュート分離は、データの取り込みとクエリ処理のコードパスを分離してこの問題を回避します。これはRocksetが2023年3月に実装した機能です。

この機能は現在ClickHouse Cloudに実装中で、プライベートプレビューに近づいています。有効にするにはサポートに連絡してください。

## 無料の移行サービス {#free-migration-services}

私たちは、Rocksetのユーザーにとってこれがストレスの多い時期であることを理解しています。誰もこの短期間にプロダクションデータベースを移行したいとは思いません！

ClickHouseが適している場合、私たちは[無料の移行サービス](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)を提供して、移行をスムーズに行えるようにお手伝いします。
