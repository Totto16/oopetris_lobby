

#pragma once

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wtemplate-id-cdtor"
#endif

#include <nan.h>

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic pop
#endif

#include <spdlog/spdlog.h>

namespace details {

[[nodiscard]] v8::Local<v8::Value>
get_js_level(const spdlog::level::level_enum level);

[[nodiscard]] std::vector<v8::Local<v8::Value>>
get_arguments(const spdlog::level::level_enum level, const std::string &msg,
              const spdlog::log_clock::time_point time);

} // namespace details

class LogWorker : public Nan::AsyncWorker {
private:
  spdlog::level::level_enum m_level;
  std::string m_msg;
  spdlog::log_clock::time_point m_time;

public:
  LogWorker(Nan::Callback *callback, const spdlog::level::level_enum level,
            const std::string &msg, const spdlog::log_clock::time_point time)
      : AsyncWorker{callback, "obpf.simulator.worker"}, m_level{level},
        m_msg{msg}, m_time{time} {}
  ~LogWorker() {}

  void Execute() override {
    // do nothing
  }

  void HandleOKCallback() override {
    Nan::HandleScope scope{};

    // this is for for every logger and not once, to
    // not have copy errors, or false shared JS values
    std::vector<v8::Local<v8::Value>> arguments =
        details::get_arguments(m_level, m_msg, m_time);

    callback->Call(arguments.size(), arguments.data(), async_resource);
  }
};
