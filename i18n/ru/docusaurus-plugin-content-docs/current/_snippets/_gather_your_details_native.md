import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Image from '@theme/IdealImage';

Чтобы подключиться к ClickHouse с использованием нативного TCP, вам нужна следующая информация:

- ХОСТ и ПОРТ: обычно порт 9440 используется при включенном TLS, или 9000 при отключенном TLS.

- НАЗВАНИЕ БАЗЫ ДАННЫХ: в стандартной конфигурации есть база данных с именем `default`, используйте имя базы данных, к которой вы хотите подключиться.

- ИМЯ ПОЛЬЗОВАТЕЛЯ и ПАРОЛЬ: в стандартной конфигурации имя пользователя `default`. Используйте имя пользователя, подходящее для вашего случая.

Информация о вашем сервисе ClickHouse Cloud доступна в консоли ClickHouse Cloud. Выберите сервис, к которому хотите подключиться, и нажмите **Подключиться**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения к сервису ClickHouse Cloud" border/>

Выберите **Native**, и параметры подключения будут доступны в примере команды `clickhouse-client`.

<Image img={connection_details_native} size="md" alt="Детали подключения ClickHouse Cloud Native TCP" border/>

Если вы используете самоуправляемый ClickHouse, параметры подключения устанавливаются администратором вашего ClickHouse.
