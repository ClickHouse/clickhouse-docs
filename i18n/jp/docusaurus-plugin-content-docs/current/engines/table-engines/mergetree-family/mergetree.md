---
'description': '`MergeTree`-family table engines are designed for high data ingest
  rates and huge data volumes.'
'sidebar_label': 'MergeTree'
'sidebar_position': 11
'slug': '/engines/table-engines/mergetree-family/mergetree'
'title': 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

`MergeTree` エンジンおよび `MergeTree` ファミリーの他のエンジン（例: `ReplacingMergeTree`, `AggregatingMergeTree`）は、ClickHouse で最も一般的に使用され、最も堅牢なテーブルエンジンです。

`MergeTree` ファミリーのテーブルエンジンは、高いデータ取り込み率と巨大なデータボリュームを想定して設計されています。
挿入操作は、バックグラウンドプロセスによって他のテーブルパーツとマージされるテーブルパーツを作成します。

`MergeTree` ファミリーのテーブルエンジンの主な特徴。

- テーブルの主キーは、各テーブルパーツ内のソート順を決定します（クラスタインデックス）。主キーは、個々の行ではなく、8192 行のブロックであるグラニュールを参照します。これにより、大規模データセットの主キーはメインメモリに保持されるのに十分小さく、ディスク上のデータに迅速にアクセスできます。

- テーブルは任意のパーティション式を使用してパーティショニングできます。クエリが許可される場合、パーティションプルーニングは読取時にパーティションを省略します。

- データは、高可用性、フェイルオーバー、ゼロダウンタイムアップグレードのために、複数のクラスター ノード間でレプリケートできます。詳細は [データレプリケーション](/engines/table-engines/mergetree-family/replication.md) を参照してください。

- `MergeTree` テーブルエンジンは、クエリの最適化を助けるために、さまざまな統計の種類とサンプリング方法をサポートしています。

:::note
同名ですが、 [Merge](/engines/table-engines/special/merge) エンジンは `*MergeTree` エンジンとは異なります。
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

`ENGINE` — エンジンの名前とパラメータ。 `ENGINE = MergeTree()`。`MergeTree` エンジンにはパラメータはありません。
#### ORDER BY {#order_by}

`ORDER BY` — ソートキー。

カラム名または任意の式のタプル。例: `ORDER BY (CounterID + 1, EventDate)`。

主キーが定義されていない場合（つまり、`PRIMARY KEY` が指定されていない場合）、ClickHouse はソートキーを主キーとして使用します。

