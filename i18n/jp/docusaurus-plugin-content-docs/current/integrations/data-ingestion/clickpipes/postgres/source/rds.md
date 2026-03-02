---
sidebar_label: 'Amazon RDS Postgres'
description: 'ClickPipes のソースとして Amazon RDS Postgres をセットアップする'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC（変更データキャプチャ）', 'データインジェスト', 'リアルタイム同期']
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

## サポート対象の Postgres バージョン \{#supported-postgres-versions\}

ClickPipes は Postgres 12 以降のバージョンに対応しています。

## 論理レプリケーションを有効にする \{#enable-logical-replication\}

RDS インスタンスですでに次の設定が行われている場合、このセクションはスキップできます。

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合、あらかじめ設定されていることが一般的です。

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

1. 必要な設定を行った、利用している Postgres バージョン用の新しいパラメータグループを作成します:
   * `rds.logical_replication` を 1 に設定します
   * `wal_sender_timeout` を 0 に設定します

<Image img={parameter_group_in_blade} alt="RDS で Parameter groups を確認する場所" size="lg" border />

<Image img={change_rds_logical_replication} alt="rds.logical_replication の変更" size="lg" border />

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout の変更" size="lg" border />

2. 作成した新しいパラメータグループを対象の RDS Postgres データベースに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループを適用して RDS Postgres を変更する" size="lg" border />

3. 変更を反映するために RDS インスタンスを再起動します

<Image img={reboot_rds} alt="RDS Postgres を再起動する" size="lg" border />


## データベースユーザーを設定する \{#configure-database-user\}

管理ユーザーとして RDS Postgres インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 前の手順で作成したユーザーに対して、スキーマレベルの読み取り専用アクセス権を付与します。次の例は `public` スキーマに対する権限を示しています。レプリケーション対象としたいテーブルを含む各スキーマに対して、これらのコマンドを繰り返してください:

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. ユーザーにレプリケーション権限を付与します:

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーションしたいテーブルを含む [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) を作成します。パフォーマンスのオーバーヘッドを避けるため、publication には必要なテーブルのみを含めることを強く推奨します。

   :::warning
   publication に含めるいずれのテーブルも、**primary key** が定義されているか、**replica identity** が `FULL` に設定されている必要があります。スコープ設定に関するガイダンスについては、[Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) を参照してください。
   :::

   - 特定のテーブル用の publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 特定のスキーマ内のすべてのテーブル用の publication を作成するには:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication には、指定したテーブルから生成された変更イベントの集合が含まれ、後でレプリケーションストリームを取り込む際に使用されます。

## ネットワーク アクセスを構成する \{#configure-network-access\}

### IP ベースのアクセス制御 \{#ip-based-access-control\}

RDS インスタンスへのトラフィックを制限する場合は、RDS セキュリティグループの `Inbound rules` に[ドキュメントに記載されている静的 NAT IP アドレス](../../index.md#list-of-static-ips) を追加してください。

<Image img={security_group_in_rds_postgres} alt="RDS Postgres でセキュリティグループを確認する場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループの Inbound rules を編集する画面" size="lg" border/>

### AWS PrivateLink を使用したプライベートアクセス \{#private-access-via-aws-privatelink\}

プライベートネットワーク経由で RDS インスタンスに接続するには、AWS PrivateLink を使用できます。接続を構成するには、[ClickPipes 向け AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従ってください。

### RDS Proxy 向けのワークアラウンド \{#workarounds-for-rds-proxy\}

RDS Proxy は logical replication 接続をサポートしていません。RDS で動的 IP アドレスを使用しており、DNS 名や Lambda を利用できない場合、代替案として次のような方法があります:

1. cron ジョブを使用して、定期的に RDS エンドポイントの IP を名前解決し、変更されている場合は NLB を更新する。
2. RDS Event Notifications と EventBridge/SNS を使用する: AWS RDS のイベント通知を利用して更新処理を自動でトリガーする。
3. 安定した IP を持つ EC2: ポーリングサービスまたは IP ベースのプロキシとして動作する EC2 インスタンスをデプロイする。
4. Terraform や CloudFormation などのツールを使用して IP アドレス管理を自動化する。

## 次のステップ \{#whats-next\}

これで、[ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へのデータ取り込みを開始できます。
Postgres インスタンスのセットアップ時に使用した接続情報は、ClickPipe の作成プロセスでも必要になるため、必ず控えておいてください。