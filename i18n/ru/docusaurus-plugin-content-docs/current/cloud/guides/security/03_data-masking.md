---
slug: /cloud/guides/data-masking
sidebar_label: 'Маскирование данных'
title: 'Маскирование данных в ClickHouse'
description: 'Руководство по маскированию данных в ClickHouse'
keywords: ['маскирование данных']
doc_type: 'guide'
---



# Маскирование данных в ClickHouse

Маскирование данных — это метод защиты, при котором исходные данные заменяются вариантом, сохраняющим их формат и структуру, но не содержащим персональной идентифицирующей информации (PII) или конфиденциальных сведений.

В этом руководстве описано, как маскировать данные в ClickHouse.



## Использование функций замены строк {#using-string-functions}

Для базовых сценариев маскирования данных семейство функций `replace` предоставляет удобный способ маскировки:

| Функция                                                                                  | Описание                                                                                                                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceOne)             | Заменяет первое вхождение шаблона в строке указанной строкой замены.                                                                                    |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceAll)             | Заменяет все вхождения шаблона в строке указанной строкой замены.                                                                                       |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceRegexpOne) | Заменяет первое вхождение подстроки, соответствующей шаблону регулярного выражения (в синтаксисе re2), указанной строкой замены.              |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceRegexpAll) | Заменяет все вхождения подстроки, соответствующей шаблону регулярного выражения (в синтаксисе re2), указанной строкой замены.                 |

Например, можно заменить имя «John Smith» на заполнитель `[CUSTOMER_NAME]` с помощью функции `replaceOne`:

```sql title="Запрос"
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response title="Ответ"
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

Более универсальный подход — использовать `replaceRegexpAll` для замены любого имени клиента:

```sql title="Запрос"
SELECT
    replaceRegexpAll(
        'Customer John Smith called. Later, Mary Johnson and Bob Wilson also called.',
        '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        '[CUSTOMER_NAME]'
    ) AS anonymized_text;
```

```response title="Ответ"
┌─anonymized_text───────────────────────────────────────────────────────────────────────┐
│ [CUSTOMER_NAME] Smith called. Later, [CUSTOMER_NAME] and [CUSTOMER_NAME] also called. │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

Также можно замаскировать номер социального страхования, оставив только последние 4 цифры, с помощью функции `replaceRegexpAll`.

