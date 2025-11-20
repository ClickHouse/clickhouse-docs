---
sidebar_label: '导入本地文件'
sidebar_position: 2
title: '导入本地文件'
slug: /integrations/data-ingestion/insert-local-files
description: '了解如何导入本地文件'
show_related_blogs: true
doc_type: 'guide'
keywords: ['insert local files ClickHouse', 'ClickHouse local file import', 'clickhouse-client file upload']
---

# 插入本地文件

你可以使用 `clickhouse-client` 将本地文件以流的方式导入到 ClickHouse 服务中。这样你就可以利用众多强大且便捷的 ClickHouse 函数对数据进行预处理。下面来看一个示例……

1. 假设我们有一个名为 `comments.tsv` 的 TSV 文件，其中包含一些 Hacker News 评论，并且首行表头包含列名。插入数据时需要指定一个[输入格式](/interfaces/formats)，在我们的示例中是 `TabSeparatedWithNames`：

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     “首先，这根本就是苹果和橙子的比较。监狱人口会带来相关的安全开支。你需要员工、设施、设备等来管理囚犯的行为（防止斗殴等）并防止他们逃脱。这两件事的目的不同，当然成本也就不同。<p>这就像说冰箱比微波炉贵一样。这毫无意义，因为它们的功能不同。”   []
19464461        comment sneakernets     2019-03-22 17:01:10     “因为科学证据如此确凿，现在再讨论它已经是多此一举了。<p>但对于反疫苗者来说，这就像告诉某人你手里拿着的红苹果是红色的，他们却坚持说是绿色的。你无法和这样的人争论‘其优点’。” [19464582]
19465288        comment derefr  2019-03-22 18:15:21     “因为我们讨论的是后端部署和运维领域的行话术语‘website’和‘webapp’，而不是它们的通用用法。词语在不同领域中可以有精确的行话含义<i>这些含义是不同的</i>。这就是运维人员通常划清界限的地方：一个web<i>site</i>是你可以部署到例如S3存储桶的东西，它将完全功能正常，而无需为它维护其他依赖项。<i>webapp</i>是<i>确实</i>有此类依赖项的东西，你需要设置和维护它们——例如数据库层。<p>但即使忽略这一点，我也因为前缀‘web.’而这样定义这些术语。Webapp不是‘web上的app’，而是‘由web驱动的app’。一个完全离线的JavaScript SPA只是<i>通过</i>web<i>提供</i>，<i>不是</i>web-app。它只是一个在浏览器中运行的程序，就像Flash或ActiveX或Java小程序是一个在浏览器中运行的程序一样。（Flash游戏是‘web游戏’吗？它通常被视为<i>浏览器游戏</i>，但那不是同一件事。）<p>我们已经有了一个术语来描述{Flash、ActiveX、Java}小程序：apps。离线JavaScript SPA也只是apps。我们不需要添加‘web’前缀；在这里它是无意义的。在任何这些情况下，如果你把完全相同的程序塞进Electron包装器而不是通过域名访问的S3存储桶，它显然在任何意义上都不是‘web app’。你的SPA将只是‘一个使用浏览器DOM作为图形工具包的JavaScript <i>app</i>’。嗯，在你把它放入Electron包装器之前，这也是一样真实的。<p>因此，‘web app’有一个特定的含义，超越了‘app’。你需要一些额外的东西。那额外的东西是一个后端，你的浏览器——由app的逻辑驱动——<i>通过web</i>与之交互。这就是使一个app成为‘web app’的东西。（这个定义有意涵盖了服务器渲染的动态HTML和客户端渲染的JavaScript SPA app。你不需要前端<i>app</i>；你只需要一个<i>web后端</i>，有些东西与之交互。那东西可以是浏览器直接，通过点击链接和提交表单；或者它可以是使用AJAX的JavaScript前端。）<p>因此，‘web site’是一个没有‘app’部分的‘web app’。如果上述定义中清楚了什么是‘app’，什么是‘web app’，那么你可以从一个减去另一个来推导出‘web非app’的定义。那就是website：由web后端驱动的东西，它不做任何app事情。如果我们决定‘app事情’基本上是‘存储状态’，那么一个‘site’是一个没有持久状态的‘app’。<p>由于这里的‘web’定义是关于后端的，因此‘web app’和‘web site’（web非app）之间的区别可能由后端的属性定义。所以区别在于web后端存储状态的能力。因此，一个‘web site’是一个后端不做app事情的‘web app’——即，不存储状态。”       []
19465534        comment bduerst 2019-03-22 18:36:40     “包括Apple： <a href=""https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy"" rel=""nofollow"">https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-...</a>”        []
19466269        comment CalChris        2019-03-22 19:55:13     “&gt; 它有相同的A12 CPU ……在<i>片上系统</i>上配备3 GB RAM<p>实际上那是<i>封装上封装</i>。LPDDR4X DRAM被粘合（嗯，回流焊接）在A12 Bionic的背面。<p><a href=""https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blog&#x2F;apple-iphone-xs-teardown&#x2F;"" rel=""nofollow"">https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blo...</a><p><a href=""https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package"" rel=""nofollow"">https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package</a>”       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     “&gt;&gt;<i>这里的荒谬在于，你不能利用房车所在的土地在其上建造一个工作室。</i><p>这是苹果和橙子的比较。获得建造工作室的许可会使该建筑永久合法化。而房车，他们可以用新法律驱逐，或者只是执行现有法律。”      []
19467048        comment karambahh       2019-03-22 21:15:41     "我认为你在这里是在混淆两个完全不同的概念。<p>如果你将停车位改作他用(比如建造家庭住房或动物收容所),你并没有剥夺汽车的任何东西,它只是一块昂贵的大型金属,并不具有感知能力。<p>接下来,你可能会说这剥夺了车主随意停车的便利性。为了让一个人能有遮风挡雨的住所,我完全可以接受剥夺车主的这种便利。(这是我的亲身经历,就在几分钟前,我不得不把车停在离家1公里外的地方,因为市政府正在建造住房,限制了附近的停车位)<p>然后,有些人可能会说,在人类还在受苦的时候帮助动物是可耻的。这和«我们不能接纳更多移民,我们必须先照顾好'自己的'无家可归者»的思路如出一辙。<p>这是一个错误的二元对立。西方社会的不平等正在不断加剧。我个人的努力微不足道。我向人类或动物慈善事业的捐赠,相比我们所处的巨大不平等只是杯水车薪。但我们作为一个集体,通过捐赠、投票以及对我们所生活的世界保持关注,确实能够产生影响...<p>最后,从我个人的经历来看:我多次目睹极度贫困的人们不遗余力地向动物或人类表达团结互助。我也目睹了大量极其富有的人抱怨穷人的存在给他们带来不便,而他们的财富正是他们祖先剥削这些穷人的直接结果。"      [19467512]
```

2. 现在让我们为 Hacker News 数据创建一张表：

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

3. 我们希望将 `author` 列转换为小写，这可以通过 [`lower` 函数](/sql-reference/functions/string-functions#lower) 轻松实现。我们还希望将 `comment` 字符串拆分为词元，并将结果存储到 `tokens` 列中，这可以使用 [`extractAll` 函数](/sql-reference/functions/string-search-functions#extractAll) 实现。你可以在一个 `clickhouse-client` 命令中完成上述所有操作——注意 `comments.tsv` 文件是如何通过 `<` 运算符传递给 `clickhouse-client` 的：

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
这里 `input` 函数非常有用，因为它允许我们在向 `hackernews` 表插入数据的同时对其进行转换。传递给 `input` 的参数是传入原始数据的格式，你会在很多其他表函数中看到类似的用法（在这些函数中你需要为传入数据指定一个 schema）。
:::

4. 就这样！数据已经导入到 ClickHouse 中了：

```sql
SELECT *
FROM hackernews
LIMIT 7
```

结果如下：


```response
│  488 │ comment │ mynameishere │ 2007-02-22 14:48:18 │ "It's too bad. Javascript-in-the-browser and Ajax are both nasty hacks that force programmers to do all sorts of shameful things. And the result is--wanky html tricks. Java, for its faults, is fairly clean when run in the applet environment. It has every superiority over JITBAJAX, except for install issues and a chunky load process. Yahoo games seems like just about the only applet success story. Of course, back in the day, non-trivial Applets tended to be too large for the dial-up accounts people had. At least that is changed." │ [454927] │ ['It','s','too','bad','Javascript','in','the','browser','and','Ajax','are','both','nasty','hacks','that','force','programmers','to','do','all','sorts','of','shameful','things','And','the','result','is','wanky','html','tricks','Java','for','its','faults','is','fairly','clean','when','run','in','the','applet','environment','It','has','every','superiority','over','JITBAJAX','except','for','install','issues','and','a','chunky','load','process','Yahoo','games','seems','like','just','about','the','only','applet','success','story','Of','course','back','in','the','day','non','trivial','Applets','tended','to','be','too','large','for','the','dial','up','accounts','people','had','At','least','that','is','changed'] │
│  575 │ comment │ leoc         │ 2007-02-23 00:09:49 │ "I can't find the reference now, but I *think* I've just read something suggesting that the install process for an Apollo applet will involve an &#34;install-this-application?&#34; confirmation dialog followed by a download of 30 seconds or so. If so then Apollo's less promising than I hoped. That kind of install may be low-friction by desktop-app standards but it doesn't compare to the ease of starting a browser-based AJAX or Flash application. (Consider how easy it is to use maps.google.com for the first time.)<p>Surely it will at least be that Apollo applications will run untrusted by default, and that an already-installed app will start automatically whenever you take your browser to the URL you downloaded it from?" │ [455071] │ ['I','can','t','find','the','reference','now','but','I','think','I','ve','just','read','something','suggesting','that','the','install','process','for','an','Apollo','applet','will','involve','an','34','install','this','application','34','confirmation','dialog','followed','by','a','download','of','30','seconds','or','so','If','so','then','Apollo','s','less','promising','than','I','hoped','That','kind','of','install','may','be','low','friction','by','desktop','app','standards','but','it','doesn','t','compare','to','the','ease','of','starting','a','browser','based','AJAX','or','Flash','application','Consider','how','easy','it','is','to','use','maps','google','com','for','the','first','time','p','Surely','it','will','at','least','be','that','Apollo','applications','will','run','untrusted','by','default','and','that','an','already','installed','app','will','start','automatically','whenever','you','take','your','browser','to','the','URL','you','downloaded','it','from'] │
│ 3110 │ comment │ davidw       │ 2007-03-09 09:19:58 │ "I'm very curious about this tsumobi thing, as it's basically exactly what Hecl is ( http://www.hecl.org ).  I'd sort of abbandoned it as an idea for making any money with directly, though, figuring the advantage was just to be able to develop applications a lot faster.  I was able to prototype ShopList ( http://shoplist.dedasys.com ) in a few minutes with it, for example.<p>Edit: BTW, I'd certainly be interested in chatting with the Tsumobi folks.  It's a good idea - perhaps there are elements in common that can be reused from/added to Hecl, which is open source under a very liberal license, meaning you can take it and include it even in 'commercial' apps.<p>I really think that the 'common' bits in a space like that have to be either free or open source (think about browsers, html, JavaScript, java applets, etc...), and that that's not where the money is." │ [3147]   │ ['I','m','very','curious','about','this','tsumobi','thing','as','it','s','basically','exactly','what','Hecl','is','http','www','hecl','org','I','d','sort','of','abbandoned','it','as','an','idea','for','making','any','money','with','directly','though','figuring','the','advantage','was','just','to','be','able','to','develop','applications','a','lot','faster','I','was','able','to','prototype','ShopList','http','shoplist','dedasys','com','in','a','few','minutes','with','it','for','example','p','Edit','BTW','I','d','certainly','be','interested','in','chatting','with','the','Tsumobi','folks','It','s','a','good','idea','perhaps','there','are','elements','in','common','that','can','be','reused','from','added','to','Hecl','which','is','open','source','under','a','very','liberal','license','meaning','you','can','take','it','and','include','it','even','in','commercial','apps','p','I','really','think','that','the','common','bits','in','a','space','like','that','have','to','be','either','free','or','open','source','think','about','browsers','html','javascript','java','applets','etc','and','that','that','s','not','where','the','money','is'] │
│ 4016 │ comment │ mynameishere │ 2007-03-13 22:56:53 │ "http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=2853515&CatId=2511<p>Versus<p>http://store.apple.com/1-800-MY-APPLE/WebObjects/AppleStore?family=MacBookPro<p>These are comparable systems, but the Apple has, as I said, roughly an 800 dollar premium. Actually, the cheapest macbook pro costs the same as the high-end Toshiba. If you make good money, it's not a big deal. But when the girl in the coffeehouse asks me what kind of computer she should get to go along with her minimum wage, I'm basically scum to recommend an Apple." │ []       │ ['http','www','tigerdirect','com','applications','SearchTools','item','details','asp','EdpNo','2853515','CatId','2511','p','Versus','p','http','store','apple','com','1','800','MY','APPLE','WebObjects','AppleStore','family','MacBookPro','p','These','are','comparable','systems','but','the','Apple','has','as','I','said','roughly','an','800','dollar','premium','Actually','the','cheapest','macbook','pro','costs','the','same','as','the','high','end','Toshiba','If','you','make','good','money','it','s','not','a','big','deal','But','when','the','girl','in','the','coffeehouse','asks','me','what','kind','of','computer','she','should','get','to','go','along','with','her','minimum','wage','I','m','basically','scum','to','recommend','an','Apple'] │
│ 4568 │ comment │ jwecker      │ 2007-03-16 13:08:04 │ I know the feeling.  The same feeling I had back when people were still writing java applets.  Maybe a normal user doesn't feel it- maybe it's the programmer in us knowing that there's a big layer running between me and the browser...                 │ []       │ ['I','know','the','feeling','The','same','feeling','I','had','back','when','people','were','still','writing','java','applets','Maybe','a','normal','user','doesn','t','feel','it','maybe','it','s','the','programmer','in','us','knowing','that','there','s','a','big','layer','running','between','me','and','the','browser'] │
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "The essence of Ajax is getting Javascript to communicate with the server without reloading the page. Although XmlHttpRequest is most convenient, there were other methods of doing this before XmlHttpRequest such as <p>- loading a 1 pixel image and sending data in the image's cookie<p>- loading server data through a tiny frame which contained XML or javascipt data<p>- Using a java applet to fetch the data on behalf of javascript" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "Well this is exactly the kind of thing that isn't very obvious. It sounds like once you're wealthy there's a new set of rules you have to live by. It's a shame everyone has had to re-learn these things for themselves because a few bad apples can control their jealousy.<p>Very good to hear it's somewhere in your essay queue though. I'll try not to get rich before you write it, so I have some idea of what to expect :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. 另一种方式是使用 `cat` 之类的工具，将文件通过流的方式传给 `clickhouse-client`。例如，下面的命令与使用 `<` 运算符所得到的结果相同：

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

访问 [`clickhouse-client`](/interfaces/cli) 文档页面，了解如何在本地操作系统上安装 `clickhouse-client` 的详细信息。
