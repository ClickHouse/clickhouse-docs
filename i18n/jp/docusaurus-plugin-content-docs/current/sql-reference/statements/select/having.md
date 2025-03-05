---
slug: /sql-reference/statements/select/having
sidebar_label: HAVING
---


# HAVING 句

[GROUP BY](/sql-reference/statements/select/group-by) で生成された集約結果をフィルタリングすることを許可します。これは [WHERE](../../../sql-reference/statements/select/where.md) 句に似ていますが、違いは `WHERE` が集約の前に実行されるのに対し、`HAVING` は集約の後に実行される点です。

`HAVING` 句では、`SELECT` 句の集約結果をエイリアスで参照することが可能です。また、`HAVING` 句は、クエリ結果に返されない追加の集約結果でフィルタリングすることもできます。

## 制限事項 {#limitations}

集約が実行されない場合は `HAVING` を使用できません。代わりに `WHERE` を使用してください。
