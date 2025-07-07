---
sidebar_label: 'ClickPipes для объектного хранилища'
description: 'Бесшовное подключение вашего объектного хранилища к ClickHouse Cloud.'
slug: /integrations/clickpipes/object-storage
title: 'Интеграция объектного хранилища с ClickHouse Cloud'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';


# Интеграция объектного хранилища с ClickHouse Cloud
ClickPipes для объектного хранилища обеспечивают простой и надежный способ приема данных из Amazon S3, Google Cloud Storage и DigitalOcean Spaces в ClickHouse Cloud. Поддерживается как одноразовый, так и непрерывный прием данных с семантикой Exactly-Once.


## Предварительные условия {#prerequisite}
Вы ознакомились с [введением в ClickPipes](./index.md).

## Создание вашего первого ClickPipe {#creating-your-first-clickpipe}

1. В облачной консоли выберите кнопку `Data Sources` в левом меню и нажмите "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

2. Выберите источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

3. Заполните форму, предоставив вашему ClickPipe имя, описание (по желанию), вашу IAM роль или учетные данные и URL ведра. Вы можете указать несколько файлов, используя шаблоны, похожие на bash. Для получения дополнительной информации [см. документацию по использованию шаблонов в пути](#limitations).

<Image img={cp_step2_object_storage} alt="Заполнение данных для подключения" size="lg" border/>

4. Интерфейс отобразит список файлов в указанном ведре. Выберите формат данных (в настоящее время мы поддерживаем подсет форматов ClickHouse) и, если вы хотите включить непрерывный прием [Подробнее ниже](#continuous-ingest).

<Image img={cp_step3_object_storage} alt="Задание формата данных и темы" size="lg" border/>

5. На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя таблицы, схему и настройки. Вы можете увидеть в реальном времени предварительный просмотр ваших изменений в образце таблицы вверху.

<Image img={cp_step4a} alt="Задание таблицы, схемы и настроек" size="lg" border/>

  Вы также можете настроить расширенные параметры, используя предоставленные элементы управления.

<Image img={cp_step4a3} alt="Настройка расширенных контролов" size="lg" border/>

6. В качестве альтернативы вы можете решить загружать данные в существующую таблицу ClickHouse. В этом случае интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использование существующей таблицы" size="lg" border/>

:::info
Вы также можете сопоставить [виртуальные колонки](../../sql-reference/table-functions/s3#virtual-columns), такие как `_path` или `_size`, с полями.
:::

7. Наконец, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст отдельного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
    - `Full access`: с полными правами доступа к кластеру. Требуется, если вы используете материализованное представление или словарь с целевой таблицей.
    - `Only destination table`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Разрешения" size="lg" border/>

8. Нажав "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успехе" size="sm" border/>

<Image img={cp_remove} alt="Уведомление об удалении" size="lg" border/>

  Сводная таблица предоставляет элементы управления для отображения образца данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр цели" size="lg" border/>

  А также элементы управления для удаления ClickPipe и отображения свода работы по приему данных.

<Image img={cp_overview} alt="Просмотр сводки" size="lg" border/>

9. **Поздравляем!** вы успешно настроили ваш первый ClickPipe. Если это потоковый ClickPipe, он будет работать непрерывно, принимая данные в реальном времени из вашего удаленного источника данных. В противном случае он обработает пакет и завершится.

## Поддерживаемые источники данных {#supported-data-sources}

| Название              | Логотип | Тип           | Статус          | Описание                                                                                           |
|----------------------|---------|---------------|-----------------|----------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>|Объектное хранилище| Стабильно       | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                    |
| Google Cloud Storage |<Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>|Объектное хранилище| Стабильно       | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                    |
| DigitalOcean Spaces  | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильно | Настройте ClickPipes для приема больших объемов данных из объектного хранилища.                     |

Ближайшие соединители будут добавлены в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Семантика Exactly-Once {#exactly-once-semantics}

При приеме больших наборов данных могут возникать различные типы ошибок, что может привести к частичным вставкам или дублированию данных. ClickPipes для объектного хранилища устойчивы к сбоям при вставке и обеспечивают семантику Exactly-Once. Это достигается за счет использования временных "промежуточных" таблиц. Данные сначала вставляются в промежуточные таблицы. Если что-то пойдет не так с этой вставкой, промежуточная таблица может быть усечена, и вставка может быть повторена с чистого состояния. Только когда вставка завершится и будет успешной, разделы в промежуточной таблице перемещаются в целевую таблицу. Чтобы узнать больше об этой стратегии, ознакомьтесь с [этим постом в блоге](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### Поддержка представлений {#view-support}
Материализованные представления на целевой таблице также поддерживаются. ClickPipes создадут промежуточные таблицы не только для целевой таблицы, но и для любых зависимых материализованных представлений.

Мы не создаем промежуточные таблицы для нематериализованных представлений. Это означает, что если у вас есть целевая таблица с одним или несколькими нижестоящими материализованными представлениями, такие материализованные представления следует избегать выбора данных через представление из целевой таблицы. В противном случае у вас могут отсутствовать данные в материализованном представлении.

## Масштабирование {#scaling}

ClickPipes для объектного хранилища масштабируются в зависимости от минимального размера сервиса ClickHouse, определенного [сконфигурированными настройками вертикального автмасштабирования](/manage/scaling#configuring-vertical-auto-scaling). Размер ClickPipe определяется при создании трубопровода. Последующие изменения в настройках сервиса ClickHouse не повлияют на размер ClickPipe.

Чтобы увеличить пропускную способность при больших заданиях по приемке, мы рекомендуем масштабировать сервис ClickHouse перед созданием ClickPipe.

## Ограничения {#limitations}
- Любые изменения в целевой таблице, ее материализованных представлениях (включая каскадные материализованные представления) или целевых таблицах материализованных представлений не будут автоматически подхвачены трубопроводом и могут привести к ошибкам. Вы должны остановить трубопровод, внести необходимые изменения, а затем перезапустить трубопровод, чтобы изменения были учтены и чтобы избежать ошибок и дублирования данных из-за повторов.
- Существуют ограничения на типы представлений, которые поддерживаются. Пожалуйста, прочитайте раздел о [семантике Exactly-Once](#exactly-once-semantics) и [поддержке представлений](#view-support) для получения дополнительной информации.
- Аутентификация на основе ролей недоступна для ClickPipes S3 для экземпляров ClickHouse Cloud, развернутых в GCP или Azure. Она поддерживается только для экземпляров ClickHouse Cloud на AWS.
- ClickPipes будут пытаться загружать только объекты размером 10 ГБ или меньше. Если файл больше 10 ГБ, в специальную таблицу ошибок ClickPipes будет добавлено сообщение об ошибке.
- ClickPipes S3 / GCS **не** разделяют синтаксис перечислений с [табличной функцией S3](/sql-reference/table-functions/s3).
  - `?` — Замещает любой одиночный символ
  - `*` — Замещает любое количество любых символов, включая пустую строку
  - `**` — Замещает любое количество любых символов, включая пустую строку

:::note
Это действительный путь:

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz


Это недействительный путь. `{N..M}` не поддерживаются в ClickPipes.

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## Непрерывный прием {#continuous-ingest}
ClickPipes поддерживают непрерывный прием данных из S3, GCS и DigitalOcean Spaces. Когда эта функция включена, ClickPipes будет непрерывно принимать данные из указанного пути, он будет проверять новые файлы с частотой раз в 30 секунд. Однако новые файлы должны иметь лексически большее значение, чем последний загруженный файл, что означает, что они должны иметь имена, определяющие порядок приема. Например, файлы с именами `file1`, `file2`, `file3` и т.д. будут загружаться последовательно. Если добавляется новый файл с именем `file0`, ClickPipes не загрузит его, поскольку он не лексически больше последнего загруженного файла.

## Архивная таблица {#archive-table}
ClickPipes создаст таблицу рядом с вашей целевой таблицей с суффиксом `s3_clickpipe_<clickpipe_id>_archive`. Эта таблица будет содержать список всех файлов, которые были загружены с помощью ClickPipe. Эта таблица используется для отслеживания файлов во время загрузки и может быть использована для проверки, что файлы были загружены. Архивная таблица имеет [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) в 7 дней.

:::note
Эти таблицы не будут видны в SQL-консоли ClickHouse Cloud, вам нужно будет подключиться через внешний клиент, используя HTTPS или нативное подключение, чтобы их прочитать.
:::

## Аутентификация {#authentication}

### S3 {#s3}
Вы можете получить доступ к открытым ведрам без настройки, а для защищенных ведер вы можете использовать [IAM учетные данные](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) или [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).
Чтобы использовать IAM роль, вам необходимо создать IAM роль, как указано [в этом руководстве](/cloud/security/secure-s3). Скопируйте новый IAM ARN после создания и вставьте его в конфигурацию ClickPipe как "IAM ARN роль".

### GCS {#gcs}
Как и S3, вы можете получить доступ к открытым ведрам без настройки, а для защищенных ведер вы можете использовать [HMAC ключи](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) вместо AWS IAM учетных данных. Вы можете ознакомиться с этим руководством от Google Cloud о [том, как настроить такие ключи](https://cloud.google.com/storage/docs/authentication/hmackeys).

Служебные учетные записи для GCS не поддерживаются напрямую. При аутентификации с использованием непубличных ведер должны использоваться HMAC (IAM) учетные данные.
Разрешения служебной учетной записи, связанные с HMAC учетными данными, должны включать `storage.objects.list` и `storage.objects.get`.

### DigitalOcean Spaces {#dospaces}
В настоящее время поддерживаются только защищенные ведра для пространства DigitalOcean. Вам потребуется "Ключ доступа" и "Секретный ключ" для доступа к ведру и его файлам. Вы можете прочитать [это руководство](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) о том, как создать ключи доступа.


## Вопросы и ответы {#faq}

- **Поддерживают ли ClickPipes ведра GCS с префиксом `gs://`?**

Нет. По причинам совместимости мы просим вас заменить префикс вашего ведра `gs://` на `https://storage.googleapis.com/`.

- **Какие разрешения требуются для публичного ведра GCS?**

`allUsers` требует соответствующего назначения роли. Роль `roles/storage.objectViewer` должна быть предоставлена на уровне ведра. Эта роль предоставляет разрешение `storage.objects.list`, что позволяет ClickPipes перечислять все объекты в ведре, что необходимо для онбординга и приема данных. Эта роль также включает разрешение `storage.objects.get`, которое необходимо для чтения или загрузки отдельных объектов в ведре. См.: [Контроль доступа Google Cloud](https://cloud.google.com/storage/docs/access-control/iam-roles) для получения дополнительной информации.
