---
sidebar_label: '技術リファレンス'
slug: /integrations/fivetran/reference
sidebar_position: 3
description: 'Fivetran の ClickHouse 宛先における型の対応、テーブルエンジンの詳細、メタデータカラム、デバッグ用クエリ。'
title: '技術リファレンス'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'technical reference']
---

# 技術リファレンス \{#technical-reference\}

## セットアップの詳細 \{#setup-details\}

### ユーザーとロールの管理 \{#user-and-role-management\}

`default` ユーザーは使用せず、代わりにこの Fivetran
宛先 専用のユーザーを作成することを推奨します。`default` ユーザーで実行する以下のコマンドにより、必要な
特権を持つ新しい `fivetran_user` が作成されます。

```sql
CREATE USER fivetran_user IDENTIFIED BY '<password>'; -- use a secure password generator

GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

さらに、`fivetran_user` の特定のデータベースへのアクセス権を取り消すこともできます。
たとえば、次の文を実行すると、`default` データベースへのアクセスが制限されます。

```sql
REVOKE ALL ON default.* FROM fivetran_user;
```

これらの文は、ClickHouse のSQLコンソールで実行できます.

### 高度な設定 \{#advanced-configuration\}

ClickHouse Cloud の宛先では、高度なユースケース向けにオプションの JSON 設定ファイルをサポートしています。このファイルを使用すると、バッチサイズ、並列処理、接続プール、リクエストのタイムアウトを制御する基本値を上書きして、宛先の動作を細かく調整できます。

:::note
この設定は完全に任意です。ファイルをアップロードしない場合、宛先ではほとんどのユースケースで適切に機能する基本値が使用されます。
:::

このファイルは有効な JSON であり、以下で説明する schema に準拠している必要があります。

初期設定後に設定を変更する必要がある場合は、Fivetran ダッシュボードで宛先の設定を編集し、更新したファイルをアップロードできます。

この設定ファイルには、最上位レベルのセクションがあります。

```json
{
  "destination_configurations": { ... }
}
```

この中では、ClickHouse 宛先コネクタ自体の内部動作を制御する次の設定を指定できます。
これらの設定は、コネクタがデータを ClickHouse に送信する前の処理方法に影響します。

| Setting                  | Type    | Default  | Allowed Range   | Description                                                                      |
| ------------------------ | ------- | -------- | --------------- | -------------------------------------------------------------------------------- |
| `write_batch_size`       | integer | `100000` | 5,000 – 100,000 | insert、update、replace 操作における、バッチあたりの行数。                                          |
| `select_batch_size`      | integer | `1500`   | 200 – 1,500     | 更新時に使用される SELECT クエリにおける、バッチあたりの行数。                                              |
| `mutation_batch_size`    | integer | `1500`   | 200 – 1,500     | 履歴モードでの ALTER TABLE UPDATE mutation における、バッチあたりの行数。SQL 文が大きすぎる場合は、この値を小さくしてください。 |
| `hard_delete_batch_size` | integer | `1500`   | 200 – 1,500     | 通常の同期および履歴モードでのハード削除操作における、バッチあたりの行数。SQL 文が大きすぎる場合は、この値を小さくしてください。               |

すべてのフィールドは省略可能です。フィールドが指定されていない場合は、デフォルト値が使用されます。
値が許容範囲外の場合、宛先は同期時にエラーを報告します。
不明なフィールドはそのまま無視され (警告がログに記録されます) 、エラーにはなりません。これにより、新しい設定が追加された場合でも前方互換性が保たれます。

例:

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "select_batch_size": 200
  }
}
```

## 型変換の対応 \{#type-mapping\}

