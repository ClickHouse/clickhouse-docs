---
title: Rocksetからの移行
slug: /migrations/rockset
description: RocksetからClickHouseへの移行
keywords: [migrate, migration, migrating, data, etl, elt, Rockset]
---


# Rocksetからの移行

Rocksetはリアルタイム分析データベースで、[2024年6月にOpenAIに買収されました](https://rockset.com/blog/openai-acquires-rockset/)。
ユーザーは2024年9月30日午後5時PDTまでに[このサービスからオフボードする必要があります](https://docs.rockset.com/documentation/docs/faq)。

私たちはClickHouse CloudがRocksetユーザーにとって素晴らしい選択肢を提供すると考えており、今回のガイドではRocksetからClickHouseに移行する際に考慮すべきいくつかの事項を説明します。

では、始めましょう！

## 迅速な支援 {#immediate-assistance}

即時の支援が必要な場合は、[このフォーム](https://clickhouse.com/company/contact?loc=docs-rockest-migrations)に記入してご連絡ください。人間がご対応します！

## ClickHouseとRocksetの高レベル比較 {#clickhouse-vs-rockset---high-level-comparison}

まず、ClickHouseの強みと、Rocksetに対する利点を簡単に概要します。

ClickHouseはスキーマファーストアプローチを通じてリアルタイム性能とコスト効率に重点を置いています。 
半構造化データもサポートしていますが、私たちの哲学はユーザーが自分のデータを構造化して性能とリソース効率を最大化するべきだということです。
上記のスキーマファーストアプローチの結果、私たちのベンチマークでは、ClickHouseはスケーラビリティ、取り込みスループット、クエリ性能、コスト効率でRocksetを上回ります。

他のデータシステムとの統合については、ClickHouseは[広範な機能](/integrations)を持ち、Rocksetを上回ります。

RocksetとClickHouseの両方がクラウドベースの製品と関連するサポートサービスを提供しています。
Rocksetとは異なり、ClickHouseにはオープンソース製品とコミュニティもあります。
ClickHouseのソースコードは[github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse)で見つけることができ、執筆時点で1,500人以上の貢献者がいます。
[ClickHouse Community Slack](https://clickhouse.com/slack)には7,000人以上のメンバーが集まり、彼らの経験やベストプラクティスを共有し、遭遇した問題に対してお互いに助け合っています。

この移行ガイドはRocksetからClickHouse Cloudへの移行に焦点を当てていますが、ユーザーはオープンソース機能に関する[残りのドキュメント](/)を参照できます。

## Rocksetの主要概念 {#rockset-key-concepts}

次に、[Rocksetの主要概念](https://docs.rockset.com/documentation/docs/key-concepts)を確認し、それらのClickHouse Cloudにおける同等の概念を説明します（存在する場合）。

### データソース {#data-sources}

RocksetとClickHouseの両方は、さまざまなソースからデータをロードすることをサポートしています。

Rocksetでは、データソースを作成し、それに基づいて_コレクション_を作成します。
イベントストリーミングプラットフォーム、OLTPデータベース、クラウドバケットストレージのための完全管理の統合があります。

ClickHouse Cloudでは、完全管理の統合に相当するものは[ClickPipes](/integrations/clickpipes)です。
ClickPipesは、イベントストリーミングプラットフォームやクラウドバケットストレージからデータを継続的にロードすることをサポートします。
ClickPipesはデータを_テーブル_にロードします。

### 取り込み変換 {#ingest-transformations}

Rocksetの取り込み変換を使用すると、Rocksetに入ってくる生データをコレクションに保存する前に変換できます。
ClickHouse Cloudも同様にClickPipesを使用して、ClickHouseの[物化ビュー機能](/guides/developer/cascading-materialized-views)を利用してデータを変換します。

### コレクション {#collections}

Rocksetではコレクションにクエリを実行します。 ClickHouse Cloudではテーブルにクエリを実行します。
どちらのサービスでもクエリはSQLを使用して行います。
ClickHouseは、SQL標準に基づく追加の関数を追加し、データを操作して変換するためのより強力な機能を提供します。

### クエリラムダ {#query-lambdas}

Rocksetは、Rocksetに保存された名前付きパラメータ化クエリであるクエリラムダをサポートします。これらは専用のRESTエンドポイントから実行できます。
ClickHouse Cloudの[クエリAPIエンドポイント](/cloud/get-started/query-endpoints)は、同様の機能を提供します。

### ビュー {#views}

Rocksetでは、SQLクエリによって定義された仮想コレクションであるビューを作成できます。
ClickHouse Cloudは、いくつかの種類の[ビュー](/sql-reference/statements/create/view)をサポートしています：

* _通常のビュー_はデータを保存しません。クエリ時に別のテーブルから読み取りを行うだけです。
* _パラメータ化されたビュー_は通常のビューに似ていますが、クエリ時に解決されるパラメータで作成することができます。
* _物化ビュー_は、対応する`SELECT`クエリによって変換されたデータを保存します。これは、参照するソースデータに新しいデータが追加されるときに実行されるトリガーのようなものです。

### エイリアス {#aliases}

Rocksetのエイリアスは、コレクションに複数の名前を関連付けるために使用されます。
ClickHouse Cloudは同等の機能をサポートしていません。

### ワークスペース {#workspaces}

Rocksetのワークスペースは、リソース（つまりコレクション、クエリラムダ、ビュー、エイリアス）や他のワークスペースを保持するコンテナです。

ClickHouse Cloudでは、完全な分離のために異なるサービスを使用できます。
異なるテーブル/ビューへのRBACアクセスを簡素化するためにデータベースを作成することもできます。

## 設計上の考慮事項 {#design-considerations}

このセクションでは、Rocksetの主要な機能のいくつかをレビューし、ClickHouse Cloudを使用する際にそれらにどのように対処するかを学びます。

### JSONサポート {#json-support}

Rocksetは、Rockset特有のタイプを許可する拡張バージョンのJSONフォーマットをサポートしています。

ClickHouseでJSONを扱う方法はいくつかあります：

* JSON推論
* クエリ時のJSON抽出
* 挿入時のJSON抽出

ユーザーケースに最適なアプローチを理解するには、[当社のJSONドキュメント](/integrations/data-formats/json/overview)をご覧ください。

さらに、ClickHouseには間もなく[半構造化カラムデータ型](https://github.com/ClickHouse/ClickHouse/issues/54864)が追加される予定です。
この新しいタイプは、RocksetのJSONタイプが提供する柔軟性をユーザーに提供するでしょう。

### フルテキスト検索 {#full-text-search}

Rocksetはその`SEARCH`関数を使用してフルテキスト検索をサポートしています。
ClickHouseは検索エンジンではありませんが、[文字列検索に関するさまざまな関数](/sql-reference/functions/string-search-functions)を持っています。 
ClickHouseはまた、[ブルームフィルター](/optimize/skipping-indexes)をサポートしており、多くのシナリオで役立つ可能性があります。

### ベクトル検索 {#vector-search}

Rocksetにはベクトル検索アプリケーションで使用される埋め込みをインデックス化するために使用できる類似性インデックスがあります。

ClickHouseも線形スキャンを使用してベクトル検索に使用できます：
- [ClickHouseによるベクトル検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [ClickHouseによるベクトル検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouseには[ベクトル検索類似性インデックス](/engines/table-engines/mergetree-family/annindexes)もありますが、このアプローチは現在実験段階であり、[新しいクエリアナライザー](/guides/developer/understanding-query-execution-with-the-analyzer)と互換性がありません。 

### OLTPデータベースからのデータ取り込み {#ingesting-data-from-oltp-databases}

Rocksetの管理された統合は、MongoDBやDynamoDBなどのOLTPデータベースからデータを取り込むことをサポートします。

DynamoDBからデータを取り込む場合は、DynamoDB統合ガイドを[こちら](/integrations/data-ingestion/dbms/dynamodb/index.md)に従ってください。

### コンピュート間の分離 {#compute-compute-separation}

コンピュート間の分離は、リアルタイム分析システムにおけるアーキテクチャデザインパターンであり、突然のデータやクエリの急増に対応することを可能にします。
もし単一のコンポーネントが取り込みとクエリの両方を処理している場合、クエリの洪水が発生すると取り込みの遅延が増大し、取り込みの洪水が発生するとクエリの遅延が増大します。

コンピュート間の分離は、データの取り込みとクエリ処理のコードパスを分けることでこの問題を回避し、これはRocksetが2023年3月に実装した機能です。

この機能は現在、ClickHouse Cloudに実装中であり、プライベートプレビューに近づいています。サポートに連絡して有効にしてください。

## 無料移行サービス {#free-migration-services}

これはRocksetユーザーにとってストレスの多い時期であることを理解しています - 誰も短期間でプロダクションデータベースを移行したくはありません！

もしClickHouseがあなたに適しているなら、[無料の移行サービス](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)を提供して、移行を円滑に進めるお手伝いをします。
