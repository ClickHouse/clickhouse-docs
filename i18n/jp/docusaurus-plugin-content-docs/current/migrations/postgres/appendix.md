---
slug: /migrations/postgresql/appendix
title: '付録'
keywords: ['postgres', 'postgresql', 'データ型', '型']
description: 'PostgreSQLからの移行に関する追加情報'
---
```

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres vs ClickHouse: 同等および異なる概念 {#postgres-vs-clickhouse-equivalent-and-different-concepts}

OLTPシステムから来たユーザーで、ACIDトランザクションに慣れている方は、ClickHouseが性能向上のためにこれを完全には提供していないことを理解する必要があります。ClickHouseのセマンティクスは、正しく理解されていれば、高い耐久性の保証と高い書き込みスループットを提供できます。PostgresからClickHouseで作業する前に、ユーザーが慣れておくべきいくつかの重要な概念を以下に示します。

### シャードとレプリカ {#shards-vs-replicas}

シャーディングとレプリケーションは、ストレージやコンピュータの性能がボトルネックになる場合に、1つのPostgresインスタンスを超えてスケールするために使用される2つの戦略です。Postgresにおけるシャーディングは、大きなデータベースを複数のノードにわたって小さく管理しやすい部分に分割することを含みます。しかし、Postgresはネイティブにシャーディングをサポートしていません。代わりに、[Citus](https://www.citusdata.com/)のような拡張機能を使用してシャーディングを実現し、Postgresが水平にスケールできる分散データベースになります。このアプローチにより、Postgresは負荷を複数のマシンに広げることで、より高いトランザクションレートと大きなデータセットを処理することができます。シャードは、トランザクションや分析などのワークロードの種類に応じて柔軟性を提供するために、行ベースまたはスキーマベースにできます。シャーディングは、複数のマシン間での調整や一貫性の保証を必要とするため、データ管理とクエリ実行において大きな複雑さをもたらす可能性があります。

シャードとは異なり、レプリカはプライマリノードのすべてまたは一部のデータを含む追加のPostgresインスタンスです。レプリカは、強化された読み取り性能やHA（高可用性）シナリオなど、さまざまな理由で使用されます。物理レプリケーションは、Postgresのネイティブ機能であり、特定のデータベースやテーブル、インデックスを含む全体または重要な部分を別のサーバにコピーします。これは、プライマリノードからレプリカへのWALセグメントをTCP/IP経由でストリーミングすることを含みます。対照的に、論理レプリケーションは、`INSERT`、`UPDATE`、`DELETE`操作に基づいて変更をストリーミングする高い抽象度のレベルです。同じ結果が物理レプリケーションにも適用されるかもしれませんが、特定のテーブルや操作を対象とするためのより大きな柔軟性、データ変換、および異なるPostgresバージョンをサポートすることを可能にします。

**対照的に、ClickHouseのシャードとレプリカは、データの分散と冗長性に関連する2つの重要な概念です**。ClickHouseのレプリカは、Postgresのレプリカに類似していると考えられますが、レプリケーションは最終的に一貫性があり、プライマリの概念はありません。シャーディングは、Postgresとは異なり、ネイティブにサポートされています。

シャードは、あなたのテーブルデータの一部です。常に少なくとも1つのシャードがあります。すべてのシャードを使用してクエリを並行実行する際に、単一のサーバの能力を超えた場合、複数のサーバにデータを分散させて負荷を分散させることができます。ユーザーは、異なるサーバに対して手動でテーブルのシャードを作成し、直接データを挿入することができます。あるいは、分散テーブルを使用して、データがどのシャードに送信されるかを定義するシャーディングキーを使用することができます。シャーディングキーはランダムにすることも、ハッシュ関数の出力として指定することもできます。重要なことに、シャードは複数のレプリカで構成されることができます。

レプリカは、あなたのデータのコピーです。ClickHouseには常にデータの少なくとも1つのコピーがあり、したがって、最小のレプリカ数は1です。データの2番目のレプリカを追加することで、フォールトトレランスが提供され、クエリ処理のための追加の計算能力が得られる可能性があります（[並列レプリカ](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)を使用して、単一のクエリの計算を分散させ、レイテンシを低下させることも可能です）。レプリカは、[ReplicatedMergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/replication)を使用して実現され、ClickHouseは異なるサーバー間でデータの複数のコピーを同期させます。レプリケーションは物理的なものであり、ノード間で転送されるのは圧縮されたパーツのみであり、クエリではありません。

要約すると、レプリカは冗長性と信頼性（および潜在的に分散処理）を提供するデータのコピーであり、シャードは分散処理と負荷均一化を可能にするデータのサブセットです。

> ClickHouse Cloudは、S3にバックアップされた単一のデータコピーを使用し、複数の計算レプリカを持っています。データは各レプリカノードで利用可能で、それぞれがローカルSSDキャッシュを持っています。これは、ClickHouse Keeperを介してのメタデータレプリケーションのみに依存します。

## 最終的一貫性 {#eventual-consistency}

ClickHouseはその内部レプリケーションメカニズムを管理するためにClickHouse Keeper（C++ ZooKeeper実装、ZooKeeperも使用可能）を使用し、主にメタデータストレージと最終的一貫性の確保に焦点を当てています。 Keeperは、分散環境内で各挿入に対して一意の連番を割り当てるために使用されます。これは、操作の順序と一貫性を維持するために重要です。このフレームワークは、マージや変異などのバックグラウンド操作も処理し、これらの作業が分散される一方で、すべてのレプリカで同じ順序で実行されることを保証します。メタデータに加えて、Keeperは、格納データパーツのチェックサムを追跡することを含むレプリケーションの包括的な制御センターとして機能し、レプリカ間の分散通知システムとしても機能します。

ClickHouseでのレプリケーションプロセスは、(1) データが任意のレプリカに挿入されたときに開始されます。このデータは、(2) チェックサムと共にディスクに書き込まれます。書き込まれた後、レプリカは(3) この新しいデータパートをKeeperに登録し、一意のブロック番号を割り当てて新しいパートの詳細をログします。他のレプリカは、(4) レプリケーションログに新しいエントリを検出した際に、(5) 内部HTTPプロトコルを介して対応するデータパートをダウンロードし、ZooKeeperにリストされているチェックサムに対してそれを検証します。この方法により、すべてのレプリカは、処理速度の違いや潜在的な遅延にもかかわらず、最終的に一貫して最新のデータを保持します。さらに、このシステムは複数の操作を同時に処理できるため、データ管理プロセスを最適化し、システムのスケーラビリティやハードウェアの不整合に対しての堅牢性を提供します。

<Image img={postgresReplicas} size="md" alt="最終的一貫性"/>

ClickHouse Cloudは、ストレージとコンピュータのアーキテクチャを分離したことに適応した[クラウド最適化されたレプリケーションメカニズム](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)を使用しています。データを共有オブジェクトストレージに保存することにより、データは物理的にノード間でレプリケートされる必要なく、すべてのコンピュートノードに自動的に利用可能になります。代わりに、Keeperは、コンピュートノード間でメタデータ（どのデータがどこに存在するか）を共有するために使用されます。

PostgreSQLは、ClickHouseとは異なるレプリケーション戦略を採用しており、主にプライマリレプリカモデルを使用するストリーミングレプリケーションを使用しています。これは、データがプライマリから1つまたは複数のレプリカノードに継続的にストリーミングされることを含みます。このタイプのレプリケーションは、ほぼリアルタイムの一貫性を保証し、同期または非同期であり、管理者に可用性と一貫性のバランスを制御する権限を与えます。ClickHouseとは異なり、PostgreSQLは、ノード間でデータオブジェクトや変更をストリーミングするために、論理レプリケーションとデコーディングを伴うWAL（Write-Ahead Logging）に依存しています。このアプローチはPostgreSQLではより簡単ですが、ClickHouseがその複雑なKeeperの使用を通じて達成するほどのスケーラビリティとフォールトトレランスを提供できない可能性があります。

## ユーザーへの影響 {#user-implications}

ClickHouseでは、あるレプリカにデータを書き込み、別のレプリカから潜在的に未レプリカのデータを読み取ることができる「ダーティリード」の可能性が、Keeperによって管理される最終的一貫性モデルから発生します。このモデルは、パフォーマンスと分散システム全体でのスケーラビリティを強調しており、レプリカが独立して動作し、非同期で同期をとることを可能にします。その結果、挿入されたばかりのデータは、レプリケーションの遅延や変更がシステムを通じて伝播するのにかかる時間に応じて、すべてのレプリカに即座に表示されない可能性があります。

対照的に、PostgreSQLのストリーミングレプリケーションモデルは、プライマリがトランザクションをコミットする前に、少なくとも1つのレプリカがデータの受信を確認するのを待つ同期レプリケーションオプションを使用することで、通常ダーティリードを防ぐことができます。これにより、トランザクションがコミットされると、そのデータが別のレプリカに存在することが保証されます。プライマリが失敗した場合、レプリカはクエリがコミットされたデータを確認出来るようにし、より厳格な一貫性を維持します。

## 推奨事項 {#recommendations}

ClickHouseを初めて使用するユーザーは、これらの違いを理解しておく必要があります。これらの違いは、レプリケートされた環境で現れます。通常、最終的一貫性は、何十億、場合によっては何兆ものデータポイントに対する分析には十分です – その場合、メトリクスはより安定しているか、新しいデータが高いレートで継続的に挿入されているため、推定が十分です。

読み取りの一貫性を高めるための複数のオプションが存在しますが、これには通常、複雑性の増大やオーバーヘッドが伴い、クエリパフォーマンスを低下させることになり、ClickHouseのスケールアップが難しくなります。**これらのアプローチは、必要不可欠である場合のみ推奨します。**

## 一貫したルーティング {#consistent-routing}

最終的一貫性のいくつかの制限を克服するために、ユーザーはクライアントが同じレプリカにルーティングされることを確保できます。これは、複数のユーザーがClickHouseをクエリしており、結果がリクエスト間で決定的である必要がある場合に有用です。挿入された新しいデータにより結果が異なる可能性があるが、同じレプリカをクエリすることにより、一貫したビューを確保できます。

これは、ClickHouse OSSまたはClickHouse Cloudを使用しているかどうかによって、アーキテクチャに応じたさまざまなアプローチにより実現できます。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloudは、S3にバックアップされた単一のデータコピーを使用し、複数のコンピュートレプリカを持っています。データは各レプリカノードで利用可能で、それぞれがローカルSSDキャッシュを持っています。一貫した結果を確保するために、ユーザーはしたがって、同じノードへの一貫したルーティングのみを確保する必要があります。

ClickHouse Cloudサービスのノードへの通信はプロキシを通じて行われます。HTTPおよびネイティブプロトコル接続は、オープンのまま保持される期間中に同じノードにルーティングされます。ほとんどのクライアントからのHTTP 1.1接続の場合、これはKeep-Aliveウィンドウに依存します。これは、Node Jsなどのほとんどのクライアントで構成可能です。これはサーバー側の構成も必要とし、クライアントよりも高く設定され、ClickHouse Cloudでは10秒に設定されています。

接続間での一貫したルーティングを確保するためには、接続プールを使用する場合や接続が期限切れになる場合に、ユーザーは同じ接続を使用することを確保する（ネイティブの場合は簡単）か、スティッキエンドポイントの公開を要求することができます。これにより、クラスタ内の各ノードにセットされたエンドポイントが提供され、そのことでクライアントがクエリを決定的にルーティングできるようになります。

> スティッキエンドポイントへのアクセスについてはサポートにお問い合わせください。

## ClickHouse OSS {#clickhouse-oss}

OSSでこの動作を実現するには、シャードおよびレプリカのトポロジーに依存し、クエリ時に[分散テーブル](/engines/table-engines/special/distributed)を使用しているかどうかによります。

シャードとレプリカが1つだけある場合（ClickHouseが垂直にスケールするのが一般的です）、ユーザーはクライアントレイヤーでノードを選択し、レプリカを直接クエリして、決定的に選ばれます。

複数のシャードとレプリカを持つトポロジーは分散テーブルなしでも可能ですが、これらの高度なデプロイメントは通常、独自のルーティングインフラストラクチャを持っています。したがって、1つ以上のシャードを持つデプロイメントでは、分散テーブルを使用していると仮定します（分散テーブルは単一シャードデプロイメントに使用できますが、通常は不要です）。

この場合、ユーザーは`session_id`や`user_id`などのプロパティに基づいて、一貫したノードルーティングが実施されることを保証する必要があります。設定[`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)、[`load_balancing=in_order`](/operations/settings/settings#load_balancing)は[クエリに設定されるべきです](/operations/settings/query-level)。これにより、シャードのローカルレプリカが優先され、設定でリストされているレプリカが優先されます – エラー数が同じであれば、エラーが高い場合にはランダム選択でフェイルオーバーが行われます。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing)もこの決定的なシャード選択のための代替手段として使用できます。

> 分散テーブルを作成する際、ユーザーはクラスターを指定します。このクラスター定義はconfig.xmlに記載されており、シャード（およびそのレプリカ）をリストしているため、各ノードから使用される順序を制御できます。これを使用することで、ユーザーは選択が決定的であることを確認できます。

## 逐次的一貫性 {#sequential-consistency}

例外的なケースにおいて、ユーザーは逐次的一貫性が必要な場合があります。

データベースにおける逐次的一貫性とは、データベース上の操作が何らかの逐次的な順序で実行されていることが見えることを指し、この順序はデータベースと相互作用するすべてのプロセス間で一貫しているということです。これは、すべての操作が、呼び出しと完了の間に瞬時に効果を発揮し、すべての操作がどのプロセスからでも観察される場合には、合意された単一の順序で実行されることを意味します。

ユーザーの観点からは、通常、ClickHouseにデータを書き込む必要があり、データを読み取る際には、最新の挿入行が返されることを保証する必要があることとして現れます。これを実現する方法は複数あり（好ましい順で）：

1. **同じノードへの読み取り/書き込み** - ネイティブプロトコルを使用している場合、またはHTTP経由で読み取り/書き込みのために[セッションを使用する](/interfaces/http#default-database)場合、同じレプリカに接続されるべきです。このシナリオでは、書き込んでいるノードから直接読み取るため、読み取りは常に一貫性が保たれます。
2. **手動でレプリカを同期** - 1つのレプリカに書き込み、別のレプリカから読み取る場合、読み取る前に`SYSTEM SYNC REPLICA LIGHTWEIGHT`を使用できます。
3. **逐次的一貫性を有効にする** - クエリ設定[`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)を使用します。OSSでは、設定`insert_quorum = 'auto'`も指定する必要があります。

<br />

設定を有効にする詳細については[こちら](/cloud/reference/shared-merge-tree#consistency)をご覧ください。

> 逐次的一貫性の使用は、ClickHouse Keeperに対してより大きな負荷をかけます。結果として、より遅い挿入や読み取りを引き起こす可能性があります。ClickHouse Cloudで主要なテーブルエンジンとして使用されているSharedMergeTreeでは、逐次的一貫性は[オーバーヘッドが少なく、より良いスケールを提供します](/cloud/reference/shared-merge-tree#consistency)。OSSユーザーは、このアプローチを注意深く使用し、Keeperの負荷を測定する必要があります。

## トランザクション管理（ACID）サポート {#transactional-acid-support}

PostgreSQLから移行してきたユーザーは、その堅牢なACID（原子性、一貫性、隔離性、耐久性）特性のサポートに慣れているかもしれません。これにより、トランザクションデータベースとして信頼できる選択肢となります。PostgreSQLの原子性は、各トランザクションが単一のユニットとして扱われ、完全に成功するか、完全にロールバックされることを保証します。これにより、部分的な更新が防止されます。一貫性は、すべてのデータベーストランザクションが有効な状態につながるように、制約、トリガー、およびルールを強制することで維持されます。PostgreSQLでは、Read CommittedからSerializableまでの隔離レベルがサポートされ、同時トランザクションによる変更の可視性を細かく制御できます。最後に、耐久性は書き込み先行ログ（WAL）を介して実現され、一度トランザクションがコミットされると、システム障害の発生時にもそうであることが保証されます。

これらの特性は、真実のソースとして機能するOLTPデータベースに共通しています。

強力な一方で、これには固有の制限があり、PBスケールが困難になります。ClickHouseは、高い書き込みスループットを維持しながら、大規模な分析クエリを提供するために、これらの特性を妥協しています。

ClickHouseは、[限られた構成の下でACID特性](/guides/developer/transactional)を提供します - 特に、1つのパーティションを持つMergeTreeテーブルエンジンの非レプリケートインスタンスを使用する場合、最も単純です。 ユーザーは、これらのケース以外でこれらの特性を期待せず、これらが必要でないことを確認する必要があります。

## 圧縮 {#compression}

ClickHouseの列指向ストレージは、Postgresと比較して圧縮が非常に効果的です。以下に、両方のデータベースにおけるすべてのStack Overflowテーブルのストレージ要件を比較したものを示します：

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

圧縮の最適化および測定に関するさらなる詳細は、[こちら](/data-compression/compression-in-clickhouse)でご覧いただけます。

## データ型マッピング {#data-type-mappings}

以下の表は、PostgresのClickHouseデータ型に対応するものを示しています。

| Postgresデータ型 | ClickHouse型 |
| --- | --- |
| `DATE` | [Date](/sql-reference/data-types/date) |
| `TIMESTAMP` | [DateTime](/sql-reference/data-types/datetime) |
| `REAL` | [Float32](/sql-reference/data-types/float) |
| `DOUBLE` | [Float64](/sql-reference/data-types/float) |
| `DECIMAL, NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `SMALLINT` | [Int16](/sql-reference/data-types/int-uint) |
| `INTEGER` | [Int32](/sql-reference/data-types/int-uint) |
| `BIGINT` | [Int64](/sql-reference/data-types/int-uint) |
| `SERIAL` | [UInt32](/sql-reference/data-types/int-uint) |
| `BIGSERIAL` | [UInt64](/sql-reference/data-types/int-uint) |
| `TEXT, CHAR, BPCHAR` | [String](/sql-reference/data-types/string) |
| `INTEGER` | Nullable([Int32](/sql-reference/data-types/int-uint)) |
| `ARRAY` | [Array](/sql-reference/data-types/array) |
| `FLOAT4` | [Float32](/sql-reference/data-types/float) |
| `BOOLEAN` | [Bool](/sql-reference/data-types/boolean) |
| `VARCHAR` | [String](/sql-reference/data-types/string) |
| `BIT` | [String](/sql-reference/data-types/string) |
| `BIT VARYING` | [String](/sql-reference/data-types/string) |
| `BYTEA` | [String](/sql-reference/data-types/string) |
| `NUMERIC` | [Decimal](/sql-reference/data-types/decimal) |
| `GEOGRAPHY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `GEOMETRY` | [Point](/sql-reference/data-types/geo#point), [Ring](/sql-reference/data-types/geo#ring), [Polygon](/sql-reference/data-types/geo#polygon), [MultiPolygon](/sql-reference/data-types/geo#multipolygon) |
| `INET` | [IPv4](/sql-reference/data-types/ipv4), [IPv6](/sql-reference/data-types/ipv6) |
| `MACADDR` | [String](/sql-reference/data-types/string) |
| `CIDR` | [String](/sql-reference/data-types/string) |
| `HSTORE` | [Map(K, V)](/sql-reference/data-types/map), [Map](/sql-reference/data-types/map)(K,[Variant](/sql-reference/data-types/variant)) |
| `UUID` | [UUID](/sql-reference/data-types/uuid) |
| `ARRAY<T>` | [ARRAY(T)](/sql-reference/data-types/array) |
| `JSON*` | [String](/sql-reference/data-types/string), [Variant](/sql-reference/data-types/variant), [Nested](/sql-reference/data-types/nested-data-structures/nested#nestedname1-type1-name2-type2-), [Tuple](/sql-reference/data-types/tuple) |
| `JSONB` | [String](/sql-reference/data-types/string) |

*\* ClickHouseにおけるJSONの本番サポートは開発中です。現在、ユーザーはJSONをStringとしてマッピングし、[JSON関数](/sql-reference/functions/json-functions)を使用するか、構造が予測可能な場合はJSONを[Tuples](/sql-reference/data-types/tuple)および[Nested](/sql-reference/data-types/nested-data-structures/nested)に直接マッピングすることができます。JSONについての詳細は[こちら](/integrations/data-formats/json/overview)でご覧いただけます。*
