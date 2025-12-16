---
description: '`MergeTree` ファミリーのテーブルエンジンは、高速なデータ取り込みと膨大なデータ量に対応するよう設計されています。'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergettree
title: 'MergeTree テーブルエンジン'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree テーブルエンジン {#mergetree-table-engine}

`MergeTree` エンジンおよび `MergeTree` ファミリーの他のエンジン（例: `ReplacingMergeTree`、`AggregatingMergeTree`）は、ClickHouse で最も一般的に使用され、最も堅牢なテーブルエンジンです。

`MergeTree` ファミリーのテーブルエンジンは、高いデータ取り込みレートと巨大なデータ量を扱えるように設計されています。
`INSERT` 操作によりテーブルパーツが作成され、バックグラウンドプロセスによって他のテーブルパーツとマージされます。

`MergeTree` ファミリーのテーブルエンジンの主な特徴は次のとおりです。

* テーブルの主キーは、各テーブルパーツ内でのソート順（クラスタ化インデックス）を決定します。主キーは個々の行ではなく、グラニュールと呼ばれる 8192 行のブロックを参照します。これにより、巨大なデータセットに対しても主キーをメインメモリに常駐できる程度の小ささに保ちながら、ディスク上のデータへ高速にアクセスできます。

* テーブルは任意のパーティション式でパーティション分割できます。パーティションプルーニングにより、クエリ条件に応じて読み取り対象からパーティションを除外できます。

* 可用性の向上、フェイルオーバー、およびゼロダウンタイムでのアップグレードのために、データを複数のクラスタノード間でレプリケートできます。詳しくは [Data replication](/engines/table-engines/mergetree-family/replication.md) を参照してください。

* `MergeTree` テーブルエンジンは、クエリ最適化に役立つさまざまな種類の統計情報とサンプリング手法をサポートします。

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

パラメータの詳細については、[CREATE TABLE](/sql-reference/statements/create/table.md) ステートメントを参照してください。

### クエリ構文 {#mergetree-query-clauses}

#### ENGINE {#engine}

`ENGINE` — エンジンの名前とパラメータを指定します。`ENGINE = MergeTree()`。`MergeTree` エンジンにはパラメータがありません。

#### ORDER BY {#order&#95;by}

`ORDER BY` — ソートキーです。

カラム名または任意の式のタプルを指定します。例: `ORDER BY (CounterID + 1, EventDate)`。

`PRIMARY KEY` が定義されていない場合（つまり `PRIMARY KEY` が指定されていない場合）、ClickHouse はそのソートキーをプライマリキーとして使用します。

ソートが不要な場合は、`ORDER BY tuple()` 構文を使用できます。
また、設定 `create_table_empty_primary_key_by_default` が有効な場合、`ORDER BY ()` が `CREATE TABLE` 文に暗黙的に追加されます。[プライマリキーの選択](#selecting-a-primary-key) を参照してください。

#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。省略可能です。ほとんどの場合、パーティションキーは不要であり、パーティション分割が必要な場合でも、通常は月単位より細かい粒度のパーティションキーは必要ありません。パーティション分割は（ORDER BY 式とは対照的に）クエリを高速化しません。パーティションは決して細かくしすぎないでください。データをクライアント識別子や名前でパーティション分割しないでください（その代わりに、クライアント識別子または名前を ORDER BY 式の先頭のカラムにしてください）。

月単位でパーティション分割するには、`toYYYYMM(date_column)` 式を使用します。ここで、`date_column` は [Date](/sql-reference/data-types/date.md) 型の日付を保持するカラムです。この場合のパーティション名は `"YYYYMM"` 形式になります。

#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — [ソートキーと異なる場合](#choosing-a-primary-key-that-differs-from-the-sorting-key)に指定するプライマリキーです。省略可能です。

ソートキー（`ORDER BY` 句）を指定すると、暗黙的にプライマリキーも指定されます。
通常、ソートキーとは別にプライマリキーを指定する必要はありません。

#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング用の式です。省略可能です。

指定する場合は、主キーに含まれている必要があります。
サンプリング式は符号なし整数値を返さなければなりません。

例: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.

#### TTL {#ttl}

`TTL` — 行の保存期間と、[ディスクおよびボリューム間](#table_engine-mergetree-multiple-volumes)の自動的なパーツ移動ロジックを指定するルールのリストです。省略可能です。

式は `Date` または `DateTime` 型の値を返す必要があります。例: `TTL date + INTERVAL 1 DAY`。

ルール種別 `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` は、式が満たされた（現在時刻に達した）ときにそのパーツに対して実行されるアクションを指定します。具体的には、有効期限切れの行の削除、パーツ内のすべての行に対して式が満たされている場合にそのパーツを指定したディスク（`TO DISK 'xxx'`）またはボリューム（`TO VOLUME 'xxx'`）へ移動すること、あるいは有効期限切れの行の値を集約することです。ルールのデフォルト種別は削除（`DELETE`）です。複数のルールを指定できますが、`DELETE` ルールは 1 つまでにする必要があります。

詳細については、[カラムおよびテーブルの TTL](#table_engine-mergetree-ttl) を参照してください。

#### 設定 {#settings}

[MergeTree Settings](../../../operations/settings/merge-tree-settings.md) を参照してください。

**Sections 設定の例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

この例では、パーティションを月単位で設定しています。

また、ユーザー ID をハッシュ化したものをサンプリング用の式として設定しています。これにより、テーブル内のデータを各 `CounterID` と `EventDate` ごとに擬似乱数的に分散させることができます。データを選択する際に [SAMPLE](/sql-reference/statements/select/sample) 句を指定すると、ClickHouse はユーザーのサブセットに対して偏りの少ない擬似乱数サンプルデータを返します。

`index_granularity` 設定は省略できます。デフォルト値が 8192 のためです。

<details markdown="1">
  <summary>テーブル作成の非推奨メソッド</summary>

  :::note
  新しいプロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトも上記で説明した方法に切り替えてください。
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

  * `date-column` — [Date](/sql-reference/data-types/date.md) 型のカラム名。ClickHouse はこのカラムに基づいて自動的に月ごとのパーティションを作成します。パーティション名は `"YYYYMM"` 形式になります。
  * `sampling_expression` — サンプリング用の式。
  * `(primary, key)` — 主キー。型: [Tuple()](/sql-reference/data-types/tuple.md)
  * `index_granularity` — インデックスの粒度。インデックスの「マーク」間のデータ行数。8192 という値はほとんどのユースケースに適しています。

  **例**

  ```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

  `MergeTree` エンジンは、メインのエンジン構成方法について上記の例と同様に設定されます。
</details>

## データストレージ {#mergetree-data-storage}

テーブルは、主キーでソートされたデータパーツから構成されます。

テーブルにデータが挿入されると、個別のデータパーツが作成され、それぞれが主キーに従って辞書順でソートされます。たとえば、主キーが `(CounterID, Date)` の場合、そのパーツ内のデータはまず `CounterID` でソートされ、各 `CounterID` の範囲内では `Date` の順に並びます。

異なるパーティションに属するデータは、異なるパーツに分離されます。バックグラウンドで ClickHouse は、より効率的に保存できるようにデータパーツをマージします。異なるパーティションに属するパーツはマージされません。マージの仕組みは、同じ主キーを持つすべての行が同じデータパーツ内に配置されることを保証しません。

データパーツは `Wide` または `Compact` フォーマットで保存できます。`Wide` フォーマットでは各カラムがファイルシステム上の別々のファイルに保存され、`Compact` フォーマットではすべてのカラムが 1 つのファイルに保存されます。`Compact` フォーマットは、小さなデータの頻繁な挿入時のパフォーマンス向上に利用できます。

データの保存形式は、テーブルエンジンの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。データパーツ内のバイト数または行数が対応する設定値より小さい場合、そのパーツは `Compact` フォーマットで保存されます。そうでない場合は `Wide` フォーマットで保存されます。これらの設定がどちらも指定されていない場合、データパーツは `Wide` フォーマットで保存されます。

各データパーツは論理的にグラニュールに分割されます。グラニュールは、ClickHouse がデータを選択する際に読み取る最小の不可分なデータ集合です。ClickHouse は行や値を分割しないため、各グラニュールは常に整数個の行を含みます。グラニュールの先頭行には、その行の主キーの値によってマークが付けられます。各データパーツごとに、ClickHouse はこれらのマークを保存するインデックスファイルを作成します。各カラムに対して、主キーに含まれるかどうかに関わらず、ClickHouse は同じマークも保存します。これらのマークによって、カラムファイル内のデータを直接特定できます。

グラニュールサイズは、テーブルエンジンの `index_granularity` および `index_granularity_bytes` 設定によって制限されます。グラニュール内の行数は、行のサイズに応じて `[1, index_granularity]` の範囲になります。単一行のサイズが設定値より大きい場合、グラニュールのサイズは `index_granularity_bytes` を超えることがあります。この場合、グラニュールのサイズはその行のサイズと等しくなります。

## クエリにおける主キーとインデックス {#primary-keys-and-indexes-in-queries}

例として、主キー `(CounterID, Date)` を取り上げます。この場合、並び順とインデックスは次のように示されます。

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

データクエリが次のように指定されている場合:

* `CounterID in ('a', 'h')` の場合、サーバーはマーク範囲 `[0, 3)` および `[6, 8)` のデータを読み込みます。
* `CounterID IN ('a', 'h') AND Date = 3` の場合、サーバーはマーク範囲 `[1, 3)` および `[7, 8)` のデータを読み込みます。
* `Date = 3` の場合、サーバーはマーク範囲 `[1, 10]` のデータを読み込みます。

上記の例から、常にフルスキャンよりもインデックスを使用する方が効率的であることがわかります。

疎なインデックスでは、追加のデータが読み込まれることがあります。主キーの単一の範囲を読み込む場合、各データブロックで最大 `index_granularity * 2` 行まで余分な行が読み込まれる可能性があります。

疎なインデックスを使用すると、非常に多くのテーブル行を扱うことができます。ほとんどの場合、このようなインデックスはコンピュータの RAM に収まるためです。

ClickHouse では、一意なプライマリキーは不要です。同じプライマリキーを持つ複数の行を挿入できます。

`PRIMARY KEY` および `ORDER BY` 句では `Nullable` 型の式を使用できますが、これは強く非推奨です。この機能を許可するには、[allow&#95;nullable&#95;key](/operations/settings/merge-tree-settings/#allow_nullable_key) 設定を有効にします。`ORDER BY` 句での `NULL` 値には、[NULLS&#95;LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) の原則が適用されます。

### 主キーの選択 {#selecting-a-primary-key}

主キーに含める列数には明確な制限はありません。データ構造に応じて、主キーに含める列を増やしたり減らしたりできます。これにより次の効果が得られる可能性があります。

* インデックスのパフォーマンスが向上する。

  主キーが `(a, b)` の場合に、さらに列 `c` を追加すると、次の条件が満たされるときにパフォーマンスが向上します。

  * 列 `c` に条件を持つクエリが存在する。
  * `(a, b)` の値が同一である長いデータ範囲（`index_granularity` の数倍の長さ）がよく現れる。言い換えると、列を追加することで、かなり長いデータ範囲をスキップできる場合です。

* データ圧縮が向上する。

  ClickHouse はデータを主キーでソートして保存するため、データの並びの一貫性が高いほど圧縮率が向上します。

* [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) および [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) エンジンでデータパーツをマージする際に、追加のロジックを提供できる。

  この場合、主キーとは異なる *sorting key* を指定することが有効です。

長い主キーは挿入パフォーマンスやメモリ消費に悪影響を及ぼしますが、主キーに余分な列があっても、`SELECT` クエリ時の ClickHouse のパフォーマンスには影響しません。

`ORDER BY tuple()` 構文を使うことで、主キーなしのテーブルを作成できます。この場合、ClickHouse はデータを挿入順に保存します。`INSERT ... SELECT` クエリで挿入時のデータ順序を保持したい場合は、[max&#95;insert&#95;threads = 1](/operations/settings/settings#max_insert_threads) を設定してください。

挿入時の順序でデータを取得するには、[single-threaded](/operations/settings/settings.md/#max_threads) な `SELECT` クエリを使用します。

### 並べ替えキーと異なる主キーを選択する {#choosing-a-primary-key-that-differs-from-the-sorting-key}

主キー（各マークごとのインデックスファイルに書き込まれる値を持つ式）は、並べ替えキー（データパーツ内の行を並べ替えるための式）とは異なるものを指定できます。この場合、主キーの式タプルは、並べ替えキーの式タプルのプレフィックスでなければなりません。

この機能は [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) および
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジンを使用する際に有用です。これらのエンジンを利用する一般的なケースでは、テーブルには 2 種類のカラム、つまり *dimensions* と *measures* があります。典型的なクエリでは、任意の `GROUP BY` を用いて measure カラムの値を集約し、dimensions でフィルタリングします。SummingMergeTree と AggregatingMergeTree は並べ替えキーの値が同一の行を集約するため、すべての dimensions を並べ替えキーに含めるのが自然です。その結果、キー式は多数のカラムから成る長いリストとなり、新たな dimensions を追加するたびにこのリストを頻繁に更新しなければなりません。

このような場合、効率的なレンジスキャンを行うために必要な少数のカラムだけを主キーに残し、残りの dimension カラムを並べ替えキーのタプルに追加するのが理にかなっています。

並べ替えキーの [ALTER](/sql-reference/statements/alter/index.md) は軽量な操作です。新しいカラムがテーブルおよび並べ替えキーに同時に追加される場合、既存のデータパーツを変更する必要がないためです。古い並べ替えキーが新しい並べ替えキーのプレフィックスであり、新しく追加されたカラムにはデータが存在しないので、テーブルを変更した時点では、データは古い並べ替えキーと新しい並べ替えキーの両方に従って並べ替えられていることになります。

### クエリにおけるインデックスとパーティションの利用 {#use-of-indexes-and-partitions-in-queries}

`SELECT` クエリに対して、ClickHouse はインデックスを利用できるかどうかを解析して判断します。`WHERE/PREWHERE` 句に、等価比較または不等価比較の演算（連言要素の 1 つ、もしくは式全体）を表す式が含まれている場合、あるいは、プライマリキーまたはパーティションキーに含まれる列や式、それらの列に対する特定の部分的に反復的な関数、さらにそれらの式同士の論理関係に対して、固定プレフィックスを伴う `IN` または `LIKE` が含まれている場合、インデックスを使用できます。

そのため、プライマリキーの 1 つまたは複数の範囲に対してクエリを高速に実行できます。この例では、特定のトラッキングタグ、特定のタグと日付範囲、特定のタグと特定の日付、複数のタグと日付範囲などに対するクエリは高速に実行されます。

次のように設定されたエンジンを見てみましょう。

```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

この場合、クエリは次のようになります。

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

ClickHouse は、プライマリキーインデックスを使用して不要なデータをスキップし、月単位のパーティショニングキーを使用して対象外の日付範囲にあるパーティションをスキップします。

上記のクエリは、複雑な式に対してもインデックスが使用されることを示しています。テーブルからの読み取り処理は、インデックスを使用してもフルスキャンより遅くならないように設計されています。

次の例では、インデックスを利用できません。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリ実行時に ClickHouse がインデックスを利用できるかどうかを確認するには、設定 [force&#95;index&#95;by&#95;date](/operations/settings/settings.md/#force_index_by_date) と [force&#95;primary&#95;key](/operations/settings/settings#force_primary_key) を使用します。

月単位のパーティションキーは、指定した範囲に含まれる日付を持つデータブロックだけを読み取れるようにします。この場合、データブロックには多数の日付（最大で 1 か月分）に対応するデータが含まれている可能性があります。ブロック内ではデータは主キーでソートされていますが、主キーの先頭のカラムとして日付が含まれていない場合があります。そのため、主キーのプレフィックスを指定せずに日付条件のみを含むクエリを使用すると、単一の日付だけを対象とする場合よりも多くのデータを読み取ることになります。

### 部分的に単調な主キーに対するインデックスの利用 {#use-of-index-for-partially-monotonic-primary-keys}

例として、月の日付を考えてみます。1 か月の中では [単調な数列](https://en.wikipedia.org/wiki/Monotonic_function) を形成しますが、より長い期間では単調ではありません。これは部分的に単調な数列です。ユーザーが部分的に単調な主キーでテーブルを作成した場合、ClickHouse は通常どおりスパースインデックスを作成します。ユーザーがこの種のテーブルからデータを `SELECT` する際、ClickHouse はクエリ条件を解析します。ユーザーがインデックスの 2 つのマークの間のデータを取得しようとしており、その両方のマークが同じ 1 か月の範囲内に収まる場合、ClickHouse はこの特定のケースではインデックスを利用できます。これは、クエリパラメータとインデックスマークとの距離を計算できるためです。

クエリのパラメータ範囲内に含まれる主キーの値が単調な数列を表さない場合、ClickHouse はインデックスを利用できません。この場合、ClickHouse はフルスキャンを行います。

ClickHouse は、このロジックを月の日付の数列に対してだけでなく、部分的に単調な数列を表すあらゆる主キーに対しても適用します。

### データスキップインデックス {#table_engine-mergetree-data_skipping-indexes}

インデックスの宣言は、`CREATE` クエリのカラム定義セクション内に記述します。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree` ファミリーのテーブルでは、データスキップインデックスを指定できます。

これらのインデックスは、ブロック上で指定された式に関する情報の一部を集約します。ブロックは `granularity_value` 個のグラニュールから構成されます（グラニュールのサイズはテーブルエンジンの `index_granularity` 設定で指定します）。その後、これらの集約値は `SELECT` クエリの実行時に使用され、`WHERE` 句の条件を満たし得ない大きなデータブロックをスキップすることで、ディスクから読み取るデータ量を削減します。

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

サンプルで定義したインデックスは、以下のクエリにおいて ClickHouse がディスクから読み取るデータ量を削減するために利用されます。

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキッピングインデックスは複合カラムに対しても作成できます：

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

### スキップインデックスの種類 {#skip-index-types}

`MergeTree` テーブルエンジンは、次の種類のスキップインデックスをサポートします。
スキップインデックスをパフォーマンス最適化にどのように利用できるかについては、
["ClickHouse のデータスキッピングインデックスを理解する"](/optimize/skipping-indexes) を参照してください。

* [`MinMax`](#minmax) インデックス
* [`Set`](#set) インデックス
* [`bloom_filter`](#bloom-filter) インデックス
* [`ngrambf_v1`](#n-gram-bloom-filter) インデックス
* [`tokenbf_v1`](#token-bloom-filter) インデックス

#### MinMax スキップインデックス {#minmax}

各インデックスグラニュールごとに、式の最小値と最大値が格納されます。
（式の型が `tuple` の場合は、各タプル要素ごとに最小値と最大値が格納されます。）

```text title="Syntax"
minmax
```

#### Set {#set}

各インデックスグラニュールごとに、指定された式のユニークな値が最大 `max_rows` 個まで保存されます。
`max_rows = 0` の場合は「すべてのユニークな値を保存する」ことを意味します。

```text title="Syntax"
set(max_rows)
```

#### ブルームフィルタ {#bloom-filter}

各インデックスグラニュールは、指定されたカラムに対して [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) を保持します。

```text title="Syntax"
bloom_filter([false_positive_rate])
```

`false_positive_rate` パラメータには 0 から 1 の値を指定できます（既定値: `0.025`）。このパラメータは、偽陽性が発生する確率（これにより読み取られるデータ量が増加します）を指定します。

次のデータ型がサポートされています。

* `(U)Int*`
* `Float*`
* `Enum`
* `Date`
* `DateTime`
* `String`
* `FixedString`
* `Array`
* `LowCardinality`
* `Nullable`
* `UUID`
* `Map`

:::note Map データ型: キーまたは値に対するインデックス作成の指定
`Map` データ型では、クライアントは [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) または [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues) 関数を使用して、キーに対してインデックスを作成するか、値に対してインデックスを作成するかを指定できます。
:::

#### N-gram ブルームフィルタ {#n-gram-bloom-filter}

各インデックスグラニュールには、指定された列の [n-gram](https://en.wikipedia.org/wiki/N-gram) に対する [bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) が格納されます。

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| Parameter                       | Description                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `n`                             | n-gram のサイズ                                                                      |
| `size_of_bloom_filter_in_bytes` | Bloom フィルタのサイズ（バイト単位）。ここには `256` や `512` などの大きな値を指定できます。Bloom フィルタは高い圧縮率で格納できます。 |
| `number_of_hash_functions`      | Bloom フィルタで使用されるハッシュ関数の数。                                                        |
| `random_seed`                   | Bloom フィルタのハッシュ関数に使用するシード値。                                                      |

このインデックスが利用できるデータ型は次のとおりです。

* [`String`](/sql-reference/data-types/string.md)
* [`FixedString`](/sql-reference/data-types/fixedstring.md)
* [`Map`](/sql-reference/data-types/map.md)

`ngrambf_v1` のパラメータを見積もるには、次の [ユーザー定義関数 (UDF)](/sql-reference/statements/create/function.md) を使用できます。

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

これらの関数を使用するには、少なくとも次の 2 つのパラメータを指定する必要があります。

* `total_number_of_all_grams`
* `probability_of_false_positives`

たとえば、あるグラニュールに `4300` 個の N-gram があり、偽陽性の確率を `0.0001` 未満にしたいとします。
この場合、他のパラメータは次のクエリを実行することで推定できます。

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

もちろん、これらの関数は他の条件のパラメータを見積もるためにも使用できます。
上記の関数は、ブルームフィルター計算ツール[こちら](https://hur.st/bloomfilter)を参照しています。

#### トークンブルームフィルター {#token-bloom-filter}

トークンブルームフィルターは `ngrambf_v1` と同様ですが、n-gram ではなく、英数字以外の文字で区切られたトークン（文字列のまとまり）を保存します。

```text title="Syntax"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

#### スパースグラム Bloom フィルター {#sparse-grams-bloom-filter}

スパースグラム Bloom フィルターは `ngrambf_v1` と似ていますが、n-gram の代わりに [スパースグラムトークン](/sql-reference/functions/string-functions.md/#sparseGrams) を使用します。

```text title="Syntax"
sparse_grams(min_ngram_length, max_ngram_length, min_cutoff_length, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

### テキストインデックス {#text}

全文検索をサポートします。詳細は[こちら](invertedindexes.md)を参照してください。

#### ベクトル類似性 {#vector-similarity}

近似最近傍検索をサポートしています。詳細は[こちら](annindexes.md)をご覧ください。

### 関数のサポート {#functions-support}

`WHERE` 句の条件式には、カラムを操作する関数呼び出しが含まれます。カラムがインデックスの一部である場合、ClickHouse は関数を評価する際にそのインデックスを利用しようとします。ClickHouse では、インデックスで利用できる関数のサブセットがインデックスタイプごとに異なります。

`set` 型のインデックスは、あらゆる関数で利用できます。その他のインデックスタイプは次のようにサポートされます。

| 関数（演算子）/ 索引                                                                                                               | 主キー | minmax | ngrambf&#95;v1 | tokenbf&#95;v1 | bloom&#95;filter | sparse&#95;grams | テキスト |
| ------------------------------------------------------------------------------------------------------------------------- | --- | ------ | -------------- | -------------- | ---------------- | ---------------- | ---- |
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                | ✔   | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                    | ✔   | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                         | ✔   | ✔      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                   | ✔   | ✔      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                       | ✗   | ✗      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                    | ✔   | ✔      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                        | ✗   | ✗      | ✔              | ✔              | ✗                | ✔                | ✔    |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗   | ✗      | ✔              | ✗              | ✗                | ✗                | ✗    |
| [in](/sql-reference/functions/in-functions)                                                                               | ✔   | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [notIn](/sql-reference/functions/in-functions)                                                                            | ✔   | ✔      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [less（`<`）](/sql-reference/functions/comparison-functions.md/#less)                                                       | ✔   | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [greater（`>`）](/sql-reference/functions/comparison-functions.md/#greater)                                                 | ✔   | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [以下 (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                               | ✔   | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                               | ✔   | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔   | ✔      | ✗              | ✗              | ✗                | ✗                | ✗    |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✗   | ✔      | ✗              | ✗              | ✗                | ✔                | ✗    |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✗   | ✗      | ✔              | ✔              | ✔                | ✔                | ✔    |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗   | ✗      | ✔              | ✔              | ✔                | ✔                | ✗    |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗   | ✗      | ✔              | ✔              | ✔                | ✔                | ✗    |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗   | ✗      | ✗              | ✔              | ✗                | ✗                | ✔    |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                     | ✗   | ✗      | ✗              | ✔              | ✗                | ✗                | ✔    |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)             | ✗   | ✗      | ✗              | ✔              | ✗                | ✗                | ✗    |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗   | ✗      | ✗              | ✔              | ✗                | ✗                | ✗    |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                         | ✗   | ✗      | ✗              | ✗              | ✗                | ✗                | ✔    |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                         | ✗   | ✗      | ✗              | ✗              | ✗                | ✗                | ✔    |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                   | ✗   | ✗      | ✗              | ✗              | ✗                | ✗                | ✔    |

`ngrambf_v1` によるクエリ最適化では、定数引数の値が ngram サイズより小さい関数は使用できません。

(*) `hasTokenCaseInsensitive` および `hasTokenCaseInsensitiveOrNull` を効果的に機能させるには、`tokenbf_v1` インデックスを小文字化されたデータ上に作成する必要があります。たとえば `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)` のように指定します。

:::note
Bloom filter では偽陽性が発生し得るため、`ngrambf_v1`、`tokenbf_v1`、`sparse_grams`、`bloom_filter` 各インデックスは、関数の結果が false になることを前提としてクエリを最適化する目的には使用できません。

例:

* 最適化可能:
  * `s LIKE '%test%'`
  * `NOT s NOT LIKE '%test%'`
  * `s = 1`
  * `NOT s != 1`
  * `startsWith(s, 'test')`
* 最適化不可能:
  * `NOT s LIKE '%test%'`
  * `s NOT LIKE '%test%'`
  * `NOT s = 1`
  * `s != 1`
  * `NOT startsWith(s, 'test')`
    :::

## プロジェクション {#projections}

プロジェクションは [マテリアライズドビュー](/sql-reference/statements/create/view) に似ていますが、パーツレベルで定義されます。クエリで自動的に利用されることに加えて、一貫性を保証します。

:::note
プロジェクションを実装する際には、[force&#95;optimize&#95;projection](/operations/settings/settings#force_optimize_projection) の設定も併せて検討する必要があります。
:::

プロジェクションは、[FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子付きの `SELECT` ステートメントではサポートされていません。

### プロジェクションクエリ {#projection-query}

プロジェクションクエリは、プロジェクションを定義するクエリです。親テーブルからデータを暗黙的に選択します。
**構文**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

プロジェクションは [ALTER](/sql-reference/statements/alter/projection.md) 文を使って変更または削除できます。

### プロジェクションのストレージ {#projection-storage}

プロジェクションはパーツディレクトリ内に保存されます。インデックスに似ていますが、匿名の `MergeTree` テーブルのパーツを保存するサブディレクトリを含みます。このテーブルは、プロジェクションの定義クエリに基づいて定義されます。`GROUP BY` 句がある場合、下層のストレージエンジンは [AggregatingMergeTree](aggregatingmergetree.md) になり、すべての集約関数は `AggregateFunction` に変換されます。`ORDER BY` 句がある場合、`MergeTree` テーブルはそれを主キー式として使用します。マージ処理中、プロジェクションのパーツは、そのストレージのマージルーチンによってマージされます。親テーブルのパーツのチェックサムは、プロジェクションのパーツと組み合わされます。その他のメンテナンス処理はスキップインデックスと同様です。

### クエリ解析 {#projection-query-analysis}

1. プロジェクションがベーステーブルに対するクエリと同じ結果を生成し、与えられたクエリに対する回答として利用できるかを確認します。
2. 読み取る必要があるグラニュール数が最も少ない、実行可能な最適な一致を選択します。
3. プロジェクションを利用するクエリパイプラインは、元のパーツを利用するものとは異なります。あるパーツにプロジェクションが存在しない場合、その場で「投影」するためのパイプラインを追加できます。

## 同時データアクセス {#concurrent-data-access}

テーブルへの同時アクセスにはマルチバージョン方式を使用します。つまり、テーブルで読み取りと更新が同時に行われている場合でも、クエリ時点で有効なパーツの集合からデータが読み取られます。長時間にわたるロックは発生しません。挿入処理が読み取り操作の妨げになることもありません。

テーブルからの読み取りは自動的に並列化されます。

## 列およびテーブルの TTL {#table_engine-mergetree-ttl}

値の有効期間（time-to-live）を決定します。

`TTL` 句はテーブル全体にも、各列ごとにも設定できます。テーブルレベルの `TTL` では、ディスクやボリューム間でデータを自動的に移動するロジックや、すべてのデータが期限切れになったパーツを再圧縮するロジックも指定できます。

式は [Date](/sql-reference/data-types/date.md)、[Date32](/sql-reference/data-types/date32.md)、[DateTime](/sql-reference/data-types/datetime.md)、または [DateTime64](/sql-reference/data-types/datetime64.md) 型として評価されなければなりません。

**構文**

列の TTL を設定する場合:

```sql
TTL time_column
TTL time_column + interval
```

`interval` を定義するには、[time interval](/sql-reference/operators#operators-for-working-with-dates-and-times) 演算子を使用します。たとえば次のように指定します。

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### カラム TTL {#mergetree-column-ttl}

カラム内の値の有効期限が切れると、ClickHouse はそれらをカラムのデータ型におけるデフォルト値に置き換えます。データパート内のそのカラムの値がすべて有効期限切れになった場合、ClickHouse はファイルシステム上のそのデータパートからこのカラムを削除します。

`TTL` 句はキー列には使用できません。

**例**

#### `TTL` を設定したテーブルの作成: {#creating-a-table-with-ttl}

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

#### 既存のテーブルの列に TTL を追加する {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```

#### 列のTTLを変更する {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```

### テーブルの TTL {#mergetree-table-ttl}

テーブルには、有効期限が切れた行を削除するための式と、[ディスクまたはボリューム](#table_engine-mergetree-multiple-volumes)間でパーツを自動的に移動するための複数の式を定義できます。テーブル内の行が有効期限切れになると、ClickHouse は対応する行をすべて削除します。パーツの移動または再圧縮が行われるためには、そのパーツ内のすべての行が `TTL` 式の条件を満たしている必要があります。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTL ルールの種類は、それぞれの TTL 式の後に続けて指定できます。これは、式が満たされた（現在時刻に達した）ときに実行されるアクションを決定します:

* `DELETE` - 期限切れの行を削除します（デフォルトのアクション）;
* `RECOMPRESS codec_name` - データパートを `codec_name` で再圧縮します;
* `TO DISK 'aaa'` - パートをディスク `aaa` に移動します;
* `TO VOLUME 'bbb'` - パートをボリューム `bbb` に移動します;
* `GROUP BY` - 期限切れの行を集約します。

`DELETE` アクションは `WHERE` 句と組み合わせて使用でき、フィルタリング条件に基づいて期限切れの行の一部のみを削除できます:

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY` 式はテーブルの主キーの先頭部分でなければなりません。

ある列が `GROUP BY` 式の一部ではなく、かつ `SET` 句で明示的に設定されていない場合、その列の値には、結果行でグループ化された行のいずれか 1 つからの値が入ります（あたかも集約関数 `any` が適用されたかのように振る舞います）。

**例**

#### `TTL` を指定したテーブルの作成: {#creating-a-table-with-ttl-1}

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

行が 1 か月後に期限切れとなるテーブルを作成します。期限切れとなった行のうち、日付が月曜日であるものが削除されます。

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

期限切れの行を集約するテーブルを作成します。結果行では、`x` にはグループ化された行における最大値、`y` には最小値、`d` にはグループ化された行からの任意の値が含まれます。

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

`TTL` が期限切れになったデータは、ClickHouse がデータパーツをマージする際に削除されます。

ClickHouse がデータの期限切れを検出すると、スケジュール外のマージを実行します。このようなマージの頻度を制御するには、`merge_with_ttl_timeout` を設定できます。値を低くしすぎると、多数のスケジュール外マージが実行され、多くのリソースを消費する可能性があります。

マージとマージの間に `SELECT` クエリを実行すると、期限切れデータが返される場合があります。これを避けるには、`SELECT` の前に [OPTIMIZE](/sql-reference/statements/optimize.md) クエリを実行してください。

**関連項目**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) 設定

## ディスクの種類 {#disk-types}

ローカルブロックデバイスに加えて、ClickHouse は次のストレージタイプをサポートします：

* [`s3` — S3 および MinIO 用](#table_engine-mergetree-s3)
* [`gcs` — GCS 用](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
* [`blob_storage_disk` — Azure Blob Storage 用](/operations/storing-data#azure-blob-storage)
* [`hdfs` — HDFS 用](/engines/table-engines/integrations/hdfs)
* [`web` — Web からの読み取り専用](/operations/storing-data#web-storage)
* [`cache` — ローカルキャッシュ用](/operations/storing-data#using-local-cache)
* [`s3_plain` — S3 へのバックアップ用](/operations/backup/disk)
* [`s3_plain_rewritable` — S3 上の変更不可能な非レプリケートテーブル用](/operations/storing-data.md#s3-plain-rewritable-storage)

## データストレージで複数のブロックデバイスを利用する {#table_engine-mergetree-multiple-volumes}

### はじめに {#introduction}

`MergeTree` ファミリーのテーブルエンジンは、複数のブロックデバイス上にデータを保存できます。たとえば、特定のテーブルのデータが事実上「ホット」と「コールド」に分割されている場合に有用です。最新のデータは頻繁に参照されますが、必要な容量は小さくて済みます。対照的に、裾の重い履歴データはまれにしか参照されません。複数のディスクが利用可能な場合、「ホット」データは高速なディスク（たとえば NVMe SSD やメモリ上）に配置し、「コールド」データは比較的低速なディスク（たとえば HDD）上に配置できます。

データパーツは、`MergeTree` エンジンのテーブルにおける最小の移動可能な単位です。1 つのパーツに属するデータは 1 台のディスク上に保存されます。データパーツは、バックグラウンドでユーザー設定に従ってディスク間を移動できるほか、[ALTER](/sql-reference/statements/alter/partition) クエリを使用して移動することもできます。

### 用語 {#terms}

* ディスク — ファイルシステムにマウントされたブロックデバイス。
* デフォルトディスク — [path](/operations/server-configuration-parameters/settings.md/#path) サーバー設定で指定されたパス上にデータを保存するディスク。
* ボリューム — 同一条件のディスクを順序付きで並べた集合（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) に類似）。
* ストレージポリシー — ボリュームの集合と、それらの間でデータを移動するためのルール。

ここで説明した各エンティティの名称は、システムテーブル [system.storage&#95;policies](/operations/system-tables/storage_policies) および [system.disks](/operations/system-tables/disks) で確認できます。テーブルに対して設定済みのストレージポリシーのいずれかを適用するには、`MergeTree` エンジンファミリーのテーブルで `storage_policy` 設定を使用します。

### 設定 {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、およびストレージポリシーは、`config.d` ディレクトリ内のファイルにある `<storage_configuration>` タグ内で宣言する必要があります。

:::tip
ディスクはクエリの `SETTINGS` セクション内で宣言することもできます。これは、例えば URL 経由でアクセスできるディスクを一時的にアタッチしてアドホックな分析を行う場合に便利です。
詳細については、[dynamic storage](/operations/storing-data#dynamic-configuration) を参照してください。
:::

設定の構造:

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

* `<disk_name_N>` — ディスク名。すべてのディスクで名前が重複しないようにする必要があります。
* `path` — サーバーがデータ（`data` および `shadow` フォルダ）を保存するパス。末尾は &#39;/&#39; で終わる必要があります。
* `keep_free_space_bytes` — 予約しておく空きディスク容量のバイト数。

ディスク定義の順序は重要ではありません。

ストレージポリシー構成のマークアップ:

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

* `policy_name_N` — ポリシー名。ポリシー名は一意である必要があります。
* `volume_name_N` — ボリューム名。ボリューム名は一意である必要があります。
* `disk` — ボリューム内のディスク。
* `max_data_part_size_bytes` — いずれのボリューム上のディスクにも保存可能なパーツの最大サイズ。マージされたパーツのサイズが `max_data_part_size_bytes` より大きくなると見積もられた場合、そのパーツは次のボリュームに書き込まれます。この機能により、新規/小さいパーツをホット (SSD) ボリュームに保持し、サイズが大きくなったときにコールド (HDD) ボリュームへ移動できます。ポリシーにボリュームが 1 つしかない場合、この設定は使用しないでください。
* `move_factor` — 空き容量がこの係数より小さくなったとき、自動的にデータを次のボリュームに移動し始めます (既定値は 0.1)。ClickHouse は既存のパーツをサイズの大きい順 (降順) にソートし、`move_factor` 条件を満たすのに十分な合計サイズとなるようにパーツを選択します。すべてのパーツの合計サイズが不十分な場合は、すべてのパーツが移動されます。
* `perform_ttl_move_on_insert` — データパーツの INSERT 時の TTL move を無効化します。既定では (有効な場合)、挿入するデータパーツが TTL move ルールによりすでに期限切れとなっている場合、そのパーツは直ちに move ルールで指定されたボリューム/ディスクに配置されます。宛先ボリューム/ディスクが遅い場合 (例: S3)、これは INSERT を大幅に遅くする可能性があります。無効にした場合、すでに期限切れのデータパーツはいったんデフォルトボリュームに書き込まれ、その直後に TTL ボリュームへ移動されます。
* `load_balancing` — ディスクのバランシングポリシー。`round_robin` または `least_used`。
* `least_used_ttl_ms` — すべてのディスク上の空き容量情報を更新するためのタイムアウト (ミリ秒単位) を設定します (`0` - 常に更新、`-1` - 更新しない、既定値は `60000`)。注意: ディスクが ClickHouse 専用であり、オンラインのファイルシステムのリサイズ/縮小の対象にならない場合は `-1` を使用できますが、それ以外のケースでは推奨されません。最終的に空き容量の不適切な分散を招くためです。
* `prefer_not_to_merge` — この設定は使用しないでください。このボリューム上のデータパーツのマージを無効化します (これは有害であり、パフォーマンス低下につながります)。この設定が有効な場合 (有効にしないでください)、このボリューム上でのマージは許可されません (これは望ましくありません)。これは (必要ありませんが) ClickHouse が遅いディスクをどのように扱うかを制御することを可能にします (しかし、何かを制御しようとしている時点で誤りであり、ClickHouse の方が賢いので、この設定は使用しないでください)。
* `volume_priority` — ボリュームが埋められる優先度 (順序) を定義します。値が小さいほど優先度が高くなります。このパラメータの値は自然数とし、1 から N (最も低い優先度の値) までの範囲を欠番なくすべて網羅する必要があります。
  * *すべての* ボリュームにタグが付いている場合、指定された順序で優先されます。
  * 一部のボリュームのみにタグが付いている場合、タグのないボリュームは最も低い優先度となり、設定ファイル内で定義された順に優先されます。
  * ボリュームに *まったく* タグが付いていない場合、設定ファイル内で宣言された順序に対応して優先度が設定されます。
  * 2 つのボリュームが同じ優先度の値を持つことはできません。

構成例:

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

この例では、`hdd_in_order` ポリシーは [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling) 方式を実装しています。そのため、このポリシーは 1 つのボリューム（`single`）のみを定義し、そのすべてのディスク上にデータパーツをラウンドロビンで保存します。RAID を構成していないものの、同種のディスクが複数台システムにマウントされている場合、このようなポリシーは非常に有用です。各ディスクドライブ単体は信頼性が高くないことに注意し、レプリケーション係数を 3 以上にして補償することを検討してください。

システムに異なる種類のディスクが存在する場合は、代わりに `moving_from_ssd_to_hdd` ポリシーを使用できます。`hot` ボリュームは SSD ディスク（`fast_ssd`）で構成されており、このボリュームに保存できる 1 パートの最大サイズは 1GB です。サイズが 1GB を超えるすべてのパーツは、HDD ディスク `disk1` を含む `cold` ボリュームに直接保存されます。
また、ディスク `fast_ssd` の使用率が 80% を超えると、バックグラウンドプロセスによってデータが `disk1` に転送されます。

ストレージポリシー内でのボリュームの列挙順序は、列挙されたボリュームのうち少なくとも 1 つに明示的な `volume_priority` パラメータが設定されていない場合に重要です。
あるボリュームが満杯になると、データは次のボリュームへ移動されます。ディスクの列挙順も同様に重要であり、データはそれらに順番に保存されます。

テーブルを作成する際、そのテーブルに対して設定済みストレージポリシーのいずれかを適用できます。

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

`default` ストレージポリシーは、`<path>` で指定された 1 つのディスクのみから構成される 1 つのボリュームだけを使用することを意味します。
テーブル作成後でも [ALTER TABLE ... MODIFY SETTING] クエリを使用してストレージポリシーを変更できますが、新しいポリシーには、同じ名前を持つすべての既存ディスクおよびボリュームを含める必要があります。

データパーツのバックグラウンド移動を実行するスレッド数は、[background&#95;move&#95;pool&#95;size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size) 設定で変更できます。

### 詳細 {#details}

`MergeTree` テーブルの場合、データは次のようなさまざまな方法でディスクに書き込まれます。

* 挿入（`INSERT` クエリ）の結果として。
* バックグラウンドでのマージおよび[ミューテーション](/sql-reference/statements/alter#mutations)の実行中。
* 別のレプリカからのダウンロード時。
* パーティションのフリーズ [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition) の結果として。

ミューテーションとパーティションのフリーズを除くすべての場合において、パーツは指定されたストレージポリシーに従ってボリュームおよびディスク上に保存されます。

1. パーツを保存するのに十分な空きディスク容量があり（`unreserved_space > current_part_size`）、かつ指定サイズのパーツの保存が許可されている（`max_data_part_size_bytes > current_part_size`）最初のボリューム（定義順）が選択されます。
2. このボリューム内では、直前のデータチャンクを保存していたディスクの次のディスクであって、かつその空き容量がパーツサイズを上回るもの（`unreserved_space - keep_free_space_bytes > current_part_size`）が選択されます。

内部的には、ミューテーションとパーティションのフリーズは[ハードリンク](https://en.wikipedia.org/wiki/Hard_link)を利用します。異なるディスク間のハードリンクはサポートされないため、このような場合には結果として生成されるパーツは元のパーツと同じディスク上に保存されます。

バックグラウンドでは、設定ファイル内で宣言されたボリュームの順序に従い、空き容量（`move_factor` パラメータ）に基づいてパーツがボリューム間で移動されます。
最後のボリュームから他のボリュームへの移動および他のボリュームから最初のボリュームへの移動は行われません。バックグラウンドでの移動は、システムテーブル [system.part&#95;log](/operations/system-tables/part_log)（フィールド `type = MOVE_PART`）および [system.parts](/operations/system-tables/parts.md)（フィールド `path` と `disk`）を使用して監視できます。より詳細な情報はサーバーログで確認できます。

ユーザーは、クエリ [ALTER TABLE ... MOVE PART|PARTITION ... TO VOLUME|DISK ...](/sql-reference/statements/alter/partition) を使用して、パーツまたはパーティションをあるボリュームから別のボリュームへ強制的に移動できます。バックグラウンド操作に対するすべての制約が考慮されます。このクエリは独自に移動処理を開始し、バックグラウンド操作の完了を待ちません。必要な空き容量が不足している場合や、必要条件のいずれかが満たされていない場合、ユーザーにはエラーメッセージが返されます。

データの移動はデータレプリケーションの動作を妨げません。そのため、同じテーブルに対しても、レプリカごとに異なるストレージポリシーを指定できます。

バックグラウンドでのマージおよびミューテーションが完了した後、古いパーツは一定時間（`old_parts_lifetime`）経過してから削除されます。
この期間中、それらのパーツは他のボリュームやディスクには移動されません。したがってパーツが最終的に削除されるまでは、使用中ディスク容量の計算に引き続き含まれます。

ユーザーは、[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) ボリュームの複数ディスクに新しい大きなパーツをバランス良く割り当てるために、設定 [min&#95;bytes&#95;to&#95;rebalance&#95;partition&#95;over&#95;jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod) を使用できます。

## データの保存に外部ストレージを使用する {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンは、それぞれ `s3`、`azure_blob_storage`、`hdfs` タイプのディスクを使用して、データを `S3`、`AzureBlobStorage`、`HDFS` に保存できます。詳細は、[外部ストレージオプションの設定](/operations/storing-data.md/#configuring-external-storage)を参照してください。

ディスクタイプ `s3` を使用して [S3](https://aws.amazon.com/s3/) を外部ストレージとして利用する例を以下に示します。

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
ClickHouse バージョン 22.3 から 22.7 までは異なるキャッシュ設定が使用されています。これらのバージョンのいずれかを使用している場合は、[ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を参照してください。
:::

## 仮想カラム {#virtual-columns}

* `_part` — パーツ名。
* `_part_index` — クエリ結果内でのパーツの連番インデックス番号。
* `_part_starting_offset` — クエリ結果内でのパーツの累積開始行番号。
* `_part_offset` — パーツ内での行番号。
* `_part_granule_offset` — パーツ内でのグラニュール番号。
* `_partition_id` — パーティション名。
* `_part_uuid` — 一意のパーツ識別子（MergeTree 設定 `assign_part_uuids` が有効な場合）。
* `_part_data_version` — パーツのデータバージョン（最小ブロック番号またはミューテーションバージョンのいずれか）。
* `_partition_value` — `partition by` 式の値（タプル）。
* `_sample_factor` — クエリで指定されたサンプル係数。
* `_block_number` — 行に挿入時に割り当てられた元のブロック番号で、`enable_block_number_column` 設定が有効な場合はマージ時も保持される。
* `_block_offset` — ブロック内の行に挿入時に割り当てられた元の行番号で、`enable_block_offset_column` 設定が有効な場合はマージ時も保持される。
* `_disk_name` — ストレージで使用されるディスク名。

## カラム統計 {#column-statistics}

<ExperimentalBadge />

<CloudNotSupportedBadge />

`set allow_experimental_statistics = 1` を有効にすると、`*MergeTree*` ファミリーのテーブルに対する `CREATE` クエリの `COLUMNS` セクション内で統計を宣言します。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

`ALTER` ステートメントを使用して統計情報を変更することもできます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量な統計情報は、列内の値の分布に関する情報を集約します。統計情報は各パートごとに保存され、挿入のたびに更新されます。
`set allow_statistics_optimize = 1` を有効にした場合にのみ、PREWHERE の最適化に利用できます。

### 利用可能な列統計の種類 {#available-types-of-column-statistics}

- `MinMax`

    数値型列に対する範囲フィルターの選択性を推定できるようにする、列の最小値と最大値。

    構文: `minmax`

- `TDigest`

    数値型列に対して近似パーセンタイル（例: 第90パーセンタイル）を計算できる [TDigest](https://github.com/tdunning/t-digest) スケッチ。

    構文: `tdigest`

- `Uniq`

    列に含まれる異なる値の個数を推定する [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) スケッチ。

    構文: `uniq`

- `CountMin`

    列内の各値の出現頻度を近似的にカウントする [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) スケッチ。

    構文: `countmin`

### サポートされているデータ型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String または FixedString |
|-----------|----------------------------------------------------|---------------------------|
| CountMin  | ✔                                                  | ✔                         |
| MinMax    | ✔                                                  | ✗                         |
| TDigest   | ✔                                                  | ✗                         |
| Uniq      | ✔                                                  | ✔                         |

### サポートされる操作 {#supported-operations}

|           | 等値フィルター (==) | 範囲フィルター (`>, >=, <, <=`) |
|-----------|---------------------|------------------------------|
| CountMin  | ✔                   | ✗                            |
| MinMax    | ✗                   | ✔                            |
| TDigest   | ✗                   | ✔                            |
| Uniq      | ✔                   | ✗                            |

## 列レベルの設定 {#column-level-settings}

一部の MergeTree の設定は列レベルで上書きできます。

* `max_compress_block_size` — テーブルに書き込む際に、圧縮前のデータブロックの最大サイズ。
* `min_compress_block_size` — 次のマークを書き込む際に圧縮を行うために必要となる、圧縮前のデータブロックの最小サイズ。

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

カラムレベルの設定は、たとえば [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) を使用して変更または削除できます。

* カラム定義の `SETTINGS` を削除する:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

* 設定を変更します:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

* 1 つ以上の設定をリセットし、同時にテーブルの CREATE クエリのカラム式から設定の宣言も削除します。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
