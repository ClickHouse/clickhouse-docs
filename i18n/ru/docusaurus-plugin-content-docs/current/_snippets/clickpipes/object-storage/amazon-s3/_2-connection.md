import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import Image from '@theme/IdealImage';

<Image img={cp_step2} alt="Укажите параметры подключения" size="lg" border />

* **Authentication method**: S3 ClickPipe поддерживает [учетные данные IAM](/integrations/clickpipes/object-storage/amazon-s3/overview/#iam-credentials) (`Credentials`) и [аутентификацию на основе роли IAM](/integrations/clickpipes/object-storage/amazon-s3/overview/#iam-role) (`IAM role`). См. [справочную документацию](/integrations/clickpipes/object-storage/overview/#access-control) для получения рекомендаций по аутентификации и настройке прав доступа.

  * **S3 file path**: S3 ClickPipe ожидает [URI в формате virtual-hosted-style](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#virtual-hosted-style-access).

    ```bash
        https://bucket-name.s3.region-code.amazonaws.com/key-name
        ```

    Можно использовать подстановочные символы POSIX для сопоставления с несколькими файлами или префиксами. См. [справочную документацию](/integrations/clickpipes/object-storage/overview/#file-pattern-matching) для получения рекомендаций по поддерживаемым шаблонам.
