---
description: 'ClickHouseにおけるStringデータ型のドキュメント'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
---


# String

任意の長さの文字列。長さに制限はありません。値はnullバイトを含む任意のバイトセットを含むことができます。  
String型は、他のDBMSからのVARCHAR、BLOB、CLOBなどの型に置き換わります。

テーブルを作成する際、文字列フィールドの数値パラメータを設定することができます（例: `VARCHAR(255)`）、ただしClickHouseはそれを無視します。

エイリアス:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## Encodings {#encodings}

ClickHouseにはエンコーディングの概念がありません。文字列は任意のバイトセットを含むことができ、変換せずにそのまま保存され、出力されます。  
テキストを保存する必要がある場合は、UTF-8エンコーディングの使用をお勧めします。少なくとも、ターミナルがUTF-8（推奨）を使用している場合は、変換を行うことなく値を読み書きできます。  
同様に、文字列を操作するための特定の関数には、文字列がUTF-8エンコードされたテキストを表すバイトセットを含むという仮定のもとで動作する別のバリエーションがあります。  
例えば、[length](../functions/string-functions.md#length)関数は、バイト単位での文字列の長さを計算しますが、[lengthUTF8](../functions/string-functions.md#lengthutf8)関数は、値がUTF-8エンコードされていると仮定してUnicodeコードポイントでの文字列の長さを計算します。
