import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

Чтобы подключиться к ClickHouse по нативному TCP, вам понадобятся следующие данные:

| Parameter(s)              | Description                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `HOST` and `PORT`         | Обычно используется порт 9440 при включённом TLS или 9000 без TLS.                                            |
| `DATABASE NAME`           | По умолчанию доступна база данных с именем `default`; укажите имя базы данных, к которой хотите подключиться. |
| `USERNAME` and `PASSWORD` | По умолчанию имя пользователя — `default`. Используйте имя пользователя, подходящее для вашего сценария.      |

Параметры для вашего сервиса ClickHouse Cloud доступны в консоли ClickHouse Cloud.
Выберите сервис, к которому вы будете подключаться, и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения сервиса ClickHouse Cloud" border />

Выберите **Native** — необходимые параметры будут показаны в примере команды `clickhouse-client`.

<Image img={connection_details_native} size="md" alt="Параметры подключения ClickHouse Cloud по нативному TCP" border />

Если вы используете самоуправляемый ClickHouse, параметры подключения задаются вашим администратором ClickHouse.
