---
'description': '计算每个类别的`(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))`
  的值。'
'sidebar_position': 115
'slug': '/sql-reference/aggregate-functions/reference/categoricalinformationvalue'
'title': 'categoricalInformationValue'
---

计算每个类别的值 `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` 。

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

结果表明离散（分类）特征 `[category1, category2, ...]` 如何对预测 `tag` 的值的学习模型做出贡献。
