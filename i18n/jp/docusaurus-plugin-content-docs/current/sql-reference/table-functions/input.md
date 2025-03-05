---
slug: /sql-reference/table-functions/input
sidebar_position: 95
sidebar_label: input
title: "input"
description: "特定の構造を持つデータを別の構造のテーブルに効率的に変換および挿入するためのテーブル関数。"
---


# input テーブル関数

`input(structure)` - 特定の構造を持つデータを別の構造のテーブルに効率的に変換および挿入するためのテーブル関数です。

`structure` - サーバーに送信されるデータの構造を以下の形式で指定します： `'column1_name column1_type, column2_name column2_type, ...'`。
例えば、`'id UInt32, name String'` のようになります。

この関数は `INSERT SELECT` クエリ内でのみ使用でき、1回だけ使用することができますが、通常のテーブル関数のように機能します 
（たとえば、サブクエリ内で使用するなど）。

データは通常の `INSERT` クエリのように任意の方法で送信でき、クエリの最後に指定する必要がある任意の利用可能な [format](../../interfaces/formats.md#formats) で渡すことができます（通常の `INSERT SELECT` とは異なります）。

この関数の主な特徴は、サーバーがクライアントからデータを受信する際に、`SELECT` 句の式のリストに従って同時に変換し、ターゲットテーブルに挿入することです。すべての転送データを含む一時テーブルは作成されません。

**例**

- `test` テーブルが次の構造 `(a String, b String)` を持ち、`data.csv` のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` を持っているとします。以下のように、`data.csv` から `test` テーブルにデータを挿入しながら同時に変換するクエリは次のようになります。

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` が `test` テーブルと同じ構造 `test_structure` のデータを含んでいる場合、次の2つのクエリは等価です：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
