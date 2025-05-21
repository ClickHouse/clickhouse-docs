---
description: '`MergeTree`-ファミリーのテーブルエンジンは、高いデータ取り込み速度と膨大なデータ量に対応するように設計されています。'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

`MergeTree` エンジンと `MergeTree` ファミリーの他のエンジン（例: `ReplacingMergeTree`, `AggregatingMergeTree`）は、ClickHouseで最も一般的に使用されている、最も堅牢なテーブルエンジンです。

`MergeTree`-ファミリーのテーブルエンジンは、高いデータ取り込み速度と膨大なデータ量に対応するように設計されています。
挿入操作は、テーブルパーツを作成し、これらはバックグラウンドプロセスによって他のテーブルパーツとマージされます。

`MergeTree`-ファミリーのテーブルエンジンの主な機能。

- テーブルの主キーは、各テーブルパーツ内のソート順序を決定します（クラスタ化インデックス）。主キーは、個々の行ではなく、8192 行のブロックであるグラニュールを参照します。これにより、巨大なデータセットの主キーはメインメモリに保持できるほど小さくなり、ディスク上のデータへの高速アクセスを提供します。

- テーブルは任意のパーティション式を使用してパーティション化できます。クエリが許可される場合、パーティションプルーニングにより、読み取りからパーティションが省略されます。

- データは高可用性、フェイルオーバー、およびゼロダウンタイムのアップグレードのために、複数のクラスタノードに複製できます。詳細は [データレプリケーション](/engines/table-engines/mergetree-family/replication.md) を参照してください。

- `MergeTree` テーブルエンジンは、クエリ最適化を支援するために、さまざまな統計の種類やサンプリング方法をサポートします。

:::note
同様の名前にもかかわらず、[Merge](/engines/table-engines/special/merge) エンジンは `*MergeTree` エンジンとは異なります。
:::
## テーブルの作成 {#table_engine-mergetree-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr1] [COMMENT ...] [CODEC(codec1)] [STATISTICS(stat1)] [TTL expr1] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    name2 [type2] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr2] [COMMENT ...] [CODEC(codec2)] [STATISTICS(stat2)] [TTL expr2] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    ...
    INDEX index_name1 expr1 TYPE type1(...) [GRANULARITY value1],
    INDEX index_name2 expr2 TYPE type2(...) [GRANULARITY value2],
    ...
    PROJECTION projection_name_1 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY]),
    PROJECTION projection_name_2 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY])
) ENGINE = MergeTree()
ORDER BY expr
[PARTITION BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[TTL expr
    [DELETE|TO DISK 'xxx'|TO VOLUME 'xxx' [, ...] ]
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ] ]
[SETTINGS name = value, ...]
```

パラメータの詳細な説明については、[CREATE TABLE](/sql-reference/statements/create/table.md) ステートメントを参照してください。
### クエリ句 {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — エンジンの名前とパラメータ。 `ENGINE = MergeTree()`。 `MergeTree` エンジンはパラメータを持ちません。
#### ORDER_BY {#order_by}

`ORDER BY` — ソートキー。

カラム名または任意の式のタプル。例: `ORDER BY (CounterID + 1, EventDate)`。

主キーが定義されていない場合（つまり、`PRIMARY KEY` が指定されていない場合）、ClickHouseはソートキーを主キーとして使用します。

ソートが不要な場合、`ORDER BY tuple()` 構文を使用できます。
また、`create_table_empty_primary_key_by_default` が有効になっている場合、`CREATE TABLE` ステートメントに `ORDER BY tuple()` が暗黙的に追加されます。詳細は [主キーの選択](#selecting-a-primary-key) を参照してください。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。オプションです。ほとんどの場合、パーティションキーは必要なく、パーティション化が必要な場合でも、一般的には月単位のパーティションキーが必要です。パーティション化はクエリを高速化することはありません（ORDER BY 式とは対照的に）。あまり細かいパーティション化は避けるべきです。クライアント識別子や名前でデータをパーティション化しないでください（その代わり、ORDER BY 式の最初のカラムにクライアント識別子や名前を指定してください）。

月単位でのパーティション化には、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) タイプのカラムです。ここでのパーティション名は `"YYYYMM"` フォーマットです。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — ソートキーと異なる場合の主キーです (#choosing-a-primary-key-that-differs-from-the-sorting-key)。オプションです。

ソートキーを指定すると（`ORDER BY` 句を使用）、主キーが暗黙的に指定されます。
通常、ソートキーに加えて主キーを指定する必要はありません。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング式。オプションです。

指定された場合、主キーに含まれていなければなりません。
サンプリング式は、符号なしの整数を生成する必要があります。

例: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
#### TTL {#ttl}

`TTL` — 行のストレージ期間と自動パーツ移動のロジックを指定する規則のリストです [ディスクとボリュームの間](#table_engine-mergetree-multiple-volumes)。オプションです。

式は `Date` または `DateTime` を返す必要があります。例: `TTL date + INTERVAL 1 DAY`。

規則のタイプ `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` は、式が満たされた場合（現在の時間に達した場合）にパーツに対して実行されるアクションを指定します: 期限切れの行の削除、指定されたディスク（`TO DISK 'xxx'`）またはボリューム（`TO VOLUME 'xxx'`）へのパーツの移動、または期限切れの行の値を集約します。規則のデフォルトタイプは削除（`DELETE`）です。複数の規則リストを指定できますが、`DELETE`規則は1つだけでなければなりません。

詳細については、[カラムとテーブルのTTL](#table_engine-mergetree-ttl)を参照してください。
#### SETTINGS {#settings}

[MergeTree 設定](../../../operations/settings/merge-tree-settings.md)を参照してください。

**セクション設定の例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

この例では、月ごとにパーティション化を設定しています。

また、ユーザーIDによるハッシュとしてサンプリングのための式を設定しています。これにより、各 `CounterID` と `EventDate` のデータを擬似ランダム化することができます。データを選択する際に [SAMPLE](/sql-reference/statements/select/sample) 句を定義すると、ClickHouseはユーザーのサブセットに対して均等に擬似ランダムなデータサンプルを返します。

`index_granularity` 設定は、8192 がデフォルト値であるため省略できます。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを前述の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree() のパラメータ**

- `date-column` — [Date](/sql-reference/data-types/date.md) タイプのカラムの名前。ClickHouseはこのカラムに基づいて月ごとにパーティションを自動的に作成します。パーティション名は `"YYYYMM"` フォーマットです。
- `sampling_expression` — サンプリングのための式。
- `(primary, key)` — 主キー。タイプ: [Tuple()](/sql-reference/data-types/tuple.md)。
- `index_granularity` — インデックスの粒度。インデックスの「マーク」の間のデータ行の数。値 8192 はほとんどのタスクに適しています。

**例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` エンジンは、上記の例のように主なエンジン設定メソッドで設定されます。
</details>
## データストレージ {#mergetree-data-storage}

