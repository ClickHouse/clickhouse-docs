---
slug: /about-us/distinctive-features
sidebar_label: Why is ClickHouse unique?
sidebar_position: 50
description: Understand what makes ClickHouse stand apart from other database management systems
---


# ClickHouseの特異な機能

## 真の列指向データベース管理システム {#true-column-oriented-database-management-system}

真の列指向DBMSでは、値と一緒に余計なデータが保存されることはありません。これは、常に長さの異なる値を保存する必要がなく、値と一緒にその長さの「数」を保存する必要がないことを意味します。例えば、十億のUInt8型の値は、圧縮されていない状態で約1GBを消費する必要があり、さもなくばCPUの使用量に強く影響を与えます。データの圧縮解除の速度（CPU使用量）は、主に圧縮されていないデータの量に依存するため、圧縮されていなくてもデータをCompactに保存することが重要です。

これは、異なるカラムの値を個別に保存できるが、HBase、Bigtable、Cassandra、Hypertableなど他のシナリオに最適化されているため、効果的に分析クエリを処理できないシステムとは対照的です。これらのシステムでは、1秒あたり約十万行のスループットを得ることができるが、数億行のスループットは得られません。

最終的に、ClickHouseは単一のデータベースではなく、データベース管理システムです。これにより、テーブルとデータベースをランタイムで作成し、データをロードし、サーバーを再構成したり再起動したりすることなくクエリを実行できます。

## データ圧縮 {#data-compression}

いくつかの列指向DBMSはデータ圧縮を使用しません。しかし、データ圧縮は優れたパフォーマンスを達成するために重要な役割を果たします。

ディスクスペースとCPU消費の間で異なるトレードオフを持つ効率的な一般用途の圧縮コーデックに加えて、ClickHouseは特定のタイプのデータのための[特殊なコーデック](/sql-reference/statements/create/table.md#specialized-codecs)を提供し、これによりClickHouseは時間系列データベースなどのニッチなデータベースと競争し、またそれを上回ることができます。

## データのディスクストレージ {#disk-storage-of-data}

データを主キーで物理的にソートして保持することで、特定の値または値の範囲に基づいてデータを低レイテンシで抽出することができます。SAP HANAやGoogle PowerDrillなどのいくつかの列指向DBMSは、RAMでのみ動作することができます。このアプローチは、リアルタイム分析のためには必要以上に大きなハードウェア予算を要求します。

ClickHouseは通常のハードドライブで動作するように設計されており、これによりデータストレージの1GBあたりのコストは低くなりますが、SSDや追加のRAMも利用できればフルで使用されます。

## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大きなクエリは自然に並列化され、現在のサーバー上で利用可能なすべてのリソースを使用します。

## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上記の列指向DBMSのほとんどは、分散クエリ処理のサポートがありません。

ClickHouseでは、データが異なるシャードに存在することがあります。各シャードは障害耐性のために使用されるレプリカのグループとなることができます。すべてのシャードは、ユーザーに対して透明にクエリを並列に実行するために使用されます。

## SQLサポート {#sql-support}

ClickHouseは、ANSI SQL標準とほぼ互換性のある[SQL言語](/sql-reference/)をサポートしています。

サポートされるクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)におけるサブクエリ、[JOIN](../sql-reference/statements/select/join.md)句、[IN](../sql-reference/operators/in.md)演算子、[ウィンドウ関数](../sql-reference/window-functions/index.md)及びスカラサブクエリが含まれます。

執筆時点では相関（依存）サブクエリはサポートされていませんが、将来的には利用可能になるかもしれません。

## ベクトル計算エンジン {#vector-engine}

データは列ごとに保存されるだけでなく、ベクトル（カラムの部分）によって処理されるため、高いCPU効率を達成できます。

## リアルタイムデータ挿入 {#real-time-data-updates}

ClickHouseは主キーを持つテーブルをサポートしています。主キーの範囲に対して迅速にクエリを実行するために、データはマージツリーを使用して増分的にソートされます。これにより、データはテーブルに継続的に追加されることができます。新しいデータが取り込まれるときにロックはかかりません。

## 主インデックス {#primary-index}

データを主キーで物理的にソートして保持することで、特定の値または値の範囲に基づいてデータを低レイテンシで抽出することができます。

## 副インデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouseの副インデックスは特定の行や行範囲を指し示すのではなく、データベースが事前に一部のデータパーツにおけるすべての行がクエリのフィルタ条件に一致しないことを知り、まったく読み込まないことを可能にします。これらは[データスキッピングインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれます。

## オンラインクエリに適した {#suitable-for-online-queries}

ほとんどのOLAPデータベース管理システムは、サブ秒のレイテンシを持つオンラインクエリを目指していません。代替システムでは、数十秒または数分のレポート作成時間がしばしば許容されます。時にはさらに時間がかかり、システムがオフラインでレポートを準備することを余儀なくされます（事前に準備するか、「後で戻ってきてください」と応答します）。

ClickHouseでは「低レイテンシ」とは、クエリが遅延なく処理され、事前に回答を準備しようとすることなく、ユーザーインターフェイスページが読み込まれているその瞬間に処理できることを意味します。言い換えれば、オンラインです。

## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouseは、パフォーマンスのために精度をトレードオフするさまざまな方法を提供します：

1. 明確に値の数、中央値、分位数の近似計算のための集約関数。
2. データの一部（[SAMPLE](../sql-reference/statements/select/sample.md)）に基づいてクエリを実行し、近似結果を得る。この場合、ディスクから取得されるデータはプロポーショナルに少なくなります。
3. すべてのキーを対象にするのではなく、限られた数のランダムなキーに対して集約を実行します。データのキー分布の特定の条件下では、これにより合理的に正確な結果を得られ、リソース使用量を減らすことができます。

## 適応的結合アルゴリズム {#adaptive-join-algorithm}

ClickHouseは、複数のテーブルを[JOIN](../sql-reference/statements/select/join.md)する方法を適応的に選択し、ハッシュ結合アルゴリズムを優先し、大きなテーブルが複数存在する場合にはマージ結合アルゴリズムにフォールバックします。

## データレプリケーションとデータ整合性サポート {#data-replication-and-data-integrity-support}

ClickHouseは非同期のマルチマスターレプリケーションを使用します。利用可能なレプリカのいずれかに書き込まれた後、残りのレプリカはバックグラウンドで自分のコピーを取得します。システムは異なるレプリカで同一のデータを維持します。ほとんどの障害からの復旧は自動的に、または複雑なケースでは半自動的に行われます。

詳細については、[データレプリケーション](../engines/table-engines/mergetree-family/replication.md)セクションを参照してください。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseはSQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準や一般的なリレーショナルデータベース管理システムに見られるような[ロールベースのアクセス制御設定](/guides/sre/user-management/index.md)を提供します。

## 欠点と見なされる可能性のある機能 {#clickhouse-features-that-can-be-considered-disadvantages}

1. 完全なトランザクションがありません。
2. 高速かつ低レイテンシで既に挿入されたデータを変更または削除する能力が不足しています。たとえば、[GDPR](https://gdpr-info.eu)に準拠するためにデータをクリーンアップまたは修正するためのバッチ削除や更新があります。
3. スパースインデックスにより、ClickHouseはキーによって単一の行を取得するポイントクエリに対してそれほど効率的ではありません。
