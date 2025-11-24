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
    <summary>GCS 버킷 및 HMAC 키 생성</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="US East 1에서 GCS 버킷 생성" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="US East 4에서 GCS 버킷 생성" border />

### 액세스 키 생성 {#generate-an-access-key}

### 서비스 계정 HMAC 키 및 비밀 생성 {#create-a-service-account-hmac-key-and-secret}

**Cloud Storage > 설정 > 상호운용성**을 열고 기존 **액세스 키**를 선택하거나 **서비스 계정에 대한 키 생성**을 선택합니다. 이 가이드는 새 서비스 계정에 대한 새 키를 만드는 경로를 다룹니다.

<Image size="md" img={GCS_create_service_account_key} alt="GCS에서 서비스 계정 HMAC 키 생성" border />

### 새 서비스 계정 추가 {#add-a-new-service-account}

기존 서비스 계정이 없는 프로젝트라면, **새 계정 생성**을 선택합니다.

<Image size="md" img={GCS_create_service_account_0} alt="GCS에서 새 서비스 계정 추가" border />

서비스 계정을 생성하는 것은 세 가지 단계로 이루어지며, 첫 번째 단계에서는 계정에 의미 있는 이름, ID 및 설명을 부여합니다.

<Image size="md" img={GCS_create_service_account_a} alt="GCS에서 새 서비스 계정 이름 및 ID 정의" border />

상호운용성 설정 대화 상자에서 IAM 역할 **Storage Object Admin** 역할이 권장됩니다. 두 번째 단계에서 해당 역할을 선택하세요.

<Image size="md" img={GCS_create_service_account_2} alt="GCS에서 IAM 역할 Storage Object Admin 선택" border />

세 번째 단계는 선택 사항이며 이 가이드에서는 사용하지 않습니다. 정책에 따라 사용자에게 이러한 권한을 부여할 수 있습니다.

<Image size="md" img={GCS_create_service_account_3} alt="GCS에서 새 서비스 계정을 위한 추가 설정 구성" border />

서비스 계정 HMAC 키가 표시됩니다. 이 정보를 저장하십시오. ClickHouse 구성에서 사용될 것입니다.

<Image size="md" img={GCS_guide_key} alt="GCS에 대해 생성된 HMAC 키 가져오기" border />

</details>
