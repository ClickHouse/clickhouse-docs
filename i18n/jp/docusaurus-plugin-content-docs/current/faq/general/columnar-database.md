---
slug: /faq/general/columnar-database
title: '列指向データベースとは何ですか？'
toc_hidden: true
toc_priority: 101
description: 'このページでは、列指向データベースとは何かを説明します'
keywords: ['列指向データベース', 'カラム指向データベース', 'OLAP データベース', '分析データベース', 'データウェアハウス']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';

列指向データベースは、各列のデータを独立して格納します。これにより、任意のクエリで実際に使用されるカラムだけをディスクから読み取ることができます。その代償として、行全体に対して行う処理は、相対的に高コストになります。列指向データベースは、カラム指向データベース管理システムと呼ばれることもあります。ClickHouse はその典型的な例です。

列指向データベースの主な利点は次のとおりです。

* 多数のカラムのうち、ごく一部のカラムだけを使用するクエリ。
* 大量データに対する集計クエリ。
* 列単位でのデータ圧縮。

レポート作成時における、従来の行指向システムと列指向データベースの違いを図で示します。

**従来の行指向**

<Image img={RowOriented} alt="従来の行指向データベース" size="md" border />

**列指向**

<Image img={ColumnOriented} alt="列指向データベース" size="md" border />

列指向データベースは分析アプリケーションに最適です。テーブルに多くのカラムを「念のため」に定義しておくことができる一方で、読み取りクエリの実行時に未使用のカラムのコストを支払わずに済むためです (従来の OLTP データベースは、データがカラムではなく行として格納されているため、クエリ時にすべてのデータを読み取ります) 。列指向データベースはビッグデータ処理やデータウェアハウジング向けに設計されており、スループットを高めるために、低コストなハードウェアからなる分散クラスターを用いてネイティブにスケールアウトすることがよくあります。ClickHouse はこれを、[distributed](../../engines/table-engines/special/distributed.md) テーブルと [replicated](../../engines/table-engines/mergetree-family/replication.md) テーブルの組み合わせで実現します。

列指向データベースの歴史、行指向データベースとの違い、列指向データベースのユースケースについて詳しく知りたい場合は、[列指向データベースに関するガイド](https://clickhouse.com/engineering-resources/what-is-columnar-database)を参照してください。