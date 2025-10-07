---
'sidebar_label': 'Передача данных из MongoDB в ClickHouse'
'description': 'Описание того, как бесшовно подключить ваш MongoDB к ClickHouse Cloud.'
'slug': '/integrations/clickpipes/mongodb'
'title': 'Передача данных из MongoDB в ClickHouse (с использованием CDC)'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# Импорт данных из MongoDB в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
Импорт данных из MongoDB в ClickHouse Cloud через ClickPipes находится на стадии публичного бета-тестирования.
:::

:::note
В консоли ClickHouse Cloud и документации термины "таблица" и "коллекция" используются взаимозаменяемо для MongoDB.
:::

Вы можете использовать ClickPipes для импорта данных из вашей базы данных MongoDB в ClickHouse Cloud. Исходная база данных MongoDB может быть развернута локально или в облаке, используя такие сервисы, как MongoDB Atlas.

## Предварительные условия {#prerequisites}

Для начала вам необходимо убедиться, что ваша база данных MongoDB правильно настроена для репликации. Шаги конфигурации зависят от того, как вы развертываете MongoDB, поэтому, пожалуйста, следуйте соответствующему руководству ниже:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Общий MongoDB](./mongodb/source/generic)

После настройки вашей исходной базы данных MongoDB вы можете продолжить создание вашего ClickPipe.

## Создайте ваш ClickPipe {#create-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет аккаунта, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Источники данных` в левом меню и нажмите "Настроить ClickPipe".

<Image img={cp_step0} alt="Выберите импорт" size="lg" border/>

3. Выберите плитку `MongoDB CDC`.

<Image img={mongodb_tile} alt="Выберите MongoDB" size="lg" border/>

### Добавьте подключение к вашей исходной базе данных MongoDB {#add-your-source-mongodb-database-connection}

4. Заполните данные подключения для вашей исходной базы данных MongoDB, которую вы настроили на этапе предварительных условий.

   :::info
   Прежде чем добавлять детали подключения, убедитесь, что вы включили IP-адреса ClickPipes в правилах вашего файервола. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам настройки исходной MongoDB, связанным в [начале этой страницы](#prerequisites).
   :::

   <Image img={mongodb_connection_details} alt="Заполните данные подключения" size="lg" border/>

Как только данные подключения заполнены, нажмите `Далее`.

#### Настройте расширенные параметры {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Интервал синхронизации**: Это интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на сервис ClickHouse, поэтому для пользователей, озабоченных затратами, мы рекомендуем устанавливать это значение выше (более `3600`).
- **Размер пакета извлечения**: Количество строк, которые будут извлечены за один раз. Это настройка, основанная на лучших усилиях, и может не соблюдаться во всех случаях.
- **Количество таблиц, извлекаемых параллельно**: Это количество таблиц, которые будут извлекаться параллельно во время начального снимка. Это полезно, когда у вас большое количество таблиц, и вы хотите контролировать количество извлекаемых таблиц параллельно.

### Настройте таблицы {#configure-the-tables}

5. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image img={select_destination_db} alt="Выберите целевую базу данных" size="lg" border/>

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MongoDB. При выборе таблиц вы также можете переименовать их в целевой базе данных ClickHouse.

### Проверьте права доступа и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Выберите роль "Полный доступ" из выпадающего списка прав доступа и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверьте права доступа" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы настроили ваш ClickPipe для репликации данных из MongoDB в ClickHouse Cloud, вы можете сосредоточиться на том, как запрашивать и моделировать ваши данные для оптимальной производительности.

## Замечания {#caveats}

Вот несколько замечаний, которые стоит учитывать при использовании этого коннектора:

- Мы требуем версию MongoDB 5.1.0 или выше.
- Мы используем нативное API Change Streams MongoDB для CDC, которое основано на oplog MongoDB для захвата изменений в реальном времени. 
- Документы из MongoDB по умолчанию реплицируются в ClickHouse в виде типа JSON. Это позволяет гибко управлять схемой и использовать богатый набор операторов JSON в ClickHouse для запросов и аналитики. Вы можете узнать больше о запросах к JSON данным [здесь](https://clickhouse.com/docs/sql-reference/data-types/newjson).
- Конфигурация PrivateLink с самообслуживанием в настоящее время недоступна. Если вы находитесь на AWS и нуждаетесь в PrivateLink, пожалуйста, свяжитесь с db-integrations-support@clickhouse.com или создайте тикет в поддержку — мы поможем вам с его включением.
