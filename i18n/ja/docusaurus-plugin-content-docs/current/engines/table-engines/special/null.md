---
slug: /engines/table-engines/special/null
sidebar_position: 50
sidebar_label:  'Null'
title: "Nullテーブルエンジン"
description: "`Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み込むと、応答は空です。"
---

# Nullテーブルエンジン

`Null`テーブルに書き込むと、データは無視されます。`Null`テーブルから読み込むと、応答は空です。

:::note
これがなぜ有用なのか疑問に思っている場合、`Null`テーブルにマテリアライズドビューを作成できることに注意してください。そのため、テーブルに書き込まれたデータはビューに影響を与えますが、元の生データは依然として破棄されます。
:::
