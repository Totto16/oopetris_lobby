

#pragma once

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wtemplate-id-cdtor"
#endif

#include <nan.h>

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic pop
#endif

#include <memory>
#include <mutex>
#include <spdlog/sinks/base_sink.h>
#include <utility>
#include <vector>

namespace node {

struct mutex {
private:
  v8::Isolate *_isolate;
  v8::Locker *_locker;

public:
  mutex() : _isolate{nullptr} {};

  mutex(v8::Isolate *isolate) : _isolate{isolate} {};

  void set_isolate(v8::Isolate *isolate) { _isolate = isolate; }

  void lock() {
    if (!_isolate) {
      return;
    }

    printf("valid lock\n");
    _locker = new v8::Locker{_isolate};
  }
  void unlock() {
    if (!_locker) {
      return;
    }

    printf("valid unlock\n");

    delete _locker;
    _locker = nullptr;
  }
  bool try_lock() {
    if (!_isolate) {
      return false;
    }

    if (not v8::Locker::IsLocked(_isolate)) {
      this->lock();
      return true;
    }

    return false;
  }
};

} // namespace node

namespace details {

static v8::Local<v8::Value>
get_js_level(const spdlog::level::level_enum level) {

  switch (level) {
  case spdlog::level::level_enum::trace:
    return Nan::New("trace").ToLocalChecked();
  case spdlog::level::level_enum::debug:
    return Nan::New("debug").ToLocalChecked();
  case spdlog::level::level_enum::info:
    return Nan::New("info").ToLocalChecked();
  case spdlog::level::level_enum::warn:
    return Nan::New("warn").ToLocalChecked();
  case spdlog::level::level_enum::err:
    return Nan::New("err").ToLocalChecked();
  case spdlog::level::level_enum::critical:
    return Nan::New("critical").ToLocalChecked();
  case spdlog::level::level_enum::off:
    return Nan::New("off").ToLocalChecked();
  default:
    return Nan::Undefined();
  }
}

static std::vector<v8::Local<v8::Value>>
get_arguments(const spdlog::level::level_enum level, const std::string &msg,
              const spdlog::log_clock::time_point time) {

  std::vector<v8::Local<v8::Value>> result{};

  auto level_js = get_js_level(level);

  result.push_back(level_js);

  result.push_back(Nan::New<v8::String>(msg).ToLocalChecked());

  std::uint64_t milliseconds_since_epoch =
      std::chrono::duration_cast<std::chrono::milliseconds>(
          time.time_since_epoch())
          .count();

  auto time_js =
      Nan::New<v8::Date>(static_cast<double>(milliseconds_since_epoch))
          .ToLocalChecked();

  result.push_back(time_js);

  return result;
}

} // namespace details

namespace logger {

using Callback =
    std::function<void(spdlog::level::level_enum, const std::string &,
                       spdlog::log_clock::time_point)>;

using CallbackContext =
    std::pair<std::unique_ptr<Nan::Callback>, v8::Isolate *>;

using Callbacks = std::vector<std::shared_ptr<CallbackContext>>;

template <typename Mutex>
class node_sink : public spdlog::sinks::base_sink<Mutex> {
private:
  Callbacks m_callbacks;

public:
  node_sink(/* v8::Isolate *isolate, */ Callbacks &&callbacks)
      : m_callbacks{std::move(callbacks)} {
    // this->mutex_.set_isolate(isolate);
  }

  node_sink(/* v8::Isolate *isolate */) : m_callbacks{} {
    // this->mutex_.set_isolate(isolate);
  }

  void add(std::unique_ptr<Nan::Callback> &&callback, v8::Isolate *isolate) {

    auto pair = std::make_pair<std::unique_ptr<Nan::Callback>, v8::Isolate *>(
        std::move(callback), std::move(isolate));

    auto cb = std::make_shared<CallbackContext>(std::move(pair));

    m_callbacks.push_back(std::move(cb));
  }

private:
  void _internal_callback(const CallbackContext &context,
                          const spdlog::level::level_enum level,
                          const std::string &msg,
                          const spdlog::log_clock::time_point time) {

    auto &[callback, isolate] = context;

    v8::Locker locker(isolate);
    {
      v8::Isolate::Scope isolate_scope(isolate);
      v8::HandleScope scope(isolate);

      assert(v8::Isolate::GetCurrent() && "isolate is present");

      printf("isolate %p\n", (void *)isolate);
      printf("isolate_2 %p\n", (void *)(v8::Isolate::GetCurrent()));

      // this is for for every logger and not once, to
      // not have copy errors, or false shared JS values
      std::vector<v8::Local<v8::Value>> arguments =
          details::get_arguments(level, msg, time);

      printf("after args\n");

      Nan::Call(*callback, Nan::GetCurrentContext()->Global(), arguments.size(),
                arguments.data());

      printf("after call\n");
    }

    printf("after callback\n");
  }

protected:
  void sink_it_(const spdlog::details::log_msg &msg) override {
    printf("new  sink_it_\n");
    spdlog::memory_buf_t formatted;
    spdlog::sinks::base_sink<Mutex>::formatter_->format(msg, formatted);
    auto string = fmt::to_string(formatted);
    for (const auto &callback : m_callbacks) {
      // WIP: this doesn't work correctly over multiple threads yet!
      (void)callback;
      // _internal_callback(*callback, msg.level, string, msg.time);
    }
    printf("after callback in logger\n");
  }

  void flush_() override {
    // noop
  }
};

using node_sink_mt = node_sink<std::mutex>;
using node_sink_mt_2 = node_sink<node::mutex>;

} // namespace logger
