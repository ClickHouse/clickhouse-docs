---
slug: '/faq/general/columnar-database'
title: 'What is a columnar database?'
toc_hidden: true
toc_priority: 101
description: 'This page describes what a columnar database is'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# カラム指向データベースとは？ {#what-is-a-columnar-database}

カラム指向データベースは、各カラムのデータを独立して保存します。これにより、特定のクエリで使用されるカラムのみをディスクから読み込むことができます。その代償として、全行に影響を与える操作は比例して高コストになります。カラム指向データベースの同義語は、カラム指向データベース管理システムです。ClickHouseはそのようなシステムの典型的な例です。

カラム指向データベースの主な利点は以下の通りです：

- 多くのカラムの中からいくつかのカラムのみを使用するクエリ。
- 大量のデータに対する集約クエリ。
- カラム単位のデータ圧縮。

以下は、レポートを作成する際の従来の行指向システムとカラム指向データベースの違いを示す図です：

**従来の行指向**
<Image img={RowOriented} alt="従来の行指向データベース" size="md" border />

**カラム指向**
<Image img={ColumnOriented} alt="カラム指向データベース" size="md" border />

カラム指向データベースは、分析アプリケーションに最適な選択肢です。これは、必要な場合に多くのカラムをテーブルに持てる一方で、読み取りクエリの実行時間において未使用のカラムに対するコストを支払わなくて済むためです（従来のOLTPデータベースは、データが行として保存されているため、クエリ中にすべてのデータを読み取ります）。カラム指向データベースはビッグデータ処理やデータウェアハウジングのために設計されており、低コストのハードウェアの分散クラスターを使用してスケールすることが多く、スループットを向上させます。ClickHouseは、[分散](../../engines/table-engines/special/distributed.md)および[レプリケated](../../engines/table-engines/mergetree-family/replication.md)テーブルの組み合わせでこれを実現しています。

カラムデータベースの歴史や行指向データベースとの違い、カラムデータベースのユースケースについて詳しく知りたい場合は、[カラムデータベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)をご覧ください。
