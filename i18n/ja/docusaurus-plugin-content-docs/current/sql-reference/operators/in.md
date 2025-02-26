---
slug: /sql-reference/operators/in
---
# IN演算子

`IN`、`NOT IN`、`GLOBAL IN`、および `GLOBAL NOT IN` 演算子は、それぞれの機能が非常に豊富であるため、別々に説明します。

演算子の左側は、単一のカラムまたはタプルである必要があります。

例:

``` sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左側がインデックスに存在する単一のカラムであり、右側が定数のセットである場合、システムはクエリ処理にインデックスを使用します。

あまり多くの値を明示的に列挙しないでください（つまり、数百万の値）。データセットが大きい場合は、一時テーブルに保存してください（例えば、[クエリ処理のための外部データ](../../engines/table-engines/special/external-data.md)のセクションを参照）、その後、サブクエリを使用します。

演算子の右側は、定数式のセット、定数式を含むタプルのセット（上記に示した例のように）、または括弧内のデータベーステーブルの名前または `SELECT` サブクエリであることができます。

ClickHouseは、`IN` サブクエリの左側と右側で型が異なることを許可します。この場合、左側の値は右側の型に変換され、この操作は [accurateCastOrNull](../functions/type-conversion-functions.md#type_conversion_function-accurate-cast_or_null) 関数が適用されたかのようになります。つまり、データ型は [Nullable](../../sql-reference/data-types/nullable.md) になり、変換できない場合は [NULL](../../sql-reference/syntax.md#null-literal) を返します。

**例**

クエリ:

``` sql
SELECT '1' IN (SELECT 1);
```

結果:

``` text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

演算子の右側がテーブル名である場合（例えば、`UserID IN users`）、これはサブクエリ `UserID IN (SELECT * FROM users)` と同等です。これは、クエリと共に送信される外部データを扱う際に使用します。例えば、クエリはユーザーIDのセットを含む一時テーブル 'users' にフィルターを適用して送信されることがあります。

演算子の右側が Set エンジンを持つテーブル名である場合（常に RAM に存在する準備されたデータセット）、データセットは各クエリで再作成されません。

サブクエリはタプルをフィルタリングするために複数のカラムを指定することができます。

例:

``` sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左側と右側のカラムは同じ型であるべきです。

`IN` 演算子とサブクエリは、集約関数やラムダ関数を含むクエリの任意の部分で発生する可能性があります。
例:

``` sql
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

``` text
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

3月17日以降の各日ごとに、3月17日にサイトを訪れたユーザーによるページビューの割合をカウントします。
`IN` 句内のサブクエリは常に単一のサーバー上で一度だけ実行されます。依存サブクエリは存在しません。

## NULL処理 {#null-processing}

リクエスト処理中、`IN` 演算子は、[NULL](../../sql-reference/syntax.md#null-literal) を伴う操作の結果は常に `0` に等しいと仮定します。これは、`NULL` が演算子の右側または左側にあるかにかかわらずです。`NULL` 値はどのデータセットにも含まれず、互いに対応せず、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in) の場合は比較することができません。

以下は `t_null` テーブルに関する例です:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴺᴸ ┆
│ 2 │    3 │
└───┴──────┘
```

クエリ `SELECT x FROM t_null WHERE y IN (NULL,3)` を実行すると、次の結果が得られます:

``` text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL` の行がクエリ結果から除外されていることがわかります。これは、ClickHouse が `NULL` が `(NULL,3)` セットに含まれているかを判断できず、操作の結果は `0` を返し、`SELECT` がこの行を最終出力から除外するためです。

``` sql
SELECT y IN (NULL, 3)
FROM t_null
```

``` text
┌─in(y, tuple(NULL, 3))─┐
│                     0 │
│                     1 │
└───────────────────────┘
```

## 分散サブクエリ {#distributed-subqueries}

サブクエリを含む `IN` 演算子には、通常の `IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN` の2つのオプションがあります。これらは、分散クエリ処理のために実行される方法が異なります。

:::note    
以下に説明するアルゴリズムは、[設定](../../operations/settings/settings.md)の `distributed_product_mode` 設定によって異なる動作をする場合がありますので、注意してください。
:::

