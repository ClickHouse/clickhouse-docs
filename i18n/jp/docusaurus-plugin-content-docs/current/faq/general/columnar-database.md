---
slug: /faq/general/columnar-database
title: '列指向データベースとは何ですか？'
toc_hidden: true
toc_priority: 101
description: 'このページでは列指向データベースの概要を説明します'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# 列指向データベースとは何ですか？ {#what-is-a-columnar-database}

列指向データベースは、各カラムのデータを独立して格納します。これにより、特定のクエリで使用されるカラムのみディスクからデータを読み込むことができます。その代償として、全行に影響を与える操作は比例して高価になります。列指向データベースの同義語は、列指向データベース管理システムです。ClickHouseはそのようなシステムの典型的な例です。

列指向データベースの主な利点は次のとおりです：

- 多くのカラムの中から数カラムのみを使用するクエリ。
- 大量のデータに対する集計クエリ。
- カラムごとのデータ圧縮。

以下は、レポート作成時における従来の行指向システムと列指向データベースの違いを示すイラストです：

**従来の行指向**
<Image img={RowOriented} alt="従来の行指向データベース" size="md" border />

**列指向**
<Image img={ColumnOriented} alt="列指向データベース" size="md" border />

列指向データベースは、分析アプリケーションに最適な選択肢です。なぜなら、テーブルに多くのカラムを持たせておくことができ、クエリ実行時に未使用のカラムに対してコストを支払わずに済むからです（従来のOLTPデータベースは、データが行として保存されるため、クエリ実行中にすべてのデータを読み取ります）。列指向データベースはビッグデータ処理とデータウェアハウジング向けに設計されており、しばしば低コストのハードウェアの分散クラスターを使用してネイティブにスケールし、スループットを向上させます。ClickHouseは、[分散](../../engines/table-engines/special/distributed.md)テーブルと[レプリケートされた](../../engines/table-engines/mergetree-family/replication.md)テーブルの組み合わせでこれを実現しています。

列データベースの歴史、行指向データベースとの違い、列データベースのユースケースについて詳しく知りたい方は、[列データベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)を参照してください。