テーブルは主キーによってソートされたデータパーツで構成されています。

テーブルにデータが挿入されると、別々のデータパーツが作成され、各々が主キーによって辞書順にソートされます。例えば、主キーが `(CounterID, Date)` の場合、パーツ内のデータは `CounterID` によってソートされ、各 `CounterID` 内部は `Date` によって順序付けられます。

異なるパーティションに属するデータは異なるパーツに分けられます。ClickHouseはバックグラウンドでデータパーツをマージして、より効率的なストレージを実現します。異なるパーティションに属するパーツはマージされません。マージメカニズムは、同じ主キーを持つすべての行が同じデータパートに存在することを保証しません。

データパーツは `Wide` または `Compact` 形式で保存されます。`Wide` 形式では各カラムがファイルシステム内の別々のファイルに保存され、`Compact` 形式ではすべてのカラムが1つのファイルに保存されます。`Compact` 形式は、小規模で頻繁な挿入のパフォーマンスを向上させるために使用されます。

データストレージ形式は、テーブルエンジンの設定 `min_bytes_for_wide_part` および `min_rows_for_wide_part` によって制御されます。データパートのバイト数または行数が、対応する設定値よりも少ない場合、パートは `Compact` 形式で保存されます。それ以外の場合は `Wide` 形式で保存されます。これらの設定が設定されていない場合、データパーツは `Wide` 形式で保存されます。

各データパートは論理的にグラニュールに分割されます。グラニュールは、ClickHouseがデータを選択する際に読み取る最小の不可分のデータセットです。ClickHouseは行または値を分割しないため、各グラニュールには常に整数数の行が含まれます。グラニュールの最初の行には、その行の主キーの値がマークされます。ClickHouseは、各データパートのために、マークを保存するインデックスファイルを作成します。主キーに含まれているかどうかにかかわらず、ClickHouseは同じマークを保存します。これにより、カラムファイル内のデータを直接見つけることができます。

グラニュールのサイズは、テーブルエンジンの設定 `index_granularity` および `index_granularity_bytes` によって制約されます。グラニュール内の行数は `[1, index_granularity]` の範囲にあり、行サイズに応じて変動します。単一行のサイズが設定の値を超える場合、グラニュールのサイズは `index_granularity_bytes` を超えることができます。この場合、グラニュールのサイズは行のサイズと等しくなります。
## 主キーとクエリのインデックス {#primary-keys-and-indexes-in-queries}

主キー `(CounterID, Date)` を例にとりましょう。この場合、ソートとインデックスは次のように示せます。

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

データクエリが次のように指定されている場合:

- `CounterID in ('a', 'h')` の場合、サーバーは `[0, 3)` および `[6, 8)` のマークの範囲からデータを読み取ります。
- `CounterID IN ('a', 'h') AND Date = 3` の場合、サーバーは `[1, 3)` および `[7, 8)` のマークの範囲からデータを読み取ります。
- `Date = 3` の場合、サーバーは `[1, 10]` のマークの範囲からデータを読み取ります。

上記の例から、インデックスを使用する方がフルスキャンよりも常に効果的であることがわかります。

スパースインデックスは、追加データを読むことを許可します。主キーの単一範囲を読み取る際に、各データブロック内で最大 `index_granularity * 2` の追加行を読み取ることができます。

スパースインデックスを使用することで、非常に大規模なテーブル行を扱うことが可能になります。ほとんどのケースで、このようなインデックスはコンピュータのRAMに収まります。

ClickHouseは、ユニークな主キーを必要とはしません。主キーが同じ複数の行を挿入することができます。

`PRIMARY KEY` および `ORDER BY` 句に `Nullable` 型の式を使用できますが、強く推奨されません。この機能を有効にするには、[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 設定をオンにします。[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) の原則は、`ORDER BY` 句の `NULL` 値に適用されます。
### 主キーの選択 {#selecting-a-primary-key}

主キーのカラム数に明確な制限はありません。データ構造によっては、主キーに含めるカラムを増やすことも減らすこともできます。これにより:

- インデックスの性能が向上します。

    主キーが `(a, b)` の場合、別のカラム `c` を追加すると、次の条件を満たしていれば性能が向上します:

    - カラム `c` に関する条件を含むクエリがあります。
    - `(a, b)` の同一値を持つ長いデータ範囲（`index_granularity` よりも数倍長い）が一般的です。つまり、もう1つのカラムを追加することでかなり長いデータ範囲をスキップできる場合です。

- データ圧縮が向上します。

    ClickHouseは主キーによってデータをソートするため、一貫性が高いほど圧縮率は良くなります。

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) および [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) エンジンでデータパーツをマージする際に、追加のロジックを提供します。

    この場合、主キーとは異なる*ソートキー*を指定することが理にかないます。

長い主キーは挿入性能やメモリ消費に悪影響を及ぼしますが、主キーに余分なカラムを追加しても ClickHouse の `SELECT` クエリの性能には影響しません。

