---
slug: '/sql-reference/aggregate-functions/reference/categoricalinformationvalue'
sidebar_position: 115
description: 'Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag'
title: categoricalInformationValue
doc_type: reference
---
Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории.

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

Результат показывает, как дискретный (категориальный) признак `[category1, category2, ...]` способствует обучающей модели, которая предсказывает значение `tag`.