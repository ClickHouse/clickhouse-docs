---
slug: /sql-reference/table-functions/input
sidebar_position: 95
sidebar_label: input
title: 'input'
description: '指定された構造を持つデータを、別の構造を持つテーブルに効果的に変換して挿入するテーブル関数。'
---


# input テーブル関数

`input(structure)` - 指定された構造を持つデータを、別の構造を持つテーブルに効果的に変換して挿入するテーブル関数です。

`structure` - サーバーに送信されるデータの構造、形式は `'column1_name column1_type, column2_name column2_type, ...'` です。
例えば、`'id UInt32, name String'` のようになります。

この関数は `INSERT SELECT` クエリの中でのみ使用でき、1回限り使用可能ですが、それ以外の点では通常のテーブル関数のように振る舞います（例えば、サブクエリで使用するなど）。

データは通常の `INSERT` クエリの場合と同様に送信でき、クエリの最後に指定しなければならない任意の利用可能な [format](/sql-reference/formats) で渡すことができます（通常の `INSERT SELECT` とは異なります）。

この関数の主な特徴は、サーバーがクライアントからデータを受け取ると、`SELECT` 句の式のリストに従って同時に変換し、ターゲットテーブルに挿入することです。すべての転送データを含む一時テーブルは作成されません。

**例**

- `test` テーブルが次の構造 `(a String, b String)` を持ち、`data.csv` のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` を持っているとします。`data.csv` から `test` テーブルにデータを同時に変換して挿入するためのクエリは次のようになります：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` が `test` テーブルと同じ構造 `test_structure` のデータを含む場合、次の2つのクエリは等しいです：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
