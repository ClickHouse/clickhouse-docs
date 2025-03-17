---
slug: /guides/developer/ttl
sidebar_label:  有効期限 (TTL)
sidebar_position: 2
keywords: [ttl, time to live, clickhouse, old, data]
description: 有効期限 (TTL) は、特定の時間が経過した後に行やカラムを移動、削除、または集約する機能を指します。
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TTL (有効期限) を使用したデータ管理

## 有効期限の概要 {#overview-of-ttl}

有効期限 (TTL) は、特定の時間が経過した後に行やカラムを移動、削除、または集約する機能を指します。「time-to-live」という表現は古いデータを削除することにのみ適用されるように聞こえますが、TTL にはいくつかのユースケースがあります：

- 古いデータの削除：言うまでもなく、指定された時間経過後に行やカラムを削除できます
- ディスク間のデータ移動：一定の時間が経過した後、ストレージボリューム間でデータを移動できます - ホット/ウォーム/コールドアーキテクチャの展開に役立ちます
- データの集約：削除する前に、古いデータをさまざまな有用な集約や計算に集約します

:::note
TTL は、全体のテーブルまたは特定のカラムに適用できます。
:::

## TTL 構文 {#ttl-syntax}

`TTL` 句は、カラム定義の後またはテーブル定義の最後に現れることができます。`INTERVAL` 句を使用して、時間の長さ（`Date` または `DateTime` データ型である必要があります）を定義します。例えば、以下のテーブルは、`TTL` 句を持つ2つのカラムがあります：

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

- x カラムは、timestamp カラムから1ヶ月の有効期限を持っています
- y カラムは、timestamp カラムから1日の有効期限を持っています
- インターバルが経過すると、カラムは期限切れになります。ClickHouse はカラムの値をそのデータ型のデフォルト値で置き換えます。データ部分のすべてのカラム値が期限切れになると、ClickHouse はファイルシステムのデータ部分からこのカラムを削除します。

:::note
TTL ルールは変更または削除できます。詳細については、[テーブルの TTL に関する操作](/sql-reference/statements/alter/ttl.md) ページを参照してください。
:::

## TTL イベントのトリガー {#triggering-ttl-events}

期限切れの行の削除または集約は即座には行われず、テーブルのマージ時にのみ行われます。アクティブにマージされていないテーブルがある場合（いかなる理由でも）、TTL イベントをトリガーする2つの設定があります：

- `merge_with_ttl_timeout`：削除 TTL でのマージを繰り返す前の最小遅延（秒単位）。デフォルトは14400秒（4時間）です。
- `merge_with_recompression_ttl_timeout`：再圧縮 TTL（削除前にデータを集約するルール）でのマージを繰り返す前の最小遅延（秒単位）。デフォルト値：14400秒（4時間）。

したがって、デフォルトでは、TTL ルールは少なくとも4時間ごとにテーブルに適用されます。TTL ルールをより頻繁に適用する必要がある場合は、上記の設定を変更してください。

:::note
あまり推奨しない解決策ですが、`OPTIMIZE` を使用してマージを強制することもできます：

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` は、テーブルのパーツの予定外のマージを初期化し、`FINAL` はテーブルがすでに単一のパーツである場合に再最適化を強制します。
:::

## 行の削除 {#removing-rows}

特定の時間が経過した後にテーブルから行全体を削除するには、テーブルレベルで TTL ルールを定義します：

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

さらに、レコードの値に基づいて TTL ルールを定義することも可能です。これは、where条件を指定することで簡単に実装できます。複数の条件が許可されています：

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

行全体を削除するのではなく、残高とアドレスのカラムだけを期限切れさせたいとします。`customers` テーブルを修正し、両方のカラムに2時間の TTL を追加しましょう：

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## 集約の実装 {#implementing-a-rollup}
特定の時間が経過した後に行を削除したいが、報告目的のために一部のデータを保持したいとします。詳細は必要なく、過去のデータのいくつかの集約結果を取得したいのです。これは、`TTL` 表現に `GROUP BY` 句を追加し、集約結果を格納するカラムをテーブルに追加することで実現できます。

以下の `hits` テーブルでは、古い行を削除したいが、行を削除する前に `hits` カラムの合計と最大値を保持したいとします。そのために、値を格納するフィールドを追加し、合計と最大値を集約する `TTL` 句に `GROUP BY` 句を追加する必要があります：

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

`hits` テーブルに関するいくつかの注意点：

- `TTL` 句の `GROUP BY` カラムは、`PRIMARY KEY` の接頭辞でなければならず、日付の開始日で結果をグループ化したいと考えています。したがって、`toStartOfDay(timestamp)` がプライマリキーに追加されました
- 集約結果を格納するために、`max_hits` と `sum_hits` の2つのフィールドを追加しました
- `max_hits` と `sum_hits` のデフォルト値を `hits` に設定することは、`SET` 句がどのように定義されるかに基づくロジックが機能するために必要です

## ホット/ウォーム/コールドアーキテクチャの実装 {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudを使用している場合、このレッスンの手順は適用されません。ClickHouse Cloud内で古いデータを移動することを心配する必要はありません。
:::

大量のデータを扱う際の一般的な実践は、データが古くなるにつれてそのデータを移動することです。`TO DISK` および `TO VOLUME` 句を使用して、ClickHouseでホット/ウォーム/コールドアーキテクチャを実装するための手順は次のとおりです。（ちなみに、ホットとコールドだけでなく、TTLを使用してさまざまなユースケースのためにデータを移動できます。）

1. `TO DISK` および `TO VOLUME` オプションは、ClickHouse 設定ファイルで定義されたディスクまたはボリュームの名前を参照します。ディスクを定義する新しいファイル `my_system.xml`（任意のファイル名）を作成し、そのディスクを使用するボリュームを定義します。XMLファイルを `/etc/clickhouse-server/config.d/` に配置して、構成をシステムに適用します：

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

2. 上記の設定は、ClickHouse が読み書きできるフォルダを指す3つのディスクを参照しています。ボリュームは1つ以上のディスクを含むことができ、3つのディスクそれぞれにボリュームを定義しました。ディスクを表示してみましょう：

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

3. それでは、ボリュームを確認しましょう：

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

4. これで、データをホット、ウォーム、コールドボリューム間で移動させる `TTL` ルールを追加します：

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. 新しい TTL ルールを具現化する必要がありますが、強制して確認することもできます：

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. `system.parts` テーブルを使用して、データが予想したディスクに移動したかどうかを確認します：

```sql
crypto_prices テーブルのパーツがどのディスクにあるかを確認するには、system.parts テーブルを使用します：

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

結果は次のようになります：

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```

## 関連コンテンツ {#related-content}

- ブログ & ウェビナー: [ClickHouse でのデータライフサイクル管理に TTL を使用する](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
