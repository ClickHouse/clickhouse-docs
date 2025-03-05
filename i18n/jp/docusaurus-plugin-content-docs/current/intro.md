---
sidebar_label: ClickHouseとは？
description: "ClickHouse®はオンライン分析処理（OLAP）のための列指向SQLデータベース管理システム（DBMS）です。オープンソースソフトウェアとクラウドオファリングの両方として利用可能です。"
title: ClickHouseとは？
---

import RowOrientedExample from '@site/static/images/column-oriented-example-query.png';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';

ClickHouse®は、高性能な列指向SQLデータベース管理システム（DBMS）で、オンライン分析処理（OLAP）に特化しています。オープンソースソフトウェアおよび[クラウドオファリング](https://clickhouse.com/cloud)として提供されます。

## 分析とは？ {#what-are-analytics}

分析は、OLAP（オンライン分析処理）とも知られ、膨大なデータセットに対する複雑な計算（例えば、集約、文字列処理、算術）のあるSQLクエリを指します。

トランザクショナルクエリ（またはOLTP、オンライントランザクション処理）とは異なり、分析クエリは通常、数十億から数兆の行を処理します。

多くのユースケースにおいて、[分析クエリは「リアルタイム」である必要があります](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)。すなわち、1秒未満で結果を返さなければなりません。

## 行指向と列指向のストレージ {#row-oriented-vs-column-oriented-storage}

このレベルのパフォーマンスは、正しいデータの「指向性」によってのみ実現可能です。

データベースは、[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database)でデータを保存します。

行指向データベースでは、連続したテーブルの行が順番に保存されます。このレイアウトでは、各行のカラム値が一緒に保存されるため、行を迅速に取得できます。

ClickHouseは列指向データベースです。このようなシステムでは、テーブルはカラムのコレクションとして保存され、つまり、各カラムの値が順番に保存されます。このレイアウトでは、単一の行を復元することは難しくなります（行値の間に隙間ができるため）が、フィルターや集約といったカラム操作は行指向データベースよりもはるかに高速になります。

その違いは、[実世界の匿名化されたウェブ分析データ](https://getting-started/example-datasets/metrica)の1億行に対して実行される例クエリで最もよく説明できます：

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

このクエリは、[ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true)で実行できます。また、[既存カラムのうちのわずか数カラム](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)を選択およびフィルタリングし、ミリ秒以内に結果を返します：

<img src={RowOrientedExample} alt="列指向データベースにおける例クエリ" />

上記の図の統計セクションで確認できるように、このクエリは100百万行を92ミリ秒で処理し、スループットは約3億行、つまり1秒未満の7GBとなっています。

**行指向DBMS**

行指向データベースでは、上記のクエリが既存のカラムのうちのいくつかだけを処理しているにもかかわらず、システムはディスクからメモリに他の既存カラムのデータを読み込む必要があります。その理由は、データが「ブロック」と呼ばれるチャンクでディスク上に保存されているためです（通常は固定サイズ、例えば、4KBまたは8KB）。ブロックは、ディスクからメモリに読み込まれるデータの最小単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスクI/Oサブシステムがディスクから必要なブロックを読み込みます。たとえ部分的なブロックのみが必要であっても、全体のブロックがメモリに読み込まれます（これはディスクとファイルシステムの設計によるものです）：

<img src={RowOriented} alt="行指向データベースの構造" />

**列指向DBMS**

各カラムの値がディスク上に順番に保存されるため、上記のクエリが実行される際に不要なデータが読み込まれることはありません。
ブロックごとのストレージとディスクからメモリへの転送が分析クエリのデータアクセスパターンに合わせて調整されているため、クエリに必要なカラムのみがディスクから読み込まれ、未使用データに対する不必要なI/Oを回避します。これは、行ベースのストレージと比べて[はるかに高速](https://benchmark.clickhouse.com/)です。なぜなら、全体の行（関連のないカラムを含む）が読み込まれるからです：

<img src={ColumnOriented} alt="列指向データベースの構造" />

## データのレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouseは、データが複数のノードに冗長に保存されることを保証するために、非同期のマルチマスターレプリケーションスキームを用います。一度、任意の利用可能なレプリカに書き込まれると、残りのすべてのレプリカはバックグラウンドでコピーを取得します。システムは、異なるレプリカ間で同一のデータを保持します。ほとんどの障害からの回復は、自動または複雑なケースの場合は半自動的に行われます。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準や一般的なリレーショナルデータベース管理システムで見られるようなロールベースのアクセス制御の構成を可能にします。

## SQLサポート {#sql-support}

ClickHouseは、[SQLに基づく宣言型クエリ言語](/sql-reference)をサポートしており、ANSI SQL標準において多くのケースで同一です。サポートされているクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from)内のサブクエリ、[JOIN](/sql-reference/statements/select/join)句、[IN](/sql-reference/operators/in)演算子、[ウィンドウ関数](/sql-reference/window-functions)とスカラサブクエリが含まれます。

## おおよその計算 {#approximate-calculation}

ClickHouseは、パフォーマンスのために精度をトレードオフする手段を提供します。たとえば、いくつかの集約関数は異なる値のカウントや中央値、四分位数をおおよそ計算します。また、データのサンプルに基づいてクエリを実行し、迅速におおよその結果を計算できます。さらに、すべてのキーに対してではなく、限られた数のキーで集約を実行できます。キーの分布がどれだけ偏っているかによって、正確な計算に比べて大幅にリソースを節約しながら、かなり正確な結果を提供することが可能です。

## 適応型結合アルゴリズム {#adaptive-join-algorithms}

ClickHouseは、結合アルゴリズムを適応的に選択します。最初は高速なハッシュ結合を使用し、1つ以上の大きなテーブルがある場合はマージ結合にフォールバックします。

## 優れたクエリパフォーマンス {#superior-query-performance}

ClickHouseは、非常に高速なクエリパフォーマンスで知られています。
ClickHouseがなぜこれほど速いのかを学ぶには、[なぜClickHouseは速いのか？](/concepts/why-clickhouse-is-so-fast.md)ガイドをご覧ください。



<!--
## OLAPとは？ {#what-is-olap}
OLAPシナリオでは、大規模なデータセットに対して複雑な分析クエリのためにリアルタイムの応答が必要です。以下の特性があります：
- データセットは巨大であり、数十億または数兆の行がある
- データは多くのカラムを含むテーブルに整理されている
- 特定のクエリに応じてわずか数カラムのみが選択される
- 結果はミリ秒または秒以内で返されなければならない

## 列指向と行指向のデータベース {#column-oriented-vs-row-oriented-databases}
行指向DBMSでは、データは行に保存され、各行に関連するすべての値が物理的に隣接して保存されています。

列指向DBMSでは、データはカラムに保存され、同じカラムの値が一緒に保存されています。

## OLAPシナリオにおける列指向データベースの優位性 {#why-column-oriented-databases-work-better-in-the-olap-scenario}

列指向データベースは、OLAPシナリオにより適しており、ほとんどのクエリを処理するのが少なくとも100倍速いです。理由は以下で詳しく説明しますが、視覚的に示すことが簡単です：

違いが見えますか？

この記事の残りの内容では、列指向データベースがこれらのシナリオでうまく機能する理由、そしてClickHouseがこのカテゴリの他よりも[実績がある](https://concepts/why-clickhouse-is-so-fast#performance-when-inserting-data)理由を説明します。

## なぜClickHouseはこれほど速いのか？ {#why-is-clickhouse-so-fast}

ClickHouseは、各分析クエリをできるだけ早く処理するために、利用可能なすべてのシステムリソースを最大限に活用します。これは、OLAPデータベースを最も高速に実装するために必要な分析能力と低レベルの詳細への注意の独自の組み合わせにより可能です。

このトピックに関してさらに深く掘り下げるための参考記事には以下が含まれます：
- [ClickHouseのパフォーマンス](/concepts/why-clickhouse-is-so-fast)
- [ClickHouseの特性](/about-us/distinctive-features.md)
- [FAQ: なぜClickHouseはこれほど速いのか？](/knowledgebase/why-clickhouse-is-so-fast)

## リアルタイムでの分析クエリの処理 {#processing-analytical-queries-in-real-time}

行指向DBMSでは、データは以下の順序で保存されます：

| 行 | WatchID     | JavaEnable | タイトル             | GoodEvent | イベント時間            |
|-----|-------------|------------|----------------------|-----------|---------------------|
| #0 | 89354350662 | 1          | 投資家向け情報     | 1         | 2016-05-18 05:19:20 |
| #1 | 90329509958 | 0          | お問い合わせ       | 1         | 2016-05-18 08:10:20 |
| #2 | 89953706054 | 1          | ミッション         | 1         | 2016-05-18 07:38:00 |
| #N | …           | …          | …                    | …         | …                   |

つまり、行に関連するすべての値が物理的に隣接して保存されています。

行指向DBMSの例にはMySQL、Postgres、およびMS SQL Serverがあります。

列指向DBMSでは、データは以下のように保存されます：

| 行:        | #0                 | #1                 | #2                 | #N |
|-------------|---------------------|---------------------|---------------------|-----|
| WatchID:    | 89354350662         | 90329509958         | 89953706054         | …   |
| JavaEnable: | 1                   | 0                   | 1                   | …   |
| タイトル:   | 投資家向け情報  | お問い合わせ          | ミッション            | …   |
| GoodEvent:  | 1                   | 1                   | 1                   | …   |
| イベント時間:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | …   |

これらの例は、データが配置される順序を示しています。異なるカラムの値は別々に保存され、同じカラムのデータは一緒に保存されます。

列指向DBMSの例にはVertica、Paraccel（Actian MatrixおよびAmazon Redshift）、Sybase IQ、Exasol、Infobright、InfiniDB、MonetDB（VectorWiseおよびActian Vector）、LucidDB、SAP HANA、Google Dremel、Google PowerDrill、Druid、およびkdb+があります。

データを保存する異なる順序は、異なるシナリオに適しています。データアクセスシナリオは、どのようなクエリが実施されるか、どのくらいの頻度で、どのように、どれだけのデータが各タイプのクエリに対して読み取られるのか（行、カラム、バイト）、データの読み取りと更新の関係、データの作業サイズとそのローカル利用の仕方、トランザクションの使用有無やその隔離性、データのレプリケーションおよび論理的整合性の要件、各タイプのクエリに対するレイテンシおよびスループットの要件などを指します。

システムへの負荷が高くなるほど、使用シナリオの要件に合わせてシステムのセットアップをカスタマイズすることが重要になり、このカスタマイズはますます詳細になっていきます。大きく異なるシナリオに非常に適したシステムは存在しません。多くのシナリオに適応できるシステムでは、高負荷の下ではすべてのシナリオを同様に不十分に処理することになり、可能なシナリオのうちの1つまたは少数のシナリオでしかうまく機能しなくなるでしょう。

### OLAPシナリオの主要な特性 {#key-properties-of-olap-scenario}

- テーブルは「広く」、つまり多くのカラムにわたります。
- データセットは大規模で、単一のクエリを処理するときに高スループットが要求されます（サーバーあたり最大数十億行）。
- カラム値はかなり小さく：数字および短い文字列（例えば、URLあたり60バイト）。
- クエリは大容量の行を抽出しますが、カラムのサブセットのみです。
- 簡単なクエリに対しては、約50msのレイテンシが許容されます。
- クエリごとに1つの大きなテーブルが存在し、他のテーブルは小型です。
- クエリ結果はソースデータに比べて大幅に小さくなります。つまり、データはフィルタリングまたは集約され、結果は単一のサーバーのRAMに収まります。
- クエリは比較的稀（通常、サーバー当たり1秒あたり数百クエリ未満）です。
- 挿入は数千行以上の大きなバッチで行われ、単一の行では行われません。
- トランザクションは必要ありません。

OLAPシナリオが他の一般的なシナリオ（たとえばOLTPやキー値アクセス）とは非常に異なることが明らかです。そのため、適切なパフォーマンスを得たい場合、OLTPやキー値DBを使用して分析クエリを処理しようとするのは意味がありません。たとえば、MongoDBやRedisを分析に使用すると、OLAPデータベースに比べて非常に低いパフォーマンスとなります。



### 入出力 {#inputoutput}

1.  分析クエリには、テーブルカラムのごく一部のみを読み取る必要があります。列指向データベースでは、必要なデータだけを読み取ることができます。たとえば、100カラムのうち5カラムが必要な場合、I/Oは20倍の削減が期待されます。
2.  データはパケットで読み込まれるため、圧縮が容易です。カラム内のデータも圧縮が容易で、これによりI/O量がさらに削減されます。
3.  I/Oが減少することで、システムキャッシュにより多くのデータが収まるようになります。

たとえば、「各広告プラットフォームのレコード数をカウントする」というクエリは、「広告プラットフォームID」カラム1つの読み込みが必要で、未圧縮で1バイトを占めます。もしトラフィックの大部分が広告プラットフォーム以外からのものであれば、このカラムでは少なくとも10倍の圧縮が期待できます。迅速な圧縮アルゴリズムを使用すると、データの圧縮は毎秒数ギガバイトの未圧縮データの速度で行える可能性があります。言い換えれば、このクエリは単一のサーバーで毎秒数十億行の速度で処理できます。この速度は実際に得られています。

### CPU {#cpu}

クエリを実行するには大量の行を処理する必要があるため、個々の行の代わりに全体のベクトルの操作をディスパッチするか、クエリエンジンを実装してディスパッチコストをほとんどゼロにするのが助けになります。これを怠ると、いかなる半分良好なディスクサブシステムでも、クエリインタープリタがCPUを必然的にスタックさせてしまいます。データをカラムに保存し、可能であればカラムによって処理することは理にかなっています。

これを行うには2つの方法があります：

1.  ベクトルエンジン。すべての操作は別々の値のためではなく、ベクトルのために書かれています。これにより、操作を非常に頻繁に呼び出す必要がなくなり、ディスパッチコストはわずかになります。操作コードには最適化された内部ループが含まれています。

2.  コード生成。クエリ用に生成されたコードにはすべての間接呼び出しが含まれています。

これは、行指向データベースでは行われることはありません。なぜなら、単純なクエリを実行する場合には意味がないからです。しかし、例外があります。たとえば、MemSQLはSQLクエリ処理時のレイテンシを減少させるためにコード生成を使用しています。（比較のために、分析DBMSはレイテンシではなくスループットの最適化が求められます。）

CPU効率のためには、クエリ言語は宣言型（SQLまたはMDX）である必要があります。または少なくとも、ベクトル（J、K）でなければなりません。クエリは、最適化を許可する暗黙のループのみを含むべきです。
 -->
