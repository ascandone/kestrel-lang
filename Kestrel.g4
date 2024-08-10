grammar Kestrel;

SLASH_4: '////';
SLASH_3: '///';
SLASH_2: '//';

LineComment: SLASH_2 ~[\r\n]* -> channel(HIDDEN);

EXPOSING_NESTED: '(' '..' ')';
INFIX_ID: '(' INFIX_CHAR+ ')';
ID:
	[_a-z] [_a-z0-9]*; // TODO differentiate between ident and bindings
TYPE_ID: [A-Z]+ [a-zA-Z0-9]*;
INT: [0-9]+;
CHAR: '\'' ~[']* '\'';

STRING: '"' DoubleStringCharacter* '"';

fragment DoubleStringCharacter: ~'"' | '\\' .;

FLOAT: [0-9]* '.' [0-9]+;
NEWLINE: '\r'? '\n' -> skip;
WS: [ \t\r\n]+ -> skip;

MODULEDOC_COMMENT_LINE: SLASH_4 (~'\n')* NEWLINE;
DOC_COMMENT_LINE: SLASH_3 (~'\n')* NEWLINE;

moduleNamespace: TYPE_ID ('/' TYPE_ID)*;

program:
	(doc = MODULEDOC_COMMENT_LINE*) import_* declaration* EOF;

import_:
	'import' moduleNamespace (
		'.' '{' importExposing (',' importExposing)* '}'
	)?;

importExposing:
	name = (ID | INFIX_ID)				# valueExposing
	| name = TYPE_ID EXPOSING_NESTED?	# typeExposing;

declaration:
	letDeclaration_				# letDeclaration
	| externLetDeclaration_		# externLetDeclaration
	| typeDeclaration_			# typeDeclaration
	| structDeclaration_		# structDeclaration
	| externTypeDeclaration_	# externTypeDeclaration;

letDeclaration_:
	(doc = DOC_COMMENT_LINE*) (inline = '@inline')? (
		pub = 'pub'?
	) 'let' ID (':' typeHint = polyType)? '=' expr;

externLetDeclaration_:
	(doc = DOC_COMMENT_LINE*) 'extern' pub = 'pub'? 'let' (
		binding = (INFIX_ID | ID)
	) ':' typeHint = polyType;

typeDeclaration_:
	(doc = DOC_COMMENT_LINE*) pub = pubExposing? 'type' name = TYPE_ID paramsList? '{' typeVariants?
		'}';

structDeclaration_:
	(doc = DOC_COMMENT_LINE*) pub = pubExposing? 'type' name = TYPE_ID paramsList? 'struct' '{'
		fields? '}';

externTypeDeclaration_:
	(doc = DOC_COMMENT_LINE*) 'extern' pub = 'pub'? 'type' name = TYPE_ID paramsList?;

pubExposing: 'pub' EXPOSING_NESTED?;
paramsList: '<' ID (',' ID)* '>';

typeVariants:
	typeConstructorDecl (',' typeConstructorDecl)* ','?;

fieldDecl: ID ':' type;
fields: fieldDecl (',' fieldDecl)* ','?;

polyType:
	type ('where' traitImplClause (',' traitImplClause)*)?;
traitImplClause: ID ':' (TYPE_ID ('+' TYPE_ID)*);

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
	| expr '.' ID															# fieldAccess
	| qualifiedId															# id
	| op = '!' expr															# BoolNot
	| expr '(' (expr (',' expr)* ','?)? ')'									# call
	| expr op = ('*' | '/' | '*.' | '/.' | '%') expr						# MulDiv
	| expr op = ('+' | '-' | '+.' | '-.' | '++') expr						# AddSub
	| <assoc = right> expr op = '::' expr									# cons
	| expr op = ('==' | '!=') expr											# Eq
	| expr op = ('<' | '<=' | '>' | '>=') expr								# Comp
	| expr op = '||' expr													# BoolOr
	| expr op = '&&' expr													# BoolAnd
	| '(' expr ',' expr (',' expr)* ')'										# tuple
	| '(' expr ')'															# parens
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