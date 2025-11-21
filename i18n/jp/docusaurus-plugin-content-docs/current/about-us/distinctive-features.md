---
slug: /about-us/distinctive-features
sidebar_label: 'なぜ ClickHouse は特別なのか？'
sidebar_position: 50
description: 'ClickHouse を他のデータベース管理システムと差別化している要素を理解する'
title: 'ClickHouse の際立った特長'
keywords: ['compression', 'secondary-indexes','column-oriented']
doc_type: 'guide'
---



# ClickHouse の特長



## True column-oriented database management system {#true-column-oriented-database-management-system}

真の列指向DBMSでは、値と共に余分なデータは保存されません。これは、値の隣に長さを示す「数値」を保存することを避けるため、固定長の値をサポートする必要があることを意味します。例えば、10億個のUInt8型の値は、非圧縮状態で約1GBを消費する必要があり、そうでなければCPU使用率に大きな影響を与えます。解凍速度(CPU使用率)は主に非圧縮データの量に依存するため、非圧縮時でもデータをコンパクトに(「ゴミ」なしで)保存することが不可欠です。

これは、異なる列の値を個別に保存できるものの、HBase、Bigtable、Cassandra、Hypertableなど、他のシナリオ向けに最適化されているため分析クエリを効果的に処理できないシステムとは対照的です。これらのシステムでは、1秒あたり約10万行のスループットは得られますが、1秒あたり数億行には到達しません。

最後に、ClickHouseは単一のデータベースではなく、データベース管理システムです。サーバーの再設定や再起動なしに、実行時にテーブルやデータベースを作成し、データをロードし、クエリを実行することができます。


## データ圧縮 {#data-compression}

一部のカラム指向DBMSはデータ圧縮を使用していません。しかし、データ圧縮は優れたパフォーマンスを実現する上で重要な役割を果たします。

ディスク容量とCPU消費量の間で異なるトレードオフを持つ効率的な汎用圧縮コーデックに加えて、ClickHouseは特定の種類のデータ向けに[特殊化されたコーデック](/sql-reference/statements/create/table.md#specialized-codecs)を提供しており、これによりClickHouseは時系列データベースのようなニッチなデータベースと競合し、それらを上回る性能を発揮することができます。


## データのディスク保存 {#disk-storage-of-data}

プライマリキーによってデータを物理的にソート済みの状態で保持することで、特定の値や値の範囲に基づいたデータ抽出を数十ミリ秒未満の低レイテンシで実行できます。SAP HANAやGoogle PowerDrillなどの一部のカラム指向DBMSは、RAM上でのみ動作可能です。このアプローチでは、リアルタイム分析に必要な規模を超える大きなハードウェア予算の確保が求められます。

ClickHouseは通常のハードディスクドライブ上で動作するように設計されているため、データストレージのGB単価を低く抑えることができますが、SSDや追加のRAMが利用可能な場合はそれらも完全に活用されます。


## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大規模なクエリは自動的に並列化され、現在のサーバーで利用可能なリソースを最大限に活用します。


## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上記で言及したカラム型DBMSのほとんどは、分散クエリ処理に対応していません。

ClickHouseでは、データを異なるシャードに配置できます。各シャードは、耐障害性のために使用されるレプリカのグループにすることができます。すべてのシャードは、ユーザーに対して透過的に並列でクエリを実行するために使用されます。


## SQLサポート {#sql-support}

ClickHouseは、ANSI SQL標準とほぼ互換性のあるSQLベースの[宣言型クエリ言語](/sql-reference/)をサポートしています。

サポートされるクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)内のサブクエリ、[JOIN](../sql-reference/statements/select/join.md)句、[IN](../sql-reference/operators/in.md)演算子、[ウィンドウ関数](../sql-reference/window-functions/index.md)、スカラーサブクエリが含まれます。

相関サブクエリ(依存サブクエリ)は現時点ではサポートされていませんが、将来的に利用可能になる可能性があります。


