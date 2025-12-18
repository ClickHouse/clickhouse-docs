import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

Для подключения к ClickHouse по протоколу native TCP вам потребуется следующая информация:

| Параметр(ы)             | Описание                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `HOST` и `PORT`         | Обычно используется порт 9440 при использовании TLS или 9000 при подключении без TLS.                                  |
| `DATABASE NAME`         | По умолчанию существует база данных с именем `default`; используйте имя базы данных, к которой вы хотите подключиться. |
| `USERNAME` и `PASSWORD` | По умолчанию имя пользователя — `default`. Используйте имя пользователя, подходящее для вашего сценария.               |

Сведения о вашем сервисе ClickHouse Cloud доступны в консоли ClickHouse Cloud.
Выберите сервис, к которому вы будете подключаться, и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения сервиса ClickHouse Cloud" border />

Выберите **Native**; подробные данные будут доступны в примере команды `clickhouse-client`.

<Image img={connection_details_native} size="md" alt="Сведения о подключении по Native TCP к ClickHouse Cloud" border />

Если вы используете самостоятельно управляемый ClickHouse, параметры подключения задаются вашим администратором ClickHouse.
