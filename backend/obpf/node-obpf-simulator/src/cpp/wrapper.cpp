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

  Server *server = static_cast<Server *>(v8::External::Cast(*info[0])->Value());

  server->stop();

  return;
}

NAN_MODULE_INIT(InitAll) {

  Nan::Set(
      target, Nan::New("stop").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(stop)).ToLocalChecked());

  Nan::Set(
      target, Nan::New("start").ToLocalChecked(),
      Nan::GetFunction(Nan::New<v8::FunctionTemplate>(start)).ToLocalChecked());
}

NODE_MODULE(ServerWrapper, InitAll)
