---
sidebar_label: ClickHouseとは？
description: "ClickHouse®は、オンライン分析処理（OLAP）のための列指向SQLデータベース管理システム（DBMS）です。オープンソースソフトウェア及びクラウドベースの提供として利用可能です。"
title: ClickHouseとは？
---

import RowOrientedExample from '@site/static/images/column-oriented-example-query.png';
import RowOriented from '@site/static/images/row-oriented.gif';
import ColumnOriented from '@site/static/images/column-oriented.gif';

ClickHouse®は、高性能で列指向のSQLデータベース管理システム（DBMS）で、オンライン分析処理（OLAP）に対応しています。オープンソースソフトウェアとしても、[クラウドベースの提供](https://clickhouse.com/cloud)としても利用可能です。

## 分析とは？ {#what-are-analytics}

分析は、OLAP（オンライン分析処理）とも呼ばれ、膨大なデータセットに対する複雑な計算を伴うSQLクエリを指します（例：集計、文字列処理、算術計算）。

トランザクションクエリ（OLTP、オンライントランザクション処理）が、一度に数行を読み書きしミリ秒単位で完了するのとは対照的に、分析クエリは通常、数十億行や数兆行を処理します。

多くのユースケースでは、[分析クエリは「リアルタイム」である必要があります](https://clickhouse.com/engineering-resources/what-is-real-time-analytics) すなわち、1秒未満で結果を返す必要があります。

## 行指向ストレージ vs. 列指向ストレージ {#row-oriented-vs-column-oriented-storage}

このような性能レベルは、適切なデータの「方向性」によってのみ達成されます。

データベースは、[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database)でデータを格納します。

行指向データベースでは、連続するテーブルの行が一つづつ順番に保存されます。このレイアウトにより、各行のカラム値が一緒に保存されているため、行を迅速に取得することができます。

ClickHouseは、列指向データベースです。このようなシステムでは、テーブルはカラムのコレクションとして格納されます。すなわち、各カラムの値が一つづつ順番に保存されます。このレイアウトでは、単一の行を復元することが困難になります（行の値の間にギャップが生じるため）が、フィルタや集計といったカラム操作は、行指向データベースよりもはるかに高速になります。

違いを示すのに最適な例は、100百万行の[実世界の匿名化されたウェブ解析データ](/getting-started/example-datasets/metrica)に対して実行されるクエリです。

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

このクエリは、[ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInhleGlzIjoiYyJ9fQ&run_query=true)で実行できます。これは、[100以上の既存のカラムの中から僅か数カラムを選択し、結果をミリ秒単位で返します](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)。

<img src={RowOrientedExample} alt="列指向データベースにおけるクエリの例" />

上記の図の統計セクションに示されているように、このクエリは100百万行を92ミリ秒で処理し、スループットは約300百万行または秒間7GB未満です。

**行指向DBMS**

行指向データベースでは、上記のクエリが既存のカラムの一部のみを処理する場合でも、システムはディスクからメモリに他の既存のカラムのデータを読み込む必要があります。その理由は、データが[ブロック](https://en.wikipedia.org/wiki/Block_(data_storage))と呼ばれるチャンクでディスクに保存されているからです（通常は固定サイズ、例：4KBや8KB）。ブロックは、ディスクからメモリに読み込まれるデータの最小単位です。アプリケーションまたはデータベースがデータを要求すると、オペレーティングシステムのディスクI/Oサブシステムが必要なブロックをディスクから読み込みます。必要なブロックの一部しか必要ない場合でも、ブロック全体がメモリに読み込まれます（これはディスクおよびファイルシステムの設計によるためです）：

<img src={RowOriented} alt="行指向データベース構造" />

**列指向DBMS**

各カラムの値がディスク上で一つづつ順番に保存されているため、上記のクエリを実行するときに不要なデータが読み込まれません。
ブロック単位でのストレージとディスクからメモリへの転送は、分析クエリのデータアクセスパターンに沿ったものになっているため、クエリに必要なカラムだけがディスクから読み込まれ、未使用データの不必要なI/Oを回避します。これは[行指向ストレージ](https://benchmark.clickhouse.com/)と比較して、はるかに高速です。行全体（関連のないカラムを含む）が読み込まれるからです：

<img src={ColumnOriented} alt="列指向データベース構造" />

## データのレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouseは、非同期のマルチマスターレプリケーションスキームを使用して、データが複数のノードに冗長に保存されることを保証しています。利用可能なレプリカのいずれかに書き込まれた後、残りのすべてのレプリカはバックグラウンドでそのコピーを取得します。システムは異なるレプリカで同一のデータを維持します。ほとんどの障害後の回復は自動的、または複雑なケースでは半自動的に行われます。

## 役割ベースのアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを利用してユーザーアカウント管理を実装し、ANSI SQL標準および一般的なリレーショナルデータベース管理システムと類似の役割ベースのアクセス制御の設定を可能にします。

## SQLサポート {#sql-support}

ClickHouseは、[SQLを基にした宣言的クエリ言語](/sql-reference)をサポートし、多くの場合ANSI SQL標準と同一です。サポートされるクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from)のサブクエリ、[JOIN](/sql-reference/statements/select/join)句、[IN](/sql-reference/operators/in)演算子、[ウィンドウ関数](/sql-reference/window-functions)、およびスカラサブクエリが含まれます。

## おおよその計算 {#approximate-calculation}

ClickHouseは、パフォーマンスをのために精度をトレードオフする方法を提供します。例えば、その集約関数の一部は、異なる値のカウント、中間値、量子をおおよそ計算します。また、データのサンプルに基づいておおよその結果を迅速に計算するクエリを実行できます。最後に、すべてのキーに対して実行するのではなく、限定された数のキーで集約を実行できます。キーの分布がどれだけ偏っているかによって、より少ないリソースで合理的に正確な結果を取得できます。

## 適応型結合アルゴリズム {#adaptive-join-algorithms}

ClickHouseは、適応的に結合アルゴリズムを選択し、まず高速なハッシュ結合を使用し、複数の大きなテーブルがある場合はマージ結合にフォールバックします。

## 優れたクエリ性能 {#superior-query-performance}

ClickHouseは、その極めて高速なクエリ性能で知られています。
ClickHouseがなぜこれほど速いのかを知るには、[ClickHouseが高速である理由](/concepts/why-clickhouse-is-so-fast.md)ガイドを参照してください。
