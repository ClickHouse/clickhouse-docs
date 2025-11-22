---
description: 'カテゴリごとに `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` の値を計算します。'
sidebar_position: 115
slug: /sql-reference/aggregate-functions/reference/categoricalinformationvalue
title: 'categoricalInformationValue'
doc_type: 'reference'
---

カテゴリごとに `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` の値を計算します。

```sql
categoricalInformationValue(category1, category2, ..., tag)
```

この結果は、離散（カテゴリ）型の特徴量 `[category1, category2, ...]` が、`tag` の値を予測するための学習モデルにどのように寄与しているかを示します。
