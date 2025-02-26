---
slug: /sql-reference/table-functions/input
sidebar_position: 95
sidebar_label: input
---

# input

`input(structure)` - サーバーに送信されたデータを、指定された構造から別の構造のテーブルに効果的に変換して挿入するテーブル関数です。

`structure` - サーバーに送信されるデータの構造で、以下の形式で指定します `'column1_name column1_type, column2_name column2_type, ...'`。
例えば、`'id UInt32, name String'` のようになります。

この関数は `INSERT SELECT` クエリの中でのみ使用でき、1回だけ使用されることができますが、それ以外の場合は通常のテーブル関数のように動作します（例えば、サブクエリで使用することができますなど）。

データは通常の `INSERT` クエリと同様に送信でき、クエリの最後に指定する必要がある任意の利用可能な[フォーマット](../../interfaces/formats.md#formats)で渡すことができます（通常の `INSERT SELECT` とは異なります）。

この関数の主な特徴は、サーバーがクライアントからデータを受け取った際、同時に `SELECT` 句の式のリストに従って変換し、ターゲットテーブルに挿入することです。すべての転送データを持つ一時テーブルは作成されません。

**例**

- `test` テーブルが `(a String, b String)` の構造を持ち、`data.csv` のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` を持っているとします。`data.csv` から `test` テーブルにデータを挿入しながら同時に変換するクエリは以下のようになります：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` がテーブル `test` と同じ構造 `test_structure` のデータを含む場合、次の2つのクエリは同等です：

<!-- -->

``` bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
