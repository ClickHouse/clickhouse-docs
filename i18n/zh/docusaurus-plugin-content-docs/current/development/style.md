---
'description': 'ClickHouse C++ 开发的编码风格指南'
'sidebar_label': 'C++ 风格指南'
'sidebar_position': 70
'slug': '/development/style'
'title': 'C++ 编程风格指南'
---


# C++ 代码风格指南

## 一般建议 {#general-recommendations}

以下是建议，而非要求。
如果您正在编辑代码，遵循现有代码的格式是合理的。
代码风格对于一致性非常重要。一致性使得阅读代码更加容易，也使得搜索代码变得更简单。
许多规则并没有逻辑上的理由，它们是由既定的实践所决定的。

## 格式 {#formatting}

**1.** 大部分格式由 `clang-format` 自动完成。

**2.** 缩进为4个空格。配置您的开发环境，使得一个制表符添加四个空格。

**3.** 开始和结束的大括号必须单独占一行。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 如果整个函数体是一个单一的 `statement`，可以放在同一行。大括号周围要留出空格（除了行末的空格）。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 对于函数，不要在括号周围加空格。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** 在 `if`、`for`、`while` 和其他表达式中，打开括号前要插入空格（与函数调用不同）。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 在二进制运算符（`+`、`-`、`*`、`/`、`%` 等）及三元运算符 `?:` 周围添加空格。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 如果输入了换行，将运算符换到新的一行，并在前面增加缩进。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 如果需要，您可以在一行内对齐使用空格。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 不要在运算符 `.` 和 `->` 周围使用空格。

如有必要，运算符可以换到下一行。在这种情况下，前面的缩进应增加。

**11.** 不要使用空格将一元运算符（`--`、`++`、`*`、`&` 等）与其参数分隔开。

**12.** 在逗号后加空格，但逗号前不加。对于 `for` 表达式中的分号同样适用。

**13.** 不要使用空格将 `[]` 运算符分隔开。

**14.** 在 `template <...>` 表达式中，`template` 和 `<` 之间要留空格；`<` 之后和 `>` 之前不留空格。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 在类和结构体中，使用 `public`、`private` 和 `protected` 与 `class/struct` 保持在同一级别，其余代码则缩进。

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

**16.** 如果整个文件使用相同的 `namespace`，且没有其他重要内容，则不必在 `namespace` 内进行缩进。

**17.** 如果 `if`、`for`、`while` 或其他表达式的块只包含一个 `statement`，则括号是可选的。将 `statement` 放在单独的一行中。这条规则也适用于嵌套的 `if`、`for`、`while` 等。

但如果内部的 `statement` 包含大括号或 `else`，则外部块应使用大括号。

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行尾不应有空格。

**19.** 源文件采用 UTF-8 编码。

**20.** 字符串字面量中可以使用非 ASCII 字符。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 不要在同一行中写多个表达式。

**22.** 在函数内部对代码部分进行分组，并用不超过一行的空行进行分隔。

**23.** 使用一到两行空行分隔函数、类等。

**24.** `A const`（与值有关的）必须写在类型名之前。

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** 声明指针或引用时，`*` 和 `&` 符号应在两侧用空格分隔。

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** 在使用模板类型时，使用 `using` 关键字为它们命名（除了最简单的情况）。

换句话说，模板参数仅在 `using` 中指定，且不在代码中重复。

`using` 可以在函数内部局部声明。

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 不要在一个语句中声明多个不同类型的变量。

```cpp
//incorrect
int x, *y;
```

**28.** 不要使用 C 风格的强制转换。

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 在类和结构体中，按可见性范围分别分组成员和函数。

**30.** 对于小型类和结构体，不必将方法声明与实现分开。

对于任何类或结构体中的小型方法也同样适用。

对于模板类和结构体，不要将方法声明与实现分开（因为否则它们必须在同一个翻译单元中定义）。

**31.** 每行可在140个字符处换行，而不是80个字符。

**32.** 如果不需要后缀递增/递减运算符，请始终使用前缀运算符。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## 注释 {#comments}

**1.** 确保为所有非平凡的代码部分添加注释。

这非常重要。写注释可能会帮助您意识到某部分代码是不必要的，或者设计得不正确。

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** 注释可以根据需要详细。

**3.** 将注释放在其描述的代码之前。在少数情况下，注释可以在代码后，位于同一行。

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

**4.** 注释应仅使用英语撰写。

**5.** 如果您正在编写库，请在主要头文件中包含详细注释以进行解释。

**6.** 不要添加没有额外信息的注释。特别是，不要留下像这这样的空注释：

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

示例借鉴自资源 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/.

**7.** 不要在每个文件的开头写垃圾注释（作者、创建日期等）。

