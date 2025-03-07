---
slug: /sql-reference/statements/exists
sidebar_position: 45
sidebar_label: EXISTS
---


# Оператор EXISTS

``` sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

Возвращает единственную колонку типа `UInt8`, которая содержит значение `0`, если таблица или база данных не существует, или `1`, если таблица существует в указанной базе данных.
