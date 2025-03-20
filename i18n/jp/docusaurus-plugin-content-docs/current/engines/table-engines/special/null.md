---
slug: /engines/table-engines/special/null
sidebar_position: 50
sidebar_label:  'Null'
title: "Null テーブルエンジン"
description: "`Null` テーブルに書き込むと、データは無視されます。`Null` テーブルから読み込むと、応答は空になります。"
---


# Null テーブルエンジン

`Null` テーブルに書き込むと、データは無視されます。`Null` テーブルから読み込むと、応答は空になります。

:::note
これがなぜ有用なのか疑問に思っている方へ、`Null` テーブルにマテリアライズドビューを作成できることに注目してください。したがって、テーブルに書き込まれたデータはビューに影響を与えますが、元の生データは依然として破棄されます。
:::
