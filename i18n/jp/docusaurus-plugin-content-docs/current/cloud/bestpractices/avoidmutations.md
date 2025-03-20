---
slug: /cloud/bestpractices/avoid-mutations
sidebar_label: 変更を避ける
title: 変更を避ける
---

変更とは、テーブルデータを削除または更新を通じて操作する [ALTER](/sql-reference/statements/alter/) クエリを指します。特に、ALTER TABLE … DELETE や UPDATE のようなクエリが含まれます。このようなクエリを実行すると、データ部分の新しい変更バージョンが生成されます。つまり、これらのステートメントは、変更が行われる前に挿入されたすべてのデータ部分に対して、全体のデータ部分の書き換えを引き起こし、大量の書き込みリクエストを生成することになります。

更新については、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree.md) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md) のような専門的なテーブルエンジンを使用することで、大量の書き込みリクエストを避けることができます。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
