---
description: 'このエンジンを使用すると、Keeper/ZooKeeper クラスターを、書き込みは線形化可能、読み取りは逐次一貫性を持つ、一貫性のあるキーバリューストアとして利用できます。'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap テーブルエンジン'
doc_type: 'reference'
---

# KeeperMap テーブルエンジン {#keepermap-table-engine}

このエンジンを使用すると、Keeper/ZooKeeper クラスターを、線形化可能な書き込みと逐次一貫な読み取りを備えた一貫性のあるキー・バリュー ストアとして利用できます。

KeeperMap ストレージエンジンを有効化するには、テーブルを保存する ZooKeeper パスを `<keeper_map_path_prefix>` 設定で定義する必要があります。

例:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここで path には任意の有効な ZooKeeper パスを指定できます。

## テーブルを作成する {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンのパラメータ:

* `root_path` - `table_name` が保存される ZooKeeper パス。\
  このパスには、設定の `<keeper_map_path_prefix>` で定義されたプレフィックスを含めないでください。プレフィックスは自動的に `root_path` に付加されます。\
  さらに、`auxiliary_zookeeper_cluster_name:/some/path` の形式もサポートされます。ここで `auxiliary_zookeeper_cluster` は `<auxiliary_zookeepers>` 設定内で定義された ZooKeeper クラスタです。\
  既定では、`<zookeeper>` 設定内で定義された ZooKeeper クラスタが使用されます。
* `keys_limit` - テーブル内で許可されるキー数。\
  この制限はソフトリミットであり、特定のエッジケースではより多くのキーがテーブルに格納される可能性があります。
* `primary_key_name` – カラムリスト内の任意のカラム名。
* `primary key` は必ず指定する必要があり、主キーとしては 1 つのカラムのみをサポートします。主キーは ZooKeeper 内で `node name` としてバイナリ形式でシリアライズされます。
* 主キー以外のカラムは、対応する順序でバイナリにシリアライズされ、シリアライズされたキーによって定義される生成ノードの値として保存されます。
* キーに対して `equals` または `in` によるフィルタを行うクエリは、`Keeper` からの複数キーのルックアップとして最適化され、それ以外の場合はすべての値を取得します。

例:

```sql
CREATE TABLE keeper_map_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = KeeperMap('/keeper_map_table', 4)
PRIMARY KEY key
```

と共に

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

各値は `(v1, v2, v3)` をバイナリ形式にシリアライズしたものであり、`Keeper` 内の `/keeper_map_tables/keeper_map_table/data/serialized_key` に格納されます。
また、キー数には 4 というソフトリミットがあります。

同じ ZooKeeper パス上に複数のテーブルが作成された場合、そのパスを使用しているテーブルが少なくとも 1 つ存在する限り、値は永続化されます。\
そのため、テーブル作成時に `ON CLUSTER` 句を使用して、複数の ClickHouse インスタンス間でデータを共有することが可能です。\
もちろん、関連しない ClickHouse インスタンス間であっても、同じパスを指定して手動で `CREATE TABLE` を実行することで、同様のデータ共有効果を得ることができます。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `KeeperMap` に挿入されるとき、キーが存在しない場合は、そのキー用の新しいエントリが作成されます。
キーが存在し、かつ `keeper_map_strict_mode` が `true` に設定されている場合は、例外がスローされます。そうでない場合、そのキーに対する値は上書きされます。

例:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` を使用して削除できます。
キーが存在しており、設定 `keeper_map_strict_mode` が `true` の場合、データの取得および削除は、それらをアトミックに実行できる場合にのみ成功します。

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### 更新 {#updates}

値は `ALTER TABLE` クエリを使用して更新できます。プライマリキーは更新できません。
`keeper_map_strict_mode` を `true` に設定すると、データの取得および更新は、アトミックに実行された場合にのみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 関連コンテンツ {#related-content}

- ブログ記事: [ClickHouse と Hex を利用したリアルタイム分析アプリの構築](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
