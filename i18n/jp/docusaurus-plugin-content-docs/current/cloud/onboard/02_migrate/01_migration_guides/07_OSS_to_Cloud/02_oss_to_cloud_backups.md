---
sidebar_label: 'BACKUP と RESTORE の使用'
slug: /cloud/migration/oss-to-cloud-backup-restore
title: 'BACKUP/RESTORE を使用したセルフマネージド ClickHouse と ClickHouse Cloud 間の移行'
description: 'セルフマネージド ClickHouse と ClickHouse Cloud 間を BACKUP および RESTORE コマンドを使って移行する方法を説明するページ'
doc_type: 'guide'
keywords: ['移行', 'ClickHouse Cloud', 'OSS', 'セルフマネージドから Cloud への移行', 'BACKUP', 'RESTORE']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Image from '@theme/IdealImage';
import create_service from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_service.png';
import service_details from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_details.png';
import open_console from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/open_console.png';
import service_role_id from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/service_role_id.png';
import create_new_role from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/create_new_role.png';
import backup_s3_bucket from '@site/static/images/cloud/onboard/migrate/oss_to_cloud_via_backup/backup_in_s3_bucket.png';


# バックアップコマンドを使用してセルフマネージド ClickHouse から ClickHouse Cloud に移行する \{#migrating-from-self-managed-clickhouse-to-clickhouse-cloud-using-backup-commands\}

## 概要 \{#overview-migration-approaches\}

セルフマネージドな ClickHouse (OSS) から ClickHouse Cloud へデータを移行するには、主に 2 つの方法があります:

- データを直接取得/送信する [`remoteSecure()`](/cloud/migration/clickhouse-to-cloud) 関数を使用する方法
- `BACKUP` / `RESTORE` コマンドとクラウドオブジェクトストレージを使用する方法

>この移行ガイドでは、`BACKUP` / `RESTORE` アプローチに焦点を当て、オープンソース版 ClickHouse のデータベースまたはサービス全体を S3 バケット経由で Cloud に移行する具体的な例を示します。

**前提条件**

- Docker がインストールされていること
- [S3 バケットと IAM ユーザー](/integrations/s3/creating-iam-user-and-s3-bucket) を用意していること
- 新しい ClickHouse Cloud サービスを作成できること

このガイドの手順を追いやすく再現可能にするため、2 つの分片と 2 つのレプリカを持つ ClickHouse クラスター用の Docker Compose レシピの 1 つを使用します。

:::note[クラスターが必要]
このバックアップ方式には ClickHouse クラスターが必要です。これは、テーブルを `MergeTree` エンジンから `ReplicatedMergeTree` に変換する必要があるためです。
単一インスタンスで実行している場合は、代わりに「[Migrating between self-managed ClickHouse and ClickHouse Cloud using remoteSecure](/cloud/migration/clickhouse-to-cloud)」の手順に従ってください。
:::

## OSS の準備 \{#oss-setup\}

まず、examples リポジトリにある Docker Compose 設定を使って ClickHouse クラスターを起動します。
すでに ClickHouse クラスターが稼働している場合は、ここでのクラスター起動手順は省略して構いません。

