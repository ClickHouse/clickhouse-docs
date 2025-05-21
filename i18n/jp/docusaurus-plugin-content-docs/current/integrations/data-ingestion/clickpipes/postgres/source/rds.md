---
sidebar_label: 'Amazon RDS Postgres'
description: 'ClickPipes のソースとして Amazon RDS Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres ソース設定ガイド'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS Postgres ソース設定ガイド

## サポートされている Postgres バージョン {#supported-postgres-versions}

ClickPipes は Postgres バージョン 12 以降をサポートしています。

## 論理レプリケーションを有効にする {#enable-logical-replication}

RDS インスタンスにすでに以下の設定が構成されている場合、このセクションをスキップできます：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、他のデータレプリケーションツールを以前に使用した場合、通常は事前に構成されています。

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

設定されていない場合は、以下の手順に従ってください：

1. 必要な設定を含む新しいパラメーターグループを Postgres バージョン用に作成します：
    - `rds.logical_replication` を 1 に設定
    - `wal_sender_timeout` を 0 に設定

<Image img={parameter_group_in_blade} alt="RDS でパラメータグループを見つける場所は？" size="lg" border/>

<Image img={change_rds_logical_replication} alt="rds.logical_replication の変更" size="lg" border/>

<Image img={change_wal_sender_timeout} alt="wal_sender_timeout の変更" size="lg" border/>

2. 新しいパラメーターグループを RDS Postgres データベースに適用します

<Image img={modify_parameter_group} alt="新しいパラメータグループでの RDS Postgres の変更" size="lg" border/>

3. 変更を適用するために RDS インスタンスを再起動します

<Image img={reboot_rds} alt="RDS Postgres の再起動" size="lg" border/>

## データベースユーザーを設定する {#configure-database-user}

管理ユーザーとして RDS Postgres インスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. スキーマ権限を付与します。以下の例では `public` スキーマの権限を示しています。複製したい各スキーマについてこれらのコマンドを繰り返します：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. レプリケーション権限を付与します：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. レプリケーション用のパブリケーションを作成します：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## ネットワークアクセスを設定する {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

RDS インスタンスへのトラフィックを制限したい場合は、[文書化された静的 NAT IPs](../../index.md#list-of-static-ips)を RDS セキュリティグループの `Inbound rules` に追加してください。

<Image img={security_group_in_rds_postgres} alt="RDS Postgres でセキュリティグループを見つける場所は？" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink によるプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを通じて RDS インスタンスに接続するには、AWS PrivateLink を使用します。[ClickPipes 用の AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従って接続を設定してください。

### RDS プロキシのワークアラウンド {#workarounds-for-rds-proxy}
RDS プロキシは論理レプリケーション接続をサポートしていません。RDS に動的 IP アドレスがあり、DNS 名や Lambda を使用できない場合、次の代替手段があります：

1. cron ジョブを使用して、RDS エンドポイントの IP を定期的に解決し、変更されている場合に NLB を更新します。
2. RDS イベント通知を EventBridge/SNS と組み合わせて使用：AWS RDS イベント通知を使用して自動的に更新をトリガーします。
3. ステーブル EC2：ポーリングサービスまたは IP ベースのプロキシとして機能する EC2 インスタンスをデプロイします。
4. Terraform や CloudFormation などのツールを使用して IP アドレス管理を自動化します。

## 次に何をしますか？ {#whats-next}

これで [ClickPipe を作成](../index.md)し、Postgres インスタンスから ClickHouse Cloud へデータを取り込む準備が整いました。
Postgres インスタンスを設定する際に使用した接続詳細をメモしておくことを忘れないでください。ClickPipe 作成プロセス中に必要になります。
