

#pragma once
#include <memory>
#include <mutex>
#include <spdlog/details/null_mutex.h>
#include <spdlog/sinks/base_sink.h>
#include <vector>

namespace logger {

using Callback =
    std::function<void(spdlog::level::level_enum, const std::string &,
                       spdlog::log_clock::time_point)>;

using Callbacks = std::shared_ptr<std::vector<logger::Callback>>;

template <typename Mutex>
class node_sink : public spdlog::sinks::base_sink<Mutex> {
private:
  Callbacks m_callbacks;

public:
  node_sink(Callbacks &&callbacks) : m_callbacks{std::move(callbacks)} {}

  node_sink() : m_callbacks{} {}

  void add(Callback &&callback) { m_callbacks->push_back(std::move(callback)); }

protected:
  void sink_it_(const spdlog::details::log_msg &msg) override {

    spdlog::memory_buf_t formatted;
    spdlog::sinks::base_sink<Mutex>::formatter_->format(msg, formatted);
    auto string = fmt::to_string(formatted);
    for (const auto &callback : *m_callbacks) {
      callback(msg.level, string, msg.time);
    }
  }

  void flush_() override {
    // noop
  }
};

using node_sink_mt = node_sink<std::mutex>;
using node_sink_st = node_sink<spdlog::details::null_mutex>;

} // namespace logger
