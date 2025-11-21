---
sidebar_label: 'Amazon RDS Postgres'
description: 'ClickPipes のソースとして Amazon RDS Postgres を設定する'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS Postgres ソースセットアップガイド



## サポートされているPostgresバージョン {#supported-postgres-versions}

ClickPipesはPostgresバージョン12以降をサポートしています。


## 論理レプリケーションの有効化 {#enable-logical-replication}

RDSインスタンスに以下の設定が既に構成されている場合は、このセクションをスキップできます:

- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

これらの設定は、以前に別のデータレプリケーションツールを使用していた場合、通常は事前に構成されています。

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

まだ構成されていない場合は、以下の手順に従ってください:

1. 使用しているPostgresバージョン用の新しいパラメータグループを必要な設定で作成します:
   - `rds.logical_replication`を1に設定
   - `wal_sender_timeout`を0に設定

<Image
  img={parameter_group_in_blade}
  alt='RDSでパラメータグループを見つける場所'
  size='lg'
  border
/>

<Image
  img={change_rds_logical_replication}
  alt='rds.logical_replicationの変更'
  size='lg'
  border
/>

<Image
  img={change_wal_sender_timeout}
  alt='wal_sender_timeoutの変更'
  size='lg'
  border
/>

2. 新しいパラメータグループをRDS Postgresデータベースに適用します

<Image
  img={modify_parameter_group}
  alt='新しいパラメータグループでRDS Postgresを変更'
  size='lg'
  border
/>

3. 変更を適用するためにRDSインスタンスを再起動します

<Image img={reboot_rds} alt='RDS Postgresの再起動' size='lg' border />


## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてRDS Postgresインスタンスに接続し、以下のコマンドを実行します:

1. ClickPipes専用のユーザーを作成します:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. スキーマ権限を付与します。以下の例は`public`スキーマの権限を示しています。レプリケートする各スキーマに対してこれらのコマンドを繰り返してください:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. レプリケーション権限を付与します:

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. レプリケーション用のパブリケーションを作成します:

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## ネットワークアクセスの設定 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

RDSインスタンスへのトラフィックを制限する場合は、[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)をRDSセキュリティグループの`Inbound rules`に追加してください。

<Image
  img={security_group_in_rds_postgres}
  alt='RDS Postgresでセキュリティグループを見つける場所'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='上記のセキュリティグループのインバウンドルールを編集'
  size='lg'
  border
/>

### AWS PrivateLinkによるプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワーク経由でRDSインスタンスに接続するには、AWS PrivateLinkを使用できます。接続を設定するには、[ClickPipes用AWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。

### RDS Proxyの回避策 {#workarounds-for-rds-proxy}

RDS Proxyは論理レプリケーション接続をサポートしていません。RDSで動的IPアドレスを使用しており、DNS名やLambdaを使用できない場合、以下の代替手段があります:

1. cronジョブを使用して、RDSエンドポイントのIPを定期的に解決し、変更があればNLBを更新する。
2. EventBridge/SNSを使用したRDSイベント通知:AWS RDSイベント通知を使用して更新を自動的にトリガーする
3. 安定したEC2:EC2インスタンスをデプロイして、ポーリングサービスまたはIPベースのプロキシとして機能させる
4. TerraformやCloudFormationなどのツールを使用してIPアドレス管理を自動化する。


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、PostgresインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
ClickPipeの作成時に必要となるため、Postgresインスタンスのセットアップで使用した接続情報を必ず控えておいてください。
