---
description: '对每个类别计算 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) -
  log(P(tag = 0)))` 的值。'
sidebar_position: 115
slug: /sql-reference/aggregate-functions/reference/categoricalinformationvalue
title: 'categoricalInformationValue'
doc_type: 'reference'
---

对每个类别计算 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` 的值。

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

结果表明，离散（类别型）特征 `[category1, category2, ...]` 是如何对预测 `tag` 值的学习模型产生贡献的。
