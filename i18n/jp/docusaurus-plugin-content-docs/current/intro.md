---
slug: '/intro'
sidebar_label: 'ClickHouseとは？'
description: 'ClickHouse®は、オンライン分析処理（OLAP）のための列指向SQLデータベース管理システム（DBMS）です。オープンソースソフトウェアとしても、クラウド提供としても利用可能です。'
title: 'ClickHouseとは？'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® は、高性能な列指向 SQL データベース管理システム (DBMS) であり、オンライン分析処理 (OLAP) に向けて設計されています。これは、[オープンソースソフトウェア](https://github.com/ClickHouse/ClickHouse) としても、[クラウド提供](https://clickhouse.com/cloud) としても利用可能です。

## 分析とは何か？ {#what-are-analytics}

分析、または OLAP (オンライン分析処理) は、大規模なデータセットに対して複雑な計算 (例：集計、文字列処理、算術) を行う SQL クエリを指します。

トランザクショナルクエリ (OLTP、オンライントランザクション処理) がクエリごとに数行しか読み書きしないため、ミリ秒で完了するのに対して、分析クエリは常に数十億または数兆行を処理します。

多くのユースケースでは、[分析クエリは「リアルタイム」である必要があります](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)。つまり、1 秒未満で結果を返す必要があります。

## 行指向ストレージと列指向ストレージ {#row-oriented-vs-column-oriented-storage}

このようなパフォーマンスを実現するには、適切なデータ「方向」が必要です。

データベースは、データを[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database) に保存します。

行指向データベースでは、連続したテーブルの行が順番に保存されます。このレイアウトにより、各行のカラム値が一緒に保存されるため、行を迅速に取得できます。

ClickHouse は列指向データベースです。このようなシステムでは、テーブルは一連のカラムコレクションとして保存されます。つまり、各カラムの値は順次一緒に保存されます。このレイアウトは、単一の行を復元するのが難しくなります（行の値の間に隙間ができるため）が、フィルターや集計などのカラム操作は行指向データベースよりもはるかに高速になります。

この違いは、100 百万行の[実際の匿名化されたウェブ分析データ](/getting-started/example-datasets/metrica) を処理する例のクエリで最もよく説明できます：

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

あなたは、この[ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInhleGlzIjoiYyJ9fQ&run_query=true) でこのクエリを実行することができ、[100以上の既存のカラムからわずか数個を選択してフィルタリングし](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)、ミリ秒以内に結果を返します。

<Image img={column_example} alt="列指向データベースのクエリ例" size="lg"/>

上記の図の統計セクションで見ることができるように、クエリは 1 億行を 92 ミリ秒で処理し、スループットは約 3 億行、または 1 秒未満で 7 GB です。

**行指向 DBMS**

行指向データベースでは、上記のクエリが既存のカラムのわずか数個を処理しているとはいえ、システムはディスクからメモリに他の既存カラムのデータを読み込む必要があります。その理由は、データが[ブロック](https://en.wikipedia.org/wiki/Block_(data_storage)) と呼ばれるチャンクにディスク上で保存されているためです (通常、固定サイズ、例えば 4 KB または 8 KB)。ブロックは、ディスクからメモリに読み込まれるデータの最小単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスク I/O サブシステムがディスクから必要なブロックを読み込みます。ブロックの一部だけが必要な場合でも、ブロック全体がメモリに読み込まれます（これはディスクとファイルシステムの設計によるものです）：

<Image img={row_orientated} alt="行指向データベースの構造" size="lg"/>

**列指向 DBMS**

各カラムの値がディスク上で順次一緒に保存されているため、上記のクエリが実行される際に不要なデータが読み込まれません。
ディスクからメモリへのブロック単位のストレージと転送が分析クエリのデータアクセスパターンと一致しているため、クエリに必要なカラムのみがディスクから読み込まれ、未使用のデータに対して不要な I/O を避けることができます。これは[行指向ストレージに比べてはるかに高速です](https://benchmark.clickhouse.com/) 。行全体（関連のないカラムを含む）が読み込まれることに比べて：

<Image img={column_orientated} alt="列指向データベースの構造" size="lg"/>

## データのレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouse は、非同期のマルチマスターレプリケーションスキームを使用して、データが複数のノードに冗長的に保存されることを保証します。利用可能なレプリカに書き込まれた後、残りのすべてのレプリカがバックグラウンドでそのコピーを取得します。システムは、異なるレプリカ間で同一のデータを維持します。ほとんどの障害からの回復は自動的に、または複雑な場合には半自動的に行われます。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouse は、SQL クエリを使用してユーザーアカウント管理を実装し、ANSI SQL 標準や一般的なリレーショナルデータベース管理システムで見られるのと類似のロールベースのアクセス制御の設定を可能にします。

## SQL サポート {#sql-support}

ClickHouse は、[多くのケースで ANSI SQL 標準と同一の SQL に基づく宣言型クエリ言語](https://sql-reference) をサポートしています。サポートされているクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) 内のサブクエリ、[JOIN](/sql-reference/statements/select/join) 句、[IN](/sql-reference/operators/in) 演算子、[ウィンドウ関数](/sql-reference/window-functions)、およびスカラーサブクエリが含まれます。

## おおよその計算 {#approximate-calculation}

ClickHouse は、パフォーマンスのために精度をトレードオフする方法を提供しています。たとえば、一部の集計関数は、近似的に一意の値のカウント、中値、および分位数を計算します。また、データのサンプルでクエリを実行して、迅速に近似結果を計算することができます。最後に、すべてのキーではなく、制限された数のキーに対して集計を実行することができます。キーの分布がどの程度歪んでいるかに応じて、これは非常に少ないリソースでかなり正確な結果を提供します。

## 適応結合アルゴリズム {#adaptive-join-algorithms}

ClickHouse は結合アルゴリズムを適応的に選択し、大きなテーブルが 1 つ以上の場合は、高速なハッシュ結合からマージ結合にフォールバックします。

## 優れたクエリ性能 {#superior-query-performance}

ClickHouse は、非常に高速なクエリパフォーマンスで知られています。
ClickHouse がなぜこれほど速いのかを学ぶには、[なぜ ClickHouse は速いのか？](/concepts/why-clickhouse-is-so-fast.md) ガイドを参照してください。
