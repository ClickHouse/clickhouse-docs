---
sidebar_label: QuickSight
slug: /integrations/quicksight
keywords: [clickhouse, aws, amazon, QuickSight, mysql, connect, integrate, ui]
description: Amazon QuickSight предоставляет возможность организациям, ориентированным на данные, использовать единый бизнес-анализ (BI).
---

import MySQLOnPremiseSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';


# QuickSight

QuickSight может подключаться к локальной установке ClickHouse (23.11+) через интерфейс MySQL, используя официальный источник данных MySQL и режим прямых запросов.

## Установка сервера ClickHouse на месте {#on-premise-clickhouse-server-setup}

Пожалуйста, обратитесь к [официальной документации](/interfaces/mysql) о том, как настроить сервер ClickHouse с включенным интерфейсом MySQL.

Помимо добавления записи в `config.xml` сервера

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

также _обязательно_ использовать [шифрование пароля с двойным SHA1](/operations/settings/settings-users#user-namepassword) для пользователя, который будет использовать интерфейс MySQL.

Сгенерировать случайный пароль, зашифрованный с помощью двойного SHA1, из командной оболочки:

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

Вывод должен выглядеть следующим образом:

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

Первая строка — это сгенерированный пароль, а вторая строка — хэш, который мы можем использовать для настройки ClickHouse.

Вот пример конфигурации для `mysql_user`, который использует сгенерированный хэш:

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

Замените запись `password_double_sha1_hex` на ваш собственный сгенерированный хэш двойного SHA1.

QuickSight требует нескольких дополнительных настроек в профиле пользователя MySQL.

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

Тем не менее, рекомендуется назначить это другому профилю, который может использоваться вашим пользователем MySQL, вместо того чтобы использовать профиль по умолчанию.

Наконец, настройте сервер ClickHouse так, чтобы он прослушивал указанные IP-адреса. 
В `config.xml` раскомментируйте следующее, чтобы слушать на всех адресах:

```bash
<listen_host>::</listen_host> 
```

Если у вас есть доступный бинарный файл `mysql`, вы можете протестировать подключение из командной строки.
Используя имя пользователя образца (`mysql_user`) и пароль (`LZOQYnqQN4L/T6L0`) из вышеуказанного, команда будет следующей:

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

Прежде всего, перейдите на https://quicksight.aws.amazon.com, перейдите к Наборам данных и нажмите "Новый набор данных":

<img src={quicksight_01} class="image" alt="Создание нового набора данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Поиск официального коннектора MySQL, входящего в состав QuickSight (названного просто **MySQL**):

<img src={quicksight_02} class="image" alt="Поиск коннектора MySQL" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Укажите детали вашего подключения. Обратите внимание, что порт интерфейса MySQL по умолчанию равен 9004,
и он может отличаться в зависимости от настройки вашего сервера.

<img src={quicksight_03} class="image" alt="Указание деталей подключения" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Теперь у вас есть два варианта, как получить данные из ClickHouse. Во-первых, вы можете выбрать таблицу из списка:

<img src={quicksight_04} class="image" alt="Выбор таблицы из списка" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

В качестве альтернативы вы можете указать пользовательский SQL для получения ваших данных:

<img src={quicksight_05} class="image" alt="Использование пользовательского SQL для получения данных" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Нажав "Редактировать/Просмотреть данные", вы должны увидеть структуру таблицы или отрегулировать свой пользовательский SQL, если именно так вы решили получить доступ к данным:

<img src={quicksight_06} class="image" alt="Просмотр структуры таблицы" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Убедитесь, что вы выбрали режим "Прямой запрос" в нижнем левом углу интерфейса:

<img src={quicksight_07} class="image" alt="Выбор режима прямого запроса" style={{width: '50%', 'background-color': 'transparent'}}/>  
<br/>                                                                                                      

Теперь вы можете продолжить публикацию вашего набора данных и создание новой визуализации! 

## Известные ограничения {#known-limitations}

- Импорт SPICE не работает должным образом; пожалуйста, используйте режим прямых запросов вместо этого. См. [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553).
