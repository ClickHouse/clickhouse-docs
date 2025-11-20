---
sidebar_label: 'Загрузка локальных файлов'
sidebar_position: 2
title: 'Загрузка локальных файлов'
slug: /integrations/data-ingestion/insert-local-files
description: 'Узнайте о загрузке локальных файлов'
show_related_blogs: true
doc_type: 'guide'
keywords: ['insert local files ClickHouse', 'ClickHouse local file import', 'clickhouse-client file upload']
---

# Вставка локальных файлов

Вы можете использовать `clickhouse-client`, чтобы передавать локальные файлы в ваш сервис ClickHouse. Это позволяет предварительно обрабатывать данные с помощью множества мощных и удобных функций ClickHouse. Рассмотрим пример…

1. Предположим, у нас есть TSV‑файл `comments.tsv`, который содержит некоторые комментарии с Hacker News, а строка заголовка содержит имена столбцов. При вставке данных необходимо указать [формат ввода](/interfaces/formats), который в нашем случае — `TabSeparatedWithNames`:

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     "Это как сравнивать яблоки с апельсинами. Существуют расходы на безопасность, связанные с содержанием заключенных. Нужен персонал, помещения, оборудование и т.д. для управления поведением заключенных (предотвращение драк и т.д.) и предотвращения побегов. У этих двух вещей разные задачи, поэтому, естественно, у них будут разные затраты.<p>Это как сказать, что холодильник дороже микроволновки. Это ничего не значит, потому что они выполняют разные функции."   []
19464461        comment sneakernets     2019-03-22 17:01:10     "Потому что наука настолько убедительна, что дальнейшие доказательства уже излишни.<p>Но с антипрививочниками это как говорить кому-то, что красное яблоко, которое вы держите, красное, а они настаивают, что оно зеленое. С такими людьми невозможно спорить о &quot;достоинствах&quot;." [19464582]
19465288        comment derefr  2019-03-22 18:15:21     "Потому что мы говорим о терминах жаргона бэкенд-развертывания и эксплуатации &quot;website&quot; и &quot;webapp&quot;, а не об их общем использовании. Слова могут иметь точные жаргонные значения, <i>которые различаются</i> в разных дисциплинах. Вот где специалисты по эксплуатации обычно проводят границу: web<i>site</i> — это то, что можно развернуть, например, в корзине S3, и оно будет полностью функциональным, без других зависимостей, которые нужно поддерживать. <i>Webapp</i> — это то, что <i>имеет</i> такие зависимости, которые нужно настроить и поддерживать — например, слой базы данных.<p>Но даже не учитывая это, я также определяю термины таким образом из-за префикса &quot;web&quot;. Webapp — это не &quot;приложение в вебе&quot;, а скорее &quot;приложение, работающее на основе веба&quot;. Полностью офлайновое JavaScript SPA, которое просто <i>обслуживается через</i> веб, <i>не является</i> веб-приложением. Это просто программа, которая работает в браузере, точно так же, как Flash, ActiveX или Java-апплет — это программа, которая работает в браузере. (Является ли Flash-игра &quot;веб-игрой&quot;? Обычно она считается <i>браузерной игрой</i>, но это не одно и то же.)<p>У нас уже есть термин для того, чем являются апплеты {Flash, ActiveX, Java}: приложения. Офлайновые JavaScript SPA — это тоже просто приложения. Не нужно добавлять префикс &quot;web&quot;; здесь он бессмысленен. В любом из этих случаев, если взять точно такую же программу и поместить её в обертку Electron вместо корзины S3 с доменным фронтом, она явно не будет &quot;веб-приложением&quot; ни в каком смысле. Ваше SPA будет просто &quot;JavaScript-<i>приложением</i>, которое использует DOM браузера в качестве графического инструментария&quot;. Ну, это так же верно до того, как поместить его в обертку Electron.<p>Таким образом, &quot;веб-приложение&quot; имеет конкретное значение, выходящее за рамки &quot;приложения&quot;. Нужно что-то дополнительное. Это дополнительное — бэкенд, с которым браузер — управляемый логикой приложения — взаимодействует <i>через веб</i>. Вот что делает приложение &quot;веб-приложением&quot;. (Это определение намеренно охватывает как динамический HTML, отрисовываемый на сервере, так и JavaScript SPA-приложения, отрисовываемые на клиенте. Не нужно фронтенд-<i>приложение</i>; нужен просто <i>веб-бэкенд</i>, с которым что-то взаимодействует. Это что-то может быть браузер напрямую, через переход по ссылкам и отправку форм; или это может быть JavaScript-фронтенд, использующий AJAX.)<p>&quot;Веб-сайт&quot; — это &quot;веб-приложение&quot; без части &quot;приложение&quot;. Если из приведенного выше определения ясно, что такое &quot;приложение&quot; и что такое &quot;веб-приложение&quot;, то можно вычесть одно из другого, чтобы получить определение &quot;веб-не-приложения&quot;. Это веб-сайт: что-то, работающее на основе веб-бэкенда, которое не выполняет никаких функций приложения. Если решить, что &quot;функции приложения&quot; — это в основном &quot;хранение состояния&quot;, то &quot;сайт&quot; — это &quot;приложение&quot; без постоянного состояния.<p>И поскольку определение &quot;веб&quot; здесь касается бэкенда, то разница между &quot;веб-приложением&quot; и &quot;веб-сайтом&quot; (веб-не-приложением) вероятно определяется свойствами бэкенда. Таким образом, разница в способности веб-бэкенда хранить состояние. Итак, &quot;веб-сайт&quot; — это &quot;веб-приложение&quot;, где бэкенд не выполняет функций приложения — т.е. не хранит состояние."       []
19465534        comment bduerst 2019-03-22 18:36:40     "Включая Apple: <a href=""https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy"" rel=""nofollow"">https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-...</a>"        []
19466269        comment CalChris        2019-03-22 19:55:13     "&gt; Он имеет тот же процессор A12 ... с 3 ГБ оперативной памяти на <i>системе-на-кристалле</i><p>На самом деле это <i>корпус-на-корпусе</i>. LPDDR4X DRAM припаяна оплавлением к задней части A12 Bionic.<p><a href=""https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blog&#x2F;apple-iphone-xs-teardown&#x2F;"" rel=""nofollow"">https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blo...</a><p><a href=""https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package"" rel=""nofollow"">https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package</a>"       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     "&gt;&gt;<i>Безумие здесь в том, что вы не можете взять землю, на которой стоит автодом, и построить на ней студию.</i><p>Это как сравнивать яблоки с апельсинами. Разрешение на строительство студии делает это здание законным, практически навсегда. Автодом же можно выгнать новым законом или просто применяя существующие законы."      []
19467048        comment karambahh       2019-03-22 21:15:41     "Я думаю, вы здесь сравниваете яблоки с апельсинами.<p>Если вы перепрофилируете парковочное место под другие нужды (например, для строительства жилья для семей или приюта для животных), вы не лишаете автомобиль чего-либо — это дорогой, большой кусок металла, который не обладает разумом.<p>Далее вы скажете, что лишаете владельцев автомобилей возможности парковать свои машины где угодно. Я вполне готов лишить владельцев автомобилей этого удобства, чтобы у человека была крыша над головой. (говорю из личного опыта, так как буквально несколько минут назад мне пришлось припарковать машину в 1 км от дома, потому что город сейчас строит жилье и ограничил парковочное пространство поблизости)<p>Затем некоторые могут утверждать, что стыдно помогать животным, пока страдают люди. Это точно такая же логика, как «мы не можем принять больше мигрантов, мы должны позаботиться о &quot;своих&quot; бездомных».<p>Это ложная дихотомия. Неравенство в западных обществах растет все больше и больше. Моя попытка внести свой вклад незначительна. Мои пожертвования на помощь людям или животным — это небольшая царапина на горах неравенства, на которых мы живем. Но все мы вместе действительно меняем ситуацию, делая пожертвования, голосуя и в целом не закрывая глаза на мир, в котором мы живем...<p>Наконец, полностью субъективное мнение: я несколько раз был свидетелем того, как крайне бедные люди изо всех сил проявляли солидарность с животными или людьми. Я также был свидетелем того, как множество чрезвычайно богатых людей жаловались на то, что бедные доставляют им неудобства одним своим присутствием, и чье богатство было прямым следствием эксплуатации их предками тех самых бедных людей."      [19467512]
```

2. Создадим таблицу для данных из Hacker News:

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

3. Мы хотим привести значения в столбце `author` к нижнему регистру, что легко сделать с помощью [функции `lower`](/sql-reference/functions/string-functions#lower). Мы также хотим разбить строку `comment` на токены и сохранить результат в столбце `tokens`, что можно сделать с помощью [функции `extractAll`](/sql-reference/functions/string-search-functions#extractAll). Всё это выполняется одной командой `clickhouse-client` — обратите внимание, как файл `comments.tsv` перенаправляется в `clickhouse-client` с помощью оператора `<`:

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
Функция `input` здесь полезна, поскольку позволяет преобразовывать данные в момент их вставки в таблицу `hackernews`. Аргументом `input` является формат входящих сырых данных, и вы встретите его во многих других табличных функциях (где задаётся схема для входящих данных).
:::

4. Вот и всё! Данные уже в ClickHouse:

```sql
SELECT *
FROM hackernews
LIMIT 7
```

Результат:


```response
│  488 │ comment │ mynameishere │ 2007-02-22 14:48:18 │ "It's too bad. Javascript-in-the-browser and Ajax are both nasty hacks that force programmers to do all sorts of shameful things. And the result is--wanky html tricks. Java, for its faults, is fairly clean when run in the applet environment. It has every superiority over JITBAJAX, except for install issues and a chunky load process. Yahoo games seems like just about the only applet success story. Of course, back in the day, non-trivial Applets tended to be too large for the dial-up accounts people had. At least that is changed." │ [454927] │ ['It','s','too','bad','Javascript','in','the','browser','and','Ajax','are','both','nasty','hacks','that','force','programmers','to','do','all','sorts','of','shameful','things','And','the','result','is','wanky','html','tricks','Java','for','its','faults','is','fairly','clean','when','run','in','the','applet','environment','It','has','every','superiority','over','JITBAJAX','except','for','install','issues','and','a','chunky','load','process','Yahoo','games','seems','like','just','about','the','only','applet','success','story','Of','course','back','in','the','day','non','trivial','Applets','tended','to','be','too','large','for','the','dial','up','accounts','people','had','At','least','that','is','changed'] │
│  575 │ comment │ leoc         │ 2007-02-23 00:09:49 │ "I can't find the reference now, but I *think* I've just read something suggesting that the install process for an Apollo applet will involve an &#34;install-this-application?&#34; confirmation dialog followed by a download of 30 seconds or so. If so then Apollo's less promising than I hoped. That kind of install may be low-friction by desktop-app standards but it doesn't compare to the ease of starting a browser-based AJAX or Flash application. (Consider how easy it is to use maps.google.com for the first time.)<p>Surely it will at least be that Apollo applications will run untrusted by default, and that an already-installed app will start automatically whenever you take your browser to the URL you downloaded it from?" │ [455071] │ ['I','can','t','find','the','reference','now','but','I','think','I','ve','just','read','something','suggesting','that','the','install','process','for','an','Apollo','applet','will','involve','an','34','install','this','application','34','confirmation','dialog','followed','by','a','download','of','30','seconds','or','so','If','so','then','Apollo','s','less','promising','than','I','hoped','That','kind','of','install','may','be','low','friction','by','desktop','app','standards','but','it','doesn','t','compare','to','the','ease','of','starting','a','browser','based','AJAX','or','Flash','application','Consider','how','easy','it','is','to','use','maps','google','com','for','the','first','time','p','Surely','it','will','at','least','be','that','Apollo','applications','will','run','untrusted','by','default','and','that','an','already','installed','app','will','start','automatically','whenever','you','take','your','browser','to','the','URL','you','downloaded','it','from'] │
│ 3110 │ comment │ davidw       │ 2007-03-09 09:19:58 │ "I'm very curious about this tsumobi thing, as it's basically exactly what Hecl is ( http://www.hecl.org ).  I'd sort of abbandoned it as an idea for making any money with directly, though, figuring the advantage was just to be able to develop applications a lot faster.  I was able to prototype ShopList ( http://shoplist.dedasys.com ) in a few minutes with it, for example.<p>Edit: BTW, I'd certainly be interested in chatting with the Tsumobi folks.  It's a good idea - perhaps there are elements in common that can be reused from/added to Hecl, which is open source under a very liberal license, meaning you can take it and include it even in 'commercial' apps.<p>I really think that the 'common' bits in a space like that have to be either free or open source (think about browsers, html, JavaScript, java applets, etc...), and that that's not where the money is." │ [3147]   │ ['I','m','very','curious','about','this','tsumobi','thing','as','it','s','basically','exactly','what','Hecl','is','http','www','hecl','org','I','d','sort','of','abbandoned','it','as','an','idea','for','making','any','money','with','directly','though','figuring','the','advantage','was','just','to','be','able','to','develop','applications','a','lot','faster','I','was','able','to','prototype','ShopList','http','shoplist','dedasys','com','in','a','few','minutes','with','it','for','example','p','Edit','BTW','I','d','certainly','be','interested','in','chatting','with','the','Tsumobi','folks','It','s','a','good','idea','perhaps','there','are','elements','in','common','that','can','be','reused','from','added','to','Hecl','which','is','open','source','under','a','very','liberal','license','meaning','you','can','take','it','and','include','it','even','in','commercial','apps','p','I','really','think','that','the','common','bits','in','a','space','like','that','have','to','be','either','free','or','open','source','think','about','browsers','html','javascript','java','applets','etc','and','that','that','s','not','where','the','money','is'] │
│ 4016 │ comment │ mynameishere │ 2007-03-13 22:56:53 │ "http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=2853515&CatId=2511<p>Versus<p>http://store.apple.com/1-800-MY-APPLE/WebObjects/AppleStore?family=MacBookPro<p>These are comparable systems, but the Apple has, as I said, roughly an 800 dollar premium. Actually, the cheapest macbook pro costs the same as the high-end Toshiba. If you make good money, it's not a big deal. But when the girl in the coffeehouse asks me what kind of computer she should get to go along with her minimum wage, I'm basically scum to recommend an Apple." │ []       │ ['http','www','tigerdirect','com','applications','SearchTools','item','details','asp','EdpNo','2853515','CatId','2511','p','Versus','p','http','store','apple','com','1','800','MY','APPLE','WebObjects','AppleStore','family','MacBookPro','p','These','are','comparable','systems','but','the','Apple','has','as','I','said','roughly','an','800','dollar','premium','Actually','the','cheapest','macbook','pro','costs','the','same','as','the','high','end','Toshiba','If','you','make','good','money','it','s','not','a','big','deal','But','when','the','girl','in','the','coffeehouse','asks','me','what','kind','of','computer','she','should','get','to','go','along','with','her','minimum','wage','I','m','basically','scum','to','recommend','an','Apple'] │
│ 4568 │ comment │ jwecker      │ 2007-03-16 13:08:04 │ I know the feeling.  The same feeling I had back when people were still writing java applets.  Maybe a normal user doesn't feel it- maybe it's the programmer in us knowing that there's a big layer running between me and the browser...                 │ []       │ ['I','know','the','feeling','The','same','feeling','I','had','back','when','people','were','still','writing','java','applets','Maybe','a','normal','user','doesn','t','feel','it','maybe','it','s','the','programmer','in','us','knowing','that','there','s','a','big','layer','running','between','me','and','the','browser'] │
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "The essence of Ajax is getting Javascript to communicate with the server without reloading the page. Although XmlHttpRequest is most convenient, there were other methods of doing this before XmlHttpRequest such as <p>- loading a 1 pixel image and sending data in the image's cookie<p>- loading server data through a tiny frame which contained XML or javascipt data<p>- Using a java applet to fetch the data on behalf of javascript" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "Well this is exactly the kind of thing that isn't very obvious. It sounds like once you're wealthy there's a new set of rules you have to live by. It's a shame everyone has had to re-learn these things for themselves because a few bad apples can control their jealousy.<p>Very good to hear it's somewhere in your essay queue though. I'll try not to get rich before you write it, so I have some idea of what to expect :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. Другой вариант — использовать утилиту `cat`, чтобы передать содержимое файла в `clickhouse-client` потоком. Например, следующая команда даёт тот же результат, что и использование оператора `<`:

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

Перейдите на [страницу документации по `clickhouse-client`](/interfaces/cli), чтобы узнать, как установить `clickhouse-client` в вашей операционной системе.
