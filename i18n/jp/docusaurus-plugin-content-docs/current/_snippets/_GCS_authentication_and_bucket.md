
import GCS_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-1.png';
import GCS_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-2.png';
import GCS_create_service_account_key from '@site/static/images/integrations/data-ingestion/s3/GCS-create-a-service-account-key.png';
import GCS_create_service_account_0 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-0.png';
import GCS_create_service_account_a from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-a.png';
import GCS_create_service_account_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-2.png';
import GCS_create_service_account_3 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-3.png';
import GCS_guide_key from '@site/static/images/integrations/data-ingestion/s3/GCS-guide-key.png';

<details>
    <summary>GCSバケットとHMACキーを作成する</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<img src={GCS_bucket_1} alt="US East 1 にGCSバケットを作成する" />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<img src={GCS_bucket_2} alt="US East 4 にGCSバケットを作成する" />

### アクセスキーを生成 {#generate-an-access-key}

### サービスアカウントのHMACキーとシークレットを作成 {#create-a-service-account-hmac-key-and-secret}

**Cloud Storage > 設定 > 相互運用性**を開き、既存の**アクセスキー**を選択するか、**サービスアカウントのキーを作成**します。このガイドでは、新しいサービスアカウント用の新しいキーを作成する手順を説明します。

<img src={GCS_create_service_account_key} alt="GCSでサービスアカウントのHMACキーを生成する" />

### 新しいサービスアカウントを追加 {#add-a-new-service-account}

このプロジェクトに既存のサービスアカウントがない場合は、**新しいアカウントを作成**します。

<img src={GCS_create_service_account_0} alt="GCSで新しいサービスアカウントを追加する" />

サービスアカウントを作成するには3つのステップがあります。最初のステップでは、アカウントに意味のある名前、ID、説明を付けます。

<img src={GCS_create_service_account_a} alt="GCSで新しいサービスアカウント名とIDを定義する" />

相互運用性設定ダイアログでは、IAMロール**Storage Object Admin**ロールが推奨されます。ステップ2でそのロールを選択してください。

<img src={GCS_create_service_account_2} alt="GCSでIAMロールStorage Object Adminを選択する" />

ステップ3はオプションであり、このガイドでは使用しません。ポリシーに基づいてユーザーにこれらの権限を付与することができます。

<img src={GCS_create_service_account_3} alt="GCSで新しいサービスアカウントの追加設定を構成する" />

サービスアカウントHMACキーが表示されます。この情報を保存してください。ClickHouseの設定で使用されます。

<img src={GCS_guide_key} alt="GCSで生成されたHMACキーを取得する" />

</details>
```
