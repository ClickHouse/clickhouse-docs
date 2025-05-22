---
null
...
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
    <summary>创建 GCS 存储桶和 HMAC 密钥</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="在 US East 1 创建 GCS 存储桶" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="在 US East 4 创建 GCS 存储桶" border />

### 生成访问密钥 {#generate-an-access-key}

### 创建服务账户 HMAC 密钥和秘密 {#create-a-service-account-hmac-key-and-secret}

打开 **Cloud Storage > 设置 > 互操作性**，然后选择一个现有的 **访问密钥**，或者 **为服务账户创建密钥**。 本指南涵盖了为新服务账户创建新密钥的步骤。

<Image size="md" img={GCS_create_service_account_key} alt="在 GCS 中生成服务账户 HMAC 密钥" border />

### 添加新服务账户 {#add-a-new-service-account}

如果这是一个没有现有服务账户的项目，请 **创建新账户**。

<Image size="md" img={GCS_create_service_account_0} alt="在 GCS 中添加新服务账户" border />

创建服务账户的步骤有三步，第一步给账户一个有意义的名称、ID 和描述。

<Image size="md" img={GCS_create_service_account_a} alt="在 GCS 中定义新服务账户的名称和 ID" border />

在互操作性设置对话框中，推荐选择 IAM 角色 **Storage Object Admin**；在第二步中选择该角色。

<Image size="md" img={GCS_create_service_account_2} alt="在 GCS 中选择 IAM 角色 Storage Object Admin" border />

第三步是可选的，在本指南中未使用。 您可以根据政策允许用户拥有这些权限。

<Image size="md" img={GCS_create_service_account_3} alt="为新服务账户配置额外设置的 GCS" border />

服务账户 HMAC 密钥将被显示。 请保存该信息，因为它将在 ClickHouse 配置中使用。

<Image size="md" img={GCS_guide_key} alt="检索到生成的 GCS HMAC 密钥" border />

</details>
