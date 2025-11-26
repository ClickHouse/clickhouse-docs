---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'マルチテナンシー'
title: 'マルチテナンシー'
description: 'マルチテナンシーを実装するためのベストプラクティス'
doc_type: 'guide'
keywords: ['multitenancy', 'isolation', 'best practices', 'architecture', 'multi-tenant']
---

SaaS 型のデータ分析プラットフォームでは、組織、顧客、事業部門など複数のテナントが、同じデータベース基盤を共有しつつ、それぞれのデータを論理的に分離して保持することが一般的です。これにより、異なるユーザーが同一プラットフォーム上で自分のデータに安全にアクセスできるようになります。

要件に応じて、マルチテナンシーを実装する方法はいくつか存在します。以下では、ClickHouse Cloud を用いた実装方法について説明します。



## 共有テーブル

このアプローチでは、すべてのテナントのデータを単一の共有テーブルに格納し、各テナントのデータを識別するためのフィールド（またはフィールドの組み合わせ）を使用します。パフォーマンスを最大化するため、このフィールドは[主キー](/sql-reference/statements/create/table#primary-key)に含める必要があります。ユーザーが自分のテナントに属するデータのみにアクセスできるようにするために、[ロールベースのアクセス制御](/operations/access-rights)を[行ポリシー](/operations/access-rights#row-policy-management)によって実装します。

> **すべてのテナントが同一のデータスキーマを共有し、かつデータ量が中程度（TB 未満）の場合、この方法が最も管理しやすいため、このアプローチを推奨します。**

すべてのテナントデータを 1 つのテーブルに集約することで、最適化されたデータ圧縮とメタデータのオーバーヘッド削減によりストレージ効率が向上します。また、すべてのデータが一元管理されているため、スキーマ更新も簡素化されます。

この方法は、（場合によっては数百万に及ぶような）多数のテナントを扱う際に特に効果的です。

一方で、テナントごとにデータスキーマが異なる場合や、将来的にスキーマが乖離していくことが想定される場合には、別のアプローチの方が適している可能性があります。

テナント間でデータ量に大きな差がある場合、小規模なテナントは不要なクエリ性能への影響を受ける可能性があります。ただし、この問題はテナントを表すフィールドを主キーに含めることで大部分が緩和されます。

### 例

これは、共有テーブル方式のマルチテナンシーモデルの実装例です。

まず、主キーに含まれるフィールド `tenant_id` を持つ共有テーブルを作成します。

```sql
--- テーブルeventsを作成。tenant_idをプライマリキーの一部として使用
CREATE TABLE events
(
    tenant_id UInt32,                 -- テナント識別子
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (tenant_id, timestamp)
```

ダミーデータを投入しましょう。


```sql
-- ダミーデータを挿入
INSERT INTO events (tenant_id, id, type, timestamp, user_id, data)
VALUES
(1, '7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
(1, '846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
(1, '6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
(2, '7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
(2, '6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
(2, '43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
(1, '83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
(1, '975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}'),
(2, 'f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
(2, '5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}'),
```

では、`user_1` と `user_2` の 2 人のユーザーを作成しましょう。

```sql
-- ユーザーを作成 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

`user_1` と `user_2` がそれぞれ自分のテナントのデータにのみアクセスできるように制限する [行ポリシー](/sql-reference/statements/create/row-policy) を作成します。

```sql
-- 行ポリシーを作成
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通のロールを使用して、共有テーブルに対する [`GRANT SELECT`](/sql-reference/statements/grant#usage) 権限を付与します。

```sql
-- ロールを作成
CREATE ROLE user_role

-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

これで `user_1` として接続し、簡単な SELECT を実行できます。最初のテナントの行だけが返されます。

```sql
-- user_1 としてログイン済み
SELECT *
FROM events
```


┌─tenant_id─┬─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐

1. │ 1 │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login │ 2025-03-19 08:00:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
2. │ 1 │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase │ 2025-03-19 08:05:00 │ 1002 │ {"item": "phone", "amount": 799} │
3. │ 1 │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
4. │ 1 │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase │ 2025-03-19 08:45:00 │ 1003 │ {"item": "monitor", "amount": 450} │
5. │ 1 │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login │ 2025-03-19 08:50:00 │ 1004 │ {"device": "desktop", "location": "LA"} │
   └───────────┴──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘

```

```


## 個別テーブル

このアプローチでは、各テナントのデータを同じデータベース内の個別テーブルに保存するため、テナントを識別するための専用フィールドが不要になります。ユーザーアクセスは [GRANT 文](/sql-reference/statements/grant) によって制御され、各ユーザーは自分のテナントのデータを含むテーブルのみにアクセスできるようになります。

> **テナントごとにデータスキーマが異なる場合、個別テーブル方式は有力な選択肢です。**

クエリ性能が重要となる、少数のテナントで非常に大きなデータセットを扱うシナリオでは、このアプローチは共有テーブルモデルよりも高い性能を発揮する場合があります。他テナントのデータを除外するためのフィルタ処理が不要なため、クエリをより効率的に実行できます。さらに、プライマリキーにテナント ID などの追加フィールドを含める必要がないため、プライマリキーをより最適化できます。

このアプローチは、数千のテナントに対してはスケールしない点に注意してください。[使用量制限](/cloud/bestpractices/usage-limits) を参照してください。

### 例

これは、個別テーブルを用いたマルチテナンシーモデルの実装例です。

まず、`tenant_1` のイベント用に 1 つ、`tenant_2` のイベント用に 1 つ、合計 2 つのテーブルを作成します。

```sql
-- テナント1用のテーブルを作成 
CREATE TABLE events_tenant_1
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- プライマリキーは他の属性に重点を置くことが可能

-- テナント2用のテーブルを作成 
CREATE TABLE events_tenant_2
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- プライマリキーは他の属性に重点を置くことが可能
```

ダミーデータを投入します。

```sql
INSERT INTO events_tenant_1 (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```


INSERT INTO events_tenant_2 (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')

````

次に、2つのユーザー `user_1` と `user_2` を作成しましょう。

```sql
-- ユーザーを作成
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
````

次に、対応するテーブルに `GRANT SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで `user_1` として接続し、このユーザーに対応するテーブルから単純なSELECTを実行できます。最初のテナントの行のみが返されます。

```sql
-- user_1としてログイン
SELECT *
FROM default.events_tenant_1

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```


## データベースを分離する

各テナントのデータは、同一の ClickHouse サービス内でテナントごとに個別のデータベースに保存されます。

> **このアプローチは、各テナントが多数のテーブルや場合によってはマテリアライズドビューを必要とし、データスキーマも異なる場合に適しています。ただし、テナント数が多くなると管理が難しくなる可能性があります。**

実装方法はテーブルを分離するアプローチと似ていますが、テーブルレベルではなくデータベースレベルで権限を付与します。

このアプローチは数千のテナントにはスケールしないことに注意してください。詳細は [使用量の上限](/cloud/bestpractices/usage-limits) を参照してください。

### 例

これは、データベースを分離するマルチテナンシーモデルの実装例です。

まず、`tenant_1` 用と `tenant_2` 用に 2 つのデータベースを作成します。

```sql
-- tenant_1用のデータベースを作成
CREATE DATABASE tenant_1;

-- tenant_2用のデータベースを作成
CREATE DATABASE tenant_2;
```

```sql
-- tenant_1 用のテーブルを作成
CREATE TABLE tenant_1.events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);

-- tenant_2 用のテーブルを作成
CREATE TABLE tenant_2.events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

ダミーデータを挿入してみましょう。

```sql
INSERT INTO tenant_1.events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```


INSERT INTO tenant_2.events (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')

````

次に、2つのユーザー `user_1` と `user_2` を作成します。

```sql
-- ユーザーを作成
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
````

次に、対応するテーブルに `SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

これで `user_1` として接続し、適切なデータベースのeventsテーブルに対して単純なselectを実行できます。最初のテナントの行のみが返されます。

```sql
-- user_1としてログイン
SELECT *
FROM tenant_1.events

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```


## コンピュート間分離 {#compute-compute-separation}

上で説明した 3 つのアプローチは、[Warehouse](/cloud/reference/warehouses#what-is-a-warehouse) を使用することで、さらに分離して運用できます。データは共通のオブジェクトストレージを介して共有されますが、[コンピュート間分離](/cloud/reference/warehouses#what-is-compute-compute-separation) により、各テナントは異なる CPU/メモリ比率を持つ専用のコンピュートサービスを利用できます。

ユーザー管理は前述のアプローチと同様です。Warehouse 内のすべてのサービスが[アクセス制御を共有する](/cloud/reference/warehouses#database-credentials)ためです。

なお、1 つの Warehouse 内で作成できる子サービスの数はごく少数に制限されています。詳細は [Warehouse の制限事項](/cloud/reference/warehouses#limitations) を参照してください。



## 別個のクラウドサービス

最も大胆なアプローチは、テナントごとに別の ClickHouse サービスを使用することです。

> **このあまり一般的ではない方法は、法的要件、セキュリティ、あるいはレイテンシの観点から、各テナントのデータを異なるリージョンに保存する必要がある場合の解決策となります。**

ユーザーが自分のテナントのデータにアクセスできるようにするには、各サービスごとにユーザーアカウントを作成する必要があります。

このアプローチは管理が難しく、各サービスごとにオーバーヘッドが発生します。各サービスが動作するために、それぞれ専用のインフラストラクチャが必要になるためです。サービスは [ClickHouse Cloud API](/cloud/manage/api/api-overview) 経由で管理でき、[公式 Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) を利用してオーケストレーションすることも可能です。

### 例

これは、別個のサービスによるマルチテナンシーモデルの実装例です。この例では 1 つの ClickHouse サービス上でテーブルおよびユーザーを作成していますが、同じことをすべてのサービス上で複製する必要がある点に注意してください。

まず、テーブル `events` を作成します。

```sql
-- tenant_1 用のテーブルを作成
CREATE TABLE events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントタイプ
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

ダミーデータを投入しましょう。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

では、2人のユーザー `user_1` を作成します。

```sql
-- ユーザーを作成する
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、該当テーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON events TO user_1
```

これで、テナント 1 用のサービスに `user_1` として接続し、簡単な SELECT クエリを実行できます。返されるのは最初のテナントの行だけです。

```sql
-- user_1 としてログイン済み
SELECT *
FROM events
```


┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐

1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login │ 2025-03-19 08:00:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase │ 2025-03-19 08:05:00 │ 1002 │ {"item": "phone", "amount": 799} │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │ 1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase │ 2025-03-19 08:45:00 │ 1003 │ {"item": "monitor", "amount": 450} │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login │ 2025-03-19 08:50:00 │ 1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘

```

```
