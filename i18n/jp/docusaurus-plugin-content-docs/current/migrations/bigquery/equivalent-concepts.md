---
title: BigQuery vs ClickHouse Cloud
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: BigQueryがClickHouse Cloudとどのように異なるか
keywords: [migrate, migration, migrating, data, etl, elt, BigQuery]
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';


# BigQuery vs ClickHouse Cloud: 同等の概念と異なる概念

## リソースの整理 {#resource-organization}

ClickHouse Cloudにおけるリソースの整理方式は、[BigQueryのリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)に類似しています。下記の図に基づいて、具体的な違いを説明します。この図はClickHouse Cloudのリソース階層を示しています：

<img src={bigquery_1}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

### 組織 {#organizations}

BigQueryと同様に、組織はClickHouse Cloudのリソース階層におけるルートノードです。ClickHouse Cloudアカウントに最初に設定したユーザーは、自動的にそのユーザーが所有する組織に割り当てられます。ユーザーは他のユーザーを組織に招待することができます。

### BigQueryプロジェクトとClickHouse Cloudサービス {#bigquery-projects-vs-clickhouse-cloud-services}

組織内では、ClickHouse Cloudでは保存されているデータがサービスに関連付けられているため、BigQueryプロジェクトに類似したサービスを作成できます。ClickHouse Cloudには、[いくつかのサービスタイプが利用可能です](/cloud/manage/cloud-tiers)。各ClickHouse Cloudサービスは特定のリージョンに展開され、以下を含みます：