**8.** 单行注释以三个斜杠开头：`///`，多行注释以 `/**` 开头。这些注释被视为“文档注释”。

注意：您可以使用 Doxygen 从这些注释生成文档。但是通常不使用 Doxygen，因为在 IDE 中导航代码更方便。

**9.** 多行注释不得在开头和结尾有空行（关闭多行注释的行除外）。

**10.** 用于注释掉代码的注释，使用基本注释，而不是“文档”注释。

**11.** 提交之前删除注释掉的代码部分。

**12.** 不要在注释或代码中使用粗俗语言。

**13.** 不要使用大写字母，也不要使用太多标点符号。

```cpp
/// WHAT THE FAIL???
```

**14.** 不要使用注释来做分隔符。

```cpp
///******************************************************
```

**15.** 不要在注释中开始讨论。

```cpp
/// Why did you do this stuff?
```

**16.** 不必在块结束时写下描述其内容的注释。

```cpp
/// for
```

## 命名 {#names}

**1.** 在变量和类成员的命名上使用小写字母和下划线。

```cpp
size_t max_block_size;
```

**2.** 对于函数（方法）的命名，使用 camelCase 并以小写字母开头。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 对于类（结构体）的命名，使用 CamelCase 并以大写字母开头。接口不使用 I 之外的前缀。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 的命名方式与类相同。

**5.** 模板类型参数的命名：在简单的情况下，使用 `T`；`T`、`U`；`T1`、`T2`。

对于更复杂的情况，可以遵循类名的命名规则，或者添加前缀 `T`。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 模板常量参数的命名：要么遵循变量名的命名规则，要么在简单情况下使用 `N`。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 对于抽象类（接口），可以添加 `I` 前缀。

```cpp
class IProcessor
```

**8.** 如果您在局部使用变量，可以使用简短名称。

在其他情况下，使用能够描述其意义的名称。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` 和全局常量的名称使用全大写字母和下划线。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 文件名应与其内容使用相同的风格。

如果文件只包含一个类，则文件命名应与类同名（CamelCase）。

如果文件只包含一个函数，则文件命名应与函数相同（camelCase）。

**11.** 如果名称包含缩写，则：

- 对于变量名称，缩写应使用小写字母 `mysql_connection`（而不是 `mySQL_connection`）。
- 对于类和函数的名称，保持缩写中的大写字母 `MySQLConnection`（而不是 `MySqlConnection`）。

**12.** 仅用于初始化类成员的构造函数参数的命名应与类成员的命名相同，但在末尾加下划线。

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

如果参数在构造函数体中未使用，可以省略下划线后缀。

**13.** 局部变量和类成员的名称之间不需要区别（不需要前缀）。

```cpp
timer (not m_timer)
```

**14.** 对于 `enum` 中的常量，使用大写字母开头的 CamelCase。全大写也是可以的。如果 `enum` 不是局部的，使用 `enum class`。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 所有名称必须使用英语。禁止翻译希伯来词。

    not T_PAAMAYIM_NEKUDOTAYIM

**16.** 缩写在众所周知的情况下是可以接受的（当您能轻松在维基百科或搜索引擎中找到缩写的意思时）。

    `AST`、`SQL`。

    不是 `NVDH`（一些随机字母）

不完整的单词在常用情况下是可以接受的。

如果完整名称在注释中有所提及，您也可以使用缩写。

**17.** 含有 C++ 源代码的文件必须具有 `.cpp` 扩展名。头文件必须具有 `.h` 扩展名。

## 如何编写代码 {#how-to-write-code}

**1.** 内存管理。

手动内存释放（`delete`）只能在库代码中使用。

在库代码中，`delete` 操作符只能在析构函数中使用。

在应用程序代码中，内存必须由拥有该内存的对象释放。

示例：

- 最简单的方法是将对象放置在栈上，或者使其成为另一个类的成员。
- 对于大量的小对象，使用容器。
- 对于在堆中居住的小型对象的自动释放，使用 `shared_ptr/unique_ptr`。

**2.** 资源管理。

使用 `RAII`，见上文。

**3.** 错误处理。

使用异常。在大多数情况下，您只需要抛出异常，而不需要捕获它（由于 `RAII`）。

在离线数据处理应用中，不捕获异常通常是可以接受的。

在处理用户请求的服务器中，通常只需在连接处理程序的顶层捕获异常即可。

在线程函数中，您应该捕获并保存所有异常，以便在 `join` 后在主线程中重新抛出它们。

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

切勿在未处理的情况下隐藏异常。切勿盲目将所有异常记录在日志中。

```cpp
//Not correct
catch (...) {}
```

如果需要忽略某些异常，只对特定异常如此，并重新抛出其余异常。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

在使用具有响应码或 `errno` 函数时，始终检查结果并在出现错误的情况下抛出异常。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

您可以使用 assert 来检查代码中的不变性。

**4.** 异常类型。

在应用程序代码中不需要使用复杂的异常层次结构。异常文本应对系统管理员可理解。

**5.** 从析构函数抛出异常。

这并不推荐，但允许。

使用以下选项：

- 创建一个函数（`done()` 或 `finalize()`），在异常可能发生之前完成所有工作。如果该函数已被调用，之后的析构函数中不应有异常。
- 过于复杂的任务（例如在网络上发送消息）可以放在一个单独的方法中，使用该类的用户必须在销毁之前调用。
- 如果析构函数中发生异常，最好记录而不是隐藏它（如果日志系统可用）。
- 在简单应用中，可以依赖于 `std::terminate`（对于 C++11 中默认的 `noexcept` 的情况）来处理异常。

**6.** 匿名代码块。

您可以在单个函数内部创建一个单独的代码块，以使某些变量成为局部的，这样当退出此块时，析构函数将被调用。

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** 多线程。

在离线数据处理程序中：

- 尽量在单个 CPU 核心上获得尽可能好的性能。在必要时再对代码进行并行化。

在服务器应用中：

- 使用线程池处理请求。目前尚未出现需要用户空间上下文切换的任务。

不使用 fork 进行并行化。

**8.** 线程同步。

通常可以让不同的线程使用不同的内存单元（更好的是：不同的缓存行），并且不使用任何线程同步（除了 `joinAll`）。

如果需要同步，在大多数情况下，使用 `lock_guard` 下的互斥量就足够了。

在其他情况下使用系统同步原语。不要使用忙等待。

仅在最简单的情况下使用原子操作。

除非这是您的主要专业领域，否则不要尝试实现无锁数据结构。

**9.** 指针与引用。

在大多数情况下，优先使用引用。

**10.** `const`。

使用常量引用、指向常量的指针、`const_iterator` 和 `const` 方法。

将 `const` 视为默认，只有在必要时使用非 `const`。

在按值传递变量时，使用 `const` 通常没有意义。

**11.** 无符号。

必要时使用 `unsigned`。

**12.** 数值类型。

使用 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32` 和 `Int64`，以及 `size_t`、`ssize_t` 和 `ptrdiff_t`。

