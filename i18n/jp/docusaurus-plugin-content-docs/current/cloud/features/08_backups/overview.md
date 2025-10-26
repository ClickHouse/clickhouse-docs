---
'sidebar_label': '概要'
'sidebar_position': 0
'slug': '/cloud/manage/backups/overview'
'title': '概要'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'description': 'ClickHouse Cloud におけるバックアップの概要を提供します'
'doc_type': 'guide'
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

データベースのバックアップは、安全ネットを提供し、予期しない理由でデータが失われた場合に、最終的な成功バックアップから以前の状態にサービスを復元できることを保証します。これにより、ダウンタイムが最小化され、ビジネスクリティカルなデータが永遠に失われるのを防ぎます。このガイドでは、ClickHouse Cloudにおけるバックアップの動作、サービスのためのバックアップを設定するためのオプション、およびバックアップから復元する方法について説明します。

## ClickHouse Cloudにおけるバックアップの動作 {#how-backups-work-in-clickhouse-cloud}

ClickHouse Cloudのバックアップは、「フル」バックアップと「増分」バックアップの組み合わせであり、バックアップチェーンを構成します。このチェーンは、フルバックアップから始まり、その後、次のいくつかのスケジュールされた時間帯にわたって増分バックアップが取得され、バックアップの連続が作成されます。バックアップチェーンが特定の長さに達すると、新しいチェーンが開始されます。このバックアップの全チェーンは、必要に応じて新しいサービスにデータを復元するために利用できます。特定のチェーンに含まれるすべてのバックアップが、サービスに設定された保持期間を過ぎると（保持については後述）、そのチェーンは破棄されます。

下のスクリーンショットでは、実線の正方形がフルバックアップを示し、点線の正方形が増分バックアップを示しています。正方形の周りの実線の長方形は、保持期間とエンドユーザーに見えるバックアップを示しており、バックアップの復元に使用できます。以下のシナリオでは、バックアップが24時間ごとに取得され、2日間保持されます。

1日目には、バックアップチェーンを開始するためにフルバックアップが取得されます。2日目には、増分バックアップが取得され、フルバックアップと増分バックアップの両方が復元に利用可能になります。7日目には、チェーン内に1つのフルバックアップと6つの増分バックアップがあり、最新の2つの増分バックアップがユーザーに見えます。8日目には、新しいフルバックアップを取得し、9日目には、新しいチェーンに2つのバックアップがあるときに、前のチェーンが破棄されます。

<Image img={backup_chain} size="md" alt="ClickHouse Cloudのバックアップチェーンの例" />

*ClickHouse Cloudのバックアップシナリオの例*

## デフォルトのバックアップポリシー {#default-backup-policy}

Basic、Scale、Enterpriseレベルでは、バックアップはメーターで計測され、ストレージとは別に請求されます。すべてのサービスは、デフォルトで1日1回のバックアップとなっており、Scaleレベルから、Cloudコンソールの設定タブを介して、さらにバックアップを構成できる機能があります。各バックアップは最低24時間保持されます。

## バックアップステータスリスト {#backup-status-list}

サービスは、デフォルトの日次スケジュールであっても、あなたが選択した[カスタムスケジュール](./configurable-backups.md)であっても、設定されたスケジュールに基づいてバックアップされます。すべての利用可能なバックアップは、サービスの**バックアップ**タブから確認できます。ここから、バックアップのステータス、期間、サイズを確認できます。また、**アクション**列を使用して特定のバックアップを復元することもできます。

<Image img={backup_status_list} size="md" alt="ClickHouse Cloudのバックアップステータスのリスト" border/>

## バックアップコストの理解 {#understanding-backup-cost}

デフォルトのポリシーに従い、ClickHouse Cloudは毎日のバックアップを義務付けており、保持期間は24時間です。より多くのデータを保持する必要があるスケジュールを選択するか、より頻繁なバックアップを引き起こすと、バックアップ用の追加ストレージ費用が発生する可能性があります。

バックアップコストを理解するためには、利用状況画面からサービスごとのバックアップコストを確認できます（以下に示す通り）。カスタマイズされたスケジュールで数日間バックアップが実行された後、コストのアイデアを得て、バックアップの月次コストを推計できます。

<Image img={backup_usage} size="md" alt="ClickHouse Cloudのバックアップ使用状況チャート" border/>

