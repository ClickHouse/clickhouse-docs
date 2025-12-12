---
description: 'Знакомство с Moose Stack — code-first-подходом к разработке решений поверх ClickHouse с типобезопасными схемами и локальной разработкой'
sidebar_label: 'Moose OLAP (TypeScript / Python)'
sidebar_position: 25
slug: /interfaces/third-party/moose-olap
title: 'Разработка на ClickHouse с использованием Moose OLAP'
keywords: ['Moose']
doc_type: 'guide'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Разработка на ClickHouse с Moose OLAP {#developing-on-clickhouse-with-moose-olap}

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) — это основной модуль [Moose Stack](https://docs.fiveonefour.com/moose), открытого набора инструментов для разработчиков, предназначенного для создания аналитических backend-систем реального времени на TypeScript и Python. 

Moose OLAP предоставляет удобные для разработчиков абстракции и ORM-подобную функциональность, изначально разработанную для ClickHouse.

## Ключевые возможности Moose OLAP {#key-features}

- **Схемы в виде кода**: определяйте таблицы ClickHouse на TypeScript или Python с гарантиями типизации и автодополнением в IDE
- **Типобезопасные запросы**: пишите SQL-запросы с проверкой типов и поддержкой автодополнения
- **Локальная разработка**: разрабатывайте и тестируйте, используя локальные экземпляры ClickHouse, не затрагивая производственную среду
- **Управление миграциями**: управляйте версиями изменений схемы и миграциями в коде
- **Потоковая обработка в реальном времени**: встроенная поддержка использования ClickHouse совместно с Kafka или Redpanda для потокового приёма данных
- **REST API**: легко генерируйте полностью документированные REST API поверх ваших таблиц и представлений ClickHouse

## Начало работы менее чем за 5 минут {#getting-started}

Самые актуальные и подробные руководства по установке и началу работы см. в [документации Moose Stack](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse).

Или следуйте этому руководству, чтобы запустить Moose OLAP на уже развернутом ClickHouse или ClickHouse Cloud менее чем за 5 минут.

### Предварительные требования {#prerequisites}

- **Node.js 20+** ИЛИ **Python 3.12+** — требуется для разработки на TypeScript или Python
- **Docker Desktop** — для локальной среды разработки
- **macOS/Linux** — Windows работает через WSL2

<VerticalStepper headerLevel="h3">

### Установка Moose {#step-1-install-moose}

Установите Moose CLI глобально в вашей системе:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### Настройка проекта {#step-2-set-up-project}

#### Вариант A: использовать собственное существующее развертывание ClickHouse {#option-a-use-own-clickhouse}

**Важно**: ваш продуктивный ClickHouse останется нетронутым. Это только инициализирует новый проект Moose OLAP с моделями данных, построенными на основе ваших таблиц ClickHouse.

```bash
# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript

# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

Ваша строка подключения к ClickHouse должна иметь следующий формат:

```bash
https://username:password@host:port/?database=database_name
```

#### Вариант B: использовать ClickHouse Playground {#option-b-use-clickhouse-playground}

У вас ещё не запущен ClickHouse? Используйте ClickHouse Playground, чтобы опробовать Moose OLAP!

```bash
# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript

# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### Установите зависимости {#step-3-install-dependencies}

```bash
# TypeScript
cd my-project
npm install

# Python
cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Должно появиться сообщение: `Successfully generated X models from ClickHouse tables`

### Изучите сгенерированные модели {#step-4-explore-models}

Moose CLI автоматически генерирует интерфейсы TypeScript или модели Pydantic на Python из ваших существующих таблиц ClickHouse.

Ознакомьтесь с новыми моделями данных в файле `app/index.ts`.

### Начало разработки {#step-5-start-development}

Запустите dev-сервер, чтобы поднять локальный экземпляр ClickHouse со всеми вашими продуктивными таблицами, автоматически воссозданными из определений в коде:

```bash
moose dev
```

**Важно**: ваш продуктивный ClickHouse останется нетронутым. Это создаёт локальную среду разработки.

### Наполнение локальной базы данных {#step-6-seed-database}

Загрузите данные в локальный экземпляр ClickHouse:

#### Из собственного ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### Из ClickHouse Playground {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Разработка с Moose OLAP {#step-7-building-with-moose-olap}

Теперь, когда ваши таблицы определены в коде, вы получаете те же преимущества, что и с моделями данных ORM в веб-приложениях, — строгую типизацию и автодополнение при построении API и материализованных представлений поверх ваших аналитических данных. В качестве следующего шага вы можете:

* Построить REST API с помощью [Moose API](https://docs.fiveonefour.com/moose/apis)
* Организовать приём или преобразование данных с помощью [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) или [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)
* Рассмотреть переход в продакшн с [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) и [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)

</VerticalStepper>

## Получите помощь и оставайтесь на связи {#get-help-stay-connected}

- **Эталонное приложение**: Ознакомьтесь с open source эталонным приложением [Area Code](https://github.com/514-labs/area-code) — стартовым репозиторием со всеми необходимыми строительными блоками для функционально насыщенного, готового к использованию в корпоративной среде приложения, которое требует специализированной инфраструктуры. В него входят два примера приложений: User Facing Analytics и Operational Data Warehouse.
- **Сообщество в Slack**: Свяжитесь с мейнтейнерами Moose Stack [в Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg), чтобы получить поддержку и оставить отзыв.
- **Смотрите обучающие материалы**: Видеоруководства, демо и подробные разборы возможностей Moose Stack [на YouTube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw).
- **Внесите свой вклад**: Изучайте код, вносите вклад в Moose Stack и сообщайте о проблемах [на GitHub](https://github.com/514-labs/moose).