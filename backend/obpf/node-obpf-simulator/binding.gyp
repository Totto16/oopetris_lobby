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
            "sources": ["src/cpp/wrapper.cpp"],
            "include_dirs": [
                "<!@(node -e \"require('nan')\")",
                # this are all hardcoded paths to the dependencies, that cmake downloaded
                "../simulator/src",
                "../simulator/src/simulator/include",
                "../simulator/src/common/include",
                "../simulator/build/_deps/spdlog-src/include",
                "../simulator/build/_deps/lib2k-src/src/include",
                "../simulator/build/_deps/gsl-src/include",
                "../simulator/build/_deps/magic_enum-src/include/magic_enum",
            ],
            "library": [
                #
            ],
        }
    ],
}
