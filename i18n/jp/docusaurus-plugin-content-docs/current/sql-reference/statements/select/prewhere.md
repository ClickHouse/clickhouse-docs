---
'description': 'PREWHERE 句に関するDocumentation'
'sidebar_label': 'PREWHERE'
'slug': '/sql-reference/statements/select/prewhere'
'title': 'PREWHERE 句'
'doc_type': 'reference'
---


# PREWHERE句

Prewhereは、フィルタリングをより効率的に行うための最適化です。`PREWHERE`句が明示的に指定されていない場合でも、デフォルトで有効になっています。これは、[WHERE](../../../sql-reference/statements/select/where.md)条件の一部をprewhereステージに自動的に移動させることで機能します。`PREWHERE`句の役割は、デフォルトの動作よりも良い方法を知っていると思う場合に、この最適化を制御することだけです。

prewhere最適化を使用すると、最初にprewhere式を実行するために必要なカラムだけが読み取られます。その後、クエリの残りを実行するために必要な他のカラムが読み取られますが、prewhere式が少なくともいくつかの行で`true`であるブロックのみです。すべての行に対してprewhere式が`false`であるブロックが多数あり、prewhereで必要とされるカラムがクエリの他の部分よりも少ない場合、クエリの実行のためにディスクから読むデータを大幅に減らすことができることがよくあります。

## Prewhereの手動制御 {#controlling-prewhere-manually}

この句は`WHERE`句と同じ意味を持ちます。違いは、テーブルからどのデータが読み取られるかにあります。フィルタリング条件に対して`PREWHERE`を手動で制御すると、クエリ内のカラムの少数によって使用されるが、強力なデータフィルタリングを提供する条件を指定します。これにより、読まれるデータのボリュームが減少します。

クエリは同時に`PREWHERE`と`WHERE`を指定できます。この場合、`PREWHERE`が`WHERE`の前に来ます。

もし[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)設定が0に設定されている場合、`WHERE`から`PREWHERE`へ自動的に部分式を移動させるためのヒューリスティックが無効になります。

クエリが[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子を持っている場合、`PREWHERE`の最適化が常に正しいとは限りません。これは、[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)と[optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)の両方の設定がオンになっている場合のみ有効です。

:::note    
`PREWHERE`セクションは`FINAL`の前に実行されるため、テーブルの`ORDER BY`セクションにないフィールドで`PREWHERE`を使用した場合、`FROM ... FINAL`クエリの結果が偏る可能性があります。
:::

## 制限事項 {#limitations}

`PREWHERE`は、[*MergeTree](../../../engines/table-engines/mergetree-family/index.md)ファミリーのテーブルでのみサポートされています。

## 例 {#example}

```sql
CREATE TABLE mydata
(
    `A` Int64,
    `B` Int8,
    `C` String
)
ENGINE = MergeTree
ORDER BY A AS
SELECT
    number,
    0,
    if(number between 1000 and 2000, 'x', toString(number))
FROM numbers(10000000);

SELECT count()
FROM mydata
WHERE (B = 0) AND (C = 'x');

1 row in set. Elapsed: 0.074 sec. Processed 10.00 million rows, 168.89 MB (134.98 million rows/s., 2.28 GB/s.)

-- let's enable tracing to see which predicate are moved to PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouse moves automatically `B = 0` to PREWHERE, but it has no sense because B is always 0.

-- Let's move other predicate `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- This query with manual `PREWHERE` processes slightly less data: 158.89 MB VS 168.89 MB
```
