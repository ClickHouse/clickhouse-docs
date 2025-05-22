---
'title': 'BigQueryとClickHouse Cloudの比較'
'slug': '/migrations/bigquery/biquery-vs-clickhouse-cloud'
'description': 'BigQueryがClickHouse Cloudとどのように異なるか'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';



# BigQuery と ClickHouse Cloud: 同等および異なる概念

## リソースの組織 {#resource-organization}

ClickHouse Cloud におけるリソースの組織方法は、[BigQuery のリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy) に似ています。以下の図に基づいて、具体的な違いを説明します。

<Image img={bigquery_1} size="md" alt="Resource organizations"/>

### 組織 {#organizations}

BigQuery と同様に、組織は ClickHouse cloud リソース階層のルートノードです。ClickHouse Cloud アカウントに設定した最初のユーザーは、自動的にそのユーザーが所有する組織に割り当てられます。そのユーザーは他のユーザーを組織に招待することができます。

### BigQuery プロジェクトと ClickHouse Cloud サービス {#bigquery-projects-vs-clickhouse-cloud-services}

組織内では、ClickHouse Cloud に保存されたデータがサービスに関連付けられているため、BigQuery プロジェクトに緩やかに相当するサービスを作成できます。ClickHouse Cloud には[利用可能な複数のサービスタイプ](../../cloud/manage/cloud-tiers)があります。各 ClickHouse Cloud サービスは特定のリージョンに展開され、以下を含みます。

