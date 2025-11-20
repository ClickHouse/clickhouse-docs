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
    <summary>Создание бакетов GCS и HMAC-ключа</summary>

### ch_bucket_us_east1 {#ch_bucket_us_east1}

<Image
  size='md'
  img={GCS_bucket_1}
  alt='Создание бакета GCS в регионе US East 1'
  border
/>

### ch_bucket_us_east4 {#ch_bucket_us_east4}

<Image
  size='md'
  img={GCS_bucket_2}
  alt='Создание бакета GCS в регионе US East 4'
  border
/>

### Генерация ключа доступа {#generate-an-access-key}

### Создание HMAC-ключа и секрета сервисной учетной записи {#create-a-service-account-hmac-key-and-secret}

Откройте **Cloud Storage > Settings > Interoperability** и либо выберите существующий **Access key**, либо нажмите **CREATE A KEY FOR A SERVICE ACCOUNT**. В этом руководстве описывается создание нового ключа для новой сервисной учетной записи.

<Image
  size='md'
  img={GCS_create_service_account_key}
  alt='Генерация HMAC-ключа сервисной учетной записи в GCS'
  border
/>

### Добавление новой сервисной учетной записи {#add-a-new-service-account}

Если в проекте еще нет сервисной учетной записи, нажмите **CREATE NEW ACCOUNT**.

<Image
  size='md'
  img={GCS_create_service_account_0}
  alt='Добавление новой сервисной учетной записи в GCS'
  border
/>

Создание сервисной учетной записи состоит из трех шагов. На первом шаге укажите понятное имя, идентификатор и описание учетной записи.

<Image
  size='md'
  img={GCS_create_service_account_a}
  alt='Указание имени и идентификатора новой сервисной учетной записи в GCS'
  border
/>

В диалоговом окне настроек совместимости рекомендуется использовать роль IAM **Storage Object Admin**; выберите эту роль на втором шаге.

<Image
  size='md'
  img={GCS_create_service_account_2}
  alt='Выбор роли IAM Storage Object Admin в GCS'
  border
/>

Третий шаг является необязательным и не рассматривается в данном руководстве. Вы можете предоставить пользователям эти привилегии в соответствии с вашими политиками безопасности.

<Image
  size='md'
  img={GCS_create_service_account_3}
  alt='Настройка дополнительных параметров новой сервисной учетной записи в GCS'
  border
/>

Будет отображен HMAC-ключ сервисной учетной записи. Сохраните эту информацию, так как она потребуется для конфигурации ClickHouse.

<Image
  size='md'
  img={GCS_guide_key}
  alt='Получение сгенерированного HMAC-ключа для GCS'
  border
/>

</details>
