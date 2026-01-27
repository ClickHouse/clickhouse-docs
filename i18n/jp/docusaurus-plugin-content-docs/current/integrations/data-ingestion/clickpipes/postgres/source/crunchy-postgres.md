---
sidebar_label: 'Crunchy Bridge Postgres'
description: 'ClickPipes のソースとして Crunchy Bridge Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres ソース設定ガイド'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'ロジカルレプリケーション', 'データインジェスト']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres ソースセットアップガイド \{#crunchy-bridge-postgres-source-setup-guide\}

ClickPipes は Postgres バージョン 12 以降に対応しています。

## ロジカルレプリケーションを有効にする \{#enable-logical-replication\}

Crunchy Bridge では、ロジカルレプリケーションは[デフォルト](https://docs.crunchybridge.com/how-to/logical-replication)で有効化されています。以下の設定が正しく構成されていることを確認してください。そうでない場合は、適切に調整してください。

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```


## ClickPipes 用ユーザーの作成と権限付与 \{#creating-clickpipes-user-and-granting-permissions\}

`postgres` ユーザーで Crunchy Bridge Postgres に接続し、以下のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 先ほど作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。以下の例では `public` スキーマに対する権限を示しています。レプリケーションしたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返し実行してください:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します:

    ```sql
     ALTER USER clickpipes_user WITH REPLICATION;
    ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるすべてのテーブルには、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定については、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対する publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定スキーマ内のすべてのテーブルに対する publication を作成する場合:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントのセットが含まれ、後でレプリケーションストリームを取り込むために使用されます。

## ClickPipes の IP アドレスをセーフリストに追加する \{#safe-list-clickpipes-ips\}

Crunchy Bridge で Firewall Rules を追加して、[ClickPipes IPs](../../index.md#list-of-static-ips) をセーフリストに登録します。

<Image size="lg" img={firewall_rules_crunchy_bridge} alt="Crunchy Bridge で Firewall Rules を確認できる場所" border/>

<Image size="lg" img={add_firewall_rules_crunchy_bridge} alt="ClickPipes 用の Firewall Rules を追加する" border/>

## 次のステップ \{#whats-next\}

これで[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスのセットアップ時に使用した接続情報は、ClickPipe の作成時にも必要になるため、必ず控えておいてください。