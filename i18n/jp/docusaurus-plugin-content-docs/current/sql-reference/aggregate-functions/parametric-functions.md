description: 'パラメトリック集約関数に関するドキュメント'
sidebar_label: 'パラメトリック'
sidebar_position: 38
slug: /sql-reference/aggregate-functions/parametric-functions
title: 'パラメトリック集約関数'
```


# パラメトリック集約関数

いくつかの集約関数は、圧縮に使用される引数カラムだけでなく、初期化のための定数であるパラメータのセットを受け入れることができます。構文は、1組の括弧の代わりに2組の括弧を使用します。最初の括弧はパラメータ用、2番目の括弧は引数用です。
## histogram {#histogram}

適応ヒストグラムを計算します。正確な結果を保証するものではありません。

```sql
histogram(number_of_bins)(values)
```

この関数は[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用します。ヒストグラムのビンの境界は、新しいデータが関数に入ると調整されます。一般的なケースでは、ビンの幅は等しくありません。

**引数**

`values` — 入力値を生成する[式](/sql-reference/syntax#expressions)。

**パラメータ**

`number_of_bins` — ヒストグラムにおけるビンの上限です。この関数は自動的にビンの数を計算します。指定されたビンの数に到達しようとしますが、失敗した場合は、より少ないビンを使用します。

**返される値**

- 次の形式の[タプル](../../sql-reference/data-types/tuple.md)の[配列](../../sql-reference/data-types/array.md):

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

ヒストグラムを視覚化するには、例えば[bar](/sql-reference/functions/other-functions#bar)関数を使用します:

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

この場合、ヒストグラムのビンの境界がわからないことを覚えておいてください。
## sequenceMatch {#sequencematch}

シーケンスにパターンと一致するイベントチェーンが含まれているかをチェックします。

**構文**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンスに配置される可能性があります。
:::

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。また、サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型の任意を使用できます。

- `cond1`, `cond2` — イベントチェーンを説明する条件。データ型: `UInt8`。条件引数は最大32まで指定できます。関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。参照[パターン構文](#pattern-syntax)。

**返される値**

- パターンに一致した場合は1。
- パターンに一致しなかった場合は0。

型: `UInt8`。
#### パターン構文 {#pattern-syntax}

- `(?N)` — ポジション`N`の条件引数と一致します。条件は`[1, 32]`の範囲で番号付けされています。例えば、`(?1)`は`cond1`パラメータに渡された引数と一致します。

- `.*` — 任意の数のイベントと一致します。このパターンのこの要素と一致させるために条件引数は必要ありません。

- `(?t operator value)` — 2つのイベントを区切るべき秒数を設定します。例えば、パターン`(?1)(?t>1800)(?2)`は、1800秒以上の間隔で発生するイベントと一致します。これらのイベントの間には任意の数のイベントが存在できます。`>=`、`>`、`<`、`<=`、`==`演算子を使用できます。

**例**

`t`テーブルのデータを考えてみましょう:

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

関数は、1の後に2が続くイベントチェーンを見つけました。条件で説明されていないイベント間の3をスキップしました。例に示したイベントチェーンを検索する際にこの数を考慮したい場合は、それについての条件を設定する必要があります。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、関数はパターンに一致するイベントチェーンを見つけられませんでした。なぜなら、1と2の間で3のイベントが発生したからです。同じ場合に4の条件をチェックすれば、シーケンスはパターンに一致します。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [sequenceCount](#sequencecount)
## sequenceCount {#sequencecount}

パターンに一致したイベントチェーンの数をカウントします。この関数は、オーバーラップしないイベントチェーンを検索します。現在のチェーンが一致した後は、次のチェーンの検索を開始します。

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンスに配置される可能性があります。
:::

**構文**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。また、サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型の任意を使用できます。

- `cond1`, `cond2` — イベントチェーンを説明する条件。データ型: `UInt8`。条件引数は最大32まで指定できます。関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。参照[パターン構文](#pattern-syntax)。

**返される値**

- 一致した非オーバーラップイベントチェーンの数。

型: `UInt64`。

**例**

`t`テーブルのデータを考えてみましょう:

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

1の後に数が2である回数をカウントします。2の間に任意の数が間に入る場合は次のようにします:

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```
## sequenceMatchEvents {#sequencematchevents}

パターンに一致する最長のイベントチェーンのイベントタイムスタンプを返します。

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンスに配置される可能性があります。
:::