不要使用这些类型数字：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 传递参数。

对于将被移动的复杂值按值传递，并使用 std::move；如果您想在循环中更新值则按引用传递。

如果一个函数获取了在堆上创建对象的所有权，请使参数类型为 `shared_ptr` 或 `unique_ptr`。

**14.** 返回值。

在大多数情况下，使用 `return`。不要写 `return std::move(res)`。

如果函数在堆上分配对象并返回它，使用 `shared_ptr` 或 `unique_ptr`。

在少数情况下（在循环中更新值），您可能需要通过参数返回值。在这种情况下，参数应为引用。

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

**15.** `namespace`。

不需要为应用程序代码使用单独的 `namespace`。

小型库也不需要这样。

对于中型到大型库，将所有内容放在一个 `namespace` 中。

在库的 `.h` 文件中，您可以使用 `namespace detail` 隐藏不需要在应用程序代码中的实现细节。

在 `.cpp` 文件中，您可以使用 `static` 或匿名 `namespace` 隐藏符号。

此外，`namespace` 可用于 `enum` 以防止相应的名称掉入外部 `namespace`（但最好使用 `enum class`）。

**16.** 延迟初始化。

如果初始化需要参数，则通常不应编写默认构造函数。

如果将来需要延迟初始化，您可以添加一个默认构造函数，该构造函数将创建一个无效对象。或者，对于少量对象，可以使用 `shared_ptr/unique_ptr`。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 虚函数。

如果类不打算用于多态使用，则不需要使函数为虚函数。这同样适用于析构函数。

**18.** 编码。

在任何地方都使用 UTF-8。使用 `std::string` 和 `char *`。不要使用 `std::wstring` 和 `wchar_t`。

**19.** 日志记录。

参见代码中的示例。

在提交之前，删除所有无意义和调试日志，以及任何其他类型的调试输出。

在循环中记录应尽量避免，即使在 Trace 等级。

日志必须在任何记录级别下都能被阅读。

日志应主要用于应用程序代码。

日志消息必须用英语撰写。

日志应尽可能对系统管理员可理解。

不要在日志中使用粗俗语言。

在日志中使用UTF-8编码。在少数情况下，您可以在日志中使用非ASCII字符。

**20.** 输入输出。

不要在对应用程序性能至关重要的内部循环中使用 `iostreams`（绝不使用 `stringstream`）。

使用 `DB/IO` 库。

**21.** 日期和时间。

参见 `DateLUT` 库。

**22.** 包含。

