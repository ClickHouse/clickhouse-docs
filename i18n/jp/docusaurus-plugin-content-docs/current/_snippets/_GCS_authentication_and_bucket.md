import GCS_bucket_1 from "@site/static/images/integrations/data-ingestion/s3/GCS-bucket-1.png"
import GCS_bucket_2 from "@site/static/images/integrations/data-ingestion/s3/GCS-bucket-2.png"
import GCS_create_service_account_key from "@site/static/images/integrations/data-ingestion/s3/GCS-create-a-service-account-key.png"
import GCS_create_service_account_0 from "@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-0.png"
import GCS_create_service_account_a from "@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-a.png"
import GCS_create_service_account_2 from "@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-2.png"
import GCS_create_service_account_3 from "@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-3.png"
import GCS_guide_key from "@site/static/images/integrations/data-ingestion/s3/GCS-guide-key.png"
import Image from "@theme/IdealImage"

<details>
    <summary>GCSバケットとHMACキーの作成</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image
  size='md'
  img={GCS_bucket_1}
  alt='US East 1でのGCSバケットの作成'
  border
/>

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image
  size='md'
  img={GCS_bucket_2}
  alt='US East 4でのGCSバケットの作成'
  border
/>

### アクセスキーの生成 {#generate-an-access-key}

### サービスアカウントのHMACキーとシークレットの作成 {#create-a-service-account-hmac-key-and-secret}

**Cloud Storage > Settings > Interoperability**を開き、既存の**Access key**を選択するか、**CREATE A KEY FOR A SERVICE ACCOUNT**を選択します。本ガイドでは、新しいサービスアカウント用の新しいキーを作成する手順について説明します。

<Image
  size='md'
  img={GCS_create_service_account_key}
  alt='GCSでのサービスアカウントHMACキーの生成'
  border
/>

### 新しいサービスアカウントの追加 {#add-a-new-service-account}

既存のサービスアカウントがないプロジェクトの場合は、**CREATE NEW ACCOUNT**を選択します。

<Image
  size='md'
  img={GCS_create_service_account_0}
  alt='GCSでの新しいサービスアカウントの追加'
  border
/>

サービスアカウントの作成には3つのステップがあります。最初のステップでは、アカウントに分かりやすい名前、ID、説明を設定します。

<Image
  size='md'
  img={GCS_create_service_account_a}
  alt='GCSでの新しいサービスアカウント名とIDの定義'
  border
/>

Interoperability設定ダイアログでは、IAMロール**Storage Object Admin**が推奨されます。ステップ2でこのロールを選択してください。

<Image
  size='md'
  img={GCS_create_service_account_2}
  alt='GCSでのIAMロールStorage Object Adminの選択'
  border
/>

ステップ3はオプションであり、本ガイドでは使用しません。ポリシーに基づいて、ユーザーにこれらの権限を付与することができます。

<Image
  size='md'
  img={GCS_create_service_account_3}
  alt='GCSでの新しいサービスアカウントの追加設定の構成'
  border
/>

サービスアカウントのHMACキーが表示されます。この情報はClickHouseの設定で使用されるため、保存してください。

<Image
  size='md'
  img={GCS_guide_key}
  alt='GCS用に生成されたHMACキーの取得'
  border
/>

</details>
