---
slug: /faq/general/columnar-database
title: 'カラム型データベースとは？'
toc_hidden: true
toc_priority: 101
description: 'このページではカラム型データベースについて説明します'
keywords: ['columnar database', 'column-oriented database', 'OLAP database', 'analytical database', 'data warehousing']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# カラムナデータベースとは？ {#what-is-a-columnar-database}

カラムナデータベースは、各カラムのデータを独立して保存します。これにより、クエリで使用されるカラムのみをディスクから読み取ることが可能になります。その代償として、行全体に影響する操作は比例してコストが高くなります。カラムナデータベースの同義語は、カラム指向データベース管理システムです。ClickHouseは、このようなシステムの代表的な例です。

カラムナデータベースの主な利点は以下の通りです：

- 多数のカラムのうち、少数のカラムのみを使用するクエリに最適
- 大量のデータに対する集計クエリに最適
- カラム単位でのデータ圧縮

以下は、レポート作成時における従来の行指向システムとカラムナデータベースの違いを示す図です：

**従来の行指向**

<Image
  img={RowOriented}
  alt='従来の行指向データベース'
  size='md'
  border
/>

**カラムナ**

<Image img={ColumnOriented} alt='カラムナデータベース' size='md' border />

カラムナデータベースは、分析アプリケーションにおいて推奨される選択肢です。テーブルに多数のカラムを持つことができる一方で、読み取りクエリの実行時に未使用のカラムに対するコストを支払う必要がないためです（従来のOLTPデータベースは、データが行単位で保存されているため、クエリ実行時にすべてのデータを読み取ります）。カラム指向データベースは、ビッグデータ処理とデータウェアハウジング向けに設計されており、スループットを向上させるために低コストのハードウェアによる分散クラスタを使用してネイティブにスケールすることが一般的です。ClickHouseは、[分散](../../engines/table-engines/special/distributed.md)テーブルと[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)テーブルを組み合わせてこれを実現しています。

カラムナデータベースの歴史、行指向データベースとの違い、カラムナデータベースのユースケースについて詳しく知りたい場合は、[カラムナデータベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)をご覧ください。
