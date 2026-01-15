---
description: 'NOT IN、GLOBAL IN、GLOBAL NOT IN 演算子（これらについては別途説明）を除く IN 演算子のドキュメント'
slug: /sql-reference/operators/in
title: 'IN 演算子'
doc_type: 'reference'
---

# IN 演算子 {#in-operators}

`IN`、`NOT IN`、`GLOBAL IN`、`GLOBAL NOT IN` 演算子は、その機能がかなり豊富であるため、別途取り上げます。

演算子の左側は、単一のカラムまたはタプルです。

例:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左辺が索引に含まれる単一のカラムで、右辺が定数の集合である場合、システムはクエリの処理に索引を使用します。

あまり多くの値を明示的に列挙しないでください（たとえば数百万件）。データセットが大きい場合は、一時テーブルに入れて（例として、セクション [External data for query processing](../../engines/table-engines/special/external-data.md) を参照）、そのうえでサブクエリを使用してください。

演算子の右辺には、定数式の集合、定数式を含むタプルの集合（上記の例で示したもの）、あるいはデータベーステーブル名、または括弧で囲んだ `SELECT` サブクエリを指定できます。

ClickHouse では、`IN` サブクエリの左辺と右辺で型が異なることを許容します。
この場合、システムは右辺の値を左辺の型に変換します。これは、右辺に対して [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accurateCastOrNull) 関数が適用されたかのように動作します。

