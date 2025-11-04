---
'description': 'HAVING 句に関するドキュメント'
'sidebar_label': 'HAVING'
'slug': '/sql-reference/statements/select/having'
'title': 'HAVING 句'
'doc_type': 'reference'
---


# HAVING句

[GROUP BY](/sql-reference/statements/select/group-by)によって生成された集計結果をフィルタリングすることを可能にします。これは[WHERE](../../../sql-reference/statements/select/where.md)句に似ていますが、違いは`WHERE`が集計前に実行されるのに対し、`HAVING`は集計後に実行されることです。

`HAVING`句では、`SELECT`句のエイリアスを使用して集計結果を参照することが可能です。あるいは、`HAVING`句はクエリ結果に返されない追加の集計結果でフィルタリングすることもできます。

## 制限事項 {#limitations}

集計が行われていない場合、`HAVING`は使用できません。その場合は`WHERE`を使用してください。
