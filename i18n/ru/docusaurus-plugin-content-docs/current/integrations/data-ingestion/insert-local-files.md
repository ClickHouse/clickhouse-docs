---
sidebar_label: 'Загрузка локальных файлов'
sidebar_position: 2
title: 'Загрузка локальных файлов'
slug: /integrations/data-ingestion/insert-local-files
description: 'Узнайте, как загружать локальные файлы'
show_related_blogs: true
doc_type: 'guide'
keywords: ['загрузка локальных файлов в ClickHouse', 'импорт локальных файлов в ClickHouse', 'загрузка файлов через clickhouse-client']
---

# Вставка локальных файлов {#insert-local-files}

Вы можете использовать `clickhouse-client` для потоковой загрузки локальных файлов в сервис ClickHouse. Это позволяет предварительно обрабатывать данные с помощью множества мощных и удобных функций ClickHouse. Рассмотрим пример...

1. Предположим, у нас есть TSV‑файл с именем `comments.tsv`, который содержит комментарии с сайта Hacker News, а в строке заголовка указаны имена столбцов. При вставке данных необходимо указать [формат входных данных](/interfaces/formats), в нашем случае это `TabSeparatedWithNames`:

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     "Изначально это сравнение несопоставимых вещей. С содержанием тюремного населения связаны расходы на обеспечение безопасности. Нужны персонал, инфраструктура, оборудование и т. д., чтобы управлять поведением заключённых (предотвращать драки и т. п.) и не допускать побегов. Эти две вещи преследуют разные цели, поэтому, разумеется, их стоимость тоже будет разной.<p>Это как сказать, что холодильник дороже микроволновки. Это ни о чём не говорит, потому что они предназначены для разных задач."   []
19464461        comment sneakernets     2019-03-22 17:01:10     "Потому что научная база настолько прочная, что дальше это уже выглядит как избитая мёртвая лошадь.<p>Но с антипрививочниками это как сказать человеку, что красное яблоко в его руке — красное, а он настаивает, что оно зелёное. С такими людьми нельзя спорить «по сути»." [19464582]
19465288        comment derefr  2019-03-22 18:15:21     "Потому что мы говорим о терминах backend-deployment+ops-жаргона «website» и «webapp», а не об их общем употреблении. У слов могут быть точные жаргонные значения, <i>которые отличаются</i> в разных дисциплинах. Именно здесь люди из ops обычно проводят черту: web<i>site</i> — это то, что можно развернуть, например, в бакете S3, и оно будет полноценно функционировать без каких‑либо дополнительных зависимостей, которые вам нужно поддерживать. <i>Webapp</i> — это то, что <i>имеет</i> такие зависимости, которые нужно настраивать и поддерживать — например, слой базы данных.<p>Но даже помимо этого, я определяю термины так из‑за префикса «web». Webapp — это не «приложение в интернете», а скорее «приложение, работающее за счёт веба». Полностью офлайн SPA на JavaScript, которая просто <i>отдаётся через</i> веб, <i>не является</i> web‑приложением. Это просто программа, которая запускается в браузере, так же как апплеты Flash, ActiveX или Java — программы, запускающиеся в браузере. (Является ли флеш‑игра «web‑игрой»? Обычно её считают <i>браузерной игрой</i>, но это не то же самое.)<p>У нас уже есть термин для того, чем являются апплеты {Flash, ActiveX, Java}: apps — приложения. Офлайн SPA на JavaScript — это тоже просто приложения. Нам не нужно добавлять префикс «web»; здесь он лишний. В любом из этих случаев, если вы возьмёте ту же программу и упакуете её в оболочку Electron вместо размещения в домен‑фронтованном бакете S3, она явно не станет «web app» ни в каком смысле. Ваша SPA останется «JavaScript‑<i>приложением</i>, использующим DOM браузера как графический тулкит». И это будет так же верно до упаковки в Electron.<p>Итак, «web app» имеет конкретное значение, выходящее за рамки просто «app». Нужно нечто дополнительное. Это дополнительное — бэкенд, с которым ваш браузер — управляемый логикой приложения — взаимодействует <i>через веб</i>. Именно это делает приложение «web‑приложением». (Это определение намеренно охватывает как серверный рендер динамического HTML, так и клиентские SPA на JavaScript. Вам не обязательно иметь фронтенд‑<i>приложение</i>; достаточно <i>web‑бэкенда</i>, с которым что‑то взаимодействует. Этим «чем‑то» может быть сам браузер, кликая по ссылкам и отправляя формы, либо JavaScript‑фронтенд с AJAX.)<p>«Web site» тогда — это «web app» без части «app». Если из приведённого выше определения ясно, что такое «app» и что такое «web app», то можно вычесть одно из другого и получить определение «web not‑app». Это и есть сайт: нечто, работающее за счёт web‑бэкенда, но не выполняющее функций приложения. Если считать, что «функции приложения» — это по сути «хранение состояния», то «site» — это «приложение» без постоянного состояния.<p>И поскольку определение «web» здесь связано с бэкендом, различие между «web app» и «web site» (web not‑app) вероятно определяется свойствами бэкенда — то есть способностью web‑бэкенда хранить состояние. Таким образом, «web site» — это «web app», в котором бэкенд не выполняет приложенческих функций, то есть не хранит состояние."       []
19465534        comment bduerst 2019-03-22 18:36:40     "Включая Apple: <a href=""https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy"" rel=""nofollow"">https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-...</a>"        []
19466269        comment CalChris        2019-03-22 19:55:13     "&gt; У него тот же процессор A12 ... с 3 ГБ оперативной памяти на <i>system-on-a-chip</i><p>На самом деле это <i>package‑on‑package</i>. Микросхема LPDDR4X DRAM приклеена (точнее, припаяна оплавлением) к обратной стороне A12 Bionic.<p><a href=""https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blog&#x2F;apple-iphone-xs-teardown&#x2F;"" rel=""nofollow"">https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blo...</a><p><a href=""https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package"" rel=""nofollow"">https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package</a>"       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     "&gt;&gt;<i>Безумие в том, что вы не можете взять землю, на которой стоит автодом, и построить на ней студию.</i><p>Несопоставимые вещи. Разрешение на строительство студии делает это здание легитимным, вроде как навсегда. Автодом же можно убрать новым законом или просто начав строже применять существующие законы."      []
19467048        comment karambahh       2019-03-22 21:15:41     "По-моему, вы здесь сравниваете несопоставимые вещи.<p>Если вы забираете парковочное место под другое использование (например, строите жильё для семей или приют для животных), вы ничего не отнимаете у машины: это дорогой, большой кусок металла, который не обладает сознанием.<p>Дальше вы скажете, что вы лишаете автовладельцев удобства — возможности парковать свои машины где им угодно. Меня вполне устраивает лишить автовладельцев этого удобства, если это позволяет какому‑то человеку иметь крышу над головой. (говорю из личного опыта, так как всего несколько минут назад мне пришлось припарковать машину в километре от дома, потому что город сейчас строит жильё и ограничил парковочные места поблизости)<p>Затем кто‑то может возразить, что помогать животным стыдно, пока страдают люди. Это ровно та же линия мышления, что и «мы не можем впускать больше мигрантов, мы должны заботиться о своих &quot;собственных&quot; бездомных».<p>Это ложная дихотомия. Неравенство в западных обществах становится всё больше и больше. То, что я пытаюсь внести свою лепту, незначительно. То, что я жертвую на помощь людям или животным, — лишь небольшая вмятина в горах неравенства, на вершине которых мы живём. Но мы вместе действительно что‑то меняем — жертвуя, голосуя и в целом не закрывая глаза на мир, в котором живём...<p>Наконец, сугубо анекдотический взгляд: я не раз видел, как крайне бедные люди изо всех сил старались проявить солидарность по отношению к животным или людям. Я также видел огромное количество чрезвычайно богатых людей, которые жаловались, что бедные доставляют им неудобства просто своим существованием, при этом их богатство было прямым следствием того, что их предки эксплуатировали тех самых бедных людей."      [19467512]
```

2. Давайте создадим таблицу для данных из Hacker News:

```sql
CREATE TABLE hackernews (
    id UInt32,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    children Array(UInt32),
    tokens Array(String)
)
ENGINE = MergeTree
ORDER BY toYYYYMMDD(timestamp)
```

3. Мы хотим привести к нижнему регистру столбец `author`, что легко сделать с помощью функции [`lower`](/sql-reference/functions/string-functions#lower). Мы также хотим разбить строку `comment` на токены и сохранить результат в столбце `tokens`, что можно сделать с помощью функции [`extractAll`](/sql-reference/functions/string-search-functions#extractAll). Всё это выполняется одной командой `clickhouse-client` — обратите внимание, как файл `comments.tsv` передаётся на вход `clickhouse-client` с использованием оператора `<`:

```bash
clickhouse-client \
    --host avw5r4qs3y.us-east-2.aws.clickhouse.cloud \
    --secure \
    --port 9440 \
    --password Myp@ssw0rd \
    --query "
    INSERT INTO hackernews
    SELECT
        id,
                type,
                lower(author),
                timestamp,
                comment,
                children,
                extractAll(comment, '\\w+') as tokens
    FROM input('id UInt32, type String, author String, timestamp DateTime, comment String, children Array(UInt32)')
    FORMAT TabSeparatedWithNames
