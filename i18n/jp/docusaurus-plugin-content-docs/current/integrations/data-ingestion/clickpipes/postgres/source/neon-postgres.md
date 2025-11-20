---
sidebar_label: 'Neon Postgres'
description: 'ClickPipes のソースとして Neon Postgres インスタンスをセットアップする'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres ソースセットアップガイド

このガイドでは、ClickPipes でレプリケーションに使用できる Neon Postgres のセットアップ方法を説明します。
セットアップを行うにあたっては、事前に [Neon コンソール](https://console.neon.tech/app/projects) にサインインしていることを確認してください。



## 権限を持つユーザーの作成 {#creating-a-user-with-permissions}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、
レプリケーションに使用するパブリケーションも作成しましょう。

これを行うには、**SQL Editor** タブに移動してください。
ここで、以下の SQL コマンドを実行できます:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the mirror
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image
  size='lg'
  img={neon_commands}
  alt='ユーザーとパブリケーションのコマンド'
  border
/>

**Run** をクリックして、パブリケーションとユーザーを作成します。


## 論理レプリケーションの有効化 {#enable-logical-replication}

Neonでは、UIから論理レプリケーションを有効化できます。これはClickPipesのCDC機能でデータをレプリケートするために必要です。
**Settings**タブに移動し、**Logical Replication**セクションを開きます。

<Image
  size='lg'
  img={neon_enable_replication}
  alt='論理レプリケーションの有効化'
  border
/>

**Enable**をクリックすると設定が完了します。有効化すると、以下の成功メッセージが表示されます。

<Image
  size='lg'
  img={neon_enabled_replication}
  alt='論理レプリケーションが有効化されました'
  border
/>

Neon Postgresインスタンスで以下の設定を確認します:

```sql
SHOW wal_level; -- logicalである必要があります
SHOW max_wal_senders; -- 10である必要があります
SHOW max_replication_slots; -- 10である必要があります
```


## IPホワイトリスト（Neonエンタープライズプラン向け） {#ip-whitelisting-for-neon-enterprise-plan}

Neon Enterpriseプランをご利用の場合、[ClickPipes IP](../../index.md#list-of-static-ips)をホワイトリストに登録することで、ClickPipesからNeon Postgresインスタンスへのレプリケーションを許可できます。
これを行うには、**Settings**タブをクリックして**IP Allow**セクションに移動します。

<Image size='lg' img={neon_ip_allow} alt='IP許可画面' border />


## 接続詳細のコピー {#copy-connection-details}

ユーザー、パブリケーションの準備、およびレプリケーションの有効化が完了したので、接続詳細をコピーして新しいClickPipeを作成できます。
**Dashboard**に移動し、接続文字列が表示されているテキストボックスで、
表示を**Parameters Only**に変更してください。次のステップでこれらのパラメータが必要になります。

<Image size='lg' img={neon_conn_details} alt='接続詳細' border />


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、Postgresインスタンスのセットアップで使用した接続情報を必ず控えておいてください。
