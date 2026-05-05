---
description: 'ClickHouse C++ 개발을 위한 코딩 스타일 지침'
sidebar_label: 'C++ 스타일 가이드'
sidebar_position: 70
slug: /development/style
title: 'C++ 스타일 가이드'
doc_type: 'guide'
---



# C++ 스타일 가이드 \{#c-style-guide\}



## 일반적인 권장 사항 \{#general-recommendations\}

다음 내용은 필수 사항이 아니라 권장 사항입니다.
코드를 수정할 때는 기존 코드의 형식을 따르는 것이 좋습니다.
코드 스타일은 일관성을 위해 필요합니다. 일관성이 있으면 코드를 읽기 쉽고, 코드를 검색하기도 더 쉬워집니다.
많은 규칙은 논리적인 근거가 있다기보다, 기존에 굳어져 온 관행에 따라 정해진 것입니다.



## 서식 지정 \{#formatting\}

**1.** 대부분의 서식 지정은 `clang-format`으로 자동 적용됩니다.

**2.** 들여쓰기는 공백 4칸입니다. 탭 키를 누르면 공백 4칸이 입력되도록 개발 환경을 설정하십시오.

**3.** 여는 중괄호와 닫는 중괄호는 각각 별도의 줄에 두어야 합니다.

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 전체 함수 본문이 하나의 `statement`인 경우, 한 줄에 작성하십시오. 중괄호 주변에는 (줄 끝의 공백을 제외하고) 공백을 두십시오.

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 함수의 괄호 주변에는 공백을 넣지 마십시오.

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** `if`, `for`, `while` 및 기타 표현식에서는 여는 괄호 앞에 공백을 넣습니다(함수 호출과는 달리).

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 이항 연산자(`+`, `-`, `*`, `/`, `%`, ...)와 삼항 연산자 `?:`의 양쪽에 공백을 추가합니다.

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 줄 바꿈이 발생하면 연산자를 새 줄에 배치하고 그 앞의 들여쓰기를 늘립니다.

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 원한다면 한 줄 내에서 정렬을 위해 공백을 사용할 수 있습니다.

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 연산자 `.`, `->` 주변에는 공백을 사용하지 않습니다.

필요한 경우 연산자는 다음 줄로 넘길 수 있습니다. 이 경우 연산자 앞의 들여쓰기를 늘립니다.

**11.** 단항 연산자 (`--`, `++`, `*`, `&`, ...)와 피연산자 사이에는 공백을 사용하지 않습니다.

**12.** 쉼표 뒤에는 공백을 넣되, 앞에는 넣지 않습니다. `for` 표현식 안의 세미콜론에도 동일한 규칙을 적용합니다.

**13.** `[]` 연산자 내부에는 공백을 사용하지 않습니다.

**14.** `template <...>` 표현식에서는 `template`와 `<` 사이에는 공백을 사용하고, `<` 뒤나 `>` 앞에는 공백을 사용하지 않습니다.

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 클래스와 구조체에서는 `public`, `private`, `protected`를 `class/struct`와 같은 수준에 두고, 나머지 코드는 들여쓰기합니다.

```cpp
template <typename T>
class MultiVersion
{
public:
    /// Version of object for usage. shared_ptr manage lifetime of version.
    using Version = std::shared_ptr<const T>;
    ...
}
```

**16.** 전체 파일에 동일한 `namespace`를 사용하고, 그 외에 특별한 사항이 없다면, `namespace` 내부에서 추가 들여쓰기를 할 필요는 없습니다.

**17.** `if`, `for`, `while` 또는 다른 표현식의 블록이 하나의 `statement`로만 구성되는 경우 중괄호는 선택 사항입니다. 대신 `statement`를 별도의 줄에 작성합니다. 이 규칙은 중첩된 `if`, `for`, `while`, ... 에도 동일하게 적용됩니다.

단, 내부 `statement`에 중괄호나 `else`가 포함되어 있다면, 외부 블록은 중괄호로 감싸서 작성해야 합니다.

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 줄 끝에는 공백이 없어야 합니다.

