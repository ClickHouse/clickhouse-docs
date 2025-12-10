---
description: '`Null` テーブルに書き込むと、データは無視されます。`Null` テーブルから読み出すと、結果は空になります。'
sidebar_label: 'Null'
sidebar_position: 50
slug: /engines/table-engines/special/null
title: 'Null テーブルエンジン'
doc_type: 'reference'
---

# Null テーブルエンジン {#null-table-engine}

`Null` テーブルにデータを書き込むと、そのデータは無視されます。
`Null` テーブルから読み出すと、レスポンスは空になります。

`Null` テーブルエンジンは、データ変換後に元のデータが不要になるようなユースケースに有用です。
このような用途のために、`Null` テーブル上にマテリアライズドビューを作成できます。
テーブルに書き込まれたデータはビューが消費しますが、元の生データは破棄されます。