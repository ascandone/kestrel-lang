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
	op = '!' expr										# BoolNot
	| expr op = ('*' | '/' | '*.' | '/.' | '%') expr	# MulDiv
	| expr op = ('+' | '-' | '+.' | '-.' | '++') expr	# AddSub
	| expr op = ('==' | '!=') expr						# Eq
	| expr op = ('<' | '<=' | '>' | '>=') expr			# Comp
	| expr op = '||' expr								# BoolOr
	| expr op = '&&' expr								# BoolAnd
	| INT												# int
	| FLOAT												# float
	| CHAR												# char
	| STRING											# string
	| ID												# id
	| '(' expr ')'										# parens
	| expr '(' (expr (',' expr)* ','?)? ')'				# call;