---
slug: /sql-reference/operators/in
---

# IN 演算子

`IN`、`NOT IN`、`GLOBAL IN`、および `GLOBAL NOT IN` 演算子は、その機能が非常に豊富であるため、別々に説明します。

演算子の左側は、単一のカラムかタプルです。

例:

``` sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左側がインデックスにある単一カラムであり、右側が定数のセットである場合、システムはクエリを処理するためにインデックスを使用します。

明示的にあまり多くの値を列挙しないでください（つまり、数百万）。データセットが大きい場合は、仮のテーブルに格納する（例えば、[クエリ処理のための外部データ](../../engines/table-engines/special/external-data.md)のセクションを参照）し、その後サブクエリを使用してください。

演算子の右側は、定数式のセット、定数式を含むタプルのセット（上記の例に示す）、または括弧内のデータベーステーブル名や`SELECT`サブクエリであることができます。

ClickHouseは、`IN`サブクエリの左側と右側で異なる型を持つことを許可します。この場合、左側の値は右側の型に変換されます。これは、[accurateCastOrNull](../functions/type-conversion-functions.md#type_conversion_function-accurate-cast_or_null) 関数が適用されたかのようになります。つまり、データ型は[Nullable](../../sql-reference/data-types/nullable.md)になり、変換が行えない場合は[NULL](/operations/settings/formats#input_format_null_as_default)が返されます。

**例**

クエリ：

``` sql
SELECT '1' IN (SELECT 1);
```

結果：

``` text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

演算子の右側がテーブル名（例えば、`UserID IN users`）である場合、これはサブクエリ`UserID IN (SELECT * FROM users)`と同等です。これは、クエリと一緒に送信される外部データを扱うときに使用します。たとえば、クエリは、フィルタリングされるべき`users`仮のテーブルに読み込まれたユーザーIDのセットと一緒に送信できます。

演算子の右側がセットエンジンを持つテーブル名である場合（常にRAM内にある準備されたデータセット）、データセットは各クエリのために再作成されることはありません。

サブクエリは、タプルをフィルタリングするために複数のカラムを指定することができます。

例:

``` sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN`演算子の左右のカラムは同じ型である必要があります。

`IN`演算子とサブクエリは、集計関数やラムダ関数を含むクエリの任意の部分に出現する可能性があります。
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

3月17日以降の各日について、3月17日にサイトに訪れたユーザーによるページビューの割合をカウントします。`IN`句内のサブクエリは、常に一度のみ単一のサーバーで実行されます。依存するサブクエリはありません。

## NULL 処理 {#null-processing}

