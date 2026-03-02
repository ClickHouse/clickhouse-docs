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
  <summary>GCS 버킷과 HMAC 키 생성</summary>

  ### ch_bucket_us_east1 \{#ch_bucket_us_east1\}

  <Image size="md" img={GCS_bucket_1} alt="US East 1에 GCS 버킷 생성" border />

  ### ch_bucket_us_east4 \{#ch_bucket_us_east4\}

  <Image size="md" img={GCS_bucket_2} alt="US East 4에 GCS 버킷 생성" border />

  ### 액세스 키 생성 \{#generate-an-access-key\}

  ### 서비스 계정 HMAC 키와 시크릿 생성 \{#create-a-service-account-hmac-key-and-secret\}

  **Cloud Storage &gt; Settings &gt; Interoperability**를 열고, 기존 **Access key**를 선택하거나 **CREATE A KEY FOR A SERVICE ACCOUNT**를 선택합니다.  이 가이드는 새 서비스 계정에 대한 새 키를 생성하는 절차를 설명합니다.

  <Image size="md" img={GCS_create_service_account_key} alt="GCS에서 서비스 계정 HMAC 키 생성" border />

  ### 새 서비스 계정 추가 \{#add-a-new-service-account\}

  이 프로젝트에 기존 서비스 계정이 없다면 **CREATE NEW ACCOUNT**를 선택합니다.

  <Image size="md" img={GCS_create_service_account_0} alt="GCS에서 새 서비스 계정 추가" border />

  서비스 계정을 생성하는 단계는 세 가지이며, 첫 번째 단계에서는 계정에 의미 있는 이름, ID, 설명을 지정합니다.

  <Image size="md" img={GCS_create_service_account_a} alt="GCS에서 새 서비스 계정 이름과 ID 정의" border />

  Interoperability 설정 대화 상자에서는 IAM 역할로 **Storage Object Admin**을 권장합니다. 두 번째 단계에서 해당 역할을 선택합니다.

  <Image size="md" img={GCS_create_service_account_2} alt="GCS에서 IAM 역할 Storage Object Admin 선택" border />

  세 번째 단계는 선택 사항이며 이 가이드에서는 사용하지 않습니다.  정책에 따라 사용자에게 이러한 권한을 부여할 수 있습니다.

  <Image size="md" img={GCS_create_service_account_3} alt="GCS에서 새 서비스 계정의 추가 설정 구성" border />

  서비스 계정 HMAC 키가 표시됩니다.  이 정보는 ClickHouse 구성에 사용되므로 저장해 두십시오.

  <Image size="md" img={GCS_guide_key} alt="GCS에서 생성된 HMAC 키 조회" border />
</details>
