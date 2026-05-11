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


# バックアップの確認と復元 \{#review-and-restore-backups\}

このガイドでは、ClickHouse Cloud におけるバックアップの動作、サービスのバックアップ構成に利用できるオプション、およびバックアップからの復元方法について説明します。

**前提条件**

- 「[ClickHouse Cloud におけるバックアップの仕組み](/cloud/features/backups#how-backups-work-in-clickhouse-cloud)」（機能概要ページ）を読んでいること

## バックアップステータス一覧 \{#backup-status-list\}

サービスは、デフォルトの日次スケジュールか、ユーザーが選択した[カスタムスケジュール](/cloud/manage/backups/configurable-backups)かに関わらず、設定されたスケジュールに基づいてバックアップされます。利用可能なすべてのバックアップは、サービスの **Backups** タブから確認できます。ここでは、バックアップのステータス、所要時間、およびバックアップサイズを確認できます。**Actions** カラムを使用して、特定のバックアップを復元することもできます。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloud におけるバックアップステータス一覧" border/>

## バックアップコストの把握 \{#understanding-backup-cost\}

デフォルトポリシーでは、ClickHouse Cloud は 24 時間の保持期間で毎日 1 回のバックアップを必須とします。より多くのデータを保持するスケジュールを選択したり、より頻繁にバックアップを実行するようにすると、バックアップ用ストレージの料金が追加で発生する可能性があります。

バックアップコストを把握するには、使用状況画面からサービスごとのバックアップコストを表示できます（下図参照）。カスタマイズしたスケジュールで数日間バックアップを実行すれば、コストの目安が分かるようになり、その値からバックアップの月額コストを概算できます。

<Image img={backup_usage} size="md" alt="ClickHouse Cloud におけるバックアップ使用量チャート" border/>

バックアップの総コストを見積もるには、スケジュールを設定する必要があります。また、スケジュールを設定する前に月額コストの見積もりを取得できるよう、[pricing calculator](https://clickhouse.com/pricing) の更新にも取り組んでいます。コストを見積もるには、次の入力項目を指定する必要があります。

- フルバックアップおよび増分バックアップのサイズ
- 希望する実行頻度
- 希望する保持期間
- Cloud プロバイダーおよびリージョン

:::note
サービス内のデータサイズが時間とともに増加するにつれて、バックアップの推定コストも変化することに注意してください。
:::

## バックアップを復元する \{#restore-a-backup\}

バックアップは、バックアップ元の既存サービスではなく、新しい ClickHouse Cloud サービスとして復元されます。

バックアップの **Restore** アイコンをクリックした後、作成される新しいサービスのサービス名を指定し、そのバックアップを復元できます:

<Image img={backup_restore} size="md" alt="ClickHouse Cloud でバックアップを復元する" />

新しいサービスは、準備が整うまでサービス一覧に `Provisioning` と表示されます:

<Image img={backup_service_provisioning} size="md" alt="サービスのプロビジョニングが進行中" border/>

## 復元されたサービスの扱い方 \{#working-with-your-restored-service\}

バックアップを復元すると、次の 2 つの類似したサービスが存在することになります。復元対象だった**元のサービス**と、その元のサービスのバックアップから復元された新しい**復元済みサービス**です。

バックアップからの復元が完了したら、次のいずれかを実施してください。

- 新しい復元済みサービスを使用し、元のサービスを削除します。
- 新しい復元済みサービスから元のサービスへデータを移行し、その後、新しい復元済みサービスを削除します。

### **新しく復元したサービス**を使用する \{#use-the-new-restored-service\}

新しく復元したサービスを使用するには、次の手順を実行します。

1. 新しく復元したサービスに、ユースケースに必要な IP Access List のエントリが含まれていることを確認してください。
1. 新しく復元したサービスに、必要なデータが含まれていることを確認してください。
1. 元のサービスを削除してください。

### **新しく復元したサービス**から**元のサービス**へデータを移行する \{#migrate-data-from-the-newly-restored-service-back-to-the-original-service\}

何らかの理由で新しく復元したサービスを利用できない場合、たとえば既存のサービスに接続しているユーザーやアプリケーションがまだ存在する場合などには、新しく復元したデータを元のサービスに移行することを検討するかもしれません。移行は次の手順で実行できます。

**新しく復元したサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じ IP Allow List を使用してバックアップから復元されている必要があります。これは、**Anywhere** からのアクセスを許可していない限り、他の ClickHouse Cloud サービスへの接続は許可されないため必須です。Allow List を変更し、一時的に **Anywhere** からのアクセスを許可します。詳細は [IP Access List](/cloud/security/setting-ip-filters) ドキュメントを参照してください。

**新しく復元した ClickHouse サービス上（復元されたデータをホストしているシステム）での作業**

:::note
新しいサービスへアクセスするには、そのパスワードをリセットする必要があります。サービス一覧の **Settings** タブから実行できます。
:::

ソーステーブル（この例では `db.table`）を読み取れる読み取り専用ユーザーを追加します:

```sql
  CREATE USER exporter
  IDENTIFIED WITH SHA256_PASSWORD BY 'password-here'
  SETTINGS readonly = 1;
```

```sql
  GRANT SELECT ON db.table TO exporter;
```

テーブル定義をコピーする：

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'db' AND table = 'table'
```

**宛先の ClickHouse Cloud システム（テーブルが破損していた側）で：**

宛先データベースを作成します：

```sql
  CREATE DATABASE db
```

ソース側の `CREATE TABLE` ステートメントを使用して、復元先のテーブルを作成します。

:::tip
`CREATE` ステートメントを実行する際は、`ENGINE` をパラメータなしの `ReplicatedMergeTree` に変更してください。ClickHouse Cloud はテーブルを常にレプリケートし、適切なパラメータを自動的に設定します。
:::

```sql
  CREATE TABLE db.table ...
  ENGINE = ReplicatedMergeTree
  ORDER BY ...
```

`remoteSecure` 関数を使用して、新たに復元した ClickHouse Cloud サービスから元のサービスにデータを取り込みます：

```sql
  INSERT INTO db.table
  SELECT *
  FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

元のサービスへのデータ挿入が正常に完了したら、そのサービス内で必ずデータを検証してください。データの検証が済んだら、新しいサービスは削除してください。


## テーブルの削除取り消し（Undelete / Undrop） \{#undeleting-or-undropping-tables\}

`UNDROP` コマンドは、[Shared Catalog](https://clickhouse.com/docs/cloud/reference/shared-catalog) を通じて ClickHouse Cloud でサポートされています。

ユーザーが誤ってテーブルを削除してしまうのを防ぐには、[`GRANT` 文](/sql-reference/statements/grant) を使用して、特定のユーザーまたはロールに対する [`DROP TABLE` コマンド](/sql-reference/statements/drop#drop-table) の権限を取り消すことができます。

:::note
データの誤削除を防ぐため、デフォルトでは ClickHouse Cloud ではサイズが &gt;`1TB` のテーブルは削除できないことに注意してください。
この閾値を超えるサイズのテーブルを削除したい場合は、設定項目 `max_table_size_to_drop` を使用することで削除できます。

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```

:::

:::note
レガシープラン: レガシープランをご利用のお客様は、デフォルトの 1 日 1 回のバックアップ（保持期間 24 時間）がストレージ料金に含まれます。
:::


## バックアップの所要時間 \{#backup-durations\}

バックアップおよびリストアにかかる時間は、データベースのサイズに加えて、スキーマやテーブル数など、複数の要因に依存します。
増分バックアップは、バックアップ対象のデータ量が少ないため、通常フルバックアップよりもはるかに短時間で完了します。
増分バックアップからのリストアは、チェーン内のすべての増分バックアップと最後のフルバックアップがリストアに含まれるため、上記で説明したとおり、フルバックアップからのリストアよりもやや時間がかかります。

社内テストでは、約 1 TB 程度の小さなバックアップでは、バックアップに約 10〜15 分、またはそれ以上かかることが確認されています。
20 TB 未満のバックアップは 1 時間以内に完了するはずであり、50 TB のデータのバックアップには約 2〜3 時間かかる想定です。
バックアップはサイズが大きくなるほどスケールメリットが得られ、いくつかの社内サービスでは最大 1 PB のバックアップが約 10 時間で完了することを確認しています。

:::note
外部バケットへのバックアップは、ClickHouse バケットへのバックアップよりも遅くなる場合があります。
:::

リストアにかかる時間は、バックアップの所要時間とほぼ同程度です。

実際の所要時間は上記のような複数の要因に依存するため、ご自身のデータベースまたはサンプルデータでテストを行い、より正確な見積もりを取得することを推奨します。

## 設定可能なバックアップ \{#configurable-backups\}

デフォルトとは異なるバックアップスケジュールを設定したい場合は、[設定可能なバックアップ](/cloud/manage/backups/configurable-backups)を参照してください。

## 自分の Cloud アカウントにバックアップをエクスポートする \{#export-backups-to-your-own-cloud-account\}

ご自身の Cloud アカウントにバックアップをエクスポートする場合は、[こちら](/cloud/manage/backups/export-backups-to-own-cloud-account)を参照してください。