始终使用 `#pragma once`，而不是包含保护。

**23.** 使用。

不使用 `using namespace`。您可以使用 `using` 进行特定的内容。但是使其在类或函数内部局部。

**24.** 除非必要，否则不使用 `trailing return type`。

```cpp
auto f() -> void
```

**25.** 变量的声明和初始化。

```cpp
//right way
std::string s = "Hello";
std::string s{"Hello"};

//wrong way
auto s = std::string{"Hello"};
```

**26.** 对于虚函数，在基类中写 `virtual`，而在派生类中用 `override` 代替 `virtual`。

## C++ 的未使用功能 {#unused-features-of-c}

**1.** 不使用虚继承。

**2.** 在现代 C++ 中具有便利语法糖的构造，例如：

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

## 平台 {#platform}

**1.** 我们为特定平台编写代码。

但在其他条件相同的情况下，优先使用跨平台或可移植的代码。

**2.** 语言：C++20（见可用 [C++20 特性](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features) 的列表）。

**3.** 编译器：`clang`。截至撰写时（2025年3月），代码使用 `clang` 版本 >= 19 进行编译。

使用标准库（`libc++`）。

**4.** 操作系统：Linux Ubuntu，不低于 Precise。

**5.** 代码为 x86_64 CPU 架构编写。

CPU 指令集是我们服务器中最低支持的集。目前是 SSE 4.2。

**6.** 使用 `-Wall -Wextra -Werror -Weverything` 编译标志，但有一些例外。

**7.** 除了那些难以静态链接的库外，所有库都使用静态链接（见 `ldd` 命令的输出）。

**8.** 在发布设置下开发和调试代码。

## 工具 {#tools}

**1.** KDevelop 是一个不错的 IDE。

**2.** 调试时，使用 `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...` 或 `tcmalloc_minimal_debug`。

**3.** 进行性能分析时，使用 `Linux Perf`、`valgrind`（`callgrind`）或 `strace -cf`。

**4.** 源代码使用 Git。

**5.** 汇编使用 `CMake`。

**6.** 程序通过 `deb` 包发布。

**7.** 提交到主分支的更改不能破坏构建。

虽然仅选择的修订版被认为是可工作的。

**8.** 尽可能频繁地进行提交，即使代码只是部分准备好。

为此使用分支。

如果您在 `master` 分支中的代码尚未可构建，请在 `push` 之前将其排除在构建之外。您需要在几天内完成它或将其删除。

**9.** 对于非平凡的更改，使用分支并在服务器上发布。

**10.** 从存储库中删除未使用的代码。

## 库 {#libraries}

**1.** 使用 C++20 标准库（允许实验性扩展），以及 `boost` 和 `Poco` 框架。

**2.** 不允许使用操作系统包中的库。也不允许使用预安装的库。所有库应以源代码形式放在 `contrib` 目录中并与 ClickHouse 一起构建。有关详细信息，请参见 [添加和维护第三方库的指南](/development/contrib#adding-and-maintaining-third-party-libraries)。

**3.** 总是优先考虑已经在使用中的库。

## 一般建议 {#general-recommendations-1}

**1.** 写尽可能少的代码。

**2.** 尝试最简单的解决方案。

**3.** 在知道它将如何工作以及内部循环将如何运行之前，请勿编写代码。

**4.** 在最简单的情况下，使用 `using` 而不是类或结构体。

**5.** 如果可能，不要编写复制构造函数、赋值运算符、析构函数（除非是虚构造函数，如果类至少包含一个虚拟函数）、移动构造函数或移动赋值运算符。换句话说，编译器生成的函数必须正常工作。您可以使用 `default`。

**6.** 鼓励代码简化。在可能的情况下减少代码的大小。

## 其他建议 {#additional-recommendations}

**1.** 明确指定 `std::` 进行 `stddef.h` 中的类型

并不推荐。换句话说，我们建议写 `size_t` 而不是 `std::size_t`，因为这样更短。

可以选择添加 `std::`。

**2.** 明确指定 `std::` 进行标准 C 库中的函数

并不推荐。换句话说，写 `memcpy` 而不是 `std::memcpy`。

原因是存在类似的非标准函数，例如 `memmem`。我们确实偶尔会使用这些函数。这些函数不在 `namespace std` 中。

如果您在任何地方写 `std::memcpy` 而不是 `memcpy`，那么没有 `std::` 的 `memmem` 看起来会很奇怪。

尽管如此，如果您更喜欢使用 `std::`，仍然可以。

**3.** 当相同的函数可用于标准 C++ 库时，使用 C 的函数。

如果更有效，这是可以接受的。

例如，对于复制大段内存，使用 `memcpy` 而不是 `std::copy`。

**4.** 多行函数参数。

以下任何包装样式都是允许的：

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
