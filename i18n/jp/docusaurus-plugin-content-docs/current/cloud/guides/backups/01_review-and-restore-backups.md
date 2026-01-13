---
sidebar_label: 'バックアップの確認と復元'
sidebar_position: 0
slug: /cloud/manage/backups/overview
title: '概要'
keywords: ['バックアップ', 'クラウドバックアップ', '復元']
description: 'ClickHouse Cloud におけるバックアップの概要です'
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


# バックアップの確認と復元 {#review-and-restore-backups}

このガイドでは、ClickHouse Cloud におけるバックアップの仕組み、サービスのバックアップ設定に利用できるオプション、およびバックアップからの復元方法について説明します。

**前提条件**

- 「[ClickHouse Cloud におけるバックアップの仕組み](/cloud/features/backups#how-backups-work-in-clickhouse-cloud)」（機能の概要ページ）を読んでいること

## バックアップステータス一覧 {#backup-status-list}

サービスは、デフォルトの毎日スケジュールまたは選択した[カスタムスケジュール](/cloud/manage/backups/configurable-backups)に従ってバックアップされます。利用可能なすべてのバックアップは、サービスの **Backups** タブから確認できます。ここでは、バックアップのステータス、所要時間、およびバックアップサイズを確認できます。また、**Actions** 列から特定のバックアップを復元することも可能です。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud におけるバックアップステータスの一覧" border/>

## バックアップコストについて {#understanding-backup-cost}

デフォルトポリシーでは、ClickHouse Cloud は 24 時間の保持期間で 1 日 1 回のバックアップ取得を必須としています。より多くのデータを保持するスケジュールを選択したり、バックアップ頻度を高くすると、バックアップ用ストレージに追加料金が発生する可能性があります。

バックアップコストを把握するには、利用状況画面からサービスごとのバックアップコストを確認できます（以下を参照）。カスタマイズしたスケジュールで数日間バックアップを実行した後であれば、そのコスト感をつかみ、バックアップの月額コストを概算できます。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud におけるバックアップ使用状況チャート" border/>

バックアップの総コストを見積もるには、スケジュールを設定する必要があります。スケジュールを設定する前に月額コストを見積もれるよう、現在 [pricing calculator](https://clickhouse.com/pricing)（料金計算ツール）の更新にも取り組んでいます。コストを見積もるには、次の入力値が必要です。

- フルバックアップおよび増分バックアップのサイズ
- 希望する実行頻度
- 希望する保持期間
- クラウドプロバイダーおよびリージョン

:::note
サービス内のデータサイズは時間の経過とともに増加するため、バックアップの推定コストも変化する点に注意してください。
:::

## バックアップの復元 {#restore-a-backup}

バックアップは、バックアップを取得した既存のサービスではなく、新しい ClickHouse Cloud サービスに復元されます。

**Restore** アイコンをクリックした後、作成される新しいサービスのサービス名を指定して、そのバックアップを復元できます。

<Image img={backup_restore} size="md" alt="ClickHouse Cloud でバックアップを復元する" />

新しいサービスは、利用可能になるまでサービス一覧で `Provisioning` と表示されます。

<Image img={backup_service_provisioning} size="md" alt="サービスプロビジョニング中" border/>

## 復元したサービスの操作 {#working-with-your-restored-service}

バックアップを復元すると、2 つの類似したサービスが存在することになります。復元が必要だった **元のサービス** と、そのバックアップから復元された新しい **復元済みサービス** です。

バックアップの復元が完了したら、次のいずれかを実施してください。

* 新しい復元済みサービスを使用し、元のサービスを削除する。
* 新しい復元済みサービスから元のサービスへデータを移行し、新しい復元済みサービスを削除する。

### **新しい復元済みサービス**を使用する {#use-the-new-restored-service}

新しいサービスを使用するには、次の手順を実行します。

1. 新しいサービスに、ユースケースに必要な IP アクセスリストのエントリが設定されていることを確認します。
2. 新しいサービスに、必要なデータが含まれていることを確認します。
3. 元のサービスを削除します。

### **新しく復元したサービス**から **元のサービス** へデータを移行する {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

何らかの理由で新しく復元したサービスを利用できない場合、たとえば既存のサービスに接続しているユーザーやアプリケーションがまだ存在する場合は、新しく復元したデータを元のサービスへ移行することを検討することもできます。移行は次の手順で実施できます。

**新しく復元したサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じ IP Allow List を用いてバックアップから復元されているはずです。**Anywhere** からのアクセスを許可していない限り、他の ClickHouse Cloud サービスへの接続は許可されないため、この設定が必要です。IP Allow List を変更し、一時的に **Anywhere** からのアクセスを許可してください。詳細は [IP Access List](/cloud/security/setting-ip-filters) ドキュメントを参照してください。

**新しく復元した ClickHouse サービス上（復元されたデータをホストしているシステム）で**

:::note
新しいサービスへアクセスするには、そのパスワードをリセットする必要があります。サービスリストの **Settings** タブから実行できます。
:::

ソーステーブル（この例では `db.table`）を読み取ることができる読み取り専用ユーザーを追加します。

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

**宛先側の ClickHouse Cloud システム（破損したテーブルがあった方）で:**

宛先のデータベースを作成します。

```sql
  CREATE DATABASE db
```

ソースの `CREATE TABLE` 文を使用して、復元先にテーブルを作成します。

:::tip
`CREATE` 文を実行する際は、`ENGINE` をパラメータを指定しない `ReplicatedMergeTree` に変更してください。ClickHouse Cloud は常にテーブルをレプリケートし、正しいパラメータを自動的に付与します。
:::

```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
```

`remoteSecure` 関数を使用して、新しく復元した ClickHouse Cloud サービスから元のサービスにデータを取り込みます。

```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

元のサービスへのデータ挿入が正常に完了したら、そのサービス上でデータを必ず検証してください。データの検証が完了したら、新しいサービスは削除してください。


## テーブルの削除取り消し（UNDROP） {#undeleting-or-undropping-tables}

`UNDROP` コマンドは、[Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog) を通じて ClickHouse Cloud でサポートされています。

ユーザーによるテーブルの誤った削除を防ぐには、[`GRANT` 文](/sql-reference/statements/grant) を使用して、特定のユーザーまたはロールに対する [`DROP TABLE` コマンド](/sql-reference/statements/drop#drop-table) の権限を取り消すことができます。

:::note
データの誤削除を防ぐため、ClickHouse Cloud ではデフォルトでサイズが `1TB` を超えるテーブルを削除することはできません。
このしきい値を超えるテーブルを削除する必要がある場合は、`max_table_size_to_drop` 設定を使用して実行できます。

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```

:::

:::note
レガシープラン: レガシープランをご利用のお客様の場合、保持期間24時間のデフォルト日次バックアップはストレージ料金に含まれます。
:::


## バックアップの所要時間 {#backup-durations}

バックアップおよびリストアにかかる時間は、データベースのサイズ、スキーマ、テーブル数など、複数の要因によって異なります。
増分バックアップはバックアップ対象のデータ量が少ないため、通常はフルバックアップよりもはるかに短時間で完了します。
増分バックアップからのリストアは、チェーン内のすべての増分バックアップと直近のフルバックアップがリストア処理に含まれるため、上で説明したとおり、フルバックアップからのリストアよりもわずかに時間がかかります。

テストでは、約 1 TB の比較的小さなバックアップであれば、バックアップに 10〜15 分程度、もしくはそれ以上かかることがあると確認しています。
20 TB 未満のバックアップであれば 1 時間以内に完了するはずであり、50 TB のデータのバックアップにはおおよそ 2〜3 時間かかります。
バックアップはサイズが大きくなるほどスケールメリットがあり、社内の一部サービスでは最大 1 PB のバックアップが約 10 時間で完了した例もあります。

:::note
外部バケットへのバックアップは、ClickHouse バケットへのバックアップよりも遅くなる場合があります。
:::

リストアにかかる時間は、バックアップにかかる時間とほぼ同じです。

実際の所要時間は上述のように複数の要因に依存するため、独自のデータベースまたはサンプルデータを用いてテストを実施し、より正確な見積もりを取得することを推奨します。

## 設定可能なバックアップ {#configurable-backups}

デフォルトとは異なるバックアップのスケジュールを設定したい場合は、[設定可能なバックアップ](/cloud/manage/backups/configurable-backups)を参照してください。

## 自分のクラウドアカウントへのバックアップのエクスポート {#export-backups-to-your-own-cloud-account}

バックアップを自分のクラウドアカウントにエクスポートしたい場合は、[こちら](/cloud/manage/backups/export-backups-to-own-cloud-account)を参照してください。