**19.** 소스 파일은 UTF-8 인코딩을 사용합니다.


**20.** 문자열 리터럴에는 ASCII 이외의 문자를 사용할 수 있습니다.

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 한 줄에 여러 개의 표현식을 작성하지 않습니다.

**22.** 함수 내부에서 코드 구간을 묶고, 구간 사이에는 빈 줄을 최대 한 줄만 둡니다.

**23.** 함수, 클래스 등을 서로 구분할 때는 한 줄 또는 두 줄의 빈 줄을 둡니다.

**24.** 값과 관련된 `const`는 형(type) 이름 앞에 작성해야 합니다.

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** 포인터나 참조를 선언할 때는 `*`와 `&` 기호의 양쪽에 공백을 둡니다.

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** 템플릿 타입을 사용할 때는 (가장 단순한 경우를 제외하고) `using` 키워드로 별칭을 지정합니다.

즉, 템플릿 매개변수는 `using`에서만 지정하고 코드에서 다시 반복하지 않습니다.

`using`은 함수 내부 등에서 로컬로 선언할 수 있습니다.

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 서로 다른 타입의 여러 변수를 한 문장에서 선언하지 마십시오.

```cpp
//incorrect
int x, *y;
```

**28.** C 스타일 캐스트를 사용하지 마십시오.

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 클래스와 struct에서는 각 접근 지정자 범위 안에서 멤버와 함수는 서로 구분하여 그룹화합니다.

**30.** 작은 클래스와 struct의 경우, 메서드 선언과 구현을 분리할 필요가 없습니다.

이는 다른 어떤 클래스나 struct의 작은 메서드에도 동일하게 적용됩니다.

template 클래스와 struct의 경우, 메서드 선언을 구현과 분리하지 않습니다 (그렇지 않으면 동일한 translation unit에서 정의해야 하기 때문입니다).

**31.** 줄 길이는 80자 대신 140자에서 줄바꿈해도 됩니다.

**32.** 후위 연산이 반드시 필요한 경우가 아니라면 항상 전위 증가/감소 연산자를 사용합니다.

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```


## 주석 \{#comments\}

**1.** 사소하지 않은 모든 코드 부분에는 반드시 주석을 추가하십시오.

이것은 매우 중요합니다. 주석을 작성하는 과정에서 코드가 불필요하다거나 설계가 잘못되었다는 사실을 깨닫게 될 수도 있습니다.

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** 주석은 필요한 만큼 자세하게 작성합니다.

**3.** 주석은 설명하는 코드 앞에 둡니다. 드문 경우에는 같은 줄에서 코드 뒤에 둘 수 있습니다.

```cpp
/** Parses and executes the query.
*/
void executeQuery(
    ReadBuffer & istr, /// Where to read the query from (and data for INSERT, if applicable)
    WriteBuffer & ostr, /// Where to write the result
    Context & context, /// DB, tables, data types, engines, functions, aggregate functions...
    BlockInputStreamPtr & query_plan, /// Here could be written the description on how query was executed
    QueryProcessingStage::Enum stage = QueryProcessingStage::Complete /// Up to which stage process the SELECT query
    )
```

**4.** 주석은 영어로만 작성합니다.

**5.** 라이브러리를 작성하는 경우 주요 헤더 파일에 해당 라이브러리를 자세히 설명하는 주석을 포함하십시오.

**6.** 추가 정보를 제공하지 않는 주석은 작성하지 마십시오. 특히 다음과 같은 빈 주석은 남기지 마십시오:

```cpp
/*
* Procedure Name:
* Original procedure name:
* Author:
* Date of creation:
* Dates of modification:
* Modification authors:
* Original file name:
* Purpose:
* Intent:
* Designation:
* Classes used:
* Constants:
* Local variables:
* Parameters:
* Date of creation:
* Purpose:
*/
```

예제는 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/ 자료에서 가져온 것입니다.

**7.** 각 파일의 시작 부분에 작성자, 생성 날짜 등과 같은 불필요한 주석을 작성하지 않습니다.

**8.** 한 줄짜리 주석은 세 개의 슬래시 `///` 로 시작하고, 여러 줄 주석은 `/**` 로 시작합니다. 이러한 주석은 「문서화」로 간주합니다.

