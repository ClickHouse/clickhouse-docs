---
slug: /about-us/distinctive-features
sidebar_label: 'ClickHouse が特別な理由'
sidebar_position: 50
description: 'ClickHouse が他のデータベース管理システムと一線を画す特長を理解する'
title: 'ClickHouse の際立った特長'
keywords: ['compression', 'secondary-indexes','column-oriented']
doc_type: 'guide'
---



# ClickHouse の特長 {#distinctive-features-of-clickhouse}



## 真のカラム指向データベース管理システム {#true-column-oriented-database-management-system}

真のカラム指向 DBMS では、値と一緒に余分なデータは一切保存されません。これは、値の長さを示す「数値」を値の隣に保存しないようにするためには、固定長の値をサポートしている必要があることを意味します。例えば、10 億個の `UInt8` 型の値は、非圧縮で約 1 GB を消費するのが本来であり、そうでない場合は CPU 使用率に大きく影響します。データを非圧縮であっても（いかなる「余分な情報」も含めずに）コンパクトに保存することは不可欠です。というのも、伸長処理の速度（CPU 使用率）は主に非圧縮データの量に依存するからです。

これは、HBase、Bigtable、Cassandra、Hypertable のように、異なるカラムの値を別々に保存できるものの、別のユースケース向けに最適化されているため分析クエリを効率的に処理できないシステムとは対照的です。これらのシステムでは、1 秒あたり十万行程度のスループットは得られますが、1 秒あたり数億行というスループットは得られません。

最後に、ClickHouse は単一のデータベースではなく、データベース管理システムです。サーバーを再構成・再起動することなく、実行時にテーブルやデータベースを作成し、データをロードし、クエリを実行することができます。



## データ圧縮 {#data-compression}

一部のカラム指向 DBMS ではデータ圧縮を使用していないものもあります。しかし、データ圧縮は優れたパフォーマンスを達成するうえで重要な役割を果たします。

ディスク容量と CPU 消費量のトレードオフが異なる効率的な汎用圧縮コーデックに加えて、ClickHouse は特定の種類のデータ向けの[専用コーデック](/sql-reference/statements/create/table.md#specialized-codecs)を提供しており、これにより ClickHouse は時系列データベースのような、よりニッチなデータベースと十分に競合し、さらにそれらを上回る性能を発揮できます。



## データのディスク保存 {#disk-storage-of-data}

データを主キーで物理的にソートした状態に保つことで、特定の値または値の範囲に基づくデータを、数十ミリ秒以内という低レイテンシで抽出することが可能になります。SAP HANA や Google PowerDrill のような一部のカラム指向 DBMS は、メモリ上でのみ動作します。このアプローチでは、リアルタイム分析に必要な以上のハードウェア予算の確保が必要になります。

ClickHouse は通常のハードディスク上で動作するように設計されているため、1 GB あたりのデータ保存コストは低く抑えられますが、SSD や追加の RAM が利用可能な場合にはそれらも十分に活用します。



## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大規模なクエリは自然に並列実行され、現在のサーバーで利用可能な必要なリソースをすべて活用します。



## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上で挙げた列指向 DBMS のほとんどは、分散クエリ処理をサポートしていません。

ClickHouse では、データは複数のシャードに分散して配置できます。各シャードは、フォールトトレランスのために使用されるレプリカのグループとすることができます。すべてのシャードが、ユーザーからは透過的に、クエリの並列実行に利用されます。



## SQL サポート {#sql-support}

ClickHouse は、ANSI SQL 標準と高い互換性を持つ SQL ベースの[宣言型クエリ言語](/sql-reference/)をサポートしています。

サポートされているクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md) におけるサブクエリ、[JOIN](../sql-reference/statements/select/join.md) 句、[IN](../sql-reference/operators/in.md) 演算子、[ウィンドウ関数](../sql-reference/window-functions/index.md)、およびスカラーサブクエリが含まれます。

相関（依存）サブクエリは現時点ではサポートされていませんが、将来的にサポートされる可能性があります。



## ベクトル計算エンジン {#vector-engine}

