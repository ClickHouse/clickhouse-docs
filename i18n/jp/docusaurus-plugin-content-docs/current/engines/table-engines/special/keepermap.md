---
'description': 'このエンジンを使用すると、Keeper/ZooKeeper クラスターを一貫したキー-バリュー ストアとして利用でき、線形書き込みと逐次一貫性のある読み取りが可能です。'
'sidebar_label': 'KeeperMap'
'sidebar_position': 150
'slug': '/engines/table-engines/special/keeper-map'
'title': 'KeeperMap'
'doc_type': 'reference'
---


# KeeperMap {#keepermap}

このエンジンを使用すると、Keeper/ZooKeeperクラスタを一貫したキー・バリュー・ストアとして、線形化された書き込みと逐次的一貫性のある読み取りを行うことができます。

KeeperMapストレージエンジンを有効にするには、`<keeper_map_path_prefix>` 設定を使用して、テーブルが保存されるZooKeeperパスを定義する必要があります。

例えば:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここで、パスは他の有効なZooKeeperパスであれば何でも構いません。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンのパラメータ:

- `root_path` - `table_name` が保存されるZooKeeperパス。  
このパスには `<keeper_map_path_prefix>` 設定で定義されたプレフィックスを含めてはいけません。プレフィックスは自動的に `root_path` に追加されます。  
さらに、`auxiliary_zookeeper_cluster_name:/some/path` の形式もサポートされており、ここで `auxiliary_zookeeper_cluster` は `<auxiliary_zookeepers>` 設定内で定義されたZooKeeperクラスタです。  
デフォルトでは、`<zookeeper>` 設定内で定義されたZooKeeperクラスタが使用されます。
- `keys_limit` - テーブル内に許可されるキーの数。  
この制限はソフトリミットであり、一部の特殊なケースでは、もっと多くのキーがテーブルに存在する可能性があります。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key` は指定する必要があります。主キーでは、1つのカラムのみをサポートします。主キーはZooKeeper内の `node name` としてバイナリ形式でシリアライズされます。 
- 主キー以外のカラムは、対応する順序でバイナリ形式でシリアライズされ、シリアライズされたキーによって定義された結果のノードの値として保存されます。
- `equals` または `in` フィルタリングを持つクエリは、`Keeper` からのマルチキーのルックアップに最適化されます。それ以外の場合、すべての値が取得されます。

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

で

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

各値は、`(v1, v2, v3)` のバイナリシリアライズであり、`/keeper_map_tables/keeper_map_table/data/serialized_key` に `Keeper` 内で保存されます。
さらに、キーの数にはソフトリミットとして4が設定されています。

同じZooKeeperパスに複数のテーブルが作成されると、値はそのパスを使用するテーブルが少なくとも1つ存在する限り永続化されます。  
結果として、テーブルを作成する際に `ON CLUSTER` 句を使い、複数のClickHouseインスタンスからデータを共有することが可能です。  
もちろん、無関係なClickHouseインスタンスで同じパスを使って手動で `CREATE TABLE` を実行して、同じデータ共有効果を得ることも可能です。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `KeeperMap` に挿入される際、キーが存在しない場合、新しいエントリーが作成されます。
キーが存在し、設定 `keeper_map_strict_mode` が `true` に設定されている場合、例外がスローされます。それ以外の場合、キーの値は上書きされます。

例:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` を使用して削除できます。 
キーが存在し、設定 `keeper_map_strict_mode` が `true` に設定されている場合、データの取得と削除は原子的に実行される場合にのみ成功します。

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
設定 `keeper_map_strict_mode` が `true` に設定されている場合、データの取得と更新は原子的に実行される場合にのみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 関連するコンテンツ {#related-content}

- ブログ: [Building a Real-time Analytics Apps with ClickHouse and Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
