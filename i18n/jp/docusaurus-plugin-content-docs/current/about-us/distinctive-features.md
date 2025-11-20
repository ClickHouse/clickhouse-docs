---
slug: /about-us/distinctive-features
sidebar_label: 'なぜ ClickHouse はユニークなのか？'
sidebar_position: 50
description: 'ClickHouse を他のデータベース管理システムと差別化している要素を理解する'
title: 'ClickHouse の際立った特徴'
keywords: ['compression', 'secondary-indexes','column-oriented']
doc_type: 'guide'
---



# ClickHouse の特徴



## 真のカラム指向データベース管理システム {#true-column-oriented-database-management-system}

真のカラム指向DBMSでは、値と共に余分なデータは保存されません。これは、値の横に長さを示す「数値」を保存することを避けるため、固定長の値をサポートする必要があることを意味します。例えば、10億個のUInt8型の値は、非圧縮時に約1GBを消費する必要があり、そうでなければCPU使用率に大きな影響を与えます。非圧縮時でもデータをコンパクトに（「ゴミ」なしで）保存することが不可欠です。なぜなら、解凍速度（CPU使用率）は主に非圧縮データの量に依存するためです。

これは、異なるカラムの値を個別に保存できるものの、HBase、Bigtable、Cassandra、Hypertableなど、他のシナリオ向けに最適化されているため分析クエリを効果的に処理できないシステムとは対照的です。これらのシステムでは、1秒あたり約10万行のスループットは得られますが、1秒あたり数億行のスループットは得られません。

最後に、ClickHouseはデータベース管理システムであり、単一のデータベースではありません。サーバーの再設定や再起動なしに、実行時にテーブルやデータベースを作成し、データをロードし、クエリを実行することができます。


## データ圧縮 {#data-compression}

一部のカラム指向DBMSではデータ圧縮を使用していません。しかし、データ圧縮は優れたパフォーマンスを実現する上で重要な役割を果たします。

ClickHouseは、ディスク容量とCPU消費量の間で異なるトレードオフを持つ効率的な汎用圧縮コーデックに加えて、特定の種類のデータ向けに[特殊なコーデック](/sql-reference/statements/create/table.md#specialized-codecs)を提供しています。これにより、ClickHouseは時系列データベースのようなニッチなデータベースと競合し、それらを上回るパフォーマンスを発揮することができます。


## データのディスクストレージ {#disk-storage-of-data}

プライマリキーによってデータを物理的にソートして保持することで、特定の値や値の範囲に基づいて数十ミリ秒未満の低レイテンシでデータを抽出することが可能になります。SAP HANAやGoogle PowerDrillなどの一部のカラム指向DBMSは、RAM上でのみ動作します。このアプローチでは、リアルタイム分析に必要以上の大規模なハードウェア予算が必要となります。

ClickHouseは通常のハードドライブ上で動作するように設計されているため、データストレージのGB単価を低く抑えることができますが、利用可能な場合はSSDや追加のRAMも完全に活用されます。


## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大規模なクエリは自動的に並列化され、現在のサーバーで利用可能なリソースを最大限に活用します。


## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上記で言及したカラム型DBMSのほとんどは、分散クエリ処理に対応していません。

ClickHouseでは、データを異なるシャードに配置できます。各シャードは、耐障害性のために使用されるレプリカのグループにすることができます。すべてのシャードがクエリの並列実行に使用され、この処理はユーザーに対して透過的に行われます。


## SQLサポート {#sql-support}

ClickHouseは、ANSI SQL標準とほぼ互換性のあるSQLベースの[宣言型クエリ言語](/sql-reference/)をサポートしています。

サポートされるクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)句内のサブクエリ、[JOIN](../sql-reference/statements/select/join.md)句、[IN](../sql-reference/operators/in.md)演算子、[ウィンドウ関数](../sql-reference/window-functions/index.md)、スカラーサブクエリが含まれます。

相関(依存)サブクエリは本ドキュメント執筆時点ではサポートされていませんが、将来的に利用可能になる可能性があります。


