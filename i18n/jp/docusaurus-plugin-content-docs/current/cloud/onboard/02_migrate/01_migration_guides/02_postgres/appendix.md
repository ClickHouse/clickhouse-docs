---
slug: /migrations/postgresql/appendix
title: '付録'
keywords: ['postgres', 'postgresql', 'data types', 'types']
description: 'PostgreSQL からの移行に関する追加情報'
doc_type: 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';


## PostgresとClickHouse: 同等の概念と異なる概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

ACIDトランザクションに慣れているOLTPシステムから移行するユーザーは、ClickHouseがパフォーマンスと引き換えにこれらを完全には提供しないという意図的なトレードオフを行っていることを認識する必要があります。ClickHouseのセマンティクスは、適切に理解すれば、高い耐久性保証と高い書き込みスループットを実現できます。以下では、PostgresからClickHouseを使用する前にユーザーが理解しておくべき重要な概念をいくつか紹介します。

### シャードとレプリカ {#shards-vs-replicas}

シャーディングとレプリケーションは、ストレージやコンピュートがパフォーマンスのボトルネックになった場合に、単一のPostgresインスタンスを超えてスケーリングするために使用される2つの戦略です。Postgresにおけるシャーディングは、大規模なデータベースを複数のノードにわたってより小さく管理しやすい部分に分割することを意味します。ただし、Postgresはシャーディングをネイティブにサポートしていません。代わりに、[Citus](https://www.citusdata.com/)などの拡張機能を使用してシャーディングを実現でき、Postgresを水平スケーリング可能な分散データベースにすることができます。このアプローチにより、Postgresは複数のマシンに負荷を分散することで、より高いトランザクション率とより大きなデータセットを処理できるようになります。シャードは、トランザクション型や分析型などのワークロードタイプに柔軟性を提供するために、行ベースまたはスキーマベースにすることができます。シャーディングは、複数のマシン間での調整と一貫性保証が必要となるため、データ管理とクエリ実行の面で大きな複雑さをもたらす可能性があります。

シャードとは異なり、レプリカはプライマリノードからのデータの全部または一部を含む追加のPostgresインスタンスです。レプリカは、読み取りパフォーマンスの向上やHA(高可用性)シナリオなど、さまざまな理由で使用されます。物理レプリケーションはPostgresのネイティブ機能であり、すべてのデータベース、テーブル、インデックスを含むデータベース全体または重要な部分を別のサーバーにコピーすることを含みます。これには、プライマリノードからレプリカへTCP/IP経由でWALセグメントをストリーミングすることが含まれます。対照的に、論理レプリケーションは、`INSERT`、`UPDATE`、`DELETE`操作に基づいて変更をストリーミングする、より高レベルの抽象化です。物理レプリケーションと同じ結果が得られる場合もありますが、特定のテーブルや操作をターゲットにしたり、データ変換を行ったり、異なるPostgresバージョンをサポートしたりするための、より大きな柔軟性が実現されます。

**対照的に、ClickHouseのシャードとレプリカは、データ分散と冗長性に関連する2つの重要な概念です**。ClickHouseのレプリカはPostgresのレプリカに類似していると考えることができますが、レプリケーションは結果整合性であり、プライマリという概念はありません。シャーディングは、Postgresとは異なり、ネイティブにサポートされています。

シャードはテーブルデータの一部です。常に少なくとも1つのシャードが存在します。複数のサーバーにデータをシャーディングすることで、単一サーバーの容量を超えた場合に負荷を分散でき、すべてのシャードを使用してクエリを並列実行できます。ユーザーは異なるサーバー上のテーブルに対して手動でシャードを作成し、直接データを挿入できます。あるいは、分散テーブルを使用して、データがどのシャードにルーティングされるかを定義するシャーディングキーを指定することもできます。シャーディングキーはランダムにすることも、ハッシュ関数の出力にすることもできます。重要なのは、シャードは複数のレプリカで構成できることです。

レプリカはデータのコピーです。ClickHouseは常にデータの少なくとも1つのコピーを持っているため、レプリカの最小数は1です。データの2番目のレプリカを追加すると、耐障害性が提供され、より多くのクエリを処理するための追加のコンピュートリソースが得られる可能性があります([並列レプリカ](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)を使用して、単一のクエリのコンピュートを分散し、レイテンシを低減することもできます)。レプリカは[ReplicatedMergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/replication)によって実現され、ClickHouseが異なるサーバー間でデータの複数のコピーを同期状態に保つことを可能にします。レプリケーションは物理的です。ノード間で転送されるのは圧縮されたパーツのみであり、クエリではありません。

要約すると、レプリカは冗長性と信頼性(および潜在的に分散処理)を提供するデータのコピーであり、シャードは分散処理と負荷分散を可能にするデータのサブセットです。

> ClickHouse Cloudは、S3にバックアップされた単一のデータコピーと複数のコンピュートレプリカを使用します。データは各レプリカノードで利用可能であり、各ノードにはローカルSSDキャッシュがあります。これは、ClickHouse Keeperを通じたメタデータレプリケーションのみに依存しています。


## 結果整合性 {#eventual-consistency}

ClickHouseは、内部レプリケーション機構の管理にClickHouse Keeper（C++によるZooKeeper実装。ZooKeeperも使用可能）を使用しており、主にメタデータの保存と結果整合性の確保に重点を置いています。Keeperは、分散環境内の各挿入操作に対して一意の連番を割り当てるために使用されます。これは、操作全体で順序と整合性を維持するために不可欠です。このフレームワークは、マージやミューテーションなどのバックグラウンド操作も処理し、これらの作業を分散させながら、すべてのレプリカで同じ順序で実行されることを保証します。メタデータに加えて、Keeperは、保存されたデータパーツのチェックサムの追跡を含む、レプリケーションの包括的な制御センターとして機能し、レプリカ間の分散通知システムとしても動作します。

ClickHouseのレプリケーションプロセスは、(1) いずれかのレプリカにデータが挿入されたときに開始されます。このデータは、生の挿入形式のまま、(2) チェックサムとともにディスクに書き込まれます。書き込みが完了すると、レプリカは (3) 一意のブロック番号を割り当て、新しいパーツの詳細をログに記録することで、この新しいデータパーツをKeeperに登録しようとします。他のレプリカは、(4) レプリケーションログ内の新しいエントリを検出すると、(5) 内部HTTPプロトコルを介して対応するデータパーツをダウンロードし、ZooKeeperに記載されているチェックサムと照合して検証します。この方法により、処理速度の違いや潜在的な遅延にもかかわらず、すべてのレプリカが最終的に整合性のある最新のデータを保持することが保証されます。さらに、このシステムは複数の操作を同時に処理する能力を持ち、データ管理プロセスを最適化し、ハードウェアの不一致に対するシステムのスケーラビリティと堅牢性を実現します。

<Image img={postgresReplicas} size='md' alt='結果整合性' />

なお、ClickHouse Cloudは、ストレージとコンピュートの分離アーキテクチャに適応した[クラウド最適化レプリケーション機構](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)を使用しています。共有オブジェクトストレージにデータを保存することで、ノード間でデータを物理的にレプリケートする必要なく、すべてのコンピュートノードでデータが自動的に利用可能になります。代わりに、Keeperはコンピュートノード間でメタデータ（オブジェクトストレージ内のどこにどのデータが存在するか）のみを共有するために使用されます。

PostgreSQLは、ClickHouseとは異なるレプリケーション戦略を採用しており、主にストリーミングレプリケーションを使用します。これは、プライマリから1つ以上のレプリカノードにデータが継続的にストリーミングされるプライマリ・レプリカモデルを採用しています。このタイプのレプリケーションは、ほぼリアルタイムの整合性を保証し、同期または非同期で動作するため、管理者は可用性と整合性のバランスを制御できます。ClickHouseとは異なり、PostgreSQLは、ノード間でデータオブジェクトと変更をストリーミングするために、論理レプリケーションとデコードを備えたWAL（Write-Ahead Logging）に依存しています。PostgreSQLのこのアプローチはより直接的ですが、ClickHouseが分散操作の調整と結果整合性のためにKeeperを複雑に使用することで実現する、高度に分散された環境における同レベルのスケーラビリティと耐障害性を提供できない可能性があります。


## ユーザーへの影響 {#user-implications}

ClickHouseでは、ダーティリード（あるレプリカにデータを書き込んだ後、別のレプリカからまだ複製されていない可能性のあるデータを読み取ること）が発生する可能性があります。これは、Keeperによって管理される結果整合性レプリケーションモデルに起因します。このモデルは、分散システム全体でのパフォーマンスとスケーラビリティを重視しており、レプリカが独立して動作し、非同期で同期することを可能にします。その結果、新しく挿入されたデータは、レプリケーションラグやシステム全体への変更の伝播にかかる時間によって、すべてのレプリカで即座に可視化されない場合があります。

一方、PostgreSQLのストリーミングレプリケーションモデルでは、同期レプリケーションオプションを使用することで、通常ダーティリードを防ぐことができます。このオプションでは、プライマリがトランザクションをコミットする前に、少なくとも1つのレプリカがデータの受信を確認するまで待機します。これにより、トランザクションがコミットされた時点で、そのデータが別のレプリカで利用可能であることが保証されます。プライマリに障害が発生した場合でも、レプリカはクエリがコミット済みデータを参照できることを保証し、より厳格な整合性レベルを維持します。


## 推奨事項 {#recommendations}

ClickHouseを初めて使用するユーザーは、レプリケーション環境で現れるこれらの違いを認識しておく必要があります。通常、数十億、場合によっては数兆のデータポイントを扱う分析においては、結果整合性で十分です。このような環境では、メトリクスがより安定しているか、または新しいデータが高速で継続的に挿入される中で推定値で十分な場合が多いためです。

読み取りの整合性を高める必要がある場合、いくつかのオプションが存在します。いずれの方法も、複雑性またはオーバーヘッドの増加を伴い、クエリパフォーマンスが低下し、ClickHouseのスケーリングがより困難になります。**これらのアプローチは、絶対に必要な場合にのみ使用することを推奨します。**


## 一貫したルーティング {#consistent-routing}

結果整合性の制限を克服するために、ユーザーはクライアントを同じレプリカにルーティングすることができます。これは、複数のユーザーがClickHouseにクエリを実行し、リクエスト間で結果が決定論的である必要がある場合に有用です。新しいデータが挿入されると結果は異なる可能性がありますが、同じレプリカに対してクエリを実行することで一貫したビューが保証されます。

これは、アーキテクチャやClickHouse OSSとClickHouse Cloudのどちらを使用しているかに応じて、複数のアプローチで実現できます。


## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloudは、S3にバックアップされた単一のデータコピーと複数のコンピュートレプリカを使用します。データは各レプリカノードで利用可能であり、各ノードにはローカルSSDキャッシュがあります。一貫した結果を保証するため、ユーザーは同じノードへの一貫したルーティングを確保するだけで済みます。

ClickHouse Cloudサービスのノードへの通信は、プロキシを介して行われます。HTTPおよびNativeプロトコル接続は、接続が開いている期間中、同じノードにルーティングされます。ほとんどのクライアントからのHTTP 1.1接続の場合、これはKeep-Aliveウィンドウに依存します。これは、Node.jsなどのほとんどのクライアントで設定可能です。また、サーバー側の設定も必要であり、クライアント側よりも高い値に設定され、ClickHouse Cloudでは10秒に設定されています。

接続プールを使用する場合や接続が期限切れになる場合など、接続間で一貫したルーティングを確保するために、ユーザーは同じ接続を使用する(Nativeプロトコルの場合はより簡単)か、スティッキーエンドポイントの公開を要求することができます。これにより、クラスター内の各ノードに対するエンドポイントのセットが提供され、クライアントがクエリを確定的にルーティングできるようになります。

> スティッキーエンドポイントへのアクセスについては、サポートにお問い合わせください。


## ClickHouse OSS {#clickhouse-oss}

OSSでこの動作を実現できるかどうかは、シャードとレプリカのトポロジー、およびクエリに[Distributedテーブル](/engines/table-engines/special/distributed)を使用しているかどうかによって異なります。

シャードが1つでレプリカが複数ある場合(ClickHouseは垂直スケーリングするため一般的な構成)、ユーザーはクライアント層でノードを選択し、レプリカに直接クエリを実行することで、決定論的な選択を保証します。

複数のシャードとレプリカを持つトポロジーはDistributedテーブルなしでも可能ですが、このような高度なデプロイメントでは通常、独自のルーティングインフラストラクチャを持っています。そのため、複数のシャードを持つデプロイメントではDistributedテーブルを使用していると想定します(Distributedテーブルは単一シャードのデプロイメントでも使用できますが、通常は不要です)。

この場合、ユーザーは`session_id`や`user_id`などのプロパティに基づいて一貫したノードルーティングが実行されるようにする必要があります。設定[`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)、[`load_balancing=in_order`](/operations/settings/settings#load_balancing)を[クエリで設定](/operations/settings/query-level)する必要があります。これにより、シャードのローカルレプリカが優先され、それ以外の場合は設定にリストされている順にレプリカが優先されます(エラー数が同じ場合)。エラーが多い場合は、ランダム選択によるフェイルオーバーが発生します。この決定論的なシャード選択の代替として、[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing)も使用できます。

> Distributedテーブルを作成する際、ユーザーはクラスターを指定します。config.xmlで指定されるこのクラスター定義には、シャード(とそのレプリカ)がリストされており、各ノードから使用される順序をユーザーが制御できます。これにより、ユーザーは選択が決定論的であることを保証できます。


## 順次一貫性 {#sequential-consistency}

例外的なケースでは、ユーザーは順次一貫性が必要になる場合があります。

データベースにおける順次一貫性とは、データベースに対する操作が何らかの順次的な順序で実行されているように見え、この順序がデータベースと相互作用するすべてのプロセス間で一貫していることを指します。これは、すべての操作がその呼び出しと完了の間に瞬時に効果を発揮するように見え、すべてのプロセスによって観測されるすべての操作に対して単一の合意された順序が存在することを意味します。

ユーザーの観点からは、これは通常、ClickHouseにデータを書き込み、データを読み取る際に最新の挿入された行が返されることを保証する必要性として現れます。
これはいくつかの方法で実現できます(優先順位順):

1. **同じノードへの読み取り/書き込み** - ネイティブプロトコルを使用している場合、または[HTTPを介して書き込み/読み取りを行うセッション](/interfaces/http#default-database)を使用している場合、同じレプリカに接続されている必要があります。このシナリオでは、書き込みを行っているノードから直接読み取りを行うため、読み取りは常に一貫性が保たれます。
1. **レプリカを手動で同期** - あるレプリカに書き込み、別のレプリカから読み取る場合、読み取りの前に`SYSTEM SYNC REPLICA LIGHTWEIGHT`を実行できます。
1. **順次一貫性を有効化** - クエリ設定[`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)を使用します。OSSでは、設定`insert_quorum = 'auto'`も指定する必要があります。

<br />

これらの設定を有効にする詳細については、[こちら](/cloud/reference/shared-merge-tree#consistency)を参照してください。

> 順次一貫性の使用は、ClickHouse Keeperに大きな負荷をかけます。その結果、
> 挿入と読み取りが遅くなる可能性があります。ClickHouse Cloudでメインテーブルエンジンとして使用されているSharedMergeTreeでは、順次一貫性は[オーバーヘッドが少なく、よりスケールします](/cloud/reference/shared-merge-tree#consistency)。OSSユーザーは、このアプローチを慎重に使用し、Keeperの負荷を測定する必要があります。


## トランザクション（ACID）サポート {#transactional-acid-support}

PostgreSQLから移行するユーザーは、ACID（原子性、一貫性、分離性、永続性）特性に対する堅牢なサポートに慣れている可能性があります。これにより、PostgreSQLはトランザクションデータベースとして信頼性の高い選択肢となっています。PostgreSQLにおける原子性は、各トランザクションが単一の単位として扱われ、完全に成功するか完全にロールバックされるかのいずれかとなることで、部分的な更新を防ぎます。一貫性は、制約、トリガー、およびルールを適用することで維持され、すべてのデータベーストランザクションが有効な状態に導かれることを保証します。PostgreSQLでは、Read CommittedからSerializableまでの分離レベルがサポートされており、同時実行トランザクションによる変更の可視性を細かく制御できます。最後に、永続性は先行書き込みログ（WAL）によって実現され、トランザクションがコミットされた後は、システム障害が発生した場合でもその状態が維持されることを保証します。

これらの特性は、信頼できる情報源として機能するOLTPデータベースに共通するものです。

強力である一方、これには固有の制限があり、ペタバイト規模の実現を困難にします。ClickHouseは、高い書き込みスループットを維持しながら大規模で高速な分析クエリを提供するために、これらの特性においてトレードオフを行っています。

ClickHouseは[限定的な構成](/guides/developer/transactional)下でACID特性を提供します。最も単純なケースは、1つのパーティションを持つMergeTreeテーブルエンジンの非レプリケートインスタンスを使用する場合です。ユーザーは、これらのケース以外ではこれらの特性を期待すべきではなく、要件として必要でないことを確認する必要があります。


## 圧縮 {#compression}

ClickHouseのカラム指向ストレージにより、Postgresと比較して圧縮率が大幅に向上します。以下は、両データベースにおけるすべてのStack Overflowテーブルのストレージ要件を比較した例です：

```sql title="クエリ (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="クエリ (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="レスポンス"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB       │
│ users       │ 846.57 MiB      │
│ badges      │ 513.13 MiB      │
│ comments    │ 7.11 GiB        │
│ votes       │ 1.28 GiB        │
│ posthistory │ 40.44 GiB       │
│ postlinks   │ 79.22 MiB       │
└─────────────┴─────────────────┘
```

圧縮の最適化と測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)をご覧ください。


## データ型マッピング {#data-type-mappings}

以下の表は、PostgresとClickHouseの対応するデータ型を示しています。

| Postgresデータ型   | ClickHouse型                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATE`               | [Date](/sql-reference/data-types/date)                                                                                                                                                                                               |
| `TIMESTAMP`          | [DateTime](/sql-reference/data-types/datetime)                                                                                                                                                                                       |
| `REAL`               | [Float32](/sql-reference/data-types/float)                                                                                                                                                                                           |
| `DOUBLE`             | [Float64](/sql-reference/data-types/float)                                                                                                                                                                                           |
| `DECIMAL, NUMERIC`   | [Decimal](/sql-reference/data-types/decimal)                                                                                                                                                                                         |
| `SMALLINT`           | [Int16](/sql-reference/data-types/int-uint)                                                                                                                                                                                          |
| `INTEGER`            | [Int32](/sql-reference/data-types/int-uint)                                                                                                                                                                                          |
| `BIGINT`             | [Int64](/sql-reference/data-types/int-uint)                                                                                                                                                                                          |
| `SERIAL`             | [UInt32](/sql-reference/data-types/int-uint)                                                                                                                                                                                         |
| `BIGSERIAL`          | [UInt64](/sql-reference/data-types/int-uint)                                                                                                                                                                                         |
| `TEXT, CHAR, BPCHAR` | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `INTEGER`            | Nullable([Int32](/sql-reference/data-types/int-uint))                                                                                                                                                                                |
| `ARRAY`              | [Array](/sql-reference/data-types/array)                                                                                                                                                                                             |
| `FLOAT4`             | [Float32](/sql-reference/data-types/float)                                                                                                                                                                                           |
| `BOOLEAN`            | [Bool](/sql-reference/data-types/boolean)                                                                                                                                                                                            |
| `VARCHAR`            | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `BIT`                | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `BIT VARYING`        | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `BYTEA`              | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `NUMERIC`            | [Decimal](/sql-reference/data-types/decimal)                                                                                                                                                                                         |
| `GEOGRAPHY`          | [Point](/sql-reference/data-types/geo#point)、[Ring](/sql-reference/data-types/geo#ring)、[Polygon](/sql-reference/data-types/geo#polygon)、[MultiPolygon](/sql-reference/data-types/geo#multipolygon)                               |
| `GEOMETRY`           | [Point](/sql-reference/data-types/geo#point)、[Ring](/sql-reference/data-types/geo#ring)、[Polygon](/sql-reference/data-types/geo#polygon)、[MultiPolygon](/sql-reference/data-types/geo#multipolygon)                               |
| `INET`               | [IPv4](/sql-reference/data-types/ipv4)、[IPv6](/sql-reference/data-types/ipv6)                                                                                                                                                       |
| `MACADDR`            | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `CIDR`               | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |
| `HSTORE`             | [Map(K, V)](/sql-reference/data-types/map)、[Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant))                                                                                                     |
| `UUID`               | [UUID](/sql-reference/data-types/uuid)                                                                                                                                                                                               |
| `ARRAY<T>`           | [ARRAY(T)](/sql-reference/data-types/array)                                                                                                                                                                                          |
| `JSON*`              | [String](/sql-reference/data-types/string)、[Variant](/sql-reference/data-types/variant)、[Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-)、[Tuple](/sql-reference/data-types/tuple) |
| `JSONB`              | [String](/sql-reference/data-types/string)                                                                                                                                                                                           |

_\* ClickHouseにおけるJSONの本番環境サポートは開発中です。現在、ユーザーはJSONをStringとしてマッピングして[JSON関数](/sql-reference/functions/json-functions)を使用するか、構造が予測可能な場合はJSONを直接[Tuple](/sql-reference/data-types/tuple)および[Nested](/sql-reference/data-types/nested-data-structures/nested)にマッピングすることができます。JSONの詳細については[こちら](/integrations/data-formats/json/overview)をご覧ください。_
