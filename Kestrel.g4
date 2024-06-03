grammar Kestrel;

// Common
LineComment: '//' ~[\r\n]* -> channel(HIDDEN);

EXPOSING_NESTED: '(' '..' ')';
INFIX_ID: '(' INFIX_CHAR+ ')';
ID: [_a-z]+; // TODO differentiate between ident and bindings
TYPE_ID: [A-Z]+ [a-zA-Z0-9]*;
INT: [0-9]+;
CHAR: '\'' ~[']* '\'';
STRING: '"' ~["]* '"';
FLOAT: [0-9]* '.' [0-9]+;
NEWLINE: '\r'? '\n' -> skip;
WS: [ \t\r\n]+ -> skip;

moduleNamespace: TYPE_ID ('/' TYPE_ID)*;

program: import_* declaration* EOF;

import_:
	'import' moduleNamespace (
		'.' '{' importExposing (',' importExposing)* '}'
	)?;

importExposing:
	name = (ID | INFIX_ID)				# valueExposing
	| name = TYPE_ID EXPOSING_NESTED?	# typeExposing;

declaration:
	pub = 'pub'? 'let' ID (':' typeHint = polyType)? '=' expr							# letDeclaration
	| 'extern' pub = 'pub'? 'let' (binding = (INFIX_ID | ID)) ':' typeHint = polyType	#
		externLetDeclaration
	| pub = pubExposing? 'type' name = TYPE_ID paramsList? '{' typeVariants? '}'	# typeDeclaration
	| 'extern' pub = 'pub'? 'type' name = TYPE_ID paramsList?						# externTypeDeclaration;

pubExposing: 'pub' EXPOSING_NESTED?;
paramsList: '<' ID (',' ID)* '>';

typeVariants:
	typeConstructorDecl (',' typeConstructorDecl)* ','?;

polyType: type;
type:
	(moduleNamespace '.')? name = TYPE_ID (
		'<' type (',' type)* '>'
	)?												# namedType
	| 'Fn' '(' fnTypeParams? ')' '->' ret = type	# fnType
	| ID											# genericType
	| '(' type ',' type (',' type)* ')'				# tupleType;

fnTypeParams: ( type (',' type)* ','?);

typeConstructorDecl: name = TYPE_ID ('(' type (',' type)* ')')?;

qualifiedId: (moduleNamespace '.')? (name = (ID | TYPE_ID));

expr:
	INT																		# int
	| FLOAT																	# float
	| CHAR																	# char
	| STRING																# string
	| qualifiedId															# id
	| op = '!' expr															# BoolNot
	| expr op = ('*' | '/' | '*.' | '/.' | '%') expr						# MulDiv
	| expr op = ('+' | '-' | '+.' | '-.' | '++') expr						# AddSub
	| <assoc = right> expr op = '::' expr									# cons
	| expr op = ('==' | '!=') expr											# Eq
	| expr op = ('<' | '<=' | '>' | '>=') expr								# Comp
	| expr op = '||' expr													# BoolOr
	| expr op = '&&' expr													# BoolAnd
	| '(' expr ',' expr (',' expr)* ')'										# tuple
	| '(' expr ')'															# parens
	| expr '(' (expr (',' expr)* ','?)? ')'									# call
	| block																	# blockExpr
	| 'fn' (matchPattern (',' matchPattern)* ','?)? block					# fn
	| 'if' condition = expr then = block 'else' else = block				# if
	| 'match' matched = expr '{' (matchClause (',' matchClause)*)? ','? '}'	# match
	| '[' (expr (',' expr)* ','?)? ']'										# listLit
	| expr op = '|>' expr													# Pipe;

matchClause: matchPattern '=>' expr;

block: '{' blockContent '}';

blockContent:
	expr																							# blockContentExpr
	| 'let#' mapper = qualifiedId pattern = matchPattern '=' value = expr ';' body = blockContent	#
		blockContentLetHashExpr
	| 'let' pattern = matchPattern '=' value = expr ';' body = blockContent # blockContentLetExpr;

// Pattern matching syntax
matchPattern:
	ID # matchIdent
	| (moduleNamespace '.')? name = TYPE_ID (
		'(' matchPattern (',' matchPattern)* ')'
	)?															# constructor
	| INT														# intPattern
	| FLOAT														# floatPattern
	| CHAR														# charPattern
	| STRING													# stringPattern
	| <assoc = right> matchPattern '::' matchPattern			# consPattern
	| '(' matchPattern ',' matchPattern (',' matchPattern)* ')'	# tuplePattern;

INFIX_CHAR:
	'+'
	| '-'
	| '*'
	| '/'
	| '^'
	| '='
	| '>'
	| '<'
	| '.'
	| ':'
	| '!'
	| '%'
	| '&'
	| '|';