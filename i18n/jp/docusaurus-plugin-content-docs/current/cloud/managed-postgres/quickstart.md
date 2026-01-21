---
slug: /cloud/managed-postgres/quickstart
sidebar_label: 'クイックスタート'
title: 'クイックスタート'
description: '初めての Managed Postgres データベースを作成し、インスタンス ダッシュボードを確認します'
keywords: ['managed postgres', 'クイックスタート', 'はじめに', 'データベースの作成']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import createPg from '@site/static/images/managed-postgres/create-service.png';
import pgOverview from '@site/static/images/managed-postgres/overview.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import integrationLanding from '@site/static/images/managed-postgres/integration-landing.png';
import postgresAnalyticsForm from '@site/static/images/managed-postgres/postgres-analytics-form.png';
import tablePicker from '@site/static/images/managed-postgres/table-picker.png';
import getClickHouseHost from '@site/static/images/managed-postgres/get-clickhouse-host.png';
import analyticsList from '@site/static/images/managed-postgres/analytics-list.png';
import replicatedTables from '@site/static/images/managed-postgres/replicated-tables.png';


# Managed Postgres クイックスタート \{#quickstart-for-managed-postgres\}

このクイックスタートガイドでは、最初の Managed Postgres サービスを作成し、それを ClickHouse と連携させる手順を説明します。既存の ClickHouse インスタンスがあると、Managed Postgres の機能をより包括的に評価できます。

<PrivatePreviewBadge/>

## データベースを作成する \{#create-postgres-database\}

新しい Managed Postgres サービスを作成するには、Cloud コンソールのサービス一覧で **New service** ボタンをクリックします。次に、データベースタイプとして Postgres を選択できるようになります。

<Image img={createPg} alt="マネージド Postgres サービスの作成" size="md" border/>

データベースインスタンスの名前を入力し、**Create service** ボタンをクリックします。概要ページに遷移します。

<Image img={pgOverview} alt="Managed Postgres の概要" size="md" border/>

数分ほどで Managed Postgres インスタンスのプロビジョニングが完了し、利用可能になります。

## 接続してデータを用意する \{#connect-and-data\}

左側のサイドバーには [**Connect** ボタン](/cloud/managed-postgres/connection) が表示されています。これをクリックして、さまざまな形式での接続情報と接続文字列を確認します。

<Image img={connectModal} alt="Managed Postgres の接続モーダル" size="md" border />

好みの形式で接続文字列をコピーし、`psql`、DBeaver などの Postgres 互換クライアントや任意のアプリケーションライブラリを使ってデータベースに接続できます。

すぐに始められるように、以下の SQL コマンドを使って 2 つのサンプルテーブルを作成し、いくつかのデータを挿入します。

```sql
CREATE TABLE events (
   event_id SERIAL PRIMARY KEY,
   event_name VARCHAR(255) NOT NULL,
   event_type VARCHAR(100),
   event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   event_data JSONB,
   user_id INT,
   user_ip INET,
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
   user_id SERIAL PRIMARY KEY,
   name VARCHAR(100),
   country VARCHAR(50),
   platform VARCHAR(50)
);
```

events テーブルにデータを挿入します:

```sql
INSERT INTO events (event_name, event_type, event_timestamp, event_data, user_id, user_ip)
SELECT
   'Event ' || gs::text AS event_name,
   CASE
       WHEN random() < 0.5 THEN 'click'          -- 50% chance
       WHEN random() < 0.75 THEN 'view'          -- 25% chance
       WHEN random() < 0.9 THEN 'purchase'       -- 15% chance
       WHEN random() < 0.98 THEN 'signup'        -- 8% chance
       ELSE 'logout'                             -- 2% chance
   END AS event_type,
   NOW() - INTERVAL '1 day' * (gs % 365) AS event_timestamp,
   jsonb_build_object('key', 'value' || gs::text, 'additional_info', 'info_' || (gs % 100)::text) AS event_data,
   GREATEST(1, LEAST(1000, FLOOR(POWER(random(), 2) * 1000) + 1)) AS user_id,
   ('192.168.1.' || ((gs % 254) + 1))::inet AS user_ip
FROM
   generate_series(1, 1000000) gs;
```

次に、`users` テーブルにデータを挿入します:


```sql
INSERT INTO
    users (
        NAME,
        country,
        platform
    )
SELECT
    first_names [first_idx] || ' ' || last_names [last_idx] AS NAME,
    CASE
        WHEN random() < 0.25 THEN 'India'
        WHEN random() < 0.5 THEN 'USA'
        WHEN random() < 0.7 THEN 'Germany'
        WHEN random() < 0.85 THEN 'China'
        ELSE 'Other'
    END AS country,
    CASE
        WHEN random() < 0.2 THEN 'iOS'
        WHEN random() < 0.4 THEN 'Android'
        WHEN random() < 0.6 THEN 'Web'
        WHEN random() < 0.75 THEN 'Windows'
        WHEN random() < 0.9 THEN 'MacOS'
        ELSE 'Linux'
    END AS platform
FROM
    generate_series(1, 1000) AS seq
    CROSS JOIN lateral (
        SELECT
            array ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack',                 'Liam', 'Olivia', 'Noah', 'Emma', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Amelia',                 'Aarav', 'Riya', 'Arjun', 'Ananya', 'Wei', 'Li', 'Huan', 'Mei', 'Hans', 'Klaus', 'Greta', 'Sofia'] AS first_names,
            array ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Taylor',                 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Moore', 'Lee', 'Perez',                 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Zhang', 'Wang', 'Chen', 'Liu', 'Schmidt', 'Müller', 'Weber', 'Fischer'] AS last_names,
            1 + (seq % 32) AS first_idx,
            1 + ((seq / 32) :: int % 32) AS last_idx
    ) AS names;
```


## ClickHouse との統合をセットアップする \{#setup-integrate-clickhouse\}

Postgres にテーブルとデータが用意できたので、分析用にテーブルを ClickHouse にレプリケートします。まずサイドバーの **ClickHouse integration** をクリックします。次に **Replicate data in ClickHouse** をクリックします。

<Image img={integrationLanding} alt="Managed Postgres integration empty" size="md" border/>

表示されるフォームで、統合の名前を入力し、レプリケート先となる既存の ClickHouse インスタンスを選択できます。まだ ClickHouse インスタンスがない場合は、[Quickstart for ClickHouse Cloud](/cloud/clickhouse-cloud/quickstart) ガイドに従って作成してください。
:::warning Important
続行する前に、選択した ClickHouse サービスが Running 状態であることを確認してください。
:::

<Image img={postgresAnalyticsForm} alt="Managed Postgres integration form" size="md" border/>

**Next** をクリックすると、テーブルピッカーが表示されます。ここで行うことは次のとおりです:

- レプリケート先の ClickHouse データベースを選択します。
- **public** スキーマを展開し、先ほど作成した users テーブルと events テーブルを選択します。
- **Replicate data to ClickHouse** をクリックします。

<Image img={tablePicker} alt="Managed Postgres table picker" size="md" border/>

レプリケーション処理が開始され、統合の概要ページが表示されます。初回の統合では、初期インフラストラクチャのセットアップに 2～3 分かかることがあります。その間に、新しい **pg_clickhouse** 拡張機能を確認してみましょう。

## pg_clickhouse extension \{#pg-clickhouse-extension\}

**pg&#95;clickhouse** は、Postgres インターフェイスから ClickHouse のデータに対してクエリを実行できるようにするために作成した Postgres 拡張機能です。詳しい紹介は[こちら](integrations/pg_clickhouse#introduction)を参照してください。拡張機能を使用するには、任意の Postgres 互換クライアントを使用して Managed Postgres インスタンスに接続し、次の SQL コマンドを実行します。

```sql
CREATE EXTENSION pg_clickhouse;
```

次に、ClickHouse に接続するための外部データラッパー（Foreign Data Wrapper; FDW）を作成します。

```sql
CREATE SERVER ch FOREIGN DATA WRAPPER clickhouse_fdw
       OPTIONS(driver 'binary', host '<clickhouse_cloud_host>', dbname 'default');
```

上記のホストは、ClickHouse サービスを開き、サイドバーで「Connect」をクリックして「Native」を選択することで取得できます。

<Image img={getClickHouseHost} alt="Get ClickHouse host" size="md" border />

次に、Postgres ユーザーを ClickHouse サービスの認証情報にマッピングします：

```sql
CREATE USER MAPPING FOR CURRENT_USER SERVER ch 
OPTIONS (user 'default', password '<clickhouse_password>');
```

さあデータをインポートしましょう！`organization` スキーマを追加し、リモートの ClickHouse データベース内のすべてのテーブルをまとめて Postgres のスキーマにインポートします。

```sql
CREATE SCHEMA organization;
IMPORT FOREIGN SCHEMA "default" FROM SERVER ch INTO organization;
```

完了です。これで、Postgres クライアント上ですべての ClickHouse テーブルを参照できるようになりました。

```sql
postgres=# \det+ organization.*
```


## 統合後の分析 \{#analytics-after-integration\}

統合ページに戻って状態を確認しましょう。初期レプリケーションが完了しているはずです。統合名をクリックすると、その詳細を確認できます。

<Image img={analyticsList} alt="Managed Postgres の分析一覧" size="md" border/>

サービス名をクリックすると、レプリケーションした 2 つのテーブルを確認できる ClickHouse コンソールに移動します。

<Image img={replicatedTables} alt="ClickHouse 内の Managed Postgres からレプリケーションされたテーブル" size="md" border/>