バックアップの総コストを見積もるには、スケジュールを設定する必要があります。また、スケジュールを設定する前に月次コストの見積もりを取得できるように、[料金計算機](https://clickhouse.com/pricing)の更新にも取り組んでいます。コストを見積もるために次の入力が必要です：
- フルバックアップと増分バックアップのサイズ
- 希望の頻度
- 希望の保持期間
- クラウドプロバイダーとリージョン

:::note
バックアップの推定コストは、サービス内のデータのサイズが時間と共に増加するにつれて変わることを考慮してください。
:::

## バックアップの復元 {#restore-a-backup}

バックアップは、バックアップが取得された既存のサービスではなく、新しいClickHouse Cloudサービスに復元されます。

**バックアップを復元**アイコンをクリックした後、新しいサービスのサービス名を指定し、このバックアップを復元します：

<Image img={backup_restore} size="md" alt="ClickHouse Cloudでのバックアップの復元" />

新しいサービスは、準備が整うまでサービスリストに`Provisioning`として表示されます：

<Image img={backup_service_provisioning} size="md" alt="進行中のプロビジョニングサービス" border/>

## 復元されたサービスとの作業 {#working-with-your-restored-service}

バックアップが復元された後、同様の2つのサービスが存在します：復元が必要だった**元のサービス**と、元のサービスのバックアップから復元された新しい**復元サービス**です。

バックアップの復元が完了すると、次のいずれかを行うべきです：
- 新しい復元サービスを使用し、元のサービスを削除する。
- 新しい復元サービスから元のサービスにデータを移行し、新しい復元サービスを削除する。

### **新しい復元サービス**を使用する {#use-the-new-restored-service}

新しいサービスを使用するには、次の手順を実行します：

1. 新しいサービスに、あなたのユースケースに必要なIPアクセスリストのエントリがあることを確認します。
1. 新しいサービスに必要なデータが含まれていることを確認します。
1. 元のサービスを削除します。

### **新たに復元されたサービス**から**元のサービス**へデータを移行する {#migrate-data-from-the-newly-restored-service-back-to-the-original-service}

何らかの理由で新たに復元されたサービスを利用できない場合（たとえば、既存のサービスに接続しているユーザーやアプリケーションがある場合など）、新たに復元されたデータを元のサービスに移行することを決定するかもしれません。移行は次の手順に従って実行できます：

**新たに復元されたサービスへのリモートアクセスを許可する**

新しいサービスは、元のサービスと同じIP許可リストでバックアップから復元される必要があります。これは、**Anywhere**からの接続を許可しない限り、他のClickHouse Cloudサービスへの接続が許可されないためです。許可リストを変更し、一時的に**Anywhere**からのアクセスを許可します。詳細については、[IPアクセスリスト](/cloud/security/setting-ip-filters)ドキュメントを参照してください。

**新たに復元されたClickHouseサービス（復元されたデータをホストするシステム）**

:::note
新しいサービスにアクセスするためには、パスワードをリセットする必要があります。これはサービスリストの**設定**タブから行うことができます。
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

**デスティネーションClickHouse Cloudシステム（損傷したテーブルがあったもの）：**

デスティネーションデータベースを作成します：
```sql
CREATE DATABASE db
```

ソースからの`CREATE TABLE`文を使用して、デスティネーションを作成します：

:::tip
`CREATE`文を実行する際には、`ENGINE`をパラメーターなしの`ReplicatedMergeTree`に変更してください。ClickHouse Cloudは常にテーブルを複製し、正しいパラメーターを提供します。
:::

```sql
CREATE TABLE db.table ...
ENGINE = ReplicatedMergeTree
ORDER BY ...
```

`remoteSecure`関数を使用して、新たに復元されたClickHouse Cloudサービスから元のサービスにデータをプルします：

```sql
INSERT INTO db.table
SELECT *
FROM remoteSecure('source-hostname', db, table, 'exporter', 'password-here')
```

データを元のサービスに正常に挿入した後、サービス内のデータを確認してください。データが確認されたら、新しいサービスを削除してください。

## テーブルのアンデリートまたはアンロップ {#undeleting-or-undropping-tables}

<CloudNotSupportedBadge/>

`UNDROP`コマンドは、ClickHouse Cloudでサポートされていません。テーブルを誤って`DROP`してしまった場合、最良の対処法は最後のバックアップを復元し、バックアップからテーブルを再作成することです。

ユーザーが誤ってテーブルを削除しないように、特定のユーザーまたはロールに対して[`DROP TABLE`コマンド](/sql-reference/statements/drop#drop-table)の権限を剥奪するために[`GRANT`文](/sql-reference/statements/grant)を使用できます。

:::note
データの誤削除を防ぐために、ClickHouse Cloudでは、デフォルトではサイズが>`1TB`のテーブルを削除することはできません。この閾値を超えるテーブルを削除したい場合は、`max_table_size_to_drop`設定を使用してください：

```sql
DROP TABLE IF EXISTS table_to_drop
SYNC SETTINGS max_table_size_to_drop=2000000000000 -- increases the limit to 2TB
```
:::

:::note
レガシープラン：レガシープランのお客様には、デフォルトの日次バックアップが24時間保持され、ストレージコストに含まれています。
:::

## 構成可能なバックアップ {#configurable-backups}

デフォルトのバックアップスケジュールとは異なるバックアップスケジュールを設定したい場合は、[構成可能なバックアップ](./configurable-backups.md)をご覧ください。

## 自分のクラウドアカウントへのバックアップエクスポート {#export-backups-to-your-own-cloud-account}

自分のクラウドアカウントにバックアップをエクスポートしたいユーザーは、[こちら](./export-backups-to-own-cloud-account.md)をご覧ください。
