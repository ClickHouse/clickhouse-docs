---
slug: /sql-reference/statements/select/having
sidebar_label: HAVING
---


# HAVING句

[GROUP BY](../../../sql-reference/statements/select/group-by.md)によって生成された集約結果をフィルタリングすることを許可します。これは[WHERE](../../../sql-reference/statements/select/where.md)句に似ていますが、違いは`WHERE`が集約前に実行されるのに対し、`HAVING`は集約後に実行されるという点です。

`HAVING`句では、`SELECT`句のエイリアスを使用して集約結果を参照することが可能です。あるいは、`HAVING`句はクエリ結果に返されない追加の集約結果に基づいてフィルタリングすることもできます。

## 制限事項 {#limitations}

集約が行われていない場合、`HAVING`は使用できません。その場合は`WHERE`を使用してください。
