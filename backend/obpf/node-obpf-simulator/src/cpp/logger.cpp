

#include "./logger.hpp"

static v8::Local<v8::Value>
details::get_js_level(const spdlog::level::level_enum level) {

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
details::get_arguments(const spdlog::level::level_enum level,
                       const std::string &msg,
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
