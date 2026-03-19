---
sidebar_label: 'Начало работы'
description: 'Пошаговое руководство по созданию вашего первого ClickPipe для Azure Blob Storage (ABS).'
slug: /integrations/clickpipes/object-storage/azure-blob-storage/get-started
sidebar_position: 1
title: 'Создайте свой первый ClickPipe для Azure Blob Storage'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import navigateToDatasources from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/01-navigate-to-datasources.png'
import createClickpipe from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/02-create-clickpipe.png'
import selectBlobStorage from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/03-select-blob-storage.png'
import configurationDetails from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/04-configuration-details.png'
import chooseDataFormat from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/05-choose-data-format.png'
import parseInformation from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/06-parse-information.png'
import permissions from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/07-permissions.png'

**Предварительные требования**

Для выполнения этого руководства вам понадобятся:

* Учетная запись Azure Blob Storage
* [Строка подключения Azure](/integrations/azure-data-factory/table-function#acquiring-azure-blob-storage-access-keys)
* Имя контейнера
* Запущенный сервис ClickHouse Cloud

<VerticalStepper headerLevel="h2">
  ## Перейдите к источникам данных \{#navigate-to-data-sources\}

  На главной странице вашего сервиса нажмите **Data sources** в меню слева.
  Разверните раскрывающийся список **ClickPipes** и нажмите **Create ClickPipe**.

  <Image img={navigateToDatasources} alt="Переход к источникам данных" size="md" />

  <Image img={createClickpipe} alt="Создание ClickPipe" size="md" />

  ## Выбор источника данных \{#select-data-source\}

  Выберите **Azure Blob Storage** в качестве типа данных.

  <Image img={selectBlobStorage} alt="Выбор Azure Blob Storage" size="md" />

  ## Настройте подключение ClickPipe \{#setup-connection\}

  1. Укажите для вашего ClickPipe понятное описательное имя
  2. Выберите **Connection String** в раскрывающемся списке метода аутентификации
  3. Вставьте строку подключения Azure в поле **Connection string**
  4. Введите имя контейнера
  5. Введите путь к файлу Azure Blob Storage, используя подстановочные знаки, если вы хотите настроить приём нескольких файлов

  При необходимости включите непрерывную ингестию. Подробнее см. [&quot;Continuous Ingestion&quot;](/integrations/clickpipes/object-storage/abs/overview#continuous-ingestion).

  Затем нажмите **Incoming data**.

  <Image img={configurationDetails} alt="Сведения о конфигурации" size="md" />

  ## Выбор формата данных \{#select-data-format\}

  1. Выберите тип файла
  2. Укажите сжатие файла (`detect automatically`, `none`, `gzip`, `brotli`, `xz` или `zstd`)
  3. Выполните дополнительную настройку, специфичную для формата, например укажите разделитель для форматов с разделителями-запятыми
  4. Нажмите **Parse information**

  <Image img={chooseDataFormat} alt="Выбор формата данных" size="md" />

  ## Настройка таблицы, схемы и параметров \{#configure-table-schema\}

  Теперь вам нужно создать новую таблицу или выбрать существующую, в которую будут сохраняться входящие данные.

  1. Укажите, необходимо ли загружать данные в новую таблицу или в существующую
  2. Выберите базу данных и имя таблицы, если создается новая таблица
  3. Выберите ключ или ключи сортировки
  4. Определите все сопоставления из исходного файла в целевую таблицу для имени столбца, типа столбца, значения по умолчанию и возможности хранения NULL-значений
  5. Наконец, укажите дополнительные параметры, такие как тип движка, который вы хотите использовать, выражение для партиционирования и первичный ключ

  <Image img={parseInformation} alt="Разбор информации" size="md" />

  После завершения настройки таблицы, схемы и параметров нажмите **Details and settings**.

  ## Настройка прав доступа \{#configure-permissions\}

  ClickPipes создаст отдельного пользователя базы данных для записи данных.
  Вы можете выбрать роль для этого пользователя.
  Для materialized views или доступа к словарю из целевой таблицы выберите &quot;Full access&quot;.

  <Image img={permissions} alt="Настройка прав доступа" size="md" />

  ## Завершение настройки \{#complete-setup\}

  Нажмите **Create ClickPipe**, чтобы завершить настройку.

  Теперь вы должны увидеть свой ClickPipe в статусе **provisioning**.
  Через несколько мгновений статус изменится с **provisioning** на **completed**.
</VerticalStepper>
