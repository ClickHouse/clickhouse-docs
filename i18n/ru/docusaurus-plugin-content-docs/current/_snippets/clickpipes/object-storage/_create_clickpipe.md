import Image from '@theme/IdealImage';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';

import S3DataSource from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/amazon-s3/_1-data-source.md';
import GCSSDataSource from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/google-cloud-storage/_1-data-source.md';
import ABSDataSource from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/azure-blob-storage/_1-data-source.md';

<VerticalStepper type="numbered" headerLevel="h2">

## Выберите источник данных {#1-select-the-data-source}

**1.** В ClickHouse Cloud в главном меню навигации выберите **Data sources** и нажмите **Create ClickPipe**.

    <Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}
{props.provider === 'abs' && <ABSDataSource />}

## Настройте подключение ClickPipe {#2-setup-your-clickpipe-connection}

**1.** Чтобы настроить новый ClickPipe, необходимо указать параметры подключения и аутентификации к вашему сервису объектного хранилища.

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}
{props.provider === 'abs' && <ABSDataSource />}

**2.** Нажмите **Incoming data**. ClickPipes получит метаданные из вашего бакета для следующего шага.

## Выберите формат данных {#3-select-data-format}

В интерфейсе будет показан список файлов в указанном бакете.
Выберите формат данных (в настоящее время поддерживается подмножество форматов ClickHouse) и укажите, хотите ли вы включить непрерывную ингестию.
См. раздел «continuous ingest» на обзорной странице для получения дополнительной информации.

<Image img={cp_step3_object_storage} alt="Задать формат данных и топик" size="lg" border/>

## Настройте таблицу, схему и параметры {#5-configure-table-schema-settings}

На следующем шаге вы можете выбрать, хотите ли вы выполнять приём данных в новую таблицу ClickHouse или использовать существующую.
Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и параметры.
Вы можете видеть предварительный просмотр изменений в реальном времени в примерной таблице в верхней части экрана.

<Image img={cp_step4a} alt="Задать таблицу, схему и параметры" size="lg" border/>

Вы также можете настроить расширенные параметры с помощью предоставленных элементов управления.

<Image img={cp_step4a3} alt="Настройка расширенных элементов управления" size="lg" border/>

Кроме того, вы можете настроить приём данных в существующую таблицу ClickHouse.
В этом случае интерфейс позволит сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использовать существующую таблицу" size="lg" border/>

:::info
Вы также можете сопоставлять [виртуальные столбцы](/sql-reference/table-functions/s3#virtual-columns), такие как `_path` или `_size`, с полями.
:::

## Настройте права доступа {#6-configure-permissions}

Наконец, вы можете настроить права доступа для внутреннего пользователя ClickPipes.

**Permissions:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя настраиваемую роль или одну из предопределённых ролей:
- `Full access`: с полным доступом к кластеру. Требуется, если вы используете materialized view или словарь с целевой таблицей.
- `Only destination table`: с правами `INSERT` только в целевую таблицу.

<Image img={cp_step5} alt="Права доступа" size="lg" border/>

## Завершите настройку {#7-complete-setup}

Нажав «Complete Setup», система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном завершении" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

Сводная таблица предоставляет элементы управления для отображения примеров данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр целевой таблицы" size="lg" border/>

А также элементы управления для удаления ClickPipe и отображения сводной информации о задании по приёму данных.

<Image img={cp_overview} alt="Просмотр обзора" size="lg" border/>

**Поздравляем!** Вы успешно настроили свой первый ClickPipe.
Если это ClickPipe, настроенный для непрерывной ингестии, он будет постоянно работать, выполняя приём данных в реальном времени из вашего удалённого источника данных.
В противном случае будет выполнена пакетная ингестия, после чего работа завершится.

</VerticalStepper>