主キーなしでテーブルを作成するには、`ORDER BY tuple()` 構文を使用します。この場合、ClickHouse は挿入の順序でデータを保存します。`INSERT ... SELECT` クエリによるデータ挿入時にデータの順序を保持したい場合は、[max_insert_threads = 1](/operations/settings/settings#max_insert_threads) を設定してください。

初期の順序でデータを選択するには、[シングルスレッド](/operations/settings/settings.md/#max_threads) の `SELECT` クエリを使用します。
### ソートキーとは異なる主キーの選択 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

主キー（各マークに対してインデックスファイルに書き込まれる値の式）を指定することが可能で、これはソートキー（データパーツ内の行をソートするための式）とは異なります。この場合、主キー式のタプルはソートキー式のタプルのプレフィックスである必要があります。

この機能は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) および [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジンを使用する際に役立ちます。一般的なケースでは、これらのエンジンを使用する場合、テーブルには*次元*と*測定値*の2種類のカラムがあります。典型的なクエリは、次元によるフィルタリングとともに、任意の `GROUP BY` で測定値カラムの値を集約します。SummingMergeTree と AggregatingMergeTree は、ソートキーの同じ値を持つ行を集約するため、すべての次元を追加することが自然です。その結果、キー式は長いカラムのリストで構成され、このリストは新たに追加される次元で頻繁に更新される必要があります。

この場合、効率的な範囲スキャンを提供するために主キーにわずか数カラムを残し、残りの次元カラムをソートキータプルに追加することが理にかなっています。

ソートキーの [ALTER](/sql-reference/statements/alter/index.md) は軽量な操作です。新しいカラムがテーブルとソートキーの両方に同時に追加されると、既存のデータパーツは変更する必要がありません。古いソートキーが新しいソートキーのプレフィックスであり、新しく追加されたカラムにデータがないため、テーブルの変更時にデータは古いソートキーと新しいソートキーの両方でソートされます。
### クエリにおけるインデックスとパーティションの使用 {#use-of-indexes-and-partitions-in-queries}

`SELECT` クエリの場合、ClickHouse はインデックスが使用できるかどうかを分析します。インデックスは、`WHERE/PREWHERE` 句が主キーまたはパーティションキーに含まれるカラムや式の等号または不等号比較操作を表す式、または固定プレフィックスを持つ `IN` または `LIKE` を含む場合に使用できます。また、これらの式の論理関係でも使用できます。

したがって、主キーの1つまたは複数の範囲でクエリを迅速に実行できます。この例では、特定のトラッキングタグ、特定のタグと日付範囲、特定のタグと日付、複数のタグと日付範囲のクエリが迅速に実行されます。

次のように構成されたエンジンを見てみましょう:
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

この場合、クエリでは:

```sql
SELECT count() FROM table
WHERE EventDate = toDate(now())
AND CounterID = 34

SELECT count() FROM table
WHERE EventDate = toDate(now())
AND (CounterID = 34 OR CounterID = 42)

SELECT count() FROM table
WHERE ((EventDate >= toDate('2014-01-01')
AND EventDate <= toDate('2014-01-31')) OR EventDate = toDate('2014-05-01'))
AND CounterID IN (101500, 731962, 160656)
AND (CounterID = 101500 OR EventDate != toDate('2014-05-01'))
```

ClickHouse は、主キーインデックスを使用して不適切なデータをトリミングし、月ごとのパーティションキーを使用して不適切な日付範囲内のパーティションをトリミングします。

上記のクエリは、複雑な式のためにインデックスが使用されることを示しています。テーブルからの読み取りは、インデックスを使用できない場合でも、フルスキャンより遅くなることはありません。

以下の例では、インデックスは使用されません。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリを実行する際に ClickHouse がインデックスを使用できるかどうかを確認するには、設定 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) と [force_primary_key](/operations/settings/settings.md/#force_primary_key) を使用します。

月ごとのパーティションキーは、適切な範囲のデータブロックのみを読み取ることを許可します。この場合、データブロックには多数の日付が含まれている可能性があります（1か月分など）。ブロック内では、データは主キーによってソートされますが、これは最初のカラムとして日付を含まない場合があります。このため、主キー接頭辞を指定しない単一日付条件のみを含むクエリを使用すると、単一の日付よりも多くのデータが読み込まれる可能性があります。
### 部分的に単調増加する主キーのインデックスの使用 {#use-of-index-for-partially-monotonic-primary-keys}

例えば、月の日付を考慮します。これは、1か月単位で[単調増加する系列](https://en.wikipedia.org/wiki/Monotonic_function)を形成しますが、より長い期間では単調増加しません。これは部分的に単調増加する系列です。ユーザーが部分的に単調増加する主キーでテーブルを作成すると、ClickHouse は通常どおりスパースインデックスを作成します。ユーザーがこの種のテーブルからデータを選択すると、ClickHouse はクエリ条件を分析します。ユーザーがインデックスの2つのマーク間のデータを取得しようとすると、それらのマークが1ヵ月以内に収まる場合、ClickHouse はこの特定のケースでインデックスを使用できます。なぜなら、クエリのパラメータとインデックスマークの間の距離を計算できるからです。

クエリパラメータ範囲内の主キーの値が単調増加する系列を表していない場合、ClickHouse はインデックスを使用できません。この場合、ClickHouse はフルスキャン方式を使用します。

ClickHouse はこのロジックを、月の日付系列だけでなく、部分的に単調増加する系列を表す任意の主キーにも使用します。
### データスキッピングインデックス {#table_engine-mergetree-data_skipping-indexes}

インデックス宣言は `CREATE` クエリのカラムセクションにあります。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree` ファミリーのテーブルでは、データスキッピングインデックスを指定できます。

これらのインデックスは、指定された式に関する情報をブロック単位で集約します。ブロックは `granularity_value` グラニュールで構成されます（グラニュールのサイズはテーブルエンジンの `index_granularity` 設定を使用して指定されます）。その後、これらの集約は、`SELECT` クエリで使用されて、クエリの `where` が満たされない大きなデータブロックをスキップすることによって、ディスクから読み取るデータ量を削減します。

`GRANULARITY` 句は省略可能で、デフォルトの `granularity_value` は 1 です。

**例**

```sql
CREATE TABLE table_name
(
    u64 UInt64,
    i32 Int32,
    s String,
    ...
    INDEX idx1 u64 TYPE bloom_filter GRANULARITY 3,
    INDEX idx2 u64 * i32 TYPE minmax GRANULARITY 3,
    INDEX idx3 u64 * length(s) TYPE set(1000) GRANULARITY 4
) ENGINE = MergeTree()
...
```

上記のインデックスは、ClickHouse が次のクエリでディスクから読み取るデータ量を削減するために使用できます。

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキッピングインデックスは、複合カラムにも作成できます。

```sql
-- Map 型のカラムに対して:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- Tuple 型のカラムに対して:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- Nested 型のカラムに対して:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### 利用可能なインデックスの種類 {#available-types-of-indices}
#### MinMax {#minmax}

指定された式の極値を保存します（式が `tuple` の場合、タプルの各要素の極値を保存します）。データブロックをスキップするために保存された情報が使用されます。

構文: `minmax`
#### Set {#set}

指定された式のユニークな値を保存します（最大 `max_rows` 行、`max_rows=0` は「制限なし」を意味します）。ブロック内の `WHERE` 式が満たされないかを確認するために値が使用されます。

構文: `set(max_rows)`
#### Bloom Filter {#bloom-filter}

指定されたカラムに対する[Bloomフィルタ](https://en.wikipedia.org/wiki/Bloom_filter)を保存します。オプションの `false_positive` パラメータは、0 から 1 の間の値を取り、フィルタからの偽陽性応答を受ける確率を指定します。デフォルト値: 0.025。サポートされるデータ型: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` および `Map`。`Map` データ型の場合、クライアントはインデックスがキーまたは値のいずれに対して作成されるべきかを [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) または [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 関数を使用して指定できます。

構文: `bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

ブロック内のすべての n-gram を含む [Bloomフィルタ](https://en.wikipedia.org/wiki/Bloom_filter) を保存します。データ型: [String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md) および [Map](/sql-reference/data-types/map.md) のみに対応します。`EQUALS`、`LIKE` および `IN` の式の最適化に使用できます。

構文: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngram のサイズ
- `size_of_bloom_filter_in_bytes` — Bloomフィルタのサイズ（ここでは大きな値、例えば 256 または 512 を使用できます。なぜなら、非常によく圧縮されるからです）。
- `number_of_hash_functions` — Bloomフィルタで使用されるハッシュ関数の数。
- `random_seed` — Bloomフィルタのハッシュ関数のシード。

ユーザーは、`ngrambf_v1`のパラメータセットを見積もるために [UDF](/sql-reference/statements/create/function.md) を作成できます。クエリステートメントは次の通りです。

```sql
CREATE FUNCTION bfEstimateFunctions [ON CLUSTER cluster]
AS
(total_number_of_all_grams, size_of_bloom_filter_in_bits) -> round((size_of_bloom_filter_in_bits / total_number_of_all_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize [ON CLUSTER cluster]
AS
(total_number_of_all_grams,  probability_of_false_positives) -> ceil((total_number_of_all_grams * log(probability_of_false_positives)) / log(1 / pow(2, log(2))));

CREATE FUNCTION bfEstimateFalsePositive [ON CLUSTER cluster]
AS
(total_number_of_all_grams, number_of_hash_functions, size_of_bloom_filter_in_bytes) -> pow(1 - exp(-number_of_hash_functions/ (size_of_bloom_filter_in_bytes / total_number_of_all_grams)), number_of_hash_functions);

CREATE FUNCTION bfEstimateGramNumber [ON CLUSTER cluster]
AS
(number_of_hash_functions, probability_of_false_positives, size_of_bloom_filter_in_bytes) -> ceil(size_of_bloom_filter_in_bytes / (-number_of_hash_functions / log(1 - exp(log(probability_of_false_positives) / number_of_hash_functions))))
```
これらの関数を使用するには、少なくとも2つのパラメーターを指定する必要があります。
例えば、グラニュール内に 4300 の n-gram があり、偽陽性が 0.0001 未満であると期待する場合、他のパラメーターは次のクエリを実行することで見積もることができます。

```sql
--- フィルタのビット数を見積もる
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- ハッシュ関数の数を見積もる
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

もちろん、他の条件でパラメーターを見積もるために、これらの関数を使用することもできます。
これらの関数は、[こちら](https://hur.st/bloomfilter)の内容を参照します。
#### Token Bloom Filter {#token-bloom-filter}

`ngrambf_v1` と同じですが、n-gram の代わりにトークンを保存します。トークンとは、非英数字で区切られた文字列のことです。

構文: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 特殊目的 {#special-purpose}

- おおよその最近傍探索をサポートするための実験的インデックス。詳細は [こちら](annindexes.md) を参照してください。
- フルテキスト検索をサポートするための実験的なフルテキストインデックス。詳細は [こちら](invertedindexes.md) を参照してください。

### 関数のサポート {#functions-support}

`WHERE`句の条件には、カラムを操作する関数の呼び出しが含まれています。カラムがインデックスの一部である場合、ClickHouseは関数を実行する際にこのインデックスを使用しようとします。ClickHouseはインデックスを使用するために異なる関数のサブセットをサポートしています。

`set`タイプのインデックスはすべての関数で利用できます。他のインデックスタイプは以下のようにサポートされています。

| 関数 (演算子) / インデックス                                                                 | 主キー  | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|--------------------------------------------------------------------------------------------------|---------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)          | ✔       | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)  | ✔       | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                      | ✔       | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)              | ✔       | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                    | ✗       | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)               | ✔       | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                   | ✗       | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany) | ✗       | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                            | ✔       | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                         | ✔       | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                   | ✔       | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)             | ✔       | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)  | ✔       | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)| ✔       | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                             | ✔       | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                       | ✔       | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                 | ✗       | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                             | ✗       | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                             | ✗       | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                     | ✗       | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                               | ✗       | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                  | ✗       | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                            | ✗       | ✗      | ✗          | ✔          | ✗            | ✗         |

