---
sidebar_label: 'Neon Postgres'
description: 'Neon Postgres インスタンスを ClickPipes のソースとしてセットアップする'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC（変更データキャプチャ）', 'インジェスト', 'リアルタイム同期']
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';

# Neon Postgres ソースセットアップガイド {#neon-postgres-source-setup-guide}

本ガイドでは、ClickPipes でレプリケーション元として利用できる Neon Postgres のセットアップ方法について説明します。
このセットアップのために、事前に [Neon コンソール](https://console.neon.tech/app/projects) にサインインしておいてください。

## 権限を持つユーザーの作成 {#creating-a-user-with-permissions}

CDC に適した必要な権限を付与した ClickPipes 用の新しいユーザーを作成し、
レプリケーションに使用する publication も作成します。

そのためには、**SQL Editor** タブを開きます。
ここで、次の SQL コマンドを実行できます。

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- ユーザーにレプリケーション権限を付与
  ALTER USER clickpipes_user REPLICATION;

-- パブリケーションを作成します。ミラー作成時に使用します
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image size="lg" img={neon_commands} alt="ユーザーとパブリケーションのコマンド" border />

**Run** をクリックして、パブリケーションとユーザーを作成します。

## ロジカルレプリケーションを有効化する {#enable-logical-replication}

Neon では、UI からロジカルレプリケーションを有効化できます。これは、ClickPipes の CDC（変更データキャプチャ）でデータをレプリケートするために必要です。
**Settings** タブに移動し、**Logical Replication** セクションを開きます。

<Image size="lg" img={neon_enable_replication} alt="ロジカルレプリケーションを有効化する" border />

**Enable** をクリックして有効化します。有効化が完了すると、次のような成功メッセージが表示されます。

<Image size="lg" img={neon_enabled_replication} alt="ロジカルレプリケーションが有効になった状態" border />

Neon の Postgres インスタンスで、次の設定を確認しましょう:

```sql
SHOW wal_level; -- logical である必要があります
SHOW max_wal_senders; -- 10 である必要があります
SHOW max_replication_slots; -- 10 である必要があります
```

## IP ホワイトリスト登録（Neon Enterprise プラン向け） {#ip-whitelisting-for-neon-enterprise-plan}
Neon Enterprise プランをご利用の場合、[ClickPipes の IP アドレス](../../index.md#list-of-static-ips) をホワイトリストに登録することで、ClickPipes から Neon Postgres インスタンスへのレプリケーションを許可できます。
そのためには、**Settings** タブをクリックし、**IP Allow** セクションに移動します。

<Image size="lg" img={neon_ip_allow} alt="IP 許可画面" border/>

## 接続情報をコピーする {#copy-connection-details}
ユーザーと publication の準備が整い、レプリケーションが有効になったので、新しい ClickPipe を作成するために接続情報をコピーします。
**Dashboard** を開き、接続文字列が表示されているテキストボックスで、
表示を **Parameters Only** に切り替えます。次の手順でこれらのパラメータを使用します。

<Image size="lg" img={neon_conn_details} alt="接続情報" border/>

## 次のステップ {#whats-next}

これで [ClickPipe を作成](../index.md) し、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に必要になるため、Postgres インスタンスのセットアップ時に使用した接続情報は必ず控えておいてください。
