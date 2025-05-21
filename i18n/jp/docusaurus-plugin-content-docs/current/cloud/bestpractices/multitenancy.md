---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'マルチテナンシーの実装'
title: 'マルチテナンシー'
description: 'マルチテナンシーを実装するためのベストプラクティス'
---

SaaSデータ分析プラットフォームでは、組織、顧客、またはビジネスユニットなどの複数のテナントが、同じデータベースインフラストラクチャを共有し、データの論理的な分離を保つことが一般的です。これにより、異なるユーザーが同じプラットフォーム内で自分のデータに安全にアクセスできるようになります。

要件によって、マルチテナンシーの実装方法はさまざまです。以下は、ClickHouse Cloudでの実装方法に関するガイドです。

## 共有テーブル  {#shared-table}

このアプローチでは、すべてのテナントのデータが単一の共有テーブルに保存され、各テナントのデータを識別するためにフィールド（またはフィールドのセット）が使用されます。パフォーマンスを最大化するためには、このフィールドを[主キー](/sql-reference/statements/create/table#primary-key)に含めるべきです。ユーザーがそれぞれのテナントに属するデータのみをアクセスできるようにするために、[ロールベースのアクセス制御](/operations/access-rights)を使用し、[行ポリシー](/operations/access-rights#row-policy-management)を通じて実装します。

> **このアプローチは、すべてのテナントが同じデータスキーマを共有し、データボリュームが中程度である場合（< TB）、特に管理が簡単であるため推奨されます。**

すべてのテナントデータを単一のテーブルに統合することで、データ圧縮が最適化され、メタデータオーバーヘッドが減少するため、ストレージ効率が向上します。さらに、すべてのデータが中央で管理されるため、スキーマの更新も簡素化されます。

この方法は、多くのテナント（潜在的には数百万）を扱うのに特に効果的です。

ただし、テナントが異なるデータスキーマを持つ場合や、時間の経過とともに分岐すると予想される場合は、代替アプローチがより適しているかもしれません。

テナント間でデータボリュームに大きな差がある場合、小規模なテナントは不必要なクエリ性能への影響を受ける可能性があります。この問題は、主キーにテナントフィールドを含めることで大幅に軽減されます。

### 例 {#shared-table-example}

これは、共有テーブルのマルチテナンシーモデルを実装した例です。

まず、主キーに`tenant_id`フィールドを含む共有テーブルを作成しましょう。

```sql
--- テーブルeventsを作成します。tenant_idを主キーの一部として使用します。
CREATE TABLE events
(
    tenant_id UInt32,                 -- テナント識別子
    id UUID,                    -- ユニークなイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを引き起こしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (tenant_id, timestamp)
```

偽データを挿入しましょう。

```sql
-- ダミー行をいくつか挿入します
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

次に、`user_1`と`user_2`という2人のユーザーを作成します。

```sql
-- ユーザーを作成します
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

`user_1`と`user_2`に、テナントのデータのみへのアクセスを制限する[行ポリシー](/sql-reference/statements/create/row-policy)を作成します。

```sql
-- 行ポリシーを作成します
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通のロールを使用して共有テーブルに対して[`SELECT権限`](/sql-reference/statements/grant#usage)を付与します。

```sql
-- ロールを作成します
CREATE ROLE user_role

-- eventsテーブルに対して読み取り専用の権限を付与します。
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```

これで`user_1`として接続し、単純なSELECTを実行できます。最初のテナントからの行のみが返されます。

```sql
-- user_1としてログインしました
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

## 別テーブル {#separate-tables}

このアプローチでは、各テナントのデータが同じデータベース内の別々のテーブルに保存され、特定のフィールドを使ってテナントを識別する必要がありません。ユーザーアクセスは[GRANT文](/sql-reference/statements/grant)を使用して強制され、各ユーザーは自分のテナントのデータが含まれるテーブルのみアクセスできます。

> **異なるデータスキーマを持つテナントがいる場合、別テーブルを使用することは良い選択です。**

クエリパフォーマンスが重要な非常に大きなデータセットを持つ少数のテナントを伴うシナリオでは、このアプローチが共有テーブルモデルを上回ることがあります。他のテナントのデータをフィルターする必要がないため、クエリは効率的になる可能性があります。さらに、主キーは最適化の余地があります。主キーにテナントIDのような余分なフィールドを含める必要がないからです。

なお、このアプローチは1000のテナントにはスケールしません。[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例 {#separate-tables-example}

これは、別テーブルのマルチテナンシーモデルを実装した例です。

まず、`tenant_1`からのイベント用のテーブルと、`tenant_2`からのイベント用のテーブルの2つを作成します。

```sql
-- tenant_1用のテーブルを作成します
CREATE TABLE events_tenant_1
(
    id UUID,                    -- ユニークなイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを引き起こしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- 主キーは他の属性に焦点を合わせられます

-- tenant_2用のテーブルを作成します
CREATE TABLE events_tenant_2
(
    id UUID,                    -- ユニークなイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを引き起こしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id) -- 主キーは他の属性に焦点を合わせられます
```

偽データを挿入しましょう。

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

次に、`user_1`と`user_2`という2人のユーザーを作成します。

```sql
-- ユーザーを作成します
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

対応するテーブルに`GRANT SELECT`権限を付与します。

```sql
-- eventsテーブルに対して読み取り専用の権限を付与します。
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで`user_1`として接続し、このユーザーに対応するテーブルから単純なSELECTを実行できます。最初のテナントからの行のみが返されます。

```sql
-- user_1としてログインしました
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

## 別データベース {#separate-databases}

各テナントのデータは、同じClickHouseサービス内の別々のデータベースに保存されます。

> **このアプローチは、各テナントが多数のテーブルやおそらくマテリアライズドビューを必要とし、異なるデータスキーマを持つ場合に便利です。ただし、テナントの数が多い場合は管理が困難になる可能性があります。**

実装は別テーブルアプローチに似ていますが、特権をテーブルレベルではなくデータベースレベルで付与します。

なお、このアプローチは1000のテナントにはスケールしません。[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例 {#separate-databases-example}

これは、別データベースのマルチテナンシーモデルを実装した例です。

まず、`tenant_1`用のデータベースと、`tenant_2`用のデータベースの2つを作成しましょう。

```sql
-- tenant_1用のデータベースを作成します
CREATE DATABASE tenant_1;

-- tenant_2用のデータベースを作成します
CREATE DATABASE tenant_2;
```

```sql
-- tenant_1用のテーブルを作成します
CREATE TABLE tenant_1.events
(
    id UUID,                    -- ユニークなイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを引き起こしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);

-- tenant_2用のテーブルを作成します
CREATE TABLE tenant_2.events
(
    id UUID,                    -- ユニークなイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを引き起こしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

偽データを挿入しましょう。

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

次に、`user_1`と`user_2`という2人のユーザーを作成します。

```sql
-- ユーザーを作成します
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

対応するテーブルに`GRANT SELECT`権限を付与します。

```sql
-- eventsテーブルに対して読み取り専用の権限を付与します。
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```

これで`user_1`として接続し、適切なデータベースのイベントテーブルから単純なSELECTを実行できます。最初のテナントからの行のみが返されます。

```sql
-- user_1としてログインしました
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

## コンピュート・コンピュートの分離 {#compute-compute-separation}

上記の3つのアプローチは、[ウェアハウス](/cloud/reference/warehouses#what-is-a-warehouse)を使用することによってさらに分離することも可能です。データは共通のオブジェクトストレージを通じて共有されますが、各テナントは[コンピュート・コンピュートの分離](/cloud/reference/warehouses#what-is-compute-compute-separation)により異なるCPU/メモリ比率を持つ独自のコンピュートサービスを持つことができます。

ユーザー管理は、ウェアハウス内のすべてのサービスが[アクセス制御を共有する](/cloud/reference/warehouses#database-credentials)ため、以前に説明したアプローチと似ています。

なお、ウェアハウス内の子サービスの数は制限があります。[ウェアハウスの制限](/cloud/reference/warehouses#limitations)を参照してください。

## 別個のクラウドサービス {#separate-service}

最も過激なアプローチは、テナントごとに異なるClickHouseサービスを使用することです。

> **このあまり一般的ではない方法は、テナントのデータが法的、セキュリティ、あるいは接近に関する理由で異なる地域に保存される必要がある場合の解決策となり得ます。**

ユーザーは、それぞれのテナントのデータにアクセスできる各サービスごとにアカウントを作成する必要があります。

このアプローチは管理が難しく、それぞれのサービスが独自のインフラストラクチャを必要とするため、オーバーヘッドが発生します。サービスは[ClickHouse Cloud API](/cloud/manage/api/api-overview)を介して管理でき、[公式のTerraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)を介したオーケストレーションも可能です。

### 例 {#separate-service-example}

これは、別サービスのマルチテナンシーモデルを実装した例です。この例では、1つのClickHouseサービスでテーブルとユーザーを作成する方法を示していますが、これをすべてのサービスで再現する必要があります。

まず、テーブル`events`を作成しましょう。

```sql
-- tenant_1用のテーブルを作成します
CREATE TABLE events
(
    id UUID,                    -- ユニークなイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを引き起こしたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

偽データを挿入しましょう。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

次に、2人のユーザー`user_1`を作成します。

```sql
-- ユーザーを作成します
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに`GRANT SELECT`権限を付与します。

```sql
-- eventsテーブルに対して読み取り専用の権限を付与します。
GRANT SELECT ON events TO user_1
```

これで、テナント1のサービスに`user_1`として接続し、単純なSELECTを実行できます。最初のテナントからの行のみが返されます。

```sql
-- user_1としてログインしました
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