```sql title="Запрос"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

В запросе выше `\3` используется для подстановки третьей группы захвата в результирующую строку, что даёт:

```response title="Ответ"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```


## Создание маскированных представлений (`VIEW`) {#masked-views}

[`VIEW`](/sql-reference/statements/create/view) можно использовать совместно с вышеупомянутыми строковыми функциями для применения преобразований к столбцам, содержащим конфиденциальные данные, перед их отображением пользователю.
Таким образом, исходные данные остаются неизменными, а пользователи, выполняющие запросы к представлению, видят только маскированные данные.

Для демонстрации представим, что у нас есть таблица, в которой хранятся записи о заказах клиентов.
Мы хотим, чтобы группа сотрудников могла просматривать информацию, но при этом не видела полную информацию о клиентах.

Выполните приведенный ниже запрос, чтобы создать таблицу-пример `orders` и вставить в нее несколько вымышленных записей о заказах клиентов:

```sql
CREATE TABLE orders (
    user_id UInt32,
    name String,
    email String,
    phone String,
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

Создайте представление с именем `masked_orders`:

```sql
CREATE VIEW masked_orders AS
SELECT
    user_id,
    replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****') AS name,
    replaceRegexpOne(email, '^(.{0})[^@]*(@.*)$', '\\1****\\2') AS email,
    replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3') AS phone,
    total_amount,
    order_date,
    replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1') AS shipping_address
FROM orders;
```

В секции `SELECT` приведенного выше запроса создания представления мы определяем преобразования с использованием функции `replaceRegexpOne` для полей `name`, `email`, `phone` и `shipping_address`, которые содержат конфиденциальную информацию, требующую частичного маскирования.

Выберите данные из представления:

```sql title="Запрос"
SELECT * FROM masked_orders
```


```response title="Response"
┌─user_id─┬─name─────────┬─email──────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address──────────┐
│    1001 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │       299.99 │ 2024-01-15 │ *** New York, NY 10001    │
│    1002 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │        149.5 │ 2024-01-16 │ *** Los Angeles, CA 90210 │
│    1003 │ Michael **** │ mb****@company.com │ 555-***-7890 │          599 │ 2024-01-17 │ *** Chicago, IL 60601     │
│    1004 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │        89.99 │ 2024-01-18 │ *** Houston, TX 77001     │
│    1005 │ David ****   │ dw****@email.net   │ 555-***-3210 │       449.75 │ 2024-01-19 │ *** Phoenix, AZ 85001     │
└─────────┴──────────────┴────────────────────┴──────────────┴──────────────┴────────────┴───────────────────────────┘
```

Обратите внимание, что данные, возвращаемые представлением, частично маскированы, чтобы скрыть конфиденциальную информацию.
Вы также можете создавать несколько представлений с разным уровнем маскирования (обфускации) данных в зависимости от уровня привилегированного доступа к информации у пользователя.

Чтобы пользователи могли получать доступ только к представлению, возвращающему замаскированные данные, а не к таблице с исходными немаскированными данными, следует использовать [Role Based Access Control](/cloud/security/console-roles), чтобы гарантировать, что определённые роли имеют права только на выборку из представления.

Сначала создайте роль:

```sql
CREATE ROLE masked_orders_viewer;
```

Затем предоставьте роли привилегии `SELECT` на представление:

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

Поскольку роли в ClickHouse являются аддитивными, необходимо убедиться, что пользователи, которые должны видеть только замаскированное представление, не имеют привилегии `SELECT` на базовую таблицу ни через одну роль.

Поэтому в целях безопасности следует явно отозвать доступ к базовой таблице:

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

Наконец, назначьте эту роль нужным пользователям:

```sql
GRANT masked_orders_viewer TO your_user;
```

Это гарантирует, что пользователи с ролью `masked_orders_viewer` смогут видеть
только замаскированные данные в представлении, а не исходные незамаскированные данные таблицы.


## Использование колонок `MATERIALIZED` и ограничений доступа на уровне колонок {#materialized-ephemeral-column-restrictions}

В случаях, когда вы не хотите создавать отдельное представление, можно хранить маскированные версии данных вместе с исходными данными.
Для этого можно использовать [материализованные колонки](/sql-reference/statements/create/table#materialized).
Значения таких колонок автоматически вычисляются в соответствии с указанным материализованным выражением при вставке строк,
и их можно использовать для создания новых колонок с маскированными версиями данных.

Возьмем предыдущий пример: вместо создания отдельного представления `VIEW` для маскированных данных создадим маскированные колонки с помощью `MATERIALIZED`:

```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    user_id UInt32,
    name String,
    name_masked String MATERIALIZED replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
    email String,
    email_masked String MATERIALIZED replaceRegexpOne(email, '^(.{0})[^@]*(@.*)$', '\\1****\\2'),
    phone String,
    phone_masked String MATERIALIZED replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String,
    shipping_address_masked String MATERIALIZED replaceRegexpOne(shipping_address, '^[^,]+,\\s*(.*)$', '*** \\1')
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

Если теперь выполнить следующий запрос SELECT, вы увидите, что маскированные данные материализуются во время вставки и хранятся вместе с исходными, немаскированными данными.
Необходимо явно указывать маскированные колонки, поскольку ClickHouse по умолчанию не включает материализованные колонки в запросы `SELECT *`.

```sql title="Запрос"
SELECT
    *,
    name_masked,
    email_masked,
    phone_masked,
    shipping_address_masked
FROM orders
ORDER BY user_id ASC
```


```response title="Response"
   ┌─user_id─┬─name──────────┬─email─────────────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address───────────────────┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked────┐
1. │    1001 │ John Smith    │ john.smith@gmail.com      │ 555-123-4567 │       299.99 │ 2024-01-15 │ 123 Main St, New York, NY 10001    │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ **** New York, NY 10001    │
2. │    1002 │ Sarah Johnson │ sarah.johnson@outlook.com │ 555-987-6543 │        149.5 │ 2024-01-16 │ 456 Oak Ave, Los Angeles, CA 90210 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ **** Los Angeles, CA 90210 │
3. │    1003 │ Michael Brown │ mbrown@company.com        │ 555-456-7890 │          599 │ 2024-01-17 │ 789 Pine Rd, Chicago, IL 60601     │ Michael **** │ mb****@company.com │ 555-***-7890 │ **** Chicago, IL 60601     │
4. │    1004 │ Emily Rogers  │ emily.rogers@yahoo.com    │ 555-321-0987 │        89.99 │ 2024-01-18 │ 321 Elm St, Houston, TX 77001      │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ **** Houston, TX 77001     │
5. │    1005 │ David Wilson  │ dwilson@email.net         │ 555-654-3210 │       449.75 │ 2024-01-19 │ 654 Cedar Blvd, Phoenix, AZ 85001  │ David ****   │ dw****@email.net   │ 555-***-3210 │ **** Phoenix, AZ 85001     │
   └─────────┴───────────────┴───────────────────────────┴──────────────┴──────────────┴────────────┴────────────────────────────────────┴──────────────┴────────────────────┴──────────────┴────────────────────────────┘
```

Чтобы гарантировать, что пользователи могут получать доступ только к столбцам с маскированными данными, вы снова можете использовать [Role Based Access Control](/cloud/security/console-roles), чтобы определённым ролям были выданы права только на `SELECT` маскированных столбцов из таблицы `orders`.

Снова создайте роль, которую мы создавали ранее:

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

Затем предоставьте привилегию `SELECT` для таблицы `orders`:

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

Отзовите доступ к любым конфиденциальным столбцам:

```sql
REVOKE SELECT(name) ON orders FROM masked_data_reader;
REVOKE SELECT(email) ON orders FROM masked_data_reader;
REVOKE SELECT(phone) ON orders FROM masked_data_reader;
REVOKE SELECT(shipping_address) ON orders FROM masked_data_reader;
```

Наконец, назначьте роль соответствующим пользователям:

```sql
GRANT masked_orders_viewer TO your_user;
```

Если вы хотите хранить в таблице `orders` только замаскированные данные,
можно пометить конфиденциальные немаскированные столбцы как [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral),
что гарантирует, что столбцы этого типа не будут сохраняться в таблице.


```sql
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    user_id UInt32,
    name String EPHEMERAL,
    name_masked String MATERIALIZED replaceRegexpOne(name, '^([A-Za-z]+)\\s+(.*)$', '\\1 ****'),
    email String EPHEMERAL,
    email_masked String MATERIALIZED replaceRegexpOne(email, '^(.{2})[^@]*(@.*)$', '\\1****\\2'),
    phone String EPHEMERAL,
    phone_masked String MATERIALIZED replaceRegexpOne(phone, '^(\\d{3})-(\\d{3})-(\\d{4})$', '\\1-***-\\3'),
    total_amount Decimal(10,2),
    order_date Date,
    shipping_address String EPHEMERAL,
    shipping_address_masked String MATERIALIZED replaceRegexpOne(shipping_address, '^([^,]+),\\s*(.*)$', '*** \\2')
)
ENGINE = MergeTree()
ORDER BY user_id;

INSERT INTO orders (user_id, name, email, phone, total_amount, order_date, shipping_address) VALUES
    (1001, 'John Smith', 'john.smith@gmail.com', '555-123-4567', 299.99, '2024-01-15', '123 Main St, New York, NY 10001'),
    (1002, 'Sarah Johnson', 'sarah.johnson@outlook.com', '555-987-6543', 149.50, '2024-01-16', '456 Oak Ave, Los Angeles, CA 90210'),
    (1003, 'Michael Brown', 'mbrown@company.com', '555-456-7890', 599.00, '2024-01-17', '789 Pine Rd, Chicago, IL 60601'),
    (1004, 'Emily Rogers', 'emily.rogers@yahoo.com', '555-321-0987', 89.99, '2024-01-18', '321 Elm St, Houston, TX 77001'),
    (1005, 'David Wilson', 'dwilson@email.net', '555-654-3210', 449.75, '2024-01-19', '654 Cedar Blvd, Phoenix, AZ 85001');
```

Если мы выполним тот же запрос, как и раньше, вы теперь увидите, что в таблицу были вставлены только материализованные маскированные данные:

```sql title="Query"
SELECT
    *,
    name_masked,
    email_masked,
    phone_masked,
    shipping_address_masked
FROM orders
ORDER BY user_id ASC
```

```response title="Response"
   ┌─user_id─┬─total_amount─┬─order_date─┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked───┐
1. │    1001 │       299.99 │ 2024-01-15 │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ *** New York, NY 10001    │
2. │    1002 │        149.5 │ 2024-01-16 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ *** Los Angeles, CA 90210 │
3. │    1003 │          599 │ 2024-01-17 │ Michael **** │ mb****@company.com │ 555-***-7890 │ *** Chicago, IL 60601     │
4. │    1004 │        89.99 │ 2024-01-18 │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ *** Houston, TX 77001     │
5. │    1005 │       449.75 │ 2024-01-19 │ David ****   │ dw****@email.net   │ 555-***-3210 │ *** Phoenix, AZ 85001     │
   └─────────┴──────────────┴────────────┴──────────────┴────────────────────┴──────────────┴───────────────────────────┘
```


## Использование правил маскирования запросов для данных журналов {#use-query-masking-rules}

Пользователи ClickHouse OSS, которым необходимо маскировать данные журналов, могут использовать [правила маскирования запросов](/operations/server-configuration-parameters/settings#query_masking_rules) (маскирование журналов).

Для этого можно определить правила маскирования на основе регулярных выражений в конфигурации сервера.
Эти правила применяются к запросам и всем сообщениям журналов перед их сохранением в журналы сервера или системные таблицы (такие как `system.query_log`, `system.text_log` и `system.processes`).

Это помогает предотвратить утечку конфиденциальных данных только в **журналы**.
Обратите внимание, что данные в результатах запросов не маскируются.

Например, чтобы замаскировать номер социального страхования, можно добавить следующее правило в [конфигурацию сервера](/operations/configuration-files):

```yaml
<query_masking_rules>
<rule>
<name>hide SSN</name>
<regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
<replace>000-00-0000</replace>
</rule>
</query_masking_rules>
```
