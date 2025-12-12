---
slug: /guides/developer/ttl
sidebar_label: 'TTL（Time To Live）'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', 'old', 'data']
description: 'TTL（time-to-live）とは、指定した時間が経過した後に行や列を移動、削除、またはロールアップできる機能を指します。'
title: 'TTL（Time-to-live）でデータを管理する'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# TTL（Time To Live）を使ったデータ管理 {#manage-data-with-ttl-time-to-live}

## TTL の概要 {#overview-of-ttl}

TTL (time-to-live) は、一定時間が経過した後に、行や列を移動・削除・ロールアップできる機能を指します。"time-to-live" という表現からは古いデータの削除だけを連想しがちですが、TTL にはいくつかのユースケースがあります。

- 古いデータの削除: 想像どおり、指定した時間の経過後に行や列を削除できます
- ディスク間でのデータ移動: 一定時間経過後にストレージボリューム間でデータを移動できます。ホット / ウォーム / コールド構成のアーキテクチャを実現する際に有用です
- データロールアップ: 古いデータを削除する前に、さまざまな有用な集約や計算結果にロールアップできます

:::note
TTL はテーブル全体にも特定の列にも適用できます。
:::

## TTL の構文 {#ttl-syntax}

`TTL` 句は、列定義の後および/またはテーブル定義の末尾に記述できます。`INTERVAL` 句を使用して期間（`Date` または `DateTime` データ型である必要があります）を定義します。たとえば、次のテーブルには 2 つの列があり、
それぞれに `TTL` 句があります。

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

* x 列は、`timestamp` 列を基準として 1 か月の TTL（有効期限）を持ちます
* y 列は、`timestamp` 列を基準として 1 日の TTL（有効期限）を持ちます
* 期間が経過すると、その列は失効します。ClickHouse は、その列の値をデータ型のデフォルト値に置き換えます。あるデータパート内のその列の値がすべて失効すると、ClickHouse はファイルシステム上のそのデータパートからこの列を削除します。

:::note
TTL のルールは変更または削除できます。詳細は [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md) ページを参照してください。
:::

## TTL イベントのトリガー {#triggering-ttl-events}

期限切れ行の削除や集約は即時には行われず、テーブルのマージ時にのみ実行されます。何らかの理由でマージが積極的に行われていないテーブルがある場合、TTL イベントをトリガーするための設定が 2 つあります:

* `merge_with_ttl_timeout`: 削除 TTL を伴うマージを再度実行するまでの最小遅延時間（秒）。デフォルトは 14400 秒（4 時間）です。
* `merge_with_recompression_ttl_timeout`: 再圧縮 TTL（削除前にデータをロールアップするルール）を伴うマージを再度実行するまでの最小遅延時間（秒）。デフォルト値は 14400 秒（4 時間）です。

そのためデフォルトでは、TTL ルールは 4 時間に少なくとも 1 回、テーブルに対して適用されます。TTL ルールをより高頻度で適用したい場合は、上記の設定を変更してください。

:::note
あまり良い解決策ではなく（また頻繁に使用することは推奨しません）が、`OPTIMIZE` を使用してマージを強制することもできます。

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` はテーブルを構成するパーツのスケジュールされていないマージ処理を開始し、テーブルがすでに単一パーツである場合は `FINAL` によって再度の最適化が強制されます。
:::

## 行の削除 {#removing-rows}

一定時間が経過した後にテーブルから行全体を削除するには、テーブルレベルで TTL ルールを定義します。

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

さらに、レコードの値に基づいて TTL ルールを定義することも可能です。
これは、WHERE 句を指定することで容易に実現できます。
複数の条件を指定することができます。

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

行全体を削除するのではなく、`balance` 列と `address` 列だけに有効期限を設定したいとします。`customers` テーブルを変更して、両方の列に 2 時間の TTL を設定してみましょう。

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## ロールアップの実装 {#implementing-a-rollup}

一定時間が経過した行を削除しつつ、レポーティング用途のために一部のデータは保持しておきたいとします。すべての詳細が必要なわけではなく、履歴データに対するいくつかの集計結果だけで十分です。これは、集計結果を保存するためのいくつかの列をテーブルに追加し、`TTL` 式に `GROUP BY` 句を追加することで実装できます。

次の `hits` テーブルで、古い行は削除しつつ、行を削除する前に `hits` 列の合計値と最大値は保持しておきたいとします。その値を保存するための列が必要であり、さらに合計値と最大値をロールアップする `GROUP BY` 句を `TTL` 句に追加する必要があります。

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

`hits` テーブルに関する補足:

* `TTL` 句内の `GROUP BY` 列は `PRIMARY KEY` の先頭部分である必要があり、さらに結果を日単位（1 日の開始時刻）でグループ化したいので、`PRIMARY KEY` に `toStartOfDay(timestamp)` を追加しました
* 集計結果を保存するために、`max_hits` と `sum_hits` の 2 つのフィールドを追加しました
* `SET` 句の定義に基づくロジックが正しく動作するようにするには、`max_hits` と `sum_hits` のデフォルト値を `hits` に設定しておく必要があります

## ホット／ウォーム／コールド アーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud を使用している場合、このレッスンの手順は適用されません。ClickHouse Cloud では古いデータを移動する必要はありません。
:::

大量のデータを扱う場合、データが古くなるにつれて格納場所を移動するのは一般的な運用手法です。ここでは、ClickHouse で `TTL` コマンドの `TO DISK` および `TO VOLUME` 句を使用して、ホット／ウォーム／コールド アーキテクチャを実装する手順を示します。（ちなみに、必ずしもホット／コールド構成に限られるわけではなく、TTL を使って任意のユースケースに合わせてデータを移動できます。）

1. `TO DISK` および `TO VOLUME` オプションは、ClickHouse の設定ファイルで定義されているディスクまたはボリュームの名前を参照します。ディスクを定義する `my_system.xml`（任意のファイル名で可）という新しいファイルを作成し、そのディスクを利用するボリュームを定義します。設定をシステムに適用するには、その XML ファイルを `/etc/clickhouse-server/config.d/` に配置します。

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

2. 上記の設定では、ClickHouse が読み書きできるフォルダを指す 3 つのディスクを参照しています。ボリュームには 1 つ以上のディスクを含めることができますが、ここでは 3 つのディスクそれぞれに対してボリュームを定義しました。ディスクを確認してみましょう。

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

3. それでは、ボリュームを確認しましょう:

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

4. ここで、ホット、ウォーム、コールドの各ボリューム間でデータを移動させる `TTL` ルールを追加します。

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい `TTL` ルールは通常自動的に反映されますが、念のため次のコマンドで即時に適用を強制できます:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts` テーブルで、データが期待どおりのディスクに移動されたことを確認します。

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

レスポンスは次のようになります。

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
