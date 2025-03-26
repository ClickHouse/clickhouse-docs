---
description: 'Документация для оператора EXISTS'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'Оператор EXISTS'
---


# Оператор EXISTS

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

Возвращает единственный столбец типа `UInt8`, который содержит значение `0`, если таблица или база данных не существуют, или `1`, если таблица существует в указанной базе данных.
