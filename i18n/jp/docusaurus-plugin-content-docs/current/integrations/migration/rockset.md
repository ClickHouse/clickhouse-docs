---
title: 'Rocksetからの移行'
slug: /migrations/rockset
description: 'RocksetからClickHouseへの移行'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'Rockset']
---


# Rocksetからの移行

Rocksetはリアルタイム分析データベースで、[2024年6月にOpenAIに買収されました](https://rockset.com/blog/openai-acquires-rockset/)。
利用者は2024年9月30日午後5時（PDT）までに[サービスからオフボードする必要があります](https://docs.rockset.com/documentation/docs/faq)。

私たちはClickHouse CloudがRocksetユーザーにとって素晴らしい選択肢を提供すると考えており、このガイドではRocksetからClickHouseに移行する際に考慮すべきいくつかの点を解説します。

では始めましょう！

## すぐに支援が必要な場合 {#immediate-assistance}

すぐに支援が必要な場合は、[このフォーム](https://clickhouse.com/company/contact?loc=docs-rockest-migrations)に記入してお問い合わせください。人間がご連絡いたします！

## ClickHouseとRockset - 高レベルの比較 {#clickhouse-vs-rockset---high-level-comparison}

まず、ClickHouseの強みとRocksetと比べたときの利点を簡単に概説します。

ClickHouseはスキーマファーストアプローチを通じてリアルタイムパフォーマンスとコスト効率を重視しています。
半構造化データもサポートされていますが、我々の哲学は、ユーザーがパフォーマンスとリソース効率を最大化するためにデータを構造化する方法を決定すべきだということです。
上記のスキーマファーストアプローチにより、我々のベンチマークではClickHouseがスケーラビリティ、取り込みスループット、クエリパフォーマンス、コスト効率においてRocksetを上回ります。

他のデータシステムとの統合に関しては、ClickHouseにはRocksetのそれを超える[幅広い機能](/integrations)があります。

RocksetとClickHouseの両方はクラウドベースの製品と関連サポートサービスを提供しています。
Rocksetとは異なり、ClickHouseにはオープンソースの製品とコミュニティもあります。
ClickHouseのソースコードは[github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse)で確認でき、執筆時点で1,500人以上のコントリビューターがいました。
[ClickHouseコミュニティSlack](https://clickhouse.com/slack)には7,000人以上のメンバーが参加しており、経験やベストプラクティスを共有し、お互いの問題解決を手助けしています。

この移行ガイドはRocksetからClickHouse Cloudへの移行に焦点を当てていますが、ユーザーはオープンソース機能に関する[その他のドキュメント](/)も参照できます。

## Rocksetの主要概念 {#rockset-key-concepts}

まず、[Rocksetの主要概念](https://docs.rockset.com/documentation/docs/key-concepts)を見て、それに相当するClickHouse Cloudの概念を説明します（存在する場合）。

### データソース {#data-sources}

RocksetとClickHouseの両方は、さまざまなソースからデータをロードすることができます。

Rocksetでは、データソースを作成し、そのデータソースに基づいて_コレクション_を作成します。
イベントストリーミングプラットフォーム、OLTPデータベース、クラウドバケットストレージのための完全に管理された統合があります。

ClickHouse Cloudにおける完全管理統合の同等物は[ClickPipes](/integrations/clickpipes)です。
ClickPipesは、イベントストリーミングプラットフォームやクラウドバケットストレージからのデータの継続的なロードをサポートします。
ClickPipesはデータを_テーブル_にロードします。

### 取り込み変換 {#ingest-transformations}

Rocksetの取り込み変換は、コレクションにデータを格納する前に、Rocksetに流入する生データを変換することを可能にします。
ClickHouse Cloudは、ClickPipesを介して同様の操作を行い、ClickHouseの[マテリアライズドビュー機能](/guides/developer/cascading-materialized-views)を使用してデータを変換します。

### コレクション {#collections}

Rocksetでは、コレクションをクエリします。ClickHouse Cloudでは、テーブルをクエリします。
両サービスとも、クエリはSQLを使用して行われます。
ClickHouseは、データを操作・変換するための追加機能をSQL標準に付加しています。

### クエリラムダ {#query-lambdas}

Rocksetは、Rocksetに保存された名前付きパラメータクエリであるクエリラムダをサポートしています。これらのクエリは専用のRESTエンドポイントから実行できます。
ClickHouse Cloudの[クエリAPIエンドポイント](/cloud/get-started/query-endpoints)は、同様の機能を提供します。

### ビュー {#views}

Rocksetでは、SQLクエリによって定義された仮想コレクションであるビューを作成できます。
ClickHouse Cloudは、いくつかのタイプの[ビュー](/sql-reference/statements/create/view)をサポートしています：

* _通常のビュー_はデータを保存しません。クエリ時に他のテーブルからの読み取りを行います。
* _パラメータ化されたビュー_は通常のビューに似ていますが、クエリ時に解決されるパラメータを持つことができます。
* _マテリアライズドビュー_は、対応する`SELECT`クエリで変換されたデータを保存します。新しいデータがリファレンスするソースデータに追加されるときに実行されるトリガーのようなものです。

### エイリアス {#aliases}

Rocksetのエイリアスは、コレクションに複数の名前を関連付けるために使用されます。
ClickHouse Cloudには同等の機能はサポートされていません。

### ワークスペース {#workspaces}

Rocksetのワークスペースは、リソース（すなわちコレクション、クエリラムダ、ビュー、エイリアス）および他のワークスペースを保持するコンテナです。

ClickHouse Cloudでは、完全な分離のために異なるサービスを使用できます。
さまざまなテーブル/ビューに対するRBACアクセスを簡素化するためにデータベースを作成することもできます。

## 設計上の考慮事項 {#design-considerations}

このセクションでは、Rocksetの主要機能をレビューし、ClickHouse Cloudを使用する際の対処法を学びます。

### JSONサポート {#json-support}

RocksetはRockset特有の型を許可する拡張JSONフォーマットをサポートしています。

ClickHouseでJSONを扱うには、いくつかの方法があります：

* JSON推論
* クエリ時のJSON抽出
* 挿入時のJSON抽出

ユーザーケースに最適なアプローチについては、[JSONドキュメント](/integrations/data-formats/json/overview)をご覧ください。

さらに、ClickHouseには近日中に[半構造化カラムデータ型](https://github.com/ClickHouse/ClickHouse/issues/54864)が追加される予定です。
この新しい型は、RocksetのJSON型が提供する柔軟性をユーザーに与えるはずです。

### フルテキスト検索 {#full-text-search}

Rocksetはその`SEARCH`機能でフルテキスト検索をサポートしています。
ClickHouseは検索エンジンではありませんが、[文字列検索のためのさまざまな関数](/sql-reference/functions/string-search-functions)を持っています。
ClickHouseはまた、[ブルームフィルター](/optimize/skipping-indexes)をサポートしており、多くのシナリオで役立ちます。

### ベクトル検索 {#vector-search}

Rocksetには、ベクトル検索アプリケーションで使用される埋め込みをインデックス化するために使用できる類似性インデックスがあります。

ClickHouseも線形スキャンを使用してベクトル検索に使用できます：
- [ClickHouseによるベクトル検索 - パート1](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [ClickHouseによるベクトル検索 - パート2](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouseには[ベクトル検索の類似性インデックス](/engines/table-engines/mergetree-family/annindexes)もありますが、このアプローチは現在実験的であり、[新しいクエリアナライザー](/guides/developer/understanding-query-execution-with-the-analyzer)との互換性はまだありません。

### OLTPデータベースからのデータの取り込み {#ingesting-data-from-oltp-databases}

Rocksetの管理された統合は、MongoDBやDynamoDBのようなOLTPデータベースからのデータの取り込みをサポートしています。

DynamoDBからデータを取り込んでいる場合は、DynamoDB統合ガイドを[こちら](/integrations/data-ingestion/dbms/dynamodb/index.md)で確認してください。

### コンピュートの分離 {#compute-compute-separation}

コンピュートの分離は、リアルタイム分析システムにおけるアーキテクチャ設計パターンであり、突発的なデータやクエリのバーストに対処することを可能にします。
もし単一のコンポーネントが取り込みとクエリ処理の両方を担当している場合、クエリが急増すると取り込みのレイテンシが増加し、逆にデータの取り込みが急増するとクエリのレイテンシが増加します。

コンピュートの分離はデータの取り込みとクエリ処理のコードパスを分け、この問題を回避します。この機能はRocksetが2023年3月に実装しました。

この機能は現在ClickHouse Cloudに実装中で、プライベートプレビューに近づいています。サポートにお問い合わせいただき、有効化をご依頼ください。

## 無料移行サービス {#free-migration-services}

Rocksetのユーザーにとってストレスの多い時期であることを理解しています。短期間で本番データベースを移動することは誰も望んでいません！

もしClickHouseがあなたに適しているなら、[無料移行サービス](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)をご提供し、移行をスムーズに行います。
