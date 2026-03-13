---
slug: /cloud/managed-postgres/migrations/peerdb
sidebar_label: 'PeerDB'
title: 'Перенос данных PostgreSQL с помощью PeerDB'
description: 'Узнайте, как мигрировать данные PostgreSQL в ClickHouse Managed Postgres с помощью PeerDB'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres', 'peerdb']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourcePeer from '@site/static/images/managed-postgres/peerdb/source-peer.png';
import targetPeer from '@site/static/images/managed-postgres/peerdb/target-peer.png';
import peers from '@site/static/images/managed-postgres/peerdb/peers.png';
import createMirror from '@site/static/images/managed-postgres/peerdb/create-mirror.png';
import tablePicker from '@site/static/images/managed-postgres/peerdb/table-picker.png';
import initialLoad from '@site/static/images/managed-postgres/peerdb/initial-load.png';
import mirrors from '@site/static/images/managed-postgres/peerdb/mirrors.png';
import settings from '@site/static/images/managed-postgres/peerdb/settings.png';


# Миграция на Managed Postgres с помощью PeerDB \{#peerdb-migration\}

В этом руководстве приведены пошаговые инструкции по миграции вашей базы данных PostgreSQL на ClickHouse Managed Postgres с помощью PeerDB.

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-peerdb" />

## Предварительные требования \{#migration-peerdb-prerequisites\}

- Доступ к исходной базе данных PostgreSQL.
- Экземпляр сервиса ClickHouse Managed Postgres, в который вы хотите перенести свои данные.
- Установленный PeerDB на машине. Вы можете следовать инструкциям по установке в [репозитории PeerDB на GitHub](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started): достаточно клонировать репозиторий и выполнить `docker-compose up`. В этом руководстве мы будем использовать **PeerDB UI**, который будет доступен по адресу `http://localhost:3000` после запуска PeerDB.

## Важные замечания перед миграцией \{#migration-peerdb-considerations-before\}

Перед началом миграции учтите следующее:

- **Объекты базы данных**: PeerDB будет автоматически создавать таблицы в целевой базе данных на основе исходной схемы. Однако некоторые объекты базы данных, такие как индексы, ограничения и триггеры, не будут перенесены автоматически. Вам потребуется вручную воссоздать эти объекты в целевой базе данных после завершения миграции.
- **DDL-изменения**: Если вы включите непрерывную репликацию, PeerDB будет поддерживать синхронизацию целевой базы данных с исходной для DML-операций (INSERT, UPDATE, DELETE) и будет распространять операции ADD COLUMN. Однако другие DDL-изменения (например, DROP COLUMN, ALTER COLUMN) не распространяются автоматически. Подробнее о поддержке изменений схемы см. [здесь](/integrations/clickpipes/postgres/schema-changes).
- **Сетевое подключение**: Убедитесь, что как исходная, так и целевая базы данных достижимы по сети с машины, на которой запущен PeerDB. Возможно, вам потребуется настроить правила брандмауэра или параметры групп безопасности, чтобы разрешить подключение.

## Создание peers \{#migration-peerdb-create-peers\}

Сначала нужно создать peers как для исходной, так и для целевой баз данных. Peer представляет собой соединение с базой данных. В интерфейсе PeerDB перейдите в раздел «Peers», нажав «Peers» в боковой панели. Чтобы создать новый peer, нажмите кнопку `+ New peer`.

### Создание исходного пира \{#migration-peerdb-source-peer\}

Создайте пир для исходной базы данных PostgreSQL, заполнив параметры подключения, такие как host, port, имя базы данных, имя пользователя и пароль. После заполнения всех параметров нажмите кнопку `Create peer`, чтобы сохранить пир.

<Image img={sourcePeer} alt="Создание исходного пира" size="md" border />

### Создание целевого peer \{#migration-peerdb-target-peer\}

Аналогичным образом создайте peer для вашего экземпляра ClickHouse Managed Postgres, указав необходимые параметры подключения. Вы можете получить [параметры подключения](../connection) для своего экземпляра в консоли ClickHouse Cloud. После заполнения всех полей нажмите кнопку `Create peer`, чтобы сохранить целевой peer.

<Image img={targetPeer} alt="Создание целевого peer" size="md" border />

Теперь вы должны увидеть и исходный, и целевой peer в разделе «Peers».

<Image img={peers} alt="Список peers" size="md" border />

### Получение дампа схемы исходной базы данных \{#migration-peerdb-source-schema-dump\}

Чтобы воспроизвести структуру исходной базы данных в целевой, необходимо получить дамп схемы исходной базы. Для этого можно использовать `pg_dump`, чтобы создать дамп только схемы вашей исходной базы данных PostgreSQL:

<details>
  <summary>Установка pg&#95;dump</summary>

  **Ubuntu:**

  Обновите списки пакетов:

  ```shell
  sudo apt update
  ```

  Установите клиент PostgreSQL:

  ```shell
  sudo apt install postgresql-client
  ```

  **macOS:**

  Метод 1: Использование Homebrew (рекомендуется)

  Установите Homebrew, если он ещё не установлен:

  ```shell
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

  Установите PostgreSQL:

  ```shell
  brew install postgresql
  ```

  Проверьте установку:

  ```shell
  pg_dump --version
  ```
</details>

```shell
pg_dump -d 'postgresql://<user>:<password>@<host>:<port>/<database>'  -s > source_schema.sql
```


#### Удаление ограничений UNIQUE и индексов из дампа схемы \{#migration-peerdb-remove-constraints-indexes\}

Прежде чем применять дамп к целевой базе данных, необходимо удалить ограничения UNIQUE и индексы из файла дампа, чтобы процесс ингестии данных PeerDB в целевые таблицы не блокировался этими ограничениями и индексами. Их можно удалить с помощью:

```shell
# Preview
grep -n "CONSTRAINT.*UNIQUE" <dump_file_path>
grep -n "CREATE UNIQUE INDEX" <dump_file_path>
grep -n -E "(CONSTRAINT.*UNIQUE|CREATE UNIQUE INDEX)" <dump_file_path>

