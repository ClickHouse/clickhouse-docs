---
slug: /faq/general/columnar-database
title: 列指向データベースとは何ですか？
toc_hidden: true
toc_priority: 101
---

# 列指向データベースとは何ですか？ {#what-is-a-columnar-database}

列指向データベースは、各カラムのデータを独立して保存します。これにより、特定のクエリで使用されるカラムのみについてディスクからデータを読み込むことが可能になります。その代償として、全行に影響を与える操作が相対的に高くつくようになります。列指向データベースの同義語は、列指向データベース管理システムです。ClickHouseは、そのようなシステムの典型的な例です。

列指向データベースの主な利点は以下の通りです：

- 多くのカラムの中からごくわずかのカラムだけを使用するクエリ。
- 大量のデータに対する集約クエリ。
- カラム単位のデータ圧縮。

以下は、レポートを生成する際の従来の行指向システムと列指向データベースの違いを示すイラストです：

**従来の行指向**
![従来の行指向](@site/i18n/ja/docusaurus-plugin-content-docs/current/images/row-oriented.gif#)

**列指向**
![列指向](@site/i18n/ja/docusaurus-plugin-content-docs/current/images/column-oriented.gif#)

列指向データベースは、分析アプリケーションにとって望ましい選択です。なぜなら、状態を考慮して多くのカラムをテーブルに持たせることができる一方で、未使用のカラムに対する読み込みクエリの実行時間のコストを支払う必要がないからです（従来のOLTPデータベースは、データが行として保存されているため、クエリ中にすべてのデータを読み込む）。列指向データベースはビッグデータ処理やデータウェアハウジングのために設計されており、スループットを向上させるために低コストのハードウェアの分散クラスタを使用してネイティブにスケールすることがよくあります。ClickHouseは、[分散テーブル](../../engines/table-engines/special/distributed.md)と[レプリケートされたテーブル](../../engines/table-engines/mergetree-family/replication.md)の組み合わせでこれを実現します。

列指向データベースの歴史や行指向データベースとの違い、列指向データベースの使用例について詳しく知りたい場合は、[列指向データベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)をご覧ください。