つまり、データ型は [Nullable](../../sql-reference/data-types/nullable.md) となり、変換を
実行できない場合には [NULL](/operations/settings/formats#input_format_null_as_default) が返されます。

**例**

クエリ:

```sql
SELECT '1' IN (SELECT 1);
```

結果：

```text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

演算子の右辺がテーブル名である場合（例えば `UserID IN users`）、これはサブクエリ `UserID IN (SELECT * FROM users)` と等価です。クエリと一緒に送信される外部データを扱う場合に使用します。例えば、フィルタリング対象のユーザー ID の集合をロードした一時テーブル &#39;users&#39; とクエリを一緒に送信できます。

演算子の右辺が Set エンジン（常に RAM 上にある準備済みデータセット）を使用するテーブル名である場合、そのデータセットはクエリごとに再作成されません。

サブクエリでは、タプルをフィルタリングするために複数のカラムを指定できます。

例:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左側と右側のカラムは、同じ型である必要があります。

`IN` 演算子とサブクエリは、集約関数やラムダ関数内も含めて、クエリのあらゆる箇所で使用できます。
例:

```sql
SELECT
    EventDate,
    avg(UserID IN
    (
        SELECT UserID
        FROM test.hits
        WHERE EventDate = toDate('2014-03-17')
    )) AS ratio
FROM test.hits
GROUP BY EventDate
ORDER BY EventDate ASC
```

```text
┌──EventDate─┬────ratio─┐
│ 2014-03-17 │        1 │
│ 2014-03-18 │ 0.807696 │
│ 2014-03-19 │ 0.755406 │
│ 2014-03-20 │ 0.723218 │
│ 2014-03-21 │ 0.697021 │
│ 2014-03-22 │ 0.647851 │
│ 2014-03-23 │ 0.648416 │
└────────────┴──────────┘
```

3月17日以降の各日について、3月17日にサイトを訪問したユーザーによるページビューの割合を算出します。
`IN` 句内のサブクエリは、常に単一のサーバー上で一度だけ実行されます。相関サブクエリはありません。

## NULL の処理 {#null-processing}

リクエスト処理中、`IN` 演算子は、[NULL](/operations/settings/formats#input_format_null_as_default) を含む演算の結果を、`NULL` が演算子の右側か左側かに関係なく常に `0` とみなします。[transform&#95;null&#95;in = 0](../../operations/settings/settings.md#transform_null_in) の場合、`NULL` 値はどのデータセットにも含まれず、互いに対応せず、比較もできません。

`t_null` テーブルを用いた例を次に示します。

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ `SELECT x FROM t_null WHERE y IN (NULL,3)` を実行すると、以下の結果が得られます。

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL` の行がクエリ結果から除外されていることがわかります。これは、ClickHouse が `NULL` が `(NULL,3)` のセットに含まれるかどうかを判定できず、その演算結果として `0` を返すため、`SELECT` によってこの行は最終的な出力から除外されるためです。

```sql
SELECT y IN (NULL, 3)
FROM t_null
```

```text
┌─in(y, tuple(NULL, 3))─┐
│                     0 │
│                     1 │
└───────────────────────┘
```

## 分散サブクエリ {#distributed-subqueries}

サブクエリを伴う `IN` 演算子（`JOIN` 演算子と同様）には 2 通りの使い方があります: 通常の `IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN` です。これらは分散クエリ処理時の実行方法が異なります。

:::note
以下で説明するアルゴリズムは、[settings](../../operations/settings/settings.md) の `distributed_product_mode` 設定によって動作が異なる場合があります。
:::

通常の `IN` を使用すると、クエリはリモートサーバーに送信され、それぞれのサーバーが `IN` 句または `JOIN` 句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN` を使用すると、まず `GLOBAL IN` / `GLOBAL JOIN` 用のすべてのサブクエリが実行され、その結果が一時テーブルに収集されます。その後、その一時テーブルが各リモートサーバーに送信され、各サーバーでこの一時データを用いてクエリが実行されます。

分散クエリでない場合は、通常の `IN` / `JOIN` を使用してください。

分散クエリ処理で `IN` / `JOIN` 句にサブクエリを使用する場合は注意してください。

いくつか例を見ていきます。クラスタ内の各サーバーに通常の **local&#95;table** テーブルがあると仮定します。さらに各サーバーには、クラスタ内のすべてのサーバーを参照する **Distributed** 型の **distributed&#95;table** テーブルもあります。

**distributed&#95;table** へのクエリの場合、そのクエリはすべてのリモートサーバーに送信され、各サーバー上で **local&#95;table** を使って実行されます。

例えば、次のクエリは

```sql
SELECT uniq(UserID) FROM distributed_table
```

という形で、すべてのリモートサーバーに送信されます

```sql
SELECT uniq(UserID) FROM local_table
```

そして、それぞれのサーバー上で並列に実行され、中間結果を結合できる段階に到達するまで処理されます。次に、その中間結果がリクエスト元サーバーに返され、そのサーバー上でマージされ、最終結果がクライアントに送信されます。

では、`IN` を用いたクエリを見てみましょう。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

* 2つのサイトのオーディエンスの共通部分を計算する。

このクエリは、次のようにすべてのリモートサーバーに送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えると、`IN` 句内のデータセットは、各サーバーにローカルに保存されているデータに対してのみ、各サーバー上で独立して収集されます。

このケースを想定しており、単一の UserID のデータが必ず 1 台のサーバー上にすべて存在するように、クラスター内のサーバーへデータを分散させている場合には、これは正しくかつ最適に動作します。この場合、必要なデータはすべて各サーバー上でローカルに利用可能です。そうでない場合、結果は不正確になります。クエリのこのバリエーションを「local IN」と呼びます。

データがクラスター内のサーバー間にランダムに分散されている場合にクエリの動作を正しくするには、サブクエリ内で **distributed&#95;table** を指定できます。クエリは次のようになります。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、次のようにすべてのリモートサーバーに送信されます

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリの実行が各リモートサーバー上で開始されます。サブクエリは分散テーブルを使用しているため、各リモートサーバー上のサブクエリは、次のようにすべてのリモートサーバーに再送信されます。

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

たとえば、100 台のサーバーからなるクラスタがある場合、クエリ全体の実行には 1 万件の個々のリクエストが必要になり、これは一般的に許容できないと見なされます。

このような場合は常に、`IN` の代わりに `GLOBAL IN` を使用する必要があります。次のクエリでどのように動作するかを見てみましょう。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

リクエスト元のサーバーがサブクエリを実行します。

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

その結果は RAM 上の一時テーブルに格納されます。その後、そのリクエストは次のように各リモートサーバーに送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル `_data1` は、クエリとともにすべてのリモートサーバーに送信されます（一時テーブルの名前は実装に依存します）。

これは通常の `IN` を使用するよりも効率的です。ただし、次の点に注意してください。

1. 一時テーブルを作成する場合、データは一意化されません。ネットワーク経由で送信されるデータ量を減らすには、副クエリで DISTINCT を指定します（通常の `IN` の場合はこれを行う必要はありません）。
2. 一時テーブルはすべてのリモートサーバーに送信されます。送信時にネットワークトポロジーは考慮されません。たとえば、10 台のリモートサーバーが、リクエスト元サーバーから非常に離れたデータセンターに存在する場合、そのリモートデータセンターへのチャネル上でデータは 10 回送信されます。`GLOBAL IN` を使用する際は、大きなデータセットは避けるようにしてください。
3. データをリモートサーバーへ送信する際、ネットワーク帯域幅に対する制限は設定できません。ネットワークを過負荷にしてしまう可能性があります。
4. 日常的に `GLOBAL IN` を使用しなくて済むように、データをサーバー間に分散配置するようにしてください。
5. `GLOBAL IN` を頻繁に使用する必要がある場合は、1 つのレプリカグループが、高速なネットワークで相互に接続された 1 つのデータセンター内に収まるように ClickHouse クラスターの配置を計画し、クエリが 1 つのデータセンター内だけで処理されるようにします。

また、ローカルテーブルがリクエスト元サーバーにのみ存在し、そのデータをリモートサーバーでも使用したい場合には、`GLOBAL IN` 句でローカルテーブルを指定するのも理にかなっています。

### Distributed Subqueries と max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

分散クエリで転送されるデータ量を制御するために、[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) と [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) を使用できます。

これは、`GLOBAL IN` クエリが大量のデータを返す場合に特に重要です。次の SQL を考えてみてください。

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

`some_predicate` の選択度が十分に高くない場合、大量のデータが返され、パフォーマンスの問題を引き起こします。このような場合、ネットワーク上のデータ転送量を制限するのが望ましいです。また、[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) は（デフォルトで）`throw` に設定されており、これらのしきい値を超えたときに例外がスローされることに注意してください。

### Distributed Subqueries と max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) が 1 より大きい場合、分散クエリにはさらに変換が行われます。

たとえば、次のようになります。

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

各サーバー上で次のように変換されます：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで `M` は、ローカルクエリが実行されているレプリカに応じて `1` から `3` の値を取ります。

これらの設定はクエリ内のすべての MergeTree ファミリーのテーブルに影響し、それぞれのテーブルに対して `SAMPLE 1/3 OFFSET (M-1)/3` を適用するのと同じ効果があります。

したがって [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 設定を追加しても、両方のテーブルが同一のレプリケーション方式を採用し、かつ UserID あるいはそのサブキーでサンプリングされている場合にのみ正しい結果が得られます。特に、`local_table_2` にサンプリングキーがない場合、正しくない結果が得られます。同じルールが `JOIN` にも適用されます。

`local_table_2` が要件を満たさない場合の一つの回避策としては、`GLOBAL IN` または `GLOBAL JOIN` を使用することが挙げられます。

テーブルにサンプリングキーがない場合は、[parallel&#95;replicas&#95;custom&#95;key](/operations/settings/settings#parallel_replicas_custom_key) に対して、より柔軟なオプションを使用できます。これにより、より柔軟かつ最適な動作を実現できます。
