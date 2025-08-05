---
slug: '/about-us/distinctive-features'
sidebar_label: 'ClickHouseのユニークさ'
sidebar_position: 50
description: '他のデータベース管理システムとは一線を画すClickHouseの特徴を理解する'
title: 'ClickHouseの特長'
---




# ClickHouseの特長

## 真の列指向データベース管理システム {#true-column-oriented-database-management-system}

真の列指向DBMSでは、値と一緒に余分なデータが保存されません。これは、定常長の値をサポートする必要があることを意味し、値の隣にその長さの「数」を保存しないようにします。例えば、10億のUInt8型の値は、圧縮されていない状態で約1GBを消費するべきであり、そうでないとCPUの使用に強く影響します。圧縮されていないデータのボリュームに依存しているため、データをコンパクトに（「ゴミ」なしで）保存することが重要です。

これは、異なるカラムの値を別々に保存できるが、HBase、Bigtable、Cassandra、Hypertableなど、他のシナリオの最適化により効果的に分析クエリを処理できないシステムとは対照的です。これらのシステムでは、毎秒約十万行のスループットが得られますが、毎秒数億行にはなりません。

最後に、ClickHouseはデータベース管理システムであり、単一のデータベースではありません。テーブルやデータベースを実行時に作成し、データをロードし、サーバーを再構成または再起動することなくクエリを実行できます。

## データ圧縮 {#data-compression}

一部の列指向DBMSはデータ圧縮を使用しません。しかし、データ圧縮は優れたパフォーマンスを達成する上で重要な役割を果たします。

ディスクスペースとCPU消費の間で異なるトレードオフを持つ効率的な一般目的の圧縮コーデックに加えて、ClickHouseは特定の種類のデータ向けの[特化型コーデック](/sql-reference/statements/create/table.md#specialized-codecs)を提供しており、これによりClickHouseはニッチなデータベース、例えば時系列データベースに対抗し、優れたパフォーマンスを発揮します。

## ディスク上のデータストレージ {#disk-storage-of-data}

主キーによって物理的にデータをソートすることで、特定の値または値の範囲に基づいて低レイテンシで、数十ミリ秒未満でデータを抽出できるようになります。一部の列指向DBMS、例えばSAP HANAやGoogle PowerDrillは、RAM内でのみ動作することができます。このアプローチは、リアルタイム分析のために必要なハードウェアの予算を超える要求を必要とします。

ClickHouseは通常のハードドライブで動作するように設計されており、これによりデータストレージあたりのGBのコストが低くなりますが、SSDや追加のRAMもあれば完全に活用されます。

## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大規模なクエリは自然に並列化され、現在のサーバー上で利用可能なすべてのリソースが使用されます。

## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上記の列指向DBMSのほとんどは、分散クエリ処理のサポートを持っていません。

ClickHouseでは、データは異なるシャードに存在できます。各シャードは、フォールトトレランスのために使用されるレプリカのグループである場合があります。すべてのシャードは、ユーザーに透過的にクエリを並列で実行するために使用されます。

## SQLサポート {#sql-support}

ClickHouseは、ANSI SQL標準とほぼ互換性のある[SQL言語](/sql-reference/)をサポートしています。

サポートされているクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)のサブクエリ、[JOIN](../sql-reference/statements/select/join.md)句、[IN](../sql-reference/operators/in.md)オペレーター、[ウィンドウ関数](../sql-reference/window-functions/index.md)、およびスカラーサブクエリが含まれます。

依存サブクエリは執筆時点ではサポートされていませんが、将来的に利用可能になる可能性があります。

## ベクトル計算エンジン {#vector-engine}

データはカラムによってだけでなく、ベクトル（カラムの部分）によって処理され、これにより高いCPU効率が達成されます。

## リアルタイムデータ挿入 {#real-time-data-updates}

ClickHouseは主キーを持つテーブルをサポートしています。主キーの範囲に対してクエリを迅速に実行するために、データはマージツリーを使用してインクリメンタルにソートされます。これにより、データをテーブルに継続的に追加できます。新しいデータを取り込む際にロックはかかりません。

## 主インデックス {#primary-index}

主キーによって物理的にデータがソートされることにより、特定の値や値の範囲に基づいて低レイテンシで、数十ミリ秒未満でデータを抽出することが可能になります。

## 副インデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouseの副インデックスは特定の行や行の範囲を指しません。その代わり、データの一部がクエリのフィルタ条件に一致しないすべての行を事前に知ることができるため、それらを全く読み込まず、これにより[データスキッピングインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれます。

## オンラインクエリに適している {#suitable-for-online-queries}

ほとんどのOLAPデータベース管理システムは、サブ秒レイテンシでのオンラインクエリを目指していません。代替システムでは、数十秒または数分のレポート構築時間が許容されることがよくあります。時には、さらに多くの時間がかかり、システムがオフラインでレポートを準備しなければならないことがあります（事前にまたは「後で戻ってくるように」と応答する形で）。

ClickHouseでは、「低レイテンシ」とは、クエリが遅延なく処理され、ユーザーインターフェースページが読み込み中のその瞬間に応答を事前に準備しようとせずに行われることを意味します。言い換えれば、オンラインです。

## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouseは、パフォーマンスのために精度を交換するためのさまざまな方法を提供します：

1.  異なる値、中央値、パーセンタイルの数の近似計算のための集約関数。
2.  データの部分([SAMPLE](../sql-reference/statements/select/sample.md))に基づいてクエリを実行し、近似結果を得る。この場合、ディスクから取得するデータ量が比例的に少なくなります。
3.  すべてのキーの代わりに、限られた数のランダムキーに対して集約を実行します。データ内のキー分布に関する特定の条件下では、これにより合理的に正確な結果が得られ、より少ないリソースを使用します。

## 適応型結合アルゴリズム {#adaptive-join-algorithm}

ClickHouseは、複数のテーブルを[JOIN](../sql-reference/statements/select/join.md)する方法を適応的に選択し、ハッシュ結合アルゴリズムを優先し、大きなテーブルが1つ以上ある場合はマージ結合アルゴリズムにフォールバックします。

## データレプリケーションとデータ整合性のサポート {#data-replication-and-data-integrity-support}

ClickHouseは非同期のマルチマスターレプリケーションを使用しています。すべての利用可能なレプリカに書き込まれた後、残りのレプリカはバックグラウンドでそのコピーを取得します。システムは異なるレプリカ間で同一のデータを維持します。ほとんどの障害後の回復は自動的に、または複雑なケースでは半自動的に行われます。

詳細については、[データレプリケーション](../engines/table-engines/mergetree-family/replication.md)のセクションを参照してください。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準や一般的なリレーショナルデータベース管理システムで見られるような[ロールベースのアクセス制御の設定](/guides/sre/user-management/index.md)を可能にします。

## 欠点と見なされる可能性のある機能 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  完全なトランザクションがない。
2.  高い速度と低レイテンシで既に挿入されたデータを変更または削除する機能が欠如している。データをクリーンアップまたは修正するためのバッチ削除や更新が利用可能であり、例えば、[GDPR](https://gdpr-info.eu)に準拠するためにそれが必要です。
3.  スパースインデックスにより、ClickHouseはキーによって単一の行を取得するポイントクエリに対してそれほど効率的ではありません。
