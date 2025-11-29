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
  <summary>GCS バケットと HMAC キーを作成する</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="US East 1 に GCS バケットを作成する" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="US East 4 に GCS バケットを作成する" border />

### アクセスキーを生成する {#generate-an-access-key}

### サービスアカウントの HMAC キーとシークレットを作成する {#create-a-service-account-hmac-key-and-secret}

**Cloud Storage &gt; Settings &gt; Interoperability** を開き、既存の **Access key** を選択するか、**CREATE A KEY FOR A SERVICE ACCOUNT** を選択します。このガイドでは、新しいサービスアカウント用に新しいキーを作成する手順を説明します。

<Image size="md" img={GCS_create_service_account_key} alt="GCS でサービスアカウントの HMAC キーを生成する" border />

### 新しいサービスアカウントを追加する {#add-a-new-service-account}

このプロジェクトに既存のサービスアカウントがない場合は、**CREATE NEW ACCOUNT** をクリックします。

<Image size="md" img={GCS_create_service_account_0} alt="GCS で新しいサービスアカウントを追加する" border />

サービスアカウントの作成手順は 3 つのステップから成ります。最初のステップでは、アカウントに意味のある名前、ID、および説明を付けます。

<Image size="md" img={GCS_create_service_account_a} alt="GCS で新しいサービスアカウントの名前と ID を定義する" border />

Interoperability 設定ダイアログでは、IAM ロールとして **Storage Object Admin** ロールを推奨します。ステップ 2 でそのロールを選択します。

<Image size="md" img={GCS_create_service_account_2} alt="GCS で IAM ロール Storage Object Admin を選択する" border />

ステップ 3 は任意であり、このガイドでは使用しません。ポリシーに基づいて、ユーザーにこれらの権限を付与してもかまいません。

<Image size="md" img={GCS_create_service_account_3} alt="GCS で新しいサービスアカウントの追加設定を構成する" border />

サービスアカウントの HMAC キーが表示されます。この情報は ClickHouse の設定で使用するため、必ず保存しておいてください。

<Image size="md" img={GCS_guide_key} alt="GCS で生成された HMAC キーを取得する" border />
</details>
