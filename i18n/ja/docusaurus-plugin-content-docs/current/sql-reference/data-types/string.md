---
slug: /sql-reference/data-types/string
sidebar_position: 8
sidebar_label: 文字列
---

# 文字列

任意の長さの文字列。長さに制限はありません。値には、ヌルバイトを含む任意のバイトセットを含めることができます。  
String型は、他のDBMSからのVARCHAR、BLOB、CLOBなどの型に取って代わります。

テーブルを作成する際、文字列フィールドのために数値パラメータを設定することができます（例：`VARCHAR(255)`）が、ClickHouseはそれらを無視します。

エイリアス:

- `String` — `LONGTEXT`、`MEDIUMTEXT`、`TINYTEXT`、`TEXT`、`LONGBLOB`、`MEDIUMBLOB`、`TINYBLOB`、`BLOB`、`VARCHAR`、`CHAR`、`CHAR LARGE OBJECT`、`CHAR VARYING`、`CHARACTER LARGE OBJECT`、`CHARACTER VARYING`、`NCHAR LARGE OBJECT`、`NCHAR VARYING`、`NATIONAL CHARACTER LARGE OBJECT`、`NATIONAL CHARACTER VARYING`、`NATIONAL CHAR VARYING`、`NATIONAL CHARACTER`、`NATIONAL CHAR`、`BINARY LARGE OBJECT`、`BINARY VARYING`、

## エンコーディング {#encodings}

ClickHouseにはエンコーディングの概念はありません。文字列は任意のバイトセットを含むことができ、それらはそのまま保存され、出力されます。  
テキストを保存する必要がある場合は、UTF-8エンコーディングの使用をお勧めします。少なくとも、ターミナルがUTF-8を使用している場合（推奨）、変換を行うことなく値を読み書きできます。  
同様に、文字列を操作するための特定の関数には、文字列がUTF-8エンコードされたテキストを表すバイトセットを含むという前提のもとで動作する別のバリエーションがあります。  
例えば、[length](../functions/string-functions.md#length)関数は文字列のバイト単位の長さを計算し、[lengthUTF8](../functions/string-functions.md#lengthutf8)関数は値がUTF-8エンコードされていることを前提に、文字列のUnicodeコードポイントの長さを計算します。
