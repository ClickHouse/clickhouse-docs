---
slug: '/sql-reference/statements/exists'
sidebar_label: EXISTS
sidebar_position: 45
description: 'EXISTS \x7F\0\0\0\0'
title: 'Оператор EXISTS'
doc_type: reference
---
# EXISTS Statement

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

Возвращает одну колонку типа `UInt8`, которая содержит значение `0`, если таблица или база данных не существует, или `1`, если таблица существует в указанной базе данных.