# Remove
sed -i.bak -E '/CREATE UNIQUE INDEX/,/;/d; /(CONSTRAINT.*UNIQUE|ADD CONSTRAINT.*UNIQUE)/d' <dump_file_path>
```


### Примените дамп схемы к целевой базе данных \{#migration-peerdb-apply-schema-dump\}

После того как вы очистите файл дампа схемы, вы можете применить его к целевой базе данных ClickHouse Managed Postgres, [подключившись](../connection) через `psql` и выполнив команды из файла дампа схемы:

```shell
psql -h <target_host> -p <target_port> -U <target_username> -d <target_database> -f source_schema.sql
```

Здесь на целевой стороне мы не хотим, чтобы ингестия PeerDB блокировалась внешними ключевыми ограничениями. Для этого мы можем изменить целевую роль (используемую выше в целевом peer), чтобы установить параметр `session_replication_role` в значение `replica`:

```sql
ALTER ROLE <target_role> SET session_replication_role = replica;
```


## Создайте mirror \{#migration-peerdb-create-mirror\}

Далее необходимо создать mirror, чтобы определить процесс миграции данных между исходным и целевым peers. В интерфейсе PeerDB перейдите в раздел "Mirrors", выбрав пункт "Mirrors" в боковой панели. Чтобы создать новый mirror, нажмите кнопку `+ New mirror`.

<Image img={createMirror} alt="Create Mirror" size="md" border />

1. Задайте вашему mirror имя, которое описывает миграцию.
2. Выберите исходный и целевой peers, созданные ранее, из раскрывающихся списков.
3. Убедитесь, что:

- Soft delete выключен.
- Разверните `Advanced settings`. Убедитесь, что **Postgres type system is enabled** и **PeerDB columns are disabled**.

<Image img={settings} alt="Mirror Settings" size="md" border />

4. Выберите таблицы, которые вы хотите перенести. Можно выбрать конкретные таблицы или все таблицы из исходной базы данных.

<Image img={tablePicker} alt="Table Picker" size="md" border />

:::info Selecting tables
Убедитесь, что имена таблиц в целевой базе данных совпадают с именами таблиц в исходной базе данных, так как на предыдущем шаге мы перенесли схему как есть.
:::

5. После настройки параметров mirror нажмите кнопку `Create mirror`.

Вы увидите только что созданный mirror в разделе "Mirrors".

<Image img={mirrors} alt="Mirrors List" size="md" border />

## Дождитесь завершения первоначальной загрузки \{#migration-peerdb-initial-load\}

После создания зеркала PeerDB начнет первоначальную загрузку данных из исходной базы данных в целевую. Вы можете выбрать зеркало и перейти на вкладку **Initial load**, чтобы отслеживать ход первоначальной миграции данных.

<Image img={initialLoad} alt="Initial Load Progress" size="md" border />

После завершения первоначальной загрузки вы увидите статус, указывающий, что миграция завершена.

## Мониторинг начальной загрузки и репликации \{#migration-peerdb-monitoring\}

Если вы нажимаете на исходный peer, вы видите список выполняющихся команд, которые запускает PeerDB. Например:

1. Сначала выполняется запрос COUNT, чтобы оценить количество строк в каждой таблице.
2. Затем выполняется запрос на разбиение на партиции с использованием NTILE, чтобы разбить большие таблицы на более мелкие фрагменты для эффективной передачи данных.
3. Далее выполняются команды FETCH, чтобы извлечь данные из исходной базы данных, после чего PeerDB синхронизирует их с целевой базой данных.

## Задачи после миграции \{#migration-peerdb-considerations\}

После завершения миграции:

- **Воссоздайте объекты базы данных**: Не забудьте вручную воссоздать индексы, ограничения и триггеры в целевой базе данных, поскольку они не переносятся автоматически.
- **Протестируйте приложение**: Обязательно протестируйте приложение с экземпляром ClickHouse Managed Postgres, чтобы убедиться, что всё работает как ожидается.
- **Освободите ресурсы**: Когда вы будете удовлетворены результатами миграции и переключите приложение на использование ClickHouse Managed Postgres, вы можете удалить объекты mirror и peers в PeerDB, чтобы освободить ресурсы.

:::info Слоты репликации
Если вы включили непрерывную репликацию, PeerDB создаст **слот репликации** в исходной базе данных PostgreSQL. Обязательно удалите слот репликации вручную в исходной базе данных после завершения миграции, чтобы избежать ненужного расхода ресурсов.
:::

## Справочные материалы \{#migration-peerdb-references\}

- [Документация ClickHouse Managed Postgres](../)
- [Руководство PeerDB по созданию CDC (фиксации изменений данных)](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [FAQ по Postgres ClickPipe (актуально и для PeerDB)](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## Следующие шаги \{#migration-pgdump-pg-restore-next-steps\}

Поздравляем! Вы успешно перенесли свою базу данных PostgreSQL в ClickHouse Managed Postgres с помощью pg_dump и pg_restore. Теперь вы готовы изучать возможности Managed Postgres и его интеграцию с ClickHouse. Ниже приведено краткое 10‑минутное руководство, которое поможет вам начать работу:

- [Краткое руководство по Managed Postgres](../quickstart)