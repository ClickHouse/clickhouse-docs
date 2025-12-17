---
slug: /guides/developer/ttl
sidebar_label: 'TTL (Time To Live)'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', 'old', 'data']
description: 'TTL（time-to-live）は、一定の時間が経過した後に行または列を移動、削除、またはロールアップする機能を指します。'
title: 'TTL（Time-to-live）でデータを管理する'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# TTL（time-to-live）でデータを管理する

## TTLの概要 {#overview-of-ttl}

TTL（time-to-live）は、一定の時間が経過した後に行または列を移動、削除、またはロールアップする機能を指します。「time-to-live」という表現は古いデータの削除にのみ適用されるように聞こえますが、TTLにはいくつかの使用例があります：

- 古いデータの削除：驚くことではありませんが、指定された時間間隔の後に行または列を削除できます
- ディスク間でのデータ移動：一定の時間が経過した後、ストレージボリューム間でデータを移動できます - ホット/ウォーム/コールドアーキテクチャのデプロイに便利です
- データのロールアップ：削除する前に、古いデータをさまざまな有用な集計と計算にロールアップします

:::note
TTLはテーブル全体または特定の列に適用できます。
:::

## TTL構文 {#ttl-syntax}

`TTL`句は列定義の後またはテーブル定義の最後に表示できます。`INTERVAL`句を使用して時間の長さを定義します（`Date`または`DateTime`データ型である必要があります）。たとえば、次のテーブルには`TTL`句を持つ2つの列があります：

```sql
CREATE TABLE example1 (
   timestamp DateTime,
   x UInt32 TTL timestamp + INTERVAL 1 MONTH,
   y String TTL timestamp + INTERVAL 1 DAY,
   z String
)
ENGINE = MergeTree
ORDER BY tuple()
```

- x列にはtimestamp列から1か月のtime to liveがあります
- y列にはtimestamp列から1日のtime to liveがあります
- 間隔が経過すると、列は期限切れになります。ClickHouseは列の値をそのデータ型のデフォルト値で置き換えます。データパート内のすべての列値が期限切れになると、ClickHouseはファイルシステム内のデータパートからこの列を削除します。

:::note
TTLルールは変更または削除できます。詳細については、[テーブルTTLの操作](/sql-reference/statements/alter/ttl.md)ページを参照してください。
:::

## TTLイベントのトリガー {#triggering-ttl-events}

期限切れの行の削除または集計は即座には行われません - テーブルのマージ中にのみ発生します。何らかの理由で積極的にマージされていないテーブルがある場合、TTLイベントをトリガーする2つの設定があります：

- `merge_with_ttl_timeout`：削除TTLを使用したマージを繰り返す前の最小遅延（秒単位）。デフォルトは14400秒（4時間）です。
- `merge_with_recompression_ttl_timeout`：再圧縮TTL（削除前にデータをロールアップするルール）を使用したマージを繰り返す前の最小遅延（秒単位）。デフォルト値：14400秒（4時間）。

したがって、デフォルトでは、TTLルールは少なくとも4時間ごとにテーブルに適用されます。TTLルールをより頻繁に適用する必要がある場合は、上記の設定を変更するだけです。

:::note
素晴らしいソリューションではありません（頻繁に使用することをお勧めしません）が、`OPTIMIZE`を使用してマージを強制することもできます：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`はテーブルのパートの予定外のマージを初期化し、`FINAL`はテーブルがすでに単一のパートである場合に再最適化を強制します。
:::

## 行の削除 {#removing-rows}

一定時間後にテーブルから行全体を削除するには、テーブルレベルでTTLルールを定義します：

```sql
CREATE TABLE customers (
timestamp DateTime,
name String,
balance Int32,
address String
)
ENGINE = MergeTree
ORDER BY timestamp
TTL timestamp + INTERVAL 12 HOUR
```

さらに、レコードの値に基づいてTTLルールを定義することも可能です。
これは、where条件を指定することで簡単に実装できます。
複数の条件が許可されています：

```sql
CREATE TABLE events
(
    `event` String,
    `time` DateTime,
    `value` UInt64
)
ENGINE = MergeTree
ORDER BY (event, time)
TTL time + INTERVAL 1 MONTH DELETE WHERE event != 'error',
    time + INTERVAL 6 MONTH DELETE WHERE event = 'error'
