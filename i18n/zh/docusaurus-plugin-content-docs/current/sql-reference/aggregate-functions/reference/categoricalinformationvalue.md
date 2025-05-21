---
'description': 'Calculates the value of `(P(tag = 1) - P(tag = 0))(log(P(tag = 1))
  - log(P(tag = 0)))` for each category.'
'sidebar_position': 115
'slug': '/sql-reference/aggregate-functions/reference/categoricalinformationvalue'
'title': 'categoricalInformationValue'
---



计算每个类别的 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` 的值。

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

结果指示离散（分类）特征 `[category1, category2, ...]` 如何对学习模型产生贡献，该模型预测 `tag` 的值。
