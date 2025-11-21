---
title: 'データの管理'
description: 'オブザーバビリティのためのデータ管理'
slug: /observability/managing-data
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';


# データ管理

Observability 用途での ClickHouse のデプロイでは、必ず大規模なデータセットを扱うことになり、それらを適切に管理する必要があります。ClickHouse には、データ管理を支援するためのさまざまな機能が用意されています。



## パーティション {#partitions}

ClickHouseのパーティショニングは、カラムまたはSQL式に基づいてディスク上でデータを論理的に分離することを可能にします。データを論理的に分離することで、各パーティションは独立して操作(例:削除)できます。これにより、ユーザーはパーティション、つまりデータのサブセットをストレージ階層間で効率的に移動したり、[データの有効期限設定/クラスタからの効率的な削除](/sql-reference/statements/alter/partition)を行うことができます。

パーティショニングは、テーブルの初期定義時に`PARTITION BY`句を使用して指定されます。この句には任意のカラムに対するSQL式を含めることができ、その結果によって行がどのパーティションに送られるかが決定されます。

<Image img={observability_14} alt='パーティション' size='md' />

データパーツは、ディスク上の各パーティションと論理的に関連付けられ(共通のフォルダ名プレフィックスを介して)、個別にクエリを実行できます。以下の例では、デフォルトの`otel_logs`スキーマが`toDate(Timestamp)`式を使用して日単位でパーティション分割されています。ClickHouseに行が挿入されると、この式が各行に対して評価され、該当するパーティションが存在する場合はそこにルーティングされます(その日の最初の行である場合は、パーティションが作成されます)。

```sql
CREATE TABLE default.otel_logs
(
...
)
ENGINE = MergeTree
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SeverityText, toUnixTimestamp(Timestamp), TraceId)
```

