# type: ignore
{
    "targets": [
        {
            "target_name": "oopetris",
            "cflags_cc": [
                "-std=c++23",
                "-Wall",
                "-Wextra",
                "-Wno-unused-parameter",
                "-Wno-unused-function",
                "-O3",
                "-Werror",
                "-Wpedantic",
                "-fexceptions",
                "-frtti",
                "-Wno-cast-function-type",  # since nan.h -> node.h has some warnings regarding that
                "-static",  # statically link this
                "-stdlib=libstdc++",  # use the gcc std lib libstdc++
            ],
            "defines": ["V8_DEPRECATION_WARNINGS=1"],
            "sources": [
                "src/cpp/wrapper.cpp",
                "src/cpp/logger.cpp",
                "../simulator/src/server/server.cpp",
            ],
            "include_dirs": [
                "<!@(node -e \"require('nan')\")",
                # this are all hardcoded paths to the dependency include paths, some of them where downloaded by cmake with CPM
                "../simulator/build/_deps/c2k_sockets-src/src/sockets/include",
                "../simulator/build/_deps/gsl-src/include",
                "../simulator/build/_deps/lib2k-src/src/include",
                "../simulator/build/_deps/magic_enum-src/include/magic_enum",
                "../simulator/build/_deps/spdlog-src/include",
                "../simulator/src",
                "../simulator/src/common/include",
                "../simulator/src/network/include",
                "../simulator/src/server/",
                "../simulator/src/simulator/include",
            ],
            "libraries": [
                # this are all hardcoded paths to the libraries, that cmake build
                "<!(pwd)/../simulator/build/_deps/lib2k-build/bin/liblib2k.a",
                "<!(pwd)/../simulator/build/_deps/spdlog-build/libspdlog.a",
                "<!(pwd)/../simulator/build/_deps/c2k_sockets-build/bin/sockets/libc2k_sockets.a",
                "<!(pwd)/../simulator/build/_deps/libcurl-build/lib/libcurl.a",
                "<!(pwd)/../simulator/build/_deps/utf8_proc-build/libutf8proc.a",
                "<!(pwd)/../simulator/build/_deps/crapper-build/bin/libcrapper.a",
                "<!(pwd)/../simulator/build/bin/simulator/libsimulator.a",
                "<!(pwd)/../simulator/build/bin/obpf/libobpf.a",
                "<!(pwd)/../simulator/build/bin/network/libnetwork.a",
            ],
        }
    ],
}
