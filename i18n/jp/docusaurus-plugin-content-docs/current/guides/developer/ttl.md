---
slug: /guides/developer/ttl
sidebar_label: '有効期限 (TTL)'
sidebar_position: 2
keywords: ['ttl', '有効期限', 'clickhouse', '古い', 'データ']
description: '有効期限 (TTL) は、一定の時間が経過した後に行やカラムを移動、削除、または要約する機能を指します。'
title: '有効期限 (TTL) を使用したデータの管理'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 有効期限 (TTL) を使用したデータの管理

## 有効期限の概要 {#overview-of-ttl}

有効期限 (time-to-live、TTL) は、一定の時間が経過した後に行やカラムを移動、削除、または要約する機能を指します。「有効期限」という表現は古いデータの削除にのみ適用されるように聞こえますが、TTLにはいくつかの使用例があります：

- 古いデータの削除：指定した時間が経過した後に行やカラムを削除できます
- ディスク間のデータ移動：一定の時間が経過した後に、ストレージボリューム間でデータを移動できます - ホット/ウォーム/コールドアーキテクチャの展開に便利です
- データの要約：削除する前に古いデータをさまざまな有用な集計や計算に要約できます

:::note
TTLは全体のテーブルまたは特定のカラムに適用できます。
:::

## TTL 構文 {#ttl-syntax}

`TTL` 句はカラム定義の後やテーブル定義の末尾に現れることができます。 `INTERVAL` 句を使用して時間の長さを定義します（これは `Date` または `DateTime` データ型である必要があります）。例えば、次のテーブルには `TTL` 句を持つ2つのカラムがあります：

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

- x カラムは timestamp カラムから1ヶ月の有効期限を持ちます
- y カラムは timestamp カラムから1日の有効期限を持ちます
- インターバルが経過すると、カラムは期限切れになります。ClickHouseはカラムの値をそのデータ型のデフォルト値に置き換えます。データ部分内のすべてのカラム値が期限切れになった場合、ClickHouseはこのカラムをファイルシステム内のデータ部分から削除します。

:::note
TTL ルールは変更または削除できます。詳細については [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md) ページを参照してください。
:::

## TTL イベントのトリガー {#triggering-ttl-events}

期限切れの行の削除や集計は即座に行われるわけではなく、テーブルのマージ中にのみ発生します。アクティブにマージされていないテーブルがある場合（いかなる理由でも）、TTL イベントをトリガーする2つの設定があります：

- `merge_with_ttl_timeout`：削除TTLを伴うマージを繰り返す前の最小遅延（秒単位）。デフォルトは14400秒（4時間）です。
- `merge_with_recompression_ttl_timeout`：再圧縮TTLを伴うマージを繰り返す前の最小遅延（秒単位）（削除する前にデータを要約するルール）。デフォルト値：14400秒（4時間）。

したがって、デフォルトでは、TTL ルールはテーブルに4時間に1回は適用されます。より頻繁にTTLルールを適用する必要がある場合は、上記の設定を変更してください。

:::note
あまり良い解決策ではありません（また、頻繁に使用することをお勧めしません）が、`OPTIMIZE` を使用してマージを強制的に行うこともできます：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` は、テーブルのパーツの未スケジュールマージを開始し、テーブルがすでに1つのパートである場合は `FINAL` が再最適化を強制します。
:::

## 行の削除 {#removing-rows}

一定の時間が経過した後にテーブルから行全体を削除するには、テーブルレベルでTTLルールを定義します：

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
これは簡単に、where条件を指定することで実装できます。
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

## カラムの削除 {#removing-columns}

行全体を削除するのではなく、バランスとアドレスのカラムだけを期限切れにしたいとします。では、`customers` テーブルを修正し、両方のカラムに対して2時間のTTLを追加しましょう：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 要約の実装 {#implementing-a-rollup}
一定の時間が経過した後に行を削除したいが、一部のデータを報告目的のために保持したいと考えています。すべての詳細を保持したくない - 過去のデータのいくつかの集計結果だけが欲しいです。これは、`GROUP BY` 句を `TTL` 式に追加し、集計結果を保存するためのカラムをテーブルに追加することで実装できます。

次の `hits` テーブルでは、古い行を削除したいが、行を削除する前に `hits` カラムの合計と最大を保持したいとします。これを実現するためには、これらの値を保存するためのフィールドが必要で、合計と最大をロールアップする `TTL` 句に `GROUP BY` 句を追加する必要があります：

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

`hits` テーブルに関するいくつかの注意事項：

- `TTL` 句内の `GROUP BY` カラムは `PRIMARY KEY` のプレフィックスである必要があり、日付の開始時刻で結果をグループ化したいと考えています。したがって、`toStartOfDay(timestamp)` がプライマリキ―に追加されました。
- 集計結果を保存するための2つのフィールド、`max_hits` と `sum_hits` を追加しました。
- `max_hits` と `sum_hits` のデフォルト値を `hits` に設定することは、`SET` 句が定義されたとおりに動作するために必要です。

## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudを使用している場合、レッスンの手順は適用されません。ClickHouse Cloudで古いデータを移動することを心配する必要はありません。
:::

大量のデータを扱う際に一般的な慣習は、データが古くなるにつれて移動させることです。ここでは、ClickHouseの `TO DISK` および `TO VOLUME` 句を使用してホット/ウォーム/コールドアーキテクチャを実装する手順を示します。（ちなみに、ホットとコールドである必要はなく、TTLを使用してさまざまな使用例に合わせてデータを移動させることができます。）

1. `TO DISK` および `TO VOLUME` オプションは、ClickHouseの構成ファイルに定義されたディスクまたはボリュームの名前を指します。新しいファイルを `my_system.xml`（または任意のファイル名）という名前で作成し、ディスクを定義し、その後ディスクを使用するボリュームを定義します。このXMLファイルを `/etc/clickhouse-server/config.d/` に配置して、構成をシステムに適用します：

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

2. 上記の構成では、ClickHouseが読み書きできるフォルダを指す3つのディスクを参照しています。ボリュームには1つ以上のディスクを含めることができ、各ディスク用のボリュームを定義しました。それでは、ディスクを表示しましょう：

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

3. さて、ボリュームを確認しましょう：

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

4. さて、ホット、ウォーム、コールドのボリューム間でデータを移動させる `TTL` ルールを追加します：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい `TTL` ルールが適用されるはずですが、確実にするために強制的に適用できます：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts` テーブルを使用して、データが期待されるディスクに移動したか確認します：

```sql
SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

応答は次のようになります：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```

## 関連コンテンツ {#related-content}

- ブログとウェビナー: [ClickHouse におけるデータライフサイクルの管理に TTL を使用する](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
