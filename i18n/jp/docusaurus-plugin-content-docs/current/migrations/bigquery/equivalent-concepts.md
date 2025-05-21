---
title: 'BigQueryとClickHouse Cloudの比較'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'BigQueryがClickHouse Cloudと異なる点'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
---
```

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# BigQuery vs ClickHouse Cloud: 同等及び異なる概念

## リソースの組織 {#resource-organization}

ClickHouse Cloudにおけるリソースの組織化は、[BigQueryのリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)に似ています。以下の図に基づいて具体的な違いを説明します。

<Image img={bigquery_1} size="md" alt="リソースの組織"/>

### 組織 {#organizations}

BigQueryと同様に、組織はClickHouse Cloudリソース階層のルートノードです。ClickHouse Cloudアカウントに設定された最初のユーザーは、自動的にユーザーが所有する組織に割り当てられます。ユーザーは追加のユーザーを組織に招待することができます。

### BigQueryプロジェクトとClickHouse Cloudサービス {#bigquery-projects-vs-clickhouse-cloud-services}

組織内では、ClickHouse Cloudに保存されたデータがサービスに関連付けられているため、BigQueryプロジェクトにおおむね相当するサービスを作成することができます。ClickHouse Cloudには[利用可能なサービスの種類がいくつかあります](/cloud/manage/cloud-tiers)。各ClickHouse Cloudサービスは特定のリージョンにデプロイされ、以下を含みます：

1. 計算ノードのグループ（現在、Developmentティアサービスには2ノード、Productionティアサービスには3ノード）。これらのノードに対して、ClickHouse Cloudは[縦横のスケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud)を手動または自動でサポートしています。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダ。
3. エンドポイント（またはClickHouse Cloud UIコンソール経由で作成された複数のエンドポイント） - サービスに接続するために使用するサービスURL（例えば、`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQueryデータセットとClickHouse Cloudデータベース {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouseは論理的にテーブルをデータベースにグループ化します。BigQueryデータセットのように、ClickHouseデータベースはテーブルデータのアクセスを整理し制御する論理コンテナです。

### BigQueryフォルダ {#bigquery-folders}

ClickHouse Cloudには、現在BigQueryフォルダに相当する概念はありません。

### BigQueryスロット予約とクォータ {#bigquery-slot-reservations-and-quotas}

BigQueryのスロット予約と同様に、ClickHouse Cloudでは[縦横の自動スケーリングを構成できます](/manage/scaling#configuring-vertical-auto-scaling)。縦の自動スケーリングのために、サービスの計算ノードのメモリとCPUコアの最小および最大サイズを設定できます。その後、サービスは必要に応じてこれらの範囲内でスケールします。これらの設定は、初期サービス作成フローの間でも利用可能です。サービス内の各計算ノードは同じサイズです。サービス内の計算ノードの数は[水平スケーリング](/manage/scaling#manual-horizontal-scaling)で変更できます。

さらに、BigQueryクォータに似て、ClickHouse Cloudは同時実行制御、メモリ使用制限、およびI/Oスケジューリングを提供し、ユーザーがクエリをワークロードクラスに分離できるようにします。特定のワークロードクラスに対して共有リソース（CPUコア、DRAM、デスクトップおよびネットワークI/O）に制限を設定することで、これらのクエリが他の重要なビジネスクエリに影響を与えないようにします。同時実行制御は、高い数の同時クエリがあるシナリオでスレッドの過剰予約を防止します。

ClickHouseは、サーバー、ユーザー、クエリレベルでのメモリ割り当てのバイトサイズを追跡し、柔軟なメモリ使用制限を可能にします。メモリのオーバーコミットにより、クエリは保証されたメモリを超えて追加の空きメモリを使用することができますが、他のクエリのメモリ制限を保証します。さらに、集計、ソート、結合句のメモリ使用量を制限することができ、メモリ制限が超過した場合は外部アルゴリズムにフォールバックします。

最後に、I/Oスケジューリングを使用すると、ユーザーはワークロードクラスに対して、最大帯域幅、進行中のリクエスト、およびポリシーに基づいてローカルおよびリモートディスクアクセスを制限できます。

### 権限 {#permissions}

ClickHouse Cloudは、[クラウドコンソール](/cloud/get-started/sql-console)とデータベースの2つの場所でユーザーアクセスを[制御](/cloud/security/cloud-access-management)します。コンソールアクセスは、[clickhouse.cloud](https://console.clickhouse.cloud)ユーザーインターフェースを介して管理されます。データベースアクセスは、データベースユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーはデータベース内でロールを付与され、SQLコンソールを介してデータベースと相互作用できるようになります。

## データ型 {#data-types}

ClickHouseは数値に関してより細かい精度を提供します。例えば、BigQueryは数値型[`INT64`, `NUMERIC`, `BIGNUMERIC`, `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)を提供しています。これに対して、ClickHouseは小数、浮動小数点、整数のために複数の精度タイプを提供しています。これらのデータ型を使用することにより、ClickHouseユーザーはストレージとメモリオーバーヘッドを最適化し、より迅速なクエリと低いリソース消費を実現できます。以下に、各BigQuery型に対するClickHouse型の対応関係を示します：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32)（より狭い範囲） |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime)、[DateTime64](/sql-reference/data-types/datetime64)（狭い範囲、高精度） |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [式としてサポート](/sql-reference/data-types/special-data-types/interval#usage-remarks)または[関数を介して](/sql-reference/functions/date-time-functions#addyears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple)、[Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

ClickHouse型の複数のオプションが提示された場合は、データの実際の範囲を考慮し、必要な最低値を選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を利用することも検討してください。

## クエリ加速技術 {#query-acceleration-techniques}

### 主キー、外部キー、主インデックス {#primary-and-foreign-keys-and-primary-index}

BigQueryでは、テーブルに[主キーと外部キーの制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を設定できます。通常、主キーと外部キーは、データの整合性を保証するためにリレーショナルデータベースで使用されます。主キーの値は通常、各行において一意であり、`NULL`ではありません。行の外部キーの各値は、主キーのテーブルの主キーのカラムに存在する必要があるか、`NULL`でなければなりません。BigQueryでは、これらの制約は強制されませんが、クエリオプティマイザーはこの情報を使用してクエリをよりよく最適化する可能性があります。

ClickHouseでは、テーブルにも主キーがあります。BigQueryと同様に、ClickHouseはテーブルの主キーのカラム値の一意性を強制しません。BigQueryと異なり、テーブルのデータは[主キーのカラムで](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)ディスク上に順序付けて保存されます。クエリオプティマイザーはこのソート順を利用して再ソートを防ぎ、結合におけるメモリ使用量を最小限に抑え、制限句のショートサーキットを可能にします。BigQueryとは異なり、ClickHouseは[主キーのカラム値に基づいて](https://guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)自動的に（スパース）主インデックスを作成します。このインデックスは、主キーのカラムに対するフィルタを含むすべてのクエリを高速化するために使用されます。ClickHouseは現在、外部キーの制約をサポートしていません。

## セカンダリインデックス（ClickHouseのみ利用可能） {#secondary-indexes-only-available-in-clickhouse}

ClickHouseでは、テーブルの主キーのカラム以外にセカンダリインデックスを作成することもできます。ClickHouseは、さまざまなタイプのクエリに適したいくつかのタイプのセカンダリインデックスを提供しています：

- **ブルームフィルターインデックス**：
  - 等価条件（例：=、IN）を持つクエリの速度を上げるために使用。
  - 確率的データ構造を使用して、データブロック内に値が存在するかどうかを判断します。
- **トークンブルームフィルターインデックス**：
  - ブルームフィルターインデックスに似ていますが、トークン化された文字列に使用され、全文検索クエリに適しています。
- **ミニマックスインデックス**：
  - 各データ部分のカラムの最小値と最大値を保持します。
  - 指定された範囲に含まれないデータ部分の読み取りをスキップします。

## 検索インデックス {#search-indexes}

BigQueryの[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)と同様に、ClickHouseのテーブルで文字列値を持つカラムに対して[全文インデックス](/engines/table-engines/mergetree-family/invertedindexes)が作成できます。

## ベクターインデックス {#vector-indexes}

BigQueryは最近、[ベクターインデックス](https://cloud.google.com/bigquery/docs/vector-index)をPre-GA機能として導入しました。同様に、ClickHouseもベクター検索ユースケースを加速するための[インデックス](https://engines/table-engines/mergetree-family/annindexes)を実験的にサポートしています。

## パーティショニング {#partitioning}

BigQueryと同様に、ClickHouseはテーブルパーティショニングを利用して、大きなテーブルのパフォーマンスと管理性を向上させています。テーブルをより小さく管理しやすい部分（パーティション）に分割します。ClickHouseのパーティショニングについて詳細は[こちら](/engines/table-engines/mergetree-family/custom-partitioning-key)で説明します。

## クラスタリング {#clustering}

クラスタリングを使用すると、BigQueryは指定された数カラムの値に基づいてテーブルデータを自動的にソートし、最適なサイズのブロックに配置します。クラスタリングはクエリパフォーマンスを向上させ、BigQueryがクエリの実行コストをより正確に見積もれるようにします。クラスタリングされたカラムを使用すると、クエリは不要なデータのスキャンを排除します。

ClickHouseでは、データが自動的に[ディスク上でクラスタリング](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)され、テーブルの主キーのカラムに基づいて論理的に配置され、クエリが主インデックスデータ構造を利用して迅速に見つけることができるブロックとして整理されています。

## マテリアライズドビュー {#materialized-views}

BigQueryとClickHouseの両方は、パフォーマンスと効率を向上させるためにベーステーブルに対する変換クエリの結果に基づいて事前計算された結果であるマテリアライズドビューをサポートしています。

## マテリアライズドビューのクエリ {#querying-materialized-views}

BigQueryのマテリアライズドビューは、直接クエリすることもでき、オプティマイザーがベーステーブルへのクエリを処理するために使用することもできます。ベーステーブルに対する変更がマテリアライズドビューを無効にする可能性がある場合、データはベーステーブルから直接読み取られます。ベーステーブルに対する変更がマテリアライズドビューを無効にしない場合、残りのデータはマテリアライズドビューから読み取られ、変更された部分だけがベーステーブルから読み取られます。

ClickHouseでは、マテリアライズドビューは直接クエリすることができます。ただし、BigQuery（変更の発生から5分以内、最大でも[30分ごと](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)にマテリアライズドビューが自動的に更新される）と比較して、ClickHouseのマテリアライズドビューは常にベーステーブルと同期しています。

**マテリアライズドビューの更新**

BigQueryは、マテリアライズドビューを定期的に完全に更新し、ビューの変換クエリをベーステーブルに対して実行します。更新の間、BigQueryはマテリアライズドビューのデータを新しいベーステーブルのデータと組み合わせて、一貫したクエリ結果を提供します。

ClickHouseでは、マテリアライズドビューは増分更新されます。この増分更新メカニズムは高いスケーラビリティと低い計算コストを提供します：増分更新されるマテリアライズドビューは、ベーステーブルに数十億または数兆の行が含まれているシナリオに特にエンジニアリングされています。マテリアライズドビューを更新するために永続的に成長し続けるベーステーブルにクエリを繰り返し実行するかわりに、ClickHouseは新たに挿入されたベーステーブルの行の値のみから部分的な結果を計算します。この部分的な結果は、バックグラウンドで以前に計算された部分的な結果と増分的にマージされます。そのため、マテリアライズドビューをベーステーブル全体から繰り返し更新することに比べて、計算コストが劇的に低く抑えられます。

## トランザクション {#transactions}

ClickHouseとは対照的に、BigQueryは単一のクエリ内またはセッションを使用する複数のクエリを越えてマルチステートメントトランザクションをサポートしています。マルチステートメントトランザクションを使用すると、1つ以上のテーブルにわたる行の挿入や削除などの変異操作を実行でき、変更を原子的にコミットまたはロールバックできます。マルチステートメントトランザクションは[ClickHouseの2024年のロードマップ](https://github.com/ClickHouse/ClickHouse/issues/58392)にあります。

## 集約関数 {#aggregate-functions}

BigQueryに比べて、ClickHouseは組み込みの集約関数が大幅に多く提供されています：

- BigQueryには[18の集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)と[4つの近似集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)があります。
- ClickHouseには[150以上の事前構築された集約関数](/sql-reference/aggregate-functions/reference)があり、さらに、[組み合わせを使用して](https://sql-reference/aggregate-functions/combinators)事前構築された集約関数の動作を拡張するための強力な[集約コンビネータ](/sql-reference/aggregate-functions/combinators)があります。たとえば、配列に対して150以上の事前構築された集約関数を適用することができ、[-Arrayサフィックス](/sql-reference/aggregate-functions/combinators#-array)を使って簡単に呼び出すことができます。[-Mapサフィックス](/sql-reference/aggregate-functions/combinators#-map)を使えば、マップに対して任意の集約関数を適用できます。また、[-ForEachサフィックス](/sql-reference/aggregate-functions/combinators#-foreach)を使うと、ネストされた配列に対して任意の集約関数を適用できます。

## データソースとファイル形式 {#data-sources-and-file-formats}

BigQueryに比べて、ClickHouseは大幅に多くのファイル形式とデータソースをサポートしています：

- ClickHouseは実質的にすべてのデータソースから90以上のファイル形式をネイティブにサポートしています。
- BigQueryは5つのファイル形式と19のデータソースをサポートします。

## SQL言語の特徴 {#sql-language-features}

ClickHouseは、標準SQLに対して分析タスクにより適した多くの拡張と改善を提供しています。例えば、ClickHouse SQL [はラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)や高階関数をサポートしているため、変換を適用する際に配列をネスト解除（アンネスト）する必要がありません。これは、BigQueryのような他のシステムに対する大きな利点です。

## 配列 {#arrays}

BigQueryの8つの配列関数に対し、ClickHouseは美しくシンプルに幅広い問題をモデル化し解決するために80以上の[組み込み配列関数](/sql-reference/functions/array-functions)を提供しています。

ClickHouseの一般的なデザインパターンは、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集約関数を使用してテーブルの特定の行の値を（一時的に）配列に変換することです。これにより、配列関数を介して便利に処理され、[`arrayJoin`](/sql-reference/functions/array-join)集約関数を介して再び個々のテーブルの行に変換することができます。

ClickHouse SQLが[高階ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)をサポートしているため、配列をテーブルに戻して一時的に変換する代わりに、場合によってはBigQueryで必要な[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[ジッパリング](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)を行うための簡単な関数呼び出しとして、[arrayFilter](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-)や[arrayZip](/sql-reference/functions/array-functions#arrayzip)のような高階関数を利用することができます。

以下では、BigQueryからClickHouseへの配列操作のマッピングを提供します：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**サブクエリ内の各行に対して1つの要素を持つ配列を作成**

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

**配列を行のセットに変換**

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

_BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array)関数

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

_ClickHouse_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-)関数

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**タイムスタンプの配列を返す**

_BigQuery_

[GENERATE_TIMESTAMP_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array)関数

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

_ClickHouse_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-)関数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**配列のフィルタリング**

_BigQuery_

一時的に配列をテーブルに戻すことが必要です[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子を介して

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT
  ARRAY(SELECT x * 2
        FROM UNNEST(s.some_numbers) AS x
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

_ClickHouse_

[arrayFilter](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-)関数

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

**配列のジッパリング**

_BigQuery_

一時的に配列をテーブルに戻すことが必要です[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子を介して

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

_ClickHouse_

[arrayZip](/sql-reference/functions/array-functions#arrayzip)関数

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

_BigQuery_

配列をテーブルに戻すことが必要です[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子を介して

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

_ClickHouse_

[arraySum](/sql-reference/functions/array-functions#arraysum)、[arrayAvg](/sql-reference/functions/array-functions#arrayavg)などの関数や、[arrayReduce](/sql-reference/functions/array-functions#arrayreduce)関数の引数として使える90以上の既存の集約関数も利用可能です。

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
