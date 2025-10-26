---
'slug': '/about-us/distinctive-features'
'sidebar_label': 'ClickHouseがユニークな理由'
'sidebar_position': 50
'description': 'ClickHouseが他の DATABASE 管理システムとどのように異なるのかを理解する'
'title': 'ClickHouseの特徴'
'keywords':
- 'compression'
- 'secondary-indexes'
- 'column-oriented'
'doc_type': 'guide'
---


# ClickHouseの特徴

## 真の列指向データベース管理システム {#true-column-oriented-database-management-system}

真の列指向DBMSでは、値に追加のデータは保存されません。これは、定長の値がサポートされなければならず、値の隣にその長さの「数」を保存しないことを意味します。例えば、10億のUInt8型の値は圧縮なしで約1 GBを消費する必要があり、これがCPUの使用率に強く影響します。データは圧縮されていない場合でもコンパクトに保存することが不可欠であり、なぜならデコンプレッションの速度（CPU使用率）は主に圧縮されていないデータのボリュームに依存するからです。

これは、異なるカラムの値を別々に保存できるシステムとは対照的ですが、HBase、Bigtable、Cassandra、Hypertableなど、他のシナリオ向けに最適化されているため、分析クエリを効果的に処理できないシステムです。これらのシステムでは、毎秒約10万行のスループットを得ることができますが、毎秒数億行のスループットは得られません。

最後に、ClickHouseは単一のデータベースではなくデータベース管理システムです。テーブルやデータベースをランタイムで作成し、データをロードしてクエリを実行することが可能で、サーバーの再構成や再起動は不要です。

## データ圧縮 {#data-compression}

一部の列指向DBMSはデータ圧縮を使用しません。しかし、データ圧縮は優れた性能を達成するための重要な役割を果たします。

