---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'マルチテナンシー'
title: 'マルチテナンシー'
description: 'マルチテナンシーを実装するためのベストプラクティス'
doc_type: 'guide'
keywords: ['マルチテナンシー', '分離', 'ベストプラクティス', 'アーキテクチャ', 'マルチテナント']
---

SaaS 型のデータ分析プラットフォームでは、組織、顧客、事業部門などの複数のテナントが、データを論理的に分離したまま同じデータベースインフラストラクチャを共有することが一般的です。これにより、異なるユーザーが同一プラットフォーム上で自身のデータに安全にアクセスできるようになります。

要件に応じて、マルチテナンシーにはいくつかの実現方法があります。以下では、ClickHouse Cloud を用いてそれらを実装する方法を説明します。

## 共有テーブル  {#shared-table}

このアプローチでは、すべてのテナントのデータを 1 つの共有テーブルに保存し、各テナントのデータを識別するためのフィールド（またはフィールドのセット）を使用します。パフォーマンスを最大化するために、このフィールドは[プライマリキー](/sql-reference/statements/create/table#primary-key)に含める必要があります。各ユーザーが自分のテナントに属するデータのみにアクセスできるようにするため、[行ポリシー](/operations/access-rights#row-policy-management)で実装された[ロールベースのアクセス制御](/operations/access-rights)を使用します。

> **このアプローチは、すべてのテナントが同じデータスキーマを共有し、データ量が中程度（TB 未満）の場合に、管理が最も容易なため推奨されます。**

すべてのテナントデータを単一テーブルに統合することで、最適化されたデータ圧縮とメタデータオーバーヘッドの削減によりストレージ効率が向上します。さらに、すべてのデータが一元管理されるため、スキーマ更新が簡素化されます。

この方法は、（数百万規模といった）多数のテナントを扱う場合に特に有効です。

一方で、テナントごとにデータスキーマが異なる、または将来的に乖離していくことが想定される場合には、別のアプローチの方が適している可能性があります。

テナント間でデータ量に大きな差がある場合、小規模なテナントは不要なクエリ性能への影響を受ける可能性があります。ただし、この問題はテナントフィールドをプライマリキーに含めることで大部分が軽減されます。

### 例 {#shared-table-example}

これは、共有テーブルを使用したマルチテナンシーモデルの実装例です。

まず、プライマリキーに `tenant_id` フィールドを含む共有テーブルを作成します。

```sql
--- Create table events. Using tenant_id as part of the primary key
CREATE TABLE events
(
    tenant_id UInt32,                 -- Tenant identifier
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (tenant_id, timestamp)
```

ダミーデータを挿入しましょう。

```sql
-- Insert some dummy rows
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

では、`user_1` と `user_2` という 2 つのユーザーを作成しましょう。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

[`user_1` と `user_2` が自分のテナントのデータのみにアクセスできるように制限する行ポリシーを作成](/sql-reference/statements/create/row-policy)します。

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通のロールを使用して共有テーブルに対する [`GRANT SELECT`](/sql-reference/statements/grant#usage) 権限を付与します。

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```


これで `user_1` として接続し、簡単な SELECT クエリを実行できます。最初のテナントの行だけが返されます。

```sql
-- Logged as user_1
SELECT *
FROM events

   ┌─tenant_id─┬─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │         1 │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │         1 │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │         1 │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │         1 │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │         1 │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └───────────┴──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```


## テーブルを分離する {#separate-tables}

このアプローチでは、各テナントのデータを同じデータベース内の個別のテーブルに格納するため、テナントを識別するための専用フィールドが不要になります。ユーザーのアクセス権は [GRANT 文](/sql-reference/statements/grant) を使用して制御され、各ユーザーは自分のテナントのデータを含むテーブルにのみアクセスできるよう保証されます。

> **テナントごとにデータスキーマが異なる場合、テーブルを分離する方法は有力な選択肢となります。**

クエリパフォーマンスが重要となる、少数のテナントに対して非常に大きなデータセットを扱うシナリオでは、このアプローチは共有テーブルモデルより高い性能を発揮する場合があります。他のテナントのデータをフィルタリングする必要がないため、クエリをより効率的に実行できます。さらに、プライマリキーにテナント ID などの追加フィールドを含める必要がないため、プライマリキーをさらに最適化できます。 

なお、このアプローチは数千規模のテナントにはスケールしません。[使用制限](/cloud/bestpractices/usage-limits) を参照してください。

### 例 {#separate-tables-example}

これは、テーブル分離型マルチテナンシーモデルの実装例です。

まず、`tenant_1` からのイベント用のテーブルと `tenant_2` からのイベント用のテーブルの2つを作成しましょう。

```sql
-- Create table for tenant 1 
CREATE TABLE events_tenant_1
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id) -- Primary key can focus on other attributes

-- Create table for tenant 2 
CREATE TABLE events_tenant_2
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id) -- Primary key can focus on other attributes
```

ダミーデータを挿入します。

```sql
INSERT INTO events_tenant_1 (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')

INSERT INTO events_tenant_2 (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')
```

次に、2人のユーザー `user_1` と `user_2` を作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで`user_1`として接続し、このユーザーに対応するテーブルから簡単なSELECTを実行できます。最初のテナントの行のみが返されます。 

```sql
-- Logged as user_1
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


## 個別データベース {#separate-databases}

各テナントのデータは、同じ ClickHouse サービス内の個別のデータベースに保存されます。

> **この方式は、各テナントが多数のテーブルや materialized view を必要とし、かつ異なるデータスキーマを持つ場合に有効です。ただし、テナント数が多い場合には管理が困難になる可能性があります。**

実装方法は「個別テーブル」方式と似ていますが、テーブルレベルではなくデータベースレベルで権限を付与する点が異なります。

この方式は、数千規模のテナントにはスケールしないことに注意してください。[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例 {#separate-databases-example}

これは、独立したデータベースを用いるマルチテナンシーモデルの実装例です。

まず、`tenant_1` 用と `tenant_2` 用に 2 つのデータベースを作成します。

```sql
-- Create database for tenant_1
CREATE DATABASE tenant_1;

-- Create database for tenant_2
CREATE DATABASE tenant_2;
```

```sql
-- Create table for tenant_1
CREATE TABLE tenant_1.events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);

