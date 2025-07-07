---
'description': 'Null テーブルに書き込むと、データは無視されます。Null テーブルから読み取ると、応答は空になります。'
'sidebar_label': 'Null'
'sidebar_position': 50
'slug': '/engines/table-engines/special/null'
'title': 'Nullテーブルエンジン'
---




# Null Table Engine

`Null` テーブルに書き込むと、データは無視されます。`Null` テーブルから読み込むと、応答は空になります。

:::note
これが役立つ理由に興味がある場合は、`Null` テーブルにマテリアライズドビューを作成できることに注意してください。したがって、テーブルに書き込まれたデータはビューに影響を与えますが、元の生データは依然として破棄されます。
:::
