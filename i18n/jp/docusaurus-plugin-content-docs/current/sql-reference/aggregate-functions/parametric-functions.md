---
'description': 'Documentation for パラメトリック集約関数'
'sidebar_label': 'パラメトリック'
'sidebar_position': 38
'slug': '/sql-reference/aggregate-functions/parametric-functions'
'title': 'パラメトリック集約関数'
'doc_type': 'reference'
---


# パラメトリック集約関数

一部の集約関数は、圧縮に使用する引数のカラムだけでなく、初期化のための定数であるパラメータのセットも受け取ることができます。構文は1つのペアのかっこではなく、2つのペアのかっこを使用します。最初のかっこはパラメータ用、2つ目のかっこは引数用です。

## histogram {#histogram}

適応ヒストグラムを計算します。正確な結果を保証するものではありません。

```sql
histogram(number_of_bins)(values)
```

この関数は[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用しています。ヒストグラムのビンの境界は、新しいデータが関数に入ると調整されます。一般的な場合、ビンの幅は等しくありません。

**引数**

`values` — 入力値の結果となる[式](/sql-reference/syntax#expressions)。

**パラメータ**

`number_of_bins` — ヒストグラムにおけるビンの上限数。関数は自動的にビンの数を計算します。指定されたビンの数に達しようとしますが、失敗した場合は、より少ないビンを使用します。

**返される値**

- 指定の形式の[タプル](../../sql-reference/data-types/tuple.md)の[配列](../../sql-reference/data-types/array.md):

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

ヒストグラムを可視化するには、例えば[bar](/sql-reference/functions/other-functions#bar)関数を使用できます。

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

この場合、ヒストグラムのビンの境界が不明であることを覚えておいてください。

## sequenceMatch {#sequencematch}

シーケンスがパターンに一致するイベントチェーンを含んでいるかどうかを確認します。

**構文**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンス内に配置される場合があります。
:::

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`および`DateTime`です。また、サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用できます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型：`UInt8`。最大32の条件引数を渡すことができます。関数はこれらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。 [パターン構文](#pattern-syntax)を参照してください。

**返される値**

- パターンが一致する場合は1。
- パターンが一致しない場合は0。

型： `UInt8`。

#### パターン構文 {#pattern-syntax}

- `(?N)` — ポジション`N`の条件引数に一致します。条件は`[1, 32]`の範囲で番号付けされます。たとえば、`(?1)`は、`cond1`パラメータに渡された引数に一致します。

- `.*` — 任意の数のイベントに一致します。このパターンのこの要素に一致するために条件付き引数は必要ありません。

- `(?t operator value)` — 2つのイベントを区切るべき秒数を設定します。たとえば、パターン`(?1)(?t>1800)(?2)`は、1800秒以上離れて発生するイベントに一致します。これらのイベントの間には任意の数のイベントを配置できます。`>=`, `>`, `<`, `<=`, `==`演算子を使用できます。

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

関数は、番号2が番号1に続くイベントチェーンを見つけました。その間に番号3はスキップされました。なぜなら、その番号はイベントとして説明されていないためです。この例で与えられたイベントチェーンを検索する際にこの番号を考慮したい場合は、そのための条件を作成する必要があります。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、関数はパターンに一致するイベントチェーンを見つけられませんでした。なぜなら、番号3のイベントが1と2の間に発生したからです。もし同じケースで番号4の条件を確認した場合、シーケンスはパターンに一致するでしょう。

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

パターンに一致したイベントチェーンの数をカウントします。この関数は重複しないイベントチェーンを検索します。現在のチェーンが一致した後、次のチェーンを検索し始めます。

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンス内に配置される場合があります。
:::

**構文**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`および`DateTime`です。また、サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用できます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型：`UInt8`。最大32の条件引数を渡すことができます。関数はこれらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。 [パターン構文](#pattern-syntax)を参照してください。

**返される値**

- 一致した重複しないイベントチェーンの数。

型： `UInt64`。

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

番号1の後に番号2が表示される回数をカウントしますが、その間には他の任意の数字が入っている場合：

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
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンス内に配置される場合があります。
:::

**構文**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は`Date`および`DateTime`です。また、サポートされている[UInt](../../sql-reference/data-types/int-uint.md)データ型のいずれかを使用できます。

- `cond1`, `cond2` — イベントのチェーンを説明する条件。データ型：`UInt8`。最大32の条件引数を渡すことができます。関数はこれらの条件で説明されたイベントのみを考慮します。シーケンスに条件で説明されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

- `pattern` — パターン文字列。 [パターン構文](#pattern-syntax)を参照してください。

**返される値**

- イベントチェーンから一致した条件引数(?N)のタイムスタンプの配列。配列内の位置はパターン内の条件引数の位置に一致します。

型： 配列。

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

最長のチェーンのイベントのタイムスタンプを返します。

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

スライディングタイムウィンドウ内のイベントチェーンを検索し、そのチェーンから発生した最大のイベント数を計算します。

関数は次のアルゴリズムに従って動作します：

- 関数はチェーン内の最初の条件をトリガーするデータを検索し、イベントカウンタを1に設定します。これがスライディングウィンドウが始まる瞬間です。

- チェーンからのイベントがウィンドウ内で順次発生する場合、カウンタが増加します。イベントのシーケンスが中断された場合、カウンタは増加しません。

- データが異なる完了点での複数のイベントチェーンを持っている場合、関数は最長のチェーンのサイズのみを出力します。

**構文**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型：[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime)、および他の符号なし整数型（タイムスタンプが`UInt64`型をサポートしているにもかかわらず、その値はInt64の最大値（2^63 - 1）を超えてはいけません）。
- `cond` — イベントチェーンを説明する条件またはデータ。[UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメータ**

- `window` — スライディングウィンドウの長さ、これは最初の条件と最後の条件の間の時間間隔です。`window`の単位は`timestamp`自体によって異なります。`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window`という式を使用して決定されます。
- `mode` — これはオプションの引数です。1つ以上のモードを設定できます。
  - `'strict_deduplication'` — 同じ条件がイベントのシーケンスに適用される場合、そのような繰り返しイベントはさらなる処理を中断します。注意：同じイベントに対する複数の条件が適用される場合、予期しない動作をする可能性があります。
  - `'strict_order'` — 他のイベントの介入を許可しません。例えば、`A->B->D->C`の場合、`D`で`A->B->C`の検索が停止し、最大イベントレベルは2になります。
  - `'strict_increase'` — 厳密に増加するタイムスタンプを持つイベントのみに条件を適用します。
  - `'strict_once'` — チェーン内の各イベントを条件に合った場合でも1回だけカウントします。

**返される値**

スライディングタイムウィンドウ内でのチェーンからトリガーされた条件の最大数です。
選択内のすべてのチェーンが分析されます。

型： `Integer`。

**例**

特定の期間内にユーザーがオンラインストアで電話を選択して購入するのに十分な時間があるかどうかを判断します。

次のイベントのチェーンを設定します：

1.  ユーザーがストアでアカウントにログインしました（`eventID = 1003`）。
2.  ユーザーが電話を検索しました（`eventID = 1007, product = 'phone'`）。
3.  ユーザーが注文を出しました（`eventID = 1009`）。
4.  ユーザーが再度注文を出しました（`eventID = 1010`）。

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

ユーザー`user_id`が2019年1月から2月の期間にチェーンをどれだけ進むことができたかを見つけます。

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

この関数は、イベントに対して特定の条件が満たされたかどうかを示す`UInt8`型の引数のセット（1〜32）の条件を受け取ります。
[WHERE](/sql-reference/statements/select/where)のように、任意の条件を引数として指定できます。

最初の条件を除き、条件はペアで適用されます：2番目の結果は、最初と2番目が真であれば真、3番目は、最初と3番目が真であれば真、などです。

**構文**

```sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8`結果（1または0）を返す式。

**返される値**

1または0の配列。

- 1 — イベントの条件が満たされました。
- 0 — イベントの条件が満たされませんでした。

型： `UInt8`。

**例**

サイトトラフィックを決定するための`retention`関数の計算の例を考えてみましょう。

**1.** 例を説明するためのテーブルを作成します。

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

**2.** `retention`関数を使用して、ユニークなID `uid`でユーザーをグループ化します。

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

**3.** 日ごとのサイト訪問数を計算します。

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

- `r1`- 2020-01-01にサイトを訪れたユニークな訪問者の数（`cond1`条件）。
- `r2`- 2020-01-01から2020-01-02の特定の時間帯にサイトを訪れたユニークな訪問者の数（`cond1`および`cond2`条件）。
- `r3`- 2020-01-01および2020-01-03の特定の時間帯にサイトを訪れたユニークな訪問者の数（`cond1`および`cond3`条件）。

## uniqUpTo(N)(x) {#uniquptonx}

指定された制限`N`までの引数の異なる値の数を計算します。異なる引数の値の数が`N`を超える場合、この関数は`N` + 1を返します。それ以外の場合は正確な値を計算します。

小さな`N`（最大10）での使用が推奨されます。`N`の最大値は100です。

集約関数の状態において、この関数は1 + `N` * 1つの値のバイトサイズと同等のメモリ量を使用します。
文字列を扱う場合、この関数は8バイトの非暗号化ハッシュを格納します。文字列用の計算は近似されます。

たとえば、ユーザーがウェブサイトで行ったすべての検索クエリをログに記録するテーブルがあるとします。テーブルの各行は単一の検索クエリを表し、カラムにはユーザーID、検索クエリ、およびクエリのタイムスタンプがあります。`uniqUpTo`を使用して、少なくとも5人のユニークなユーザーが生成したキーワードのみを表示するレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)`は、各`SearchPhrase`に対してユニークな`UserID`の値の数を計算しますが、4つのユニーク値までしかカウントしません。`SearchPhrase`に対するユニークな`UserID`の値が4つを超える場合、関数は5（4 + 1）を返します。`HAVING`句は、そのユニークな`UserID`の値の数が5未満の`SearchPhrase`をフィルタリングします。これにより、少なくとも5人のユニークユーザーによって使用された検索キーワードのリストが得られます。

## sumMapFiltered {#summapfiltered}

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同様に動作しますが、フィルタリングに使用するキーの配列もパラメータとして受け取ります。これにより、高いカーディナリティのあるキーを扱う場合に特に便利です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)キー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- 整列された順序のキーのタプルと、対応するキーの合計値という2つの配列を返します。

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

この関数は[sumMap](/sql-reference/aggregate-functions/reference/summap)と同様に動作しますが、フィルタリングに使用するキーの配列もパラメータとして受け取ります。これにより、高いカーディナリティのあるキーを扱う場合に特に便利です。[sumMapFiltered](#summapfiltered)関数とは異なり、オーバーフローのある合計を行います。つまり、引数のデータ型と同じデータ型で合計を返します。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

- `keys_to_keep`: フィルタリングに使用する[配列](../data-types/array.md)キー。
- `keys`: [配列](../data-types/array.md)のキー。
- `values`: [配列](../data-types/array.md)の値。

**返される値**

- 整列された順序のキーのタプルと、対応するキーの合計値という2つの配列を返します。

**例**

この例では、テーブル`sum_map`を作成し、いくつかのデータを挿入してから、比較のために`sumMapFilteredWithOverflow`および`sumMapFiltered`と`toTypeName`関数を使用します。ここで`requests`は作成されたテーブルの`UInt8`型であり、`sumMapFiltered`はオーバーフローを避けるために合計された値の型を`UInt64`に昇格させましたが、`sumMapFilteredWithOverflow`は型を`UInt8`として保持しており、結果を格納するには不十分でした。つまり、オーバーフローが発生しました。

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

イベントチェーンに一致する次のイベントの値を返します。

_実験的な関数で、`SET allow_experimental_funnel_functions = 1`で有効にします。_

**構文**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — 移動する方向を設定するために使用されます。
  - forward — 前方に移動。
  - backward — 後方に移動。

- `base` — 基準点を設定するために使用されます。
  - head — 基準点を最初のイベントに設定。
  - tail — 基準点を最後のイベントに設定。
  - first_match — 基準点を最初の一致した`event1`に設定。
  - last_match — 基準点を最後の一致した`event1`に設定。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型：[Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime)、および他の符号なし整数型。
- `event_column` — 次のイベントの値を返すカラムの名前。サポートされているデータ型：[String](../../sql-reference/data-types/string.md)および[Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基準点が満たす必要のある条件。
- `event1`, `event2`, ... — イベントのチェーンを説明する条件。[UInt8](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンが一致しない場合または次の値が存在しない場合。

型：[Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントがA->B->C->D->Eであり、B->Cの後のイベントがDであることを知りたい場合に使用できます。

A->Bの後のイベントを検索するクエリステートメント：

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

**`forward`および`head`の動作**

```sql
ALTER TABLE test_flow DELETE WHERE 1 = 1 settings mutations_sync = 1;

INSERT INTO test_flow VALUES (1, 1, 'Home') (2, 1, 'Gift') (3, 1, 'Exit');
INSERT INTO test_flow VALUES (1, 2, 'Home') (2, 2, 'Home') (3, 2, 'Gift') (4, 2, 'Basket');
INSERT INTO test_flow VALUES (1, 3, 'Gift') (2, 3, 'Home') (3, 3, 'Gift') (4, 3, 'Basket');
```

```sql
SELECT id, sequenceNextNode('forward', 'head')(dt, page, page = 'Home', page = 'Home', page = 'Gift') FROM test_flow GROUP BY id;

                  dt   id   page
 1970-01-01 09:00:01    1   Home // Base point, Matched with Home
 1970-01-01 09:00:02    1   Gift // Matched with Gift
 1970-01-01 09:00:03    1   Exit // The result

 1970-01-01 09:00:01    2   Home // Base point, Matched with Home
 1970-01-01 09:00:02    2   Home // Unmatched with Gift
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // Base point, Unmatched with Home
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward`および`tail`の動作**

```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // Base point, Unmatched with Basket

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // The result
1970-01-01 09:00:03    2   Gift // Matched with Gift
1970-01-01 09:00:04    2   Basket // Base point, Matched with Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift // Base point, Matched with Gift
1970-01-01 09:00:04    3   Basket // Base point, Matched with Basket
```

**`forward`および`first_match`の動作**

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit // The result

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket  The result

1970-01-01 09:00:01    3   Gift // Base point
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit // Unmatched with Home

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket // Unmatched with Home

1970-01-01 09:00:01    3   Gift // Base point
1970-01-01 09:00:02    3   Home // Matched with Home
1970-01-01 09:00:03    3   Gift // The result
1970-01-01 09:00:04    3   Basket
```

**`backward`および`last_match`の動作**

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // The result
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // The result
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // The result
1970-01-01 09:00:03    3   Gift // Base point
1970-01-01 09:00:04    3   Basket
```

**`base_condition`の動作**

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
 1970-01-01 09:00:01    1   A      ref4 // The head can not be base point because the ref column of the head unmatched with 'ref1'.
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
 1970-01-01 09:00:04    1   B      ref1 // The tail can not be base point because the ref column of the tail unmatched with 'ref4'.
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // This row can not be base point because the ref column unmatched with 'ref3'.
 1970-01-01 09:00:02    1   A      ref3 // Base point
 1970-01-01 09:00:03    1   B      ref2 // The result
 1970-01-01 09:00:04    1   B      ref1
```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // The result
 1970-01-01 09:00:03    1   B      ref2 // Base point
 1970-01-01 09:00:04    1   B      ref1 // This row can not be base point because the ref column unmatched with 'ref2'.
```
