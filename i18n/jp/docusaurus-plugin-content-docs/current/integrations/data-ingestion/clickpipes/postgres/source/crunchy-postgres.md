---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'ClickPipesのソースとしてCrunchy Bridge Postgresを設定する'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgresソース設定ガイド'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgresソース設定ガイド


ClickPipesはPostgresバージョン12以降をサポートしています。

## 論理レプリケーションの有効化 {#enable-logical-replication}

Crunchy Bridgeにはデフォルトで論理レプリケーションが有効になっています。設定が正しく構成されていることを確認してください。そうでない場合は、適宜調整してください。

```sql
SHOW wal_level; -- 値はlogicalである必要があります
SHOW max_wal_senders; -- 値は10である必要があります
SHOW max_replication_slots; -- 値は10である必要があります
```

## ClickPipesユーザーの作成と権限の付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres`ユーザーを通じてあなたのCrunchy Bridge Postgresに接続し、以下のコマンドを実行します。

1. ClickPipes専用のPostgresユーザーを作成します。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. テーブルをレプリケートするスキーマに対して、`clickpipes_user`に読み取り専用アクセスを付与します。以下の例は、`public`スキーマへの権限付与を示しています。複数のスキーマにアクセスを付与したい場合は、各スキーマごとにこれらの3つのコマンドを実行できます。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. このユーザーにレプリケーションアクセスを付与します：

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 将来MIRROR（レプリケーション）を作成するために使用するパブリケーションを作成します。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ClickPipes IPの安全リスト化 {#safe-list-clickpipes-ips}

Crunchy Bridgeにファイアウォールルールを追加して[ClickPipes IPs](../../index.md#list-of-static-ips)を安全リストに追加します。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridgeでファイアウォールルールを見つける場所は？" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipesのためのファイアウォールルールを追加" border/>

## 次は何をしますか？ {#whats-next}

これで、[ClickPipeを作成](../index.md)し、PostgresインスタンスからClickHouse Cloudにデータを取り込む準備が整いました。Postgresインスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipeを作成する際に必要になります。
