---
'slug': '/intro'
'sidebar_label': 'ClickHouseとは何ですか？'
'description': 'ClickHouse®はオンライン分析処理（OLAP）のための列指向SQLデータベース管理システム（DBMS）です。これはオープンソースソフトウェアとしても、クラウドサービスとしても利用可能です。'
'title': 'ClickHouseとは何ですか？'
'doc_type': 'guide'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse® は、高性能で列指向の SQL データベース管理システム (DBMS) であり、オンライン分析処理 (OLAP) 用に設計されています。これは、[オープンソースソフトウェア](https://github.com/ClickHouse/ClickHouse) としても、[クラウド提供](https://clickhouse.com/cloud) としても利用可能です。

## アナリティクスとは何か？ {#what-are-analytics}

アナリティクス、または OLAP (オンライン分析処理) は、大規模なデータセットに対して複雑な計算（例：集計、文字列処理、算術）を伴う SQL クエリを指します。

トランザクショナルクエリ（OLTP、オンライントランザクション処理）とは異なり、これらのクエリはクエリごとに数行しか読み書きせず、ミリ秒単位で完了しますが、アナリティクスクエリは通常、数十億や数兆行を処理します。

多くのユースケースでは、[アナリティクスクエリは「リアルタイム」である必要があります](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)。つまり、結果を1秒未満で返す必要があります。

## 行指向ストレージ vs. 列指向ストレージ {#row-oriented-vs-column-oriented-storage}

このようなパフォーマンスを達成するには、適切なデータ「向き」が必要です。

データベースは、[行指向または列指向でデータを保存します](https://clickhouse.com/engineering-resources/what-is-columnar-database)。

行指向データベースでは、連続したテーブルの行が順番に一つずつ格納されます。このレイアウトでは各行のカラム値が一緒に格納されるため、行を迅速に取得できます。

ClickHouse は列指向データベースです。このようなシステムでは、テーブルはカラムの集合として格納され、つまり各カラムの値が順番に一つずつ格納されます。このレイアウトは単一の行を復元するのを難しくします（行値の間にギャップができるため）が、フィルタや集計のようなカラム操作は行指向データベースよりもはるかに高速になります。

違いは、100百万行の[実世界の匿名化されたウェブアナリティクスデータ](/getting-started/example-datasets/metrica)に対して実行される例のクエリで最もよく説明できます。

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

上記の ClickHouse SQL プレイグラウンドで[このクエリを実行することができます](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true) これは、既存のカラムのうちの[わずか数個を選択およびフィルタリングし](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)、結果をミリ秒内で返します。

<Image img={column_example} alt="列指向データベースの例のクエリ" size="lg"/>

上記の図の統計セクションで確認できるように、このクエリは92ミリ秒で1億行を処理し、毎秒約10億行、または毎秒わずかに7 GBのデータ転送を実現しました。

**行指向 DBMS**

行指向データベースでは、上記のクエリが既存のカラムのうちわずか数個しか処理していないにもかかわらず、システムはディスクからメモリに他の既存のカラムからのデータを読み込む必要があります。その理由は、データがブロックと呼ばれるチャンクに格納されているためです（通常、固定サイズ、例：4 KB または 8 KB）。ブロックはディスクからメモリに読み込まれるデータの最小単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスク I/O サブシステムが必要なブロックをディスクから読み込みます。たとえブロックの一部しか必要とされなくても、全体のブロックがメモリに読み込まれます（これはディスクおよびファイルシステムの設計によるものです）：

<Image img={row_orientated} alt="行指向データベース構造" size="lg"/>

**列指向 DBMS**

各カラムの値がディスク上で順番に一つずつ格納されているため、上記のクエリが実行される際に不要なデータが読み込まれることはありません。
ディスクからメモリへのブロック単位のストレージと転送は、アナリティクスクエリのデータアクセスポイントに沿っているため、クエリに必要なカラムだけがディスクから読まれ、未使用のデータの不要な I/O を回避します。これは、全行（関連のないカラムを含む）が読み込まれる行ベースのストレージと比べて、[はるかに速い](https://benchmark.clickhouse.com/)です：

<Image img={column_orientated} alt="列指向データベース構造" size="lg"/>

## データのレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouse は、データが複数のノードに冗長に保存されることを保証するために、非同期のマルチマスターレプリケーション方式を使用します。利用可能なレプリカに書き込まれた後、すべての残りのレプリカはバックグラウンドでコピーを取得します。システムは異なるレプリカ上で同一のデータを維持します。ほとんどの障害からの回復は自動的に、または複雑なケースでは半自動的に行われます。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouse は、SQL クエリを使用してユーザーアカウント管理を実装し、ANSI SQL 標準や一般的なリレーショナルデータベース管理システムで見られるのと同様のロールベースのアクセス制御設定を許可します。

## SQL サポート {#sql-support}

ClickHouse は、[SQL ベースの宣言型クエリ言語](/sql-reference) をサポートしており、多くの場合 ANSI SQL 標準と同一です。サポートされているクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from) のサブクエリ、[JOIN](/sql-reference/statements/select/join) 節、[IN](/sql-reference/operators/in) 演算子、[ウィンドウ関数](/sql-reference/window-functions) 及びスカラーサブクエリが含まれます。

## おおよその計算 {#approximate-calculation}

ClickHouse には、正確性をパフォーマンスとトレードオフする方法があります。たとえば、その集約関数の一部は、近似値として異なる値のカウント、中央値、及び分位数を計算します。また、データのサンプルに基づいてクエリを実行し、迅速に近似の結果を計算することもできます。最後に、すべてのキーに対してではなく、限られた数のキーで集計を実行できます。キーの分布がどれだけ偏っているかによって、これは非常に少ないリソースで合理的に正確な結果を提供する可能性があります。

## 適応型結合アルゴリズム {#adaptive-join-algorithms}

ClickHouse は、適応的に結合アルゴリズムを選択します：迅速なハッシュ結合から開始し、大きなテーブルが複数ある場合はマージ結合にフォールバックします。

## 優れたクエリパフォーマンス {#superior-query-performance}

ClickHouse は、極めて速いクエリパフォーマンスで知られています。
ClickHouse がなぜこれほど速いのかを知るには、[なぜ ClickHouse は速いのか？](/concepts/why-clickhouse-is-so-fast.mdx) ガイドを参照してください。