1. コンピュートノードのグループ（現在、Development ティアサービスには 2 ノード、Production ティアサービスには 3 ノードがあります）。これらのノードに対して、ClickHouse Cloud は、手動および自動での[垂直および水平スケーリング](../../manage/scaling#how-scaling-works-in-clickhouse)をサポートします。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダー。
3. エンドポイント（または ClickHouse Cloud UI コンソールを介して作成された複数のエンドポイント）– サービスに接続するために使用するサービス URL（例: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery データセットと ClickHouse Cloud データベース {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse はテーブルをデータベースに論理的にグループ化します。BigQuery データセットのように、ClickHouse データベースはテーブルデータを整理し、アクセスを制御する論理コンテナです。

### BigQuery フォルダー {#bigquery-folders}

ClickHouse Cloud には現在、BigQuery フォルダーに相当する概念はありません。

### BigQuery スロット予約とクォータ {#bigquery-slot-reservations-and-quotas}

BigQuery スロット予約と同様に、ClickHouse Cloud では[垂直および水平のオートスケーリングを構成](../../manage/scaling#configuring-vertical-auto-scaling)できます。垂直オートスケーリングでは、サービスのコンピュートノードのメモリおよび CPU コアの最小サイズと最大サイズを設定できます。サービスはその範囲内で必要に応じてスケールします。これらの設定は初期サービス作成フロー中にも利用可能です。サービス内の各コンピュートノードは同じサイズです。[水平スケーリング](../../manage/scaling#manual-horizontal-scaling)を使用して、サービス内のコンピュートノードの数を変更できます。

さらに、BigQuery のクォータに似て、ClickHouse Cloud では同時実行制御、メモリ使用量制限、および I/O スケジューリングを提供し、ユーザーがワークロードクラスにクエリを分離することを可能にします。特定のワークロードクラスに対して共有リソース（CPU コア、DRAM、ディスクおよびネットワーク I/O）の制限を設定することで、これらのクエリが他の重要なビジネスクエリに影響を与えないようにします。同時実行制御は、高数の同時実行クエリが存在するシナリオでスレッドのオーバーサブスクリプションを防ぎます。

ClickHouse はサーバー、ユーザー、およびクエリレベルでのメモリアロケーションのバイトサイズを追跡し、柔軟なメモリ使用量制限を可能にします。メモリのオーバーコミットにより、クエリは保証されたメモリを超えた追加の自由なメモリを使用できますが、他のクエリのメモリ制限は保証されます。また、集計、ソート、および結合句のためのメモリ使用量を制限でき、メモリ制限を超えた場合に外部アルゴリズムへのフォールバックが可能です。

最後に、I/O スケジューリングを使用すると、ユーザーは最大帯域幅、フライト中のリクエスト、およびポリシーに基づいてワークロードクラス向けにローカルおよびリモートディスクへのアクセスを制限できます。

### 権限 {#permissions}

ClickHouse Cloud は[ユーザーアクセスを制御](../../cloud/security/cloud-access-management)し、[クラウドコンソール](../../cloud/get-started/sql-console)およびデータベースを介して管理します。コンソールアクセスは[clickhouse.cloud](https://console.clickhouse.cloud) ユーザーインターフェースを介して管理されます。データベースアクセスは、データベースユーザーアカウントとロールを介して管理されます。さらに、コンソールユーザーにはデータベース内でロールを付与することができ、これによりコンソールユーザーは当社の[SQLコンソール](../../integrations/sql-clients/sql-console)を介してデータベースと対話できます。

## データ型 {#data-types}

ClickHouse は、数値に関してより細かな精度を提供します。たとえば、BigQuery は以下の数値型を提供します [`INT64`, `NUMERIC`, `BIGNUMERIC` および `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)。これに対して ClickHouse は、小数点や整数に対して複数の精度タイプを提供します。これらのデータ型を使用することで、ClickHouse ユーザーはストレージとメモリーオーバーヘッドを最適化し、その結果、クエリを高速化しリソース消費を低減できます。以下に、各 BigQuery 型に対する ClickHouse 型の対応を示します。

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (範囲が狭い) |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (範囲が狭く、精度が高い) |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [式としてサポート](/sql-reference/data-types/special-data-types/interval#usage-remarks) または [関数を通じて](https://cloud.google.com/bigquery/docs/reference/standard-sql/functions#addyears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

複数の ClickHouse 型の選択肢が提示された場合は、データの実際の範囲を考慮し、最も小さい要求を選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を利用することも検討してください。

## クエリ加速技術 {#query-acceleration-techniques}

### 主キーと外部キーおよび主インデックス {#primary-and-foreign-keys-and-primary-index}

BigQuery では、テーブルは[主キーおよび外部キー制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を持つことができます。通常、主キーおよび外部キーはリレーショナルデータベースでデータの整合性を保証するために使用されます。主キーの値は通常、各行ごとに一意で、`NULL` ではありません。行内の各外部キーは、主キーを持つテーブルの主キー列に存在するか、`NULL` でなければなりません。BigQuery では、これらの制約は強制されませんが、クエリオプティマイザーはこの情報を使用してクエリをより最適化することがあります。

ClickHouse でも、テーブルは主キーを持つことができます。BigQuery と同様に、ClickHouse ではテーブルの主キー列の値の一意性を強制しません。BigQuery とは異なり、テーブルのデータは主キー列が[順序付けられ](../../guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)てディスクに保存されます。クエリオプティマイザーはこのソート順を利用して、再ソートを防ぎ、結合のメモリ使用量を最小限に抑え、制限句のショートサーキットを可能にします。BigQuery とは異なり、ClickHouse は主キー列の値に基づいて[sparse primary index](../../guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)を自動的に作成します。このインデックスは、主キー列にフィルターを含むすべてのクエリを高速化するために使用されます。ClickHouse は現在、外部キー制約をサポートしていません。

## セカンダリインデックス（ClickHouse のみ利用可能） {#secondary-indexes-only-available-in-clickhouse}

ClickHouse では、テーブルの主キー列の値から作成された主インデックスの他に、主キー以外のカラムにセカンダリインデックスを作成できます。ClickHouse は、異なる種類のクエリに最適な複数のセカンダリインデックスを提供しています。

- **ブルームフィルターインデックス**:
  - 等価条件（例: =, IN）によるクエリを高速化するために使用されます。
  - 確率的データ構造を使用して、データブロック内に特定の値が存在するかどうかを判断します。
- **トークンブルームフィルターインデックス**:
  - ブルームフィルターインデックスに似ていますが、トークン化された文字列に使用され、全文検索クエリに適しています。
- **最小-最大インデックス**:
  - 各データパーツのカラムの最小値と最大値を保持します。
  - 指定された範囲に含まれないデータパーツの読み込みをスキップするのに役立ちます。

## 検索インデックス {#search-indexes}

BigQuery の[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)に似て、[全テキストインデックス](/engines/table-engines/mergetree-family/invertedindexes)を ClickHouse テーブルの文字列値を持つカラムに対して作成できます。

## ベクターインデックス {#vector-indexes}

BigQuery は最近、[ベクターインデックス](https://cloud.google.com/bigquery/docs/vector-index)を Pre-GA 機能として導入しました。同様に、ClickHouse はベクター検索ユースケースを加速するための[インデックス](../../engines/table-engines/mergetree-family/annindexes)に対する実験的なサポートを提供しています。

## パーティショニング {#partitioning}

BigQuery と同様に、ClickHouse では、テーブルのパーティショニングを利用して、大規模なテーブルのパフォーマンスと管理性を向上させます。テーブルをパーティションと呼ばれる小さく管理しやすい部分に分割することで実現されます。ClickHouse のパーティショニングについては[こちら](../../engines/table-engines/mergetree-family/custom-partitioning-key)で詳細に説明しています。

## クラスタリング {#clustering}

クラスタリングを用いることで、BigQuery は指定された少数のカラムの値に基づいてテーブルデータを自動的にソートし、最適なサイズのブロックに同時に配置します。クラスタリングはクエリのパフォーマンスを向上させ、BigQuery がクエリの実行コストをより正確に推定できるようにします。クラスタ化されたカラムを用いることで、クエリは不要なデータのスキャンを排除します。

ClickHouse では、データはテーブルの主キー列に基づいて自動的に[ディスク上でクラスタリングされ](../../guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)、主インデックスデータ構造を利用してクエリによって迅速に検索またはプルーニングできるように論理的に配置されます。

## マテリアライズドビュー {#materialized-views}

BigQuery と ClickHouse の両方が、基盤となるテーブルに対して変換クエリの結果に基づいた事前計算されたマテリアライズドビューをサポートし、パフォーマンスと効率を向上させます。

## マテリアライズドビューのクエリ {#querying-materialized-views}

BigQuery のマテリアライズドビューは直接クエリされるか、最適化プログラムによって基盤となるテーブルへのクエリ処理に使用されます。基盤となるテーブルの変更がマテリアライズドビューを無効にする可能性がある場合、データは基盤となるテーブルから直接読み取られます。基盤となるテーブルの変更がマテリアライズドビューを無効にしない場合、残りのデータはマテリアライズドビューから読み取られ、変更分のみが基盤となるテーブルから読み取られます。

ClickHouse では、マテリアライズドビューは直接クエリすることができますが、BigQuery（マテリアライズドビューが基盤となるテーブルの変更から 5 分以内に自動的に更新されますが、30 分ごと以上には更新されません）に比べて、マテリアライズドビューは常に基盤となるテーブルと同期しています。

**マテリアライズドビューの更新**

BigQuery は定期的にマテリアライズドビューを完全に更新し、ビューの変換クエリを基盤となるテーブルに対して実行します。更新の合間に、BigQuery はマテリアライズドビューのデータを新しい基盤となるテーブルデータと結合し、マテリアライズドビューを使用しながら一貫したクエリ結果を提供します。

ClickHouse では、マテリアライズドビューはインクリメンタルに更新されます。このインクリメンタル更新機構は、非常に高いスケーラビリティと低い計算コストを提供します。インクリメンタルに更新されたマテリアライズドビューは、基盤となるテーブルが数十億または数兆の行を含むシナリオに特に最適化されています。マテリアライズドビューを更新するために、常に成長する基盤となるテーブルを繰り返しクエリするのではなく、ClickHouse は新しく挿入された基盤となるテーブルの行の値から部分結果を単純に計算します。この部分結果は、以前に計算された部分結果と背景でインクリメンタルにマージされます。これにより、基盤となるテーブル全体からマテリアライズドビューを繰り返し更新するよりも、きわめて低い計算コストが実現されます。

## トランザクション {#transactions}

ClickHouse に対して、BigQuery は単一のクエリの中またはセッションを使用して複数のクエリにまたがるマルチステートメントトランザクションをサポートしています。マルチステートメントトランザクションでは、1 つまたは複数のテーブルに対して行を挿入または削除するなどの変更操作を行い、変更をアトミックにコミットまたはロールバックできます。マルチステートメントトランザクションは[ClickHouse の 2024 年のロードマップに含まれています](https://github.com/ClickHouse/ClickHouse/issues/58392)。

## 集計関数 {#aggregate-functions}

BigQuery に比べて、ClickHouse には著しく多くの組み込み集計関数があります。

- BigQuery には [18 の集計関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions) と [4 つの近似集計関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions) が含まれています。
- ClickHouse は [150 以上のプレビルドの集計関数](/sql-reference/aggregate-functions/reference) と、[プレビルドの集計関数の振る舞いを拡張するための強力な集計コンビネータ](/sql-reference/aggregate-functions/combinators)を持っています。たとえば、150 以上のプレビルド集計関数を、テーブルの行ではなく配列に適用することができます。単に[-Array サフィックス](/sql-reference/aggregate-functions/combinators#-array) を付けて呼び出すだけで可能です。[-Map サフィックス](/sql-reference/aggregate-functions/combinators#-map)を使えば、任意の集計関数をマップに適用できます。そして、[-ForEach サフィックス](/sql-reference/aggregate-functions/combinators#-foreach)を使えば、ネストされた配列に任意の集計関数を適用できます。

## データソースとファイルフォーマット {#data-sources-and-file-formats}

BigQuery に比べて、ClickHouse では大幅に多くのファイルフォーマットとデータソースをサポートしています。

- ClickHouse は、実質的に任意のデータソースから 90 以上のファイルフォーマットでデータをロードするためのネイティブサポートを提供しています。
- BigQuery は 5 つのファイルフォーマットと 19 のデータソースをサポートしています。

## SQL 言語機能 {#sql-language-features}

ClickHouse では、分析タスクにより適した多くの拡張や改善を伴う標準 SQL を提供しています。たとえば、ClickHouse SQL は[ラムダ関数](https://sql-reference/functions/overview#arrow-operator-and-lambda)や高階関数をサポートしているため、変換を適用する際に配列を展開したり分解したりする必要がありません。これは、BigQuery のような他のシステムに対する大きな利点です。

## 配列 {#arrays}

BigQuery の 8 つの配列関数に対して、ClickHouse には 80 以上の[組み込みの配列関数](https://sql-reference/functions/array-functions)があり、さまざまな問題を優雅かつ簡単にモデル化および解決します。

ClickHouse での一般的なデザインパターンは、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 集計関数を使用して、テーブルの特定の行の値を一時的に配列に変換することです。これを配列関数を介して便利に処理でき、結果を[`arrayJoin`](/sql-reference/functions/array-join) 集計関数を使用して個々のテーブル行に変換できます。

ClickHouse SQL は[高階ラムダ関数](https://sql-reference/functions/overview#arrow-operator-and-lambda)をサポートしているため、配列をテーブルに一時的に戻すことなく、多くの高度な配列操作を単に高階組み込み配列関数の一つを呼び出すことで達成できます。これは、BigQuery でしばしば[必要とされる](https://cloud.google.com/bigquery/docs/arrays)配列の[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[ジッパリング](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)に関しても同様です。ClickHouse では、これらの操作は単に高階関数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-) と [`arrayZip`](/sql-reference/functions/array-functions#arrayzip) を呼び出すだけです。

以下に、BigQuery から ClickHouse への配列操作のマッピングを提供します。

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**サブクエリの各行に対して1つの要素を持つ配列を作成する**

_BigQuery_

[ARRAY 関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

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

_ClickHouse_

[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 集計関数

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

**配列を行のセットに変換する**

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子

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

_ClickHouse_

[ARRAY JOIN](/sql-reference/statements/select/array-join) 句

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

**日付の配列を返す**

_BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) 関数

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘

**タイムスタンプの配列を返す**

_BigQuery_

[GENERATE_TIMESTAMP_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) 関数

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘

**配列のフィルタリング**

_BigQuery_

一時的に配列をテーブルに戻すために[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子が必要です

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

_ClickHouse_

[arrayFilter](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-) 関数

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

**配列のジッパリング**

_BigQuery_

一時的に配列をテーブルに戻すために[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子が必要です

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

_ClickHouse_

[arrayZip](/sql-reference/functions/array-functions#arrayzip) 関数

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

**配列の集約**

_BigQuery_

配列をテーブルに戻すために[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子が必要です

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

_ClickHouse_

[arraySum](/sql-reference/functions/array-functions#arraysum)、[arrayAvg](/sql-reference/functions/array-functions#arrayavg)、... 関数、または [arrayReduce](/sql-reference/functions/array-functions#arrayreduce) 関数の引数として既存の 90 以上の集計関数名のいずれか

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
3. │ [5,10]       │   15   │
   └──────────────┴──────┘

