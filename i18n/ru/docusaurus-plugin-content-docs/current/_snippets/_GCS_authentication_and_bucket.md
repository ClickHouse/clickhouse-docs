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
  <summary>Создайте бакеты GCS и HMAC-ключ</summary>

  ### ch&#95;bucket&#95;us&#95;east1 {#ch&#95;bucket&#95;us&#95;east1}

  <Image size="md" img={GCS_bucket_1} alt="Создание GCS-бакета в регионе US East 1" border />

  ### ch&#95;bucket&#95;us&#95;east4 {#ch&#95;bucket&#95;us&#95;east4}

  <Image size="md" img={GCS_bucket_2} alt="Создание GCS-бакета в регионе US East 4" border />

  ### Сгенерируйте ключ доступа {#generate-an-access-key}

  ### Создайте HMAC-ключ и секрет для сервисного аккаунта {#create-a-service-account-hmac-key-and-secret}

  Откройте **Cloud Storage &gt; Settings &gt; Interoperability** и либо выберите существующий **Access key**, либо нажмите **CREATE A KEY FOR A SERVICE ACCOUNT**. В этом руководстве описывается процесс создания нового ключа для нового сервисного аккаунта.

  <Image size="md" img={GCS_create_service_account_key} alt="Генерация HMAC-ключа сервисного аккаунта в GCS" border />

  ### Добавьте новый сервисный аккаунт {#add-a-new-service-account}

  Если в проекте ещё нет сервисного аккаунта, нажмите **CREATE NEW ACCOUNT**.

  <Image size="md" img={GCS_create_service_account_0} alt="Добавление нового сервисного аккаунта в GCS" border />

  Для создания сервисного аккаунта есть три шага; на первом шаге задайте аккаунту понятные имя, ID и описание.

  <Image size="md" img={GCS_create_service_account_a} alt="Определение имени и ID нового сервисного аккаунта в GCS" border />

  В диалоге настроек Interoperability рекомендуется назначить роль IAM **Storage Object Admin**; выберите эту роль на втором шаге.

  <Image size="md" img={GCS_create_service_account_2} alt="Выбор роли IAM Storage Object Admin в GCS" border />

  Третий шаг является необязательным и в этом руководстве не используется. Вы можете предоставить пользователям эти привилегии в соответствии с вашими политиками.

  <Image size="md" img={GCS_create_service_account_3} alt="Настройка дополнительных параметров для нового сервисного аккаунта в GCS" border />

  HMAC-ключ сервисного аккаунта будет отображён. Сохраните эту информацию, так как она будет использоваться в конфигурации ClickHouse.

  <Image size="md" img={GCS_guide_key} alt="Получение сгенерированного HMAC-ключа для GCS" border />
</details>