データはカラムごとに保存されるだけでなく、ベクトル（カラムの一部）単位で処理することで、CPU を高効率に活用できます。



## リアルタイムなデータ挿入 {#real-time-data-updates}

ClickHouse は主キーを持つテーブルをサポートしています。主キーの範囲に対してクエリを高速に実行するために、データは MergeTree を用いて段階的にソートされます。これにより、テーブルには継続的にデータを追加できます。新しいデータを取り込む際にもロックは取得されません。



## プライマリインデックス {#primary-index}

データをプライマリキーで物理的にソートしておくことで、特定の値や値の範囲に基づいてデータを抽出する際に、数十ミリ秒かからない低レイテンシで処理できるようになります。



## セカンダリインデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouse のセカンダリインデックスは特定の行や行範囲を指すものではありません。代わりに、一部のデータパーツ内のすべての行がクエリのフィルタ条件に一致しないことを事前に判断し、それらを一切読み込まないようにします。このため、これらは[データスキップインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれます。



## オンラインクエリに適した設計 {#suitable-for-online-queries}

多くの OLAP データベース管理システムは、サブ秒レイテンシでのオンラインクエリ処理を目標としていません。他のシステムでは、レポート作成に数十秒、場合によっては数分かかることが許容されるケースもよくあります。さらに時間がかかることもあり、そのためにレポートをオフラインで準備しておく必要が生じます（事前に作成しておく、あるいは「後でもう一度アクセスしてください」と応答するなど）。

ClickHouse における「低レイテンシ」とは、ユーザーインターフェイスのページが読み込まれているまさにその瞬間に、事前に回答を準備しようとすることなく、遅延なしでクエリを処理できること、つまり *オンライン* で処理できることを意味します。



## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouse は、精度とパフォーマンスをトレードオフするためのさまざまな方法を提供します。

1.  異なる値の個数、中央値、および分位数を近似的に計算するための集約関数。
2.  データの一部（[SAMPLE](../sql-reference/statements/select/sample.md)）に基づいてクエリを実行し、近似的な結果を取得する。この場合、ディスクから読み出すデータ量は比例して少なくなります。
3.  すべてのキーではなく、ランダムに選ばれた限られた数のキーに対して集約を実行する。データ内でのキー分布に関して特定の条件が満たされている場合、より少ないリソースで十分に正確な結果を得ることができます。



## アダプティブ結合アルゴリズム {#adaptive-join-algorithm}

ClickHouse は複数テーブルを [JOIN](../sql-reference/statements/select/join.md) する際、基本的にハッシュ結合を優先しつつ、大きなテーブルが複数存在する場合にはマージ結合へフォールバックする形で、結合方法を適応的に選択します。



## データレプリケーションとデータ整合性のサポート {#data-replication-and-data-integrity-support}

ClickHouse は非同期マルチマスター型レプリケーションを使用します。利用可能な任意のレプリカに書き込まれた後、残りのすべてのレプリカはバックグラウンドでそのコピーを取得します。システムは、異なるレプリカ間でデータを同一に保ちます。ほとんどの障害からの復旧は自動的に行われ、複雑なケースでは半自動的に行われます。

詳細については、[Data replication](../engines/table-engines/mergetree-family/replication.md) セクションを参照してください。



## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouse は SQL クエリを使用したユーザーアカウント管理機能を備えており、ANSI SQL 標準や一般的なリレーショナルデータベース管理システムで利用されているものと同様の [ロールベースアクセス制御の設定](/guides/sre/user-management/index.md) を行うことができます。



## 欠点とみなされ得る機能 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  完全なトランザクション機能がない。
2.  すでに挿入されたデータを、高スループットかつ低レイテンシで更新または削除する機能がない。データのクリーンアップや変更のためのバッチ削除および更新は利用可能であり、たとえば [GDPR](https://gdpr-info.eu) に準拠する目的で利用できる。
3.  疎なインデックスにより、ClickHouse はキーによる単一行のポイントクエリの処理効率がそれほど高くない。