通常の `IN` を使用する場合、クエリはリモートサーバーに送信され、各サーバーが `IN` または `JOIN` 句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN` を使用する場合、まずすべてのサブクエリが `GLOBAL IN` / `GLOBAL JOIN` 用に実行され、結果は一時テーブルに収集されます。次に、一時テーブルが各リモートサーバーに送信され、それに基づいてクエリが実行されます。

非分散クエリの場合は、通常の `IN` / `JOIN` を使用してください。

分散クエリ処理のための `IN` / `JOIN` 句にサブクエリを使用する際は注意が必要です。

いくつかの例を見てみましょう。クラスター内の各サーバーは通常の **local_table** を持っています。また、各サーバーはクラスタ内のすべてのサーバーを探査する **Distributed** 型の **distributed_table** テーブルも持っています。

**distributed_table** へのクエリでは、クエリはすべてのリモートサーバーに送信され、そこに格納された **local_table** を使用して実行されます。

例えば、以下のクエリ

``` sql
SELECT uniq(UserID) FROM distributed_table
```

は、すべてのリモートサーバーに以下のように送信され

``` sql
SELECT uniq(UserID) FROM local_table
```

パラレルに実行され、条件付きで中間結果を組み合わせる段階に達するまで進みます。その後、中間結果は問い合わせ先のサーバーに返されてマージされ、最終結果がクライアントに送信されます。

次に、`IN` を使ったクエリを見てみましょう:

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2つのサイトのオーディエンスの交差点を計算します。

このクエリは、すべてのリモートサーバーに以下のように送信されます:

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えれば、`IN` 句内のデータセットは各サーバーのローカルデータに基づいて、独立して収集されます。

これが正しく最適に機能するのは、あなたがそのケースに備えてデータをクラスターサーバーに広げており、単一の UserID のデータが完全に単一のサーバー上に存在する場合です。この場合、必要なすべてのデータが各サーバーにローカルにあります。そうでない場合、結果は不正確になります。このクエリの変種は「ローカル IN」と呼ばれます。

データがクラスターサーバーにランダムに分散されているのにクエリが期待通りに動作しない場合、サブクエリ内に **distributed_table** を指定することができます。クエリは次のようになります。

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、すべてのリモートサーバーに以下のように送信されます:

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは各リモートサーバーで実行を開始します。サブクエリが分散テーブルを使用しているため、各リモートサーバー上のサブクエリは別のリモートサーバーに再送信されます:

``` sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例えば、100台のサーバーのクラスターがある場合、クエリ全体を実行すると、10,000の基本的なリクエストが必要になります。これは一般的に受け入れられないとみなされます。

このような場合は、常に `GLOBAL IN` を使用する必要があります。クエリについて見てみましょう:

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

問い合わせサーバーはサブクエリを実行します:

``` sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

そして、結果はRAMの一時テーブルに格納されます。次に、そのリクエストはリモートサーバーに対して以下のように送信されます:

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル `_data1` は、クエリとともにすべてのリモートサーバーに送信されます（この一時テーブルの名前は実装に依存します）。

これは通常の `IN` を使用するよりも最適です。ただし、以下の点に留意してください。

1. 一時テーブルを作成する際に、データは一意ではないことです。ネットワーク経由で転送されるデータ量を減らすために、サブクエリで DISTINCT を指定してください（通常の `IN` の場合はこれを行う必要はありません）。
2. 一時テーブルはすべてのリモートサーバーに送信されます。送信はネットワークトポロジーを考慮しません。例えば、リクエスト元サーバーに対して非常に遠いデータセンターに10台のリモートサーバーが存在する場合、データは10回リモートデータセンターへのチャネルを通して送信されます。使用している `GLOBAL IN` に対して大きなデータセットを避けることをお勧めします。
3. リモートサーバーへのデータ転送時に、ネットワーク帯域幅の制限は設定できません。ネットワークを過負荷にする可能性があります。
4. サーバー間にデータを配分して、定期的に `GLOBAL IN` を使用しないようにすることをお勧めします。
5. `GLOBAL IN` を頻繁に使用する必要がある場合は、ClickHouse クラスターの位置を計画して、単一のレプリカグループが一つのデータセンターに存在し、相互に高速なネットワークを持つようにし、クエリが単一のデータセンター内で完全に処理されるようにしてください。

ローカルテーブルがリクエスト元サーバーにのみ存在し、リモートサーバーでそのデータを使用したい場合、`GLOBAL IN` 句でローカルテーブルを指定することも合理的です。

### 分散サブクエリと max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

[`max_rows_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set) および [`max_bytes_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set) を使用して、分散クエリの際に転送されるデータの量を制御できます。

これは特に `GLOBAL IN` クエリが大量のデータを返す場合に重要です。次の SQL を考えてみましょう：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

もし `some_predicate` が選択的でなければ、大量のデータが返され、パフォーマンスの問題を引き起こします。このような場合、ネットワーク経由のデータ転送を制限することが賢明です。また、[`set_overflow_mode`](../../operations/settings/query-complexity.md#set_overflow_mode) がデフォルトで `throw` に設定されており、これらのしきい値が満たされた場合に例外が発生します。

### 分散サブクエリと max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) が 1 より大きい場合、分散クエリはさらに変換されます。

例えば、以下のようなクエリ:

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

は、各サーバーで次のように変換されます:

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで、`M` は `1` と `3` の間で、ローカルクエリが実行されるレプリカによって異なります。

これらの設定は、クエリ内のすべての MergeTree 系統のテーブルに影響し、各テーブルに対して `SAMPLE 1/3 OFFSET (M-1)/3` を適用するのと同じ効果を持ちます。

したがって [max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) の設定を追加すると、両方のテーブルが同じレプリケーションスキームを持ち、UserID やそのサブキーでサンプリングされている場合にのみ正しい結果が得られます。特に、`local_table_2` にサンプリングキーがない場合、不正確な結果が生成されます。このルールは `JOIN` にも適用されます。

もし `local_table_2` が要件を満たさない場合の回避策として、`GLOBAL IN` または `GLOBAL JOIN` を使用することができます。

テーブルにサンプリングキーがない場合、[`parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key)` を使用することで、異なるより柔軟な動作を得ることができます。
