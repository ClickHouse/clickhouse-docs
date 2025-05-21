---
sidebar_label: 'Neon Postgres'
description: 'ClickPipesのソースとしてNeon Postgresインスタンスを設定する'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgresソース設定ガイド'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgresソース設定ガイド

これは、ClickPipesでレプリケーションに使用できるNeon Postgresの設定方法に関するガイドです。
この設定を行うには、[Neonコンソール](https://console.neon.tech/app/projects)にサインインしていることを確認してください。

## 権限を持つユーザーの作成 {#creating-a-user-with-permissions}

必要な権限を持つClickPipes用の新しいユーザーを作成し、レプリケーションに使用するパブリケーションも作成しましょう。

そのためには、**SQLエディタ**タブに移動します。
ここで、次のSQLコマンドを実行できます：

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーションの権限を与える
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。ミラーを作成する際に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image size="lg" img={neon_commands} alt="ユーザーとパブリケーションのコマンド" border/>

**実行**をクリックして、パブリケーションとユーザーの準備が整います。

## 論理レプリケーションの有効化 {#enable-logical-replication}
Neonでは、UIを通じて論理レプリケーションを有効にできます。これは、ClickPipesのCDCがデータをレプリケートするために必要です。
**設定**タブに移動し、次に**論理レプリケーション**セクションに進みます。

<Image size="lg" img={neon_enable_replication} alt="論理レプリケーションの有効化" border/>

**有効化**をクリックして、ここでの設定が完了します。有効化すると、以下の成功メッセージが表示されるはずです。

<Image size="lg" img={neon_enabled_replication} alt="論理レプリケーションが有効" border/>

次の設定がNeon Postgresインスタンスにあることを確認しましょう：
```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## IPホワイトリスト設定（Neonエンタープライズプラン用） {#ip-whitelisting-for-neon-enterprise-plan}
Neonエンタープライズプランを使用している場合、[ClickPipesのIP](../../index.md#list-of-static-ips)をホワイトリストに追加して、ClickPipesからNeon Postgresインスタンスへのレプリケーションを許可できます。
これを行うには、**設定**タブをクリックし、**IP許可**セクションに移動します。

<Image size="lg" img={neon_ip_allow} alt="IP許可画面" border/>

## 接続情報のコピー {#copy-connection-details}
ユーザー、パブリケーションが準備でき、レプリケーションが有効になったので、新しいClickPipeを作成するための接続情報をコピーできます。
**ダッシュボード**に移動し、接続文字列が表示されているテキストボックスで、
表示を**パラメータのみ**に変更します。次のステップでこれらのパラメータが必要になります。

<Image size="lg" img={neon_conn_details} alt="接続詳細" border/>

## 次に何をするか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、Neon PostgresインスタンスからClickHouse Cloudにデータを取り込むことができます。
Postgresインスタンスを設定する際に使用した接続情報を必ずメモしておいてください。ClickPipe作成プロセスで必要になります。
