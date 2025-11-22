---
description: 'Документация о типе данных String в ClickHouse'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---



# String

Строки произвольной длины. Длина не ограничена. Значение может содержать произвольный набор байтов, включая нулевые байты.
Тип String соответствует типам VARCHAR, BLOB, CLOB и другим типам в других СУБД.

При создании таблиц для строковых полей могут задаваться числовые параметры (например, `VARCHAR(255)`), но ClickHouse их игнорирует.

Псевдонимы:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,



## Кодировки {#encodings}

В ClickHouse отсутствует концепция кодировок. Строки могут содержать произвольный набор байтов, которые хранятся и выводятся как есть.
Если необходимо хранить текстовые данные, рекомендуется использовать кодировку UTF-8. Как минимум, если терминал использует UTF-8 (что рекомендуется), можно читать и записывать значения без выполнения преобразований.
Аналогично, некоторые функции для работы со строками имеют отдельные варианты, которые работают исходя из предположения, что строка содержит набор байтов, представляющих текст в кодировке UTF-8.
Например, функция [length](/sql-reference/functions/array-functions#length) вычисляет длину строки в байтах, тогда как функция [lengthUTF8](../functions/string-functions.md#lengthUTF8) вычисляет длину строки в кодовых точках Unicode, предполагая, что значение закодировано в UTF-8.
