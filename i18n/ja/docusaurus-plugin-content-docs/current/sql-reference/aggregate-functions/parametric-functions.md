---
slug: /sql-reference/aggregate-functions/parametric-functions
sidebar_position: 38
sidebar_label: パラメトリック
---

# パラメトリック集約関数

いくつかの集約関数は、圧縮に使用される引数のカラムだけでなく、初期化用の定数とするパラメータのセットも受け取ることができます。構文は、1つではなく2つの括弧のペアです。最初の括弧はパラメータ用であり、2つ目の括弧は引数用です。

## histogram {#histogram}

適応ヒストグラムを計算します。正確な結果を保証するものではありません。

```sql
histogram(number_of_bins)(values)
```

この関数は[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用しています。新しいデータが関数に入ると、ヒストグラムのビンの境界が調整されます。一般的なケースでは、ビンの幅は等しくありません。

**引数**

`values` — 入力値の結果となる[式](../../sql-reference/syntax.md#syntax-expressions)。

**パラメータ**

`number_of_bins` — ヒストグラム内のビンの最大数。この関数は自動的にビンの数を計算します。指定されたビンの数を達成しようとしますが、失敗した場合はそれより少ないビンを使用します。

**返される値**

- 次の形式の[タプル](../../sql-reference/data-types/tuple.md)の[配列](../../sql-reference/data-types/array.md)：

        ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

        - `lower` — ビンの下限境界。
        - `upper` — ビンの上限境界。
        - `height` — 調整されたビンの高さ。

**例**

```sql
SELECT histogram(5)(number + 1)
FROM (
    SELECT *
    FROM system.numbers
    LIMIT 20
)
```

```text
┌─histogram(5)(plus(number, 1))───────────────────────────────────────────┐
│ [(1,4.5,4),(4.5,8.5,4),(8.5,12.75,4.125),(12.75,17,4.625),(17,20,3.25)] │
└─────────────────────────────────────────────────────────────────────────┘
```

ヒストグラムを[bar](../../sql-reference/functions/other-functions.md#function-bar)関数で視覚化できます。例えば：

```sql
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

```text
┌─height─┬─bar───┐
│  2.125 │ █▋    │
│   3.25 │ ██▌   │
│  5.625 │ ████▏ │
│  5.625 │ ████▏ │
│  3.375 │ ██▌   │
└────────┴───────┘
```

この場合、ヒストグラムビンの境界はわからないことを思い出してください。

## sequenceMatch {#sequencematch}

シーケンスがパターンに一致するイベントチェーンを含むかどうかをチェックします。

**構文**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生するイベントは、順序が不定になり、結果に影響を与える場合があります。
:::

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。一般的なデータ型は`Date`と`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用することもできます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮に入れます。シーケンスに条件で説明されていないデータが含まれている場合、この関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。[パターンの構文](#pattern-syntax)を参照してください。

**返される値**

- パターンが一致した場合は1。
- パターンが一致しなかった場合は0。

型: `UInt8`。

#### パターンの構文 {#pattern-syntax}

- `(?N)` — 位置`N`の条件引数に一致します。条件は`[1, 32]`の範囲で番号付けされます。例えば、`(?1)`は`cond1`パラメータに渡された引数に一致します。

- `.*` — 任意の数のイベントに一致します。このパターンのこの要素に一致させるために条件引数は不要です。

- `(?t operator value)` — 二つのイベントを分けるべき秒数を設定します。例えば、パターン`(?1)(?t>1800)(?2)`は、1800秒以上離れて発生するイベントに一致します。この二つのイベントの間には任意の数のイベントが存在することができます。条件には`>=`、`>`、`<`、`<=`、`==`演算子を使用できます。

**例**

`t`テーブルのデータを考慮します：

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

クエリを実行します：

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

この関数は、2が1の後に続くイベントチェーンを見つけました。間に3がスキップされたのは、数がイベントとして説明されていないためです。この例で示されたイベントチェーンを検索する際にこの数も考慮に入れたい場合は、条件を作成する必要があります。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、関数はパターンに一致するイベントチェーンを見つけられませんでした。なぜなら3のイベントが1と2の間に発生したからです。同じ場合に4の条件をチェックすれば、シーケンスはパターンに一致します。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [sequenceCount](#sequencecount)

## sequenceCount {#sequencecount}

パターンに一致したイベントチェーンの数をカウントします。この関数は、重複しないイベントチェーンを検索します。現在のチェーンが一致すると次のチェーンの検索を開始します。

:::note
同じ秒に発生するイベントは、順序が不定になり、結果に影響を与える場合があります。
:::

**構文**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。一般的なデータ型は`Date`と`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用することもできます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮に入れます。シーケンスに条件で説明されていないデータが含まれている場合、この関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。[パターンの構文](#pattern-syntax)を参照してください。

**返される値**

- 一致した非重複イベントチェーンの数。

型: `UInt64`。

**例**

`t`テーブルのデータを考えます：

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

1の後で、間に他の数値があっても2が出現する回数をカウントします：

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```

## sequenceMatchEvents {#sequencematchevents}

パターンに一致する最長のイベントチェーンのイベントのタイムスタンプを返します。

:::note
同じ秒に発生するイベントは、順序が不定になり、結果に影響を与える場合があります。
:::

**構文**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。一般的なデータ型は`Date`と`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用することもできます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮に入れます。シーケンスに条件で説明されていないデータが含まれている場合、この関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。[パターンの構文](#pattern-syntax)を参照してください。

**返される値**

- イベントチェーンからの一致した条件引数(?N)のタイムスタンプの配列。配列内の位置は、パターン内の条件引数の位置に一致します。

型: 配列。

**例**

`t`テーブルのデータを考えます：

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
│    4 │      1 │
│    5 │      3 │
│    6 │      2 │
└──────┴────────┘
```

最長チェーンのイベントのタイムスタンプを返す：

```sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [sequenceMatch](#sequencematch)

## windowFunnel {#windowfunnel}

スライディングウィンドウ内でイベントチェーンを検索し、チェーンから発生した最大のイベント数を計算します。

この関数は次のアルゴリズムに従って機能します：

- この関数は、チェーンの最初の条件をトリガーするデータを検索し、イベントカウンタを1に設定します。これがスライディングウィンドウの開始時点です。

- チェーンのイベントがウィンドウ内で順次発生した場合、カウンタは増加します。イベントの順序が乱れた場合、カウンタは増加しません。

- データに異なる完了度を持つ複数のイベントチェーンがある場合、この関数は最長のチェーンのサイズのみを出力します。

**構文**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md#data_type-datetime) およびその他の符号なし整数型（タイムスタンプは`UInt64`型をサポートしているが、その値はInt64の最大値である2^63 - 1を超えてはいけません）。
- `cond` — イベントチェーンを記述する条件またはデータ。[UInt8](../../sql-reference/data-types/int-uint.md)です。

**パラメータ**

- `window` — スライディングウィンドウの長さで、最初の条件と最後の条件の間の時間間隔です。`window`の単位は`timestamp`そのものによって決定され、異なります。`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`という式を使用して決まります。
- `mode` — 任意の引数です。1つ以上のモードを設定できます。
    - `'strict_deduplication'` — イベントのシーケンスに同じ条件が保持される場合、そうした繰り返しイベントはその後の処理を中断します。注意: 1つのイベントに複数の条件が保持される場合、予期せぬ動作をする可能性があります。
    - `'strict_order'` — 他のイベントの介入を許可しません。例えば、`A->B->D->C`の場合、`D`で`A->B->C`の検索が停止し、最大イベントレベルは2になります。
    - `'strict_increase'` — 条件を厳密に増加するタイムスタンプを持つイベントのみに適用します。
    - `'strict_once'` — チェーン内で条件を満たしても各イベントを1度だけカウントします。

**返される値**

スライディングウィンドウ内でトリガーされた連続した条件の最大数。選択内のすべてのチェーンが分析されます。

型: `Integer`。

**例**

一定の期間、ユーザーがオンラインストアで電話を選び、再度購入するのに十分かどうかを確認します。

次のイベントチェーンを設定します：

1. ユーザーがストアのアカウントにログインした（`eventID = 1003`）。
2. ユーザーが電話を検索した（`eventID = 1007, product = 'phone'`）。
3. ユーザーが注文を出した（`eventID = 1009`）。
4. ユーザーが再度注文した（`eventID = 1010`）。

入力テーブル：

```text
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

クエリ：

```sql
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

```text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```

## retention {#retention}

この関数は、1から32の引数`UInt8`の条件のセットを引数として取り、イベントに対して特定の条件が満たされたかどうかを示します。
条件は、[WHERE](../../sql-reference/statements/select/where.md#select-where)のように任意に指定できます。

最初の条件を除くと、条件はペアで適用されます：二つ目が真であれば、最初と二つ目が真である場合、三つ目が真であれば、最初と三つ目が真である場合などです。

**構文**

```sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8`結果(1または0)を返す式。

**返される値**

1または0の配列。

- 1 — 条件がイベントに対して満たされた。
- 0 — 条件がイベントに対して満たされなかった。

型: `UInt8`。

**例**

サイトのトラフィックを測定するための`retention`関数の計算例を考えます。

**1.** 例を示すためのテーブルを作成します。

```sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

入力テーブル：

クエリ：

```sql
SELECT * FROM retention_test
```

結果：

```text
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

**2.** `retention`関数を使用してユニークID `uid`によってユーザーをグループ化します。

クエリ：

```sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

結果：

```text
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

**3.** 日ごとのサイト訪問者数を計算します。

クエリ：

```sql
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

```text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

ここで：

- `r1` — 2020-01-01（`cond1`条件）にサイトを訪れたユニークビジターの数。
- `r2` — 2020-01-01から2020-01-02の特定の期間にサイトを訪れたユニークビジターの数（`cond1`と`cond2`条件）。
- `r3` — 2020-01-01および2020-01-03にサイトを訪れたユニークビジターの数（`cond1`および`cond3`条件）。

## uniqUpTo(N)(x) {#uniquptonx}

指定された制限`N`までの引数の異なる値の数を計算します。異なる引数の値の数が`N`より大きい場合、この関数は`N + 1`を返します。そうでない場合は、正確な値を計算します。

小さな`N`（最大10）で使用することが推奨されます。`N`の最大値は100です。

集約関数の状態には、メモリの量が1 + `N` * 1つの値のバイトサイズに等しくなります。
文字列を扱う際、この関数は8バイトの非暗号化ハッシュを格納します。文字列の計算は近似されます。

たとえば、ユーザーがウェブサイトで行ったすべての検索クエリをログするテーブルがあるとします。テーブルの各行は、ユーザーID、検索クエリ、およびクエリのタイムスタンプを表示します。`uniqUpTo`を使用して、少なくとも5人のユニークユーザーが使用したキーワードのみを表示するレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`は各`SearchPhrase`のユニーク`UserID`値の数を計算しますが、4つのユニーク値までしかカウントしません。`SearchPhrase`のユニーク`UserID`値が4つ以上ある場合、関数は5（4 + 1）を返します。`HAVING`句は、ユニーク`UserID`値の数が5未満の`SearchPhrase`値をフィルタリングします。これにより、少なくとも5人のユニークユーザーによって使用された検索キーワードのリストが得られます。

## sumMapFiltered {#summapfiltered}

この関数は[sumMap](../../sql-reference/aggregate-functions/reference/summap.md#agg_functions-summap)と同じ動作をしますが、フィルタリングのためのキーの配列も引数として受け取ります。これは、高いカーディナリティのキーで作業する際に特に便利です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- ソートされた順序のキーの二つの配列（タプル）を返します。対応するキーの値が合計されます。

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

この関数は[sumMap](../../sql-reference/aggregate-functions/reference/summap.md#agg_functions-summap)と同じ動作をしますが、フィルタリングのためのキーの配列も引数として受け取ります。これは、高いカーディナリティのキーで作業する際に特に便利です。`sumMapFiltered`関数との違いは、オーバーフローを伴う合計を行い、引数データ型と同じデータ型で合計を返すことです。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- ソートされた順序のキーの二つの配列（タプル）を返します。対応するキーの値が合計されます。

**例**

この例では、`sum_map`というテーブルを作成し、データを挿入し、その後、`sumMapFilteredWithOverflow`、`sumMapFiltered`および`toTypeName`関数を使用して結果の比較を行います。作成されたテーブルでは、`requests`が`UInt8`型であるため、`sumMapFiltered`は合計値の型をオーバーフローを避けるために`UInt64`に昇格していますが、`sumMapFilteredWithOverflow`では型を`UInt8`のまま保持しているため、結果を格納するのに十分な大きさがなく、オーバーフローが発生します。

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
   ┌─sum──────────────────┬─toTypeName(sum)───────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt8)) │
   └──────────────────────┴───────────────────────────────────┘
```

```response
   ┌─summap───────────────┬─toTypeName(summap)─────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt64)) │
   └──────────────────────┴────────────────────────────────────┘
```

## sequenceNextNode {#sequencenextnode}

一致したイベントチェーンの次のイベントの値を返します。

_実験的な関数で、`SET allow_experimental_funnel_functions = 1`で有効にします。_

**構文**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — 方向をナビゲートするために使用されます。
    - forward — 前方に移動します。
    - backward — 後方に移動します。

- `base` — 基準点を設定するために使用されます。
    - head — 基準点を最初のイベントに設定します。
    - tail — 基準点を最後のイベントに設定します。
    - first_match — 基準点を最初に一致した`event1`に設定します。
    - last_match — 基準点を最後に一致した`event1`に設定します。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](../../sql-reference/data-types/datetime.md#data_type-datetime) およびその他の符号なし整数型。
- `event_column` — 次に返されるイベントの値を含むカラムの名前。サポートされているデータ型: [String](../../sql-reference/data-types/string.md) および [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基準点が満たさなければならない条件。
- `event1`, `event2`, ... — イベントのチェーンを説明する条件。[UInt8](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンに一致しないか、次の値が存在しない場合。

型: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

A->B->C->D->Eのイベントがあり、B->Cの次のイベントを知りたいとき、Dがそれに該当します。

A->Bの後のイベントを探すクエリ文：

```sql
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

結果：

```text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward`および`head`の場合の動作**

```sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // 基準点、一致
 1970-01-01 09:00:02    1   Gift // 一致
 1970-01-01 09:00:03    1   Exit // 結果

 1970-01-01 09:00:01    2   Home // 基準点、一致
 1970-01-01 09:00:02    2   Home // 一致
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // 基準点、一致しない
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward`および`tail`の場合の動作**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // 基準点、一致しない

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 基準点、一致
1970-01-01 09:00:04    3   Basket // 基準点、一致
```

**`forward`および`first_match`の場合の動作**

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit // 結果

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket // 結果

1970-01-01 09:00:01    3   Gift // 基準点
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit // 一致せず

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket // 一致せず

1970-01-01 09:00:01    3   Gift // 基準点
1970-01-01 09:00:02    3   Home // 一致
1970-01-01 09:00:03    3   Gift // 結果
1970-01-01 09:00:04    3   Basket
```

**`backward`および`last_match`の場合の動作**

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // 結果
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 基準点
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Homeに一致、結果はNULL
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // 結果
1970-01-01 09:00:02    2   Home // Homeに一致
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // 結果
1970-01-01 09:00:02    3   Home // Homeに一致
1970-01-01 09:00:03    3   Gift // 基準点
1970-01-01 09:00:04    3   Basket
```
``` sql
INSERT INTO test_flow_basecond VALUES (1, 1, 'A', 'ref4') (2, 1, 'A', 'ref3') (3, 1, 'B', 'ref2') (4, 1, 'B', 'ref1');
```

``` sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, ref = 'ref1', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // ヘッドは、ヘッドのリファレンスカラムが 'ref1' と一致しないため、ベースポイントにはなりません。
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
 1970-01-01 09:00:04    1   B      ref1 // テールは、テールのリファレンスカラムが 'ref4' と一致しないため、ベースポイントにはなりません。
```

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // この行は、リファレンスカラムが 'ref3' と一致しないため、ベースポイントにはなりません。
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
 1970-01-01 09:00:04    1   B      ref1 // この行は、リファレンスカラムが 'ref2' と一致しないため、ベースポイントにはなりません。
```
