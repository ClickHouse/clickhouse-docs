---
slug: /sql-reference/aggregate-functions/reference/categoricalinformationvalue
sidebar_position: 115
title: "categoricalInformationValue"
description: "各カテゴリに対して `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` の値を計算します。"
---

各カテゴリに対して `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` の値を計算します。

``` sql
categoricalInformationValue(category1, category2, ..., tag)
```

結果は、離散的（カテゴリカル）特徴 `[category1, category2, ...]` が `tag` の値を予測する学習モデルにどのように寄与しているかを示します。