-- Create table for tenant_2
CREATE TABLE tenant_2.events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
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

INSERT INTO tenant_2.events (id, type, timestamp, user_id, data)
VALUES
('7162f8ea-8bfd-486a-a45e-edfc3398ca93', 'user_login', '2025-03-19 08:12:00', 2001, '{"device": "mobile", "location": "SF"}'),
('6b5f3e55-5add-479e-b89d-762aa017f067', 'purchase', '2025-03-19 08:15:00', 2002, '{"item": "headphones", "amount": 199}'),
('43ad35a1-926c-4543-a133-8672ddd504bf', 'user_logout', '2025-03-19 08:20:00', 2001, '{"device": "mobile", "location": "SF"}'),
('f50aa430-4898-43d0-9d82-41e7397ba9b8', 'purchase', '2025-03-19 08:55:00', 2003, '{"item": "laptop", "amount": 1200}'),
('5c150ceb-b869-4ebb-843d-ab42d3cb5410', 'user_login', '2025-03-19 09:00:00', 2004, '{"device": "mobile", "location": "SF"}')
```

では、`user_1` と `user_2` という 2 人のユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```


これで、`user_1` として接続し、該当するデータベースの events テーブルに対して簡単な SELECT クエリを実行できます。最初のテナントの行だけが返されます。

```sql
-- Logged as user_1
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


## コンピュート間の分離 {#compute-compute-separation}

上で説明した3つのアプローチは、[Warehouse](/cloud/reference/warehouses#what-is-a-warehouse) を使用することで、さらに分離することができます。データは共通のオブジェクトストレージを介して共有されますが、[コンピュート間の分離](/cloud/reference/warehouses#what-is-compute-compute-separation) により、各テナントは CPU/メモリ比率の異なる専用のコンピュートサービスを持つことができます。

ユーザー管理は前述のアプローチと同様です。Warehouse 内のすべてのサービスが[アクセス制御を共有](/cloud/reference/warehouses#database-credentials)するためです。

また、Warehouse 内の子サービスの数は少数に制限されている点に注意してください。[Warehouse の制限事項](/cloud/reference/warehouses#limitations)を参照してください。

## 別個のクラウドサービス {#separate-service}

最も抜本的なアプローチは、テナントごとに別々の ClickHouse サービスを使用することです。 

> **このあまり一般的ではない方法は、法的要件やセキュリティ、レイテンシなどの理由から、テナントのデータを異なるリージョンに保存する必要がある場合の解決策となります。**

各サービスごとにユーザーアカウントを作成し、そのユーザーが自分のテナントのデータにアクセスできるようにする必要があります。

このアプローチは管理が難しく、サービスごとに専用のインフラストラクチャが必要となるため、オーバーヘッドも増加します。サービスは [ClickHouse Cloud API](/cloud/manage/api/api-overview) を介して管理でき、[公式 Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) を用いたオーケストレーションも可能です。

### 例 {#separate-service-example}

これは、個別サービス型マルチテナンシーモデルの実装例です。例では 1 つの ClickHouse サービス上でテーブルとユーザーを作成していますが、同じ内容をすべてのサービス上でも作成する必要があります。

まず、テーブル `events` を作成します。

```sql
-- Create table for tenant_1
CREATE TABLE events
(
    id UUID,                    -- Unique event ID
    type LowCardinality(String), -- Type of event
    timestamp DateTime,          -- Timestamp of the event
    user_id UInt32,               -- ID of the user who triggered the event
    data String,                 -- Event data
)
ORDER BY (timestamp, user_id);
```

ダミーデータを投入してみましょう。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

それでは、2 つのユーザー `user_1` を作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

これで、テナント1向けのサービスに `user_1` として接続し、簡単な select クエリを実行できます。テナント1の行だけが返されます。

```sql
-- Logged as user_1
SELECT *
FROM events

   ┌─id───────────────────────────────────┬─type────────┬───────────timestamp─┬─user_id─┬─data────────────────────────────────────┐
1. │ 7b7e0439-99d0-4590-a4f7-1cfea1e192d1 │ user_login  │ 2025-03-19 08:00:00 │    1001 │ {"device": "desktop", "location": "LA"} │
2. │ 846aa71f-f631-47b4-8429-ee8af87b4182 │ purchase    │ 2025-03-19 08:05:00 │    1002 │ {"item": "phone", "amount": 799}        │
3. │ 6b4d12e4-447d-4398-b3fa-1c1e94d71a2f │ user_logout │ 2025-03-19 08:10:00 │    1001 │ {"device": "desktop", "location": "LA"} │
4. │ 83b5eb72-aba3-4038-bc52-6c08b6423615 │ purchase    │ 2025-03-19 08:45:00 │    1003 │ {"item": "monitor", "amount": 450}      │
5. │ 975fb0c8-55bd-4df4-843b-34f5cfeed0a9 │ user_login  │ 2025-03-19 08:50:00 │    1004 │ {"device": "desktop", "location": "LA"} │
   └──────────────────────────────────────┴─────────────┴─────────────────────┴─────────┴─────────────────────────────────────────┘
```
