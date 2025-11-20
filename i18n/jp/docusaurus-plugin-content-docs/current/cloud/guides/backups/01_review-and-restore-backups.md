---
sidebar_label: 'バックアップの確認と復元'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '概要'
keywords: ['backups', 'cloud backups', 'restore']
description: 'ClickHouse Cloudのバックアップ機能の概要'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# バックアップの確認と復元

このガイドでは、ClickHouse Cloudにおけるバックアップの動作、サービスのバックアップ設定オプション、およびバックアップからの復元方法について説明します。



## バックアップステータス一覧 {#backup-status-list}

サービスは、デフォルトの日次スケジュールまたはユーザーが選択した[カスタムスケジュール](/cloud/manage/backups/configurable-backups)のいずれかに基づいて、設定されたスケジュールに従ってバックアップされます。利用可能なすべてのバックアップは、サービスの**Backups**タブから確認できます。ここでは、バックアップのステータス、実行時間、およびバックアップのサイズを確認できます。また、**Actions**列から特定のバックアップを復元することもできます。

<Image
  img={backup_status_list}
  size='md'
  alt='ClickHouse Cloudのバックアップステータス一覧'
  border
/>


## バックアップコストについて {#understanding-backup-cost}

デフォルトポリシーでは、ClickHouse Cloudは24時間の保持期間で毎日バックアップを実行します。より多くのデータを保持するスケジュールを選択したり、より頻繁にバックアップを実行したりすると、バックアップに対する追加のストレージ料金が発生する可能性があります。

バックアップコストを把握するには、使用状況画面からサービスごとのバックアップコストを確認できます（下図参照）。カスタマイズしたスケジュールでバックアップを数日間実行すると、コストの概算を把握し、月間のバックアップコストを推定できます。

<Image
  img={backup_usage}
  size='md'
  alt='ClickHouse Cloudのバックアップ使用状況チャート'
  border
/>

バックアップの総コストを見積もるには、スケジュールを設定する必要があります。また、スケジュールを設定する前に月間コストの見積もりを取得できるよう、[料金計算ツール](https://clickhouse.com/pricing)の更新にも取り組んでいます。コストを見積もるには、以下の情報を入力する必要があります：

- フルバックアップと増分バックアップのサイズ
- 希望する実行頻度
- 希望する保持期間
- クラウドプロバイダーとリージョン

:::note
サービス内のデータサイズが時間とともに増加するにつれて、バックアップの推定コストも変化することに留意してください。
:::


## バックアップの復元 {#restore-a-backup}

バックアップは、バックアップ元の既存サービスではなく、新しいClickHouse Cloudサービスに復元されます。

**Restore**バックアップアイコンをクリックすると、作成される新しいサービスのサービス名を指定し、バックアップを復元できます:

<Image
  img={backup_restore}
  size='md'
  alt='ClickHouse Cloudでのバックアップの復元'
/>

新しいサービスは、準備が完了するまでサービスリストに`Provisioning`として表示されます:

<Image
  img={backup_service_provisioning}
  size='md'
  alt='サービスのプロビジョニング中'
  border
/>


## 復元されたサービスの操作 {#working-with-your-restored-service}

バックアップが復元されると、2つの類似したサービスが存在することになります。復元が必要だった**元のサービス**と、元のサービスのバックアップから復元された新しい**復元されたサービス**です。

バックアップの復元が完了したら、次のいずれかを実行してください。

- 新しい復元されたサービスを使用し、元のサービスを削除する。
- 新しい復元されたサービスから元のサービスにデータを移行し、新しい復元されたサービスを削除する。

### **新しい復元されたサービス**を使用する {#use-the-new-restored-service}

新しいサービスを使用するには、次の手順を実行します。

1. 新しいサービスに、ユースケースに必要なIPアクセスリストのエントリが設定されていることを確認します。
1. 新しいサービスに必要なデータが含まれていることを確認します。
1. 元のサービスを削除します。

### **新しく復元されたサービス**から**元のサービス**にデータを移行する {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

何らかの理由で新しく復元されたサービスを使用できない場合、例えば既存のサービスに接続しているユーザーやアプリケーションがまだ存在する場合などは、新しく復元されたデータを元のサービスに移行することができます。移行は次の手順で実行できます。

**新しく復元されたサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じIP許可リストを持つバックアップから復元されます。**Anywhere**からのアクセスを許可していない限り、他のClickHouse Cloudサービスへの接続は許可されないため、この設定が必要です。許可リストを変更し、一時的に**Anywhere**からのアクセスを許可してください。詳細については、[IPアクセスリスト](/cloud/security/setting-ip-filters)のドキュメントを参照してください。

**新しく復元されたClickHouseサービス上で(復元されたデータをホストするシステム)**

:::note
新しいサービスにアクセスするには、パスワードをリセットする必要があります。これは、サービスリストの**Settings**タブから実行できます。
:::

ソーステーブル(この例では`db.table`)を読み取ることができる読み取り専用ユーザーを追加します。

```sql
CREATE USER exporter
IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
SETTINGS readonly = 1;
```

```sql
GRANT SELECT ON db.table TO exporter;
```

テーブル定義をコピーします。

```sql
SELECT create_table_query
FROM system.tables
WHERE database = 'db' AND table = 'table'
```

**宛先のClickHouse Cloudシステム上で(破損したテーブルがあったシステム):**

宛先データベースを作成します。

```sql
CREATE DATABASE db
```

ソースからの`CREATE TABLE`ステートメントを使用して、宛先を作成します。

:::tip
`CREATE`ステートメントを実行する際は、`ENGINE`をパラメータなしの`ReplicatedMergeTree`に変更してください。ClickHouse Cloudは常にテーブルをレプリケートし、正しいパラメータを提供します。
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

`remoteSecure`関数を使用して、新しく復元されたClickHouse Cloudサービスから元のサービスにデータを取得します。

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

元のサービスにデータを正常に挿入した後、サービス内のデータを必ず検証してください。データが検証されたら、新しいサービスも削除してください。


## テーブルの削除取り消しまたは復元 {#undeleting-or-undropping-tables}

`UNDROP`コマンドは、ClickHouse Cloudで[Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog)を通じてサポートされています。

ユーザーが誤ってテーブルを削除することを防ぐには、[`GRANT`ステートメント](/sql-reference/statements/grant)を使用して、特定のユーザーまたはロールの[`DROP TABLE`コマンド](/sql-reference/statements/drop#drop-table)に対する権限を取り消すことができます。

:::note
データの誤削除を防ぐため、ClickHouse Cloudではデフォルトで`1TB`を超えるサイズのテーブルを削除できないことに注意してください。
この閾値を超えるテーブルを削除したい場合は、`max_table_size_to_drop`設定を使用して実行できます:

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- 制限を2TBに引き上げます
```

:::

:::note
レガシープラン: レガシープランをご利用のお客様の場合、24時間保持されるデフォルトの日次バックアップがストレージコストに含まれています。
:::


## 設定可能なバックアップ {#configurable-backups}

デフォルトのバックアップスケジュールとは異なるスケジュールを設定する場合は、[設定可能なバックアップ](/cloud/manage/backups/configurable-backups)を参照してください。


## 独自のクラウドアカウントへのバックアップのエクスポート {#export-backups-to-your-own-cloud-account}

バックアップを独自のクラウドアカウントにエクスポートする場合は、[こちら](/cloud/manage/backups/export-backups-to-own-cloud-account)を参照してください。
