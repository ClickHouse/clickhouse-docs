---
slug: /intro
sidebar_label: 'ClickHouse とは？'
description: 'ClickHouse® はオンライン分析処理 (OLAP) 向けの列指向 SQL データベース管理システム (DBMS) です。オープンソースソフトウェアとクラウドサービスの両方として利用できます。'
title: 'ClickHouse とは？'
keywords: ['ClickHouse', '列指向データベース', 'OLAP データベース', '分析データベース', '高性能データベース']
doc_type: 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® は、オンライン分析処理 (OLAP) 向けの高性能なカラム指向の SQL データベース管理システム (DBMS) です。[オープンソースソフトウェア](https://github.com/ClickHouse/ClickHouse) としても、[クラウドサービス](https://clickhouse.com/cloud) としても提供されています。


## アナリティクスとは {#what-are-analytics}

アナリティクス（OLAP：Online Analytical Processingとも呼ばれる）とは、大規模なデータセットに対して複雑な計算（集計、文字列処理、算術演算など）を伴うSQLクエリを指します。

トランザクショナルクエリ（OLTP：Online Transaction Processing）が1クエリあたり数行のみを読み書きし、ミリ秒単位で完了するのに対し、アナリティクスクエリは数十億から数兆行を日常的に処理します。

多くのユースケースにおいて、[アナリティクスクエリは「リアルタイム」である必要があります](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)、すなわち1秒未満で結果を返す必要があります。


## 行指向ストレージと列指向ストレージ {#row-oriented-vs-column-oriented-storage}

このレベルのパフォーマンスは、適切なデータの「配置方法」によってのみ達成できます。

データベースは、データを[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database)のいずれかで格納します。

行指向データベースでは、連続するテーブルの行が順次格納されます。このレイアウトでは、各行の列値がまとめて格納されるため、行を高速に取得できます。

ClickHouseは列指向データベースです。このようなシステムでは、テーブルは列の集合として格納されます。つまり、各列の値が順次格納されます。このレイアウトでは、単一の行を復元することが難しくなりますが(行の値の間に隙間が生じるため)、フィルタや集計などの列操作は行指向データベースよりもはるかに高速になります。

この違いは、1億行の[実世界の匿名化されたウェブ解析データ](/getting-started/example-datasets/metrica)に対して実行されるクエリの例で最もよく説明できます:

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

[ClickHouse SQLプレイグラウンドでこのクエリを実行](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true)すると、[100以上ある列のうちわずか数列](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)を選択してフィルタリングし、ミリ秒単位で結果を返すことができます:

<Image
  img={column_example}
  alt='列指向データベースでのクエリ例'
  size='lg'
/>

上記の図の統計セクションでご覧いただけるように、このクエリは1億行を92ミリ秒で処理し、スループットは約10億行/秒以上、つまり毎秒7GB弱のデータ転送を実現しています。

**行指向DBMS**

行指向データベースでは、上記のクエリが既存の列のうちわずか数列のみを処理する場合でも、システムは他の既存の列のデータをディスクからメモリにロードする必要があります。その理由は、データがディスク上に[ブロック](<https://en.wikipedia.org/wiki/Block_(data_storage)>)と呼ばれるチャンク(通常は4KBや8KBなどの固定サイズ)で格納されているためです。ブロックは、ディスクからメモリに読み込まれるデータの最小単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスクI/Oサブシステムは必要なブロックをディスクから読み取ります。ブロックの一部のみが必要な場合でも、ブロック全体がメモリに読み込まれます(これはディスクとファイルシステムの設計によるものです):

<Image img={row_orientated} alt='行指向データベースの構造' size='lg' />

**列指向DBMS**


各列の値がディスク上で連続して順番に格納されているため、上記のクエリが実行される際に不要なデータが読み込まれることはありません。
ディスクからメモリへのブロック単位の格納および転送方式は分析クエリのデータアクセスパターンと整合しているため、クエリに必要な列だけがディスクから読み込まれ、未使用データに対する不要な I/O を回避できます。これは、不要な列を含む行全体が読み込まれる行指向ストレージと比べて [はるかに高速](https://benchmark.clickhouse.com/)です。

<Image img={column_orientated} alt="列指向データベース構造" size="lg"/>



## データレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouseは非同期マルチマスターレプリケーション方式を使用して、複数のノードにデータを冗長的に保存します。利用可能な任意のレプリカへの書き込み後、残りのすべてのレプリカはバックグラウンドでそのコピーを取得します。システムは異なるレプリカ間で同一のデータを維持します。障害発生後の復旧は、ほとんどの場合自動的に実行され、複雑なケースでは半自動的に実行されます。


## ロールベースアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装しており、ANSI SQL標準や主要なリレーショナルデータベース管理システムと同様のロールベースアクセス制御の設定を可能にします。


## SQLサポート {#sql-support}

ClickHouseは、多くの場合ANSI SQL標準と同一の[SQLベースの宣言型クエリ言語](/sql-reference)をサポートしています。サポートされているクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from)内のサブクエリ、[JOIN](/sql-reference/statements/select/join)句、[IN](/sql-reference/operators/in)演算子、[ウィンドウ関数](/sql-reference/window-functions)、スカラサブクエリが含まれます。


## 近似計算 {#approximate-calculation}

ClickHouseは、精度とパフォーマンスをトレードオフする方法を提供します。例えば、一部の集約関数は、ユニーク値の数、中央値、分位数を近似的に計算します。また、データのサンプルに対してクエリを実行することで、近似結果を迅速に算出できます。さらに、すべてのキーではなく、限定された数のキーに対して集約を実行することも可能です。キーの分布の偏りの程度によっては、厳密な計算よりもはるかに少ないリソースで、十分に正確な結果を得ることができます。


## 適応的結合アルゴリズム {#adaptive-join-algorithms}

ClickHouseは結合アルゴリズムを適応的に選択します。高速なハッシュ結合から開始し、複数の大規模テーブルが存在する場合はマージ結合にフォールバックします。


## 優れたクエリパフォーマンス {#superior-query-performance}

ClickHouseは、極めて高速なクエリパフォーマンスで広く知られています。
ClickHouseがなぜこれほど高速なのかについては、[ClickHouseはなぜ高速なのか?](/concepts/why-clickhouse-is-so-fast.mdx)ガイドをご覧ください。


<!--
## OLAPとは？ {#what-is-olap}
OLAPシナリオでは、以下の特性を持つ複雑な分析クエリに対して、大規模なデータセット上でリアルタイムな応答が求められます：
- データセットは膨大になる可能性があります - 数十億行または数兆行
- データは多数の列を含むテーブルに整理されています
- 特定のクエリに応答するために選択される列はわずかです
- 結果はミリ秒または秒単位で返される必要があります




## カラム指向データベースと行指向データベース {#column-oriented-vs-row-oriented-databases}

行指向DBMSでは、データは行単位で格納され、1つの行に関連するすべての値が物理的に隣接して保存されます。

カラム指向DBMSでは、データはカラム単位で格納され、同じカラムの値がまとめて保存されます。


## OLAPシナリオにおいてカラム指向データベースが優れている理由 {#why-column-oriented-databases-work-better-in-the-olap-scenario}

カラム指向データベースはOLAPシナリオに適しており、ほとんどのクエリ処理において少なくとも100倍高速です。その理由については以下で詳しく説明しますが、この事実は視覚的に示す方が理解しやすいでしょう：

違いがわかりますか？

この記事の残りの部分では、カラム指向データベースがこれらのシナリオで優れた性能を発揮する理由と、特にClickHouseがこのカテゴリにおいて他のデータベースを[凌駕する](/concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated)理由について説明します。


## なぜClickHouseは高速なのか？ {#why-is-clickhouse-so-fast}

ClickHouseは、利用可能なすべてのシステムリソースを最大限に活用し、各分析クエリを可能な限り高速に処理します。これは、分析機能の独自の組み合わせと、最速のOLAPデータベースを実装するために必要な低レベルの詳細への注力により実現されています。

このトピックをより深く理解するための参考記事：

- [ClickHouseのパフォーマンス](/concepts/why-clickhouse-is-so-fast)
- [ClickHouseの特徴的な機能](/about-us/distinctive-features.md)
- [FAQ：なぜClickHouseは高速なのか？](/knowledgebase/why-clickhouse-is-so-fast)


## リアルタイムでの分析クエリの処理 {#processing-analytical-queries-in-real-time}

行指向DBMSでは、データは次の順序で格納されます:

| 行 | WatchID     | JavaEnable | Title              | GoodEvent | EventTime           |
| --- | ----------- | ---------- | ------------------ | --------- | ------------------- |
| #0  | 89354350662 | 1          | 投資家向け情報 | 1         | 2016-05-18 05:19:20 |
| #1  | 90329509958 | 0          | お問い合わせ         | 1         | 2016-05-18 08:10:20 |
| #2  | 89953706054 | 1          | ミッション            | 1         | 2016-05-18 07:38:00 |
| #N  | ...         | ...        | ...                | ...       | ...                 |

つまり、1つの行に関連するすべての値は、物理的に隣接して格納されます。

行指向DBMSの例としては、MySQL、Postgres、MS SQL Serverなどがあります。

カラム指向DBMSでは、データは次のように格納されます:

| 行:        | #0                  | #1                  | #2                  | #N  |
| ----------- | ------------------- | ------------------- | ------------------- | --- |
| WatchID:    | 89354350662         | 90329509958         | 89953706054         | ... |
| JavaEnable: | 1                   | 0                   | 1                   | ... |
| Title:      | 投資家向け情報  | お問い合わせ          | ミッション             | ... |
| GoodEvent:  | 1                   | 1                   | 1                   | ... |
| EventTime:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ... |

これらの例は、データが配置される順序のみを示しています。異なるカラムの値は別々に格納され、同じカラムのデータはまとめて格納されます。

カラム指向DBMSの例: Vertica、Paraccel (Actian MatrixおよびAmazon Redshift)、Sybase IQ、Exasol、Infobright、InfiniDB、MonetDB (VectorWiseおよびActian Vector)、LucidDB、SAP HANA、Google Dremel、Google PowerDrill、Druid、kdb+など。

データを格納する順序の違いは、異なるシナリオに適しています。データアクセスシナリオとは、どのようなクエリが実行されるか、その頻度と割合、各タイプのクエリで読み取られるデータ量(行、カラム、バイト)、データの読み取りと更新の関係、データの作業サイズとローカルでの使用方法、トランザクションの使用有無とその分離レベル、データレプリケーションと論理的整合性の要件、各タイプのクエリのレイテンシとスループットの要件などを指します。

システムの負荷が高いほど、使用シナリオの要件に合わせてシステム設定をカスタマイズすることが重要になり、そのカスタマイズはより細かくなります。大きく異なるシナリオに等しく適したシステムは存在しません。システムが幅広いシナリオに適応できる場合、高負荷下では、すべてのシナリオを等しく不十分に処理するか、可能なシナリオのうち1つまたは少数のみで適切に動作します。

### OLAPシナリオの主要な特性 {#key-properties-of-olap-scenario}

- テーブルは「幅広い」、つまり多数のカラムを含みます。
- データセットは大規模であり、単一のクエリを処理する際に高いスループットが必要です(サーバーあたり毎秒数十億行まで)。
- カラムの値は比較的小さく、数値や短い文字列です(例: URLあたり60バイト)。
- クエリは大量の行を抽出しますが、カラムの一部のみを対象とします。
- 単純なクエリの場合、約50ミリ秒のレイテンシが許容されます。
- クエリごとに1つの大きなテーブルがあり、1つを除くすべてのテーブルは小さいです。
- クエリ結果は元データよりも大幅に小さくなります。つまり、データはフィルタリングまたは集計されるため、結果は単一サーバーのRAMに収まります。
- クエリは比較的まれです(通常、サーバーあたり毎秒数百クエリ以下)。
- 挿入は単一行ではなく、かなり大きなバッチ(\> 1000行)で行われます。
- トランザクションは不要です。

OLAPシナリオは、他の一般的なシナリオ(OLTPやKey-Valueアクセスなど)とは大きく異なることは明らかです。したがって、適切なパフォーマンスを得たい場合、分析クエリの処理にOLTPやKey-Value DBを使用しようとすることは意味がありません。例えば、分析にMongoDBやRedisを使用しようとすると、OLAPデータベースと比較して非常に低いパフォーマンスしか得られません。


### 入出力 {#inputoutput}

1.  分析クエリでは、テーブルの列のうち少数のみを読み取る必要があります。カラム指向データベースでは、必要なデータのみを読み取ることができます。例えば、100列のうち5列が必要な場合、I/Oを20分の1に削減できることが期待できます。
2.  データはパケット単位で読み取られるため、圧縮が容易になります。列単位のデータも圧縮しやすくなります。これによりI/O量がさらに削減されます。
3.  I/Oの削減により、より多くのデータがシステムキャッシュに収まります。

例えば、「各広告プラットフォームのレコード数を数える」というクエリでは、非圧縮で1バイトを占める「広告プラットフォームID」列を1つ読み取る必要があります。トラフィックの大部分が広告プラットフォームからのものでない場合、この列は少なくとも10分の1に圧縮されることが期待できます。高速圧縮アルゴリズムを使用すると、少なくとも毎秒数ギガバイトの非圧縮データの速度でデータ展開が可能です。言い換えれば、このクエリは単一サーバー上で毎秒約数十億行の速度で処理できます。この速度は実際に達成されています。

### CPU {#cpu}

クエリの実行には大量の行を処理する必要があるため、個別の行ではなくベクトル全体に対してすべての操作をディスパッチするか、ディスパッチコストがほとんど発生しないようにクエリエンジンを実装することが有効です。これを行わない場合、どのような中程度のディスクサブシステムでも、クエリインタープリタは必然的にCPUをストールさせます。データを列単位で保存し、可能な限り列単位で処理することは理にかなっています。

これを実現する方法は2つあります:

1.  ベクトルエンジン。すべての操作は個別の値ではなくベクトルに対して記述されます。これにより、操作を頻繁に呼び出す必要がなくなり、ディスパッチコストは無視できるようになります。操作コードには最適化された内部ループが含まれます。

2.  コード生成。クエリ用に生成されたコードには、すべての間接呼び出しが含まれます。

これは行指向データベースでは行われません。単純なクエリを実行する際には意味がないためです。ただし、例外もあります。例えば、MemSQLはSQLクエリ処理時のレイテンシを削減するためにコード生成を使用しています。(比較として、分析DBMSではレイテンシではなくスループットの最適化が求められます。)

CPUの効率性のためには、クエリ言語は宣言的(SQLまたはMDX)であるか、少なくともベクトル型(J、K)である必要があることに注意してください。クエリには暗黙的なループのみを含め、最適化を可能にする必要があります。
-->