Fivetran の ClickHouse 宛先 では、[Fivetran データ型](https://fivetran.com/docs/destinations#datatypes)を次のように ClickHouse の型に対応付けています。

| Fivetran type | ClickHouse type                                                      |
| ------------- | -------------------------------------------------------------------- |
| BOOLEAN       | [Bool](/sql-reference/data-types/boolean)                            |
| SHORT         | [Int16](/sql-reference/data-types/int-uint)                          |
| INT           | [Int32](/sql-reference/data-types/int-uint)                          |
| LONG          | [Int64](/sql-reference/data-types/int-uint)                          |
| BIGDECIMAL    | [Decimal(P, S)](/sql-reference/data-types/decimal)                   |
| FLOAT         | [Float32](/sql-reference/data-types/float)                           |
| DOUBLE        | [Float64](/sql-reference/data-types/float)                           |
| LOCALDATE     | [Date32](/sql-reference/data-types/date32)                           |
| LOCALDATETIME | [DateTime64(0, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| INSTANT       | [DateTime64(9, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| STRING        | [String](/sql-reference/data-types/string)                           |
| LOCALTIME     | [String](/sql-reference/data-types/string) * **                      |
| BINARY        | [String](/sql-reference/data-types/string) *                         |
| XML           | [String](/sql-reference/data-types/string) *                         |
| JSON          | [String](/sql-reference/data-types/string) *                         |

:::note

* BINARY、XML、LOCALTIME、JSON は、ClickHouse の `String` 型で任意のバイト列を表現できるため、[String](/sql-reference/data-types/string) として格納されます。元のデータ型を示すために、宛先 はカラムコメントを追加します。ClickHouse の [JSON](/sql-reference/data-types/newjson) データ型は廃止予定とされており、本番環境での利用が推奨されたこともないため、使用されません。
  ** 注意: LOCALTIME 型のサポート状況を追跡する issue: [clickhouse-fivetran-destination #15](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues/15)。
  :::

### 日付と時刻の値の範囲 \{#date-and-time-value-ranges\}

Fivetran ソースは、[0001-01-01, 9999-12-31](https://fivetran.com/docs/destinations#dateandtimevaluerange) の範囲の日付および時刻の値を送信できます。
ClickHouse Cloud の日付型がサポートする範囲はこれより狭いため、サポート対象外の値は警告なしで最も近い境界値に切り詰められます。

| Fivetran type | ClickHouse Cloud type        | Min value           | Max value           |
| ------------- | ---------------------------- | ------------------- | ------------------- |
| LOCALDATE     | Date32                       | 1900-01-01          | 2299-12-31          |
| LOCALDATETIME | DateTime64(0, &#39;UTC&#39;) | 1900-01-01 00:00:00 | 2262-04-11 23:47:16 |
| INSTANT       | DateTime64(9, &#39;UTC&#39;) | 1900-01-01 00:00:00 | 2262-04-11 23:47:16 |

* INSTANT の上限が 2262-04-11 23:47:16 であるのは、DateTime64(9) がエポックからのナノ秒を int64 として格納しており、2^63 - 1 ナノ秒がこの日時に対応するためです。
  ClickHouse 自体は、精度 &lt;= 9 の DateTime64 を 2299-12-31 23:59:59 までサポートしています。
* LOCALDATETIME の上限も、Go の ClickHouse ドライバーにある[既知のバグ](https://github.com/ClickHouse/clickhouse-go/issues/1311)により、2262-04-11 23:47:16 に制限されます。このバグでは、スケーリング前にすべての DateTime64 精度に対して `time.Time.UnixNano()` が呼び出されるため、精度 0 の場合でも 2262 年を超える日付では int64 オーバーフローが発生します。

## 宛先テーブル \{#table-structure\}

ClickHouse Cloud の宛先では、
[SharedMergeTree](/cloud/reference/shared-merge-tree) ファミリーの
[Replacing](/engines/table-engines/mergetree-family/replacingmergetree) エンジンタイプ
(具体的には `SharedReplacingMergeTree`) を使用し、`_fivetran_synced` カラムでバージョニングされます。

プライマリ (順序) キーと Fivetran メタデータカラムを除くすべてのカラムは、
`T` を [データ型の対応](#type-mapping) に基づく
ClickHouse Cloud のデータ型とする [Nullable(T)](/sql-reference/data-types/nullable) として作成されます。

テーブル構造は、コネクタに設定された Fivetran の
[同期モード](https://fivetran.com/docs/using-fivetran/features#deletedrowhandling) に応じて異なります：**ソフト削除** (デフォルト) または **履歴モード** (SCD Type 2) 。

### ソフト削除モード \{#soft-delete-mode\}

ソフト削除モードでは、すべての宛先テーブルに次のメタデータカラムが含まれます。

| カラム                 | 型                      | 説明                                                                             |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `_fivetran_synced`  | `DateTime64(9, 'UTC')` | レコードが Fivetran によって同期されたタイムスタンプ。`SharedReplacingMergeTree` のバージョンカラムとして使用されます。 |
| `_fivetran_deleted` | `Bool`                 | ソフト削除マーカー。ソースレコードが削除されると `true` に設定されます。                                       |
| `_fivetran_id`      | `String`               | 自動生成される一意の識別子。ソーステーブルに主キーがない場合にのみ存在します。                                        |

#### ソーステーブルに単一の主キーがある場合 \{#single-pk\}

たとえば、ソーステーブル `users` には、主キーカラム `id` (`INT`) と通常のカラム `name` (`STRING`) があります。
宛先テーブルは次のように定義されます。

```sql
CREATE TABLE `users`
(
    `id`                Int32,
    `name`              Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY id
SETTINGS index_granularity = 8192
```

この場合、`id` カラムがテーブルのソートキーとして選択されます。

#### ソーステーブル内の複数の主キー \{#multiple-pks\}

ソーステーブルに複数の主キーがある場合は、Fivetran のソーステーブル定義に
記載された順序で使用されます。

たとえば、主キーカラム `id` (`INT`) と `name` (`STRING`) を持つソーステーブル `items` があり、さらに
通常のカラム `description` (`STRING`) があるとします。宛先テーブルは次のように定義されます。

```sql
CREATE TABLE `items`
(
    `id`                Int32,
    `name`              String,
    `description`       Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name)
SETTINGS index_granularity = 8192
```

この場合、`id` カラムと `name` カラムがテーブルのソートキーとして選択されます。

#### ソーステーブルに主キーがない場合 \{#no-pks\}

ソーステーブルに主キーがない場合、Fivetran によって一意の識別子が `_fivetran_id` カラムとして追加されます。
ソース内の `events` テーブルに、`event` (`STRING`) と `timestamp` (`LOCALDATETIME`) の 2 つのカラムしかないケースを考えます。
この場合の宛先テーブルは次のとおりです。

```sql
CREATE TABLE events
(
    `event`             Nullable(String),
    `timestamp`         Nullable(DateTime),
    `_fivetran_id`      String,
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY _fivetran_id
SETTINGS index_granularity = 8192
```

`_fivetran_id` は一意で、他に主キーの候補がないため、テーブルのソートキーとして使用されます。

### 履歴モード (SCD Type 2) \{#history-mode\}

[履歴モード](https://fivetran.com/docs/using-fivetran/features#historymode)を有効にすると、
宛先では以前の値を上書きせず、各レコードのすべてのバージョンを保持します。
これにより、[Slowly Changing Dimension Type 2](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) (SCD Type 2) を実現し、
すべての変化について完全な監査証跡を維持できます。

履歴モードでは、すべての宛先テーブルに次のメタデータカラムが含まれます。

| Column             | Type                             | Description                                                                       |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------------- |
| `_fivetran_synced` | `DateTime64(9, 'UTC')`           | レコードが Fivetran によって同期された時点のタイムスタンプ。`SharedReplacingMergeTree` のバージョンカラムとして使用されます。 |
| `_fivetran_start`  | `DateTime64(9, 'UTC')`           | このバージョンのレコードがアクティブになった時点のタイムスタンプ。テーブルのソートキーの一部です。                                 |
| `_fivetran_end`    | `Nullable(DateTime64(9, 'UTC'))` | このバージョンが新しいバージョンに置き換えられた時点のタイムスタンプ。現在アクティブなレコードでは `2262-04-11 23:47:16` に設定されます。  |
| `_fivetran_active` | `Nullable(Bool)`                 | このレコードの現在アクティブなバージョンかどうかを示します。                                                    |
| `_fivetran_id`     | `String`                         | 自動生成される一意の識別子。ソーステーブルに主キーがない場合にのみ存在します。                                           |

`_fivetran_start` カラムは、複合ソートキーの最後の要素として、常に `ORDER BY` 句に含まれます。
これにより、同じレコードの複数のバージョン (開始時刻が異なるもの) をテーブル内で共存させることができます。

レコードが更新されると、次のようになります。

* 以前のバージョンの `_fivetran_end` は、新しいバージョンの `_fivetran_start` から 1 ナノ秒引いた値に設定され、`_fivetran_active` は `false` に設定されます。
* 新しいバージョンは、`_fivetran_active` を `true` に、`_fivetran_end` を `2262-04-11 23:47:16.000000000` (`DateTime64(9)` の最大値) に設定した状態で挿入されます。

#### ソーステーブルが単一の主キーを持つ場合 \{#history-single-pk\}

たとえば、ソーステーブル `users` には、主キーのカラム `id` (`INT`) と、通常のカラム `name` (`STRING`) および `status` (`STRING`) があります。
履歴モードの宛先テーブルは、次のように定義されます。

```sql
CREATE TABLE `users`
(
    `id`               Int32,
    `name`             Nullable(String),
    `status`           Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, _fivetran_start)
SETTINGS index_granularity = 8192
```

この場合、`id` と `_fivetran_start` が複合ソートキーを形成します。

数回同期を行うと、テーブルには次のようなデータが含まれる可能性があります。

| id | name    | status | &#95;fivetran&#95;start       | &#95;fivetran&#95;end         | &#95;fivetran&#95;active |
| -- | ------- | ------ | ----------------------------- | ----------------------------- | ------------------------ |
| 1  | name 1  | TODO   | 2025-11-10 20:57:00.000000000 | 2025-11-11 20:56:59.999000000 | false                    |
| 1  | name 11 | TODO   | 2025-11-11 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |
| 2  | name 2  | TODO   | 2025-11-10 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |

レコード `id=1` には 2 つのバージョンがあります。元のもの (`name 1`、非アクティブ) と、更新後のもの (`name 11`、アクティブ) です。
レコード `id=2` には 1 つのバージョンのみがあり、現在アクティブです。

#### ソーステーブルに複数の主キーがある場合 \{#history-multiple-pks\}

ソーステーブルに複数の主キーがある場合、それらはすべて、最後の要素として `_fivetran_start` を含めて `ORDER BY` に追加されます。

たとえば、主キーカラム `id` (`INT`) と `name` (`STRING`) を持つソーステーブル `items` があり、さらに通常のカラム `description` (`STRING`) があるとします。履歴モードの宛先テーブルは、次のように定義されます。

```sql
CREATE TABLE `items`
(
    `id`               Int32,
    `name`             String,
    `description`      Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name, _fivetran_start)
SETTINGS index_granularity = 8192
```

この場合、`id`、`name`、`_fivetran_start` が複合ソートキーとなります。

#### ソーステーブルに主キーがない場合 \{#history-no-pks\}

ソーステーブルに主キーがない場合、Fivetran によって一意の識別子が `_fivetran_id` カラムとして追加され、
`_fivetran_start` がソートキーに追加されます。
ソース内の `events` テーブルに `event` (`STRING`) と `timestamp` (`LOCALDATETIME`) の 2 つのカラムしかない場合を考えます。
履歴モードでの宛先テーブルは次のとおりです。

```sql
CREATE TABLE events
(
    `event`            Nullable(String),
    `timestamp`        Nullable(DateTime),
    `_fivetran_id`     String,
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (_fivetran_id, _fivetran_start)
SETTINGS index_granularity = 8192
```

`_fivetran_id` と `_fivetran_start` が複合ソートキーになっているためです。

### 重複のないデータの最新バージョンを選択する \{#selecting-latest-version\}

`SharedReplacingMergeTree` はバックグラウンドでデータの重複排除を行いますが、
[それが実行されるのは、いつ行われるか分からないマージ時のみです](/engines/table-engines/mergetree-family/replacingmergetree)。
ただし、`FINAL` キーワードを使用すれば、重複のないデータの最新バージョンをその場で選択できます。

```sql
SELECT *
FROM example FINAL
LIMIT 1000 
```

クエリ最適化のヒントについては、トラブルシューティングガイドの[読み込みクエリの最適化](/integrations/fivetran/troubleshooting#optimizing-reading-queries)&quot;セクションを参照してください。

## ネットワーク障害時の再試行 \{#retries-on-network-failures\}

ClickHouse Cloud の宛先は、一時的なネットワークエラーに対して指数バックオフアルゴリズムを用いて再試行します。
宛先ですでにデータが挿入されていた場合でも、重複の可能性があるデータは
`SharedReplacingMergeTree` テーブルエンジンで処理されるため、安全です。