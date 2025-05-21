---
description: 'HAVING句のためのドキュメント'
sidebar_label: 'HAVING'
slug: /sql-reference/statements/select/having
title: 'HAVING句'
---


# HAVING句

[GROUP BY](/sql-reference/statements/select/group-by) によって生成された集計結果をフィルタリングすることを可能にします。これは [WHERE](../../../sql-reference/statements/select/where.md) 句に似ていますが、違いは `WHERE` が集計の前に実行されるのに対し、`HAVING` は集計の後に実行される点です。

`HAVING` 句では、`SELECT` 句からの集計結果をそのエイリアスで参照することが可能です。あるいは、`HAVING` 句はクエリ結果には返されない追加の集計結果に基づいてフィルタリングすることもできます。

## 制限事項 {#limitations}

集計が行われない場合、`HAVING` は使用できません。その代わりに `WHERE` を使用してください。
