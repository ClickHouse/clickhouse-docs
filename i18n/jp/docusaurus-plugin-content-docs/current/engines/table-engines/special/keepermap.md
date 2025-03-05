---
slug: /engines/table-engines/special/keeper-map
sidebar_position: 150
sidebar_label: KeeperMap
title: "KeeperMap"
description: "このエンジンは、Keeper/ZooKeeper クラスターを一貫したキー-バリュー ストアとして使用し、線形化可能な書き込みと順次一貫性のある読み取りを提供します。"
---


# KeeperMap {#keepermap}

このエンジンは、Keeper/ZooKeeper クラスターを一貫したキー-バリュー ストアとして使用し、線形化可能な書き込みと順次一貫性のある読み取りを提供します。

KeeperMap ストレージエンジンを有効にするには、テーブルが保存される ZooKeeper パスを `<keeper_map_path_prefix>` 設定を使用して定義する必要があります。

例えば:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここで、パスは有効な他の ZooKeeper パスであれば何でも構いません。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンパラメータ:

- `root_path` - `table_name` が保存される ZooKeeper パス。  
このパスには、`<keeper_map_path_prefix>` 設定で定義されたプレフィックスを含めてはいけません。このプレフィックスは自動的に `root_path` に追加されます。  
さらに、`auxiliary_zookeeper_cluster_name:/some/path` の形式もサポートされており、`auxiliary_zookeeper_cluster` は `<auxiliary_zookeepers>` 設定内で定義された ZooKeeper クラスターです。  
デフォルトでは、`<zookeeper>` 設定内で定義された ZooKeeper クラスターが使用されます。
- `keys_limit` - テーブル内に許可されるキーの数。  
この制限はソフトリミットであり、特定のエッジケースでは、テーブルにより多くのキーが存在する可能性があります。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key` は必ず指定する必要があり、プライマリーキーには1つのカラムのみがサポートされています。プライマリーキーはバイナリとしてシリアル化され、ZooKeeper 内の `node name` として保存されます。 
- プライマリーキー以外のカラムは、対応する順序でバイナリにシリアル化され、シリアル化されたキーによって定義された結果ノードの値として保存されます。
- `equals` または `in` フィルタリングのキーのあるクエリは、`Keeper` からのマルチキーのルックアップに最適化されます。それ以外の場合、すべての値が取得されます。

例:

``` sql
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

`<clickhouse>` 設定が次のようになっている場合:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

各値、すなわち `(v1, v2, v3)` のバイナリシリアル化は、`Keeper` の `/keeper_map_tables/keeper_map_table/data/serialized_key` 内に保存されます。  
さらに、キーの数にはソフトリミットとして4があります。

同じ ZooKeeper パスに複数のテーブルが作成された場合、値は少なくとも1つのテーブルがそれを使用する限り永続化されます。  
その結果、テーブル作成時に `ON CLUSTER` 句を使用し、複数の ClickHouse インスタンス間でデータを共有することが可能です。  
もちろん、関連のない ClickHouse インスタンスで同じパスを使用して `CREATE TABLE` を手動で実行することで、同じデータ共有効果を得ることもできます。

## サポートされる操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `KeeperMap` に挿入されると、キーが存在しない場合には、そのキーの新しいエントリが作成されます。
キーが存在し、設定 `keeper_map_strict_mode` が `true` に設定されている場合、例外がスローされます。それ以外の場合、キーの値が上書きされます。

例:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` を使用して削除できます。  
もしキーが存在し、設定 `keeper_map_strict_mode` が `true` に設定されている場合、データの取得と削除は原子的に実行できる場合にのみ成功します。

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

値は `ALTER TABLE` クエリを使用して更新できます。プライマリーキーは更新できません。
もし設定 `keeper_map_strict_mode` が `true` に設定されている場合、データの取得と更新は原子的に実行される場合にのみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse と Hex でリアルタイム分析アプリを構築](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
