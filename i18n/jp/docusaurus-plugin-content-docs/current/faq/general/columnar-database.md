---
slug: /faq/general/columnar-database
title: 'カラム型データベースとは？'
toc_hidden: true
toc_priority: 101
description: 'このページでは、カラム型データベースについて説明します'
keywords: ['カラム型データベース', '列指向データベース', 'OLAPデータベース', '分析用データベース', 'データウェアハウス']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';


# カラムナデータベースとは？ {#what-is-a-columnar-database}

カラムナデータベースは、各列のデータを独立して格納します。これにより、クエリで使用される列のみをディスクから読み取ることが可能になります。その代償として、行全体に影響を与える操作は比例してコストが高くなります。カラムナデータベースの同義語は列指向データベース管理システムです。ClickHouseは、このようなシステムの代表例です。

カラムナデータベースの主な利点は次のとおりです：

- 多数の列のうち、少数の列のみを使用するクエリ
- 大量のデータに対する集計クエリ
- 列単位のデータ圧縮

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

カラムナデータベースは分析アプリケーションに最適な選択肢です。テーブルに多数の列を持つことができる一方で、読み取りクエリの実行時に未使用の列に対するコストを支払う必要がないためです（従来のOLTPデータベースは、データが列ではなく行に格納されているため、クエリ実行時にすべてのデータを読み取ります）。列指向データベースはビッグデータ処理とデータウェアハウジング向けに設計されており、スループットを向上させるために低コストのハードウェアによる分散クラスタを使用してネイティブにスケールすることが一般的です。ClickHouseは[分散](../../engines/table-engines/special/distributed.md)テーブルと[レプリケーション](../../engines/table-engines/mergetree-family/replication.md)テーブルの組み合わせでこれを実現しています。

カラムナデータベースの歴史、行指向データベースとの違い、およびカラムナデータベースのユースケースについて詳しく知りたい場合は、[カラムナデータベースガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)を参照してください。
