#ifdef _WIN32
#ifndef NOMINMAX
#define NOMINMAX
#endif
#endif

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wtemplate-id-cdtor"
#endif

#include <nan.h>

#if defined(__GNUC__) & !defined(__clang__)
#pragma GCC diagnostic pop
#endif

#include "./logger.hpp"
#include <server/server.hpp>

NAN_METHOD(start) {

  if (info.Length() != 2) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("Wrong number of arguments"));
    return;
  }

  if (!info[0]->IsUint32()) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("First argument must be an Uint32 number"));
    return;
  }

  if (!info[1]->IsUint32()) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("Second argument must be an Uint32 number"));
    return;
  }

  auto context = Nan::GetCurrentContext();

  std::uint32_t _port = info[0]->ToUint32(context).ToLocalChecked()->Value();

  std::uint32_t _playerCount =
      info[1]->ToUint32(context).ToLocalChecked()->Value();

  if (_port > std::numeric_limits<std::uint16_t>::max()) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("First argument must be an Uint16 number"));
    return;
  }

  if (_playerCount > std::numeric_limits<std::uint8_t>::max()) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("Second argument must be an Uint8 number"));
    return;
  }

  std::uint16_t port = static_cast<std::atomic_uint16_t>(_port);

  std::uint8_t playerCount = static_cast<std::atomic_uint8_t>(_playerCount);

  auto server = std::make_shared<Server>(port, playerCount);

  info.GetReturnValue().Set(Nan::New<v8::External>(server.get()));
  return;
}

NAN_METHOD(stop) {

  if (info.Length() != 1) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("Wrong number of arguments"));
    return;
  }

  if (!info[0]->IsExternal()) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("First argument must be a C++ pointer"));
    return;
  }

  Server *server = static_cast<Server *>(info[0].As<v8::External>()->Value());

  server->stop();

  return;
}

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

NAN_METHOD(register_logger) {

  if (info.Length() != 1) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("Wrong number of arguments"));
    return;
  }

  if (!info[0]->IsFunction()) {
    info.GetIsolate()->ThrowException(
        Nan::TypeError("First argument must be a function"));
    return;
  }

  auto callback = info[0].As<v8::Function>();

  auto &sinks = spdlog::get("node_logger")->sinks();

  assert(sinks.size() == 1);

  reinterpret_cast<logger::node_sink_mt *>(sinks.at(0).get())
      ->add([callback](const spdlog::level::level_enum level,
                       const std::string &msg,
                       const spdlog::log_clock::time_point time) {
        // this is for for every logger and not once, to not have copy errors,
        // or false shared JS values
        std::vector<v8::Local<v8::Value>> arguments =
            get_arguments(level, msg, time);

        Nan::Call(callback, Nan::GetCurrentContext()->Global(),
                  arguments.size(), arguments.data());
      });

  return;
}

NAN_MODULE_INIT(InitAll) {

  auto sink = std::make_shared<logger::node_sink_mt>();

  auto node_logger = std::make_shared<spdlog::logger>("node_logger", sink);

  spdlog::set_default_logger(node_logger);

  Nan::Set(
      target, Nan::New("stop").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(stop)).ToLocalChecked());

  Nan::Set(
      target, Nan::New("start").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(start)).ToLocalChecked());

  Nan::Set(target, Nan::New("register_logger").ToLocalChecked(),
           Nan::GetFunction(Nan::New<v8::FunctionTemplate>(register_logger))
               .ToLocalChecked());
}

NODE_MODULE(ServerWrapper, InitAll)
