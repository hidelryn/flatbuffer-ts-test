xcode-select --install
arch -arm64 brew install flatbuffers --HEAD

flatc --ts -o ../ @@.ts