" < comments.tsv
```

:::note
Функция `input` здесь полезна, поскольку позволяет преобразовывать данные в момент их вставки в таблицу `hackernews`. Аргументом `input` является формат входящих сырых данных, и вы встретите его во многих других табличных функциях (где задаёте схему для входящих данных).
:::

4. Вот и всё! Данные уже в ClickHouse:

```sql
SELECT *
FROM hackernews
LIMIT 7
```

Результат:

```response
│  488 │ comment │ mynameishere │ 2007-02-22 14:48:18 │ «Жаль. Javascript-в-браузере и Ajax — это оба грязные хаки, которые заставляют программистов делать всевозможные постыдные вещи. И результатом становятся кривоватые HTML‑фокусы. Java, при всех своих недостатках, достаточно чиста, когда запускается в среде апплета. У неё есть все преимущества перед JITBAJAX, за исключением проблем с установкой и тяжёлого процесса загрузки. Yahoo games, похоже, едва ли не единственная успешная история с апплетами. Конечно, раньше сколько-нибудь сложные апплеты обычно были слишком большими для dial‑up‑аккаунтов, которые были у людей. Сейчас, по крайней мере, это уже не так.» │ [454927] │ ['It','s','too','bad','Javascript','in','the','browser','and','Ajax','are','both','nasty','hacks','that','force','programmers','to','do','all','sorts','of','shameful','things','And','the','result','is','wanky','html','tricks','Java','for','its','faults','is','fairly','clean','when','run','in','the','applet','environment','It','has','every','superiority','over','JITBAJAX','except','for','install','issues','and','a','chunky','load','process','Yahoo','games','seems','like','just','about','the','only','applet','success','story','Of','course','back','in','the','day','non','trivial','Applets','tended','to','be','too','large','for','the','dial','up','accounts','people','had','At','least','that','is','changed'] │
│  575 │ comment │ leoc         │ 2007-02-23 00:09:49 │ «Сейчас я не могу найти ссылку, но, *кажется*, только что читал что‑то, из чего следует, что процесс установки апплета Apollo будет включать диалог подтверждения вида &#34;install-this-application?&#34; с последующей загрузкой примерно на 30 секунд. Если так, то Apollo менее многообещающ, чем я надеялся. Такой тип установки может считаться малообременительным по меркам настольных приложений, но он не сравним с лёгкостью запуска браузерного AJAX‑ или Flash‑приложения. (Подумайте, насколько просто впервые воспользоваться maps.google.com.)<p>Наверняка хотя бы будет так, что приложения Apollo по умолчанию запускаются в недоверенном режиме (untrusted), а уже установленное приложение будет запускаться автоматически, когда вы откроете в браузере URL, с которого его скачали?» │ [455071] │ ['I','can','t','find','the','reference','now','but','I','think','I','ve','just','read','something','suggesting','that','the','install','process','for','an','Apollo','applet','will','involve','an','34','install','this','application','34','confirmation','dialog','followed','by','a','download','of','30','seconds','or','so','If','so','then','Apollo','s','less','promising','than','I','hoped','That','kind','of','install','may','be','low','friction','by','desktop','app','standards','but','it','doesn','t','compare','to','the','ease','of','starting','a','browser','based','AJAX','or','Flash','application','Consider','how','easy','it','is','to','use','maps','google','com','for','the','first','time','p','Surely','it','will','at','least','be','that','Apollo','applications','will','run','untrusted','by','default','and','that','an','already','installed','app','will','start','automatically','whenever','you','take','your','browser','to','the','URL','you','downloaded','it','from'] │
│ 3110 │ comment │ davidw       │ 2007-03-09 09:19:58 │ «Мне очень интересно, что это за штука — tsumobi, потому что по сути это ровно то, чем является Hecl ( http://www.hecl.org ). Я, правда, в каком‑то смысле уже отказался от идеи зарабатывать на нём напрямую, полагая, что его преимущество — просто в том, чтобы можно было гораздо быстрее разрабатывать приложения. Например, я смог за несколько минут прототипировать ShopList ( http://shoplist.dedasys.com ) с его помощью.<p>Правка: кстати, я бы с удовольствием пообщался с ребятами из Tsumobi. Это хорошая идея — возможно, есть общие элементы, которые можно переиспользовать в/добавить к Hecl, который является ПО с открытым исходным кодом и очень либеральной лицензией, то есть вы можете взять его и включить даже в «коммерческие» приложения.<p>Я действительно считаю, что «общие» части в такой области должны быть либо бесплатными, либо открытыми (вспомните браузеры, HTML, JavaScript, Java‑апплеты и т. д.), и что именно там денег нет.» │ [3147]   │ ['I','m','very','curious','about','this','tsumobi','thing','as','it','s','basically','exactly','what','Hecl','is','http','www','hecl','org','I','d','sort','of','abbandoned','it','as','an','idea','for','making','any','money','with','directly','though','figuring','the','advantage','was','just','to','be','able','to','develop','applications','a','lot','faster','I','was','able','to','prototype','ShopList','http','shoplist','dedasys','com','in','a','few','minutes','with','it','for','example','p','Edit','BTW','I','d','certainly','be','interested','in','chatting','with','the','Tsumobi','folks','It','s','a','good','idea','perhaps','there','are','elements','in','common','that','can','be','reused','from','added','to','Hecl','which','is','open','source','under','a','very','liberal','license','meaning','you','can','take','it','and','include','it','even','in','commercial','apps','p','I','really','think','that','the','common','bits','in','a','space','like','that','have','to','be','either','free','or','open','source','think','about','browsers','html','javascript','java','applets','etc','and','that','that','s','not','where','the','money','is'] │
│ 4016 │ comment │ mynameishere │ 2007-03-13 22:56:53 │ «http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=2853515&CatId=2511<p>Против<p>http://store.apple.com/1-800-MY-APPLE/WebObjects/AppleStore?family=MacBookPro<p>Это сопоставимые системы, но у Apple, как я уже сказал, наценка примерно 800 долларов. Фактически самый дешёвый MacBook Pro стоит столько же, сколько топовый Toshiba. Если вы хорошо зарабатываете, это не проблема. Но когда девушка в кофейне спрашивает меня, какой компьютер ей взять при её минимальной зарплате, я выгляжу последним подлецом, если рекомендую ей Apple.» │ []       │ ['http','www','tigerdirect','com','applications','SearchTools','item','details','asp','EdpNo','2853515','CatId','2511','p','Versus','p','http','store','apple','com','1','800','MY','APPLE','WebObjects','AppleStore','family','MacBookPro','p','These','are','comparable','systems','but','the','Apple','has','as','I','said','roughly','an','800','dollar','premium','Actually','the','cheapest','macbook','pro','costs','the','same','as','the','high','end','Toshiba','If','you','make','good','money','it','s','not','a','big','deal','But','when','the','girl','in','the','coffeehouse','asks','me','what','kind','of','computer','she','should','get','to','go','along','with','her','minimum','wage','I','m','basically','scum','to','recommend','an','Apple'] │
│ 4568 │ comment │ jwecker      │ 2007-03-16 13:08:04 │ Я знаю это чувство. То же самое чувство у меня было тогда, когда люди ещё писали Java‑апплеты. Может быть, обычный пользователь его не испытывает — может, это наш внутренний программист понимает, что между мной и браузером работает большой дополнительный слой...                 │ []       │ ['I','know','the','feeling','The','same','feeling','I','had','back','when','people','were','still','writing','java','applets','Maybe','a','normal','user','doesn','t','feel','it','maybe','it','s','the','programmer','in','us','knowing','that','there','s','a','big','layer','running','between','me','and','the','browser'] │
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "Суть Ajax заключается в том, чтобы заставить JavaScript взаимодействовать с сервером без перезагрузки страницы. Хотя XmlHttpRequest наиболее удобен, до его появления существовали и другие способы сделать это, такие как <p>- загрузка изображения размером 1 пиксель и передача данных через cookie этого изображения<p>- загрузка данных с сервера через крошечный фрейм, который содержал XML или данные JavaScript<p>- использование Java‑апплета для выборки данных от имени JavaScript" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "Это как раз та вещь, которая не так уж очевидна. Складывается впечатление, что как только разбогатеешь, появляется новый набор правил, по которым нужно жить. Жаль, что всем приходится заново переучиваться этим вещам, потому что несколько паршивых яблок не в силах совладать со своей завистью.<p>Очень приятно слышать, что это уже где‑то в очереди ваших эссе. Постараюсь не разбогатеть раньше, чем вы его напишете, чтобы иметь хоть какое‑то представление, чего ожидать :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. Другой вариант — использовать утилиту вроде `cat`, чтобы передать содержимое файла в `clickhouse-client` потоком. Например, следующая команда даст тот же результат, что и использование оператора `<`:

```bash
cat comments.tsv | clickhouse-client \
    --host avw5r4qs3y.us-east-2.aws.clickhouse.cloud \
    --secure \
    --port 9440 \
    --password Myp@ssw0rd \
    --query "
    INSERT INTO hackernews
    SELECT
        id,
                type,
                lower(author),
                timestamp,
                comment,
                children,
                extractAll(comment, '\\w+') as tokens
    FROM input('id UInt32, type String, author String, timestamp DateTime, comment String, children Array(UInt32)')
    FORMAT TabSeparatedWithNames
"
```

Перейдите на [страницу документации по `clickhouse-client`](/interfaces/cli), чтобы получить подробную информацию об установке `clickhouse-client` в вашей операционной системе.
