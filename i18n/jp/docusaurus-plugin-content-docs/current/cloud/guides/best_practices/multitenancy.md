---
slug: /cloud/bestpractices/multi-tenancy
sidebar_label: 'マルチテナンシー'
title: 'マルチテナンシー'
description: 'マルチテナンシーを実装するためのベストプラクティス'
doc_type: 'guide'
keywords: ['multitenancy', 'isolation', 'best practices', 'architecture', 'multi-tenant']
---

SaaS 型のデータ分析プラットフォームでは、組織、顧客、事業部門など複数のテナントが、自身のデータを論理的に分離したまま、同じデータベース基盤を共有することが一般的です。これにより、異なるユーザーが同じプラットフォーム上で、自分のデータに安全にアクセスできるようになります。

要件に応じて、マルチテナンシーを実装する方法はいくつかあります。以下では、それらの方式を ClickHouse Cloud 上でどのように実装するかを解説します。

## 共有テーブル  {#shared-table}

このアプローチでは、すべてのテナントのデータを 1 つの共有テーブルに保存し、各テナントのデータを識別するためのフィールド（またはフィールドの組）を使用します。パフォーマンスを最大化するため、このフィールドは[主キー](/sql-reference/statements/create/table#primary-key)に含める必要があります。各ユーザーが自分のテナントに属するデータのみにアクセスできるようにするため、[ロールベースアクセス制御](/operations/access-rights)を[行ポリシー](/operations/access-rights#row-policy-management)によって実現します。

> **すべてのテナントが同一のデータスキーマを共有し、データ量が中程度（TB 未満）の場合、管理が最も容易なため、このアプローチを推奨します。**

すべてのテナントデータを 1 つのテーブルに集約することで、データ圧縮の最適化とメタデータのオーバーヘッド削減により、ストレージ効率が向上します。さらに、すべてのデータが一元管理されるため、スキーマ更新も簡素化されます。

この方法は、（数百万単位になる可能性があるような）非常に多くのテナントを扱う場合に特に有効です。

ただし、テナントごとに異なるデータスキーマを持つ、または将来的にスキーマが互いに異なっていくことが想定される場合には、別のアプローチの方が適している可能性があります。

テナント間でデータ量に大きな差がある場合、小規模なテナントは不要にクエリ性能への悪影響を受ける可能性があります。なお、この問題は、テナントフィールドを主キーに含めることで大きく軽減されます。

### 例

これは、共有テーブルを用いたマルチテナンシーモデルの実装例です。

まず、プライマリキーに `tenant_id` フィールドを含めた共有テーブルを作成します。

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

ダミーデータを挿入します。

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

では、`user_1` と `user_2` という 2 つのユーザーを作成しましょう。

```sql
-- ユーザーを作成する
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

`user_1` と `user_2` が自分のテナントのデータのみにアクセスできるように制限するための [行ポリシーを作成](/sql-reference/statements/create/row-policy) します。

```sql
-- 行ポリシーの作成
CREATE ROW POLICY user_filter_1 ON default.events USING tenant_id=1 TO user_1
CREATE ROW POLICY user_filter_2 ON default.events USING tenant_id=2 TO user_2
```

次に、共通のロールを使用して、共有テーブルに [`GRANT SELECT`](/sql-reference/statements/grant#usage) 権限を付与します。

```sql
-- ロールを作成
CREATE ROLE user_role

-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON default.events TO user_role
GRANT user_role TO user_1
GRANT user_role TO user_2
```


これで `user_1` ユーザーとして接続し、簡単な `SELECT` を実行できます。最初のテナントの行だけが返されます。

```sql
-- user_1 でログイン中
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


## 個別テーブル {#separate-tables}

このアプローチでは、各テナントのデータを同一データベース内の個別のテーブルに保存するため、テナントを識別するための専用フィールドは不要です。[GRANT 文](/sql-reference/statements/grant)を使用してユーザーアクセスを制御し、各ユーザーが自分のテナントのデータを含むテーブルのみにアクセスできるようにします。

> **テナントごとにデータスキーマが異なる場合は、個別テーブル方式が有力な選択肢です。**

少数のテナントが非常に大きなデータセットを持ち、クエリ性能が重要となるシナリオでは、このアプローチは共有テーブルモデルより高い性能を発揮する場合があります。他テナントのデータをフィルタリングする必要がないため、クエリをより効率的に実行できます。さらに、主キーに追加フィールド（テナント ID など）を含める必要がないため、主キーをより最適化できます。 

なお、このアプローチは数千単位のテナントにはスケールしません。[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例

これは、テーブル分離型マルチテナンシーモデルの実装例です。

まず、`tenant_1`からのイベント用と`tenant_2`からのイベント用の2つのテーブルを作成しましょう。

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

ダミーデータを挿入しましょう。

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

次に、2つのユーザー `user_1` と `user_2` を作成しましょう。

```sql
-- ユーザーを作成 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与します。
GRANT SELECT ON default.events_tenant_1 TO user_1
GRANT SELECT ON default.events_tenant_2 TO user_2
```

これで `user_1` として接続し、このユーザーに対応するテーブルから単純なSELECTクエリを実行できます。最初のテナントの行のみが返されます。 

```sql
-- user_1 でログイン中
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

> **このアプローチは、各テナントが多数のテーブルやマテリアライズドビューを必要とし、かつデータスキーマが異なる場合に有用です。ただし、テナント数が多くなると管理が難しくなる可能性があります。**

実装方法は個別テーブル方式と似ていますが、テーブル単位で権限を付与する代わりに、データベース単位で権限を付与します。

このアプローチは、数千単位のテナントにはスケールしないことに注意してください。[使用制限](/cloud/bestpractices/usage-limits)を参照してください。

### 例

これは、個別のデータベースを用いるマルチテナンシーモデルの実装例です。

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
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);

-- tenant_2 用のテーブルを作成
CREATE TABLE tenant_2.events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

ダミーデータを投入しましょう。

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

それでは、`user_1` と `user_2` という 2 つのユーザーを作成しましょう。

```sql
-- ユーザーを作成 
CREATE USER user_1 IDENTIFIED BY '<password>'
CREATE USER user_2 IDENTIFIED BY '<password>'
```

次に、対応するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与します。
GRANT SELECT ON tenant_1.events TO user_1
GRANT SELECT ON tenant_2.events TO user_2
```


これで、`user_1` として接続し、対象データベースの events テーブルに対して簡単な SELECT クエリを実行できます。最初のテナントの行だけが返されます。

```sql
-- user_1 でログイン中
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

上記で説明した 3 つのアプローチは、[Warehouses](/cloud/reference/warehouses#what-is-a-warehouse) を使用することで、さらに分離できます。データは共通のオブジェクトストレージを介して共有されますが、[compute-compute separation](/cloud/reference/warehouses#what-is-compute-compute-separation) により、各テナントは異なる CPU/メモリ比率を持つ専用のコンピュートサービスを利用できます。

ユーザー管理は前述のアプローチと同様で、ウェアハウス内のすべてのサービスが[アクセス制御を共有します](/cloud/reference/warehouses#database-credentials)。

なお、1 つのウェアハウス内で作成できる子サービスの数には上限があります。詳細は [Warehouse の制限事項](/cloud/reference/warehouses#limitations) を参照してください。

## 個別のクラウドサービス {#separate-service}

最も抜本的なアプローチは、テナントごとに別々の ClickHouse サービスを用意して使用することです。 

> **このあまり一般的ではない方法は、法的要件、セキュリティ、あるいは地理的な近接性の理由から、テナントのデータを異なるリージョンに保存する必要がある場合の解決策となります。**

ユーザーは、自身のテナントのデータへアクセスできるようにするため、各サービスごとにユーザーアカウントを作成する必要があります。

このアプローチは管理が難しく、各サービスがそれぞれの実行に必要な独自のインフラストラクチャを持つ必要があるため、オーバーヘッドが発生します。サービスは [ClickHouse Cloud API](/cloud/manage/api/api-overview) を介して管理でき、[公式 Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) を用いたオーケストレーションも可能です。

### 例

これは、別サービス型マルチテナンシーモデルの実装例です。なお、この例では 1 つの ClickHouse サービス上でテーブルとユーザーを作成していますが、同様の作業をすべてのサービスで行う必要があります。

まず、テーブル `events` を作成します。

```sql
-- tenant_1用のテーブルを作成
CREATE TABLE events
(
    id UUID,                    -- 一意のイベントID
    type LowCardinality(String), -- イベントの種類
    timestamp DateTime,          -- イベントのタイムスタンプ
    user_id UInt32,               -- イベントを発生させたユーザーのID
    data String,                 -- イベントデータ
)
ORDER BY (timestamp, user_id);
```

ダミーデータを挿入しましょう。

```sql
INSERT INTO events (id, type, timestamp, user_id, data)
VALUES
('7b7e0439-99d0-4590-a4f7-1cfea1e192d1', 'user_login', '2025-03-19 08:00:00', 1001, '{"device": "desktop", "location": "LA"}'),
('846aa71f-f631-47b4-8429-ee8af87b4182', 'purchase', '2025-03-19 08:05:00', 1002, '{"item": "phone", "amount": 799}'),
('6b4d12e4-447d-4398-b3fa-1c1e94d71a2f', 'user_logout', '2025-03-19 08:10:00', 1001, '{"device": "desktop", "location": "LA"}'),
('83b5eb72-aba3-4038-bc52-6c08b6423615', 'purchase', '2025-03-19 08:45:00', 1003, '{"item": "monitor", "amount": 450}'),
('975fb0c8-55bd-4df4-843b-34f5cfeed0a9', 'user_login', '2025-03-19 08:50:00', 1004, '{"device": "desktop", "location": "LA"}')
```

では、2 人のユーザー `user_1` を作成します。

```sql
-- ユーザーを作成する
CREATE USER user_1 IDENTIFIED BY '<password>'
```

次に、該当するテーブルに対して `GRANT SELECT` 権限を付与します。

```sql
-- eventsテーブルに読み取り専用権限を付与
GRANT SELECT ON events TO user_1
```

これでテナント1向けのサービスに `user_1` として接続し、簡単な `SELECT` を実行できます。テナント1の行だけが返されます。

```sql
-- user_1 としてログイン中
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
