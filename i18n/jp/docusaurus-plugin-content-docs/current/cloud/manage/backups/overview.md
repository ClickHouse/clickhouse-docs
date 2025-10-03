---
sidebar_label: '概要'
sidebar_position: 0
slug: '/cloud/manage/backups/overview'
title: '概要'
keywords:
- 'backups'
- 'cloud backups'
- 'restore'
description: 'ClickHouse Cloud におけるバックアップの概要を提供します。'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# バックアップ

データベースのバックアップは、安全網を提供します。予期しない理由でデータが失われた場合に、サービスを最後の成功したバックアップから以前の状態に復元できるようにします。これによりダウンタイムが最小化され、ビジネスにとって重要なデータが永続的に失われることを防ぎます。このガイドでは、ClickHouse Cloudでのバックアップの仕組み、サービスのバックアップを構成するためのオプション、およびバックアップからの復元方法について説明します。

## ClickHouse Cloudでのバックアップの仕組み {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloudのバックアップは、「完全」と「増分」バックアップの組み合わせで構成されるバックアップチェーンです。チェーンはフルバックアップから始まり、次に予定された数回の期間にわたって増分バックアップが取得され、バックアップのシーケンスが作成されます。バックアップチェーンが一定の長さに達すると、新しいチェーンが開始されます。このバックアップの全チェーンは、必要に応じて新しいサービスにデータを復元するために使用できます。特定のチェーンに含まれるすべてのバックアップがサービスに設定された保持期間を過ぎると（保持については後述）、そのチェーンは破棄されます。

以下のスクリーンショットでは、実線の四角がフルバックアップを示し、点線の四角が増分バックアップを示しています。四角の周りの実線の長方形は保持期間を示し、エンドユーザーがバックアップを復元するために使用できるバックアップを可視化しています。以下のシナリオでは、24時間ごとにバックアップが取得され、2日間保持されます。

1日目には、バックアップチェーンを開始するためにフルバックアップが取得されます。2日目には増分バックアップが取得され、フルバックアップと増分バックアップが復元のために利用可能になります。7日目には、チェーンに1つのフルバックアップと6つの増分バックアップがあり、最近の2つの増分バックアップはユーザーに見えます。8日目には、新しいフルバックアップを取得し、9日目には新しいチェーンに2つのバックアップがあるため、前のチェーンは破棄されます。

<Image img={backup_chain} size="md" alt="ClickHouse Cloudのバックアップチェーンの例" />

*Clickhouse Cloudのバックアップシナリオの例*

## デフォルトのバックアップポリシー {#default-backup-policy}

Basic、Scale、Enterpriseティアでは、バックアップは計測され、ストレージとは別に請求されます。すべてのサービスはデフォルトで1つのバックアップを持ち、ScaleティアからはCloud Consoleの設定タブを介してさらに構成できます。

## バックアップステータスのリスト {#backup-status-list}

サービスは、デフォルトの毎日スケジュールまたは自分で選んだ[カスタムスケジュール](./configurable-backups.md)に基づいてバックアップされます。利用可能なすべてのバックアップはサービスの**バックアップ**タブから見ることができます。ここでは、バックアップのステータス、持続時間、およびバックアップのサイズを確認できます。また、**アクション**コラムを使用して特定のバックアップを復元することもできます。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloudのバックアップステータスのリスト" border/>

## バックアップコストの理解 {#understanding-backup-cost}

デフォルトのポリシーに従い、ClickHouse Cloudは毎日バックアップを行い、24時間保持します。データをより多く保持する必要があるスケジュールを選択したり、バックアップをより頻繁に行うことで、追加のストレージ料金が発生する可能性があります。

バックアップコストを理解するには、使用画面からサービスごとのバックアップコストを表示できます（以下に示す通り）。カスタマイズされたスケジュールで数日間バックアップを実行している状態から、コストの概念を把握し、バックアップの月額コストを外挿することができます。

<Image img={backup_usage} size="md" alt="ClickHouse Cloudのバックアップ使用量チャート" border/>

