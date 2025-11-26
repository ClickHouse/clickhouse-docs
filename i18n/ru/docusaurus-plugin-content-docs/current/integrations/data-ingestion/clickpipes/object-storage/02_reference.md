---
sidebar_label: 'Справочник'
description: 'Описание поддерживаемых форматов, семантики exactly-once, поддержки представлений, масштабирования, ограничений и аутентификации ClickPipes при работе с объектным хранилищем'
slug: /integrations/clickpipes/object-storage/reference
sidebar_position: 1
title: 'Справочник'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'объектное хранилище', 's3', 'ингестия данных', 'пакетная загрузка']
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';


## Поддерживаемые источники данных {#supported-data-sources}

| Название             |Логотип|Тип| Статус          | Описание                                                                                              |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Логотип Amazon S3" style={{width: '3rem', height: 'auto'}}/>|Объектное хранилище| Стабильный          | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                            |
| Google Cloud Storage |<Gcssvg class="image" alt="Логотип Google Cloud Storage" style={{width: '3rem', height: 'auto'}}/>|Объектное хранилище| Стабильный          | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.                            |
| DigitalOcean Spaces | <DOsvg class="image" alt="Логотип Digital Ocean" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильный | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.
| Azure Blob Storage | <ABSsvg class="image" alt="Логотип Azure Blob Storage" style={{width: '3rem', height: 'auto'}}/> | Объектное хранилище | Стабильный | Настройте ClickPipes для приёма больших объёмов данных из объектного хранилища.

В ClickPipes будут появляться новые коннекторы. Подробнее можно узнать, [связавшись с нами](https://clickhouse.com/company/contact?loc=clickpipes).



## Поддерживаемые форматы данных {#supported-data-formats}

Поддерживаемые форматы данных:
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)



## Семантика «ровно один раз» {#exactly-once-semantics}

При приёме больших наборов данных могут возникать различные типы сбоев, что может приводить к частичным вставкам или дублированию данных. Object Storage ClickPipes устойчивы к ошибкам вставки и обеспечивают семантику «ровно один раз». Это достигается с помощью временных промежуточных (staging) таблиц. Сначала данные вставляются в staging-таблицы. Если при вставке что-то пошло не так, staging-таблицу можно очистить и повторить вставку из чистого состояния. Только после того как вставка завершена и прошла успешно, партиции в staging-таблице переносятся в целевую таблицу. Чтобы узнать больше об этой стратегии, ознакомьтесь с [этой записью в блоге](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3).

### Поддержка представлений {#view-support}
Материализованные представления для целевой таблицы также поддерживаются. ClickPipes создаст staging-таблицы не только для целевой таблицы, но и для любого зависимого материализованного представления.

Мы не создаём staging-таблицы для нематериализованных представлений. Это означает, что если у вас есть целевая таблица с одним или несколькими дочерними материализованными представлениями, этим материализованным представлениям следует избегать чтения данных из целевой таблицы через нематериализованное представление. В противном случае вы можете столкнуться с тем, что в материализованном представлении отсутствуют данные.



## Масштабирование {#scaling}

