import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>Что такое реплики ClickPipes?</summary>

  ClickPipes выполняет приём данных из удалённых источников через выделенную инфраструктуру,
  которая работает и масштабируется независимо от сервиса ClickHouse Cloud.
  По этой причине используются выделенные вычислительные реплики.
  Схемы ниже показывают упрощённую архитектуру.

  Для потоковых ClickPipes реплики ClickPipes обращаются к удалённым источникам данных (например, к брокеру Kafka),
  забирают данные, обрабатывают их и выполняют приём в целевой сервис ClickHouse.

  <Image img={clickpipesPricingFaq1} size="lg" alt="Реплики ClickPipes — потоковые ClickPipes" border force />

  В случае ClickPipes для объектного хранилища
  реплика ClickPipes оркестрирует задачу загрузки данных
  (определяет файлы для копирования, поддерживает состояние и переносит партиции),
  в то время как данные забираются непосредственно из сервиса ClickHouse.

  <Image img={clickpipesPricingFaq2} size="lg" alt="Реплики ClickPipes — ClickPipes для объектного хранилища" border force />
</details>

<details>
  <summary>Какое значение по умолчанию для числа реплик и их размера?</summary>

  Для каждого ClickPipe по умолчанию используется 1 реплика с 2 GiB RAM и 0.5 vCPU.
  Это соответствует **0.25** вычислительным единицам ClickHouse (1 единица = 8 GiB RAM, 2 vCPU).
</details>

<details>
  <summary>Можно ли масштабировать реплики ClickPipes?</summary>

  Да, потоковые ClickPipes можно масштабировать как горизонтально, так и вертикально.
  Горизонтальное масштабирование добавляет больше реплик для увеличения пропускной способности, а вертикальное масштабирование увеличивает ресурсы (CPU и RAM), выделенные каждой реплике, чтобы обрабатывать более интенсивные нагрузки.
  Это можно настроить при создании ClickPipe или в любое другое время в разделе **Settings** -&gt; **Advanced Settings** -&gt; **Scaling**.
</details>

<details>
  <summary>Сколько реплик ClickPipes мне нужно?</summary>

  Это зависит от требований к пропускной способности и задержке.
  Рекомендуется начать со значения по умолчанию — 1 реплика, измерить задержку и при необходимости добавить реплики.
  Имейте в виду, что для Kafka ClickPipes вам также нужно соответствующим образом масштабировать партиции брокера Kafka.
  Элементы управления масштабированием доступны в разделе «settings» для каждого потокового ClickPipe.

  <Image img={clickpipesPricingFaq3} size="lg" alt="Реплики ClickPipes — Сколько реплик ClickPipes мне нужно?" border force />
</details>

<details>
  <summary>Как выглядит структура ценообразования ClickPipes?</summary>

  Она состоит из двух составляющих:

  * **Compute**: цена за единицу в час\
    Compute отражает стоимость работы подов-реплик ClickPipes, независимо от того, выполняют ли они приём данных или нет.
    Применяется ко всем типам ClickPipes.
  * **Ingested data**: цена за GB\
    Тариф на принятые данные применяется ко всем потоковым ClickPipes
    (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream,
    Azure Event Hubs) для данных, передаваемых через поды-реплики.
    Объём принятых данных (GB) тарифицируется на основе байтов, полученных от источника (в несжатом или сжатом виде).
</details>

<details>
  <summary>Каковы публичные цены ClickPipes?</summary>

  * Compute: $0.20 за единицу в час ($0.05 за реплику в час)
  * Ingested data: $0.04 за GB
</details>

<details>
  <summary>Как это выглядит на наглядном примере?</summary>

  Например, приём 1 TB данных за 24 часа с помощью коннектора Kafka при использовании одной реплики (0.25 вычислительной единицы) будет стоить:

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  Для коннекторов объектного хранилища (S3 и GCS)
  учитывается только стоимость вычислений ClickPipes, поскольку под ClickPipes не обрабатывает данные,
  а лишь оркестрирует передачу, которая выполняется базовым сервисом ClickHouse:

  $$
  0.25 \times 0,20 \times 24 = $1.2
  $$
</details>


<details>

<summary>Как ценообразование ClickPipes выглядит на фоне рынка?</summary>

Философия ценообразования ClickPipes заключается в том,
чтобы покрывать операционные затраты платформы и при этом предлагать простой и надежный способ переноса данных в ClickHouse Cloud.
С этой точки зрения наш анализ рынка показал, что наше ценовое предложение конкурентоспособно.

</details>