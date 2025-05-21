---
description: '指定された構造を持つデータをサーバーに送信し、異なる構造のテーブルに効果的に変換して挿入するテーブル関数。'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
---


# input テーブル関数

`input(structure)` - 指定された構造を持つデータをサーバーに送信し、異なる構造のテーブルに効果的に変換して挿入するテーブル関数です。

`structure` - サーバーに送信されるデータの構造を次の形式で指定します `'column1_name column1_type, column2_name column2_type, ...'`。例えば、`'id UInt32, name String'`。

この関数は `INSERT SELECT` クエリ内でのみ使用でき、1回だけ使用することができますが、それ以外は通常のテーブル関数のように振る舞います（例えば、サブクエリ内で使用可能など）。

データは通常の `INSERT` クエリと同じように送信でき、クエリの最後に指定される必要がある任意の利用可能な [format](/sql-reference/formats) で渡すことができます（通常の `INSERT SELECT` とは異なります）。

この関数の主な機能は、サーバーがクライアントからデータを受け取ると同時に、`SELECT` 句の式のリストに従ってそれを変換し、ターゲットテーブルに挿入することです。転送されたすべてのデータを含む一時テーブルは作成されません。

**例**

- `test` テーブルが次の構造 `(a String, b String)` を持ち、`data.csv` のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` を持つとします。`data.csv` から `test` テーブルにデータを挿入しながら同時に変換するクエリは次のようになります：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` がテーブル `test` と同じ構造 `test_structure` のデータを含む場合、次の2つのクエリは等しいです：

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
