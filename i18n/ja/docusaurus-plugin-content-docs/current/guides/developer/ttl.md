---
slug: /guides/developer/ttl
sidebar_label:  有効期限 (TTL)
sidebar_position: 2
keywords: [ttl, 有効期限, clickhouse, 古い, データ]
description: 有効期限 (TTL) とは、一定の時間が経過した後に行やカラムを移動、削除、あるいは集約できる機能を指します。
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# TTL (有効期限) を使ったデータ管理

## TTLの概要 {#overview-of-ttl}

有効期限 (TTL) とは、一定の時間が経過した後に行やカラムを移動、削除、あるいは集約できる機能を指します。「有効期限」という表現は古いデータの削除にのみ適用されるように思えますが、TTLにはいくつかの使用例があります：

- 古いデータの削除: 予想通り、指定された時間間隔後に行やカラムを削除できます
- ディスク間でのデータ移動: 特定の時間が経過した後にストレージボリューム間でデータを移動できます - ホット/ウォーム/コールドアーキテクチャを展開するのに便利です
- データの集約: 古いデータを削除する前に、さまざまな有用な集計や計算に集約します

:::note
TTLは、テーブル全体または特定のカラムに適用できます。
:::

## TTLの構文 {#ttl-syntax}

`TTL`句は、カラム定義の後および/またはテーブル定義の最後に現れることができます。`INTERVAL`句を使用して、時間の長さを定義します（これは`Date`または`DateTime`データ型である必要があります）。以下のテーブルには、`TTL`句を持つ2つのカラムがあります：

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

- xカラムは、timestampカラムから1ヶ月の有効期限を持ちます
- yカラムは、timestampカラムから1日の有効期限を持ちます
- インターバルが経過すると、カラムは失効します。ClickHouseはカラム値をそのデータ型のデフォルト値に置き換えます。データパート内のすべてのカラム値が失効すると、ClickHouseはこのカラムをファイルシステム内のデータパートから削除します。

:::note
TTLルールは変更または削除することができます。詳細については、[テーブルTTLの操作](/sql-reference/statements/alter/ttl.md)ページを参照してください。
:::

## TTLイベントのトリガー {#triggering-ttl-events}

失効した行の削除または集約は即座には行われず、テーブルのマージ中にのみ発生します。アクティブにマージされていないテーブルがある場合（理由は問わず）、TTLイベントをトリガーする2つの設定があります：

- `merge_with_ttl_timeout`: 削除TTLでマージを繰り返す前の最小遅延（秒単位）。デフォルトは14400秒（4時間）です。
- `merge_with_recompression_ttl_timeout`: 再圧縮TTL（削除前にデータを集約するルール）でマージを繰り返す前の最小遅延（秒単位）。デフォルト値: 14400秒（4時間）。

したがって、デフォルトでは、TTLルールは4時間ごとに少なくとも1回テーブルに適用されます。TTLルールをより頻繁に適用する必要がある場合は、上記の設定を変更してください。

:::note
あまり良い解決策ではありません（また、頻繁に使用することを推奨しません）が、`OPTIMIZE`を使ってマージを強制することもできます：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`はテーブルのパーツのスケジュール外マージを初期化し、`FINAL`はテーブルがすでに単一のパーツである場合に再最適化を強制します。
:::

## 行の削除 {#removing-rows}

一定の時間経過後にテーブルから行全体を削除するには、テーブルレベルでTTLルールを定義します：

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

加えて、レコードの値に基づいてTTLルールを定義することも可能です。これは、WHERE条件を指定することで簡単に実装できます。複数の条件が許可されています：

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

行全体を削除するのではなく、バランスと住所のカラムのみを失効させたいとします。`customers`テーブルを修正し、両カラムに2時間のTTLを追加しましょう：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 集約の実装 {#implementing-a-rollup}
一定の時間が経過した後に行を削除したいが、報告目的のために一部のデータを保持したいとします。すべての詳細は必要なく、過去のデータの集計結果のいくつかだけを必要とします。これは、テーブルに集約結果を保存するカラムとともに、`TTL`式に`GROUP BY`句を追加することで実装できます。

次の`hits`テーブルでは、古い行を削除したいが、それらの行を削除する前に`hits`カラムの合計と最大を保持したいとします。それらの値を保持するフィールドが必要であり、合計と最大を集約する`TTL`句に`GROUP BY`句を追加する必要があります：

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

`hits`テーブルに関するいくつかの注記：

- `TTL`句内の`GROUP BY`カラムは、`PRIMARY KEY`の接頭辞である必要があり、日付の開始時刻で結果をグループ化する必要があります。そのため、`toStartOfDay(timestamp)`がプライマリーキーに追加されました
- 集約結果を保存するために、`max_hits`と`sum_hits`の2つのフィールドを追加しました
- `max_hits`と`sum_hits`のデフォルト値を`hits`に設定することが、この`SET`句の定義に基づいて機能するために必要です

## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudを使用している場合、レッスンの手順は適用されません。ClickHouse Cloudで古いデータを移動することを心配する必要はありません。
:::

大量のデータを扱う場合、データが古くなるにつれてそれを移動させることが一般的なプラクティスです。ClickHouseで`TTL`コマンドの`TO DISK`および`TO VOLUME`句を使用してホット/ウォーム/コールドアーキテクチャを実装する手順は次のとおりです。（ちなみに、ホットとコールドである必要はありません - 任意の使用例に応じてデータを移動するためにTTLを使用できます。）

1. `TO DISK`および`TO VOLUME`オプションは、ClickHouseの構成ファイルで定義されたディスクやボリュームの名前を指します。ディスクを定義する新しいファイルを`my_system.xml`（または任意のファイル名）として作成し、その後ディスクを使用するボリュームを定義します。このXMLファイルを`/etc/clickhouse-server/config.d/`に配置して、構成をシステムに適用します：

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

2. 上記の構成は、ClickHouseが読み書きすることができるフォルダを指す3つのディスクを参照しています。ボリュームは1つ以上のディスクを含むことができ、私たちは3つのディスクそれぞれのボリュームを定義しました。ディスクを表示してみましょう：

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

3. では、ボリュームを確認してみましょう：

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

4. さて、ホット、ウォーム、コールドボリューム間でデータを移動させる`TTL`ルールを追加します：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい`TTL`ルールが具現化するはずですが、確認のために強制することもできます：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts`テーブルを使用してデータが予想されるディスクに移動したことを確認します：

```sql
SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

返答は以下のようになります：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```


## 関連コンテンツ {#related-content}

- ブログ & ウェビナー: [ClickHouseにおけるデータライフサイクル管理のためのTTLの使用](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
