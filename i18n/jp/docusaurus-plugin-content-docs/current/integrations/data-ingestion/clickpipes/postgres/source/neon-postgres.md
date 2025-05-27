---
'sidebar_label': 'Neon Postgres'
'description': 'Set up Neon Postgres instance as a source for ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/neon-postgres'
'title': 'Neon Postgres Source Setup Guide'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres ソースセットアップガイド

これは、ClickPipesでのレプリケーションに使用できるNeon Postgresをセットアップする方法に関するガイドです。
このセットアップを行うには、[Neonコンソール](https://console.neon.tech/app/projects)にサインインしていることを確認してください。

## 権限のあるユーザーの作成 {#creating-a-user-with-permissions}

CDCに適した必要な権限を持つClickPipes用の新しいユーザーを作成し、レプリケーションに使用する公開物を作成しましょう。

そのためには、**SQLエディタ**タブに移動します。
ここで、次のSQLコマンドを実行できます：

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- USERにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- 公開物を作成します。ミラーを作成する際にこれを使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image size="lg" img={neon_commands} alt="ユーザーと公開物のコマンド" border/>

**実行**をクリックして、公開物とユーザーが準備できるようにします。

## 論理レプリケーションの有効化 {#enable-logical-replication}
Neonでは、UIを介して論理レプリケーションを有効にできます。これは、ClickPipesのCDCがデータをレプリケートするために必要です。
**設定**タブに移動し、次に**論理レプリケーション**セクションに進みます。

<Image size="lg" img={neon_enable_replication} alt="論理レプリケーションを有効化" border/>

**有効化**をクリックして設定完了です。有効にすると、以下の成功メッセージが表示されるはずです。

<Image size="lg" img={neon_enabled_replication} alt="論理レプリケーションが有効" border/>

以下の設定があなたのNeon Postgresインスタンスで確認できるか見てみましょう：
```sql
SHOW wal_level; -- これはlogicalであるべき
SHOW max_wal_senders; -- これは10であるべき
SHOW max_replication_slots; -- これは10であるべき
```

## IPホワイトリスト (Neonエンタープライズプラン向け) {#ip-whitelisting-for-neon-enterprise-plan}
Neonエンタープライズプランをお持ちの場合、[ClickPipesのIP](../../index.md#list-of-static-ips)をホワイトリストに追加して、ClickPipesからあなたのNeon Postgresインスタンスへのレプリケーションを許可できます。
これを行うには、**設定**タブをクリックし、**IP許可**セクションに進みます。

<Image size="lg" img={neon_ip_allow} alt="IPを許可する画面" border/>

## 接続詳細のコピー {#copy-connection-details}
ユーザーと公開物が準備完了で、レプリケーションが有効になったので、新しいClickPipeを作成するための接続詳細をコピーできます。
**ダッシュボード**に移動し、接続文字列が表示されるテキストボックスで、ビューを**パラメータのみ**に変更します。次のステップでこれらのパラメータが必要になります。

<Image size="lg" img={neon_conn_details} alt="接続詳細" border/>

## 次は何ですか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。
Postgresインスタンスの設定中に使用した接続詳細をメモしておいてください。ClickPipe作成プロセス中に必要になります。
