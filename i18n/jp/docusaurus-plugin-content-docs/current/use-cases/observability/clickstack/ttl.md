---
slug: /use-cases/observability/clickstack/ttl
title: 'TTL管理'
sidebar_label: 'TTL管理'
pagination_prev: null
pagination_next: null
description: 'ClickStack における TTL 管理'
doc_type: 'guide'
keywords: ['clickstack', 'ttl', 'data retention', 'lifecycle', 'storage management']
---

import observability_14 from '@site/static/images/use-cases/observability/observability-14.png';
import Image from '@theme/IdealImage';
import OtelLogsSchema from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_schema_otel_logs.md';

## ClickStack における TTL \{#ttl-clickstack\}

Time-to-Live (TTL) は、特に継続的に大量のデータが生成される環境において、効率的なデータ保持と管理を実現するための ClickStack の重要な機能です。TTL を使うと、古いデータの有効期限切れと削除を自動化できるため、手動で介入しなくてもストレージを最適に利用し、パフォーマンスを維持できます。この機能は、データベースをスリムに保ち、ストレージコストを削減し、関連性が高く新しいデータに絞ってクエリを高速かつ効率的に保つうえで不可欠です。さらに、データライフサイクルを体系的に管理することで、データ保持ポリシーへのコンプライアンスにも役立ち、オブザーバビリティソリューション全体の持続可能性とスケーラビリティを高めます。

**デフォルトでは、ClickStack はデータを 3 日間保持します。これを変更するには、[&quot;Modifying TTL&quot;](#modifying-ttl) を参照してください。**

TTL は ClickHouse ではテーブルレベルで制御されます。たとえば、ログのデフォルトスキーマは以下のとおりです。collector がテーブルを作成する際、`${TABLES_TTL}` は設定された保持期間 (変更しない限り 3 日) に置き換えられます。

<OtelLogsSchema />

ClickHouse のパーティション化では、カラムまたは SQL 式に基づいてデータをディスク上で論理的に分離できます。データを論理的に分離することで、各パーティションを個別に操作できるようになり、たとえば TTL ポリシーに従って有効期限が切れた際に削除できます。

上記の例のとおり、パーティション化はテーブルを最初に定義するときに `PARTITION BY` 句で指定します。この句には任意のカラムに対する SQL 式を含めることができ、その結果によって行の送信先パーティションが決まります。これにより、データはディスク上で各パーティションと論理的に関連付けられ (共通のフォルダー名プレフィックスを通じて) 、その後は個別にクエリできます。上記の例では、デフォルトの `otel_logs` スキーマは `toDate(Timestamp)` 式を使用して日単位でパーティション化されます。行が ClickHouse に挿入されると、この式が各行に対して評価され、対応するパーティションが存在すればそこに振り分けられます (その日で最初の行であれば、パーティションが作成されます) 。パーティション化とそのほかの用途の詳細については、[&quot;Table Partitions&quot;](/partitions) を参照してください。

<Image img={observability_14} alt="Partitions" size="lg" />

テーブルスキーマには、`TTL toDateTime(Timestamp) + ${TABLES_TTL}` と `ttl_only_drop_parts = 1` の設定も含まれます。前者の設定により、データは設定された TTL (デフォルトでは 3 日) を経過すると削除されます。`ttl_only_drop_parts = 1` の設定は、そのパーツ内のすべてのデータが有効期限切れになった場合にのみ、そのパーツを削除することを強制します (行を部分的に削除しようとしない) 。日単位でデータが「マージ」されないようにパーティション分割しておくことで、データを効率的に削除できます。

:::important `ttl_only_drop_parts`
設定 [`ttl_only_drop_parts=1`](/operations/settings/merge-tree-settings#ttl_only_drop_parts) を常に使用することを推奨します。この設定が有効な場合、ClickHouse は、そのパーツ内のすべての行が有効期限切れになったときに、そのパーツ全体を削除します。パーツ全体を削除する方式は、`ttl_only_drop_parts=0` の場合にリソース集約的な mutation によって行われる、TTL 対象行の部分的なクリーンアップと比べて、`merge_with_ttl_timeout` の時間を短くでき、システムパフォーマンスへの影響も小さくできます。TTL で期限切れを設定している単位 (例: 日) と同じ単位でデータをパーティション分割していれば、パーツには自然と定義された区間のデータのみが含まれるようになります。これにより、`ttl_only_drop_parts=1` を効率的に適用できます。
:::

デフォルトでは、TTL が期限切れになったデータは、ClickHouse が[データパーツをマージする](/engines/table-engines/mergetree-family/mergetree#mergetree-data-storage)際に削除されます。ClickHouse がデータの有効期限切れを検知すると、スケジュール外のマージを実行します。

:::note TTL schedule
TTL は即座には適用されず、上記のとおりスケジュールに従って適用されます。MergeTree テーブル設定 `merge_with_ttl_timeout` は、削除 TTL を伴うマージを再実行するまでの最小遅延時間 (秒) を設定します。デフォルト値は 14400 秒 (4 時間) です。しかしこれはあくまで最小遅延であり、TTL マージがトリガーされるまでにさらに時間がかかる場合があります。値が小さすぎると、リソースを多く消費するスケジュール外マージが多数発生します。TTL の期限切れは、コマンド `ALTER TABLE my_table MATERIALIZE TTL` を使って強制的に実行できます。
:::

## TTL の変更 \{#modifying-ttl\}

TTL を変更するには、次のいずれかの方法があります。

1. **テーブルのスキーマを変更する (推奨)&#x20;**。これには、[clickhouse-client](/interfaces/cli) や [Cloud SQL Console](/cloud/get-started/sql-console) などを使用して ClickHouse インスタンスに接続する必要があります。たとえば、次の DDL を使用して `otel_logs` テーブルの TTL を変更できます。

```sql
ALTER TABLE default.otel_logs
MODIFY TTL TimestampTime + toIntervalDay(7);
```

2. **OTel collector を変更する**。ClickStack OpenTelemetry collector は、存在しない場合に ClickHouse 内にテーブルを自動作成します。これは ClickHouse exporter によって実現されており、デフォルトの TTL 式を制御するために使用できる `ttl` パラメータを公開しています。例:

```yaml
exporters:
 clickhouse:
   endpoint: tcp://localhost:9000?dial_timeout=10s&compress=lz4&async_insert=1
   ttl: 72h
```

### カラムレベルの TTL \{#column-level-ttl\}

上記の例では、テーブルレベルでデータの有効期限を設定しています。データの有効期限は、カラムレベルでも設定できます。データが古くなるにつれて、調査における有用性に対して、保持に必要なリソースコストが見合わなくなったカラムを削除するために利用できます。たとえば、挿入時にまだ抽出されていない新しい動的メタデータ (例: 新しい Kubernetes ラベル) が追加される可能性を考慮し、`Body` カラムは保持しておくことを推奨します。一方で、一定期間 (例: 1 か月) が経過すると、この追加メタデータが有用でないことが明らかになり、`Body` カラムを保持し続ける意義が小さいと判断できる場合があります。

以下では、`Body` カラムを 30 日後に削除する方法を示します。

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
カラムレベルで TTL を指定するには、ユーザー自身で独自のスキーマを定義する必要があります。これは OTel collector からは指定できません。
:::
