---
'slug': '/faq/general/columnar-database'
'title': '列指向データベースとは何ですか？'
'toc_hidden': true
'toc_priority': 101
'description': 'このページでは、列指向データベースが何であるかを説明します。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# What is a columnar database? {#what-is-a-columnar-database}

カラム指向データベースは、各カラムのデータを独立して保存します。これにより、特定のクエリで使用されるカラムのデータのみをディスクから読み込むことが可能になります。ただし、全行に影響を与える操作は、相対的に高コストになります。カラム指向データベースの同義語は、カラム指向データベース管理システムです。ClickHouseは、そのようなシステムの典型的な例です。

カラム指向データベースの主な利点は以下の通りです：

- 多くのカラムの中で、わずか数カラムのみを使用するクエリ。
- 大量のデータに対する集計クエリ。
- カラム単位のデータ圧縮。

以下は、レポートを作成する際の従来の行指向システムとカラム指向データベースの違いを示すイラストです：

**従来の行指向**
<Image img={RowOriented} alt="従来の行指向データベース" size="md" border />

**カラム指向**
<Image img={ColumnOriented} alt="カラム指向データベース" size="md" border />

カラム指向データベースは、分析アプリケーションに最適な選択肢です。これは、テーブルに多くのカラムを持っていても、未使用のカラムに対する読み込みクエリの実行時間のコストを支払う必要がないためです（従来のOLTPデータベースは、データが行に保存されているため、クエリの際にすべてのデータを読み込みます）。カラム指向データベースは、大規模データ処理やデータウェアハウジング用に設計されており、コストの低いハードウェアの分散クラスタを使用してスケールすることでスループットを向上させることが多いです。ClickHouseは、[分散](../../engines/table-engines/special/distributed.md)テーブルと[レプリケート](../../engines/table-engines/mergetree-family/replication.md)テーブルの組み合わせを使用してこれを実現しています。

カラムデータベースの歴史、行指向データベースとの違い、カラムデータベースのユースケースについて詳細を知りたい場合は、[カラムデータベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)をご覧ください。
