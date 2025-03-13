---
slug: '/sql-reference/operators/in'
---


# IN 演算子

`IN`、`NOT IN`、`GLOBAL IN`、および `GLOBAL NOT IN` 演算子は、それぞれ独立して説明されます。なぜなら、これらの機能は非常に豊富だからです。

演算子の左側は、単一のカラムまたはタプルです。

例:

``` sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左側がインデックスにある単一のカラムで、右側が定数の集合の場合、システムはクエリの処理にインデックスを使用します。

明示的に多くの値をリストしないでください（すなわち、何百万も）。データセットが大きい場合は、一時テーブルに配置してください（例えば、[External data for query processing](../../engines/table-engines/special/external-data.md)を参照）。その後、サブクエリを使用します。

演算子の右側は、定数式の集合、定数式を含むタプルの集合（上の例で示したもの）、あるいはデータベーステーブルの名前や括弧内の `SELECT` サブクエリであることができます。

ClickHouse では、`IN` サブクエリの左側と右側の部分で型が異なっていても許可されます。この場合、左側の値が右側の型に変換されます。これは、[accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 関数が適用されたかのように機能します。これは、データ型が [Nullable](../../sql-reference/data-types/nullable.md) になり、変換が実行できない場合は [NULL](/operations/settings/formats#input_format_null_as_default) を返すことを意味します。

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

演算子の右側がテーブルの名前である場合（例えば、`UserID IN users`）、これはサブクエリ `UserID IN (SELECT * FROM users)` と同等です。これは、クエリと一緒に送信される外部データを扱う際に使用します。例えば、クエリはフィルタリングされるべき 'users' 一時テーブルに読み込まれた一連のユーザーIDと共に送信されることができます。

演算子の右側が Set エンジンを持つテーブルの名前である場合（常にRAMにある準備されたデータセット）、データセットは各クエリごとに再度作成されることはありません。

サブクエリは、タプルをフィルタリングするために 1 つ以上のカラムを指定することができます。

例:

``` sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左側と右側のカラムは同じ型でなければなりません。

`IN` 演算子とサブクエリは、集約関数やラムダ関数を含むクエリの任意の部分に出現することができます。
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

3月17日以降の各日について、3月17日にサイトを訪れたユーザーによるページビューの割合をカウントします。
`IN` 句内のサブクエリは、常に単一のサーバーで一度だけ実行されます。依存サブクエリはありません。

## NULL 処理 {#null-processing}

