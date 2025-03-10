---
slug: /sql-reference/aggregate-functions/reference/categoricalinformationvalue
sidebar_position: 115
title: 'categoricalInformationValue'
description: 'Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории.'
---

Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории.

``` sql
categoricalInformationValue(category1, category2, ..., tag)
```

Результат индикатор того, как дискретный (категориальный) признак `[category1, category2, ...]` влияет на модель обучения, которая предсказывает значение `tag`.
