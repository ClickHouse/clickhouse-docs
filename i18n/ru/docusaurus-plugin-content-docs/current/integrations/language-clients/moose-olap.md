---
description: 'Знакомство со стеком Moose — подход code-first к разработке решений поверх ClickHouse с типобезопасными схемами и локальной средой разработки'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Разработка на ClickHouse с Moose OLAP'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Разработка на ClickHouse с Moose OLAP

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) — это основной модуль [Moose Stack](https://docs.fiveonefour.com/moose), набора инструментов с открытым исходным кодом для построения аналитических backend-систем реального времени на TypeScript и Python. 

Moose OLAP предоставляет удобные для разработчиков абстракции и функциональность, похожую на ORM, изначально созданные для ClickHouse.



## Ключевые возможности Moose OLAP {#key-features}

- **Схемы как код**: Определяйте таблицы ClickHouse на TypeScript или Python с типобезопасностью и автодополнением в IDE
- **Типобезопасные запросы**: Пишите SQL-запросы с проверкой типов и поддержкой автодополнения
- **Локальная разработка**: Разрабатывайте и тестируйте на локальных экземплярах ClickHouse без влияния на production-окружение
- **Управление миграциями**: Контролируйте версии изменений схемы и управляйте миграциями через код
- **Потоковая передача в реальном времени**: Встроенная поддержка интеграции ClickHouse с Kafka или Redpanda для потоковой загрузки данных
- **REST API**: Легко генерируйте полностью документированные REST API поверх таблиц и представлений ClickHouse


## Начало работы менее чем за 5 минут {#getting-started}

Актуальные руководства по установке и началу работы см. в [документации Moose Stack](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse).

Или следуйте этому руководству, чтобы запустить Moose OLAP на существующем развёртывании ClickHouse или ClickHouse Cloud менее чем за 5 минут.

### Предварительные требования {#prerequisites}

- **Node.js 20+** ИЛИ **Python 3.12+** — требуется для разработки на TypeScript или Python
- **Docker Desktop** — для локальной среды разработки
- **macOS/Linux** — Windows работает через WSL2

<VerticalStepper headerLevel="h3">

### Установка Moose {#step-1-install-moose}

Установите Moose CLI глобально в систему:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### Настройка проекта {#step-2-set-up-project}

#### Вариант A: Использование существующего развёртывания ClickHouse {#option-a-use-own-clickhouse}

**Важно**: Ваш продакшн-экземпляр ClickHouse останется нетронутым. Эта операция только инициализирует новый проект Moose OLAP с моделями данных, созданными на основе ваших таблиц ClickHouse.


```bash
# TypeScript
moose init my-project --from-remote <СТРОКА_ПОДКЛЮЧЕНИЯ_К_CLICKHOUSE> --language typescript
```


# Python

moose init my-project --from-remote <ВАША_СТРОКА_ПОДКЛЮЧЕНИЯ_CLICKHOUSE> --language python

````

Строка подключения ClickHouse должна быть в следующем формате:

```bash
https://username:password@host:port/?database=database_name
````

#### Вариант Б: использование тестовой среды ClickHouse {#option-b-use-clickhouse-playground}

ClickHouse еще не установлен и не запущен? Используйте ClickHouse Playground для ознакомления с Moose OLAP!


```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript
```


# Python

moose init my-project --from-remote [https://explorer:@play.clickhouse.com:443/?database=default](https://explorer:@play.clickhouse.com:443/?database=default) --language python

```

### Установка зависимостей {#step-3-install-dependencies}
```


```bash
# TypeScript
cd my-project
npm install
```


# Python

cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

````

Вы должны увидеть: `Successfully generated X models from ClickHouse tables`

### Изучите сгенерированные модели {#step-4-explore-models}

Moose CLI автоматически генерирует интерфейсы TypeScript или модели Python Pydantic из существующих таблиц ClickHouse.

Ознакомьтесь с новыми моделями данных в файле `app/index.ts`.

### Начните разработку {#step-5-start-development}

Запустите сервер разработки, чтобы развернуть локальный экземпляр ClickHouse со всеми продакшн-таблицами, автоматически воссозданными из определений в коде:

```bash
moose dev
````

**Важно**: Ваш продакшн-экземпляр ClickHouse останется нетронутым. Эта команда создаёт локальную среду разработки.

### Заполните локальную базу данных {#step-6-seed-database}

Загрузите данные в локальный экземпляр ClickHouse:

#### Из вашего собственного ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### Из ClickHouse playground {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Разработка с Moose OLAP {#step-7-building-with-moose-olap}

Теперь, когда таблицы определены в коде, вы получаете те же преимущества, что и модели данных ORM в веб-приложениях — типобезопасность и автодополнение при создании API и материализованных представлений на основе аналитических данных. В качестве следующего шага вы можете попробовать:

- Создать REST API с помощью [Moose API](https://docs.fiveonefour.com/moose/apis)
- Загружать или преобразовывать данные с помощью [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) или [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)
- Изучить переход в продакшн с помощью [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) и [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)

</VerticalStepper>


## Получить помощь и оставаться на связи {#get-help-stay-connected}

- **Справочное приложение**: Ознакомьтесь со справочным приложением с открытым исходным кодом [Area Code](https://github.com/514-labs/area-code) — стартовым репозиторием со всеми необходимыми компонентами для создания многофункционального корпоративного приложения, требующего специализированной инфраструктуры. Доступны два примера приложений: аналитика, ориентированная на пользователей (User Facing Analytics), и операционное хранилище данных (Operational Data Warehouse).
- **Сообщество в Slack**: Свяжитесь с разработчиками Moose Stack [в Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) для получения поддержки и обратной связи
- **Видеоматериалы**: Видеоуроки, демонстрации и подробные разборы возможностей Moose Stack [на Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw)
- **Участие в разработке**: Изучите код, внесите вклад в развитие Moose Stack и сообщайте о проблемах [на GitHub](https://github.com/514-labs/moose)
