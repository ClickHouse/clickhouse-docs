---
'slug': '/cloud/bestpractices/multi-tenancy'
'sidebar_label': 'マルチテナンシー'
'title': 'マルチテナンシー'
'description': 'マルチテナンシーを実装するためのベストプラクティス'
'doc_type': 'guide'
---

On a SaaSデータ分析プラットフォームでは、組織や顧客、ビジネスユニットなど、複数のテナントが同じデータベースインフラストラクチャを共有しつつ、データの論理的な分離を維持することが一般的です。これにより、異なるユーザーが同じプラットフォーム内で自分のデータに安全にアクセスできるようになります。

要件に応じて、マルチテナンシーを実装する方法はさまざまです。以下は、ClickHouse Cloudでの実装方法のガイドです。

## Shared table {#shared-table}

このアプローチでは、すべてのテナントのデータが単一の共有テーブルに格納され、各テナントのデータを識別するためのフィールド（またはフィールドのセット）が使用されます。パフォーマンスを最大化するために、このフィールドは[主キー](/sql-reference/statements/create/table#primary-key)に含めるべきです。ユーザーがそれぞれのテナントに属するデータにのみアクセスできるように、[役割ベースのアクセス制御](/operations/access-rights)を使用し、[行ポリシー](/operations/access-rights#row-policy-management)によって実装します。

> **このアプローチは管理が最も簡単であり、特にすべてのテナントが同じデータスキーマを共有し、データボリュームが中程度（< TBs）である場合に推奨します。**

すべてのテナントデータを単一のテーブルに統合することで、最適化されたデータ圧縮とメタデータのオーバーヘッドの削減を通じてストレージ効率が改善されます。さらに、すべてのデータが中央で管理されるため、スキーマの更新が簡素化されます。

この方法は、多数のテナント（潜在的に数百万）を扱うのに特に効果的です。

ただし、テナントが異なるデータスキーマを持っている場合や、時間とともに分岐することが予想される場合には、代替アプローチの方が適している場合があります。

テナント間のデータボリュームに大きなギャップがある場合、小規模なテナントは不要なクエリパフォーマンスの影響を受けることがあります。この問題は、主キーにテナントフィールドを含めることで大きく軽減されます。

### Example {#shared-table-example}

これは共有テーブルマルチテナンシーモデルの実装例です。

まず、`tenant_id`フィールドを主キーに含む共有テーブルを作成します。

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

次に、フェイクデータを挿入します。

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

それから、`user_1`と`user_2`の2つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

`user_1`と`user_2`がそれぞれのテナントのデータにのみアクセスできるように[行ポリシーを作成](/sql-reference/statements/create/row-policy)します。

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通の役割を使用して共有テーブルに対して[`GRANT SELECT`](/sql-reference/statements/grant#usage)権限を付与します。

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

これで、`user_1`として接続し、簡単な選択を実行できます。最初のテナントの行のみが返されます。

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

## Separate tables {#separate-tables}

このアプローチでは、各テナントのデータが同じデータベース内の別々のテーブルに格納され、テナントを識別するための特定のフィールドが不要になります。ユーザーアクセスは[GRANT文](/sql-reference/statements/grant)を使用して強制され、各ユーザーがそのテナントのデータを含むテーブルにのみアクセスできるようになります。

> **テナントが異なるデータスキーマを持つ場合、別々のテーブルを使用するのは良い選択です。**

クエリパフォーマンスが重要な非常に大きなデータセットを持つ少数のテナントが関与するシナリオでは、このアプローチは共有テーブルモデルを上回る可能性があります。他のテナントのデータをフィルタリングする必要がないため、クエリがより効率的に実行できます。さらに、主キーには追加のフィールド（テナントIDなど）を含める必要がないため、さらに最適化できます。

このアプローチは、1000のテナントにはスケールしません。詳細は[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### Example {#separate-tables-example}

これは別々のテーブルのマルチテナンシーモデルの実装例です。

まず、`tenant_1`のイベント用の1つのテーブルと`tenant_2`のイベント用の1つのテーブルを作成します。

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

次に、フェイクデータを挿入します。

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

それから、`user_1`と`user_2`の2つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して`GRANT SELECT`権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで、`user_1`として接続し、このユーザーに対応するテーブルから簡単な選択を実行できます。最初のテナントの行のみが返されます。

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

## Separate databases {#separate-databases}

各テナントのデータは、同じClickHouseサービス内の別々のデータベースに格納されます。

> **このアプローチは、各テナントが多数のテーブルやマテリアライズドビューを必要とし、異なるデータスキーマを持つ場合に便利です。ただし、テナントの数が多い場合、管理が難しくなる可能性があります。**

実装は別々のテーブルアプローチと似ていますが、テーブルレベルではなくデータベースレベルで権限を付与します。

このアプローチは、1000のテナントにはスケールしません。詳細は[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### Example {#separate-databases-example}

これは別のデータベースのマルチテナンシーモデルの実装例です。

まず、`tenant_1`用と`tenant_2`用の2つのデータベースを作成します。

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

次に、フェイクデータを挿入します。

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

それから、`user_1`と`user_2`の2つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して`GRANT SELECT`権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

これで、`user_1`として接続し、適切なデータベースのイベントテーブルから簡単な選択を実行できます。最初のテナントの行のみが返されます。

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

## Compute-compute separation {#compute-compute-separation}

上記の3つのアプローチは、[Warehouses](/cloud/reference/warehouses#what-is-a-warehouse)を使用することでさらに分離することができます。データは共通のオブジェクトストレージを介して共有されますが、各テナントは異なるCPU/メモリ比率の[compute-compute separation](/cloud/reference/warehouses#what-is-compute-compute-separation)により独自のコンピュートサービスを持つことができます。

ユーザー管理は、すべてのサービスが[アクセス制御を共有](/cloud/reference/warehouses#database-credentials)するため、前述のアプローチに似ています。

倉庫内の子サービスの数には限りがあります。[倉庫の制限](/cloud/reference/warehouses#limitations)を参照してください。

## Separate cloud service {#separate-service}

最も過激なアプローチは、テナントごとに異なるClickHouseサービスを使用することです。

> **これはテナントデータが法律、セキュリティ、または地理的な理由で異なる地域に保存する必要がある場合の解決策となる、あまり一般的でない方法です。**

ユーザーは、それぞれのテナントのデータにアクセスできるように、各サービスにユーザーアカウントを作成する必要があります。

このアプローチは管理が難しく、各サービスが動作するために独自のインフラストラクチャを必要とするため、オーバーヘッドが発生します。サービスは、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を介して管理でき、[公式Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)を介してオーケストレーションも可能です。

### Example {#separate-service-example}

これは別のサービスのマルチテナンシーモデルの実装例です。例では、1つのClickHouseサービス上でテーブルとユーザーを作成する様子を示していますが、これは全てのサービスに複製する必要があります。

まず、`events`テーブルを作成します。

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

フェイクデータを挿入します。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

それから、`user_1`というユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して`GRANT SELECT`権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

これで、テナント1のサービスで`user_1`として接続し、簡単な選択を実行できます。最初のテナントの行のみが返されます。

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
