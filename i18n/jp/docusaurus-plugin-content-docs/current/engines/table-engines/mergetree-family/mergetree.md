---
slug: /engines/table-engines/mergetree-family/mergetree
sidebar_position: 11
sidebar_label:  MergeTree
title: "MergeTree"
description: "`MergeTree`-ファミリーのテーブルエンジンは、高データ取り込み率と巨大なデータボリュームに対応するように設計されています。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

`MergeTree`エンジンおよび`MergeTree`ファミリーの他のエンジン（例：`ReplacingMergeTree`、`AggregatingMergeTree`）は、ClickHouseで最も一般的に使用され、最も堅牢なテーブルエンジンです。

`MergeTree`-ファミリーのテーブルエンジンは、高データ取り込み率と巨大なデータボリュームに対応するように設計されています。挿入操作によってテーブルパーツが作成され、バックグラウンドプロセスによって他のテーブルパーツとマージされます。

`MergeTree`-ファミリーのテーブルエンジンの主な特徴：

- テーブルの主キーは、各テーブルパーツ内のソート順（クラスタインデックス）を決定します。主キーは個々の行を参照するのではなく、8192行のブロック（グラニュール）を参照します。これにより、大規模データセットの主キーはメインメモリにロードされるのに十分小さく保たれ、ディスク上のデータへの高速アクセスが提供されます。

- テーブルは任意のパーティション式を使用してパーティション化できます。クエリが許す場合、パーティションプルーニングにより、読み込みからパーティションが省かれます。

- データは高可用性、フェイルオーバー、ゼロダウンタイムのアップグレードのために、複数のクラスタノードにレプリケートできます。詳しくは[データレプリケーション](/engines/table-engines/mergetree-family/replication.md)を参照してください。

- `MergeTree`テーブルエンジンは、クエリ最適化を支援するために、さまざまな統計種類やサンプリング方法をサポートしています。

:::note
名前が似ていますが、[Merge](/engines/table-engines/special/merge)エンジンは`*MergeTree`エンジンとは異なります。
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

`ENGINE` — エンジンの名前とパラメータ。`ENGINE = MergeTree()`。`MergeTree`エンジンにはパラメータはありません。
#### ORDER_BY {#order_by}

`ORDER BY` — ソートキー。

カラム名または任意の式のタプル。例：`ORDER BY (CounterID + 1, EventDate)`。

主キーが定義されていない場合（つまり、`PRIMARY KEY`が指定されていない場合）、ClickHouseはソートキーを主キーとして使用します。

