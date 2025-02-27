---
sidebar_label: ClickHouseとは？
description: "ClickHouse®は、オンライン分析処理（OLAP）用の列指向SQLデータベース管理システム（DBMS）です。オープンソースソフトウェアとしても、クラウド提供としても利用可能です。"
title: ClickHouseとは？
---

ClickHouse®は、高性能な列指向SQLデータベース管理システム（DBMS）であり、オンライン分析処理（OLAP）用に設計されています。オープンソースソフトウェアとしても、[クラウド提供](https://clickhouse.com/cloud)としても利用可能です。

## 分析とは何か？ {#what-are-analytics}

分析、またはOLAP（オンライン分析処理）とは、膨大なデータセットに対して複雑な計算（例：集計、文字列処理、算術演算）を行うSQLクエリを指します。

トランザクションクエリ（またはOLTP、オンライントランザクション処理）は、クエリごとにわずか数行しか読み書きせず、したがってミリ秒単位で完了しますが、分析クエリは通常、数十億から数兆行を処理します。

多くのユースケースでは、[分析クエリは「リアルタイム」でなければなりません](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)。つまり、1秒未満で結果を返す必要があります。

## 行指向ストレージと列指向ストレージの違い {#row-oriented-vs-column-oriented-storage}

このレベルのパフォーマンスは、正しいデータ「オリエンテーション」によってのみ達成できます。

データベースは、[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database)のいずれかでデータを保存します。

行指向データベースでは、連続するテーブル行が順番に保存されます。このレイアウトにより、各行のカラム値が一緒に保存されるため、行を迅速に取得できます。

ClickHouseは列指向データベースです。このようなシステムでは、テーブルはカラムの集合として保存され、すなわち各カラムの値が順番に一つずつ保存されます。このレイアウトでは、行値の間に隙間ができるため単一行の復元が難しくなりますが、フィルタリングや集計などのカラム操作は行指向データベースよりもはるかに高速になります。

この違いは、[実世界の匿名化されたウェブ分析データ](/getting-started/example-datasets/metrica)の1億行で実行されるクエリの例を用いて説明できます：

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

このクエリを[ClickHouse SQL Playgroundで実行](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true)することができ、[100以上の既存のカラムの中からわずか数カラムを選択・フィルタリング](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)し、ミリ秒以内で結果を返します：

![Row-oriented](@site/i18n/ja/docusaurus-plugin-content-docs/current/images/column-oriented-example-query.png#)

上記の図にある統計のセクションで示されるように、このクエリは1億行を92ミリ秒で処理し、スループットは約3億行または秒間7GB未満です。

**行指向DBMS**

行指向データベースでは、上記のクエリが既存のカラムのいくつかしか処理していないにもかかわらず、システムは他の既存カラムからディスクからメモリへのデータをロードする必要があります。その理由は、データが[ブロック](https://en.wikipedia.org/wiki/Block_(data_storage))と呼ばれるチャンクでディスクに保存されているためです（通常は固定サイズ、例：4KBまたは8KB）。ブロックはディスクからメモリに読み込まれる最小のデータ単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスクI/Oサブシステムがディスクから必要なブロックを読み取ります。ブロックの一部のみが必要でも、全体のブロックがメモリに読み込まれます（これはディスクとファイルシステムの設計によるものです）：

![Row-oriented](@site/i18n/ja/docusaurus-plugin-content-docs/current/images/row-oriented.gif#)

**列指向DBMS**

各カラムの値がディスク上で順番に保存されるため、上記のクエリを実行する際に不必要なデータが読み込まれることはありません。ブロック単位のストレージとディスクからメモリへの転送が分析クエリのデータアクセスパターンに合わせて調整されているため、クエリに必要なカラムだけがディスクから読み込まれ、未使用データに対する不必要なI/Oを回避します。これは[行指向ストレージ](https://benchmark.clickhouse.com/)と比べて、はるかに迅速です（行全体が（無関係なカラムを含む）読み込まれるため）：

![Column-oriented](@site/i18n/ja/docusaurus-plugin-content-docs/current/images/column-oriented.gif#)

## データのレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouseは、データが複数のノードに冗長的に保存されることを確保するために、非同期マルチマスターレプリケーション方式を使用しています。利用可能なレプリカのいずれかに書き込まれると、残りのすべてのレプリカがバックグラウンドでコピーを取得します。システムは異なるレプリカに同一のデータを維持し、大多数の障害からの回復は自動または半自動的に行われます。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準や一般的なリレーショナルデータベース管理システムで見られるようなロールベースのアクセス制御の設定を許可します。

## SQLサポート {#sql-support}

ClickHouseは、[SQLに基づく宣言型クエリ言語](/sql-reference)をサポートしており、多くのケースでANSI SQL標準と同一です。サポートされるクエリの構文には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from)のサブクエリ、[JOIN](/sql-reference/statements/select/join)句、[IN](/sql-reference/operators/in)オペレーター、[ウィンドウ関数](/sql-reference/window-functions)、およびスカラサブクエリが含まれます。

## 近似計算 {#approximate-calculation}

ClickHouseは、パフォーマンスと引き換えに精度をあきらめる方法を提供します。たとえば、一部の集約関数では、異なる値のカウントや中央値、分位数を近似的に計算します。また、データのサンプルに対してクエリを実行し、近似結果を迅速に計算することもできます。最後に、全てのキーの代わりに限られた数のキーで集約を実行できます。キーの分布の偏りに応じて、これにより十分に少ないリソースで比較的正確な結果を得ることができます。

## 適応型結合アルゴリズム {#adaptive-join-algorithms}

ClickHouseは、適応的に結合アルゴリズムを選択し、高速なハッシュ結合から始まり、大きなテーブルが複数ある場合はマージ結合にフォールバックします。

## 優れたクエリパフォーマンス {#superior-query-performance}

ClickHouseは、非常に高速なクエリパフォーマンスで知られています。ClickHouseがなぜこれほど速いかを知りたい場合は、[ClickHouseはなぜ速いのか？](/concepts/why-clickhouse-is-so-fast.md)のガイドをご覧ください。