**構文**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`と`DateTime`です。また、サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型の任意を使用できます。

- `cond1`, `cond2` — イベントチェーンを説明する条件。データ型: `UInt8`。条件引数は最大32まで指定できます。関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。参照[パターン構文](#pattern-syntax)。

**返される値**

- マッチした条件引数(?N)のタイムスタンプの配列。配列内の位置はパターン内の条件引数の位置と一致します。

型: Array。

**例**

`t`テーブルのデータを考えてみましょう:

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

最長のチェーンのイベントのタイムスタンプを返します:

```sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [sequenceMatch](#sequencematch)
## windowFunnel {#windowfunnel}

スライディングタイムウィンドウ内のイベントチェーンを検索し、チェーンから発生したイベントの最大数を計算します。

この関数は次のアルゴリズムに従って機能します:

- 関数は、チェーン内の最初の条件をトリガーするデータを検索し、イベントカウンタを1に設定します。これがスライディングウィンドウが開始される時点です。

- チェーンのイベントがウィンドウ内で連続して発生する場合、カウンタは増加します。イベントのシーケンスが中断されると、カウンタは増加しません。

- データに異なる完了ポイントで複数のイベントチェーンがある場合、関数は最長のチェーンのサイズのみを出力します。

**構文**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) およびその他の符号なし整数型 (タイムスタンプは`UInt64`型をサポートしていますが、その値はInt64の最大値である2^63 - 1を超えることはできません）。
- `cond` — イベントチェーンを説明する条件またはデータ。[UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `window` — スライディングウィンドウの長さであり、最初の条件と最後の条件の間の時間間隔です。`window`の単位は`timestamp`自体によって異なり、次の式を用いて決定されます: `timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`。
- `mode` — オプションの引数です。1つ以上のモードを設定できます。
    - `'strict_deduplication'` — シーケンス内のイベントに同じ条件が当てはまる場合、その繰り返しイベントはさらなる処理を中断します。注意: 同じイベントに複数の条件が当てはまると予期しない結果を生じることがあります。
    - `'strict_order'` — 他のイベントの介入を許可しません。例: `A->B->D->C`の場合、Dで`A->B->C`の検索を停止し、最大イベントレベルは2となります。
    - `'strict_increase'` —  時間が厳密に増加しているイベントのみに条件を適用します。
    - `'strict_once'` — チェーン内の各イベントを一度だけカウントします。条件に何度も合致しても。

**返される値**

スライディングタイムウィンドウ内でチェーンからトリガーされた条件の最大数。
選択内のすべてのチェーンが分析されます。

型: `Integer`。

**例**

ユーザーがオンラインストアで電話を選択して購入するまでに必要な時間が十分であるかを判断します。

次のイベントのチェーンを設定します:

1. ユーザーがストアのアカウントにログインしました (`eventID = 1003`)。
2. ユーザーが電話を検索しました (`eventID = 1007, product = 'phone'`)。
3. ユーザーが注文を行いました (`eventID = 1009`)。
4. ユーザーが再度注文を行いました (`eventID = 1010`)。

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

ユーザー`user_id`が2019年1月から2月にかけてチェーンをどれだけ進むことができたかを調べます。

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

結果:

```text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```
## retention {#retention}

この関数は、イベントに対してある条件が満たされたかどうかを示す`UInt8`型の引数1から32のセットを引数として受け取ります。
どの条件も引数として指定できます（[WHERE](/sql-reference/statements/select/where)のように）。

条件は、最初を除いてペアで適用されます: 2番目の条件が満たされると、1番目と2番目が真である場合、3番目の条件が満たされると、1番目と3番目が真である場合、など。

**構文**

```sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8`結果（1または0）を返す式。

**返される値**

1または0の配列。

- 1 — 条件が満たされたイベント。
- 0 — 条件が満たされていないイベント。

型: `UInt8`。

**例**

`retention`関数を使ってサイトのトラフィックを計算する例を考えてみましょう。

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

**2.** `retention`関数を使用して、ユーザーを一意のID `uid`でグループ化します。

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

**3.** サイトへの訪問の総数を日別に計算します。

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

- `r1` - 2020年1月1日にサイトを訪れたユニークビジターの数（`cond1`条件）。
- `r2` - 2020年1月1日から2020年1月2日の間にサイトを訪れたユニークビジターの数（`cond1`と`cond2`条件）。
- `r3` - 2020年1月1日および2020年1月3日にサイトを訪れたユニークビジターの数（`cond1`と`cond3`条件）。
## uniqUpTo(N)(x) {#uniquptonx}

指定された制限`N`まで引数の異なる値の数を計算します。異なる引数の数が`N`を超える場合、この関数は`N` + 1を返します。それ以外の場合は、正確な値を計算します。

小さな`N`（最大10）での使用を推奨します。`N`の最大値は100です。

集約関数の状態のために、この関数は1 + `N` * 値のサイズのバイト数に相当するメモリを使用します。
文字列を扱う際、この関数は8バイトの非暗号化ハッシュを保存します; 文字列の計算は近似されます。

例えば、サイトのユーザーによるすべての検索クエリを記録するテーブルがあるとします。テーブルの各行は単一の検索クエリを表し、カラムにはユーザーID、検索クエリ、およびクエリのタイムスタンプがあります。`uniqUpTo`を使用して、少なくとも5人のユニークユーザーが生成したキーワードのみを表示するレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`は各`SearchPhrase`のユニークな`UserID`値の数を計算しますが、4つのユニーク値までしかカウントしません。`SearchPhrase`に対するユニークな`UserID`の数が4を超える場合、関数は5を返します（4 + 1）。`HAVING`句は次に、ユニークな`UserID`の数が5未満である`SearchPhrase`値をフィルタリングします。これにより、少なくとも5人のユニークユーザーによって使用された検索キーワードのリストが得られます。
## sumMapFiltered {#summapfiltered}

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同じように動作しますが、フィルタリングに使用するキーの配列もパラメータとして受け入れます。これは、高い基数のキーで作業する際に特に便利です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- ソートされた順序のキーと、それに対応するキーの合計値を持つ二つの配列のタプルを返します。

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

この関数は、[sumMap](/sql-reference/aggregate-functions/reference/summap)と同じように動作しますが、フィルタリングに使用するキーの配列もパラメータとして受け入れます。これは、高い基数のキーで作業する際に特に便利です。[sumMapFiltered](#summapfiltered)関数とは異なり、オーバーフローを伴う加算を行うため、合計値のデータ型を引数のデータ型と同じにします。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- ソートされた順序のキーと、それに対応するキーの合計値を持つ二つの配列のタプルを返します。

**例**

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
   ┌─summap_overflow──────────┬─toTypeName(summap_overflow)────────────────┐
1. │ ([1,4,8],[10,20,10])     │ Tuple(Array(UInt8), Array(UInt8))         │
   └────────────────────────────┴───────────────────────────────────────────┘
```

```response
   ┌─summap───────────────┬─toTypeName(summap)─────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt64)) │
   └──────────────────────┴────────────────────────────────────┘
```
```yaml
title: 'sequenceNextNode'
sidebar_label: 'sequenceNextNode'
keywords: ['ClickHouse', 'sequenceNextNode', 'event chain']
description: '次のイベントを返す関数、イベントチェーンに一致するイベントを処理します。'
```

## sequenceNextNode {#sequencenextnode}

イベントチェーンに一致した次のイベントの値を返します。

_実験的な関数であり、`SET allow_experimental_funnel_functions = 1` で有効にします。_

**構文**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — 方向へのナビゲーションに使用します。
    - forward — 前に進む。
    - backward — 後ろに戻る。

- `base` — 基準点を設定するのに使用します。
    - head — 基準点を最初のイベントに設定します。
    - tail — 基準点を最後のイベントに設定します。
    - first_match — 基準点を最初に一致した `event1` に設定します。
    - last_match — 基準点を最後に一致した `event1` に設定します。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) および他の符号なし整数型。
- `event_column` — 次のイベントの値を返すカラムの名前。サポートされているデータ型: [String](../../sql-reference/data-types/string.md) および [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基準点が満たさなければならない条件。
- `event1`, `event2`, ... — イベントチェーンを説明する条件。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンが一致しない場合や次の値が存在しない場合。

タイプ: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントが A->B->C->D->E のとき、B->C の後に続くイベント D を知りたい場合に使用できます。

A->B の後のイベントを検索するクエリ文:

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

**`forward` と `head` に関する動作**

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
 1970-01-01 09:00:02    2   Home // Giftに一致しない
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // 基準点、Homeに一致しない
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward` と `tail` に関する動作**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // 基準点、Basketに一致しない

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // Giftに一致
1970-01-01 09:00:04    2   Basket // 基準点、Basketに一致

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 基準点、Giftに一致
1970-01-01 09:00:04    3   Basket // 基準点、Basketに一致
```

**`forward` と `first_match` に関する動作**

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit // 結果

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket  結果

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


**`backward` と `last_match` に関する動作**

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


**`base_condition` の動作**

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
 1970-01-01 09:00:01    1   A      ref4 // 基準点にはなれません、headのrefカラムが 'ref1' に一致しないため。
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
 1970-01-01 09:00:04    1   B      ref1 // tailは基準点になれません、tailのrefカラムが 'ref4' に一致しないため。
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // この行は基準点になれません、refカラムが 'ref3' に一致しないため。
 1970-01-01 09:00:02    1   A      ref3 // 基準点
 1970-01-01 09:00:03    1   B      ref2 // 結果
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 結果
 1970-01-01 09:00:03    1   B      ref2 // 基準点
 1970-01-01 09:00:04    1   B      ref1 // この行は基準点になれません、refカラムが 'ref2' に一致しないため。
