---
title: BigQuery対ClickHouse Cloud
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: BigQueryがClickHouse Cloudと異なる点
keywords: [migrate, migration, migrating, data, etl, elt, BigQuery]
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';


# BigQuery対ClickHouse Cloud: 同等および異なる概念

## リソースの組織 {#resource-organization}

ClickHouse Cloudにおけるリソースの組織方法は、[BigQueryのリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)に似ています。以下のClickHouse Cloudのリソース階層を示す図に基づいて、具体的な違いを説明します。

<img src={bigquery_1}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

### 組織 {#organizations}

BigQueryと同様に、組織はClickHouse Cloudリソース階層のルートノードです。ClickHouse Cloudアカウントに最初に設定したユーザーは、自動的にそのユーザーが所有する組織に割り当てられます。このユーザーは、他のユーザーをその組織に招待することができます。

### BigQueryプロジェクト対ClickHouse Cloudサービス {#bigquery-projects-vs-clickhouse-cloud-services}

組織内で、ClickHouse Cloudにおけるサービスは、BigQueryプロジェクトに緩やかに相当します。なぜなら、ClickHouse Cloud内に保存されたデータはサービスに関連付けられるからです。[ClickHouse Cloudには、いくつかのサービスタイプが利用可能です](/cloud/manage/cloud-tiers)。各ClickHouse Cloudサービスは、特定のリージョンに展開され、以下を含みます。

