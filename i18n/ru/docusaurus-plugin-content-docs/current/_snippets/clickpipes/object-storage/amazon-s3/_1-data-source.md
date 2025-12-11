import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step1.png';
import Image from '@theme/IdealImage';

**2.** Нажмите плитку **Amazon S3**. Эту плитку также можно использовать для подключения к другим S3-совместимым сервисам, которые не перечислены в интерфейсе ClickPipes.

<Image img={cp_step1} alt="Select imports" size="lg" border />

:::tip
Из-за различий в форматах URL и реализациях API у разных провайдеров сервисов объектного хранилища не все S3-совместимые сервисы поддерживаются по умолчанию. Если у вас возникают проблемы с сервисом, который не указан в списке [поддерживаемых источников данных](/integrations/clickpipes/object-storage/s3/overview#supported-data-sources), [свяжитесь с нашей командой](https://clickhouse.com/company/contact?loc=clickpipes).
:::
