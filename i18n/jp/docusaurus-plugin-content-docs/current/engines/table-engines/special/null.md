---
'description': '`Null` テーブルに書き込むと、データは無視されます。`Null` テーブルから読み取ると、応答は空です。'
'sidebar_label': 'Null'
'sidebar_position': 50
'slug': '/engines/table-engines/special/null'
'title': 'Null テーブルエンジン'
'doc_type': 'reference'
---


# `Null` テーブルエンジン

`Null` テーブルに書き込む際、データは無視されます。 `Null` テーブルから読み取る際、応答は空です。

:::note
このことがなぜ有用か疑問に思う方もいるかもしれませんが、`Null` テーブルにマテリアライズドビューを作成できる点に注目してください。そのため、テーブルに書き込まれたデータはビューに影響を与えますが、元の生データは引き続き破棄されます。
:::
