---
'description': '`MergeTree`ファミリーのテーブルエンジンは、高いデータ取り込み速度と巨大なデータ量に対応するように設計されています。'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

`MergeTree` エンジンおよび `MergeTree` ファミリーのその他のエンジン (例えば `ReplacingMergeTree`、`AggregatingMergeTree` ) は、ClickHouseで最も一般的かつ最も堅牢なテーブルエンジンです。

`MergeTree` ファミリーのテーブルエンジンは、高いデータ取り込み速度と膨大なデータ量に対応するために設計されています。挿入操作により、テーブルのパーツが作成され、バックグラウンドプロセスによって他のテーブルパーツとマージされます。

`MergeTree` ファミリーのテーブルエンジンの主な機能。

- テーブルの主キーは、各テーブルパーツ内のソート順序を決定します（クラスタリングインデックス）。主キーは個々の行ではなく、8192行で構成されるブロック（グラニュール）を参照します。これにより、巨大なデータセットの主キーをメインメモリに留めるのに十分小さく保ちながら、ディスク上のデータへの迅速なアクセスを提供します。

- テーブルは任意のパーティション式を使ってパーティション化できます。クエリによってパーティションが読み取られないようにパーティションプルーニングが保証されます。

- データは、高可用性、フェイルオーバー、ゼロダウンタイムのアップグレードのために、複数のクラスターノード間でレプリケートできます。詳細については [Data replication](/engines/table-engines/mergetree-family/replication.md) を参照してください。

- `MergeTree` テーブルエンジンは、クエリ最適化を支援するために、さまざまな統計の種類とサンプリング手法をサポートしています。

:::note
名前は似ていますが、[Merge](/engines/table-engines/special/merge) エンジンは `*MergeTree` エンジンとは異なります。
:::
## Creating tables {#table_engine-mergetree-creating-a-table}

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
### Query clauses {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — エンジンの名前とパラメータ。 `ENGINE = MergeTree()`。`MergeTree` エンジンにはパラメータはありません。
#### ORDER BY {#order_by}

`ORDER BY` — ソートキー。

カラム名または任意の式のタプル。例: `ORDER BY (CounterID + 1, EventDate)`。

主キーが定義されていない場合（つまり `PRIMARY KEY` が指定されていない場合）、ClickHouse はソートキーを主キーとして使用します。

