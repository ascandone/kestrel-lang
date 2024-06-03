grammar Kestrel;

// Common
LineComment: '//' ~[\r\n]* -> channel(HIDDEN);

ID: [_a-z]+; // TODO differentiate between ident and bindings
TYPE_ID: [A-Z]+ [a-z]*;
INT: [0-9]+;
CHAR: '\'' ~[']* '\'';
STRING: '"' ~["]* '"';
FLOAT: [0-9]* '.' [0-9]+;
NEWLINE: '\r'? '\n' -> skip;
WS: [ \t\r\n]+ -> skip;

program: declaration* EOF;

declaration: 'let' ID (':' typeHint = polyType)? '=' expr;
polyType: type;
type:
	name = TYPE_ID ('<' type (',' type)* '>')?		# namedType
	| 'Fn' '(' fnTypeParams? ')' '->' ret = type	# fnType
	| ID											# genericType;

fnTypeParams: ( type (',' type)* ','?);

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
	| '[' (expr (',' expr)* ','?)? ']'							# listLit
	| expr op = '|>' expr										# Pipe;

block: '{' blockContent '}';

blockContent:
	expr																		# blockContentExpr
	| 'let#' mapper = ID binding = ID '=' value = expr ';' body = blockContent	#
		blockContentLetHashExpr
	| 'let' binding = ID '=' value = expr ';' body = blockContent # blockContentLetExpr;