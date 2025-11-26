---
description: '`MergeTree` ファミリーのテーブルエンジンは、高いデータ取り込み速度と大量のデータを扱うために設計されています。'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree テーブルエンジン'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree テーブルエンジン

`MergeTree` エンジンおよび `ReplacingMergeTree`、`AggregatingMergeTree` などの `MergeTree` ファミリーの他のエンジンは、ClickHouse で最も一般的に使用され、最も堅牢なテーブルエンジンです。

`MergeTree` ファミリーのテーブルエンジンは、高いデータ取り込みレートと膨大なデータ量を扱えるように設計されています。
INSERT 操作によりテーブルパーツが作成され、それらはバックグラウンドプロセスによって他のテーブルパーツとマージされます。

`MergeTree` ファミリーのテーブルエンジンの主な特長:

- テーブルの主キーは、各テーブルパーツ内のソート順（クラスタ化インデックス）を決定します。主キーは個々の行ではなく、グラニュールと呼ばれる 8192 行のブロックを参照します。これにより、巨大なデータセットの主キーであっても主メモリに常駐できる程度に小さく保たれつつ、ディスク上のデータへの高速アクセスが可能になります。

- テーブルは任意のパーティション式を用いてパーティション分割できます。パーティションプルーニングにより、クエリが許す場合は読み取り対象からパーティションが除外されます。

- 高可用性、フェイルオーバー、およびゼロダウンタイムでのアップグレードのために、複数のクラスタノード間でデータをレプリケートできます。詳細は [Data replication](/engines/table-engines/mergetree-family/replication.md) を参照してください。

- `MergeTree` テーブルエンジンは、クエリ最適化を支援するために、さまざまな統計情報の種類とサンプリング手法をサポートします。

:::note
名前は似ていますが、[Merge](/engines/table-engines/special/merge) エンジンは `*MergeTree` エンジンとは異なります。
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

パラメータの詳細については、[CREATE TABLE](/sql-reference/statements/create/table.md)文を参照してください。

### クエリ句 {#mergetree-query-clauses}

#### ENGINE {#engine}

`ENGINE` — エンジンの名前とパラメータ。`ENGINE = MergeTree()`。`MergeTree`エンジンにはパラメータがありません。

#### ORDER BY {#order_by}

`ORDER BY` — ソートキー。

カラム名または任意の式のタプル。例: `ORDER BY (CounterID + 1, EventDate)`。

プライマリキーが定義されていない場合（つまり`PRIMARY KEY`が指定されていない場合）、ClickHouseはソートキーをプライマリキーとして使用します。

