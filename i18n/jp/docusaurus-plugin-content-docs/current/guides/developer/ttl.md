---
slug: '/guides/developer/ttl'
sidebar_label: 'TTL (Time To Live)'
sidebar_position: 2
keywords:
- 'ttl'
- 'time to live'
- 'clickhouse'
- 'old'
- 'data'
description: 'TTL (time-to-live) は、一定の時間が経過した後、行または列を移動、削除、またはロールアップする機能を指します。'
title: 'Manage Data with TTL (Time-to-live)'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TTL（有効期限）によるデータ管理

## TTLの概要 {#overview-of-ttl}

TTL（time-to-live）は、特定の時間が経過した後に行やカラムを移動、削除、または集約する機能を指します。「time-to-live」という表現は、古いデータの削除にのみ適用されるように聞こえますが、TTLにはいくつかのユースケースがあります：

- 古いデータの削除：驚くことではありませんが、指定された時間が経過した後に行やカラムを削除できます。
- ディスク間のデータ移動：一定時間が経過した後に、ストレージボリューム間でデータを移動できます - ホット/ウォーム/コールドアーキテクチャを展開するのに便利です。
- データの集約：古いデータを削除する前に、さまざまな役立つ集約や計算に集約できます。

:::note
TTLは、テーブル全体または特定のカラムに適用できます。
:::

## TTL構文 {#ttl-syntax}

`TTL`句は、カラム定義の後やテーブル定義の最後に出現することができます。時間の長さを定義するために`INTERVAL`句を使用します（データ型は`Date`または`DateTime`である必要があります）。例えば、以下のテーブルは、`TTL`句を持つ2つのカラムを持っています：

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

- xカラムはtimestampカラムから1か月の有効期限があります。
- yカラムはtimestampカラムから1日の有効期限があります。
- インターバルが経過すると、カラムは期限切れになります。ClickHouseは、そのデータ型のデフォルト値でカラムの値を置き換えます。データ部分内の全てのカラム値が期限切れになると、ClickHouseはファイルシステムからこのカラムを削除します。

:::note
TTLルールは変更または削除できます。詳細は[テーブルTTLの操作](/sql-reference/statements/alter/ttl.md)ページを参照してください。
:::

## TTLイベントのトリガー {#triggering-ttl-events}

期限切れの行の削除または集約は即時には行われず、テーブルのマージ中のみ発生します。テーブルがアクティブにマージされていない場合（何らかの理由で）、TTLイベントをトリガーする2つの設定があります：

- `merge_with_ttl_timeout`：削除TTLでマージを再実行する前の最小遅延（秒）。デフォルトは14400秒（4時間）です。
- `merge_with_recompression_ttl_timeout`：再圧縮TTL（削除前にデータを集約するルール）でマージを再実行する前の最小遅延（秒）。デフォルト値：14400秒（4時間）。

したがって、デフォルトでは、あなたのTTLルールは少なくとも4時間ごとにテーブルに適用されます。TTLルールをより頻繁に適用したい場合は、上記の設定を変更してください。

:::note
あまり良い解決策ではありませんが（また、頻繁には使用することを推奨しません）、`OPTIMIZE`を使用してマージを強制することもできます：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`は、テーブルのパーツの予定外のマージを初期化し、`FINAL`はテーブルがすでに単一のパーツである場合に再最適化を強制します。
:::

## 行の削除 {#removing-rows}

特定の時間が経過した後にテーブルから全行を削除するには、テーブルレベルでTTLルールを定義します：

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

さらに、レコードの値に基づいてTTLルールを定義することも可能です。これは、WHERE条件を指定することで簡単に実装できます。複数の条件が許可されています：

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

全行を削除するのではなく、バランスとアドレスのカラムだけを期限切れにしたいとします。`customers`テーブルを修正して、両方のカラムのTTLを2時間に設定しましょう：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## ロールアップの実装 {#implementing-a-rollup}

特定の時間が経過した後に行を削除したいが、報告目的のために一部のデータを保持したいとします。すべての詳細を必要とせず、過去のデータの集約結果をいくつか保持したい場合、`TTL`表現に`GROUP BY`句を追加し、集約結果を保存するためのカラムをテーブルに追加することで実装できます。

以下の`hits`テーブルでは、古い行を削除したいが、行を削除する前に`hits`カラムの合計と最大値を保持したいとします。それらの値を保存するフィールドが必要で、合計と最大値をロールアップする`TTL`句に`GROUP BY`句を追加する必要があります。

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

`hits`テーブルに関するいくつかの注意事項：

- `TTL`句の`GROUP BY`カラムは`PRIMARY KEY`の接頭辞でなければならず、日付の開始時刻で結果をグループ化したいと考えています。したがって、`toStartOfDay(timestamp)`が主キーに追加されました。
- 集約結果を保存するために、`max_hits`と`sum_hits`という2つのフィールドを追加しました。
- `max_hits`と`sum_hits`のデフォルト値を`hits`に設定することは、`SET`句の定義に基づいて、私たちのロジックが機能するために必要です。

## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudを使用している場合、レッスン内の手順は適用されません。ClickHouse Cloudで古いデータを移動することを心配する必要はありません。
:::

大量のデータを扱う際の一般的な慣行は、データが古くなるにつれてそのデータを移動することです。ここでは、ClickHouseの`TTL`コマンドの`TO DISK`および`TO VOLUME`句を使用してホット/ウォーム/コールドアーキテクチャを実装する手順を示します。（ちなみに、ホットとコールドのことをしなくても構いません - あなたのユースケースに合わせてデータを移動するためにTTLを使用できます。）

1. `TO DISK`および`TO VOLUME`オプションは、ClickHouseの設定ファイルで定義されたディスクまたはボリュームの名前を指します。ディスクを定義し、それを使用するボリュームを定義する新しいファイルを`my_system.xml`という名前で作成します（ファイル名は何でも構いません）。XMLファイルを`/etc/clickhouse-server/config.d/`に置いて、設定をシステムに適用します：

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

2. 上記の設定は、ClickHouseが読み取りおよび書き込みを行うことができるフォルダを指す3つのディスクを指します。ボリュームは1つまたはそれ以上のディスクを含むことができ、私たちはそれぞれの3つのディスク用のボリュームを定義しました。ディスクを表示してみましょう：

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

3. そして...ボリュームを確認します：

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

4. 次に、ホット、ウォーム、コールドボリューム間でデータを移動する`TTL`ルールを追加します：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい`TTL`ルールを具現化させる必要がありますが、強制することで確認できます：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts`テーブルを使用して、データが期待されるディスクに移動したかどうかを確認します：

```sql
crypto_pricesテーブルのパーツがどのディスクにあるかをsystem.partsテーブルで確認する：

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

レスポンスは以下のようになります：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```

## 関連コンテンツ {#related-content}

- ブログ & ウェビナー: [ClickHouseでデータライフサイクルを管理するためのTTLの使用](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
