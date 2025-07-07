---
'description': 'Documentation for Parametric Aggregate Functions'
'sidebar_label': 'Parametric'
'sidebar_position': 38
'slug': '/sql-reference/aggregate-functions/parametric-functions'
'title': 'Parametric Aggregate Functions'
---

# パラメトリック集約関数

一部の集約関数は、圧縮に使用される引数カラムだけでなく、初期化のための定数であるパラメーターのセットを受け入れることができます。構文は、1つの括弧の代わりに2つの括弧のペアです。最初のものはパラメーター用、2つ目は引数用です。
## histogram {#histogram}

適応的なヒストグラムを計算します。正確な結果を保証するものではありません。

```sql
histogram(number_of_bins)(values)
```

この関数は、[A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf)を使用しています。ヒストグラムビンの境界は、新しいデータが関数に入るにつれて調整されます。一般的なケースでは、ビンの幅は等しくありません。

**引数**

`values` — 入力値の結果をもたらす [Expression](/sql-reference/syntax#expressions)。

**パラメーター**

`number_of_bins` — ヒストグラムのビンの最大数。この関数は自動的にビンの数を計算します。指定されたビンの数に達しようとしますが、失敗した場合はより少ないビンを使用します。

**返される値**

- 次の形式の [Array](../../sql-reference/data-types/array.md) の [Tuples](../../sql-reference/data-types/tuple.md):

        ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

        - `lower` — ビンの下限。
        - `upper` — ビンの上限。
        - `height` — 計算されたビンの高さ。

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

ヒストグラムは [bar](/sql-reference/functions/other-functions#bar) 関数を使って視覚化できます。例えば：

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

この場合、ヒストグラムビンの境界が不明であることを覚えておくべきです。
## sequenceMatch {#sequencematch}

シーケンスがパターンに一致するイベントチェーンを含むかどうかを確認します。

**構文**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンスに配置される場合があります。
:::

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は `Date` および `DateTime` です。サポートされている [UInt](../../sql-reference/data-types/int-uint.md) データ型のいずれかを使用することもできます。

- `cond1`, `cond2` — イベントのチェーンを記述する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスが条件で説明されていないデータを含む場合、関数はそれらをスキップします。

**パラメーター**

- `pattern` — パターン文字列。 [パターン構文](#pattern-syntax)を参照してください。

**返される値**

- パターンが一致した場合は1。
- パターンが一致しない場合は0。

型: `UInt8`。
#### パターン構文 {#pattern-syntax}

- `(?N)` — 条件引数の位置 `N` に一致します。条件は `[1, 32]` の範囲で番号が付けられています。たとえば、`(?1)` は `cond1` パラメーターに渡された引数に一致します。

- `.*` — 任意の数のイベントに一致します。このパターンの要素に一致させるために条件引数は必要ありません。

- `(?t operator value)` — 2つのイベントを区切るべき時間を秒単位で設定します。たとえば、パターン `(?1)(?t>1800)(?2)` は、1800秒以上の間隔で発生するイベントに一致します。任意の数のイベントがこれらのイベントの間に存在する可能性があります。演算子 `>=`, `>`, `<`, `<=`, `==` を使用できます。

**例**

`t` テーブルのデータを考えます：

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

この関数は、1に続く2のイベントチェーンを見つけました。条件で説明されていない3の番号はスキップされました。条件の一部としてこの番号を考慮に入れた場合、以下のようにすべきです。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、関数はパターンと一致するイベントチェーンを見つけられませんでした。なぜなら、番号3のイベントは1と2の間に発生したからです。同様のケースで番号4の条件を確認した場合、シーケンスはパターンと一致します。

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

パターンに一致したイベントチェーンの数をカウントします。この関数は、重複していないイベントチェーンを検索します。現在のチェーンが一致した後に次のチェーンを検索し始めます。

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンスに配置される場合があります。
:::

**構文**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は `Date` および `DateTime` です。サポートされている [UInt](../../sql-reference/data-types/int-uint.md) データ型のいずれかを使用することもできます。

- `cond1`, `cond2` — イベントのチェーンを記述する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスが条件で説明されていないデータを含む場合、関数はそれらをスキップします。

**パラメーター**

- `pattern` — パターン文字列。 [パターン構文](#pattern-syntax)を参照してください。

**返される値**

- 一致した重複のないイベントチェーンの数。

型: `UInt64`。

**例**

`t` テーブルのデータを考えます：

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

任意の数の他の番号の間に番号1の後に番号2が何回出現したかをカウントします：

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```
## sequenceMatchEvents {#sequencematchevents}

パターンに一致した最長のイベントチェーンのイベントのタイムスタンプを返します。

:::note
同じ秒に発生するイベントは、結果に影響を与える未定義の順序でシーケンスに配置される場合があります。
:::

**構文**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

- `timestamp` — 時間データを含むと見なされるカラム。典型的なデータ型は `Date` および `DateTime` です。サポートされている [UInt](../../sql-reference/data-types/int-uint.md) データ型のいずれかを使用することもできます。

- `cond1`, `cond2` — イベントのチェーンを記述する条件。データ型: `UInt8`。最大32の条件引数を渡すことができます。この関数は、これらの条件で説明されたイベントのみを考慮します。シーケンスが条件で説明されていないデータを含む場合、関数はそれらをスキップします。

**パラメーター**

- `pattern` — パターン文字列。 [パターン構文](#pattern-syntax)を参照してください。

**返される値**

- イベントチェーンからの一致した条件引数 (?N) のタイムスタンプの配列。配列内の位置は、パターン内での条件引数の位置に一致します。

型: Array。

**例**

`t` テーブルのデータを考えます：

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

最長のチェーンのイベントのタイムスタンプを返します 

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

スライディングウィンドウ内でイベントチェーンを検索し、チェーンから発生したイベントの最大数を計算します。

この関数は以下のアルゴリズムに従って動作します：

- 関数は、チェーン内の最初の条件をトリガーするデータを検索し、イベントカウンターを1に設定します。これがスライディングウィンドウが始まる瞬間です。

- チェーンからのイベントがウィンドウ内で連続して発生する場合、カウンターは増加します。イベントのシーケンスが中断された場合、カウンターは増加しません。

- データに異なる完了ポイントで複数のイベントチェーンがある場合、関数は最長のチェーンのサイズのみを出力します。

**構文**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされるデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) および他の符号なし整数型 (タイムスタンプは `UInt64` 型をサポートしていますが、その値は Int64の最大値である 2^63 - 1 を超えることはできません)。
- `cond` — イベントチェーンを記述する条件またはデータ。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメーター**

- `window` — スライディングウィンドウの長さで、最初の条件と最後の条件の間の時間間隔です。 `window` の単位は `timestamp` 自体によって異なります。`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window` で定義されます。
- `mode` — オプションの引数です。1つ以上のモードを設定できます。
    - `'strict_deduplication'` — 同じ条件がイベントのシーケンスに適用される場合、その繰り返しイベントはさらなる処理を中断させます。注意: 同じイベントに対して複数の条件が適用される場合、予期しない動作が起こる可能性があります。
    - `'strict_order'` — 他のイベントの介入を許可しません。例えば、`A->B->D->C` の場合、`D` で `A->B->C` の検索を停止し、最大イベントレベルは2になります。
    - `'strict_increase'` — タイムスタンプが厳密に増加しているイベントにのみ条件を適用します。
    - `'strict_once'` — 条件を満たすたびに、イベントをチェーン内で1回だけカウントします。

**返される値**

スライディングウィンドウ内のチェーンからトリガーされた連続条件の最大数。
選択したすべてのチェーンが分析されます。

型: `Integer`。

**例**

ユーザーがオンラインストアで電話を選択し、2回購入するのに十分な時間があるかどうかを判断します。

次の条件のイベントチェーンを設定します：

1.  ユーザーがストアのアカウントにログインしました (`eventID = 1003`)。
2.  ユーザーが電話を検索しました (`eventID = 1007, product = 'phone'`)。
3.  ユーザーが注文をしました (`eventID = 1009`)。
4.  ユーザーが再度注文をしました (`eventID = 1010`)。

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

ユーザー `user_id` が2019年1月から2月の期間にチェーンをどのくらい進んだのかを調べます。

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

この関数は、イベントに対して条件が満たされたかどうかを示す型 `UInt8` の1から32の引数のセットを引数として取ります。
任意の条件を引数として指定できます（[WHERE](/sql-reference/statements/select/where) のように）。

条件は、最初の条件を除いてペアで適用されます: 2番目の条件が真である場合第1および第2が真、3番目の場合は第1および第3が真になります。

**構文**

```sql
retention(cond1, cond2, ..., cond32);
```

**引数**

- `cond` — `UInt8` 結果 (1または0) を返す式。

**返される値**

1または0の配列。

- 1 — イベントの条件が満たされました。
- 0 — イベントの条件が満たされませんでした。

型: `UInt8`。

**例**

サイトトラフィックを測定するための `retention` 関数の計算の例を考えます。

**1.** サンプルを示すためのテーブルを作成します。

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

**2.** `retention` 関数を使用して、ユーザーをユニークID `uid` でグループ化します。

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

**3.** 日ごとのサイト訪問数を合計します。

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

- `r1` - 2020-01-01 にサイトを訪れたユニークな訪問者の数（`cond1` 条件）。
- `r2` - 2020-01-01 と2020-01-02 の間の特定の期間にサイトを訪れたユニークな訪問者の数（`cond1` および `cond2` 条件）。
- `r3` - 2020-01-01 および2020-01-03 の特定の期間にサイトを訪れたユニークな訪問者の数（`cond1` および `cond3` 条件）。
## uniqUpTo(N)(x) {#uniquptonx}

指定した制限 `N` までの引数の異なる値の数を計算します。異なる引数の値の数が `N` を超える場合、この関数は `N` + 1 を返します。それ以外の場合は、正確な値を計算します。

小さい `N`、最大で10での使用を推奨します。`N` の最大値は100です。

集約関数の状態には、この関数は1 + `N` * 1つの値のバイト数に等しいメモリ量を使用します。
文字列を扱う場合、この関数は8バイトの非暗号化ハッシュを保存します；計算は文字列のための近似です。

例えば、ユーザーがあなたのウェブサイトで行った各検索クエリを記録するテーブルがあるとします。テーブル内の各行は単一の検索クエリを表し、ユーザーID、検索クエリ、およびクエリのタイムスタンプの列を持っています。`uniqUpTo` を使って、少なくとも5人のユニークなユーザーが使用したキーワードのみを示すレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)` は、各 `SearchPhrase` のユニークな `UserID` 値の数を計算しますが、最大4つのユニークな値までしかカウントしません。`SearchPhrase` にユニークな `UserID` 値が4つ以上ある場合、関数は5（4 + 1）を返します。`HAVING` 句は Uniqueな `UserID` 値の数が5未満の `SearchPhrase` 値をフィルタリングします。これは、少なくとも5人のユニークなユーザーによって使用された検索キーワードのリストを提供します。
## sumMapFiltered {#summapfiltered}

この関数は、[sumMap](/sql-reference/aggregate-functions/reference/summap) と同じように動作しますが、フィルタリングに使用するキーの配列もパラメーターとして受け入れます。これは、高いカーディナリティのキーを扱う際に特に便利です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメーター**

- `keys_to_keep`: フィルタリングに使用する [Array](../data-types/array.md) のキー。
- `keys`: [Array](../data-types/array.md) のキー。
- `values`: [Array](../data-types/array.md) の値。

**返される値**

- ソートされた順序でのキーのタプルと、対応するキーに対して合計された値の2つの配列を返します。

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

この関数は、[sumMap](/sql-reference/aggregate-functions/reference/summap) と同じように動作しますが、フィルタリングに使用するキーの配列もパラメーターとして受け入れます。これは、高いカーディナリティのキーを扱う際に特に便利です。[sumMapFiltered](#summapfiltered) 関数とは異なり、オーバーフローでの合計を実行します。つまり、合計のデータ型が引数のデータ型と同じであることを保証します。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメーター**

- `keys_to_keep`: フィルタリングに使用する [Array](../data-types/array.md) のキー。
- `keys`: [Array](../data-types/array.md) のキー。
- `values`: [Array](../data-types/array.md) の値。

**返される値**

- ソートされた順序でのキーのタプルと、対応するキーに対して合計された値の2つの配列を返します。

**例**

この例では `sum_map` テーブルを作成し、データを挿入し、その後 `sumMapFilteredWithOverflow` と `sumMapFiltered` の両方と、結果の比較のために `toTypeName` 関数を使用します。リクエストが作成されたテーブルで `UInt8` 型であるのに対し、`sumMapFiltered` はオーバーフローを回避するために合計された値の型を `UInt64` に昇格させますが、`sumMapFilteredWithOverflow` は型を `UInt8` のまま保持するため、結果を保存するには十分ではありません。つまり、オーバーフローが発生しました。

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

イベントチェーンに一致した次のイベントの値を返します。

_実験的な関数であり、`SET allow_experimental_funnel_functions = 1` を設定することで有効にします。_

**構文**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメータ**

- `direction` — 移動方向を指定します。
    - forward — 前方へ移動します。
    - backward — 後方へ移動します。

- `base` — 基準点を設定します。
    - head — 基準点を最初のイベントに設定します。
    - tail — 基準点を最後のイベントに設定します。
    - first_match — 基準点を最初に一致した `event1` に設定します。
    - last_match — 基準点を最後に一致した `event1` に設定します。

**引数**

- `timestamp` — タイムスタンプを含むカラムの名前。サポートされているデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) および他の符号なし整数型。
- `event_column` — 次の返されるべきイベントの値を含むカラムの名前。サポートされているデータ型: [String](../../sql-reference/data-types/string.md) および [Nullable(String)](../../sql-reference/data-types/nullable.md)。
- `base_condition` — 基準点が満たすべき条件。
- `event1`, `event2`, ... — イベントのチェーンを説明する条件。 [UInt8](../../sql-reference/data-types/int-uint.md)。

**返される値**

- `event_column[next_index]` — パターンが一致し、次の値が存在する場合。
- `NULL` - パターンが一致しない場合、または次の値が存在しない場合。

タイプ: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントが A->B->C->D->E の場合に、B->C の次のイベントである D を知りたいときに使用できます。

A->B の次のイベントを検索するクエリ文:

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
 1970-01-01 09:00:02    2   Home // Giftに一致しない
 1970-01-01 09:00:03    2   Gift
 1970-01-01 09:00:04    2   Basket

 1970-01-01 09:00:01    3   Gift // 基準点、Homeに一致しない
 1970-01-01 09:00:02    3   Home
 1970-01-01 09:00:03    3   Gift
 1970-01-01 09:00:04    3   Basket
```

**`backward` と `tail` の動作**

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

**`forward` と `first_match` の動作**

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


**`backward` と `last_match` の動作**

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
 1970-01-01 09:00:01    1   A      ref4 // 基準点にはなりません。headのrefカラムが'ref1'に一致しないため。
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
 1970-01-01 09:00:04    1   B      ref1 // 基準点にはなりません。tailのrefカラムが'ref4'に一致しないため。
```

```sql
SELECT id, sequenceNextNode('forward', 'first_match')(dt, page, ref = 'ref3', page = 'A') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4 // この行は基準点にはなりません。refカラムが'ref3'に一致しないため。
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
 1970-01-01 09:00:04    1   B      ref1 // この行は基準点にはなりません。refカラムが'ref2'に一致しないため。
```
