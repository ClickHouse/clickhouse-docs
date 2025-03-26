---
description: 'Документация для типа данных String в ClickHouse'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
---


# String

Строки произвольной длины. Длина не ограничена. Значение может содержать произвольный набор байтов, включая нулевые байты. 
Тип String заменяет типы VARCHAR, BLOB, CLOB и другие из других СУБД.

При создании таблиц численные параметры для строковых полей могут быть установлены (например, `VARCHAR(255)`), но ClickHouse игнорирует их.

Псевдонимы:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## Encodings {#encodings}

ClickHouse не имеет концепции кодировок. Строки могут содержать произвольный набор байтов, которые сохраняются и выводятся как есть. 
Если вам нужно хранить текст, мы рекомендуем использовать кодировку UTF-8. По крайней мере, если ваш терминал использует UTF-8 (как рекомендуется), вы можете читать и записывать ваши значения без преобразований. 
Точно так же определенные функции для работы со строками имеют отдельные варианты, которые работают на предпосылке, что строка содержит набор байтов, представляющих текст в кодировке UTF-8. 
Например, функция [length](../functions/string-functions.md#length) вычисляет длину строки в байтах, в то время как функция [lengthUTF8](../functions/string-functions.md#lengthutf8) вычисляет длину строки в кодовых точках Unicode, предполагая, что значение закодировано в UTF-8.
