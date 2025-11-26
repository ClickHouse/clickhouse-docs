---
title: 'データの管理'
description: 'オブザーバビリティ向けのデータ管理'
slug: /observability/managing-data
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# データの管理

Observability 向けに ClickHouse を導入すると、多くの場合、大規模なデータセットを扱うことになり、その管理が必要になります。ClickHouse には、データ管理を支援するさまざまな機能が用意されています。



## パーティション

ClickHouse におけるパーティションは、カラムまたは SQL 式に従ってディスク上のデータを論理的に分割できるようにする仕組みです。データを論理的に分離することで、各パーティションを（削除など）個別に操作できます。これにより、ユーザーはパーティション、ひいてはデータのサブセットを、時間に応じてストレージ階層間で効率的に移動したり、[クラスタからのデータの有効期限設定／効率的な削除](/sql-reference/statements/alter/partition)を行ったりできます。

パーティションは、テーブルを定義する際に `PARTITION BY` 句を用いて指定します。この句には任意のカラムに対する SQL 式を含めることができ、その結果に基づいて各行が送られるパーティションが決定されます。

<Image img={observability_14} alt="パーティション" size="md" />

データパーツは、ディスク上の各パーティションと（共通のフォルダ名プレフィックスを介して）論理的に関連付けられており、個別にクエリできます。以下の例では、デフォルトの `otel_logs` スキーマは `toDate(Timestamp)` という式を使って日ごとにパーティション分割しています。行が ClickHouse に挿入されると、この式が各行に対して評価され、対応するパーティションが既に存在すればそこへルーティングされます（その日の最初の行であれば、そのパーティションが新たに作成されます）。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