ソートが不要な場合は、`ORDER BY tuple()`構文を使用できます。
また、`create_table_empty_primary_key_by_default`が有効になっている場合、`CREATE TABLE`ステートメントに`ORDER BY tuple()`が暗黙的に追加されます。主キーの選択については[Selecting a Primary Key](#selecting-a-primary-key)を参照してください。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。オプション。ほとんどのケースではパーティションキーは必要なく、パーティション化が必要な場合でも、通常は月単位のパーティションキーより細かい粒度は必要ありません。パーティショニングはクエリを速くするものではありません（ORDER BY式とは対照的）。あまり細かいパーティショニングは使用しないでください。クライアントの識別子や名前でデータをパーティション化しないでください（代わりに、ORDER BY式の最初のカラムにクライアントの識別子や名前を設定してください）。

月ごとにパーティション化するには、`toYYYYMM(date_column)`式を使用します。ここで、`date_column`は[Date](/sql-reference/data-types/date.md)タイプの日時を持つカラムです。ここでのパーティション名は`"YYYYMM"`形式です。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — ソートキーと異なる場合の主キー（オプション）。

ソートキーを指定すると（`ORDER BY`句を使用）、主キーが暗黙的に指定されます。
通常、ソートキーに加えて主キーを指定する必要はありません。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング式。オプション。

指定された場合、主キーに含まれている必要があります。
サンプリング式は符号なし整数の結果を生成する必要があります。

例：`SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
####  TTL {#ttl}

`TTL` — 行のストレージ期間と自動的なパーツ移動のロジックを指定するルールのリスト [ディスクとボリューム間の](#table_engine-mergetree-multiple-volumes)。オプション。

式は`Date`または`DateTime`を結果として生成する必要があります。例：`TTL date + INTERVAL 1 DAY`。

ルールのタイプ`DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY`は、式が満たされた場合（現在の時間に達した場合）にパーツで実行されるアクションを指定します：期限切れ行の削除、指定されたディスク（`TO DISK 'xxx'`）へのパートの移動、またはボリューム（`TO VOLUME 'xxx'`）への移動、または期限切れ行の値を集約。ルールのデフォルトタイプは削除（`DELETE`）です。複数のルールを指定できますが、`DELETE`ルールは1つしか指定できません。

詳細については、[カラムとテーブルのTTL](#table_engine-mergetree-ttl)を参照してください。
#### SETTINGS {#settings}

[MergeTreeの設定](../../../operations/settings/merge-tree-settings.md)を参照してください。

**セクション設定の例**

``` sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

この例では、月ごとのパーティショニングを設定しています。

また、サンプリングのための式をユーザーIDのハッシュとして設定しています。これにより、各`CounterID`と`EventDate`に対してテーブルのデータを擬似ランダム化できます。データを選択するときに[SAMPLE](/sql-reference/statements/select/sample)句を定義すると、ClickHouseはユーザーのサブセットに対して均等に擬似ランダムなデータサンプルを返します。

`index_granularity`設定は、8192がデフォルト値なので省略できます。

<details markdown="1">

<summary>テーブルを作成するための廃止された方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree() パラメータ**

- `date-column` — [Date](/sql-reference/data-types/date.md)タイプのカラムの名前。ClickHouseは、このカラムに基づいて月ごとに自動的にパーティションを作成します。パーティション名は`"YYYYMM"`形式です。
- `sampling_expression` — サンプリングのための式。
- `(primary, key)` — 主キー。タイプ：[Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — インデックスの粒度。インデックスの「マーク」の間のデータ行の数。値8192はほとんどのタスクに適しています。

**例**

``` sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree`エンジンは、上記の例と同様に構成されます。
</details>
## データストレージ {#mergetree-data-storage}

テーブルは主キーでソートされたデータパーツで構成されます。

データがテーブルに挿入されると、別々のデータパーツが作成され、それぞれが主キーで字義通りにソートされます。たとえば、主キーが`(CounterID, Date)`である場合、そのパーツ内のデータは`CounterID`でソートされ、各`CounterID`内では`Date`によって順序付けられます。

異なるパーティションに属するデータは異なるパーツに分けられます。バックグラウンドで、ClickHouseはより効率的なストレージのためにデータパーツをマージします。異なるパーティションに属するパーツはマージされません。マージメカニズムは、同じ主キーを持つすべての行が同じデータパーツに存在することを保証しません。

データパーツは `Wide` 形式または `Compact` 形式で保存できます。`Wide` 形式では各カラムがファイルシステムの別々のファイルに保存され、`Compact` 形式ではすべてのカラムが1つのファイルに保存されます。`Compact` 形式は、小さく頻繁な挿入のパフォーマンスを向上させるために使用できます。

データ保存形式は、テーブルエンジンの `min_bytes_for_wide_part` と `min_rows_for_wide_part` 設定によって制御されます。データパーツ内のバイト数または行数が、対応する設定値未満の場合、パーツは `Compact` 形式で保存されます。それ以外の場合は `Wide` 形式で保存されます。これらの設定がいずれも設定されていない場合、データパーツは `Wide` 形式で保存されます。

各データパーツは論理的にグラニュールに分けられます。グラニュールは、ClickHouse がデータを選択する際に読み取る最小の不可分のデータセットです。ClickHouse は行や値を分割しないため、各グラニュールは常に整数の行数を含みます。グラニュールの最初の行は、その行の主キーの値でマークされます。ClickHouse は各データパーツのためにマークを保存するインデックスファイルを生成します。主キーに含まれるかどうかに関係なく、各カラムに対しても同じマークが保存されます。これらのマークを使用すると、列ファイル内のデータを直接見つけることができます。

グラニュールのサイズは、テーブルエンジンの `index_granularity` と `index_granularity_bytes` 設定によって制限されています。グラニュール内の行数は `[1, index_granularity]` の範囲内にあり、行のサイズによって異なります。行のサイズが設定値を超える場合、グラニュールのサイズは行のサイズになります。 
## クエリにおける主キーとインデックス {#primary-keys-and-indexes-in-queries}

`(CounterID, Date)` 主キーの例を考えます。この場合、ソートとインデックスは以下のように示されます：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

データクエリが次のように指定されている場合：

- `CounterID in ('a', 'h')` の場合、サーバーは範囲 `[0, 3)` と `[6, 8)` のマークのデータを読み取ります。
- `CounterID IN ('a', 'h') AND Date = 3` の場合、サーバーは範囲 `[1, 3)` および `[7, 8)` のマークのデータを読み取ります。
- `Date = 3` の場合、サーバーは範囲 `[1, 10]` のマークのデータを読み取ります。

上記の例は、インデックスを使用する方がフルスキャンより常に効果的であることを示しています。

スパースインデックスでは、追加のデータを読み取ることができます。主キーの単一の範囲を読み取るとき、各データブロック内で最大 `index_granularity * 2` 行が追加で読み取られる可能性があります。

スパースインデックスにより、非常に多くのテーブル行と連携することが可能になります。なぜなら、ほとんどの場合、そのようなインデックスはコンピュータのRAMに収まるからです。

ClickHouse では、同一の主キーを持つ行が複数挿入されることができます。

`PRIMARY KEY` および `ORDER BY` 句に `Nullable` タイプの式を使用することはできますが、強く推奨はされません。この機能を許可するには、[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key)設定を有効にします。 `ORDER BY` 句における `NULL` 値に対しては、[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values)の原則が適用されます。
### 主キーの選択 {#selecting-a-primary-key}

主キーのカラム数には明示的な制限はありません。データ構造に応じて、主キーに多くのカラムを含めることができます。これにより：

- インデックスのパフォーマンスが向上します。

    主キーが`(a, b)`の場合、別のカラム`c`を追加すると、以下の条件が満たされていれば、パフォーマンスが向上します：

    - カラム`c`に対する条件を持つクエリがある。
    - `(a, b)`の値が同一の長いデータ範囲（`index_granularity`の数倍長い）の存在が一般的です。言い換えれば、別のカラムを追加することでかなり長いデータ範囲をスキップできる場合です。

- データ圧縮を改善します。

    ClickHouseはデータを主キーでソートするため、一貫性が高いほど圧縮が良好になります。

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)および[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)エンジンでデータパーツをマージする際の追加ロジックを提供します。

    この場合、主キーとは異なるソートキーを指定することが理にかなっています。

長い主キーは挿入パフォーマンスやメモリ消費に悪影響を与えますが、主キー内の追加のカラムはClickHouseの`SELECT`クエリのパフォーマンスには影響しません。

`ORDER BY tuple()`構文を使用して主キーなしでテーブルを作成できます。この場合、ClickHouseは挿入時の順序でデータを保存します。`INSERT ... SELECT`クエリによってデータを挿入する際にデータの順序を保存したい場合は、[max_insert_threads = 1](/operations/settings/settings#max_insert_threads)を設定してください。

最初の順序でデータを選択するには、[シングルスレッド](/operations/settings/settings.md/#max_threads) `SELECT` クエリを使用します。
### ソートキーとは異なる主キーの選択 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

主キー（インデックスファイルに各マークのために書き込まれる値の式）をソートキー（データパーツ内の行をソートするための式）とは異なるものとして指定することができます。この場合、主キーの式タプルはソートキーの式タプルの接頭辞でなければなりません。

この機能は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)および
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md)テーブルエンジンを使用する際に便利です。これらのエンジンを使用する一般的なケースでは、テーブルには「次元」と「測定値」という2種類のカラムが存在します。典型的なクエリは、任意の `GROUP BY` で測定値カラムの値を集約し、次元でフィルタリングします。SummingMergeTreeとAggregatingMergeTreeはソートキー値が同じ行を集約するため、すべての次元をソートキーに加えることが自然です。その結果、キー式は長いカラムのリストで構成され、このリストは新たに追加された次元で頻繁に更新される必要があります。

この場合、効率的な範囲スキャンを提供するために主キーに数カラムだけを残し、残りの次元カラムをソートキーのタプルに追加することが理にかなっています。

ソートキーの[ALTER](/sql-reference/statements/alter/index.md)は軽量な操作です。なぜなら、新しいカラムがテーブルとソートキーの両方に同時に追加されるとき、既存のデータパーツは変更の必要がないからです。古いソートキーが新しいソートキーの接頭辞であり、新しく追加されたカラムにデータがない場合、テーブルの変更時にデータは古いソートキーと新しいソートキーの両方に基づいてソートされます。
### クエリにおけるインデックスとパーティションの使用 {#use-of-indexes-and-partitions-in-queries}

`SELECT` クエリの場合、ClickHouseはインデックスが使用できるかどうかを分析します。インデックスは、`WHERE` / `PREWHERE` 句に、主キーまたはパーティショニングキーにあるカラムや式に対する等号または不等号の比較演算を示す式、または特定の部分的に繰り返されるこれらのカラムの関数の論理関係が含まれている場合に使用できます。

したがって、主キーの1つまたは複数の範囲に対して迅速にクエリを実行できます。この例では、特定のトラッキングタグ、特定のタグおよび日付範囲、特定のタグおよび日付、複数のタグと日付範囲などに対してクエリを実行するとすばやくなります。

次のように設定されたエンジンを考えてみましょう。
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

この場合、クエリでは：

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

ClickHouseは、誤ったデータを剪定するために主キーインデックスを使用し、誤った日付範囲にあるパーティションを剪定するために月ごとのパーティショニングキーを使用します。

上記のクエリは、複雑な式に対してもインデックスが使用されることを示しています。テーブルからの読み取りは、インデックスを使用してもフルスキャンより遅くならないように整理されています。

以下の例では、インデックスが使用できません。

``` sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリを実行する際にClickHouseがインデックスを使用できるかどうかを確認するには、設定 [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) および [force_primary_key](/operations/settings/settings#force_primary_key) を使用します。

月ごとのパーティショニングキーは、適切な範囲の日付を含むデータブロックのみを読むことを可能にします。この場合、データブロックには多くの日付のデータ（最大で1ヶ月分）が含まれる可能性があります。ブロック内では、データは主キーによってソートされています。なお、主キーに日付が最初のカラムとして含まれていない場合があります。このため、主キーのプレフィックスを指定せずに日付条件のみのクエリを使用すると、単一の日付のデータよりも多くのデータが読み込まれる場合があります。
### 部分的単調増加主キーに対するインデックスの使用 {#use-of-index-for-partially-monotonic-primary-keys}

例えば、月の日を考えてみましょう。これらは、1ヶ月の間に単調増加したシーケンスを形成しますが、より長い期間では単調増加しません。これは部分的に単調なシーケンスです。ユーザーが部分的な単調主キーを持つテーブルを作成した場合、ClickHouseは通常通りスパースインデックスを作成します。ユーザーがこの種のテーブルからデータを選択するとき、ClickHouseはクエリ条件を分析します。ユーザーがインデックスの2つのマークの間のデータを取得したい場合、これらのマークが1ヶ月内に収まる場合、ClickHouseはこの特定の場合にインデックスを使用できます。なぜなら、クエリのパラメータとインデックスのマークの間の距離を計算できるからです。

クエリパラメータ範囲内の主キーの値が単調増加したシーケンスを表さない場合、ClickHouseはインデックスを使用できません。この場合、ClickHouseはフルスキャン方式を使用します。

ClickHouseは、月の日シーケンスだけでなく、部分的に単調増加したシーケンスを表す任意の主キーにもこの論理を適用します。
### データスキッピングインデックス {#table_engine-mergetree-data_skipping-indexes}

インデックス宣言は、`CREATE`クエリのカラムセクションに含まれます。

``` sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree`ファミリーのテーブルでは、データスキッピングインデックスを指定できます。

これらのインデックスは、指定された式に関する情報を、`granularity_value`のグラニュールからなるブロックで集約します（グラニュールのサイズは、テーブルエンジンの`index_granularity`設定で指定されます）。その後、これらの集約は、`SELECT`クエリにおいて、`where`クエリが満たされない大きなデータブロックをスキップするために、ディスクから読み取るデータ量を削減するために使用されます。

`GRANULARITY`句は省略可能であり、`granularity_value`のデフォルト値は1です。

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

上記の例のインデックスは、次のクエリにおいてClickHouseによってディスクから読み取るデータ量を減らすために使用できます：

``` sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキッピングインデックスは、複合カラムに対しても作成できます：

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
### 利用可能なインデックスの種類 {#available-types-of-indices}
#### MinMax {#minmax}

指定された式の極値を保存します（式が`tuple`の場合、各要素の極値を保存します）。主キーと同様に、データブロックをスキップするために保存された情報を使用します。

構文：`minmax`
#### Set {#set}

指定された式のユニークな値を保存します（最大で`max_rows`行、`max_rows=0`は「制限なし」を意味します）。ブロック上で`WHERE`式が満たされないかどうかを確認するためにこの値を使用します。

構文：`set(max_rows)`
#### Bloom Filter {#bloom-filter}

指定されたカラム用の[ブルームフィルター](https://en.wikipedia.org/wiki/Bloom_filter)を保存します。オプションの`false_positive`パラメータは、0と1の間の値を持ち、フィルターからの偽陽性応答を受け取る確率を指定します。デフォルト値は0.025です。サポートされるデータタイプ：`Int*`、`UInt*`、`Float*`、`Enum`、`Date`、`DateTime`、`String`、`FixedString`、`Array`、`LowCardinality`、`Nullable`、`UUID`、`Map`。`Map`データ型については、クライアントはインデックスをキーワードまたは値に対して作成するかどうかを、[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys)または[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)関数を使用して指定できます。

構文：`bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

指定されたデータブロックのすべてのn-gramを含む[ブルームフィルター](https://en.wikipedia.org/wiki/Bloom_filter)を保存します。データ型：[String](/sql-reference/data-types/string.md)、[FixedString](/sql-reference/data-types/fixedstring.md)、[Map](/sql-reference/data-types/map.md)のみに対応しています。`EQUALS`、`LIKE`、`IN`式の最適化に使用できます。

構文：`ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngramサイズ、
- `size_of_bloom_filter_in_bytes` — ブルームフィルターのサイズ（ここでは大きな値を使用できます。例えば256または512。なぜなら、圧縮が良好だからです）。
- `number_of_hash_functions` — ブルームフィルターで使用されるハッシュ関数の数。
- `random_seed` — ブルームフィルターハッシュ関数のシード。

ユーザーは、`ngrambf_v1`のパラメータセットを推定するために[UDF](/sql-reference/statements/create/function.md)を作成できます。クエリステートメントは次のとおりです。

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
これらの関数を使用するには、少なくとも二つのパラメータを指定する必要があります。例えば、グラニュールに4300のn-gramがあり、偽陽性を0.0001未満に抑えたい場合、他のパラメータは次のクエリを実行することで推定できます：

```sql
--- フィルター内のビット数を推定
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- ハッシュ関数の数を推定
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```
もちろん、他の条件によってパラメータを推定するためにこれらの関数も使用可能です。
これらの関数に関する内容は、[こちら](https://hur.st/bloomfilter)を参照してください。
#### Token Bloom Filter {#token-bloom-filter}

`ngrambf_v1`と同じですが、n-gramの代わりにトークンを保存します。トークンは非英数字文字で区切られたシーケンスです。

構文：`tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 特定用途 {#special-purpose}

- おおよその最近接隣接検索をサポートするための実験的インデックス。詳細については[こちら](annindexes.md)を参照してください。
- フルテキスト検索をサポートするための実験的フルテキストインデックス。詳細については[こちら](invertedindexes.md)を参照してください。
### 関数のサポート {#functions-support}

`WHERE`句の条件には、カラムを操作する関数の呼び出しが含まれています。カラムがインデックスの一部である場合、ClickHouseは関数を実行する際にこのインデックスを使用しようとします。ClickHouseはインデックスを使用するための異なる関数のサブセットをサポートしています。

`set`型のインデックスはすべての関数で利用可能です。他のインデックスタイプは次のようにサポートされています。

| 関数 (演算子) / インデックス                                                                                | 主キー | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|------------------------------------------------------------------------------------------------------------|-------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                 | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)                   | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                          | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                    | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                      | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                     | ✔           | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                         | ✗           | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                     | ✗           | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                                | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                             | ✔           | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                       | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                 | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                       | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)                 | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                                   | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                             | ✔           | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                               | ✗           | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                                 | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                                 | ✗           | ✗      | ✗          | ✗          | ✔            | ✗         |
| hasToken                                                                                                | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                          | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                              | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                        | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |

定数引数がngramサイズ未満の関数は、`ngrambf_v1`によるクエリ最適化には使用できません。

(*) `hasTokenCaseInsensitive`および`hasTokenCaseInsensitiveOrNull`が有効であるためには、`tokenbf_v1`インデックスが小文字化されたデータの上に作成されている必要があります。たとえば、`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`のようにします。

:::note
Bloomフィルターは誤検出を発生させることがあるため、`ngrambf_v1`、`tokenbf_v1`、および`bloom_filter`インデックスは、関数の結果がfalseであることが予想されるクエリの最適化には使用できません。

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

プロジェクションは、[マテリアライズドビュー](/sql-reference/statements/create/view)のようなもので、部分レベルで定義されます。クエリでの自動使用と整合性の保証を提供します。

:::note
プロジェクションを実装する際は、[force_optimize_projection](/operations/settings/settings#force_optimize_projection)設定についても考慮する必要があります。
:::

プロジェクションは、[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子を伴った`SELECT`文ではサポートされていません。

### プロジェクションクエリ {#projection-query}

プロジェクションクエリは、プロジェクションを定義するものです。これは、親テーブルからデータを暗黙的に選択します。

**構文**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

プロジェクションは、[ALTER](/sql-reference/statements/alter/projection.md)文を使用して修正または削除できます。

### プロジェクションストレージ {#projection-storage}

プロジェクションは、部分ディレクトリ内に保存されます。それはインデックスに似ていますが、匿名の`MergeTree`テーブルの部分を保存するサブディレクトリが含まれています。テーブルは、プロジェクションの定義クエリによって誘発されます。`GROUP BY`句がある場合、基盤のストレージエンジンは[AggregatingMergeTree](aggregatingmergetree.md)となり、すべての集計関数は`AggregateFunction`に変換されます。`ORDER BY`句がある場合、`MergeTree`テーブルはそれを主キー式として使用します。マージプロセス中にプロジェクション部分は、そのストレージのマージルーチンを介してマージされます。親テーブルの部分のチェックサムは、プロジェクションの部分と組み合わされます。他のメンテナンス作業は、スキップインデックスに似ています。

### クエリ分析 {#projection-query-analysis}

1. プロジェクションが、ベーステーブルをクエリする場合と同じ結果を生成するかを確認します。
2. 読み取るグラニュールが最も少ない最適な一致を選択します。
3. プロジェクションを使用するクエリパイプラインは、元の部分を使用するものとは異なります。プロジェクションが一部の部分に存在しない場合、パイプラインを追加して「動的に」投影することができます。

## 同時データアクセス {#concurrent-data-access}

同時テーブルアクセスのために、マルチバージョンを使用します。言い換えれば、テーブルが同時に読み取られ、更新されるとき、データはクエリの時点で現在の部分のセットから読み取られます。長時間ロックはありません。挿入は読み取り操作の妨げにはなりません。

テーブルからの読み取りは自動的に並列化されます。

## カラムおよびテーブルのTTL {#table_engine-mergetree-ttl}

値のライフタイムを決定します。

`TTL`句は、テーブル全体および各個別カラムに対して設定できます。テーブルレベルの`TTL`は、ディスクやボリューム間でデータを自動的に移動させるロジックや、すべてのデータが期限切れになったパーツを再圧縮するロジックを指定することもできます。

式は、[Date](/sql-reference/data-types/date.md)または[DateTime](/sql-reference/data-types/datetime.md)データ型に評価される必要があります。

**構文**

カラムのライフタイムを設定するには：

```sql
TTL time_column
TTL time_column + interval
```

`interval`を定義するには、[時間間隔](/sql-reference/operators#operators-for-working-with-dates-and-times)演算子を使用します。たとえば：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### カラムTTL {#mergetree-column-ttl}

カラムの値が期限切れになると、ClickHouseはそれらをカラムデータタイプのデフォルト値に置き換えます。データ部分内のすべてのカラム値が期限切れになると、ClickHouseはこのカラムをファイルシステムのデータ部分から削除します。

`TTL`句はキーカラムには使用できません。

**例**

#### `TTL`付きのテーブルを作成する: {#creating-a-table-with-ttl}

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

#### 既存テーブルのカラムにTTLを追加する {#adding-ttl-to-a-column-of-an-existing-table}

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

テーブルには、期限切れ行の削除のための式があり、[ディスクやボリューム](#table_engine-mergetree-multiple-volumes)間のパーツの自動移動のための複数の式があります。テーブル内の行が期限切れになると、ClickHouseはすべての対応する行を削除します。パーツの移動や再圧縮には、すべてのパーツの行が`TTL`式の基準を満たす必要があります。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTLルールのタイプは、各TTL式の後に続くことができます。これは、式が満たされたときに行うべきアクションに影響を与えます（現在時刻に達する）：

- `DELETE` - 期限切れ行を削除（デフォルトの動作）；
- `RECOMPRESS codec_name` - データ部分を`codec_name`で再圧縮；
- `TO DISK 'aaa'` - パーツをディスク`aaa`に移動；
- `TO VOLUME 'bbb'` - パーツをボリューム`bbb`に移動；
- `GROUP BY` - 期限切れ行を集約。

`DELETE`アクションは、`WHERE`句と共に使用して、フィルタリング条件に基づいて期限切れ行の一部のみを削除できます：

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY`式はテーブル主キーのプレフィックスでなければなりません。

カラムが`GROUP BY`式の一部でなく、`SET`句で明示的に設定されていない場合、結果行にはグループ化された行からの偶発的な値が含まれます（集計関数`any`が適用されるかのように）。

**例**

#### `TTL`付きのテーブルを作成する: {#creating-a-table-with-ttl-1}

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

#### テーブルの`TTL`を変更する: {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

1か月後に行が期限切れになるテーブルを作成します。期限切れ行のうち、日付が月曜日のものは削除されます：

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

#### 期限切れ行が再圧縮されるテーブルを作成する {#creating-a-table-where-expired-rows-are-recompressed}

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

期限切れ行が集約されるテーブルを作成します。結果行では、`x`にはグループ化された行の中の最大値が含まれ、`y`には最小値が、`d`には偶発的な値が含まれます。

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

期限切れの`TTL`を持つデータは、ClickHouseがデータパーツをマージする際に削除されます。

ClickHouseがデータが期限切れであることを検出すると、オフスケジュールのマージを実行します。このようなマージの頻度を制御するために、`merge_with_ttl_timeout`を設定できます。値が低すぎると、多くのオフスケジュールのマージが行われ、リソースを大量に消費する可能性があります。

マージの間に`SELECT`クエリを実行すると、期限切れデータを取得する可能性があります。これを回避するには、`SELECT`の前に[OPTIMIZE](/sql-reference/statements/optimize.md)クエリを使用してください。

**関連情報**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)設定

## ディスクタイプ {#disk-types}

ローカルブロックデバイスに加えて、ClickHouseはこれらのストレージタイプをサポートしています：
- [`s3` for S3 and MinIO](#table_engine-mergetree-s3)
- [`gcs` for GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` for Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` for HDFS](/engines/table-engines/integrations/hdfs)
- [`web` for read-only from web](/operations/storing-data#web-storage)
- [`cache` for local caching](/operations/storing-data#using-local-cache)
- [`s3_plain` for backups to S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` for immutable, non-replicated tables in S3](/operations/storing-data.md#s3-plain-rewritable-storage)

## データストレージに複数のブロックデバイスを使用する {#table_engine-mergetree-multiple-volumes}

### はじめに {#introduction}

`MergeTree`ファミリーのテーブルエンジンは、複数のブロックデバイスにデータを保存できます。たとえば、特定のテーブルのデータが暗黙的に「ホット」と「コールド」に分割される場合に便利です。最新のデータは定期的に要求されますが、必要とされるスペースはわずかです。逆に、太い尾を持つ履歴データはめったに要求されません。複数のディスクが利用可能な場合、「ホット」データを高速ディスク（たとえば、NVMe SSDやメモリ内）に、その一方で「コールド」データを比較的遅いディスク（たとえば、HDD）に置くことができます。

データ部分は、`MergeTree`エンジンテーブルの最低移動単位です。一つのパーツに属するデータは一つのディスクに保存されます。データ部分は、ユーザー設定に従って、バックグラウンドでディスク間で移動されることも、[ALTER](/sql-reference/statements/alter/partition)クエリを利用して移動されることもできます。

### 用語 {#terms}

- ディスク — ファイルシステムにマウントされたブロックデバイス。
- デフォルトディスク — [path](/operations/server-configuration-parameters/settings.md/#path)サーバー設定に指定したパスを保存するディスク。
- ボリューム — 同等のディスクの順序付けられたセット（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)に似ています）。
- ストレージポリシー — ボリュームのセットとそれらの間でデータを移動するルール。

説明されたエンティティに与えられた名前は、システムテーブルの[system.storage_policies](/operations/system-tables/storage_policies)や[system.disks](/operations/system-tables/disks)に見つけることができます。テーブルに設定されているストレージポリシーの1つを適用するには、`MergeTree`エンジンファミリのテーブルの`storage_policy`設定を使用します。

### 構成 {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、ストレージポリシーは、`config.d`ディレクトリ内のファイルの中で、`<storage_configuration>`タグ内に宣言する必要があります。

:::tip
ディスクはクエリの`SETTINGS`セクション内にも宣言できます。このことは、例えば、URLでホストされているディスクを一時的に接続するためのアドホック分析に便利です。詳細については、[動的ストレージ](/operations/storing-data#dynamic-configuration)を参照してください。
:::

構成の構造：

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
- `path` — サーバーがデータを保存する場所（`data`および`shadow`フォルダ）のパスで、末尾は'/'で終了する必要があります。
- `keep_free_space_bytes` — 予約すべき空きディスクスペースの量。

ディスクの定義の順序は重要ではありません。

ストレージポリシー構成のマークアップ：

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
                    <!-- 構成 -->
                </volume_name_2>
                <!-- さらにボリューム -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- 構成 -->
        </policy_name_2>

        <!-- さらにポリシー -->
    </policies>
    ...
</storage_configuration>
```

タグ：

- `policy_name_N` — ポリシー名。ポリシー名はユニークである必要があります。
- `volume_name_N` — ボリューム名。ボリューム名はユニークである必要があります。
- `disk` — ボリューム内のディスク。
- `max_data_part_size_bytes` — ボリュームのディスクに保存できる部分の最大サイズ。この設定により、マージされた部分のサイズが`max_data_part_size_bytes`よりも大きくなりそうな場合は、次のボリュームに書き込まれることになります。基本的には、この機能により、新しい/小さな部分をホット（SSD）ボリュームに保持し、サイズが大きくなったときにコールド（HDD）ボリュームに移動することを可能にします。この設定は、ポリシーが1つのボリュームのみを持つ場合には使用しないでください。
- `move_factor` — 利用可能なスペースの量がこの係数よりも少なくなると、データが次のボリュームに自動的に移動し始めます（デフォルトは0.1）。ClickHouseは、既存の部分をサイズの降順にソートし、`move_factor`条件を満たすのに必要な合計サイズを持つ部分を選択します。全ての部分の合計サイズが不十分である場合、すべての部分が移動されます。
- `perform_ttl_move_on_insert` — データ部分のINSERT時にTTL移動を無効にします。デフォルトでは（有効な場合）、TTL移動ルールで既に期限切れのデータ部分を挿入すると、それはすぐに移動ルールで宣言されたボリューム/ディスクに移動されます。これは、宛先のボリューム/ディスクが遅い場合（例：S3）に挿入を大幅に遅くする可能性があります。無効化すると、期限切れのデータ部分はデフォルトのボリュームに書き込まれ、その後すぐにTTLボリュームに移動されます。
- `load_balancing` - ディスクのバランスを取るポリシー。`round_robin`または`least_used`。
- `least_used_ttl_ms` - すべてのディスク上の利用可能なスペースの更新に関するタイムアウト（ミリ秒）（`0` - 常に更新、`-1` - 決して更新しない、デフォルトは`60000`）。注意、ディスクをClickHouseだけで使用し、オンラインファイルシステムのサイズ変更や縮小の対象でない場合には`-1`を使用できますが、他の場合ではお勧めできません。最終的に不適切なスペース配分を引き起こします。
- `prefer_not_to_merge` — この設定は使用しないでください。このボリュームでのデータ部分のマージを無効にします（これは有害であり、パフォーマンス低下につながります）。この設定が有効な場合（有効にしないでください）、このボリュームでのデータマージは許可されていません（これは良くありません）。これにより（何かを制御したい場合、あなたは過ちを犯しています）、ClickHouseが遅いディスクでどのように動作するかを制御できます（しかし、ClickHouseはより優れた知識を持っているので、どうかこの設定を使用しないでください）。
- `volume_priority` — ボリュームの充填順序を決定します。値が低いほど優先順位が高くなります。パラメータの値は自然数で、1からN（最低優先順位）までの範囲を共にカバーし、どの数字も飛ばさないようにする必要があります。
  * すべてのボリュームがタグ付けされている場合、それらは指定された順序で優先されます。
  * 一部のボリュームのみがタグ付けされている場合、タグが付いていないボリュームは最低の優先順位を持ち、定義された順序で優先されます。
  * ボリュームにタグが付けられていない場合、それらの優先順位は構成で宣言された順序に応じて設定されます。
  * 2つのボリュームが同じ優先順位値を持つことはできません。

構成例：

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

上記の例では、`hdd_in_order`ポリシーが[ラウンドロビン](https://en.wikipedia.org/wiki/Round-robin_scheduling)アプローチを実装しています。このポリシーは唯一のボリューム（`single`）を定義しており、データ部分はそのディスクに循環的に保存されます。このようなポリシーは、システムに複数の同様のディスクがマウントされているがRAIDが構成されていない場合に便利です。各ディスクドライブは信頼性がないため、レプリケーション係数を3以上にすることでこれを補うことを推奨します。

システムに異なる種類のディスクが利用可能な場合、`moving_from_ssd_to_hdd`ポリシーを代わりに使用できます。ボリューム`hot`にはSSDディスク（`fast_ssd`）が含まれ、保存できる部分の最大サイズは1GBです。1GBを超えるサイズの部分は、HDDディスク`disk1`を含む`cold`ボリュームに直接保存されます。また、ディスク`fast_ssd`が80％以上いっぱいになると、データはバックグラウンドプロセスによって`disk1`に転送されます。

ストレージポリシー内のボリュームの列挙順序は、少なくとも1つのボリュームが明示的な`volume_priority`パラメータを持たない場合に重要です。一度ボリュームが過剰に充填されると、データが次のボリュームに移動されます。ディスクの列挙順序も重要で、データはその順番で保存されます。

テーブルを作成する際、設定されたストレージポリシーの1つを適用できます：

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

`default`ストレージポリシーは、`<path>`に指定された1つのディスクで構成された1つのボリュームのみを使用することを意味します。テーブル作成後にストレージポリシーを変更することができます。新しいポリシーには、同じ名前の古いディスクとボリュームをすべて含む必要があります。

データ部分のバックグラウンド移動を実行するスレッド数は、[background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size)設定によって変更できます。

### 詳細 {#details}

`MergeTree`テーブルの場合、データは次の方法でディスクに到達します：

- 挿入の結果として（`INSERT`クエリ）。
- バックグラウンドマージおよび[ミューテーション](/sql-reference/statements/alter#mutations)中。
- 別のレプリカからダウンロードするとき。
- パーティションフリーズの結果として[ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

これらのケースと異なり、ミューテーションやパーティションフリーズの場合、部分は指定されたストレージポリシーに基づいてボリュームとディスクに保存されます：

1.  部分を格納するための十分なディスクスペースを持ち、指定されたサイズの部分を保存することを許可する（`unreserved_space > current_part_size` および `max_data_part_size_bytes > current_part_size`）最初のボリューム（定義の順番）を選択します。
2.  このボリューム内では、前のデータチャンクを保存するために使用されたディスクの次に選択し、そのディスクの空き容量が部分サイズよりも大きいディスクを選択します（`unreserved_space - keep_free_space_bytes > current_part_size`）。

基礎的な部分、ミューテーションおよびパーティションフリーズは、[ハードリンク](https://en.wikipedia.org/wiki/Hard_link)を使用します。異なるディスク間のハードリンクはサポートされていないため、このような場合、結果の部分は元のものと同じディスクに保存されます。

バックグラウンドでは、ボリューム間で自由な空間に基づいてデータが移動されます（`move_factor`パラメータに基づいて）、また構成ファイルで宣言された順序に従います。データは、最後のボリュームから最初のボリュームに移動しません。システムテーブルの[system.part_log](/operations/system-tables/part_log)（`type = MOVE_PART`フィールド）や[system.parts](/operations/system-tables/parts.md)（`path`および`disk`フィールド）を使用してバックグラウンド移動を監視できます。さらに、詳細情報はサーバーログで見つかります。

ユーザーは、[ALTER TABLE ... MOVE PART|PARTITION ... TO VOLUME|DISK ...](/sql-reference/statements/alter/partition)クエリを使用して、部分またはパーティションを1つのボリュームから別のボリュームに強制的に移動することができます。この操作では、バックグラウンド操作に対するすべての制約が考慮されます。クエリは独自に移動を開始し、バックグラウンド操作の完了を待ちません。十分な空きスペースがない場合や必要な条件が満たされていない場合、ユーザーはエラーメッセージを受け取ります。

データを移動することは、データのレプリケーションに干渉しません。したがって、同じテーブルに対して異なるレプリカに異なるストレージポリシーを指定できます。

バックグラウンドマージとミューテーションが完了した後、古い部分は特定の時間（`old_parts_lifetime`）が経過するまで削除されません。
この時間の間、古い部分は他のボリュームやディスクに移動されません。したがって、部分が最終的に削除されるまで、占有されているディスクスペースの評価にカウントされます。

ユーザーは、[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)ボリュームの異なるディスクに新しい大きな部分をバランスよく割り当てるために、[min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod)設定を使用できます。
## 外部ストレージを使用したデータストレージ {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンは、`s3`、`azure_blob_storage`、`hdfs` タイプのディスクを使用して、データを `S3`、`AzureBlobStorage`、`HDFS` に保存できます。詳細については、[外部ストレージオプションの構成](/operations/storing-data.md/#configuring-external-storage)を参照してください。

`S3` を外部ストレージとして使用する例です。ディスクのタイプは `s3` になります。

構成マークアップ:
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

また、[外部ストレージオプションの構成](/operations/storing-data.md/#configuring-external-storage)もご覧ください。

:::note キャッシュ構成
ClickHouse バージョン 22.3 から 22.7 は異なるキャッシュ構成を使用しているため、これらのバージョンを使用している場合は [ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を参照してください。
:::
## 仮想カラム {#virtual-columns}

- `_part` — パーツの名前。
- `_part_index` — クエリ結果におけるパーツの連続インデックス。
- `_partition_id` — パーティションの名前。
- `_part_uuid` — ユニークなパート識別子（MergeTree 設定 `assign_part_uuids` が有効な場合）。
- `_partition_value` — `partition by` 式の値（タプル）。
- `_sample_factor` — サンプル係数（クエリから）。
- `_block_number` — 行のブロック番号で、`allow_experimental_block_number_column` が true に設定されている場合、マージ時に永続化されます。

## カラム統計 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

統計の宣言は、`*MergeTree*` ファミリーのテーブルの `CREATE` クエリのカラムセクションにあり、`set allow_experimental_statistics = 1` を有効にする必要があります。

``` sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

`ALTER` ステートメントを使用して統計を操作することもできます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量統計は、カラム内の値の分布に関する情報を集約します。統計はすべてのパートに格納され、挿入が行われるたびに更新されます。  
それらは、`set allow_statistics_optimize = 1` を有効にする場合のみ、prewhere の最適化に使用できます。

### 利用可能なカラム統計のタイプ {#available-types-of-column-statistics}

- `MinMax`

    最小値と最大値のカラムの値で、数値カラムに対する範囲フィルターの選択性を推定するのに役立ちます。

    構文: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) スケッチは、数値カラムの近似パーセンタイル（例えば、90パーセンタイル）を計算できます。

    構文: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) スケッチは、カラムに含まれる異なる値の数を推定します。

    構文: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) スケッチは、カラム内の各値の頻度の近似数を提供します。

    構文: `countmin`

### サポートされているデータ型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String または FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |

### サポートされている操作 {#supported-operations}

|           | 等価フィルター (==) | 範囲フィルター (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |

## カラムレベルの設定 {#column-level-settings}

特定の MergeTree 設定はカラムレベルで上書きできます。

- `max_compress_block_size` — テーブルへの書き込みのために圧縮する前の未圧縮データブロックの最大サイズ。
- `min_compress_block_size` — 次のマークを書くときに必要な未圧縮データブロックの最小サイズ。

例:

```sql
CREATE TABLE tab
(
    id Int64,
    document String SETTINGS (min_compress_block_size = 16777216, max_compress_block_size = 16777216)
)
ENGINE = MergeTree
ORDER BY id
```

カラムレベルの設定は、[ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)を使用して変更または削除できます。例えば：

- カラム宣言から `SETTINGS` を削除:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 設定を変更:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 1つ以上の設定をリセットし、テーブルの CREATE クエリのカラム式の設定命令も削除します。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
