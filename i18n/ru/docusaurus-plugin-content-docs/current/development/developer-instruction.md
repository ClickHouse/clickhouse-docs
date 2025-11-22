---
description: 'Предварительные требования и инструкции по настройке для разработки ClickHouse'
sidebar_label: 'Предварительные требования'
sidebar_position: 5
slug: /development/developer-instruction
title: 'Предварительные требования для разработчиков'
doc_type: 'guide'
---



# Предварительные требования

ClickHouse можно собрать под Linux, FreeBSD и macOS.
Если вы используете Windows, вы всё равно можете собрать ClickHouse в виртуальной машине под управлением Linux, например в [VirtualBox](https://www.virtualbox.org/) с Ubuntu.



## Создание репозитория на GitHub {#create-a-repository-on-github}

Для начала разработки ClickHouse вам потребуется учетная запись [GitHub](https://www.github.com/).
Также необходимо сгенерировать SSH-ключ локально (если у вас его еще нет) и загрузить публичный ключ на GitHub, так как это обязательное условие для внесения изменений.

Затем создайте форк [репозитория ClickHouse](https://github.com/ClickHouse/ClickHouse/) в своей личной учетной записи, нажав кнопку «fork» в правом верхнем углу.

Чтобы внести изменения, например исправление ошибки или новую функцию, сначала зафиксируйте свои изменения в ветке вашего форка, затем создайте «Pull Request» с изменениями в основной репозиторий.

Для работы с репозиториями Git необходимо установить Git. Например, в Ubuntu выполните:

```sh
sudo apt update
sudo apt install git
```

Шпаргалку по Git можно найти [здесь](https://education.github.com/git-cheat-sheet-education.pdf).
Подробное руководство по Git находится [здесь](https://git-scm.com/book/en/v2).


## Клонирование репозитория на машину разработки {#clone-the-repository-to-your-development-machine}

Сначала загрузите исходные файлы на вашу рабочую машину, то есть клонируйте репозиторий:

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # замените заполнитель на ваше имя пользователя GitHub
cd ClickHouse
```

Эта команда создает каталог `ClickHouse/`, содержащий исходный код, тесты и другие файлы.
Вы можете указать пользовательский каталог для размещения после URL, но важно, чтобы этот путь не содержал пробелов, так как это может нарушить сборку в дальнейшем.

Git-репозиторий ClickHouse использует подмодули для подключения сторонних библиотек.
Подмодули не извлекаются по умолчанию.
Вы можете:

- выполнить `git clone` с опцией `--recurse-submodules`,

- если `git clone` выполняется без `--recurse-submodules`, выполнить `git submodule update --init --jobs <N>` для явного извлечения всех подмодулей. (`<N>` можно установить, например, в `12` для распараллеливания загрузки.)

- если `git clone` выполняется без `--recurse-submodules` и вы хотите использовать [разреженное](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) и [поверхностное](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) извлечение подмодулей, чтобы исключить ненужные файлы и историю в подмодулях для экономии места (примерно 5 ГБ вместо примерно 15 ГБ), выполните `./contrib/update-submodules.sh`. Этот вариант используется в CI, но не рекомендуется для локальной разработки, так как делает работу с подмодулями менее удобной и более медленной.

Чтобы проверить статус подмодулей Git, выполните `git submodule status`.

Если вы получите следующее сообщение об ошибке

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

это означает, что отсутствуют SSH-ключи для подключения к GitHub.
Эти ключи обычно находятся в `~/.ssh`.
Чтобы SSH-ключи были приняты, вам необходимо загрузить их в настройках GitHub.

Вы также можете клонировать репозиторий через HTTPS:

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

Однако это не позволит вам отправлять ваши изменения на сервер.
Вы можете использовать этот способ временно и добавить SSH-ключи позже, заменив удаленный адрес репозитория с помощью команды `git remote`.

Вы также можете добавить адрес оригинального репозитория ClickHouse в ваш локальный репозиторий для получения обновлений оттуда:

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

После успешного выполнения этой команды вы сможете получать обновления из основного репозитория ClickHouse, выполнив `git pull upstream master`.

:::tip
Пожалуйста, не используйте `git push` без указания параметров — вы можете отправить изменения не в тот удаленный репозиторий и/или не в ту ветку.
Лучше явно указывать имена удаленного репозитория и ветки, например `git push origin my_branch_name`.
:::


## Написание кода {#writing-code}

Ниже приведены полезные ссылки, которые могут пригодиться при написании кода для ClickHouse:

- [Архитектура ClickHouse](/development/architecture/).
- [Руководство по стилю кода](/development/style/).
- [Сторонние библиотеки](/development/contrib#adding-and-maintaining-third-party-libraries)
- [Написание тестов](/development/tests/)
- [Открытые задачи](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) и [Neovim](https://neovim.io/) — два варианта, которые хорошо зарекомендовали себя при разработке ClickHouse. Если вы используете VS Code, рекомендуется использовать [расширение clangd](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) вместо IntelliSense, так как оно значительно производительнее.

[CLion](https://www.jetbrains.com/clion/) — ещё одна отличная альтернатива. Однако на крупных проектах, таких как ClickHouse, она может работать медленнее. При использовании CLion следует учитывать несколько моментов:

- CLion самостоятельно создаёт путь `build` и автоматически выбирает `debug` в качестве типа сборки
- Используется версия CMake, определённая в CLion, а не установленная вами
- CLion будет использовать `make` для выполнения задач сборки вместо `ninja` (это нормальное поведение)

Другие IDE, которые можно использовать: [Sublime Text](https://www.sublimetext.com/), [Qt Creator](https://www.qt.io/product/development-tools) или [Kate](https://kate-editor.org/).


## Создание pull request {#create-a-pull-request}

Перейдите к вашему форку репозитория в интерфейсе GitHub.
Если вы разрабатывали в отдельной ветке, необходимо выбрать эту ветку.
На экране будет расположена кнопка «Pull request».
По сути, это означает «создать запрос на принятие моих изменений в основной репозиторий».

Pull request можно создать, даже если работа ещё не завершена.
В этом случае добавьте слово «WIP» (work in progress) в начало заголовка — его можно будет изменить позже.
Это полезно для совместного рецензирования и обсуждения изменений, а также для запуска всех доступных тестов.
Важно предоставить краткое описание ваших изменений — оно будет использовано для формирования журнала изменений релиза.

Тестирование начнётся, как только сотрудники ClickHouse пометят ваш PR тегом «can be tested».
Результаты первых проверок (например, стиля кода) появятся в течение нескольких минут.
Результаты проверки сборки появятся в течение получаса.
Основной набор тестов завершится в течение часа.

Система подготовит бинарные сборки ClickHouse для вашего pull request индивидуально.
Чтобы получить эти сборки, нажмите на ссылку «Details» рядом с записью «Builds» в списке проверок.
Там вы найдёте прямые ссылки на собранные .deb-пакеты ClickHouse, которые можно развернуть даже на ваших продакшн-серверах (если не боитесь).


## Написание документации {#write-documentation}

Каждый pull request, добавляющий новую функциональность, должен сопровождаться соответствующей документацией.
Если вы хотите предварительно просмотреть изменения в документации, инструкции по локальной сборке страниц документации доступны в файле README.md [здесь](https://github.com/ClickHouse/clickhouse-docs).
При добавлении новой функции в ClickHouse вы можете использовать приведённый ниже шаблон в качестве руководства:


````markdown
# newFunctionName

Краткое описание функции. Должно кратко описывать её назначение и типичный сценарий использования.

**Синтаксис**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**Аргументы**

- `arg1` — Описание аргумента. [DataType](../data-types/float.md)
- `arg2` — Описание аргумента. [DataType](../data-types/float.md)
- `arg3` — Описание необязательного аргумента (опционально). [DataType](../data-types/float.md)

**Детали реализации**

Описание деталей реализации при необходимости.

**Возвращаемое значение**

- Возвращает {укажите здесь, что возвращает функция}. [DataType](../data-types/float.md)

**Пример**

Запрос:

\```sql
SELECT 'напишите здесь пример запроса';
\```

Результат:

\```response
┌───────────────────────────────────┐
│ результат запроса                 │
└───────────────────────────────────┘
\```
````


## Использование тестовых данных {#using-test-data}

Разработка ClickHouse часто требует загрузки реалистичных наборов данных.
Это особенно важно для тестирования производительности.
У нас есть специально подготовленный набор анонимизированных данных веб-аналитики.
Для этого дополнительно потребуется около 3 ГБ свободного дискового пространства.

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

```


CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);



CREATE TABLE test.visits ( CounterID UInt32, StartDate Date, Sign Int8, IsNew UInt8, VisitID UInt64, UserID UInt64, StartTime DateTime, Duration UInt32, UTCStartTime DateTime, PageViews Int32, Hits Int32, IsBounce UInt8, Referer String, StartURL String, RefererDomain String, StartURLDomain String, EndURL String, LinkURL String, IsDownload UInt8, TraficSourceID Int8, SearchEngineID UInt16, SearchPhrase String, AdvEngineID UInt8, PlaceID Int32, RefererCategories Array(UInt16), URLCategories Array(UInt16), URLRegions Array(UInt32), RefererRegions Array(UInt32), IsYandex UInt8, GoalReachesDepth Int32, GoalReachesURL Int32, GoalReachesAny Int32, SocialSourceNetworkID UInt8, SocialSourcePage String, MobilePhoneModel String, ClientEventTime DateTime, RegionID UInt32, ClientIP UInt32, ClientIP6 FixedString(16), RemoteIP UInt32, RemoteIP6 FixedString(16), IPNetworkID UInt32, SilverlightVersion3 UInt32, CodeVersion UInt32, ResolutionWidth UInt16, ResolutionHeight UInt16, UserAgentMajor UInt16, UserAgentMinor UInt16, WindowClientWidth UInt16, WindowClientHeight UInt16, SilverlightVersion2 UInt8, SilverlightVersion4 UInt16, FlashVersion3 UInt16, FlashVersion4 UInt16, ClientTimeZone Int16, OS UInt8, UserAgent UInt8, ResolutionDepth UInt8, FlashMajor UInt8, FlashMinor UInt8, NetMajor UInt8, NetMinor UInt8, MobilePhone UInt8, SilverlightVersion1 UInt8, Age UInt8, Sex UInt8, Income UInt8, JavaEnable UInt8, CookieEnable UInt8, JavascriptEnable UInt8, IsMobile UInt8, BrowserLanguage UInt16, BrowserCountry UInt16, Interests UInt16, Robotness UInt8, GeneralInterests Array(UInt16), Params Array(String), `Goals.ID` Array(UInt32), `Goals.Serial` Array(UInt32), `Goals.EventTime` Array(DateTime), `Goals.Price` Array(Int64), `Goals.OrderID` Array(String), `Goals.CurrencyID` Array(UInt32), WatchIDs Array(UInt64), ParamSumPrice Int64, ParamCurrency FixedString(3), ParamCurrencyID UInt16, ClickLogID UInt64, ClickEventID Int32, ClickGoodEvent Int32, ClickEventTime DateTime, ClickPriorityID Int32, ClickPhraseID Int32, ClickPageID Int32, ClickPlaceID Int32, ClickTypeID Int32, ClickResourceID Int32, ClickCost UInt32, ClickClientIP UInt32, ClickDomainID UInt32, ClickURL String, ClickAttempt UInt8, ClickOrderID UInt32, ClickBannerID UInt32, ClickMarketCategoryID UInt32, ClickMarketPP UInt32, ClickMarketCategoryName String, ClickMarketPPName String, ClickAWAPSCampaignName String, ClickPageName String, ClickTargetType UInt16, ClickTargetPhraseID UInt64, ClickContextType UInt8, ClickSelectType Int8, ClickOptions String, ClickGroupBannerID Int32, OpenstatServiceName String, OpenstatCampaignID String, OpenstatAdID String, OpenstatSourceID String, UTMSource String, UTMMedium String, UTMCampaign String, UTMContent String, UTMTerm String, FromTag String, HasGCLID UInt8, FirstVisit DateTime, PredLastVisit Date, LastVisit Date, TotalVisits UInt32, `TraficSource.ID` Array(Int8), `TraficSource.SearchEngineID` Array(UInt16), `TraficSource.AdvEngineID` Array(UInt8), `TraficSource.PlaceID` Array(UInt16), `TraficSource.SocialSourceNetworkID` Array(UInt8), `TraficSource.Domain` Array(String), `TraficSource.SearchPhrase` Array(String), `TraficSource.SocialSourcePage` Array(String), Attendance FixedString(16), CLID UInt32, YCLID UInt64, NormalizedRefererHash UInt64, SearchPhraseHash UInt64, RefererDomainHash UInt64, NormalizedStartURLHash UInt64, StartURLDomainHash UInt64, NormalizedEndURLHash UInt64, TopLevelDomain UInt64, URLScheme UInt64, OpenstatServiceNameHash UInt64, OpenstatCampaignIDHash UInt64, OpenstatAdIDHash UInt64, OpenstatSourceIDHash UInt64, UTMSourceHash UInt64, UTMMediumHash UInt64, UTMCampaignHash UInt64, UTMContentHash UInt64, UTMTermHash UInt64, FromHash UInt64, WebVisorEnabled UInt8, WebVisorActivity UInt32, `ParsedParams.Key1` Array(String), `ParsedParams.Key2` Array(String), `ParsedParams.Key3` Array(String), `ParsedParams.Key4` Array(String), `ParsedParams.Key5` Array(String), `ParsedParams.ValueDouble` Array(Float64), `Market.Type` Array(UInt8), `Market.GoalID` Array(UInt32), `Market.OrderID` Array(String), `Market.OrderPrice` Array(Int64), `Market.PP` Array(UInt32), `Market.DirectPlaceID` Array(UInt32), `Market.DirectOrderID` Array(UInt32), `Market.DirectBannerID` Array(UInt32), `Market.GoodID` Array(String), `Market.GoodName` Array(String), `Market.GoodQuantity` Array(Int32), `Market.GoodPrice` Array(Int64), IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

````

Импортируйте данные:

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
````
