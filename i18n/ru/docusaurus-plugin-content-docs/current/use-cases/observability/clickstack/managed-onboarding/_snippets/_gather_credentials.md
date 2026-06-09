import Image from '@theme/IdealImage';
import clickhouse_cloud_connection from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';

Вам потребуется:

* HTTPS-конечная точка вашего сервиса ClickHouse Cloud, включая протокол и порт, например `https://abc123xyz.us-central1.gcp.clickhouse.cloud:8443`.
* Имя пользователя и пароль ClickHouse для приёма данных.

Если у вас нет этих данных, откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud) и выберите **Connect**. Запишите URL из открывшегося диалогового окна. Ниже мы создадим отдельного пользователя для приёма данных.

<Image img={clickhouse_cloud_connection} size="lg" alt="Панель подключения к сервису с HTTPS-конечной точкой и паролем" border />