참고: 이러한 주석으로부터 문서를 생성하기 위해 Doxygen을 사용할 수 있습니다. 그러나 IDE에서 코드를 탐색하는 것이 더 편리하므로 Doxygen은 일반적으로 사용되지 않습니다.

**9.** 여러 줄 주석은 (여러 줄 주석을 닫는 줄을 제외하고) 시작과 끝에 빈 줄이 있어서는 안 됩니다.

**10.** 코드를 주석 처리할 때는 「문서화」 주석이 아니라 일반 주석을 사용합니다.

**11.** 커밋하기 전에 주석 처리된 코드 부분은 삭제합니다.

**12.** 주석이나 코드에 비속어를 사용하지 않습니다.

**13.** 대문자를 사용하지 않습니다. 과도한 문장 부호를 사용하지 않습니다.

```cpp
/// WHAT THE FAIL???
```

**14.** 구분자를 만들기 위해 주석을 사용하지 마십시오.

```cpp
///******************************************************
```

**15.** 주석에서 토론을 시작하지 마십시오.

```cpp
/// Why did you do this stuff?
```

**16.** 블록 끝에 그 블록이 무엇을 하는지 설명하는 주석을 작성할 필요는 없습니다.

```cpp
/// for
```


## 이름 \{#names\}

**1.** 변수와 클래스 멤버의 이름에는 소문자와 밑줄(&#95;)을 사용합니다.

```cpp
size_t max_block_size;
```

**2.** 함수(메서드) 이름에는 소문자로 시작하는 camelCase 표기법을 사용합니다.

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 클래스와 struct 이름에는 대문자로 시작하는 CamelCase를 사용합니다. 인터페이스에는 I 접두사 이외의 접두사는 사용하지 않습니다.

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 선언의 이름은 클래스와 동일한 방식으로 정합니다.

**5.** 템플릿 형식 인자 이름: 단순한 경우에는 단일 인자는 `T`, 두 개의 인자는 `T`, `U`, 더 많은 인자는 `T1`, `T2`와 같이 사용합니다.

더 복잡한 경우에는 클래스 이름 규칙을 따르거나 이름 앞에 `T` 접두사를 붙입니다.

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 템플릿 상수 인자 이름은 변수 이름 규칙을 따르거나, 간단한 경우에는 `N`을 사용합니다.

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 추상 클래스(인터페이스)에는 `I` 접두사를 붙일 수 있습니다.

```cpp
class IProcessor
```

**8.** 변수를 로컬 범위에서 사용할 때는 짧은 이름을 사용해도 됩니다.

그 외 모든 경우에는 의미를 잘 나타내는 이름을 사용합니다.

```cpp
bool info_successfully_loaded = false;
```

**9.** `define`과 전역 상수의 이름은 ALL&#95;CAPS와 밑줄(`_`)을 사용합니다.

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 파일 이름은 파일 내용과 동일한 스타일을 사용해야 합니다.

파일에 단일 클래스만 포함된 경우, 파일 이름은 클래스 이름과 동일하게 지정합니다(CamelCase).

파일에 단일 함수만 포함된 경우, 파일 이름은 함수 이름과 동일하게 지정합니다(camelCase).

**11.** 이름에 약어가 포함되는 경우 다음 규칙을 따릅니다.

* 변수 이름에서는 약어를 소문자로 사용해야 합니다. `mysql_connection`( `mySQL_connection` 아님).
* 클래스와 함수 이름에서는 약어의 대문자를 유지합니다. `MySQLConnection`( `MySqlConnection` 아님).

**12.** 클래스 멤버를 초기화하는 데만 사용되는 생성자 인수는 클래스 멤버와 같은 이름을 사용하되, 끝에 밑줄을 붙여서 명명해야 합니다.

```cpp
FileQueueProcessor(
    const std::string & path_,
    const std::string & prefix_,
    std::shared_ptr<FileHandler> handler_)
    : path(path_),
    prefix(prefix_),
    handler(handler_),
    log(&Logger::get("FileQueueProcessor"))
{
}
```

생성자 본문에서 해당 인자를 사용하지 않는 경우 밑줄 접미사를 생략할 수 있습니다.

**13.** 지역 변수와 클래스 멤버의 이름을 구분하지 않습니다(접두사를 사용할 필요가 없습니다).

```cpp
timer (not m_timer)
```

**14.** `enum`의 상수 이름에는 대문자로 시작하는 CamelCase를 사용합니다. ALL&#95;CAPS도 허용됩니다. `enum`이 로컬이 아닌(non-local) 경우에는 `enum class`를 사용합니다.

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 모든 이름은 영어로 작성해야 합니다. 히브리어 단어의 로마자 표기는 허용되지 않습니다.

not T&#95;PAAMAYIM&#95;NEKUDOTAYIM

**16.** 약어는 잘 알려져 있다면 허용됩니다(그 약어의 의미를 Wikipedia나 검색 엔진에서 쉽게 찾을 수 있는 경우).

`AST`, `SQL`.

Not `NVDH` (아무 의미 없는 문자 나열)

단어를 줄인 형태의 이름도 그 축약형이 널리 사용되는 경우에는 허용됩니다.

주석에 전체 이름을 함께 명시하는 경우 약어를 사용할 수도 있습니다.

**17.** C++ 소스 코드가 들어 있는 파일 이름은 `.cpp` 확장자를 가져야 합니다. 헤더 파일은 `.h` 확장자를 가져야 합니다.


## 코드를 작성하는 방법 \{#how-to-write-code\}

**1.** 메모리 관리.

수동 메모리 해제(`delete`)는 라이브러리 코드에서만 사용할 수 있습니다.

라이브러리 코드에서 `delete` 연산자는 소멸자에서만 사용할 수 있습니다.

애플리케이션 코드에서는 메모리는 이를 소유한 객체가 해제해야 합니다.

예시:

* 가장 쉬운 방법은 객체를 스택에 생성하거나 다른 클래스의 멤버로 만드는 것입니다.
* 많은 수의 작은 객체에는 컨테이너를 사용합니다.
* 힙에 존재하는 적은 수의 객체를 자동으로 해제하려면 `shared_ptr/unique_ptr`을 사용합니다.

**2.** 리소스 관리.

`RAII`를 사용하고, 위 내용을 참조하십시오.

**3.** 오류 처리.

예외를 사용합니다. 대부분의 경우 예외를 던지기만 하면 되고, (`RAII` 덕분에) 이를 직접 잡을 필요는 없습니다.

오프라인 데이터 처리 애플리케이션에서는 예외를 잡지 않아도 되는 경우가 종종 있습니다.

사용자 요청을 처리하는 서버에서는 연결 핸들러의 최상위 레벨에서 예외를 한 번만 잡으면 충분한 경우가 많습니다.

스레드 함수에서는 모든 예외를 잡아서 저장해 두었다가 `join` 이후 메인 스레드에서 다시 던져야 합니다.

```cpp
/// If there weren't any calculations yet, calculate the first block synchronously
if (!started)
{
    calculate();
    started = true;
}
else /// If calculations are already in progress, wait for the result
    pool.wait();

if (exception)
    exception->rethrow();
```

예외를 처리하지 않고 그냥 숨겨 두지 마십시오. 모든 예외를 무턱대고 로그에만 남겨 두지 마십시오.

```cpp
//Not correct
catch (...) {}
```

일부 예외를 무시해야 한다면, 특정 예외에 대해서만 그렇게 하고 나머지는 다시 던지십시오.

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

응답 코드나 `errno`를 사용하는 함수를 사용할 때에는 항상 반환값을 확인하고, 오류인 경우 예외를 발생시키십시오.

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

코드에서 불변 조건을 검사하기 위해 assert를 사용할 수 있습니다.

**4.** 예외 타입.

애플리케이션 코드에서 복잡한 예외 계층 구조를 사용할 필요는 없습니다. 예외 메시지는 시스템 관리자도 이해할 수 있어야 합니다.

**5.** 소멸자에서 예외 던지기.

권장되지는 않지만, 허용됩니다.

다음과 같은 방법을 사용하십시오.

* 예외를 유발할 수 있는 모든 작업을 미리 수행하는 함수(`done()` 또는 `finalize()`)를 만듭니다. 그 함수가 호출되었다면, 이후 소멸자에서는 예외가 발생하지 않아야 합니다.
* 너무 복잡한 작업(예: 네트워크를 통한 메시지 전송)은 별도의 메서드로 분리하여, 클래스 사용자가 소멸 전에 호출하도록 맡길 수 있습니다.
* 소멸자에서 예외가 발생하는 경우, (로거를 사용할 수 있다면) 예외를 숨기기보다는 로그를 남기는 것이 더 좋습니다.
* 단순한 애플리케이션에서는 `std::terminate`에 예외 처리를 맡겨도 허용됩니다(C++11에서 기본 `noexcept`인 경우).

**6.** 익명 코드 블록.

특정 변수를 지역화하기 위해 하나의 함수 안에 별도의 코드 블록을 만들 수 있으며, 블록을 빠져나갈 때 해당 변수의 소멸자가 호출되도록 할 수 있습니다.

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** 멀티스레딩.

오프라인 데이터 처리 프로그램에서는:

* 먼저 단일 CPU 코어에서 가능한 최고의 성능을 내도록 합니다. 필요한 경우 그 다음에 코드를 병렬화합니다.

서버 애플리케이션에서는:

* 요청을 처리할 때 thread pool을 사용합니다. 지금까지는 userspace context switching이 필요한 작업은 없었습니다.

병렬화를 위해 `fork`는 사용하지 않습니다.

**8.** 스레드 동기화.

서로 다른 스레드가 서로 다른 메모리 셀(더 좋다면 서로 다른 캐시 라인)을 사용하도록 하여, 스레드 동기화(`joinAll`을 제외하고)를 전혀 사용하지 않아도 되는 경우가 자주 있습니다.

동기화가 필요하다면, 대부분의 경우 `lock_guard`로 감싼 mutex를 사용하는 것으로 충분합니다.

그 외의 경우에는 시스템 동기화 프리미티브를 사용합니다. busy wait는 사용하지 않습니다.

원자적 연산은 가장 단순한 경우에만 사용해야 합니다.

락-프리(lock-free) 자료 구조는 그것이 주요 전문 분야가 아닌 이상 구현하려 하지 마십시오.

**9.** 포인터 vs 참조.

대부분의 경우에는 참조를 우선적으로 사용합니다.

**10.** `const`.

상수 참조, 상수에 대한 포인터, `const_iterator`, `const` 메서드를 사용합니다.

`const`를 기본으로 여기고, 필요한 경우에만 non-`const`를 사용합니다.


값으로 변수를 전달할 때는 `const`를 사용하는 것이 대부분 의미가 없습니다.

**11.** unsigned.

필요한 경우에만 `unsigned`를 사용합니다.

**12.** 숫자 타입.

`UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64` 타입과 `size_t`, `ssize_t`, `ptrdiff_t`를 사용합니다.

숫자에는 다음 타입들을 사용하지 않습니다: `signed/unsigned long`, `long long`, `short`, `signed/unsigned char`, `char`.

**13.** 인자 전달.

복잡한 값을 이동(move)할 예정이라면 값으로 전달하고 `std::move`를 사용합니다. 루프에서 값을 갱신하려는 경우에는 참조로 전달합니다.

함수가 힙에서 생성된 객체의 소유권을 가져오는 경우, 인자 타입을 `shared_ptr` 또는 `unique_ptr`로 지정합니다.

**14.** 반환 값.

대부분의 경우에는 단순히 `return`을 사용합니다. `return std::move(res)`와 같이 작성하지 않습니다.

함수가 힙에 객체를 할당하고 이를 반환하는 경우에는 `shared_ptr` 또는 `unique_ptr`를 사용합니다.

드문 경우이지만(루프에서 값을 갱신하는 경우) 인자를 통해 값을 반환해야 할 수 있습니다. 이때 인자는 참조 타입이어야 합니다.

```cpp
using AggregateFunctionPtr = std::shared_ptr<IAggregateFunction>;

/** Allows creating an aggregate function by its name.
  */
class AggregateFunctionFactory
{
public:
    AggregateFunctionFactory();
    AggregateFunctionPtr get(const String & name, const DataTypes & argument_types) const;
```

**15.** `namespace`.

애플리케이션 코드에 별도의 `namespace`를 사용할 필요는 없습니다.

작은 라이브러리에서도 마찬가지로 필요하지 않습니다.

중간 규모 이상의 라이브러리에서는 모든 것을 하나의 `namespace` 안에 포함하십시오.

라이브러리의 `.h` 파일에서는 애플리케이션 코드에 필요하지 않은 구현 세부사항을 숨기기 위해 `namespace detail`을 사용할 수 있습니다.

`.cpp` 파일에서는 심볼을 숨기기 위해 `static` 또는 익명 `namespace`를 사용할 수 있습니다.

또한 `namespace`는 해당 이름들이 외부 `namespace`로 유출되는 것을 방지하기 위해 `enum`에 사용할 수 있습니다(하지만 `enum class`를 사용하는 편이 더 좋습니다).

**16.** 지연 초기화(Deferred initialization).

초기화를 위해 생성자 인자가 필요하다면, 보통은 기본 생성자를 작성하지 말아야 합니다.

나중에 초기화를 지연해야 할 필요가 생기면, 유효하지 않은 객체를 생성하는 기본 생성자를 추가할 수 있습니다. 또는 객체 수가 적다면 `shared_ptr/unique_ptr`을 사용할 수 있습니다.

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 가상 함수.

클래스를 다형적으로 사용할 의도가 없다면, 멤버 함수를 `virtual`로 만들 필요는 없습니다. 이는 소멸자에도 동일하게 적용됩니다.

**18.** 인코딩.

어디서나 UTF-8을 사용합니다. `std::string`과 `char *`를 사용합니다. `std::wstring`과 `wchar_t`는 사용하지 않습니다.

**19.** 로깅.

코드 전체에 있는 예제를 참고하십시오.

커밋하기 전에 의미 없는 로그, 디버그 로깅, 그 밖의 모든 종류의 디버그 출력은 모두 삭제합니다.

루프(사이클) 안에서의 로깅은 Trace 레벨에서도 피해야 합니다.

로그는 어떤 로깅 레벨에서도 읽기 쉬워야 합니다.

로깅은 주로 애플리케이션 코드에서만 사용하는 것이 좋습니다.

로그 메시지는 반드시 영어로 작성해야 합니다.

로그는 가능하면 시스템 관리자도 이해할 수 있어야 합니다.

로그에 비속어를 사용하지 않습니다.

로그에는 UTF-8 인코딩을 사용합니다. 드문 경우에 한해 로그에서 ASCII 이외의 문자를 사용할 수 있습니다.

**20.** 입출력.

애플리케이션 성능에 중요하게 영향을 미치는 내부 루프에서는 `iostreams`를 사용하지 마십시오(그리고 `stringstream`은 절대 사용하지 마십시오).

대신 `DB/IO` 라이브러리를 사용하십시오.

**21.** 날짜와 시간.

`DateLUT` 라이브러리를 참조하십시오.

**22.** include.

include guard 대신 항상 `#pragma once`를 사용합니다.

**23.** using.

`using namespace`는 사용하지 않습니다. 특정 이름에 대해서는 `using`을 사용할 수 있습니다. 단, 클래스나 함수 내부의 로컬 범위로 한정하십시오.

**24.** 필요하지 않은 한, 함수에 `trailing return type`을 사용하지 마십시오.

```cpp
auto f() -> void
```

**25.** 변수의 선언과 초기화.

```cpp
//right way
std::string s = "Hello";
std::string s{"Hello"};

//wrong way
auto s = std::string{"Hello"};
```

**26.** 가상 함수의 경우 기본 클래스에서는 `virtual`을 지정하고, 파생 클래스에서는 `virtual` 대신 `override`를 사용합니다.


## 사용하지 않는 C++ 기능 \{#unused-features-of-c\}

**1.** 가상 상속은 사용하지 않습니다.

**2.** 최신 C++에서 편리한 문법적 설탕(syntactic sugar)을 제공하는 구문, 예를 들어

```cpp
// Traditional way without syntactic sugar
template <typename G, typename = std::enable_if_t<std::is_same<G, F>::value, void>> // SFINAE via std::enable_if, usage of ::value
std::pair<int, int> func(const E<G> & e) // explicitly specified return type
{
    if (elements.count(e)) // .count() membership test
    {
        // ...
    }

    elements.erase(
        std::remove_if(
            elements.begin(), elements.end(),
            [&](const auto x){
                return x == 1;
            }),
        elements.end()); // remove-erase idiom

    return std::make_pair(1, 2); // create pair via make_pair()
}

// With syntactic sugar (C++14/17/20)
template <typename G>
requires std::same_v<G, F> // SFINAE via C++20 concept, usage of C++14 template alias
auto func(const E<G> & e) // auto return type (C++14)
{
    if (elements.contains(e)) // C++20 .contains membership test
    {
        // ...
    }

    elements.erase_if(
        elements,
        [&](const auto x){
            return x == 1;
        }); // C++20 std::erase_if

    return {1, 2}; // or: return std::pair(1, 2); // create pair via initialization list or value initialization (C++17)
}
```


## Platform \{#platform\}

**1.** 특정 플랫폼을 대상으로 코드를 작성합니다.

단, 다른 조건이 동일하다면 크로스 플랫폼 또는 이식 가능한 코드를 선호합니다.

**2.** 언어: C++20 (사용 가능한 [C++20 기능 목록](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)을 참조하십시오).

**3.** 컴파일러: `clang`. 이 문서 작성 시점(2025년 3월)에는 clang 버전 19 이상으로 코드를 컴파일합니다.

표준 라이브러리는 `libc++`를 사용합니다.

**4.** OS: Linux Ubuntu, Precise보다 오래된 버전은 사용하지 않습니다.

**5.** 코드는 x86_64 CPU 아키텍처를 대상으로 작성합니다.

CPU 명령어 세트는 서버에서 지원하는 최소 공통 세트입니다. 현재 SSE 4.2입니다.

**6.** `-Wall -Wextra -Werror -Weverything` 컴파일 플래그를 사용하되, 일부 예외가 있습니다.

**7.** 정적 링크 구성이 어려운 라이브러리( `ldd` 명령의 출력 참조)를 제외한 모든 라이브러리에 대해 정적 링크를 사용합니다.

**8.** 코드는 release 설정으로 개발 및 디버깅합니다.



## 도구 \{#tools\}

**1.** KDevelop은 좋은 IDE입니다.

**2.** 디버깅에는 `gdb`, `valgrind` (`memcheck`), `strace`, `-fsanitize=...`, 또는 `tcmalloc_minimal_debug`를 사용합니다.

**3.** 프로파일링에는 `Linux Perf`, `valgrind` (`callgrind`), 또는 `strace -cf`를 사용합니다.

**4.** 소스 코드는 Git에 있습니다.

**5.** 빌드는 `CMake`를 사용합니다.

**6.** 프로그램은 `deb` 패키지로 배포됩니다.

**7.** master 브랜치에 대한 커밋으로 빌드가 깨져서는 안 됩니다.

선택된 리비전만 실사용 가능한 것으로 간주합니다.

**8.** 코드가 부분적으로만 준비되었더라도 가능한 자주 커밋합니다.

이를 위해 브랜치를 사용합니다.

`master` 브랜치에 있는 코드가 아직 빌드 가능한 상태가 아니라면 `push` 전에 빌드에서 제외하십시오. 며칠 안에 해당 코드를 완성하거나 제거해야 합니다.

**9.** 복잡한 변경 사항의 경우 브랜치를 사용하고 서버에 공개합니다.

**10.** 사용하지 않는 코드는 리포지토리에서 제거합니다.



## 라이브러리 \{#libraries\}

**1.** C++20 표준 라이브러리를 사용합니다(실험적 확장 기능은 허용됩니다). 또한 `boost` 및 `Poco` 프레임워크를 사용합니다.

**2.** OS 패키지에서 제공되는 라이브러리와 사전 설치된 라이브러리는 사용할 수 없습니다. 모든 라이브러리는 `contrib` 디렉터리에 소스 코드 형태로 배치하여 ClickHouse와 함께 빌드해야 합니다. 자세한 내용은 [새 타사 라이브러리 추가 가이드라인](/development/contrib#adding-and-maintaining-third-party-libraries)을 참고하십시오.

**3.** 이미 사용 중인 라이브러리를 우선적으로 사용합니다.



## 일반 권장 사항 \{#general-recommendations-1\}

**1.** 가능한 한 코드를 적게 작성하십시오.

**2.** 가장 단순한 해결책을 우선 시도하십시오.

**3.** 코드가 어떻게 동작할지, 그리고 내부 루프가 어떻게 동작할지 알기 전에는 코드를 작성하지 마십시오.

**4.** 가장 단순한 경우에는 클래스나 구조체 대신 `using`을 사용하십시오.

**5.** 가능하다면 복사 생성자, 대입 연산자, 소멸자(클래스에 가상 함수가 최소 하나 포함되어 있는 경우의 가상 소멸자는 제외), 이동 생성자, 이동 대입 연산자를 작성하지 마십시오. 다시 말해, 컴파일러가 생성한 함수들만으로 올바르게 동작해야 합니다. 이때 `default`를 사용할 수 있습니다.

**6.** 코드 단순화를 권장합니다. 가능하다면 코드의 크기를 줄이십시오.



## 추가 권장 사항 \{#additional-recommendations\}

**1.** `stddef.h`에 있는 타입에 대해 `std::`를 명시적으로 지정하는 것

은 권장되지 않습니다. 즉, 더 짧기 때문에 `std::size_t` 대신 `size_t`를 사용하는 것을 권장합니다.

`std::`를 추가해도 됩니다.

**2.** 표준 C 라이브러리의 함수에 대해 `std::`를 명시적으로 지정하는 것

은 권장되지 않습니다. 다시 말해, `std::memcpy` 대신 `memcpy`를 사용하십시오.

그 이유는 `memmem`과 같은 비표준 함수가 존재하기 때문입니다. 이러한 함수는 가끔 사용합니다. 이 함수들은 `namespace std` 안에는 존재하지 않습니다.

모든 곳에서 `memcpy` 대신 `std::memcpy`를 사용하면, `std::` 없이 쓰인 `memmem`이 어색해 보이게 됩니다.

그럼에도 선호한다면 `std::`를 계속 사용할 수 있습니다.

**3.** 동일한 함수가 표준 C++ 라이브러리에 있을 때 C 함수를 사용하는 것.

더 효율적이라면 허용됩니다.

예를 들어, 큰 메모리 청크를 복사할 때는 `std::copy` 대신 `memcpy`를 사용하십시오.

**4.** 여러 줄로 작성된 함수 인자.

다음과 같은 줄 바꿈 스타일은 모두 허용됩니다:

```cpp
function(
  T1 x1,
  T2 x2)
```

```cpp
function(
  size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```

```cpp
function(
      size_t left,
      size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```
