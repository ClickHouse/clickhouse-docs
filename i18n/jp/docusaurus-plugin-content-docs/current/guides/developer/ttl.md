---
'slug': '/guides/developer/ttl'
'sidebar_label': 'TTL（有効期限）'
'sidebar_position': 2
'keywords':
- 'ttl'
- 'time to live'
- 'clickhouse'
- 'old'
- 'data'
'description': 'TTL（有効期限）は、特定の時間が経過した後に行やカラムが移動、削除、または集計される能力を指します。'
'title': 'TTL（有効期限）を使用したデータ管理'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TTL（有効期限）を用いたデータ管理

## TTLの概要 {#overview-of-ttl}

TTL（有効期限）とは、特定の時間が経過した後に行やカラムを移動、削除、または要約する機能を指します。「有効期限」という表現は古いデータの削除にのみ適用されるように思えますが、TTLにはいくつかのユースケースがあります：

- 古いデータの削除：驚くことではありませんが、指定された時間間隔の後に行やカラムを削除できます。
- ディスク間でのデータ移動：一定の時間が経過した後、ストレージボリューム間でデータを移動できます - ホット/ウォーム/コールドアーキテクチャを展開するのに便利です。
- データのロールアップ：古いデータを削除する前に、さまざまな有用な集計や計算にロールアップします。

:::note
TTLは、テーブル全体または特定のカラムに適用できます。
:::

## TTLの構文 {#ttl-syntax}

`TTL`句は、カラム定義の後および/またはテーブル定義の最後に現れることがあります。`INTERVAL`句を使用して時間の長さ（`Date`または`DateTime`データ型である必要があります）を定義します。例えば、以下のテーブルには`TTL`句を持つ2つのカラムがあります：

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

- xカラムはタイムスタンプカラムから1ヶ月の有効期限があります。
- yカラムはタイムスタンプカラムから1日の有効期限があります。
- インターバルが経過すると、カラムは期限切れになります。ClickHouseはカラムの値をそのデータ型のデフォルト値に置き換えます。データ部分内のすべてのカラム値が期限切れになると、ClickHouseはこのカラムをファイルシステムのデータ部分から削除します。

:::note
TTLルールは変更または削除できます。詳細については、[テーブルTTLの操作](/sql-reference/statements/alter/ttl.md)ページをご覧ください。
:::

## TTLイベントのトリガー {#triggering-ttl-events}

期限切れの行の削除または集計は即座には行われず、テーブルのマージの際にのみ行われます。アクティブにマージされていないテーブルがある場合（その理由に関わらず）、TTLイベントをトリガーする2つの設定があります：

- `merge_with_ttl_timeout`：削除TTLを伴うマージを繰り返す前の最小遅延（秒単位）。デフォルトは14400秒（4時間）です。
- `merge_with_recompression_ttl_timeout`：再圧縮TTL（削除前にデータをロールアップするルール）を伴うマージを繰り返す前の最小遅延（秒単位）。デフォルト値：14400秒（4時間）。

したがって、デフォルトでは、TTLルールは少なくとも4時間ごとにテーブルに適用されます。TTLルールをより頻繁に適用する必要がある場合は、上記の設定を変更してください。

:::note
あまり良い解決策ではありません（または頻繁に使用することをお勧めしません）が、`OPTIMIZE`を使って強制的にマージすることもできます：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE`は、テーブルのパーツの未定義のマージを初期化し、`FINAL`は、すでに1つのパーツになっている場合の再最適化を強制します。
:::

## 行の削除 {#removing-rows}

特定の期間経過後にテーブルから完全な行を削除するには、テーブルレベルでTTLルールを定義します：

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

さらに、レコードの値に基づいてTTLルールを定義することも可能です。これは、where条件を指定することによって簡単に実装できます。複数の条件を許可します：

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

行全体を削除する代わりに、残高と住所のカラムだけが期限切れになることを望むとしましょう。`customers`テーブルを変更し、両方のカラムに2時間のTTLを追加します：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## ロールアップの実装 {#implementing-a-rollup}

特定の期間経過後に行を削除したいが、報告の目的で一部のデータを保持したいとします。すべての詳細を必要とするわけではありません - 歴史的データのいくつかの集計結果だけが必要です。これは、TTL式に`GROUP BY`句を追加し、集計結果を保存するためのテーブル内のいくつかのカラムを追加することで実装できます。

次の`hits`テーブルで古い行を削除したいが、行を削除する前に`hits`カラムの合計と最大値を保持したいとします。それらの値を格納するフィールドが必要で、合計と最大値をロールアップするTTL句に`GROUP BY`句を追加する必要があります：

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

- TTL句内の`GROUP BY`カラムは`PRIMARY KEY`のプレフィックスでなければならず、日始の時刻で結果をグループ化したいので、`toStartOfDay(timestamp)`が主キーに追加されました。
- 集計結果を格納する2つのフィールド`max_hits`と`sum_hits`を追加しました。
- `SET`句の定義に基づいて`max_hits`と`sum_hits`のデフォルト値を`hits`に設定することが必要です。

## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudを使用している場合、レッスン内の手順は適用されません。ClickHouse Cloud内で古いデータを移動することについて心配する必要はありません。
:::

大量のデータを扱う際の一般的な慣行は、データが古くなるにつれてそれを移動させることです。以下は、TTLコマンドの`TO DISK`および`TO VOLUME`句を使用してClickHouseでホット/ウォーム/コールドアーキテクチャを実装する手順です。（ちなみに、ホットおよびコールドである必要はありません - TTLを使用して、さまざまなユースケースに応じてデータを移動できます。）

1. `TO DISK`および`TO VOLUME`オプションは、ClickHouseの設定ファイルに定義されたディスクやボリュームの名前を指します。ディスクを定義する新しいファイル`my_system.xml`（任意のファイル名で）を作成して、ボリュームを定義します。XMLファイルは`/etc/clickhouse-server/config.d/`に配置して、設定をシステムに適用します：

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

2. 上記の設定は、ClickHouseが読み書きできるフォルダを指す三つのディスクに言及しています。ボリュームは一つ以上のディスクを含むことができます - 三つのディスクそれぞれのためにボリュームを定義しました。ディスクを確認してみましょう：

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

3. では、ボリュームを確認しましょう：

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

4. 次に、ホット、ウォーム、コールドのボリューム間でデータを移動させる`TTL`ルールを追加します：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい`TTL`ルールを具現化させる必要がありますが、確認のために強制することもできます：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts`テーブルを使用して、データが期待通りのディスクに移動したことを確認します：

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

応答は以下のようになります：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
