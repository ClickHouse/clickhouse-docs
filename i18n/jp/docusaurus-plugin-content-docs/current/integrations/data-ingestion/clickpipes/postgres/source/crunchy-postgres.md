---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'ClickPipes のソースとして Crunchy Bridge Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres ソース設定ガイド'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', '論理レプリケーション', 'データインジェスト']
doc_type: 'guide'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres ソース設定ガイド {#crunchy-bridge-postgres-source-setup-guide}

ClickPipes は Postgres バージョン 12 以降をサポートしています。



## 論理レプリケーションを有効化する {#enable-logical-replication}

Crunchy Bridge では、論理レプリケーションが[既定](https://docs.crunchybridge.com/how-to/logical-replication)で有効になっています。以下の設定が正しく構成されていることを確認してください。そうでない場合は、必要に応じて調整してください。

```sql
SHOW wal_level; -- logical に設定する必要があります
SHOW max_wal_senders; -- 10 に設定する必要があります
SHOW max_replication_slots; -- 10 に設定する必要があります
```


## ClickPipes 用ユーザーの作成と権限付与 {#creating-clickpipes-user-and-granting-permissions}

`postgres` ユーザーで Crunchy Bridge Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 専用の Postgres ユーザーを作成します。

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. テーブルをレプリケートする元となるスキーマに対して、`clickpipes_user` に読み取り専用アクセス権を付与します。以下の例では、`public` スキーマに対する権限を付与しています。複数のスキーマにアクセス権を付与したい場合は、各スキーマごとにこれら 3 つのコマンドを実行してください。

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. このユーザーにレプリケーション権限を付与します。

    ```sql
     ALTER ROLE clickpipes_user REPLICATION;
    ```

4. 今後 MIRROR（レプリケーション）を作成する際に使用する publication を作成します。

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```



## ClickPipes の IP アドレスを許可リストに追加する {#safe-list-clickpipes-ips}

Crunchy Bridge で Firewall Rules を追加して、[ClickPipes IPs](../../index.md#list-of-static-ips) を許可リストに登録します。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridge で Firewall Rules を確認できる場所" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipes 用の Firewall Rules を追加する" border/>



## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に使用するため、Postgres インスタンスのセットアップ時に使用した接続情報を必ずメモしておいてください。