リクエスト処理中、`IN`演算子は、演算が[NULL](/operations/settings/formats#input_format_null_as_default)を含む場合、その結果が常に`0`になると仮定します。演算子の右側または左側に`NULL`があっても、`NULL`値はデータセットに含まれず、互いには対応せず、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)の場合は比較できません。

`t_null`テーブルを使用した例を示します：

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ`SELECT x FROM t_null WHERE y IN (NULL, 3)`を実行すると、次の結果が得られます：

``` text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL`の行がクエリ結果から除外されていることがわかります。これは、ClickHouseが`NULL`が`(NULL, 3)`セットに含まれているかどうかを決定できず、演算の結果として`0`を返し、`SELECT`がこの行を最終出力から除外するためです。

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

サブクエリを伴う`IN`演算子には2つのオプションがあり（`JOIN`演算子に似ています）：通常の`IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN`です。これらは、分散クエリ処理の実行方法が異なります。

:::note    
以下に説明するアルゴリズムは、[設定](../../operations/settings/settings.md)の`distributed_product_mode`設定によって異なる動作をする可能性があることに注意してください。
:::

通常の`IN`を使用すると、クエリがリモートサーバーに送信され、それぞれが`IN`または`JOIN`句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN`を使用すると、最初にすべてのサブクエリが`GLOBAL IN` / `GLOBAL JOIN`のために実行され、結果が仮のテーブルに集められます。その後、仮のテーブルが各リモートサーバーに送信され、これらのサーバーでこの仮のデータを使用してクエリが実行されます。

非分散クエリの場合は、通常の`IN` / `JOIN`を使用してください。

分散クエリ処理のために`IN` / `JOIN`句内でサブクエリを使用する際は注意が必要です。

いくつかの例を見てみましょう。クラスター内の各サーバーには通常の**local_table**があります。各サーバーには、クラスター内のすべてのサーバーを参照する**Distributed**型の**distributed_table**テーブルもあります。

**distributed_table**へのクエリでは、クエリがすべてのリモートサーバーに送信され、**local_table**を使用してそれらで実行されます。

たとえば、次のクエリ

``` sql
SELECT uniq(UserID) FROM distributed_table
```

は、次のようにすべてのリモートサーバーに送信されます。

``` sql
SELECT uniq(UserID) FROM local_table
```

そして、各サーバーで並列に実行され、途中の結果を結合できるステージに達するまで行われます。その後、途中の結果がリクエスターサーバーに返され、そこでマージされ、最終結果がクライアントに送信されます。

次に、`IN`を含むクエリを見てみましょう：

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2つのサイトの観客の交差点の計算。

このクエリは、すべてのリモートサーバーに次のように送信されます。

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えれば、`IN`句内のデータセットは、各サーバーにローカルに保存されているデータ間でのみ独立に収集されます。

この場合、必要なすべてのデータが各サーバーでローカルに利用可能である限り、正確かつ最適に機能します。このケースに準備をしていない場合、結果は不正確になる可能性があります。このクエリのバリエーションは「ローカル IN」と呼ばれます。

クラスターサーバー間でデータがランダムに分散されている場合にクエリが正しく機能するようにするには、サブクエリ内で**distributed_table**を指定することができます。クエリはこのようになります：

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、すべてのリモートサーバーに次のように送信されます。

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは各リモートサーバーで実行され始めます。サブクエリが分散テーブルを使用しているため、各リモートサーバー上のサブクエリは、すべてのリモートサーバーに次のように再送信されます：

``` sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

たとえば、100台のサーバーからなるクラスターがある場合、クエリ全体を実行するには10,000の基本的なリクエストが必要であり、これは一般的に受け入れられないと見なされます。

このような場合、常に`GLOBAL IN`を使用するべきです。クエリがどのように機能するかを見てみましょう：

``` sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

リクエスターサーバーは、次のサブクエリを実行します：

``` sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

結果はRAM内の仮のテーブルに格納されます。その後、リクエストは各リモートサーバーに次のように送信されます：

``` sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

仮のテーブル`_data1`は、クエリとともにすべてのリモートサーバーに送信されます（仮のテーブルの名前は実装によって定義されます）。

これは、通常の`IN`を使用するよりも最適です。ただし、次の点に留意してください：

1.  仮のテーブルを作成する際のデータは一意にはなりません。ネットワーク経由のデータ転送量を減らすために、サブクエリにDISTINCTを指定してください。（通常の`IN`についてはこれを行う必要はありません。）
2.  仮のテーブルはすべてのリモートサーバーに送信されます。転送はネットワークトポロジーを考慮しません。たとえば、10のリモートサーバーがリクエスターサーバーに対して非常に遠くのデータセンターに存在する場合、データはリモートデータセンターへのチャネルを通じて10回送信されます。`GLOBAL IN`を使用する場合は、大きなデータセットを避けるようにしてください。
3.  リモートサーバーにデータを送信する際、ネットワーク帯域幅についての制限は設定できません。ネットワークが過負荷になる可能性があります。
4.  データをサーバー間で分散させるようにし、定期的に`GLOBAL IN`を使用せずに済むようにしてください。
5.  `GLOBAL IN`を頻繁に使用する必要がある場合は、ClickHouseクラスターの位置を計画し、すべてのレプリカが迅速なネットワークを介して互いに接続されている1つのデータセンター内に留まるようにすることで、クエリを完全に1つのデータセンター内で処理できるようにします。

リクエスターサーバーでのみ利用可能なローカルテーブルを`GLOBAL IN`句に指定すると、リモートサーバー上でそのデータを使用したい場合にも意味があります。

### 分散サブクエリと max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

分散クエリ中のデータ転送量を制御するために、[`max_rows_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set)および[`max_bytes_in_set`](../../operations/settings/query-complexity.md#max-rows-in-set)を使用できます。

これは、`GLOBAL IN`クエリが大量のデータを返す場合に特に重要です。次のSQLを考えてみましょう：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

もし`some_predicate`が選択性が不十分であれば、大量のデータを返し、パフォーマンスの問題を引き起こすでしょう。このような場合、ネットワーク上のデータ転送を制限することが賢明です。また、[`set_overflow_mode`](../../operations/settings/query-complexity.md#set_overflow_mode)が`throw`（デフォルト）に設定されているため、これらの閾値が満たされると例外が発生します。

### 分散サブクエリと max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)が1より大きい場合、分散クエリはさらに変形されます。

たとえば、次のようになります：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

これは各サーバーで次のように変換されます：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで、`M`は、ローカルクエリが実行されるレプリカに応じて`1`から`3`の間で決まります。

これらの設定は、クエリ内のすべてのMergeTreeファミリテーブルに影響を及ぼし、各テーブルに対して`SAMPLE 1/3 OFFSET (M-1)/3`を適用するのと同じ効果があります。

したがって、[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)設定を追加することは、両方のテーブルに同じレプリケーションスキームがあり、UserIDまたはそのサブキーでサンプリングされている場合にのみ正しい結果を生成します。特に、`local_table_2`にサンプリングキーがない場合は、不正確な結果が生成されます。このルールは`JOIN`にも当てはまります。

`local_table_2`が要件を満たしていない場合の回避策は、`GLOBAL IN`または`GLOBAL JOIN`を使用することです。

テーブルにサンプリングキーがない場合は、より柔軟なオプションである[parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key)を使用して、異なるより最適な動作を生成できます。
