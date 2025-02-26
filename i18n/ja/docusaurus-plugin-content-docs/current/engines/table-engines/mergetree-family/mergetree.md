---
slug: /engines/table-engines/mergetree-family/mergetree
sidebar_position: 11
sidebar_label:  MergeTree
title: "MergeTree"
description: "`MergeTree`ファミリーのテーブルエンジンは、高速なデータ取り込み速度と巨大なデータボリュームを設計しています。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

`MergeTree`エンジンおよび`MergeTree`ファミリーのその他のエンジン（例: `ReplacingMergeTree`, `AggregatingMergeTree` ）は、ClickHouseで最も一般的に使用され、最も堅牢なテーブルエンジンです。

`MergeTree`ファミリーのテーブルエンジンは、高速なデータ取り込み速度と巨大なデータボリュームを設計しています。
挿入操作は、テーブルのパーツを作成し、それがバックグラウンドプロセスによって他のテーブルパーツとマージされます。

`MergeTree`ファミリーのテーブルエンジンの主な機能。

- テーブルの主キーは、各テーブルパーツ内でのソート順を決定します（クラスタ化インデックス）。主キーは個々の行ではなく、8192行のブロックであるグラニュールを参照します。これにより、巨大なデータセットの主キーは主メモリに残るはずの小さなサイズになり、ディスク上のデータに迅速にアクセスできるようになります。

- テーブルは任意のパーティション式を使用してパーティション分割できます。クエリが許可する場合、パーティショニングプルーニングにより、読み取りからパーティションが省略されます。

- データは複数のクラスターノードに複製され、高可用性、フェイルオーバー、およびダウンタイムなしのアップグレードが可能です。詳細は[データレプリケーション](/engines/table-engines/mergetree-family/replication.md)を参照してください。

- `MergeTree`テーブルエンジンは、クエリ最適化を支援するためのさまざまな統計の種類とサンプリング手法をサポートしています。

