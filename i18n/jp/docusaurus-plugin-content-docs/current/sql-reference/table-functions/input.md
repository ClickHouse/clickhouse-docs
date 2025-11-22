---
description: '指定した構造でサーバーに送信されたデータを、別の構造を持つテーブルへ効率的に変換して挿入するためのテーブル関数。'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
doc_type: 'reference'
---



# input テーブル関数

`input(structure)` - クライアントからサーバーに送信された、指定された構造を持つデータを、別の構造を持つテーブルに対して効率的に変換および挿入できるテーブル関数です。

`structure` - サーバーに送信されるデータの構造で、次の形式で指定します: `'column1_name column1_type, column2_name column2_type, ...'`。
たとえば、`'id UInt32, name String'` のように指定します。

この関数は `INSERT SELECT` クエリ内でのみ、かつ 1 回だけ使用できますが、それ以外は通常のテーブル関数と同様に動作します
（たとえば、サブクエリ内で使用することができます）。

データは通常の `INSERT` クエリと同様に任意の方法で送信でき、利用可能な任意の[フォーマット](/sql-reference/formats)
で渡すことができます。このフォーマットはクエリの末尾で指定する必要があります（通常の `INSERT SELECT` とは異なります）。

この関数の主な特徴は、サーバーがクライアントからデータを受信した際に、`SELECT` 句内の式リストに従って同時にデータを変換し、
ターゲットテーブルへ挿入する点です。すべての転送データを保持する一時テーブルは作成されません。



## Examples {#examples}

- `test` テーブルが `(a String, b String)` という構造を持ち、`data.csv` のデータが異なる構造 `(col1 String, col2 Date, col3 Int32)` を持つ場合を考えます。`data.csv` から `test` テーブルへデータを挿入し、同時に変換を行うクエリは次のようになります:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

- `data.csv` が `test` テーブルと同じ構造 `test_structure` のデータを含む場合、次の2つのクエリは等価です:

<!-- -->

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