## ベクトル計算エンジン {#vector-engine}

データはカラム単位で保存されるだけでなく、ベクトル(カラムの一部分)単位で処理されるため、高いCPU効率を実現します。


## リアルタイムデータ挿入 {#real-time-data-updates}

ClickHouseはプライマリキーを持つテーブルをサポートしています。プライマリキーの範囲に対するクエリを高速に実行するため、データはマージツリーを使用して増分的にソートされます。これにより、テーブルへのデータ追加を継続的に行うことができます。新しいデータの取り込み時にロックは発生しません。


## プライマリインデックス {#primary-index}

プライマリキーによってデータが物理的にソートされているため、特定の値や値の範囲に基づいたデータ抽出を、数十ミリ秒未満の低レイテンシで実行できます。


## セカンダリインデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouseのセカンダリインデックスは特定の行や行範囲を指し示すものではありません。その代わり、特定のデータパート内のすべての行がクエリのフィルタリング条件に一致しないことを事前にデータベースが判断し、それらを一切読み取らないようにします。このため、これらは[データスキッピングインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれています。


## オンラインクエリに適している {#suitable-for-online-queries}

多くのOLAPデータベース管理システムは、サブ秒のレイテンシでオンラインクエリを実行することを目標としていません。他のシステムでは、数十秒から数分のレポート作成時間が許容範囲とされることがよくあります。さらに時間がかかる場合もあり、その結果、システムはレポートをオフラインで準備する必要があります(事前に準備するか、「後でもう一度お試しください」と応答することで対応します)。

ClickHouseにおける「低レイテンシ」とは、クエリが遅延なく処理され、事前に回答を準備することなく、ユーザーインターフェースページの読み込み時にリアルタイムで処理されることを意味します。つまり、_オンライン_で処理されるということです。


## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouseは、精度とパフォーマンスをトレードオフするさまざまな方法を提供します：

1.  個別値の数、中央値、分位数を近似計算するための集約関数。
2.  データの一部（[SAMPLE](../sql-reference/statements/select/sample.md)）に基づいてクエリを実行し、近似結果を取得します。この場合、ディスクから取得されるデータ量が比例的に削減されます。
3.  すべてのキーではなく、限定された数のランダムなキーに対して集約を実行します。データ内のキー分布が特定の条件を満たす場合、より少ないリソースで十分な精度の結果が得られます。


## 適応的結合アルゴリズム {#adaptive-join-algorithm}

ClickHouseは複数のテーブルを[JOIN](../sql-reference/statements/select/join.md)する際の方法を適応的に選択し、ハッシュ結合を優先しますが、複数の大きなテーブルが存在する場合はマージ結合にフォールバックします。


## データレプリケーションとデータ整合性のサポート {#data-replication-and-data-integrity-support}

ClickHouseは非同期マルチマスターレプリケーションを使用します。利用可能な任意のレプリカへの書き込み後、残りのすべてのレプリカはバックグラウンドでそのコピーを取得します。システムは異なるレプリカ間で同一のデータを維持します。ほとんどの障害からの復旧は自動的に実行され、複雑なケースでは半自動的に実行されます。

詳細については、[データレプリケーション](../engines/table-engines/mergetree-family/replication.md)のセクションを参照してください。


## ロールベースアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリによるユーザーアカウント管理を実装しており、ANSI SQL標準や主要なリレーショナルデータベース管理システムと同様の[ロールベースアクセス制御の設定](/guides/sre/user-management/index.md)をサポートしています。


## 欠点と見なされる可能性のある機能 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  完全なトランザクション機能がありません。
2.  既に挿入されたデータを高速かつ低レイテンシで変更または削除する機能がありません。ただし、[GDPR](https://gdpr-info.eu)への準拠などのために、データのクリーンアップや変更を行うためのバッチ削除およびバッチ更新は利用可能です。
3.  スパースインデックスのため、ClickHouseはキーによる単一行の取得を行うポイントクエリには効率的ではありません。
