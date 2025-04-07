
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
    <summary>Создание ведер GCS и ключа HMAC</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="Создание ведра GCS в US East 1" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="Создание ведра GCS в US East 4" border />

### Генерация ключа доступа {#generate-an-access-key}

### Создать ключ HMAC для сервисного аккаунта и секрет {#create-a-service-account-hmac-key-and-secret}

Откройте **Cloud Storage > Settings > Interoperability** и выберите существующий **Access key**, или **CREATE A KEY FOR A SERVICE ACCOUNT**. Этот учебник охватывает процесс создания нового ключа для нового сервисного аккаунта.

<Image size="md" img={GCS_create_service_account_key} alt="Генерация ключа HMAC для сервисного аккаунта в GCS" border />

### Добавить новый сервисный аккаунт {#add-a-new-service-account}

Если это проект без существующего сервисного аккаунта, выберите **CREATE NEW ACCOUNT**.

<Image size="md" img={GCS_create_service_account_0} alt="Добавление нового сервисного аккаунта в GCS" border />

Существует три этапа создания сервисного аккаунта, на первом этапе дайте аккаунту значащее имя, ID и описание.

<Image size="md" img={GCS_create_service_account_a} alt="Определение имени и ID нового сервисного аккаунта в GCS" border />

В диалоговом окне настроек совместимости рекомендуется роль IAM **Storage Object Admin**; выберите эту роль на втором этапе.

<Image size="md" img={GCS_create_service_account_2} alt="Выбор IAM роли Storage Object Admin в GCS" border />

Третий этап является необязательным и не используется в этом руководстве. Вы можете разрешить пользователям иметь эти привилегии в соответствии с вашими политиками.

<Image size="md" img={GCS_create_service_account_3} alt="Настройка дополнительных параметров для нового сервисного аккаунта в GCS" border />

Ключ HMAC сервисного аккаунта будет отображен. Сохраните эту информацию, так как она будет использована в конфигурации ClickHouse.

<Image size="md" img={GCS_guide_key} alt="Получение сгенерированного HMAC ключа для GCS" border />

</details>

