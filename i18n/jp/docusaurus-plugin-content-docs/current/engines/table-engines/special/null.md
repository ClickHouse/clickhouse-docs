---
description: '`Null` テーブルに書き込まれたデータは破棄されます。`Null` テーブルを読み取ると、空の結果が返されます。'
sidebar_label: 'Null'
sidebar_position: 50
slug: /engines/table-engines/special/null
title: 'Null テーブルエンジン'
doc_type: 'reference'
---

# Null table engine 

`Null` テーブルにデータを書き込むと、そのデータは無視されます。
`Null` テーブルから読み込むと、何も返されません。

`Null` テーブルエンジンは、変換後に元のデータが不要になるようなデータ変換処理に役立ちます。
この目的のために、`Null` テーブルを対象とするマテリアライズドビューを作成できます。
テーブルに書き込まれたデータはビューによって取り込まれますが、元の生データは破棄されます。