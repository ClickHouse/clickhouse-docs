---
slug: /cloud/bestpractices/avoid-mutations
sidebar_label: 変更を避ける
title: 変更を避ける
---

変更は、テーブルデータを削除または更新を通じて操作する [ALTER](/sql-reference/statements/alter/) クエリを指します。特に、ALTER TABLE … DELETE、UPDATE などのクエリがこれに該当します。このようなクエリを実行すると、データパーツの新しい変更されたバージョンが生成されます。これは、変更前に挿入されたすべてのデータに対して、データパーツ全体の再書き込みがトリガーされることを意味し、大量の書き込みリクエストにつながります。

更新の場合、デフォルトの MergeTree テーブルエンジンの代わりに、[ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree.md) や [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md) のような専門のテーブルエンジンを使用することで、これらの大量の書き込みリクエストを避けることができます。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの更新と削除の処理](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
