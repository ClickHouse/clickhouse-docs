---
slug: /cloud/managed-postgres/connection
sidebar_label: 'Подключение'
title: 'Подключение к Managed Postgres'
description: 'Строки подключения, пул подключений PgBouncer и конфигурация TLS для ClickHouse Managed Postgres'
keywords: ['подключение к Postgres', 'строка подключения', 'pgbouncer', 'tls', 'ssl']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import connectButton from '@site/static/images/managed-postgres/connect-button.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import tlsCaBundle from '@site/static/images/managed-postgres/tls-ca-bundle.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="connection" />


## Доступ к параметрам подключения \{#accessing-connection-details\}

Чтобы подключить ваши приложения к Managed Postgres, перейдите в раздел **Connect** в левой боковой панели вашего экземпляра.

<Image img={connectButton} alt="Нажмите Connect в левой боковой панели, чтобы просмотреть параметры подключения" size="md" border/>

Щелчок по **Connect** открывает модальное окно, в котором отображаются ваши учетные данные для подключения и строки подключения в нескольких форматах.

<Image img={connectModal} alt="Модальное окно подключения с учетными данными и форматами строк подключения" size="md" border/>

Модальное окно подключения отображает следующую информацию:

- **Username**: пользователь базы данных (по умолчанию: `postgres`)
- **Password**: пароль вашей базы данных (по умолчанию скрыт, нажмите на значок глаза, чтобы отобразить его)
- **Server**: имя хоста вашего экземпляра Managed Postgres
- **Port**: порт PostgreSQL (по умолчанию: `5432`)

Managed Postgres предоставляет доступ суперпользователя к вашей базе данных. Используйте эти учетные данные для подключения от имени суперпользователя, что позволит вам создавать дополнительных пользователей и управлять объектами базы данных.

## Форматы строк подключения \{#connection-string\}

Вкладки **Connect via** предоставляют строку подключения в различных форматах, соответствующих требованиям вашего приложения:

| Format | Description |
|--------|-------------|
| **url** | Стандартный URL подключения в формате `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>` |
| **psql** | Готовая к использованию команда для подключения через утилиту командной строки psql |
| **env** | Переменные окружения для клиентов на базе libpq |
| **yaml** | Конфигурация в формате YAML |
| **jdbc** | Строка подключения JDBC для Java-приложений |

В целях безопасности пароль в строках подключения по умолчанию маскируется. Нажмите значок копирования рядом с любым полем или строкой подключения, чтобы скопировать её непосредственно в буфер обмена.

## Пул подключений PgBouncer \{#pgbouncer\}

Managed Postgres включает встроенный экземпляр [PgBouncer](https://www.pgbouncer.org/) для серверного пула подключений. PgBouncer помогает улучшить управление подключениями, производительность и использование ресурсов, особенно для приложений, которые:

- Открывают много одновременных подключений
- Часто создают и закрывают подключения
- Используют бессерверные (serverless) или эфемерные вычислительные среды

Чтобы использовать пул подключений, включите переключатель **через PgBouncer** в верхней части модального окна подключения. Параметры подключения обновятся так, чтобы направлять ваши подключения через пул PgBouncer вместо прямого подключения к PostgreSQL.

:::tip Когда использовать PgBouncer
Используйте PgBouncer, когда ваше приложение открывает много краткосрочных подключений. Для длительных подключений или приложений, использующих возможности PostgreSQL, несовместимые с пулом подключений (например, подготовленные операторы (prepared statements) между транзакциями), подключайтесь напрямую.

Перенос данных в ClickHouse с помощью ClickPipes через PgBouncer не поддерживается. 
:::

## Настройка TLS \{#tls\}

Все экземпляры Managed Postgres защищены с помощью TLS. Минимально поддерживаемая версия — **TLS 1.3**.

### Быстрое подключение (с шифрованием TLS) \{#quick-connection\}

По умолчанию соединения устанавливаются с шифрованием TLS без проверки сертификата:

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres'
```


### Проверенное TLS‑подключение (рекомендуется для продакшена) \{#verified-tls\}

Для продакшен‑нагрузок мы рекомендуем подключаться с использованием проверенного TLS, чтобы быть уверенными, что вы взаимодействуете с нужным сервером. Для этого скачайте пакет корневых сертификатов (CA certificate bundle) во вкладке **Settings** и добавьте его в список доверенных сертификатов вашего клиента базы данных.

<Image img={tlsCaBundle} alt="Download CA Certificate from the Settings tab" size="md" border />

CA‑сертификат уникален для вашего экземпляра Managed Postgres и не будет работать с другими экземплярами.

Чтобы подключиться с проверенным TLS‑соединением, добавьте `sslmode=verify-full` и путь к скачанному сертификату:

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres?sslmode=verify-full&sslrootcert=/path/to/ca-certificate.pem'
```
