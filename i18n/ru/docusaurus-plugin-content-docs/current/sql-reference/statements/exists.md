---
description: 'Документация по оператору EXISTS'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'Оператор EXISTS'
doc_type: 'reference'
---

# Оператор EXISTS {#exists-statement}

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

Возвращает один столбец типа `UInt8` со значением `0`, если таблица или база данных не существует, или `1`, если таблица существует в указанной базе данных.
