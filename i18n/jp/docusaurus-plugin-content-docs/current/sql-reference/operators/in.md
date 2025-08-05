---
description: 'IN operatorsを対象としたドキュメント、NOT IN、GLOBAL IN、およびGLOBAL NOT IN演算子は別途扱われています。'
slug: '/sql-reference/operators/in'
title: 'IN Operators'
---




# IN 演算子

`IN`、`NOT IN`、`GLOBAL IN`、および `GLOBAL NOT IN` 演算子は、それぞれ独自に詳しく説明されます。これらの機能は非常に豊富です。

演算子の左側は、単一のカラムまたはタプルでなければなりません。

例:

```sql
SELECT UserID IN (123, 456) FROM ...
SELECT (CounterID, UserID) IN ((34, 123), (101500, 456)) FROM ...
```

左側がインデックスにある単一のカラムで、右側が定数のセットである場合、システムはクエリの処理にインデックスを使用します。

明示的にあまりにも多くの値をリストしないでください（つまり、数百万）。データセットが大きい場合は、一時テーブルに入れてください（例えば、[外部データのクエリ処理](../../engines/table-engines/special/external-data.md)のセクションを参照）。その後、サブクエリを使用します。

演算子の右側は、定数式のセット、定数式を持つタプルのセット（上の例に示されているもの）、または括弧内のデータベーステーブルの名前または `SELECT` サブクエリでなければなりません。

ClickHouse は、`IN` サブクエリの左側と右側で型が異なることを許容します。この場合、右側の値は左側の型に変換されます。これは、[accurateCastOrNull](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t) 関数が右側に適用されるかのように扱われます。

