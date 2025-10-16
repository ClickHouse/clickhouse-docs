---
'description': 'Начните работу с Moose Stack - подходом, ориентированным на код, для
  построения на базе ClickHouse с типобезопасными схемами и локальной разработкой'
'sidebar_label': 'Moose OLAP (TypeScript / Python)'
'sidebar_position': 25
'slug': '/interfaces/third-party/moose-olap'
'title': 'В разработке на ClickHouse с Moose OLAP'
'keywords':
- 'Moose'
'doc_type': 'guide'
---
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Разработка на ClickHouse с Moose OLAP

<CommunityMaintainedBadge/>

[Moose OLAP](https://docs.fiveonefour.com/moose/olap) — это основной модуль [Moose Stack](https://docs.fiveonefour.com/moose), набора инструментов с открытым исходным кодом для разработки аналитических бэкэндов в реальном времени на Typescript и Python.

Moose OLAP предлагает удобные для разработчиков абстракции и функциональность, схожую с ORM, разработанную нативно для ClickHouse.

## Ключевые особенности Moose OLAP {#key-features}

- **Схемы как код**: Определяйте ваши таблицы ClickHouse на TypeScript или Python с безопасностью типов и автозаполнением в IDE
- **Запросы с безопасностью типов**: Пишите SQL-запросы с поддержкой проверки типов и автозаполнения
- **Локальная разработка**: Разрабатывайте и тестируйте на локальных инстансах ClickHouse, не затрагивая продуктивную среду
- **Управление миграциями**: Контролируйте версии ваших изменений схемы и управляйте миграциями через код
- **Потоковая обработка в реальном времени**: Встроенная поддержка подключения ClickHouse к Kafka или Redpanda для потоковой загрузки
- **REST APIs**: Легко генерируйте полностью документированные REST APIs на основе ваших таблиц и представлений ClickHouse

## Начало работы менее чем за 5 минут {#getting-started}

Для последних и лучших руководств по установке и началу работы, смотрите [документацию Moose Stack](https://docs.fiveonefour.com/moose/getting-started/from-clickhouse).

Или следуйте этому руководству, чтобы быстро начать работу с Moose OLAP на существующем развертывании ClickHouse или ClickHouse Cloud менее чем за 5 минут.

### Требования {#prerequisites}

- **Node.js 20+** ИЛИ **Python 3.12+** - Необходимы для разработки на TypeScript или Python
- **Docker Desktop** - Для локальной среды разработки
- **macOS/Linux** - Windows работает через WSL2

<VerticalStepper headerLevel="h3">

### Установка Moose {#step-1-install-moose}

Установите CLI Moose глобально в вашей системе:

```bash
bash -i <(curl -fsSL https://fiveonefour.com/install.sh) moose
```

### Настройте ваш проект {#step-2-set-up-project}

#### Вариант A: Используйте ваше собственное развертывание ClickHouse {#option-a-use-own-clickhouse}

**Важно**: Ваш продуктивный ClickHouse останется нетронутым. Это просто инициализирует новый проект Moose OLAP с моделями данных, основанными на ваших таблицах ClickHouse.

```bash

# TypeScript
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language typescript


# Python
moose init my-project --from-remote <YOUR_CLICKHOUSE_CONNECTION_STRING> --language python
```

Ваша строка подключения ClickHouse должна быть в следующем формате:

```bash
https://username:password@host:port/?database=database_name
```

#### Вариант B: используйте игровой стенд ClickHouse {#option-b-use-clickhouse-playground}

Не удалось запустить ClickHouse? Используйте Игровой стенд ClickHouse, чтобы попробовать Moose OLAP!

```bash

# TypeScript
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language typescript


# Python
moose init my-project --from-remote https://explorer:@play.clickhouse.com:443/?database=default --language python
```

### Установка зависимостей {#step-3-install-dependencies}

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

Вы должны увидеть: `Successfully generated X models from ClickHouse tables`

### Изучите ваши сгенерированные модели {#step-4-explore-models}

CLI Moose автоматически генерирует интерфейсы TypeScript или модели Pydantic Python из ваших существующих таблиц ClickHouse.

Посмотрите ваши новые модели данных в файле `app/index.ts`.

### Начните разработку {#step-5-start-development}

Запустите ваш сервер разработки, чтобы запустить локальный экземпляр ClickHouse со всеми вашими продуктивными таблицами, автоматически воссозданными из ваших кодовых определений:

```bash
moose dev
```

**Важно**: Ваш продуктивный ClickHouse останется нетронутым. Это создает локальную среду разработки.

### Заполните вашу локальную базу данных {#step-6-seed-database}

Заполните ваши данные в локальный экземпляр ClickHouse:

#### Из вашего собственного ClickHouse {#from-own-clickhouse}

```bash
moose seed --connection-string <YOUR_CLICKHOUSE_CONNECTION_STRING> --limit 100
```

#### Из игрового стенда ClickHouse {#from-clickhouse-playground}

```bash
moose seed --connection-string https://explorer:@play.clickhouse.com:443/?database=default --limit 100
```

### Разработка с помощью Moose OLAP {#step-7-building-with-moose-olap}

Теперь, когда у вас есть ваши Таблицы, определенные в коде, вы получаете те же преимущества, что и модели данных ORM в веб-приложениях - безопасность типов и автозаполнение при создании APIs и Материализованных Представлений на основе ваших аналитических данных. На следующем этапе вы можете попробовать:
* Построение REST API с [Moose API](https://docs.fiveonefour.com/moose/apis)
* Загрузка или преобразование данных с помощью [Moose Workflows](https://docs.fiveonefour.com/moose/workflows) или [Moose Streaming](https://docs.fiveonefour.com/moose/workflows)
* Изучите возможность перехода в продукцию с [Moose Build](https://docs.fiveonefour.com/moose/deploying/summary) и [Moose Migrate](https://docs.fiveonefour.com/moose/migrate)

</VerticalStepper>

## Получить помощь и оставаться на связи {#get-help-stay-connected}
- **Справочное приложение**: Ознакомьтесь с открытым справочным приложением, [Area Code](https://github.com/514-labs/area-code): стартовый репозиторий со всеми необходимыми строительными блоками для функционального, готового к предприятиям приложения, требующего специализированной инфраструктуры. Есть два примера приложений: Аналитика для пользователей и Операционный аналитический склад данных.
- **Сообщество в Slack**: Свяжитесь с кураторами Moose Stack [в Slack](https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg) для поддержки и обратной связи
- **Смотрите учебные видео**: Видеоуроки, демонстрации и глубокие погружения в функции Moose Stack [на Youtube](https://www.youtube.com/channel/UCmIj6NoAAP7kOSNYk77u4Zw)
- **Внесите свой вклад**: Ознакомьтесь с кодом, внесите вклад в Moose Stack и сообщите о проблемах [на GitHub](https://github.com/514-labs/moose)