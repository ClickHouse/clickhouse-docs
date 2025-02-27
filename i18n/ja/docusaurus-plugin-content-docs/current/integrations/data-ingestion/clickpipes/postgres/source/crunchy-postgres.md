---
sidebar_label: Crunchy Bridge Postgres
description: ClickPipesのソースとしてCrunchy Bridge Postgresを設定する
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
---

# Crunchy Bridge Postgres ソース設定ガイド

ClickPipesはPostgresバージョン12以降をサポートしています。

## ロジカルレプリケーションの有効化 {#enable-logical-replication}

Crunchy Bridgeでは、ロジカルレプリケーションが[デフォルト](https://docs.crunchybridge.com/how-to/logical-replication)で有効になっています。以下の設定が正しく構成されていることを確認してください。正しくない場合は、適宜調整してください。

```sql
SHOW wal_level; -- logicalであるべき
SHOW max_wal_senders; -- 10であるべき
SHOW max_replication_slots; -- 10であるべき
```

## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres`ユーザーを通じてCrunchy Bridge Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. テーブルをレプリケーションするスキーマへの読み取り専用アクセスを`clickpipes_user`に付与します。以下の例では`public`スキーマへの権限を付与しています。複数のスキーマにアクセスを付与したい場合は、各スキーマに対してこれらの3つのコマンドを実行できます。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. このユーザーにレプリケーションアクセスを付与します。

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 将来的にMIRROR（レプリケーション）を作成するために使用するパブリケーションを作成します。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ClickPipes IPのホワイトリスト設定 {#safe-list-clickpipes-ips}

[ClickPipesのIPアドレス](../../index.md#list-of-static-ips)をホワイトリストに追加するために、Crunchy Bridgeのファイアウォールルールに追加します。

![Crunchy Bridgeでファイアウォールルールを見つける場所](images/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png)

![ClickPipesのためのファイアウォールルールを追加](images/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png)

## 次は何をすべきか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込む準備が整いました。Postgresインスタンスを設定する際に使用した接続情報をメモしておいてください。ClickPipe作成プロセスで必要になります。
