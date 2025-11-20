---
slug: /guides/developer/ttl
sidebar_label: 'TTL (Time To Live)'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', 'old', 'data']
description: 'TTL(Time-to-Live)は、一定期間経過後に行や列を移動、削除、または集約する機能です。'
title: 'TTL(Time-to-Live)を使用したデータ管理'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TTL（Time to Live）によるデータ管理



## TTLの概要 {#overview-of-ttl}

TTL（Time-To-Live）は、一定の時間が経過した後に行や列を移動、削除、またはロールアップする機能です。「Time-To-Live」という表現は古いデータの削除にのみ適用されるように聞こえますが、TTLには以下のような複数のユースケースがあります：

- 古いデータの削除：指定した時間間隔の後に行や列を削除できます
- ディスク間でのデータ移動：一定時間経過後、ストレージボリューム間でデータを移動できます。ホット/ウォーム/コールドアーキテクチャの展開に有用です
- データのロールアップ：古いデータを削除する前に、さまざまな有用な集計や計算にロールアップできます

:::note
TTLはテーブル全体または特定の列に適用できます。
:::


## TTL構文 {#ttl-syntax}

`TTL`句はカラム定義の後、またはテーブル定義の末尾に記述できます。`INTERVAL`句を使用して期間を定義します（`Date`または`DateTime`データ型である必要があります）。例えば、次のテーブルには`TTL`句を持つ2つのカラムがあります:

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

- xカラムはtimestampカラムから1ヶ月の生存期間を持ちます
- yカラムはtimestampカラムから1日の生存期間を持ちます
- 期間が経過すると、カラムは期限切れになります。ClickHouseはカラムの値をそのデータ型のデフォルト値に置き換えます。データパート内のすべてのカラム値が期限切れになると、ClickHouseはファイルシステム内のデータパートからこのカラムを削除します。

:::note
TTLルールは変更または削除できます。詳細については[テーブルTTLの操作](/sql-reference/statements/alter/ttl.md)ページを参照してください。
:::


## TTLイベントのトリガー {#triggering-ttl-events}

期限切れの行の削除または集約は即座には行われず、テーブルのマージ時にのみ実行されます。何らかの理由でアクティブにマージされていないテーブルがある場合、TTLイベントをトリガーする2つの設定があります:

- `merge_with_ttl_timeout`: 削除TTLを伴うマージを繰り返すまでの最小遅延時間(秒単位)。デフォルトは14400秒(4時間)です。
- `merge_with_recompression_ttl_timeout`: 再圧縮TTL(削除前にデータをロールアップするルール)を伴うマージを繰り返すまでの最小遅延時間(秒単位)。デフォルト値: 14400秒(4時間)。

したがって、デフォルトでは、TTLルールは少なくとも4時間ごとに1回テーブルに適用されます。より頻繁にTTLルールを適用する必要がある場合は、上記の設定を変更してください。

:::note
推奨される解決策ではありません(頻繁に使用することも推奨しません)が、`OPTIMIZE`を使用してマージを強制することもできます:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`はテーブルのパートの予定外のマージを開始し、`FINAL`はテーブルがすでに単一のパートである場合に再最適化を強制します。
:::


## 行の削除 {#removing-rows}

一定時間経過後にテーブルから行全体を削除するには、テーブルレベルでTTLルールを定義します:

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
これはWHERE条件を指定することで簡単に実装できます。
複数の条件を指定することもできます:

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

行全体を削除する代わりに、balanceカラムとaddressカラムのみを期限切れにする場合を考えます。`customers`テーブルを変更し、両方のカラムに2時間のTTLを追加しましょう：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```


## ロールアップの実装 {#implementing-a-rollup}

一定期間経過後に行を削除したいが、レポート作成のためにデータの一部を保持したい場合を想定します。すべての詳細データは不要で、履歴データの集計結果のみが必要です。これは、`TTL`式に`GROUP BY`句を追加し、集計結果を格納するカラムをテーブルに追加することで実装できます。

次の`hits`テーブルにおいて、古い行を削除する前に`hits`カラムの合計値と最大値を保持したい場合を想定します。これらの値を格納するフィールドが必要であり、合計値と最大値をロールアップする`GROUP BY`句を`TTL`句に追加する必要があります。

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

`hits`テーブルに関する注意事項：

- `TTL`句内の`GROUP BY`カラムは`PRIMARY KEY`の接頭辞である必要があります。結果を日の開始時刻でグループ化したいため、`toStartOfDay(timestamp)`をプライマリキーに追加しています
- 集計結果を格納するために2つのフィールド（`max_hits`と`sum_hits`）を追加しています
- `SET`句の定義方法に基づき、ロジックが正しく動作するためには`max_hits`と`sum_hits`のデフォルト値を`hits`に設定する必要があります


## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge />

:::note
ClickHouse Cloudをご利用の場合、このレッスンの手順は適用されません。ClickHouse Cloudでは古いデータの移動について心配する必要はありません。
:::

大量のデータを扱う際の一般的な手法として、データが古くなるにつれて移動させることが挙げられます。以下は、`TTL`コマンドの`TO DISK`および`TO VOLUME`句を使用してClickHouseでホット/ウォーム/コールドアーキテクチャを実装する手順です。(ちなみに、必ずしもホットとコールドである必要はありません。どのようなユースケースでもTTLを使用してデータを移動できます。)

1. `TO DISK`および`TO VOLUME`オプションは、ClickHouse設定ファイルで定義されたディスクまたはボリュームの名前を参照します。ディスクを定義する`my_system.xml`(または任意のファイル名)という新しいファイルを作成し、次にそれらのディスクを使用するボリュームを定義します。XMLファイルを`/etc/clickhouse-server/config.d/`に配置して、設定をシステムに適用します:

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

2. 上記の設定は、ClickHouseが読み書きできるフォルダを指す3つのディスクを参照しています。ボリュームには1つ以上のディスクを含めることができます。ここでは3つのディスクそれぞれに対してボリュームを定義しました。ディスクを確認してみましょう:

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

3. そして...ボリュームを確認しましょう:

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

4. 次に、ホット、ウォーム、コールドボリューム間でデータを移動する`TTL`ルールを追加します:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい`TTL`ルールは自動的に適用されるはずですが、確実にするために強制実行できます:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts`テーブルを使用して、データが期待されるディスクに移動したことを確認します:

```sql
system.partsテーブルを使用して、crypto_pricesテーブルのパーツがどのディスクにあるかを確認します:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

レスポンスは次のようになります:


```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
