# Generate the parser
antlr4 -Dlanguage=TypeScript Kestrel.g4 -visitor -o src/parser/antlr

# Suppress ts errors in generated files
echo "$(echo '// @ts-nocheck'; cat src/parser/antlr/KestrelParser.ts)" > src/parser/antlr/KestrelParser.ts
echo "$(echo '// @ts-nocheck'; cat src/parser/antlr/KestrelLexer.ts)" > src/parser/antlr/KestrelLexer.ts
