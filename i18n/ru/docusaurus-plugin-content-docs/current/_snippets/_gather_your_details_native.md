import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

Чтобы подключиться к ClickHouse через нативный протокол TCP, вам потребуется следующая информация:

| Параметр(ы)             | Описание                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `HOST` и `PORT`         | Обычно используется порт 9440 при использовании TLS, а при отсутствии TLS — порт 9000.                                  |
| `DATABASE NAME`         | По умолчанию доступна база данных с именем `default`; используйте имя базы данных, к которой вы хотите подключиться.    |
| `USERNAME` и `PASSWORD` | По умолчанию имя пользователя — `default`. Используйте имя пользователя, соответствующее вашему сценарию использования. |

Сведения о вашем сервисе ClickHouse Cloud доступны в консоли ClickHouse Cloud.
Выберите сервис, к которому вы будете подключаться, и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения сервиса ClickHouse Cloud" border />

Выберите **Native**, и необходимые параметры будут доступны в примере команды `clickhouse-client`.

<Image img={connection_details_native} size="md" alt="Параметры нативного TCP-подключения к ClickHouse Cloud" border />

Если вы используете самостоятельно развернутый ClickHouse, параметры подключения задаются администратором ClickHouse.
