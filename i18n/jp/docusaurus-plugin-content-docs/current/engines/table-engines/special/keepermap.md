description: 'このエンジンは、整合性のあるキー-バリュー ストアとして Keeper/ZooKeeper クラスターを使用し、線形一貫性のある書き込みと逐次一貫性のある読み取りを可能にします。'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap'
```


# KeeperMap {#keepermap}

このエンジンは、整合性のあるキー-バリュー ストアとして Keeper/ZooKeeper クラスターを使用し、線形一貫性のある書き込みと逐次一貫性のある読み取りを可能にします。

KeeperMap ストレージエンジンを有効にするには、テーブルが保存される ZooKeeper パスを `<keeper_map_path_prefix>` 設定で定義する必要があります。

例えば：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここで、パスは他の有効な ZooKeeper パスであることができます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンパラメータ：

- `root_path` - `table_name` が保存される ZooKeeper パス。  
このパスには `<keeper_map_path_prefix>` 設定で定義されたプレフィックスを含めてはいけません。プレフィックスは自動的に `root_path` に追加されます。  
さらに、`auxiliary_zookeeper_cluster_name:/some/path` の形式もサポートされており、ここで `auxiliary_zookeeper_cluster` は `<auxiliary_zookeepers>` 設定で定義された ZooKeeper クラスターです。  
デフォルトでは、`<zookeeper>` 設定で定義された ZooKeeper クラスターが使用されます。
- `keys_limit` - テーブル内に許可されるキーの数。  
この制限はソフトリミットであり、一部のエッジケースではテーブルにより多くのキーが含まれる可能性があります。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key` は指定する必要があり、プライマリーキーは1つのカラムのみをサポートします。プライマリーキーは ZooKeeper 内の `node name` としてバイナリ形式でシリアル化されます。 
- プライマリーキー以外のカラムは、対応する順序でバイナリにシリアル化され、シリアル化されたキーによって定義される結果ノードの値として保存されます。
- キーが `equals` または `in` フィルタリングされるクエリは、`Keeper` からのマルチキーのルックアップに最適化されます。それ以外の場合、すべての値が取得されます。

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

次のように設定します：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

各値は `(v1, v2, v3)` のバイナリシリアル化であり、`Keeper` の `/keeper_map_tables/keeper_map_table/data/serialized_key` に保存されます。  
さらに、キーの数には4のソフトリミットがあります。

同じ ZooKeeper パスで複数のテーブルが作成されると、値は少なくとも 1 つのテーブルが使用されている限り永続化されます。  
その結果、テーブルを作成する際に `ON CLUSTER` 句を使用し、複数の ClickHouse インスタンス間でデータを共有することが可能です。  
もちろん、同じパスで無関係な ClickHouse インスタンスに対して手動で `CREATE TABLE` を実行して、同じデータ共有効果を得ることも可能です。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `KeeperMap` に挿入されると、キーが存在しない場合、新しいエントリがキーのために作成されます。  
キーが存在し、設定 `keeper_map_strict_mode` が `true` に設定されている場合、例外がスローされます。そうでない場合、キーの値が上書きされます。

例：

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` を使用して削除できます。  
キーが存在し、設定 `keeper_map_strict_mode` が `true` に設定されている場合、データの取得および削除は原子的に実行できる場合にのみ成功します。

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
設定 `keeper_map_strict_mode` が `true` に設定されている場合、データの取得および更新は原子的に実行できる場合にのみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse と Hex を使ったリアルタイム アナリティクスアプリの構築](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
