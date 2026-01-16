---
description: 'Документация о типе данных String в ClickHouse'
sidebar_label: 'String'
sidebar_position: 8
slug: /sql-reference/data-types/string
title: 'String'
doc_type: 'reference'
---

# String \{#string\}

Строки произвольной длины. Длина не ограничена. Значение может содержать произвольный набор байт, включая байты нулевого значения.
Тип String заменяет типы VARCHAR, BLOB, CLOB и другие типы из других СУБД.

При создании таблиц для строковых полей можно задавать числовые параметры длины (например, `VARCHAR(255)`), но ClickHouse их игнорирует.

Синонимы:

- `String` — `LONGTEXT`, `MEDIUMTEXT`, `TINYTEXT`, `TEXT`, `LONGBLOB`, `MEDIUMBLOB`, `TINYBLOB`, `BLOB`, `VARCHAR`, `CHAR`, `CHAR LARGE OBJECT`, `CHAR VARYING`, `CHARACTER LARGE OBJECT`, `CHARACTER VARYING`, `NCHAR LARGE OBJECT`, `NCHAR VARYING`, `NATIONAL CHARACTER LARGE OBJECT`, `NATIONAL CHARACTER VARYING`, `NATIONAL CHAR VARYING`, `NATIONAL CHARACTER`, `NATIONAL CHAR`, `BINARY LARGE OBJECT`, `BINARY VARYING`,

## Кодировки \{#encodings\}

В ClickHouse нет понятия кодировок. Строки могут содержать произвольный набор байтов, которые сохраняются и выводятся как есть.
Если вам нужно хранить текст, мы рекомендуем использовать кодировку UTF-8. Как минимум, если ваш терминал использует UTF-8 (как и рекомендуется), вы сможете читать и записывать значения без выполнения преобразований.
Аналогично, некоторые функции для работы со строками имеют отдельные варианты, рассчитанные на то, что строка содержит набор байтов, представляющих текст в кодировке UTF-8.
Например, функция [length](/sql-reference/functions/array-functions#length) вычисляет длину строки в байтах, тогда как функция [lengthUTF8](../functions/string-functions.md#lengthUTF8) вычисляет длину строки в кодовых точках Unicode, предполагая, что значение закодировано в UTF-8.
