---
sidebar_label: Crunchy Bridge Postgres
description: ClickPipes のデータソースとして Crunchy Bridge Postgres をセットアップする
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'


# Crunchy Bridge Postgres ソースセットアップガイド

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

Crunchy Bridge では、[デフォルト](https://docs.crunchybridge.com/how-to/logical-replication)で論理レプリケーションが有効になっています。以下の設定が正しく構成されていることを確認してください。そうでない場合は、適宜調整してください。

```sql
SHOW wal_level; -- logical であるべきです
SHOW max_wal_senders; -- 10 であるべきです
SHOW max_replication_slots; -- 10 であるべきです
```

## ClickPipes ユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres` ユーザーを通じて Crunchy Bridge Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用の Postgres ユーザーを作成します。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. テーブルをレプリケートするスキーマへの読み取り専用アクセスを `clickpipes_user` に付与します。以下の例は `public` スキーマへの権限付与を示しています。複数のスキーマへのアクセスを付与する場合は、各スキーマに対してこれらの3つのコマンドを実行できます。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. このユーザーにレプリケーションアクセスを付与します。

    ```sql
    ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 将来の MIRROR（レプリケーション）を作成するために使用するパブリケーションを作成します。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ClickPipes IP のホワイトリスト {#safe-list-clickpipes-ips}

Crunchy Bridge にファイアウォールルールを追加して、[ClickPipes IP](../../index.md#list-of-static-ips) をホワイトリストに追加します。

<img src={firewall_rules_crunchy_bridge} alt="Crunchy Bridge でファイアウォールルールを見つける場所"/>

<img src={add_firewall_rules_crunchy_bridge} alt="ClickPipes 用のファイアウォールルールを追加する"/>

## 次は何ですか？ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。Postgres インスタンスのセットアップ時に使用した接続詳細を書き留めておいてください。ClickPipe 作成プロセス中にそれらが必要になります。