ソートが不要な場合、`ORDER BY tuple()` 構文を使用できます。あるいは、`create_table_empty_primary_key_by_default` が有効になっている場合、`CREATE TABLE` ステートメントに `ORDER BY tuple()` が暗黙的に追加されます。主キーの選択については [Selecting a Primary Key](#selecting-a-primary-key) を参照してください。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。オプション。ほとんどの場合、パーティションキーは不要で、必要な場合でも、通常は月ごとのパーティショニングより細かい必要はありません。パーティショニングはクエリを高速化しません（ORDER BY 式とは対照的です）。あまり細かいパーティショニングを使用しないでください。クライアント識別子や名前でデータをパーティショニングしないでください（代わりに、ORDER BY 式の最初のカラムをクライアント識別子または名前にしてください）。

月でパーティショニングを行う場合は、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を持つカラムです。パーティション名は `"YYYYMM"` 形式です。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — ソートキーと [異なる場合](#choosing-a-primary-key-that-differs-from-the-sorting-key) の主キー。オプション。

ソートキーを指定する（`ORDER BY` 句を使用）ことは、暗黙的に主キーを指定します。通常、ソートキーに加えて主キーを指定する必要はありません。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング式。オプション。

指定された場合、主キーに含まれている必要があります。サンプリング式は、符号なし整数を返す必要があります。

例: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
####  TTL {#ttl}

`TTL` — 行の保存期間と自動的なパーツ移動のロジックを指定するルールのリスト [ディスクとボリューム間](#table_engine-mergetree-multiple-volumes)。オプション。

式は `Date` または `DateTime` になる必要があり、例: `TTL date + INTERVAL 1 DAY`。

ルールのタイプ `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` は、式が満たされた場合（現在の時間に達するとき）にパートで実行されるアクションを指定します：有効期限が切れた行の削除、特定のディスクにパートを移動（`TO DISK 'xxx'`）、またはボリュームに移動（`TO VOLUME 'xxx'`）、または有効期限が切れた行の値の集約。ルールのデフォルトのタイプは削除（`DELETE`）です。複数のルールのリストを指定できますが、`DELETE` ルールは1つだけにしてください。

詳細については [TTL for columns and tables](#table_engine-mergetree-ttl) を参照してください。
#### SETTINGS {#settings}

[MergeTree Settings](../../../operations/settings/merge-tree-settings.md) を参照してください。

**セクション設定の例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

この例では、月ごとのパーティショニングを設定しています。

また、ユーザーIDに基づくハッシュとしてサンプリングの式を設定しています。これにより、各 `CounterID` と `EventDate` に対してテーブル内のデータを擬似的にランダム化することができます。データを選択する際に [SAMPLE](/sql-reference/statements/select/sample) 句を指定すると、ClickHouse は特定のユーザーサブセットに対して均等に擬似ランダムなデータサンプルを返します。

`index_granularity` 設定は、省略可能です。8192 がデフォルト値です。

<details markdown="1">

<summary>テーブル作成のための非推奨方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能な場合は、古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree() パラメータ**

- `date-column` — [Date](/sql-reference/data-types/date.md) 型のカラムの名前。ClickHouse はこのカラムに基づいて月ごとに自動的にパーティションを作成します。パーティション名は `"YYYYMM"` 形式です。
- `sampling_expression` — サンプリングのための式。
- `(primary, key)` — 主キー。型: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — インデックスの細分化。インデックスの「マーク」の間のデータ行の数。値 8192 はほとんどのタスクに適しています。

**例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` エンジンは、前述の例と同様に、メインエンジン設定方法として構成されています。
</details>
## Data storage {#mergetree-data-storage}

テーブルは、主キーでソートされたデータパーツで構成されています。

テーブルにデータが挿入されると、別々のデータパーツが作成され、それぞれが主キーによって辞書式にソートされます。例えば、主キーが `(CounterID, Date)` の場合、パーツ内のデータは `CounterID` によってソートされ、各 `CounterID` 内では `Date` によって順序付けられます。

異なるパーティションに属するデータは、異なるパーツに分けられます。バックグラウンドで、ClickHouse はデータパーツをマージしてより効率的なストレージを実現します。異なるパーティションに属するパーツはマージされません。マージメカニズムは、同じ主キーを持つすべての行が同じデータパートに存在することを保証しません。

データパーツは `Wide` 形式または `Compact` 形式で保存できます。`Wide` 形式では、各カラムがファイルシステム内の別々のファイルに保存され、`Compact` 形式では、すべてのカラムが1つのファイルに保存されます。`Compact` 形式は、小規模で頻繁な挿入のパフォーマンスを向上させるために使用できます。

データ保存形式は、テーブルエンジンの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。データパートのバイト数または行数が対応する設定の値未満の場合、そのパートは `Compact` 形式で保存されます。さもなければ、`Wide` 形式で保存されます。これらの設定のいずれも設定されていない場合、データパーツは `Wide` 形式で保存されます。

各データパートは論理的にグラニュールに分割されています。グラニュールは、ClickHouse がデータを選択する際に読み取る最小の分割不可能なデータセットです。ClickHouse は行または値を分割しないため、各グラニュールは常に整数の行数を含みます。グラニュールの最初の行には、その行の主キーの値がマークされています。ClickHouse は、各データパートのためにマークを保存するインデックスファイルを作成します。主キーに関係なく、各カラムについても同じマークを保存します。これらのマークは、カラムファイル内のデータを直接見つけるのに役立ちます。

グラニュールのサイズは、テーブルエンジンの `index_granularity` および `index_granularity_bytes` 設定によって制限されます。グラニュール内の行数は、行のサイズに応じて `[1, index_granularity]` の範囲に収まります。行のサイズが設定の値より大きい場合、グラニュールのサイズは `index_granularity_bytes` を超えることがあります。この場合、グラニュールのサイズは行のサイズに等しくなります。
## Primary Keys and Indexes in Queries {#primary-keys-and-indexes-in-queries}

例えば `(CounterID, Date)` 主キーを考えます。この場合、ソートとインデックスは次のように示されます。

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

データクエリが次のように指定されている場合：

- `CounterID in ('a', 'h')` の場合、サーバーはマークの範囲 `[0, 3)` および `[6, 8)` からデータを読み取ります。
- `CounterID IN ('a', 'h') AND Date = 3` の場合、サーバーはマークの範囲 `[1, 3)` および `[7, 8)` からデータを読み取ります。
- `Date = 3` の場合、サーバーはマークの範囲 `[1, 10]` からデータを読み取ります。

上記の例は、インデックスを利用する方が常にフルスキャンより効果的であることを示しています。

スパースインデックスを使用すると、追加のデータを読み取ることができます。主キーの単一範囲を読み取る際、各データブロックの最大 `index_granularity * 2` 行を追加で読み取ることができます。

スパースインデックスを使うことで、多くのテーブル行を扱うことができます。なぜなら、ほとんどの場合、そのようなインデックスはコンピュータのRAMに収まるからです。

ClickHouse では、ユニークな主キーは必要ありません。同じ主キーを持つ複数の行を挿入できます。

`PRIMARY KEY` および `ORDER BY` 句で `Nullable` 型の式を使用できますが、強く推奨されません。この機能を許可するには、[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 設定を有効にしてください。[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) 原則は、`ORDER BY` 句の `NULL` 値に適用されます。
### Selecting a primary key {#selecting-a-primary-key}

主キー内のカラム数は明示的に制限されていません。データ構造に応じて、主キーに含めるカラムの数を増やすことも減らすこともできます。これにより：

- インデックスのパフォーマンスが向上します。

    主キーが `(a, b)` の場合、別のカラム `c` を追加すると、次の条件が満たされる場合にパフォーマンスが向上します：

  - カラム `c` に対する条件を含むクエリがあります。
  - `(a, b)` が同じ値を持つ長いデータ範囲（`index_granularity` の数倍の長さ）が一般的です。別のカラムを追加すると、かなり長いデータ範囲をスキップできるようになります。

- データ圧縮が改善されます。

    ClickHouse は主キーでデータをソートするため、一貫性が高いほど圧縮が良くなります。

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) および [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) エンジンでデータパーツのマージ時に追加のロジックを提供します。

    この場合、主キーと異なる *ソートキー* を指定することが意味を持ちます。

長い主キーは挿入性能やメモリ消費に悪影響を及ぼすが、一部のカラムを主キーに追加することは、`SELECT` クエリのパフォーマンスには影響しません。

`ORDER BY tuple()` 構文を使用して主キーなしのテーブルを作成できます。この場合、ClickHouseは挿入の順序でデータを保存します。`INSERT ... SELECT` クエリによってデータを挿入する際にデータの順序を維持したい場合、[max_insert_threads = 1](/operations/settings/settings#max_insert_threads) を設定してください。

初期の順序でデータを選択するには、[シングルスレッド](/operations/settings/settings.md/#max_threads) `SELECT` クエリを使用します。
### Choosing a primary key that differs from the sorting key {#choosing-a-primary-key-that-differs-from-the-sorting-key}

主キー（インデックスファイルに各マークについて書き込まれる値を持つ表現）が、ソートキー（データパーツ内の行をソートするための表現）と異なるように指定できます。この場合、主キーのタプル式はソートキー表現タプルのプレフィックスでなければなりません。

この機能は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) および [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジンを使用する際に役立ちます。これらのエンジンを使用する一般的なケースでは、テーブルには *次元* と *計測* の2種類のカラムがあります。典型的なクエリは、任意の `GROUP BY` で計測カラムの値を集計し、次元によってフィルタリングします。SummingMergeTree および AggregatingMergeTree は、ソートキーの同じ値を持つ行を集計するため、すべての次元をソートキーに追加するのが自然です。その結果、キーの式はカラムの長いリストからなり、このリストは新たに追加された次元で頻繁に更新される必要があります。

この場合、効率的な範囲スキャンを提供できる少数のカラムを主キーに残し、残りの次元カラムはソートキーのタプルに追加するのが意味があります。

ソートキーの [ALTER](/sql-reference/statements/alter/index.md) は軽量操作です。新しいカラムがテーブルとソートキーに同時に追加される際、既存のデータパーツは変更する必要がないためです。古いソートキーが新しいソートキーのプレフィックスであり、新しく追加されたカラムにはデータがないため、テーブルの修正時にデータは古い及び新しいソートキーの両方でソートされます。
### Use of indexes and partitions in queries {#use-of-indexes-and-partitions-in-queries}

`SELECT` クエリに対して、ClickHouse はインデックスが利用可能かどうかを分析します。インデックスは、`WHERE/PREWHERE` 句が主キーやパーティショニングキー、もしくはそれらのカラムの特定の部分的に反復する関数の論理関係を示す等号または不等号の比較を表す式や、これらのカラムに対して固定のプレフィックスを使った `IN` または `LIKE` を含む場合に使用できます。

したがって、主キーの1つまたは複数の範囲でクエリを迅速に実行することが可能です。この例では、特定のトラッキングタグ、特定のタグと日付範囲、特定のタグと日付、複数のタグと日付範囲などでクエリを実行すると、高速になります。

次のように構成されたエンジンを見てみましょう：
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

この場合、クエリでは：

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

ClickHouse は主キーインデックスを使用して不適切なデータをトリミングし、月ごとのパーティショニングキーを使用して不適切な日付範囲にあるパーティションをトリミングします。

上記のクエリは、複雑な式に対してもインデックスが使用されることを示しています。テーブルからのデータの読み取りは、インデックスを使用するのがフルスキャンより遅くなることがないように組織されています。

次の例では、インデックスは使用できません。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリを実行するときに ClickHouse がインデックスを使用できるかどうかを確認するには、[force_index_by_date](/operations/settings/settings.md/#force_index_by_date) 及び [force_primary_key](/operations/settings/settings#force_primary_key) 設定を使用します。

月によるパーティショニングのキーは、適切な範囲のデータブロックだけを読み取ることを可能にします。この場合、データブロックは多くの日付（最大で1か月分）に関するデータを含むことがあります。ブロック内ではデータが主キーによってソートされていますが、主キーに日付が最初のカラムとして含まれているとは限りません。このため、主キーのプレフィックスを指定せずに日付条件のみのクエリを使用すると、単一の日付の場合よりも多くのデータが読み取られます。
### Use of index for partially-monotonic primary keys {#use-of-index-for-partially-monotonic-primary-keys}

例えば、月の日を考えてみます。これらは1か月間の間で [単調増加列](https://en.wikipedia.org/wiki/Monotonic_function) を形成しますが、より長い期間では単調ではありません。これは部分的に単調な列です。ユーザーが部分的に単調な主キーでテーブルを作成すると、ClickHouse は通常通りスパースインデックスを作成します。この種類のテーブルからデータを選択する際、ClickHouse はクエリ条件を分析します。ユーザーがインデックスの2つのマーク間のデータを取得したい場合、両方のマークが1か月内にある場合、ClickHouse はこの特定の場合にインデックスを使用できます。なぜなら、クエリのパラメータとインデックスのマークの距離を計算できるからです。

もしクエリパラメータ範囲の主キーの値が単調増加列を示さない場合、ClickHouse はインデックスを使用できません。この場合、ClickHouse はフルスキャンメソッドを使用します。

ClickHouse はこの論理を月の日付の列だけでなく、部分的に単調な列を示す任意の主キーにも適用します。
### Data skipping indexes {#table_engine-mergetree-data_skipping-indexes}

インデックス宣言は、`CREATE` クエリのカラムセクションにあります。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree` ファミリーのテーブルでは、データスキッピングインデックスを指定できます。

これらのインデックスは、指定された式に関する情報をブロック上で集約します。これらのブロックは `granularity_value` グラニュールで構成されます（グラニュールのサイズはテーブルエンジンの `index_granularity` 設定を使用して指定されます）。次に、これらの集約が `SELECT` クエリ内で使用され、`where` クエリが満たされない大きなデータブロックをスキップすることによって読み取るデータ量を減少させます。

`GRANULARITY` 句は省略可能であり、`granularity_value` のデフォルト値は 1 です。

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

例のインデックスは、次のクエリのディスクからの読み取りデータ量を減少させるために ClickHouse によって使用されます：

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキッピングインデックスは、合成カラムに対しても作成できます：

```sql
-- on columns of type Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- on columns of type Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- on columns of type Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### Skip Index Types {#skip-index-types}

`MergeTree` テーブルエンジンは、次の種類のスキップインデックスをサポートしています。
パフォーマンス最適化のためのスキップインデックスの使用方法についての詳しい情報は、["Understanding ClickHouse data skipping indexes"](/optimize/skipping-indexes)を参照してください。

- [`MinMax`](#minmax) インデックス
- [`Set`](#set) インデックス
- [`bloom_filter`](#bloom-filter) インデックス
- [`ngrambf_v1`](#n-gram-bloom-filter) インデックス
- [`tokenbf_v1`](#token-bloom-filter) インデックス
#### MinMax skip index {#minmax}

各インデックスグラニュールに対して、式の最小値と最大値が保存されます。
（式が `tuple` 型の場合、各タプル要素の最小値と最大値を保存します。）

```text title="Syntax"
minmax
```
#### Set {#set}

各インデックスグラニュールに対して、指定された式の最大 `max_rows` 個のユニークな値が保存されます。
`max_rows = 0` は「すべてのユニークな値を保存する」ことを意味します。

```text title="Syntax"
set(max_rows)
```
#### Bloom filter {#bloom-filter}

各インデックスグラニュールは、指定されたカラムの [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) を保存します。

```text title="Syntax"
bloom_filter([false_positive_rate])
```

`false_positive_rate` パラメータは 0 と 1 の間の値を取ることができ（デフォルト値: `0.025`）、ポジティブ（読み取るデータ量を増加させる）を生成する確率を指定します。

次のデータ型がサポートされています：
- `(U)Int*`
- `Float*`
- `Enum`
- `Date`
- `DateTime`
- `String`
- `FixedString`
- `Array`
- `LowCardinality`
- `Nullable`
- `UUID`
- `Map`

:::note Map データ型: キーまたは値によるインデックス作成の指定
`Map` データ型の場合、クライアントはインデックスをキーまたは値に対して作成するかを、[`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) または [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 関数を使用して指定できます。
:::
#### N-gram bloom filter {#n-gram-bloom-filter}

各インデックスグラニュールは、指定されたカラムの [n-grams](https://en.wikipedia.org/wiki/N-gram) に対する [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) を保存します。

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| パラメータ                        | 説明         |
|----------------------------------|--------------|
| `n`                              | ngram サイズ |
| `size_of_bloom_filter_in_bytes` | Bloom フィルターのサイズ（バイト単位）。例えば、`256` や `512` のような大きな値を使用できます、圧縮がよく効くためです。|
|`number_of_hash_functions`       | Bloom フィルター内で使用されるハッシュ関数の数。|
|`random_seed` | Bloom フィルターのハッシュ関数用のシード。|

このインデックスは、次のデータ型でのみ機能します：
- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

`ngrambf_v1` のパラメータを推定するには、次の [ユーザー定義関数 (UDFs)](/sql-reference/statements/create/function.md) を使用できます。

```sql title="UDFs for ngrambf_v1"
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

これらの関数を使用するには、少なくとも2つのパラメータを指定する必要があります：
- `total_number_of_all_grams`
- `probability_of_false_positives`

例えば、グラニュール内に `4300` の ngram があり、偽陽性が `0.0001` 未満であることを期待している場合、他のパラメータは次のようなクエリを実行することで推定できます：

```sql
--- estimate number of bits in the filter
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- estimate number of hash functions
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

もちろん、他の条件のためにパラメータを推定するためにもこれらの関数を使用できます。
上記の関数は、bloom filter の計算機 [こちら](https://hur.st/bloomfilter) に関連します。
#### Token bloom filter {#token-bloom-filter}

トークンbloomフィルターは、`ngrambf_v1` と同じですが、ngram の代わりにトークン（非英数字で区切られたシーケンス）を保存します。

```text title="Syntax"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```
#### Vector similarity {#vector-similarity}

近似最近傍検索をサポートします。詳細については [こちら](annindexes.md) を参照してください。
### Text (experimental) {#text}

フルテキスト検索をサポートします。詳細については [こちら](invertedindexes.md) を参照してください。
### Functions support {#functions-support}

`WHERE` 句内の条件には、カラムを操作する関数の呼び出しが含まれます。カラムがインデックスの一部である場合、ClickHouse は関数を実行する際にこのインデックスを使用しようとします。ClickHouse はインデックスを使用するための異なる関数のサブセットをサポートしています。

タイプ `set` のインデックスは、すべての関数によって利用可能です。他のインデックスタイプは次のようにサポートされています：

| 関数 (演算子) / インデックス                                                                                                        | primary key | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | text |
|------------------------------------------------------------------------------------------------------------------------------------|-------------|--------|------------|------------|--------------|------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                        | ✔           | ✔      | ✔          | ✔          | ✔            | ✔    |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                            | ✔           | ✔      | ✔          | ✔          | ✔            | ✔    |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                                 | ✔           | ✔      | ✔          | ✔          | ✗            | ✔    |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                                           | ✔           | ✔      | ✔          | ✔          | ✗            | ✔    |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                               | ✗           | ✗      | ✔          | ✔          | ✗            | ✔    |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                                            | ✔           | ✔      | ✔          | ✔          | ✗            | ✔    |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                                                | ✗           | ✗      | ✔          | ✔          | ✗            | ✔    |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                                             | ✗           | ✗      | ✔          | ✗          | ✗            | ✗    |
| [in](/sql-reference/functions/in-functions)                                                                                       | ✔           | ✔      | ✔          | ✔          | ✔            | ✔    |
| [notIn](/sql-reference/functions/in-functions)                                                                                    | ✔           | ✔      | ✔          | ✔          | ✔            | ✔    |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                             | ✔           | ✔      | ✗          | ✗          | ✗            | ✗    |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                        | ✔           | ✔      | ✗          | ✗          | ✗            | ✗    |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                             | ✔           | ✔      | ✗          | ✗          | ✗            | ✗    |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                                       | ✔           | ✔      | ✗          | ✗          | ✗            | ✗    |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                         | ✔           | ✔      | ✗          | ✗          | ✗            | ✗    |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                                   | ✔           | ✔      | ✗          | ✗          | ✗            | ✗    |
| [has](/sql-reference/functions/array-functions#has)                                                                               | ✗           | ✗      | ✔          | ✔          | ✔            | ✔    |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗    |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗    |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hastoken)                                                         | ✗           | ✗      | ✗          | ✔          | ✗            | ✔    |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hastokenornull)                                             | ✗           | ✗      | ✗          | ✔          | ✗            | ✔    |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hastokencaseinsensitive)                    | ✗           | ✗      | ✗          | ✔          | ✗            | ✗    |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hastokencaseinsensitiveornull)        | ✗           | ✗      | ✗          | ✔          | ✗            | ✗    |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasanytokens)                                                 | ✗           | ✗      | ✗          | ✗          | ✗            | ✔    |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasalltokens)                                                 | ✗           | ✗      | ✗          | ✗          | ✗            | ✔    |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                          | ✗           | ✗      | ✗          | ✗          | ✗            | ✔    |

定数引数がngramサイズ未満である関数は、`ngrambf_v1` によるクエリ最適化で使用できません。

(*) `hasTokenCaseInsensitive` および `hasTokenCaseInsensitiveOrNull` を効果的に機能させるには、`tokenbf_v1` インデックスを小文字化されたデータ上で作成する必要があります。例えば、`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)` のようにします。

:::note
BLOOMフィルターは誤って陽性を検出する可能性があるため、`ngrambf_v1`、`tokenbf_v1`、および `bloom_filter` インデックスは、関数の結果が偽であることが期待されるクエリの最適化には使用できません。

例えば：

- 最適化可能：
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- 最適化不可能：
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::
## Projections {#projections}

プロジェクションは、[マテリアライズドビュー](/sql-reference/statements/create/view) に似ていますが、パーツレベルで定義されます。クエリ内で自動的に使用されるとともに、一貫性の保証を提供します。

:::note
プロジェクションを実装する際には、[force_optimize_projection](/operations/settings/settings#force_optimize_projection) 設定を考慮する必要があります。
:::

プロジェクションは、[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子を持つ `SELECT` ステートメントではサポートされていません。
### Projection query {#projection-query}

プロジェクションクエリは、プロジェクションを定義するものです。それは暗黙的に親テーブルからデータを選択します。
**構文**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

プロジェクションは、[ALTER](/sql-reference/statements/alter/projection.md) ステートメントで修正または削除できます。
### Projection storage {#projection-storage}

プロジェクションはパートディレクトリ内に保存されます。これはインデックスに似ていますが、匿名の `MergeTree` テーブルのパートを保存するサブディレクトリを含みます。このテーブルは、プロジェクションの定義クエリによって導かれます。もし `GROUP BY` 句があれば、基本となるストレージエンジンは [AggregatingMergeTree](aggregatingmergetree.md) になり、すべての集約関数は `AggregateFunction` に変換されます。もし `ORDER BY` 句があれば、`MergeTree` テーブルはそれを主キー式として使用します。マージプロセス中、プロジェクションパートはそのストレージのマージルーチンによってマージされます。親テーブルのパートのチェックサムは、プロジェクションパートと組み合わされます。他のメンテナンス作業はスキップインデックスと似ています。
### クエリ分析 {#projection-query-analysis}
1. プロジェクションが与えられたクエリに使用できるかどうかを確認します。つまり、基本テーブルをクエリした場合と同じ応答を生成します。
2. 読み取る粒度が最も少ない、最適な一致を選択します。
3. プロジェクションを使用するクエリパイプラインは、元のパーツを使用するものとは異なります。プロジェクションがいくつかのパーツに存在しない場合、プロジェクションを動的に「投影」するためのパイプラインを追加できます。

## 同時データアクセス {#concurrent-data-access}

同時テーブルアクセスには、マルチバージョンを使用します。言い換えれば、テーブルが同時に読み取られ更新されるとき、データはクエリ時点での最新のパーツのセットから読み取られます。長時間のロックはありません。挿入は読み取り操作の妨げになりません。

テーブルからの読み取りは自動的に並列化されます。

## カラムとテーブルのTTL {#table_engine-mergetree-ttl}

値の有効期限を決定します。

`TTL`句は、テーブル全体および各カラムごとに設定できます。テーブルレベルの`TTL`は、ディスクやボリューム間でデータを自動的に移動させるロジックを指定したり、すべてのデータが期限切れになった場合にパーツを再圧縮することもできます。

式は、[Date](/sql-reference/data-types/date.md)、[Date32](/sql-reference/data-types/date32.md)、[DateTime](/sql-reference/data-types/datetime.md)または[DateTime64](/sql-reference/data-types/datetime64.md)データ型に評価される必要があります。

**構文**

カラムの有効期限を設定する:

```sql
TTL time_column
TTL time_column + interval
```

`interval`を定義するには、[time interval](/sql-reference/operators#operators-for-working-with-dates-and-times)演算子を使用します。例えば：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### カラムのTTL {#mergetree-column-ttl}

カラム内の値が期限切れになると、ClickHouseはそれらをカラムデータ型のデフォルト値で置き換えます。データパーツ内のすべてのカラム値が期限切れの場合、ClickHouseはそのカラムをファイルシステム内のデータパーツから削除します。

`TTL`句はキーカラムには使用できません。

**例**
#### `TTL`のあるテーブルの作成: {#creating-a-table-with-ttl}

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
#### 既存テーブルのカラムにTTLを追加 {#adding-ttl-to-a-column-of-an-existing-table}

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

テーブルは、期限切れの行を削除するための式や、[ディスクまたはボリューム](#table_engine-mergetree-multiple-volumes)間でパーツを自動的に移動させるための複数の式を持つことができます。テーブル内の行が期限切れになると、ClickHouseは対応するすべての行を削除します。パーツの移動または再圧縮の場合、パーツのすべての行が`TTL`式の条件を満たす必要があります。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTLルールのタイプはそれぞれのTTL式に続くことができます。これは、式が満たされた（現在の時間に達した）ときに行うべきアクションに影響します：

- `DELETE` - 期限切れの行を削除します（デフォルトのアクション）；
- `RECOMPRESS codec_name` - `codec_name`でデータパートを再圧縮します；
- `TO DISK 'aaa'` - パートをディスク`aaa`に移動します；
- `TO VOLUME 'bbb'` - パートをディスク`bbb`に移動します；
- `GROUP BY` - 期限切れの行を集約します。

`DELETE`アクションは、フィルタ条件に基づいて期限切れの行の一部のみを削除するために`WHERE`句と共に使用できます：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY`式はテーブルの主キーのプレフィックスでなければなりません。

カラムが`GROUP BY`式の一部でなく、`SET`句に明示的に設定されていない場合、結果行にはグループ化された行からの偶発的な値が含まれます（まるで集約関数`any`が適用されたように）。

**例**
#### `TTL`のあるテーブルの作成: {#creating-a-table-with-ttl-1}

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
#### テーブルの`TTL`を変更: {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

作成するテーブルでは、行が1か月後に期限切れになります。期限切れの行で日付が月曜日の場合は削除されます：

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
#### 期限切れの行が再圧縮されるテーブルの作成: {#creating-a-table-where-expired-rows-are-recompressed}

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

期限切れの行が集約されるテーブルを作成します。結果行の`x`にはグループ行の最大値が含まれ、`y`には最小値、`d`にはグループ行から選ばれた偶発的な値が含まれます。

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

期限切れの`TTL`を持つデータは、ClickHouseがデータパーツをマージするときに削除されます。

ClickHouseがデータが期限切れであると検出すると、オフスケジュールマージを実行します。このようなマージの頻度を制御するために、`merge_with_ttl_timeout`を設定できます。もし値が低すぎると、多くのオフスケジュールマージが実行され、たくさんのリソースを消費する可能性があります。

マージの間に`SELECT`クエリを実行すると、期限切れのデータが返されることがあります。これを避けるために、`SELECT`の前に[OPTIMIZE](/sql-reference/statements/optimize.md)クエリを使用してください。

**関連資料**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)設定

## ディスクタイプ {#disk-types}

ローカルブロックデバイスに加えて、ClickHouseは次のストレージタイプをサポートしています：
- [`s3` for S3 and MinIO](#table_engine-mergetree-s3)
- [`gcs` for GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` for Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` for HDFS](/engines/table-engines/integrations/hdfs)
- [`web` for read-only from web](/operations/storing-data#web-storage)
- [`cache` for local caching](/operations/storing-data#using-local-cache)
- [`s3_plain` for backups to S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` for immutable, non-replicated tables in S3](/operations/storing-data.md#s3-plain-rewritable-storage)

## データストレージ用の複数のブロックデバイスの使用 {#table_engine-mergetree-multiple-volumes}
### はじめに {#introduction}

`MergeTree`ファミリのテーブルエンジンは、複数のブロックデバイスにデータを保存できます。例として、特定のテーブルのデータが暗黙的に「ホット」と「コールド」に分割されている場合に便利です。最新のデータは定期的に要求されますが、必要とされるスペースは少量です。それに対して、非常に大きな履歴データはあまり要求されません。複数のディスクが利用可能な場合、「ホット」データは高速ディスク（たとえば、NVMe SSDやメモリ）に配置され、「コールド」データは比較的遅いディスク（たとえば、HDD）に配置されることがあります。

データパートは、`MergeTree`エンジンテーブルの最小移動可能ユニットです。1つのパートに属するデータは、1つのディスクに保存されます。データパーツは、ユーザーの設定に従って、バックグラウンドでディスク間を移動させることができ、また[ALTER](/sql-reference/statements/alter/partition)クエリを使って移動することもできます。

### 用語 {#terms}

- ディスク — ファイルシステムにマウントされたブロックデバイス。
- デフォルトディスク — [path](/operations/server-configuration-parameters/settings.md/#path)サーバ設定で指定されたパスを保存するディスク。
- ボリューム — 等しいディスクの順序付けられたセット（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)に類似）。
- ストレージポリシー — ボリュームのセットとそれら間でデータを移動させるルール。

記述されたエンティティにつけられた名前は、システムテーブル、[system.storage_policies](/operations/system-tables/storage_policies)および[system.disks](/operations/system-tables/disks)から見つけることができます。テーブルに構成済みのストレージポリシーの1つを適用するには、`MergeTree`エンジンファミリテーブルの`storage_policy`設定を使用します。

### 設定 {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、ストレージポリシーは、`<storage_configuration>`タグ内に宣言されるべきです。これは`config.d`ディレクトリ内のファイルに記述できます。

:::tip
ディスクはクエリの`SETTINGS`セクションにも宣言できます。これは、例えば、URLでホストされているディスクを一時的に接続するために便利です。
詳細については、[動的ストレージ](/operations/storing-data#dynamic-configuration)を参照してください。
:::

設定構造：

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- disk name -->
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
- `path` — サーバがデータ（`data`および`shadow`フォルダ）を保存するパスで、'/'で終了する必要があります。
- `keep_free_space_bytes` — 確保されるべき空きディスクスペースの量。

ディスク定義の順番は重要ではありません。

ストレージポリシー設定のマークアップ：

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
                    <!-- configuration -->
                </volume_name_2>
                <!-- more volumes -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- configuration -->
        </policy_name_2>

        <!-- more policies -->
    </policies>
    ...
</storage_configuration>
```

タグ：

- `policy_name_N` — ポリシー名。ポリシー名は一意である必要があります。
- `volume_name_N` — ボリューム名。ボリューム名は一意である必要があります。
- `disk` — ボリューム内のディスク。
- `max_data_part_size_bytes` — ボリュームのディスクのうちのいずれかに保存できるパートの最大サイズ。マージされたパートのサイズが`max_data_part_size_bytes`を超えると、そのパートは次のボリュームに書き込まれます。この機能により、新規/小さいパーツをホット（SSD）ボリュームに保持し、大きくなると冷たい（HDD）ボリュームに移動させることができます。この設定を単一ボリュームのみを持つポリシーでは使用しないでください。
- `move_factor` — 利用可能なスペースの量がこのファクターより低下すると、データは自動的に次のボリュームに移動し始めます（デフォルトは0.1）。ClickHouseは既存のパートをサイズが大きい順にソートし、`move_factor`条件を満たすのに十分なサイズを持つパーツを選択します。すべてのパートの合計サイズが不十分な場合、すべてのパートが移動されます。
- `perform_ttl_move_on_insert` — データパートのINSERT時にTTLの移動を無効にします。デフォルト（有効な場合）では、TTL移動ルールによってすでに期限切れのデータパートを挿入した場合、それは即座に移動ルールで宣言されたボリューム/ディスクに移転します。これにより、宛先ボリューム/ディスクが遅い場合（例：S3）に挿入が大幅に遅くなる可能性があります。無効にした場合、すでに期限切れのデータパートはデフォルトのボリュームに書き込まれ、その後すぐにTTLボリュームに移動されます。
- `load_balancing` - ディスクバランスのポリシー、`round_robin`または`least_used`。
- `least_used_ttl_ms` - すべてのディスクでの使用可能なスペースの更新に対するタイムアウト（ミリ秒単位）を設定します（`0` - 常に更新、`-1` - 決して更新しないデフォルトは`60000`）。ClickHouseがのみ使用され、オンラインファイルシステムのリサイズ/縮小の影響を受けない場合は`-1`が使用できますが、他の場合では推奨されません。最終的に不正確なスペース配分を引き起こしますので。
- `prefer_not_to_merge` — この設定は使用すべきではありません。このボリュームでのデータパーツのマージを無効にします（これは害があり、パフォーマンスが低下します）。この設定が有効な場合（やらないでください）、このボリュームでのデータのマージは許可されません（これは悪いことです）。これにより、ClickHouseが遅いディスクとどのように作業するかを制御できます（ただし、ClickHouseはより良く知っているので、この設定を使用しないでください）。
- `volume_priority` — ボリュームが充填される順序（優先度）を定義します。値が小さいほど優先度が高くなります。このパラメータの値は自然数で、範囲を1からNまで（最低優先度が与えられます）カバーし、数値を飛ばしてはなりません。
  * _すべて_のボリュームにタグが付けられている場合、それらは指定された順序で優先されます。
  * _一部_のボリュームにのみタグが付けられている場合、タグのないボリュームは最低優先度を持ち、設定された順序で優先されます。
  * _ボリュームにタグが付けられていない場合、その優先度は設定で宣言された順序に従って設定されます。
  * 2つのボリュームは同じ優先度値を持つことができません。

設定例：

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- policy name -->
            <volumes>
                <single> <!-- volume name -->
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

与えられた例では、`hdd_in_order`ポリシーは[ラウンドロビン](https://en.wikipedia.org/wiki/Round-robin_scheduling)方式を実装します。したがって、このポリシーは1つのボリューム（`single`）のみを定義し、データパーツはそのすべてのディスクに円環の順序で保存されます。このようなポリシーは、システムに似た複数のディスクがマウントされているがRAIDが設定されていない場合に非常に便利です。ただし、各個別ディスクドライブは信頼性が低いため、レプリケーション係数を3以上にして対処することをお勧めします。

システム内にさまざまな種類のディスクがある場合、`moving_from_ssd_to_hdd`ポリシーを代わりに使用できます。ボリューム`hot`はSSDディスク（`fast_ssd`）で構成されており、このボリュームに保存できるパートの最大サイズは1GBです。1GBより大きいサイズのすべてのパーツは直接`cold`ボリューム（HDDディスク`disk1`を含む）に保存されます。また、ディスク`fast_ssd`が80％以上満たされると、データはバックグラウンドプロセスによって`disk1`に転送されます。

ストレージポリシー内のボリュームの列挙順序は、少なくとも1つのボリュームに明示的な`volume_priority`パラメータがない場合に重要です。ボリュームが満杯になると、データは次のボリュームに移動されます。ディスクの列挙順序も重要で、データはそれらに順番に保存されるからです。

テーブルを作成する際には、構成済みのストレージポリシーの1つを適用できます：

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

`default`ストレージポリシーは、`<path>`で指定された1つのディスクのみで構成される1つのボリュームのみの使用を意味します。
テーブル作成後にストレージポリシーを変更するには、[ALTER TABLE ... MODIFY SETTING]クエリを使用します。新しいポリシーはすべての古いディスクと同じ名前のボリュームを含む必要があります。

データパーツのバックグラウンド移動を実行するスレッドの数は、[background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size)設定によって変更できます。

### 詳細 {#details}

`MergeTree`テーブルの場合、データは次の方法でディスクに入ります：

- 挿入の結果（`INSERT`クエリ）。
- バックグラウンドマージおよび[ミューテーション](/sql-reference/statements/alter#mutations)中。
- 別のレプリカからのダウンロード。
- パーティションフリーズの結果 [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

ミューテーションやパーティションのフリーズを除くすべての場合、パートは指定されたストレージポリシーに従ってボリュームとディスクに格納されます：

1. パートを格納するための十分なディスクスペース（`unreserved_space > current_part_size`）があり、所定のサイズのパーツを格納することを許可する最初のボリューム（定義の順序で）が選択されます（`max_data_part_size_bytes > current_part_size`）。
2. このボリューム内で、以前のデータのチャンクを保存するために使用されていたディスクに続くディスクが選択され、パートサイズよりも自由なスペースがあるもの（`unreserved_space - keep_free_space_bytes > current_part_size`）。

内部的には、ミューテーションやパーティションのフリーズは[ハードリンク](https://en.wikipedia.org/wiki/Hard_link)を使用します。異なるディスク間のハードリンクはサポートされていないため、このような場合、生成されたパーツは元のパーツと同じディスクに保存されます。

バックグラウンドで、パーツはフィル設定に従ってボリューム間で自由なスペースに基づいて移動します（`move_factor`パラメータ）。データは決して最後から最初には転送されません。バックグラウンド移動を監視するには、システムテーブル [system.part_log](/operations/system-tables/part_log)（フィールド`type = MOVE_PART`）および [system.parts](/operations/system-tables/parts.md)（フィールド`path`および`disk`）を使用できます。また、サーバーログに詳細な情報が見つかります。

ユーザーは、クエリ [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition)を使用して、パートまたはパーティションを1つのボリュームから別のボリュームに強制移動できます。この場合、バックグラウンド操作に対するすべての制約が考慮されます。このクエリは独自に移動を開始し、バックグラウンド操作の完了を待ちません。ユーザーは、十分な空きスペースがない場合や必要条件が満たされていない場合はエラーメッセージを受け取ります。

データの移動はデータ複製の妨げになりません。したがって、同じテーブルに対して異なるレプリカに異なるストレージポリシーを指定できます。

バックグラウンドマージやミューテーションが完了した後、古いパーツは一定の時間が経過するまで削除されません（`old_parts_lifetime`）。この間、それらは他のボリュームやディスクに移動されません。したがって、パーツが最終的に削除されるまで、それらは使用されているディスクスペースの評価に含まれます。

ユーザーは、[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)ボリュームの異なるディスクに新しい大きなパーツをバランスよく割り当てることができます。これは [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod)設定を使用します。

## 外部ストレージを使用したデータストレージ {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)ファミリのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS`にデータを保存できます。これは、タイプ`s3`、`azure_blob_storage`、`hdfs`のディスクを使用します。詳細については、[外部ストレージオプションの設定](/operations/storing-data.md/#configuring-external-storage)を参照してください。

外部ストレージとして[S3](https://aws.amazon.com/s3/)を使用する例です。

設定マークアップ：
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

外部ストレージオプションの設定については、[こちら](/operations/storing-data.md/#configuring-external-storage)を参照してください。

:::note キャッシュ設定
ClickHouseバージョン22.3から22.7は異なるキャッシュ設定を使用します。これらのバージョンを使用している場合は、[ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を確認してください。
:::

## 仮想カラム {#virtual-columns}

- `_part` — パートの名前。
- `_part_index` — クエリ結果におけるパートの連続インデックス。
- `_part_starting_offset` — クエリ結果におけるパートの累積開始行。
- `_part_offset` — パート内の行の番号。
- `_part_granule_offset` — パート内のグラニュールの数。
- `_partition_id` — パーティションの名前。
- `_part_uuid` — 一意のパート識別子（MergeTree設定`assign_part_uuids`が有効な場合）。
- `_part_data_version` — パートのデータバージョン（最小ブロック番号またはミューテーションバージョン）。
- `_partition_value` — `partition by`式の値（タプル）。
- `_sample_factor` — サンプルファクター（クエリから）。
- `_block_number` — 挿入時に割り当てられた行の元のブロック番号で、`enable_block_number_column`が有効な場合にマージ時に保持されます。
- `_block_offset` — 挿入時に割り当てられたブロック内の元の行番号で、`enable_block_offset_column`が有効な場合にマージ時に保持されます。
- `_disk_name` — ストレージに使用されるディスク名。

## カラム統計 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

統計の宣言は、`*MergeTree*`ファミリーのテーブルの`CREATE`クエリのカラムセクションにあります。これは、`set allow_experimental_statistics = 1`を有効にするときです。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

統計は`ALTER`ステートメントで操作することもできます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量統計は、カラムの値の分布に関する情報を集約します。統計は各パートに保存され、挿入時に更新されます。
この統計は、`set allow_statistics_optimize = 1`を有効にしている場合にのみ、prewhere最適化に使用できます。

### 利用可能なカラム統計のタイプ {#available-types-of-column-statistics}

- `MinMax`

    数値カラムに対する範囲フィルタの選択度を推定できる最小値と最大値のカラム値。

    構文: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest)スケッチは、数値カラムの近似パーセンタイル（例えば、90パーセンタイル）を計算することを可能にします。

    構文: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)スケッチは、カラムに含まれる異なる値の数を推定します。

    構文: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch)スケッチは、カラム内の各値の頻度の近似カウントを提供します。

    構文: `countmin`

### サポートされているデータタイプ {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |

### サポートされている操作 {#supported-operations}

|           | 等価フィルタ（==） | 範囲フィルタ（`>, >=, <, <=`） |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |

## カラムレベルの設定 {#column-level-settings}

特定のMergeTree設定はカラムレベルでオーバーライドできます：

- `max_compress_block_size` — テーブルに書き込む前の非圧縮データの最大ブロックサイズ。
- `min_compress_block_size` — 次のマークに書き込む際に必要な非圧縮データの最小ブロックサイズ。

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

カラムレベルの設定は、[ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)を使用して変更または削除できます。例えば：

- カラム宣言から`SETTINGS`を削除：

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 設定を変更：

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 1つ以上の設定をリセットし、テーブルのCREATEクエリのカラム式から設定宣言を削除します。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
