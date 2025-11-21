---
title: 'BigQuery と ClickHouse Cloud の比較'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'BigQuery が ClickHouse Cloud とどう異なるか'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '概要'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud と BigQuery の比較 



## リソース構成 {#resource-organization}

ClickHouse Cloudにおけるリソースの構成方法は、[BigQueryのリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)と類似しています。以下の図に示すClickHouse Cloudのリソース階層に基づいて、具体的な相違点を説明します。

<Image img={bigquery_1} size='md' alt='リソース構成' />

### 組織 {#organizations}

BigQueryと同様に、組織はClickHouse Cloudリソース階層のルートノードです。ClickHouse Cloudアカウントで最初に設定したユーザーは、そのユーザーが所有する組織に自動的に割り当てられます。ユーザーは組織に追加のユーザーを招待できます。

### BigQueryプロジェクト vs ClickHouse Cloudサービス {#bigquery-projects-vs-clickhouse-cloud-services}

組織内では、ClickHouse Cloudに保存されるデータがサービスに関連付けられるため、BigQueryプロジェクトにおおよそ相当するサービスを作成できます。ClickHouse Cloudには[複数のサービスタイプが利用可能](/cloud/manage/cloud-tiers)です。各ClickHouse Cloudサービスは特定のリージョンにデプロイされ、以下を含みます:

1. コンピュートノードのグループ(現在、Developmentティアサービスでは2ノード、Productionティアサービスでは3ノード)。これらのノードに対して、ClickHouse Cloudは手動および自動の両方で[垂直および水平スケーリングをサポート](/manage/scaling#how-scaling-works-in-clickhouse-cloud)しています。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダ。
3. エンドポイント(またはClickHouse Cloud UIコンソールを介して作成された複数のエンドポイント) - サービスへの接続に使用するサービスURL(例:`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### BigQueryデータセット vs ClickHouse Cloudデータベース {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouseはテーブルを論理的にデータベースにグループ化します。BigQueryデータセットと同様に、ClickHouseデータベースはテーブルデータを整理し、アクセスを制御する論理コンテナです。

### BigQueryフォルダ {#bigquery-folders}

ClickHouse Cloudには現在、BigQueryフォルダに相当する概念はありません。

### BigQueryスロット予約とクォータ {#bigquery-slot-reservations-and-quotas}

BigQueryスロット予約と同様に、ClickHouse Cloudでは[垂直および水平オートスケーリングを設定](/manage/scaling#configuring-vertical-auto-scaling)できます。垂直オートスケーリングでは、サービスのコンピュートノードのメモリとCPUコアの最小サイズと最大サイズを設定できます。サービスはこれらの境界内で必要に応じてスケーリングされます。これらの設定は、初期サービス作成フロー中にも利用可能です。サービス内の各コンピュートノードは同じサイズです。[水平スケーリング](/manage/scaling#manual-horizontal-scaling)を使用して、サービス内のコンピュートノード数を変更できます。

さらに、BigQueryクォータと同様に、ClickHouse Cloudは同時実行制御、メモリ使用量制限、I/Oスケジューリングを提供し、ユーザーがクエリをワークロードクラスに分離できるようにします。特定のワークロードクラスに対して共有リソース(CPUコア、DRAM、ディスクおよびネットワークI/O)の制限を設定することで、これらのクエリが他の重要なビジネスクエリに影響を与えないことを保証します。同時実行制御は、多数の同時クエリが発生するシナリオにおいてスレッドのオーバーサブスクリプションを防ぎます。

ClickHouseはサーバー、ユーザー、クエリレベルでメモリ割り当てのバイトサイズを追跡し、柔軟なメモリ使用量制限を可能にします。メモリオーバーコミットにより、クエリは保証されたメモリを超えて追加の空きメモリを使用できる一方で、他のクエリのメモリ制限を保証します。さらに、集約、ソート、結合句のメモリ使用量を制限でき、メモリ制限を超えた場合に外部アルゴリズムへのフォールバックが可能です。

最後に、I/Oスケジューリングにより、ユーザーは最大帯域幅、実行中のリクエスト、ポリシーに基づいて、ワークロードクラスのローカルおよびリモートディスクアクセスを制限できます。

### 権限 {#permissions}

ClickHouse Cloudは、[クラウドコンソール](/cloud/guides/sql-console/manage-sql-console-role-assignments)と[データベース](/cloud/security/manage-database-users)の2か所でユーザーアクセスを制御します。コンソールアクセスは[clickhouse.cloud](https://console.clickhouse.cloud)ユーザーインターフェースを介して管理されます。データベースアクセスは、データベースユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーには、[SQLコンソール](/integrations/sql-clients/sql-console)を介してデータベースと対話できるようにするデータベース内のロールを付与できます。


## データ型 {#data-types}

ClickHouseは数値型に関して、より細かい精度を提供します。例えば、BigQueryは数値型として[`INT64`、`NUMERIC`、`BIGNUMERIC`、`FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)を提供しています。これに対してClickHouseは、小数、浮動小数点数、整数に対して複数の精度型を提供しています。これらのデータ型により、ClickHouseユーザーはストレージとメモリのオーバーヘッドを最適化でき、クエリの高速化とリソース消費の削減を実現できます。以下に、各BigQuery型に対応するClickHouse型を示します:

| BigQuery                                                                                                 | ClickHouse                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)             | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)        | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)    | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)            | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)             | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)               | [Date32](/sql-reference/data-types/date32) (範囲はより狭い)                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)       | [DateTime](/sql-reference/data-types/datetime)、[DateTime64](/sql-reference/data-types/datetime64) (範囲は狭いが精度は高い)                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types) | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type)     | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)          | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)       | 該当なし - [式としてサポート](/sql-reference/data-types/special-data-types/interval#usage-remarks)または[関数を通じてサポート](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)               | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)           | [String (バイト)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct) | [Tuple](/sql-reference/data-types/tuple)、[Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)               | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

ClickHouse型に複数の選択肢がある場合は、データの実際の範囲を考慮し、必要最小限のものを選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)の活用も検討してください。


