---
sidebar_label: 'QuickSight'
slug: /integrations/quicksight
keywords: ['clickhouse', 'aws', 'amazon', 'QuickSight', 'mysql', 'connect', 'integrate', 'ui']
description: 'Amazon QuickSight помогает организациям, принимающим решения на основе данных, за счёт единой платформы бизнес-аналитики (BI).'
title: 'QuickSight'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import MySQLOnPremiseSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# QuickSight {#quicksight}

<ClickHouseSupportedBadge/>

QuickSight может подключаться к локальному развертыванию ClickHouse (23.11+) через интерфейс MySQL, используя официальный источник данных MySQL и режим Direct Query.

## Настройка локально развернутого сервера ClickHouse {#on-premise-clickhouse-server-setup}

Обратитесь к [официальной документации](/interfaces/mysql) по настройке сервера ClickHouse с включённым интерфейсом MySQL.

Помимо добавления записи в `config.xml` сервера

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

также *обязательно* использовать [шифрование пароля Double SHA1](/operations/settings/settings-users#user-namepassword) для пользователя, который будет работать через интерфейс MySQL.

Генерация случайного пароля, зашифрованного с помощью Double SHA1, из командной оболочки:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

Результат должен выглядеть следующим образом:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

Первая строка — сгенерированный пароль, а вторая строка — хэш, который мы можем использовать для настройки ClickHouse.

Вот пример конфигурации для `mysql_user`, использующей сгенерированный хэш:

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

Замените значение `password_double_sha1_hex` на сгенерированное вами значение двойного SHA1-хеша.

QuickSight требует ряда дополнительных параметров в профиле пользователя MySQL.

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

Однако рекомендуется назначить его другому профилю, который будет использоваться вашим пользователем MySQL вместо профиля по умолчанию.

Наконец, настройте ClickHouse Server на прослушивание нужных IP-адресов.
В `config.xml` раскомментируйте следующие строки, чтобы прослушивать все адреса:

```bash
<listen_host>::</listen_host>
```

Если у вас установлен бинарный файл `mysql`, вы можете протестировать подключение из командной строки.
Используя пример имени пользователя (`mysql_user`) и пароля (`LZOQYnqQN4L/T6L0`) из приведённого выше примера, команда в командной строке будет следующей:

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

Для начала перейдите на [https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com), откройте раздел Datasets и нажмите "New dataset":

<Image size="md" img={quicksight_01} alt="Панель управления Amazon QuickSight с кнопкой New dataset в разделе Datasets" border />
<br/>

Найдите официальный коннектор MySQL, поставляемый с QuickSight (называется просто **MySQL**):

<Image size="md" img={quicksight_02} alt="Экран выбора источника данных QuickSight с MySQL, выделенным в результатах поиска" border />
<br/>

Укажите параметры подключения. Обратите внимание, что порт интерфейса MySQL по умолчанию — 9004,
и он может отличаться в зависимости от конфигурации вашего сервера.

<Image size="md" img={quicksight_03} alt="Форма настройки подключения MySQL в QuickSight с полями hostname, port, database и credentials" border />
<br/>

Теперь у вас есть два варианта получения данных из ClickHouse. Во‑первых, вы можете выбрать таблицу из списка:

<Image size="md" img={quicksight_04} alt="Интерфейс выбора таблиц в QuickSight, показывающий таблицы базы данных, доступные из ClickHouse" border />
<br/>

Либо вы можете указать произвольный SQL-запрос для получения данных:

<Image size="md" img={quicksight_05} alt="Редактор произвольного SQL-запроса в QuickSight для выборки данных из ClickHouse" border />
<br/>

Нажав "Edit/Preview data", вы сможете увидеть структуру таблицы, полученную в результате автоанализа, или скорректировать ваш произвольный SQL-запрос, если вы решили получать данные таким способом:

<Image size="md" img={quicksight_06} alt="Предпросмотр данных в QuickSight, показывающий структуру таблицы со столбцами и примерами данных" border />
<br/>

Убедитесь, что в левом нижнем углу интерфейса выбран режим "Direct Query":

<Image size="md" img={quicksight_07} alt="Интерфейс QuickSight с выделенной опцией режима Direct Query в нижнем углу" border />
<br/>

Теперь вы можете опубликовать набор данных и создать новую визуализацию!

## Известные ограничения {#known-limitations}

- Импорт SPICE работает некорректно; вместо него используйте режим Direct Query. См. [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553).