ClickHouseは、ディスクスペースとCPU消費の間で異なるトレードオフを持つ効率的な汎用圧縮コーデックに加え、特定の種類のデータ用の[特殊コーデック](/sql-reference/statements/create/table.md#specialized-codecs)を提供しており、これによりClickHouseは時間系列データベースなどのニッチデータベースと競争し、凌駕することができます。

## データのディスクストレージ {#disk-storage-of-data}

データを主キーで物理的にソートすることで、特定の値や値の範囲に基づいてデータを低遅延で取り出すことが可能です。SAP HANAやGoogle PowerDrillなどの一部の列指向DBMSは、RAM上でのみ動作することができます。このアプローチは、リアルタイム分析に必要なより大きなハードウェア予算を必要とします。

ClickHouseは通常のハードドライブで動作するように設計されており、データストレージあたりのGBのコストが低いですが、SSDと追加のRAMも利用可能であればフルに使用されます。

## 複数コアでの並列処理 {#parallel-processing-on-multiple-cores}

大きなクエリは自然に並列化され、現在のサーバーで利用可能なすべてのリソースを利用します。

## 複数サーバーでの分散処理 {#distributed-processing-on-multiple-servers}

上記の列指向DBMSのほとんどは、分散クエリ処理のサポートを持っていません。

ClickHouseでは、データは異なるシャードに存在することができます。各シャードは、障害耐性のために使用されるレプリカのグループとなることができます。すべてのシャードは、ユーザーに透過的にクエリを並列実行するために使用されます。

## SQLサポート {#sql-support}

ClickHouseは、ANSI SQL標準とほぼ互換性のあるSQLに基づいた[宣言的クエリ言語](/sql-reference/)をサポートしています。

サポートされているクエリには、[GROUP BY](../sql-reference/statements/select/group-by.md)、[ORDER BY](../sql-reference/statements/select/order-by.md)、[FROM](../sql-reference/statements/select/from.md)内のサブクエリ、[JOIN](../sql-reference/statements/select/join.md)句、[IN](../sql-reference/operators/in.md)演算子、[ウィンドウ関数](../sql-reference/window-functions/index.md)およびスカラーサブクエリが含まれます。

依存サブクエリは執筆時点でサポートされていませんが、将来的には利用可能になるかもしれません。

## ベクトル計算エンジン {#vector-engine}

データはカラム単位で保存されるだけでなく、ベクトル（カラムの一部）によって処理されるため、高いCPU効率を達成できます。

## リアルタイムデータ挿入 {#real-time-data-updates}

ClickHouseは主キーを持つテーブルをサポートします。主キーの範囲に対してクエリを迅速に実行するために、データはマージツリーを使用してインクリメンタルにソートされます。このため、データはテーブルに継続的に追加可能です。新しいデータが取り込まれるときにロックは取得されません。

## 主インデックス {#primary-index}

データが主キーで物理的にソートされていることで、特定の値や値の範囲に基づいてデータを低遅延で取り出すことが可能です。

## セカンダリインデックス {#secondary-indexes}

他のデータベース管理システムとは異なり、ClickHouseのセカンダリインデックスは特定の行や行範囲を指しません。その代わりに、これによりデータベースは、いくつかのデータパーツ内のすべての行がクエリフィルタリング条件に一致しないことを事前に知ることができ、それらを全く読み込まないことができるため、[データスキッピングインデックス](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-data_skipping-indexes)と呼ばれています。

## オンラインクエリに適した {#suitable-for-online-queries}

ほとんどのOLAPデータベース管理システムは、サブ秒のレイテンシでオンラインクエリを目指していません。代替システムでは、数十秒または数分のレポート作成時間がしばしば受け入れられています。時にはそれ以上の時間がかかり、システムがオフラインでレポートを準備せざるを得なくなることがあります（事前にまたは「しばらく待ってください」と応答することによって）。

ClickHouseでは、「低レイテンシ」とは、ユーザーインターフェースページが読み込まれている瞬間に遅延なく処理されることを意味します。つまり、*オンライン*です。

## 近似計算のサポート {#support-for-approximated-calculations}

ClickHouseはいくつかの方法で精度と性能をトレードオフする方法を提供します：

1.  異なる値、中央値、分位数の近似計算のための集約関数。
2.  データの一部（[SAMPLE](../sql-reference/statements/select/sample.md)）に基づいてクエリを実行し、近似結果を得る。この場合、ディスクから取得されるデータは比例的に少なくなります。
3.  すべてのキーではなく、限られた数のランダムキーに対して集約を実行します。データ内のキー分布の特定の条件下では、これにより合理的に正確な結果が得られ、リソースを少なく使用することができます。

## 適応型結合アルゴリズム {#adaptive-join-algorithm}

ClickHouseは、複数のテーブルを[JOIN](../sql-reference/statements/select/join.md)する方法を適応的に選択し、ハッシュ結合を優先し、1つ以上の大きなテーブルがある場合にはマージ結合にフォールバックします。

## データレプリケーションおよびデータ整合性サポート {#data-replication-and-data-integrity-support}

ClickHouseは非同期のマルチマスターレプリケーションを使用します。利用可能な任意のレプリカに書き込まれた後、残りのレプリカはバックグラウンドでコピーを取得します。システムは異なるレプリカの間で同一のデータを維持します。ほとんどの障害からの回復は自動的に、または複雑なケースでは半自動的に実行されます。

詳細については、[データレプリケーション](../engines/table-engines/mergetree-family/replication.md)のセクションを参照してください。

## ロールベースのアクセス制御 {#role-based-access-control}

ClickHouseは、SQLクエリを使用してユーザーアカウント管理を実装し、ANSI SQL標準および一般的なリレーショナルデータベース管理システムで見られるような[ロールベースのアクセス制御設定](/guides/sre/user-management/index.md)を許可します。

## 欠点と見なされる可能性のある機能 {#clickhouse-features-that-can-be-considered-disadvantages}

1.  完全なトランザクションがありません。
2.  高速かつ低レイテンシで挿入済みデータを変更または削除することができません。データをクリーンアップまたは変更するためのバッチ削除や更新が利用可能ですが、たとえば、[GDPR](https://gdpr-info.eu)に準拠するためです。
3.  スパースインデックスにより、ClickHouseはキーによって単一行を取得するポイントクエリに対してそれほど効率的ではありません。
