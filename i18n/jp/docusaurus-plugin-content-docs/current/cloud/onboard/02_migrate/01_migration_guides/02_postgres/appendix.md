---
'slug': '/migrations/postgresql/appendix'
'title': '附录'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': '与从 PostgreSQL 迁移相关的其他信息'
'doc_type': 'reference'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';


## Postgres vs ClickHouse: Equivalent and different concepts {#postgres-vs-clickhouse-equivalent-and-different-concepts}

OLTPシステムから来たユーザーで、ACIDトランザクションに慣れている方は、ClickHouseがパフォーマンスと引き換えにこれらを完全に提供しない意図的な妥協をしていることに留意する必要があります。ClickHouseのセマンティクスは、正しく理解されていれば高い耐久性保証と高い書き込みスループットを提供します。PostgresからClickHouseに移行する前にユーザーが熟知しておくべきいくつかの重要な概念を以下に示します。

### Shards vs replicas {#shards-vs-replicas}

シャーディングとレプリケーションは、ストレージやコンピュータがパフォーマンスのボトルネックとなったときに、1つのPostgresインスタンスを超えてスケーリングするために使用される2つの戦略です。Postgresにおけるシャーディングは、大規模なデータベースを複数のノードに分割し、小さく管理しやすい部分にすることを含みます。しかし、Postgresはネイティブでシャーディングをサポートしていません。代わりに、Postgresは[Coltus](https://www.citusdata.com/)のような拡張機能を使用することで、水平にスケール可能な分散データベースになります。このアプローチでは、Postgresがトランザクションレートとデータセットの規模を拡大し、いくつかのマシンに負荷を分散することが可能になります。シャードは、トランザクショナルまたは分析的なワークロードタイプに柔軟性を提供するために、行ベースまたはスキーマベースであることができます。シャーディングは、複数のマシンにわたる調整と一貫性の保証が必要であるため、データ管理とクエリ実行において重要な複雑さをもたらす可能性があります。

シャードとは異なり、レプリカはプライマリノードからのすべてまたは一部のデータを含む追加のPostgresインスタンスです。レプリカは、高速な読み込み性能やHA（高可用性）シナリオなど、さまざまな理由で使用されます。物理レプリケーションは、すべてのデータベース、テーブル、インデックスを含むデータベース全体または重要な部分を別のサーバーにコピーする、Postgresのネイティブ機能です。これは、プライマリノードからレプリカにWALセグメントをTCP/IP経由でストリーミングすることを含みます。それに対して、論理レプリケーションは、`INSERT`、`UPDATE`、`DELETE`操作に基づく変更をストリーミングする高レベルの抽象機能です。物理レプリケーションに同じ結果が適用される可能性がありますが、特定のテーブルと操作をターゲットにするためのより大きな柔軟性と、データ変換、異なるPostgresバージョンのサポートが可能です。

**対照的に、ClickHouseのシャードとレプリカは、データの分散と冗長性に関する2つの重要な概念です**。ClickHouseのレプリカは、Postgresのレプリカに類似していると考えられますが、レプリケーションは最終的に一貫しており、プライマリの概念はありません。ShardingはPostgresと異なり、ネイティブでサポートされています。

シャードは、テーブルデータの一部です。少なくとも1つのシャードがあります。データを複数のサーバーにシャーディングすることで、クエリを並行して実行するための単一サーバーの容量を超えた場合に負荷を分散できます。ユーザーは、異なるサーバーでテーブルのシャードを手動で作成し、データを直接挿入することができます。あるいは、データのルーティング先であるシャードを定義するシャーディングキーを持つ分散テーブルを使用することもできます。シャーディングキーはランダムであったり、ハッシュ関数の出力であったりします。重要な点は、シャードが複数のレプリカで構成される可能性があることです。

レプリカは、データのコピーです。ClickHouseには、常にデータの少なくとも1つのコピーがあります。そのため、レプリカの最少数は1です。データの2つ目のレプリカを追加することで、障害耐性が提供され、クエリをさらに処理するためのコンピュートが追加される可能性があります（[Parallel Replicas](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov)を使用して、単一のクエリのためにコンピュートを分散させ、待ち時間を短縮することもできます）。レプリケーションは、データを異なるサーバー間で同期させるためにClickHouseを可能にする[ReplicatedMergeTreeテーブルエンジン](/engines/table-engines/mergetree-family/replication)を使用して実現されます。レプリケーションは物理的です：ノード間で転送されるのは圧縮されたパーツだけで、クエリではありません。

要約すると、レプリカは冗長性と信頼性（および潜在的に分散処理）を提供するデータのコピーであり、シャードは分散処理と負荷分散を可能にするデータのサブセットです。

> ClickHouse Cloudは、S3にバックアップされた1つのデータコピーを使用し、複数のコンピュートレプリカを持ちます。このデータは、すべてのレプリカノードで利用可能で、それぞれのノードにはローカルSSDキャッシュがあります。これは、メタデータレプリケーションにのみ依存し、ClickHouse Keeperを通じて行われます。

## Eventual consistency {#eventual-consistency}

ClickHouseは、内部レプリケーションメカニズムを管理するためにClickHouse Keeper（C++ ZooKeeper実装、ZooKeeperも使用可能）を使用しており、主にメタデータストレージに焦点を当てて、最終的一貫性を保証しています。Keeperは、分散環境内での各挿入に対して一意の順次番号を割り当てるために使用されます。これは、操作間での順序と一貫性を維持するために重要です。このフレームワークは、マージや変異のようなバックグラウンド操作も処理し、これらの作業がすべてのレプリカ間で同じ順序で実行されることを保証しながら分配されることを確保します。メタデータに加えて、Keeperは、保存されたデータパーツのチェックサムを追跡するためのレプリケーションの包括的な制御センターとして機能し、レプリカ間の分散通知システムとしても作用します。

ClickHouseにおけるレプリケーションプロセスは、(1) データが任意のレプリカに挿入される際に始まります。このデータは、そのチェックサムと共に(2) ディスクに書き込まれます。書き込まれた後、レプリカは(3) この新しいデータパートをKeeperに登録し、一意のブロック番号を割り当て、新しいパートの詳細をログに記録しようとします。他のレプリカは(4) レプリケーションログに新しいエントリを検出すると、(5) 内部HTTPプロトコルを介して対応するデータパートをダウンロードし、ZooKeeperにリストされているチェックサムと照合します。この方法は、すべてのレプリカが異なる処理速度や潜在的な遅延にもかかわらず、最終的には一貫して最新のデータを保持することを保証します。さらに、このシステムは複数の操作を同時に処理できるため、データ管理プロセスの最適化、システムのスケーラビリティの向上、ハードウェアの不整合への堅牢性を実現します。

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

ClickHouse Cloudは、ストレージとコンピュートアーキテクチャの分離に適応した[クラウド最適化されたレプリケーションメカニズム](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)を使用しています。共有オブジェクトストレージにデータを保存することで、データはノード間で物理的にレプリケートする必要なしに、すべてのコンピュートノードに自動的に利用可能になります。代わりに、Keeperはメタデータ（オブジェクトストレージにどのデータが存在するか）だけをコンピュートノード間で共有するために使用されます。

PostgreSQLは、ClickHouseとは異なるレプリケーション戦略を採用しており、主にストリーミングレプリケーションを使用しています。これには、データがプライマリから1つ以上のレプリカノードに継続的にストリーミングされるプライマリレプリカモデルが含まれます。このタイプのレプリケーションは、ほぼリアルタイムの一貫性を保証し、同期または非同期であり、可用性と一貫性のバランスを管理者に提供します。ClickHouseとは異なり、PostgreSQLは、ノード間でデータオブジェクトや変更をストリーミングするために、論理レプリケーションとデコーディングを使用したWAL（Write-Ahead Logging）に依存しています。PostgreSQLでのこのアプローチはより単純ですが、ClickHouseがKeeperを用いた複雑な分散操作の調整と最終的一貫性を通じて達成するレベルのスケーラビリティや障害耐性を提供しない場合があります。

## User implications {#user-implications}

ClickHouseでは、データを1つのレプリカに書き込み、別のレプリカから実際にレプリケートされていないデータを読み取る可能性があるダーティリードの可能性が、Keeperを通じて管理される最終的な一貫性のレプリケーションモデルから生じます。このモデルは、分散システム全体でのパフォーマンスとスケーラビリティを強調し、レプリカが独立して機能し、非同期で同期することを可能にします。その結果、新たに挿入されたデータは、レプリケーション遅延やシステム全体の変更が伝播する時間に応じて、すべてのレプリカで即座に表示されない可能性があります。

逆に、PostgreSQLのストリーミングレプリケーションモデルは、通常、プライマリが少なくとも1つのレプリカがデータの受領を確認するまで待機する同期レプリケーションオプションを使用することで、ダーティリードを防ぐことができることが多いです。これにより、トランザクションがコミットされると、他のレプリカでデータの可用性が保証されます。プライマリの故障時には、レプリカがクエリがコミットされたデータを表示し、より厳密な一貫性のレベルを維持します。

## Recommendations {#recommendations}

ClickHouseに新しく参加するユーザーは、これらの違いを理解しておくべきです。これらの違いが、レプリケートされた環境において顕著になるからです。通常、最終的な一貫性は、数十億、いや数兆のデータポイントにわたる分析には十分であり、メトリックがより安定しているか、または推定が十分である場合に該当します。また、新しいデータも高レートで連続して挿入されます。

読み取りの一貫性を高めるオプションがいくつかありますが、どちらの例も複雑さが増すか、オーバーヘッドが生じます。これはクエリ性能を低下させ、ClickHouseのスケーラビリティを高めるのがより難しくなります。**私たちは、絶対に必要な場合のみ、これらのアプローチを取ることを推奨します。**

## Consistent routing {#consistent-routing}

最終的な一貫性の制限のいくつかを克服するために、ユーザーはクライアントが同じレプリカにルーティングされることを保証できます。これは、複数のユーザーがClickHouseをクエリして結果がリクエスト間で決定論的である必要がある場合に便利です。結果は新しいデータが挿入されると異なることがありますが、同じレプリカにクエリを実行することによって、一貫したビューが確保されます。

これは、アーキテクチャと、ClickHouse OSSまたはClickHouse Cloudを使用しているかどうかに応じて、いくつかの方法で達成できます。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloudは、S3にバックアップされた1つのデータコピーを使用し、複数のコンピュートレプリカを持ちます。このデータは、各レプリカノードでアクセス可能で、それぞれのノードにはローカルSSDキャッシュがあります。このため、一貫した結果を確保するには、ユーザーが同じノードに一貫してルーティングされることを保証する必要があります。

ClickHouse Cloudサービスのノードへの通信は、プロキシを介して行われます。HTTPおよびネイティブプロトコルの接続は、オープンされている期間に同じノードにルーティングされます。ほとんどのクライアントからのHTTP 1.1接続の場合、これはKeep-Aliveウィンドウに依存します。これは、ほとんどのクライアントで構成可能です（例：Node Js）。これはまた、サーバー側の構成が必要であり、クライアントよりも高く、ClickHouse Cloudでは10秒に設定されています。

接続間で一貫したルーティングを確保するには、接続プールを使用している場合や、接続が期限切れになった場合に、ユーザーは同じ接続が使用されることを確保するか（ネイティブでは簡単）、またはスティッキーエンドポイントの公開をリクエストできます。これにより、クラスター内の各ノードに固有のエンドポイントのセットが提供され、クライアントはクエリが決定論的にルーティングされることを保証できます。

> スティッキーエンドポイントへのアクセスについてはサポートまでお問い合わせください。

## ClickHouse OSS {#clickhouse-oss}

OSSでこの動作を実現するには、シャードとレプリカのトポロジー、及びクエリ用に[Distributedテーブル](/engines/table-engines/special/distributed)を使用しているかどうかに依存します。

シャードとレプリカが1つだけである場合（ClickHouseが垂直スケールするため一般的）、ユーザーはクライアントレイヤーでノードを選択し、レプリカに直接クエリを実行することで、決定論的に選択したことが確認できます。

分散テーブルを使用せずに、複数のシャードとレプリカのトポロジーを持つことも可能ですが、これらの高度なデプロイメントは通常、自分専用のルーティングインフラを持っています。そのため、シャードが1つ以上のデプロイメントがDistributedテーブルを使用していることを前提とします（Distributedテーブルは単一シャードのデプロイメントでも使用可能ですが、通常は不要です）。

この場合、ユーザーは、`session_id`や`user_id`などのプロパティに基づいて、一貫したノードルーティングが実施されていることを確認する必要があります。設定は、[`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)、[`load_balancing=in_order`](/operations/settings/settings#load_balancing)が[クエリに設定されていること](/operations/settings/query-level)を確認します。これにより、ローカルシャードのレプリカが優先され、それ以外は設定にリストされたレプリカが優先されます - 同じ数のエラーがある限り、エラーが高い場合はランダムに選択されるフォールオーバーが発生します。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing)もこの決定論的なシャードの選択の代替手段として使用できます。

> Distributedテーブルを作成すると、ユーザーはクラスターを指定します。このクラスター定義は、config.xmlで指定されており、シャード（およびそのレプリカ）がリストされているため、各ノードから使用される順序を制御できるようになります。これを使用して、ユーザーは選択が決定論的であることを確保できます。

## Sequential consistency {#sequential-consistency}

特別なケースでは、ユーザーは順次一致が必要になることがあります。

データベースにおける順次一致は、データベース上の操作が何らかの順次の順序で実行されているように見え、この順序はデータベースと相互作用するすべてのプロセス間で一貫していることを意味します。これは、すべての操作が、その呼び出しと完了の間に瞬時に効果を及ぼし、すべての操作がどのプロセスにも視認される単一の合意された順序を持つことを意味します。

ユーザーの観点から見ると、これは通常、ClickHouseにデータを書き込み、データを読み取る際に、最新の挿入された行が返されることを保証する必要があるとして現れます。
これは、いくつかの方法（好ましい順序で）で達成できます。

1. **同じノードに読み書きする** - ネイティブプロトコルまたは[HTTPを介して書き込み/読み取りを行うセッション](/interfaces/http#default-database)を使用している場合、同じレプリカに接続する必要があります。このシナリオでは、書き込みを行い、そのノードから直接読み取るため、読み取りは常に一貫します。
2. **レプリカを手動で同期する** - 1つのレプリカに書き込み、別のレプリカから読み取る場合、読み取り前に`SYSTEM SYNC REPLICA LIGHTWEIGHT`を使用できます。
3. **順次一貫性を有効にする** - クエリ設定[`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency)によって。有効化されたOSSでは、設定`insert_quorum = 'auto'`も指定する必要があります。

<br />

これらの設定を有効にするための詳細は[こちら](/cloud/reference/shared-merge-tree#consistency)をご覧ください。

> 順次一貫性を使用すると、ClickHouse Keeperに対する負荷が増加します。その結果、書き込みおよび読み取りが遅くなる可能性があります。ClickHouse Cloudで主なテーブルエンジンとして使用されるSharedMergeTreeは、順次一貫性が[オーバーヘッドが少なく、よりスケールしやすいです](/cloud/reference/shared-merge-tree#consistency)。OSSユーザーは、このアプローチを注意深く使用し、Keeperの負荷を測定する必要があります。

## Transactional (ACID) support {#transactional-acid-support}

PostgreSQLから移行するユーザーは、そのACID（Atomicity, Consistency, Isolation, Durability）特性に対する強力なサポートに慣れており、トランザクションデータベースとして信頼できる選択肢となっています。PostgreSQLの原子性は、各トランザクションが単一のユニットとして扱われ、完全に成功するか完全にロールバックされることを保証し、部分的な更新を防ぎます。一貫性は、すべてのデータベーストランザクションが有効な状態に導く制約、トリガー、ルールを強制することによって維持されます。Read CommittedからSerializableまでの隔離レベルがPostgreSQLでサポートされており、並行トランザクションによって行われた変更の可視性を細かく制御できます。最後に、耐障害性は、トランザクションがコミットされると、システム障害が発生してもそこに留まることを保証する書き込み前ログ（WAL）によって達成されます。

これらの特性は、真実のソースとして機能するOLTPデータベースに一般的です。

強力ですが、これは固有の制限を伴い、PBスケールの課題を生じさせます。ClickHouseは、高い書き込みスループットを維持しながら、大規模な分析クエリを提供するために、これらの特性を妥協します。

ClickHouseは[制限された設定の下で](./guides/developer/transactional)ACID特性を提供しています - 最も単純な場合は、1つのパーティションを持つMergeTreeテーブルエンジンのレプリケートされていないインスタンスを使用するときです。ユーザーは、これらのケース以外ではこれらの特性を期待しないべきであり、これらが要件でないことを確認する必要があります。

## Compression {#compression}

ClickHouseの列指向ストレージは、Postgresと比較した場合に圧縮が大幅に向上することを意味します。以下は、両方のデータベースでのStack Overflowテーブルに対するストレージ要件を比較したものです：

```sql title="Query (Postgres)"
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

```sql title="Query (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="Response"
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

圧縮の最適化および測定に関する詳細は[こちら](/data-compression/compression-in-clickhouse)に記載されています。

## Data type mappings {#data-type-mappings}

次の表は、Postgresのデータ型に対応するClickHouseのデータ型を示しています。

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

*\* ClickHouseにおけるJSONの製品サポートは開発中です。現在、ユーザーはJSONをStringにマッピングし、[JSON関数](/sql-reference/functions/json-functions)を使用するか、予測可能な構造の場合にはJSONを[タプル](/sql-reference/data-types/tuple)や[Nested](/sql-reference/data-types/nested-data-structures/nested)に直接マッピングすることができます。JSONに関する詳細は[こちら](/integrations/data-formats/json/overview)をご覧ください。*
