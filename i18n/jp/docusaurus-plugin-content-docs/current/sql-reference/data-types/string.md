---
slug: /sql-reference/data-types/string
sidebar_position: 8
sidebar_label: 文字列
---


# 文字列

任意の長さの文字列。長さに制限はありません。値は、ヌルバイトを含む任意のバイトセットを含むことができます。  
String型は、他のDBMSからのVARCHAR、BLOB、CLOBおよびその他のタイプを置き換えます。

テーブルを作成する際、文字列フィールドの数値パラメータを設定することができます（例: `VARCHAR(255)`）が、ClickHouseはそれらを無視します。

エイリアス:

- `String` — `LONGTEXT`、`MEDIUMTEXT`、`TINYTEXT`、`TEXT`、`LONGBLOB`、`MEDIUMBLOB`、`TINYBLOB`、`BLOB`、`VARCHAR`、`CHAR`、`CHAR LARGE OBJECT`、`CHAR VARYING`、`CHARACTER LARGE OBJECT`、`CHARACTER VARYING`、`NCHAR LARGE OBJECT`、`NCHAR VARYING`、`NATIONAL CHARACTER LARGE OBJECT`、`NATIONAL CHARACTER VARYING`、`NATIONAL CHAR VARYING`、`NATIONAL CHARACTER`、`NATIONAL CHAR`、`BINARY LARGE OBJECT`、`BINARY VARYING`、

## エンコーディング {#encodings}

ClickHouseにはエンコーディングの概念はありません。文字列は、任意のバイトセットを含むことができ、ありのままに保存および出力されます。  
テキストを保存する必要がある場合は、UTF-8エンコーディングの使用を推奨します。少なくとも、端末がUTF-8を使用している場合（推奨）、変換を行うことなく値の読み書きが可能です。  
同様に、文字列を操作するための特定の関数には、文字列がUTF-8エンコードされたテキストを表すバイトセットを含むという前提の下で動作する別のバリエーションがあります。  
たとえば、[length](../functions/string-functions.md#length)関数はバイト単位で文字列の長さを計算し、[lengthUTF8](../functions/string-functions.md#lengthutf8)関数は文字列の長さをUnicodeのコードポイントで計算します。このとき、値がUTF-8でエンコードされていると仮定します。
