---
'title': 'BigQuery と ClickHouse Cloud'
'slug': '/migrations/bigquery/biquery-vs-clickhouse-cloud'
'description': 'BigQuery が ClickHouse Cloud と異なる点'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '概要'
'doc_type': 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# Comparing ClickHouse Cloud and BigQuery 

## Resource organization {#resource-organization}

ClickHouse Cloudのリソースの組織方法は、[BigQueryのリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)に似ています。以下の図は、ClickHouse Cloudリソース階層を示しています。

<Image img={bigquery_1} size="md" alt="Resource organizations"/>

### Organizations {#organizations}

BigQueryと同様に、組織はClickHouse Cloudリソース階層のルートノードです。ClickHouse Cloudアカウントに設定した最初のユーザーは、自動的にそのユーザーが所有する組織に割り当てられます。ユーザーは、他のユーザーを組織に招待できます。

### BigQuery Projects vs ClickHouse Cloud Services {#bigquery-projects-vs-clickhouse-cloud-services}

組織内では、ClickHouse Cloudにおけるデータはサービスに関連付けられているため、BigQueryのプロジェクトに相当するサービスを作成できます。ClickHouse Cloudでは、[いくつかのサービスタイプが利用可能です](/cloud/manage/cloud-tiers)。各ClickHouse Cloudサービスは特定の地域に展開され、以下を含みます。

