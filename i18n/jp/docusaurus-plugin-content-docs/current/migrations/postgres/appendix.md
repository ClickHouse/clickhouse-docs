---
'slug': '/migrations/postgresql/appendix'
'title': '付録'
'keywords':
- 'postgres'
- 'postgresql'
- 'data types'
- 'types'
'description': 'PostgreSQL からの移行に関連する追加情報'
---

import postgresReplicas from '@site/static/images/integrations/data-ingestion/dbms/postgres-replicas.png';
import Image from '@theme/IdealImage';

## Postgres vs ClickHouse: Equivalent and different concepts {#postgres-vs-clickhouse-equivalent-and-different-concepts}

OLTP システムから来たユーザーは、ACID トランザクションに慣れているため、ClickHouse はパフォーマンスのためにこれらを完全には提供しないことに意図的な妥協をしていることを理解する必要があります。ClickHouse のセマンティクスは、理解が深まれば高い耐久性の保証と高い書き込みスループットを提供することができます。以下に、Postgres から ClickHouse を使用する前にユーザーが精通しておくべきいくつかの重要な概念を強調します。

### Shards vs Replicas {#shards-vs-replicas}

シャーディングとレプリケーションは、ストレージおよび/または計算がパフォーマンスのボトルネックになるときに、1 つの Postgres インスタンスを超えてスケーリングするために使用される 2 つの戦略です。Postgres のシャーディングは、大規模なデータベースを複数のノードにまたがる小さく管理しやすい部分に分割することを含みます。ただし、Postgres はネイティブにシャーディングをサポートしていません。代わりに、Postgres を水平にスケール可能な分散データベースにする [Citus](https://www.citusdata.com/) のような拡張機能を使用してシャーディングを達成できます。このアプローチにより、Postgres は複数のマシンに負荷を分散することで、より高いトランザクションレートと大規模なデータセットを処理できます。シャードは、トランザクションや分析などのワークロードタイプに柔軟性を提供するために、行ベースまたはスキーマベースにすることができます。シャーディングは、複数のマシン間の調整や一貫性の保証が必要なため、データ管理やクエリ実行の面で実質的な複雑さを導入する可能性があります。

シャードとは異なり、レプリカはプライマリノードからのすべてまたは一部のデータを含む追加の Postgres インスタンスです。レプリカは、読み取りパフォーマンスの向上や HA (High Availability) シナリオなどのさまざまな理由で使用されます。物理的レプリケーションは、Postgres のネイティブ機能であり、データベース全体または重要な部分を別のサーバーにコピーすることを含み、すべてのデータベース、テーブル、インデックスも含まれます。これは、プライマリノードからレプリカに WAL セグメントをストリーミングすることを伴います。対照的に、論理的レプリケーションは、`INSERT`、`UPDATE`、`DELETE` 操作に基づいて変更をストリーミングする高次の抽象です。物理レプリケーションにも同じ結果が適用される可能性がありますが、特定のテーブルや操作にターゲットを絞る柔軟性が高まり、データの変換や異なる Postgres バージョンをサポートすることができます。

**一方で、ClickHouse のシャードとレプリカはデータの分配と冗長性に関連する 2 つの重要な概念です**。ClickHouse のレプリカは、Postgres のレプリカと類似していると考えられますが、レプリケーションは最終的に一貫性があり、プライマリの概念はありません。シャーディングは、Postgres とは異なり、ネイティブにサポートされています。

シャードは、テーブルデータの一部です。常に少なくとも 1 つのシャードがあります。複数のサーバーにデータをシャーディングすることで、すべてのシャードを使用してクエリを並行して実行する場合、単一のサーバーのキャパシティを超えたときに負荷を分散できます。ユーザーは、異なるサーバーにシャードを手動で作成し、データを直接挿入することもできます。あるいは、データがどのシャードにルーティングされるかを定義するシャーディングキーを持つ分散テーブルを使用することもできます。シャーディングキーはランダムまたはハッシュ関数の出力であることができます。重要なことは、1 つのシャードが複数のレプリカで構成される可能性があることです。

レプリカは、データのコピーです。ClickHouse は常に少なくとも 1 つのデータのコピーを持っているため、最小のレプリカ数は 1 です。データの 2 番目のレプリカを追加することで、フォールトトレランスを提供し、より多くのクエリを処理するための追加の計算リソースを提供できます（[Parallel Replicas](https://clickhouse.com/blog/clickhouse-release-23-03#parallel-replicas-for-utilizing-the-full-power-of-your-replicas-nikita-mikhailov) を使用すると、単一のクエリの計算を分散させ、待機時間を短縮できます）。レプリカは、[ReplicatedMergeTree テーブルエンジン](/engines/table-engines/mergetree-family/replication) を使用して実現され、ClickHouse は異なるサーバー間でデータの複数のコピーを同期させることができます。レプリケーションは物理的です：ノード間で転送されるのは圧縮されたパーツのみで、クエリは転送されません。

要約すると、レプリカは冗長性と信頼性（および潜在的に分散処理）を提供するデータのコピーであり、シャードは分散処理と負荷分散を可能にするデータのサブセットです。

> ClickHouse Cloud は、S3 でバックアップされたデータの 1 つのコピーを使用し、複数の計算レプリカがあります。データは各レプリカノードに利用可能で、それぞれがローカル SSD キャッシュを持っています。これは、ClickHouse Keeper によるメタデータのレプリケーションに依存しています。

## Eventual consistency {#eventual-consistency}

ClickHouse は、その内部レプリケーションメカニズムを管理するために ClickHouse Keeper (C++ による ZooKeeper の実装、ZooKeeper も使用可能) を使用しており、主にメタデータストレージと最終的一貫性の確保に焦点を当てています。Keeper は、分散環境内での各挿入のために一意の連続番号を割り当てるために使用されます。これは、操作全体の順序と一貫性を維持するために重要です。このフレームワークは、マージや変異などのバックグラウンド操作を処理し、これらの作業が分散されることを保証し、すべてのレプリカで同じ順序で実行されることを保証します。メタデータに加えて、Keeper は、保存されたデータパーツのチェックサムの追跡を含むレプリケーションのための包括的なコントロールセンターとして機能し、レプリカ間の分散通知システムとしても機能します。

ClickHouse のレプリケーションプロセスは、(1) どのレプリカにデータが挿入されたときに開始されます。このデータは、生の挿入形式で (2) ディスクに書き込まれ、チェックサムと共に保存されます。書き込まれたら、レプリカは (3) この新しいデータパートを Keeper に登録しようとし、一意のブロック番号を割り当てて新しいパートの詳細をログに記録します。他のレプリカは、(4) レプリケーションログに新しいエントリを検出すると、(5) 内部 HTTP プロトコルを介して対応するデータパートをダウンロードし、ZooKeeper にリストされたチェックサムに対して検証します。この方法により、すべてのレプリカは、さまざまな処理速度や潜在的な遅延にもかかわらず、最終的に一貫した最新のデータを保持できます。さらに、システムは複数の操作を同時に処理でき、データ管理プロセスを最適化し、システムのスケーラビリティとハードウェアの不一致に対する堅牢性を許可します。

<Image img={postgresReplicas} size="md" alt="Eventual consistency"/>

ClickHouse Cloud は、ストレージと計算のアーキテクチャの分離に適応した[クラウド最適化レプリケーションメカニズム](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)を使用しています。データを共有オブジェクトストレージに格納することで、データはノード間でデータを物理的にレプリケートすることなく、すべての計算ノードで自動的に利用可能になります。代わりに、Keeper は計算ノード間のメタデータ（オブジェクトストレージ内のデータがどこに存在するか）だけを共有するために使用されます。

PostgreSQL は、主にプライマリレプリカモデルを使用するストリーミングレプリケーションと呼ばれる異なるレプリケーション戦略を採用しており、データはプライマリから 1 つ以上のレプリカノードに継続的にストリーミングされます。このタイプのレプリケーションは、ほぼリアルタイムの一貫性を保証し、同期または非同期であり、管理者が可用性と一貫性のバランスを制御できます。ClickHouse とは異なり、PostgreSQL はノード間でデータオブジェクトや変更をストリーミングするために、論理レプリケーションとデコーディングを伴う WAL (書き込み前ログ) に依存しています。このアプローチは、PostgreSQL ではより単純ですが、ClickHouse が Keeper を使用して分散操作の調整と最終的一貫性を維持する複雑な使用法を通じて達成する同じレベルのスケーラビリティとフォールトトレランスを提供しない可能性があります。

## User implications {#user-implications}

ClickHouse では、ユーザーが 1 つのレプリカにデータを書き込み、別のレプリカから可能性のある未レプリケートデータを読み込むことができるダーティリードの可能性が、Keeper によって管理される最終的一貫性レプリケーションモデルから生じます。このモデルは、分散システム全体でのパフォーマンスとスケーラビリティを強調しており、レプリカが独立して動作し、非同期に同期することを可能にします。その結果、新しく挿入されたデータは、レプリケーションの遅延やシステム全体に変更が伝播するのにかかる時間によって、すべてのレプリカにすぐに表示されない場合があります。

対照的に、PostgreSQL のストリーミングレプリケーションモデルは、プライマリがデータの受領を確認するまで待機する同期レプリケーションオプションを採用することで、ダーティリードを防ぐことができます。これにより、トランザクションがコミットされるとすぐに、他のレプリカでデータが利用可能であるという保証があります。プライマリが失敗した場合、レプリカはクエリが承認されたデータを見ることを保証し、より厳格な一貫性を維持します。

## Recommendations {#recommendations}

ClickHouse に初めて触れるユーザーは、これらの違いに注意する必要があります。これらは複製環境で現れます。通常、最終的一貫性は、数十億、あるいは兆のデータポイントにわたる分析には十分です。新しいデータが高い速度で継続的に挿入されるため、メトリックはより安定しているか、推定が十分です。

もしこれが必要な場合、読み取りの一貫性を高めるためのいくつかのオプションがあります。これらの例の両方は、複雑さやオーバーヘッドを増加させる必要があり、クエリパフォーマンスを低下させ、ClickHouse のスケーリングを難しくする可能性があります。**これらのアプローチは、絶対に必要な場合のみお勧めします。**

## Consistent routing {#consistent-routing}

最終的一貫性のいくつかの制限を克服するために、ユーザーはクライアントが同じレプリカにルーティングされるようにすることができます。これは、複数のユーザーが ClickHouse にクエリを実行し、リクエスト間で結果が決定的である必要がある場合に役立ちます。結果は異なる場合がありますが、新しいデータが挿入されると、同じレプリカがクエリされ、一貫したビューが保証されるべきです。

これは、アーキテクチャや ClickHouse OSS または ClickHouse Cloud を使用しているかどうかに応じて、いくつかのアプローチで達成できます。

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud は、S3 でバックアップされたデータの 1 つのコピーを使用し、複数の計算レプリカがあります。データは各レプリカノードに利用可能で、それぞれがローカル SSD キャッシュを持っています。したがって、一貫した結果を保証するには、ユーザーは同じノードへの一貫したルーティングを確認するだけで済みます。

ClickHouse Cloud サービスのノードへの通信は、プロキシを介して行われます。HTTP と Native プロトコルの接続は、開いている間は同じノードにルーティングされます。一般的なクライアントからの HTTP 1.1 接続の場合、これは Keep-Alive ウィンドウに依存します。これは、ほとんどのクライアントで設定できます。例えば、Node Js などです。これは、サーバー側の設定も必要で、クライアントよりも高く設定され、ClickHouse Cloud では 10 秒に設定されています。

接続間で一貫したルーティングを保証するには、たとえば接続プールを使用している場合や接続が期限切れになった場合、ユーザーは同じ接続を使用することを保証するか（ネイティブにとっては簡単）、スティッキーエンドポイントを公開するリクエストを行うことができます。これにより、クラスタ内の各ノードのエンドポイントのセットが提供され、クライアントはクエリを決定論的にルーティングできるようになります。

> スティッキーエンドポイントへのアクセスについてはサポートにお問い合わせください。

## ClickHouse OSS {#clickhouse-oss}

OSS でこの挙動を実現するためは、シャードとレプリカのトポロジーおよびクエリに使用している [Distributed table](/engines/table-engines/special/distributed) に依存します。

シャードとレプリカが 1 つしかない場合（ClickHouse は垂直にスケールするため、一般的です）、ユーザーはクライアントレイヤーでノードを選択し、レプリカに直接クエリを実行し、これが決定的に選択されることを確認します。

分散テーブルなしで複数のシャードとレプリカを持つトポロジーは可能ですが、これらの高度なデプロイメントには通常独自のルーティングインフラストラクチャがあります。したがって、1 つ以上のシャードを持つデプロイメントが分散テーブルを使用していると仮定します（分散テーブルは単一シャードデプロイメントと共に使用することも可能ですが、通常は不要です）。

この場合、ユーザーは `session_id` や `user_id` などのプロパティに基づいて一貫したノードルーティングが行われることを確認する必要があります。設定 [`prefer_localhost_replica=0`](/operations/settings/settings#prefer_localhost_replica)、[`load_balancing=in_order`](/operations/settings/settings#load_balancing) は、[クエリ内で設定する必要があります](/operations/settings/query-level)。これにより、シャードのローカルレプリカが優先され、それ以外の場合、設定でリストされたレプリカが優先されます - ただし、エラーの数が同じである場合、エラーが多い場合はランダム選択によってフォールオーバーが発生します。[`load_balancing=nearest_hostname`](/operations/settings/settings#load_balancing) も、この決定論的なシャード選択の代替手段として使用できます。

> Distributed table を作成する際、ユーザーはクラスターを指定します。このクラスタ定義は config.xml に指定され、シャード（およびそのレプリカ）をリストします - これにより、各ノードからの利用順序を制御できます。これを使用することで、ユーザーは選択を決定論的に行うことができます。

## Sequential consistency {#sequential-consistency}

例外的な場合、ユーザーは逐次的一貫性が必要になることがあります。

データベースにおける逐次的一貫性とは、データベースに対する操作がある順序で実行されているように見え、その順序がデータベースと相互作用するすべてのプロセスで一貫していることです。つまり、すべての操作は、その呼び出しと完了の間に瞬時に効果を発揮し、すべての操作がいずれのプロセスからも観察される単一の合意された順序があります。

ユーザーの視点からは、通常、ClickHouse にデータを書き込み、データを読み取るときに、最新の挿入された行が返されることが保証される必要があります。
これは、いくつかの方法で実現できます（好ましい順序で）：

1. **同じノードへの読書/書き込み** - ネイティブプロトコルを使用している場合、または HTTP 経由での書き込み/読み取り用の [セッション](/interfaces/http#default-database) を使用している場合は、同じレプリカに接続している必要があります。このシナリオでは、書き込みを行うノードから直接読み取っているため、読み取りは常に一貫性があります。
2. **レプリカを手動で同期** - 1 つのレプリカに書き込み、別のレプリカから読み取る場合、読み取り前に `SYSTEM SYNC REPLICA LIGHTWEIGHT` を使用できます。
3. **逐次的一貫性を有効にする** - クエリ設定 [`select_sequential_consistency = 1`](/operations/settings/settings#select_sequential_consistency) を使用して。この場合、OSS では設定 `insert_quorum = 'auto'` も指定する必要があります。

<br />

これらの設定を有効にする方法については、[こちら](/cloud/reference/shared-merge-tree#consistency) を参照してください。

> 逐次的一貫性の使用は、ClickHouse Keeper により大きな負荷をかけます。これは、挿入と読み取りが遅くなる結果をもたらす可能性があります。ClickHouse Cloud で主なテーブルエンジンとして使用される SharedMergeTree は、逐次的一貫性の[オーバーヘッドが少なく、スケーラビリティが向上します](/cloud/reference/shared-merge-tree#consistency)。OSS ユーザーはこのアプローチを慎重に使用し、Keeper の負荷を測定する必要があります。

## Transactional (ACID) support {#transactional-acid-support}

PostgreSQL から移行するユーザーは、ACID (Atomicity, Consistency, Isolation, Durability) プロパティの強力なサポートに慣れているかもしれません。これにより、トランザクションデータベースの信頼できる選択肢となっています。PostgreSQL の原子性は、各トランザクションを単一の単位として扱い、完全に成功するか、完全にロールバックされることを保証し、部分的な更新を防ぎます。一貫性は、すべてのデータベーストランザクションが有効な状態に至ることを保証する制約、トリガー、およびルールを強制することによって維持されます。読み取りコミットから直列化までの隔離レベルが PostgreSQL でサポートされており、同時トランザクションによって行われた変更の可視性を詳細に制御できます。最後に、耐久性は書き込み前ログ (WAL) によって確保され、トランザクションがコミットされると、システムの障害が発生してもその状態が保持されることが保証されます。

これらのプロパティは、真実のソースとして機能する OLTP データベースでは一般的です。

強力である一方で、これには固有の制限があり、PB スケールの約束が困難です。ClickHouse は、高い書き込みスループットを維持しつつ、大規模な分析クエリを提供するために、これらのプロパティに妥協しています。

ClickHouse は、[限られた構成](https://guides/developer/transactional) 下で ACID プロパティを提供します - 最も単純なのは、1 つのパーティションを持つ非レプリケートインスタンスの MergeTree テーブルエンジンを使用することです。これらのケース以外では、これらのプロパティを期待せず、これらが必要ないことを確認する必要があります。

## Compression {#compression}

ClickHouse の列指向ストレージは、Postgres と比較すると圧縮が大幅に改善されることを意味します。以下は、両方のデータベースにおけるすべての Stack Overflow テーブルのストレージ要件を比較したものです：

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

圧縮の最適化と測定に関する詳細は、[こちら](/data-compression/compression-in-clickhouse)で確認できます。

## Data type mappings {#data-type-mappings}

以下の表は、Postgres における ClickHouse のデータ型の対応を示しています。

| Postgres Data Type | ClickHouse Type |
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

*\* ClickHouse での JSON の本番サポートは開発中です。現在のところ、ユーザーは JSON を String としてマッピングし、[JSON 関数](/sql-reference/functions/json-functions)を使用するか、構造が予測可能な場合は JSON を直接 [Tuples](/sql-reference/data-types/tuple) および [Nested](/sql-reference/data-types/nested-data-structures/nested) にマッピングできます。JSON に関する詳細は[こちら](/integrations/data-formats/json/overview)を参照してください。*