ソートが不要な場合は、`ORDER BY tuple()`という構文を使用できます。
または、設定`create_table_empty_primary_key_by_default`が有効になっている場合、`ORDER BY ()`が`CREATE TABLE`文に暗黙的に追加されます。[プライマリキーの選択](#selecting-a-primary-key)を参照してください。

#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。オプション。ほとんどの場合、パーティションキーは不要です。パーティション分割が必要な場合でも、通常は月単位よりも細かいパーティションキーは必要ありません。パーティション分割はクエリを高速化しません（ORDER BY式とは対照的です）。過度に細かいパーティション分割は決して使用しないでください。クライアント識別子や名前でデータをパーティション分割しないでください（代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにしてください）。

月単位でパーティション分割するには、`toYYYYMM(date_column)`式を使用します。ここで`date_column`は[Date](/sql-reference/data-types/date.md)型の日付を持つカラムです。この場合のパーティション名は`"YYYYMM"`形式になります。

#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — [ソートキーと異なる](#choosing-a-primary-key-that-differs-from-the-sorting-key)場合のプライマリキー。オプション。

ソートキーを指定すると（`ORDER BY`句を使用）、暗黙的にプライマリキーが指定されます。
通常、ソートキーに加えてプライマリキーを指定する必要はありません。

#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング式。オプション。

指定する場合は、プライマリキーに含まれている必要があります。
サンプリング式は符号なし整数を返す必要があります。

例: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。

#### TTL {#ttl}

`TTL` — 行の保存期間と[ディスクとボリューム間](#table_engine-mergetree-multiple-volumes)での自動パーツ移動のロジックを指定するルールのリスト。オプション。

式は`Date`または`DateTime`を返す必要があります。例: `TTL date + INTERVAL 1 DAY`。


ルール `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` のタイプは、式が満たされた場合(現在時刻に達した場合)にパートに対して実行されるアクションを指定します:期限切れ行の削除、パートの移動(パート内のすべての行で式が満たされた場合)を指定されたディスク(`TO DISK 'xxx'`)またはボリューム(`TO VOLUME 'xxx'`)へ、または期限切れ行の値の集約です。ルールのデフォルトタイプは削除(`DELETE`)です。複数のルールのリストを指定できますが、`DELETE` ルールは1つまでです。

詳細については、[カラムとテーブルのTTL](#table_engine-mergetree-ttl)を参照してください。

#### SETTINGS {#settings}

[MergeTree設定](../../../operations/settings/merge-tree-settings.md)を参照してください。

**セクション設定の例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

この例では、月ごとのパーティショニングを設定しています。

また、ユーザーIDによるハッシュとしてサンプリング用の式を設定しています。これにより、各`CounterID`と`EventDate`に対してテーブル内のデータを疑似ランダム化できます。データを選択する際に[SAMPLE](/sql-reference/statements/select/sample)句を定義すると、ClickHouseはユーザーのサブセットに対して均等に疑似ランダムなデータサンプルを返します。

`index_granularity`設定は、8192がデフォルト値であるため省略できます。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**MergeTree()パラメータ**

- `date-column` — [Date](/sql-reference/data-types/date.md)型のカラムの名前。ClickHouseはこのカラムに基づいて月ごとのパーティションを自動的に作成します。パーティション名は`"YYYYMM"`形式です。
- `sampling_expression` — サンプリング用の式。
- `(primary, key)` — プライマリキー。型: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — インデックスの粒度。インデックスの「マーク」間のデータ行数。ほとんどのタスクでは8192の値が適切です。

**例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree`エンジンは、メインエンジン設定方法の上記の例と同じ方法で設定されます。

</details>


## データストレージ {#mergetree-data-storage}

テーブルは、プライマリキーでソートされたデータパートで構成されます。

テーブルにデータが挿入されると、個別のデータパートが作成され、それぞれがプライマリキーで辞書順にソートされます。例えば、プライマリキーが`(CounterID, Date)`の場合、パート内のデータは`CounterID`でソートされ、各`CounterID`内では`Date`で順序付けられます。

異なるパーティションに属するデータは、異なるパートに分離されます。ClickHouseはバックグラウンドで、より効率的なストレージのためにデータパートをマージします。異なるパーティションに属するパートはマージされません。マージメカニズムは、同じプライマリキーを持つすべての行が同じデータパートに存在することを保証しません。

データパートは`Wide`または`Compact`形式で保存できます。`Wide`形式では、各カラムがファイルシステム内の個別のファイルに保存され、`Compact`形式ではすべてのカラムが1つのファイルに保存されます。`Compact`形式は、小規模で頻繁な挿入のパフォーマンスを向上させるために使用できます。

データ保存形式は、テーブルエンジンの`min_bytes_for_wide_part`および`min_rows_for_wide_part`設定によって制御されます。データパート内のバイト数または行数が対応する設定値より少ない場合、パートは`Compact`形式で保存されます。それ以外の場合は`Wide`形式で保存されます。これらの設定がいずれも設定されていない場合、データパートは`Wide`形式で保存されます。

各データパートは論理的にグラニュールに分割されます。グラニュールは、ClickHouseがデータを選択する際に読み取る最小の不可分なデータセットです。ClickHouseは行や値を分割しないため、各グラニュールには常に整数個の行が含まれます。グラニュールの最初の行には、その行のプライマリキーの値がマークされます。各データパートに対して、ClickHouseはマークを保存するインデックスファイルを作成します。各カラムについて、プライマリキーに含まれるかどうかに関わらず、ClickHouseは同じマークを保存します。これらのマークにより、カラムファイル内のデータを直接検索できます。

グラニュールのサイズは、テーブルエンジンの`index_granularity`および`index_granularity_bytes`設定によって制限されます。グラニュール内の行数は、行のサイズに応じて`[1, index_granularity]`の範囲内にあります。単一行のサイズが設定値より大きい場合、グラニュールのサイズは`index_granularity_bytes`を超えることがあります。この場合、グラニュールのサイズは行のサイズと等しくなります。


## クエリにおける主キーとインデックス {#primary-keys-and-indexes-in-queries}

`(CounterID, Date)` という主キーを例に取ります。この場合、ソートとインデックスは次のように図示できます:

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

データクエリが次のように指定された場合:

- `CounterID in ('a', 'h')` の場合、サーバーはマーク `[0, 3)` および `[6, 8)` の範囲のデータを読み取ります。
- `CounterID IN ('a', 'h') AND Date = 3` の場合、サーバーはマーク `[1, 3)` および `[7, 8)` の範囲のデータを読み取ります。
- `Date = 3` の場合、サーバーはマーク `[1, 10]` の範囲のデータを読み取ります。

上記の例は、フルスキャンよりもインデックスを使用する方が常に効果的であることを示しています。

スパースインデックスでは、余分なデータが読み取られることがあります。主キーの単一範囲を読み取る際、各データブロックで最大 `index_granularity * 2` 行の余分な行が読み取られる可能性があります。

スパースインデックスを使用すると、非常に多数のテーブル行を扱うことができます。これは、ほとんどの場合、このようなインデックスがコンピュータのRAMに収まるためです。

ClickHouseは一意な主キーを必要としません。同じ主キーを持つ複数の行を挿入できます。

`PRIMARY KEY` および `ORDER BY` 句で `Nullable` 型の式を使用できますが、強く非推奨です。この機能を有効にするには、[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 設定をオンにしてください。`ORDER BY` 句における `NULL` 値には [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) の原則が適用されます。

### 主キーの選択 {#selecting-a-primary-key}

主キーの列数に明示的な制限はありません。データ構造に応じて、主キーに含める列を増減できます。これにより次のような効果が得られる可能性があります:

- インデックスのパフォーマンスを向上させる。

  主キーが `(a, b)` の場合、次の条件が満たされていれば、別の列 `c` を追加することでパフォーマンスが向上します:
  - 列 `c` に対する条件を持つクエリが存在する。
  - `(a, b)` の値が同一である長いデータ範囲(`index_granularity` の数倍の長さ)が一般的である。言い換えれば、別の列を追加することで、かなり長いデータ範囲をスキップできる場合。

- データ圧縮を向上させる。

  ClickHouseは主キーでデータをソートするため、一貫性が高いほど圧縮率が向上します。

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) および [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) エンジンでデータパーツをマージする際に追加のロジックを提供する。

  この場合、主キーとは異なる_ソートキー_を指定することが理にかなっています。

長い主キーは挿入パフォーマンスとメモリ消費に悪影響を及ぼしますが、主キーの余分な列は `SELECT` クエリ実行時のClickHouseのパフォーマンスには影響しません。

`ORDER BY tuple()` 構文を使用して、主キーなしでテーブルを作成できます。この場合、ClickHouseはデータを挿入順に格納します。`INSERT ... SELECT` クエリでデータを挿入する際にデータの順序を保持したい場合は、[max_insert_threads = 1](/operations/settings/settings#max_insert_threads) を設定してください。

初期順序でデータを選択するには、[シングルスレッド](/operations/settings/settings.md/#max_threads)の `SELECT` クエリを使用してください。

### ソートキーとは異なる主キーの選択 {#choosing-a-primary-key-that-differs-from-the-sorting-key}


プライマリキー(各マークに対してインデックスファイルに書き込まれる値の式)を、ソートキー(データパート内の行をソートするための式)とは異なるものとして指定することができます。この場合、プライマリキー式のタプルは、ソートキー式のタプルの接頭辞である必要があります。

この機能は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md)および[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md)テーブルエンジンを使用する際に有用です。これらのエンジンを使用する一般的なケースでは、テーブルには2種類のカラムがあります:_ディメンション_と_メジャー_です。典型的なクエリは、任意の`GROUP BY`でメジャーカラムの値を集計し、ディメンションでフィルタリングします。SummingMergeTreeとAggregatingMergeTreeは、ソートキーの値が同じ行を集計するため、すべてのディメンションをソートキーに追加することが自然です。その結果、キー式は長いカラムのリストで構成され、このリストは新しく追加されるディメンションで頻繁に更新する必要があります。

この場合、効率的な範囲スキャンを提供する少数のカラムのみをプライマリキーに残し、残りのディメンションカラムをソートキーのタプルに追加することが合理的です。

ソートキーの[ALTER](/sql-reference/statements/alter/index.md)は軽量な操作です。新しいカラムがテーブルとソートキーに同時に追加される際、既存のデータパートを変更する必要がないためです。古いソートキーが新しいソートキーの接頭辞であり、新しく追加されたカラムにはデータが存在しないため、テーブル変更の時点でデータは古いソートキーと新しいソートキーの両方でソートされています。

### クエリにおけるインデックスとパーティションの使用 {#use-of-indexes-and-partitions-in-queries}

`SELECT`クエリに対して、ClickHouseはインデックスが使用可能かどうかを分析します。`WHERE/PREWHERE`句に、等価または不等価比較演算を表す式(結合要素の1つとして、または全体として)がある場合、またはプライマリキーまたはパーティショニングキーに含まれるカラムや式、あるいはこれらのカラムの特定の部分的反復関数、またはこれらの式の論理関係に対して、固定接頭辞を持つ`IN`または`LIKE`がある場合、インデックスを使用できます。

したがって、プライマリキーの1つまたは複数の範囲に対してクエリを高速に実行することができます。この例では、特定のトラッキングタグ、特定のタグと日付範囲、特定のタグと日付、日付範囲を持つ複数のタグなどに対してクエリを実行する場合に高速になります。

次のように設定されたエンジンを見てみましょう:

```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

この場合、以下のクエリにおいて:

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

ClickHouseは、プライマリキーインデックスを使用して不適切なデータを削減し、月次パーティショニングキーを使用して不適切な日付範囲のパーティションを削減します。

上記のクエリは、複雑な式に対してもインデックスが使用されることを示しています。テーブルからの読み取りは、インデックスの使用がフルスキャンよりも遅くならないように構成されています。

以下の例では、インデックスを使用できません。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリ実行時にClickHouseがインデックスを使用できるかどうかを確認するには、[force_index_by_date](/operations/settings/settings.md/#force_index_by_date)および[force_primary_key](/operations/settings/settings#force_primary_key)設定を使用してください。

月次パーティショニングのキーにより、適切な範囲の日付を含むデータブロックのみを読み取ることができます。この場合、データブロックには多数の日付(最大で1か月全体)のデータが含まれる可能性があります。ブロック内では、データはプライマリキーでソートされており、プライマリキーの最初のカラムに日付が含まれていない場合があります。このため、プライマリキーの接頭辞を指定しない日付条件のみを使用するクエリでは、単一の日付に対するよりも多くのデータが読み取られることになります。

### 部分的に単調なプライマリキーに対するインデックスの使用 {#use-of-index-for-partially-monotonic-primary-keys}


例えば、月の日付を考えてみましょう。これらは1か月の間は[単調数列](https://en.wikipedia.org/wiki/Monotonic_function)を形成しますが、より長い期間では単調ではありません。これは部分的単調数列です。ユーザーが部分的単調プライマリキーを持つテーブルを作成すると、ClickHouseは通常通りスパースインデックスを作成します。ユーザーがこの種のテーブルからデータを選択すると、ClickHouseはクエリ条件を分析します。ユーザーがインデックスの2つのマーク間のデータを取得したい場合で、両方のマークが1か月以内に収まる場合、ClickHouseはこの特定のケースでインデックスを使用できます。これは、クエリのパラメータとインデックスマーク間の距離を計算できるためです。

クエリパラメータ範囲内のプライマリキーの値が単調数列を表さない場合、ClickHouseはインデックスを使用できません。この場合、ClickHouseはフルスキャン方式を使用します。

ClickHouseはこのロジックを月の日付の数列だけでなく、部分的単調数列を表すあらゆるプライマリキーに対して使用します。

### データスキップインデックス {#table_engine-mergetree-data_skipping-indexes}

インデックス宣言は`CREATE`クエリのカラムセクションに記述します。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree`ファミリーのテーブルでは、データスキップインデックスを指定できます。

これらのインデックスは、`granularity_value`個のグラニュール(グラニュールのサイズはテーブルエンジンの`index_granularity`設定で指定されます)で構成されるブロック上の指定された式に関する情報を集約します。その後、これらの集約は`SELECT`クエリで使用され、`where`句を満たさない大きなデータブロックをスキップすることで、ディスクから読み取るデータ量を削減します。

`GRANULARITY`句は省略可能で、`granularity_value`のデフォルト値は1です。

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

この例のインデックスは、以下のクエリでディスクから読み取るデータ量を削減するためにClickHouseで使用できます:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキップインデックスは複合カラムに対しても作成できます:

```sql
-- Map型のカラムに対して:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- Tuple型のカラムに対して:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- Nested型のカラムに対して:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```

### スキップインデックスの種類 {#skip-index-types}

`MergeTree`テーブルエンジンは以下の種類のスキップインデックスをサポートしています。
スキップインデックスをパフォーマンス最適化に使用する方法の詳細については、
["ClickHouseデータスキップインデックスの理解"](/optimize/skipping-indexes)を参照してください。

- [`MinMax`](#minmax)インデックス
- [`Set`](#set)インデックス
- [`bloom_filter`](#bloom-filter)インデックス
- [`ngrambf_v1`](#n-gram-bloom-filter)インデックス
- [`tokenbf_v1`](#token-bloom-filter)インデックス

#### MinMaxスキップインデックス {#minmax}

各インデックスグラニュールに対して、式の最小値と最大値が格納されます。
(式が`tuple`型の場合、各タプル要素の最小値と最大値が格納されます。)

```text title="構文"
minmax
```

#### Set {#set}

各インデックスグラニュールに対して、指定された式の最大`max_rows`個のユニークな値が格納されます。
`max_rows = 0`は「すべてのユニークな値を格納する」ことを意味します。

```text title="構文"
set(max_rows)
```

#### Bloomフィルタ {#bloom-filter}

各インデックスグラニュールに対して、指定されたカラムの[Bloomフィルタ](https://en.wikipedia.org/wiki/Bloom_filter)を格納します。

```text title="構文"
bloom_filter([false_positive_rate])
```

`false_positive_rate`パラメータは0から1の間の値を取ることができ(デフォルト: `0.025`)、偽陽性を生成する確率を指定します(これにより読み取るデータ量が増加します)。


以下のデータ型がサポートされています:

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

:::note Mapデータ型: キーまたは値を使用したインデックス作成の指定
`Map`データ型の場合、[`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys)または[`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues)関数を使用して、キーまたは値のどちらに対してインデックスを作成するかを指定できます。
:::

#### N-gramブルームフィルタ {#n-gram-bloom-filter}

各インデックスグラニュールに対して、指定されたカラムの[n-gram](https://en.wikipedia.org/wiki/N-gram)用の[ブルームフィルタ](https://en.wikipedia.org/wiki/Bloom_filter)を格納します。

```text title="構文"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| パラメータ                       | 説明                                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `n`                             | ngramのサイズ                                                                                                                   |
| `size_of_bloom_filter_in_bytes` | ブルームフィルタのサイズ(バイト単位)。圧縮効率が高いため、例えば`256`や`512`などの大きな値を使用できます。 |
| `number_of_hash_functions`      | ブルームフィルタで使用されるハッシュ関数の数。                                                                       |
| `random_seed`                   | ブルームフィルタのハッシュ関数用のシード値。                                                                                    |

このインデックスは以下のデータ型でのみ動作します:

- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

`ngrambf_v1`のパラメータを推定するには、以下の[ユーザー定義関数(UDF)](/sql-reference/statements/create/function.md)を使用できます。

```sql title="ngrambf_v1用のUDF"
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

これらの関数を使用するには、少なくとも以下の2つのパラメータを指定する必要があります:

- `total_number_of_all_grams`
- `probability_of_false_positives`

例えば、グラニュールに`4300`個のngramがあり、偽陽性率を`0.0001`未満にしたい場合、
以下のクエリを実行することで他のパラメータを推定できます:

```sql
--- フィルタのビット数を推定
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- ハッシュ関数の数を推定
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

もちろん、これらの関数を使用して他の条件に対するパラメータを推定することもできます。
上記の関数は[こちら](https://hur.st/bloomfilter)のブルームフィルタ計算機を参照しています。

#### トークンブルームフィルタ {#token-bloom-filter}

トークンブルームフィルタは`ngrambf_v1`と同じですが、ngramの代わりにトークン(英数字以外の文字で区切られたシーケンス)を格納します。

```text title="構文"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```


#### スパースグラムブルームフィルター {#sparse-grams-bloom-filter}

スパースグラムブルームフィルターは`ngrambf_v1`と類似していますが、nグラムの代わりに[スパースグラムトークン](/sql-reference/functions/string-functions.md/#sparseGrams)を使用します。

```text title="構文"
sparse_grams(min_ngram_length, max_ngram_length, min_cutoff_length, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

### テキストインデックス {#text}

全文検索をサポートしています。詳細は[こちら](invertedindexes.md)を参照してください。

#### ベクトル類似度 {#vector-similarity}

近似最近傍探索をサポートしています。詳細は[こちら](annindexes.md)を参照してください。

### 関数のサポート {#functions-support}

`WHERE`句の条件には、カラムを操作する関数の呼び出しが含まれます。カラムがインデックスの一部である場合、ClickHouseは関数を実行する際にこのインデックスの使用を試みます。ClickHouseは、インデックスを使用するための異なる関数のサブセットをサポートしています。

`set`型のインデックスはすべての関数で利用できます。その他のインデックス型は以下のようにサポートされています:


| 関数（演算子）／インデックス                                                                                                            | 主キー | minmax | ngrambf&#95;v1 | tokenbf&#95;v1 | bloom&#95;filter | text | sparse&#95;grams |
| ------------------------------------------------------------------------------------------------------------------------- | --- | ------ | -------------- | -------------- | ---------------- | ---- | ---------------- |
| [equals（=, ==）](/sql-reference/functions/comparison-functions.md/#equals)                                                 | ✔   | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                    | ✔   | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                         | ✔   | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                   | ✔   | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                       | ✗   | ✗      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                    | ✔   | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                        | ✗   | ✗      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗   | ✗      | ✔              | ✗              | ✗                | ✗    | ✗                |
| [in](/sql-reference/functions/in-functions)                                                                               | ✔   | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [notIn](/sql-reference/functions/in-functions)                                                                            | ✔   | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [より小さい (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                     | ✔   | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [大なり (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                    | ✔   | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                     | ✔   | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                               | ✔   | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔   | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✗   | ✔      | ✗              | ✗              | ✗                | ✗    | ✔                |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✗   | ✗      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗   | ✗      | ✔              | ✔              | ✔                | ✗    | ✔                |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗   | ✗      | ✔              | ✔              | ✔                | ✗    | ✔                |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗   | ✗      | ✗              | ✔              | ✗                | ✔    | ✗                |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                     | ✗   | ✗      | ✗              | ✔              | ✗                | ✔    | ✗                |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)             | ✗   | ✗      | ✗              | ✔              | ✗                | ✗    | ✗                |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗   | ✗      | ✗              | ✔              | ✗                | ✗    | ✗                |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                         | ✗   | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                         | ✗   | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                   | ✗   | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |



`ngrambf_v1` では、定数引数が ngram のサイズより小さい関数はクエリ最適化に使用できません。

(*) `hasTokenCaseInsensitive` および `hasTokenCaseInsensitiveOrNull` を効果的に機能させるには、`tokenbf_v1` インデックスを小文字化したデータに対して作成する必要があります。例えば `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)` のようにします。

:::note
Bloom filter には偽陽性が発生する可能性があるため、`ngrambf_v1`、`tokenbf_v1`、`sparse_grams`、および `bloom_filter` インデックスは、関数の結果が false であることが期待されるクエリの最適化には使用できません。

例えば:

- 最適化できるもの:
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- 最適化できないもの:
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::



## プロジェクション {#projections}

プロジェクションは[マテリアライズドビュー](/sql-reference/statements/create/view)に似ていますが、パートレベルで定義されます。クエリでの自動使用とともに一貫性を保証します。

:::note
プロジェクションを実装する際は、[force_optimize_projection](/operations/settings/settings#force_optimize_projection)設定も考慮してください。
:::

プロジェクションは[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子を使用した`SELECT`文ではサポートされていません。

### プロジェクションクエリ {#projection-query}

プロジェクションクエリはプロジェクションを定義するものです。親テーブルから暗黙的にデータを選択します。
**構文**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

プロジェクションは[ALTER](/sql-reference/statements/alter/projection.md)文で変更または削除できます。

### プロジェクションストレージ {#projection-storage}

プロジェクションはパートディレクトリ内に保存されます。インデックスに似ていますが、匿名の`MergeTree`テーブルのパートを保存するサブディレクトリを含みます。テーブルはプロジェクションの定義クエリによって生成されます。`GROUP BY`句がある場合、基盤となるストレージエンジンは[AggregatingMergeTree](aggregatingmergetree.md)となり、すべての集約関数は`AggregateFunction`に変換されます。`ORDER BY`句がある場合、`MergeTree`テーブルはそれをプライマリキー式として使用します。マージプロセス中、プロジェクションパートはそのストレージのマージルーチンを介してマージされます。親テーブルのパートのチェックサムはプロジェクションのパートと結合されます。その他のメンテナンス作業はスキップインデックスと同様です。

### クエリ解析 {#projection-query-analysis}

1. プロジェクションが指定されたクエリに応答するために使用できるかどうか、つまりベーステーブルへのクエリと同じ結果を生成するかどうかを確認します。
2. 読み取るグラニュールが最も少ない、最適な実行可能な一致を選択します。
3. プロジェクションを使用するクエリパイプラインは、元のパートを使用するものとは異なります。一部のパートでプロジェクションが存在しない場合、その場で「プロジェクト」するパイプラインを追加できます。


## 同時データアクセス {#concurrent-data-access}

テーブルへの同時アクセスには、マルチバージョニングを使用しています。つまり、テーブルの読み取りと更新が同時に行われる場合、データはクエリ実行時点で最新のパーツセットから読み取られます。長時間のロックは発生しません。挿入操作が読み取り操作を妨げることはありません。

テーブルからの読み取りは自動的に並列化されます。


## カラムとテーブルのTTL {#table_engine-mergetree-ttl}

値の有効期間を決定します。

`TTL`句は、テーブル全体および個々のカラムに対して設定できます。テーブルレベルの`TTL`では、ディスクとボリューム間でのデータの自動移動や、すべてのデータが期限切れになったパーツの再圧縮のロジックを指定することもできます。

式は[Date](/sql-reference/data-types/date.md)、[Date32](/sql-reference/data-types/date32.md)、[DateTime](/sql-reference/data-types/datetime.md)、または[DateTime64](/sql-reference/data-types/datetime64.md)データ型として評価される必要があります。

**構文**

カラムの有効期間を設定する:

```sql
TTL time_column
TTL time_column + interval
```

`interval`を定義するには、[時間間隔](/sql-reference/operators#operators-for-working-with-dates-and-times)演算子を使用します。例:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### カラムTTL {#mergetree-column-ttl}

カラム内の値が期限切れになると、ClickHouseはそれらをカラムデータ型のデフォルト値で置き換えます。データパート内のすべてのカラム値が期限切れになった場合、ClickHouseはファイルシステム内のデータパートからこのカラムを削除します。

`TTL`句はキーカラムには使用できません。

**例**

#### `TTL`を使用したテーブルの作成: {#creating-a-table-with-ttl}

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

テーブルには、期限切れ行を削除するための式と、[ディスクまたはボリューム](#table_engine-mergetree-multiple-volumes)間でパーツを自動的に移動するための複数の式を設定できます。テーブル内の行が期限切れになると、ClickHouseは対応するすべての行を削除します。パーツの移動または再圧縮の場合、パーツのすべての行が`TTL`式の条件を満たす必要があります。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTLルールのタイプは各TTL式の後に指定できます。これは、式が満たされた(現在時刻に達した)ときに実行されるアクションを決定します:

- `DELETE` - 期限切れ行を削除する(デフォルトアクション)
- `RECOMPRESS codec_name` - `codec_name`でデータパーツを再圧縮する
- `TO DISK 'aaa'` - パーツをディスク`aaa`に移動する
- `TO VOLUME 'bbb'` - パーツをボリューム`bbb`に移動する
- `GROUP BY` - 期限切れ行を集約する

`DELETE`アクションは`WHERE`句と組み合わせて使用でき、フィルタリング条件に基づいて期限切れ行の一部のみを削除できます:

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY`式は、テーブルのプライマリキーの接頭辞である必要があります。

カラムが`GROUP BY`式の一部ではなく、`SET`句で明示的に設定されていない場合、結果行にはグループ化された行からの任意の値が含まれます(集約関数`any`が適用されたかのように)。

**例**

#### `TTL`を使用したテーブルの作成: {#creating-a-table-with-ttl-1}

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


1ヶ月後に行の有効期限が切れるテーブルを作成します。日付が月曜日である期限切れの行は削除されます:

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

期限切れの行が集約されるテーブルを作成します。結果の行では、`x`はグループ化された行全体の最大値、`y`は最小値、`d`はグループ化された行からの任意の値を含みます。

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

`TTL`が期限切れとなったデータは、ClickHouseがデータパートをマージする際に削除されます。

ClickHouseがデータの期限切れを検出すると、スケジュール外のマージを実行します。このようなマージの頻度を制御するには、`merge_with_ttl_timeout`を設定できます。値が低すぎると、多くのリソースを消費する可能性のあるスケジュール外のマージが頻繁に実行されます。

マージの間に`SELECT`クエリを実行すると、期限切れのデータが取得される可能性があります。これを回避するには、`SELECT`の前に[OPTIMIZE](/sql-reference/statements/optimize.md)クエリを使用してください。

**関連項目**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)設定


## ディスクタイプ {#disk-types}

ローカルブロックデバイスに加えて、ClickHouseは以下のストレージタイプをサポートしています：

- [`s3` S3およびMinIO向け](#table_engine-mergetree-s3)
- [`gcs` GCS向け](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` Azure Blob Storage向け](/operations/storing-data#azure-blob-storage)
- [`hdfs` HDFS向け](/engines/table-engines/integrations/hdfs)
- [`web` Webからの読み取り専用アクセス向け](/operations/storing-data#web-storage)
- [`cache` ローカルキャッシュ向け](/operations/storing-data#using-local-cache)
- [`s3_plain` S3へのバックアップ向け](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` S3上の不変・非レプリケートテーブル向け](/operations/storing-data.md#s3-plain-rewritable-storage)


## データ保存のための複数のブロックデバイスを使用する {#table_engine-mergetree-multiple-volumes}

### はじめに {#introduction}

`MergeTree` ファミリーのテーブルエンジンは、複数のブロックデバイスにデータを格納できます。例えば、あるテーブルのデータが「ホット」と「コールド」に暗黙のうちに分けられる場合に有用です。最近のデータは頻繁にアクセスされますが、必要なストレージ容量は少量です。一方、ファットテールの古い履歴データはアクセス頻度が低いです。複数のディスクが利用可能な場合、「ホット」データは高速ディスク（例: NVMe SSD やメモリ内）に、「コールド」データは比較的低速なディスク（例: HDD）に配置できます。

データパーツは、`MergeTree` エンジンのテーブルにおける最小の移動単位です。一つのパーツに属するデータは一つのディスクに格納されます。データパーツは、バックグラウンドで（ユーザー設定に基づいて）ディスク間で移動でき、また [ALTER](/sql-reference/statements/alter/partition) クエリによっても移動可能です。

### 用語 {#terms}

- Disk — ファイルシステムにマウントされたブロックデバイス。
- Default disk — [path](/operations/server-configuration-parameters/settings.md/#path) サーバー設定で指定されたパスにデータを格納するディスク。
- Volume — 同一のディスクからなる順序付き集合（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) に類似）。
- Storage policy — ボリュームの集合と、それら間でデータを移動するためのルール。

記述されたエンティティの名前は、システムテーブル [system.storage_policies](/operations/system-tables/storage_policies) および [system.disks](/operations/system-tables/disks) で確認できます。構成済みのストレージポリシーのうちの一つをテーブルに適用するには、`MergeTree` エンジンファミリーテーブルの `storage_policy` 設定を使用します。

### 設定 {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、およびストレージポリシーは、`config.d` ディレクトリのファイル内の `<storage_configuration>` タグで宣言します。

:::tip
ディスクはクエリの `SETTINGS` セクションで宣言することも可能です。これは、例えば URL でホストされたディスクを一時的にアタッチするアドホック分析に便利です。
詳細は [dynamic storage](/operations/storing-data#dynamic-configuration) を参照してください。
:::

設定構造:

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

タグ:

- `<disk_name_N>` — ディスク名。すべてのディスクで名前は一意でなければなりません。
- `path` — サーバーがデータを格納するパス（`data` および `shadow` フォルダ）、末尾に '/' を付ける必要があります。
- `keep_free_space_bytes` — 予約する空きディスク容量の量。

ディスクの定義順序は重要ではありません。

ストレージポリシーの設定マークアップ:

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

タグ:


* `policy_name_N` — ポリシー名。ポリシー名は一意でなければなりません。
* `volume_name_N` — ボリューム名。ボリューム名は一意でなければなりません。
* `disk` — ボリューム内のディスク。
* `max_data_part_size_bytes` — そのボリューム内のいずれのディスク上にも保存できるパーツの最大サイズ。マージ後のパーツサイズが `max_data_part_size_bytes` より大きくなると見積もられた場合、そのパーツは次のボリュームに書き込まれます。基本的にこの機能により、新しい/小さいパーツをホット（SSD）ボリュームに保持し、大きなサイズに達したときにコールド（HDD）ボリュームへ移動できます。ポリシーにボリュームが 1 つしかない場合は、この設定を使用しないでください。
* `move_factor` — 利用可能な空き容量がこの係数より小さくなったとき、自動的にデータを次のボリューム（存在する場合）へ移動し始めます（デフォルトは 0.1）。ClickHouse は既存のパーツをサイズ順に大きいものから小さいものへ（降順で）ソートし、`move_factor` 条件を満たすのに十分な合計サイズとなるようにパーツを選択します。全パーツの合計サイズが不十分な場合は、すべてのパーツが移動されます。
* `perform_ttl_move_on_insert` — データパーツ INSERT 時の TTL による移動を無効にします。デフォルト（有効な場合）では、TTL move ルールですでに期限切れとなっているデータパーツを挿入すると、直ちに移動ルールで指定されたボリューム/ディスクへ移動されます。宛先のボリューム/ディスクが低速（例：S3 のようなリモートストレージ）の場合、これは INSERT を大幅に遅くする可能性があります。無効にした場合、すでに期限切れのデータパーツはいったんデフォルトボリュームに書き込まれ、その直後に TTL ボリュームへ移動されます。
* `load_balancing` - ディスクバランシングのポリシー。`round_robin` または `least_used`。
* `least_used_ttl_ms` - すべてのディスクの利用可能な空き容量を更新するためのタイムアウト（ミリ秒単位）を設定します（`0` - 常に更新、`-1` - 決して更新しない、デフォルトは `60000`）。なお、そのディスクが ClickHouse のみで使用され、オンラインでのファイルシステムのサイズ変更（拡張/縮小）の対象とならない場合は `-1` を使用できます。それ以外のケースでは推奨されません。時間の経過とともに空き容量の把握が不正確になり、容量分布が偏る原因となるためです。
* `prefer_not_to_merge` — この設定は使用しないでください。このボリューム上のデータパーツのマージを無効にします（有害であり、パフォーマンス低下を招きます）。この設定が有効な場合（有効にしないでください）、このボリューム上でのマージは許可されません（これは望ましくありません）。これにより（ただし、その必要はありません）、ClickHouse が低速ディスクをどのように扱うかを制御できますが（何かを制御したくなる時点で誤りです）、ClickHouse の方が適切に扱うため、この設定は使用しないでください。
* `volume_priority` — ボリュームがどの優先度（順序）で埋められるかを定義します。値が小さいほど優先度が高くなります。パラメータ値は自然数でなければならず、1 から N（与えられた中で最も低い優先度）までの範囲を欠番なしで網羅する必要があります。
  * *すべての* ボリュームがタグ付けされている場合、それらは指定された順序で優先されます。
  * 一部のボリュームのみがタグ付けされている場合、タグのないボリュームは最も優先度が低く、設定ファイル内で定義された順序で優先されます。
  * *一つも* ボリュームがタグ付けされていない場合、その優先度は設定ファイル内で宣言された順序に対応して設定されます。
  * 2 つのボリュームが同じ優先度値を持つことはできません。

Configuration examples:

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


この例では、`hdd_in_order` ポリシーは [ラウンドロビン](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方式を実装しています。このポリシーは1つのボリューム（`single`）のみを定義し、データパーツはすべてのディスクに循環順序で格納されます。このようなポリシーは、複数の類似したディスクがシステムにマウントされているが RAID が構成されていない場合に非常に有用です。個々のディスクドライブは信頼性が高くないため、レプリケーション係数を3以上にして補う必要があることに留意してください。

システムに異なる種類のディスクが利用可能な場合は、代わりに `moving_from_ssd_to_hdd` ポリシーを使用できます。ボリューム `hot` は SSD ディスク（`fast_ssd`）で構成され、このボリュームに格納できるパーツの最大サイズは 1GB です。1GB より大きいサイズのパーツはすべて、HDD ディスク `disk1` を含む `cold` ボリュームに直接格納されます。
また、ディスク `fast_ssd` が 80% 以上満たされると、バックグラウンドプロセスによってデータが `disk1` に転送されます。

ストレージポリシー内のボリューム列挙の順序は、リストされたボリュームの少なくとも1つに明示的な `volume_priority` パラメータがない場合に重要です。
ボリュームが満杯になると、データは次のボリュームに移動されます。ディスク列挙の順序も重要です。なぜなら、データは順番にディスクに格納されるためです。

テーブルを作成する際、構成されたストレージポリシーの1つを適用できます：

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

`default` ストレージポリシーは、`<path>` で指定された1つのディスクのみで構成される1つのボリュームのみを使用することを意味します。
テーブル作成後に [ALTER TABLE ... MODIFY SETTING] クエリでストレージポリシーを変更できますが、新しいポリシーには同じ名前のすべての古いディスクとボリュームを含める必要があります。

データパーツのバックグラウンド移動を実行するスレッド数は、[background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 設定で変更できます。

### 詳細 {#details}

`MergeTree` テーブルの場合、データは以下のさまざまな方法でディスクに書き込まれます：

- 挿入の結果として（`INSERT` クエリ）。
- バックグラウンドマージおよび [ミューテーション](/sql-reference/statements/alter#mutations) 中。
- 別のレプリカからダウンロードする際。
- パーティションフリーズの結果として [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

ミューテーションとパーティションフリーズを除くこれらすべてのケースにおいて、パーツは指定されたストレージポリシーに従ってボリュームとディスクに格納されます：

1.  パーツを格納するのに十分なディスク容量（`unreserved_space > current_part_size`）があり、指定されたサイズのパーツの格納を許可する（`max_data_part_size_bytes > current_part_size`）最初のボリューム（定義順）が選択されます。
2.  このボリューム内で、前のデータチャンクの格納に使用されたディスクの次のディスクであり、パーツサイズより大きい空き容量（`unreserved_space - keep_free_space_bytes > current_part_size`）を持つディスクが選択されます。

内部的には、ミューテーションとパーティションフリーズは [ハードリンク](https://en.wikipedia.org/wiki/Hard_link) を使用します。異なるディスク間のハードリンクはサポートされていないため、このような場合、結果のパーツは初期のパーツと同じディスクに格納されます。

バックグラウンドでは、構成ファイルでボリュームが宣言された順序に従って、空き容量（`move_factor` パラメータ）に基づいてパーツがボリューム間で移動されます。
データは最後のボリュームから最初のボリュームに転送されることはありません。バックグラウンド移動を監視するには、システムテーブル [system.part_log](/operations/system-tables/part_log)（フィールド `type = MOVE_PART`）および [system.parts](/operations/system-tables/parts.md)（フィールド `path` および `disk`）を使用できます。また、詳細情報はサーバーログで確認できます。

ユーザーは、クエリ [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition) を使用して、パーツまたはパーティションをあるボリュームから別のボリュームに強制的に移動できます。バックグラウンド操作のすべての制限が考慮されます。このクエリは独自に移動を開始し、バックグラウンド操作の完了を待ちません。十分な空き容量がない場合、または必要な条件のいずれかが満たされていない場合、ユーザーはエラーメッセージを受け取ります。

データの移動はデータレプリケーションに干渉しません。したがって、異なるレプリカ上の同じテーブルに対して異なるストレージポリシーを指定できます。


バックグラウンドで実行されるマージおよびミューテーションが完了した後、古いパーツは、一定時間（`old_parts_lifetime`）が経過してから削除されます。
この間、それらは他のボリュームやディスクに移動されません。したがって、パーツが最終的に削除されるまでは、ディスク使用量の算出に引き続き含まれます。

ユーザーは、[min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) 設定を使用することで、新しい大きなパーツを [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) ボリューム内の複数ディスクにバランス良く割り当てることができます。



## 外部ストレージを使用したデータ保存 {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブルエンジンは、`s3`、`azure_blob_storage`、`hdfs`のディスクタイプを使用して、それぞれ`S3`、`AzureBlobStorage`、`HDFS`にデータを保存できます。詳細については、[外部ストレージオプションの設定](/operations/storing-data.md/#configuring-external-storage)を参照してください。

`s3`タイプのディスクを使用した外部ストレージとしての[S3](https://aws.amazon.com/s3/)の例を以下に示します。

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

[外部ストレージオプションの設定](/operations/storing-data.md/#configuring-external-storage)も参照してください。

:::note キャッシュ設定
ClickHouseバージョン22.3から22.7では異なるキャッシュ設定を使用します。これらのバージョンを使用している場合は、[ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を参照してください。
:::


## 仮想カラム {#virtual-columns}

- `_part` — パートの名前。
- `_part_index` — クエリ結果内のパートの連番インデックス。
- `_part_starting_offset` — クエリ結果内のパートの累積開始行。
- `_part_offset` — パート内の行番号。
- `_part_granule_offset` — パート内のグラニュール番号。
- `_partition_id` — パーティションの名前。
- `_part_uuid` — 一意のパート識別子(MergeTree設定`assign_part_uuids`が有効な場合)。
- `_part_data_version` — パートのデータバージョン(最小ブロック番号またはミューテーションバージョンのいずれか)。
- `_partition_value` — `partition by`式の値(タプル)。
- `_sample_factor` — サンプリング係数(クエリより)。
- `_block_number` — 挿入時に割り当てられた行の元のブロック番号。設定`enable_block_number_column`が有効な場合、マージ時に保持される。
- `_block_offset` — 挿入時に割り当てられたブロック内の元の行番号。設定`enable_block_offset_column`が有効な場合、マージ時に保持される。
- `_disk_name` — ストレージに使用されるディスク名。


## カラム統計 {#column-statistics}

<ExperimentalBadge />
<CloudNotSupportedBadge />

統計の宣言は、`set allow_experimental_statistics = 1`を有効にした場合、`*MergeTree*`ファミリーのテーブルに対する`CREATE`クエリのカラムセクションに記述します。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

`ALTER`文を使用して統計を操作することもできます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量な統計は、カラム内の値の分布に関する情報を集約します。統計は各パートに保存され、挿入が行われるたびに更新されます。
統計は、`set allow_statistics_optimize = 1`を有効にした場合にのみ、prewhere最適化に使用できます。

### 利用可能なカラム統計のタイプ {#available-types-of-column-statistics}

- `MinMax`

  数値カラムに対する範囲フィルタの選択性を推定するための、カラムの最小値と最大値です。

  構文: `minmax`

- `TDigest`

  数値カラムに対して近似パーセンタイル(例: 90パーセンタイル)を計算できる[TDigest](https://github.com/tdunning/t-digest)スケッチです。

  構文: `tdigest`

- `Uniq`

  カラムに含まれる個別値の数を推定する[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)スケッチです。

  構文: `uniq`

- `CountMin`

  カラム内の各値の出現頻度の近似カウントを提供する[CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch)スケッチです。

  構文: `countmin`

### サポートされるデータ型 {#supported-data-types}

|          | (U)Int*, Float*, Decimal(_), Date_, Boolean, Enum\* | String or FixedString |
| -------- | --------------------------------------------------- | --------------------- |
| CountMin | ✔                                                  | ✔                    |
| MinMax   | ✔                                                  | ✗                     |
| TDigest  | ✔                                                  | ✗                     |
| Uniq     | ✔                                                  | ✔                    |

### サポートされる操作 {#supported-operations}

|          | 等価フィルタ (==) | 範囲フィルタ (`>, >=, <, <=`) |
| -------- | --------------------- | ------------------------------ |
| CountMin | ✔                    | ✗                              |
| MinMax   | ✗                     | ✔                             |
| TDigest  | ✗                     | ✔                             |
| Uniq     | ✔                    | ✗                              |


## カラムレベルの設定 {#column-level-settings}

特定のMergeTree設定はカラムレベルで上書きできます:

- `max_compress_block_size` — テーブルへの書き込み時に圧縮する前の非圧縮データブロックの最大サイズ。
- `min_compress_block_size` — 次のマークを書き込む際に圧縮に必要な非圧縮データブロックの最小サイズ。

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

カラムレベルの設定は[ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md)を使用して変更または削除できます。例:

- カラム宣言から`SETTINGS`を削除する:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 設定を変更する:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 1つ以上の設定をリセットする。これによりテーブルのCREATEクエリのカラム式における設定宣言も削除されます。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
