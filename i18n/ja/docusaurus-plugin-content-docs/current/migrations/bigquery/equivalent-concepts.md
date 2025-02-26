---
title: BigQuery vs ClickHouse Cloud
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: BigQuery の ClickHouse Cloud との違い
keywords: [migrate, migration, migrating, data, etl, elt, BigQuery]
---

# BigQuery vs ClickHouse Cloud: 同等の概念と異なる概念

## リソースの組織 {#resource-organization}

ClickHouse Cloud におけるリソースの組織化の方法は、[BigQueryのリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)に似ています。以下では、ClickHouse Cloudのリソース階層を示す図に基づいて、具体的な違いを説明します。

<img src={require('../images/bigquery-1.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

### 組織 {#organizations}

BigQuery と同様に、組織は ClickHouse Cloud のリソース階層におけるルートノードです。ClickHouse Cloud アカウントに最初に設定したユーザーは、自動的にそのユーザーが所有する組織に割り当てられます。ユーザーは、追加のユーザーを組織に招待することができます。

### BigQuery プロジェクトと ClickHouse Cloud サービス {#bigquery-projects-vs-clickhouse-cloud-services}

組織内では、ClickHouse Cloud にストoredデータがサービスに関連付けられているため、BigQueryプロジェクトに大まかに相当するサービスを作成できます。ClickHouse Cloud には[いくつかのサービス種類があります](/cloud/manage/cloud-tiers)。各 ClickHouse Cloud サービスは特定の地域に展開され、以下を含みます。

1. コンピュートノードのグループ（現在、開発 tier サービスには 2 ノード、プロダクション tier サービスには 3 ノード）。これらのノードに対して、ClickHouse Cloud は[手動および自動での垂直および水平スケーリングをサポートしています](/manage/scaling#vertical-and-horizontal-scaling)。
2. サービスがすべてのデータを保存するオブジェクトストレージフォルダ。
3. エンドポイント（または ClickHouse Cloud UI コンソールを介して作成された複数のエンドポイント） - サービスに接続するために使用するサービス URL（例: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery データセットと ClickHouse Cloud データベース {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse はテーブルをデータベースに論理的にグループ化します。BigQuery のデータセットのように、ClickHouse のデータベースはテーブルデータへのアクセスを整理し、制御する論理コンテナです。

### BigQuery フォルダ {#bigquery-folders}

ClickHouse Cloud には現在、BigQuery フォルダに相当する概念は存在しません。

### BigQuery スロット予約とクォータ {#bigquery-slot-reservations-and-quotas}

BigQuery のスロット予約と同様に、ClickHouse Cloud では[垂直および水平の自動スケーリングを構成できます](/manage/scaling#configuring-vertical-auto-scaling)。垂直自動スケーリングには、サービスのコンピュートノードのメモリおよび CPU コアの最小サイズと最大サイズを設定できます。このサービスは、その範囲内で必要に応じてスケールアップまたはダウンします。これらの設定は、初期サービス作成フロー中にも利用可能です。サービス内の各コンピュートノードは同じサイズです。サービス内のコンピュートノードの数は、[水平スケーリング](/manage/scaling#self-serve-horizontal-scaling)で変更できます。

さらに、BigQuery のクォータに類似して、ClickHouse Cloud は同時実行制御、メモリ使用量制限、および I/O スケジュールを提供し、ユーザーがクエリをワークロードクラスにアイソレートできるようにします。特定のワークロードクラスの共有リソース（CPU コア、DRAM、ディスクおよびネットワーク I/O）に制限を設けることで、これらのクエリが他の重要なビジネスクエリに影響を与えないことを保証します。同時実行制御は、同時にクエリが多く発生するシナリオでのスレッドの過剰な割り当てを防ぎます。

ClickHouse は、サーバー、ユーザー、およびクエリレベルでのメモリ割り当てのバイトサイズを追跡し、柔軟なメモリ使用制限を可能にします。メモリオーバコミットにより、クエリは保証されたメモリを超えて追加の未使用メモリを使用でき、他のクエリに対してメモリ制限を保証します。さらに、集約、ソート、および結合句のメモリ使用を制限でき、メモリ制限を超えた場合には外部アルゴリズムにフォールバックできます。

最後に、I/O スケジューリングにより、ユーザーは最大帯域幅、フライト中のリクエスト、およびポリシーに基づいてワークロードクラスのローカルおよびリモートディスクアクセスを制限できます。

### 権限 {#permissions}

ClickHouse Cloud は、[クラウドコンソール](/cloud/security/cloud-access-management)およびデータベースを通じて、ユーザーアクセスを二つの場所で管理します。コンソールアクセスは、[clickhouse.cloud](https://console.clickhouse.cloud) ユーザーインターフェースを介して管理されます。データベースアクセスは、データベースユーザーアカウントおよびロールを介して管理されます。さらに、コンソールユーザーは、データベース内でロールを付与され、[SQLコンソール](/integrations/sql-clients/sql-console)を介してデータベースと対話できるようになります。

## データ型 {#data-types}

ClickHouse は数値に関してより細かな精度を提供します。例えば、BigQuery では数値型として[`INT64`, `NUMERIC`, `BIGNUMERIC`, `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types)を提供しています。これと対照的に、ClickHouse では小数、浮動小数点、および整数用の複数の精度型を提供しています。これにより、ClickHouse ユーザーはストレージおよびメモリオーバーヘッドを最適化し、クエリを高速化し、リソース消費を低く抑えることができます。以下に、各 BigQuery 型に対する ClickHouse 型の対応関係を示します：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (より狭い範囲) |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (狭い範囲、高精度) |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [表現としてサポート](/sql-reference/data-types/special-data-types/interval#usage-remarks)または[関数を通じて](/sql-reference/functions/date-time-functions#addyears-addmonths-addweeks-adddays-addhours-addminutes-addseconds-addquarters) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/overview#relying-on-schema-inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

ClickHouse タイプの複数の選択肢が提示される場合は、データの実際の範囲を考慮し、必要な最小値を選択してください。また、さらなる圧縮のために[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)を利用することを検討してください。

## クエリ加速技術 {#query-acceleration-techniques}

### 主キー、外部キー、および主インデックス {#primary-and-foreign-keys-and-primary-index}

BigQuery では、テーブルは[主キーおよび外部キー制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints)を持つことができます。通常、主キーおよび外部キーは、データの整合性を保証するためにリレーショナルデータベースで使用されます。主キー値は通常、各行に対して一意であり、`NULL` ではありません。行における各外部キー値は、主キー表の主キー列に存在するか、`NULL` である必要があります。BigQuery では、これらの制約は強制されませんが、クエリオプティマイザはこの情報を使用してクエリをより最適化することがあります。

ClickHouse では、テーブルも主キーを持つことができます。BigQuery と同様に、ClickHouse もテーブルの主キー列の値の一意性を強制しません。ただし、BigQuery とは異なり、ClickHouse のテーブルのデータは、主キー列によって[ディスク上に順序付けて格納されます](/optimize/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)。クエリオプティマイザはこの順序を利用して、リソートを防ぎ、結合のメモリ使用量を最小限に抑え、制限句の短絡評価を有効にします。BigQuery とは異なり、ClickHouse は主キー列値に基づいて[（スパース）主インデックス](/optimize/sparse-primary-indexes#an-index-design-for-massive-data-scales)を自動的に作成します。このインデックスは、主キー列にフィルタを含むすべてのクエリの速度を上げるために使用されます。ClickHouse は現在、外部キー制約をサポートしていません。

## セカンダリインデックス（ClickHouse のみに利用可能） {#secondary-indexes-only-available-in-clickhouse}

ClickHouse では、テーブルの主キー列の値から作成された主インデックスに加えて、主キー以外のカラムにセカンダリインデックスを作成することを許可しています。ClickHouse では、さまざまなクエリに適したいくつかのセカンダリインデックスのタイプを提供しています：

- **ブルームフィルターインデックス**:
  - 等号条件（例： =, IN）を持つクエリを加速するために使用されます。
  - データブロック内に値が存在するかどうかを判断するために確率的データ構造を使用します。
- **トークンブルームフィルターインデックス**:
  - ブルームフィルターインデックスに似ていますが、トークン化された文字列に使用され、全文検索クエリに適しています。
- **ミニマックスインデックス**:
  - 各データパーツの列の最小値と最大値を保持します。
  - 指定された範囲に入らないデータパーツの読み込みをスキップするのに役立ちます。

## 検索インデックス {#search-indexes}

BigQuery の[検索インデックス](https://cloud.google.com/bigquery/docs/search-index)に似ていて、ClickHouse のテーブル上の文字列値を持つカラムに対して[全文インデックス](/engines/table-engines/mergetree-family/invertedindexes)を作成できます。

## ベクトルインデックス {#vector-indexes}

BigQuery は最近、[ベクトルインデックス](https://cloud.google.com/bigquery/docs/vector-index)を Pre-GA 機能として導入しました。同様に、ClickHouse もベクトル検索のユースケースを加速する[インデックス](https://engines/table-engines/mergetree-family/annindexes)の実験的なサポートがあります。

## パーティショニング {#partitioning}

BigQuery と同様に、ClickHouse はテーブルのパーティショニングを使用して大規模なテーブルのパフォーマンスと管理性を向上させ、テーブルを「パーティション」と呼ばれる小さく管理しやすい部分に分割します。ClickHouse のパーティショニングの詳細については、[こちら](/engines/table-engines/mergetree-family/custom-partitioning-key)をご覧ください。

## クラスタリング {#clustering}

クラスタリングを使用すると、BigQuery は自動的にテーブルデータを指定された数の列の値に基づいてソートし、最適なサイズのブロックに配置します。クラスタリングはクエリパフォーマンスを向上させ、BigQuery がクエリの実行コストをより正確に見積もることを可能にします。クラスタ化された列を使うことで、クエリは不必要なデータのスキャンを排除します。

ClickHouse では、データは自動的に[ディスク上でクラスタリングされます](/optimize/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、テーブルの主キー列に基づいて、迅速に位置特定またはクエリによってプルーニングされることができるように論理的にブロックに配置されます。

## マテリアライズドビュー {#materialized-views}

BigQuery および ClickHouse の両方は、パフォーマンスと効率を向上させるために基礎テーブルに対する変換クエリの結果に基づいて事前計算された結果であるマテリアライズドビューをサポートしています。

## マテリアライズドビューのクエリ {#querying-materialized-views}

BigQuery マテリアライズドビューは直接クエリされるか、基礎テーブルに対するクエリを処理するためにオプティマイザによって使用されます。基礎テーブルに対する変更がマテリアライズドビューを無効にする場合は、データは基礎テーブルから直接読み取られます。基礎テーブルに対する変更がマテリアライズドビューを無効にしない場合、残りのデータはマテリアライズドビューから読み取られ、変更された部分のみが基礎テーブルから読み取られます。

ClickHouse では、マテリアライズドビューは直接クエリできるのみです。ただし、BigQuery （この場合、マテリアライズドビューは基礎テーブルへの変更から 5 分以内に自動的に更新されますが、[30 分ごと以上の頻度で更新されることはありません](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)）と比較して、マテリアライズドビューは常に基礎テーブルと同期しています。

**マテリアライズドビューの更新**

BigQuery はマテリアライズドビューを定期的に完全に更新します。基礎テーブルに対するマテリアライズドビューの変換クエリを実行します。更新の間、BigQuery はマテリアライズドビューのデータと新しい基礎テーブルデータを組み合わせて、一貫したクエリ結果を提供します。

ClickHouse では、マテリアライズドビューはインクリメンタルに更新されます。このインクリメンタル更新機構は、高スケーラビリティと低コンピュータコストを提供します：インクリメンタルに更新されたマテリアライズドビューは、基礎テーブルに数十億または数兆行を含むシナリオに特に設計されています。マテリアライズドビューを更新するために成長し続ける基礎テーブルを繰り返しクエリする代わりに、ClickHouse は新しく挿入された基礎テーブル行の値から部分的な結果を計算します。この部分的な結果は、バックグラウンドで以前に計算された部分的な結果とインクリメンタルにマージされます。これにより、一度に全基礎テーブルからマテリアライズドビューを繰り返し更新するのと比較して、劇的に低いコンピュータコストが得られます。

## トランザクション {#transactions}

ClickHouse と対照的に、BigQuery では、セッションを使用している場合に単一のクエリ内または複数のクエリにわたってマルチステートメントトランザクションをサポートしています。マルチステートメントトランザクションでは、行はデータベースの 1 つ以上のテーブルに挿入または削除され、変更が原子的にコミットまたはロールバックされます。マルチステートメントトランザクションは[ClickHouse の 2024 年のロードマップにあります](https://github.com/ClickHouse/ClickHouse/issues/58392)。

## 集約関数 {#aggregate-functions}

ClickHouse は BigQuery と比較して、組み込みの集約関数が大幅に多く含まれています：

- BigQuery には[18 の集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions)と[4 の近似集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions)があります。
- ClickHouse には[150 以上の事前構築された集約関数](/sql-reference/aggregate-functions/reference)があり、強力な[集約コンビネータ](/sql-reference/aggregate-functions/combinators)もあります。これにより、標準の集約関数の動作を[拡張](https://www.youtube.com/watch?v=7ApwD0cfAFI)できます。例えば、150 以上の事前構築された集約関数を配列に適用するには、単純に[-Array サフィックス](/sql-reference/aggregate-functions/combinators#-array)を使って呼び出すだけです。[-Map サフィックス](/sql-reference/aggregate-functions/combinators#-map)を使えば、任意の集約関数をマップに適用できます。そして、[-ForEach サフィックス](/sql-reference/aggregate-functions/combinators#-foreach)を使えば、任意の集約関数をネストされた配列に適用できます。

## データソースとファイル形式 {#data-sources-and-file-formats}

ClickHouse は BigQuery と比較して、サポートするファイル形式とデータソースが大幅に多くなっています：

- ClickHouse は、ほぼすべてのデータソースから 90 以上のファイル形式をネイティブにサポートしています。
- BigQuery は 5 つのファイル形式と 19 のデータソースをサポートしています。

## SQL言語機能 {#sql-language-features}

ClickHouse は多くの拡張機能と改善が行われた標準 SQL を提供しており、分析タスクに対してより親しみやすくなっています。例として、ClickHouse SQL は[ラムダ関数](/sql-reference/functions#higher-order-functions---operator-and-lambdaparams-expr-function)や高次関数をサポートしているため、変換を適用する際に配列を展開する必要がありません。これは、BigQuery のような他のシステムに対する大きな利点です。

## 配列 {#arrays}

BigQuery の 8 つの配列関数に対して、ClickHouse には 80 以上の[組み込み配列関数](/sql-reference/functions/array-functions)があり、さまざまな問題を優雅かつ簡潔にモデル化および解決できます。

ClickHouse における典型的なデザインパターンは、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用して、テーブルの特定の行値を配列に（テンポラリで）変換することです。その後、配列関数を使用して便利に処理でき、結果は [`arrayJoin`](/sql-reference/functions/array-join) 集約関数を介して個別のテーブル行に戻すことができます。

ClickHouse SQL は[高次ラムダ関数](/sql-reference/functions#higher-order-functions---operator-and-lambdaparams-expr-function)をサポートしているため、多くの高度な配列操作が、配列をテーブルに一時的に変換することなく、内蔵の高次配列関数の 1 つを呼び出すだけで実現できます。これは、BigQuery においては[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[ジッピング](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)のためにしばしば[求められる](https://cloud.google.com/bigquery/docs/arrays)ことを考慮すると、大きな利点です。ClickHouse において、これらの操作は高次関数の単純な関数呼び出しで実行されます[`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-)、および[`arrayZip`](/sql-reference/functions/array-functions#arrayzip)それぞれ。

以下に、BigQuery から ClickHouse への配列操作のマッピングを提供します：

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**サブクエリ内の各行に対して1つの要素を持つ配列を作成**

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
```

_ClickHouse_

[groupArray](/sql-reference/aggregate-functions/reference/grouparray) 集約関数

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
```

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
```

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
```

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 関数

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

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
```

_ClickHouse_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) 関数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**配列のフィルタリング**

_BigQuery_

配列をテーブルに一時的に戻すために[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使用する必要があります。

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
```

**配列をジッピング**

_BigQuery_

配列を一時的にテーブルに戻すために[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使用する必要があります。

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
```

**配列を集約**

_BigQuery_

配列をテーブルに一時的に戻すために[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使用する必要があります。

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

[arraySum](/sql-reference/functions/array-functions#arraysum)、[arrayAvg](/sql-reference/functions/array-functions#arrayavg) などの関数、または[約 90 以上の既存の集約関数名を引数として](/sql-reference/functions/array-functions#arrayreduce)のいずれかを使用します。

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
