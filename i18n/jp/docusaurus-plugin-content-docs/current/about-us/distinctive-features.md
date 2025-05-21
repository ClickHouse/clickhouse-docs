---
slug: '/about-us/distinctive-features'
sidebar_label: 'ClickHouseのユニークな点は何ですか？'
sidebar_position: 50
description: 'ClickHouseが他のデータベース管理システムと異なる点を理解する'
title: 'ClickHouseの特徴'
---


# ClickHouseの特徴

## 真の列指向データベース管理システム {#true-column-oriented-database-management-system}

真の列指向DBMSでは、値とともに追加のデータが保存されることはありません。これは、定数長の値をサポートし、値の隣にその長さの「数」を保存しなくて済むことを意味します。例えば、10億のUInt8型の値は、圧縮なしで約1GBを消費する必要があり、これがCPUの使用に大きく影響します。データの圧縮されていない状態でのストレージのコンパクトさ（「ガーベジ」がないこと）が重要であり、圧縮速度（CPU使用量）は主に圧縮されていないデータのボリュームに依存します。

これは、異なるカラムの値を別々に保存できるが、HBase、Bigtable、Cassandra、Hypertableなどの他のシナリオ向けに最適化されているため、分析クエリを効果的に処理できないシステムとは対照的です。これらのシステムでは、1秒間に数十万行のスループットが得られますが、数億行のスループットには至りません。

最後に、ClickHouseは単一のデータベースではなく、データベース管理システムです。テーブルとデータベースをランタイムで作成し、データをロードし、サーバーを再構成したり再起動したりせずにクエリを実行することができます。

## データ圧縮 {#data-compression}

いくつかの列指向DBMSはデータ圧縮を使用しません。しかし、データ圧縮は卓越したパフォーマンスを達成する上で重要な役割を果たします。

ディスクスペースとCPU消費のトレードオフを持つ効率的な一般用途の圧縮コーデックに加えて、ClickHouseは特定のデータの種類に特化した[専門コード](https://clickhouse.com)を提供しており、これによりClickHouseはニッチなデータベース、たとえば時系列データベースと競争し、優れています。

## データのディスクストレージ {#disk-storage-of-data}

主キーによって物理的にデータをソートしておくことで、特定の値や値の範囲に基づいて低遅延でデータを抽出することが可能になります。SAP HANAやGoogle PowerDrillのような一部の列指向DBMSは、RAM内でのみ動作することができます。このアプローチは、リアルタイム分析に必要以上の大きなハードウェア予算の配分を必要とします。

ClickHouseは通常のハードドライブで動作するように設計されているため、データストレージあたりのコストは低いですが、あればSSDや追加のRAMもフルに使用されます。

## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大きなクエリは自然に並列化され、現在のサーバーで利用可能なすべてのリソースを使用します。

## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上記のほとんどの列指向DBMSは、分散クエリ処理のサポートがありません。

ClickHouseでは、データが異なるシャードに存在することができます。各シャードは、フォールトトレランスのために使用されるレプリカのグループです。すべてのシャードは、ユーザーに透過的に並列でクエリを実行するために使用されます。

## SQLサポート {#sql-support}

ClickHouseはANSI SQL標準とほぼ互換性のある[SQL言語](https://clickhouse.com/sql-reference/)をサポートしています。

サポートされているクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)のサブクエリ、[JOIN](../sql-reference/statements/select/join.md)句、[IN](../sql-reference/operators/in.md)演算子、[ウィンドウ関数](../sql-reference/window-functions/index.md)、およびスカラーサブクエリが含まれます。

関連（依存）サブクエリは、執筆時点ではサポートされていませんが、将来利用可能になる可能性があります。

## ベクタ計算エンジン {#vector-engine}

データはカラムによって保存されるだけでなく、ベクター（カラムの部分）によって処理され、CPU効率が高まります。

## リアルタイムデータ挿入 {#real-time-data-updates}

ClickHouseは主キーを持つテーブルをサポートしています。主キーの範囲に対してクエリを迅速に実行するために、データはマージツリーを使用して増分的にソートされます。このため、データはテーブルに継続的に追加できます。新しいデータが取り込まれるときにロックはかかりません。

## 主インデックス {#primary-index}

主キーによって物理的にデータをソートしておくことで、特定の値や値の範囲に基づいて低遅延でデータを抽出することが可能になります。

## セカンダリインデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouseのセカンダリインデックスは特定の行や行の範囲を指しません。代わりに、データベースがいくつかのデータパーツ内のすべての行がクエリのフィルタ条件に一致しないことを事前に知ることができ、まったく読み込まないようにします。したがって、これらは[データスキッピングインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれます。

## オンラインクエリに適している {#suitable-for-online-queries}

ほとんどのOLAPデータベース管理システムは、サブ秒遅延のあるオンラインクエリを目指していません。代替システムでは、報告作成時間が数十秒または数分と見なされることがよくあります。時にはもっと時間がかかり、システムがオフラインでレポートを準備させることを余儀なくされます（事前に、または「後で戻ってきて」と応答する形で）。

ClickHouseにおける「低遅延」とは、クエリを遅延なしに処理でき、ユーザーインターフェースページがロードされる瞬間に応答を準備することなく処理されることを意味します。言い換えれば、オンラインです。

## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouseは、パフォーマンスのために精度をトレードオフするさまざまな方法を提供しています。

1.  異なる値の数、中央値、分位数の近似計算のための集約関数。
2.  データの一部（[SAMPLE](../sql-reference/statements/select/sample.md)）に基づいてクエリを実行し、近似結果を取得します。この場合、ディスクから取得されるデータは相対的に少なくなります。
3.  すべてのキーの代わりに、限られた数のランダムキーに対して集約を実行します。これは、データ内のキー分布の特定の条件の下で、リソースを減らしながら妥当な正確さの結果を提供します。

## 適応型ジョインアルゴリズム {#adaptive-join-algorithm}

ClickHouseは複数のテーブルを[JOIN](../sql-reference/statements/select/join.md)する方法を適応的に選択し、大きなテーブルが複数ある場合はマージジョインアルゴリズムにフォールバックします。

## データのレプリケーションとデータ整合性サポート {#data-replication-and-data-integrity-support}

ClickHouseは非同期のマルチマスターレプリケーションを使用します。利用可能なレプリカに書き込まれた後、残りのすべてのレプリカはバックグラウンドでコピーを取得します。システムは異なるレプリカ上で同一のデータを維持します。ほとんどの障害後の回復は自動的に、または複雑なケースでは半自動的に行われます。

詳細については、[データレプリケーション](../engines/table-engines/mergetree-family/replication.md)のセクションを参照してください。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseはSQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準や一般的なリレーショナルデータベース管理システムに見られるような[ロールベースのアクセス制御の設定](../guides/sre/user-management/index.md)を許可します。

## ディスアドバンテージと見なされる可能性のある特徴 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  完全なトランザクションの不在。
2.  高速かつ低遅延で既に挿入されたデータを変更または削除する能力の欠如。データのクリーンアップや変更のためにバッチ削除と更新が利用可能ですが、例えば[GDPR](https://gdpr-info.eu)に準拠するためのものです。
3.  スパースインデックスにより、ClickHouseはキーによって単一行を取得するポイントクエリにはそれほど効率的ではありません。
