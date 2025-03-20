---
slug: /sql-reference/aggregate-functions/parametric-functions
sidebar_position: 38
sidebar_label: パラメトリック
---

# パラメトリック集約関数

いくつかの集約関数は、引数カラム（圧縮に使用）だけでなく、一連のパラメータ（初期化用の定数）を受け取ることができます。構文は、1つのかっこではなく2つのかっこを使用します。最初のかっこはパラメータ用、2番目のかっこは引数用です。
## histogram {#histogram}

適応ヒストグラムを計算します。正確な結果は保証されません。

``` sql
histogram(number_of_bins)(values)
```

この関数は[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用しています。ヒストグラムビンの境界は、新しいデータが関数に入ると調整されます。一般的な場合、ビンの幅は等しくありません。

**引数**

`values` — 入力値を生成する[式](/sql-reference/syntax#expressions)。

**パラメータ**

`number_of_bins` — ヒストグラムのビンの上限数。この関数は自動的にビンの数を計算します。指定されたビン数に達しようとしますが、失敗した場合はより少ないビンを使用します。

**返される値**

- 以下の形式の[タプル](../../sql-reference/data-types/tuple.md)の[配列](../../sql-reference/data-types/array.md):

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

ヒストグラムを視覚化するには、例えば[bar](/sql-reference/functions/other-functions#bar)関数を使用できます:

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

この場合、ヒストグラムビンの境界が不明であることを忘れないでください。
## sequenceMatch {#sequencematch}

シーケンスがパターンに一致するイベントチェーンを含むかどうかをチェックします。

**構文**

``` sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生するイベントは、順序が未定義でシーケンス内に配置される可能性があり、その結果に影響を与える場合があります。
:::

**引数**

- `timestamp` — 時間データを含むカラム。一般的なデータ型は`Date`および`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用できます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。詳細は[パターン構文](#pattern-syntax)を参照してください。

**返される値**

- パターンが一致すれば1。
- パターンが一致しなければ0。

タイプ: `UInt8`.
#### パターン構文 {#pattern-syntax}

- `(?N)` — 番号`N`の位置にある条件引数と一致します。条件は`[1, 32]`の範囲で番号付けされます。例えば、`(?1)`は`cond1`パラメータに渡された引数と一致します。

- `.*` — 任意の数のイベントと一致します。このパターンのこの要素と一致させるには条件引数は必要ありません。

- `(?t operator value)` — 二つのイベントの間に必要な秒数を設定します。例えば、パターン`(?1)(?t>1800)(?2)`は、1800秒以上離れて発生するイベントに一致します。これらのイベントの間には任意の数のイベントが含まれる可能性があります。`>=`、`>`、`<`、`<=`、`==`演算子を使用できます。

**例**

`t`テーブルのデータを考えてみましょう:

``` text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

クエリを実行します:

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

この関数は、number 2がnumber 1の後に続くイベントチェーンを見つけました。条件で説明されていないnumber 3がその間に存在するため、スキップされました。この例で与えられたイベントチェーンを検索する際にこの数字を考慮に入れたければ、条件を作成する必要があります。

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、関数はパターンに一致するイベントチェーンを見つけることができませんでした。なぜなら、number 3のイベントが1と2の間に発生したからです。同じ場合にnumber 4の条件をチェックした場合、シーケンスはパターンに一致します。

``` sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

``` text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**参照**

- [sequenceCount](#sequencecount)
## sequenceCount {#sequencecount}

パターンに一致するイベントチェーンの数をカウントします。この関数は、重複しないイベントチェーンを検索します。現在のチェーンが一致した後、次のチェーンを探し始めます。

:::note
同じ秒に発生するイベントは、順序が未定義でシーケンス内に配置される可能性があり、その結果に影響を与える場合があります。
:::

**構文**

``` sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むカラム。一般的なデータ型は`Date`および`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用できます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。詳細は[パターン構文](#pattern-syntax)を参照してください。

**返される値**

- 一致する重複しないイベントチェーンの数。

タイプ: `UInt64`.

**例**

`t`テーブルのデータを考えてみましょう:

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

次に、number 1の後にnumber 2が発生する回数をカウントします（その間に任意の他の数字があっても構いません）:

``` sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

``` text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```
## sequenceMatchEvents {#sequencematchevents}

パターンに一致する最長のイベントチェーンのイベントタイムスタンプを返します。

:::note
同じ秒に発生するイベントは、順序が未定義でシーケンス内に配置される可能性があり、その結果に影響を与える場合があります。
:::

**構文**

``` sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むカラム。一般的なデータ型は`Date`および`DateTime`です。サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用できます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。詳細は[パターン構文](#pattern-syntax)を参照してください。

**返される値**

- 一致した条件引数(?N)のイベントチェーンからのタイムスタンプの配列。配列内の位置はパターン内の条件引数の位置に対応します。

タイプ: 配列。

**例**

`t`テーブルのデータを考えてみましょう:

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

最長チェーンのイベントのタイムスタンプを返します:

``` sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

``` text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**参照**

- [sequenceMatch](#sequencematch)
## windowFunnel {#windowfunnel}

スライディングウィンドウ内のイベントチェーンを検索し、チェーンから発生した最大イベント数を計算します。

この関数は以下のアルゴリズムに従って動作します:

- 関数は、チェーン内の最初の条件をトリガーするデータを検索し、イベントカウンタを1に設定します。これがスライディングウィンドウの開始時点です。

- チェーン内のイベントがウィンドウ内で連続して発生した場合、カウンタが増加します。イベントのシーケンスが中断された場合、カウンタは増加しません。

- データに複数のイベントチェーンが異なる完了ポイントで存在する場合、関数は最長のチェーンのサイズのみを出力します。

**構文**

``` sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) およびその他の符号なし整数型（タイムスタンプが`UInt64`型をサポートしているものの、その値はInt64の最大値である2^63 - 1を超えてはならないことに注意してください）。
- `cond` — 条件またはイベントチェーンを説明するデータ。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `window` — スライディングウィンドウの長さ。これは最初の条件と最後の条件の間の時間間隔です。`window`の単位は`timestamp`自体によって異なり、次の式で決定されます：`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`。
- `mode` — オプションの引数。1つ以上のモードを設定できます。
    - `'strict_deduplication'` — シーケンス内のイベントに対して同じ条件が成立した場合、そのような繰り返しイベントはさらなる処理を中断します。注意: 複数の条件が同じイベントに当てはまると予期しない動作をすることがあります。
    - `'strict_order'` — 他のイベントの介入を許可しません。例えば、`A->B->D->C`の場合、`D`で`A->B->C`の検索が停止し、最大イベントレベルは2になります。
    - `'strict_increase'` — 厳密に増加するタイムスタンプを持つイベントのみを対象とします。
    - `'strict_once'` — チェーン内で条件を満たしたイベントを一度だけカウントします、たとえ条件を複数回満たしたとしても。

**返される値**

スライディングウィンドウ内のチェーンから連続してトリガーされた条件の最大数。
選択されたすべてのチェーンが分析されます。

タイプ: `Integer`.

**例**

ユーザーがオンラインストアで電話を選択して購入するのに十分な期間かどうかを判断します。

次のイベントチェーンを設定します:

1. ユーザーがストアのアカウントにログインしました（`eventID = 1003`）。
2. ユーザーが電話を検索しました（`eventID = 1007, product = 'phone'`）。
3. ユーザーが注文を出しました（`eventID = 1009`）。
4. ユーザーが再度注文を出しました（`eventID = 1010`）。

入力テーブル:

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

ユーザー`user_id`が2019年1月から2月の間にチェーンを通過した場合、どの地点まで到達できるかを調べます。

クエリ:

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

結果:

``` text
┌─level─┬─c─┐
│     4 │ 1 │
└───────┴───┘
```
## retention {#retention}

この関数は、イベントに対して特定の条件が満たされたかどうかを示す1〜32の引数のセットを引数として受け取ります。
任意の条件を引数として指定できます（[WHERE](/sql-reference/statements/select/where)と同様）。

最初の条件を除いて、条件はペアで適用されます: 2番目の条件の結果は、最初と2番目の条件が真であれば真になります。3番目の条件は、最初と3番目の条件が真であれば真になります。等々。

**構文**

``` sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8`（1または0）結果を返す式。

**返される値**

1または0の配列。

- 1 — イベントに対して条件が満たされた。
- 0 — イベントに対して条件が満たされなかった。

タイプ: `UInt8`.

**例**

サイトのトラフィックを判断するための`retention`関数の計算の例を考えてみましょう。

**1.** 例を示すためのテーブルを作成します。

``` sql
CREATE TABLE retention_test(date Date, uid Int32) ENGINE = Memory;

INSERT INTO retention_test SELECT '2020-01-01', number FROM numbers(5);
INSERT INTO retention_test SELECT '2020-01-02', number FROM numbers(10);
INSERT INTO retention_test SELECT '2020-01-03', number FROM numbers(15);
```

入力テーブル:

クエリ:

``` sql
SELECT * FROM retention_test
```

結果:

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

**2.** `retention`関数を使用して、ユニークID `uid`でユーザーをグループ化します。

クエリ:

``` sql
SELECT
    uid,
    retention(date = '2020-01-01', date = '2020-01-02', date = '2020-01-03') AS r
FROM retention_test
WHERE date IN ('2020-01-01', '2020-01-02', '2020-01-03')
GROUP BY uid
ORDER BY uid ASC
```

結果:

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

**3.** 日ごとのサイト訪問者数を合計します。

クエリ:

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

結果:

``` text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

ここで:

- `r1` - 2020-01-01の間にサイトを訪れたユニークな訪問者の数（`cond1`条件）。
- `r2` - 2020-01-01から2020-01-02の間にサイトを訪れた特定の時間帯のユニークな訪問者の数（`cond1`および`cond2`条件）。
- `r3` - 2020-01-01および2020-01-03の間にサイトを訪れた特定の時間帯のユニークな訪問者の数（`cond1`および`cond3`条件）。
## uniqUpTo(N)(x) {#uniquptonx}

指定された制限`N`までの引数の異なる値の数を計算します。引数の異なる値の数が`N`を超える場合、この関数は`N` + 1を返します。そうでない場合は、正確な値を計算します。

小さな`N`（最大10）の使用が推奨されます。`N`の最大値は100です。

集約関数の状態について、この関数は1 + `N` * 値のバイト数に等しい量のメモリを使用します。
文字列を扱う場合、この関数は8バイトの非暗号化ハッシュを保存し、文字列に対して計算を近似します。

例えば、ユーザーがウェブサイトで行ったすべての検索クエリをログに記録するテーブルがあるとしましょう。テーブルの各行は単一の検索クエリを表し、ユーザーID、検索クエリ、およびクエリのタイムスタンプのカラムがあります。`uniqUpTo`を使用して、少なくとも5人のユニークユーザーが使用したキーワードのみを表示するレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`は各`SearchPhrase`についてユニークな`UserID`の数を計算しますが、最大で4つのユニーク値のみをカウントします。4つを超えるユニークな`UserID`の値がある場合、この関数は5を返します（4 + 1）。その後、`HAVING`句は、ユニークな`UserID`の値が5未満である`SearchPhrase`の値をフィルタリングします。これにより、少なくとも5人のユニークユーザーが使用した検索キーワードのリストが得られます。
## sumMapFiltered {#summapfiltered}

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同様に動作しますが、フィルタリングするためのキーの配列も受け入れます。これは、高い基数のキーで作業する際に特に役立ちます。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングするための[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- 並べ替えられた順序のキーと、対応するキーに対して合計された値の2つの配列のタプルを返します。

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

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同様に動作しますが、フィルタリングするためのキーの配列も受け入れます。これは、高い基数のキーで作業する際に特に役立ちます。[sumMapFiltered](#summapfiltered)関数と異なり、オーバーフロー付きの合計を行います。つまり、引数のデータ型と同じデータ型で合計を返します。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングするための[配列](../data-types/array.md)のキー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- 並べ替えられた順序のキーと、対応するキーに対して合計された値の2つの配列のタプルを返します。

**例**

この例では、テーブル`sum_map`を作成し、データを挿入し、`sumMapFilteredWithOverflow`と`sumMapFiltered`および`toTypeName`関数を使用して結果を比較します。`requests`が作成されたテーブルで`UInt8`型であった場合、`sumMapFiltered`はオーバーフローを避けるために合計値の型を`UInt64`に昇格させるのに対し、`sumMapFilteredWithOverflow`は型をそのまま`UInt8`のまま保持します。つまり、オーバーフローが発生します。

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
   ┌─summap_overflow─────────────┬─toTypeName(summap_overflow)─────────────────────┐
1. │ ([1,4,8],[10,20,10])            │ Tuple(Array(UInt8), Array(UInt8))              │
   └────────────────────────────────┴───────────────────────────────────────────────┘
```

```response
   ┌─summap───────────────┬─toTypeName(summap)─────────────────┐
1. │ ([1,4,8],[10,20,10]) │ Tuple(Array(UInt8), Array(UInt64)) │
   └──────────────────────┴───────────────────────────────────┘
```
## sequenceNextNode {#sequencenextnode}

イベントチェーンに一致する次のイベントの値を返します。

_実験的な関数です。 `SET allow_experimental_funnel_functions = 1` を使用して有効にします。_

**構文**

``` sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — 方向を指定するために使用します。
    - forward — 前方に移動します。
    - backward — 後方に移動します。

- `base` — 基準点を設定するために使用します。
    - head — 基準点を最初のイベントに設定します。
    - tail — 基準点を最後のイベントに設定します。
    - first_match — 基準点を最初に一致した `event1` に設定します。
    - last_match — 基準点を最後に一致した `event1` に設定します。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型： [Date](../../sql-reference/data-types/date.md), [DateTime](/sql-reference/data-types/datetime) とその他の符号なし整数型。
- `event_column` — 返される次のイベントの値を含むカラムの名前。サポートされているデータ型： [String](../../sql-reference/data-types/string.md) と [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基準点が満たさなければならない条件。
- `event1`, `event2`, ... — イベントのチェーンを説明する条件。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンが一致しないか、次の値が存在しない場合。

型: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントが A->B->C->D->E の場合に、B->C の後のイベント（D）を知りたいときに使用できます。

A->Bの後のイベントを検索するクエリ文：

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
 1970-01-01 09:00:01    1   Home // 基準点、一致した Home
 1970-01-01 09:00:02    1   Gift // 一致した Gift
 1970-01-01 09:00:03    1   Exit // 結果

 1970-01-01 09:00:01    2   Home // 基準点、一致した Home
 1970-01-01 09:00:02    2   Home // Gift と一致しない
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // 基準点、Home と一致しない
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
1970-01-01 09:00:03    1   Exit // 基準点、Basket と一致しない

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // 一致した Gift
1970-01-01 09:00:04    2   Basket // 基準点、一致した Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 基準点、一致した Gift
1970-01-01 09:00:04    3   Basket // 基準点、一致した Basket
```

**`forward` と `first_match` の動作**

``` sql
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

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit // Home と一致しない

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket // Home と一致しない

1970-01-01 09:00:01    3   Gift // 基準点
1970-01-01 09:00:02    3   Home // 一致した Home
1970-01-01 09:00:03    3   Gift // 結果
1970-01-01 09:00:04    3   Basket
```

**`backward` と `last_match` の動作**

``` sql
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

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Home と一致、結果は null
1970-01-01 09:00:02    1   Gift // 基準点
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // 結果
1970-01-01 09:00:02    2   Home // Home と一致
1970-01-01 09:00:03    2   Gift // 基準点
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // 結果
1970-01-01 09:00:02    3   Home // Home と一致
1970-01-01 09:00:03    3   Gift // 基準点
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
 1970-01-01 09:00:01    1   A      ref4 // ヘッドは、ヘッドの ref カラムが 'ref1' と一致しないため基準点になれません。
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
 1970-01-01 09:00:04    1   B      ref1 // テールは、テールの ref カラムが 'ref4' と一致しないため基準点になれません。
```

``` sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // この行は、ref カラムが 'ref3' と一致しないため基準点になれません。
 1970-01-01 09:00:02    1   A      ref3 // 基準点
 1970-01-01 09:00:03    1   B      ref2 // 結果
 1970-01-01 09:00:04    1   B      ref1
```

``` sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 結果
 1970-01-01 09:00:03    1   B      ref2 // 基準点
 1970-01-01 09:00:04    1   B      ref1 // この行は、ref カラムが 'ref2' と一致しないため基準点になれません。
```
