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

#include <spdlog/sinks/stdout_sinks.h>

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

  auto isolate = v8::Isolate::GetCurrent();

  printf("MAIN: lockewr is locked %d\n", v8::Locker::IsLocked(isolate));

  auto server = std::make_shared<Server>(port, playerCount);
  printf("MAIN: lockewr is locked %d\n", v8::Locker::IsLocked(isolate));

  printf("server start\n");

  info.GetReturnValue().Set(Nan::New<v8::External>(server.get()));

  printf("MAIN: lockewr is locked %d\n", v8::Locker::IsLocked(isolate));
  printf("test here end\n");

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

  printf("TEST 1\n");

  auto callback = std::make_unique<Nan::Callback>(info[0].As<v8::Function>());

  printf("TEST 2\n");

  auto &sinks = spdlog::get("node_logger")->sinks();

  printf("TEST sinks %zu\n", sinks.size());

  assert(sinks.size() >= 1 && "sink size is a s expected");

  auto logger = reinterpret_cast<logger::node_sink_mt *>(sinks.at(0).get());

  printf("TEST logger %p\n", static_cast<void *>(logger));

  auto isolate = v8::Isolate::GetCurrent();

  logger->add(std::move(callback), isolate);

  printf("TEST logger  after end\n");

  return;
}

NAN_MODULE_INIT(InitAll) {

  auto isolate = v8::Isolate::GetCurrent();

  auto resource =
      std::make_unique<Nan::AsyncResource>("internal_logger_callback");

  auto sink =
      std::make_shared<logger::node_sink_mt>(isolate, std::move(resource));

  auto console = std::make_shared<spdlog::sinks::stdout_sink_mt>();

  std::vector<spdlog::sink_ptr> sinks{sink, console};

  auto node_logger =
      std::make_shared<spdlog::logger>("node_logger", begin(sinks), end(sinks));

  spdlog::set_default_logger(node_logger);

  spdlog::set_level(spdlog::level::trace);

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