パーティションに対しては、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラム操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、行単位でデータを[変更](/sql-reference/statements/alter/partition#update-in-partition)/[削除](/sql-reference/statements/alter/partition#delete-in-partition)するミューテーション、[インデックスのクリア（例：セカンダリインデックス）](/sql-reference/statements/alter/partition#clear-index-in-partition)など、[さまざまな操作](/sql-reference/statements/alter/partition)を実行できます。

例として、`otel_logs` テーブルが日単位でパーティション分割されているとします。構造化ログのデータセットが投入されている場合、これには複数日分のデータが含まれます。

```sql
SELECT Timestamp::Date AS day,
         count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-26 │ 1986456 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

5 rows in set. Elapsed: 0.058 sec. Processed 10.37 million rows, 82.92 MB (177.96 million rows/s., 1.42 GB/s.)
Peak memory usage: 4.41 MiB.
```

現在のパーティションは、system テーブルに対する簡単なクエリで確認できます。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'otel_logs'

┌─partition──┐
│ 2019-01-22 │
│ 2019-01-23 │
│ 2019-01-24 │
│ 2019-01-25 │
│ 2019-01-26 │
└────────────┘

5 行の結果セット。経過時間: 0.005 秒。
```

古いデータを保存するために使用する `otel_logs_archive` という別のテーブルを用意していることもあります。データはパーティション単位で効率的にこのテーブルへ移動できます（メタデータの変更だけで完了します）。

```sql
CREATE TABLE otel_logs_archive AS otel_logs
--データをアーカイブテーブルに移動
ALTER TABLE otel_logs
        (MOVE PARTITION tuple('2019-01-26') TO TABLE otel_logs_archive
--データが移動されたことを確認
SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-22 │ 2333977 │
│ 2019-01-23 │ 2326694 │
│ 2019-01-24 │ 1896255 │
│ 2019-01-25 │ 1821770 │
└────────────┴─────────┘

4 rows in set. Elapsed: 0.051 sec. Processed 8.38 million rows, 67.03 MB (163.52 million rows/s., 1.31 GB/s.)
Peak memory usage: 4.40 MiB.
```


SELECT Timestamp::Date AS day,
count() AS c
FROM otel&#95;logs&#95;archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 行が返されました。経過時間: 0.024 秒。1.99 百万行、15.89 MB を処理しました (83.86 百万行/秒、670.87 MB/秒)。
ピークメモリ使用量: 4.99 MiB。

````

これは、`INSERT INTO SELECT`を使用して新しいターゲットテーブルにデータを書き換える必要がある他の手法とは対照的です。

:::note パーティションの移動
[テーブル間でのパーティションの移動](/sql-reference/statements/alter/partition#move-partition-to-table)には、複数の条件を満たす必要があります。特に、テーブルは同じ構造、パーティションキー、プライマリキー、インデックス/プロジェクションを持つ必要があります。`ALTER` DDLでパーティションを指定する方法の詳細は[こちら](/sql-reference/statements/alter/partition#how-to-set-partition-expression)を参照してください。
:::

さらに、パーティション単位でデータを効率的に削除できます。これは代替手法(ミューテーションや軽量削除)よりもはるかにリソース効率が高いため、優先的に使用すべきです。

```sql
ALTER TABLE otel_logs
        (DROP PARTITION tuple('2019-01-25'))

SELECT
        Timestamp::Date AS day,
        count() AS c
FROM otel_logs
GROUP BY day
ORDER BY c DESC
┌────────day─┬───────c─┐
│ 2019-01-22 │ 4667954 │
│ 2019-01-23 │ 4653388 │
│ 2019-01-24 │ 3792510 │
└────────────┴─────────┘
````

:::note
この機能は、設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を使用した場合に TTL によって利用されます。詳細については、[TTL を用いたデータ管理](#data-management-with-ttl-time-to-live) を参照してください。
:::

### 用途

上記は、データをパーティション単位で効率的に移動・操作できることを示しています。実際には、ユーザーは Observability のユースケースにおいて、主に次の 2 つのシナリオでパーティション操作を頻繁に活用することになります。

* **階層型アーキテクチャ** - ストレージ階層間でデータを移動することで（[ストレージ階層](#storage-tiers) を参照）、ホット/コールド アーキテクチャを構成できるようにします。
* **効率的な削除** - データが指定された TTL に達したとき（[TTL を用いたデータ管理](#data-management-with-ttl-time-to-live) を参照）

以下では、これら 2 つについて詳しく説明します。

### クエリパフォーマンス

パーティションはクエリパフォーマンスの向上に役立つ場合がありますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション（理想的には 1 つ）のみを対象とする場合、パフォーマンスが向上する可能性があります。これは通常、パーティションキーがプライマリキーに含まれておらず、かつそのキーでフィルタリングする場合にのみ有用です。一方で、多数のパーティションをまたがる必要があるクエリでは、パーティションを使用しない場合と比べてパフォーマンスが低下する可能性があります（パーツが増える可能性があるため） 。単一のパーティションを対象にすることの利点は、パーティションキーがすでにプライマリキーの先頭近くにある場合には、ほとんど、あるいはまったく見られないでしょう。パーティショニングは、各パーティション内で値が一意である場合、[GROUP BY クエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) にも利用できます。ただし一般的には、まずプライマリキーを最適化することを優先し、アクセスパターンがデータの特定の予測可能なサブセット（例: 日単位でパーティション分割し、ほとんどのクエリが直近 1 日を対象とする場合）に集中するという例外的なケースでのみ、クエリ最適化手法としてパーティショニングを検討すべきです。この動作の例については[こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)を参照してください。


## TTL（Time-to-live）によるデータ管理

Time-to-Live（TTL）は、膨大な量のデータが継続的に生成される状況において、効率的なデータ保持と管理を実現するために、ClickHouse を基盤としたオブザーバビリティソリューションで重要な機能です。ClickHouse に TTL を実装することで、古いデータを自動的に期限切れとして扱って削除できるようになり、手動の運用作業なしにストレージの最適な利用とパフォーマンスの維持を実現できます。この機能は、データベースをスリムに保ち、ストレージコストを削減し、最も関連性が高く最新のデータにフォーカスすることでクエリを高速かつ効率的に保つために不可欠です。さらに、データライフサイクルを体系的に管理することでデータ保持ポリシーへの準拠に寄与し、オブザーバビリティソリューション全体の持続可能性とスケーラビリティを高めます。

TTL は、ClickHouse においてテーブル単位またはカラム単位で指定できます。

### テーブルレベルの TTL

ログとトレースの両方のデフォルトスキーマには、指定した期間が経過したデータを期限切れにする TTL が含まれています。これは ClickHouse exporter 内の `ttl` キーで指定します（例）:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

この構文は現在、[Golang Duration 構文](https://pkg.go.dev/time#ParseDuration)をサポートしています。**単位として `h` を使用し、パーティションの周期と揃うように設定することを推奨します。たとえば、日単位でパーティションしている場合は、24h、48h、72h のように日数の倍数となる値を指定してください。** これにより、たとえば `ttl: 96h` のように設定した場合、テーブルに TTL 句が自動的に追加されます。

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

デフォルトでは、有効期限が切れた TTL を持つデータは、ClickHouse が[データパーツをマージ](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)するときに削除されます。ClickHouse がデータの有効期限切れを検知すると、スケジュール外のマージを実行します。

:::note Scheduled TTLs
TTL は即時には適用されず、上記のとおりスケジュールに従って適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、削除 TTL を伴うマージを繰り返す前に必要な最小遅延時間（秒）を指定します。デフォルト値は 14400 秒（4 時間）です。ただし、これはあくまで最小遅延であり、TTL マージがトリガーされるまでにそれ以上の時間がかかる場合があります。この値が小さすぎると、多数のスケジュール外マージが発生し、多くのリソースを消費する可能性があります。TTL の期限切れ処理は、`ALTER TABLE my_table MATERIALIZE TTL` コマンドを使用して強制することができます。
:::

**重要: 設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) の使用を推奨します**（デフォルトのスキーマで有効になっています）。この設定が有効な場合、ClickHouse は、そのパーツ内のすべての行が期限切れになったときに、そのパーツ全体をドロップします。部分的に TTL 済み行をクリーンアップする（`ttl_only_drop_parts=0` のときにリソース集約的なミューテーションによって実現される）のではなく、パーツ全体をドロップすることで、`merge_with_ttl_timeout` をより短く設定でき、システムパフォーマンスへの影響を低減できます。データが TTL 期限切れ処理を行う単位、例えば日単位でパーティション分割されている場合、パーツには自然と定義された区間のデータのみが含まれるようになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できるようになります。

### カラムレベルの TTL

上記の例では、テーブルレベルでデータの有効期限を設定しています。ユーザーはカラムレベルでもデータの有効期限を設定できます。データが古くなるにつれ、調査時の価値に対してリソースオーバーヘッドが見合わないカラムをドロップするために利用できます。例えば、新しい Kubernetes ラベルのように、挿入時に抽出されていない新しい動的メタデータが追加された場合に備えて、`Body` カラムを保持しておくことを推奨します。一定期間（例: 1 か月）が経過すると、この追加メタデータが有用でないことが明らかになる場合があり、その場合は `Body` カラムを保持する価値は限定的になります。

以下では、`Body` カラムを 30 日後にドロップする方法を示します。

```sql
CREATE TABLE otel_logs_v2
(
        `Body` String TTL Timestamp + INTERVAL 30 DAY,
        `Timestamp` DateTime,
        ...
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
```

:::note
カラムレベルの TTL を指定する場合、ユーザーが自分でスキーマを定義する必要があります。これは OTel collector では指定できません。
:::


## データの再圧縮

通常、オブザーバビリティデータセットには `ZSTD(1)` を推奨しますが、別の圧縮アルゴリズムや、より高い圧縮レベル（例: `ZSTD(3)`）を試すこともできます。これはスキーマ作成時に指定できるだけでなく、一定期間が経過した後に圧縮方式を変更するように設定することも可能です。これは、あるコーデックや圧縮アルゴリズムが圧縮率を向上させる一方で、クエリ性能を低下させる場合に有用です。このトレードオフは、クエリ頻度の低い古いデータに対しては許容できる一方で、調査で頻繁に利用される最新データに対しては適切でない場合があります。

以下に例を示します。ここでは、データを削除する代わりに、4日後に `ZSTD(3)` を用いて再圧縮しています。

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `Size` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8,
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)
TTL Timestamp + INTERVAL 4 DAY RECOMPRESS CODEC(ZSTD(3))
```

:::note パフォーマンスの評価
さまざまな圧縮レベルやアルゴリズムが挿入およびクエリのパフォーマンスに与える影響を必ず評価することを推奨します。たとえば、Delta コーデックはタイムスタンプの圧縮に有用です。ただし、これらがプライマリキーの一部となっている場合、フィルタリングの性能が低下する可能性があります。
:::

TTL の設定方法に関する詳細および例は[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)を参照してください。テーブルやカラムに対して TTL を追加・変更する方法の例は[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)にあります。TTL によってホット-ウォーム型アーキテクチャのようなストレージ階層を構成する方法については、[Storage tiers](#storage-tiers)を参照してください。


## ストレージ階層 {#storage-tiers}

ClickHouse では、複数のディスク上にストレージ階層を作成できます。たとえば、ホット／直近のデータは SSD 上に配置し、古いデータは S3 をバックエンドとしたストレージに配置します。このアーキテクチャにより、調査で参照される頻度が低く、その分クエリの SLA 要件が高くなる古いデータについて、より安価なストレージを利用できます。

:::note ClickHouse Cloud には該当しません
ClickHouse Cloud は、S3 をバックエンドとし、SSD をバックエンドとするノードキャッシュを備えた単一コピーのデータを使用します。そのため、ClickHouse Cloud ではストレージ階層を構成する必要はありません。
:::

ストレージ階層を作成するには、まずディスクを作成し、それらを使用してストレージポリシーを定義します。ストレージポリシーにはボリュームを含めることができ、これをテーブル作成時に指定します。データは、使用率、パートサイズ、およびボリュームの優先度に基づいて、ディスク間で自動的に移動させることができます。詳細は[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)を参照してください。

データは `ALTER TABLE MOVE PARTITION` コマンドを使用してディスク間で手動で移動できますが、ボリューム間のデータ移動は TTL を使用して制御することもできます。TTL を用いたホット／ウォーム／コールド構成の完全な例は[こちら](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)にあります。



## スキーマ変更の管理

ログおよびトレースのスキーマは、システムのライフサイクル全体にわたって必然的に変化します。例えば、異なるメタデータやポッドラベルを持つ新しいシステムを監視するようになった場合などです。OTel スキーマを用いてデータを生成し、元のイベントデータを構造化形式で取り込むことで、ClickHouse のスキーマはこれらの変更に対して堅牢になります。しかし、新しいメタデータが利用可能になったり、クエリアクセスパターンが変化したりすると、これらの変化を反映するようにスキーマを更新する必要が出てきます。

スキーマ変更時のダウンタイムを回避するために、いくつかの選択肢があります。以下で説明します。

### デフォルト値を使用する

カラムは [`DEFAULT` 値](/sql-reference/statements/create/table#default) を使用してスキーマに追加できます。INSERT 時に値が指定されなかった場合、指定したデフォルト値が使用されます。

新しいカラムを送信することになるマテリアライズドビューの変換ロジックや OTel collector の設定を変更する前に、スキーマ変更を行うことができます。

スキーマを変更したら、OTel collector を再設定できます。ユーザーが [&quot;Extracting structure with SQL&quot;](/docs/use-cases/observability/schema-design#extracting-structure-with-sql) で説明している推奨プロセス、すなわち OTel collector がデータを Null テーブルエンジンに送信し、マテリアライズドビューがターゲットスキーマを抽出して結果をストレージ用のターゲットテーブルに送信する方式を使用していると仮定すると、このビューは [`ALTER TABLE ... MODIFY QUERY` 構文](/sql-reference/statements/alter/view) を使用して変更できます。以下のようなターゲットテーブルと、それに対応するマテリアライズドビュー（&quot;Extracting structure with SQL&quot; で使用されているものと同様）があり、OTel の構造化ログからターゲットスキーマを抽出しているとします。

```sql
CREATE TABLE default.otel_logs_v2
(
        `Body` String,
        `Timestamp` DateTime,
        `ServiceName` LowCardinality(String),
        `Status` UInt16,
        `RequestProtocol` LowCardinality(String),
        `RunTime` UInt32,
        `UserAgent` String,
        `Referer` String,
        `RemoteUser` String,
        `RequestType` LowCardinality(String),
        `RequestPath` String,
        `RemoteAddress` IPv4,
        `RefererDomain` String,
        `RequestPage` String,
        `SeverityText` LowCardinality(String),
        `SeverityNumber` UInt8
)
ENGINE = MergeTree
ORDER BY (ServiceName, Timestamp)

CREATE MATERIALIZED VIEW otel_logs_mv TO otel_logs_v2 AS
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300, 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

`LogAttributes` から新しい列 `Size` を抽出したいとしましょう。`ALTER TABLE` を使用して、この列をスキーマに追加し、デフォルト値を指定します。

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、`LogAttributes` の `size` キーをデフォルト値として指定しています（存在しない場合は 0 になります）。これは、値が挿入されていない行でこの列にアクセスするクエリは Map にアクセスする必要があり、そのためクエリが遅くなることを意味します。これを例えば 0 といった定数として指定することも簡単で、その場合、値を持たない行に対する後続クエリのコストを削減できます。このテーブルをクエリすると、Map から値が期待どおりに設定されていることが確認できます。

```sql
SELECT Size
FROM otel_logs_v2
LIMIT 5
┌──Size─┐
│ 30577 │
│  5667 │
│  5379 │
│  1696 │
│ 41483 │
└───────┘

5 rows in set. Elapsed: 0.012 sec.
```


今後取り込まれるすべてのデータにこの値が挿入されるようにするには、以下のように `ALTER TABLE` 構文を使用してマテリアライズドビューを変更します。

```sql
ALTER TABLE otel_logs_mv
        MODIFY QUERY
SELECT
        Body,
        Timestamp::DateTime AS Timestamp,
        ServiceName,
        LogAttributes['status']::UInt16 AS Status,
        LogAttributes['request_protocol'] AS RequestProtocol,
        LogAttributes['run_time'] AS RunTime,
        LogAttributes['size'] AS Size,
        LogAttributes['user_agent'] AS UserAgent,
        LogAttributes['referer'] AS Referer,
        LogAttributes['remote_user'] AS RemoteUser,
        LogAttributes['request_type'] AS RequestType,
        LogAttributes['request_path'] AS RequestPath,
        LogAttributes['remote_addr'] AS RemoteAddress,
        domain(LogAttributes['referer']) AS RefererDomain,
        path(LogAttributes['request_path']) AS RequestPage,
        multiIf(Status::UInt64 > 500, 'CRITICAL', Status::UInt64 > 400, 'ERROR', Status::UInt64 > 300,                 'WARNING', 'INFO') AS SeverityText,
        multiIf(Status::UInt64 > 500, 20, Status::UInt64 > 400, 17, Status::UInt64 > 300, 13, 9) AS SeverityNumber
FROM otel_logs
```

その後に挿入される行には、挿入時に `Size` 列が設定されます。

### 新しいテーブルを作成する

上記の手順の代替として、ユーザーは新しいスキーマを持つ新しいターゲットテーブルを作成してもかまいません。その後、マテリアライズドビューを前述の `ALTER TABLE MODIFY QUERY` を使用して新しいテーブルを参照するように変更できます。このアプローチでは、ユーザーはテーブルにバージョンを付けることができます（例：`otel_logs_v3`）。

この方法では、ユーザーはクエリ対象として複数のテーブルを持つことになります。テーブルをまたいでクエリするには、テーブル名にワイルドカードパターンを受け付ける [`merge` 関数](/sql-reference/table-functions/merge) を使用できます。以下では、`otel_logs` テーブルの v2 と v3 をクエリする例を示します。

```sql
SELECT Status, count() AS c
FROM merge('otel_logs_v[2|3]')
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.137 sec. Processed 41.46 million rows, 82.92 MB (302.43 million rows/s., 604.85 MB/s.)
```

ユーザーが `merge` 関数の使用を避けつつ、複数のテーブルをまとめた単一のテーブルをエンドユーザーに公開したい場合は、[Merge テーブルエンジン](/engines/table-engines/special/merge) を使用できます。以下に例を示します。

```sql
CREATE TABLE otel_logs_merged
ENGINE = Merge('default', 'otel_logs_v[2|3]')

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5

┌─Status─┬────────c─┐
│   200  │ 38319300 │
│   304  │  1360912 │
│   302  │   799340 │
│   404  │   420044 │
│   301  │   270212 │
└────────┴──────────┘

5 rows in set. Elapsed: 0.073 sec. Processed 41.46 million rows, 82.92 MB (565.43 million rows/s., 1.13 GB/s.)
```

これは、新しいテーブルを追加するたびに `EXCHANGE` テーブル構文を使用して更新できます。たとえば、v4 テーブルを追加するには、新しいテーブルを作成し、それを以前のバージョンとアトミックに入れ替えます。

```sql
CREATE TABLE otel_logs_merged_temp
ENGINE = Merge('default', 'otel_logs_v[2|3|4]')

EXCHANGE TABLE otel_logs_merged_temp AND otel_logs_merged

SELECT Status, count() AS c
FROM otel_logs_merged
GROUP BY Status
ORDER BY c DESC
LIMIT 5
```


┌─Status─┬────────c─┐
│   200  │ 39259996 │
│   304  │  1378564 │
│   302  │   820118 │
│   404  │   429220 │
│   301  │   276960 │
└────────┴──────────┘

結果は 5 行。経過時間: 0.068 秒。42.46 百万行、84.92 MB を処理しました (620.45 百万行/秒、1.24 GB/秒)。

```
```
