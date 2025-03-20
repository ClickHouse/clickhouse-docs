---
slug: /faq/general/columnar-database
title: 列指向データベースとは？
toc_hidden: true
toc_priority: 101
---

import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 列指向データベースとは？ {#what-is-a-columnar-database}

列指向データベースは、各カラムのデータを独立して保存します。これにより、特定のクエリで使用されるカラムのみをディスクから読み込むことができます。代償として、全行に影響を与える操作のコストが相対的に高くなります。列指向データベースの同義語は、列指向データベース管理システムです。ClickHouseはそのようなシステムの典型的な例です。

列指向データベースの主な利点は次のとおりです：

- 多くのカラムの中からわずか数カラムのみを使用するクエリ。
- 大量のデータに対する集計クエリ。
- カラム単位のデータ圧縮。

以下は、レポートを構築する際の従来の行指向システムと列指向データベースの違いを示した図です：

**従来の行指向**
<img src={RowOriented} alt="従来の行指向データベース" />

**列指向**
<img src={ColumnOriented} alt="列指向データベース" />

列指向データベースは、分析アプリケーションに最適な選択肢です。なぜなら、テーブルに多くのカラムを持つことができても、未使用のカラムに対してクエリ実行時のコストを支払う必要がないからです（従来のOLTPデータベースは、データが行として保存されているため、クエリの際にすべてのデータを読み込みます）。列指向データベースはビッグデータ処理とデータウェアハウジングのために設計されており、しばしば低コストのハードウェアの分散クラスターを使用してネイティブにスケールし、スループットを向上させます。ClickHouseは、[分散テーブル](../../engines/table-engines/special/distributed.md) と [レプリケートテーブル](../../engines/table-engines/mergetree-family/replication.md) の組み合わせでこれを実現しています。

列指向データベースの歴史、行指向データベースとの違い、列指向データベースのユースケースについて深く掘り下げたい場合は、[列指向データベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)を参照してください。
