---
sidebar_label: 'Amazon RDS Postgres'
description: 'ClickPipes のソースとして Amazon RDS Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# RDS Postgres ソース設定ガイド \{#rds-postgres-source-setup-guide\}

## サポートされている Postgres のバージョン \{#supported-postgres-versions\}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする \{#enable-logical-replication\}

お使いの RDS インスタンスですでに次の設定が行われている場合、このセクションはスキップできます。

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合、あらかじめ設定済みであることが一般的です。

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

まだ設定していない場合は、次の手順に従ってください。

1. 使用している Postgres のバージョン向けに、以下の設定を含む新しいパラメータグループを作成します:
   * `rds.logical_replication` を 1 に設定
   * `wal_sender_timeout` を 0 に設定

<Image img={parameter_group_in_blade} alt="RDS で Parameter groups を確認できる場所" size="lg" border />

<Image img={change_rds_logical_replication} alt="rds.logical_replication の設定変更" size="lg" border />

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout の設定変更" size="lg" border />

2. 新しいパラメータグループを RDS Postgres データベースに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループを RDS Postgres に適用" size="lg" border />

3. 変更を反映するために RDS インスタンスを再起動します

<Image img={reboot_rds} alt="RDS Postgres の再起動" size="lg" border />


## データベースユーザーの設定 \{#configure-database-user\}

管理ユーザーとして RDS Postgres インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 前の手順で作成したユーザーに、スキーマ単位の読み取り専用アクセス権を付与します。次の例では、`public` スキーマに対する権限を示しています。レプリケーション対象とするテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーション対象とするテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスへのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるテーブルはすべて、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定については [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブルに対する publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブルに対する publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成される変更イベントの一連の集合が含まれ、後でレプリケーションストリームを取り込む際に使用されます。

## ネットワークアクセスを設定する \{#configure-network-access\}

### IP ベースのアクセス制御 \{#ip-based-access-control\}

RDS インスタンスへのトラフィックを制限する場合は、[ドキュメントで定義されている固定 NAT IP アドレス](../../index.md#list-of-static-ips) を、RDS セキュリティグループの `Inbound rules` に追加してください。

<Image img={security_group_in_rds_postgres} alt="RDS Postgres でセキュリティグループを確認できる場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集する" size="lg" border/>

### AWS PrivateLink によるプライベートアクセス \{#private-access-via-aws-privatelink\}

RDS インスタンスへプライベートネットワーク経由で接続するには、AWS PrivateLink を使用できます。接続を設定するには、[ClickPipes 向け AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) に従ってください。

### RDS Proxy の回避策 \{#workarounds-for-rds-proxy\}

RDS Proxy はロジカルレプリケーション接続をサポートしていません。RDS の IP アドレスが動的で、DNS 名や Lambda 関数を利用できない場合は、次のような代替策があります。

1. cron ジョブを使用して、RDS エンドポイントの IP を定期的に名前解決し、変更されている場合は NLB を更新する。
2. EventBridge/SNS と連携した RDS Event Notifications を使用する。AWS RDS のイベント通知を使って更新を自動的にトリガーする。
3. 固定の EC2 インスタンス: ポーリングサービスまたは IP ベースのプロキシとして動作する EC2 インスタンスをデプロイする。
4. Terraform や CloudFormation などのツールを使用して、IP アドレス管理を自動化する。

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に必要になるため、Postgres インスタンスをセットアップしたときに使用した接続情報は必ず控えておいてください。