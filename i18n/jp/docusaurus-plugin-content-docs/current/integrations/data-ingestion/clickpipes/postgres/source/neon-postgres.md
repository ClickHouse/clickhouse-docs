---
sidebar_label: Neon Postgres
description: ClickPipesのソースとしてNeon Postgresインスタンスを設定する
slug: /integrations/clickpipes/postgres/source/neon-postgres
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'


# Neon Postgres ソース設定ガイド

これは、ClickPipesでレプリケーションに使用できるNeon Postgresの設定方法に関するガイドです。
この設定のために、[Neonコンソール](https://console.neon.tech/app/projects)にサインインしていることを確認してください。

## 権限を持つユーザーの作成 {#creating-a-user-with-permissions}

CDCに適した必要な権限を持つClickPipes用の新しいユーザーを作成し、
レプリケーションに使用する公開設定を作成しましょう。

そのためには、**SQLコンソール**タブに移動します。
ここで次のSQLコマンドを実行できます。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 公開設定を作成します。ミラーを作成する際に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<img src={neon_commands} alt="ユーザーと公開設定のコマンド"/>

**実行**をクリックして、公開設定とユーザーを準備します。

## 論理レプリケーションの有効化 {#enable-logical-replication}
Neonでは、UIを通じて論理レプリケーションを有効にできます。これはClickPipesのCDCがデータをレプリケートするために必要です。
**設定**タブに移動し、次に**論理レプリケーション**セクションに進んでください。

<img src={neon_enable_replication} alt="論理レプリケーションを有効化"/>

**有効化**をクリックして、設定を完了させます。有効にすると、以下の成功メッセージが表示されるはずです。

<img src={neon_enabled_replication} alt="論理レプリケーションが有効化された"/>

Neon Postgresインスタンスで以下の設定を確認しましょう：
```sql
SHOW wal_level; -- logicalであるべき
SHOW max_wal_senders; -- 10であるべき
SHOW max_replication_slots; -- 10であるべき
```

## IPホワイトリスト（Neonエンタープライズプラン用） {#ip-whitelisting-for-neon-enterprise-plan}
Neonエンタープライズプランをお持ちの場合は、[ClickPipesのIP](../../index.md#list-of-static-ips)をホワイトリストに登録して、ClickPipesからNeon Postgresインスタンスへのレプリケーションを許可できます。
これを行うには、**設定**タブをクリックし、**IP許可**セクションに移動します。

<img src={neon_ip_allow} alt="IPを許可する画面"/>

## 接続詳細のコピー {#copy-connection-details}
ユーザー、公開設定が準備でき、レプリケーションが有効になったので、接続詳細をコピーして新しいClickPipeを作成できます。
**ダッシュボード**に移動し、接続文字列が表示されているテキストボックスで、
表示を**パラメータのみ**に変更します。このパラメータが次のステップで必要になります。

<img src={neon_conn_details} alt="接続詳細"/>

## 次は何をしますか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。
Postgresインスタンスの設定中に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe作成プロセス中に必要になります。
