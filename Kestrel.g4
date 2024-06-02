grammar Kestrel;

// Common
ID: [_a-z]+;
INT: [0-9]+;
CHAR: '\'' ~[']* '\'';
STRING: '"' ~["]* '"';
FLOAT: [0-9]* '.' [0-9]+;
NEWLINE: '\r'? '\n';
WS: [ \t\r\n]+ -> skip; // toss out whitespace

program: declaration* EOF;

declaration: 'let' ID '=' expr;

expr:
	expr ('*' | '/') expr	# MulDiv
	| expr ('+' | '-') expr	# AddSub
	| INT					# int
	| FLOAT					# float
	| CHAR					# char
	| STRING				# string
	| ID					# id
	| '(' expr ')'			# parens;