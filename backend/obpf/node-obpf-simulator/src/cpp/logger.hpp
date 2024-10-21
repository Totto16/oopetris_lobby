

#pragma once

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wtemplate-id-cdtor"
#endif

#include <nan.h>

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic pop
#endif

#include <mutex>
#include <spdlog/sinks/base_sink.h>

namespace details {

static v8::Local<v8::Value> get_js_level(const spdlog::level::level_enum level);

static std::vector<v8::Local<v8::Value>>
get_arguments(const spdlog::level::level_enum level, const std::string &msg,
              const spdlog::log_clock::time_point time);

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

} // namespace logger