これは、データ型が[Nullable](../../sql-reference/data-types/nullable.md)となり、変換が実行できない場合は[NULL](/operations/settings/formats#input_format_null_as_default)を返すことを意味します。

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

演算子の右側がテーブルの名前（例えば、`UserID IN users`）である場合、これはサブクエリ `UserID IN (SELECT * FROM users)` に相当します。これは、クエリとともに送信される外部データを操作する際に使用します。例えば、クエリは、'users' 一時テーブルにロードされたユーザーIDのセットと一緒に送信されるべきです。

演算子の右側がセットエンジンを持つテーブルの名前である場合（常にRAMにある準備済みのデータセット）、データセットは各クエリのためにもう一度作成されません。

サブクエリは、タプルをフィルタリングするために複数のカラムを指定できます。

例:

```sql
SELECT (CounterID, UserID) IN (SELECT CounterID, UserID FROM ...) FROM ...
```

`IN` 演算子の左側と右側のカラムは同じ型である必要があります。

`IN` 演算子とサブクエリは、集約関数やラムダ関数を含むクエリの任意の部分で発生する可能性があります。 
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

3月17日以降の日ごとに、3月17日にサイトを訪れたユーザーによるページビューの割合をカウントします。
`IN` 句のサブクエリは、常に一度だけ単一のサーバーで実行されます。依存サブクエリはありません。

## NULL 処理 {#null-processing}

リクエスト処理中、`IN` 演算子は、[NULL](/operations/settings/formats#input_format_null_as_default)との操作の結果が常に `0` に等しいと仮定します。これは、`NULL` が演算子の右側または左側にあるかどうかに関係なく適用されます。`NULL` 値はどのデータセットにも含まれず、互いに対応せず、[transform_null_in = 0](../../operations/settings/settings.md#transform_null_in)である場合は比較できません。

`t_null` テーブルの例を見てみましょう:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    3 │
└───┴──────┘
```

クエリ `SELECT x FROM t_null WHERE y IN (NULL, 3)` を実行すると、次の結果が得られます:

```text
┌─x─┐
│ 2 │
└───┘
```

ここで、`y = NULL` の行がクエリ結果から排除されているのが分かります。これは、ClickHouseが `NULL` が `(NULL, 3)` セットに含まれているかどうかを決定できず、操作の結果として `0` を返し、`SELECT` がこの行を最終出力から除外するためです。

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

サブクエリを持つ `IN` 演算子には、通常の `IN` / `JOIN` と `GLOBAL IN` / `GLOBAL JOIN` の2つのオプションがあります。これらは、分散クエリ処理に対してどのように実行されるかに違いがあります。

:::note    
以下に示すアルゴリズムは、[設定](../../operations/settings/settings.md) の `distributed_product_mode` 設定によって異なる動作をする場合があります。
:::

通常の `IN` を使用する場合、クエリはリモートサーバーに送信され、各サーバーが `IN` または `JOIN` 句のサブクエリを実行します。

`GLOBAL IN` / `GLOBAL JOIN` を使用する場合は、最初にすべてのサブクエリが `GLOBAL IN` / `GLOBAL JOIN` 用に実行され、結果が一時テーブルに収集されます。その後、一時テーブルが各リモートサーバーに送信され、そのデータを使用してクエリが実行されます。

分散されていないクエリの場合は、通常の `IN` / `JOIN` を使用してください。

分散クエリ処理用に `IN` / `JOIN` 句にサブクエリを使用する際は注意が必要です。

いくつかの例を見てみましょう。クラスタ内の各サーバーには通常の **local_table** があり、各サーバーにはクラスタ内のすべてのサーバーを参照する **Distributed** タイプの **distributed_table** テーブルもあります。

**distributed_table** に対するクエリは、クエリがすべてのリモートサーバーに送信され、その上で **local_table** を使用して実行されます。

例えば、クエリ

```sql
SELECT uniq(UserID) FROM distributed_table
```

は、すべてのリモートサーバーに

```sql
SELECT uniq(UserID) FROM local_table
```

として送信され、並行して実行され、途中結果が結合できる段階まで到達します。その後、途中結果が要求元のサーバーに返され、それがマージされ、最終結果がクライアントに送信されます。

次に、`IN` を持つクエリを考えてみましょう:

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

- 2つのサイトのオーディエンスの交差点を計算します。

このクエリは、すべてのリモートサーバーに次のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM local_table WHERE CounterID = 34)
```

言い換えれば、`IN` 句内のデータセットは、各サーバーのローカルに保存されているデータの範囲で独立して収集されます。

これは、データがクラスタサーバー全体に散在している場合も考慮し、単一の UserID のデータが完全に単一のサーバーに存在するようにデータを分散させている場合に正確かつ最適に機能します。そうでなければ、結果は不正確になります。このクエリのバリエーションを「ローカル IN」と呼びます。

データがクラスタサーバーにランダムに散在しているときのクエリの動作を修正するには、サブクエリ内で**distributed_table**を指定できます。クエリは次のようになります：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

このクエリはすべてのリモートサーバーに次のように送信されます。

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

サブクエリは、各リモートサーバーで実行を開始します。サブクエリが分散テーブルを使用しているため、各リモートサーバーのサブクエリはすべてのリモートサーバーに再送信されます：

```sql
SELECT UserID FROM local_table WHERE CounterID = 34
```

例えば、サーバーが100台のクラスターがある場合、全体のクエリを実行するには10,000の基本リクエストが必要で、一般的に受け入れられないと見なされます。

このような場合、`IN` の代わりに常に `GLOBAL IN` を使用してください。クエリの動作を見てみましょう：

```sql
SELECT uniq(UserID) FROM distributed_table WHERE CounterID = 101500 AND UserID GLOBAL IN (SELECT UserID FROM distributed_table WHERE CounterID = 34)
```

要求元のサーバーはサブクエリを実行します：

```sql
SELECT UserID FROM distributed_table WHERE CounterID = 34
```

結果はRAM内の一時テーブルに格納されます。その後、要求は次のように各リモートサーバーに送信されます：

```sql
SELECT uniq(UserID) FROM local_table WHERE CounterID = 101500 AND UserID GLOBAL IN _data1
```

一時テーブル `_data1` は、クエリと共にすべてのリモートサーバーに送信されます（一時テーブルの名前は実装に依存します）。

これは、通常の `IN` を使用するよりも最適です。ただし、以下の点に留意してください。

1. 一時テーブルを作成する際、データはユニークにはなりません。ネットワーク経由で送信されるデータ量を減らすために、サブクエリで DISTINCT を指定してください（通常の `IN` に対しては必要ありません）。
2. 一時テーブルはすべてのリモートサーバーに送信されます。送信はネットワークトポロジーを考慮しません。例えば、10のリモートサーバーが要求元サーバーに対して非常に遠いデータセンターにある場合、データはリモートデータセンターへのチャネルを経由して10回送信されます。`GLOBAL IN` を使用する際は、大きなデータセットを避けてください。
3. リモートサーバーへのデータ送信時に、ネットワーク帯域幅に関する制限は設定できません。ネットワークが過負荷になる可能性があります。
4. `GLOBAL IN` を定期的に使用する必要がないようにデータをサーバー間で分散してください。
5. `GLOBAL IN` を頻繁に使用する必要がある場合は、ClickHouseクラスターの配置を計画し、単一グループのレプリカが、速いネットワークで結ばれている単一のデータセンターに収容されるようにします。これにより、クエリが単一のデータセンター内で完全に処理できるようになります。

要求元のサーバーでのみ利用可能なローカルテーブルを `GLOBAL IN` 句に指定することも意味があります。これにより、リモートサーバーでこのデータを使用できます。

### 分散サブクエリと max_rows_in_set {#distributed-subqueries-and-max_rows_in_set}

[`max_rows_in_set`](/operations/settings/settings#max_rows_in_set) と [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set) を使用して、分散クエリ中に転送されるデータ量を制御できます。

これは、`GLOBAL IN` クエリが大きなデータを返す場合に特に重要です。次のSQLを考慮してください：

```sql
select * from table1 where col1 global in (select col1 from table2 where <some_predicate>)
```
 
`some_predicate` が十分に選択的でない場合、大量のデータを返し、性能問題を引き起こす可能性があります。このような場合、ネットワーク経由で転送されるデータを制限することが賢明です。また、[`set_overflow_mode`](/operations/settings/settings#set_overflow_mode) がデフォルトで `throw` に設定されているため、これらの閾値が満たされると例外が発生します。

### 分散サブクエリと max_parallel_replicas {#distributed-subqueries-and-max_parallel_replicas}

[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) が 1 より大きい場合、分散クエリはさらに変形されます。

例えば、次のように書かれた場合：

```sql
SELECT CounterID, count() FROM distributed_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS max_parallel_replicas=3
```

各サーバーでは次のように変換されます：

```sql
SELECT CounterID, count() FROM local_table_1 WHERE UserID IN (SELECT UserID FROM local_table_2 WHERE CounterID < 100)
SETTINGS parallel_replicas_count=3, parallel_replicas_offset=M
```

ここで、`M` は、ローカルクエリが実行されるレプリカに応じて `1` から `3` の間となります。

これらの設定は、クエリ内のすべてのMergeTreeファミリーテーブルに影響を及ぼし、それぞれのテーブルに `SAMPLE 1/3 OFFSET (M-1)/3` を適用するのと同じ効果があります。

したがって、[max_parallel_replicas](#distributed-subqueries-and-max_parallel_replicas) 設定を追加すると、両方のテーブルが同じレプリケーションスキームを持ち、UserIDまたはそのサブキーでサンプリングされている場合にのみ正しい結果が得られます。特に、`local_table_2` にサンプリングキーがない場合、不正確な結果が生成されます。このルールは `JOIN` にも当てはまります。

`local_table_2` が要件を満たしていない場合の回避策としては、`GLOBAL IN` または `GLOBAL JOIN` を使用することができます。

テーブルにサンプリングキーがない場合、[parallel_replicas_custom_key](/operations/settings/settings#parallel_replicas_custom_key) の柔軟なオプションを使用して、異なる最適な動作を生成することができます。
