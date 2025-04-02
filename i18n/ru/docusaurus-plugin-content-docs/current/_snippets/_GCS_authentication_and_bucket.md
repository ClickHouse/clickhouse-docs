
import GCS_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-1.png';
import GCS_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-bucket-2.png';
import GCS_create_service_account_key from '@site/static/images/integrations/data-ingestion/s3/GCS-create-a-service-account-key.png';
import GCS_create_service_account_0 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-0.png';
import GCS_create_service_account_a from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-a.png';
import GCS_create_service_account_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-2.png';
import GCS_create_service_account_3 from '@site/static/images/integrations/data-ingestion/s3/GCS-create-service-account-3.png';
import GCS_guide_key from '@site/static/images/integrations/data-ingestion/s3/GCS-guide-key.png';

<details>
    <summary>Создание бакетов GCS и HMAC ключа</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<img src={GCS_bucket_1} alt="Создание бакета GCS в US East 1" />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<img src={GCS_bucket_2} alt="Создание бакета GCS в US East 4" />

### Генерация ключа доступа {#generate-an-access-key}

### Создание HMAC ключа и секрета для сервисного аккаунта {#create-a-service-account-hmac-key-and-secret}

Откройте **Cloud Storage > Настройки > Совместимость** и выберите существующий **Ключ доступа**, или **СОЗДАТЬ КЛЮЧ ДЛЯ СЕРВИСНОГО АККУНТА**. Этот гид охватывает процесс создания нового ключа для нового сервисного аккаунта.

<img src={GCS_create_service_account_key} alt="Генерация HMAC ключа сервисного аккаунта в GCS" />

### Добавление нового сервисного аккаунта {#add-a-new-service-account}

Если это проект без существующего сервисного аккаунта, **СОЗДАТЬ НОВЫЙ АККАНТ**.

<img src={GCS_create_service_account_0} alt="Добавление нового сервисного аккаунта в GCS" />

Существует три шага для создания сервисного аккаунта, на первом шаге дайте аккаунту значимое имя, ID и описание.

<img src={GCS_create_service_account_a} alt="Определение имени и ID нового сервисного аккаунта в GCS" />

В диалоговом окне настроек совместимости рекомендуется роль IAM **Администратор объектов хранилища**; выберите эту роль на втором шаге.

<img src={GCS_create_service_account_2} alt="Выбор IAM роли Администратор объектов хранилища в GCS" />

Шаг третий является необязательным и не используется в этом руководстве. Вы можете разрешить пользователям иметь эти привилегии в зависимости от ваших политик.

<img src={GCS_create_service_account_3} alt="Настройка дополнительных параметров для нового сервисного аккаунта в GCS" />

HMAC ключ сервисного аккаунта будет отображен. Сохраните эту информацию, так как она будет использована в конфигурации ClickHouse.

<img src={GCS_guide_key} alt="Получение сгенерированного HMAC ключа для GCS" />

</details>

