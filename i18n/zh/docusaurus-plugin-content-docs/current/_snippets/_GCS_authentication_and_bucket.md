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
    <summary>创建 GCS 存储桶和 HMAC 密钥</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image
  size='md'
  img={GCS_bucket_1}
  alt='在 US East 1 区域创建 GCS 存储桶'
  border
/>

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image
  size='md'
  img={GCS_bucket_2}
  alt='在 US East 4 区域创建 GCS 存储桶'
  border
/>

### 生成访问密钥 {#generate-an-access-key}

### 创建服务账号 HMAC 密钥和密文 {#create-a-service-account-hmac-key-and-secret}

打开 **Cloud Storage > Settings > Interoperability**,选择现有的 **Access key**,或点击 **CREATE A KEY FOR A SERVICE ACCOUNT**。本指南介绍如何为新服务账号创建新密钥。

<Image
  size='md'
  img={GCS_create_service_account_key}
  alt='在 GCS 中生成服务账号 HMAC 密钥'
  border
/>

### 添加新服务账号 {#add-a-new-service-account}

如果项目中尚无服务账号,请点击 **CREATE NEW ACCOUNT**。

<Image
  size='md'
  img={GCS_create_service_account_0}
  alt='在 GCS 中添加新服务账号'
  border
/>

创建服务账号需要三个步骤。第一步,为账号指定有意义的名称、ID 和描述。

<Image
  size='md'
  img={GCS_create_service_account_a}
  alt='在 GCS 中定义新服务账号的名称和 ID'
  border
/>

在互操作性设置对话框中,建议使用 IAM 角色 **Storage Object Admin**。在第二步中选择该角色。

<Image
  size='md'
  img={GCS_create_service_account_2}
  alt='在 GCS 中选择 IAM 角色 Storage Object Admin'
  border
/>

第三步为可选步骤,本指南中未使用。您可以根据自己的策略决定是否授予用户这些权限。

<Image
  size='md'
  img={GCS_create_service_account_3}
  alt='在 GCS 中为新服务账号配置其他设置'
  border
/>

系统将显示服务账号 HMAC 密钥。请妥善保存此信息,后续在 ClickHouse 配置中将会用到。

<Image
  size='md'
  img={GCS_guide_key}
  alt='获取为 GCS 生成的 HMAC 密钥'
  border
/>

</details>
