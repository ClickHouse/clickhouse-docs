---
slug: '/integrations/clickpipes/object-storage'
sidebar_label: 'ClickPipes для объектного хранилища'
description: 'Бесшовно подключите ваше OBJECT STORAGE к ClickHouse Cloud.'
title: 'Интеграция объектного хранилища с ClickHouse Cloud'
doc_type: guide
---
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
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
Объектные хранилища ClickPipes предоставляют простой и надежный способ приема данных из Amazon S3, Google Cloud Storage, Azure Blob Storage и DigitalOcean Spaces в ClickHouse Cloud. Поддерживается как однократный, так и непрерывный прием данных с семантикой exactly-once.

## Требования {#prerequisite}
Вы ознакомились с [введением в ClickPipes](./index.md).

## Создание вашего первого ClickPipe {#creating-your-first-clickpipe}

1. В облачной консоли выберите кнопку `Data Sources` в меню слева и нажмите "Настроить ClickPipe".

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

2. Выберите ваш источник данных.

<Image img={cp_step1} alt="Выбор типа источника данных" size="lg" border/>

3. Заполните форму, указав имя вашего ClickPipe, описание (по желанию), вашу IAM роль или учетные данные, а также URL корзины. Вы можете указать несколько файлов, используя шаблоны, похожие на bash. Дополнительную информацию смотрите в документации по использованию шаблонов в пути [see the documentation on using wildcards in path](#limitations).

<Image img={cp_step2_object_storage} alt="Заполнение данных подключения" size="lg" border/>

4. Пользовательский интерфейс отобразит список файлов в указанной корзине. Выберите ваш формат данных (в настоящее время мы поддерживаем подмножество форматов ClickHouse) и определите, хотите ли вы включить непрерывный прием данных. [Более подробная информация ниже](#continuous-ingest).

<Image img={cp_step3_object_storage} alt="Установка формата данных и темы" size="lg" border/>

5. На следующем шаге вы можете выбрать, хотите ли вы загружать данные в новую таблицу ClickHouse или повторно использовать существующую. Следуйте инструкциям на экране, чтобы изменить имя вашей таблицы, схему и настройки. Вы сможете увидеть предварительный просмотр ваших изменений в образце таблицы вверху.

<Image img={cp_step4a} alt="Установка таблицы, схемы и настроек" size="lg" border/>

  Вы также можете настроить расширенные параметры, используя предоставленные инструменты.

<Image img={cp_step4a3} alt="Установка расширенных параметров" size="lg" border/>

6. В качестве альтернативы вы можете решить загрузить данные в существующую таблицу ClickHouse. В этом случае пользовательский интерфейс позволит вам сопоставить поля из источника с полями ClickHouse в выбранной целевой таблице.

<Image img={cp_step4b} alt="Использовать существующую таблицу" size="lg" border/>

:::info
Вы также можете сопоставить [виртуальные колонки](../../sql-reference/table-functions/s3#virtual-columns), такие как `_path` или `_size`, с полями.
:::

7. В конце концов, вы можете настроить разрешения для внутреннего пользователя ClickPipes.

  **Разрешения:** ClickPipes создаст специализированного пользователя для записи данных в целевую таблицу. Вы можете выбрать роль для этого внутреннего пользователя, используя пользовательскую роль или одну из предопределенных ролей:
    - `Полный доступ`: с полным доступом к кластеру. Это необходимо, если вы используете материализованное представление или словарь с целевой таблицей.
    - `Только целевая таблица`: с правами `INSERT` только для целевой таблицы.

<Image img={cp_step5} alt="Разрешения" size="lg" border/>

8. Нажав "Завершить настройку", система зарегистрирует ваш ClickPipe, и вы сможете увидеть его в сводной таблице.

<Image img={cp_success} alt="Уведомление об успешном завершении" size="sm" border/>

<Image img={cp_remove} alt="Уведомление о удалении" size="lg" border/>

  Сводная таблица предоставляет инструменты для отображения образцов данных из источника или целевой таблицы в ClickHouse.

<Image img={cp_destination} alt="Просмотр назначения" size="lg" border/>

  А также инструменты для удаления ClickPipe и отображения сводки задания на загрузку данных.

<Image img={cp_overview} alt="Просмотр сводки" size="lg" border/>

9. **Поздравляем!** Вы успешно настроили ваш первый ClickPipe. Если это ClickPipe для потоковой передачи, он будет работать непрерывно, загружая данные в реальном времени из вашего удаленного источника данных. В противном случае он загрузит пакет и завершит работу.

## Поддерживаемые источники данных {#supported-data-sources}

| Название             | Логотип | Тип              | Статус   | Описание                                                                                           |
|----------------------|---------|------------------|----------|----------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>|Объектное хранилище| Стабильный | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                 |
| Google Cloud Storage |<Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>|Объектное хранилище| Стабильный | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                 |
| DigitalOcean Spaces  | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильный | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.               |
| Azure Blob Storage   | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильный | Настройте ClickPipes для загрузки больших объемов данных из объектного хранилища.                |

Больше коннекторов будет добавлено в ClickPipes, вы можете узнать больше, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).

## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы:
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Семантика exactly-once {#exactly-once-semantics}

Во время загрузки больших наборов данных могут возникать различные типы ошибок, которые могут привести к частичной вставке или дублированию данных. Объектные хранилища ClickPipes устойчивы к сбоям вставки и обеспечивают семантику exactly-once. Это достигается путем использования временных "промежуточных" таблиц. Данные сначала вставляются в промежуточные таблицы. Если во время этой вставки что-то идет не так, промежуточную таблицу можно обрезать, и вставка может быть повторена из чистого состояния. Только когда вставка завершена и успешна, разделы в промежуточной таблице перемещаются в целевую таблицу. Чтобы узнать больше об этой стратегии, ознакомьтесь с [этим блогом](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### Поддержка представлений {#view-support}
Поддерживаются материализованные представления в целевой таблице. ClickPipes создаст промежуточные таблицы не только для целевой таблицы, но и для любых зависимых материализованных представлений.

Мы не создаем промежуточные таблицы для нематериализованных представлений. Это означает, что если у вас есть целевая таблица с одним или несколькими нижестоящими материализованными представлениями, эти материализованные представления должны избегать выбора данных через представление из целевой таблицы. В противном случае вы можете обнаружить, что в материализованном представлении отсутствуют данные.

## Масштабирование {#scaling}

Объектные хранилища ClickPipes масштабируются в зависимости от минимального размера службы ClickHouse, определенного [настроенными параметрами вертикального авто-масштабирования](/manage/scaling#configuring-vertical-auto-scaling). Размер ClickPipe определяется при его создании. Последующие изменения в настройках службы ClickHouse не повлияют на размер ClickPipe.

Для увеличения пропускной способности при больших заданиях по загрузке данных мы рекомендуем масштабировать службу ClickHouse перед созданием ClickPipe.

## Ограничения {#limitations}
- Любые изменения в целевой таблице, ее материализованных представлениях (включая каскадные материализованные представления) или целевых таблицах материализованных представлений могут привести к временным ошибкам, которые будут повторены. Для достижения наилучших результатов мы рекомендуем остановить канал, внести необходимые изменения и потом снова запустить канал, чтобы изменения были учтены и избежать ошибок.
- Существуют ограничения на типы представлений, которые поддерживаются. Пожалуйста, прочтите раздел о [семантике exactly-once](#exactly-once-semantics) и [поддержке представлений](#view-support) для получения дополнительной информации.
- Аутентификация по ролям недоступна для S3 ClickPipes для развертываний ClickHouse Cloud в GCP или Azure. Она поддерживается только для развертываний ClickHouse Cloud на AWS.
- ClickPipes будет пытаться загружать только объекты размером 10 ГБ или меньше. Если файл больше 10 ГБ, ошибка будет добавлена в таблицу ошибок ClickPipes.
- Каналы Azure Blob Storage с непрерывным приемом на контейнерах с более чем 100k файлами будут иметь задержку около 10–15 секунд в обнаружении новых файлов. Задержка увеличивается с количеством файлов.
- Объектные хранилища ClickPipes **не** используют один и тот же синтаксис перечисления, что [S3 Table Function](/sql-reference/table-functions/s3), или Azure с [AzureBlobStorage Table function](/sql-reference/table-functions/azureBlobStorage).
  - `?` — Замещает любой одиночный символ
  - `*` — Замещает любое количество любых символов, за исключением / включая пустую строку
  - `**` — Замещает любое количество любого символа включая / включая пустую строку

:::note
Это действительный путь (для S3):

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

Это недействительный путь. `{N..M}` не поддерживаются в ClickPipes.

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## Непрерывный прием {#continuous-ingest}
ClickPipes поддерживает непрерывный прием данных из S3, GCS, Azure Blob Storage и DigitalOcean Spaces. При включении ClickPipes непрерывно загружает данные из указанного пути и опрашивает новые файлы с частотой раз в 30 секунд. Однако новые файлы должны быть лексически больше последнего загруженного файла. Это означает, что они должны быть названы так, чтобы определить порядок загрузки. Например, файлы с названиями `file1`, `file2`, `file3` и т. д. будут загружены последовательным образом. Если новый файл добавляется с именем, например, `file0`, ClickPipes не загрузит его, потому что он не лексически больше последнего загруженного файла.

## Архивная таблица {#archive-table}
ClickPipes создаст таблицу рядом с вашей целевой таблицей с постфиксом `s3_clickpipe_<clickpipe_id>_archive`. Эта таблица будет содержать список всех файлов, которые были загружены ClickPipe. Эта таблица используется для отслеживания файлов во время загрузки и может быть использована для проверки загрузки файлов. Архивная таблица имеет [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 7 дней.

:::note
Эти таблицы не будут видны с помощью консоли SQL ClickHouse Cloud, вам необходимо подключиться через внешний клиент, используя HTTPS или Нативное подключение, чтобы прочитать их.
:::

## Аутентификация {#authentication}

### S3 {#s3}
Поддерживаются как публичные, так и защищенные корзины S3.

Публичные корзины должны разрешать как действия `s3:GetObject`, так и `s3:ListBucket` в своей политике.

Защищенные корзины можно получить, используя либо [учетные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html), либо [IAM роль](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).
Чтобы использовать IAM роль, вам необходимо создать IAM роль в соответствии с [этим руководством](/cloud/security/secure-s3). После создания скопируйте новый ARN роли IAM и вставьте его в конфигурацию ClickPipe как "IAM ARN роль".

### GCS {#gcs}
Как и в S3, вы можете получить доступ к общим корзинам без конфигурации, а для защищенных корзин можно использовать [HMAC Keys](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) вместо учетных данных AWS IAM. Вы можете прочитать это руководство от Google Cloud о [том, как настроить такие ключи](https://cloud.google.com/storage/docs/authentication/hmackeys).

Служебные аккаунты для GCS не поддерживаются напрямую. Для аутентификации с не публичными корзинами необходимо использовать HMAC (IAM) учетные данные.
Разрешения службы аккаунта, прикрепленные к HMAC учетным данным, должны быть `storage.objects.list` и `storage.objects.get`.

### DigitalOcean Spaces {#dospaces}
В настоящее время поддерживаются только защищенные корзины для DigitalOcean Spaces. Для доступа к корзине и ее файлам вам требуются "Ключ доступа" и "Секретный ключ". Вы можете прочитать [это руководство](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) о том, как создать ключи доступа.

### Azure Blob Storage {#azureblobstorage}
В настоящее время поддерживаются только защищенные корзины для Azure Blob Storage. Аутентификация осуществляется через строку подключения, которая поддерживает ключи доступа и общие ключи. Для получения дополнительной информации прочитайте [это руководство](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string).

## Часто задаваемые вопросы {#faq}

- **Поддерживает ли ClickPipes корзины GCS с префиксом `gs://`?**

Нет. По причинам совместимости мы просим вас заменить префикс `gs://` вашей корзины на `https://storage.googleapis.com/`.

- **Какие разрешения требуются для публичной корзины GCS?**

`allUsers` требует соответствующего назначения ролей. Роль `roles/storage.objectViewer` должна быть предоставлена на уровне корзины. Эта роль предоставляет разрешение `storage.objects.list`, которое позволяет ClickPipes перечислять все объекты в корзине, что необходимо для загрузки и приема. Эта роль также включает разрешение `storage.objects.get`, которое необходимо для чтения или загрузки отдельных объектов в корзине. См. [Контроль доступа Google Cloud](https://cloud.google.com/storage/docs/access-control/iam-roles) для получения дополнительной информации.