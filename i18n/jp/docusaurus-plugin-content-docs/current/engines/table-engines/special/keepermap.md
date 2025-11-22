---
description: 'このエンジンを使用すると、Keeper/ZooKeeper クラスターを、線形化可能な書き込みおよび逐次整合性を持つ読み取りを提供する、一貫性のあるキー・バリュー・ストアとして利用できます。'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap テーブルエンジン'
doc_type: 'reference'
---



# KeeperMap テーブルエンジン

このエンジンを使用すると、Keeper/ZooKeeper クラスターを、線形化可能な書き込みと逐次一貫性を持つ読み取りが可能な、一貫したキーバリューストアとして利用できます。

KeeperMap ストレージエンジンを有効にするには、テーブルを格納する ZooKeeper 上のパスを `<keeper_map_path_prefix>` 設定で定義する必要があります。

例えば：

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

ここで path には、他の任意の有効な ZooKeeper パスを指定できます。


## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

エンジンパラメータ:

- `root_path` - `table_name` が格納されるZooKeeperパス。  
  このパスには `<keeper_map_path_prefix>` 設定で定義されたプレフィックスを含めないでください。プレフィックスは自動的に `root_path` に追加されます。  
  さらに、`auxiliary_zookeeper_cluster_name:/some/path` という形式もサポートされており、`auxiliary_zookeeper_cluster` は `<auxiliary_zookeepers>` 設定内で定義されたZooKeeperクラスタを指します。  
  デフォルトでは、`<zookeeper>` 設定で定義されたZooKeeperクラスタが使用されます。
- `keys_limit` - テーブル内で許可されるキーの数。  
  この制限はソフトリミットであり、一部のエッジケースではより多くのキーがテーブルに格納される可能性があります。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key` は必須であり、プライマリキーには1つのカラムのみサポートされます。プライマリキーはZooKeeper内で `node name` としてバイナリ形式でシリアライズされます。
- プライマリキー以外のカラムは対応する順序でバイナリ形式にシリアライズされ、シリアライズされたキーによって定義された結果ノードの値として格納されます。
- キーに対する `equals` または `in` フィルタリングを使用したクエリは、`Keeper` からの複数キー検索に最適化されます。それ以外の場合は、すべての値が取得されます。

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

設定:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

`(v1, v2, v3)` のバイナリシリアライゼーションである各値は、`Keeper` 内の `/keeper_map_tables/keeper_map_table/data/serialized_key` に格納されます。
さらに、キーの数には4というソフトリミットが設定されます。

同じZooKeeperパス上に複数のテーブルが作成された場合、値は少なくとも1つのテーブルがそれを使用している限り永続化されます。  
その結果、テーブル作成時に `ON CLUSTER` 句を使用して、複数のClickHouseインスタンス間でデータを共有することが可能です。  
もちろん、関連性のないClickHouseインスタンス上で同じパスを使用して手動で `CREATE TABLE` を実行し、同様のデータ共有効果を得ることも可能です。


## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

`KeeperMap`に新しい行を挿入する際、キーが存在しない場合は、そのキーに対する新しいエントリが作成されます。
キーが存在し、かつ設定`keeper_map_strict_mode`が`true`に設定されている場合は例外がスローされます。それ以外の場合は、キーの値が上書きされます。

例:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は`DELETE`クエリまたは`TRUNCATE`を使用して削除できます。
キーが存在し、かつ設定`keeper_map_strict_mode`が`true`に設定されている場合、データの取得と削除はアトミックに実行できる場合にのみ成功します。

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
設定`keeper_map_strict_mode`が`true`に設定されている場合、データの取得と更新はアトミックに実行される場合にのみ成功します。

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseとHexによるリアルタイム分析アプリの構築](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
