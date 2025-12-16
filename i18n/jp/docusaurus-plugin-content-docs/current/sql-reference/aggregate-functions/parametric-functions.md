---
description: 'パラメトリック集約関数のドキュメント'
sidebar_label: 'パラメトリック'
sidebar_position: 38
slug: /sql-reference/aggregate-functions/parametric-functions
title: 'パラメトリック集約関数'
doc_type: 'reference'
---

# パラメトリック集約関数 {#parametric-aggregate-functions}

一部の集約関数は、（圧縮に使用される）引数列だけでなく、初期化に用いる定数パラメータの集合も受け取ることができます。構文としては、1 組ではなく 2 組の括弧を使用します。最初の括弧はパラメータ用で、2 番目の括弧は引数用です。

## histogram {#histogram}

適応型ヒストグラムを計算します。厳密な結果が得られることは保証されません。

```sql
histogram(number_of_bins)(values)
```

この関数は [A Streaming Parallel Decision Tree Algorithm](http://jmlr.org/papers/volume11/ben-haim10a/ben-haim10a.pdf) に基づいています。ヒストグラムのビンの境界は、新しいデータが関数に入力されるたびに調整されます。一般的には、ビンの幅は等しくありません。

**引数**

`values` — 入力値を生成する[式](/sql-reference/syntax#expressions)。

**パラメータ**

`number_of_bins` — ヒストグラム内のビン数の上限。関数はビン数を自動的に計算します。指定されたビン数に到達するよう試行しますが、失敗した場合はより少ないビン数を使用します。

**戻り値**

* 次の形式の [Tuple](../../sql-reference/data-types/tuple.md) の [Array](../../sql-reference/data-types/array.md):

  ```
        [(lower_1, upper_1, height_1), ... (lower_N, upper_N, height_N)]
        ```

  * `lower` — ビンの下限。
  * `upper` — ビンの上限。
  * `height` — ビンの高さ（計算結果）。

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

例えば、[bar](/sql-reference/functions/other-functions#bar) 関数を使ってヒストグラムを可視化できます。

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

この場合、ヒストグラムのビン境界は分かっていないことを念頭に置いてください。

## sequenceMatch {#sequencematch}

シーケンスにパターンに一致するイベントチェーンが含まれているかどうかを判定します。

**構文**

```sql
sequenceMatch(pattern)(timestamp, cond1, cond2, ...)
```

:::note
同じ秒に発生したイベントは、シーケンス内での並び順が未定義となる場合があり、結果に影響する可能性があります。
:::

**引数**

* `timestamp` — 時刻データを含むとみなされるカラム。代表的なデータ型は `Date` および `DateTime` です。サポートされている任意の [UInt](../../sql-reference/data-types/int-uint.md) 型も使用できます。

* `cond1`, `cond2` — イベントのシーケンスを表す条件。データ型: `UInt8`。条件引数は最大 32 個まで指定できます。関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

* `pattern` — パターン文字列。[パターン構文](#pattern-syntax) を参照してください。

**返される値**

* パターンに一致した場合は 1。
* パターンに一致しない場合は 0。

型: `UInt8`。

#### パターン構文 {#pattern-syntax}

* `(?N)` — 位置 `N` の条件引数に一致します。条件は `[1, 32]` の範囲で番号付けされます。たとえば、`(?1)` は `cond1` パラメータに渡された引数に一致します。

* `.*` — 任意個数のイベントに一致します。このパターン要素に一致させるために条件引数を使用する必要はありません。

* `(?t operator value)` — 2 つのイベントを隔てる時間（秒数）を指定します。たとえば、パターン `(?1)(?t>1800)(?2)` は、互いに 1800 秒より長い間隔で発生したイベントに一致します。これらのイベントの間には、任意の数の任意のイベントが存在し得ます。`>=`、`>`、`<`、`<=`、`==` 演算子を使用できます。

**例**

`t` テーブル内の次のデータを考えます。

```text
┌─time─┬─number─┐
│    1 │      1 │
│    2 │      3 │
│    3 │      2 │
└──────┴────────┘
```

次のクエリを実行してください：

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                     1 │
└───────────────────────────────────────────────────────────────────────┘
```

この関数は、数値1の後に数値2が続くイベントチェーンを見つけました。その間にある3は、イベントとして記述されていないためスキップされました。もし例で示したイベントチェーンを検索する際にこの数値も考慮したい場合は、この数値に対する条件を追加する必要があります。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 3) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 3))─┐
│                                                                                        0 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

この場合、この関数はパターンに一致するイベントチェーンを見つけられませんでした。番号 3 のイベントが 1 と 2 の間に発生していたためです。同じ状況で番号 4 について条件を確認した場合は、そのシーケンスはパターンに一致します。

```sql
SELECT sequenceMatch('(?1)(?2)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatch('(?1)(?2)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

* [sequenceCount](#sequencecount)

## sequenceCount {#sequencecount}

パターンに一致したイベントチェーンの個数をカウントします。関数は、互いに重複しないイベントチェーンを検索します。現在のチェーンが一致した後に、次のチェーンの検索を開始します。

:::note
同じ秒に発生したイベントは、シーケンス内で順序が未定義となる場合があり、結果に影響を与える可能性があります。
:::

**構文**

```sql
sequenceCount(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

* `timestamp` — 時刻データを含むと見なされる列。一般的なデータ型は `Date` と `DateTime` です。サポートされているいずれかの [UInt](../../sql-reference/data-types/int-uint.md) 型も使用できます。

* `cond1`, `cond2` — 一連のイベントを表す条件。データ型: `UInt8`。条件引数は最大 32 個まで指定できます。関数は、これらの条件で表現されるイベントのみを対象とします。シーケンス内に条件で表現されていないデータが含まれている場合、そのデータは関数によってスキップされます。

**パラメータ**

* `pattern` — パターン文字列。[パターン構文](#pattern-syntax) を参照してください。

**戻り値**

* 一致した、互いに重ならないイベントチェーンの数。

型: `UInt64`。

**例**

`t` テーブル内のデータを考えます。

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

「1」の後に、その間にいくつでも他の数値が入ってよいものとして、「2」が現れる回数を数えます。

```sql
SELECT sequenceCount('(?1).*(?2)')(time, number = 1, number = 2) FROM t
```

```text
┌─sequenceCount('(?1).*(?2)')(time, equals(number, 1), equals(number, 2))─┐
│                                                                       2 │
└─────────────────────────────────────────────────────────────────────────┘
```

## sequenceMatchEvents {#sequencematchevents}

パターンに一致した最長のイベントチェーン内のイベントタイムスタンプを返します。

:::note
同じ秒に発生したイベントは、シーケンス内で順序が未定義となる場合があり、結果に影響する可能性があります。
:::

**構文**

```sql
sequenceMatchEvents(pattern)(timestamp, cond1, cond2, ...)
```

**引数**

* `timestamp` — 時刻データを含むと見なされるカラム。代表的なデータ型は `Date` および `DateTime` です。サポートされている任意の [UInt](../../sql-reference/data-types/int-uint.md) 型も使用できます。

* `cond1`, `cond2` — イベントチェーンを表す条件。データ型: `UInt8`。条件引数は最大 32 個まで渡すことができます。関数は、これらの条件で記述されたイベントのみを考慮します。シーケンスに条件で記述されていないデータが含まれている場合、関数はそれらをスキップします。

**パラメータ**

* `pattern` — パターン文字列。[パターン構文](#pattern-syntax) を参照。

**返される値**

* イベントチェーンから、一致した条件引数 (?N) のタイムスタンプの配列。配列内の位置は、パターン内の条件引数の位置と対応します。

型: Array。

**例**

次のような `t` テーブル内のデータを考えます。

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

最長チェーンのイベントのタイムスタンプを返す

```sql
SELECT sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, number = 1, number = 2, number = 4) FROM t
```

```text
┌─sequenceMatchEvents('(?1).*(?2).*(?1)(?3)')(time, equals(number, 1), equals(number, 2), equals(number, 4))─┐
│ [1,3,4]                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

* [sequenceMatch](#sequencematch)

## windowFunnel {#windowfunnel}

スライディング時間ウィンドウ内でイベントチェーンを探索し、そのチェーンから発生したイベント数の最大値を計算します。

この関数は次のアルゴリズムに従って動作します。

* まず、チェーン内の最初の条件を満たすデータを検索し、イベントカウンターを 1 に設定します。この時点がスライディングウィンドウの開始時刻になります。

* ウィンドウ内でチェーンに属するイベントが順番どおりに発生した場合、カウンターをインクリメントします。イベントの順序が崩れた場合、カウンターはインクリメントされません。

* データに複数のイベントチェーンがあり、それぞれ進行度合いが異なる場合、関数は最も長いチェーンの長さのみを出力します。

**構文**

```sql
windowFunnel(window, [mode, [mode, ... ]])(timestamp, cond1, cond2, ..., condN)
```

**引数**

* `timestamp` — タイムスタンプを含む列の名前。サポートされるデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) およびその他の符号なし整数型（`timestamp` 列は `UInt64` 型をサポートしますが、その値は Int64 の最大値である 2^63 - 1 を超えることはできません）。
* `cond` — 事象の連鎖を表す条件またはデータ。[UInt8](../../sql-reference/data-types/int-uint.md)。

**パラメータ**

* `window` — スライディングウィンドウの長さ。最初と最後の条件の間の時間間隔です。`window` の単位は `timestamp` 自体に依存し、状況によって異なります。`timestamp of cond1 <= timestamp of cond2 <= ... <= timestamp of condN <= timestamp of cond1 + window` という式により決定されます。
* `mode` — 省略可能な引数です。1 つ以上のモードを指定できます。
  * `'strict_deduplication'` — 同じ条件がイベントのシーケンスに対して成り立つ場合、そのような繰り返しイベントは以降の処理を打ち切ります。注: 同じイベントに対して複数の条件が成り立つ場合、想定と異なる動作になる可能性があります。
  * `'strict_order'` — 他のイベントの介在を許可しません。例えば `A->B->D->C` の場合、`A->B->C` の検出は `D` の時点で停止し、最大イベントレベルは 2 になります。
  * `'strict_increase'` — タイムスタンプが厳密に増加しているイベントにのみ条件を適用します。
  * `'strict_once'` — 条件を複数回満たす場合でも、チェーン内で各イベントは 1 回だけカウントします。

**戻り値**

スライディング時間ウィンドウ内で、チェーン内で連続して満たされた条件の最大数。
選択されたすべてのチェーンが解析されます。

型: `Integer`.

**例**

オンラインストアにおいて、ユーザーが電話を選択して 2 回購入するのに、ある一定時間が十分かどうかを判定します。

次のイベントチェーンを設定します:

1. ユーザーがストアのアカウントにログインした（`eventID = 1003`）。
2. ユーザーが電話を検索した（`eventID = 1007, product = 'phone'`）。
3. ユーザーが注文を行った（`eventID = 1009`）。
4. ユーザーがその注文を再度行った（`eventID = 1010`）。

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

2019年1月から2月の期間に、ユーザー `user_id` がチェーンをどこまで進んだかを確認します。

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

この関数は、イベントで特定の条件が満たされたかどうかを示す `UInt8` 型の引数を 1〜32 個受け取ります。
どの条件も（[WHERE](/sql-reference/statements/select/where) と同様に）引数として指定できます。

最初の条件を除き、それ以外の条件はペアで評価されます。2 番目の戻り値は 1 番目と 2 番目の条件がともに真のときに真となり、3 番目の戻り値は 1 番目と 3 番目の条件がともに真のときに真となる、という具合です。

**構文**

```sql
retention(cond1, cond2, ..., cond32);
```

**引数**

* `cond` — `UInt8` の結果（1 または 0）を返す式。

**戻り値**

1 または 0 の配列。

* 1 — イベントで条件が満たされた。
* 0 — イベントで条件が満たされなかった。

型: `UInt8`。

**例**

サイトトラフィックを把握するために `retention` 関数を計算する例を考えます。

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

**2.** `retention` 関数を使用して、ユーザーを一意の ID `uid` ごとにグループ化します。

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

**3.** 1 日あたりのサイト訪問数の合計を計算します。

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

結果：

```text
┌─r1─┬─r2─┬─r3─┐
│  5 │  5 │  5 │
└────┴────┴────┘
```

ここで:

* `r1` - 2020-01-01 の一日を通してサイトを訪問したユニーク訪問者数（`cond1` 条件）。
* `r2` - 2020-01-01 から 2020-01-02 の間の特定の期間にサイトを訪問したユニーク訪問者数（`cond1` および `cond2` 条件）。
* `r3` - 2020-01-01 および 2020-01-03 の特定の期間にサイトを訪問したユニーク訪問者数（`cond1` および `cond3` 条件）。

## uniqUpTo(N)(x) {#uniquptonx}

引数の異なる値の個数を、指定された上限 `N` まで数えます。異なる値の個数が `N` より大きい場合、この関数は `N` + 1 を返し、それ以外の場合は正確な値を返します。

小さい `N`（最大 10 程度）での利用を推奨します。`N` の最大値は 100 です。

集約関数の状態に対して、この関数は `1 + N * （1 値あたりのサイズ（バイト））` に等しい量のメモリを使用します。
文字列を扱う場合、この関数は 8 バイトの非暗号学的ハッシュを保存します。文字列に対する計算は近似となります。

例えば、ウェブサイトでユーザーが行ったすべての検索クエリを記録するテーブルがあるとします。テーブルの各行は 1 件の検索クエリを表し、ユーザー ID、検索クエリ、クエリのタイムスタンプの列を持ちます。`uniqUpTo` を使用すると、少なくとも 5 人の一意のユーザーによって検索されたキーワードのみを表示するレポートを生成できます。

```sql
SELECT SearchPhrase
FROM SearchLog
GROUP BY SearchPhrase
HAVING uniqUpTo(4)(UserID) >= 5
```

`uniqUpTo(4)(UserID)` は、各 `SearchPhrase` ごとの一意な `UserID` の数を計算しますが、数えるのは一意な値を最大 4 個までに制限します。ある `SearchPhrase` に対して一意な `UserID` が 4 個を超えて存在する場合、この関数は 5（4 + 1）を返します。その後、`HAVING` 句で、一意な `UserID` の数が 5 未満である `SearchPhrase` を除外します。これにより、少なくとも 5 人の異なるユーザーによって使用された検索キーワードの一覧を取得できます。

## sumMapFiltered {#summapfiltered}

この関数は [sumMap](/sql-reference/aggregate-functions/reference/summap) と同様に動作しますが、追加でフィルタリングに使用するキーの配列をパラメータとして受け取ります。これはキーのカーディナリティが高いキー集合を扱う場合に特に有用です。

**構文**

`sumMapFiltered(keys_to_keep)(keys, values)`

**パラメータ**

* `keys_to_keep`: フィルタリングに使用するキーの [Array](../data-types/array.md)。
* `keys`: キーの [Array](../data-types/array.md)。
* `values`: 値の [Array](../data-types/array.md)。

**戻り値**

* 2 つの配列からなるタプルを返します。キーをソートした配列と、それぞれのキーに対応する値の合計からなる配列です。

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

この関数は [sumMap](/sql-reference/aggregate-functions/reference/summap) と同様に動作しますが、パラメータとしてフィルタリングに使用するキー配列も受け取る点が異なります。これは、キーのカーディナリティが高い場合に特に有用です。また、[sumMapFiltered](#summapfiltered) 関数とは、オーバーフローを許容して合計を行う点が異なります。つまり、合計結果のデータ型が引数のデータ型と同じになります。

**構文**

`sumMapFilteredWithOverflow(keys_to_keep)(keys, values)`

**パラメータ**

* `keys_to_keep`: フィルタリングに使用するキーの [Array](../data-types/array.md)。
* `keys`: キーの [Array](../data-types/array.md)。
* `values`: 値の [Array](../data-types/array.md)。

**戻り値**

* 2 つの配列からなるタプルを返します。ソート済みのキー配列と、それぞれのキーに対応して合計された値の配列です。

**例**

この例では、まずテーブル `sum_map` を作成し、いくつかのデータを挿入した後、`sumMapFilteredWithOverflow` と `sumMapFiltered` の両方および `toTypeName` 関数を使用し、結果を比較します。作成したテーブルでは `requests` は型 `UInt8` ですが、`sumMapFiltered` はオーバーフローを避けるために合計後の値の型を `UInt64` に昇格させている一方、`sumMapFilteredWithOverflow` は型を `UInt8` のまま保持しており、結果を格納するには十分な大きさではありません。このため、オーバーフローが発生します。

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

イベントチェーンにマッチした次のイベントの値を返します。

*試験的な関数です。有効化するには `SET allow_experimental_funnel_functions = 1` を実行します。*

**構文**

```sql
sequenceNextNode(direction, base)(timestamp, event_column, base_condition, event1, event2, event3, ...)
```

**パラメーター**

* `direction` — 方向を指定して移動に使用します。
  * forward — 前方に移動します。
  * backward — 後方に移動します。

* `base` — 基準点を設定するために使用します。
  * head — 基準点を最初のイベントに設定します。
  * tail — 基準点を最後のイベントに設定します。
  * first&#95;match — 基準点を最初に一致した `event1` に設定します。
  * last&#95;match — 基準点を最後に一致した `event1` に設定します。

**引数**

* `timestamp` — タイムスタンプを含む列名。サポートされるデータ型: [Date](../../sql-reference/data-types/date.md)、[DateTime](/sql-reference/data-types/datetime) およびその他の符号なし整数型。
* `event_column` — 次に返すイベントの値を含む列名。サポートされるデータ型: [String](../../sql-reference/data-types/string.md) および [Nullable(String)](../../sql-reference/data-types/nullable.md)。
* `base_condition` — 基準点が満たすべき条件。
* `event1`, `event2`, ... — イベントの連鎖を表す条件。[UInt8](../../sql-reference/data-types/int-uint.md)。

**戻り値**

* `event_column[next_index]` — パターンが一致し、かつ次の値が存在する場合。
* `NULL` - パターンが一致しない、または次の値が存在しない場合。

型: [Nullable(String)](../../sql-reference/data-types/nullable.md)。

**例**

イベントが A-&gt;B-&gt;C-&gt;D-&gt;E のように並んでおり、B-&gt;C に続くイベント D を知りたい場合に使用できます。

A-&gt;B に続くイベントを検索するクエリ:

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

**`forward` と `head` の挙動**

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

1970-01-01 09:00:01    3   Gift // 基準値、Home とは一致しない
1970-01-01 09:00:02    3   Home
1970-01-01 09:00:03    3   Gift
1970-01-01 09:00:04    3   Basket

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
```sql
SELECT id, sequenceNextNode('backward', 'tail')(dt, page, page = 'Basket', page = 'Basket', page = 'Gift') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home
1970-01-01 09:00:02    1   Gift
1970-01-01 09:00:03    1   Exit // 基準点、Basketに不一致

1970-01-01 09:00:01    2   Home
1970-01-01 09:00:02    2   Home // 結果
1970-01-01 09:00:03    2   Gift // Giftに一致
1970-01-01 09:00:04    2   Basket // 基準点、Basketに一致

1970-01-01 09:00:01    3   Gift
1970-01-01 09:00:02    3   Home // 結果
1970-01-01 09:00:03    3   Gift // 基準点、Giftに一致
1970-01-01 09:00:04    3   Basket // 基準点、Basketに一致
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
```sql
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
1970-01-01 09:00:02    3   Home // Home と一致
1970-01-01 09:00:03    3   Gift // 結果
1970-01-01 09:00:04    3   Basket
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
```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift') FROM test_flow GROUP BY id;
```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, page = 'Gift', page = 'Gift', page = 'Home') FROM test_flow GROUP BY id;

                 dt   id   page
1970-01-01 09:00:01    1   Home // Matched with Home, the result is null
1970-01-01 09:00:02    1   Gift // Base point
1970-01-01 09:00:03    1   Exit

1970-01-01 09:00:01    2   Home // The result
1970-01-01 09:00:02    2   Home // Matched with Home
1970-01-01 09:00:03    2   Gift // Base point
1970-01-01 09:00:04    2   Basket

1970-01-01 09:00:01    3   Gift // The result
1970-01-01 09:00:02    3   Home // Matched with Home
1970-01-01 09:00:03    3   Gift // Base point
1970-01-01 09:00:04    3   Basket
```

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

**`base_condition` の挙動**

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

dt   id   page   ref
1970-01-01 09:00:01    1   A      ref4 // ref 列が &#39;ref3&#39; と一致しないため、この行は基準行にはできません。
1970-01-01 09:00:02    1   A      ref3 // 基準行
1970-01-01 09:00:03    1   B      ref2 // 結果行
1970-01-01 09:00:04    1   B      ref1

```

```sql
SELECT id, sequenceNextNode('backward', 'last_match')(dt, page, ref = 'ref2', page = 'B') FROM test_flow_basecond GROUP BY id;

                  dt   id   page   ref
 1970-01-01 09:00:01    1   A      ref4
 1970-01-01 09:00:02    1   A      ref3 // 結果
 1970-01-01 09:00:03    1   B      ref2 // 基準点
 1970-01-01 09:00:04    1   B      ref1 // この行は ref カラムが 'ref2' と一致しないため、基準点になりません。
```
