---
description: 'パラメトリック集計関数のドキュメント'
sidebar_label: 'パラメトリック'
sidebar_position: 38
slug: /sql-reference/aggregate-functions/parametric-functions
title: 'パラメトリック集計関数'
doc_type: 'reference'
---



# パラメトリック集約関数

一部の集約関数は、引数カラム（圧縮に使用される）だけでなく、初期化に用いる定数パラメータの集合も受け取ることができます。構文としては、1 組ではなく 2 組の括弧を使用します。最初の括弧がパラメータ用、2 番目の括弧が引数用です。



## histogram {#histogram}

適応型ヒストグラムを計算します。正確な結果は保証されません。

```sql
histogram(number_of_bins)(values)
```

この関数は[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用します。ヒストグラムのビンの境界は、新しいデータが関数に入力されるたびに調整されます。通常、ビンの幅は等しくありません。

**引数**

`values` — 入力値を生成する[式](/sql-reference/syntax#expressions)。

**パラメータ**

`number_of_bins` — ヒストグラムのビン数の上限。関数は自動的にビン数を計算します。指定されたビン数に到達しようとしますが、到達できない場合はより少ないビン数を使用します。

**戻り値**

- 以下の形式の[タプル](../../sql-reference/data-types/tuple.md)の[配列](../../sql-reference/data-types/array.md)：

        ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

        - `lower` — ビンの下限。
        - `upper` — ビンの上限。
        - `height` — ビンの計算された高さ。

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

[bar](/sql-reference/functions/other-functions#bar)関数を使用してヒストグラムを視覚化できます。例：

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

この場合、ヒストグラムのビンの境界が不明であることに注意してください。


## sequenceMatch {#sequencematch}

シーケンスがパターンに一致するイベントチェーンを含むかどうかを確認します。

**構文**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生したイベントは、未定義の順序でシーケンスに配置される可能性があり、結果に影響を与える場合があります。
:::

**引数**

- `timestamp` — 時刻データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型も使用できます。

- `cond1`, `cond2` — イベントチェーンを記述する条件。データ型: `UInt8`。最大32個の条件引数を渡すことができます。この関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。[パターン構文](#pattern-syntax)を参照してください。

**戻り値**

- 1、パターンが一致した場合。
- 0、パターンが一致しなかった場合。

型: `UInt8`。

#### パターン構文 {#pattern-syntax}

- `(?N)` — 位置`N`の条件引数に一致します。条件は`[1, 32]`の範囲で番号付けされます。例えば、`(?1)`は`cond1`パラメータに渡された引数に一致します。

- `.*` — 任意の数のイベントに一致します。このパターン要素に一致させるために条件引数は必要ありません。

- `(?t operator value)` — 2つのイベント間の時間間隔を秒単位で設定します。例えば、パターン`(?1)(?t>1800)(?2)`は、互いに1800秒以上離れて発生するイベントに一致します。これらのイベントの間には任意の数のイベントが存在できます。`>=`、`>`、`<`、`<=`、`==`演算子を使用できます。

**例**

`t`テーブルのデータを考えます:

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

クエリを実行します:

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

この関数は、数値2が数値1に続くイベントチェーンを見つけました。数値3はイベントとして記述されていないため、その間の数値3をスキップしました。例で示されたイベントチェーンを検索する際にこの数値を考慮したい場合は、それに対する条件を作成する必要があります。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、数値3のイベントが1と2の間に発生したため、関数はパターンに一致するイベントチェーンを見つけることができませんでした。同じケースで数値4の条件を確認した場合、シーケンスはパターンに一致します。

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

パターンに一致したイベントチェーンの数をカウントします。この関数は重複しないイベントチェーンを検索します。現在のチェーンが一致した後、次のチェーンの検索を開始します。

:::note
同じ秒に発生したイベントは、未定義の順序でシーケンスに配置される可能性があり、結果に影響を与える場合があります。
:::

**構文**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時刻データを含むカラム。典型的なデータ型は`Date`と`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型も使用できます。

- `cond1`, `cond2` — イベントチェーンを記述する条件。データ型: `UInt8`。最大32個の条件引数を渡すことができます。この関数はこれらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。[パターン構文](#pattern-syntax)を参照してください。

**戻り値**

- 一致した重複しないイベントチェーンの数。

型: `UInt64`。

**例**

`t`テーブルのデータを考えます:

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

数値1の後に、その間に任意の数の他の数値を挟んで数値2が何回出現するかをカウントします:

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```


## sequenceMatchEvents {#sequencematchevents}

パターンに一致した最長のイベントチェーンのイベントタイムスタンプを返します。

:::note
同じ秒に発生したイベントは、未定義の順序でシーケンスに配置される可能性があり、結果に影響を与える場合があります。
:::

**構文**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時刻データを含むカラム。典型的なデータ型は `Date` と `DateTime` です。サポートされている [UInt](../../sql-reference/data-types/int-uint.md) データ型も使用できます。

- `cond1`, `cond2` — イベントチェーンを記述する条件。データ型: `UInt8`。最大32個の条件引数を渡すことができます。この関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。[パターン構文](#pattern-syntax)を参照してください。

**戻り値**

- イベントチェーンから一致した条件引数(?N)のタイムスタンプの配列。配列内の位置は、パターン内の条件引数の位置と一致します。

型: Array。

**例**

`t` テーブルのデータを考えます:

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

最長チェーンのイベントのタイムスタンプを返します:

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

スライディングタイムウィンドウ内でイベントチェーンを検索し、チェーンから発生したイベントの最大数を計算します。

この関数は以下のアルゴリズムに従って動作します:

- 関数はチェーン内の最初の条件をトリガーするデータを検索し、イベントカウンターを1に設定します。これがスライディングウィンドウの開始時点となります。

- チェーンからのイベントがウィンドウ内で順次発生する場合、カウンターは増分されます。イベントのシーケンスが中断された場合、カウンターは増分されません。

- データに完了度が異なる複数のイベントチェーンが存在する場合、関数は最も長いチェーンのサイズのみを出力します。

**構文**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされるデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime)、およびその他の符号なし整数型(タイムスタンプは`UInt64`型をサポートしていますが、その値はInt64の最大値である2^63 - 1を超えることはできません)。
- `cond` — イベントチェーンを記述する条件またはデータ。[UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `window` — スライディングウィンドウの長さで、最初の条件と最後の条件の間の時間間隔です。`window`の単位は`timestamp`自体に依存し、変動します。式`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`を使用して決定されます。
- `mode` — オプションの引数です。1つ以上のモードを設定できます。
  - `'strict_deduplication'` — イベントのシーケンスに対して同じ条件が成立する場合、そのような繰り返しイベントはそれ以降の処理を中断します。注意: 同じイベントに対して複数の条件が成立する場合、予期しない動作をする可能性があります。
  - `'strict_order'` — 他のイベントの介入を許可しません。例えば、`A->B->D->C`の場合、`D`で`A->B->C`の検索を停止し、最大イベントレベルは2となります。
  - `'strict_increase'` — タイムスタンプが厳密に増加するイベントにのみ条件を適用します。
  - `'strict_once'` — 条件を複数回満たす場合でも、チェーン内で各イベントを1回のみカウントします

**戻り値**

スライディングタイムウィンドウ内でチェーンから連続してトリガーされた条件の最大数。
選択内のすべてのチェーンが分析されます。

型: `Integer`。

**例**

設定された期間が、ユーザーがオンラインストアで携帯電話を選択して2回購入するのに十分かどうかを判定します。

以下のイベントチェーンを設定します:

1.  ユーザーがストアのアカウントにログインした(`eventID = 1003`)。
2.  ユーザーが携帯電話を検索した(`eventID = 1007, product = 'phone'`)。
3.  ユーザーが注文した(`eventID = 1009`)。
4.  ユーザーが再度注文した(`eventID = 1010`)。

入力テーブル:


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

2019年1〜2月の期間に、ユーザー `user_id` がチェーンをどこまで進んだかを調べます。

クエリ:

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

この関数は、イベントに対して特定の条件が満たされたかどうかを示す`UInt8`型の1から32個の条件を引数として受け取ります。
任意の条件を引数として指定できます([WHERE](/sql-reference/statements/select/where)と同様)。

最初の条件を除き、条件はペアで適用されます。2番目の結果は1番目と2番目が真である場合に真となり、3番目の結果は1番目と3番目が真である場合に真となります。以下同様です。

**構文**

```sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8`の結果(1または0)を返す式。

**戻り値**

1または0の配列。

- 1 — イベントに対して条件が満たされた。
- 0 — イベントに対して条件が満たされなかった。

型: `UInt8`。

**例**

サイトトラフィックを判定するために`retention`関数を計算する例を考えてみましょう。

**1.** 例を示すためのテーブルを作成します。

```sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

入力テーブル:

クエリ:

```sql
SELECT * FROM retention_test
```

結果:

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

**2.** `retention`関数を使用して、一意のID `uid`でユーザーをグループ化します。

クエリ:

```sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

結果:


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

**3.** 1 日あたりのサイト訪問回数の合計を計算します。

クエリ:

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

結果:

```text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

ここで:

* `r1` - 2020-01-01 にサイトを訪問したユニーク訪問者数（`cond1` 条件）。
* `r2` - 2020-01-01 から 2020-01-02 の特定の期間中にサイトを訪問したユニーク訪問者数（`cond1` および `cond2` 条件）。
* `r3` - 2020-01-01 および 2020-01-03 の特定の期間中にサイトを訪問したユニーク訪問者数（`cond1` および `cond3` 条件）。


## uniqUpTo(N)(x) {#uniquptonx}

指定された上限`N`までの引数の異なる値の数を計算します。異なる引数値の数が`N`より大きい場合、この関数は`N` + 1を返し、それ以外の場合は正確な値を計算します。

小さな`N`の値での使用を推奨します(最大10まで)。`N`の最大値は100です。

集約関数の状態として、この関数は1 + `N` \* 1つの値のバイトサイズに等しいメモリ量を使用します。
文字列を扱う場合、この関数は8バイトの非暗号化ハッシュを格納します。文字列の計算は近似値となります。

例えば、ウェブサイト上でユーザーが行ったすべての検索クエリを記録するテーブルがあるとします。テーブルの各行は単一の検索クエリを表し、ユーザーID、検索クエリ、クエリのタイムスタンプの列があります。`uniqUpTo`を使用して、少なくとも5人の異なるユーザーによって検索されたキーワードのみを表示するレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`は各`SearchPhrase`に対する一意の`UserID`値の数を計算しますが、最大4つの一意の値までしかカウントしません。`SearchPhrase`に対して4つを超える一意の`UserID`値がある場合、関数は5(4 + 1)を返します。その後、`HAVING`句が一意の`UserID`値の数が5未満の`SearchPhrase`値をフィルタリングします。これにより、少なくとも5人の異なるユーザーによって使用された検索キーワードのリストが得られます。


## sumMapFiltered {#summapfiltered}

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同じように動作しますが、フィルタリング用のキー配列をパラメータとして受け取る点が異なります。キーのカーディナリティが高い場合に特に有用です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用するキーの[Array](../data-types/array.md)。
- `keys`: キーの[Array](../data-types/array.md)。
- `values`: 値の[Array](../data-types/array.md)。

**戻り値**

- 2つの配列のタプルを返します:ソート済みのキーと、対応するキーごとに合計された値。

**例**

クエリ:

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

結果:

```response
   ┌─sumMapFiltered([1, 4, 8])(statusMap.status, statusMap.requests)─┐
1. │ ([1,4,8],[10,20,10])                                            │
   └─────────────────────────────────────────────────────────────────┘
```


## sumMapFilteredWithOverflow {#summapfilteredwithoverflow}

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同じ動作をしますが、フィルタリングに使用するキーの配列をパラメータとして受け取る点が異なります。これは、キーのカーディナリティが高い場合に特に有用です。[sumMapFiltered](#summapfiltered)関数との違いは、オーバーフローを伴う合計を行う点です。つまり、合計結果のデータ型が引数のデータ型と同じになります。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用するキーの[Array](../data-types/array.md)。
- `keys`: キーの[Array](../data-types/array.md)。
- `values`: 値の[Array](../data-types/array.md)。

**返り値**

- 2つの配列のタプルを返します。ソート順のキーと、対応するキーに対して合計された値です。

**例**

この例では、テーブル`sum_map`を作成し、データを挿入した後、`sumMapFilteredWithOverflow`と`sumMapFiltered`の両方を使用し、`toTypeName`関数で結果を比較します。作成されたテーブルで`requests`が`UInt8`型である場合、`sumMapFiltered`はオーバーフローを避けるために合計値の型を`UInt64`に昇格させますが、`sumMapFilteredWithOverflow`は型を`UInt8`のまま保持します。これは結果を格納するには十分な大きさではないため、オーバーフローが発生します。

クエリ:

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

結果:

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

イベントチェーンに一致した次のイベントの値を返します。

_実験的な関数です。有効にするには `SET allow_experimental_funnel_functions = 1` を設定してください。_

**構文**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — ナビゲーション方向を指定します。
  - forward — 前方に移動します。
  - backward — 後方に移動します。

- `base` — 基準点を設定します。
  - head — 基準点を最初のイベントに設定します。
  - tail — 基準点を最後のイベントに設定します。
  - first_match — 基準点を最初に一致した `event1` に設定します。
  - last_match — 基準点を最後に一致した `event1` に設定します。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされるデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime)、およびその他の符号なし整数型。
- `event_column` — 返される次のイベントの値を含むカラムの名前。サポートされるデータ型: [String](../../sql-reference/data-types/string.md) および [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基準点が満たす必要がある条件。
- `event1`, `event2`, ... — イベントチェーンを記述する条件。[UInt8](../../sql-reference/data-types/int-uint.md)。

**戻り値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンが一致しないか、次の値が存在しない場合。

型: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントがA->B->C->D->Eの場合に、B->Cに続くイベント(D)を知りたいときに使用できます。

A->Bに続くイベントを検索するクエリ文:

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

結果:

```text
┌─id─┬─next_flow─┐
│  1 │ C         │
└────┴───────────┘
```

**`forward` と `head` の動作**

```sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // 基準点、Homeに一致
 1970-01-01 09:00:02    1   Gift // Giftに一致
 1970-01-01 09:00:03    1   Exit // 結果

 1970-01-01 09:00:01    2   Home // 基準点、Homeに一致
 1970-01-01 09:00:02    2   Home // Giftに不一致
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

```


1970-01-01 09:00:01    3   Gift // 基準点、Home と一致しない
1970-01-01 09:00:02    3   Home
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket

````

**`backward` と `tail` の動作**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // 基準点、Basket に不一致

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // Gift に一致
1970-01-01 09:00:04    2   Basket // 基準点、Basket に一致

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 基準点、Gift に一致
1970-01-01 09:00:04    3   Basket // 基準点、Basket に一致
````

**`forward` と `first_match` の挙動**

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
1970-01-01 09:00:03    1   Exit // Homeに一致しない

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket // Homeに一致しない

1970-01-01 09:00:01    3   Gift // 基準点
1970-01-01 09:00:02    3   Home // Homeに一致
1970-01-01 09:00:03    3   Gift // 結果
1970-01-01 09:00:04    3   Basket
```

**`backward` および `last_match` における挙動**

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;
```


dt   id   page
1970-01-01 09:00:01    1   Home // 結果
1970-01-01 09:00:02    1   Gift // 起点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // 起点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 起点
1970-01-01 09:00:04    3   Basket

````

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Homeに一致、結果はnull
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
````

**`base_condition` の挙動**

```sql
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

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, ref = 'ref1', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // 先頭行は ref 列が 'ref1' と一致しないため、基点にはできません。
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, ref = 'ref4', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3
 1970-01-01 09:00:03    1   B      ref2
 1970-01-01 09:00:04    1   B      ref1 // 末尾行は ref 列が 'ref4' と一致しないため、基点にはなりません。
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;
```


dt   id   page   ref
1970-01-01 09:00:01    1   A      ref4 // この行は `ref` 列の値が &#39;ref3&#39; と一致しないため、基準点にはなりません。
1970-01-01 09:00:02    1   A      ref3 // 基準点
1970-01-01 09:00:03    1   B      ref2 // 結果
1970-01-01 09:00:04    1   B      ref1

````

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 結果
 1970-01-01 09:00:03    1   B      ref2 // 基準点
 1970-01-01 09:00:04    1   B      ref1 // この行はref列が'ref2'と一致しないため、基準点にはなりません。
````
