

#pragma once

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wtemplate-id-cdtor"
#endif

#include <nan.h>

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic pop
#endif

#include "./worker.hpp"
#include <mutex>
#include <spdlog/sinks/base_sink.h>

namespace logger {

using Callback =
    std::function<void(spdlog::level::level_enum, const std::string &,
                       spdlog::log_clock::time_point)>;

using Callbacks = std::vector<std::unique_ptr<Nan::Callback>>;

template <typename Mutex>
class node_sink : public spdlog::sinks::base_sink<Mutex> {
private:
  Callbacks m_callbacks;
  v8::Isolate *m_isolate;
  std::unique_ptr<Nan::AsyncResource> m_resource;

public:
  node_sink(v8::Isolate *isolate,
            std::unique_ptr<Nan::AsyncResource> &&resource,
            Callbacks &&callbacks)
      : m_callbacks{std::move(callbacks)}, m_isolate{isolate},
        m_resource{std::move(resource)} {}

  node_sink(v8::Isolate *isolate,
            std::unique_ptr<Nan::AsyncResource> &&resource)
      : m_callbacks{}, m_isolate{isolate}, m_resource{std::move(resource)} {}

  void add(std::unique_ptr<Nan::Callback> &&callback, v8::Isolate *isolate) {

    m_callbacks.push_back(std::move(callback));
  }

private:
  void _internal_callback(const std::unique_ptr<Nan::Callback> &callback,
                          const spdlog::level::level_enum level,
                          const std::string &msg,
                          const spdlog::log_clock::time_point time) {

    LogWorker *worker = new LogWorker(callback.get(), level, msg, time);

    Nan::AsyncQueueWorker(worker);
  }

protected:
  void sink_it_(const spdlog::details::log_msg &msg) override {
    printf("new  sink_it_\n");
    {

      spdlog::memory_buf_t formatted;
      spdlog::sinks::base_sink<Mutex>::formatter_->format(msg, formatted);
      auto string = fmt::to_string(formatted);

      printf("lockewr is locked %d - %p\n",
             v8::Locker::IsLocked(this->m_isolate), (void *)this->m_isolate);

      v8::Locker locker(this->m_isolate);
      printf("after lock\n");
      {
        v8::Isolate::Scope isolate_scope(this->m_isolate);
        v8::HandleScope scope(this->m_isolate);

        for (const auto &callback : m_callbacks) {
          this->_internal_callback(callback, msg.level, string, msg.time);
        }
      }
    }
    printf("after callback in logger\n");
  }

  void flush_() override {
    // noop
  }
};

using node_sink_mt = node_sink<std::mutex>;

} // namespace logger
