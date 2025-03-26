
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
    <summary>Создайте корзины GCS и ключ HMAC</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image size="md" img={GCS_bucket_1} alt="Создание корзины GCS в US East 1" border />

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image size="md" img={GCS_bucket_2} alt="Создание корзины GCS в US East 4" border />

### Генерация ключа доступа {#generate-an-access-key}

### Создание ключа и секрета HMAC для учетной записи службы {#create-a-service-account-hmac-key-and-secret}

Откройте **Cloud Storage > Настройки > Взаимодействие** и выберите существующий **Ключ доступа** или **СОЗДАТЬ КЛЮЧ ДЛЯ УЧЕТНОЙ ЗАПИСИ СЛУЖБЫ**. Этот гид описывает процесс создания нового ключа для новой учетной записи службы.

<Image size="md" img={GCS_create_service_account_key} alt="Генерация ключа HMAC учетной записи службы в GCS" border />

### Добавить новую учетную запись службы {#add-a-new-service-account}

Если это проект без существующей учетной записи службы, **СОЗДАТЬ НОВУЮ УЧЕТНУЮ ЗАПИСЬ**.

<Image size="md" img={GCS_create_service_account_0} alt="Добавление новой учетной записи службы в GCS" border />

Существует три шага для создания учетной записи службы, на первом шаге дайте учетной записи понятное имя, ID и описание.

<Image size="md" img={GCS_create_service_account_a} alt="Определение имени и ID новой учетной записи службы в GCS" border />

В диалоговом окне настроек взаимодействия рекомендуется использовать роль IAM **Storage Object Admin**; выберите эту роль на втором шаге.

<Image size="md" img={GCS_create_service_account_2} alt="Выбор роли IAM Storage Object Admin в GCS" border />

Третий шаг является необязательным и не используется в этом гиде. Вы можете предоставить пользователям эти привилегии в зависимости от ваших политик.

<Image size="md" img={GCS_create_service_account_3} alt="Настройка дополнительных параметров для новой учетной записи службы в GCS" border />

Ключ HMAC учетной записи службы будет отображен. Сохраните эту информацию, она будет использована в конфигурации ClickHouse.

<Image size="md" img={GCS_guide_key} alt="Получение сгенерированного ключа HMAC для GCS" border />

</details>