1. [examples リポジトリ](https://github.com/ClickHouse/examples) をローカル環境にクローンします
2. ターミナルで `examples/docker-compose-recipes/recipes/cluster_2S_2R` に `cd` します
3. Docker が起動していることを確認したら、ClickHouse クラスターを起動します:

```bash
docker compose up
```

次のように表示されるはずです:

```bash
[+] Running 7/7
 ✔ Container clickhouse-keeper-01  Created  0.1s
 ✔ Container clickhouse-keeper-02  Created  0.1s
 ✔ Container clickhouse-keeper-03  Created  0.1s
 ✔ Container clickhouse-01         Created  0.1s
 ✔ Container clickhouse-02         Created  0.1s
 ✔ Container clickhouse-04         Created  0.1s
 ✔ Container clickhouse-03         Created  0.1s
```

フォルダのルートディレクトリで新しいターミナルウィンドウを開き、そこから次のコマンドを実行してクラスターの最初のノードに接続します。

```bash
docker exec -it clickhouse-01 clickhouse-client
```


### サンプルデータの作成 \{#create-sample-data\}

ClickHouse Cloud では [`SharedMergeTree`](/cloud/reference/shared-merge-tree) を使用します。
バックアップを復元する際、ClickHouse は `ReplicatedMergeTree` を使用しているテーブルを自動的に `SharedMergeTree` テーブルへ変換します。

クラスターを実行している場合、すでにテーブルで `ReplciatedMergeTree` エンジンを使用している可能性が高いです。
そうでない場合は、バックアップを取得する前に、すべての `MergeTree` テーブルを `ReplicatedMergeTree` に変換する必要があります。

`MergeTree` テーブルを `ReplicatedMergeTree` に変換する方法を示すために、まずは `MergeTree` テーブルから始め、その後で `ReplicatedMergeTree` に変換します。
サンプルテーブルを作成してデータをロードするために、[New York taxi data guide](/getting-started/example-datasets/nyc-taxi) の最初の 2 ステップに従います。
便宜上、そのステップを以下に掲載しています。

次のコマンドを実行して、新しいデータベースを作成し、S3 バケットから新しいテーブルにデータを挿入します。

```sql
CREATE DATABASE nyc_taxi;

CREATE TABLE nyc_taxi.trips_small (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO nyc_taxi.trips_small
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/trips_{0..2}.gz',
    'TabSeparatedWithNames'
);
```

次のコマンドを実行してテーブルを `DETACH` します。

```sql
DETACH TABLE nyc_taxi.trips_small;
```

次にレプリカとしてアタッチします:

```sql
ATTACH TABLE nyc_taxi.trips_small AS REPLICATED;
```

最後に、レプリカのメタデータを復元します：

```sql
SYSTEM RESTORE REPLICA nyc_taxi.trips_small;
```

`ReplicatedMergeTree` に変換されていることを確認してください:

```sql
SELECT engine
FROM system.tables
WHERE name = 'trips_small' AND database = 'nyc_taxi';

┌─engine──────────────┐
│ ReplicatedMergeTree │
└─────────────────────┘
```

これで、後で S3 バケットからバックアップをリストアできるよう、Cloud サービスのセットアップに進む準備が整いました。


## Cloud の準備 \{#cloud-setup\}

データは新しい Cloud サービスにリストアされます。
以下の手順に従って、新しい Cloud サービスを作成します。

<VerticalStepper headerLevel="h4">

#### Cloud Console を開く \{#open-cloud-console\}

[https://console.clickhouse.cloud/](https://console.clickhouse.cloud/) にアクセスします。

#### 新しいサービスを作成する \{#create-new-service\}

<Image img={create_service} size="md" alt="新しいサービスを作成する"/> 

#### サービスを設定して作成する \{#configure-and-create\}

希望するリージョンと構成を選択し、`Create service` をクリックします。

<Image img={service_details} size="md" alt="サービスの設定を行う"/> 

#### アクセスロールを作成する \{#create-an-access-role\}

SQL コンソールを開きます。

<Image img={open_console} size="md" alt="サービスの設定を行う"/>

### S3 アクセスを設定する \{#set-up-s3-access\}

S3 からバックアップをリストアするには、ClickHouse Cloud と S3 バケット間の安全なアクセスを設定する必要があります。

1. ["Accessing S3 data securely"](/cloud/data-sources/secure-s3) の手順に従い、アクセスロールを作成してロール ARN を取得します。

2. ["How to create an S3 bucket and IAM role"](/integrations/s3/creating-iam-user-and-s3-bucket) で作成した S3 バケットポリシーに、前の手順で取得したロール ARN を追加して更新します。

更新後の S3 バケットのポリシーは次のようになります。

```json
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
#highlight-start                  
                    "arn:aws:iam::123456789123:role/ClickHouseAccess-001",
                    "arn:aws:iam::123456789123:user/docs-s3-user"
#highlight-end                            
                ]
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::ch-docs-s3-bucket",
                "arn:aws:s3:::ch-docs-s3-bucket/*"
            ]
        }
    ]
}
```

このポリシーには 2 つの ARN が含まれます：
- **IAM user** (`docs-s3-user`)：セルフマネージド ClickHouse クラスターが S3 にバックアップできるようにするもの
- **ClickHouse Cloud role** (`ClickHouseAccess-001`)：Cloud サービスが S3 からリストアできるようにするもの

</VerticalStepper>

## バックアップの取得（セルフマネージド環境のデプロイメント） \{#taking-a-backup-on-oss\}

単一のデータベースのバックアップを取得するには、OSS デプロイメントに接続した clickhouse-client から次のコマンドを実行します。

```sql
BACKUP DATABASE nyc_taxi
TO S3(
  'BUCKET_URL',
  'KEY_ID',
  'SECRET_KEY'
)
```

`BUCKET_URL`、`KEY_ID`、`SECRET_KEY` をご自身の AWS の認証情報に置き換えてください。
ガイド [&quot;S3 バケットと IAM ロールを作成する方法&quot;](/integrations/s3/creating-iam-user-and-s3-bucket) では、まだお持ちでない場合にそれらを取得する方法を説明しています。

すべてが正しく設定されていれば、バックアップに割り当てられた一意の ID とバックアップのステータスを含む、以下に示すものと同様のレスポンスが表示されます。

```response
Query id: efcaf053-75ed-4924-aeb1-525547ea8d45

┌─id───────────────────────────────────┬─status─────────┐
│ e73b99ab-f2a9-443a-80b4-533efe2d40b3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

以前は空だった S3 バケットを確認すると、いくつかのフォルダーが表示されていることが確認できます。

<Image img={backup_s3_bucket} size="md" alt="backup, data and metadata" />

完全なマイグレーションを実行している場合は、次のコマンドを実行してサーバー全体をバックアップできます。

```sql
BACKUP
TABLE system.users,
TABLE system.roles,
TABLE system.settings_profiles,
TABLE system.row_policies,
TABLE system.quotas,
TABLE system.functions,
ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
TO S3(
  'BUCKET_ID',
  'KEY_ID',
  'SECRET_ID'
)
SETTINGS
  compression_method='lzma',
  compression_level=3;
```

上記のコマンドは次の内容をバックアップします:

* すべてのユーザーデータベースとテーブル
* ユーザーアカウントとパスワード
* ロールと権限
* 設定プロファイル
* 行ポリシー
* クォータ
* ユーザー定義関数

別の Cloud Service Provider (CSP) を使用している場合は、`TO S3()`（AWS および GCP の両方に対応）や `TO AzureBlobStorage()` 構文を使用できます。

非常に大きなデータベースの場合は、`ASYNC` を使用してバックアップをバックグラウンドで非同期に実行することを検討してください:

```sql
BACKUP DATABASE my_database 
TO S3('https://your-bucket.s3.amazonaws.com/backup.zip', 'key', 'secret')
ASYNC;
       
-- Returns immediately with backup ID
-- Example result:
-- ┌─id──────────────────────────────────┬─status────────────┐
-- │ abc123-def456-789                   │ CREATING_BACKUP   │
-- └─────────────────────────────────────┴───────────────────┘
```

その後、このバックアップ ID を使用してバックアップの進行状況を監視できます。

```sql
SELECT * 
FROM system.backups 
WHERE id = 'abc123-def456-789'
```

増分バックアップを作成することも可能です。
バックアップ全般の詳細については、[backup and restore](/operations/backup) ドキュメントを参照してください。


## ClickHouse Cloud へのリストア \{#restore-to-clickhouse-cloud\}

単一のデータベースをリストアするには、Cloud サービスから次のクエリを実行します。以下の AWS 認証情報を自分のものに置き換え、
`ROLE_ARN` を [&quot;Accessing S3 data securely&quot;](/cloud/data-sources/secure-s3) で説明した手順の出力として取得した値に設定します。

```sql
RESTORE DATABASE nyc_taxi
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

同様の手順でサービス全体のリストアを実行できます。

```sql
RESTORE
    TABLE system.users,
    TABLE system.roles,
    TABLE system.settings_profiles,
    TABLE system.row_policies,
    TABLE system.quotas,
    ALL EXCEPT DATABASES INFORMATION_SCHEMA, information_schema, system
FROM S3(
    'BUCKET_URL',
    extra_credentials(role_arn = 'ROLE_ARN')
)
```

ここで Cloud 上で次のクエリを実行すると、Cloud 上にデータベースとテーブルが
正常に復元されていることを確認できます。

```sql
SELECT count(*) FROM nyc_taxi.trips_small;
3000317
```