定数引数が ngram サイズ未満の関数は、`ngrambf_v1` によるクエリ最適化には使用できません。

(*) `hasTokenCaseInsensitive` および `hasTokenCaseInsensitiveOrNull` を効果的にするには、`tokenbf_v1` インデックスを小文字化したデータに対して作成する必要があります。例えば、`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`のようにします。

:::note
ブロームフィルターは偽陽性の一致を持つ可能性があるため、`ngrambf_v1`、`tokenbf_v1`、および `bloom_filter` インデックスは、関数の結果が偽であることが期待されるクエリの最適化には使用できません。

例えば：

- 最適化できる：
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- 最適化できない：
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::
## プロジェクション {#projections}
プロジェクションは、[マテリアライズドビュー](/sql-reference/statements/create/view)のようなものですが、パーツレベルで定義されています。クエリに自動的に使用されるとともに、一貫性の保証を提供します。

:::note
プロジェクションを実装する際は、[force_optimize_projection](/operations/settings/settings#force_optimize_projection) 設定も考慮する必要があります。
:::

プロジェクションは、[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子を持つ `SELECT` 文ではサポートされていません。
### プロジェクションクエリ {#projection-query}
プロジェクションクエリは、プロジェクションを定義するものです。親テーブルからデータを暗黙的に選択します。
**構文**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

プロジェクションは、[ALTER](/sql-reference/statements/alter/projection.md) 文で変更するか削除できます。
### プロジェクションストレージ {#projection-storage}
プロジェクションはパートディレクトリ内に保存されます。これはインデックスに似ていますが、匿名の `MergeTree` テーブルのパートを保存するサブディレクトリを含みます。テーブルはプロジェクションの定義クエリによって誘発されます。`GROUP BY` 句がある場合、基盤となるストレージエンジンは [AggregatingMergeTree](aggregatingmergetree.md) になり、すべての集約関数は `AggregateFunction` に変換されます。`ORDER BY` 句がある場合、`MergeTree` テーブルはそれを主キー式として使用します。マージプロセス中に、プロジェクションパートはそのストレージのマージルーチンを介してマージされます。親テーブルのパートのチェックサムは、プロジェクションのパートと組み合わされます。他のメンテナンス作業は、スキップインデックスと似ています。
### クエリ分析 {#projection-query-analysis}
1. プロジェクションが与えられたクエリに応答するために使用できるか確認し、基底テーブルをクエリしたときと同じ回答を生成するかを確認します。
2. 読み取るグラニュールが最も少ない、最適なマッチを選択します。
3. プロジェクションを使用するクエリパイプラインは、元のパーツを使用するものとは異なるでしょう。いくつかのパーツにプロジェクションがない場合、パイプラインを追加してリアルタイムで「投影」できます。
## 同時データアクセス {#concurrent-data-access}

同時テーブルアクセスのために、マルチバージョン管理を使用します。言い換えれば、テーブルが同時に読み取られ、更新されるとき、データはクエリの時点で最新のパーツセットから読み取られます。長時間ロックはありません。挿入は読み取り操作を妨げません。

テーブルからの読み取りは自動的に並列化されます。
## カラムとテーブルのTTL {#table_engine-mergetree-ttl}

値の寿命を決定します。

`TTL` 句はテーブル全体および各カラムに対して設定できます。テーブルレベルの `TTL` は、ディスクとボリューム間のデータの自動移動のロジックや、すべてのデータが期限切れになっているパーツの再圧縮を指定することもできます。

式は [Date](/sql-reference/data-types/date.md) または [DateTime](/sql-reference/data-types/datetime.md) データ型として評価されなければなりません。

**構文**

カラムの有効期限を設定する：

```sql
TTL time_column
TTL time_column + interval
```

`interval` を定義するには、[時間間隔](/sql-reference/operators#operators-for-working-with-dates-and-times) 演算子を使用します。例えば：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### カラムTTL {#mergetree-column-ttl}

カラム内の値が期限切れになると、ClickHouseはそれをカラムデータ型のデフォルト値で置き換えます。データパート内のすべてのカラム値が期限切れになると、ClickHouseはこのカラムをファイルシステム内のデータパートから削除します。

`TTL` 句はキー カラムには使用できません。

**例**
#### `TTL`を持つテーブルの作成: {#creating-a-table-with-ttl}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int TTL d + INTERVAL 1 MONTH,
    b Int TTL d + INTERVAL 1 MONTH,
    c String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d;
```
#### 既存のテーブルのカラムにTTLを追加する {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```
#### カラムのTTLを変更する {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```
### テーブルTTL {#mergetree-table-ttl}

テーブルは、期限切れ行の削除のための式を持っている場合もあり、[ディスクまたはボリューム](#table_engine-mergetree-multiple-volumes)間でパーツを自動的に移動するための複数の式を持つことが可能です。テーブル内の行が期限切れになると、ClickHouseはすべての対応する行を削除します。パーツの移動または再圧縮の場合、パートの全ての行が `TTL` 式の条件を満たさなければなりません。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL ルールのタイプは、それぞれの TTL 式に続けて定義されます。この式が満たされたとき（現在の時間に達したとき）に実行するアクションに影響します：

- `DELETE` - 期限切れ行を削除する（デフォルトのアクション）；
- `RECOMPRESS codec_name` - データパートを `codec_name` で再圧縮する；
- `TO DISK 'aaa'` - パーツをディスク `aaa` に移動する；
- `TO VOLUME 'bbb'` - パーツをボリューム `bbb` に移動する；
- `GROUP BY` - 期限切れ行を集約します。

`DELETE` アクションは、フィルタリング条件に基づいて、期限切れ行の一部のみを削除するために `WHERE` 句と一緒に使用できます：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 式は、テーブル主キーのプレフィックスでなければなりません。

あるカラムが `GROUP BY` 式の一部でなく、`SET` 句で明示的に設定されていない場合、結果行にはグループ化された行からの偶然の値が含まれます（集約関数 `any` が適用されたかのように）。

**例**
#### `TTL`を持つテーブルの作成: {#creating-a-table-with-ttl-1}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE,
    d + INTERVAL 1 WEEK TO VOLUME 'aaa',
    d + INTERVAL 2 WEEK TO DISK 'bbb';
```
#### テーブルの `TTL` を変更する: {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

テーブルを作成し、行が1か月後に期限切れになるようにします。期限切れの行のうち、日付が月曜日のものは削除されます：

```sql
CREATE TABLE table_with_where
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE WHERE toDayOfWeek(d) = 1;
```
#### 期限切れ行が再圧縮されるテーブルを作成する: {#creating-a-table-where-expired-rows-are-recompressed}

```sql
CREATE TABLE table_for_recompression
(
    d DateTime,
    key UInt64,
    value String
) ENGINE MergeTree()
ORDER BY tuple()
PARTITION BY key
TTL d + INTERVAL 1 MONTH RECOMPRESS CODEC(ZSTD(17)), d + INTERVAL 1 YEAR RECOMPRESS CODEC(LZ4HC(10))
SETTINGS min_rows_for_wide_part = 0, min_bytes_for_wide_part = 0;
```

期限切れ行が集約されるテーブルを作成します。結果行の `x` にはグループ化された行の中での最大値が含まれ、`y` には最小値が含まれ、`d` にはグループ化された行からの偶発的な値が含まれます。

```sql
CREATE TABLE table_for_aggregation
(
    d DateTime,
    k1 Int,
    k2 Int,
    x Int,
    y Int
)
ENGINE = MergeTree
ORDER BY (k1, k2)
TTL d + INTERVAL 1 MONTH GROUP BY k1, k2 SET x = max(x), y = min(y);
```
### 期限切れデータの削除 {#mergetree-removing-expired-data}

期限切れの `TTL` を持つデータは、ClickHouseがデータパーツをマージするときに削除されます。

ClickHouseがデータが期限切れであることを検出すると、予定外のマージを実行します。このようなマージの頻度を制御するには、`merge_with_ttl_timeout` を設定できます。値が低すぎると、多くの予定外のマージが実行され、リソースを大量に消費することがあります。

マージの間に `SELECT` クエリを実行すると、期限切れのデータを取得することがあります。それを避けるために、`SELECT` の前に [OPTIMIZE](/sql-reference/statements/optimize.md) クエリを使用してください。

**関連情報**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 設定
## ディスクタイプ {#disk-types}

ローカルブロックデバイスに加えて、ClickHouseは以下のストレージタイプをサポートします：
- [`s3` for S3 and MinIO](#table_engine-mergetree-s3)
- [`gcs` for GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` for Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` for HDFS](/engines/table-engines/integrations/hdfs)
- [`web` for read-only from web](/operations/storing-data#web-storage)
- [`cache` for local caching](/operations/storing-data#using-local-cache)
- [`s3_plain` for backups to S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` for immutable, non-replicated tables in S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## データストレージのための複数のブロックデバイスの使用 {#table_engine-mergetree-multiple-volumes}
### はじめに {#introduction}

`MergeTree`ファミリーのテーブルエンジンは、複数のブロックデバイスにデータを保存できます。例えば、特定のテーブルのデータが暗黙的に「ホット」と「コールド」に分割されている場合に便利です。最近のデータは定期的にリクエストされますが、わずかなスペースしか必要としません。一方で、肥満の尾を持つ履歴データはほとんどリクエストされません。いくつかのディスクが利用可能な場合、「ホット」なデータは高速ディスク（例えば、NVMe SSDやメモリ上）に配置されることがあり、「コールド」データは比較的遅いディスク（例えば、HDD）に配置されます。

データパートは、`MergeTree` エンジンテーブルの最小移動単位です。ランダムに1つのパートに属するデータは1つのディスクに保存されます。データパートは、バックグラウンドで（ユーザー設定に従って）ディスク間で移動されることができます。また、[ALTER](/sql-reference/statements/alter/partition) クエリによっても移動されます。
### 用語 {#terms}

- ディスク — ファイルシステムにマウントされたブロックデバイス。
- デフォルトディスク — [path](/operations/server-configuration-parameters/settings.md/#path) サーバー設定で指定されたパスを保存するディスク。
- ボリューム — 等しいディスクの順序付けされたセット（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) に似ています）。
- ストレージポリシー — ボリュームのセットおよびそれら間でデータを移動するためのルール。

記述されたエンティティに付けられた名前は、システムテーブル [system.storage_policies](/operations/system-tables/storage_policies) および [system.disks](/operations/system-tables/disks) で確認できます。テーブルに設定されたストレージポリシーのいずれかを適用するには、`MergeTree`エンジンファミリーテーブルの `storage_policy` 設定を使用します。
### 設定 {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、ストレージポリシーは、`config.d` ディレクトリ内のファイルの `<storage_configuration>` タグ内で宣言する必要があります。

:::tip
ディスクはクエリの `SETTINGS` セクションにも宣言できます。これは、例えば、URLでホストされているディスクを一時的に接続するための即席分析に便利です。
[動的ストレージ](/operations/storing-data#dynamic-configuration) の詳細については、こちらをご覧ください。
:::

設定構造：

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- ディスク名 -->
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>

        ...
    </disks>

    ...
</storage_configuration>
```

タグ：

- `<disk_name_N>` — ディスク名。すべてのディスクの名前は異なる必要があります。
- `path` — サーバーがデータを保存する場所（`data` および `shadow` フォルダー）があるパス。スラッシュで終了する必要があります。
- `keep_free_space_bytes` — 確保しておくべき自由なディスクスペースの量。

ディスクの定義の順序は重要ではありません。

ストレージポリシー設定マークアップ：

```xml
<storage_configuration>
    ...
    <policies>
        <policy_name_1>
            <volumes>
                <volume_name_1>
                    <disk>disk_name_from_disks_configuration</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                    <load_balancing>round_robin</load_balancing>
                </volume_name_1>
                <volume_name_2>
                    <!-- 設定 -->
                </volume_name_2>
                <!-- 追加のボリューム -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- 設定 -->
        </policy_name_2>

        <!-- 追加のポリシー -->
    </policies>
    ...
</storage_configuration>
```

タグ：

- `policy_name_N` — ポリシー名。ポリシー名は一意でなければなりません。
- `volume_name_N` — ボリューム名。ボリューム名は一意でなければなりません。
- `disk` — ボリューム内のディスク。
- `max_data_part_size_bytes` — ボリュームの任意のディスクに保存できるパートの最大サイズ。このサイズが `max_data_part_size_bytes` よりも大きいと予想されるマージパートがあれば、それは次のボリュームに書き込まれます。本質的には、新しい/小さなパーツをホット（SSD）ボリュームに保持し、それらが大きなサイズに達したときにコールド（HDD）ボリュームに移動することを可能にします。この設定は、ポリシーに1つのボリュームしかない場合は使用しないでください。
- `move_factor` — 利用可能なスペースがこのファクターよりも低下した場合、余分なボリュームに自動的にデータが移動します（デフォルトは 0.1）。ClickHouse は既存のパーツをサイズが大きい順にソートし（降順）、合計サイズが `move_factor` 条件を満たすパーツを選択します。合計サイズが不十分であれば、すべてのパーツが移動されます。
- `perform_ttl_move_on_insert` — データパート挿入時の TTL 移動を無効にします。デフォルトでは（有効な場合）TTL移動ルールで既に期限切れのデータパートを挿入すると、直ちに移動ルールで宣言されたボリューム/ディスクに移動します。これにより、宛先ボリューム/ディスクが遅い場合（例えば S3）に挿入が著しく遅くなる可能性があります。これを無効にすると、期限切れのデータパートはデフォルトのボリュームに書き込まれ、その後すぐに TTL ボリュームに移動されます。
- `load_balancing` - ディスクバランスのポリシー、`round_robin` または `least_used`。
- `least_used_ttl_ms` - すべてのディスクにおける利用可能スペースの更新間隔（ミリ秒単位）を設定します（`0` - 常に更新、`-1` - 決して更新しない、デフォルトは `60000`）。ディスクが ClickHouse専用で、オンラインファイルシステムのリサイズ/縮小の対象にならない場合は `-1` を使用できます。他のすべてのケースでは、推奨されません。最終的には不正確なスペース分配に繋がるためです。
- `prefer_not_to_merge` — この設定は使用しないでください。ボリューム上のデータパーツのマージを無効にします（これは有害であり、パフォーマンスの低下を引き起こします）。この設定が有効な場合、（悪いことです）このボリュームでのデータのマージが許可されません。これにより、（もし何かを制御したいと思うならば、あなたは間違っています）ClickHouse が遅いディスクとどのように動作するかを制御することができます（しかし、ClickHouse はもっとよく知っているので、この設定を使用しないでください）。
- `volume_priority` — ボリュームが埋められる順序を定義します。低い値は高い優先度を意味します。このパラメータの値は自然数で、1からN（最も低い優先度が付けられた）までの範囲をカバーする必要があります。
  * すべてのボリュームにタグが付けられている場合、それらは指定された順序で優先されます。
  * 一部のボリュームのみにタグが付けられている場合、タグのないボリュームは最も低い優先度を持ち、設定の定義順に優先されます。
  * タグの付いていないボリュームがない場合、それらの優先度は設定されている順序に応じて設定されます。
  * 2つのボリュームが同じ優先度値を持つことはできません。

設定の例：

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- ポリシー名 -->
            <volumes>
                <single> <!-- ボリューム名 -->
                    <disk>disk1</disk>
                    <disk>disk2</disk>
                </single>
            </volumes>
        </hdd_in_order>

        <moving_from_ssd_to_hdd>
            <volumes>
                <hot>
                    <disk>fast_ssd</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                </hot>
                <cold>
                    <disk>disk1</disk>
                </cold>
            </volumes>
            <move_factor>0.2</move_factor>
        </moving_from_ssd_to_hdd>

        <small_jbod_with_external_no_merges>
            <volumes>
                <main>
                    <disk>jbod1</disk>
                </main>
                <external>
                    <disk>external</disk>
                </external>
            </volumes>
        </small_jbod_with_external_no_merges>
    </policies>
    ...
</storage_configuration>
```

この例では、`hdd_in_order` ポリシーは [ラウンドロビン](https://en.wikipedia.org/wiki/Round-robin_scheduling) アプローチを実装しています。したがって、このポリシーはボリューム（`single`）を1つだけ定義し、データパーツはそのすべてのディスクに円の順序で保存されます。このようなポリシーは、システムに複数の類似のディスクが接続されているが RAID が構成されていない場合に非常に便利です。ただし、各ディスクドライブは信頼性がないことに注意してください。レプリケーションファクターを3以上にしてこれを補償することをお勧めします。

システムにさまざまな種類のディスクが利用可能な場合、`moving_from_ssd_to_hdd` ポリシーを代わりに使用できます。ボリューム `hot` には SSD ディスク（`fast_ssd`）が含まれ、1GBのパートの最大サイズを保持できます。1GB より大きいサイズのすべてのパーツは、HDD ディスク `disk1` を含む `cold` ボリュームに直接保存されます。
さらに、ディスク `fast_ssd` が80％以上埋まると、データはバックグラウンドプロセスによって `disk1` に転送されます。

ボリュームの列挙順序は、少なくともリスト内のボリュームの1つに明示的な `volume_priority` パラメータがない場合に重要です。
あるボリュームが過剰に埋まると、データは次のボリュームに移動されます。ディスクの列挙順序も重要です。データは順番にそこに保存されます。

テーブルを作成する際に、設定されたストレージポリシーの1つを適用することができます：

```sql
CREATE TABLE table_with_non_default_policy (
    EventDate Date,
    OrderID UInt64,
    BannerID UInt64,
    SearchPhrase String
) ENGINE = MergeTree
ORDER BY (OrderID, BannerID)
PARTITION BY toYYYYMM(EventDate)
SETTINGS storage_policy = 'moving_from_ssd_to_hdd'
```

`default` ストレージポリシーは、指定された `<path>` にある単一のディスクで構成される単一のボリュームのみを使用することを意味します。
テーブル作成後にストレージポリシーを変更するには、[ALTER TABLE ... MODIFY SETTING] クエリを使用します。新しいポリシーには、同じ名前のすべての古いディスクとボリュームを含めるべきです。

バックグラウンドでデータパーツを移動するスレッドの数は、[background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 設定で変更できます。
### 詳細 {#details}

`MergeTree` テーブルの場合、データは次の異なる方法でディスクに到達します：

- 挿入の結果（`INSERT` クエリ）。
- バックグラウンドマージや [変異](/sql-reference/statements/alter#mutations) 中。
- 別のレプリカからのダウンロード。
- パーティションフリーズの結果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

変異やパーティションフリーズを除くこれらすべてのケースで、パートは次のストレージポリシーに従ってボリュームとディスクに保存されます：

1. パートを保存するために十分なディスクスペース（`unreserved_space > current_part_size`）を持ち、指定されたサイズのパーツを保存できる（`max_data_part_size_bytes > current_part_size`）最初のボリューム（定義の順序に従う）が選択されます。
2. このボリューム内では、以前のデータチャンクの保存に使用されたディスクの次に位置するディスクが選択され、そのディスクはパートサイズ以上の空きスペース（`unreserved_space - keep_free_space_bytes > current_part_size`）を持っています。

裏で、変異とパーティションフリーズは [ハードリンク](https://en.wikipedia.org/wiki/Hard_link) を利用します。異なるディスク間でのハードリンクはサポートされていないため、その場合、結果パーツは元のものと同じディスクに保存されます。

バックグラウンドでは、フリースペースの量 (`move_factor` パラメータ) に基づいてボリューム間でパーツが移動され、設定ファイルに宣言されたボリュームの順序に従います。
データは決して最後のボリュームから最初のボリュームに転送されません。ユーザーはバックグラウンド移動を監視するためにシステムテーブル [system.part_log](/operations/system-tables/part_log)（`type = MOVE_PART` フィールド）、および [system.parts](/operations/system-tables/parts.md)（`path` および `disk` フィールド）を利用できます。詳細な情報はサーバーログにも記録されます。

ユーザーは、クエリ [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) を使用して、パートまたはパーティションをボリュームから別のディスクに強制的に移動することができます。すべてのバックグラウンド操作に対する制約が考慮されます。このクエリは独自に移動を開始し、バックグラウンド操作が完了するのを待ちません。十分な空きスペースがない場合や必要な条件が満たされない場合、ユーザーはエラーメッセージを受け取ります。

データの移動は、データのレプリケーションに干渉しません。したがって、同じテーブルに対して異なるレプリカで異なるストレージポリシーを指定できます。

バックグラウンドマージおよび変異の完了後、古いパーツは一定の時間の後にのみ削除されます（`old_parts_lifetime`）。
この間、他のボリュームまたはディスクに移動されることはありません。したがって、パーツが最終的に削除されるまで、それらは占有ディスクスペースの評価に考慮されています。

ユーザーは、異なるディスクの [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) ボリュームに新しい大きなパーツを均等に割り当てることができます。このためには、[min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 設定を使用します。
```
## 外部ストレージを使用したデータストレージ {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS` にデータを保存することができ、それぞれのディスクタイプは `s3`、`azure_blob_storage`、`hdfs` です。詳細については、[外部ストレージオプションの設定](/operations/storing-data.md/#configuring-external-storage)を参照してください。

外部ストレージとしての [S3](https://aws.amazon.com/s3/) の使用例で、ディスクタイプは `s3` です。

設定マークアップ:
```xml
<storage_configuration>
    ...
    <disks>
        <s3>
            <type>s3</type>
            <support_batch_delete>true</support_batch_delete>
            <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
            <access_key_id>your_access_key_id</access_key_id>
            <secret_access_key>your_secret_access_key</secret_access_key>
            <region></region>
            <header>Authorization: Bearer SOME-TOKEN</header>
            <server_side_encryption_customer_key_base64>your_base64_encoded_customer_key</server_side_encryption_customer_key_base64>
            <server_side_encryption_kms_key_id>your_kms_key_id</server_side_encryption_kms_key_id>
            <server_side_encryption_kms_encryption_context>your_kms_encryption_context</server_side_encryption_kms_encryption_context>
            <server_side_encryption_kms_bucket_key_enabled>true</server_side_encryption_kms_bucket_key_enabled>
            <proxy>
                <uri>http://proxy1</uri>
                <uri>http://proxy2</uri>
            </proxy>
            <connect_timeout_ms>10000</connect_timeout_ms>
            <request_timeout_ms>5000</request_timeout_ms>
            <retry_attempts>10</retry_attempts>
            <single_read_retries>4</single_read_retries>
            <min_bytes_for_seek>1000</min_bytes_for_seek>
            <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            <skip_access_check>false</skip_access_check>
        </s3>
        <s3_cache>
            <type>cache</type>
            <disk>s3</disk>
            <path>/var/lib/clickhouse/disks/s3_cache/</path>
            <max_size>10Gi</max_size>
        </s3_cache>
    </disks>
    ...
</storage_configuration>
```

また、[外部ストレージオプションの設定](/operations/storing-data.md/#configuring-external-storage)もご覧ください。

:::note キャッシュ構成
ClickHouse のバージョン 22.3 から 22.7 では、異なるキャッシュ構成が使用されます。これらのバージョンを使用している場合は、[ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を参照してください。
:::
## 仮想カラム {#virtual-columns}

- `_part` — パートの名前。
- `_part_index` — クエリ結果におけるパートの順次インデックス。
- `_part_starting_offset` — クエリ結果におけるパートの累積開始行。
- `_part_offset` — パート内の行数。
- `_partition_id` — パーティションの名前。
- `_part_uuid` — 一意のパート識別子（MergeTree 設定 `assign_part_uuids` が有効な場合）。
- `_part_data_version` — パートのデータバージョン（最小ブロック番号または変更バージョン）。
- `_partition_value` — `partition by` 式の値（タプル）。
- `_sample_factor` — サンプルファクタ（クエリから）。
- `_block_number` — 行のブロック番号、`allow_experimental_block_number_column` が true に設定されている場合、マージ時に永続化されます。
## カラム統計 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

統計の宣言は、`CREATE` クエリのカラムセクションにあり、`*MergeTree*` ファミリーのテーブルで `set allow_experimental_statistics = 1` を有効にすると使用できます。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

統計は、`ALTER` ステートメントを使用して操作することもできます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量統計は、カラムの値分布に関する情報を集約します。統計はすべてのパートに保存され、各挿入時に更新されます。
これらは、`set allow_statistics_optimize = 1` を有効にするときのみ、プレフィルター最適化に使用できます。
### 利用可能なカラム統計のタイプ {#available-types-of-column-statistics}

- `MinMax`

    カラムの最小値と最大値を示し、数値カラムの範囲フィルターの選択度を推定可能にします。

    構文: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) スケッチは、数値カラムの近似パーセンタイル（例: 90パーセンタイル）を計算することを可能にします。

    構文: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) スケッチは、カラムに含まれる異なる値の推定を提供します。

    構文: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) スケッチは、カラム内の各値の頻度の近似カウントを提供します。

    構文: `countmin`
### サポートされているデータ型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String または FixedString |
|-----------|----------------------------------------------------|--------------------------|
| CountMin  | ✔                                                  | ✔                        |
| MinMax    | ✔                                                  | ✗                        |
| TDigest   | ✔                                                  | ✗                        |
| Uniq      | ✔                                                  | ✔                        |
### サポートされている操作 {#supported-operations}

|           | 等値フィルター (==) | 範囲フィルター (`>, >=, <, <=`) |
|-----------|-----------------------|-----------------------------|
| CountMin  | ✔                     | ✗                           |
| MinMax    | ✗                     | ✔                           |
| TDigest   | ✗                     | ✔                           |
| Uniq      | ✔                     | ✗                           |
## カラムレベルの設定 {#column-level-settings}

特定の MergeTree 設定は、カラムレベルで上書きすることができます：

- `max_compress_block_size` — テーブルに書き込む前に圧縮される非圧縮データの最大ブロックサイズ。
- `min_compress_block_size` — 次のマークを書き込むために必要な非圧縮データの最小ブロックサイズ。

例：

```sql
CREATE TABLE tab
(
    id Int64,
    document String SETTINGS (min_compress_block_size = 16777216, max_compress_block_size = 16777216)
)
ENGINE = MergeTree
ORDER BY id
```

カラムレベルの設定は、[ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)を使用して変更または削除できます。たとえば：

- カラム宣言から `SETTINGS` を削除：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 設定を変更：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 1つ以上の設定をリセットすることもでき、設定宣言をテーブルの CREATE クエリのカラム式から削除します。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
