---
'description': 'IN 演算子に関するドキュメントで、NOT IN、GLOBAL IN、および GLOBAL NOT IN 演算子は別途取り扱います。'
'slug': '/sql-reference/operators/in'
'title': 'IN 演算子'
'doc_type': 'reference'
---


# IN 演算子

`IN`、`NOT IN`、`GLOBAL IN`、および `GLOBAL NOT IN` 演算子は、その機能が非常に豊富であるため、それぞれ独立して説明されています。

演算子の左側は、単一のカラムまたはタプルです。

例：

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左側がインデックスにある単一のカラムで、右側が定数のセットである場合、システムはクエリを処理するためにインデックスを使用します。

明示的にあまり多くの値をリストしないでください（すなわち、百万以上）。データセットが大きい場合は、一時テーブルに入れてください（たとえば、[クエリ処理のための外部データ](../../engines/table-engines/special/external-data.md)のセクションを参照）、次にサブクエリを使用します。

演算子の右側には、定数式のセット、定数式を含むタプルのセット（上記の例に示す）、またはデータベーステーブルの名前や括弧内の`SELECT`サブクエリを指定できます。

ClickHouseでは、`IN`サブクエリの左側と右側の型が異なることを許可しています。この場合、右側の値は左側の型に変換され、まるで[accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t)関数が右側に適用されたかのようになります。

