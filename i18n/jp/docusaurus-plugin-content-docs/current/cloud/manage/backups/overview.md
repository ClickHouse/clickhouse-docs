---
sidebar_label: 概要
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: 概要
keywords: [バックアップ, クラウドバックアップ, リストア]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import backup_chain from '@site/static/images/cloud/manage/backup-chain.png';
import backup_status_list from '@site/static/images/cloud/manage/backup-status-list.png';
import backup_usage from '@site/static/images/cloud/manage/backup-usage.png';
import backup_restore from '@site/static/images/cloud/manage/backup-restore.png';
import backup_service_provisioning from '@site/static/images/cloud/manage/backup-service-provisioning.png';


# バックアップ

データベースのバックアップは、データが予期しない理由で失われた場合にサービスを最後の成功したバックアップから以前の状態に復元できることを保証することにより、安全策を提供します。これによりダウンタイムを最小限に抑え、ビジネス上重要なデータが永続的に失われるのを防ぎます。このガイドでは、ClickHouse Cloudにおけるバックアップの仕組み、サービスのバックアップを構成するためのオプション、およびバックアップからのリストアについて説明します。

## ClickHouse Cloudにおけるバックアップの仕組み {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloudのバックアップは、「フル」バックアップと「増分」バックアップの組み合わせで構成されるバックアップチェーンです。チェーンはフルバックアップから始まり、次の数回のスケジュールされた時間にわたって増分バックアップが取得され、バックアップのシーケンスが作成されます。バックアップチェーンが特定の長さに達すると、新しいチェーンが開始されます。このバックアップチェーン全体は、必要に応じて新しいサービスにデータを復元するために利用できます。特定のチェーンに含まれるすべてのバックアップがサービスに設定された保持期間を超えると（保持については下で詳しく説明します）、チェーンは破棄されます。

以下のスクリーンショットでは、実線の四角はフルバックアップを示し、破線の四角は増分バックアップを示しています。実線の長方形は四角を囲み、終了ユーザーに表示されるバックアップと保持期間を示します。これらはバックアップリストアに使用できます。以下のシナリオでは、バックアップは24時間ごとに取得され、2日間保持されます。

1日目に、バックアップチェーンを開始するためのフルバックアップが取得されます。2日目に、増分バックアップが取得され、フルバックアップと増分バックアップの両方からリストアできる状態になります。7日目までに、チェーンには1つのフルバックアップと6つの増分バックアップが含まれ、最新の2つの増分バックアップがユーザーに表示されます。8日目に新しいフルバックアップを取得し、9日目に新しいチェーンに2つのバックアップがあれば、以前のチェーンは破棄されます。

<img src={backup_chain}
    alt="ClickHouse Cloudにおけるバックアップチェーンの例"
    class="image"
/>

*ClickHouse Cloudにおけるバックアップシナリオの例*

## デフォルトバックアップポリシー {#default-backup-policy}

Basic、Scale、Enterpriseプランでは、バックアップはメーター制であり、ストレージとは別に請求されます。すべてのサービスはデフォルトで1つのバックアップを持っており、Scaleプランから設定タブを通じてさらにバックアップを構成することができます。

## バックアップステータスリスト {#backup-status-list}

サービスは、デフォルトの日次スケジュールまたはあなたが選択した[カスタムスケジュール](./configurable-backups.md)に基づいてバックアップされます。すべての利用可能なバックアップはサービスの**バックアップ**タブから表示できます。ここからバックアップの状態、所要時間、およびバックアップのサイズを確認できます。また、**アクション**列を使用して特定のバックアップをリストアすることもできます。

<img src={backup_status_list}
    alt="ClickHouse Cloudにおけるバックアップステータスのリスト"
    class="image"
/>

## バックアップコストを理解する {#understanding-backup-cost}

デフォルトポリシーに従い、ClickHouse Cloudは毎日バックアップを取得し、24時間保持します。より多くのデータを保持する必要があるスケジュールや、より頻繁にバックアップを取得するスケジュールを選択すると、バックアップのストレージ料金が追加で発生する可能性があります。

バックアップコストを理解するには、使用状況画面からサービスごとのバックアップコストを確認できます（以下に示すように）。カスタマイズされたスケジュールで数日間バックアップを実行した後、コストの概念を得ることができ、バックアップにかかる月額コストを推定できます。

<img src={backup_usage}
    alt="ClickHouse Cloudにおけるバックアップ使用状況チャート"
    class="image"
/>