## クエリ高速化技術 {#query-acceleration-techniques}

### プライマリキーと外部キー、およびプライマリインデックス {#primary-and-foreign-keys-and-primary-index}

BigQueryでは、テーブルに[プライマリキーと外部キーの制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を設定できます。通常、プライマリキーと外部キーはリレーショナルデータベースにおいてデータの整合性を保証するために使用されます。プライマリキーの値は通常、各行で一意であり、`NULL`ではありません。行内の各外部キーの値は、プライマリキーテーブルのプライマリキー列に存在するか、`NULL`である必要があります。BigQueryでは、これらの制約は強制されませんが、クエリオプティマイザはこの情報を利用してクエリをより効果的に最適化することがあります。

ClickHouseでも、テーブルにプライマリキーを設定できます。BigQueryと同様に、ClickHouseはテーブルのプライマリキー列の値に対して一意性を強制しません。BigQueryとは異なり、テーブルのデータはプライマリキー列によって[ソートされた](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)状態でディスクに保存されます。クエリオプティマイザはこのソート順序を利用して、再ソートを防ぎ、結合時のメモリ使用量を最小化し、limit句のショートサーキットを可能にします。BigQueryとは異なり、ClickHouseはプライマリキー列の値に基づいて[(スパース)プライマリインデックス](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)を自動的に作成します。このインデックスは、プライマリキー列に対するフィルタを含むすべてのクエリを高速化するために使用されます。ClickHouseは現在、外部キー制約をサポートしていません。


## セカンダリインデックス（ClickHouseでのみ利用可能） {#secondary-indexes-only-available-in-clickhouse}

テーブルの主キー列の値から作成されるプライマリインデックスに加えて、ClickHouseでは主キー以外の列にセカンダリインデックスを作成できます。ClickHouseは複数のタイプのセカンダリインデックスを提供しており、それぞれ異なるタイプのクエリに適しています：

- **Bloom Filter Index**：
  - 等価条件（例：=、IN）を含むクエリの高速化に使用されます。
  - 確率的データ構造を使用して、データブロック内に値が存在するかどうかを判定します。
- **Token Bloom Filter Index**：
  - Bloom Filter Indexと類似していますが、トークン化された文字列に使用され、全文検索クエリに適しています。
- **Min-Max Index**：
  - 各データパートの列の最小値と最大値を保持します。
  - 指定された範囲外のデータパートの読み取りをスキップするのに役立ちます。


## 検索インデックス {#search-indexes}

BigQueryの[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)と同様に、ClickHouseテーブルでは文字列型のカラムに対して[全文インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成できます。


## ベクトルインデックス {#vector-indexes}

BigQueryは最近、Pre-GA機能として[ベクトルインデックス](https://cloud.google.com/bigquery/docs/vector-index)を導入しました。同様に、ClickHouseもベクトル検索のユースケースを[高速化するためのインデックス](/engines/table-engines/mergetree-family/annindexes)を実験的にサポートしています。


## パーティショニング {#partitioning}

BigQueryと同様に、ClickHouseはテーブルパーティショニングを使用して、大規模なテーブルをパーティションと呼ばれるより小さく管理しやすい単位に分割することで、パフォーマンスと管理性を向上させます。ClickHouseのパーティショニングの詳細については、[こちら](/engines/table-engines/mergetree-family/custom-partitioning-key)をご覧ください。


## クラスタリング {#clustering}

クラスタリングを使用すると、BigQueryは指定された複数の列の値に基づいてテーブルデータを自動的にソートし、最適なサイズのブロックに配置します。クラスタリングによりクエリのパフォーマンスが向上し、BigQueryはクエリ実行コストをより正確に見積もることができます。クラスタ化された列を使用することで、クエリは不要なデータのスキャンを排除することもできます。

ClickHouseでは、データはテーブルのプライマリキー列に基づいて自動的に[ディスク上でクラスタ化](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)され、プライマリインデックスのデータ構造を利用するクエリによって迅速に特定またはプルーニングできるブロックに論理的に編成されます。


## マテリアライズドビュー {#materialized-views}

BigQueryとClickHouseはどちらもマテリアライズドビューをサポートしています。マテリアライズドビューは、ベーステーブルに対する変換クエリの結果を事前計算したものであり、パフォーマンスと効率の向上を実現します。


## マテリアライズドビューのクエリ {#querying-materialized-views}

BigQueryのマテリアライズドビューは、直接クエリすることも、オプティマイザーがベーステーブルへのクエリを処理する際に使用することもできます。ベーステーブルへの変更によってマテリアライズドビューが無効化される可能性がある場合、データはベーステーブルから直接読み取られます。ベーステーブルへの変更がマテリアライズドビューを無効化しない場合は、残りのデータはマテリアライズドビューから読み取られ、変更部分のみがベーステーブルから読み取られます。

ClickHouseでは、マテリアライズドビューは直接クエリすることのみ可能です。ただし、BigQuery(マテリアライズドビューはベーステーブルへの変更から5分以内に自動的に更新されますが、[30分ごと](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)より頻繁には更新されません)と比較して、マテリアライズドビューは常にベーステーブルと同期しています。

**マテリアライズドビューの更新**

BigQueryは、ビューの変換クエリをベーステーブルに対して実行することで、マテリアライズドビューを定期的に完全更新します。更新の間隔では、BigQueryはマテリアライズドビューのデータと新しいベーステーブルのデータを組み合わせることで、マテリアライズドビューを使用しながら一貫性のあるクエリ結果を提供します。

ClickHouseでは、マテリアライズドビューは増分更新されます。この増分更新メカニズムは、高いスケーラビリティと低い計算コストを実現します。増分更新されるマテリアライズドビューは、ベーステーブルに数十億行または数兆行が含まれるシナリオに特化して設計されています。マテリアライズドビューを更新するために絶えず増大するベーステーブルに繰り返しクエリを実行する代わりに、ClickHouseは新しく挿入されたベーステーブルの行の値(のみ)から部分的な結果を計算します。この部分的な結果は、バックグラウンドで以前に計算された部分的な結果と増分的にマージされます。これにより、ベーステーブル全体からマテリアライズドビューを繰り返し更新する場合と比較して、計算コストが劇的に削減されます。


## トランザクション {#transactions}

ClickHouseとは対照的に、BigQueryは単一クエリ内での複数ステートメントトランザクション、またはセッション使用時の複数クエリにまたがるトランザクションをサポートしています。複数ステートメントトランザクションを使用すると、1つ以上のテーブルに対する行の挿入や削除などの変更操作を実行し、それらの変更をアトミックにコミットまたはロールバックできます。複数ステートメントトランザクションは[ClickHouseの2024年ロードマップ](https://github.com/ClickHouse/ClickHouse/issues/58392)に含まれています。


## 集約関数 {#aggregate-functions}

BigQueryと比較して、ClickHouseには組み込みの集約関数が大幅に多く用意されています:

- BigQueryには[18個の集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)と[4個の近似集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)があります。
- ClickHouseには150個以上の[事前構築された集約関数](/sql-reference/aggregate-functions/reference)があり、さらに事前構築された集約関数の動作を[拡張](https://www.youtube.com/watch?v=7ApwD0cfAFI)するための強力な[集約コンビネータ](/sql-reference/aggregate-functions/combinators)も備えています。例えば、[-Array接尾辞](/sql-reference/aggregate-functions/combinators#-array)を付けて呼び出すだけで、150個以上の事前構築された集約関数をテーブル行ではなく配列に適用できます。[-Map接尾辞](/sql-reference/aggregate-functions/combinators#-map)を使用すると、任意の集約関数をマップに適用でき、[-ForEach接尾辞](/sql-reference/aggregate-functions/combinators#-foreach)を使用すると、任意の集約関数をネストされた配列に適用できます。


## データソースとファイル形式 {#data-sources-and-file-formats}

BigQueryと比較して、ClickHouseは大幅に多くのファイル形式とデータソースをサポートしています:

- ClickHouseは、ほぼすべてのデータソースから90種類以上のファイル形式でのデータ読み込みをネイティブにサポートしています
- BigQueryは5種類のファイル形式と19種類のデータソースをサポートしています


## SQL言語機能 {#sql-language-features}

ClickHouseは、分析タスクに適した多数の拡張機能と改善を加えた標準SQLを提供しています。例えば、ClickHouse SQLは[ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)と高階関数をサポートしているため、変換を適用する際に配列をunnest/explodeする必要がありません。これはBigQueryなどの他のシステムと比較して大きな利点となります。


## 配列 {#arrays}

BigQueryの8つの配列関数と比較して、ClickHouseは80以上の[組み込み配列関数](/sql-reference/functions/array-functions)を提供しており、幅広い問題をエレガントかつシンプルにモデル化し解決できます。

ClickHouseにおける典型的な設計パターンは、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集約関数を使用してテーブルの特定の行の値を(一時的に)配列に変換することです。変換後は配列関数を使って便利に処理でき、結果は[`arrayJoin`](/sql-reference/functions/array-join)集約関数を使って個別のテーブル行に戻すことができます。

ClickHouse SQLは[高階ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)をサポートしているため、多くの高度な配列操作は、BigQueryでしばしば[必要とされる](https://cloud.google.com/bigquery/docs/arrays)ように配列を一時的にテーブルに変換し直すことなく、高階組み込み配列関数のいずれかを呼び出すだけで実現できます。例えば、配列の[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[結合](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)などです。ClickHouseでは、これらの操作はそれぞれ高階関数[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter)と[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)の単純な関数呼び出しで実現できます。

以下に、BigQueryからClickHouseへの配列操作のマッピングを示します:

| BigQuery                                                                                                         | ClickHouse                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)       | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)       | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)     | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)   | [range](/sql-reference/functions/array-functions#range)                                     |

**サブクエリの各行に対して1つの要素を持つ配列を作成する**

_BigQuery_

[ARRAY関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

```sql
SELECT ARRAY
  (SELECT 1 UNION  ALL
   SELECT 2 UNION ALL
   SELECT 3) AS new_array;

/*-----------*
 | new_array |
 +-----------+
 | [1, 2, 3] |
 *-----------*/
```

_ClickHouse_

[groupArray](/sql-reference/aggregate-functions/reference/grouparray)集約関数

```sql
SELECT groupArray(*) AS new_array
FROM
(
    SELECT 1
    UNION ALL
    SELECT 2
    UNION ALL
    SELECT 3
)
   ┌─new_array─┐
1. │ [1,2,3]   │
   └───────────┘
```

**配列を行のセットに変換する**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子

```sql
SELECT *
FROM UNNEST(['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'])
  AS element
WITH OFFSET AS offset
ORDER BY offset;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

_ClickHouse_

[ARRAY JOIN](/sql-reference/statements/select/array-join)句


```sql
WITH ['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'] AS values
SELECT element, num-1 AS offset
FROM (SELECT values AS element) AS subquery
ARRAY JOIN element, arrayEnumerate(element) AS num;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

**日付の配列を返す**

*BigQuery*

[GENERATE&#95;DATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) 関数

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 関数

*ClickHouse*

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**タイムスタンプの配列を返す**

*BigQuery*

[GENERATE&#95;TIMESTAMP&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) 関数

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

*ClickHouse*

[range](/sql-reference/functions/array-functions#range) 関数 + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 関数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

クエリ ID: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**配列のフィルタリング**

*BigQuery*

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使用して、配列を一旦テーブルに変換する必要がある。

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT
  ARRAY(SELECT x * 2
        FROM UNNEST(some_numbers) AS x
        WHERE x < 5) AS doubled_less_than_five
FROM Sequences;

/*------------------------*
 | doubled_less_than_five |
 +------------------------+
 | [0, 2, 2, 4, 6]        |
 | [4, 8]                 |
 | []                     |
 *------------------------*/
```

*ClickHouse*


[arrayFilter](/sql-reference/functions/array-functions#arrayFilter) 関数

```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT arrayMap(x -> (x * 2), arrayFilter(x -> (x < 5), some_numbers)) AS doubled_less_than_five
FROM Sequences;
   ┌─doubled_less_than_five─┐
1. │ [0,2,2,4,6]            │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
2. │ []                     │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
3. │ [4,8]                  │
   └────────────────────────┘
```

**配列のジップ**

*BigQuery*

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使用して、配列を一時的にテーブルに戻す必要がある。

```sql
WITH
  Combinations AS (
    SELECT
      ['a', 'b'] AS letters,
      [1, 2, 3] AS numbers
  )
SELECT
  ARRAY(
    SELECT AS STRUCT
      letters[SAFE_OFFSET(index)] AS letter,
      numbers[SAFE_OFFSET(index)] AS number
    FROM Combinations
    CROSS JOIN
      UNNEST(
        GENERATE_ARRAY(
          0,
          LEAST(ARRAY_LENGTH(letters), ARRAY_LENGTH(numbers)) - 1)) AS index
    ORDER BY index
  );

/*------------------------------*
 | pairs                        |
 +------------------------------+
 | [{ letter: "a", number: 1 }, |
 |  { letter: "b", number: 2 }] |
 *------------------------------*/
```

*ClickHouse*

[arrayZip](/sql-reference/functions/array-functions#arrayZip) 関数

```sql
WITH Combinations AS
    (
        SELECT
            ['a', 'b'] AS letters,
            [1, 2, 3] AS numbers
    )
SELECT arrayZip(letters, arrayResize(numbers, length(letters))) AS pairs
FROM Combinations;
   ┌─pairs─────────────┐
1. │ [('a',1),('b',2)] │
   └───────────────────┘
```

**配列の集約**

*BigQuery*

配列を [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子でテーブルに戻す必要がある

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT some_numbers,
  (SELECT SUM(x)
   FROM UNNEST(s.some_numbers) AS x) AS sums
FROM Sequences AS s;

/*--------------------+------*
 | some_numbers       | sums |
 +--------------------+------+
 | [0, 1, 1, 2, 3, 5] | 12   |
 | [2, 4, 8, 16, 32]  | 62   |
 | [5, 10]            | 15   |
 *--------------------+------*/
```

*ClickHouse*

[arraySum](/sql-reference/functions/array-functions#arraySum)、[arrayAvg](/sql-reference/functions/array-functions#arrayAvg) などの関数名、または既存の 90 種類以上のいずれかの集約関数名を、[arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 関数の引数として指定できます


```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT
    some_numbers,
    arraySum(some_numbers) AS sums
FROM Sequences;
   ┌─some_numbers──┬─sums─┐
1. │ [0,1,1,2,3,5] │   12 │
   └───────────────┴──────┘
   ┌─some_numbers──┬─sums─┐
2. │ [2,4,8,16,32] │   62 │
   └───────────────┴──────┘
   ┌─some_numbers─┬─sums─┐
3. │ [5,10]       │   15 │
   └──────────────┴──────┘
```
