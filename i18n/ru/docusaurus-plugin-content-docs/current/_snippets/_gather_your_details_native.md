import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';

Чтобы подключиться к ClickHouse с помощью нативного TCP, вам нужна следующая информация:

- ХОСТ и ПОРТ: обычно, порт 9440 при использовании TLS или 9000 при отсутствии TLS.

- ИМЯ БАЗЫ ДАННЫХ: по умолчанию есть база данных с именем `default`, используйте имя базы данных, к которой вы хотите подключиться.

- ИМЯ ПОЛЬЗОВАТЕЛЯ и ПАРОЛЬ: по умолчанию имя пользователя `default`. Используйте имя пользователя, подходящее для вашего случая.

Данные для вашей службы ClickHouse Cloud доступны в консоли ClickHouse Cloud. Выберите службу, к которой вы хотите подключиться, и нажмите **Подключиться**:

<img src={cloud_connect_button} class="image" alt="Кнопка подключения к службе ClickHouse Cloud" />

Выберите **Native**, и данные будут доступны в примере команды `clickhouse-client`.

<img src={connection_details_native} class="image" alt="Детали подключения ClickHouse Cloud Native TCP" />

Если вы используете self-managed ClickHouse, детали подключения задаются вашим администратором ClickHouse.