ソートが不要な場合は、構文 `ORDER BY tuple()` を使用できます。
設定 `create_table_empty_primary_key_by_default` が有効になっている場合は、`ORDER BY tuple()` が `CREATE TABLE` ステートメントに暗黙的に追加されます。詳細は [主キーの選択](#selecting-a-primary-key) を参照してください。
#### PARTITION BY {#partition-by}

`PARTITION BY` — [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)。オプション。ほとんどの場合、パーティションキーは必要ありません。必要な場合でも、通常、月単位でパーティションするよりも詳細なパーティションキーは必要ありません。パーティショニングはクエリの速度を上げません（`ORDER BY` 式とは対照的に）。過度に詳細なパーティショニングを使用すべきではありません。クライアント識別子や名前でデータをパーティションしないでください（その代わり、`ORDER BY` 式の最初のカラムとしてクライアント識別子または名前を指定してください）。

月ごとのパーティショニングには、`toYYYYMM(date_column)` 表現を使用します。ここで `date_column` は、[Date](/sql-reference/data-types/date.md) 型の日付を持つカラムです。ここでのパーティション名は `"YYYYMM"` 形式を持ちます。
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — ソートキーと異なる場合の主キーです。オプション。

ソートキーを指定することは（`ORDER BY` 句を使用）、暗黙的に主キーを指定することになります。
通常、ソートキーに加えて主キーを指定する必要はありません。
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — サンプリング式。オプション。

指定した場合は、主キーに含まれている必要があります。
サンプリング式は符号なし整数を生成する必要があります。

例: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`。
#### TTL {#ttl}

`TTL` — 行の保存期間と、自動的なパーツの移動のロジックを指定する規則のリスト [ディスク間とボリューム間](#table_engine-mergetree-multiple-volumes)での。オプション。

式は `Date` または `DateTime` を生成する必要があり、例: `TTL date + INTERVAL 1 DAY` です。

規則のタイプ `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` は、式が満たされたときにパーツで行われる動作を指定します（現在の時間に達したとき）：期限切れ行の削除、指定されたディスク（`TO DISK 'xxx'`）またはボリューム（`TO VOLUME 'xxx'`）へのパーツの移動、または期限切れ行の値の集約。規則のデフォルトのタイプは削除（`DELETE`）です。複数の規則を指定できますが、`DELETE` 規則は 1 つだけにしてください。

詳細については、[列およびテーブルの TTL](#table_engine-mergetree-ttl) を参照してください。
#### SETTINGS {#settings}

[MergeTree 設定を参照](../../../operations/settings/merge-tree-settings.md)。

**セクション設定の例**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

この例では、月ごとのパーティショニングを設定しました。

また、ユーザー ID によるハッシュとしてサンプリングの式も設定しました。これにより、各 `CounterID` と `EventDate` に対してテーブルのデータを擬似的にランダム化できます。データを選択する際に[SAMPLE](/sql-reference/statements/select/sample)句を定義すると、ClickHouse はユーザーのサブセットに対して均等に擬似的なランダムデータサンプルを返します。

`index_granularity` 設定は 8192 がデフォルト値のため、省略することができます。

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこのメソッドを使用しないでください。可能であれば、古いプロジェクトを上記のメソッドに切り替えてください。
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

- `date-column` — [Date](/sql-reference/data-types/date.md) 型のカラムの名前。ClickHouse はこのカラムに基づいて月ごとのパーティションを自動的に作成します。パーティション名は `"YYYYMM"` 形式です。
- `sampling_expression` — サンプリングのための式。
- `(primary, key)` — 主キー。タイプ: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — インデックスの粒度。インデックスの「マーク」間のデータ行の数。値 8192 はほとんどのタスクに適しています。

**例**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

`MergeTree` エンジンは、上記の例のようにメインエンジンの設定メソッドと同じ方法で構成されます。
</details>
## データストレージ {#mergetree-data-storage}

テーブルは、主キーによってソートされたデータパーツで構成されています。

テーブルにデータが挿入されると、独立したデータパーツが作成され、各パーツは主キーによって辞書式にソートされます。たとえば、主キーが `(CounterID, Date)` の場合、パーツ内のデータは `CounterID` でソートされ、各 `CounterID` の中で `Date` で順序付けられます。

異なるパーティションに属するデータは、異なるパーツに分けられます。ClickHouse はバックグラウンドで、データパーツをより効率的にストレージにマージします。異なるパーティションに属するパーツはマージされません。マージメカニズムは、同じ主キーを持つすべての行が同じデータパーツに存在することを保証するものではありません。

データパーツは `Wide` または `Compact` フォーマットで保存できます。`Wide` フォーマットでは、各カラムがファイルシステム内の別のファイルに保存され、`Compact` フォーマットでは、すべてのカラムが 1 つのファイルに保存されます。`Compact` フォーマットは、小さく頻繁な挿入のパフォーマンスを向上させるために使用できます。

データ保存フォーマットは、テーブルエンジンの `min_bytes_for_wide_part` および `min_rows_for_wide_part` 設定によって制御されます。データパーツ内のバイト数または行数が、対応する設定の値よりも少ない場合、パーツは `Compact` フォーマットで保存されます。それ以外の場合は、`Wide` フォーマットで保存されます。これらの設定がいずれも設定されていない場合、データパーツは `Wide` フォーマットで保存されます。

各データパーツは、論理的にグラニュールに分けられます。グラニュールは、ClickHouse がデータを選択する際に読み取る最小の分割可能なデータセットです。ClickHouse は行や値を分割しないため、各グラニュールは常に整数数の行を含みます。グラニュールの最初の行は、その行の主キーの値でマークされます。ClickHouse は各データパーツについて、マークを保存するインデックスファイルを作成します。プライマリーキーに含まれるかどうかに関係なく、各カラムについて、ClickHouse は同じマークも保存します。これらのマークにより、カラムファイル内のデータを直接見つけることができます。

グラニュールのサイズは、テーブルエンジンの `index_granularity` および `index_granularity_bytes` 設定によって制限されます。グラニュール内の行の数は、行のサイズに応じて `[1, index_granularity]` の範囲に配置されます。1 行のサイズが設定の値を超えている場合、グラニュールのサイズは `index_granularity_bytes` を超えることがあります。この場合、グラニュールのサイズは行のサイズに等しくなります。
## 主キーとインデックスのクエリでの使用 {#primary-keys-and-indexes-in-queries}

例として `(CounterID, Date)` 主キーを考えてみましょう。この場合、ソートとインデックスは次のように示すことができます：

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

データクエリが次のように指定されている場合：

- `CounterID in ('a', 'h')` の場合、サーバーはマークの範囲 `[0, 3)` と `[6, 8)` のデータを読み取ります。
- `CounterID IN ('a', 'h') AND Date = 3` の場合、サーバーはマークの範囲 `[1, 3)` と `[7, 8)` のデータを読み取ります。
- `Date = 3` の場合、サーバーはマークの範囲 `[1, 10]` のデータを読み取ります。

上記の例は、インデックスを使用する方が常にフルスキャンよりも効果的であることを示しています。

スパースインデックスは、追加のデータを読み取ることができます。主キーの単一範囲を読み取る場合、各データブロック内で最大 `index_granularity * 2` の追加行を読み取ることができます。

スパースインデックスは、非常に多くのテーブル行と一緒に作業するのを可能にします。なぜなら、ほとんどの場合、これらのインデックスはコンピュータの RAM に収まるからです。

ClickHouse では、ユニークな主キーは必要ありません。同じ主キーを持つ複数の行を挿入できます。

`PRIMARY KEY` および `ORDER BY` 句で `Nullable` 型の式を使用できますが、強く推奨されません。この機能を許可するには、[allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key) 設定をオンにします。[NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) の原則は、`ORDER BY` 句の `NULL` 値に適用されます。
### 主キーの選択 {#selecting-a-primary-key}

主キー内のカラムの数に明示的な制限はありません。データ構造に応じて、主キーにより多くのカラムを含めることができます。これは次のことをもたらします：

- インデックスのパフォーマンスを向上させる。

    主キーが `(a, b)` の場合、別のカラム `c` を追加すると次の条件が満たされる場合にパフォーマンスが向上します：

    - カラム `c` に条件があるクエリがある。
    - `(a, b)` の値が同じ長いデータ範囲（`index_granularity` の数倍長い）が一般的です。別のカラムを追加することで、かなり長いデータ範囲をスキップできる場合です。

- データ圧縮を改善する。

    ClickHouse はデータを主キーでソートするため、一貫性が高いほど圧縮がよくなります。

- [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) や [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) エンジンでデータ部分をマージする際の追加ロジックを提供します。

    この場合、主キーとは異なる *ソーティングキー* を指定することが理にかなっています。

長い主キーは、挿入パフォーマンスやメモリ消費に悪影響を与えますが、主キー内の追加カラムは `SELECT` クエリ中の ClickHouse のパフォーマンスに影響を与えません。

`ORDER BY tuple()` 構文を使用して主キーなしでテーブルを作成できます。この場合、ClickHouse は挿入順序でデータを保存します。`INSERT ... SELECT` クエリでデータを挿入する際にデータ順序を保存したい場合は、[max_insert_threads = 1](/operations/settings/settings#max_insert_threads) を設定します。

初期の順序でデータを選択するには、[シングルスレッド](/operations/settings/settings.md/#max_threads) `SELECT` クエリを使用します。
### ソーティングキーとは異なる主キーの選択 {#choosing-a-primary-key-that-differs-from-the-sorting-key}

主キー（インデックスファイルに各マークの値を書き込む式）をソートキー（データ部分の行をソートする式）とは異なるように指定することができます。この場合、主キー式のタプルはソートキー式のタプルの接頭辞でなければなりません。

この機能は、[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) および [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md) テーブルエンジンを使用する際に役立ちます。これらのエンジンを使用する一般的なケースでは、テーブルには *次元* と *測定* の 2 種類のカラムがあります。典型的なクエリは、次元でフィルタリングしながら、任意の `GROUP BY` で測定カラムの値を集約します。SummingMergeTree と AggregatingMergeTree は、同じソートキーの値を持つ行を集約するため、すべての次元を追加することが自然です。その結果、キー式は長いカラムのリストで構成され、このリストは新しく追加された次元で頻繁に更新する必要があります。

この場合、効率的な範囲スキャンを提供する主キーには少数のカラムを残し、残りの次元のカラムをソートキーのタプルに追加することが理にかなっています。

ソートキーの [ALTER](/sql-reference/statements/alter/index.md) は軽量な操作であり、新しいカラムがテーブルとソートキーに同時に追加されるとき、既存のデータパーツは変更する必要がありません。古いソートキーが新しいソートキーの接頭辞であり、新しく追加されたカラムにデータがないため、テーブルの修正時にはデータは古いソートキーと新しいソートキーの両方でソートされます。
### クエリでのインデックスとパーティションの使用 {#use-of-indexes-and-partitions-in-queries}

`SELECT` クエリでは、ClickHouse はインデックスの使用が可能かどうかを分析します。インデックスは、`WHERE/PREWHERE` 句が等号または不等号の比較操作を表す式（結合要素の 1 つまたはすべて）を持つ場合、または主キーまたはパーティショニングキーのカラムまたは式に対して特定の接頭辞を持つ `IN` または `LIKE` を持つ場合、またはこれらのカラムの特定の部分的に繰り返しを持つ関数や論理関係の式を持つ場合に使用できます。

したがって、主キーの 1 つまたは複数の範囲でクエリを迅速に実行することができます。この例では、特定のトラッキングタグ、特定のタグと日付範囲、特定のタグと日付、複数のタグと日付範囲などについてクエリを実行するときに、クエリは迅速に実行されます。

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

ClickHouse は、主キーインデックスを使用して不適切なデータを削減し、月ごとのパーティショニングキーを使用して不適切な日付範囲にあるパーティションを削減します。

上記のクエリは、インデックスが複雑な式でも使用されることを示しています。テーブルからの読み込みは、インデックスを使用するのがフルスキャンよりも遅くなることはありません。

以下の例で、インデックスは使用できません。

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

クエリ実行時に ClickHouse がインデックスを使用できるかどうかを確認するには、[force_index_by_date](/operations/settings/settings.md/#force_index_by_date) および [force_primary_key](/operations/settings/settings#force_primary_key) の設定を使用します。

月ごとのパーティショニングキーは、適切な範囲を持つ日付を含むデータブロックのみを読み取ります。この場合、データブロックには多くの日付（最大で 1 か月分）のデータが含まれている可能性があります。ブロック内でデータは主キーでソートされていますが、主キーの最初のカラムとして日付を含まない可能性があります。このため、主キー接頭辞を指定しない単一日付条件のクエリを使用すると、単一の日付の場合よりも多くのデータが読み取られることになります。
### 部分的に単調増加する主キーに対するインデックスの利用 {#use-of-index-for-partially-monotonic-primary-keys}

例えば、月の日を考えます。これは 1 か月の間、[単調増加シーケンス](https://en.wikipedia.org/wiki/Monotonic_function) を形成しますが、より長い期間に対しては単調ではありません。これは部分的に単調増加するシーケンスです。ユーザーが部分的に単調増加する主キーでテーブルを作成した場合、ClickHouse は通常のようにスパースインデックスを作成します。ユーザーがこの種のテーブルからデータを選択すると、ClickHouse はクエリ条件を分析します。インデックスの 2 つのマークの間にデータを取得したい場合、これらの 2 つのマークが 1 か月の間に収まる場合、ClickHouse はこの特定のケースでインデックスを使用できる可能性があります。なぜなら、クエリのパラメータとインデックスのマーク間の距離を計算できるからです。

クエリパラメーターの範囲の主キーの値が単調増加のシーケンスを表さない場合、ClickHouse はインデックスを使用できません。この場合、ClickHouse はフルスキャン方式を使用します。

ClickHouse はこのロジックを、月の日のシーケンスだけでなく、部分的に単調増加する任意のシーケンスの主キーに対して使用します。
### データスキッピングインデックス {#table_engine-mergetree-data_skipping-indexes}

インデックス宣言は、`CREATE` クエリのカラムセクションにあります。

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

`*MergeTree` ファミリーのテーブルの場合、データスキッピングインデックスを指定できます。

これらのインデックスは、指定された式に関する情報を `granularity_value` グラニュール（グラニュールのサイズはテーブルエンジンの `index_granularity` 設定を使用して指定されます）で構成されるブロックで集約します。次に、これらの集約が `SELECT` クエリで使用され、クエリが満たされない大きなデータブロックをスキップするために必要なデータ量を削減します。

`GRANULARITY` 句は省略可能で、デフォルトの `granularity_value` の値は 1 です。

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

この例のインデックスは、ClickHouse が次のクエリでディスクから読み取るデータの量を削減するために使用できます：

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

データスキッピングインデックスは、合成カラムに対しても作成できます：

```sql
-- Map 型のカラムに対して：
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- Tuple 型のカラムに対して：
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- Nested 型のカラムに対して：
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### 利用可能なインデックスの種類 {#available-types-of-indices}
#### MinMax {#minmax}

指定された式の極端値を保存します（式が `tuple` の場合、それぞれの `tuple` の要素の極端値を保存します）。主キーのように、データブロックをスキップするために保存された情報を使用します。

構文: `minmax`
#### Set {#set}

指定された式のユニークな値を保存します（`max_rows` 行を超えない、 `max_rows=0` は「制限なし」を意味します）。これらの値を使用して、データブロックで `WHERE` 式が満たされないかどうかを確認します。

構文: `set(max_rows)`
#### Bloom フィルター {#bloom-filter}

指定されたカラムに対する [Bloom フィルター](https://en.wikipedia.org/wiki/Bloom_filter) を保存します。オプションの `false_positive` パラメータは 0 から 1 の間の値で、フィルターから偽陽性の応答を受け取る確率を指定します。デフォルト値: 0.025。サポートされているデータ型: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` および `Map`。`Map` データ型の場合、クライアントは[mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys)または[mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues)関数を使用して、インデックスがキーまたは値に対して作成されるべきかを指定できます。

構文: `bloom_filter([false_positive])`
#### N-gram Bloom フィルター {#n-gram-bloom-filter}

すべての n-gram をデータブロックから含む [Bloom フィルター](https://en.wikipedia.org/wiki/Bloom_filter) を保存します。データ型: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md) および [Map](/sql-reference/data-types/map.md) のみで使用できます。`EQUALS`、 `LIKE` および `IN` 式の最適化に使用できます。

構文: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — ngramサイズ、
- `size_of_bloom_filter_in_bytes` — バイト単位の Bloom フィルターサイズ（例えば、256 や 512 などの大きな値を指定できます。圧縮がうまくできるため）。
- `number_of_hash_functions` — Bloom フィルターで使用されるハッシュ関数の数。
- `random_seed` — Bloom フィルターのハッシュ関数のシード。

ユーザーは [UDF](/sql-reference/statements/create/function.md) を作成して、`ngrambf_v1` のパラメータセットを推定できます。クエリステートメントは次のとおりです：

```sql
CREATE FUNCTION bfEstimateFunctions [ON CLUSTER cluster]
AS
(total_number_of_all_grams, size_of_bloom_filter_in_bits) -> round((size_of_bloom_filter_in_bits / total_number_of_all_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize [ON CLUSTER cluster]
AS
(total_number_of_all_grams, probability_of_false_positives) -> ceil((total_number_of_all_grams * log(probability_of_false_positives)) / log(1 / pow(2, log(2))));

CREATE FUNCTION bfEstimateFalsePositive [ON CLUSTER cluster]
AS
(total_number_of_all_grams, number_of_hash_functions, size_of_bloom_filter_in_bytes) -> pow(1 - exp(-number_of_hash_functions/ (size_of_bloom_filter_in_bytes / total_number_of_all_grams)), number_of_hash_functions);

CREATE FUNCTION bfEstimateGramNumber [ON CLUSTER cluster]
AS
(number_of_hash_functions, probability_of_false_positives, size_of_bloom_filter_in_bytes) -> ceil(size_of_bloom_filter_in_bytes / (-number_of_hash_functions / log(1 - exp(log(probability_of_false_positives) / number_of_hash_functions))))

```
これらの関数を使用するには、少なくとも 2 つのパラメータを指定する必要があります。
たとえば、グラニュール内に 4300 の ngram があり、偽陽性が 0.0001 未満であると予想される場合、次のクエリを実行して他のパラメータを推定できます：

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
もちろん、他の条件でパラメータを推定するためにこれらの関数を使用することもできます。
関数は[こちら](https://hur.st/bloomfilter)のコンテンツを参照します。
#### トークン Bloom フィルター {#token-bloom-filter}

`ngrambf_v1` と同様ですが、n-gram の代わりにトークンを保存します。トークンは、非英数字で区切られたシーケンスです。

構文: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### 特殊目的 {#special-purpose}

- 近似最近傍探索をサポートするための実験的インデックス。詳細は [こちら](annindexes.md) を参照してください。
- フルテキスト検索をサポートするための実験的なフルテキストインデックス。詳細は [こちら](invertedindexes.md) を参照してください。
### Functions Support {#functions-support}

`WHERE`句の条件は、カラムを操作する関数の呼び出しを含みます。カラムがインデックスの一部である場合、ClickHouseは関数を実行する際にこのインデックスを使用しようとします。ClickHouseは、インデックスを使用するためのさまざまな関数のサブセットをサポートしています。

`set`タイプのインデックスはすべての関数で使用できます。他のインデックスタイプは以下のようにサポートされています：

| 関数（演算子） / インデックス                                                                                | 主キー | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
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
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                               | ✗           | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                         | ✗           | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                                   | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                             | ✗           | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗           | ✗      | ✗          | ✔          | ✗            | ✗         |

定数引数がngramサイズ未満の場合、`ngrambf_v1`によるクエリ最適化には使用できません。

(*) `hasTokenCaseInsensitive`と`hasTokenCaseInsensitiveOrNull`を有効にするには、`tokenbf_v1`インデックスを小文字化されたデータで作成する必要があります。例えば、`INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`のようにします。

:::note
ブルームフィルターは誤陽性の一致を持つ可能性があるため、`ngrambf_v1`、`tokenbf_v1`、および`bloom_filter`インデックスは、関数の結果がfalseであることが期待されるクエリの最適化には使用できません。

例えば：

- 最適化可能なもの：
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- 最適化不可能なもの：
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::
## Projections {#projections}
プロジェクションは[物化ビュー](/sql-reference/statements/create/view)のようですが、パートレベルで定義されています。それは、一貫性の保証を提供し、クエリに自動的に使用されます。

:::note
プロジェクションを実装する際には、[force_optimize_projection](/operations/settings/settings#force_optimize_projection)設定も考慮するべきです。
:::

プロジェクションは、[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子を持つ`SELECT`文ではサポートされていません。
### Projection Query {#projection-query}
プロジェクションクエリは、プロジェクションを定義するものです。それは暗黙的に親テーブルからデータを選択します。
**構文**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

プロジェクションは、[ALTER](/sql-reference/statements/alter/projection.md)文を使用して変更または削除できます。
### Projection Storage {#projection-storage}
プロジェクションはパートディレクトリ内に格納されます。これはインデックスに似ていますが、匿名の`MergeTree`テーブルのパートを格納するサブディレクトリを含みます。このテーブルはプロジェクションの定義クエリによって誘導されます。`GROUP BY`句がある場合、基盤のストレージエンジンは[AggregatingMergeTree](aggregatingmergetree.md)となり、すべての集約関数は`AggregateFunction`に変換されます。`ORDER BY`句がある場合、`MergeTree`テーブルはそれを主キー式として使用します。マージプロセス中、プロジェクションパートはそのストレージのマージルーチンを介してマージされます。親テーブルのパートのチェックサムは、プロジェクションのパートと組み合わされます。他のメンテナンス作業はデータスキッピングインデックスに似ています。
### Query Analysis {#projection-query-analysis}
1. プロジェクションが与えられたクエリに応じて使用されるかを確認します。つまり、基礎テーブルをクエリした場合と同じ答えが生成されるかを確認します。
2. 読み取りに最も少ない粒を含む、最良の利用可能な一致を選択します。
3. プロジェクションを使用するクエリパイプラインは、元のパーツを使用するものと異なります。プロジェクションがいくつかのパーツに欠けている場合、そのパイプラインを追加して動的に「プロジェクト」することができます。
## Concurrent Data Access {#concurrent-data-access}

同時テーブルアクセスのために、マルチバージョンを使用します。別の言い方をすれば、テーブルが同時に読み取られ、更新されるとき、データはクエリの時点での現在の一連のパーツから読み取られます。長時間のロックはありません。挿入は読み取り操作の妨げになりません。

テーブルからの読み取りは自動的に並列化されます。
## TTL for Columns and Tables {#table_engine-mergetree-ttl}

値の寿命を決定します。

`TTL`句はテーブル全体、および各個別のカラムに設定できます。テーブルレベルの`TTL`は、自動的にデータをディスクやボリューム間で移動するロジックや、すべてのデータが期限切れになったパーツを再圧縮することを指定できます。

式は[Date](/sql-reference/data-types/date.md)または[DateTime](/sql-reference/data-types/datetime.md)データ型に評価される必要があります。

**構文**

カラムのTTLを設定する：

```sql
TTL time_column
TTL time_column + interval
```

`interval`を定義するには、[時間間隔](/sql-reference/operators#operators-for-working-with-dates-and-times)演算子を使用します。例えば：

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### Column TTL {#mergetree-column-ttl}

カラム内の値が期限切れになると、ClickHouseはそれらをカラムデータ型のデフォルト値に置き換えます。データ部分内のすべてのカラム値が期限切れになると、ClickHouseはこのカラムをファイルシステムのデータ部分から削除します。

`TTL`句はキーカラムには使用できません。

**例**
#### `TTL`でテーブルを作成する: {#creating-a-table-with-ttl}

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
### Table TTL {#mergetree-table-ttl}

テーブルには期限切れ行を削除するための式が含まれ、複数の式が[ディスクまたはボリューム](#table_engine-mergetree-multiple-volumes)間の部品の自動移動を可能にします。テーブル内の行が期限切れになると、ClickHouseはすべての対応する行を削除します。部分の移動や再圧縮の場合、パートのすべての行が`TTL`式の条件を満たす必要があります。

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

TTLルールのタイプは各TTL式に続く場合があります。それは式が満たされたときに実行されるアクションに影響します（現在の時間に達すると）：

- `DELETE` - 期限切れ行を削除（デフォルトのアクション）；
- `RECOMPRESS codec_name` - `codec_name`でデータパートを再圧縮します；
- `TO DISK 'aaa'` - 部品をディスク`aaa`に移動します；
- `TO VOLUME 'bbb'` - 部品をディスク`bbb`に移動します；
- `GROUP BY` - 期限切れ行を集約します。

`DELETE`アクションは、フィルタ条件に基づいて期限切れ行の一部のみを削除するために`WHERE`句と一緒に使用できます：
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

`GROUP BY`式はテーブルの主キーのプレフィックスでなければなりません。

カラムが`GROUP BY`式の一部でなく、`SET`句で明示的に設定されていない場合、結果行にはグループ化された行からの偶発的な値が含まれます（集約関数`any`がそれに適用されているかのように）。

**例**
#### `TTL`でテーブルを作成する: {#creating-a-table-with-ttl-1}

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

1か月後に期限切れになる行を持つテーブルを作成します。期限切れの行は日付が月曜日のときに削除されます：

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

期限切れ行が集約されるテーブルを作成します。結果行の`x`はグループ化された行の中で最大値を持ち、`y`は最小値、`d`はグループ化された行からの偶発的な値を持ちます。

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
### Removing Expired Data {#mergetree-removing-expired-data}

期限切れの`TTL`を持つデータは、ClickHouseがデータパーツをマージするときに削除されます。

ClickHouseがデータが期限切れであることを検出した場合、スケジュール外のマージを実行します。そのようなマージの頻度を制御するには、`merge_with_ttl_timeout`を設定できます。値が低すぎると、多くのスケジュール外のマージが行われる可能性があり、リソースを多く消費することがあります。

マージの間に`SELECT`クエリを実行すると、期限切れのデータが取得されることがあります。それを避けるためには、`SELECT`の前に[OPTIMIZE](/sql-reference/statements/optimize.md)クエリを使用してください。

**参照**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)設定
## Disk types {#disk-types}

ローカルブロックデバイスに加えて、ClickHouseは次のストレージタイプをサポートしています：
- [`s3` for S3 and MinIO](#table_engine-mergetree-s3)
- [`gcs` for GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` for Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` for HDFS](/engines/table-engines/integrations/hdfs)
- [`web` for read-only from web](/operations/storing-data#web-storage)
- [`cache` for local caching](/operations/storing-data#using-local-cache)
- [`s3_plain` for backups to S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` for immutable, non-replicated tables in S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## Using Multiple Block Devices for Data Storage {#table_engine-mergetree-multiple-volumes}
### Introduction {#introduction}

`MergeTree`ファミリーのテーブルエンジンは、複数のブロックデバイスにデータを保存することができます。例えば、特定のテーブルのデータが暗黙的に「ホット」と「コールド」に分割されている場合に役立ちます。最新のデータは定期的にリクエストされますが、ごく少量のスペースしか必要ありません。その反対に、太い尾の履歴データは希にリクエストされます。複数のディスクが利用可能な場合、「ホット」データは高速ディスク（例えば、NVMe SSDまたはメモリ内）に置かれ、「コールド」データは比較的遅いもの（例えば、HDD）に置かれる場合があります。

データパートは`MergeTree`エンジンテーブルの最小可動単位です。1つのパーツに属するデータは1つのディスクに保存されます。データパーツは、ユーザー設定に応じてバックグラウンドでディスク間を移動したり、[ALTER](/sql-reference/statements/alter/partition)クエリによって移動したりできます。
### Terms {#terms}

- ディスク — ファイルシステムにマウントされたブロックデバイス。
- デフォルトディスク — [path](/operations/server-configuration-parameters/settings.md/#path)サーバー設定で指定されたパスを格納するディスク。
- ボリューム — 同等のディスクの順序付けされたセット（[JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)に似ています）。
- ストレージポリシー — ボリュームのセットとそれらの間でデータを移動するためのルール。

記述されたエンティティに付けられた名前は、システムテーブル`[system.storage_policies](/operations/system-tables/storage_policies)`および`[system.disks](/operations/system-tables/disks)`で見つけることができます。テーブルに構成されたストレージポリシーの1つを適用するには、`MergeTree`エンジンファミリのテーブルの`storage_policy`設定を使用します。
### Configuration {#table_engine-mergetree-multiple-volumes_configure}

ディスク、ボリューム、およびストレージポリシーは、`config.d`ディレクトリ内のファイルの中にある`<storage_configuration>`タグ内に宣言する必要があります。

:::tip
ディスクは、クエリの`SETTINGS`セクションに宣言することもできます。これは、例えば、URLでホストされているディスクを一時的に接続するための便利です。詳細については[動的ストレージ](/operations/storing-data#dynamic-configuration)を参照してください。
:::

構成構造：

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
- `path` — サーバーがデータ（`data`および`shadow`フォルダー）を保存するパスで、`/`で終わる必要があります。
- `keep_free_space_bytes` — 保存されるべきフリースペースの量。

ディスク定義の順序は重要ではありません。

ストレージポリシー構成マークアップ：

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
                    <!-- 構成 -->
                </volume_name_2>
                <!-- 他のボリューム -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- 構成 -->
        </policy_name_2>

        <!-- 他のポリシー -->
    </policies>
    ...
</storage_configuration>
```

タグ：

- `policy_name_N` — ポリシー名。ポリシー名は一意である必要があります。
- `volume_name_N` — ボリューム名。ボリューム名は一意である必要があります。
- `disk` — ボリューム内のディスク。
- `max_data_part_size_bytes` — ボリュームのどのディスクにも保存できるパーツの最大サイズ。マージされたパーツのサイズが`max_data_part_size_bytes`を超えると、そのパーツは次のボリュームに書き込まれます。この機能により、新しい小さなパーツをホット（SSD）ボリュームに保持し、大きなサイズに達したときにコールド（HDD）ボリュームに移動できます。この設定は、ポリシーに1つのボリュームだけがある場合は使用しないでください。
- `move_factor` — 利用可能なスペースがこのファクターより少なくなると、データは自動的に次のボリュームに移動し始めます（デフォルトは0.1）。ClickHouseは、現存するパーツをサイズが大きいものから小さいものへと降順に並べ、`move_factor`条件を満たすために十分なサイズのパーツを選択します。すべてのパーツの合計サイズが不十分な場合は、すべてのパーツが移動されます。
- `perform_ttl_move_on_insert` — データパートINSERT時のTTL移動を無効にします。デフォルト（有効な場合）の状態では、TTL移動ルールによりすでに期限切れのデータパートを挿入すると、そのパーツは直ちに移動ルールに宣言されたボリューム/ディスクに移動されます。これは、宛先ボリューム/ディスクが遅い場合（例：S3）には挿入を大幅に遅くする可能性があります。無効にした場合は、期限切れのデータパートがデフォルトボリュームに書き込まれ、その後すぐにTTLボリュームに移動されます。
- `load_balancing` - ディスクバランスのポリシー、`round_robin`または`least_used`。
- `least_used_ttl_ms` - すべてのディスクで更新可能なスペースを更新するためのタイムアウト（ミリ秒）（`0` - 常に更新, `-1` - 更新しない, デフォルトは`60000`）。注意、ディスクがClickHouseのみに使用可能で、オンラインファイルシステムのリサイズ/縮小の影響を受けない場合は、`-1`を使用してもよいですが、そうでない場合は推奨されません。最終的には、不正確なスペース配分につながるためです。
- `prefer_not_to_merge` — この設定は使用しないでください。ボリューム上のデータパーツのマージを無効にします（これは有害でパフォーマンスの低下につながります）。この設定が有効になっている状態では（使用しないでください）、このボリュームでデータのマージが許可されません（これは悪い結果をもたらします）。これにより（しかし、あなたはそれを必要としません）、ClickHouseが遅いディスクでどのように動作するかを制御できます（しかし、ClickHouseの方がよく知っていますので、この設定を使用しないでください）。
- `volume_priority` — ボリュームが埋められる順序を定義します。低い値は高い優先度を示します。パラメータ値は自然数であり、1からNの範囲を一緒にカバーするべきです（最低の優先度）。 
  * すべてのボリュームにタグが付けられている場合、それらは指定された順序で優先されます。
  * 一部のボリュームにのみタグが付けられている場合、タグなしのボリュームは最低の優先度を持ち、定義された順序で優先されます。
  * タグが付けられていない場合、優先度は構成で宣言された順序に応じて設定されます。
  * 2つのボリュームは同じ優先度の値を持つことができません。

構成の例：

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

与えられた例では、`hdd_in_order`ポリシーは[ラウンドロビン](https://en.wikipedia.org/wiki/Round-robin_scheduling)アプローチを実装します。このポリシーは1つのボリューム（`single`）のみを定義し、データパーツはそのすべてのディスクに円環式で保存されます。このようなポリシーは、複数の類似のディスクがシステムにマウントされているが、RAIDが構成されていない場合には非常に有用です。各個々のディスクドライブは信頼性がなく、レプリケーション係数を3以上にしたい場合があります。

システム内にさまざまな種類のディスクが利用可能な場合、`moving_from_ssd_to_hdd`ポリシーを代わりに使用できます。ボリューム`hot`はSSDディスク（`fast_ssd`）からなり、そこに保存できるパートの最大サイズは1GBです。1GBを超えるサイズのすべてのパーツは、HDDディスク`disk1`を含む`cold`ボリュームに直接保存されます。また、ディスク`fast_ssd`が80％以上充填されると、データはバックグラウンドプロセスによって`disk1`に転送されます。

ストレージポリシー内のボリュームの列挙順序は、少なくとも1つのボリュームに明示的な`volume_priority`パラメータがない場合に重要です。
ボリュームが過剰に満たされると、データは次のボリュームに移動されます。ディスクの列挙順序も重要です。データは順に保存されます。

テーブルを作成する際には、設定されたストレージポリシーの1つを適用できます：

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

`default`ストレージポリシーは、`<path>`で指定された1つのディスクのみを含むボリュームを使用することを意味します。
テーブル作成後にストレージポリシーを変更するには、[ALTER TABLE ... MODIFY SETTING]クエリを使用し、新しいポリシーにすべての古いディスクと同名のボリュームを含める必要があります。

データパーツのバックグラウンド移動を実行するスレッド数は、[background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size)設定で変更できます。
### Details {#details}

`MergeTree`テーブルの場合、データはさまざまな方法でディスクに到達します：

- 挿入（`INSERT`クエリ）の結果として。
- バックグラウンドマージおよび[ミューテーション](/sql-reference/statements/alter#mutations)中。
- 別のレプリカからのダウンロード時。
- パーティションのフリーズ結果として、[ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition)。

これらのケースは、ミューテーションやパーティションのフリーズを除き、パートは指定されたストレージポリシーに応じてボリュームおよびディスクに保存されます：

1. 保存パート用に十分なディスクスペースがある最初のボリューム（定義の順序で）が選択されます（`unreserved_space > current_part_size`）および指定されたサイズのパーツを保存することが許可される（`max_data_part_size_bytes > current_part_size`）。
2. このボリューム内で、前回のデータのチャンクを格納するために使用されたディスクの次のディスクが選択され、パートサイズよりもフリースペースが多いディスク（`unreserved_space - keep_free_space_bytes > current_part_size`）が選択されます。

内部では、ミューテーションやパーティションのフリーズは[ハードリンク](https://ja.wikipedia.org/wiki/ハードリンク)を利用します。異なるディスク間のハードリンクはサポートされていないため、そのような場合、結果のパーツは初期のものと同じディスクに保存されます。

バックグラウンドでは、ボリューム間での移動は、フリースペースの量（`move_factor`パラメータ）に基づいて構成ファイルで宣言された順序に従います。
データは最後のボリュームから最初のボリュームに移動されることはありません。バックグラウンド移動を監視するために、システムテーブル`[system.part_log](/operations/system-tables/part_log)`（フィールド`type = MOVE_PART`）および`[system.parts](/operations/system-tables/parts.md)`（フィールド`path`および`disk`）を使用できます。また、詳細情報はサーバーログで見つけることができます。

ユーザーは、[ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition)クエリを使用して、パートやパーティションを1つのボリュームから別のボリュームに強制的に移動させることができます。すべての背景操作に関する制限が考慮されます。このクエリは、自身で移動を開始し、バックグラウンド操作の完了を待機しません。無料スペースが不十分な場合や、必要条件が満たされていない場合、ユーザーはエラーメッセージを受け取ります。

データの移動はデータレプリケーションに干渉しません。したがって、同じテーブルに対して異なるストレージポリシーを異なるレプリカに指定できます。

バックグラウンドマージとミューテーションが完了した後、古いパーツは一定の期間（`old_parts_lifetime`）の後にのみ削除されます。
この期間中、他のボリュームやディスクには移動されません。したがって、パーツが最終的に削除されるまで、そのサイズは占有スペースの評価に考慮されます。

ユーザーは、[JBOD](https://ja.wikipedia.org/wiki/Non-RAID_drive_architectures)ボリュームの異なるディスクに新しい大きなパーツを均等に割り当てることができます。これは、[min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod)設定を使用して実現します。
## 外部ストレージを使用したデータストレージ {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンは、`S3`、`AzureBlobStorage`、`HDFS` にデータを保存することができ、タイプ `s3`、`azure_blob_storage`、`hdfs` に応じてディスクを使用します。詳細については、[外部ストレージオプションの構成](/operations/storing-data.md/#configuring-external-storage)を参照してください。

外部ストレージとしての [S3](https://aws.amazon.com/s3/) の例で、ディスクタイプは `s3` です。

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

また、[外部ストレージオプションの構成](/operations/storing-data.md/#configuring-external-storage)も参照してください。

:::note キャッシュ設定
ClickHouse バージョン 22.3 から 22.7 までは異なるキャッシュ設定が使用されているため、これらのバージョンを使用している場合は、[ローカルキャッシュの使用](/operations/storing-data.md/#using-local-cache)を参照してください。
:::
## バーチャルカラム {#virtual-columns}

- `_part` — パートの名前。
- `_part_index` — クエリ結果におけるパートの順次インデックス。
- `_part_starting_offset` — クエリ結果におけるパートの累積開始行。
- `_part_offset` — パート内の行番号。
- `_partition_id` — パーティションの名前。
- `_part_uuid` — 一意のパート識別子 (MergeTree 設定 `assign_part_uuids` が有効な場合)。
- `_part_data_version` — パートのデータバージョン (最小ブロック番号またはミューテーションバージョン)。
- `_partition_value` — `partition by` 式の値 (タプル)。
- `_sample_factor` — サンプルファクター (クエリから)。
- `_block_number` — 行のブロック番号。`allow_experimental_block_number_column` が true に設定されると、マージ時に永続化されます。
## カラム統計 {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

統計の宣言は、`*MergeTree*` ファミリーのテーブルの `CREATE` クエリのカラムセクションにあり、`set allow_experimental_statistics = 1` を有効にしています。

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

統計は `ALTER` ステートメントを使用しても操作できます。

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

これらの軽量統計は、カラム内の値の分布に関する情報を集約します。統計はすべてのパートに保存され、各挿入のたびに更新されます。
これらは、`set allow_statistics_optimize = 1` を有効にする場合にのみ、prewhere 最適化に使用できます。
### 利用可能なカラム統計のタイプ {#available-types-of-column-statistics}

- `MinMax`

    数値カラムの範囲フィルタの選択性を推定可能にする列の最小値と最大値。

    構文: `minmax`

- `TDigest`

    数値カラムの近似パーセンタイル (例: 90 パーセンタイル) を計算するのに役立つ [TDigest](https://github.com/tdunning/t-digest) スケッチ。

    構文: `tdigest`

- `Uniq`

    列が含む一意の値の数を推定する [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) スケッチ。

    構文: `uniq`

- `CountMin`

    列内の各値の頻度の近似カウントを提供する [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) スケッチ。

    構文: `countmin`
### サポートされているデータ型 {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String または FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### サポートされている操作 {#supported-operations}

|           | 等価フィルタ (==) | 範囲フィルタ (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |
## カラムレベルの設定 {#column-level-settings}

特定の MergeTree 設定は、カラムレベルでオーバーライドできます:

- `max_compress_block_size` — テーブルに書き込む前に圧縮される未圧縮データの最大ブロックサイズ。
- `min_compress_block_size` — 次のマークを書き込む際に圧縮のために必要な未圧縮データの最小ブロックサイズ。

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

カラムレベルの設定は、[ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md) を使用して変更または削除できます。例えば:

- カラム宣言から `SETTINGS` を削除:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- 設定を変更:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- 1つまたは複数の設定をリセットし、同時にテーブルの CREATE クエリのカラム式から設定宣言を削除します。

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
