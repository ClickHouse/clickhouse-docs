---
description: 'This engine allows you to use Keeper/ZooKeeper cluster as consistent
  key-value store with linearizable writes and sequentially consistent reads.'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: '/engines/table-engines/special/keeper-map'
title: 'KeeperMap'
---




# KeeperMap {#keepermap}

このエンジンを使用すると、Keeper/ZooKeeper クラスターを一貫したキー・バリュー・ストアとして利用でき、線形整合性のある書き込みと逐次整合性のある読み取りを提供します。

KeeperMap ストレージエンジンを有効にするには、テーブルが格納される ZooKeeper パスを `<keeper_map_path_prefix>` 設定を使用して定義する必要があります。

例えば：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここで、パスは有効な別の ZooKeeper パスであれば何でも可能です。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンのパラメータ：

- `root_path` - `table_name` が格納される ZooKeeper パス。  
このパスには `<keeper_map_path_prefix>` 設定で定義されたプレフィックスを含めてはいけません。このプレフィックスは自動的に `root_path` に追加されます。  
さらに、`auxiliary_zookeeper_cluster_name:/some/path` の形式もサポートされており、`auxiliary_zookeeper_cluster` は `<auxiliary_zookeepers>` 設定の中で定義された ZooKeeper クラスターです。  
デフォルトでは、`<zookeeper>` 設定の中で定義された ZooKeeper クラスターが使用されます。
- `keys_limit` - テーブル内で許可されるキーの数。  
この制限はソフトリミットであり、一部のエッジケースではテーブルにさらに多くのキーが存在することがあるかもしれません。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key` は指定する必要があり、主キーには1つのカラムのみをサポートします。主キーは ZooKeeper 内で `node name` としてバイナリにシリアル化されます。 
- 主キー以外のカラムは、対応する順序でバイナリにシリアル化され、シリアル化されたキーで定義された結果ノードの値として格納されます。
- キーに対する `equals` または `in` フィルタリングを伴うクエリは、`Keeper` からのマルチキー検索に最適化されます。それ以外の場合は、すべての値がフェッチされます。

例：

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

と、

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```


各値は `(v1, v2, v3)` のバイナリシリアル化であり、`Keeper` の `/keeper_map_tables/keeper_map_table/data/serialized_key` に格納されます。
さらに、キーの数には4というソフトリミットがあります。

同じ ZooKeeper パスに複数のテーブルが作成されると、値はそのテーブルのうち少なくとも1つが存在する限り永続化されます。  
その結果、テーブル作成時に `ON CLUSTER` 句を使用して、複数の ClickHouse インスタンスからデータを共有することが可能です。  
もちろん、関連のない ClickHouse インスタンスで同じパスを使って手動で `CREATE TABLE` を実行し、同様のデータ共有効果を得ることも可能です。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `KeeperMap` に挿入されると、キーが存在しない場合はキーの新しいエントリが作成されます。  
キーが存在する場合、`keeper_map_strict_mode` の設定が `true` に設定されていると、例外がスローされます。そうでない場合、キーの値は上書きされます。

例：

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` を使用して削除できます。 
キーが存在し、`keeper_map_strict_mode` の設定が `true` に設定されていると、データの取得と削除は原子的に実行される場合のみ成功します。

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

値は `ALTER TABLE` クエリを使用して更新できます。主キーは更新できません。  
`keeper_map_strict_mode` の設定が `true` に設定されていると、データの取得と更新は原子的に実行される場合のみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse と Hex を使用したリアルタイム分析アプリの構築](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
