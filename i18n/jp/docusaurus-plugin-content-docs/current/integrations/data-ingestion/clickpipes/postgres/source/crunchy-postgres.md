---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'Set up Crunchy Bridge Postgres as a source for ClickPipes'
slug: '/integrations/clickpipes/postgres/source/crunchy-postgres'
title: 'Crunchy Bridge Postgres Source Setup Guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres ソースセットアップガイド

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

Crunchy Bridge には、[デフォルトで](https://docs.crunchybridge.com/how-to/logical-replication) 論理レプリケーションが有効になっています。以下の設定が正しく構成されていることを確認してください。そうでない場合は、適宜調整してください。

```sql
SHOW wal_level; -- logical であるべき
SHOW max_wal_senders; -- 10 であるべき
SHOW max_replication_slots; -- 10 であるべき
```

## ClickPipes ユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres` ユーザーを通じて Crunchy Bridge Postgres に接続し、以下のコマンドを実行してください。

1. ClickPipes 専用の Postgres ユーザーを作成します。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. テーブルをレプリケートするスキーマへの読み取り専用アクセスを `clickpipes_user` に付与します。以下の例は `public` スキーマへの権限付与を示しています。複数のスキーマにアクセス権を付与したい場合は、各スキーマに対してこれらの 3 つのコマンドを実行できます。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. このユーザーにレプリケーションアクセスを付与します。

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 今後使用する MIRROR (レプリケーション) を作成するための公開を作成します。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ClickPipes IP の安全リスト {#safe-list-clickpipes-ips}

Crunchy Bridge のファイアウォールルールに ClickPipes IP を安全リストに追加します。[ClickPipes IPs](../../index.md#list-of-static-ips)。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridge のファイアウォールルールはどこにありますか？" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipes 用のファイアウォールルールを追加" border/>

## 次は何ですか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud にデータを取り込む準備が整いました。Postgres インスタンスの設定中に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe 作成プロセス中に必要になります。
