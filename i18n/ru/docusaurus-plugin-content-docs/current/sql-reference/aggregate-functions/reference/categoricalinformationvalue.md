---
description: 'Вычисляет значение выражения `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) -
  log(P(tag = 0)))` для каждой категории.'
sidebar_position: 115
slug: /sql-reference/aggregate-functions/reference/categoricalinformationvalue
title: 'categoricalInformationValue'
doc_type: 'reference'
---

Вычисляет значение выражения `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории.

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

Результат показывает, как дискретный (категориальный) признак `[category1, category2, ...]` влияет на модель обучения, предсказывающую значение `tag`.