1. コンピュートノードのグループ（現在、開発ティアサービス用に2ノード、プロダクションティアサービス用に3ノード）。これらのノードに対して、ClickHouse Cloudは[垂直および水平スケーリング](/manage/scaling#how-scaling-works-in-clickhouse)をサポートしており、手動および自動の両方が可能です。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダー。
3. エンドポイント（またはClickHouse Cloud UIコンソールを介して作成された複数のエンドポイント） - サービスに接続するために使用するサービスURL（例：`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery Datasets vs ClickHouse Cloud Databases {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouseはテーブルをデータベースに論理的にグループ化します。BigQueryデータセットと同様に、ClickHouseデータベースはテーブルデータを整理し、アクセスを制御する論理コンテナです。

### BigQuery Folders {#bigquery-folders}

ClickHouse Cloudには、現在BigQueryフォルダーに相当する概念はありません。

### BigQuery Slot reservations and Quotas {#bigquery-slot-reservations-and-quotas}

BigQueryのスロット予約と同様に、ClickHouse Cloudでは[垂直および水平自動スケーリングを構成できます](/manage/scaling#configuring-vertical-auto-scaling)。垂直自動スケーリングでは、サービスのコンピュートノードのメモリとCPUコアの最小および最大サイズを設定できます。このサービスはその範囲内で必要に応じてスケールします。これらの設定は、サービスの初期作成フロー中にも利用可能です。サービス内の各コンピュートノードは同じサイズです。 [水平スケーリング](/manage/scaling#manual-horizontal-scaling)により、サービス内のコンピュートノードの数を変更できます。

さらに、BigQueryのクォータに似て、ClickHouse Cloudは同時実行制御、メモリ使用制限、およびI/Oスケジューリングを提供し、ユーザーがクエリをワークロードクラスに分離できるようにします。特定のワークロードクラスの共有リソース（CPUコア、DRAM、ディスクおよびネットワークI/O）に制限を設定することで、これらのクエリが他の重要なビジネスクエリに影響を及ぼさないようにします。同時実行制御は、高数の同時クエリのシナリオでスレッドの過剰サブスクリプションを防ぎます。

ClickHouseは、サーバー、ユーザー、およびクエリレベルでのメモリ割り当てのバイトサイズを追跡し、柔軟なメモリ使用制限を可能にします。メモリオーバーコミットにより、クエリは保証されたメモリを超える余剰メモリを使用できますが、他のクエリに対してメモリ制限を保証します。さらに、集約、ソート、および結合句のメモリ使用を制限できるため、メモリ制限が超えた場合には外部アルゴリズムへのフォールバックが可能です。

最後に、I/Oスケジューリングにより、ユーザーはワークロードクラスに基づいて最大帯域幅、進行中のリクエスト、およびポリシーに基づいてローカルおよびリモートディスクアクセスを制限することができます。

### Permissions {#permissions}

ClickHouse Cloudは、[クラウドコンソール](/cloud/get-started/sql-console)とデータベースの2か所で[ユーザーアクセスを制御します](/cloud/security/cloud-access-management)。コンソールアクセスは、[clickhouse.cloud](https://console.clickhouse.cloud)ユーザーインターフェースを介して管理されます。データベースアクセスは、データベースのユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーは、データベース内でのロールを付与され、当社の[SQLコンソール](/integrations/sql-clients/sql-console)を介してデータベースと対話できるようになります。

## Data types {#data-types}

ClickHouseは数値に関してより詳細な精度を提供します。たとえば、BigQueryは数値型[`INT64`, `NUMERIC`, `BIGNUMERIC` および `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)を提供しています。これに対してClickHouseは、小数、浮動小数点および整数用の複数の精度タイプを提供します。これらのデータ型を使用することで、ClickHouseのユーザーはストレージとメモリのオーバーヘッドを最適化し、結果としてクエリの高速化とリソース消費の削減を実現できます。以下に、各BigQuery型に対応するClickHouse型のマッピングを提供します。

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (with narrower range)                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (narrow range, higher precision)                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [supported as expression](/sql-reference/data-types/special-data-types/interval#usage-remarks) or [through functions](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

ClickHouseタイプの複数の選択肢がある場合は、データの実際の範囲を考慮して、必要最小限のものを選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を利用することを検討してください。

## Query acceleration techniques {#query-acceleration-techniques}

### Primary and Foreign keys and Primary index {#primary-and-foreign-keys-and-primary-index}

BigQueryでは、テーブルに[主キーと外部キー制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を設定できます。通常、主キーと外部キーは、データの整合性を確保するためにリレーショナルデータベースで使用されます。主キーの値は通常、各行で一意であり、`NULL`であってはなりません。行の各外部キーの値は、主キーのテーブルの主キー列に存在するか、`NULL`である必要があります。BigQueryでは、これらの制約は強制されませんが、クエリ最適化器はこれらの情報を使用してクエリを最適化できます。

ClickHouseでも、テーブルに主キーを設定できます。BigQueryと同様に、ClickHouseはテーブルの主キー列の値の一意性を強制しません。ただし、BigQueryとは異なり、テーブルのデータは[主キー列](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)によってディスクに[順序付けられて](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)ているため、クエリ最適化器はこの順序を利用して、再ソートを防ぎ、結合時のメモリ使用量を最小限に抑え、リミット句でのショートサーキット処理を可能にします。ClickHouseは、主キー列の値に基づいて自動的に[（スパース）主インデックス](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)を作成します。このインデックスは、主キー列に対するフィルタを含むすべてのクエリをスピードアップするために使用されます。ClickHouseは現在、外部キー制約をサポートしていません。

## Secondary indexes (Only available in ClickHouse) {#secondary-indexes-only-available-in-clickhouse}

ClickHouseでは、テーブルの主キー列の値から作成された主インデックスに加えて、主キーに含まれないカラムに対してセカンダリインデックスを作成できます。ClickHouseはいくつかの種類のセカンダリインデックスを提供しており、それぞれが異なるタイプのクエリに適しています。

- **ブルームフィルタインデックス**:
  - 等号条件（例：=、IN）を持つクエリを高速化するために使用します。
  - データブロック内に値が存在するかどうかを判断するために確率的データ構造を使用します。
- **トークンブルームフィルタインデックス**:
  - ブルームフィルタインデックスに似ていますが、トークン化された文字列に使用され、全文検索クエリに適しています。
- **最小最大インデックス**:
  - 各データパートのカラムの最小値と最大値を保持します。
  - 指定された範囲内にないデータパートの読み取りをスキップするのに役立ちます。

## Search indexes {#search-indexes}

BigQueryの[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)に似て、ClickHouseテーブルの文字列値を持つカラムに対して[全文インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成できます。

## Vector indexes {#vector-indexes}

BigQueryは最近、Pre-GA機能として[ベクターインデックス](https://cloud.google.com/bigquery/docs/vector-index)を導入しました。同様に、ClickHouseもベクター検索ユースケースを高速化するための[インデックス](https://engines/table-engines/mergetree-family/annindexes)に対する実験的サポートを提供しています。

## Partitioning {#partitioning}

BigQueryと同様に、ClickHouseはテーブルをパーティショニングして、大きなテーブルのパフォーマンスと管理性を向上させるために、テーブルをより小さく管理しやすい部分（パーティション）に分割します。ClickHouseのパーティショニングについての詳細は[こちら](/engines/table-engines/mergetree-family/custom-partitioning-key)で説明します。

## Clustering {#clustering}

クラスタリングにより、BigQueryは指定された数個の列の値に基づいてテーブルデータを自動的にソートし、最適サイズのブロックに配置します。クラスタリングはクエリ性能を向上させ、BigQueryがクエリの実行コストをより良く推定できるようにします。クラスタリングされた列を使用することで、クエリは不要なデータのスキャンを排除します。

ClickHouseでは、データは自動的に[ディスク上でクラスタリングされ](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)ており、テーブルの主キー列に基づいて論理的に整理され、クエリが主インデックスデータ構造を利用することにより迅速に位置を特定またはプルーニングできるブロックが形成されています。

## Materialized views {#materialized-views}

BigQueryとClickHouseの両方が、パフォーマンスと効率を向上させるためにベーステーブルに対する変換クエリの結果に基づいて事前計算された結果を持つマテリアライズドビューをサポートしています。

## Querying materialized views {#querying-materialized-views}

BigQueryのマテリアライズドビューは直接クエリできるか、オプティマイザによってベーステーブルに対するクエリを処理するために使用されます。ベーステーブルへの変更がマテリアライズドビューを無効にする可能性がある場合、データはベーステーブルから直接読み取られます。ベーステーブルへの変更がマテリアライズドビューを無効にしない場合、残りのデータはマテリアライズドビューから読み取られ、変更された部分のみがベーステーブルから読み取られます。

ClickHouseでは、マテリアライズドビューは直接クエリできるのはのみです。ただし、BigQuery（マテリアライズドビューはベーステーブルの変更からの5分以内に自動的に更新されますが、[30分ごと](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)以上の頻度ではありません）と比較して、ClickHouseのマテリアライズドビューは常にベーステーブルと同期しています。

**Updating materialized views**

BigQueryは、定期的にマテリアライズドビューを完全に更新し、ベーステーブルに対してビューの変換クエリを実行します。更新間の期間中、BigQueryはマテリアライズドビューのデータと新しいベーステーブルデータを組み合わせて、マテリアライズドビューを使用しながら一貫したクエリ結果を提供します。

ClickHouseでは、マテリアライズドビューはインクリメンタルに更新されます。このインクリメンタル更新メカニズムは、高スケーラビリティと低コンピューティングコストを提供します：インクリメンタルに更新されたマテリアライズドビューは、ベーステーブルが数十億または数兆の行を含むシナリオのために特別に設計されています。マテリアライズドビューを更新するために常に成長し続けるベーステーブルを繰り返しクエリするのではなく、ClickHouseは単に新しく挿入されたベーステーブル行の値から部分的な結果を計算します。この部分的な結果は、バックグラウンドで以前に計算された部分的な結果とインクリメンタルにマージされます。これにより、全ベーステーブルからマテリアライズドビューを繰り返し更新するよりも、劇的に低いコンピューティングコストが実現されます。

## Transactions {#transactions}

ClickHouseとは異なり、BigQueryは単一のクエリ内でのマルチステートメントトランザクションや、セッションを使用する場合の複数のクエリにわたるマルチステートメントトランザクションをサポートしています。マルチステートメントトランザクションを使用すると、1つ以上のテーブルに対して行を挿入または削除するなどの変更を行うことができ、変更を原子的にコミットまたはロールバックします。マルチステートメントトランザクションは、[ClickHouseの2024年のロードマップ](https://github.com/ClickHouse/ClickHouse/issues/58392)にあります。

## Aggregate functions {#aggregate-functions}

BigQueryと比較して、ClickHouseは大幅に多くの組み込み集計関数を提供します。

- BigQueryには[18の集計関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)と、[4つの近似集計関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)があります。
- ClickHouseは[150以上の事前構築された集計関数](/sql-reference/aggregate-functions/reference)を持ち、[事前構築された集計関数の動作を拡張するための強力な集計コンビネータ](/sql-reference/aggregate-functions/combinators)も備えています。例えば、150以上の事前構築された集計関数をテーブル行ではなく配列に適用することができ、[-Arrayサフィックス](/sql-reference/aggregate-functions/combinators#-array)を使用して呼び出すだけで済みます。また、[-Mapサフィックス](/sql-reference/aggregate-functions/combinators#-map)を使用することで、任意の集計関数をマップに適用できます。そして、[-ForEachサフィックス](/sql-reference/aggregate-functions/combinators#-foreach)を使用すれば、任意の集計関数をネストされた配列に適用できます。

## Data sources and file formats {#data-sources-and-file-formats}

BigQueryと比較して、ClickHouseは大幅に多くのファイル形式およびデータソースをサポートしています。

- ClickHouseは、実質的にあらゆるデータソースから90以上のファイル形式でのデータの読み込みをネイティブにサポートしています。
- BigQueryは5つのファイル形式と19のデータソースをサポートしています。

## SQL language features {#sql-language-features}

ClickHouseは、分析タスクにより適した多くの拡張機能や改良を備えた標準SQLを提供します。たとえば、ClickHouse SQLは[ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)や高階関数をサポートしているため、変換を適用する際に配列をアンネストしたりエクスプロードしたりする必要がありません。これは、BigQueryなどの他のシステムに対する大きな利点です。

## Arrays {#arrays}

BigQueryの8つの配列関数と比較して、ClickHouseには優雅でシンプルに幅広い問題をモデル化し解決するための80以上の[組み込み配列関数](/sql-reference/functions/array-functions)があります。

ClickHouseの典型的なデザインパターンは、特定のテーブル行の値を配列に（テンポラリに）変換するために[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)集計関数を使用することです。これによって、配列関数を介して便利に処理が可能となり、結果は[`arrayJoin`](/sql-reference/functions/array-join)集計関数を介して元のテーブル行に戻すことができます。

ClickHouse SQLが[高阶ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)をサポートしているため、多くの高度な配列操作は、一時的に配列をテーブルに戻す必要がなく、単に高階組み込み配列関数の1つを呼び出すことで実現できます。これは、BigQueryで[要求されることが多い](https://cloud.google.com/bigquery/docs/arrays)です。たとえば、[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[ジッパリング](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)配列の場合、ClickHouseではこれらの操作は単に高階関数[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter)や[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)を呼び出すだけで実行できます。

以下に、BigQueryからClickHouseへの配列操作のマッピングを提供します。

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#range) |

**Create an array with one element for each row in a subquery**

_BigQuery_

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

_ClickHouse_

[groupArray](/sql-reference/aggregate-functions/reference/grouparray) aggregate function

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

**Convert an array into a set of rows**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) operator

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

[ARRAY JOIN](/sql-reference/statements/select/array-join) clause

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

**Return an array of dates**

_BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) function

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) functions

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**Return an array of timestamps**

_BigQuery_

[GENERATE_TIMESTAMP_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) function

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

[range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap) functions

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**Filtering arrays**

_BigQuery_

Requires temporarily converting arrays back to tables via [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) operator

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

[arrayFilter](/sql-reference/functions/array-functions#arrayFilter) function

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

**Zipping arrays**

_BigQuery_

Requires temporarily converting arrays back to tables via [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) operator

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

[arrayZip](/sql-reference/functions/array-functions#arrayZip) function

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

**Aggregating arrays**

_BigQuery_

Requires converting arrays back to tables via [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) operator

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

[arraySum](/sql-reference/functions/array-functions#arraySum), [arrayAvg](/sql-reference/functions/array-functions#arrayAvg), ... function, or any of the over 90 existing aggregate function names as argument for the [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) function

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
