---
description: 'PREWHERE句のドキュメント'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'PREWHERE句'
---


# PREWHERE句

Prewhereは、フィルタリングをより効率的に適用するための最適化です。`PREWHERE`句を明示的に指定しなくても、デフォルトで有効になっています。これは、[WHERE](../../../sql-reference/statements/select/where.md)条件の一部を自動的にprewhereステージに移動させることによって機能します。`PREWHERE`句の役割は、この最適化を制御することだけで、デフォルトの動作よりも優れた方法を知っていると考える場合に使用します。

prewhere最適化では、最初にprewhere式を実行するために必要なカラムのみが読み取られます。次に、クエリの残りを実行するために必要な他のカラムが読み取られますが、prewhere式が少なくともいくつかの行で`true`となるブロックだけです。すべての行に対してprewhere式が`false`であり、prewhereがクエリの他の部分よりも少ないカラムを必要とする場合、これによりクエリ実行のためにディスクから読み取るデータ量を大幅に減らすことができます。

## 手動でのPrewhereの制御 {#controlling-prewhere-manually}

この句は`WHERE`句と同じ意味を持ちます。違いはテーブルからどのデータが読み取られるかにあります。クエリ内の少数のカラムによって使用されるフィルタ条件のために手動で`PREWHERE`を制御することができますが、それにより強力なデータフィルタリングが提供されます。これにより、読み取るデータの量が削減されます。

クエリは同時に`PREWHERE`と`WHERE`を指定することができます。この場合、`PREWHERE`が`WHERE`の前に来ます。

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)設定が0に設定されている場合、`WHERE`から`PREWHERE`に自動的に式の一部を移動させるためのヒューリスティクスが無効になります。

クエリに[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子がある場合、`PREWHERE`最適化は常に正しくなりません。両方の設定[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)および[optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)がオンになっている場合のみ有効です。

:::note    
`PREWHERE`セクションは`FINAL`の前に実行されるため、テーブルの`ORDER BY`セクションに含まれていないフィールドを使って`PREWHERE`を使用する場合、`FROM ... FINAL`クエリの結果が歪む可能性があります。
:::

## 制限事項 {#limitations}

`PREWHERE`は[*MergeTree](../../../engines/table-engines/mergetree-family/index.md)ファミリーのテーブルによってのみサポートされています。

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

-- トレーシングを有効にして、どの条件がPREWHEREに移動したかを確認しましょう
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouseは自動的に`B = 0`をPREWHEREに移動しますが、Bは常に0なので意味がありません。

-- 他の条件 `C = 'x'` を移動しましょう 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- この手動での`PREWHERE`を使用したクエリは、158.89 MBと168.89 MBで若干少ないデータを処理します
```
