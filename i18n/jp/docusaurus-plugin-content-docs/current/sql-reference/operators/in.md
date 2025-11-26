---
description: 'NOT IN、GLOBAL IN、GLOBAL NOT IN を除く IN 演算子のドキュメント。これらの演算子については別途説明します'
slug: /sql-reference/operators/in
title: 'IN 演算子'
doc_type: 'reference'
---



# IN 演算子

`IN`、`NOT IN`、`GLOBAL IN`、`GLOBAL NOT IN` 演算子は、その機能が非常に豊富であるため、個別に説明します。

演算子の左辺は、単一のカラムまたはタプルのいずれかになります。

例:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左辺がインデックスに含まれる単一カラムで、右辺が定数の集合である場合、システムはクエリ処理にインデックスを使用します。

あまりにも多くの値を明示的に列挙しないでください（たとえば数百万件）。データセットが大きい場合は、一時テーブルに格納し（例としては、[クエリ処理用の外部データ](../../engines/table-engines/special/external-data.md) のセクションを参照してください）、その後サブクエリを使用してください。

演算子の右辺には、定数式の集合、定数式を含むタプルの集合（上の例に示されているもの）、あるいはデータベーステーブル名やかっこで囲まれた `SELECT` サブクエリを指定できます。

ClickHouse では、`IN` サブクエリの左辺と右辺で型が異なっていてもかまいません。
この場合、右辺の値は、[accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 関数が右辺に適用されたかのように、左辺の型へと変換されます。

これは、データ型が [Nullable](../../sql-reference/data-types/nullable.md) になり、変換が実行できない場合には [NULL](/operations/settings/formats#input_format_null_as_default) が返されることを意味します。

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

演算子の右側がテーブル名である場合（例: `UserID IN users`）、これはサブクエリ `UserID IN (SELECT * FROM users)` と同等です。これは、クエリと一緒に送信される外部データを扱う際に利用できます。たとえば、フィルタ対象となるユーザー ID のセットを `users` 一時テーブルに読み込んだうえで、そのテーブルとともにクエリを送信できます。

演算子の右側が Set エンジン（常に RAM 上にある準備済みのデータセット）を持つテーブル名である場合、そのデータセットはクエリごとに再作成されることはありません。

サブクエリでは、タプルをフィルタリングするために複数の列を指定できます。

例:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左右にある列は、同じ型でなければなりません。

`IN` 演算子とサブクエリは、集約関数やラムダ関数内も含めて、クエリのあらゆる部分で使用できます。
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
`IN` 句内のサブクエリは、常に単一のサーバー上で一度だけ実行されます。相関（依存）サブクエリは存在しません。


## NULL の処理

リクエストの処理中、`IN` 演算子は、[NULL](/operations/settings/formats#input_format_null_as_default) を用いた演算の結果が、`NULL` が演算子の右側か左側かに関係なく、常に `0` に等しいものとして扱います。[transform&#95;null&#95;in = 0](../../operations/settings/settings.md#transform_null_in) の場合、`NULL` 値はどのデータセットにも含まれず、互いに一致せず、比較することもできません。

次は、`t_null` テーブルを使った例です。

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ `SELECT x FROM t_null WHERE y IN (NULL,3)` を実行すると、次の結果が返されます。

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL` の行がクエリ結果から除外されていることがわかります。これは、ClickHouse が `NULL` が `(NULL,3)` の集合に含まれるかどうかを判定できないため、演算結果として `0` を返し、その結果として `SELECT` によってこの行が最終出力から除外されるためです。

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


## 分散サブクエリ

サブクエリを伴う `IN` 演算子（`JOIN` 演算子と同様）には 2 種類の形式があります。通常の `IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN` です。これらは分散クエリ処理における実行方法が異なります。

:::note\
以下で説明するアルゴリズムは、[設定](../../operations/settings/settings.md) の `distributed_product_mode` の値によって動作が異なる場合があります。
:::

通常の `IN` を使用する場合、クエリはリモートサーバーに送信され、各サーバーが `IN` もしくは `JOIN` 句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN` を使用する場合、まず `GLOBAL IN` / `GLOBAL JOIN` 用のすべてのサブクエリが実行され、その結果が一時テーブルに収集されます。その後、その一時テーブルが各リモートサーバーに送信され、各サーバー上でこれらの一時データを使ってクエリが実行されます。

分散クエリでない場合は、通常の `IN` / `JOIN` を使用します。

分散クエリ処理時に、`IN` / `JOIN` 句内でサブクエリを使用する際は注意が必要です。

いくつかの例を見ていきます。クラスター内の各サーバーには通常の **local&#95;table** があると仮定します。各サーバーには加えて、クラスター内のすべてのサーバーを参照する **Distributed** 型の **distributed&#95;table** テーブルもあります。

**distributed&#95;table** に対するクエリでは、そのクエリはすべてのリモートサーバーに送信され、各サーバー上で **local&#95;table** を使って実行されます。

例えば、次のクエリは

```sql
SELECT uniq(UserID) FROM distributed_table
```

すべてのリモートサーバーに次のように送信されます

```sql
SELECT uniq(UserID) FROM local_table
```

そして、それぞれのサーバー上で並列に実行され、中間結果を結合できる段階に到達するまで処理されます。次に、中間結果は要求元サーバーに返され、そのサーバー上でマージされ、最終結果がクライアントに送信されます。

では、`IN` を使用したクエリを見てみましょう。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

* 2 つのサイトに共通するオーディエンスの計算。

このクエリは、すべてのリモートサーバーに次のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えると、`IN` 句のデータセットは各サーバーごとに独立して扱われ、各サーバーにローカルに保存されているデータに対してのみ適用されます。

この前提を踏まえ、単一の UserID に対応するデータが必ず 1 台のサーバー上にまとまって存在するよう、クラスタ内のサーバーにデータを分散している場合、この挙動は正しくかつ最適に機能します。この場合、必要なデータはすべて各サーバー上でローカルに利用可能です。そうでない場合、結果は不正確になります。このクエリのバリエーションを「ローカル IN」と呼びます。

データがクラスタ内のサーバーにランダムに分散されている場合のクエリの挙動を修正するには、サブクエリ内で **distributed&#95;table** を指定できます。クエリは次のようになります。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、すべてのリモートサーバーに対して次のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは各リモートサーバー上で実行が開始されます。サブクエリは分散テーブルを使用しているため、各リモートサーバー上のサブクエリは、次のようにすべてのリモートサーバーへ再送信されます。

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

たとえば、100 台のサーバーからなるクラスターがある場合、クエリ全体を実行するには 10,000 個の個々のリクエストが必要になり、これは一般的には許容できないと考えられます。

このような場合は常に、`IN` の代わりに `GLOBAL IN` を使用する必要があります。次のクエリについて、その動作を見てみましょう。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

リクエストを送信したサーバーがサブクエリを実行します。

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

そして結果は RAM 上の一時テーブルに格納されます。その後、リクエストは次のように各リモートサーバーへ送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル `_data1`（この一時テーブル名は実装定義です）は、クエリとともにすべてのリモートサーバーへ送信されます。


これは通常の `IN` を使用するよりも効率的です。ただし、次の点に注意してください。

1. 一時テーブルを作成する場合、データは一意化されません。ネットワーク経由で送信されるデータ量を減らすには、副問い合わせで DISTINCT を指定してください（通常の `IN` では、その必要はありません）。
2. 一時テーブルはすべてのリモートサーバーに送信されます。送信時にはネットワークトポロジーは考慮されません。たとえば、10 台のリモートサーバーがリクエスト元サーバーから非常に離れたデータセンターにある場合、データはそのリモートデータセンターに向けて、チャネルを通じて 10 回送信されます。`GLOBAL IN` を使用する場合は、大きなデータセットの使用を避けてください。
3. データをリモートサーバーに送信する際、ネットワーク帯域に対する制限は設定できません。ネットワークを過負荷にしてしまう可能性があります。
4. `GLOBAL IN` を常用しなくても済むように、データをサーバー間で分散させるようにしてください。
5. `GLOBAL IN` を頻繁に使う必要がある場合は、ClickHouse クラスターの配置を計画し、1 つのレプリカグループが、高速ネットワークで接続された 1 つのデータセンター内に収まるようにします。これにより、クエリが 1 つのデータセンター内だけで完結して処理されるようにします。

ローカルテーブルがリクエスト元サーバーにしか存在せず、そのデータをリモートサーバーで使用したい場合は、`GLOBAL IN` 句でそのローカルテーブルを指定するのも有用です。

### 分散サブクエリと max&#95;rows&#95;in&#95;set

分散クエリ中に転送されるデータ量を制御するために、[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) および [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) を使用できます。

これは、`GLOBAL IN` クエリが大量のデータを返す場合に特に重要です。次の SQL を考えてみてください。

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <任意の条件>)
```

`some_predicate` の選択性が不十分な場合、大量のデータが返され、パフォーマンス問題の原因となります。このような場合には、ネットワーク上のデータ転送量を制限することが賢明です。また、[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) はデフォルトで `throw` に設定されており、これらのしきい値に達したときに例外が送出されることに注意してください。

### 分散サブクエリと max&#95;parallel&#95;replicas

[max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) が 1 より大きい場合、分散クエリはさらに書き換えられます。

たとえば、次のようになります。

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

各サーバーごとに次のように変換されます：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで `M` は、ローカルクエリがどのレプリカ上で実行されているかに応じて、`1` から `3` の間の値になります。

これらの設定は、クエリ内のすべての MergeTree ファミリーに属するテーブルに影響し、各テーブルに対して `SAMPLE 1/3 OFFSET (M-1)/3` を適用した場合と同じ効果があります。

したがって [max&#95;parallel&#95;replicas](#distributed-subqueries-and-max_parallel_replicas) 設定を追加しても、両方のテーブルが同じレプリケーションスキームを持ち、かつ UserID またはそのサブキーによってサンプリングされている場合にのみ正しい結果が得られます。特に、`local_table_2` にサンプリングキーがない場合は、誤った結果が生成されます。同じルールが `JOIN` にも適用されます。

`local_table_2` が要件を満たしていない場合の 1 つの回避策として、`GLOBAL IN` または `GLOBAL JOIN` を使用する方法があります。

テーブルにサンプリングキーがない場合でも、より柔軟な [parallel&#95;replicas&#95;custom&#95;key](/operations/settings/settings#parallel_replicas_custom_key) のオプションを使用できます。これにより、より柔軟かつ最適な動作を実現できる場合があります。
