grammar Kestrel;

// Common
ID: [_a-zA-Z]+; // TODO differentiate between ident and bindings
INT: [0-9]+;
CHAR: '\'' ~[']* '\'';
STRING: '"' ~["]* '"';
FLOAT: [0-9]* '.' [0-9]+;
NEWLINE: '\r'? '\n' -> skip;
WS: [ \t\r\n]+ -> skip;

program: declaration* EOF;

declaration: 'let' ID '=' expr;

expr:
	INT															# int
	| FLOAT														# float
	| CHAR														# char
	| STRING													# string
	| ID														# id
	| op = '!' expr												# BoolNot
	| expr op = ('*' | '/' | '*.' | '/.' | '%') expr			# MulDiv
	| expr op = ('+' | '-' | '+.' | '-.' | '++') expr			# AddSub
	| <assoc = right> expr op = '::' expr						# cons
	| expr op = ('==' | '!=') expr								# Eq
	| expr op = ('<' | '<=' | '>' | '>=') expr					# Comp
	| expr op = '||' expr										# BoolOr
	| expr op = '&&' expr										# BoolAnd
	| '(' expr ',' expr (',' expr)* ')'							# tuple
	| '(' expr ')'												# parens
	| expr '(' (expr (',' expr)* ','?)? ')'						# call
	| block														# blockExpr
	| 'fn' (ID (',' ID)* ','?)? block							# fn
	| 'if' condition = expr then = block 'else' else = block	# if
	| '[' (expr (',' expr)* ','?)? ']'							# listLit;

block: '{' blockContent '}';

blockContent:
	expr												# blockContentExpr
	| 'let' ID '=' value = expr ';' body = blockContent	# blockContentLetExpr;