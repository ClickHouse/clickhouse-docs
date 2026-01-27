---
sidebar_label: 'Neon Postgres'
description: 'ClickPipes 用のソースとして Neon Postgres インスタンスをセットアップする'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Neon Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Neon Postgres ソースセットアップガイド \{#neon-postgres-source-setup-guide\}

これは、ClickPipes におけるレプリケーションに使用できる Neon Postgres のセットアップ方法を説明するガイドです。
このセットアップを行う前に、事前に [Neon コンソール](https://console.neon.tech/app/projects) にサインインしていることを確認してください。

## 権限を持つユーザーの作成 \{#creating-a-user-with-permissions\}

管理者ユーザーとして Neon インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 前の手順で作成したユーザーに対して、スキーマ単位の読み取り専用アクセス権を付与します。次の例は `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください。
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. レプリケーションしたいテーブルを含む [パブリケーション](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスへのオーバーヘッドを避けるため、パブリケーションには必要なテーブルのみを含めることを強く推奨します。

   :::warning
   パブリケーションに含めるテーブルには、**主キー** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定の指針については、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブル向けのパブリケーションを作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定スキーマ内のすべてのテーブル向けのパブリケーションを作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` パブリケーションには、指定したテーブルから生成される変更イベントのセットが含まれ、後でレプリケーションストリームを取り込むために使用されます。

## 論理レプリケーションを有効化する \{#enable-logical-replication\}

Neon では、UI を通じて論理レプリケーションを有効化できます。これは ClickPipes の CDC（変更データキャプチャ）がデータをレプリケーションするために必要です。
**Settings** タブに移動し、**Logical Replication** セクションに進みます。

<Image size="lg" img={neon_enable_replication} alt="論理レプリケーションを有効化" border />

**Enable** をクリックして、ここでの設定は完了です。有効化後、以下のような成功メッセージが表示されるはずです。

<Image size="lg" img={neon_enabled_replication} alt="論理レプリケーションが有効化された状態" border />

Neon Postgres インスタンスで、次の設定を確認しましょう。

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## IP ホワイトリスト設定（Neon Enterprise プラン向け） \{#ip-whitelisting-for-neon-enterprise-plan\}

Neon Enterprise プランをご利用の場合、[ClickPipes の IP](../../index.md#list-of-static-ips) をホワイトリストに登録することで、ClickPipes から Neon Postgres インスタンスへのレプリケーションを許可できます。
そのためには、**Settings** タブをクリックし、**IP Allow** セクションに移動します。

<Image size="lg" img={neon_ip_allow} alt="IP 許可画面" border/>

## 接続情報をコピーする \{#copy-connection-details\}

USER と publication の準備が整い、レプリケーションも有効になったので、新しい ClickPipe を作成するために接続情報をコピーします。
**Dashboard** に移動し、接続文字列が表示されているテキストボックスで
ビューを **Parameters Only** に変更します。次の手順でこれらのパラメータを使用します。

<Image size="lg" img={neon_conn_details} alt="接続情報" border/>

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスをセットアップした際に使用した接続情報は、ClickPipe の作成時にも必要になるため、必ずメモして保管しておいてください。