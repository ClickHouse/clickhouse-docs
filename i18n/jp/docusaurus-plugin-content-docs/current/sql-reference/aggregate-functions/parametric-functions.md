---
slug: /sql-reference/aggregate-functions/parametric-functions
sidebar_position: 38
sidebar_label: Parametric
---

# パラメトリック集約関数

一部の集約関数は、引数カラム（圧縮に使用される）だけでなく、初期化のための定数のセットであるパラメータも受け入れることができます。構文は、1つのペアの括弧の代わりに2つのペアの括弧が使用されます。最初はパラメータ用で、2番目は引数用です。
## histogram {#histogram}

適応型ヒストグラムを計算します。正確な結果を保証するものではありません。

``` sql
histogram(number_of_bins)(values)
```

この関数は、[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用しています。ヒストグラムのビンの境界は、新しいデータが関数に入力されると調整されます。一般的なケースでは、ビンの幅は平等ではありません。

**引数**

`values` — 入力値となる[式](../../sql-reference/syntax.md#syntax-expressions)。

**パラメータ**

`number_of_bins` — ヒストグラムのビンの数の上限。関数は自動的にビンの数を計算します。指定されたビンの数に達しようとしますが、失敗した場合は、少ないビンを使用します。

**返される値**

- 次の形式の[タプル](../../sql-reference/data-types/tuple.md)の[配列](../../sql-reference/data-types/array.md):

        ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

        - `lower` — ビンの下限。
        - `upper` — ビンの上限。
        - `height` — ビンの計算された高さ。

**例**

``` sql
SELECT histogram(5)(number + 1)
FROM (
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

``` text
┌─histogram(5)(plus(number, 1))───────────────────────────────────────────┐
│ [(1,4.5,4),(4.5,8.5,4),(8.5,12.75,4.125),(12.75,17,4.625),(17,20,3.25)] │
└─────────────────────────────────────────────────────────────────────────┘
```

ヒストグラムを視覚化するには、例えば[bar](/sql-reference/functions/other-functions#bar)関数を使用できます：

``` sql
WITH histogram(5)(rand() % 100) AS hist
SELECT
    arrayJoin(hist).3 AS height,
    bar(height, 0, 6, 5) AS bar
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

``` text
┌─height─┬─bar───┐
│  2.125 │ █▋    │
│   3.25 │ ██▌   │
│  5.625 │ ████▏ │
│  5.625 │ ████▏ │
│  3.375 │ ██▌   │
└────────┴───────┘
```

この場合、ヒストグラムのビンの境界を知っていないことを覚えておいてください。
## sequenceMatch {#sequencematch}

シーケンスがパターンに一致するイベントチェーンを含んでいるかどうかをチェックします。

**構文**

``` sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生するイベントは、結果に影響を与える不定順序でシーケンスに配置される可能性があります。
:::

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。サポートされている任意の[UInt](../../sql-reference/data-types/int-uint.md)データ型を使用することも可能です。

- `cond1`, `cond2` — イベントのチェーンを記述する条件。データ型： `UInt8`。最大で32の条件引数を渡すことができます。この関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、そのデータはスキップされます。

**パラメータ**

- `pattern` — パターン文字列。[パターン構文](#pattern-syntax)を参照してください。

**返される値**

- パターンが一致する場合は1。
- パターンが一致しない場合は0。

タイプ： `UInt8`。
#### パターン構文 {#pattern-syntax}

- `(?N)` — ポジション`N`の条件引数に一致します。条件には`[1, 32]`の範囲内で番号が付けられます。たとえば、`(?1)`は`cond1`パラメータに渡された引数に一致します。

- `.*` — 任意の数のイベントに一致します。この要素のパターンに一致させるために条件引数は必要ありません。

- `(?t operator value)` — 2つのイベントを区切る秒数を設定します。たとえば、パターン`(?1)(?t>1800)(?2)`は、1800秒以上の間隔で発生するイベントに一致します。これらのイベントの間に任意の数の他のイベントが存在することができます。`>=`、`>`、`<`、`<=`、`==`の演算子を使用できます。

**例**

`t`テーブルにあるデータを考えます：

``` text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

クエリを実行します：

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

この関数は、数値2が数値1の後に続くイベントチェーンを見つけました。数値3はイベントとして記述されていないため、その間でスキップされました。例の中で与えられたイベントチェーンを見つける際に、この数値を考慮に入れたい場合は、それに対して条件を作成する必要があります。

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、数値3のイベントが1と2の間に発生したため、関数はパターンに一致するイベントチェーンを見つけることができませんでした。同じ場合に数値4の条件をチェックした場合、シーケンスはパターンに一致します。

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [sequenceCount](#sequencecount)
## sequenceCount {#sequencecount}

パターンに一致するイベントチェーンの数をカウントします。この関数は、重複しないイベントチェーンを検索します。現在のチェーンが一致した後、次のチェーンを検索し始めます。

:::note
同じ秒に発生するイベントは、結果に影響を与える不定順序でシーケンスに配置される可能性があります。
:::

**構文**

``` sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。サポートされている任意の[UInt](../../sql-reference/data-types/int-uint.md)データ型を使用することも可能です。

- `cond1`, `cond2` — イベントのチェーンを記述する条件。データ型： `UInt8`。最大で32の条件引数を渡すことができます。この関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、そのデータはスキップされます。

**パラメータ**

- `pattern` — パターン文字列。[パターン構文](#pattern-syntax)を参照してください。

**返される値**

- 一致した重複しないイベントチェーンの数。

タイプ： `UInt64`。

**例**

`t`テーブルにあるデータを考えます：

``` text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

任意の数の他の数値の間に、数値2が数値1の後に何回発生するかをカウントします：

``` sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

``` text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```
## sequenceMatchEvents {#sequencematchevents}

パターンに一致した最長のイベントチェーンのイベントのタイムスタンプを返します。

:::note
同じ秒に発生するイベントは、結果に影響を与える不定順序でシーケンスに配置される可能性があります。
:::

**構文**

``` sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。サポートされている任意の[UInt](../../sql-reference/data-types/int-uint.md)データ型を使用することも可能です。

- `cond1`, `cond2` — イベントのチェーンを記述する条件。データ型： `UInt8`。最大で32の条件引数を渡すことができます。この関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、そのデータはスキップされます。

**パラメータ**

- `pattern` — パターン文字列。[パターン構文](#pattern-syntax)を参照してください。

**返される値**

- イベントチェーンからの一致した条件引数(?N)のタイムスタンプの配列。配列の位置はパターンにおける条件引数の位置と一致します。

タイプ： 配列。

**例**

`t`テーブルにあるデータを考えます：

``` text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

最長のチェーンのイベントのタイムスタンプを返します：

``` sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

``` text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [sequenceMatch](#sequencematch)
## windowFunnel {#windowfunnel}

スライディングウィンドウ内でイベントチェーンを検索し、チェーンから発生した最大のイベント数を計算します。

関数は次のアルゴリズムに従って動作します：

- 関数は、チェーン内の最初の条件をトリガーするデータを検索し、イベントカウンタを1に設定します。これがスライディングウィンドウの開始時です。

- チェーン内のイベントがウィンドウ内で順次発生する場合、カウンタはインクリメントされます。イベントのシーケンスが乱れると、カウンタはインクリメントされません。

- データに異なる完了ポイントに弾かれた複数のイベントチェーンがある場合、関数は最長のチェーンのサイズのみを出力します。

**構文**

``` sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされるデータ型：[Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md#data_type-datetime)および他の符号なし整数型（タイムスタンプは`UInt64`型をサポートしていますが、その値はInt64の最大値である2^63 - 1を超えることはできません）。
- `cond` — イベントのチェーンを記述する条件またはデータ。[UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `window` — スライディングウィンドウの長さで、最初の条件と最後の条件の間の時間の間隔です。`window`の単位は`timestamp`自体に依存し、異なります。`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`という式を使用して決定されます。
- `mode` — 任意の引数です。1つ以上のモードを設定できます。
    - `'strict_deduplication'` — 同じ条件がイベントのシーケンスに当てはまる場合、そのような繰り返しイベントはさらに処理を中断します。注意：同じイベントに対して複数の条件が当てはまる場合には、予期しない動作をする可能性があります。
    - `'strict_order'` — 他のイベントの介入を許可しません。例えば、`A->B->D->C`の場合、`D`で`A->B->C`の検索を停止し、最大イベントレベルは2になります。
    - `'strict_increase'` — 厳密に増加するタイムスタンプを持つイベントにのみ条件を適用します。
    - `'strict_once'` — 条件に複数回当てはまっても、チェーン内で各イベントは一度だけカウントされます。

**返される値**

スライディング時間ウィンドウ内でトリガーされた条件の最大数。選択内のすべてのチェーンが分析されます。

タイプ： `Integer`。

**例**

ユーザーがオンラインストアで携帯電話を選択して2回購入するのに十分な期間かどうかを判定します。

次のイベントチェーンを設定します：

1. ユーザーがストアのアカウントにログインした（`eventID = 1003`）。
2. ユーザーが携帯電話を検索した（`eventID = 1007, product = 'phone'`）。
3. ユーザーが注文を行った（`eventID = 1009`）。
4. ユーザーが再度注文を行った（`eventID = 1010`）。

入力テーブル：

``` text
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-28 │       1 │ 2019-01-29 10:00:00 │    1003 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-31 │       1 │ 2019-01-31 09:00:00 │    1007 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-01-30 │       1 │ 2019-01-30 08:00:00 │    1009 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
┌─event_date─┬─user_id─┬───────────timestamp─┬─eventID─┬─product─┐
│ 2019-02-01 │       1 │ 2019-02-01 08:00:00 │    1010 │ phone   │
└────────────┴─────────┴─────────────────────┴─────────┴─────────┘
```

2019年1月から2月の間に、ユーザー`user_id`がどのくらい進んだかを調べます。

クエリ：

``` sql
SELECT
    level,
    count() AS c
FROM
(
    SELECT
        user_id,
        windowFunnel(6048000000000000)(timestamp, eventID = 1003, eventID = 1009, eventID = 1007, eventID = 1010) AS level
    FROM trend
    WHERE (event_date >= '2019-01-01') AND (event_date <= '2019-02-02')
    GROUP BY user_id
)
GROUP BY level
ORDER BY level ASC;
```

結果：

``` text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```
## retention {#retention}

この関数は、イベントに対して特定の条件が満たされたかどうかを示す型`UInt8`の条件を1から32の引数セットとして受け取ります。
任意の条件を引数として指定できます（[WHERE](../../sql-reference/statements/select/where.md#select-where)のように）。

条件は、1つ目の条件を除いて、対で適用されます：2つ目の条件が真であれば、1つ目と2つ目が真である場合、3つ目は1つ目と3つ目が真である場合、等々。

**構文**

``` sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8`結果（1または0）を返す式。

**返される値**

1または0の配列。

- 1 — イベントの条件が満たされました。
- 0 — イベントの条件は満たされませんでした。

タイプ： `UInt8`。

**例**

サイトトラフィックを判断するために`retention`関数を使用する例を考えます。

**1.** 例を示すためのテーブルを作成します。

``` sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

入力テーブル：

クエリ：

``` sql
SELECT * FROM retention_test
```

結果：

``` text
┌───────date─┬─uid─┐
│ 2020-01-01 │   0 │
│ 2020-01-01 │   1 │
│ 2020-01-01 │   2 │
│ 2020-01-01 │   3 │
│ 2020-01-01 │   4 │
└────────────┴─────┘
┌───────date─┬─uid─┐
│ 2020-01-02 │   0 │
│ 2020-01-02 │   1 │
│ 2020-01-02 │   2 │
│ 2020-01-02 │   3 │
│ 2020-01-02 │   4 │
│ 2020-01-02 │   5 │
│ 2020-01-02 │   6 │
│ 2020-01-02 │   7 │
│ 2020-01-02 │   8 │
│ 2020-01-02 │   9 │
└────────────┴─────┘
┌───────date─┬─uid─┐
│ 2020-01-03 │   0 │
│ 2020-01-03 │   1 │
│ 2020-01-03 │   2 │
│ 2020-01-03 │   3 │
│ 2020-01-03 │   4 │
│ 2020-01-03 │   5 │
│ 2020-01-03 │   6 │
│ 2020-01-03 │   7 │
│ 2020-01-03 │   8 │
│ 2020-01-03 │   9 │
│ 2020-01-03 │  10 │
│ 2020-01-03 │  11 │
│ 2020-01-03 │  12 │
│ 2020-01-03 │  13 │
│ 2020-01-03 │  14 │
└────────────┴─────┘
```

**2.** `retention`関数を使用して、ユーザーをユニークID `uid`でグループ化します。

クエリ：

``` sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

結果：

``` text
┌─uid─┬─r───────┐
│   0 │ [1,1,1] │
│   1 │ [1,1,1] │
│   2 │ [1,1,1] │
│   3 │ [1,1,1] │
│   4 │ [1,1,1] │
│   5 │ [0,0,0] │
│   6 │ [0,0,0] │
│   7 │ [0,0,0] │
│   8 │ [0,0,0] │
│   9 │ [0,0,0] │
│  10 │ [0,0,0] │
│  11 │ [0,0,0] │
│  12 │ [0,0,0] │
│  13 │ [0,0,0] │
│  14 │ [0,0,0] │
└─────┴─────────┘
```

**3.** 各日のサイト訪問の総数を計算します。

クエリ：

``` sql
SELECT
    sum(r[1]) AS r1,
    sum(r[2]) AS r2,
    sum(r[3]) AS r3
FROM
(
    SELECT
        uid,
        retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
    FROM retention_test
    WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
    GROUP BY uid
)
```

結果：

``` text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

ここで：

- `r1` - 2020年1月1日（`cond1`条件）の間にサイトを訪問したユニークな訪問者の数。
- `r2` - 2020年1月1日から2020年1月2日の特定の期間にサイトを訪問したユニークな訪問者の数（`cond1`と`cond2`条件）。
- `r3` - 2020年1月1日と2020年1月3日にサイトを訪問したユニークな訪問者の数（`cond1`と`cond3`条件）。
## uniqUpTo(N)(x) {#uniquptonx}

引数の異なる値の数を、指定された制限`N`まで計算します。異なる引数の値の数が`N`を超える場合、この関数は`N` + 1を返します。それ以外の場合は、正確な値を計算します。

`N`に関しては小さな値（最大で10）での使用が推奨されます。`N`の最大値は100です。

集約関数の状態について、この関数はメモリ量を1 + `N` * 1つの値のサイズのバイトとして使用します。
文字列を扱うとき、この関数は8バイトの非暗号化のハッシュを保存します。計算は文字列についておおよそ行われます。

たとえば、ユーザーがウェブサイトで行ったすべての検索クエリをログに記録するテーブルがあるとします。テーブルの各行は、ユーザーID、検索クエリ、およびクエリのタイムスタンプの列を持つ単一の検索クエリを表します。`uniqUpTo`を使用して、少なくとも5人のユニークなユーザーによって使用されたキーワードのみを示すレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`は、各`SearchPhrase`についてユニークな`UserID`の値の数を計算しますが、4つのユニークな値までしかカウントしません。`SearchPhrase`に対するユニークな`UserID`の値が4つを超える場合、関数は5（4 + 1）を返します。`HAVING`句は、ユニークな`UserID`の値が5未満の`SearchPhrase`の値を除外します。これにより、少なくとも5人のユニークなユーザーによって使用された検索キーワードのリストが得られます。
## sumMapFiltered {#summapfiltered}

この関数は、[sumMap](../../sql-reference/aggregate-functions/reference/summap.md#agg_functions-summap)と同様に動作しますが、フィルタリングするためのキーの配列も引数として受け入れます。これは、高いカーディナリティのキーを使用する場合に特に便利です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- ソートされた順序のキーと、対応するキーの値を合計した2つの配列からなるタプルを返します。

**例**

クエリ：

```sql
CREATE TABLE sum_map
(
    `date` Date,
    `timeslot` DateTime,
    `statusMap` Nested(status UInt16, requests UInt64)
)
ENGINE = Log

INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10]);
```

```sql
SELECT sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests) FROM sum_map;
```

結果：

```response
   ┌─sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests)─┐
1. │ ([1,4,8],[10,20,10])                                            │
   └─────────────────────────────────────────────────────────────────┘
```
## sumMapFilteredWithOverflow {#summapfilteredwithoverflow}

この関数は、[sumMap](../../sql-reference/aggregate-functions/reference/summap.md#agg_functions-summap)と同様に動作しますが、フィルタリングするためのキーの配列も引数として受け入れます。これは、高いカーディナリティのキーを使用する場合に特に便利です。[sumMapFiltered](#summapfiltered)関数との違いは、オーバーフローでの総和を行うことです。つまり、合計の戻り値が引数のデータ型に等しくなります。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- ソートされた順序のキーと、対応するキーの値を合計した2つの配列からなるタプルを返します。

**例**

この例では、`sum_map`というテーブルを作成し、そこにデータを挿入し、`sumMapFilteredWithOverflow`および`sumMapFiltered`と`toTypeName`関数を使用して結果を比較します。テーブルで`requests`が`UInt8`型であった場合、`sumMapFiltered`は合計値の型を`UInt64`に昇格させてオーバーフローを回避しましたが、`sumMapFilteredWithOverflow`はオーバーフローが発生したにもかかわらず型を`UInt8`のまま保持しました。

クエリ：

```sql
CREATE TABLE sum_map
(
    `date` Date,
    `timeslot` DateTime,
    `statusMap` Nested(status UInt8, requests UInt8)
)
ENGINE = Log

INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10]),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10]);
```

```sql
SELECT sumMapFilteredWithOverflow([1, 4, 8])(statusMap.status, statusMap.requests) as summap_overflow, toTypeName(summap_overflow) FROM sum_map;
```

```sql
SELECT sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests) as summap, toTypeName(summap) FROM sum_map;
```

結果：

```response
   ┌─summap_overflow───────────┬─toTypeName(summap_overflow)────────────────┐
1. │ ([1,4,8],[10,10,10])  │ Tuple(Array(UInt8), Array(UInt8)) │
   └───────────────────────┴────────────────────────────────────┘
```

```response
   ┌─sum──────────────────┬─toTypeName(sum)───────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt64)) │
   └──────────────────────┴───────────────────────────────────┘
```
## sequenceNextNode {#sequencenextnode}

イベントチェーンにマッチした次のイベントの値を返します。

_実験的な関数であり、`SET allow_experimental_funnel_functions = 1` を有効にする必要があります。_

**構文**

``` sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — 進む方向を指定します。
    - forward — 前に進む。
    - backward — 後ろに戻る。

- `base` — ベースポイントを設定します。
    - head — ベースポイントを最初のイベントに設定。
    - tail — ベースポイントを最後のイベントに設定。
    - first_match — ベースポイントを最初にマッチした `event1` に設定。
    - last_match — ベースポイントを最後にマッチした `event1` に設定。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md), [DateTime](../../sql-reference/data-types/datetime.md#data_type-datetime) および他の符号なし整数型。
- `event_column` — 返される次のイベントの値を含むカラムの名前。サポートされているデータ型: [String](../../sql-reference/data-types/string.md) および [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — ベースポイントが満たさなければならない条件。
- `event1`, `event2`, ... — イベントチェーンを示す条件。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンが一致しない場合または次の値が存在しない場合。

タイプ: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントが A->B->C->D->E の場合、B->C の後のイベントである D を知りたいときに使用できます。

A->B の後のイベントを検索するクエリステートメント:

``` sql
CREATE TABLE test_flow (
    dt DateTime,
    id int,
    page String)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(dt)
ORDER BY id;

INSERT INTO test_flow VALUES (1, 1, 'A') (2, 1, 'B') (3, 1, 'C') (4, 1, 'D') (5, 1, 'E');

SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'A', page = 'A', page = 'B') as next_flow FROM test_flow GROUP BY id;
```

結果:

``` text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward` と `head` の動作**

``` sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

``` sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // ベースポイント, Home にマッチ
 1970-01-01 09:00:02    1   Gift // Gift にマッチ
 1970-01-01 09:00:03    1   Exit // 結果

 1970-01-01 09:00:01    2   Home // ベースポイント, Home にマッチ
 1970-01-01 09:00:02    2   Home // Gift に不一致
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // ベースポイント, Home に不一致
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward` と `tail` の動作**

``` sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // ベースポイント, Basket に不一致

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // Gift にマッチ
1970-01-01 09:00:04    2   Basket // ベースポイント, Basket にマッチ

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // ベースポイント, Gift にマッチ
1970-01-01 09:00:04    3   Basket // ベースポイント, Basket にマッチ
```

**`forward` と `first_match` の動作**

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // ベースポイント
1970-01-01 09:00:03    1   Exit // 結果

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // ベースポイント
1970-01-01 09:00:04    2   Basket // 結果

1970-01-01 09:00:01    3   Gift // ベースポイント
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // ベースポイント
1970-01-01 09:00:03    1   Exit // Home に不一致

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // ベースポイント
1970-01-01 09:00:04    2   Basket // Home に不一致

1970-01-01 09:00:01    3   Gift // ベースポイント
1970-01-01 09:00:02    3   Home // Home にマッチ
1970-01-01 09:00:03    3   Gift // 結果
1970-01-01 09:00:04    3   Basket
```

**`backward` と `last_match` の動作**

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // 結果
1970-01-01 09:00:02    1   Gift // ベースポイント
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // ベースポイント
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // ベースポイント
1970-01-01 09:00:04    3   Basket
```

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Home にマッチ, 結果は null
1970-01-01 09:00:02    1   Gift // ベースポイント
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // 結果
1970-01-01 09:00:02    2   Home // Home にマッチ
1970-01-01 09:00:03    2   Gift // ベースポイント
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // 結果
1970-01-01 09:00:02    3   Home // Home にマッチ
1970-01-01 09:00:03    3   Gift // ベースポイント
1970-01-01 09:00:04    3   Basket
```

**`base_condition` の動作**

``` sql
CREATE TABLE test_flow_basecond
(
    `dt` DateTime,
    `id` int,
    `page` String,
    `ref` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMMDD(dt)
ORDER BY id;

INSERT INTO test_flow_basecond VALUES (1, 1, 'A', 'ref4') (2, 1, 'A', 'ref3') (3, 1, 'B', 'ref2') (4, 1, 'B', 'ref1');
```

``` sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, ref = 'ref1', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // ヘッドは、ヘッドの ref カラムが 'ref1' に一致しないためベースポイントにはなれません。
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1
 ```

``` sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, ref = 'ref4', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1 // テールは、テールの ref カラムが 'ref4' に一致しないためベースポイントにはなれません。
```

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // この行は、ref カラムが 'ref3' に一致しないためベースポイントにはなれません。
 1970-01-01 09:00:02    1   A      ref3 // ベースポイント
 1970-01-01 09:00:03    1   B      ref2 // 結果
 1970-01-01 09:00:04    1   B      ref1
```

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 結果
 1970-01-01 09:00:03    1   B      ref2 // ベースポイント
 1970-01-01 09:00:04    1   B      ref1 // この行は、ref カラムが 'ref2' に一致しないためベースポイントにはなれません。
```
