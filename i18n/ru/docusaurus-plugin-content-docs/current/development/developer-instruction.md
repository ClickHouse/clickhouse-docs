---
slug: '/development/developer-instruction'
sidebar_label: 'Предварительные требования'
sidebar_position: 5
description: 'Предварительные требования и инструкции по настройке для разработки'
title: 'Предварительные требования для разработчиков'
doc_type: guide
---
# Предварительные требования

ClickHouse можно собирать на Linux, FreeBSD и macOS. Если вы используете Windows, вы все равно можете собрать ClickHouse в виртуальной машине под управлением Linux, например, с помощью [VirtualBox](https://www.virtualbox.org/) с Ubuntu.

## Создание репозитория на GitHub {#create-a-repository-on-github}

Чтобы начать разработку для ClickHouse, вам понадобится аккаунт на [GitHub](https://www.github.com/). Пожалуйста, также создайте локально SSH-ключ (если у вас его еще нет) и загрузите публичный ключ на GitHub, так как это является предварительным требованием для внесения исправлений.

Затем, сделайте форк [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse/) в своем личном аккаунте, нажав кнопку "fork" в правом верхнем углу.

Чтобы внести изменения, например, исправление для проблемы или реализацию функции, сначала зафиксируйте свои изменения в ветке вашего форка, затем создайте "Pull Request" с изменениями в основной репозиторий.

Для работы с Git-репозиториями установите Git. Например, в Ubuntu выполните:

```sh
sudo apt update
sudo apt install git
```

Шпаргалку по Git можно найти [здесь](https://education.github.com/git-cheat-sheet-education.pdf). Подробную документацию по Git можно найти [здесь](https://git-scm.com/book/en/v2).

## Клонирование репозитория на вашу рабочую машину {#clone-the-repository-to-your-development-machine}

Сначала загрузите исходные файлы на вашу рабочую машину, т.е. клонируйте репозиторий:

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

Эта команда создает директорию `ClickHouse/`, содержащую исходный код, тесты и другие файлы. Вы можете указать пользовательскую директорию для извлечения после URL, но важно, чтобы этот путь не содержал пробелов, так как это может нарушить сборку позже.

Git-репозиторий ClickHouse использует подмодули для подключения сторонних библиотек. Подмодули по умолчанию не извлекаются. Вы можете либо

- запустить `git clone` с опцией `--recurse-submodules`,

- если `git clone` выполнен без `--recurse-submodules`, выполните `git submodule update --init --jobs <N>`, чтобы явно извлечь все подмодули. (`<N>` можно установить, например, на `12` для параллельной загрузки.)

- если `git clone` выполнен без `--recurse-submodules` и вы хотите использовать [sparse](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) и [shallow](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) извлечение подмодулей, чтобы опустить ненужные файлы и историю в подмодулях и сэкономить место (около 5 ГБ вместо около 15 ГБ), выполните `./contrib/update-submodules.sh`. Этот способ используется CI, но не рекомендуется для локальной разработки, так как это делает работу с подмодулями менее удобной и медленной.

Чтобы проверить статус Git-подмодулей, выполните `git submodule status`.

Если вы получите следующее сообщение об ошибке

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

значит отсутствуют SSH-ключи для подключения к GitHub. Эти ключи обычно находятся в `~/.ssh`. Чтобы SSH-ключи были признаны, их нужно загрузить в настройках GitHub.

Вы также можете клонировать репозиторий по HTTPS:

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

Однако это не позволит вам отправлять ваши изменения на сервер. Вы все равно можете временно использовать его и добавить SSH-ключи позже, заменив адрес удаленного репозитория с помощью команды `git remote`.

Вы также можете добавить адрес оригинального репозитория ClickHouse в ваш локальный репозиторий, чтобы получать обновления оттуда:

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

После успешного выполнения этой команды вы сможете получать обновления из основного репозитория ClickHouse, выполнив команду `git pull upstream master`.

:::tip
Пожалуйста, не используйте дословно `git push`, вы можете отправить в неправильный удаленный репозиторий и/или в неправильную ветку. Лучше явно указывать имена удаленного репозитория и ветки, например `git push origin my_branch_name`.
:::

## Написание кода {#writing-code}

Ниже приведены несколько быстрых ссылок, которые могут быть полезны при написании кода для ClickHouse:

- [Архитектура ClickHouse](/development/architecture/).
- [Руководство по стилю кода](/development/style/).
- [Сторонние библиотеки](/development/contrib#adding-and-maintaining-third-party-libraries)
- [Написание тестов](/development/tests/)
- [Открытые проблемы](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) и [Neovim](https://neovim.io/) – два варианта, которые в прошлом хорошо работали для разработки ClickHouse. Если вы используете VS Code, мы рекомендуем использовать [расширение clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd), чтобы заменить IntelliSense, так как оно работает гораздо быстрее.

[CLion](https://www.jetbrains.com/clion/) – еще один отличный вариант. Однако он может быть медленнее на больших проектах, таких как ClickHouse. Несколько вещей, которые стоит иметь в виду при использовании CLion:

- CLion создает путь `build` самостоятельно и автоматически выбирает `debug` для типа сборки
- Он использует версию CMake, которая определена в CLion, а не установленную вами
- CLion будет использовать `make` для выполнения задач сборки вместо `ninja` (это нормально)

Другие IDE, которые вы можете использовать: [Sublime Text](https://www.sublimetext.com/), [Qt Creator](https://www.qt.io/product/development-tools) или [Kate](https://kate-editor.org/).

## Создание Pull Request {#create-a-pull-request}

Перейдите в ваш форк репозитория в интерфейсе GitHub. Если вы разрабатывали в ветке, вам нужно выбрать эту ветку. На экране будет кнопка "Pull request". По сути, это означает "создать запрос на принятие моих изменений в основной репозиторий".

Pull request можно создать даже если работа еще не завершена. В этом случае, пожалуйста, добавьте слово "WIP" (работа в процессе) в начале заголовка, его можно будет изменить позже. Это полезно для совместного ревью и обсуждения изменений, а также для запуска всех доступных тестов. Важно, чтобы вы предоставили краткое описание ваших изменений, оно позже будет использовано для генерации списка изменений в релизе.

Тестирование начнется, как только сотрудники ClickHouse пометят ваш PR тегом "можно тестировать". Результаты некоторых первых проверок (например, стиль кода) будут доступны через несколько минут. Результаты проверки сборки поступят в течение получаса. Основной набор тестов сообщит о себе в течение часа.

Система подготовит бинарные сборки ClickHouse для вашего pull request индивидуально. Чтобы получить эти сборки, нажмите на ссылку "Details" рядом с записью "Builds" в списке проверок. Там вы найдете прямые ссылки на собранные .deb пакеты ClickHouse, которые вы можете развернуть даже на своих производственных серверах (если вас это не пугает).

## Написание документации {#write-documentation}

Каждый pull request, который добавляет новую функцию, должен сопровождаться соответствующей документацией. Если вы хотите просмотреть изменения в вашей документации, инструкции по сборке страницы документации локально доступны в файле README.md [здесь](https://github.com/ClickHouse/clickhouse-docs). При добавлении новой функции в ClickHouse вы можете использовать приведенный ниже шаблон в качестве ориентира:

```markdown

# newFunctionName

A short description of the function goes here. It should describe briefly what it does and a typical usage case.

**Syntax**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**Arguments**

- `arg1` — Description of the argument. [DataType](../data-types/float.md)
- `arg2` — Description of the argument. [DataType](../data-types/float.md)
- `arg3` — Description of optional argument (optional). [DataType](../data-types/float.md)

**Implementation Details**

A description of implementation details if relevant.

**Returned value**

- Returns {insert what the function returns here}. [DataType](../data-types/float.md)

**Example**

Query:

\```sql
SELECT 'write your example query here';
\```

Response:

\```response
┌───────────────────────────────────┐
│ the result of the query           │
└───────────────────────────────────┘
\```
```

## Использование тестовых данных {#using-test-data}

Разработка ClickHouse часто требует загрузки реалистичных наборов данных. Это особенно важно для тестирования производительности. У нас есть специально подготовленный набор анонимизированных данных веб-аналитики. Для этого требуется дополнительно около 3 ГБ свободного дискового пространства.

```sh
sudo apt install wget xz-utils

wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

xz -v -d hits_v1.tsv.xz
xz -v -d visits_v1.tsv.xz

clickhouse-client
```

В clickhouse-client:

```sql
CREATE DATABASE IF NOT EXISTS test;

CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);

CREATE TABLE test.visits ( CounterID UInt32,  StartDate Date,  Sign Int8,  IsNew UInt8,  VisitID UInt64,  UserID UInt64,  StartTime DateTime,  Duration UInt32,  UTCStartTime DateTime,  PageViews Int32,  Hits Int32,  IsBounce UInt8,  Referer String,  StartURL String,  RefererDomain String,  StartURLDomain String,  EndURL String,  LinkURL String,  IsDownload UInt8,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  PlaceID Int32,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  IsYandex UInt8,  GoalReachesDepth Int32,  GoalReachesURL Int32,  GoalReachesAny Int32,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  MobilePhoneModel String,  ClientEventTime DateTime,  RegionID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  IPNetworkID UInt32,  SilverlightVersion3 UInt32,  CodeVersion UInt32,  ResolutionWidth UInt16,  ResolutionHeight UInt16,  UserAgentMajor UInt16,  UserAgentMinor UInt16,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  SilverlightVersion2 UInt8,  SilverlightVersion4 UInt16,  FlashVersion3 UInt16,  FlashVersion4 UInt16,  ClientTimeZone Int16,  OS UInt8,  UserAgent UInt8,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  NetMajor UInt8,  NetMinor UInt8,  MobilePhone UInt8,  SilverlightVersion1 UInt8,  Age UInt8,  Sex UInt8,  Income UInt8,  JavaEnable UInt8,  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  BrowserLanguage UInt16,  BrowserCountry UInt16,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  Params Array(String),  `Goals.ID` Array(UInt32),  `Goals.Serial` Array(UInt32),  `Goals.EventTime` Array(DateTime),  `Goals.Price` Array(Int64),  `Goals.OrderID` Array(String),  `Goals.CurrencyID` Array(UInt32),  WatchIDs Array(UInt64),  ParamSumPrice Int64,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  ClickLogID UInt64,  ClickEventID Int32,  ClickGoodEvent Int32,  ClickEventTime DateTime,  ClickPriorityID Int32,  ClickPhraseID Int32,  ClickPageID Int32,  ClickPlaceID Int32,  ClickTypeID Int32,  ClickResourceID Int32,  ClickCost UInt32,  ClickClientIP UInt32,  ClickDomainID UInt32,  ClickURL String,  ClickAttempt UInt8,  ClickOrderID UInt32,  ClickBannerID UInt32,  ClickMarketCategoryID UInt32,  ClickMarketPP UInt32,  ClickMarketCategoryName String,  ClickMarketPPName String,  ClickAWAPSCampaignName String,  ClickPageName String,  ClickTargetType UInt16,  ClickTargetPhraseID UInt64,  ClickContextType UInt8,  ClickSelectType Int8,  ClickOptions String,  ClickGroupBannerID Int32,  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  FirstVisit DateTime,  PredLastVisit Date,  LastVisit Date,  TotalVisits UInt32,  `TraficSource.ID` Array(Int8),  `TraficSource.SearchEngineID` Array(UInt16),  `TraficSource.AdvEngineID` Array(UInt8),  `TraficSource.PlaceID` Array(UInt16),  `TraficSource.SocialSourceNetworkID` Array(UInt8),  `TraficSource.Domain` Array(String),  `TraficSource.SearchPhrase` Array(String),  `TraficSource.SocialSourcePage` Array(String),  Attendance FixedString(16),  CLID UInt32,  YCLID UInt64,  NormalizedRefererHash UInt64,  SearchPhraseHash UInt64,  RefererDomainHash UInt64,  NormalizedStartURLHash UInt64,  StartURLDomainHash UInt64,  NormalizedEndURLHash UInt64,  TopLevelDomain UInt64,  URLScheme UInt64,  OpenstatServiceNameHash UInt64,  OpenstatCampaignIDHash UInt64,  OpenstatAdIDHash UInt64,  OpenstatSourceIDHash UInt64,  UTMSourceHash UInt64,  UTMMediumHash UInt64,  UTMCampaignHash UInt64,  UTMContentHash UInt64,  UTMTermHash UInt64,  FromHash UInt64,  WebVisorEnabled UInt8,  WebVisorActivity UInt32,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  `Market.Type` Array(UInt8),  `Market.GoalID` Array(UInt32),  `Market.OrderID` Array(String),  `Market.OrderPrice` Array(Int64),  `Market.PP` Array(UInt32),  `Market.DirectPlaceID` Array(UInt32),  `Market.DirectOrderID` Array(UInt32),  `Market.DirectBannerID` Array(UInt32),  `Market.GoodID` Array(String),  `Market.GoodName` Array(String),  `Market.GoodQuantity` Array(Int32),  `Market.GoodPrice` Array(Int64),  IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

```

Импорт данных:

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
```