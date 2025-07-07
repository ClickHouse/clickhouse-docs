
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

Чтобы подключиться к ClickHouse по протоколу TCP, вам нужна следующая информация:

- ХОСТ и ПОРТ: как правило, порт 9440 при использовании TLS или 9000 при отсутствии TLS.

- ИМЯ БАЗЫ ДАННЫХ: по умолчанию есть база данных с именем `default`, используйте имя базы данных, к которой вы хотите подключиться.

- ИМЯ ПОЛЬЗОВАТЕЛЯ и ПАРОЛЬ: по умолчанию имя пользователя — `default`. Используйте имя пользователя, соответствующее вашему случаю использования.

Детали вашего сервиса ClickHouse Cloud доступны в консоли ClickHouse Cloud. Выберите сервис, к которому хотите подключиться, и нажмите **Подключиться**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения к сервису ClickHouse Cloud" border/>

Выберите **Native**, и детали будут доступны в примере команды `clickhouse-client`.

<Image img={connection_details_native} size="md" alt="Детали подключения ClickHouse Cloud Native TCP" border/>

Если вы используете самоуправляемый ClickHouse, детали подключения настраиваются вашим администратором ClickHouse.