:::note
同じ名前にもかかわらず、[Merge](/engines/table-engines/special/merge.md/#merge)エンジンは`*MergeTree`エンジンとは異なります。
:::

## テーブルの作成 {#table_engine-mergetree-creating-a-table}

``` sql
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

パラメータの詳細な説明については、[CREATE TABLE](/sql-reference/statements/create/table.md)ステートメントを参照してください。

### クエリ句 {#mergetree-query-clauses}

#### ENGINE {#engine}

`ENGINE` — エンジン名とパラメータ。`ENGINE = MergeTree()`。 `MergeTree`エンジンにはパラメータがありません。

#### ORDER_BY {#order_by}

`ORDER BY` — ソーティングキー。

カラム名の組または任意の式の組。例: `ORDER BY (CounterID + 1, EventDate)`。

主キーが定義されていない場合（つまり、`PRIMARY KEY`が指定されていない場合）、ClickHouseはソーティングキーを主キーとして使用します。

ソートが不要な場合は、`ORDER BY tuple()`構文を使用できます。
また、`create_table_empty_primary_key_by_default`を有効にすると、`CREATE TABLE`ステートメントに`ORDER BY tuple()`が暗黙的に追加されます。詳細は[主キーの選択](#selecting-a-primary-key)を参照してください。

#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。オプション。ほとんどの場合、パーティションキーは必要なく、必要な場合でも月毎のパーティションキー以上の細分化は一般的に必要ありません。パーティショニングはクエリを高速化しません（ORDER BY式とは対照的に）。パーティショニングを細かくしすぎないでください。クライアント識別子や名前でデータをパーティショニングしないでください（代わりにクライアント識別子や名前をORDER BY式の最初のカラムにしてください）。

月毎のパーティショニングを行うには、`toYYYYMM(date_column)`式を使用します。ここで、`date_column`は[Date](/sql-reference/data-types/date.md)型のカラムです。パーティション名は`"YYYYMM"`形式になります。

#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — ソーティングキーと異なる場合の主キー（オプション）。

ソーティングキーを指定すること（`ORDER BY`句を使用）が暗黙的に主キーを指定します。
ソーティングキーに加えて、主キーを指定する必要は通常ありません。

#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング式。オプション。

指定した場合、それは主キーに含まれていなければなりません。
サンプリング式は符号なし整数を返さなければなりません。

例: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。

####  TTL {#ttl}

`TTL` — 行の保存期間と自動パーツ移動のロジックを指定するルールのリスト [ディスクおよびボリューム間の移動](#table_engine-mergetree-multiple-volumes)。オプション。

式は`Date`または`DateTime`を返す必要があります。例: `TTL date + INTERVAL 1 DAY`。

ルールのタイプ`DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY`は、式が満たされる（現在の時間に達する）場合にパーツに対して実行されるアクションを指定します: 期限切れの行の削除、パートを指定されたディスク（`TO DISK 'xxx'`）またはボリューム（`TO VOLUME 'xxx'`）に移動または期限切れの行の値を集計します。ルールのデフォルトタイプは削除（`DELETE`）です。複数のルールのリストが指定できますが、`DELETE`ルールは1つまでにする必要があります。

詳細については[カラムとテーブルのTTL](#table_engine-mergetree-ttl)を参照してください。

#### SETTINGS {#settings}

[MergeTree設定](../../../operations/settings/merge-tree-settings.md)を参照してください。

**セクション設定の例**

``` sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

例では、月ごとのパーティショニングを設定しています。

また、ユーザーIDに基づいてハッシュのサンプリング式も設定しています。これにより、各`CounterID`と`EventDate`のデータを擬似ランダム化することができます。データを選択するときに[SAMPLE](/sql-reference/statements/select/sample.md/#select-sample-clause)句を定義すると、ClickHouseは特定のユーザーの均等に擬似ランダムなデータサンプルを返します。

`index_granularity`設定は、省略可能です。8212はデフォルト値です。

<details markdown="1">

<summary>テーブル作成の非推奨メソッド</summary>

:::note
新規プロジェクトでこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree()パラメータ**

- `date-column` — [Date](/sql-reference/data-types/date.md)型のカラムの名前。ClickHouseはこのカラムに基づいて月ごとのパーティションを自動的に作成します。パーティション名は`"YYYYMM"`形式になります。
- `sampling_expression` — サンプリング用の式。
- `(primary, key)` — 主キー。型: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — インデックスの粒度。インデックスの「マーク」の間のデータ行の数。通常、8192の値がほとんどの作業に適しています。

**例**

``` sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree`エンジンは、上記の例と同様に主なエンジン設定方法で構成されます。
</details>

## データストレージ {#mergetree-data-storage}

テーブルは主キーでソートされたデータパーツで構成されています。

テーブルにデータが挿入されると、個別のデータパーツが作成され、それぞれが主キーで辞書式にソートされます。たとえば、主キーが`(CounterID, Date)`の場合、パーツ内のデータは`CounterID`でソートされ、各`CounterID`内では`Date`で順序付けられます。

異なるパーティションに属するデータは異なるパーツに分かれます。バックグラウンドで、ClickHouseはデータパーツをより効率的にストレージにマージします。異なるパーティションに属するパーツはマージされません。マージメカニズムは、同じ主キーのすべての行が同じデータパートに存在することを保証しません。

データパーツは`Wide`または`Compact`形式で保存できます。`Wide`形式では、各カラムがファイルシステム内の別のファイルに保存され、`Compact`形式ではすべてのカラムが1つのファイルに保存されます。`Compact`形式は、小さく頻繁な挿入のパフォーマンスを向上させるために使用できます。

データストレージ形式は、テーブルエンジンの`min_bytes_for_wide_part`および`min_rows_for_wide_part`設定によって制御されます。データパートのバイト数または行数が対応する設定値よりも少ない場合、パーツは`Compact`形式で保存されます。そうでなければ、`Wide`形式で保存されます。これらの設定のいずれも設定されていない場合、データパーツは`Wide`形式で保存されます。

各データパーツは論理的にグラニュールに分割されています。グラニュールは、ClickHouseがデータを選択する際に読み取る最小の分割不可能なデータセットです。ClickHouseは行や値を分割することはないため、各グラニュールには常に整数数の行が含まれます。グラニュールの最初の行には、その行の主キーの値がマークされます。ClickHouseは各データパーツのためにマークを保存するインデックスファイルを作成します。主キーに含まれているかどうかにかかわらず、ClickHouseは各カラムに対して同じマークを保存します。これらのマークを使用することで、列ファイル内のデータを直接見つけることができます。

グラニュールのサイズは、テーブルエンジンの`index_granularity`および`index_granularity_bytes`設定によって制限されています。グラニュールの行数は、行のサイズに応じて`[1, index_granularity]`範囲にあります。単一行のサイズが設定値よりも大きい場合、グラニュールのサイズは`index_granularity_bytes`を超えることがあります。この場合、グラニュールのサイズは行のサイズに等しくなります。

## クエリ内の主キーとインデックス {#primary-keys-and-indexes-in-queries}

主キーが`(CounterID, Date)`の場合の例を取り上げます。この場合、ソートとインデックスは以下のように示すことができます。

      Whole data:     [---------------------------------------------]
      CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
      Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
      Marks:           |      |      |      |      |      |      |      |      |      |      |
                      a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
      Marks numbers:   0      1      2      3      4      5      6      7      8      9      10

もしデータクエリが以下を指定した場合：

- `CounterID in ('a', 'h')`では、サーバーはマークの範囲`[0, 3)`と`[6, 8)`のデータを読み取ります。
- `CounterID IN ('a', 'h') AND Date = 3`では、サーバーはマークの範囲`[1, 3)`と`[7, 8)`のデータを読み取ります。
- `Date = 3`では、サーバーはマークの範囲`[1, 10]`のデータを読み取ります。

上記の例は、常にフルスキャンよりもインデックスを使用する方が効果的であることを示しています。

スパースインデックスは、追加のデータを読み取ることを可能にします。主キーの単一範囲を読み取る際、各データブロック内で最大で`index_granularity * 2`の追加行を読み取ることができます。

スパースインデックスを使用すると、大量のテーブル行を扱うことができ、ほとんどのケースでそのようなインデックスはコンピュータのRAMに収まります。

ClickHouseは一意の主キーを必要としません。同じ主キーで複数の行を挿入できます。

`PRIMARY KEY`および`ORDER BY`句では`Nullable`型の式を使用できますが、これは強く避けるべきです。この機能を許可するには、[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key)設定を有効にしてください。[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values)の原則は、`ORDER BY`句の`NULL`値に適用されます。

### 主キーの選択 {#selecting-a-primary-key}

主キーのカラム数には明示的な制限はありません。データ構造に応じて、主キーに含めるカラムの数を増やすことも減らすこともできます。これにより：

- インデックスのパフォーマンスが向上します。

    もし主キーが`(a, b)`であれば、さらにカラム`c`を追加することでパフォーマンスが向上します。条件は次の通りです：

    - カラム`c`に条件のあるクエリが存在する。
    - 同じ値の`(a, b)`に対して、長いデータ範囲（`index_granularity`の数倍の長さ）が一般的です。別の言葉で言えば、他のカラムを追加することで、かなり長いデータ範囲をスキップできることです。

- データ圧縮が改善されます。

    ClickHouseはデータを主キーでソートするため、整合性が高いほど圧縮が良くなります。

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md/#table_engine-collapsingmergetree)および[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)エンジンでデータパーツをマージする際に追加のロジックを提供します。

    その場合、主キーとは異なるソーティングキーを指定する意味があります。

長い主キーは挿入パフォーマンスやメモリ消費に悪影響を与えますが、主キーに追加されたカラムはClickHouseの`SELECT`クエリ中のパフォーマンスに影響を与えることはありません。

`ORDER BY tuple()`構文を使用して主キーなしでテーブルを作成できます。この場合、ClickHouseは挿入の順序でデータを保存します。`INSERT ... SELECT`クエリのデータを挿入するときにデータの順序を保存したい場合は、[max_insert_threads = 1](/operations/settings/settings.md/#max-insert-threads)を設定します。

初期の順序でデータを選択するには、[シングルスレッド](/operations/settings/settings.md/#max_threads)の`SELECT`クエリを使用します。

### ソーティングキーとは異なる主キーの選択 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

主キー（インデックスファイル内に書き込まれる値が含まれる式）をソーティングキー（データパーツ内の行をソートするための式）とは異なるものとして指定することが可能です。この場合、主キー式のタプルはソーティングキー式のタプルのプレフィックスである必要があります。

この機能は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)および
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md)テーブルエンジンを使用する場合に便利です。これらのエンジンを使用する一般的な場合、テーブルには2つのタイプのカラムがあります： *ディメンション*と*メジャー*。典型的なクエリは、ディメンションによってフィルタリングしながら、任意の`GROUP BY`でメジャーカラムの値を集計します。SummingMergeTreeおよびAggregatingMergeTreeは、同じソーティングキーの値を持つ行を集計するため、全てのディメンションを追加することは自然です。結果的に、キー式は長いカラムのリストから成り、このリストは新しく追加されたディメンションで頻繁に更新されなければなりません。

この場合、範囲スキャンを効率的に行うために主キーに数カラムだけを残し、残りのディメンションカラムをソーティングキータプルに追加するのが意味を持ちます。

ソーティングキーの[ALTER](/sql-reference/statements/alter/index.md)は軽量な操作であり、テーブルに新しいカラムを追加しながら同時にソーティングキーにも追加されるため、既存のデータパーツは変更する必要がありません。古いソーティングキーが新しいソーティングキーのプレフィックスであり、新しく追加されたカラムにはデータが存在しないため、テーブル修正の際に古いソーティングキーと新しいソーティングキーの両方にデータがソートされます。

### クエリ内のインデックスおよびパーティションの使用 {#use-of-indexes-and-partitions-in-queries}

`SELECT`クエリの場合、ClickHouseはインデックスを使用できるかどうかを分析します。インデックスは、`WHERE/PREWHERE`句に等しい比較または不等しい比較を表す式（結合要素の一つ、または全体）や、主キーまたはパーティショニングキーにあるカラムや式に、固定のプレフィックスを持つ`IN`または`LIKE`が含まれている場合に利用できます。

したがって、主キーの特定のトラッキングタグ、特定のタグと日付範囲、特定のタグと日付、複数のタグとの日付範囲など、多くの範囲でクエリを迅速に実行することが可能です。

次のように設定されたエンジンを見てみましょう：
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

この場合、次のクエリでは：

``` sql
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

ClickHouseは、主キーインデックスを使用して不適切なデータをトリムし、月ごとのパーティショニングキーを使用して不適切な日付範囲のパーティションをトリムします。

上記のクエリは、複雑な式に対してもインデックスが使用されることを示しています。テーブルからの読み取りは、インデックスを使用することがフルスキャンより遅くなることはありません。

以下の例では、インデックスは使用できません。

``` sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリを実行するときにClickHouseがインデックスを使用できるかどうかを確認するには、設定[force_index_by_date](/operations/settings/settings.md/#force_index_by_date)および[force_primary_key](/operations/settings/settings.md/#force-primary-key)を使用します。

月ごとのパーティショニングキーは、適切な範囲の日付を含むデータブロックのみを読み取ることができます。この場合、データブロックには多くの日付（最大で1か月全体）が含まれる可能性があります。ブロック内では、データは主キーでソートされるため、日付が最初のカラムとして含まれない可能性があります。このため、主キーのプレフィックスを指定しない日付条件のみのクエリを使用すると、単一の日付に対する場合よりも多くのデータが読み取られることになります。

### 部分的に単調な主キーのインデックス利用 {#use-of-index-for-partially-monotonic-primary-keys}

たとえば、月の日を考えてみましょう。これらは1か月分で単調のシーケンスを形成しますが、より長い期間に対しては単調ではありません。これは部分的に単調なシーケンスです。ユーザーが部分的に単調な主キーでテーブルを作成すると、ClickHouseは通常のようにスパースインデックスを作成します。この種のテーブルからデータを選択する場合、ClickHouseはクエリ条件を分析します。ユーザーがインデックスの2つのマークの間のデータを取得したい場合、両マークが同じ月に収まると、ClickHouseはこの特定のケースでインデックスを使用できます。なぜなら、クエリのパラメータとインデックスマークの間の距離を計算できるからです。

クエリパラメータ範囲内の主キーの値が単調なシーケンスを表さない場合、ClickHouseはインデックスを使用できません。この場合、ClickHouseはフルスキャンメソッドを使用します。

ClickHouseは、このロジックを月の日にちのシーケンスだけでなく、部分的に単調なシーケンスを表す任意の主キーにも適用します。

### データスキッピングインデックス {#table_engine-mergetree-data_skipping-indexes}

インデックス宣言は、`CREATE`クエリのカラムセクションにあります。

``` sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree`ファミリーのテーブルでは、データスキッピングインデックスを指定できます。

これらのインデックスは、指定された式に関する情報を集約し、`granularity_value`グラニュールのブロックを構成（グラニュールのサイズはテーブルエンジン内の`index_granularity`設定を使用して指定されます）。その後、これらの集約は`SELECT`クエリ内で使用され、`where`クエリを満たすことができない巨大なデータブロックをスキップすることで、ディスクから読み取るデータ量を削減します。

`GRANULARITY`句は省略可能で、`granularity_value`のデフォルト値は1です。

**例**

``` sql
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

例のインデックスは、ClickHouseが次のクエリでディスクから読み取るデータの量を減らすために使用できます：

``` sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキッピングインデックスは複合カラムにも作成できます：

```sql
-- Map型のカラムに対して：
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- Tuple型のカラムに対して：
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- Nested型のカラムに対して：
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```

### 利用可能なインデックスのタイプ {#available-types-of-indices}

#### MinMax {#minmax}

指定された式の極端値を保存します（式が`tuple`の場合、`tuple`の各要素の極端値を保存します）。主キーのようにデータブロックをスキップするために保存された情報を使用します。

構文: `minmax`

#### Set {#set}

指定された式のユニークな値を保存します（最大`max_rows`行、`max_rows=0`は「制限なし」を意味します）。これらの値を使用して、データブロックで`WHERE`式が満たされないかどうかを確認します。

構文: `set(max_rows)`

#### Bloom Filter {#bloom-filter}

指定されたカラムに対する[Bloomフィルター](https://en.wikipedia.org/wiki/Bloom_filter)を保存します。オプションの`false_positive`パラメータは、0から1までの値を指定し、フィルターから誤った陽性応答を受け取る確率を指定します。デフォルト値: 0.025。サポートされているデータ型: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID`および`Map`。`Map`データ型に対して、クライアントは、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys)または[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)関数を使用してインデックスをキーまたは値のために作成するかを指定できます。

構文: `bloom_filter([false_positive])`

#### N-gram Bloom Filter {#n-gram-bloom-filter}

ブロック内のすべてのn-gramを含む[Bloomフィルター](https://en.wikipedia.org/wiki/Bloom_filter)を保存します。データ型は[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)および[Map](/sql-reference/data-types/map.md)のみで使用できます。`EQUALS`、`LIKE`および`IN`式の最適化に使用できます。

構文: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngramのサイズ、
- `size_of_bloom_filter_in_bytes` — Bloomフィルターのサイズ（ここでは大きな値を使用できます。例: 256または512、圧縮が良好です）。
- `number_of_hash_functions` — Bloomフィルターで使用されるハッシュ関数の数。
- `random_seed` — Bloomフィルターハッシュ関数のシード。

ユーザーは、`ngrambf_v1`のパラメータセットを推定するために[UDF](/sql-reference/statements/create/function.md)を作成できます。クエリステートメントは次の通りです：

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
これらの関数を使用するためには、少なくとも2つのパラメータを指定する必要があります。
たとえば、グラニュール内に4300のngramsが存在し、誤った陽性が0.0001未満になることを期待している場合、次のクエリを実行して他のパラメータを推定します：

```sql
--- フィルタ内のビット数を推定する
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- ハッシュ関数の数を推定する
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘

```
もちろん、他の条件でパラメータを推定するためにもこれらの関数を使用できます。
関数の内容については[こちら](https://hur.st/bloomfilter)を参照してください。

#### Token Bloom Filter {#token-bloom-filter}

`ngrambf_v1`と同様ですが、n-gramの代わりにトークンを保存します。トークンは非英数字で区切られたシーケンスです。

構文: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

#### 特殊目的 {#special-purpose}

- 近似最近傍検索をサポートする実験的インデックス。詳細は[こちら](annindexes.md)を参照してください。
- フルテキスト検索をサポートする実験的フルテキストインデックス。詳細は[こちら](invertedindexes.md)を参照してください。

### 関数のサポート {#functions-support}

`WHERE`句の条件には、カラムに対して操作を行う関数の呼び出しが含まれています。カラムがインデックスの一部である場合、ClickHouseは関数を実行するときにこのインデックスを使用しようとします。ClickHouseはインデックスを使用するために、さまざまな関数のサブセットをサポートしています。

`set`タイプのインデックスはすべての関数によって利用可能です。他のインデックスタイプは次のようにサポートされています：

| 関数（演算子）/ インデックス                                                                                | primary key | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|------------------------------------------------------------------------------------------------------------|-------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                         | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                  | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                            | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                             | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                 | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)              | ✗           | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                        | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                     | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                 | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                           | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)          | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                           | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                     | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions/#has)                                               | ✗           | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions/#hasany)                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions/#hasall)                                         | ✗           | ✗      | ✗          | ✗          | ✔            | ✗         |
| hasToken                                                                                                   | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                             | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |

定数引数がエヌグラムサイズより小さい場合、`ngrambf_v1` はクエリ最適化に使用できません。

(*) `hasTokenCaseInsensitive`および`hasTokenCaseInsensitiveOrNull`を有効にするには、`tokenbf_v1`インデックスを小文字化されたデータの上に作成する必要があります。例えば、 `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)` のようになります。

:::note
ブルームフィルターには誤検知があるため、`ngrambf_v1`、`tokenbf_v1`、および`bloom_filter`インデックスは、関数の結果が偽であると予想されるクエリの最適化には使用できません。

例えば：

- 最適化可能：
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- 最適化不可：
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::


## プロジェクション {#projections}
プロジェクションは[マテリアライズドビュー](/sql-reference/statements/create/view.md/#materialized)のようなものですが、パーツレベルで定義されます。クエリでの自動使用とともに、一貫性の保証を提供します。

:::note
プロジェクションを実装している場合は、[force_optimize_projection](/operations/settings/settings.md/#force-optimize-projection)設定を考慮する必要があります。
:::

プロジェクションは、[FINAL](/sql-reference/statements/select/from.md/#select-from-final)修飾子を持つ`SELECT`文ではサポートされていません。

### プロジェクションクエリ {#projection-query}
プロジェクションクエリは、プロジェクションを定義するものです。親テーブルからデータを暗黙的に選択します。
**構文**

```sql
SELECT <カラムリストの式> [GROUP BY] <グループキーの式> [ORDER BY] <expr>
```

プロジェクションは、[ALTER](/sql-reference/statements/alter/projection.md)文で修正または削除できます。

### プロジェクションストレージ {#projection-storage}
プロジェクションはパートディレクトリに保存されます。インデックスに似ていますが、匿名の`MergeTree`テーブルのパートを保存するサブディレクトリが含まれています。このテーブルは、プロジェクションの定義クエリによって誘導されます。`GROUP BY`句がある場合、基礎となるストレージエンジンは[AggregatingMergeTree](aggregatingmergetree.md)になり、すべての集約関数は`AggregateFunction`に変換されます。`ORDER BY`句がある場合、`MergeTree`テーブルはそれを主キーの式として使用します。マージプロセス中に、プロジェクションパートはそのストレージのマージルーチンを介してマージされます。親テーブルのパートのチェックサムは、プロジェクションのパートと結合されます。他のメンテナンスジョブは、スキップインデックスと同様です。

### クエリ分析 {#projection-query-analysis}
1. プロジェクションが与えられたクエリに対して使用できるかをチェックします。すなわち、基礎テーブルをクエリするのと同じ答えを生成します。
2. 最も読み取りが少ない、最良の実行可能なマッチを選択します。
3. プロジェクションを使用するクエリパイプラインは、元のパーツを使用する場合とは異なります。いくつかのパーツにプロジェクションが欠けている場合、「プロジェクト」するためのパイプラインをオンザフライで追加できます。

## 同時データアクセス {#concurrent-data-access}

同時テーブルアクセスには、マルチバージョンを使用します。言い換えれば、テーブルが同時に読み取られ、更新される場合、クエリ時点で最新のパーツセットからデータが読み取られます。長いロックはありません。挿入は読み取り操作の妨げになりません。

テーブルからの読み取りは、自動的に並列化されます。

## カラムとテーブルのTTL {#table_engine-mergetree-ttl}

値の寿命を決定します。

`TTL`句は、テーブル全体および各個別のカラムに対して設定できます。テーブルレベルの`TTL`は、ディスク間やボリューム間のデータの自動移動の論理や、すべてのデータが期限切れになった場合にパーツを再圧縮する論理を指定できます。

式は[Date](/sql-reference/data-types/date.md)または[DateTime](/sql-reference/data-types/datetime.md)データ型に評価される必要があります。

**構文**

カラムのためのTTLの設定：

```sql
TTL time_column
TTL time_column + interval
```

`interval`を定義するには、[時間間隔](/sql-reference/operators/index.md#operators-datetime)演算子を使用します。例えば：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### カラムTTL {#mergetree-column-ttl}

カラムの値が期限切れになると、ClickHouseはそれらをカラムデータ型のデフォルト値で置き換えます。データパート内のすべてのカラム値が期限切れになった場合、ClickHouseはファイルシステム内のデータパートからこのカラムを削除します。

`TTL`句はキーとなるカラムには使用できません。

**例**

#### `TTL`を持つテーブルの作成： {#creating-a-table-with-ttl}

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

#### 既存のテーブルのカラムにTTLを追加 {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```

#### カラムのTTLを変更 {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```

### テーブルTTL {#mergetree-table-ttl}

テーブルは、期限切れの行を削除するための式と、[ディスクやボリューム](#table_engine-mergetree-multiple-volumes)間でのパーツの自動移動のための複数の式を持つことができます。テーブル内の行が期限切れになると、ClickHouseはすべての対応する行を削除します。パーツの移動や再圧縮の場合、パートのすべての行が`TTL`式基準を満たす必要があります。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTLルールのタイプは、各TTL式の後に続くことがあります。これは、式が満たされると（現在の時刻に達すると）行われるアクションに影響します：

- `DELETE` - 期限切れの行を削除（デフォルトのアクション）；
- `RECOMPRESS codec_name` - `codec_name`を使用してデータパートを再圧縮；
- `TO DISK 'aaa'` - 部分をディスク`aaa`に移動；
- `TO VOLUME 'bbb'` - 部分をボリューム`bbb`に移動；
- `GROUP BY` - 期限切れの行を集約。

`DELETE`アクションは、フィルタリング条件に基づいて期限切れの行の一部のみを削除するために`WHERE`句と一緒に使用できます：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY`式は、テーブル主キーのプレフィックスでなければなりません。

カラムが`GROUP BY`式の一部でなく、`SET`句で明示的に設定されていない場合、結果行にはグループ化された行からの偶発値が含まれます（集約関数`any`がそれに適用されるように）。

**例**

#### `TTL`を持つテーブルの作成： {#creating-a-table-with-ttl-1}

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

#### テーブルの`TTL`を変更する {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

作成されたテーブルでは、行は1か月後に期限切れになります。月曜日の日付がある期限切れの行は削除されます：

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

#### 期限切れの行が再圧縮されるテーブルの作成： {#creating-a-table-where-expired-rows-are-recompressed}

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

期限切れの行を集約するテーブルを作成します。結果行の`x`はグループ化された行の最大値を含み、`y`は最小値を含み、`d`はグループ化された行からの偶発値を含みます。

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

期限切れの`TTL`を持つデータは、ClickHouseがデータパーツのマージを行うときに削除されます。

ClickHouseは、データが期限切れであることを検出すると、オフスケジュールのマージを実行します。このようなマージの頻度を制御するには、`merge_with_ttl_timeout`を設定できます。値が低すぎると、多くのオフスケジュールのマージが行われ、リソースを大量に消費する可能性があります。

マージの間に`SELECT`クエリを実行すると、期限切れのデータが取得される可能性があります。それを避けるために、`SELECT`の前に[OPTIMIZE](/sql-reference/statements/optimize.md)クエリを使用してください。

**参照**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)設定

## ディスクタイプ {#disk-types}

ローカルブロックデバイスに加えて、ClickHouseは以下のストレージタイプをサポートしています：
- [`s3` for S3 and MinIO](#table_engine-mergetree-s3)
- [`gcs` for GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` for Azure Blob Storage](/engines/table-engines/integrations/azureBlobStorage#table_engine-mergetree-azure-blob-storage)
- [`hdfs` for HDFS](/engines/table-engines/integrations/hdfs)
- [`web` for read-only from web](/operations/storing-data#web-storage)
- [`cache` for local caching](/operations/storing-data#using-local-cache)
- [`s3_plain` for backups to S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` for immutable, non-replicated tables in S3](/operations/storing-data.md#s3-plain-rewritable-storage)

## データストレージのための複数のブロックデバイスの使用 {#table_engine-mergetree-multiple-volumes}

### はじめに {#introduction}

`MergeTree`ファミリーのテーブルエンジンは、複数のブロックデバイスにデータを保存できます。例えば、特定のテーブルのデータが"ホット"と"コールド"に暗黙的に分割される場合に便利です。最も最近のデータは定期的に要求されますが、わずかなスペースしか必要ありません。その反対に、長い尾を持つ履歴データはあまり要求されません。複数のディスクが利用可能な場合、"ホット"データは高速ディスク（例えば、NVMe SSDやメモリ内）に配置される一方で、"コールド"データは比較的遅いディスク（例えば、HDD）に配置されます。

データパートは、`MergeTree`エンジンテーブルの最小移動ユニットです。1つのパートに属するデータは、1つのディスクに保存されます。データパーツは、ユーザー設定に従って、バックグラウンドでディスク間を移動することができ、[ALTER](/sql-reference/statements/alter/partition.md/#alter_move-partition)クエリを介して移動することもできます。

### 用語 {#terms}

- ディスク — ファイルシステムにマウントされたブロックデバイス。
- デフォルトディスク — [path](/operations/server-configuration-parameters/settings.md/#path)サーバ設定で指定されたパスを保存するディスク。
- ボリューム — 同じディスクの順序付けられたセット（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)に似ています）。
- ストレージポリシー — ボリュームのセットと、ボリューム間でデータを移動させるためのルール。

記述されたエンティティに与えられた名前は、システムテーブル、[system.storage_policies](/operations/system-tables/storage_policies.md/#system_tables-storage_policies) および [system.disks](/operations/system-tables/disks.md/#system_tables-disks)で見つけることができます。テーブルに設定されたストレージポリシーの1つを適用するには、`MergeTree`エンジンファミリーテーブルの`storage_policy`設定を使用します。

### 設定 {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、およびストレージポリシーは、`<storage_configuration>`タグ内で宣言する必要があります。`config.d`ディレクトリ内のファイルでも構いません。

:::tip
ディスクは、クエリの`SETTINGS`セクション内でも宣言できます。これは、例えばURLにホストされているディスクを一時的に接続するために便利です。詳細については、[動的ストレージ](/operations/storing-data#dynamic-configuration)を参照してください。
:::

設定構造：

``` xml
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

- `<disk_name_N>` — ディスク名。すべてのディスクで名前は異なる必要があります。
- `path` — サーバがデータ（`data`および`shadow`フォルダー）を保存するパス。終了する際には'/'が必要です。
- `keep_free_space_bytes` — 予約する自由なディスクスペースの量。

ディスク定義の順序は重要ではありません。

ストレージポリシー設定マークアップ：

``` xml
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
                <!-- さらに多くのボリューム -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- 設定 -->
        </policy_name_2>

        <!-- さらに多くのポリシー -->
    </policies>
    ...
</storage_configuration>
```

タグ：

- `policy_name_N` — ポリシー名。ポリシー名はユニークである必要があります。
- `volume_name_N` — ボリューム名。ボリューム名はユニークである必要があります。
- `disk` — ボリューム内のディスク。
- `max_data_part_size_bytes` — ボリュームのいずれかのディスクに保存可能なパートの最大サイズ。マージされたパートのサイズが`max_data_part_size_bytes`を超える見込みの場合、そのパートは次のボリュームに書き込まれます。基本的に、この機能は新しい/小さなパーツをホット（SSD）ボリュームに保持し、大きなサイズに達した場合にコールド（HDD）ボリュームに移動することを許可します。この設定は、ポリシーが1つのボリュームしかない場合は使用しないでください。
- `move_factor` — 使用可能なスペースがこの要因より少なくなると、自動的に次のボリュームにデータが移動し始めます（デフォルトは0.1）。ClickHouseは既存のパーツをサイズで降順にソートし、`move_factor`条件を満たす総サイズのパーツを選択します。すべてのパーツの合計サイズが不十分な場合、すべてのパーツが移動します。
- `perform_ttl_move_on_insert` — データパートのINSERT時にTTL移動を無効にします。デフォルト（有効な場合）では、TTL移動ルールによってすでに期限切れのデータパートを挿入するとすぐに、移動ルールに宣言されたボリューム/ディスクに移動します。これは、宛先ボリューム/ディスクが遅い場合（例：S3）には挿入を大幅に遅くする可能性があります。無効にすると、すでに期限切れのデータパートはデフォルトボリュームに書き込まれ、その後すぐにTTLボリュームに移動されます。
- `load_balancing` - ディスクバランスのためのポリシー、`round_robin`または`least_used`。
- `least_used_ttl_ms` - すべてのディスクの使用可能スペースを更新するタイムアウト（ミリ秒）を設定します（`0` - 常に更新、`-1` - 更新しない、デフォルトは`60000`）。注意：ディスクがClickHouseのみで使用でき、オンラインファイルシステムのサイズ変更/縮小の対象でない場合は、`-1`を使用できます。他のすべてのケースでは、最終的に不正確なスペース分布につながるため、推奨されません。
- `prefer_not_to_merge` — この設定を使用しないでください。パーツのマージをこのボリュームで無効にします（これは有害でパフォーマンスの低下につながります）。この設定が有効な場合（そんなことをしないでください）、このボリュームでのデータのマージは許可されません（これは悪いです）。これにより、（何かを制御したい場合は間違っています）ClickHouseが遅いディスクとどのように機能するかを制御することができます（しかし、ClickHouseはより良い結果を知っていますので、この設定を使用しないでください）。
- `volume_priority` — ボリュームが満たす優先度（順序）を定義します。値が低いほど、優先順位が高くなります。パラメータ値は自然数でなければならず、スキップせずに1からNまでの範囲をカバーする必要があります（最も低い優先順位が設定されます）。
  - _すべての_ボリュームがタグ付けされている場合、それは指定された順序で優先されます。
  - _いくつかの_ボリュームのみがタグ付けされている場合、タグがないボリュームは最も低い優先順位が付けられ、設定された順序で優先されます。
  - _ボリュームがタグ付けされていない_場合、優先順位は、構成中に声明された順序に対応して設定されます。
  - 2つのボリュームが同じ優先順位の値を持つことはできません。

設定例：

``` xml
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

この例では、`hdd_in_order`ポリシーは[ラウンドロビン](https://en.wikipedia.org/wiki/Round-robin_scheduling)アプローチを実装しています。したがって、このポリシーは1つのボリューム（`single`）のみを定義し、データパーツはそのすべてのディスクに円環で保存されます。このようなポリシーは、システムに複数の同様のディスクがマウントされている場合に便利ですが、RAIDが構成されていない場合です。ただし、各個別のディスクドライブは信頼性がなく、複製係数を3以上に設定することでこれを補うことをお勧めします。

システムに異なる種類のディスクが利用可能な場合は、`moving_from_ssd_to_hdd`ポリシーが代わりに使用できます。ボリューム`hot`はSSDディスク（`fast_ssd`）で構成され、最大サイズのパートがこのボリュームに保存できるのは1GBです。1GBを超えるサイズのすべてのパーツは、HDDディスク`disk1`を含む`cold`ボリュームに直接保存されます。
また、ディスク`fast_ssd`が80％以上満たされると、データはバックグラウンドプロセスによって`disk1`に転送されます。

ストレージポリシー内でのボリューム列挙の順序は、リスト内のボリュームの1つが明示的な`volume_priority`パラメータを持たない場合に重要です。
ボリュームがオーバーフローすると、データは次のボリュームに移動します。ディスク列挙の順序も重要で、データは切り替えて保存されます。

テーブルを作成するとき、構成されたストレージポリシーの1つを適用できます：

``` sql
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

`default`ストレージポリシーは、`<path>`に指定されたディスクのみで構成された1つのボリュームしか使用しません。
テーブル作成後にストレージポリシーを変更するには、[ALTER TABLE ... MODIFY SETTING]クエリを使用します。新しいポリシーは、同じ名前のすべての古いディスクとボリュームを含む必要があります。

バックグランドでデータパーツを移動するスレッドの数は、[background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size)設定によって変更できます。

### 詳細 {#details}

`MergeTree`テーブルの場合、データは異なる方法でディスクに到達します：

- 挿入の結果（`INSERT`クエリ）。
- バックグラウンドマージおよび[ミューテーション](/sql-reference/statements/alter/index.md#alter-mutations)中。
- 別のレプリカからのダウンロード時。
- パーティションのフリージングの結果[ALTER TABLE ... FREEZE PARTITION]（/docs/sql-reference/statements/alter/partition.md/#alter_freeze-partition）。

ミューテーションとパーティションフリージングを除くすべての場合において、パートは指定されたストレージポリシーに従って、ボリュームとディスクに保存されます：

1. パートを保存するための十分なディスクスペースがある（`unreserved_space > current_part_size`）最初のボリューム（定義の順序に従う）が選択され、指定サイズのパーツを保存することが許可されます（`max_data_part_size_bytes > current_part_size`）。
2. このボリューム内で、前回のデータチャンクを保存するために使用されたディスクではないディスクが選択され、パートサイズよりも多くの空きスペースを持つ（`unreserved_space - keep_free_space_bytes > current_part_size`）ディスクが選択されます。

ミューテーションとパーティションフリージングは[ハードリンク](https://en.wikipedia.org/wiki/Hard_link)を利用します。異なるディスク間のハードリンクはサポートされていないため、そのような場合、生成されたパーツは初期のものと同じディスクに保存されます。

バックグラウンドでパーツは、設定ファイル内でのボリュームの定義順序に従い、自由空間の量（`move_factor`パラメータ）に基づいてボリューム間を移動します。
データは、最後のボリュームから最初のボリュームに転送されることはありません。システムテーブル[system.part_log](/operations/system-tables/part_log.md/#system_tables-part-log)（フィールド`type = MOVE_PART`）および[system.parts](/operations/system-tables/parts.md)（フィールド`path`と`disk`）を使用して、バックグラウンドの移動を監視できます。また、詳細情報はサーバーログにも記録されます。

ユーザーは、[ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition.md/#alter_move-partition)クエリーを使用して、ひとつのストレージから他のボリュームにパートまたはパーティションを強制的に移動させることができます。すべての制約は、バックグラウンド操作に対しても考慮されます。このクエリは移動を独自に開始し、バックグラウンド操作が完了するまで待ちません。十分な空きスペースがない場合や、必要な条件のいずれかが満たされていない場合、エラーメッセージが表示されます。

データの移動はデータのレプリケーションには干渉しません。そのため、同じテーブルに対して異なるレプリカで異なるストレージポリシーを指定することができます。

バックグラウンドマージおよびミューテーションが完了した後、古いパーツは一定の時間（`old_parts_lifetime`）が経過するまで削除されません。この時間中は、他のボリュームやディスクに移動されません。したがって、パーツが最終的に削除されるまで、それらは占有されたディスクスペースの評価に依然として考慮されます。

ユーザーは、[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)ボリュームの異なるディスクに新しい大きなパーツを均等に割り当てることができます。このために、[min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod)設定を使用します。

## 外部ストレージを使用したデータストレージ {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS`にデータを保存できます。ストレージタイプ`s3`、`azure_blob_storage`、`hdfs`を使用します。詳細については、[外部ストレージオプションの構成](/operations/storing-data.md/#configuring-external-storage)を参照してください。

`s3`エクスターナルストレージを使用した外部ストレージの例：

設定マークアップ：
``` xml
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

また、[外部ストレージオプションの構成](/operations/storing-data.md/#configuring-external-storage)にもご参照ください。

:::note キャッシュ設定
ClickHouseバージョン22.3から22.7では異なるキャッシュ設定が使用されています。これらのバージョンのいずれかを使用している場合は、[ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を確認してください。
:::

## 仮想カラム {#virtual-columns}

- `_part` — パートの名前。
- `_part_index` — クエリ結果内のパートの順次インデックス。
- `_partition_id` — パーティションの名前。
- `_part_uuid` — 一意なパート識別子（MergeTree設定`assign_part_uuids`が有効な場合）。
- `_partition_value` — `partition by`式の値（タプル）。
- `_sample_factor` — サンプルファクター（クエリから）。
- `_block_number` — 行のブロック番号。`allow_experimental_block_number_column`がtrueに設定されている場合、マージ時に永続化されます。

## カラム統計 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

統計の宣言は、`*MergeTree*`ファミリーのテーブル用の`CREATE`クエリのカラムセクションにあります。これには`set allow_experimental_statistics = 1`を有効にします。

``` sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

統計は`ALTER`文を使用して操作することもできます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量統計は、カラム内の値の分布に関する情報を集約します。統計はすべてのパートに保存され、挿入が行われるたびに更新されます。
`set allow_statistics_optimize = 1`を有効にすると、これらはプレフィルタ最適化に使用できます。

### 利用可能なカラム統計タイプ {#available-types-of-column-statistics}

- `MinMax`

    最小および最大のカラム値があり、数値カラムの範囲フィルターの選択性を推定できます。

    構文： `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest)スケッチは、数値カラムの近似パーセンタイル（例：90パーセンタイル）を計算することを可能にします。

    構文： `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)スケッチは、カラムが含む異なる値の数を推定します。

    構文： `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch)スケッチは、カラム内の各値の頻度の近似値を提供します。

    構文： `countmin`


### サポートされるデータタイプ {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
```
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |


### サポートされている操作 {#supported-operations}

|           | 等価フィルター (==)      | 範囲フィルター (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |


## カラムレベルの設定 {#column-level-settings}

特定のMergeTree設定はカラムレベルでオーバーライドできます。

- `max_compress_block_size` — テーブルに書き込む前の未圧縮データのブロックの最大サイズ。
- `min_compress_block_size` — 次のマークを書き込む際に圧縮に必要な未圧縮データのブロックの最小サイズ。

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

カラムレベルの設定は、[ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)を使用して変更または削除できます。例えば:

- カラム宣言から`SETTINGS`を削除：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 設定を変更：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 1つ以上の設定をリセットし、テーブルのCREATEクエリのカラム表現から設定宣言を削除します。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
