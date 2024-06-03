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

moduleNamespace: TYPE_ID ('/' TYPE_ID)*;

program: import_* declaration* EOF;

import_: 'import' moduleNamespace;

declaration:
	pub = 'pub'? 'let' ID (':' typeHint = polyType)? '=' expr						# letDeclaration
	| 'extern' pub = 'pub'? 'let' ID ':' typeHint = polyType						# externLetDeclaration
	| pub = pubExposing? 'type' name = TYPE_ID paramsList? '{' typeVariants? '}'	# typeDeclaration
	| 'extern' pub = 'pub'? 'type' name = TYPE_ID paramsList?						# externTypeDeclaration;

pubExposing: 'pub' (exposing = '(' '..' ')')?;
paramsList: '<' ID (',' ID)* '>';

typeVariants:
	typeConstructorDecl (',' typeConstructorDecl)* ','?;

polyType: type;
type:
	name = TYPE_ID ('<' type (',' type)* '>')?		# namedType
	| 'Fn' '(' fnTypeParams? ')' '->' ret = type	# fnType
	| ID											# genericType
	| '(' type ',' type (',' type)* ')'				# tupleType;

fnTypeParams: ( type (',' type)* ','?);

typeConstructorDecl: name = TYPE_ID ('(' type (',' type)* ')')?;

expr:
	INT															# int
	| FLOAT														# float
	| CHAR														# char
	| STRING													# string
	| (moduleNamespace '.')? (name = (ID | TYPE_ID))			# id
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