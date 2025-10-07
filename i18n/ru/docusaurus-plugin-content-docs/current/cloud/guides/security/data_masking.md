---
'slug': '/cloud/guides/data-masking'
'sidebar_label': 'Маскирование данных'
'title': 'Данные маскирования в ClickHouse'
'description': 'Руководство по маскированию данных в ClickHouse'
'keywords':
- 'data masking'
'doc_type': 'guide'
---


# Маскировка данных в ClickHouse

Маскировка данных — это техника, используемая для защиты данных, при которой оригинальные данные заменяются версией данных, которая сохраняет свой формат и структуру, в то время как любая личная информация (PII) или конфиденциальная информация удаляется.

Эта инструкция показывает, как можно выполнить маскировку данных в ClickHouse.

## Используйте функции замены строк {#using-string-functions}

Для базовых случаев маскировки данных семейство функций `replace` предлагает удобный способ маскировки данных:

| Функция                                                                                 | Описание                                                                                                                                             |
|------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| [`replaceOne`](/sql-reference/functions/string-replace-functions#replaceone)             | Заменяет первое вхождение шаблона в строке на указанный строковый заменитель.                                                                       |
| [`replaceAll`](/sql-reference/functions/string-replace-functions#replaceall)             | Заменяет все вхождения шаблона в строке на указанный строковый заменитель.                                                                          |
| [`replaceRegexpOne`](/sql-reference/functions/string-replace-functions#replaceregexpone) | Заменяет первое вхождение подстроки, соответствующей шаблону регулярного выражения (в синтаксисе re2) в строке на указанный строковый заменитель.    |
| [`replaceRegexpAll`](/sql-reference/functions/string-replace-functions#replaceregexpall) | Заменяет все вхождения подстроки, соответствующей шаблону регулярного выражения (в синтаксисе re2) в строке на указанный строковый заменитель.     |

Например, вы можете заменить имя "John Smith" на заполнитель `[CUSTOMER_NAME]`, используя функцию `replaceOne`:

```sql title="Query"
SELECT replaceOne(
    'Customer John Smith called about his account',
    'John Smith',
    '[CUSTOMER_NAME]'
) AS anonymized_text;
```

```response title="Response"
┌─anonymized_text───────────────────────────────────┐
│ Customer [CUSTOMER_NAME] called about his account │
└───────────────────────────────────────────────────┘
```

Более общим образом вы можете использовать `replaceRegexpOne`, чтобы заменить любое имя клиента:

```sql title="Query"
SELECT 
    replaceRegexpAll(
        'Customer John Smith called. Later, Mary Johnson and Bob Wilson also called.',
        '\\b[A-Z][a-z]+ [A-Z][a-z]+\\b',
        '[CUSTOMER_NAME]'
    ) AS anonymized_text;
```

```response title="Response"
┌─anonymized_text───────────────────────────────────────────────────────────────────────┐
│ [CUSTOMER_NAME] Smith called. Later, [CUSTOMER_NAME] and [CUSTOMER_NAME] also called. │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

Или вы можете замаскировать номер социального страхования, оставив только последние 4 цифры, используя функцию `replaceRegexpAll`.

```sql title="Query"
SELECT replaceRegexpAll(
    'SSN: 123-45-6789',
    '(\d{3})-(\d{2})-(\d{4})',
    'XXX-XX-\3'
) AS masked_ssn;
```

В приведенном выше запросе `\3` используется для подстановки третьей группы захвата в результирующую строку, что приводит к:

```response title="Response"
┌─masked_ssn───────┐
│ SSN: XXX-XX-6789 │
└──────────────────┘
```

## Создание замаскированных `VIEW` {#masked-views}

[`VIEW`](/sql-reference/statements/create/view) может использоваться в сочетании с вышеперечисленными строковыми функциями для применения преобразований к колонкам, содержащим конфиденциальные данные, прежде чем они будут представлены пользователю. 
Таким образом, оригинальные данные остаются неизменными, а пользователи, запрашивающие представление, видят только замаскированные данные.

Чтобы продемонстрировать, представим, что у нас есть таблица, в которой хранится информация о заказах клиентов.
Мы хотим убедиться, что группа сотрудников может видеть информацию, но не хотим, чтобы они видели полную информацию о клиентах.

Запустите запрос ниже, чтобы создать пример таблицы `orders` и вставить в нее несколько вымышленных записей о заказах клиентов:

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

В `SELECT` части запроса на создание представления выше мы определяем преобразования, используя `replaceRegexpOne` по полям `name`, `email`, `phone` и `shipping_address`, которые содержат конфиденциальную информацию, которую мы хотим частично замаскировать.

Выберите данные из представления:

```sql title="Query"
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

Обратите внимание, что данные, возвращаемые из представления, частично замаскированы, скрывая конфиденциальную информацию.
Вы также можете создать несколько представлений с различными уровнями сокрытия в зависимости от уровня привилегированного доступа к информации у зрителя.

Чтобы гарантировать, что пользователи могут получить доступ только к представлению, возвращающему замаскированные данные, и не имеют доступ к таблице с оригинальными незамаскированными данными, вы должны использовать [Контроль доступа на основе ролей](/cloud/security/cloud-access-management/overview), чтобы обеспечить наличие у конкретных ролей только прав выбора из представления.

Сначала создайте роль:

```sql
CREATE ROLE masked_orders_viewer;
```

Затем предоставьте роль `SELECT` привилегии на представление:

```sql
GRANT SELECT ON masked_orders TO masked_orders_viewer;
```

Поскольку роли ClickHouse являются аддитивными, вы должны убедиться, что пользователи, которые должны видеть только замаскированное представление, не имеют никаких `SELECT` привилегий на базовую таблицу через любую роль.

Таким образом, вы должны явно отозвать доступ к базовой таблице, чтобы быть в безопасности:

```sql
REVOKE SELECT ON orders FROM masked_orders_viewer;
```

Наконец, назначьте роль соответствующим пользователям:

```sql
GRANT masked_orders_viewer TO your_user;
```

Это гарантирует, что пользователи с ролью `masked_orders_viewer` смогут видеть только замаскированные данные из представления, а не оригинальные незамаскированные данные из таблицы.

## Использование `MATERIALIZED` колонок и ограничений доступа на уровне колонок {#materialized-ephemeral-column-restrictions}

В случаях, когда вы не хотите создавать отдельное представление, вы можете хранить замаскированные версии ваших данных вместе с оригинальными данными.
Для этого вы можете использовать [материализованные колонки](/sql-reference/statements/create/table#materialized).
Значения таких колонок автоматически вычисляются в соответствии с заданным материализованным выражением при вставке строк,
и мы можем использовать их для создания новых колонок с замаскированными версиями данных.

Принимая тот же пример, вместо создания отдельного `VIEW` для замаскированных данных, мы создадим замаскированные колонки, используя `MATERIALIZED`:

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

Если вы теперь выполните следующий запрос `SELECT`, вы увидите, что замаскированные данные "материализуются" в момент вставки и хранятся вместе с оригинальными, не замаскированными данными.
Необходимо явно выбирать замаскированные колонки, поскольку ClickHouse по умолчанию не включает материализованные колонки в запросы `SELECT *`.

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
   ┌─user_id─┬─name──────────┬─email─────────────────────┬─phone────────┬─total_amount─┬─order_date─┬─shipping_address───────────────────┬─name_masked──┬─email_masked───────┬─phone_masked─┬─shipping_address_masked────┐
1. │    1001 │ John Smith    │ john.smith@gmail.com      │ 555-123-4567 │       299.99 │ 2024-01-15 │ 123 Main St, New York, NY 10001    │ John ****    │ jo****@gmail.com   │ 555-***-4567 │ **** New York, NY 10001    │
2. │    1002 │ Sarah Johnson │ sarah.johnson@outlook.com │ 555-987-6543 │        149.5 │ 2024-01-16 │ 456 Oak Ave, Los Angeles, CA 90210 │ Sarah ****   │ sa****@outlook.com │ 555-***-6543 │ **** Los Angeles, CA 90210 │
3. │    1003 │ Michael Brown │ mbrown@company.com        │ 555-456-7890 │          599 │ 2024-01-17 │ 789 Pine Rd, Chicago, IL 60601     │ Michael **** │ mb****@company.com │ 555-***-7890 │ **** Chicago, IL 60601     │
4. │    1004 │ Emily Rogers  │ emily.rogers@yahoo.com    │ 555-321-0987 │        89.99 │ 2024-01-18 │ 321 Elm St, Houston, TX 77001      │ Emily ****   │ em****@yahoo.com   │ 555-***-0987 │ **** Houston, TX 77001     │
5. │    1005 │ David Wilson  │ dwilson@email.net         │ 555-654-3210 │       449.75 │ 2024-01-19 │ 654 Cedar Blvd, Phoenix, AZ 85001  │ David ****   │ dw****@email.net   │ 555-***-3210 │ **** Phoenix, AZ 85001     │
   └─────────┴───────────────┴───────────────────────────┴──────────────┴──────────────┴────────────┴────────────────────────────────────┴──────────────┴────────────────────┴──────────────┴────────────────────────────┘
```

Чтобы гарантировать, что пользователи могут получить доступ только к колонкам, содержащим замаскированные данные, вы снова можете использовать [Контроль доступа на основе ролей](/cloud/security/cloud-access-management/overview), чтобы обеспечить наличие у конкретных ролей только прав выбора на замаскированные колонки из `orders`.

Воссоздайте роль, которую мы создали ранее:

```sql
DROP ROLE IF EXISTS masked_order_viewer;
CREATE ROLE masked_order_viewer;
```

Затем предоставьте разрешение `SELECT` на таблицу `orders`:

```sql
GRANT SELECT ON orders TO masked_data_reader;
```

Отозвите доступ к любым конфиденциальным колонкам:

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

В случае, если вы хотите хранить только замаскированные данные в таблице `orders`,
вы можете пометить конфиденциальные незамаскированные колонки как [`EPHEMERAL`](/sql-reference/statements/create/table#ephemeral),
что гарантирует, что колонки этого типа не хранятся в таблице.

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

Если мы запустим тот же запрос, что и раньше, вы теперь увидите, что в таблицу были вставлены только материализованные замаскированные данные:

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

## Используйте правила маскировки запросов для данных журналов {#use-query-masking-rules}

Для пользователей ClickHouse OSS, желающих замаскировать данные журналов, вы можете использовать [правила маскировки запросов](/operations/server-configuration-parameters/settings#query_masking_rules) (маскировка логов) для маскировки данных.

Для этого вы можете определить правила маскировки на основе регулярных выражений в конфигурации сервера.
Эти правила применяются к запросам и всем сообщениям журнала перед их сохранением в журналах сервера или системных таблицах (таких как `system.query_log`, `system.text_log` и `system.processes`).

Это помогает предотвратить утечку конфиденциальных данных только в **журналы**.
Обратите внимание, что это не маскирует данные в результатах запросов.

Например, чтобы замаскировать номер социального страхования, вы можете добавить следующее правило в вашу [конфигурацию сервера](/operations/configuration-files):

```yaml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```
