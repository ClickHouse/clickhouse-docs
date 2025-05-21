---
description: 'IN演算子に関するドキュメント。ただし、NOT IN、GLOBAL IN、GLOBAL NOT IN演算子は別途記載されています。'
slug: /sql-reference/operators/in
title: 'IN演算子'
---


# IN演算子

`IN`、`NOT IN`、`GLOBAL IN`、および `GLOBAL NOT IN` 演算子はそれぞれ別途取り扱います。これらの機能は非常に豊富です。

演算子の左側は、単一のカラムまたはタプルです。

例:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左側がインデックス内の単一のカラムであり、右側が定数の集合である場合、システムはインデックスを使用してクエリを処理します。

明示的にあまり多くの値をリストしないでください（つまり、数百万）。データセットが大きい場合は、一時テーブルに格納してください（例えば、[クエリ処理のための外部データ](../../engines/table-engines/special/external-data.md)のセクションを参照）。その後、サブクエリを使用します。

演算子の右側には、定数式のセット、定数式を持つタプルのセット（上記の例で示されています）、または括弧で囲まれたデータベーステーブルの名前または `SELECT` サブクエリを指定できます。

ClickHouseは、`IN` サブクエリの左側と右側のタイプが異なることを許可しています。この場合、右側の値は左側のタイプに変換されます。これは、右側に [accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 関数が適用されたかのようになります。

これにより、データ型は [Nullable](../../sql-reference/data-types/nullable.md) になり、変換が行えない場合は [NULL](/operations/settings/formats#input_format_null_as_default) が返されます。

**例**

クエリ:

```sql
SELECT '1' IN (SELECT 1);
```

結果:

```text
┌─in('1', _subquery49)─┐
│                    1 │
└──────────────────────┘
```

演算子の右側がテーブル名（例えば、`UserID IN users`）である場合、これはサブクエリ `UserID IN (SELECT * FROM users)` と同等です。これは、クエリと共に送信される外部データを操作する際に使用します。例えば、クエリは 'users' 一時テーブルに読み込まれたユーザーIDの集合と共に送信され、フィルタリングされるべきです。

演算子の右側が Set エンジンを持つテーブル名である場合（常にRAMにある準備済みデータセット）、データセットは各クエリごとに再作成されることはありません。

サブクエリは、タプルをフィルタリングするために複数のカラムを指定できます。

例:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左側と右側のカラムは同じタイプでなければなりません。

`IN` 演算子およびサブクエリは、クエリの任意の部分、集約関数やラムダ関数を含む場所に出現することができます。
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

3月17日以降の各日の、3月17日にサイトを訪れたユーザーによるページビューの割合をカウントします。
`IN` 句内のサブクエリは常に1回だけ実行され、1台のサーバー上で実行されます。依存サブクエリは存在しません。

## NULL処理 {#null-processing}

リクエスト処理中に、`IN` 演算子は、演算の結果が [NULL](/operations/settings/formats#input_format_null_as_default) である場合、常に `0` に等しいと仮定します。これは、`NULL` が演算子の右側または左側にあるかどうかに関係ありません。`NULL` 値は、どのデータセットにも含まれず、お互いに対応せず、比較できません、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in) の場合。

`t_null` テーブルを用いた例は以下の通りです:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ `SELECT x FROM t_null WHERE y IN (NULL,3)` を実行すると、次の結果が得られます:

```text
┌─x─┐
│ 2 │
└───┘
```

`y = NULL` の行がクエリ結果から除外されていることがわかります。これは、ClickHouseが `NULL` が `(NULL,3)` セットに含まれているかどうかを決定できず、演算の結果が `0` となり、`SELECT` がこの行を最終出力から除外するためです。

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

`IN` 演算子にサブクエリを使用する場合のオプションは2つあります（`JOIN` 演算子と同様）：通常の `IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN` です。これらは、分散クエリ処理での実行方法が異なります。

:::note    
以下で説明するアルゴリズムは、[settingsの](../../operations/settings/settings.md) `distributed_product_mode` 設定によって異なる動作をする可能性がありますのでご注意ください。
:::

通常の `IN` を使用する場合、クエリはリモートサーバーに送信され、各サーバーが `IN` または `JOIN` 句内のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN` を使用する場合、最初にすべてのサブクエリが `GLOBAL IN` / `GLOBAL JOIN` 用に実行され、結果が一時テーブルに収集されます。その後、一時テーブルは各リモートサーバーに送信され、クエリはこの一時データを使用して実行されます。

非分散クエリでは、通常の `IN` / `JOIN` を使用してください。

分散クエリ処理で `IN` / `JOIN` 句内にサブクエリを使用する際は注意が必要です。

いくつかの例を見てみましょう。クラスタ内の各サーバーには通常の **local_table** があります。各サーバーには、クラスタ内のすべてのサーバーを参照する **Distributed** タイプの **distributed_table** テーブルもあります。

**distributed_table** へのクエリでは、クエリはすべてのリモートサーバーに送信され、**local_table** を使用して実行されます。

例えば、クエリ

```sql
SELECT uniq(UserID) FROM distributed_table
```

は、すべてのリモートサーバーに以下のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table
```

それぞれで並行して実行され、途中の結果が組み合わされる段階に達します。その後、途中の結果が要求元サーバーに戻され、マージされて最終結果がクライアントに送信されます。

次に、`IN` を用いたクエリを見てみましょう。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2つのサイトのオーディエンスの交差計算。

このクエリは、すべてのリモートサーバーに以下のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えれば、`IN` 句のデータセットは、各サーバーでローカルに保存されているデータのみに基づいて、各サーバーで独立して収集されます。

この方法は、データがクラスタサーバー全体に均等に分散されているとき、特に単一の UserID のデータが完全に一つのサーバーに存在する場合には、正しく最適に機能します。そうでない場合、結果は不正確になります。このクエリのバリエーションを「ローカル IN」と呼びます。

データがクラスタサーバー全体にランダムに分散されている場合にクエリが正しく機能するように修正するには、サブクエリの中に **distributed_table** を指定できます。その場合、クエリは次のようになります。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリは、すべてのリモートサーバーに次のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは各リモートサーバーで実行を開始します。サブクエリが分散テーブルを使用するため、各リモートサーバーのサブクエリはすべてのリモートサーバーに次のように再送信されます。

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

たとえば、100台のサーバーで構成されるクラスタの場合、全体のクエリを実行するには10,000の基本リクエストが必要となり、これは一般的に受け入れられないと見なされます。

そのような場合では、`IN` の代わりに常に `GLOBAL IN` を使用するべきです。以下のクエリでどのように機能するかを見てみましょう。

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

要求元サーバーは次のようにサブクエリを実行します。

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

その結果はRAM内の一時テーブルに格納されます。その後、リモートサーバーのそれぞれに次のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル `_data1` は、クエリと共にすべてのリモートサーバーに送信されます（一時テーブルの名前は実装に依存します）。

これは、通常の `IN` を使用するよりも最適です。ただし、以下の点に留意してください。

1. 一時テーブルを作成する際、データは一意にはなりません。ネットワーク経由で送信されるデータ量を減らすために、サブクエリに DISTINCT を指定してください。（通常の `IN` に対する必要はありません。）
2. 一時テーブルはすべてのリモートサーバーに送信されます。送信はネットワークトポロジーを考慮しません。たとえば、要求元サーバーに対して非常に遠いデータセンターに10台のリモートサーバーが存在する場合、データはリモートデータセンターへのチャネル経由で10回送信されます。`GLOBAL IN` を使用する際には大きなデータセットを避けるようにしてください。
3. リモートサーバーへのデータ送信時に、ネットワーク帯域幅に関する制限は設定可能ではありません。ネットワークが過負荷になる可能性があります。
4. サーバー間でデータを分散させるようにして、通常は `GLOBAL IN` を使用する必要がないようにしてください。
5. `GLOBAL IN` を頻繁に使用する必要がある場合、ClickHouseクラスタの配置を計画し、単一のレプリカグループが1つのデータセンター内に留まり、その間に高速なネットワークが存在するようにすることで、クエリが単一のデータセンターで完全に処理できるようにします。

要求元サーバーでのみ利用可能で、リモートサーバーでそれを使用したい場合は、`GLOBAL IN` 句内でローカルテーブルを指定することも意味があります。

### 分散サブクエリと max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) および [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) を使用して、分散クエリ中に転送されるデータ量を制御できます。

これは、`GLOBAL IN` クエリが大量のデータを返す場合に特に重要です。次のSQLを考えてみましょう。

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```

もし `some_predicate` が十分に選択的でない場合、大量のデータを返し、パフォーマンス問題を引き起こすことになります。そのような場合、ネットワーク経由でのデータ転送を制限するのが賢明です。また、[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) がデフォルトで `throw` に設定されているため、これらのしきい値が満たされると例外が発生することに留意してください。

### 分散サブクエリと max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) が1を超える場合、分散クエリはさらに変換されます。

例えば、次のようになります。

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

これは各サーバーで次のように変換されます。

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで `M` は1から3の間であり、どのレプリカがローカルクエリを実行しているかによって異なります。

これらの設定はクエリ内のすべての MergeTreeファミリーテーブルに影響を及ぼし、各テーブルに対して `SAMPLE 1/3 OFFSET (M-1)/3` を適用した場合と同じ効果があります。

したがって、[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 設定を追加しても、両方のテーブルが同じレプリケーションスキームを持ち、UserIDまたはそのサブキーでサンプリングされている場合にのみ正しい結果が得られます。特に、`local_table_2` にサンプリングキーがない場合、不正確な結果が生成されます。このルールは `JOIN` にも適用されます。

`local_table_2` が要件を満たさない場合の回避策としては、`GLOBAL IN` または `GLOBAL JOIN` を使用することができます。

サンプリングキーを持たないテーブルの場合、[parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) について、異なる最適な動作が得られる柔軟なオプションを使用できます。
