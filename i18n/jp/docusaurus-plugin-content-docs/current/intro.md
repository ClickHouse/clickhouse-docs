---
slug: /intro
sidebar_label: 'ClickHouseとは？'
description: 'ClickHouse®は、オンライン分析処理（OLAP）のための列指向SQLデータベース管理システム（DBMS）です。オープンソースソフトウェアおよびクラウドサービスの両方として提供されています。'
title: 'ClickHouseとは？'
---

import column_example from '@site/static/images/column-oriented-example-query.png';
import row_orientated from '@site/static/images/row-oriented.gif';
import column_orientated from '@site/static/images/column-oriented.gif';
import Image from '@theme/IdealImage';

ClickHouse®は、高性能な列指向SQLデータベース管理システム（DBMS）で、オンライン分析処理（OLAP）のために設計されています。これは、[オープンソースソフトウェア](https://github.com/ClickHouse/ClickHouse)としても、[クラウドサービス](https://clickhouse.com/cloud)としても利用可能です。

## 分析とは何ですか？ {#what-are-analytics}

分析（OLAP：オンライン分析処理）は、膨大なデータセットに対する複雑な計算（集計、文字列処理、算術など）を伴うSQLクエリを指します。

トランザクショナルクエリ（OLTP：オンライントランザクション処理）は、クエリごとに数行の読み書きしか行わず、ミリ秒で完了するのに対し、分析クエリは数十億から数兆行を処理します。

多くのユースケースでは、[分析クエリは「リアルタイム」でなければなりません](https://clickhouse.com/engineering-resources/what-is-real-time-analytics)。つまり、1秒未満で結果を返す必要があります。

## 行指向ストレージと列指向ストレージの違い {#row-oriented-vs-column-oriented-storage}

このようなパフォーマンスレベルは、正しいデータ「方向性」によってのみ達成可能です。

データベースは、[行指向または列指向](https://clickhouse.com/engineering-resources/what-is-columnar-database)のいずれかでデータを保存します。

行指向データベースでは、連続するテーブル行が一つずつ順番に保存されます。このレイアウトでは、各行のカラム値が一緒に保存されるため、行の取得が迅速に行えます。

ClickHouseは列指向データベースです。このようなシステムでは、テーブルはカラムのコレクションとして保存されます。つまり、各カラムの値が一つずつ順番に保存されます。このレイアウトでは、行値の間に隙間ができるため単一の行を復元するのは難しくなりますが、フィルタや集計といったカラム操作は行指向データベースよりもはるかに高速になります。

この違いは、100百万行の[実際の匿名化されたウェブ分析データ](/getting-started/example-datasets/metrica)に対して実行された例のクエリで最もよく説明されます：

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

このクエリは、[ClickHouse SQL Playground](https://sql.clickhouse.com?query=U0VMRUNUIE1vYmlsZVBob25lTW9kZWwsIENPVU5UKCkgQVMgYyAKRlJPTSBtZXRyaWNhLmhpdHMgCldIRVJFIAogICAgICBSZWdpb25JRCA9IDIyOSAKICBBTkQgRXZlbnREYXRlID49ICcyMDEzLTA3LTAxJyAKICBBTkQgRXZlbnREYXRlIDw9ICcyMDEzLTA3LTMxJyAKICBBTkQgTW9iaWxlUGhvbmUgIT0gMCAKICBBTkQgTW9iaWxlUGhvbmVNb2RlbCBub3QgaW4gWycnLCAnaVBhZCddIApHUk9VUCBCWSBNb2JpbGVQaG9uZU1vZGVsCk9SREVSIEJZIGMgREVTQyAKTElNSVQgODs&chart=eyJ0eXBlIjoicGllIiwiY29uZmlnIjp7InhheGlzIjoiTW9iaWxlUGhvbmVNb2RlbCIsInlheGlzIjoiYyJ9fQ&run_query=true)で実行できます。100以上の既存のカラムから[ほんの数カラムを選択してフィルタリングし](https://sql.clickhouse.com/?query=U0VMRUNUIG5hbWUKRlJPTSBzeXN0ZW0uY29sdW1ucwpXSEVSRSBkYXRhYmFzZSA9ICdtZXRyaWNhJyBBTkQgdGFibGUgPSAnaGl0cyc7&tab=results&run_query=true)、ミリ秒以内に結果を返します：

<Image img={column_example} alt="列指向データベースでの例のクエリ" size="lg"/>

上の図の統計セクションで見ることができるように、クエリは100百万行を92ミリ秒で処理し、スループットは約300百万行、またはわずか7GB毎秒でした。

**行指向DBMS**

行指向データベースでは、上記のクエリは既存のカラムの中から数カラムのみを処理しますが、システムはディスクからメモリに他の既存カラムのデータを読み込む必要があります。その理由は、データが[ブロック](https://en.wikipedia.org/wiki/Block_(data_storage))と呼ばれるチャンクでディスクに保存されているためです（通常、固定サイズ、例えば4KBまたは8KB）。ブロックは、ディスクからメモリに読み込まれるデータの最小単位です。アプリケーションやデータベースがデータを要求すると、オペレーティングシステムのディスクI/Oサブシステムがディスクから必要なブロックを読み込みます。必要なブロックの一部だけが必要であっても、全ブロックがメモリに読み込まれます（これはディスクとファイルシステムの設計によるものです）：

<Image img={row_orientated} alt="行指向データベースの構造" size="lg"/>

**列指向DBMS**

各カラムの値がディスク上で一つずつ順に保存されているため、上記のクエリが実行される際に不要なデータが読み込まれません。ブロックごとのストレージとディスクからメモリへの転送は、分析クエリのデータアクセスパターンと一致しているため、クエリに必要なカラムのみがディスクから読み込まれ、未使用のデータに対する不必要なI/Oが回避されます。これは、全体の行（関係のないカラムを含む）が読み込まれる行ベースのストレージと比べて、[はるかに速い](https://benchmark.clickhouse.com/)です：

<Image img={column_orientated} alt="列指向データベースの構造" size="lg"/>

## データのレプリケーションと整合性 {#data-replication-and-integrity}

ClickHouseは、非同期のマルチマスターレプリケーション方式を使用して、データが複数のノードに冗長に保存されることを保証します。一つの使用可能なレプリカに書き込まれた後、すべての残りのレプリカはバックグラウンドでそのコピーを取得します。システムは、異なるレプリカ間で同一のデータを維持します。ほとんどの障害後の回復は自動的に、または複雑な場合には半自動的に行われます。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準および一般的なリレーショナルデータベース管理システムで見られるようなロールベースのアクセス制御の構成を可能にします。

## SQLサポート {#sql-support}

ClickHouseは、多くの場合、ANSI SQL標準と同一の[SQLに基づく宣言型クエリ言語](/sql-reference)をサポートしています。サポートされるクエリ句には、[GROUP BY](/sql-reference/statements/select/group-by)、[ORDER BY](/sql-reference/statements/select/order-by)、[FROM](/sql-reference/statements/select/from)のサブクエリ、[JOIN](/sql-reference/statements/select/join)句、[IN](/sql-reference/operators/in)演算子、[ウィンドウ関数](/sql-reference/window-functions)、スカラサブクエリが含まれます。

## おおよその計算 {#approximate-calculation}

ClickHouseは、パフォーマンスと引き換えに精度をトレードオフする方法を提供します。たとえば、いくつかの集計関数は、異なる値のカウント、中間値、および分位数を近似的に計算します。また、データのサンプルでクエリを実行して近似的な結果を迅速に計算することができます。最後に、すべてのキーに対してではなく、限られた数のキーで集計を実行できます。キーの分布がどれだけ偏っているかによって、かなり正確な結果を得ることができる可能性があり、正確な計算に比べてはるかに少ないリソースを使用します。

## 適応型結合アルゴリズム {#adaptive-join-algorithms}

ClickHouseは、結合アルゴリズムを適応的に選択します。まず迅速なハッシュ結合から始まり、大規模なテーブルが複数ある場合にはマージ結合にフォールバックします。

## 優れたクエリパフォーマンス {#superior-query-performance}

ClickHouseは、非常に高速なクエリパフォーマンスで知られています。ClickHouseがなぜそんなに速いのかについては、[ClickHouseはなぜ速いのか？](/concepts/why-clickhouse-is-so-fast.md)ガイドをご覧ください。



<!--
## OLAPとは何ですか？ {#what-is-olap}
OLAPシナリオには、大規模なデータセットに対するリアルタイムの応答が必要であり、以下の特徴を持つ複雑な分析クエリが必要です：
- データセットは膨大である可能性があり、数十億や数兆行になる
- データは多くのカラムを含むテーブルに組織されている
- 特定のクエリに対しては、数カラムだけが選択される
- 結果はミリ秒または秒で返されなければならない

## 列指向と行指向データベースの違い {#column-oriented-vs-row-oriented-databases}
行指向DBMSでは、データは行に保存され、行に関連するすべての値が物理的に隣接して保存されます。

列指向DBMSでは、データはカラムに保存され、同じカラムからの値が一緒に保存されます。

## なぜ列指向データベースはOLAPシナリオでより良いのか {#why-column-oriented-databases-work-better-in-the-olap-scenario}

列指向データベースはOLAPシナリオにより適している：ほとんどのクエリを処理する際に少なくとも100倍速いです。その理由は以下に詳しく説明されていますが、事実は視覚的に示す方が簡単です：

違いが見えますか？

この記事の残りでは、なぜ列指向データベースがこれらのシナリオに適しているか、特にClickHouseが他のこのカテゴリのデータベースよりも[優れている](https://concepts/why-clickhouse-is-so-fast/concepts/why-clickhouse-is-so-fast#storage-layer-concurrent-inserts-and-selects-are-isolated)かを説明します。

## ClickHouseはなぜそんなに速いのか？ {#why-is-clickhouse-so-fast}

ClickHouseは利用可能なすべてのシステムリソースを最大限に活用し、各分析クエリをできるだけ速く処理します。これは、分析機能とOLAPデータベースを最速にするために必要な低レベルの詳細への注意を組み合わせることによって可能になります。

このトピックについてさらに深掘りするための参考記事：
- [ClickHouseのパフォーマンス](/concepts/why-clickhouse-is-so-fast)
- [ClickHouseの特長](/about-us/distinctive-features.md)
- [FAQ: ClickHouseはなぜ这么速いのか？](/knowledgebase/why-clickhouse-is-so-fast)

## リアルタイムで分析クエリを処理する {#processing-analytical-queries-in-real-time}

行指向DBMSでは、データは以下の順序で保存されます：

| 行 | WatchID     | JavaEnable | タイトル              | GoodEvent | イベント時間           |
|-----|-------------|------------|--------------------|-----------|---------------------|
| #0 | 89354350662 | 1          | 投資家向け情報 | 1         | 2016-05-18 05:19:20 |
| #1 | 90329509958 | 0          | お問い合わせ         | 1         | 2016-05-18 08:10:20 |
| #2 | 89953706054 | 1          | ミッション            | 1         | 2016-05-18 07:38:00 |
| #N | ...           | ...          | ...                  | ...         | ...                   |

言い換えれば、行に関連するすべての値は物理的に隣接して保存されます。

行指向データベースの例として、MySQL、Postgres、MS SQL Serverがあります。

列指向DBMSでは、データは以下のように保存されます：

| 行:        | #0                 | #1                 | #2                 | #N |
|-------------|---------------------|---------------------|---------------------|-----|
| WatchID:    | 89354350662         | 90329509958         | 89953706054         | ...   |
| JavaEnable: | 1                   | 0                   | 1                   | ...   |
| タイトル:      | 投資家向け情報  | お問い合わせ          | ミッション             | ...   |
| GoodEvent:  | 1                   | 1                   | 1                   | ...   |
| イベント時間:  | 2016-05-18 05:19:20 | 2016-05-18 08:10:20 | 2016-05-18 07:38:00 | ...   |

これらの例は、データの配置順序だけを示しています。異なるカラムの値は別々に保存され、同じカラムのデータは一緒に保存されます。

列指向DBMSの例として、Vertica、Paraccel（Actian MatrixおよびAmazon Redshift）、Sybase IQ、Exasol、Infobright、InfiniDB、MonetDB（VectorWiseおよびActian Vector）、LucidDB、SAP HANA、Google Dremel、Google PowerDrill、Druid、kdb+があります。

データの保存順序は、異なるシナリオに適している場合があります。データアクセスシナリオは、どのクエリがどの頻度で、どの比率で作成されるか、各タイプのクエリに対してどれだけのデータが読み取られるか（行、列、バイト）、データの読み取りと更新の関係、データの動作サイズとその使用状況、トランザクションが使用されるかどうか、孤立性の要求、データのレプリケーションと論理的整合性の要求、各タイプのクエリに対する待ち時間とスループットに関する要求などに関連しています。

システムへの負荷が高まるほど、使用シナリオの要件に合わせてシステムをカスタマイズすることがより重要になり、このカスタマイズはより詳細になります。顕著に異なるシナリオに対して最適に suited されるシステムは存在しません。システムが広範なシナリオに適応できる場合、高負荷の下ではすべてのシナリオで同様にうまく対応できなくなるか、わずか一つか少数のシナリオでしかうまく機能しません。

### OLAPシナリオの主な特性 {#key-properties-of-olap-scenario}

- テーブルは「広い」、つまり多くのカラムを含む。
- データセットは大きく、クエリを処理する際に高いスループットが要求される（サーバーあたり数十億行毎秒）。
- カラム値は比較的小さく、数字や短い文字列（たとえば、URLごとに60バイト）。
- クエリは大量の行を抽出するが、カラムのサブセットのみ。
- 簡単なクエリの場合、待ち時間は約50ミリ秒程度で許容される。
- クエリごとに1つの大きなテーブルがある。他のテーブルはすべて小さい。
- クエリ結果は元のデータに比べてかなり小さい。言い換えれば、データがフィルタリングまたは集計され、結果が単一のサーバーのRAMに収まる。
- クエリは比較的稀であり（通常、サーバーあたり1秒につき数百のクエリ以下）、挿入は比較的大きなバッチ（> 1000行）で行われ、単一の行ではない。
- トランザクションは必要ありません。

OLAPシナリオは、他の一般的なシナリオ（OLTPやキー・バリューアクセスなど）とは非常に異なることが容易にわかります。もし適切なパフォーマンスを得たいのであれば、分析クエリの処理にOLTPやキー・バリューDBを使用することは意味がありません。たとえば、MongoDBやRedisを分析に使用しようとすると、OLAPデータベースと比較して非常に悪いパフォーマンスを受けることになります。

### 入出力 {#inputoutput}

1.  分析クエリの場合、読み取る必要のあるテーブルカラムは少数です。列指向データベースでは、必要なデータだけを読み取ることができます。たとえば、100のうち5つのカラムが必要な場合、I/Oの20倍の削減を期待できます。
2.  データはパケットで読み取られるため、圧縮が容易です。カラムのデータも圧縮が簡単です。これにより、I/O量がさらに減少します。
3.  I/Oが減少することで、より多くのデータがシステムキャッシュに収まります。

たとえば、「各広告プラットフォームのレコード数をカウントする」というクエリは、「広告プラットフォームID」カラムを1バイトの圧縮形式で読み取る必要があります。広告プラットフォームからのトラフィックがほとんど行かなかった場合、このカラムの圧縮率は最低でも10倍になると期待できます。迅速な圧縮アルゴリズムを使用する場合、データの解凍速度は毎秒数ギガバイト程度以上です。言い換えれば、このクエリは単一のサーバーで約数十億行の速度で処理されることが可能です。この速度は実際に達成されています。

### CPU {#cpu}

クエリを実行するためには多くの行を処理する必要があるため、各操作を個々の行ではなく、全体のベクトルに対してディスパッチすることや、クエリエンジンを実装してディスパッチコストをほぼゼロにすることが役立ちます。これを行わないと、一般的なディスクサブシステムでは、クエリインタープリターがCPUをスタンドバイさせてしまいます。可能な場合、データをカラムに保存し、カラムごとに処理することが合理的です。

これを行う方法は二つあります：

1.  ベクトルエンジン。すべての操作は個別の値のためではなく、ベクトルのために書かれています。これにより、操作を頻繁に呼び出す必要がなく、ディスパッチコストは無視できるものになります。操作コードには最適化された内部ループが含まれています。

2.  コード生成。クエリのために生成されたコードには、すべての間接呼び出しが含まれています。

これは行指向データベースでは行われません。なぜなら、単純なクエリを実行する際にはそれが意味を持たないからです。しかし、例外もあります。たとえば、MemSQLはSQLクエリを処理する際のレイテンシを短縮するためにコード生成を使用しています。（比較すると、分析DBMSはレイテンシでなくスループットの最適化が必要です。）

CPUの効率性のために、クエリ言語は宣言型（SQLまたはMDX）でなければならず、少なくともベクトル（J、K）である必要があります。クエリは、最適化を可能にする暗黙のループのみを含むべきです。
 -->
