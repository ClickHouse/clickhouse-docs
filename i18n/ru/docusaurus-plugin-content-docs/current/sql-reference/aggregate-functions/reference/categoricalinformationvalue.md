---
description: 'Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории.'
sidebar_position: 115
slug: /sql-reference/aggregate-functions/reference/categoricalinformationvalue
title: 'categoricalInformationValue'
---

Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории.

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

Результат указывает, как дискретный (категориальный) признак `[category1, category2, ...]` способствует обучающей модели, предсказывающей значение `tag`.
