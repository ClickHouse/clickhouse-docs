---
description: 'NOT IN、GLOBAL IN、GLOBAL NOT IN を除く IN 演算子に関するドキュメント（これらは別途説明します）。'
slug: /sql-reference/operators/in
title: 'IN 演算子'
doc_type: 'reference'
---



# IN 演算子

`IN`、`NOT IN`、`GLOBAL IN`、`GLOBAL NOT IN` 演算子は、その機能が非常に豊富であるため、別途説明します。

演算子の左側は、単一のカラムまたはタプルとなります。

例:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左辺がインデックス対象となっている単一のカラムで、右辺が定数の集合である場合、システムはクエリ処理にインデックスを使用します。

あまりにも多くの値を明示的に列挙しないでください（たとえば数百万件）。データセットが大きい場合は、それらを一時テーブルに格納し（例については [External data for query processing](../../engines/table-engines/special/external-data.md) セクションを参照）、その後サブクエリを使用してください。

演算子の右辺には、定数式の集合、定数式を含むタプルの集合（上記の例で示したもの）、またはデータベーステーブル名、もしくは括弧で囲まれた `SELECT` サブクエリを指定できます。

ClickHouse では、`IN` サブクエリの左側と右側の型が異なっていてもかまいません。
この場合、右辺の値は左辺の型に変換されます。
これは、右辺に対して [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 関数が適用されたかのように動作します。

これは、データ型が [Nullable](../../sql-reference/data-types/nullable.md) になり、変換を実行できない場合には [NULL](/operations/settings/formats#input_format_null_as_default) が返されることを意味します。

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

演算子の右側がテーブル名である場合（例: `UserID IN users`）、これはサブクエリ `UserID IN (SELECT * FROM users)` と同じ意味になります。これは、クエリと一緒に送信される外部データを扱うときに利用します。例えば、フィルタリング対象となるユーザー ID の集合を読み込んだ一時テーブル &#39;users&#39; を、クエリと一緒に送信できます。

演算子の右側が Set エンジン（常に RAM 上に存在する準備済みデータセット）を使用するテーブル名である場合、そのデータセットはクエリごとに再作成されることはありません。

サブクエリでは、タプルをフィルタリングするために複数の列を指定できます。

例:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左側および右側の列は同じ型でなければなりません。

`IN` 演算子とサブクエリは、集約関数やラムダ関数内も含めて、クエリの任意の箇所で使用できます。
例：

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

3月17日以降の各日ごとに、3月17日にサイトを訪問したユーザーによるページビューが全体に占める割合を算出します。
`IN` 句内のサブクエリは、常に単一のサーバー上で一度だけ実行されます。相関サブクエリはありません。


## NULL処理 {#null-processing}

リクエスト処理中、`IN`演算子は、`NULL`が演算子の右側にあるか左側にあるかに関わらず、[NULL](/operations/settings/formats#input_format_null_as_default)との演算結果は常に`0`と見なします。`NULL`値はどのデータセットにも含まれず、互いに対応せず、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)の場合は比較できません。

以下は`t_null`テーブルを使用した例です:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ`SELECT x FROM t_null WHERE y IN (NULL,3)`を実行すると、以下の結果が得られます:

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL`である行がクエリ結果から除外されていることがわかります。これは、ClickHouseが`NULL`が`(NULL,3)`セットに含まれるかどうかを判断できず、演算結果として`0`を返すため、`SELECT`が最終出力からこの行を除外するためです。

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

サブクエリを伴う`IN`演算子には（`JOIN`演算子と同様に）2つのオプションがあります：通常の`IN` / `JOIN`と`GLOBAL IN` / `GLOBAL JOIN`です。これらは分散クエリ処理における実行方法が異なります。

:::note  
以下で説明するアルゴリズムは、[設定](../../operations/settings/settings.md)の`distributed_product_mode`設定によって異なる動作をする可能性があることに留意してください。
:::

通常の`IN`を使用する場合、クエリはリモートサーバーに送信され、各サーバーが`IN`または`JOIN`句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN`を使用する場合、まず`GLOBAL IN` / `GLOBAL JOIN`のすべてのサブクエリが実行され、結果が一時テーブルに収集されます。その後、一時テーブルが各リモートサーバーに送信され、この一時データを使用してクエリが実行されます。

非分散クエリの場合は、通常の`IN` / `JOIN`を使用してください。

分散クエリ処理において`IN` / `JOIN`句でサブクエリを使用する際は注意が必要です。

いくつかの例を見てみましょう。クラスタ内の各サーバーには通常の**local_table**があると仮定します。また、各サーバーには**Distributed**型の**distributed_table**テーブルがあり、これはクラスタ内のすべてのサーバーを参照します。

**distributed_table**へのクエリの場合、クエリはすべてのリモートサーバーに送信され、**local_table**を使用して実行されます。

例えば、次のクエリは

```sql
SELECT uniq(UserID) FROM distributed_table
```

すべてのリモートサーバーに次のように送信され

```sql
SELECT uniq(UserID) FROM local_table
```

各サーバーで並列に実行され、中間結果を結合できる段階に達します。その後、中間結果はリクエスト元サーバーに返されてマージされ、最終結果がクライアントに送信されます。

次に、`IN`を使用したクエリを見てみましょう：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2つのサイトのオーディエンスの共通部分の計算。

このクエリはすべてのリモートサーバーに次のように送信されます

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

つまり、`IN`句内のデータセットは各サーバーで独立して収集され、各サーバーにローカルに保存されているデータのみが対象となります。

このケースに備えて、単一のUserIDのデータが完全に1つのサーバーに存在するようにクラスタサーバー間でデータを分散している場合、これは正しく最適に動作します。この場合、必要なすべてのデータが各サーバーでローカルに利用可能になります。そうでない場合、結果は不正確になります。このクエリのバリエーションを「ローカルIN」と呼びます。

データがクラスタサーバー間でランダムに分散されている場合にクエリの動作を修正するには、サブクエリ内で**distributed_table**を指定できます。クエリは次のようになります：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリはすべてのリモートサーバーに次のように送信されます

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは各リモートサーバーで実行を開始します。サブクエリは分散テーブルを使用しているため、各リモートサーバー上のサブクエリはすべてのリモートサーバーに次のように再送信されます：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例えば、100台のサーバーからなるクラスタがある場合、クエリ全体の実行には10,000の基本リクエストが必要となり、これは一般的に受け入れられません。

このような場合は、常に`IN`の代わりに`GLOBAL IN`を使用する必要があります。次のクエリでどのように動作するか見てみましょう：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

リクエスト元サーバーはサブクエリを実行します：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

結果はRAM内の一時テーブルに格納されます。その後、リクエストは各リモートサーバーに次のように送信されます：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル`_data1`はクエリとともにすべてのリモートサーバーに送信されます（一時テーブルの名前は実装定義です）。


これは通常の`IN`を使用するよりも最適です。ただし、以下の点に留意してください:

1.  一時テーブルを作成する際、データは一意化されません。ネットワーク経由で送信されるデータ量を削減するには、サブクエリでDISTINCTを指定してください。(通常の`IN`ではこれを行う必要はありません。)
2.  一時テーブルはすべてのリモートサーバーに送信されます。送信時にネットワークトポロジーは考慮されません。例えば、リクエスト元サーバーから非常に離れたデータセンターに10台のリモートサーバーが存在する場合、データはリモートデータセンターへのチャネルを通じて10回送信されます。`GLOBAL IN`を使用する際は、大規模なデータセットを避けるようにしてください。
3.  リモートサーバーへのデータ送信時、ネットワーク帯域幅の制限は設定できません。ネットワークを過負荷にする可能性があります。
4.  `GLOBAL IN`を定常的に使用する必要がないように、サーバー間でデータを分散するようにしてください。
5.  `GLOBAL IN`を頻繁に使用する必要がある場合は、単一のレプリカグループが高速ネットワークで接続された1つのデータセンター内に収まるようにClickHouseクラスターの配置を計画し、クエリが単一のデータセンター内で完全に処理できるようにしてください。

また、ローカルテーブルがリクエスト元サーバーでのみ利用可能で、そのデータをリモートサーバーで使用したい場合は、`GLOBAL IN`句でローカルテーブルを指定することも有効です。

### 分散サブクエリとmax_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)と[`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)を使用して、分散クエリ中に転送されるデータ量を制御できます。

これは、`GLOBAL IN`クエリが大量のデータを返す場合に特に重要です。以下のSQLを考えてみましょう:

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

`some_predicate`の選択性が十分でない場合、大量のデータが返されパフォーマンスの問題が発生します。このような場合、ネットワーク経由のデータ転送を制限することが賢明です。また、[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode)はデフォルトで`throw`に設定されており、これらの閾値に達すると例外が発生することに注意してください。

### 分散サブクエリとmax_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)が1より大きい場合、分散クエリはさらに変換されます。

例えば、以下のクエリは:

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

各サーバーで以下のように変換されます:

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで、`M`はローカルクエリが実行されているレプリカに応じて`1`から`3`の間の値になります。

これらの設定はクエリ内のすべてのMergeTreeファミリーテーブルに影響し、各テーブルに`SAMPLE 1/3 OFFSET (M-1)/3`を適用するのと同じ効果があります。

したがって、[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)設定を追加して正しい結果が得られるのは、両方のテーブルが同じレプリケーションスキームを持ち、UserIDまたはそのサブキーでサンプリングされている場合のみです。特に、`local_table_2`がサンプリングキーを持たない場合、誤った結果が生成されます。同じルールが`JOIN`にも適用されます。

`local_table_2`が要件を満たさない場合の回避策の1つは、`GLOBAL IN`または`GLOBAL JOIN`を使用することです。

テーブルがサンプリングキーを持たない場合、[parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key)のより柔軟なオプションを使用することで、異なるより最適な動作を実現できます。