```

## 列の削除 {#removing-columns}

行全体を削除する代わりに、balanceとaddress列だけを期限切れにしたいとします。`customers`テーブルを変更して、両方の列に2時間のTTLを追加しましょう：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## ロールアップの実装 {#implementing-a-rollup}
一定時間後に行を削除したいが、レポート目的でデータの一部を保持したいとします。すべての詳細は必要ありません - 履歴データのいくつかの集計結果だけです。これは、`TTL`式に`GROUP BY`句を追加し、集計結果を格納するためにテーブルにいくつかの列を追加することで実装できます。

次の`hits`テーブルでは、古い行を削除したいが、行を削除する前に`hits`列の合計と最大値を保持したいとします。これらの値を格納するフィールドが必要で、合計と最大値をロールアップする`GROUP BY`句を`TTL`句に追加する必要があります：

```sql
CREATE TABLE hits (
   timestamp DateTime,
   id String,
   hits Int32,
   max_hits Int32 DEFAULT hits,
   sum_hits Int64 DEFAULT hits
)
ENGINE = MergeTree
PRIMARY KEY (id, toStartOfDay(timestamp), timestamp)
TTL timestamp + INTERVAL 1 DAY
    GROUP BY id, toStartOfDay(timestamp)
    SET
        max_hits = max(max_hits),
        sum_hits = sum(sum_hits);
```

`hits`テーブルに関するいくつかの注意点：

- `TTL`句の`GROUP BY`列は`PRIMARY KEY`のプレフィックスである必要があり、結果を日の開始時刻でグループ化したいので、`toStartOfDay(timestamp)`がプライマリキーに追加されました
- 集計結果を格納するために2つのフィールドを追加しました：`max_hits`と`sum_hits`
- `max_hits`と`sum_hits`のデフォルト値を`hits`に設定することは、`SET`句の定義方法に基づいて、ロジックが機能するために必要です

## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudを使用している場合、このレッスンの手順は適用されません。ClickHouse Cloudで古いデータを移動することを心配する必要はありません。
:::

大量のデータを扱う際の一般的な慣行は、データが古くなるにつれてそのデータを移動することです。`TTL`コマンドの`TO DISK`および`TO VOLUME`句を使用してClickHouseでホット/ウォーム/コールドアーキテクチャを実装する手順は次のとおりです。（ちなみに、ホットとコールドのことである必要はありません - どのような使用例でもTTLを使用してデータを移動できます。）

1. `TO DISK`および`TO VOLUME`オプションは、ClickHouse構成ファイルで定義されたディスクまたはボリュームの名前を参照します。ディスクを定義する`my_system.xml`という名前の新しいファイル（または任意のファイル名）を作成し、次にディスクを使用するボリュームを定義します。XMLファイルを`/etc/clickhouse-server/config.d/`に配置して、構成がシステムに適用されるようにします：

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <default>
            </default>
           <hot_disk>
              <path>./hot/</path>
           </hot_disk>
           <warm_disk>
              <path>./warm/</path>
           </warm_disk>
           <cold_disk>
              <path>./cold/</path>
           </cold_disk>
        </disks>
        <policies>
            <default>
                <volumes>
                    <default>
                        <disk>default</disk>
                    </default>
                    <hot_volume>
                        <disk>hot_disk</disk>
                    </hot_volume>
                    <warm_volume>
                        <disk>warm_disk</disk>
                    </warm_volume>
                    <cold_volume>
                        <disk>cold_disk</disk>
                    </cold_volume>
                </volumes>
            </default>
        </policies>
    </storage_configuration>
</clickhouse>
```

2. 上記の構成は、ClickHouseが読み書きできるフォルダを指す3つのディスクを参照します。ボリュームには1つ以上のディスクを含めることができます - 3つのディスクそれぞれにボリュームを定義しました。ディスクを表示してみましょう：

```sql
SELECT name, path, free_space, total_space
FROM system.disks
```

```response
┌─name────────┬─path───────────┬───free_space─┬──total_space─┐
│ cold_disk   │ ./data/cold/   │ 179143311360 │ 494384795648 │
│ default     │ ./             │ 179143311360 │ 494384795648 │
│ hot_disk    │ ./data/hot/    │ 179143311360 │ 494384795648 │
│ warm_disk   │ ./data/warm/   │ 179143311360 │ 494384795648 │
└─────────────┴────────────────┴──────────────┴──────────────┘
```

3. そして...ボリュームを確認しましょう：

```sql
SELECT
    volume_name,
    disks
FROM system.storage_policies
```

```response
┌─volume_name─┬─disks─────────┐
│ default     │ ['default']   │
│ hot_volume  │ ['hot_disk']  │
│ warm_volume │ ['warm_disk'] │
│ cold_volume │ ['cold_disk'] │
└─────────────┴───────────────┘
```

4. 次に、ホット、ウォーム、コールドのボリューム間でデータを移動する`TTL`ルールを追加します：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい`TTL`ルールは実体化されるはずですが、確実にするために強制できます：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts`テーブルを使用して、データが期待されるディスクに移動したことを確認します：

```sql
system.partsテーブルを使用して、crypto_pricesテーブルのパーツがどのディスク上にあるかを表示します：

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

レスポンスは次のようになります：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
