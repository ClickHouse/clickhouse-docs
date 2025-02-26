---
slug: /engines/table-engines/special/keeper-map
sidebar_position: 150
sidebar_label: KeeperMap
title: "KeeperMap"
description: "このエンジンは、整合性のあるキー・バリュー・ストアとしてKeeper/ZooKeeperクラスタを使用し、線形的に書き込み、逐次的に整合性のある読み取りを可能にします。"
---

# KeeperMap {#keepermap}

このエンジンは、整合性のあるキー・バリュー・ストアとしてKeeper/ZooKeeperクラスタを使用し、線形的に書き込み、逐次的に整合性のある読み取りを可能にします。

KeeperMapストレージエンジンを有効にするには、テーブルが保存されるZooKeeperパスを`<keeper_map_path_prefix>`構成を使って定義する必要があります。

例えば:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここでパスは他の有効なZooKeeperパスでも構いません。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンのパラメータ:

- `root_path` - `table_name` が保存されるZooKeeperパス。  
このパスは`<keeper_map_path_prefix>`構成で定義されたプレフィックスを含んではいけません。プレフィックスは`root_path`に自動的に追加されます。  
さらに、`auxiliary_zookeeper_cluster_name:/some/path`形式もサポートされており、ここで`auxiliary_zookeeper_cluster`は`<auxiliary_zookeepers>`構成内で定義されたZooKeeperクラスタです。  
デフォルトでは、`<zookeeper>`構成内で定義されたZooKeeperクラスタが使用されます。
- `keys_limit` - テーブル内で許可されるキーの数。  
この制限は柔軟な制限であり、いくつかの特殊なケースではテーブルにより多くのキーが存在する可能性があります。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key`は必ず指定する必要があり、主キーは1つのカラムのみをサポートします。主キーはZooKeeper内で`node name`としてバイナリ形式でシリアライズされます。 
- 主キー以外のカラムは、対応する順序でバイナリ形式でシリアライズされ、シリアライズされたキーによって定義されたノードの値として保存されます。
- キーの`equals`または`in`フィルタリングを伴うクエリは、`Keeper`からのマルチキーLookupに最適化されます。そうでない場合は、すべての値が取得されます。

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

次のように指定します。

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

各値は`(v1, v2, v3)`のバイナリシリアライズであり、`Keeper`の`/keeper_map_tables/keeper_map_table/data/serialized_key`に保存されます。  
また、キーの数には4という柔軟な制限があります。

同じZooKeeperパスで複数のテーブルが作成されると、値は少なくとも1つのテーブルがそれを使用している限り持続されます。  
その結果、テーブルを作成する際に`ON CLUSTER`句を使用し、複数のClickHouseインスタンスからデータを共有することが可能です。  
もちろん、無関係なClickHouseインスタンスで同じパスを使って手動で`CREATE TABLE`を実行して同じデータ共有効果を得ることも可能です。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が`KeeperMap`に挿入されると、キーが存在しない場合はキーの新しいエントリが作成されます。  
キーが存在する場合、`keeper_map_strict_mode`を`true`に設定していると例外がスローされ、それ以外の場合はキーの値が上書きされます。

例:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は`DELETE`クエリまたは`TRUNCATE`を使用して削除できます。  
キーが存在する場合、`keeper_map_strict_mode`を`true`に設定していると、データの取得と削除は原子性が保証される場合にのみ成功します。

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

値は`ALTER TABLE`クエリを使用して更新できます。主キーは更新できません。  
`keeper_map_strict_mode`を`true`に設定していると、データの取得と更新は原子性が保証される場合にのみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## 関連コンテンツ {#related-content}

- Blog: [ClickHouseとHexを使用してリアルタイム分析アプリを構築する](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