パーティションに対しては、[バックアップ](/sql-reference/statements/alter/partition#freeze-partition)、[カラム操作](/sql-reference/statements/alter/partition#clear-column-in-partition)、ミューテーション(行単位でのデータの[変更](/sql-reference/statements/alter/partition#update-in-partition)/[削除](/sql-reference/statements/alter/partition#delete-in-partition))、[インデックスのクリア(例:セカンダリインデックス)](/sql-reference/statements/alter/partition#clear-index-in-partition)など、[多数の操作](/sql-reference/statements/alter/partition)を実行できます。

例として、`otel_logs`テーブルが日単位でパーティション分割されているとします。構造化ログデータセットが投入されている場合、数日分のデータが含まれます:

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

現在のパーティションは、シンプルなシステムテーブルクエリを使用して確認できます:

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

5 rows in set. Elapsed: 0.005 sec.
```

古いデータを保存するために使用する別のテーブル`otel_logs_archive`がある場合があります。データはパーティション単位でこのテーブルに効率的に移動できます(これは単なるメタデータの変更です)。

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
FROM otel_logs_archive
GROUP BY day
ORDER BY c DESC

┌────────day─┬───────c─┐
│ 2019-01-26 │ 1986456 │
└────────────┴─────────┘

1 row in set. Elapsed: 0.024 sec. Processed 1.99 million rows, 15.89 MB (83.86 million rows/s., 670.87 MB/s.)
Peak memory usage: 4.99 MiB.

````

これは、`INSERT INTO SELECT`を使用して新しいターゲットテーブルにデータを書き換える必要がある他の手法とは対照的です。

:::note パーティションの移動
[テーブル間でのパーティションの移動](/sql-reference/statements/alter/partition#move-partition-to-table)には、いくつかの条件を満たす必要があります。特に、テーブルは同じ構造、パーティションキー、プライマリキー、インデックス/プロジェクションを持つ必要があります。`ALTER` DDLでパーティションを指定する方法の詳細は[こちら](/sql-reference/statements/alter/partition#how-to-set-partition-expression)をご覧ください。
:::

さらに、パーティション単位でデータを効率的に削除できます。これは代替手法(ミューテーションや軽量削除)よりもはるかにリソース効率が高く、優先的に使用すべきです。

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
この機能は、[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)設定が使用される場合にTTLによって利用されます。詳細については、[TTLによるデータ管理](#data-management-with-ttl-time-to-live)をご覧ください。
:::

### 応用例 {#applications}

上記は、パーティション単位でデータを効率的に移動および操作する方法を示しています。実際には、ユーザーは可観測性のユースケースにおいて、主に次の2つのシナリオでパーティション操作を活用することが多いでしょう:

- **階層型アーキテクチャ** - ストレージ階層間でのデータ移動([ストレージ階層](#storage-tiers)を参照)により、ホット・コールドアーキテクチャの構築が可能になります。
- **効率的な削除** - データが指定されたTTLに達した場合([TTLによるデータ管理](#data-management-with-ttl-time-to-live)を参照)

これらの両方について、以下で詳しく説明します。

### クエリパフォーマンス {#query-performance}

パーティションはクエリパフォーマンスの向上に役立つ場合がありますが、これはアクセスパターンに大きく依存します。クエリが少数のパーティション(理想的には1つ)のみを対象とする場合、パフォーマンスが向上する可能性があります。これは通常、パーティションキーがプライマリキーに含まれておらず、それによってフィルタリングする場合にのみ有用です。ただし、多数のパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります(パーツ数が増える可能性があるため)。パーティションキーがすでにプライマリキーの先頭付近に存在する場合、単一パーティションを対象とすることの利点はさらに小さくなるか、ほとんど存在しなくなります。各パーティション内の値が一意である場合、パーティショニングは[GROUP BYクエリの最適化](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)にも使用できます。ただし、一般的には、ユーザーはプライマリキーが最適化されていることを確認し、アクセスパターンが特定の予測可能なデータのサブセットにアクセスする例外的なケース(例えば、日単位でパーティショニングし、ほとんどのクエリが直近の日を対象とする場合)でのみ、クエリ最適化手法としてパーティショニングを検討すべきです。この動作の例については[こちら](https://medium.com/datadenys/using-partitions-in-clickhouse-3ea0decb89c4)をご覧ください。


## TTL（Time-to-live）によるデータ管理 {#data-management-with-ttl-time-to-live}

Time-to-Live（TTL）は、ClickHouseを基盤とするオブザーバビリティソリューションにおいて、効率的なデータ保持と管理を実現するための重要な機能です。特に、膨大な量のデータが継続的に生成される環境において重要性が高まります。ClickHouseにTTLを実装することで、古いデータの自動的な期限切れと削除が可能になり、ストレージが最適に使用され、手動介入なしでパフォーマンスが維持されます。この機能は、データベースを軽量に保ち、ストレージコストを削減し、最も関連性の高い最新のデータに焦点を当てることでクエリを高速かつ効率的に保つために不可欠です。さらに、データライフサイクルを体系的に管理することで、データ保持ポリシーへの準拠を支援し、オブザーバビリティソリューション全体の持続可能性とスケーラビリティを向上させます。

ClickHouseでは、TTLはテーブルレベルまたはカラムレベルのいずれかで指定できます。

### テーブルレベルのTTL {#table-level-ttl}

ログとトレースの両方のデフォルトスキーマには、指定された期間後にデータを期限切れにするTTLが含まれています。これは、ClickHouseエクスポーターの`ttl`キーで指定されます。例：

```yaml
exporters:
  clickhouse:
    endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
    ttl: 72h
```

この構文は現在、[Golang Duration構文](https://pkg.go.dev/time#ParseDuration)をサポートしています。**ユーザーには`h`を使用し、パーティショニング期間と整合させることを推奨します。例えば、日単位でパーティション分割する場合は、24h、48h、72hなど、日数の倍数にしてください。** これにより、テーブルにTTL句が自動的に追加されます。例えば、`ttl: 96h`の場合：

```sql
PARTITION BY toDate(Timestamp)
ORDER BY (ServiceName, SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + toIntervalDay(4)
SETTINGS ttl_only_drop_parts = 1
```

デフォルトでは、TTLが期限切れになったデータは、ClickHouseが[データパーツをマージ](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)する際に削除されます。ClickHouseがデータの期限切れを検出すると、スケジュール外のマージを実行します。

:::note スケジュールされたTTL
上記のように、TTLは即座に適用されるのではなく、スケジュールに従って適用されます。MergeTreeテーブル設定の`merge_with_ttl_timeout`は、削除TTLを伴うマージを繰り返す前の最小遅延を秒単位で設定します。デフォルト値は14400秒（4時間）です。ただし、これは最小遅延であり、TTLマージがトリガーされるまでにさらに時間がかかる場合があります。値が低すぎると、多くのリソースを消費する可能性のあるスケジュール外のマージが多数実行されます。TTLの期限切れは、`ALTER TABLE my_table MATERIALIZE TTL`コマンドを使用して強制できます。
:::

**重要：設定[`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts)の使用を推奨します**（デフォルトスキーマで適用されます）。この設定を有効にすると、ClickHouseはパート内のすべての行が期限切れになった場合に、パート全体を削除します。TTLが適用された行を部分的にクリーニングする代わりにパート全体を削除すること（`ttl_only_drop_parts=0`の場合はリソース集約的なミューテーションによって実現）により、`merge_with_ttl_timeout`の時間を短縮し、システムパフォーマンスへの影響を低減できます。TTL期限切れを実行する単位（例：日）と同じ単位でデータをパーティション分割すると、パートには自然に定義された間隔のデータのみが含まれます。これにより、`ttl_only_drop_parts=1`を効率的に適用できます。

### カラムレベルのTTL {#column-level-ttl}

上記の例では、テーブルレベルでデータを期限切れにしています。ユーザーはカラムレベルでもデータを期限切れにできます。データが古くなるにつれて、調査における価値が保持のためのリソースオーバーヘッドを正当化しないカラムを削除するために使用できます。例えば、挿入時に抽出されていない新しい動的メタデータ（例：新しいKubernetesラベル）が追加される場合に備えて、`Body`カラムを保持することを推奨します。1か月などの期間が経過すると、この追加メタデータが有用でないことが明らかになる場合があり、`Body`カラムを保持する価値が限定されます。

以下では、30日後に`Body`カラムを削除する方法を示します。

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
カラムレベルのTTLを指定するには、ユーザーが独自のスキーマを指定する必要があります。これはOTelコレクターでは指定できません。
:::


## データの再圧縮 {#recompressing-data}

オブザーバビリティデータセットには通常`ZSTD(1)`を推奨していますが、ユーザーは異なる圧縮アルゴリズムやより高い圧縮レベル(例:`ZSTD(3)`)を試すことができます。スキーマ作成時に指定できるだけでなく、設定された期間後に圧縮方式を変更するように構成することもできます。これは、コーデックや圧縮アルゴリズムが圧縮率を向上させる一方でクエリパフォーマンスを低下させる場合に適しています。このトレードオフは、クエリ頻度が低い古いデータには許容できる可能性がありますが、調査でより頻繁に使用される最近のデータには適していません。

以下の例では、データを削除する代わりに4日後に`ZSTD(3)`を使用して圧縮しています。

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
異なる圧縮レベルとアルゴリズムによる挿入とクエリパフォーマンスへの影響を常に評価することを推奨します。例えば、デルタコーデックはタイムスタンプの圧縮に有効です。ただし、これらがプライマリキーの一部である場合、フィルタリングパフォーマンスが低下する可能性があります。
:::

TTLの設定に関する詳細と例は[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)をご覧ください。テーブルやカラムにTTLを追加および変更する方法などの例は[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)をご覧ください。TTLがホット・ウォームアーキテクチャなどのストレージ階層を実現する方法については、[ストレージ階層](#storage-tiers)をご覧ください。


## ストレージ階層 {#storage-tiers}

ClickHouseでは、異なるディスク上にストレージ階層を作成できます。例えば、ホット/最新データをSSD上に配置し、古いデータをS3でバックアップするといった構成が可能です。このアーキテクチャにより、調査での使用頻度が低いためクエリのSLA要件が緩やかな古いデータに対して、より低コストなストレージを使用できます。

:::note ClickHouse Cloudには該当しません
ClickHouse CloudはS3にバックアップされたデータの単一コピーを使用し、SSDベースのノードキャッシュを備えています。そのため、ClickHouse Cloudではストレージ階層は不要です。
:::

ストレージ階層を作成するには、まずディスクを作成し、それらを使用してストレージポリシーを定義します。ボリュームはテーブル作成時に指定できます。データは、充填率、パートサイズ、ボリューム優先度に基づいて、ディスク間で自動的に移動されます。詳細は[こちら](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)をご覧ください。

`ALTER TABLE MOVE PARTITION`コマンドを使用してディスク間でデータを手動で移動できますが、ボリューム間のデータ移動はTTLを使用して制御することもできます。完全な例は[こちら](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)をご覧ください。


## スキーマ変更の管理 {#managing-schema-changes}

ログとトレースのスキーマは、システムのライフサイクルを通じて必然的に変化します。例えば、ユーザーが異なるメタデータやポッドラベルを持つ新しいシステムを監視する場合などです。OTelスキーマを使用してデータを生成し、元のイベントデータを構造化形式でキャプチャすることで、ClickHouseスキーマはこれらの変更に対して堅牢になります。しかし、新しいメタデータが利用可能になり、クエリアクセスパターンが変化するにつれて、ユーザーはこれらの変化を反映するためにスキーマを更新する必要があります。

スキーマ変更中のダウンタイムを回避するために、ユーザーにはいくつかのオプションがあります。以下でそれらを紹介します。

### デフォルト値の使用 {#use-default-values}

[`DEFAULT`値](/sql-reference/statements/create/table#default)を使用してスキーマにカラムを追加できます。INSERT時に指定されていない場合、指定されたデフォルト値が使用されます。

スキーマ変更は、マテリアライズドビューの変換ロジックやOTelコレクター設定を変更する前に行うことができます。これにより、これらの新しいカラムが送信されるようになります。

スキーマが変更されたら、ユーザーはOTelコレクターを再設定できます。ユーザーが["SQLによる構造の抽出"](/docs/use-cases/observability/schema-design#extracting-structure-with-sql)で説明されている推奨プロセスを使用していると仮定します。このプロセスでは、OTelコレクターがデータをNullテーブルエンジンに送信し、マテリアライズドビューがターゲットスキーマを抽出して結果をストレージ用のターゲットテーブルに送信します。ビューは[`ALTER TABLE ... MODIFY QUERY`構文](/sql-reference/statements/alter/view)を使用して変更できます。以下のターゲットテーブルと、OTel構造化ログからターゲットスキーマを抽出するための対応するマテリアライズドビュー("SQLによる構造の抽出"で使用されているものと同様)があるとします:

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

`LogAttributes`から新しいカラム`Size`を抽出したいとします。`ALTER TABLE`を使用してスキーマに追加し、デフォルト値を指定できます:

```sql
ALTER TABLE otel_logs_v2
        (ADD COLUMN `Size` UInt64 DEFAULT JSONExtractUInt(Body, 'size'))
```

上記の例では、デフォルトを`LogAttributes`の`size`キーとして指定しています(存在しない場合は0になります)。これは、値が挿入されていない行に対してこのカラムにアクセスするクエリがMapにアクセスする必要があるため、処理が遅くなることを意味します。これを定数(例えば0)として指定することも簡単にでき、値を持たない行に対する後続のクエリのコストを削減できます。このテーブルをクエリすると、Mapから期待通りに値が入力されていることがわかります:

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


今後のすべてのデータに対してこの値が挿入されるようにするには、以下のように`ALTER TABLE`構文を使用してマテリアライズドビューを変更します:

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

以降の行では、挿入時に`Size`列が自動的に入力されます。

### 新しいテーブルの作成 {#create-new-tables}

上記のプロセスの代替として、新しいスキーマで新しいターゲットテーブルを作成することもできます。その後、上記の`ALTER TABLE MODIFY QUERY`を使用して、マテリアライズドビューを新しいテーブルを使用するように変更できます。このアプローチでは、テーブルをバージョン管理できます(例:`otel_logs_v3`)。

このアプローチでは、クエリ対象として複数のテーブルが存在することになります。複数のテーブルにまたがってクエリを実行するには、テーブル名にワイルドカードパターンを使用できる[`merge`関数](/sql-reference/table-functions/merge)を使用します。以下では、`otel_logs`テーブルのv2とv3にクエリを実行する例を示します:

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

`merge`関数の使用を避け、複数のテーブルを結合したテーブルをエンドユーザーに公開したい場合は、[Mergeテーブルエンジン](/engines/table-engines/special/merge)を使用できます。以下にその例を示します:

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

新しいテーブルが追加されるたびに、`EXCHANGE`テーブル構文を使用して更新できます。例えば、v4テーブルを追加する場合は、新しいテーブルを作成し、前のバージョンとアトミックに交換します。

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

5 行が結果セットに含まれています。経過時間: 0.068 秒。処理行数: 4,246 万行、84.92 MB（6.2045 億行/秒、1.24 GB/秒）。

```
```
