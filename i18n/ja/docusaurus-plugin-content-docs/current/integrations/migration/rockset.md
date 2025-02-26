---
title: Rocksetからの移行
slug: /migrations/rockset
description: RocksetからClickHouseへの移行
keywords: [移行, マイグレーション, データ, ETL, ELT, Rockset]
---

# Rocksetからの移行

Rocksetはリアルタイム分析データベースであり、[2024年6月にOpenAIによって買収されました](https://rockset.com/blog/openai-acquires-rockset/)。
ユーザーは2024年9月30日午後5時PDTまでに[サービスからオフボードする必要があります](https://docs.rockset.com/documentation/docs/faq)。

ClickHouse CloudはRocksetユーザーにとって素晴らしいホームを提供すると考えています。このガイドでは、RocksetからClickHouseに移行する際に考慮すべき事項を説明します。

さあ、始めましょう！

## 緊急支援 {#immediate-assistance}

緊急支援が必要な場合は、[このフォーム](https://clickhouse.com/company/contact?loc=docs-rockest-migrations)に記入してご連絡ください。人間があなたに連絡します！ 

## ClickHouse vs Rockset - 高レベルの比較 {#clickhouse-vs-rockset---high-level-comparison}

まず、ClickHouseの強みとRocksetに比べてどのような利点があるかの簡単な概要を見ていきましょう。

ClickHouseはスキーマファーストアプローチを用いて、リアルタイムのパフォーマンスとコスト効率に焦点を当てています。
半構造化データもサポートされていますが、当社の哲学はユーザーがデータの構造を決定し、パフォーマンスとリソース効率を最大化することです。
上記のスキーマファーストアプローチの結果として、弊社のベンチマークでは、ClickHouseはスケーラビリティ、取り込みスループット、クエリパフォーマンス、コスト効率においてRocksetを上回っています。

他のデータシステムとの統合に関しては、ClickHouseにはRocksetを超える[幅広い機能](/integrations)があります。

RocksetとClickHouseは両方ともクラウドベースの製品と関連サポートサービスを提供しています。
Rocksetとは異なり、ClickHouseにはオープンソースの製品とコミュニティもあります。
ClickHouseのソースコードは[github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse)にあり、執筆時点で1,500以上の貢献者がいます。
[ClickHouseコミュニティSlack](https://clickhouse.com/slack)には7,000人以上のメンバーがいます。彼らは経験やベストプラクティスを共有し、直面した問題を助け合っています。

この移行ガイドはRocksetからClickHouse Cloudへの移行に焦点を当てていますが、ユーザーはオープンソース機能に関する[他のドキュメント](/)も参照できます。

## Rocksetの主要概念 {#rockset-key-concepts}

まず、[Rocksetの主要概念](https://docs.rockset.com/documentation/docs/key-concepts)を見て、その同等物（存在する場合）をClickHouse Cloudで説明します。

### データソース {#data-sources}

RocksetとClickHouseの両方は、さまざまなソースからデータをロードすることをサポートしています。

Rocksetでは、データソースを作成した後、そのデータソースに基づいて_コレクション_を作成します。
イベントストリーミングプラットフォーム、OLTPデータベース、クラウドバケットストレージのための完全に管理された統合があります。

ClickHouse Cloudにおける完全管理された統合の同等物は[ClickPipes](/integrations/clickpipes)です。
ClickPipesは、イベントストリーミングプラットフォームやクラウドバケットストレージから継続的にデータをロードすることをサポートします。
ClickPipesはデータを_テーブル_にロードします。

### 取り込み変換 {#ingest-transformations}

Rocksetの取り込み変換を使用すると、コレクションに保存される前にRocksetに入る生データを変換できます。
ClickHouse Cloudも同様のことをClickPipesを通じて行い、ClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を使用してデータを変換します。

### コレクション {#collections}

Rocksetでは、コレクションをクエリします。ClickHouse Cloudでは、テーブルをクエリします。
両方のサービスで、クエリはSQLを使用して行われます。
ClickHouseは、データを操作および変換するためのさらなる機能をSQL標準に追加しています。

### クエリラムダ {#query-lambdas}

Rocksetはクエリラムダをサポートしており、Rocksetに保存された名前付きパラメータクエリが専用のRESTエンドポイントから実行できます。
ClickHouse Cloudの[クエリAPIエンドポイント](/cloud/get-started/query-endpoints)は、同様の機能を提供します。

### ビュー {#views}

Rocksetでは、SQLクエリによって定義された仮想コレクションであるビューを作成できます。
ClickHouse Cloudは、いくつかのタイプの[ビュー](/sql-reference/statements/create/view)をサポートしています：

* _通常のビュー_はデータを保存しません。クエリ時に別のテーブルから読み取るだけです。
* _パラメータ化ビュー_は通常のビューに似ていますが、クエリ時に解決されるパラメータを使用して作成できます。
* _マテリアライズドビュー_は、対応する`SELECT`クエリによって変換されたデータを保存します。これらは、参照するソースデータに新しいデータが追加されたときに実行されるトリガーのようなものです。

### エイリアス {#aliases}

Rocksetのエイリアスは、コレクションに複数の名前を関連付けるために使用されます。
ClickHouse Cloudには同等の機能はありません。

### ワークスペース {#workspaces}

Rocksetのワークスペースは、リソース（すなわち、コレクション、クエリラムダ、ビュー、エイリアス）および他のワークスペースを保持するコンテナです。

ClickHouse Cloudでは、フルアイソレーションのために異なるサービスを使用できます。
異なるテーブル/ビューへのRBACアクセスを簡素化するためにデータベースを作成することも可能です。 

## 設計上の考慮事項 {#design-considerations}

このセクションでは、Rocksetの主要な機能のいくつかをレビューし、ClickHouse Cloudを使用する際にそれらにどのように対処するかを学びます。

### JSONサポート {#json-support}

Rocksetは、Rockset特有の型を許可する拡張版のJSONフォーマットをサポートしています。

ClickHouseでJSONを扱う方法は複数あります：

* JSON推測
* クエリ時のJSON抽出
* 挿入時のJSON抽出

ユーザーケースに最適なアプローチを理解するには、[JSONドキュメント](/integrations/data-formats/json/overview)をご覧ください。

さらに、ClickHouseは近日中に[半構造化カラムデータ型](https://github.com/ClickHouse/ClickHouse/issues/54864)を導入予定です。
この新しい型は、RocksetのJSON型が提供する柔軟性をユーザーに提供するはずです。

### フルテキスト検索 {#full-text-search}

Rocksetは、`SEARCH`関数を使用してフルテキスト検索をサポートしています。
ClickHouseは検索エンジンではありませんが、[文字列内検索を行うためのさまざまな関数](/sql-reference/functions/string-search-functions)を持っています。
ClickHouseは、[ブルームフィルター](/optimize/skipping-indexes)もサポートしており、これにより多くのシナリオで役立ちます。

### ベクター検索 {#vector-search}

Rocksetには、ベクター検索アプリケーションで使用される埋め込みをインデックスするために使用できる類似性インデックスがあります。

ClickHouseでも、リニアスキャンを使用してベクター検索を行うことができます：
- [ClickHouseを使用したベクター検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [ClickHouseを使用したベクター検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouseには[ベクター検索の類似性インデックス](/engines/table-engines/mergetree-family/annindexes)もありますが、このアプローチは現在実験的であり、[新しいクエリアナライザー](/guides/developer/understanding-query-execution-with-the-analyzer)とも互換性がありません。

### OLTPデータベースからのデータ取り込み {#ingesting-data-from-oltp-databases}

Rocksetのマネージド統合は、MongoDBやDynamoDBなどのOLTPデータベースからデータを取り込むことをサポートしています。

DynamoDBからデータを取り込んでいる場合は、[こちらのDynamoDB統合ガイド](/integrations/data-ingestion/dbms/dynamodb/index.md)を参照してください。

### コンピュート分離 {#compute-compute-separation}

コンピュート分離は、リアルタイム分析システムにおけるアーキテクチャの設計パターンであり、突然のデータやクエリの流入に対処することを可能にします。
もしシングルコンポーネントが取り込みとクエリの両方を処理している場合、クエリの洪水があるときには取り込みのレイテンシーが増加し、取り込みの洪水があるときにはクエリのレイテンシーが増加します。

コンピュート分離は、データ取り込みとクエリ処理のコードパスを分離してこの問題を避けるものであり、これはRocksetが2023年3月に実装した機能です。

この機能は現在ClickHouse Cloudにも実装中で、プライベートプレビューに近づいています。サポートに連絡して有効化してください。

## 無料移行サービス {#free-migration-services}

Rocksetユーザーにとってこれはストレスの多い時期であることを理解しています - 誰もがこのような短期間で本番データベースを移動したいわけではありません！

もしClickHouseがあなたにとって良い選択であるなら、私たちは[無料の移行サービス](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)を提供し、移行をスムーズにするお手伝いをします。
