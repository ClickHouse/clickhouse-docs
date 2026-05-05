---
slug: /intro
sidebar_label: 'ClickHouse とは？'
description: 'ClickHouse® は、オンライン分析処理 (OLAP) 向けのカラム指向 SQL データベース管理システム (DBMS) です。オープンソースソフトウェアおよびクラウドサービスとして提供されています。'
title: 'ClickHouse とは？'
keywords: ['ClickHouse', 'カラム型データベース', 'OLAP データベース', '分析データベース', '高性能データベース']
doc_type: 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® は、オンライン分析処理 (OLAP) 向けの高性能な列指向SQLデータベース管理システム (DBMS) です。[オープンソースソフトウェア](https://github.com/ClickHouse/ClickHouse) としても、[クラウドサービス](https://clickhouse.com/cloud) としても提供されています。


## アナリティクスとは何か \{#what-are-analytics\}

アナリティクスは OLAP（Online Analytical Processing）とも呼ばれ、巨大なデータセットに対して、集約処理・文字列処理・算術演算などの複雑な計算を行う SQL クエリを指します。

1 回のクエリで読み書きする行数がごく少数であるためミリ秒単位で完了するトランザクション処理のクエリ（OLTP、Online Transaction Processing）とは異なり、アナリティクスクエリは日常的に数十億〜数兆行を処理します。

多くのユースケースでは、[アナリティクスクエリは「リアルタイム」である必要があります](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)。つまり、1 秒未満で結果を返す必要があります。

## 行指向ストレージ vs. 列指向ストレージ \{#row-oriented-vs-column-oriented-storage\}

このレベルのパフォーマンスは、データの「指向性」を適切に選択した場合にのみ達成できます。

データベースは、データを[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database)のいずれかで格納します。

行指向データベースでは、テーブルの連続する行が順番に格納されます。このレイアウトでは、各行の列値がまとまって格納されているため、行をすばやく取得できます。

ClickHouse は列指向データベースです。このようなシステムでは、テーブルは列の集合として格納され、つまり各列の値が連続した配列として格納されます。このレイアウトでは（行の値の間にギャップが生じるため）単一行の再構成は難しくなりますが、フィルタや集約など列に対する処理は、行指向データベースよりもはるかに高速になります。

違いは、[実世界の匿名化された Web 分析データ](/getting-started/example-datasets/metrica)の 1 億行に対して実行するクエリ例で説明するのが最もわかりやすいでしょう。

```sql
SELECT MobilePhoneModel, COUNT() AS c
FROM metrica.hits
WHERE
      RegionID = 229
  AND EventDate >= '2013-07-01'
  AND EventDate <= '2013-07-31'
  AND MobilePhone != 0
  AND MobilePhoneModel not in ['', 'iPad']
GROUP BY MobilePhoneModel
ORDER BY c DESC
LIMIT 8;
```

[ClickHouse SQL Playground でこのクエリを実行](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs\&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ\&run_query=true)すると、[100 を超える既存カラムのうちごく一部だけ](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7\&tab=results\&run_query=true)を選択・フィルタするクエリをミリ秒単位で実行できます。

<Image img={column_example} alt="カラム指向データベースにおけるクエリの例" size="lg" />

上の図の stats セクションに示されているとおり、このクエリは 1 億行を 92 ミリ秒で処理しており、これは 1 秒あたり約 10 億行超、あるいは 1 秒あたり 7 GB 弱のデータを転送している計算になります。

**行指向 DBMS**

行指向データベースでは、上記のクエリが既存カラムのうちごく一部しか処理しない場合でも、システムは結局、他の既存カラムのデータもディスクからメモリへ読み込む必要があります。これは、データがディスク上に [ブロック](https://en.wikipedia.org/wiki/Block_\(data_storage\)) と呼ばれるチャンク（通常は 4 KB や 8 KB などの固定サイズ）に分割されて保存されているためです。ブロックは、ディスクからメモリへ読み出されるデータの最小単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスク I/O サブシステムがディスクから必要なブロックを読み出します。ブロックの一部だけが必要な場合でも、ブロック全体がメモリに読み込まれます（これはディスクおよびファイルシステムの設計によるものです）:

<Image img={row_orientated} alt="行指向データベースの構造" size="lg" />

**カラム指向 DBMS**


各カラムの値がディスク上で連続して格納されているため、上記のクエリを実行しても不要なデータが読み込まれることはありません。
ブロック単位でのストレージとディスクからメモリへの転送は、分析クエリのデータアクセスパターンに合わせて最適化されているため、クエリに必要なカラムだけがディスクから読み出され、未使用データに対する不要な I/O を回避できます。これは、全行（不要なカラムを含む）を読み出す行指向ストレージと比較して [大幅に高速です](https://benchmark.clickhouse.com/)。

<Image img={column_orientated} alt="カラム指向データベース構造" size="lg"/>

## データレプリケーションと整合性 \{#data-replication-and-integrity\}

ClickHouse は、非同期マルチマスターレプリケーション方式を使用して、データが複数ノードに冗長に保存されるようにしています。利用可能な任意のレプリカに書き込まれた後、残りのすべてのレプリカはバックグラウンドでそれぞれのコピーを取得します。システムは、異なるレプリカ間で同一のデータを維持します。ほとんどの障害からの復旧は自動的に行われ、複雑なケースでは半自動的に行われます。

## ロールベースアクセス制御 \{#role-based-access-control\}

ClickHouse は SQL クエリを使用してユーザーアカウントを管理し、ANSI SQL 標準や一般的なリレーショナルデータベース管理システムと同様のロールベースアクセス制御を構成できるようになっています。

## SQL サポート \{#sql-support\}

ClickHouse は、[SQL に基づく宣言型クエリ言語](/sql-reference) をサポートしており、多くの点で ANSI SQL 標準と同一です。サポートされているクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) におけるサブクエリ、[JOIN](/sql-reference/statements/select/join) 句、[IN](/sql-reference/operators/in) 演算子、[ウィンドウ関数](/sql-reference/window-functions)、およびスカラーサブクエリが含まれます。

## 近似計算 \{#approximate-calculation\}

ClickHouse は、精度とパフォーマンスをトレードオフするための手段を提供します。たとえば、一部の集約関数は、異なる値の個数や中央値、分位数を近似的に計算します。また、データのサンプルに対してクエリを実行し、概算結果を素早く算出することもできます。さらに、すべてのキーに対してではなく、キー数を制限して集約を実行することも可能です。キーの分布の偏り具合によっては、厳密な計算に比べてはるかに少ないリソースで、十分に実用的な精度の結果を得られる場合があります。

## アダプティブ結合アルゴリズム \{#adaptive-join-algorithms\}

ClickHouse は状況に応じて結合アルゴリズムを選択します。まず高速なハッシュ結合を試し、大きなテーブルが複数存在する場合はマージ結合に切り替えます。

## 優れたクエリパフォーマンス \{#superior-query-performance\}

ClickHouse は、非常に高速なクエリパフォーマンスで広く知られています。
ClickHouse がこれほど高速な理由については、[Why is ClickHouse fast?](/concepts/why-clickhouse-is-so-fast.mdx) ガイドを参照してください。

{/*
  ## What is OLAP?                
  OLAP シナリオでは、大規模なデータセットに対して複雑な分析クエリをリアルタイムで応答する必要があり、次のような特性があります。
  - データセットは膨大になる可能性がある - 数十億から数兆行
  - データは多数のカラムを含むテーブルに編成される
  - 特定のクエリに応答するために選択されるカラムはごく一部のみ
  - 結果はミリ秒または秒単位で返される必要がある

  ## Column-oriented vs row-oriented databases                                             
  行指向 DBMS では、データは行単位で保存され、1 行に関連するすべての値が物理的に互いに隣り合って保存されます。

  カラム指向 DBMS では、データはカラム単位で保存され、同じカラムの値がまとめて保存されます。

  ## Why column-oriented databases work better in the OLAP scenario                                                                  

  カラム指向データベースは OLAP シナリオにより適しています。ほとんどのクエリの処理において少なくとも 100 倍高速です。その理由は以下で詳しく説明しますが、この事実は視覚的に示す方が理解しやすいでしょう。

  違いがわかりますか?

  この記事の残りの部分では、カラム指向データベースがこれらのシナリオでうまく機能する理由、そして特に ClickHouse がこのカテゴリの他のデータベースを[上回る性能](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated)を発揮する理由を説明します。

  ## Why is ClickHouse so fast?                             

  ClickHouse は、各分析クエリを可能な限り高速に処理するために、利用可能なすべてのシステムリソースを最大限に活用します。これは、分析機能のユニークな組み合わせと、最速の OLAP データベースを実装するために必要な低レベルの詳細への注意によって実現されています。

  このトピックをさらに深く掘り下げるための有用な記事には、次のものがあります。
  - [ClickHouse Performance](/concepts/why-clickhouse-is-so-fast)
  - [Distinctive Features of ClickHouse](/about-us/distinctive-features.md)
  - [FAQ: Why is ClickHouse so fast?](/knowledgebase/why-clickhouse-is-so-fast)

  ## Processing analytical queries in real time                                              

  行指向の DBMS では、データは次のような順序で保存されます。

  | Row | WatchID     | JavaEnable | Title              | GoodEvent | EventTime           |
  |-----|-------------|------------|--------------------|-----------|---------------------|
  | #0 | 89354350662 | 1          | Investor Relations | 1         | 2016-05-18 05:19:20 |
  | #1 | 90329509958 | 0          | Contact us         | 1         | 2016-05-18 08:10:20 |
  | #2 | 89953706054 | 1          | Mission            | 1         | 2016-05-18 07:38:00 |
  | #N | ...           | ...          | ...                  | ...         | ...                   |

  言い換えると、1 行に関連するすべての値が物理的に互いに隣り合って保存されています。

  行指向 DBMS の例としては、MySQL、Postgres、MS SQL Server などがあります。

  列指向の DBMS では、データは次のように保存されます。

  | Row:        | #0                 | #1                 | #2                 | #N |
  |-------------|---------------------|---------------------|---------------------|-----|
  | WatchID:    | 89354350662         | 90329509958         | 89953706054         | ...   |
  | JavaEnable: | 1                   | 0                   | 1                   | ...   |
  | Title:      | Investor Relations  | Contact us          | Mission             | ...   |
  | GoodEvent:  | 1                   | 1                   | 1                   | ...   |
  | EventTime:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ...   |

  これらの例は、データが並べられている順序だけを示しています。異なるカラムの値は別々に保存され、同じカラムのデータはまとめて保存されます。

  列指向 DBMS の例: Vertica、Paraccel (Actian Matrix および Amazon Redshift)、Sybase IQ、Exasol、Infobright、InfiniDB、MonetDB (VectorWise および Actian Vector)、LucidDB、SAP HANA、Google Dremel、Google PowerDrill、Druid、kdb+ など。

  データの保存順序が異なれば、それぞれ適した利用シナリオも異なります。データアクセスのシナリオとは、どのようなクエリがどれくらいの頻度と比率で実行されるか、各種クエリでどれくらいのデータ（行数・カラム数・バイト数）が読み取られるか、読み取りと更新の関係、データの作業セットサイズと局所性、トランザクションを使うかどうかとその分離レベル、データのレプリケーションや論理整合性に対する要件、各種クエリに対するレイテンシおよびスループット要件などを指します。

  システムへの負荷が高いほど、その利用シナリオの要件に合わせてシステム設定を最適化することが重要になり、そのチューニングもより細かくなります。大きく異なるシナリオに同程度に適したシステムというものは存在しません。幅広いシナリオに対応できるシステムであっても、高負荷下ではすべてのシナリオに対して等しく低い性能にとどまるか、あるいはごく一部のシナリオにしかうまく対応できません。

  ### Key properties of the OLAP scenario                                   

  - テーブルが「ワイド」であり、多数のカラムを含む。
  - データセットが大きく、単一クエリを処理する際に高いスループットが必要（1 サーバーあたり 1 秒間に数十億行レベル）。
  - カラム値は比較的小さい（数値や短い文字列。例: 1 URL あたり 60 バイト）。
  - クエリは大量の行を抽出するが、参照するカラムはそのうちの一部のみ。
  - 単純なクエリであれば、約 50ms 程度のレイテンシが許容される。
  - クエリごとに大きなテーブルは 1 つだけであり、それ以外のテーブルはすべて小さい。
  - クエリ結果は元データより大幅に小さい。言い換えると、データはフィルタリングまたは集約され、その結果は 1 台のサーバーの RAM に収まる。
  - クエリ頻度は比較的低い（通常、1 サーバーあたり 1 秒間に数百クエリ以下）。
  - 挿入は、単一行ごとではなく、比較的大きなバッチ（\> 1000 行）で行われる。
  - トランザクションは不要である。

  OLAP シナリオが、他の一般的なシナリオ（OLTP や Key-Value 型アクセスなど）とは大きく異なることは明らかです。そのため、適切な性能を得たい場合に、分析クエリ処理に OLTP や Key-Value DB を使おうとするのは得策ではありません。たとえば、分析用途に MongoDB や Redis を使おうとすると、OLAP データベースと比較して非常に低い性能しか得られません。

  ### Input/output               

  1.  分析クエリでは、テーブルのカラムのうち少数のみを読み取る必要があります。カラム指向データベースでは、必要なデータだけを読み取ることができます。たとえば、100 カラムのうち 5 カラムが必要な場合、I/O を 20 分の 1 に削減できることが期待できます。
  2.  データはパケット単位で読み取られるため、圧縮が容易です。カラム内のデータも圧縮しやすくなります。これにより I/O 量がさらに削減されます。
  3.  I/O が削減されることで、より多くのデータがシステムキャッシュに収まります。

  たとえば、「各広告プラットフォームのレコード数をカウントする」というクエリでは、「広告プラットフォーム ID」という 1 つのカラムを読み取る必要があり、これは非圧縮で 1 バイトを占めます。トラフィックの大部分が広告プラットフォームからのものでない場合、このカラムは少なくとも 10 倍の圧縮が期待できます。高速な圧縮アルゴリズムを使用すると、少なくとも 1 秒あたり数ギガバイトの非圧縮データの速度でデータ解凍が可能です。言い換えると、このクエリは 1 台のサーバーで 1 秒あたり約数十億行の速度で処理できます。この速度は実際に実現されています。

  ### CPU       

  クエリの実行には大量の行を処理する必要があるため、個別の行ではなくベクトル全体に対してすべての操作をディスパッチするか、ディスパッチコストがほとんどないようにクエリエンジンを実装することが有効です。これを行わない場合、どんなに優れたディスクサブシステムを使用しても、クエリインタプリタは必然的に CPU をストールさせます。データをカラム単位で保存し、可能な限りカラム単位で処理することが理にかなっています。

  これを実現する方法は 2 つあります。

  1.  ベクトルエンジン。すべての操作は個別の値ではなくベクトルに対して記述されます。これにより、操作を頻繁に呼び出す必要がなくなり、ディスパッチコストは無視できるようになります。操作コードには最適化された内部サイクルが含まれます。

  2.  コード生成。クエリ用に生成されたコードには、すべての間接呼び出しが含まれます。

  これは行指向データベースでは行われません。単純なクエリを実行する場合には意味がないためです。ただし、例外もあります。たとえば、MemSQL は SQL クエリを処理する際のレイテンシを削減するためにコード生成を使用します。(比較のために言うと、分析 DBMS ではレイテンシではなくスループットの最適化が必要です。)

  CPU 効率のためには、クエリ言語は宣言型(SQL または MDX)であるか、少なくともベクトル型(J、K)である必要があることに注意してください。クエリには暗黙的なループのみを含め、最適化を可能にする必要があります。
  */ }