1. コンピュートノードのグループ（現在、開発段階のサービスには2ノード、プロダクション段階のサービスには3ノードがあります）。これらのノードについて、ClickHouse Cloudは[手動および自動での垂直および水平スケーリングをサポートします](/manage/scaling#vertical-and-horizontal-scaling)。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダー。
3. エンドポイント（またはClickHouse Cloud UIコンソール経由で作成された複数のエンドポイント） - サービスに接続するために使用するサービスのURL（例： `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。

### BigQueryデータセットとClickHouse Cloudデータベース {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouseは論理的にテーブルをデータベースにグループ化します。BigQueryデータセットのように、ClickHouseデータベースはテーブルデータを整理し、アクセスを制御する論理的なコンテナです。

### BigQueryフォルダ {#bigquery-folders}

ClickHouse Cloudには、現在BigQueryフォルダに相当する概念はありません。

### BigQueryスロット予約とクォータ {#bigquery-slot-reservations-and-quotas}

BigQueryのスロット予約と同様に、ClickHouse Cloudでも[垂直および水平の自動スケーリングを構成できます](/manage/scaling#configuring-vertical-auto-scaling)。垂直自動スケーリングでは、サービスのコンピュートノードのメモリとCPUコアの最小サイズと最大サイズを設定できます。サービスはこれらの範囲内で必要に応じてスケールします。これらの設定は、初期サービス作成フローの際にも利用可能です。サービス内の各コンピュートノードは同じサイズです。サービス内のコンピュートノードの数は、[水平スケーリング](/manage/scaling#self-serve-horizontal-scaling)で変更できます。

さらに、BigQueryのクォータに似て、ClickHouse Cloudは同時実行制御、メモリ使用制限、およびI/Oスケジューリングを提供しており、ユーザーがクエリをワークロードクラスに分離できるようにしています。特定のワークロードクラスに対して、共有リソース（CPUコア、DRAM、ディスクおよびネットワークI/O）に制限を設定することにより、これらのクエリが他の重要なビジネスクエリに影響を与えることがないようにします。同時実行制御により、高い数の同時クエリがあるシナリオでのスレッドのオーバーサブスクリプションを防ぎます。

ClickHouseは、サーバー、ユーザー、およびクエリレベルでのメモリ確保のバイトサイズを追跡し、柔軟なメモリ使用制限を可能にします。メモリのオーバーコミットにより、クエリは保証されたメモリを超える追加の空きメモリを使用できる一方で、他のクエリのためのメモリ制限を確保します。また、集計、ソート、結合句のためのメモリ使用も制限でき、メモリ制限を超えた場合には外部アルゴリズムにフォールバックします。

最後に、I/Oスケジューリングにより、ユーザーは最大帯域幅、インフライトリクエスト、およびポリシーに基づいてワークロードクラスのためにローカルおよびリモートディスクアクセスを制限できます。

### 権限 {#permissions}

ClickHouse Cloudは、[クラウドコンソール](/cloud/security/cloud-access-management)とデータベースの2か所で[ユーザーアクセスを制御します](/cloud/get-started/sql-console)。コンソールアクセスは[clickhouse.cloud](https://console.clickhouse.cloud)のユーザーインターフェースを通じて管理されます。データベースアクセスは、データベースユーザーアカウントおよびロールを介して管理されます。さらに、コンソールユーザーに対して、SQLコンソールを介してデータベースと対話できるようにするロールをデータベース内で付与することができます。

## データ型 {#data-types}

ClickHouseは数値に関してより細かな精度を提供します。たとえば、BigQueryは[`INT64`, `NUMERIC`, `BIGNUMERIC`および`FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)という数値型を提供しています。これらは、ClickHouseが提供する小数点、浮動小数点、整数用の複数の精度型と対比されます。これらのデータ型を使用することにより、ClickHouseユーザーはストレージとメモリのオーバーヘッドを最適化できるため、クエリの速度が向上し、リソース消費が削減されます。以下に、各BigQuery型に対するClickHouseの相当する型を示します。

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (より狭い範囲) |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (より狭い範囲、高精度) |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [式としてサポート](/sql-reference/data-types/special-data-types/interval#usage-remarks)または[関数を介して](/sql-reference/functions/date-time-functions#addyears-addmonths-addweeks-adddays-addhours-addminutes-addseconds-addquarters) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/overview#relying-on-schema-inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

複数のClickHouse型の選択肢がある場合は、データの実際の範囲を考慮し、最も要求されるものを選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を活用することも考慮してください。

## クエリ加速技術 {#query-acceleration-techniques}

### 主キーおよび外部キーと主インデックス {#primary-and-foreign-keys-and-primary-index}

BigQueryでは、テーブルに[主キーと外部キー制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を定義できます。一般に、主キーおよび外部キーは、データの整合性を確保するために関係データベースで使用されます。主キーの値は通常、各行に対して一意であり、`NULL`ではありません。行内の各外部キーの値は、主キーが定義されたテーブルの主キー列に存在する必要があるか、`NULL`でなければなりません。BigQueryでは、これらの制約は強制されませんが、クエリオプティマイザはこの情報を利用してクエリを最適化することがあります。

ClickHouseでも、テーブルには主キーを持つことができます。BigQueryとは異なり、ClickHouseはテーブルの主キー列の値の一意性を強制しません。ただし、テーブルのデータは、主キー列によって[ディスク上に順序付けて格納されます](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)。クエリオプティマイザは、このソート順序を利用して再ソートを避け、結合のメモリ使用量を最小限に抑え、制限句のためにショートサーキットを有効にします。ClickHouseは、主キー列の値に基づいて[（スパース）主インデックス](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)を自動的に作成します。このインデックスは、主キー列にフィルターが含まれるすべてのクエリを加速するために使用されます。現在、ClickHouseは外部キー制約をサポートしていません。

## セカンダリインデックス（ClickHouseのみ利用可能） {#secondary-indexes-only-available-in-clickhouse}

ClickHouseでは、テーブルの主キー列の値から作成された主インデックスに加えて、主キー以外の列に対してセカンダリインデックスを作成することも可能です。ClickHouseでは、いくつかの異なるクエリタイプに合ったセカンダリインデックスが提供されています：

- **ブルームフィルターインデックス**:
  - 等価条件を持つクエリ（例：=、IN）の速度を向上させるために使用されます。
  - 確率的データ構造を使用して、データブロック内に値が存在するかどうかを判断します。
- **トークンブルームフィルターインデックス**:
  - ブルームフィルターインデックスに似ていますが、トークン化された文字列に使用され、全文検索クエリに適しています。
- **最小最大インデックス**:
  - 各データパートの最小値と最大値を列のために維持します。
  - 指定された範囲に該当しないデータパーツを読み取ることをスキップするのに役立ちます。

## 検索インデックス {#search-indexes}

[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)として、BigQueryでのClickHouseテーブルに対して文字列値を持つ列に[全文インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成できます。

## ベクトルインデックス {#vector-indexes}

BigQueryは最近、[ベクトルインデックス](https://cloud.google.com/bigquery/docs/vector-index)をGA前の機能として導入しました。同様に、ClickHouseは[ベクトル検索](/engines/table-engines/mergetree-family/annindexes)の使用ケースを加速するためのインデックスに対して実験的なサポートがあります。

## パーティショニング {#partitioning}

BigQueryと同様に、ClickHouseはテーブルをパーティションと呼ばれるより小さく、管理しやすい部分に分割することで、大きなテーブルのパフォーマンスと管理の向上に寄与します。ClickHouseのパーティショニングについては、[こちらで詳細に説明します](/engines/table-engines/mergetree-family/custom-partitioning-key)。

## クラスタリング {#clustering}

クラスタリングを使用すると、BigQueryはテーブルデータを指定された少数の列の値に基づいて自動的にソートし、最適なサイズのブロック内に配置します。クラスタリングはクエリパフォーマンスを向上させ、BigQueryがクエリを実行するコストをよりよく見積もることを可能にします。クラスタ化された列を使用することで、クエリは不要なデータのスキャンを排除します。

ClickHouseでは、データがテーブルの主キー列に基づいて自動的に[ディスク上でクラスタリングされ](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)、クエリが主インデックスデータ構造を利用して迅速に見つけたり、廃棄したりできるブロックに論理的に整理されています。

## マテリアライズドビュー {#materialized-views}

BigQueryとClickHouseの両方が、パフォーマンスと効率を向上させるために基底テーブルに対する変換クエリの結果に基づいた事前計算された結果であるマテリアライズドビューをサポートしています。

## マテリアライズドビューのクエリ {#querying-materialized-views}

BigQueryのマテリアライズドビューは直接クエリ可能であり、最適化ツールにより基底テーブルへのクエリ処理に使用されます。基底テーブルに変更があるとマテリアライズドビューが無効になる場合、データは基底テーブルから直接読み取られます。基底テーブルに対する変更がマテリアライズドビューに無効でない場合、データの残りはマテリアライズドビューから読み取られ、変更のみが基底テーブルから読み取られます。

ClickHouseでは、マテリアライズドビューは直接クエリ可能です。ただし、BigQueryと比較すると（BigQueryでは、マテリアライズドビューは基底テーブルの変更から5分以内に自動的に更新されますが、[30分以上の頻度では更新されません](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)）、ClickHouseではマテリアライズドビューは常に基底テーブルと同期されています。

**マテリアライズドビューの更新**

BigQueryでは、定期的にマテリアライズドビューを完全に更新するために、ビューの変換クエリを基底テーブルに対して実行します。更新間の時間、BigQueryはマテリアライズドビューのデータと新しい基底テーブルデータを組み合わせて、マテリアライズドビューを使用しつつも、整合性のあるクエリ結果を提供します。

ClickHouseでは、マテリアライズドビューは段階的に更新されます。この段階的更新メカニズムは、高度なスケーラビリティと低計算コストを提供します：段階的に更新されるマテリアライズドビューは、基底テーブルに数十億または数兆の行が含まれるシナリオに特に最適化されています。マテリアライズドビューを更新するために常に成長する基底テーブルをクエリする代わりに、ClickHouseは新たに挿入された基底テーブル行の値の（のみの）部分結果を計算します。この部分結果は、バックグラウンドで以前に計算された部分結果と段階的に結合されます。これにより、マテリアライズドビューを基底テーブル全体から繰り返し更新する場合と比較して、計算コストが劇的に削減されます。

## トランザクション {#transactions}

ClickHouseとは対照的に、BigQueryはセッションを使用する場合、一つのクエリ内または複数のクエリ間でのマルチステートメントトランザクションをサポートしています。マルチステートメントトランザクションにより、1つ以上のテーブルに対して行を挿入または削除するような変更操作を行い、変更を原子的にコミットまたはロールバックすることができます。マルチステートメントトランザクションは、[ClickHouseの2024年のロードマップ](https://github.com/ClickHouse/ClickHouse/issues/58392)に含まれています。

## 集約関数 {#aggregate-functions}

BigQueryと比較すると、ClickHouseは内蔵の集約関数が大幅に多いです：

- BigQueryは[18の集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)と[4つの近似集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)を提供しています。
- ClickHouseには、[150以上の事前構築された集約関数](/sql-reference/aggregate-functions/reference)及び[強力な集約コンビネータ](/sql-reference/aggregate-functions/combinators)があり、[事前構築された集約関数の動作を拡張](https://www.youtube.com/watch?v=7ApwD0cfAFI)できます。たとえば、150以上の事前構築された集約関数を、テーブルの行ではなく配列に適用することができます、その際、[-Arrayサフィックス](/sql-reference/aggregate-functions/combinators#-array)を使うことで実現できます。[-Mapサフィックス](/sql-reference/aggregate-functions/combinators#-map)を使うと、どの集約関数に対してもマップに適用できます。[-ForEachサフィックス](/sql-reference/aggregate-functions/combinators#-foreach)を使えば、どの集約関数でもネストされた配列に対して適用可能です。

## データソースとファイルフォーマット {#data-sources-and-file-formats}

BigQueryと比較して、ClickHouseは大幅に多くのファイルフォーマットとデータソースをサポートします：

- ClickHouseは、事実上すべてのデータソースから90以上のファイルフォーマットでデータを読み込むためのネイティブサポートがあります。
- BigQueryは5つのファイルフォーマットと19のデータソースをサポートしています。

## SQL言語機能 {#sql-language-features}

ClickHouseは、標準SQLを提供し、多くの拡張や改善が加えられており、分析タスクに対してより使いやすいものにしています。例えば、ClickHouse SQLは[ラムダ関数](/sql-reference/functions#higher-order-functions---operator-and-lambdaparams-expr-function)と高次関数をサポートしているため、変換を適用する際に配列を未ネスト化または展開する必要がありません。これは、BigQueryなどの他のシステムに対して大きな利点です。

## 配列 {#arrays}

BigQueryの8つの配列関数と比較して、ClickHouseには80以上の[内蔵配列関数](/sql-reference/functions/array-functions)があり、幅広い問題を優雅かつシンプルにモデリングし解決することが可能です。

ClickHouseでの典型的なデザインパターンは、テーブルの特定の行の値を配列に（一時的に）変換するために[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集約関数を使用することです。これにより、後に配列関数を介して便利に処理され、結果は[`arrayJoin`](/sql-reference/functions/array-join)集約関数を介して個々のテーブル行に戻すことができます。

ClickHouse SQLが[高次ラムダ関数](/sql-reference/functions#higher-order-functions---operator-and-lambdaparams-expr-function)をサポートしているため、多くの高度な配列操作は、配列を一時的にテーブルに戻すことなく、単純に高次関数の1つを呼び出すことで実現できます。これは、BigQueryでしばしば[要求される](https://cloud.google.com/bigquery/docs/arrays)配列の[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[ジッピング](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)に役立ちます。ClickHouseでは、これらの操作はそれぞれ高次関数[`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-)と[`arrayZip`](/sql-reference/functions/array-functions#arrayzip)という単純な関数呼び出しで済みます。

以下に、BigQueryからClickHouseへの配列操作のマッピングを提供します：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**サブクエリの各行に対して1要素の配列を作成する**

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

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)オペレーター

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

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-)関数

_ClickHouse_

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

配列を一時的にテーブルに戻すことが必要で、[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)オペレーターを介して作業を行う

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

**配列のジッピング**

_BigQuery_

配列を一時的にテーブルに戻すことが必要で、[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)オペレーターを介して作業を行う

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

配列を一時的にテーブルに戻す作業が必要で、[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)オペレーターを介して作業を行う

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

[arraySum](/sql-reference/functions/array-functions#arraysum)、[arrayAvg](/sql-reference/functions/array-functions#arrayavg)、…関数、または[arrayReduce](/sql-reference/functions/array-functions#arrayreduce)関数の引数としての90以上の既存の集約関数名

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
