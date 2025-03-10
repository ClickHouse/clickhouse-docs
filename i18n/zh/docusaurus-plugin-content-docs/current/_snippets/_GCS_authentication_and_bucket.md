import GCS_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-1.png';
import GCS_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-2.png';
import GCS_create_service_account_key from '@site/static/images/integrations/data-ingestion/s3/GCS-create-a-service-account-key.png';
import GCS_create_service_account_0 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-0.png';
import GCS_create_service_account_a from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-a.png';
import GCS_create_service_account_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-2.png';
import GCS_create_service_account_3 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-3.png';
import GCS_guide_key from '@site/static/images/integrations/data-ingestion/s3/GCS-guide-key.png';

<details>
    <summary>创建 GCS 存储桶和 HMAC 密钥</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<img src={GCS_bucket_1} alt="在 US East 1 创建 GCS 存储桶" />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<img src={GCS_bucket_2} alt="在 US East 4 创建 GCS 存储桶" />

### 生成访问密钥 {#generate-an-access-key}

### 创建服务帐户 HMAC 密钥和密钥 {#create-a-service-account-hmac-key-and-secret}

打开 **Cloud Storage > 设置 > 互操作性**，选择现有的 **访问密钥**，或者 **为服务帐户创建密钥**。 本指南涵盖了为新服务帐户创建新密钥的步骤。

<img src={GCS_create_service_account_key} alt="在 GCS 中生成服务帐户 HMAC 密钥" />

### 添加新的服务帐户 {#add-a-new-service-account}

如果这是一个没有现有服务帐户的项目，**创建新帐户**。

<img src={GCS_create_service_account_0} alt="在 GCS 中添加新的服务帐户" />

创建服务帐户有三个步骤，在第一步为帐户提供一个有意义的名称、ID 和描述。

<img src={GCS_create_service_account_a} alt="在 GCS 中定义新的服务帐户名称和 ID" />

在互操作性设置对话框中，建议选择 IAM 角色 **Storage Object Admin**；在第二步选择该角色。

<img src={GCS_create_service_account_2} alt="在 GCS 中选择 IAM 角色 Storage Object Admin" />

第三步是可选的，本指南中未使用。您可以根据您的政策允许用户拥有这些权限。

<img src={GCS_create_service_account_3} alt="在 GCS 中配置新服务帐户的附加设置" />

服务帐户 HMAC 密钥将显示。保存此信息，因为它将在 ClickHouse 配置中使用。

<img src={GCS_guide_key} alt="检索 GCS 生成的 HMAC 密钥" />

</details>