バックアップの総コストを見積もるには、スケジュールを設定する必要があります。また、スケジュールを設定する前に月額コストの見積もりを得るために、[価格計算機](https://clickhouse.com/pricing)の更新に取り組んでいます。コストを見積もるために必要な入力項目は以下の通りです：
- フルバックアップと増分バックアップのサイズ
- 希望の頻度
- 希望の保持期間
- クラウドプロバイダと地域

:::note
バックアップの推定コストは、サービス内のデータサイズが時間とともに増加するにつれて変わることに注意してください。
:::


## バックアップをリストアする {#restore-a-backup}

バックアップは、バックアップが取得された既存のサービスではなく、新しいClickHouse Cloudサービスにリストアされます。

**バックアップ**アイコンをクリックした後、作成される新しいサービスのサービス名を指定し、その後このバックアップをリストアできます：

<img src={backup_restore}
    alt="ClickHouse Cloudにおけるバックアップのリストア"
    class="image"
/>

新しいサービスは、準備が整うまでサービスリストに`Provisioning`として表示されます：

<img src={backup_service_provisioning}
    alt="サービスのプロビジョニング中"
    class="image"
    style={{width: '80%'}}
/>

## リストアされたサービスを扱う {#working-with-your-restored-service}

バックアップがリストアされた後、同様の2つのサービスが存在します：元の**サービス**（バックアップからリストアする必要があったもの）と、新しくバックアップから復元された**リストアサービス**です。

バックアップリストアが完了したら、以下のいずれかを行う必要があります：
- 新しいリストアサービスを利用し、元のサービスを削除する。
- 新しいリストアサービスから元のサービスにデータを移行し、新しいリストアサービスを削除する。

### **新しいリストアサービス**を使用する {#use-the-new-restored-service}

新しいサービスを使用するために、以下の手順を実行します：

1. 新しいサービスが使用ケースに必要なIPアクセスリストのエントリを持っていることを確認します。
2. 新しいサービスが必要なデータを含んでいることを確認します。
3. 元のサービスを削除します。

### **新しくリストアされたサービス**から**元のサービス**へデータを移行する {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

もし、何らかの理由で新しくリストアされたサービスを使用できない場合（例えば、まだ既存のサービスに接続しているユーザーやアプリケーションがある場合）、新しくリストアされたデータを元のサービスに移行することを決定するかもしれません。移行は以下の手順に従って行うことができます：

**新しくリストアされたサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じIP許可リストを持つバックアップからリストアされる必要があります。これは、他のClickHouse Cloudサービスへの接続が許可されないためです。アクセスリストを一時的に変更し、**Anywhere**からのアクセスを許可します。詳細については、[IPアクセスリスト](/cloud/security/setting-ip-filters)のドキュメントを参照してください。

**新しくリストアされたClickHouseサービス（リストアデータをホストするシステム）で**

:::note
新しいサービスにアクセスするためにパスワードをリセットする必要があります。これはサービスリストの**設定**タブから行えます。
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

**デスティネーションClickHouse Cloudシステム（壊れたテーブルを持つシステム）で：**

デスティネーションデータベースを作成します：
  ```sql
  CREATE DATABASE db
  ```

ソースから取得した`CREATE TABLE`ステートメントを使用して、デスティネーションを作成します：

:::tip
`CREATE`ステートメントを実行する際に、`ENGINE`をパラメータなしの`ReplicatedMergeTree`に変更してください。ClickHouse Cloudは常にテーブルをレプリケートし、適切なパラメータを提供します。
:::

  ```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
  ```

新しくリストアされたClickHouse Cloudサービスから元のサービスにデータをプルするために、`remoteSecure`関数を使用します：

  ```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

データを元のサービスに正常に挿入した後は、サービス内のデータを確認してください。データが確認できたら、新しいサービスを削除することをお勧めします。

## テーブルの削除またはドロップの取り消し {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

`UNDROP`コマンドはClickHouse Cloudでサポートされていません。誤ってテーブルを`DROP`した場合、最善の策は最後のバックアップをリストアし、バックアップからテーブルを再作成することです。

ユーザーが誤ってテーブルを削除するのを防ぐために、特定のユーザーまたはロールに対して[`DROP TABLE`コマンド](/sql-reference/statements/drop#drop-table)の権限を取り消す[`GRANT`ステートメント](/sql-reference/statements/grant)を使用できます。

:::note
データの偶発的な削除を防ぐため、ClickHouse Cloudではデフォルトでサイズが`1TB`を超えるテーブルを削除することはできません。この閾値を超えるテーブルを削除する必要がある場合は、`max_table_size_to_drop`設定を使用して行うことができます：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- 制限を2TBに引き上げる
```
:::

## 設定可能なバックアップ {#configurable-backups}

デフォルトのバックアップスケジュールとは異なるバックアップスケジュールを設定したい場合は、[設定可能なバックアップ](./configurable-backups.md)を確認してください。

## バックアップを自分のクラウドアカウントにエクスポート {#export-backups-to-your-own-cloud-account}

自分のクラウドアカウントにバックアップをエクスポートしたいユーザーは、[こちら](./export-backups-to-own-cloud-account.md)を参照してください。