ClickPipes для Object Storage масштабируются на основе минимального размера сервиса ClickHouse, определённого [настроенными параметрами вертикального автомасштабирования](/manage/scaling#configuring-vertical-auto-scaling). Размер ClickPipe задаётся при создании ClickPipe. Последующие изменения настроек сервиса ClickHouse не повлияют на размер ClickPipe.

Чтобы увеличить пропускную способность при выполнении крупных заданий по приёму данных, рекомендуется масштабировать сервис ClickHouse перед созданием ClickPipe.



## Ограничения {#limitations}
- Любые изменения в целевой таблице, её материализованных представлениях (включая каскадные материализованные представления) или целевых таблицах материализованного представления могут приводить к временным ошибкам, которые будут автоматически повторены. Для наилучших результатов рекомендуется остановить pipe, внести необходимые изменения, а затем перезапустить pipe, чтобы изменения были подхвачены и избежать ошибок.
- Существуют ограничения по типам поддерживаемых представлений. Пожалуйста, ознакомьтесь с разделами о [семантике exactly-once](#exactly-once-semantics) и [поддержке представлений](#view-support) для получения дополнительной информации.
- Аутентификация на основе ролей недоступна для S3 ClickPipes для инстансов ClickHouse Cloud, развернутых в GCP или Azure. Она поддерживается только для инстансов ClickHouse Cloud в AWS.
- ClickPipes будет пытаться выполнять приём только для объектов размером 10 ГБ или меньше. Если файл больше 10 ГБ, ошибка будет добавлена в выделенную таблицу ошибок ClickPipes.
- Для пайпов Azure Blob Storage с непрерывным приёмом в контейнерах с более чем 100 тыс. файлов задержка при обнаружении новых файлов составит около 10–15 секунд. Задержка увеличивается с ростом количества файлов.
- Object Storage ClickPipes **не** использует тот же синтаксис перечисления, что [табличная функция S3](/sql-reference/table-functions/s3), а Azure — что [табличная функция AzureBlobStorage](/sql-reference/table-functions/azureBlobStorage).
  - `?` - Заменяет любой один символ
  - `*` - Заменяет любое количество любых символов, кроме `/`, включая пустую строку
  - `**` - Заменяет любое количество любых символов, включая `/`, включая пустую строку

:::note
Это корректный путь (для S3):

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

Это некорректный путь. `{N..M}` не поддерживаются в ClickPipes.

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::



## Непрерывная ингестия {#continuous-ingest}
ClickPipes поддерживает непрерывную ингестию из S3, GCS, Azure Blob Storage и DigitalOcean Spaces. При включении ClickPipes непрерывно выполняет приём данных из указанного пути и проверяет наличие новых файлов с частотой раз в 30 секунд. Однако имена новых файлов должны быть лексикографически больше имени последнего принятого файла. Это означает, что они должны быть названы таким образом, чтобы определять порядок ингестии. Например, файлы с именами `file1`, `file2`, `file3` и т.д. будут последовательно приниматься. Если будет добавлен новый файл с именем `file0`, ClickPipes не будет его принимать, поскольку он не является лексикографически большим, чем последний принятый файл.



## Отслеживание принятых файлов {#tracking-ingested-files}

Чтобы отслеживать, какие файлы были приняты, включите виртуальный столбец `_file` ([virtual column](/sql-reference/table-functions/s3#virtual-columns)) в схему сопоставления полей. Виртуальный столбец `_file` содержит имя файла исходного объекта, что упрощает выполнение запросов и определение того, какие файлы были обработаны.



## Аутентификация {#authentication}

### S3 {#s3}
Поддерживаются как общедоступные, так и защищённые бакеты S3.

Общедоступные бакеты должны разрешать действия `s3:GetObject` и `s3:ListBucket` в своей политике (Policy).

Доступ к защищённым бакетам можно получить, используя либо [учётные данные IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html), либо [роль IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).
Чтобы использовать роль IAM, создайте её в соответствии с инструкциями [в этом руководстве](/cloud/data-sources/secure-s3). После создания скопируйте ARN новой роли IAM и вставьте его в конфигурацию ClickPipe как «IAM ARN role».

### GCS {#gcs}
Аналогично S3, вы можете получать доступ к общедоступным бакетам без какой-либо дополнительной конфигурации, а для защищённых бакетов можно использовать [HMAC Keys](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) вместо учётных данных AWS IAM. Вы можете прочитать это руководство от Google Cloud о том, [как настроить такие ключи](https://cloud.google.com/storage/docs/authentication/hmackeys).

Service Accounts для GCS напрямую не поддерживаются. Для аутентификации при доступе к непубличным бакетам необходимо использовать учётные данные HMAC (IAM).
Права Service Account, привязанного к этим HMAC-учётным данным, должны включать `storage.objects.list` и `storage.objects.get`.

### DigitalOcean Spaces {#dospaces}
В настоящее время для DigitalOcean Spaces поддерживаются только защищённые бакеты. Для доступа к бакету и его файлам требуется «Access Key» и «Secret Key». Вы можете прочитать [это руководство](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) о том, как создать ключи доступа.

### Azure Blob Storage {#azureblobstorage}
В настоящее время для Azure Blob Storage поддерживаются только защищённые бакеты. Аутентификация выполняется с помощью строки подключения (connection string), которая поддерживает access keys и shared keys. Для получения дополнительной информации прочитайте [это руководство](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string).
