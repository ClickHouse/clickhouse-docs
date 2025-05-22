---
'slug': '/cloud/bestpractices/multi-tenancy'
'sidebar_label': 'Implement multi tenancy'
'title': 'Multi tenancy'
'description': 'Best practices to implement multi tenancy'
---



On a SaaSデータ分析プラットフォームでは、組織、顧客、またはビジネスユニットなどの複数のテナントが同じデータベースインフラストラクチャを共有しつつ、それぞれのデータを論理的に分離しておくことが一般的です。これにより、異なるユーザーが同じプラットフォーム内で自分のデータに安全にアクセスすることが可能になります。

要件に応じて、マルチテナンシーを実装するためのさまざまな方法があります。以下は、ClickHouse Cloudを使用してそれらを実装する方法のガイドです。

## Shared table  {#shared-table}

このアプローチでは、すべてのテナントのデータが1つの共有テーブルに格納され、各テナントのデータを識別するためにフィールド（またはフィールドのセット）が使用されます。パフォーマンスを最大化するために、このフィールドは [primary key](/sql-reference/statements/create/table#primary-key) に含めるべきです。ユーザーがそれぞれのテナントに属するデータのみアクセスできるようにするために、[role-based access control](/operations/access-rights) を使用し、[row policies](/operations/access-rights#row-policy-management)を介して実装します。

> **私たちはこのアプローチを推奨します。これは管理が最も簡単であり、特にすべてのテナントが同じデータスキーマを共有し、データ量が中程度（< TBs）である場合に有効です。**

すべてのテナントデータを1つのテーブルに集約することで、最適化されたデータ圧縮とメタデータのオーバーヘッドの削減により、ストレージの効率が向上します。加えて、すべてのデータが中央管理されているため、スキーマの更新も簡素化されます。

この手法は、大量のテナント（数百万の可能性があります）を処理するために特に効果的です。

ただし、テナントが異なるデータスキーマを持つ場合や、時間の経過とともに分岐することが予想される場合は、他のアプローチがより適しているかもしれません。

テナント間でデータの量に大きな差がある場合は、小規模なテナントが不必要なクエリパフォーマンスの影響を受ける可能性があります。この問題は、テナントフィールドを主キーに含めることで大幅に軽減されます。

### Example {#shared-table-example}

これは共有テーブルのマルチテナンシーモデルの実装例です。

まず、`tenant_id`フィールドを主キーに含む共有テーブルを作成します。

```sql
--- Create table events. Using tenant_id as part of the primary key
CREATE TABLE events
(
    tenant_id UInt32,                 -- テナント識別子
    id UUID,                    -- ユニークイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (tenant_id, timestamp)
```

次に、偽データを挿入します。

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

次に、`user_1` と `user_2` の2つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

私たちは [create row policies](/sql-reference/statements/create/row-policy) を作成し、`user_1` と `user_2` のテナントデータのみにアクセスを制限します。

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通の役割を使用して共有テーブルに対して [`GRANT SELECT`](/sql-reference/statements/grant#usage) 権限を付与します。

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

これで、`user_1`として接続し、シンプルなセレクトを実行できます。最初のテナントからの行のみが返されます。

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

このアプローチでは、各テナントのデータが同じデータベース内の別のテーブルに格納され、テナントを識別するための特定のフィールドが不要になります。ユーザーアクセスは [GRANT statement](/sql-reference/statements/grant) を使用して強制され、各ユーザーは自分のテナントデータを含むテーブルにのみアクセスできるようにします。

> **テナントが異なるデータスキーマを持つ場合、別のテーブルを使用することは良い選択です。**

非常に大きなデータセットを持つ少数のテナントが関与するシナリオでは、クエリパフォーマンスが重要な場合、このアプローチは共有テーブルモデルを上回ることがあります。他のテナントのデータをフィルタリングする必要がないため、クエリがより効率的になることができます。さらに、主キーは追加のフィールド（テナントIDなど）を主キーに含める必要がないため、さらに最適化できます。

ただし、このアプローチは1000のテナントにはスケーラブルではありません。 [usage limits](/cloud/bestpractices/usage-limits) を参照してください。

### Example {#separate-tables-example}

これは、別々のテーブルのマルチテナンシーモデルの実装例です。

まず、`tenant_1`からのイベント用のテーブルと、`tenant_2`からのイベント用のテーブルの2つを作成します。

```sql
-- Create table for tenant 1 
CREATE TABLE events_tenant_1
(
    id UUID,                    -- ユニークイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- 主キーは他の属性に焦点を当てることができます

-- Create table for tenant 2 
CREATE TABLE events_tenant_2
(
    id UUID,                    -- ユニークイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- 主キーは他の属性に焦点を当てることができます
```

偽データを挿入します。

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

次に、`user_1`と`user_2`の2つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、それぞれのテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで、`user_1`として接続し、このユーザーに対応するテーブルからシンプルなセレクトを実行できます。最初のテナントからの行のみが返されます。

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

> **このアプローチは、各テナントが多数のテーブルと場合によってはマテリアライズドビューを必要とし、異なるデータスキーマを持つ場合に便利です。ただし、テナントの数が多い場合は管理が難しくなることがあります。**

実装は、別のテーブルアプローチと似ていますが、権限をテーブルレベルで付与する代わりに、データベースレベルで権限が付与されます。

このアプローチは、1000のテナントにはスケーラブルではありません。 [usage limits](/cloud/bestpractices/usage-limits) を参照してください。

### Example {#separate-databases-example}

これは、別のデータベースのマルチテナンシーモデルの実装例です。

まず、`tenant_1`用のデータベースと、`tenant_2`用のデータベースの2つを作成します。

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
    id UUID,                    -- ユニークイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);

-- Create table for tenant_2
CREATE TABLE tenant_2.events
(
    id UUID,                    -- ユニークイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

偽データを挿入します。

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

次に、`user_1`と`user_2`の2つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、それぞれのテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

これで、`user_1`として接続し、適切なデータベースのイベントテーブルでシンプルなセレクトを実行できます。最初のテナントからの行のみが返されます。

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

上記で説明した3つのアプローチは、[Warehouses](/cloud/reference/warehouses#what-is-a-warehouse)を使用してさらに分離することができます。データは共通のオブジェクトストレージを介して共有されますが、各テナントは [compute-compute separation](/cloud/reference/warehouses#what-is-compute-compute-separation) により異なるCPU/メモリ比率を持つ独自のコンピューティングサービスを持つことができます。

ユーザー管理は、ウェアハウス内のすべてのサービスが [share access controls](/cloud/reference/warehouses#database-credentials) を共有するため、前述のアプローチと似ています。

ウェアハウス内の子サービスの数は限られていますので、[Warehouse limitations](/cloud/reference/warehouses#limitations) を参照してください。

## Separate Cloud service {#separate-service}

最も根本的なアプローチは、テナントごとに異なるClickHouseサービスを使用することです。

> **この一般的ではない方法は、テナントのデータが法律、セキュリティ、または近接性の理由から異なる地域に保存される必要がある場合に解決策となるでしょう。**

各サービスにおいて、ユーザーはそれぞれのテナントのデータにアクセスするためのユーザーアカウントを作成する必要があります。

このアプローチは管理が難しく、各サービスには独自のインフラストラクチャが必要なため、オーバーヘッドが生じます。サービスは、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を介して管理することができ、[official Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)を使用してオーケストレーションも可能です。

### Example {#separate-service-example}

これは、別サービスのマルチテナンシーモデルの実装例です。例では、1つのClickHouseサービスにテーブルとユーザーを作成する方法が示されていますが、これをすべてのサービスに複製する必要があります。

まず、`events` テーブルを作成します。

```sql
-- Create table for tenant_1
CREATE TABLE events
(
    id UUID,                    -- ユニークイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントをトリガーしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

偽データを挿入します。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

次に、`user_1` を作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

これで、テナント1のサービスで`user_1`として接続し、シンプルなセレクトを実行できます。最初のテナントからの行のみが返されます。

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
