---
description: 'ClickHouse における String データ型に関するドキュメント'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---



# String

長さに制限のない任意長の文字列です。値には、ヌルバイトを含む任意のバイト列を格納できます。
`String` 型は、他の DBMS における `VARCHAR`、`BLOB`、`CLOB` などの型の代替となります。

テーブル作成時に、文字列フィールドに対して数値パラメータ（例: `VARCHAR(255)`）を指定できますが、ClickHouse はこれらを無視します。

エイリアス:

- `String` — `LONGTEXT`、`MEDIUMTEXT`、`TINYTEXT`、`TEXT`、`LONGBLOB`、`MEDIUMBLOB`、`TINYBLOB`、`BLOB`、`VARCHAR`、`CHAR`、`CHAR LARGE OBJECT`、`CHAR VARYING`、`CHARACTER LARGE OBJECT`、`CHARACTER VARYING`、`NCHAR LARGE OBJECT`、`NCHAR VARYING`、`NATIONAL CHARACTER LARGE OBJECT`、`NATIONAL CHARACTER VARYING`、`NATIONAL CHAR VARYING`、`NATIONAL CHARACTER`、`NATIONAL CHAR`、`BINARY LARGE OBJECT`、`BINARY VARYING`,



## エンコーディング {#encodings}

ClickHouseにはエンコーディングという概念がありません。文字列は任意のバイト列を含むことができ、そのまま保存・出力されます。
テキストを保存する必要がある場合は、UTF-8エンコーディングの使用を推奨します。少なくとも、ターミナルがUTF-8を使用している場合(推奨)、変換なしで値の読み書きが可能です。
同様に、文字列を扱う一部の関数には、文字列がUTF-8エンコードされたテキストを表すバイト列を含むことを前提として動作する別のバリエーションが存在します。
例えば、[length](/sql-reference/functions/array-functions#length)関数は文字列の長さをバイト単位で計算しますが、[lengthUTF8](../functions/string-functions.md#lengthUTF8)関数は値がUTF-8エンコードされていることを前提として、文字列の長さをUnicodeコードポイント単位で計算します。
