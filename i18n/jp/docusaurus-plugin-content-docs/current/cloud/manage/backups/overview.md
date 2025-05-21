---
sidebar_label: '概要'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '概要'
keywords: ['バックアップ', 'クラウドバックアップ', '復元']
description: 'ClickHouse Cloud におけるバックアップの概要を提供します'
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

データベースのバックアップは、データが予期しない理由で失われた場合に、サービスを最後の成功したバックアップから以前の状態に復元できるようにすることで、安全ネットを提供します。これによりダウンタイムが最小限に抑えられ、ビジネス上重要なデータが永続的に失われるのを防ぎます。このガイドでは、ClickHouse Cloud におけるバックアップの仕組み、サービスのバックアップを構成するためのオプション、バックアップからの復元方法について説明します。

## ClickHouse Cloud におけるバックアップの仕組み {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloud のバックアップは、「フル」バックアップと「インクリメンタル」バックアップの組み合わせで構成されるバックアップチェーンです。チェーンはフルバックアップから始まり、その後いくつかの定期的な時間間隔でインクリメンタルバックアップが取得され、バックアップのシーケンスが作成されます。バックアップチェーンが一定の長さに達すると、新しいチェーンが開始されます。このバックアップチェーン全体は、必要に応じて新しいサービスにデータを復元するために利用されます。特定のチェーンに含まれるすべてのバックアップがサービスで設定された保持期間を過ぎると（保持については後述）、チェーンは破棄されます。

以下のスクリーンショットでは、実線の四角がフルバックアップを示し、点線の四角がインクリメンタルバックアップを示しています。実線の長方形は保持期間と、エンドユーザーがバックアップ復元に使用できるバックアップを示しています。以下のシナリオでは、24時間ごとにバックアップが取得され、2日間保持されます。

1日目にフルバックアップが取得され、バックアップチェーンが開始されます。2日目にインクリメンタルバックアップが取得され、現在、フルバックアップとインクリメンタルバックアップが利用可能です。7日目には、1つのフルバックアップと6つのインクリメンタルバックアップがチェーンにあり、最近の2つのインクリメンタルバックアップがユーザーに表示されます。8日目に新しいフルバックアップを取得し、9日目に新しいチェーンに2つのバックアップができた時点で、以前のチェーンは破棄されます。

<Image img={backup_chain} size="md" alt="ClickHouse Cloud のバックアップチェーン例" />

*Clickhouse Cloud におけるバックアップシナリオの例*

## デフォルトバックアップポリシー {#default-backup-policy}

Basic、Scale、および Enterprise ティアでは、バックアップはメーター制であり、ストレージとは別に請求されます。すべてのサービスは1つのバックアップをデフォルトとして持ち、Scale ティア以降は Cloud Console の設定タブを通じてより多くのバックアップを構成できます。

## バックアップステータスリスト {#backup-status-list}

サービスは、デフォルトの日次スケジュールであるか、あなたが選択した [カスタムスケジュール](./configurable-backups.md) に基づいてバックアップされます。すべての利用可能なバックアップはサービスの **バックアップ** タブから見ることができます。ここから、バックアップのステータス、所要時間、サイズを確認できます。また、**アクション** 列を使用して特定のバックアップを復元することもできます。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud におけるバックアップステータスのリスト" border/>

## バックアップコストの理解 {#understanding-backup-cost}

デフォルトポリシーに従い、ClickHouse Cloud では毎日バックアップを取得し、24時間保持することが義務付けられています。より多くのデータを保持する必要があるスケジュールや、より頻繁なバックアップを必要とするスケジュールを選択すると、バックアップのための追加ストレージ料金が発生する可能性があります。

バックアップコストを理解するには、使用状況画面からサービスごとのバックアップコストを確認できます（以下参照）。カスタマイズされたスケジュールで数日間バックアップが実行されると、そのコストを把握し、バックアップの月額コストを推測できます。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud におけるバックアップ使用状況のチャート" border/>

