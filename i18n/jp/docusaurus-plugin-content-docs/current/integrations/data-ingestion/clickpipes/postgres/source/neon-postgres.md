---
'sidebar_label': 'Neon Postgres'
'description': 'ClickPipes のソースとして Neon Postgres インスタンスをセットアップする'
'slug': '/integrations/clickpipes/postgres/source/neon-postgres'
'title': 'Neon Postgres ソースセットアップガイド'
'doc_type': 'guide'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres ソースセットアップガイド

これは、ClickPipes でレプリケーションに使用できる Neon Postgres のセットアップ方法を説明するガイドです。
このセットアップには、[Neon コンソール](https://console.neon.tech/app/projects) にサインインしていることを確認してください。

## 権限を持つユーザーの作成 {#creating-a-user-with-permissions}

CDC に適した必要な権限を持つ ClickPipes 用の新しいユーザーを作成し、レプリケーションに使用する公開を作成しましょう。

このために、**SQL エディタ**タブに移動します。
ここで、次の SQL コマンドを実行できます。

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

<Image size="lg" img={neon_commands} alt="ユーザーと公開コマンド" border/>

**実行**をクリックして、公開とユーザーを用意します。

## 論理レプリケーションの有効化 {#enable-logical-replication}
Neon では、UI を通じて論理レプリケーションを有効にできます。これは、ClickPipes の CDC がデータをレプリケートするために必要です。
**設定**タブに移動し、次に **論理レプリケーション**セクションに進みます。

<Image size="lg" img={neon_enable_replication} alt="論理レプリケーションを有効にする" border/>

**有効にする**をクリックして、ここを設定します。有効化すると、以下の成功メッセージが表示されるはずです。

<Image size="lg" img={neon_enabled_replication} alt="論理レプリケーションが有効化されました" border/>

以下の設定が Neon Postgres インスタンスに適用されていることを確認しましょう：
```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## IP ホワイトリスト (Neon エンタープライズプラン用) {#ip-whitelisting-for-neon-enterprise-plan}
Neon エンタープライズプランを利用している場合、ClickPipes から Neon Postgres インスタンスへのレプリケーションを許可するために、[ClickPipes IP](../../index.md#list-of-static-ips) をホワイトリストに追加できます。
これを行うには、**設定**タブをクリックし、**IP 許可**セクションに移動します。

<Image size="lg" img={neon_ip_allow} alt="IP 許可画面" border/>

## 接続詳細のコピー {#copy-connection-details}
ユーザー、公開を準備し、レプリケーションを有効にしたので、新しい ClickPipe を作成するために接続詳細をコピーできます。
**ダッシュボード**に移動し、接続文字列が表示されているテキストボックスで、
ビューを **パラメータのみ** に変更します。次のステップで必要なこれらのパラメータを取得します。

<Image size="lg" img={neon_conn_details} alt="接続詳細" border/>

## 次は何ですか？ {#whats-next}

今すぐ [ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータを取り込むことを開始できます。
Postgres インスタンスセットアップ中に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe 作成プロセスでそれらが必要になります。
