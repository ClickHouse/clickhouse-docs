---
{}
---

import GCS_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-1.png';
import GCS_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-2.png';
import GCS_create_service_account_key from '@site/static/images/integrations/data-ingestion/s3/GCS-create-a-service-account-key.png';
import GCS_create_service_account_0 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-0.png';
import GCS_create_service_account_a from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-a.png';
import GCS_create_service_account_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-2.png';
import GCS_create_service_account_3 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-3.png';
import GCS_guide_key from '@site/static/images/integrations/data-ingestion/s3/GCS-guide-key.png';
import Image from '@theme/IdealImage';

<details>
    <summary>GCSバケットとHMACキーの作成</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="US East 1でGCSバケットを作成する" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="US East 4でGCSバケットを作成する" border />

### アクセスキーの生成 {#generate-an-access-key}

### サービスアカウントのHMACキーと秘密キーを作成する {#create-a-service-account-hmac-key-and-secret}

**Cloud Storage > 設定 > 相互運用性** を開き、既存の **アクセスキー** を選択するか、**サービスアカウント用のキーを作成** を選択します。このガイドでは、新しいサービスアカウント用の新しいキーを作成する手順を説明します。

<Image size="md" img={GCS_create_service_account_key} alt="GCSでサービスアカウントのHMACキーを生成する" border />

### 新しいサービスアカウントを追加する {#add-a-new-service-account}

既存のサービスアカウントがないプロジェクトの場合は、**新しいアカウントを作成** を選択します。

<Image size="md" img={GCS_create_service_account_0} alt="GCSに新しいサービスアカウントを追加する" border />

サービスアカウントを作成するには、3つのステップがあります。最初のステップでは、アカウントに意味のある名前、ID、説明を付けます。

<Image size="md" img={GCS_create_service_account_a} alt="GCSで新しいサービスアカウントの名前とIDを定義する" border />

相互運用性設定ダイアログでは、IAMロールとして **Storage Object Admin** が推奨されます。ステップ2でそのロールを選択します。

<Image size="md" img={GCS_create_service_account_2} alt="GCSでIAMロールStorage Object Adminを選択する" border />

ステップ3はオプションであり、このガイドでは使用されません。ポリシーに基づいてユーザーにこれらの権限を与えることができます。

<Image size="md" img={GCS_create_service_account_3} alt="GCSで新しいサービスアカウントの追加設定を構成する" border />

サービスアカウントのHMACキーが表示されます。この情報はClickHouseの設定で使用されるため、保存してください。

<Image size="md" img={GCS_guide_key} alt="GCSで生成されたHMACキーを取得する" border />

</details>