リクエスト処理中に、`IN` 演算子は、[NULL](/operations/settings/formats#input_format_null_as_default) との操作の結果は、演算子の右側または左側に `NULL` があるかどうかに関係なく、常に `0` に等しいと仮定します。`NULL` 値はどのデータセットにも含まれず、お互いに対応せず、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in) の場合は比較もできません。

`t_null` テーブルの例です:

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ `SELECT x FROM t_null WHERE y IN (NULL,3)` を実行すると、次の結果が得られます:

``` text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL` の行がクエリ結果から除外されていることがわかります。これは、ClickHouseが `NULL` が `(NULL,3)` 集合に含まれるかどうかを判断できないため、操作の結果として `0` を返し、`SELECT` がこの行を最終的な出力から除外するためです。

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

`IN` 演算子に伴うサブクエリには、通常の `IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN` の 2 つのオプションがあります。これらは、分散クエリ処理のためにどのように実行されるかで異なります。

:::note    
以下に説明するアルゴリズムは、[settings](../../operations/settings/settings.md) `distributed_product_mode` 設定に応じて異なる動作をする可能性があることを覚えておいてください。
:::

通常の `IN` を使用すると、クエリはリモートサーバーに送信され、それぞれのサーバーが `IN` または `JOIN` 句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN` を使用する場合、まず `GLOBAL IN` / `GLOBAL JOIN` のすべてのサブクエリが実行され、結果が一時テーブルに収集されます。次に、一時テーブルが各リモートサーバーに送信され、そこでこの一時データを使用してクエリが実行されます。

非分散クエリの場合は、通常の `IN` / `JOIN` を使用します。

分散クエリ処理のための `IN` / `JOIN` 句内でサブクエリを使用する際は注意が必要です。

いくつかの例を見てみましょう。クラスタ内の各サーバーには通常の **local_table** があると仮定します。各サーバーには、クラスタ内のすべてのサーバーを参照する **Distributed** 型の **distributed_table** テーブルもあります。

**distributed_table** へのクエリの場合、クエリはすべてのリモートサーバーに送信され、それらのサーバーで **local_table** を使用して実行されます。

例えば、クエリ

``` sql
SELECT uniq(UserID) FROM distributed_table
```

は、すべてのリモートサーバーに次のように送信されます。

``` sql
SELECT uniq(UserID) FROM local_table
```

それぞれのサーバーで並行して実行され、途中の結果を組み合わせる段階になるまで進みます。その後、途中の結果はリクエスタサーバーに返され、マージされ、最終結果がクライアントに送信されます。

次に、`IN` を使用したクエリを調べましょう:

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2 つのサイトのオーディエンスの交差点の計算です。

このクエリは、すべてのリモートサーバーに次のように送信されます。

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えれば、`IN` 句のデータセットは、各サーバーで独立して収集され、各サーバーにローカルに保存されているデータだけに基づいています。

これは、データがクラスターサーバー間でランダムに分散されている場合の挙動を正すために、**distributed_table** をサブクエリ内に指定することによって修正できます。クエリは次のようになります。

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、すべてのリモートサーバーに次のように送信されます。

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリが各リモートサーバーで実行され始めます。サブクエリが分散テーブルを使用しているため、各リモートサーバーのサブクエリは、すべてのリモートサーバーに次のように再送信されます。

``` sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

たとえば、クラスタに 100 のサーバーがある場合、全体のクエリを実行するには 10,000 の基本リクエストが必要になります。これは通常、受け入れがたいと見なされます。

このような場合は、常に `GLOBAL IN` を使用するべきです。クエリに対してどのように機能するかを見てみましょう。

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

リクエスタサーバーは次のサブクエリを実行します。

``` sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

その結果は、RAM の一時テーブルに格納されます。その後、リクエストは各リモートサーバーに次のように送信されます。

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル `_data1` は、クエリと共にすべてのリモートサーバーに送信されます（この一時テーブルの名前は実装に依存します）。

これは、通常の `IN` よりも最適です。ただし、以下の点に注意してください。

1. 一時テーブルを作成する際、データは一意にはなりません。ネットワークを通じて転送されるデータ量を減らすために、サブクエリで DISTINCT を指定してください。（通常の `IN` の場合は、この操作を行う必要はありません）
2. 一時テーブルはすべてのリモートサーバーに送られます。転送ではネットワークトポロジーは考慮されません。たとえば、10 のリモートサーバーがリクエスタサーバーに対して非常に遠いデータセンターにある場合、データはリモートデータセンターへのチャネルを通じて 10 回送信されます。`GLOBAL IN` を使用する際は、大きなデータセットを避けるようにしてください。
3. リモートサーバーへのデータ転送時に、ネットワーク帯域幅に対する制限は設定できません。ネットワークを過負荷にする可能性があります。
4. データをサーバー間で分散させることを試み、`GLOBAL IN` を定期的に使用しないようにしてください。
5. `GLOBAL IN` を頻繁に使用する必要がある場合は、ClickHouse クラスタのロケーションを計画し、単一のデータセンターに複数のレプリカのグループが存在するようにし、その間に高速ネットワークがあるようにしてください。これにより、クエリは単一のデータセンター内で完全に処理できるようになります。

リクエスタサーバーでのみ利用可能なローカルテーブルがある場合は、`GLOBAL IN` 句にローカルテーブルを指定するのも意味があります。そして、リモートサーバーでそのデータを使用したいときです。

### 分散サブクエリと max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

[`max_rows_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set) と [`max_bytes_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set) を使用して、分散クエリ中に転送されるデータ量を制御することができます。

特に、`GLOBAL IN` クエリが大量のデータを返す場合に重要です。次の SQL を考えてみてください。

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

もし `some_predicate` が十分に選択的でない場合、大量のデータが返され、性能上の問題が発生する可能性があります。このような場合は、ネットワーク越しのデータ転送を制限するのが賢明です。また、デフォルトで [`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) が `throw` に設定されており、これらの閾値が満たされると例外が発生することにも留意してください。

### 分散サブクエリと max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) が 1 より大きい場合、分散クエリはさらに変換されます。

例えば、次のクエリは:

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

各サーバーで以下のように変換されます。

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで `M` は、ローカルクエリが実行されているレプリカによって 1 から 3 の間で変動します。

これらの設定は、クエリ内のすべての MergeTree 系テーブルに影響し、各テーブルに `SAMPLE 1/3 OFFSET (M-1)/3` を適用するのと同じ効果があります。

したがって、[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 設定を追加すると、両方のテーブルが同じレプリケーションスキームを持ち、UserID またはそのサブキーでサンプリングされる場合にのみ、正しい結果が得られます。特に、`local_table_2` にサンプリングキーがない場合、結果が不正確になる可能性があります。このルールは `JOIN` にも適用されます。

`local_table_2` が要件を満たさない場合の回避策としては、`GLOBAL IN` や `GLOBAL JOIN` を使用することが考えられます。

サンプリングキーを持たないテーブルの場合は、[parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) のより柔軟なオプションを使用することで、異なる最適な動作を得ることができます。