## ベクトル計算エンジン {#vector-engine}

データはカラム単位で保存されるだけでなく、ベクトル(カラムの一部)単位で処理されるため、高いCPU効率を実現します。


## リアルタイムデータ挿入 {#real-time-data-updates}

ClickHouseは主キーを持つテーブルをサポートしています。主キーの範囲に対するクエリを高速に実行するため、データはマージツリーを使用して段階的にソートされます。このため、テーブルへのデータ追加を継続的に行うことができます。新しいデータの取り込み時にロックは発生しません。


## プライマリインデックス {#primary-index}

プライマリキーによってデータが物理的にソートされているため、特定の値や値の範囲に基づいたデータ抽出を、数十ミリ秒未満の低レイテンシで実行できます。


## セカンダリインデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouseのセカンダリインデックスは特定の行や行範囲を指し示すものではありません。その代わり、特定のデータパーツ内のすべての行がクエリのフィルタリング条件に一致しないことを事前にデータベースが認識し、それらを一切読み取らないようにします。このため、これらは[データスキッピングインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれています。


## オンラインクエリに適している {#suitable-for-online-queries}

ほとんどのOLAPデータベース管理システムは、サブ秒のレイテンシでオンラインクエリを実行することを目標としていません。他のシステムでは、数十秒から数分のレポート作成時間が許容範囲とされることが一般的です。さらに時間がかかる場合もあり、その結果、システムはオフラインでレポートを準備せざるを得なくなります(事前に準備するか、「後でもう一度お越しください」と応答することで対応します)。

ClickHouseにおける「低レイテンシ」とは、ユーザーインターフェースページの読み込み時に、遅延なく、事前に回答を準備することなく、リアルタイムでクエリを処理できることを意味します。言い換えれば、_オンライン_で処理されるということです。


## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouseは、精度とパフォーマンスをトレードオフするさまざまな方法を提供します：

1.  個別値の数、中央値、分位数の近似計算のための集約関数。
2.  データの一部（[SAMPLE](../sql-reference/statements/select/sample.md)）に基づいてクエリを実行し、近似結果を取得します。この場合、ディスクから取得されるデータ量は比例して少なくなります。
3.  すべてのキーではなく、限られた数のランダムなキーに対して集約を実行します。データ内のキー分布に関する特定の条件下では、より少ないリソースで十分に正確な結果が得られます。


## 適応的結合アルゴリズム {#adaptive-join-algorithm}

ClickHouseは、複数のテーブルを[JOIN](../sql-reference/statements/select/join.md)する際の方法を適応的に選択します。ハッシュ結合を優先し、複数の大規模テーブルが存在する場合にはマージ結合にフォールバックします。


## データレプリケーションとデータ整合性のサポート {#data-replication-and-data-integrity-support}

ClickHouseは非同期マルチマスターレプリケーションを使用します。利用可能な任意のレプリカへの書き込み後、残りのすべてのレプリカはバックグラウンドでそのコピーを取得します。システムは異なるレプリカ間で同一のデータを維持します。ほとんどの障害からの復旧は自動的に実行され、複雑なケースでは半自動的に実行されます。

詳細については、[データレプリケーション](../engines/table-engines/mergetree-family/replication.md)のセクションを参照してください。


## ロールベースアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装しており、ANSI SQL標準や主要なリレーショナルデータベース管理システムと同様の[ロールベースアクセス制御の設定](/guides/sre/user-management/index.md)をサポートしています。


## 欠点と見なされる可能性のある機能 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  完全なトランザクション機能がありません。
2.  既に挿入されたデータを高速かつ低レイテンシで変更または削除する機能がありません。ただし、データのクリーンアップや変更のためのバッチ削除およびバッチ更新は利用可能です。例えば、[GDPR](https://gdpr-info.eu)への準拠のために使用できます。
3.  スパースインデックスを採用しているため、ClickHouseはキーによる単一行の取得を行うポイントクエリには適していません。
