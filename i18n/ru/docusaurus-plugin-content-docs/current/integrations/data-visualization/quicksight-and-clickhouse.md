---
sidebar_label: 'QuickSight'
slug: /integrations/quicksight
keywords: ['clickhouse', 'aws', 'amazon', 'QuickSight', 'mysql', 'connect', 'integrate', 'ui']
description: 'Amazon QuickSight позволяет организациям, принимающим решения на основе данных, использовать единое бизнес-аналитику (BI).'
title: 'QuickSight'
---

import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QuickSight

<CommunityMaintainedBadge/>

QuickSight может подключаться к локальной настройке ClickHouse (23.11+) через интерфейс MySQL, используя официальный источник данных MySQL и режим прямого запроса.

## Настройка локального сервера ClickHouse {#on-premise-clickhouse-server-setup}

Пожалуйста, обратитесь к [официальной документации](/interfaces/mysql) о том, как настроить сервер ClickHouse с включенным интерфейсом MySQL.

Кроме добавления записи в файл `config.xml` сервера

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

также _обязательно_ использовать [шифрование пароля Double SHA1](/operations/settings/settings-users#user-namepassword) для пользователя, который будет использовать интерфейс MySQL.

Генерирование случайного пароля, зашифрованного с помощью Double SHA1 из командной оболочки:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

Вывод должен выглядеть следующим образом:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

Первая строка - это сгенерированный пароль, а вторая строка - это хеш, который мы могли бы использовать для настройки ClickHouse.

Вот пример конфигурации для `mysql_user`, использующего сгенерированный хеш:

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<users>
    <mysql_user>
        <password_double_sha1_hex>fbc958cc745a82188a51f30de69eebfc67c40ee4</password_double_sha1_hex>
        <networks>
            <ip>::/0</ip>
        </networks>
        <profile>default</profile>
        <quota>default</quota>
    </mysql_user>
</users>
```

Замените запись `password_double_sha1_hex` на ваш собственный сгенерированный хеш Double SHA1.

QuickSight требует несколько дополнительных настроек в профиле пользователя MySQL.

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<profiles>
    <default>
        <prefer_column_name_to_alias>1</prefer_column_name_to_alias>
        <mysql_map_string_to_text_in_show_columns>1</mysql_map_string_to_text_in_show_columns>
        <mysql_map_fixed_string_to_text_in_show_columns>1</mysql_map_fixed_string_to_text_in_show_columns>
    </default>
</profiles>
```

Тем не менее, рекомендуется назначить это на другой профиль, который может использоваться вашим пользователем MySQL вместо профиля по умолчанию.

Наконец, настройте сервер ClickHouse для прослушивания на желаемом IP-адресе(ах).
В `config.xml`, раскомментируйте следующее, чтобы слушать на всех адресах:

```bash
<listen_host>::</listen_host>
```

Если у вас есть бинарный файл `mysql`, вы можете протестировать подключение из командной строки.
Используя пример имени пользователя (`mysql_user`) и пароля (`LZOQYnqQN4L/T6L0`) из вышеуказанного, команда в командной строке будет:

```bash
mysql --protocol tcp -h localhost -u mysql_user -P 9004 --password=LZOQYnqQN4L/T6L0
```

```response
mysql> show databases;
+--------------------+
| name               |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| information_schema |
| system             |
+--------------------+
4 rows in set (0.00 sec)
Read 4 rows, 603.00 B in 0.00156 sec., 2564 rows/sec., 377.48 KiB/sec.
```

## Подключение QuickSight к ClickHouse {#connecting-quicksight-to-clickhouse}

Прежде всего, перейдите по адресу https://quicksight.aws.amazon.com, перейдите в раздел Наборы данных и нажмите "Новый набор данных":

<Image size="md" img={quicksight_01} alt="Панель приборов Amazon QuickSight, показывающая кнопку Новый набор данных в разделе Наборы данных" border />
<br/>

Ищите официальный соединитель MySQL, который поставляется с QuickSight (называется просто **MySQL**):

<Image size="md" img={quicksight_02} alt="Экран выбора источника данных QuickSight с выделенным MySQL в результатах поиска" border />
<br/>

Укажите ваши данные для подключения. Обратите внимание, что порт интерфейса MySQL по умолчанию равен 9004,
и он может отличаться в зависимости от вашей конфигурации сервера.

<Image size="md" img={quicksight_03} alt="Форма конфигурации подключения MySQL в QuickSight с полями для имени хоста, порта, базы данных и учетных данных" border />
<br/>

Теперь у вас есть два варианта, как извлечь данные из ClickHouse. Во-первых, вы можете выбрать таблицу из списка:

<Image size="md" img={quicksight_04} alt="Интерфейс выбора таблицы QuickSight, показывающий базы данных, доступные из ClickHouse" border />
<br/>

В качестве альтернативы вы можете указать собственный SQL для извлечения ваших данных:

<Image size="md" img={quicksight_05} alt="Редактор пользовательского SQL запроса QuickSight для извлечения данных из ClickHouse" border />
<br/>

Нажимая "Редактировать/Предварительный просмотр данных", вы должны увидеть проинспектированную структуру таблицы или настроить свой пользовательский SQL, если вы решили получить доступ к данным таким образом:

<Image size="md" img={quicksight_06} alt="Предварительный просмотр данных QuickSight, показывающий структуру таблицы с колонками и примерными данными" border />
<br/>

Убедитесь, что в нижнем левом углу пользовательского интерфейса выбран режим "Прямой запрос":

<Image size="md" img={quicksight_07} alt="Интерфейс QuickSight с выделенным вариантом режима Прямого запроса в нижнем углу" border />
<br/>

Теперь вы можете продолжать с публикацией вашего набора данных и созданием новой визуализации!

## Известные ограничения {#known-limitations}

- Импорт SPICE не работает ожидаемым образом; пожалуйста, используйте режим Прямого запроса вместо этого. Смотрите [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553).
