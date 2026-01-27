---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'マルチテナンシー'
title: 'マルチテナンシー'
description: 'マルチテナンシーを実装するためのベストプラクティス'
doc_type: 'guide'
keywords: ['multitenancy', '分離', 'ベストプラクティス', 'アーキテクチャ', 'multi-tenant']
---

SaaS 型データ分析プラットフォームでは、組織、顧客、事業部門などの複数のテナントが、データを論理的に分離しながら同じデータベース基盤を共有することが一般的です。これにより、異なるユーザーが同一プラットフォーム上で自分のデータに安全にアクセスできるようになります。

要件に応じて、マルチテナンシーにはさまざまな実装方法があります。以下では、ClickHouse Cloud を用いてマルチテナンシーを実現する方法を説明します。

## 共有テーブル  \{#shared-table\}

このアプローチでは、すべてのテナントのデータを単一の共有テーブルに保存し、各テナントのデータを識別するためのフィールド（またはフィールドの組）を使用します。パフォーマンスを最大化するために、このフィールドは [primary key](/sql-reference/statements/create/table#primary-key) に含める必要があります。それぞれのテナントに属するデータにのみアクセスできるようにするため、[row policies](/operations/access-rights#row-policy-management) によって実装された [role-based access control](/operations/access-rights) を使用します。

> **このアプローチは、特にすべてのテナントが同じデータスキーマを共有し、データ量が中程度（数 TB 未満）である場合に、管理が最も容易であるため推奨します。**

すべてのテナントデータを 1 つのテーブルに集約することで、データ圧縮の最適化とメタデータオーバーヘッドの削減によりストレージ効率が向上します。さらに、すべてのデータが一元管理されているため、スキーマ更新が容易になります。

この方法は、多数（場合によっては数百万）のテナントを扱う際に特に有効です。

一方で、テナントごとに異なるデータスキーマを持つ場合や、時間の経過とともにスキーマが乖離していくことが予想される場合には、別のアプローチの方が適している可能性があります。

テナント間でデータ量に大きな差があるケースでは、小規模なテナントが不要なクエリパフォーマンスへの影響を受ける可能性があります。ただし、この問題はテナントを表すフィールドを primary key に含めることで大部分が軽減されます。

### 例 \{#shared-table-example\}

これは、共有テーブルを用いたマルチテナンシーモデルの実装例です。

まず、プライマリキーに `tenant_id` フィールドを含めた共有テーブルを作成します。

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

ダミーデータを挿入してみましょう。

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

では、`user_1` と `user_2` の 2 ユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

`user_1` と `user_2` がそれぞれ自分のテナントのデータにのみアクセスできるようにする[行ポリシーを作成します](/sql-reference/statements/create/row-policy)。

```sql
-- Create row policies
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通ロールを使用して共有テーブルに対する [`GRANT SELECT`](/sql-reference/statements/grant#usage) 権限を付与します。

```sql
-- Create role
CREATE ROLE user_role

-- Grant read only to events table.
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```


これで `user_1` として接続し、簡単な SELECT を実行できます。最初のテナントに属する行のみが返されます。

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


## テナントごとの個別テーブル \{#separate-tables\}

このアプローチでは、各テナントのデータは同じデータベース内の別々のテーブルに保存されるため、テナントを識別するための専用フィールドが不要になります。ユーザーアクセスの制御は [GRANT 文](/sql-reference/statements/grant) を使用して行い、各ユーザーは自分のテナントのデータを含むテーブルにのみアクセスできるようにします。

> **テナントごとにデータスキーマが異なる場合、個別テーブル方式は有力な選択肢です。**

クエリ性能が重要となる、少数のテナントで非常に大きなデータセットを扱うシナリオでは、このアプローチは共有テーブル方式よりも高い性能を発揮する場合があります。他のテナントのデータをフィルタリングする必要がないため、クエリをより効率的に実行できます。さらに、主キーに追加のフィールド（テナント ID など）を含める必要がないため、主キーをより最適化できます。

なお、このアプローチは数千単位のテナントにはスケールしません。[使用量の制限](/cloud/bestpractices/usage-limits) を参照してください。

### 例 \{#separate-tables-example\}

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


## 個別のデータベース \{#separate-databases\}

各テナントのデータは、同一の ClickHouse サービス内において、テナントごとに分離された個別のデータベースに保存されます。

> **この方式は、各テナントが多数のテーブルや materialized view を必要とし、かつデータスキーマがテナントごとに異なる場合に有用です。ただし、テナント数が多くなると管理が難しくなる可能性があります。**

実装は個別テーブル方式と似ていますが、テーブルレベルではなくデータベースレベルで権限を付与する点が異なります。

この方式は、テナント数が数千規模になるケースにはスケールしないことに注意してください。[使用量の制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例 \{#separate-databases-example\}

これは、別々のデータベースを用いるマルチテナンシーモデルの実装例です。

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

ダミーデータを投入します。

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

それでは、`user_1` と `user_2` の 2 つのユーザーを作成します。

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```


これで `user_1` として接続し、対象データベースの `events` テーブルに対して簡単な `SELECT` クエリを実行できます。最初のテナントの行だけが返されます。

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


## コンピュート間分離 \{#compute-compute-separation\}

上記で説明した 3 つのアプローチは、[Warehouse](/cloud/reference/warehouses#what-is-a-warehouse) を使用することで、さらに分離できます。データは共通のオブジェクトストレージを通じて共有されますが、[コンピュート間分離](/cloud/reference/warehouses#what-is-compute-compute-separation) により、各テナントは CPU/メモリ比率の異なる独自のコンピュートサービスを持つことができます。 

ユーザー管理は前述のアプローチと同様の考え方です。Warehouse 内のすべてのサービスが[アクセス制御を共有する](/cloud/reference/warehouses#database-credentials)ためです。 

Warehouse 内の子サービスの数は少数に制限されていることに注意してください。[Warehouse の制限事項](/cloud/reference/warehouses#limitations)を参照してください。

## 別個のクラウドサービス \{#separate-service\}

最も極端なアプローチは、テナントごとに独立した ClickHouse サービスを使用することです。 

> **このような（あまり一般的ではない）方法は、法的要件、セキュリティ要件、あるいは近接性の要件などの理由で、テナントデータを異なるリージョンに保存する必要がある場合の解決策となります。**

各テナントのデータにアクセスできるようにするため、利用する各サービスごとに、そのテナント用のユーザーアカウントを作成する必要があります。

このアプローチは管理が難しく、各サービスごとに実行に必要な独自のインフラストラクチャが必要となるため、オーバーヘッドも大きくなります。サービスは [ClickHouse Cloud API](/cloud/manage/api/api-overview) 経由で管理でき、[公式の Terraform プロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) を用いたオーケストレーションも可能です。

### 例 \{#separate-service-example\}

これは、サービスを分離したマルチテナンシーモデル実装の一例です。なお、この例では 1 つの ClickHouse サービス上でテーブルとユーザーを作成していますが、同様の設定をすべてのサービス上で行う必要があります。

まずは、テーブル `events` を作成します。

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

テスト用のサンプルデータを投入します。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

では、2 人のユーザー `user_1` を作成しましょう

```sql
-- Create users 
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- Grant read only to events table.
GRANT SELECT ON events TO user_1
```

これで、テナント1向けのサービスに `user_1` として接続し、単純な SELECT クエリを実行できます。テナント1の行だけが返されます。

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