バックアップの総コストを見積もるには、スケジュールを設定する必要があります。また、スケジュールを設定する前に月額コストの見積もりができるように、[価格計算ツール](https://clickhouse.com/pricing)の更新に取り組んでいます。コストを見積もるには、次の入力が必要です：
- フルバックアップおよびインクリメンタルバックアップのサイズ
- 希望する頻度
- 希望する保持期間
- クラウドプロバイダーおよびリージョン

:::note
データサービスのサイズが時間の経過とともに増加するにつれて、バックアップの推定コストは変動することに留意してください。
:::

## バックアップの復元 {#restore-a-backup}

バックアップは、バックアップを取得した既存のサービスではなく、新しい ClickHouse Cloud サービスに復元されます。

**復元** バックアップアイコンをクリックすると、作成される新しいサービス名を指定し、このバックアップを復元できます：

<Image img={backup_restore} size="md" alt="ClickHouse Cloud におけるバックアップの復元" />

新しいサービスは準備が整うまでサービスリストに `Provisioning` として表示されます：

<Image img={backup_service_provisioning} size="md" alt="プロビジョニング中のサービス" border/>

## 復元されたサービスとの作業 {#working-with-your-restored-service}

バックアップが復元された後、似たような2つのサービスが存在します：復元が必要だった **元のサービス** と、元からのバックアップから復元された新しい **復元されたサービス** です。

バックアップの復元が完了したら、次のいずれかを実行すべきです：
- 新しい復元されたサービスを使用し、元のサービスを削除する。
- 新しい復元されたサービスから元のサービスへデータを移行し、新しい復元されたサービスを削除する。

### **新しい復元されたサービス** を使用する {#use-the-new-restored-service}

新しいサービスを使用するには、次の手順を実行します：

1. 新しいサービスに必要な IP アクセスリストのエントリがあることを確認します。
1. 新しいサービスに必要なデータが含まれていることを確認します。
1. 元のサービスを削除します。

### **新しく復元されたサービス** から **元のサービス** へデータを移行する {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

新しく復元されたサービスで作業できない理由がある場合、例えば、まだ既存のサービスに接続しているユーザーやアプリケーションがある場合、新しく復元されたデータを元のサービスに移行することを検討するかもしれません。この移行は、次の手順を実行することで実現できます：

**新しく復元されたサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じ IP アローワリストからバックアップを復元する必要があります。これは、**Anywhere** からのアクセスが許可されていない限り、他の ClickHouse Cloud サービスへの接続が許可されないためです。アローワリストを変更して、一時的に **Anywhere** からのアクセスを許可します。詳細については [IP アクセスリスト](/cloud/security/setting-ip-filters) のドキュメントを参照してください。

**新しく復元された ClickHouse サービス（復元されたデータをホストするシステム）上で**

:::note
新しいサービスにアクセスするには、サービスのパスワードをリセットする必要があります。これはサービスリストの **設定** タブから行えます。
:::

ソーステーブル（この例では `db.table`）を読み取れる読み取り専用のユーザーを追加します：

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

**損傷したテーブルを持つ宛先 ClickHouse Cloud システム上で：**

宛先データベースを作成します：
  ```sql
  CREATE DATABASE db
  ```

ソースからの `CREATE TABLE` ステートメントを使用して宛先を作成します：

:::tip
`CREATE` ステートメントを実行する際、パラメータなしで `ReplicatedMergeTree` に `ENGINE` を変更してください。ClickHouse Cloud は常にテーブルをレプリケートし、正しいパラメータを提供します。
:::

  ```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
  ```

`remoteSecure` 関数を使用して、新しく復元された ClickHouse Cloud サービスから元のサービスにデータを引き込む：

  ```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
  ```

データを元のサービスに正常に挿入したら、サービス内のデータを確認してください。また、データが確認されたら新しいサービスを削除してください。

## テーブルの復元または削除 {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

`UNDROP` コマンドは ClickHouse Cloud ではサポートされていません。テーブルを誤って `DROP` した場合の最善の対処法は、最後のバックアップを復元し、バックアップからテーブルを再作成することです。

ユーザーが誤ってテーブルを削除するのを防ぐため、特定のユーザーまたはロールに対して [`DROP TABLE` コマンド](/sql-reference/statements/drop#drop-table) の権限を剥奪するために [`GRANT` ステートメント](/sql-reference/statements/grant) を使用できます。

:::note
データの誤削除を防ぐために、ClickHouse Cloud ではデフォルトで size > `1TB` のテーブルを削除することはできません。この制限を超えるテーブルを削除したい場合は、設定 `max_table_size_to_drop` を使用することで可能です：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2097152 -- 制限を2TBに増加
```
:::

## 構成可能なバックアップ {#configurable-backups}

デフォルトのバックアップスケジュールとは異なるバックアップスケジュールを設定したい場合は、[構成可能なバックアップ](./configurable-backups.md)を確認してください。

## 自分のクラウドアカウントへのバックアップのエクスポート {#export-backups-to-your-own-cloud-account}

自分のクラウドアカウントにバックアップをエクスポートしたいユーザーは、[こちら](./export-backups-to-own-cloud-account.md)を参照してください。
