---
title: 'BigQuery と ClickHouse Cloud の比較'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'BigQuery と ClickHouse Cloud の違い'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '概要'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# ClickHouse Cloud と BigQuery の比較  {#comparing-clickhouse-cloud-and-bigquery}



## リソースの構成 {#resource-organization}

ClickHouse Cloud におけるリソースの構成方法は、[BigQuery のリソース階層](https://cloud.google.com/bigquery/docs/resource-hierarchy)と類似しています。以下の図に示す ClickHouse Cloud のリソース階層に基づき、主な違いを説明します。

<Image img={bigquery_1} size="md" alt="リソースの構成"/>

### Organizations {#organizations}

BigQuery と同様に、organization は ClickHouse Cloud のリソース階層におけるルートノードです。ClickHouse Cloud アカウントで最初にセットアップしたユーザーは、自動的にそのユーザーが所有する organization に割り当てられます。ユーザーは、ほかのユーザーを organization に招待できます。

### BigQuery Projects と ClickHouse Cloud Services の比較 {#bigquery-projects-vs-clickhouse-cloud-services}

organization の中では、BigQuery の project と大まかに同等の service を作成できます。これは、ClickHouse Cloud に保存されるデータが service に紐づいているためです。ClickHouse Cloud には[複数の service タイプ](/cloud/manage/cloud-tiers)が用意されています。各 ClickHouse Cloud service は特定のリージョンにデプロイされ、次の要素を含みます:

1. コンピュートノードのグループ（現在は Development ティアの service には 2 ノード、Production ティアの service には 3 ノード）。これらのノードについて、ClickHouse Cloud は[垂直スケーリングおよび水平スケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud)の両方を、手動および自動でサポートします。
2. service がすべてのデータを保存するオブジェクトストレージフォルダ。
3. エンドポイント（または ClickHouse Cloud UI コンソールから作成される複数のエンドポイント） - service へ接続するために使用する service の URL（例: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）

### BigQuery Datasets と ClickHouse Cloud Databases の比較 {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse はテーブルを論理的に database にグループ化します。BigQuery の dataset と同様に、ClickHouse の database はテーブルデータを整理し、アクセス制御を行うための論理コンテナです。

### BigQuery Folders {#bigquery-folders}

現在、ClickHouse Cloud には BigQuery の folder に相当する概念は存在しません。

### BigQuery Slot reservations と Quotas {#bigquery-slot-reservations-and-quotas}

BigQuery の slot reservation と同様に、ClickHouse Cloud では [垂直および水平のオートスケーリングを構成](/manage/scaling#configuring-vertical-auto-scaling)できます。垂直オートスケーリングでは、service のコンピュートノードに対してメモリおよび CPU コアの最小値と最大値を設定できます。service はその範囲内で必要に応じてスケールします。これらの設定は、service の初期作成フローの際にも指定できます。service 内の各コンピュートノードは同じサイズです。[水平スケーリング](/manage/scaling#manual-horizontal-scaling)により、service 内のコンピュートノード数を変更できます。

さらに、BigQuery の quota と同様に、ClickHouse Cloud は同時実行制御、メモリ使用量の制限、および I/O スケジューリングを提供し、クエリをワークロードクラスに分離できるようにします。特定のワークロードクラスに対して共有リソース（CPU コア、DRAM、ディスクおよびネットワーク I/O）の上限を設定することで、それらのクエリがほかの重要なビジネスクエリに影響を与えないようにします。同時実行制御により、多数の同時クエリが存在するシナリオでスレッドの過剰割り当てを防ぎます。

ClickHouse はメモリアロケーションのバイトサイズをサーバー、ユーザー、およびクエリレベルで追跡し、柔軟なメモリ使用量制限を可能にします。メモリオーバーコミットにより、クエリは保証メモリを超えて未使用メモリを追加で利用できますが、ほかのクエリに対するメモリ制限は維持されます。加えて、集約、ソート、結合句で使用されるメモリを制限でき、メモリ上限を超えた場合には外部アルゴリズムへのフォールバックが可能です。

最後に、I/O スケジューリングでは、最大帯域幅、インフライト要求数、およびポリシーに基づき、ワークロードクラスごとにローカルおよびリモートディスクへのアクセスを制限できます。

### 権限 {#permissions}

ClickHouse Cloud では、[cloud コンソール](/cloud/guides/sql-console/manage-sql-console-role-assignments)と[データベース](/cloud/security/manage-database-users)の 2 か所でユーザーアクセスを制御します。コンソールアクセスは [clickhouse.cloud](https://console.clickhouse.cloud) のユーザーインターフェイスを介して管理されます。データベースアクセスは、データベースユーザーアカウントとロールによって管理されます。さらに、コンソールユーザーにはデータベース内のロールを付与でき、これによりコンソールユーザーは[SQL コンソール](/integrations/sql-clients/sql-console)を通じてデータベースと対話できます。



## データ型 {#data-types}

ClickHouse は数値型に関して、より細かい精度指定を提供します。たとえば、BigQuery は数値型として [`INT64`, `NUMERIC`, `BIGNUMERIC`, `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types) を提供しています。これに対して ClickHouse は、小数、浮動小数点数、整数に対して複数の精度レベルの型を提供しています。これらのデータ型を用いることで、ClickHouse のユーザーはストレージおよびメモリのオーバーヘッドを最適化でき、その結果、クエリの高速化とリソース消費の削減につながります。以下では、各 BigQuery 型に対応する ClickHouse 型を対応付けています。

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32)（より狭い範囲）                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64)（範囲は狭いが高精度）                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [式としてサポート](/sql-reference/data-types/special-data-types/interval#usage-remarks) または [関数としてサポート](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String（bytes）](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

ClickHouse の型に複数の選択肢がある場合は、実際のデータの取り得る範囲を考慮し、必要最小限のものを選択してください。さらに圧縮を行うには、[適切なコーデック](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) の利用も検討してください。



## クエリ高速化手法 {#query-acceleration-techniques}

### 主キー・外部キーとプライマリインデックス {#primary-and-foreign-keys-and-primary-index}

BigQuery では、テーブルに [主キーおよび外部キー制約](https://cloud.google.com/bigquery/docs/information-schema-table-constraints) を設定できます。一般的に、主キーと外部キーはリレーショナルデータベースにおいてデータ完全性を保証するために使用されます。主キーの値は通常、各行で一意であり、`NULL` にはなりません。各行の外部キーの値は、主キー側テーブルの主キー列に存在するか、`NULL` でなければなりません。BigQuery では、これらの制約は実際には強制されませんが、クエリオプティマイザがこの情報を利用してクエリをさらに最適化する場合があります。

ClickHouse でも、テーブルに主キーを設定できます。BigQuery と同様に、ClickHouse はテーブルの主キー列の値の一意性を強制しません。BigQuery と異なり、テーブルのデータはディスク上において主キー列で [ソートされた順序](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) で格納されます。クエリオプティマイザはこのソート順を利用して再ソートを防ぎ、JOIN のためのメモリ使用量を最小化し、LIMIT 句の早期打ち切りを可能にします。BigQuery と異なり、ClickHouse は主キー列の値に基づいて [（疎な）プライマリインデックス](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) を自動的に作成します。このインデックスは、主キー列に対するフィルタを含むすべてのクエリの高速化に利用されます。ClickHouse は現在、外部キー制約をサポートしていません。



## セカンダリインデックス（ClickHouse のみで利用可能） {#secondary-indexes-only-available-in-clickhouse}

テーブルのプライマリキー列の値から作成されるプライマリインデックスに加えて、ClickHouse ではプライマリキー以外の列にもセカンダリインデックスを作成できます。ClickHouse には複数種類のセカンダリインデックスがあり、それぞれ異なるタイプのクエリに適しています。

- **Bloom Filter インデックス**:
  - 等価条件（例: =、IN）を含むクエリの高速化に使用されます。
  - 確率的データ構造を用いて、データブロック内に値が存在するかどうかを判定します。
- **Token Bloom Filter インデックス**:
  - Bloom Filter インデックスと似ていますが、トークン化された文字列に対して使用され、全文検索クエリに適しています。
- **Min-Max インデックス**:
  - 各データパートごとに、その列の最小値と最大値を保持します。
  - 指定された範囲に含まれないデータパートの読み取りをスキップするのに役立ちます。



## 検索インデックス {#search-indexes}

BigQuery の [search indexes](https://cloud.google.com/bigquery/docs/search-index) と同様に、ClickHouse のテーブルでは、文字列値を持つカラムに対して [full-text indexes](/engines/table-engines/mergetree-family/invertedindexes) を作成できます。



## ベクトルインデックス {#vector-indexes}

BigQuery は最近、Pre-GA 機能として [ベクトルインデックス](https://cloud.google.com/bigquery/docs/vector-index) を導入しました。同様に、ClickHouse でもベクトル検索を高速化するための [インデックス](/engines/table-engines/mergetree-family/annindexes) が実験的にサポートされています。



## パーティション分割 {#partitioning}

BigQuery と同様に、ClickHouse もテーブルをパーティションに分割することで、大規模テーブルをより小さく管理しやすい単位に分け、パフォーマンスと管理性を向上させます。ClickHouse のパーティション分割の詳細については[こちら](/engines/table-engines/mergetree-family/custom-partitioning-key)をご覧ください。



## クラスタリング {#clustering}

クラスタリングを使用すると、BigQuery は指定された少数のカラムの値に基づいてテーブルデータを自動的にソートし、それらを最適なサイズのブロックにまとめて格納します。クラスタリングによりクエリのパフォーマンスが向上し、BigQuery はクエリの実行コストをより正確に見積もれるようになります。クラスタリングされたカラムを利用することで、クエリは不要なデータのスキャンも回避できます。

ClickHouse では、テーブルのプライマリキーのカラムに基づいてデータは自動的に[ディスク上でクラスタ化](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files)され、プライマリインデックスのデータ構造を利用するクエリによってすばやく特定または除外できるブロックとして論理的に構成されます。



## マテリアライズドビュー {#materialized-views}

BigQuery と ClickHouse はどちらもマテリアライズドビューをサポートしています。これは、ベーステーブルに対して実行される変換クエリの結果を基に事前計算された結果を保持するもので、パフォーマンスと効率を向上させます。



## マテリアライズドビューのクエリ実行 {#querying-materialized-views}

BigQuery のマテリアライズドビューは、直接クエリすることも、オプティマイザが基となるテーブルへのクエリを処理するために利用することもできます。基となるテーブルへの変更によってマテリアライズドビューが無効化される可能性がある場合は、データは基となるテーブルから直接読み取られます。基となるテーブルへの変更がマテリアライズドビューを無効化しない場合は、残りのデータはマテリアライズドビューから読み取られ、変更分のみが基となるテーブルから読み取られます。

ClickHouse では、マテリアライズドビューは直接クエリすることしかできません。ただし、BigQuery（マテリアライズドビューは基となるテーブルの変更から 5 分以内に自動更新されますが、[30 分ごと](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)よりも頻繁には更新されません）と比較すると、ClickHouse のマテリアライズドビューは常に基となるテーブルと同期しています。

**マテリアライズドビューの更新**

BigQuery は、基となるテーブルに対してビューの変換クエリを実行することで、マテリアライズドビューを定期的にフルリフレッシュします。リフレッシュの間は、一貫したクエリ結果を提供しつつマテリアライズドビューを引き続き利用するために、BigQuery はマテリアライズドビューのデータと新しい基となるテーブルのデータを組み合わせます。

ClickHouse では、マテリアライズドビューはインクリメンタルに更新されます。このインクリメンタル更新メカニズムにより、高いスケーラビリティと低い計算コストが実現されます。インクリメンタル更新されるマテリアライズドビューは、基となるテーブルが数十億から数兆行のデータを含むようなシナリオ向けに特別に設計されています。マテリアライズドビューをリフレッシュするために、増え続ける基となるテーブル全体に対して繰り返しクエリを実行する代わりに、ClickHouse は新たに挿入された基となるテーブル行の値だけから部分的な結果を計算します。この部分的な結果は、バックグラウンドで以前に計算された部分的な結果とインクリメンタルにマージされます。その結果、基となるテーブル全体からマテリアライズドビューを繰り返しリフレッシュする場合と比べて、計算コストを劇的に削減できます。



## トランザクション {#transactions}

ClickHouse と対照的に、BigQuery は 1 つのクエリ内、またはセッションを使用することで複数のクエリにまたがる複数ステートメントのトランザクションをサポートしています。複数ステートメントのトランザクションを使用すると、1 つ以上のテーブルに対する行の挿入や削除といった変更操作を行い、その変更を原子的にコミットまたはロールバックできます。複数ステートメントトランザクションは [ClickHouse の 2024 年のロードマップ](https://github.com/ClickHouse/ClickHouse/issues/58392) に含まれています。



## 集約関数 {#aggregate-functions}

BigQuery と比べると、ClickHouse には標準で利用できる集約関数が大幅に多く用意されています:

- BigQuery には [18 個の集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions) と、[4 個の近似集約関数](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions) が用意されています。
- ClickHouse には [150 個以上の事前定義された集約関数](/sql-reference/aggregate-functions/reference) に加えて、事前定義された集約関数の動作を[拡張](https://www.youtube.com/watch?v=7ApwD0cfAFI)するための強力な [aggregation combinator](/sql-reference/aggregate-functions/combinators) が用意されています。例えば、150 個を超える事前定義済み集約関数をテーブルの行ではなく配列に対して適用したい場合は、[-Array サフィックス](/sql-reference/aggregate-functions/combinators#-array) を付けて呼び出すだけで構いません。[-Map サフィックス](/sql-reference/aggregate-functions/combinators#-map) を付けると、任意の集約関数を Map 型に対して適用できます。また、[-ForEach サフィックス](/sql-reference/aggregate-functions/combinators#-foreach) を付けると、任意の集約関数をネストされた配列に対して適用できます。



## データソースとファイル形式 {#data-sources-and-file-formats}

BigQuery と比較すると、ClickHouse ははるかに多くのファイル形式とデータソースをサポートしています。

- ClickHouse は、事実上あらゆるデータソースから 90 以上のファイル形式でデータを読み込むことをネイティブにサポートしています
- BigQuery は 5 種類のファイル形式と 19 種類のデータソースをサポートしています



## SQL 言語機能 {#sql-language-features}

ClickHouse は、分析タスクにより適したものとなるよう、多くの拡張と改良を施した標準 SQL を提供します。例えば、ClickHouse SQL は [ラムダ関数をサポートし](/sql-reference/functions/overview#arrow-operator-and-lambda)、高階関数も利用できるため、変換処理を行う際に配列をアンネストしたり explode したりする必要がありません。これは BigQuery のような他のシステムと比べて大きな利点です。



## 配列 {#arrays}

BigQuery の配列関数が 8 個であるのに対して、ClickHouse には 80 個以上の[組み込み配列関数](/sql-reference/functions/array-functions)があり、幅広い問題をエレガントかつシンプルにモデリング・解決できます。

ClickHouse における典型的な設計パターンは、[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 集約関数を使用して、テーブル内の特定の行の値を（一時的に）配列に変換することです。これにより配列関数で効率的に処理でき、その結果は [`arrayJoin`](/sql-reference/functions/array-join) 集約関数を使って再び個々のテーブル行に変換できます。

ClickHouse SQL は[高階ラムダ関数](/sql-reference/functions/overview#arrow-operator-and-lambda)をサポートしているため、多くの高度な配列操作は、BigQuery でよく[必要となる](https://cloud.google.com/bigquery/docs/arrays)ような、一時的に配列をテーブルへ戻す処理を行わなくても、高階の組み込み配列関数を 1 つ呼び出すだけで実現できます。たとえば、配列の[フィルタリング](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays)や[zip 結合](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays)などです。ClickHouse では、これらの操作はそれぞれ高階関数 [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) と [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) を呼び出すだけです。

以下では、配列操作に関する BigQuery から ClickHouse への対応表を示します。

| BigQuery                                                                                                                 | ClickHouse                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [ARRAY&#95;CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)           | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY&#95;LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)           | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY&#95;REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)         | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY&#95;TO&#95;STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)       | [range](/sql-reference/functions/array-functions#range)                                     |

**サブクエリ内の各行に対応する 1 要素の配列を作成する**

*BigQuery*

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

*ClickHouse*

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

**配列を行の集合に変換する**

*BigQuery*

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

*ClickHouse*

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

[range](/sql-reference/functions/array-functions#range) 関数 + [arrayMap](/sql-reference/functions/array-functions#arrayMap) 関数

*ClickHouse*

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**タイムスタンプ配列を返す**

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

[range](/sql-reference/functions/array-functions#range) と [arrayMap](/sql-reference/functions/array-functions#arrayMap) 関数

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**配列のフィルタリング**

*BigQuery*

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使って、一時的に配列をテーブルに展開し直す必要があります

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

**配列のジップ（zipping）**

*BigQuery*

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子を使用して、一時的に配列をテーブル形式に戻す必要がある

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

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 演算子で配列をテーブルに戻す必要がある

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

[arraySum](/sql-reference/functions/array-functions#arraySum)、[arrayAvg](/sql-reference/functions/array-functions#arrayAvg) などの関数、または 90 を超える既存の集約関数名のいずれかを [arrayReduce](/sql-reference/functions/array-functions#arrayReduce) 関数の引数として使用できます


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