これは、データ型が[Nullable](../../sql-reference/data-types/nullable.md)になり、変換が行えない場合は[NULL](/operations/settings/formats#input_format_null_as_default)が返されることを意味します。

**例**

クエリ：

```sql
SELECT '1' IN (SELECT 1);
```

結果：

```text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

演算子の右側がテーブルの名前（たとえば、`UserID IN users`）である場合、これはサブクエリ`UserID IN (SELECT * FROM users)`に相当します。これは、クエリと共に送信される外部データを扱う際に使用します。たとえば、クエリは、フィルタリングされるべき「users」一時テーブルに読み込まれたユーザーIDのセットと共に送信できます。

演算子の右側が、Setエンジンを持つテーブル名である場合（常にRAMにある準備されたデータセット）、データセットは各クエリのために再作成されることはありません。

サブクエリでは、タプルのフィルタリングのために複数のカラムを指定できます。

例：

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN`演算子の左側と右側のカラムは同じ型である必要があります。

`IN`演算子とサブクエリは、集約関数やラムダ関数を含めて、クエリの任意の部分に現れることがあります。
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

3月17日以降の各日について、3月17日にサイトを訪れたユーザーによって行われたページビューの割合をカウントします。
`IN`句のサブクエリは、常に単一のサーバーで1回だけ実行されます。依存するサブクエリは存在しません。

## NULL 処理 {#null-processing}

要求処理中、`IN`演算子は、[NULL](/operations/settings/formats#input_format_null_as_default)との演算の結果が、演算子の右側または左側に`NULL`があっても、常に`0`と等しいと仮定します。`NULL`値はどのデータセットにも含まれず、相互に対応せず、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)の場合に比較することはできません。

`t_null`テーブルの例を示します：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ`SELECT x FROM t_null WHERE y IN (NULL,3)`を実行すると、次の結果が得られます：

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL`の行がクエリ結果から除外されていることがわかります。これは、ClickHouseが`NULL`が`(NULL,3)`セットに含まれるかどうかを判断できず、操作の結果として`0`を返し、`SELECT`がこの行を最終出力から除外するためです。

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

サブクエリを持つ`IN`演算子には、`JOIN`演算子と似た2つのオプションがあります：通常の`IN` / `JOIN`と`GLOBAL IN` / `GLOBAL JOIN`です。これらは、分散クエリ処理の実行方法が異なります。

:::note    
以下に示すアルゴリズムは、[設定](../../operations/settings/settings.md)の`distributed_product_mode`設定によって異なって動作することがあることを忘れないでください。
:::

通常の`IN`を使用する場合、クエリはリモートサーバーに送信され、それぞれが`IN`または`JOIN`句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN`を使用する場合、まずすべてのサブクエリは`GLOBAL IN` / `GLOBAL JOIN`のために実行され、結果が一時テーブルに集約されます。その後、一時テーブルは各リモートサーバーに送信され、それを使用してクエリが実行されます。

非分散クエリの場合は、通常の`IN` / `JOIN`を使用してください。

分散クエリ処理のために`IN` / `JOIN`句内でサブクエリを使用する際には注意が必要です。

いくつかの例を見てみましょう。クラスター内の各サーバーには通常の**local_table**があると仮定します。各サーバーには、クラスター内のすべてのサーバーを参照する**Distributed**タイプの**distributed_table**テーブルもあります。

**distributed_table**へのクエリは、すべてのリモートサーバーに送信され、**local_table**を使用して実行されます。

たとえば、次のクエリ：

```sql
SELECT uniq(UserID) FROM distributed_table
```

は、すべてのリモートサーバーに次のように送信されます：

```sql
SELECT uniq(UserID) FROM local_table
```

並行して各サーバーで実行され、途中の結果を組み合わせることができる段階に達するまで進行します。次に、中間的な結果は要求サーバーに戻され、マージされ、最終結果がクライアントに送信されます。

次に、`IN`を使用したクエリを検討します：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2つのサイトのオーディエンスの交差点の計算。

このクエリは、すべてのリモートサーバーに次のように送信されます：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えれば、`IN`句内のデータセットは、各サーバーが独立して収集し、各サーバーに保存されているローカルデータのみに対して行われます。

これは、データがクラスターサーバー間でスプレッドされており、単一のUserIDのデータが完全に単一のサーバーに存在する場合に正しくかつ最適に機能します。この場合、すべての必要なデータが各サーバーでローカルに利用可能です。そうでなければ、結果は不正確になります。このバリエーションのクエリを「ローカルIN」と呼びます。

データがクラスターサーバー間でランダムに分散されている場合、クエリが正しく機能するように、サブクエリ内で**distributed_table**を指定することができます。クエリは次のようになります：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、すべてのリモートサーバーに次のように送信されます：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは各リモートサーバーで実行され始めます。サブクエリが分散テーブルを使用しているため、各リモートサーバーにあるサブクエリは次のようにすべてのリモートサーバーに再送されます：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

たとえば、100台のサーバーのクラスターがある場合、クエリ全体を実行するには10,000の基本要求が必要になり、これは一般的に受け入れられないと見なされます。

そのような場合には、常に`IN`の代わりに`GLOBAL IN`を使用する必要があります。クエリに対する動作を見てみましょう：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

要求サーバーはサブクエリを実行します：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

結果はRAM内の一時テーブルに置かれます。その後、要求は次のように各リモートサーバーに送信されます：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル`_data1`は、すべてのリモートサーバーにクエリと共に送信されます（一時テーブルの名前は実装により異なります）。

これは、通常の`IN`を使用するよりも最適です。ただし、以下の点に注意してください。

1. 一時テーブルを作成する際、データはユニークにされません。ネットワーク上で送信されるデータ量を減らすために、サブクエリにDISTINCTを指定してください。（通常の`IN`にはこれを行う必要はありません。）
2. 一時テーブルはすべてのリモートサーバーに送信されます。送信はネットワークトポロジーを考慮しません。たとえば、要求サーバーに比べて非常に遠いデータセンターに10台のリモートサーバーがある場合、データはリモートデータセンターにチャンネルを介して10回送信されます。`GLOBAL IN`を使用する際には大規模なデータセットを避けるようにしてください。
3. リモートサーバーへのデータ転送時にネットワーク帯域幅に対する制限は設定できません。ネットワークが過負荷になる可能性があります。
4. データをサーバー間で分散させて、定期的に`GLOBAL IN`を使用する必要がないようにしてください。
5. `GLOBAL IN`を頻繁に使用する必要がある場合は、ClickHouseクラスターの位置を計画し、単一のグループのレプリカが1つのデータセンターにのみ存在し、その間に高速ネットワークがあるようにしてください。これにより、クエリが単一のデータセンター内で完全に処理できるようになります。

また、`GLOBAL IN`句内にローカルテーブルを指定することも意味があります。このローカルテーブルは要求サーバーのみに利用可能であり、リモートサーバーでそれを使用したい場合です。

### 分散サブクエリと max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)および[`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)を使用して、分散クエリ中に転送されるデータ量を制御できます。

これは特に、`GLOBAL IN`クエリが大量のデータを返す場合に重要です。次のSQLを考えてみてください：

```sql
SELECT * FROM table1 WHERE col1 GLOBAL IN (SELECT col1 FROM table2 WHERE <some_predicate>)
```

`some_predicate`が十分に選択的でない場合、大量のデータが返され、パフォーマンスの問題を引き起こす可能性があります。そのような場合には、ネットワーク上のデータ転送を制限することが賢明です。また、[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode)が`throw`に設定されているため（デフォルトで）、これらの制限に達した場合に例外が発生します。

### 分散サブクエリと max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)が1より大きい場合、分散クエリはさらに変換されます。

たとえば、次のクエリ：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

は、各サーバーで次のように変換されます：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで、`M`は`1`と`3`の間の値であり、ローカルクエリがどのレプリカで実行されているかによって異なります。

これらの設定は、クエリ内のすべてのMergeTreeファミリーテーブルに影響し、各テーブルに対して`SAMPLE 1/3 OFFSET (M-1)/3`を適用するのと同じ効果があります。

したがって、[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas)設定を追加すると、正しい結果は両方のテーブルが同じレプリケーションスキームを持ち、UserIDまたはそのサブキーによってサンプリングされる場合にのみ生成されます。特に、`local_table_2`にサンプリングキーがない場合は、不正確な結果が生成されます。同じルールが`JOIN`にも適用されます。

`local_table_2`が要件を満たさない場合の一つの解決策は、`GLOBAL IN`または`GLOBAL JOIN`を使用することです。

テーブルにサンプリングキーがない場合、[parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key)の柔軟なオプションを使用して、異なるより最適な動作を生成することができます。