1. 計算ノードのグループ（現在、開発ティアサービスには2ノード、プロダクションティアサービスには3ノード）。これらのノードに対して、ClickHouse Cloudは[手動および自動での垂直および水平方向のスケーリングをサポートしています](/manage/scaling#how-scaling-works-in-clickhouse-cloud)。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダー。
3. エンドポイント（またはClickHouse Cloud UIコンソールを介して作成された複数のエンドポイント） - サービスに接続するために使用するサービスURL（例:`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQueryデータセット対ClickHouse Cloudデータベース {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouseは論理的にテーブルをデータベースにグループ化します。BigQueryデータセットと同様に、ClickHouseデータベースはテーブルデータの整理とアクセス制御を行う論理的コンテナです。

### BigQueryフォルダー {#bigquery-folders}

ClickHouse Cloudには、現在BigQueryのフォルダーに相当する概念はありません。

### BigQueryスロット予約とクォータ {#bigquery-slot-reservations-and-quotas}

BigQueryスロット予約のように、ClickHouse Cloudでは[垂直および水平方向のオートスケーリングを構成する]( /manage/scaling#configuring-vertical-auto-scaling)ことができます。垂直オートスケーリングでは、サービスの計算ノードのメモリとCPUコアの最小および最大サイズを設定できます。サービスは、その範囲内で必要に応じてスケールします。これらの設定は、初回のサービス作成フローでも利用可能です。サービス内の各計算ノードは同じサイズです。サービス内の計算ノードの数は[水平方向のスケーリング]( /manage/scaling#manual-horizontal-scaling)を使用して変更できます。

さらに、BigQueryのクォータに似て、ClickHouse Cloudは同時実行制御、メモリ使用量制限、I/Oスケジューリングを提供し、ユーザーがクエリをワークロードクラスに隔離することを可能にします。特定のワークロードクラスに対して共有リソース（CPUコア、DRAM、ディスクおよびネットワークI/O）の制限を設定することで、これらのクエリが他の重要なビジネスクエリに影響を及ぼさないようにします。同時実行制御は、高数の同時クエリがあるシナリオにおいてスレッドのオーバーサブスクリプションを防止します。

ClickHouseは、サーバー、ユーザー、クエリレベルでのメモリ割り当てのバイトサイズを追跡し、柔軟なメモリ使用制限を可能にします。メモリオーバーコミットにより、保証されたメモリを超えて追加の空きメモリをクエリが使用できるようにし、他のクエリのためのメモリ制限を保証します。さらに、集計、ソート、および結合句に対するメモリ使用量を制限できるため、メモリ制限を超えた場合には外部アルゴリズムにフォールバックすることができます。

最後に、I/Oスケジューリングは、ユーザーがワークロードクラスに対して最大帯域幅、処理中のリクエスト、およびポリシーに基づいてローカルおよびリモートディスクアクセスを制限できるようにします。

### 権限 {#permissions}

ClickHouse Cloudは、[クラウドコンソール]( /cloud/get-started/sql-console)とデータベースを通じて、[ユーザーアクセスを制御します](/cloud/security/cloud-access-management)。コンソールアクセスは、[clickhouse.cloud](https://console.clickhouse.cloud)ユーザーインターフェースを介して管理されます。データベースアクセスは、データベースユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーには、SQLコンソールを通じてデータベースと対話できるようにするロールが付与されることがあります。[SQLコンソール]( /integrations/sql-clients/sql-console)を介して。

## データ型 {#data-types}

ClickHouseは数値に関してより詳細な精度を提供します。例えば、BigQueryは[`INT64`、`NUMERIC`、`BIGNUMERIC`、`FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)という数値型を提供します。これに対し、ClickHouseは小数、浮動小数点数、整数のための複数の精度型を提供しています。これらのデータ型を使用することで、ClickHouseユーザーはストレージとメモリのオーバーヘッドを最適化し、結果としてクエリの高速化とリソース消費の低減を実現できます。以下に、それぞれのBigQuery型に対するClickHouse型の対応を示します。

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S)、Decimal32(S)、Decimal64(S)、Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (範囲が狭い) |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime)、[DateTime64](/sql-reference/data-types/datetime64) (範囲が狭く、精度が高い) |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8、UInt16、UInt32、UInt64、UInt128、UInt256、Int8、Int16、Int32、Int64、Int128、Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [式としてサポート]( /sql-reference/data-types/special-data-types/interval#usage-remarks) または [関数を通じて]( /sql-reference/functions/date-time-functions#addyears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple)、[Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

ClickHouse型の選択肢が複数存在する場合は、データの実際の範囲を考慮し、必要な最小限の型を選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を利用することを検討してください。

## クエリ加速技術 {#query-acceleration-techniques}

### 主キーおよび外部キー、主インデックス {#primary-and-foreign-keys-and-primary-index}

BigQueryでは、テーブルに[主キーと外部キー制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を持たせることができます。通常、主キーおよび外部キーは、リレーショナルデータベースでデータの整合性を確保するために使用されます。主キーの値は通常、各行で一意であり、`NULL`ではありません。行内の各外部キーの値は、主キーが設定されたテーブルの主キー列に存在するか、`NULL`である必要があります。BigQueryではこれらの制約は強制されませんが、クエリオプティマイザーはこの情報を利用してクエリを最適化することができます。

ClickHouseでもテーブルに主キーを持たせることができます。BigQueryと同様に、ClickHouseはテーブルの主キー列の値の一意性を強制しません。BigQueryとは異なり、ClickHouseのテーブルデータは主キー列で[順序付けられた形でディスクに保存されます](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)。クエリオプティマイザーはこのソート順序を利用して再ソートを防ぎ、結合に必要なメモリ使用量を最小限に抑え、制限句のショートサーキットを有効にします。ClickHouseでは、主キー列の値に基づいて[（スパース）主インデックス](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)が自動的に作成されます。このインデックスは、主キー列にフィルターを含むすべてのクエリの速度を向上させるために使用されます。現在、ClickHouseは外部キー制約をサポートしていません。

## セカンダリインデックス（ClickHouse専用） {#secondary-indexes-only-available-in-clickhouse}

テーブルの主キー列の値から作成された主インデックスに加えて、ClickHouseでは主キー以外のカラムにセカンダリインデックスを作成することができます。ClickHouseは、さまざまなクエリタイプに適したいくつかのタイプのセカンダリインデックスを提供しています：

- **ブルームフィルターインデックス**:
  - 等価条件のあるクエリを加速するために使用されます（例：=、IN）。
  - 確率的データ構造を使用して、データブロックに値が存在するかどうかを判定します。
- **トークンブルームフィルターインデックス**:
  - ブルームフィルターインデックスに似ていますが、トークン化された文字列用で、全文検索クエリに適しています。
- **最小・最大インデックス**:
  - 各データパーツのカラムの最小値と最大値を保持します。
  - 指定された範囲に含まれないデータパーツの読み取りをスキップするのに役立ちます。

## 検索インデックス {#search-indexes}

BigQueryの[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)に似て、ClickHouseのテーブルに文字列値を持つカラムに対して[全文検索インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成できます。

## ベクトルインデックス {#vector-indexes}

BigQueryは最近、[ベクトルインデックス](https://cloud.google.com/bigquery/docs/vector-index)をPre-GA機能として導入しました。同様に、ClickHouseはベクトル検索ユースケースを加速するための[インデックス]( /engines/table-engines/mergetree-family/annindexes)に実験的に対応しています。

## パーティショニング {#partitioning}

BigQueryと同様に、ClickHouseはテーブルを小さく、管理可能な部分（パーティションと呼ばれる）に分けることで、大規模なテーブルのパフォーマンスと管理性を向上させるためのテーブルパーティショニングを利用します。ClickHouseのパーティショニングについての詳細は[こちら]( /engines/table-engines/mergetree-family/custom-partitioning-key)で説明しています。

## クラスタリング {#clustering}

クラスタリングにより、BigQueryは指定された数のカラムの値に基づいてテーブルデータを自動的にソートし、最適なサイズのブロックに配置します。クラスタリングはクエリパフォーマンスを向上させ、BigQueryがクエリの実行コストをより良く推定できるようにします。クラスタリングされたカラムを使用すると、不要なデータのスキャンを排除することもできます。

ClickHouseでは、データが自動的に[ディスク上でクラスタリングされる]( /guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)ため、テーブルの主キー列に基づいて論理的に配置され、クエリが主インデックスデータ構造を利用することで迅速に特定されたり、剪定されたりします。

## マテリアライズドビュー {#materialized-views}

BigQueryとClickHouseの両方は、性能と効率を向上させるために基底テーブルに対する変換クエリの結果に基づく事前計算された結果を持つマテリアライズドビューをサポートしています。

## マテリアライズドビューのクエリ {#querying-materialized-views}

BigQueryのマテリアライズドビューは直接クエリでき、オプティマイザーが基底テーブルへのクエリを処理するために使用することができます。基底テーブルに対する変更がマテリアライズドビューを無効にする可能性がある場合、データは直接基底テーブルから読み取られます。基底テーブルに対する変更がマテリアライズドビューを無効にしない場合、残りのデータはマテリアライズドビューから読み取られ、変更のみが基底テーブルから読み取られます。

ClickHouseでは、マテリアライズドビューは直接クエリのみ可能です。ただし、基底テーブルに変更があった際、BigQueryではマテリアライズドビューが変更後5分以内に自動的に更新されますが、頻度は[30分ごと](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)までです。一方、ClickHouseではマテリアライズドビューは常に基底テーブルと同期しています。

**マテリアライズドビューの更新**

BigQueryでは、マテリアライズドビューが定期的に基底テーブルに対してビューの変換クエリを実行することで完全に更新されます。更新の合間に、BigQueryはマテリアライズドビューのデータを新しい基底テーブルデータと結合し、一貫したクエリ結果を提供します。

ClickHouseでは、マテリアライズドビューは段階的に更新されます。この段階的更新メカニズムは高いスケーラビリティと低コストを提供します：段階的に更新されたマテリアライズドビューは、基底テーブルに数十億または数兆の行が含まれるシナリオに特に適しています。マテリアライズドビューを更新するために基底テーブルを繰り返しクエリするのではなく、ClickHouseは新しく挿入された基底テーブル行の値から（のみ）部分的な結果を計算します。この部分的な結果は、以前に計算された部分的な結果とバックグラウンドで段階的に統合されます。これにより、マテリアライズドビューを基底テーブル全体から繰り返し更新することに比べ、計算コストが大幅に削減されます。

## トランザクション {#transactions}

ClickHouseとは対照的に、BigQueryはセッションを使用する際に、単一のクエリ内または複数のクエリにまたがってマルチステートメントトランザクションをサポートしています。マルチステートメントトランザクションでは、1つまたは複数のテーブルに対して行の挿入や削除といった変更操作を行い、変更を原子性でコミットまたはロールバックできます。マルチステートメントトランザクションは、[ClickHouseの2024年のロードマップ](https://github.com/ClickHouse/ClickHouse/issues/58392)にあります。

## 集約関数 {#aggregate-functions}

ClickHouseはBigQueryと比較して、かなり多くのビルトイン集約関数を提供しています：

- BigQueryには[18の集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)と[4つの近似集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)があります。
- ClickHouseには[150を超えるビルトイン集約関数](/sql-reference/aggregate-functions/reference)と、[ビルトイン集約関数の動作を拡張する強力な集約コンビネーター](/sql-reference/aggregate-functions/combinators)があります。たとえば、150を超えるビルトイン集約関数を、テーブル行の代わりに配列に適用することができます。これを行うためには[-Array suffix](/sql-reference/aggregate-functions/combinators#-array)を呼び出すだけです。[-Map suffix](/sql-reference/aggregate-functions/combinators#-map)を使用すれば、マップに任意の集約関数を適用できます。そして[-ForEach suffix](/sql-reference/aggregate-functions/combinators#-foreach)を使えば、ネストされた配列に任意の集約関数を適用できます。

## データソースとファイル形式 {#data-sources-and-file-formats}

ClickHouseはBigQueryと比較して、かなり多くのファイル形式とデータソースをサポートしています：

- ClickHouseは、ほぼすべてのデータソースから90以上のファイル形式でデータをロードするためのネイティブサポートを持っています。
- BigQueryは5つのファイル形式と19のデータソースをサポートしています。

## SQL言語機能 {#sql-language-features}

ClickHouseは、解析タスクにより親しみやすくする多くの拡張と改善を提供する標準SQLを提供しています。例えば、ClickHouse SQLは[ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)や高階関数をサポートしているため、変換を適用する際に配列をアンネスト/エクスプロードする必要がありません。これは、BigQueryなどの他のシステムに対する大きな利点です。

## 配列 {#arrays}

BigQueryの8つの配列関数と比較して、ClickHouseは広範囲の問題を優雅で簡単にモデル化し解決するための80以上の[ビルトイン配列関数](/sql-reference/functions/array-functions)を持っています。

ClickHouseにおける典型的なデザインパターンは、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集約関数を使用して、テーブルの特定の行の値を（一時的に）配列に変換することです。これは、その後配列関数で便利に処理でき、結果は[`arrayJoin`](/sql-reference/functions/array-join)集約関数を介して個々のテーブル行に戻すことができます。

ClickHouse SQLは[高階ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)をサポートしているため、配列を一時的にテーブルに戻すのではなく、高階ビルトイン配列関数のいずれかを単に呼び出すことで、多くの高度な配列操作を実現できます。これは、通常、BigQueryで[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[ジッピング](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)のための要件となるものです。ClickHouseではこれらの操作は単純な関数呼び出しとして扱われ、各々高階関数[`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-)と[`arrayZip`](/sql-reference/functions/array-functions#arrayzip)を呼び出すことで実行されます。

次に、BigQueryからClickHouseへの配列操作のマッピングを提供します：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**サブクエリ内の各行に対して1つの要素を持つ配列を作成する**

_ BigQuery_

[ARRAY function](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

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

_ ClickHouse_

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

**配列を行の集合に変換する**

_ BigQuery_

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

_ ClickHouse_

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

_ BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array)関数

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

_ ClickHouse_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-)関数

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**タイムスタンプの配列を返す**

_ BigQuery_

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

_ ClickHouse_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-)関数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**配列のフィルタリング**

_ BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子を介して配列を一時的にテーブルに戻す必要があります。

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

_ ClickHouse_

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

_ BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子を介して配列を一時的にテーブルに戻す必要があります。

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

_ ClickHouse_

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

_ BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)演算子を通じて配列を一時的にテーブルに戻す必要があります。

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

_ ClickHouse_

[arraySum](/sql-reference/functions/array-functions#arraysum)、[arrayAvg](/sql-reference/functions/array-functions#arrayavg)などの関数、または引数として[引数のあるどの集約関数名でも]( /sql-reference/functions/array-functions#arrayreduce)使用できます。

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
