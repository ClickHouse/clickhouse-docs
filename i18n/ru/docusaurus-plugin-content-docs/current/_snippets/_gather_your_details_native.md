import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

Чтобы подключиться к ClickHouse по нативному протоколу TCP, вам понадобится следующая информация:

| Parameter(s)              | Description                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `HOST` and `PORT`         | Обычно используется порт 9440 при использовании TLS или 9000 при отсутствии TLS.                                     |
| `DATABASE NAME`           | По умолчанию доступна база данных с именем `default`. Используйте имя базы данных, к которой вы хотите подключиться. |
| `USERNAME` and `PASSWORD` | По умолчанию имя пользователя — `default`. Используйте имя пользователя, подходящее для вашего сценария.             |

Сведения о вашем сервисе ClickHouse Cloud доступны в консоли ClickHouse Cloud.
Выберите сервис, к которому вы будете подключаться, и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения к сервису ClickHouse Cloud" border />

Выберите **Native**, и параметры будут доступны в примере команды `clickhouse-client`.

<Image img={connection_details_native} size="md" alt="Параметры подключения ClickHouse Cloud по Native TCP" border />

Если вы используете самостоятельно развернутый ClickHouse, параметры подключения задаются вашим администратором ClickHouse.