バックアップの総コストを推定するには、スケジュールを設定する必要があります。また、スケジュールを設定する前に月額コストの見積もりを得るために、私たちは[料金計算機](https://clickhouse.com/pricing)の更新にも取り組んでいます。コストを見積もるために、以下の入力が必要になります：
- 完全バックアップと増分バックアップのサイズ
- 希望する頻度
- 希望する保持
- クラウドプロバイダーと地域

:::note
サービス内のデータが時間の経過とともに増加するにつれて、バックアップの推定コストが変化することに注意してください。
:::

## バックアップを復元する {#restore-a-backup}

バックアップは、バックアップが取得された既存のサービスではなく、新しいClickHouse Cloudサービスに復元されます。

**バックアップ**アイコンをクリックした後、新しいサービスの名前を指定してから、このバックアップを復元できます：

<Image img={backup_restore} size="md" alt="ClickHouse Cloudでのバックアップの復元" />

新しいサービスは準備ができるまでサービスリストに「プロビジョニング」と表示されます：

<Image img={backup_service_provisioning} size="md" alt="プロビジョニングサービスの進行中" border/>

## 復元されたサービスの操作 {#working-with-your-restored-service}

バックアップが復元された後、似たような2つのサービスがあります：復元が必要だった**元のサービス**と、元のバックアップから復元された新しい**復元サービス**です。

バックアップの復元が完了したら、次のいずれかを実行する必要があります：
- 新しい復元サービスを使用し、元のサービスを削除します。
- 新しい復元サービスから元のサービスにデータを移行し、新しい復元サービスを削除します。

### **新しい復元サービス**を使用する {#use-the-new-restored-service}

新しいサービスを使用するには、以下の手順を実行します：

1. ニーズに必要なIPアクセスリストのエントリが新しいサービスに存在することを確認します。
1. 新しいサービスに必要なデータが含まれていることを確認します。
1. 元のサービスを削除します。

### **新しく復元されたサービス**から**元のサービス**にデータを移行する {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

新しく復元されたサービスを何らかの理由で使用できない場合（たとえば、まだ既存のサービスに接続しているユーザーやアプリケーションがある場合）、新しく復元されたデータを元のサービスに移行することを決定するかもしれません。以下の手順で移行が可能です：

**新しく復元されたサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じIP許可リストのバックアップから復元される必要があります。他のClickHouse Cloudサービスへの接続は、**Anywhere**からのアクセスが許可されていない限り許可されません。許可リストを変更し、一時的に**Anywhere**からのアクセスを許可してください。詳細は[IPアクセスリスト](/cloud/security/setting-ip-filters)のドキュメントを参照してください。

**新しく復元されたClickHouseサービス（復元されたデータをホストするシステム）で**

:::note
アクセスするには、新しいサービスのパスワードをリセットする必要があります。それはサービスリストの**設定**タブから行うことができます。
:::

ソーステーブル（この例では`db.table`）を読み取ることができる読み取り専用ユーザーを追加します：

  ```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
  ```

  ```sql
  GRANT SELECT ON db.table TO exporter;
  ```

テーブル定義をコピーします：

  ```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'db' AND table = 'table'
  ```

**損傷したテーブルを持つ先行ClickHouse Cloudシステムにて：**

宛先データベースを作成します：
  ```sql
  CREATE DATABASE db
  ```

ソースの`CREATE TABLE`ステートメントを使用して宛先を作成します：

:::tip
`CREATE`ステートメントを実行する際には、`ENGINE`を`ReplicatedMergeTree`に変更してください。ClickHouse Cloudは常にテーブルをレプリケートし、正しいパラメータを提供します。
:::

  ```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
  ```

新しく復元されたClickHouse Cloudサービスからデータを元のサービスに取得するために、`remoteSecure`関数を使用します：

  ```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

元のサービスにデータを成功裏に挿入した後、サービス内のデータを検証してください。データが確認された後には、新しいサービスを削除することも忘れないでください。

## テーブルの復元または未削除 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

ClickHouse Cloudでは`UNDROP`コマンドはサポートされていません。誤ってテーブルを`DROP`した場合、最善の策は最後のバックアップを復元し、バックアップからテーブルを再作成することです。

ユーザーが誤ってテーブルを削除するのを防ぐために、特定のユーザーまたはロールに対して[`DROP TABLE`コマンド](/sql-reference/statements/drop#drop-table)の権限を取り消すために[`GRANT`ステートメント](/sql-reference/statements/grant)を使用できます。

:::note
デフォルトでは、ClickHouse Cloudでは1TBを超えるサイズのテーブルを削除することはできないことに注意してください。これを超えるサイズのテーブルを削除したい場合には、次の設定`max_table_size_to_drop`を使用して実行できます：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- 限度を2TBに増やす
```
:::

## カスタマイズ可能なバックアップ {#configurable-backups}

デフォルトのバックアップスケジュールとは異なるバックアップスケジュールを設定したい場合は、[カスタマイズ可能なバックアップ](./configurable-backups.md)を参照してください。

## 自分のクラウドアカウントにバックアップをエクスポート {#export-backups-to-your-own-cloud-account}

バックアップを自分のクラウドアカウントにエクスポートしたいユーザーは、[こちら](./export-backups-to-own-cloud-account.md)をご覧ください。
