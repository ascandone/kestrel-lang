// @ts-nocheck
// Generated from Kestrel.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import KestrelListener from "./KestrelListener.js";
import KestrelVisitor from "./KestrelVisitor.js";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class KestrelParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly T__9 = 10;
	public static readonly T__10 = 11;
	public static readonly T__11 = 12;
	public static readonly T__12 = 13;
	public static readonly T__13 = 14;
	public static readonly T__14 = 15;
	public static readonly T__15 = 16;
	public static readonly T__16 = 17;
	public static readonly T__17 = 18;
	public static readonly T__18 = 19;
	public static readonly T__19 = 20;
	public static readonly T__20 = 21;
	public static readonly T__21 = 22;
	public static readonly T__22 = 23;
	public static readonly T__23 = 24;
	public static readonly T__24 = 25;
	public static readonly T__25 = 26;
	public static readonly T__26 = 27;
	public static readonly T__27 = 28;
	public static readonly T__28 = 29;
	public static readonly T__29 = 30;
	public static readonly T__30 = 31;
	public static readonly T__31 = 32;
	public static readonly T__32 = 33;
	public static readonly T__33 = 34;
	public static readonly T__34 = 35;
	public static readonly T__35 = 36;
	public static readonly T__36 = 37;
	public static readonly T__37 = 38;
	public static readonly T__38 = 39;
	public static readonly T__39 = 40;
	public static readonly T__40 = 41;
	public static readonly T__41 = 42;
	public static readonly T__42 = 43;
	public static readonly T__43 = 44;
	public static readonly T__44 = 45;
	public static readonly T__45 = 46;
	public static readonly T__46 = 47;
	public static readonly T__47 = 48;
	public static readonly T__48 = 49;
	public static readonly T__49 = 50;
	public static readonly T__50 = 51;
	public static readonly T__51 = 52;
	public static readonly SLASH_4 = 53;
	public static readonly SLASH_3 = 54;
	public static readonly SLASH_2 = 55;
	public static readonly LINE_COMMENT = 56;
	public static readonly EXPOSING_NESTED = 57;
	public static readonly INFIX_ID = 58;
	public static readonly ID = 59;
	public static readonly TYPE_ID = 60;
	public static readonly INT = 61;
	public static readonly CHAR = 62;
	public static readonly STRING = 63;
	public static readonly FLOAT = 64;
	public static readonly NEWLINE = 65;
	public static readonly WS = 66;
	public static readonly MODULEDOC_COMMENT_LINE = 67;
	public static readonly DOC_COMMENT_LINE = 68;
	public static readonly INFIX_CHAR = 69;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_moduleNamespace = 0;
	public static readonly RULE_program = 1;
	public static readonly RULE_import_ = 2;
	public static readonly RULE_importExposing = 3;
	public static readonly RULE_declaration = 4;
	public static readonly RULE_valueAttribute = 5;
	public static readonly RULE_letDeclaration_ = 6;
	public static readonly RULE_typeAttribute = 7;
	public static readonly RULE_typeDeclaration_ = 8;
	public static readonly RULE_structDeclaration_ = 9;
	public static readonly RULE_externTypeDeclaration_ = 10;
	public static readonly RULE_pubExposing = 11;
	public static readonly RULE_paramsList = 12;
	public static readonly RULE_typeVariants = 13;
	public static readonly RULE_fieldDecl = 14;
	public static readonly RULE_declarationFields = 15;
	public static readonly RULE_polyType = 16;
	public static readonly RULE_traitImplClause = 17;
	public static readonly RULE_type = 18;
	public static readonly RULE_fnTypeParams = 19;
	public static readonly RULE_typeConstructorDecl = 20;
	public static readonly RULE_qualifiedId = 21;
	public static readonly RULE_structField = 22;
	public static readonly RULE_structFields = 23;
	public static readonly RULE_expr = 24;
	public static readonly RULE_listElems = 25;
	public static readonly RULE_matchClause = 26;
	public static readonly RULE_blockStatement = 27;
	public static readonly RULE_block = 28;
	public static readonly RULE_matchPattern = 29;
	public static readonly RULE_listPatterns = 30;
	public static readonly literalNames: (string | null)[] = [ null, "'/'", 
                                                            "'import'", 
                                                            "'.'", "'{'", 
                                                            "','", "'}'", 
                                                            "'@type'", "'@inline'", 
                                                            "'@extern'", 
                                                            "'pub'", "'let'", 
                                                            "'='", "'@derive'", 
                                                            "'('", "')'", 
                                                            "'enum'", "'struct'", 
                                                            "'extern'", 
                                                            "'type'", "'<'", 
                                                            "'>'", "':'", 
                                                            "'where'", "'+'", 
                                                            "'->'", "'#'", 
                                                            "'!'", "'..'", 
                                                            "'*'", "'*.'", 
                                                            "'/.'", "'%'", 
                                                            "'-'", "'+.'", 
                                                            "'-.'", "'++'", 
                                                            "'=='", "'!='", 
                                                            "'<='", "'>='", 
                                                            "'||'", "'&&'", 
                                                            "'fn'", "'if'", 
                                                            "'else'", "'match'", 
                                                            "'['", "']'", 
                                                            "'|>'", "'=>'", 
                                                            "'let#'", "';'", 
                                                            "'////'", "'///'", 
                                                            "'//'" ];
	public static readonly symbolicNames: (string | null)[] = [ null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, null, 
                                                             null, "SLASH_4", 
                                                             "SLASH_3", 
                                                             "SLASH_2", 
                                                             "LINE_COMMENT", 
                                                             "EXPOSING_NESTED", 
                                                             "INFIX_ID", 
                                                             "ID", "TYPE_ID", 
                                                             "INT", "CHAR", 
                                                             "STRING", "FLOAT", 
                                                             "NEWLINE", 
                                                             "WS", "MODULEDOC_COMMENT_LINE", 
                                                             "DOC_COMMENT_LINE", 
                                                             "INFIX_CHAR" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"moduleNamespace", "program", "import_", "importExposing", "declaration", 
		"valueAttribute", "letDeclaration_", "typeAttribute", "typeDeclaration_", 
		"structDeclaration_", "externTypeDeclaration_", "pubExposing", "paramsList", 
		"typeVariants", "fieldDecl", "declarationFields", "polyType", "traitImplClause", 
		"type", "fnTypeParams", "typeConstructorDecl", "qualifiedId", "structField", 
		"structFields", "expr", "listElems", "matchClause", "blockStatement", 
		"block", "matchPattern", "listPatterns",
	];
	public get grammarFileName(): string { return "Kestrel.g4"; }
	public get literalNames(): (string | null)[] { return KestrelParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return KestrelParser.symbolicNames; }
	public get ruleNames(): string[] { return KestrelParser.ruleNames; }
	public get serializedATN(): number[] { return KestrelParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, KestrelParser._ATN, KestrelParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public moduleNamespace(): ModuleNamespaceContext {
		let localctx: ModuleNamespaceContext = new ModuleNamespaceContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, KestrelParser.RULE_moduleNamespace);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 62;
			this.match(KestrelParser.TYPE_ID);
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 63;
				this.match(KestrelParser.T__0);
				this.state = 64;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public program(): ProgramContext {
		let localctx: ProgramContext = new ProgramContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, KestrelParser.RULE_program);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 73;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===67) {
				{
				{
				this.state = 70;
				localctx._doc = this.match(KestrelParser.MODULEDOC_COMMENT_LINE);
				}
				}
				this.state = 75;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 79;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 76;
				this.import_();
				}
				}
				this.state = 81;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 85;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 470912) !== 0) || _la===68) {
				{
				{
				this.state = 82;
				this.declaration();
				}
				}
				this.state = 87;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 88;
			this.match(KestrelParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public import_(): Import_Context {
		let localctx: Import_Context = new Import_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 4, KestrelParser.RULE_import_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 90;
			this.match(KestrelParser.T__1);
			this.state = 91;
			this.moduleNamespace();
			this.state = 104;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 92;
				this.match(KestrelParser.T__2);
				this.state = 93;
				this.match(KestrelParser.T__3);
				this.state = 94;
				this.importExposing();
				this.state = 99;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 95;
					this.match(KestrelParser.T__4);
					this.state = 96;
					this.importExposing();
					}
					}
					this.state = 101;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 102;
				this.match(KestrelParser.T__5);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public importExposing(): ImportExposingContext {
		let localctx: ImportExposingContext = new ImportExposingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, KestrelParser.RULE_importExposing);
		let _la: number;
		try {
			this.state = 111;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 58:
			case 59:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 106;
				(localctx as ValueExposingContext)._name = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===58 || _la===59)) {
				    (localctx as ValueExposingContext)._name = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 60:
				localctx = new TypeExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 107;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 109;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===57) {
					{
					this.state = 108;
					this.match(KestrelParser.EXPOSING_NESTED);
					}
				}

				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public declaration(): DeclarationContext {
		let localctx: DeclarationContext = new DeclarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, KestrelParser.RULE_declaration);
		try {
			this.state = 117;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 113;
				this.letDeclaration_();
				}
				break;
			case 2:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 114;
				this.typeDeclaration_();
				}
				break;
			case 3:
				localctx = new StructDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 115;
				this.structDeclaration_();
				}
				break;
			case 4:
				localctx = new ExternTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 116;
				this.externTypeDeclaration_();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public valueAttribute(): ValueAttributeContext {
		let localctx: ValueAttributeContext = new ValueAttributeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, KestrelParser.RULE_valueAttribute);
		try {
			this.state = 123;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 7:
				localctx = new AttrTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 119;
				this.match(KestrelParser.T__6);
				this.state = 120;
				this.polyType();
				}
				break;
			case 8:
				localctx = new AttrInlineContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 121;
				this.match(KestrelParser.T__7);
				}
				break;
			case 9:
				localctx = new AttrExternContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 122;
				this.match(KestrelParser.T__8);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public letDeclaration_(): LetDeclaration_Context {
		let localctx: LetDeclaration_Context = new LetDeclaration_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 12, KestrelParser.RULE_letDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 128;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===68) {
				{
				{
				this.state = 125;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 130;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			{
			this.state = 134;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 896) !== 0)) {
				{
				{
				this.state = 131;
				this.valueAttribute();
				}
				}
				this.state = 136;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			{
			this.state = 138;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 137;
				localctx._pub = this.match(KestrelParser.T__9);
				}
			}

			}
			this.state = 140;
			this.match(KestrelParser.T__10);
			this.state = 141;
			localctx._binding = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===58 || _la===59)) {
			    localctx._binding = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 144;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===12) {
				{
				this.state = 142;
				this.match(KestrelParser.T__11);
				this.state = 143;
				this.expr(0);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeAttribute(): TypeAttributeContext {
		let localctx: TypeAttributeContext = new TypeAttributeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, KestrelParser.RULE_typeAttribute);
		let _la: number;
		try {
			this.state = 160;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 9:
				localctx = new TypeAttrExternContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 146;
				this.match(KestrelParser.T__8);
				}
				break;
			case 13:
				localctx = new TypeAttDerivingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 147;
				this.match(KestrelParser.T__12);
				this.state = 148;
				this.match(KestrelParser.T__13);
				this.state = 157;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===60) {
					{
					this.state = 149;
					this.match(KestrelParser.TYPE_ID);
					this.state = 154;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 150;
						this.match(KestrelParser.T__4);
						this.state = 151;
						this.match(KestrelParser.TYPE_ID);
						}
						}
						this.state = 156;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 159;
				this.match(KestrelParser.T__14);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeDeclaration_(): TypeDeclaration_Context {
		let localctx: TypeDeclaration_Context = new TypeDeclaration_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 16, KestrelParser.RULE_typeDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 165;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===68) {
				{
				{
				this.state = 162;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 167;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 171;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===9 || _la===13) {
				{
				{
				this.state = 168;
				this.typeAttribute();
				}
				}
				this.state = 173;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 175;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 174;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 177;
			this.match(KestrelParser.T__15);
			this.state = 178;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 180;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===20) {
				{
				this.state = 179;
				this.paramsList();
				}
			}

			this.state = 182;
			this.match(KestrelParser.T__3);
			this.state = 184;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===60) {
				{
				this.state = 183;
				this.typeVariants();
				}
			}

			this.state = 186;
			this.match(KestrelParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structDeclaration_(): StructDeclaration_Context {
		let localctx: StructDeclaration_Context = new StructDeclaration_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 18, KestrelParser.RULE_structDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 191;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===68) {
				{
				{
				this.state = 188;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 193;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 197;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===9 || _la===13) {
				{
				{
				this.state = 194;
				this.typeAttribute();
				}
				}
				this.state = 199;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 201;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 200;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 203;
			this.match(KestrelParser.T__16);
			this.state = 204;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 206;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===20) {
				{
				this.state = 205;
				this.paramsList();
				}
			}

			this.state = 208;
			this.match(KestrelParser.T__3);
			this.state = 210;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===59) {
				{
				this.state = 209;
				this.declarationFields();
				}
			}

			this.state = 212;
			this.match(KestrelParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public externTypeDeclaration_(): ExternTypeDeclaration_Context {
		let localctx: ExternTypeDeclaration_Context = new ExternTypeDeclaration_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 20, KestrelParser.RULE_externTypeDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 217;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===68) {
				{
				{
				this.state = 214;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 219;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 220;
			this.match(KestrelParser.T__17);
			this.state = 222;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 221;
				localctx._pub = this.match(KestrelParser.T__9);
				}
			}

			this.state = 224;
			this.match(KestrelParser.T__18);
			this.state = 225;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 227;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===20) {
				{
				this.state = 226;
				this.paramsList();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public pubExposing(): PubExposingContext {
		let localctx: PubExposingContext = new PubExposingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, KestrelParser.RULE_pubExposing);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 229;
			this.match(KestrelParser.T__9);
			this.state = 231;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===57) {
				{
				this.state = 230;
				this.match(KestrelParser.EXPOSING_NESTED);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public paramsList(): ParamsListContext {
		let localctx: ParamsListContext = new ParamsListContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, KestrelParser.RULE_paramsList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 233;
			this.match(KestrelParser.T__19);
			this.state = 234;
			this.match(KestrelParser.ID);
			this.state = 239;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 235;
				this.match(KestrelParser.T__4);
				this.state = 236;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 241;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 242;
			this.match(KestrelParser.T__20);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeVariants(): TypeVariantsContext {
		let localctx: TypeVariantsContext = new TypeVariantsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, KestrelParser.RULE_typeVariants);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 244;
			this.typeConstructorDecl();
			this.state = 249;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 32, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 245;
					this.match(KestrelParser.T__4);
					this.state = 246;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 251;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 32, this._ctx);
			}
			this.state = 253;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 252;
				this.match(KestrelParser.T__4);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fieldDecl(): FieldDeclContext {
		let localctx: FieldDeclContext = new FieldDeclContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, KestrelParser.RULE_fieldDecl);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 255;
			this.match(KestrelParser.ID);
			this.state = 256;
			this.match(KestrelParser.T__21);
			this.state = 257;
			this.type_();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public declarationFields(): DeclarationFieldsContext {
		let localctx: DeclarationFieldsContext = new DeclarationFieldsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, KestrelParser.RULE_declarationFields);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 259;
			this.fieldDecl();
			this.state = 264;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 34, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 260;
					this.match(KestrelParser.T__4);
					this.state = 261;
					this.fieldDecl();
					}
					}
				}
				this.state = 266;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 34, this._ctx);
			}
			this.state = 268;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 267;
				this.match(KestrelParser.T__4);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public polyType(): PolyTypeContext {
		let localctx: PolyTypeContext = new PolyTypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, KestrelParser.RULE_polyType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 270;
			this.type_();
			this.state = 280;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===23) {
				{
				this.state = 271;
				this.match(KestrelParser.T__22);
				this.state = 272;
				this.traitImplClause();
				this.state = 277;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 273;
					this.match(KestrelParser.T__4);
					this.state = 274;
					this.traitImplClause();
					}
					}
					this.state = 279;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public traitImplClause(): TraitImplClauseContext {
		let localctx: TraitImplClauseContext = new TraitImplClauseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, KestrelParser.RULE_traitImplClause);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 282;
			this.match(KestrelParser.ID);
			this.state = 283;
			this.match(KestrelParser.T__21);
			{
			this.state = 284;
			this.match(KestrelParser.TYPE_ID);
			this.state = 289;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===24) {
				{
				{
				this.state = 285;
				this.match(KestrelParser.T__23);
				this.state = 286;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_(): TypeContext {
		let localctx: TypeContext = new TypeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, KestrelParser.RULE_type);
		let _la: number;
		try {
			this.state = 332;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 295;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 39, this._ctx) ) {
				case 1:
					{
					this.state = 292;
					this.moduleNamespace();
					this.state = 293;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 297;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 309;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===20) {
					{
					this.state = 298;
					this.match(KestrelParser.T__19);
					this.state = 299;
					this.type_();
					this.state = 304;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 300;
						this.match(KestrelParser.T__4);
						this.state = 301;
						this.type_();
						}
						}
						this.state = 306;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 307;
					this.match(KestrelParser.T__20);
					}
				}

				}
				break;
			case 2:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 311;
				this.match(KestrelParser.T__13);
				this.state = 313;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || _la===59 || _la===60) {
					{
					this.state = 312;
					this.fnTypeParams();
					}
				}

				this.state = 315;
				this.match(KestrelParser.T__14);
				this.state = 316;
				this.match(KestrelParser.T__24);
				this.state = 317;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 3:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 318;
				this.match(KestrelParser.ID);
				}
				break;
			case 4:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 319;
				this.match(KestrelParser.T__13);
				this.state = 320;
				this.type_();
				this.state = 321;
				this.match(KestrelParser.T__4);
				this.state = 322;
				this.type_();
				this.state = 327;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 323;
					this.match(KestrelParser.T__4);
					this.state = 324;
					this.type_();
					}
					}
					this.state = 329;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 330;
				this.match(KestrelParser.T__14);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public fnTypeParams(): FnTypeParamsContext {
		let localctx: FnTypeParamsContext = new FnTypeParamsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, KestrelParser.RULE_fnTypeParams);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 334;
			this.type_();
			this.state = 339;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 335;
					this.match(KestrelParser.T__4);
					this.state = 336;
					this.type_();
					}
					}
				}
				this.state = 341;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
			}
			this.state = 343;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 342;
				this.match(KestrelParser.T__4);
				}
			}

			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public typeConstructorDecl(): TypeConstructorDeclContext {
		let localctx: TypeConstructorDeclContext = new TypeConstructorDeclContext(this, this._ctx, this.state);
		this.enterRule(localctx, 40, KestrelParser.RULE_typeConstructorDecl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 345;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 357;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14) {
				{
				this.state = 346;
				this.match(KestrelParser.T__13);
				this.state = 347;
				this.type_();
				this.state = 352;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 348;
					this.match(KestrelParser.T__4);
					this.state = 349;
					this.type_();
					}
					}
					this.state = 354;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 355;
				this.match(KestrelParser.T__14);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public qualifiedId(): QualifiedIdContext {
		let localctx: QualifiedIdContext = new QualifiedIdContext(this, this._ctx, this.state);
		this.enterRule(localctx, 42, KestrelParser.RULE_qualifiedId);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 362;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 49, this._ctx) ) {
			case 1:
				{
				this.state = 359;
				this.moduleNamespace();
				this.state = 360;
				this.match(KestrelParser.T__2);
				}
				break;
			}
			{
			this.state = 364;
			localctx._name = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===59 || _la===60)) {
			    localctx._name = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structField(): StructFieldContext {
		let localctx: StructFieldContext = new StructFieldContext(this, this._ctx, this.state);
		this.enterRule(localctx, 44, KestrelParser.RULE_structField);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 366;
			this.match(KestrelParser.ID);
			this.state = 367;
			this.match(KestrelParser.T__21);
			this.state = 368;
			this.expr(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structFields(): StructFieldsContext {
		let localctx: StructFieldsContext = new StructFieldsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 46, KestrelParser.RULE_structFields);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 370;
			this.structField();
			this.state = 375;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 50, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 371;
					this.match(KestrelParser.T__4);
					this.state = 372;
					this.structField();
					}
					}
				}
				this.state = 377;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 50, this._ctx);
			}
			this.state = 379;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 378;
				this.match(KestrelParser.T__4);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public expr(): ExprContext;
	public expr(_p: number): ExprContext;
	// @RuleVersion(0)
	public expr(_p?: number): ExprContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: ExprContext = new ExprContext(this, this._ctx, _parentState);
		let _prevctx: ExprContext = localctx;
		let _startState: number = 48;
		this.enterRecursionRule(localctx, 48, KestrelParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 469;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 64, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 382;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 383;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 384;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 385;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 386;
				this.qualifiedId();
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 387;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__26);
				this.state = 388;
				this.expr(17);
				}
				break;
			case 7:
				{
				localctx = new StructLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 389;
				this.match(KestrelParser.TYPE_ID);
				this.state = 390;
				this.match(KestrelParser.T__3);
				this.state = 392;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===59) {
					{
					this.state = 391;
					this.structFields();
					}
				}

				this.state = 396;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===28) {
					{
					this.state = 394;
					this.match(KestrelParser.T__27);
					this.state = 395;
					(localctx as StructLitContext)._spread = this.expr(0);
					}
				}

				this.state = 398;
				this.match(KestrelParser.T__5);
				}
				break;
			case 8:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 399;
				this.match(KestrelParser.T__13);
				this.state = 400;
				this.expr(0);
				this.state = 401;
				this.match(KestrelParser.T__4);
				this.state = 402;
				this.expr(0);
				this.state = 407;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 403;
					this.match(KestrelParser.T__4);
					this.state = 404;
					this.expr(0);
					}
					}
					this.state = 409;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 410;
				this.match(KestrelParser.T__14);
				}
				break;
			case 9:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 412;
				this.match(KestrelParser.T__13);
				this.state = 413;
				this.expr(0);
				this.state = 414;
				this.match(KestrelParser.T__14);
				}
				break;
			case 10:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 416;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 417;
				this.match(KestrelParser.T__42);
				this.state = 429;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || ((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & 258049) !== 0)) {
					{
					this.state = 418;
					this.matchPattern();
					this.state = 423;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 55, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 419;
							this.match(KestrelParser.T__4);
							this.state = 420;
							this.matchPattern();
							}
							}
						}
						this.state = 425;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 55, this._ctx);
					}
					this.state = 427;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 426;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 431;
				this.block();
				}
				break;
			case 12:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 432;
				this.match(KestrelParser.T__43);
				this.state = 433;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 434;
				(localctx as IfContext)._then = this.block();
				this.state = 435;
				this.match(KestrelParser.T__44);
				this.state = 436;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 13:
				{
				localctx = new MatchContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 438;
				this.match(KestrelParser.T__45);
				this.state = 439;
				(localctx as MatchContext)._matched = this.expr(0);
				this.state = 440;
				this.match(KestrelParser.T__3);
				this.state = 449;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || ((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & 258049) !== 0)) {
					{
					this.state = 441;
					this.matchClause();
					this.state = 446;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 442;
							this.match(KestrelParser.T__4);
							this.state = 443;
							this.matchClause();
							}
							}
						}
						this.state = 448;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
					}
					}
				}

				this.state = 452;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===5) {
					{
					this.state = 451;
					this.match(KestrelParser.T__4);
					}
				}

				this.state = 454;
				this.match(KestrelParser.T__5);
				}
				break;
			case 14:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 456;
				this.match(KestrelParser.T__46);
				this.state = 466;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 134234128) !== 0) || ((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & 4128795) !== 0)) {
					{
					this.state = 457;
					this.listElems();
					this.state = 461;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 61, this._ctx) ) {
					case 1:
						{
						this.state = 458;
						this.match(KestrelParser.T__4);
						this.state = 459;
						this.match(KestrelParser.T__27);
						this.state = 460;
						(localctx as ListLitContext)._tail = this.expr(0);
						}
						break;
					}
					this.state = 464;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 463;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 468;
				this.match(KestrelParser.T__47);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 517;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 70, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 515;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 69, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 471;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 472;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 1)) & ~0x1F) === 0 && ((1 << (_la - 1)) & 4026531841) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 473;
						this.expr(15);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 474;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 475;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 24)) & ~0x1F) === 0 && ((1 << (_la - 24)) & 7681) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 476;
						this.expr(14);
						}
						break;
					case 3:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 477;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 478;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===37 || _la===38)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 479;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 480;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 481;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 20)) & ~0x1F) === 0 && ((1 << (_la - 20)) & 1572867) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 482;
						this.expr(12);
						}
						break;
					case 5:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 483;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 484;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__40);
						this.state = 485;
						this.expr(11);
						}
						break;
					case 6:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 486;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 487;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__41);
						this.state = 488;
						this.expr(10);
						}
						break;
					case 7:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 489;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 490;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__48);
						this.state = 491;
						this.expr(2);
						}
						break;
					case 8:
						{
						localctx = new FieldAccessContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 492;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 493;
						this.match(KestrelParser.T__2);
						this.state = 496;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la===60) {
							{
							this.state = 494;
							(localctx as FieldAccessContext)._structName = this.match(KestrelParser.TYPE_ID);
							this.state = 495;
							this.match(KestrelParser.T__25);
							}
						}

						this.state = 498;
						this.match(KestrelParser.ID);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 499;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 500;
						this.match(KestrelParser.T__13);
						this.state = 512;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 134234128) !== 0) || ((((_la - 43)) & ~0x1F) === 0 && ((1 << (_la - 43)) & 4128795) !== 0)) {
							{
							this.state = 501;
							this.expr(0);
							this.state = 506;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 66, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 502;
									this.match(KestrelParser.T__4);
									this.state = 503;
									this.expr(0);
									}
									}
								}
								this.state = 508;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 66, this._ctx);
							}
							this.state = 510;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 509;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 514;
						this.match(KestrelParser.T__14);
						}
						break;
					}
					}
				}
				this.state = 519;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 70, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public listElems(): ListElemsContext {
		let localctx: ListElemsContext = new ListElemsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, KestrelParser.RULE_listElems);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 520;
			this.expr(0);
			this.state = 525;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 71, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 521;
					this.match(KestrelParser.T__4);
					this.state = 522;
					this.expr(0);
					}
					}
				}
				this.state = 527;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 71, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public matchClause(): MatchClauseContext {
		let localctx: MatchClauseContext = new MatchClauseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, KestrelParser.RULE_matchClause);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 528;
			this.matchPattern();
			this.state = 529;
			this.match(KestrelParser.T__49);
			this.state = 530;
			this.expr(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public blockStatement(): BlockStatementContext {
		let localctx: BlockStatementContext = new BlockStatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 54, KestrelParser.RULE_blockStatement);
		try {
			this.state = 545;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 51:
				localctx = new BlockLetHashContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 532;
				this.match(KestrelParser.T__50);
				this.state = 533;
				(localctx as BlockLetHashContext)._mapper = this.qualifiedId();
				this.state = 534;
				(localctx as BlockLetHashContext)._pattern = this.matchPattern();
				this.state = 535;
				this.match(KestrelParser.T__11);
				this.state = 536;
				(localctx as BlockLetHashContext)._value = this.expr(0);
				this.state = 537;
				this.match(KestrelParser.T__51);
				}
				break;
			case 11:
				localctx = new BlockLetContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 539;
				this.match(KestrelParser.T__10);
				this.state = 540;
				(localctx as BlockLetContext)._pattern = this.matchPattern();
				this.state = 541;
				this.match(KestrelParser.T__11);
				this.state = 542;
				(localctx as BlockLetContext)._value = this.expr(0);
				this.state = 543;
				this.match(KestrelParser.T__51);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, KestrelParser.RULE_block);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 547;
			this.match(KestrelParser.T__3);
			this.state = 551;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===11 || _la===51) {
				{
				{
				this.state = 548;
				this.blockStatement();
				}
				}
				this.state = 553;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 554;
			this.expr(0);
			this.state = 555;
			this.match(KestrelParser.T__5);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public matchPattern(): MatchPatternContext {
		let localctx: MatchPatternContext = new MatchPatternContext(this, this._ctx, this.state);
		this.enterRule(localctx, 58, KestrelParser.RULE_matchPattern);
		let _la: number;
		try {
			this.state = 607;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 59:
				localctx = new MatchIdentContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 557;
				this.match(KestrelParser.ID);
				}
				break;
			case 60:
				localctx = new ConstructorContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 561;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 74, this._ctx) ) {
				case 1:
					{
					this.state = 558;
					this.moduleNamespace();
					this.state = 559;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 563;
				(localctx as ConstructorContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 575;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 564;
					this.match(KestrelParser.T__13);
					this.state = 565;
					this.matchPattern();
					this.state = 570;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 566;
						this.match(KestrelParser.T__4);
						this.state = 567;
						this.matchPattern();
						}
						}
						this.state = 572;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 573;
					this.match(KestrelParser.T__14);
					}
				}

				}
				break;
			case 61:
				localctx = new IntPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 577;
				this.match(KestrelParser.INT);
				}
				break;
			case 64:
				localctx = new FloatPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 578;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 62:
				localctx = new CharPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 579;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 63:
				localctx = new StringPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 580;
				this.match(KestrelParser.STRING);
				}
				break;
			case 47:
				localctx = new ListPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 581;
				this.match(KestrelParser.T__46);
				this.state = 591;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || ((((_la - 47)) & ~0x1F) === 0 && ((1 << (_la - 47)) & 258049) !== 0)) {
					{
					this.state = 582;
					this.listPatterns();
					this.state = 586;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 77, this._ctx) ) {
					case 1:
						{
						this.state = 583;
						this.match(KestrelParser.T__4);
						this.state = 584;
						this.match(KestrelParser.T__27);
						this.state = 585;
						(localctx as ListPatternContext)._tail = this.matchPattern();
						}
						break;
					}
					this.state = 589;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 588;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 593;
				this.match(KestrelParser.T__47);
				}
				break;
			case 14:
				localctx = new TuplePatternContext(this, localctx);
				this.enterOuterAlt(localctx, 8);
				{
				this.state = 594;
				this.match(KestrelParser.T__13);
				this.state = 595;
				this.matchPattern();
				this.state = 596;
				this.match(KestrelParser.T__4);
				this.state = 597;
				this.matchPattern();
				this.state = 602;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 598;
					this.match(KestrelParser.T__4);
					this.state = 599;
					this.matchPattern();
					}
					}
					this.state = 604;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 605;
				this.match(KestrelParser.T__14);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public listPatterns(): ListPatternsContext {
		let localctx: ListPatternsContext = new ListPatternsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 60, KestrelParser.RULE_listPatterns);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 609;
			this.matchPattern();
			this.state = 614;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 82, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 610;
					this.match(KestrelParser.T__4);
					this.state = 611;
					this.matchPattern();
					}
					}
				}
				this.state = 616;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 82, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 24:
			return this.expr_sempred(localctx as ExprContext, predIndex);
		}
		return true;
	}
	private expr_sempred(localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 14);
		case 1:
			return this.precpred(this._ctx, 13);
		case 2:
			return this.precpred(this._ctx, 12);
		case 3:
			return this.precpred(this._ctx, 11);
		case 4:
			return this.precpred(this._ctx, 10);
		case 5:
			return this.precpred(this._ctx, 9);
		case 6:
			return this.precpred(this._ctx, 1);
		case 7:
			return this.precpred(this._ctx, 19);
		case 8:
			return this.precpred(this._ctx, 15);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,69,618,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,1,0,1,0,
	1,0,5,0,66,8,0,10,0,12,0,69,9,0,1,1,5,1,72,8,1,10,1,12,1,75,9,1,1,1,5,1,
	78,8,1,10,1,12,1,81,9,1,1,1,5,1,84,8,1,10,1,12,1,87,9,1,1,1,1,1,1,2,1,2,
	1,2,1,2,1,2,1,2,1,2,5,2,98,8,2,10,2,12,2,101,9,2,1,2,1,2,3,2,105,8,2,1,
	3,1,3,1,3,3,3,110,8,3,3,3,112,8,3,1,4,1,4,1,4,1,4,3,4,118,8,4,1,5,1,5,1,
	5,1,5,3,5,124,8,5,1,6,5,6,127,8,6,10,6,12,6,130,9,6,1,6,5,6,133,8,6,10,
	6,12,6,136,9,6,1,6,3,6,139,8,6,1,6,1,6,1,6,1,6,3,6,145,8,6,1,7,1,7,1,7,
	1,7,1,7,1,7,5,7,153,8,7,10,7,12,7,156,9,7,3,7,158,8,7,1,7,3,7,161,8,7,1,
	8,5,8,164,8,8,10,8,12,8,167,9,8,1,8,5,8,170,8,8,10,8,12,8,173,9,8,1,8,3,
	8,176,8,8,1,8,1,8,1,8,3,8,181,8,8,1,8,1,8,3,8,185,8,8,1,8,1,8,1,9,5,9,190,
	8,9,10,9,12,9,193,9,9,1,9,5,9,196,8,9,10,9,12,9,199,9,9,1,9,3,9,202,8,9,
	1,9,1,9,1,9,3,9,207,8,9,1,9,1,9,3,9,211,8,9,1,9,1,9,1,10,5,10,216,8,10,
	10,10,12,10,219,9,10,1,10,1,10,3,10,223,8,10,1,10,1,10,1,10,3,10,228,8,
	10,1,11,1,11,3,11,232,8,11,1,12,1,12,1,12,1,12,5,12,238,8,12,10,12,12,12,
	241,9,12,1,12,1,12,1,13,1,13,1,13,5,13,248,8,13,10,13,12,13,251,9,13,1,
	13,3,13,254,8,13,1,14,1,14,1,14,1,14,1,15,1,15,1,15,5,15,263,8,15,10,15,
	12,15,266,9,15,1,15,3,15,269,8,15,1,16,1,16,1,16,1,16,1,16,5,16,276,8,16,
	10,16,12,16,279,9,16,3,16,281,8,16,1,17,1,17,1,17,1,17,1,17,5,17,288,8,
	17,10,17,12,17,291,9,17,1,18,1,18,1,18,3,18,296,8,18,1,18,1,18,1,18,1,18,
	1,18,5,18,303,8,18,10,18,12,18,306,9,18,1,18,1,18,3,18,310,8,18,1,18,1,
	18,3,18,314,8,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,1,18,5,18,
	326,8,18,10,18,12,18,329,9,18,1,18,1,18,3,18,333,8,18,1,19,1,19,1,19,5,
	19,338,8,19,10,19,12,19,341,9,19,1,19,3,19,344,8,19,1,20,1,20,1,20,1,20,
	1,20,5,20,351,8,20,10,20,12,20,354,9,20,1,20,1,20,3,20,358,8,20,1,21,1,
	21,1,21,3,21,363,8,21,1,21,1,21,1,22,1,22,1,22,1,22,1,23,1,23,1,23,5,23,
	374,8,23,10,23,12,23,377,9,23,1,23,3,23,380,8,23,1,24,1,24,1,24,1,24,1,
	24,1,24,1,24,1,24,1,24,1,24,1,24,3,24,393,8,24,1,24,1,24,3,24,397,8,24,
	1,24,1,24,1,24,1,24,1,24,1,24,1,24,5,24,406,8,24,10,24,12,24,409,9,24,1,
	24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,5,24,422,8,24,10,24,
	12,24,425,9,24,1,24,3,24,428,8,24,3,24,430,8,24,1,24,1,24,1,24,1,24,1,24,
	1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,5,24,445,8,24,10,24,12,24,448,9,
	24,3,24,450,8,24,1,24,3,24,453,8,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,
	3,24,462,8,24,1,24,3,24,465,8,24,3,24,467,8,24,1,24,3,24,470,8,24,1,24,
	1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,
	24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,1,24,3,24,497,8,24,1,24,1,24,
	1,24,1,24,1,24,1,24,5,24,505,8,24,10,24,12,24,508,9,24,1,24,3,24,511,8,
	24,3,24,513,8,24,1,24,5,24,516,8,24,10,24,12,24,519,9,24,1,25,1,25,1,25,
	5,25,524,8,25,10,25,12,25,527,9,25,1,26,1,26,1,26,1,26,1,27,1,27,1,27,1,
	27,1,27,1,27,1,27,1,27,1,27,1,27,1,27,1,27,1,27,3,27,546,8,27,1,28,1,28,
	5,28,550,8,28,10,28,12,28,553,9,28,1,28,1,28,1,28,1,29,1,29,1,29,1,29,3,
	29,562,8,29,1,29,1,29,1,29,1,29,1,29,5,29,569,8,29,10,29,12,29,572,9,29,
	1,29,1,29,3,29,576,8,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,1,29,3,
	29,587,8,29,1,29,3,29,590,8,29,3,29,592,8,29,1,29,1,29,1,29,1,29,1,29,1,
	29,1,29,5,29,601,8,29,10,29,12,29,604,9,29,1,29,1,29,3,29,608,8,29,1,30,
	1,30,1,30,5,30,613,8,30,10,30,12,30,616,9,30,1,30,0,1,48,31,0,2,4,6,8,10,
	12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,
	60,0,6,1,0,58,59,1,0,59,60,2,0,1,1,29,32,2,0,24,24,33,36,1,0,37,38,2,0,
	20,21,39,40,699,0,62,1,0,0,0,2,73,1,0,0,0,4,90,1,0,0,0,6,111,1,0,0,0,8,
	117,1,0,0,0,10,123,1,0,0,0,12,128,1,0,0,0,14,160,1,0,0,0,16,165,1,0,0,0,
	18,191,1,0,0,0,20,217,1,0,0,0,22,229,1,0,0,0,24,233,1,0,0,0,26,244,1,0,
	0,0,28,255,1,0,0,0,30,259,1,0,0,0,32,270,1,0,0,0,34,282,1,0,0,0,36,332,
	1,0,0,0,38,334,1,0,0,0,40,345,1,0,0,0,42,362,1,0,0,0,44,366,1,0,0,0,46,
	370,1,0,0,0,48,469,1,0,0,0,50,520,1,0,0,0,52,528,1,0,0,0,54,545,1,0,0,0,
	56,547,1,0,0,0,58,607,1,0,0,0,60,609,1,0,0,0,62,67,5,60,0,0,63,64,5,1,0,
	0,64,66,5,60,0,0,65,63,1,0,0,0,66,69,1,0,0,0,67,65,1,0,0,0,67,68,1,0,0,
	0,68,1,1,0,0,0,69,67,1,0,0,0,70,72,5,67,0,0,71,70,1,0,0,0,72,75,1,0,0,0,
	73,71,1,0,0,0,73,74,1,0,0,0,74,79,1,0,0,0,75,73,1,0,0,0,76,78,3,4,2,0,77,
	76,1,0,0,0,78,81,1,0,0,0,79,77,1,0,0,0,79,80,1,0,0,0,80,85,1,0,0,0,81,79,
	1,0,0,0,82,84,3,8,4,0,83,82,1,0,0,0,84,87,1,0,0,0,85,83,1,0,0,0,85,86,1,
	0,0,0,86,88,1,0,0,0,87,85,1,0,0,0,88,89,5,0,0,1,89,3,1,0,0,0,90,91,5,2,
	0,0,91,104,3,0,0,0,92,93,5,3,0,0,93,94,5,4,0,0,94,99,3,6,3,0,95,96,5,5,
	0,0,96,98,3,6,3,0,97,95,1,0,0,0,98,101,1,0,0,0,99,97,1,0,0,0,99,100,1,0,
	0,0,100,102,1,0,0,0,101,99,1,0,0,0,102,103,5,6,0,0,103,105,1,0,0,0,104,
	92,1,0,0,0,104,105,1,0,0,0,105,5,1,0,0,0,106,112,7,0,0,0,107,109,5,60,0,
	0,108,110,5,57,0,0,109,108,1,0,0,0,109,110,1,0,0,0,110,112,1,0,0,0,111,
	106,1,0,0,0,111,107,1,0,0,0,112,7,1,0,0,0,113,118,3,12,6,0,114,118,3,16,
	8,0,115,118,3,18,9,0,116,118,3,20,10,0,117,113,1,0,0,0,117,114,1,0,0,0,
	117,115,1,0,0,0,117,116,1,0,0,0,118,9,1,0,0,0,119,120,5,7,0,0,120,124,3,
	32,16,0,121,124,5,8,0,0,122,124,5,9,0,0,123,119,1,0,0,0,123,121,1,0,0,0,
	123,122,1,0,0,0,124,11,1,0,0,0,125,127,5,68,0,0,126,125,1,0,0,0,127,130,
	1,0,0,0,128,126,1,0,0,0,128,129,1,0,0,0,129,134,1,0,0,0,130,128,1,0,0,0,
	131,133,3,10,5,0,132,131,1,0,0,0,133,136,1,0,0,0,134,132,1,0,0,0,134,135,
	1,0,0,0,135,138,1,0,0,0,136,134,1,0,0,0,137,139,5,10,0,0,138,137,1,0,0,
	0,138,139,1,0,0,0,139,140,1,0,0,0,140,141,5,11,0,0,141,144,7,0,0,0,142,
	143,5,12,0,0,143,145,3,48,24,0,144,142,1,0,0,0,144,145,1,0,0,0,145,13,1,
	0,0,0,146,161,5,9,0,0,147,148,5,13,0,0,148,157,5,14,0,0,149,154,5,60,0,
	0,150,151,5,5,0,0,151,153,5,60,0,0,152,150,1,0,0,0,153,156,1,0,0,0,154,
	152,1,0,0,0,154,155,1,0,0,0,155,158,1,0,0,0,156,154,1,0,0,0,157,149,1,0,
	0,0,157,158,1,0,0,0,158,159,1,0,0,0,159,161,5,15,0,0,160,146,1,0,0,0,160,
	147,1,0,0,0,161,15,1,0,0,0,162,164,5,68,0,0,163,162,1,0,0,0,164,167,1,0,
	0,0,165,163,1,0,0,0,165,166,1,0,0,0,166,171,1,0,0,0,167,165,1,0,0,0,168,
	170,3,14,7,0,169,168,1,0,0,0,170,173,1,0,0,0,171,169,1,0,0,0,171,172,1,
	0,0,0,172,175,1,0,0,0,173,171,1,0,0,0,174,176,3,22,11,0,175,174,1,0,0,0,
	175,176,1,0,0,0,176,177,1,0,0,0,177,178,5,16,0,0,178,180,5,60,0,0,179,181,
	3,24,12,0,180,179,1,0,0,0,180,181,1,0,0,0,181,182,1,0,0,0,182,184,5,4,0,
	0,183,185,3,26,13,0,184,183,1,0,0,0,184,185,1,0,0,0,185,186,1,0,0,0,186,
	187,5,6,0,0,187,17,1,0,0,0,188,190,5,68,0,0,189,188,1,0,0,0,190,193,1,0,
	0,0,191,189,1,0,0,0,191,192,1,0,0,0,192,197,1,0,0,0,193,191,1,0,0,0,194,
	196,3,14,7,0,195,194,1,0,0,0,196,199,1,0,0,0,197,195,1,0,0,0,197,198,1,
	0,0,0,198,201,1,0,0,0,199,197,1,0,0,0,200,202,3,22,11,0,201,200,1,0,0,0,
	201,202,1,0,0,0,202,203,1,0,0,0,203,204,5,17,0,0,204,206,5,60,0,0,205,207,
	3,24,12,0,206,205,1,0,0,0,206,207,1,0,0,0,207,208,1,0,0,0,208,210,5,4,0,
	0,209,211,3,30,15,0,210,209,1,0,0,0,210,211,1,0,0,0,211,212,1,0,0,0,212,
	213,5,6,0,0,213,19,1,0,0,0,214,216,5,68,0,0,215,214,1,0,0,0,216,219,1,0,
	0,0,217,215,1,0,0,0,217,218,1,0,0,0,218,220,1,0,0,0,219,217,1,0,0,0,220,
	222,5,18,0,0,221,223,5,10,0,0,222,221,1,0,0,0,222,223,1,0,0,0,223,224,1,
	0,0,0,224,225,5,19,0,0,225,227,5,60,0,0,226,228,3,24,12,0,227,226,1,0,0,
	0,227,228,1,0,0,0,228,21,1,0,0,0,229,231,5,10,0,0,230,232,5,57,0,0,231,
	230,1,0,0,0,231,232,1,0,0,0,232,23,1,0,0,0,233,234,5,20,0,0,234,239,5,59,
	0,0,235,236,5,5,0,0,236,238,5,59,0,0,237,235,1,0,0,0,238,241,1,0,0,0,239,
	237,1,0,0,0,239,240,1,0,0,0,240,242,1,0,0,0,241,239,1,0,0,0,242,243,5,21,
	0,0,243,25,1,0,0,0,244,249,3,40,20,0,245,246,5,5,0,0,246,248,3,40,20,0,
	247,245,1,0,0,0,248,251,1,0,0,0,249,247,1,0,0,0,249,250,1,0,0,0,250,253,
	1,0,0,0,251,249,1,0,0,0,252,254,5,5,0,0,253,252,1,0,0,0,253,254,1,0,0,0,
	254,27,1,0,0,0,255,256,5,59,0,0,256,257,5,22,0,0,257,258,3,36,18,0,258,
	29,1,0,0,0,259,264,3,28,14,0,260,261,5,5,0,0,261,263,3,28,14,0,262,260,
	1,0,0,0,263,266,1,0,0,0,264,262,1,0,0,0,264,265,1,0,0,0,265,268,1,0,0,0,
	266,264,1,0,0,0,267,269,5,5,0,0,268,267,1,0,0,0,268,269,1,0,0,0,269,31,
	1,0,0,0,270,280,3,36,18,0,271,272,5,23,0,0,272,277,3,34,17,0,273,274,5,
	5,0,0,274,276,3,34,17,0,275,273,1,0,0,0,276,279,1,0,0,0,277,275,1,0,0,0,
	277,278,1,0,0,0,278,281,1,0,0,0,279,277,1,0,0,0,280,271,1,0,0,0,280,281,
	1,0,0,0,281,33,1,0,0,0,282,283,5,59,0,0,283,284,5,22,0,0,284,289,5,60,0,
	0,285,286,5,24,0,0,286,288,5,60,0,0,287,285,1,0,0,0,288,291,1,0,0,0,289,
	287,1,0,0,0,289,290,1,0,0,0,290,35,1,0,0,0,291,289,1,0,0,0,292,293,3,0,
	0,0,293,294,5,3,0,0,294,296,1,0,0,0,295,292,1,0,0,0,295,296,1,0,0,0,296,
	297,1,0,0,0,297,309,5,60,0,0,298,299,5,20,0,0,299,304,3,36,18,0,300,301,
	5,5,0,0,301,303,3,36,18,0,302,300,1,0,0,0,303,306,1,0,0,0,304,302,1,0,0,
	0,304,305,1,0,0,0,305,307,1,0,0,0,306,304,1,0,0,0,307,308,5,21,0,0,308,
	310,1,0,0,0,309,298,1,0,0,0,309,310,1,0,0,0,310,333,1,0,0,0,311,313,5,14,
	0,0,312,314,3,38,19,0,313,312,1,0,0,0,313,314,1,0,0,0,314,315,1,0,0,0,315,
	316,5,15,0,0,316,317,5,25,0,0,317,333,3,36,18,0,318,333,5,59,0,0,319,320,
	5,14,0,0,320,321,3,36,18,0,321,322,5,5,0,0,322,327,3,36,18,0,323,324,5,
	5,0,0,324,326,3,36,18,0,325,323,1,0,0,0,326,329,1,0,0,0,327,325,1,0,0,0,
	327,328,1,0,0,0,328,330,1,0,0,0,329,327,1,0,0,0,330,331,5,15,0,0,331,333,
	1,0,0,0,332,295,1,0,0,0,332,311,1,0,0,0,332,318,1,0,0,0,332,319,1,0,0,0,
	333,37,1,0,0,0,334,339,3,36,18,0,335,336,5,5,0,0,336,338,3,36,18,0,337,
	335,1,0,0,0,338,341,1,0,0,0,339,337,1,0,0,0,339,340,1,0,0,0,340,343,1,0,
	0,0,341,339,1,0,0,0,342,344,5,5,0,0,343,342,1,0,0,0,343,344,1,0,0,0,344,
	39,1,0,0,0,345,357,5,60,0,0,346,347,5,14,0,0,347,352,3,36,18,0,348,349,
	5,5,0,0,349,351,3,36,18,0,350,348,1,0,0,0,351,354,1,0,0,0,352,350,1,0,0,
	0,352,353,1,0,0,0,353,355,1,0,0,0,354,352,1,0,0,0,355,356,5,15,0,0,356,
	358,1,0,0,0,357,346,1,0,0,0,357,358,1,0,0,0,358,41,1,0,0,0,359,360,3,0,
	0,0,360,361,5,3,0,0,361,363,1,0,0,0,362,359,1,0,0,0,362,363,1,0,0,0,363,
	364,1,0,0,0,364,365,7,1,0,0,365,43,1,0,0,0,366,367,5,59,0,0,367,368,5,22,
	0,0,368,369,3,48,24,0,369,45,1,0,0,0,370,375,3,44,22,0,371,372,5,5,0,0,
	372,374,3,44,22,0,373,371,1,0,0,0,374,377,1,0,0,0,375,373,1,0,0,0,375,376,
	1,0,0,0,376,379,1,0,0,0,377,375,1,0,0,0,378,380,5,5,0,0,379,378,1,0,0,0,
	379,380,1,0,0,0,380,47,1,0,0,0,381,382,6,24,-1,0,382,470,5,61,0,0,383,470,
	5,64,0,0,384,470,5,62,0,0,385,470,5,63,0,0,386,470,3,42,21,0,387,388,5,
	27,0,0,388,470,3,48,24,17,389,390,5,60,0,0,390,392,5,4,0,0,391,393,3,46,
	23,0,392,391,1,0,0,0,392,393,1,0,0,0,393,396,1,0,0,0,394,395,5,28,0,0,395,
	397,3,48,24,0,396,394,1,0,0,0,396,397,1,0,0,0,397,398,1,0,0,0,398,470,5,
	6,0,0,399,400,5,14,0,0,400,401,3,48,24,0,401,402,5,5,0,0,402,407,3,48,24,
	0,403,404,5,5,0,0,404,406,3,48,24,0,405,403,1,0,0,0,406,409,1,0,0,0,407,
	405,1,0,0,0,407,408,1,0,0,0,408,410,1,0,0,0,409,407,1,0,0,0,410,411,5,15,
	0,0,411,470,1,0,0,0,412,413,5,14,0,0,413,414,3,48,24,0,414,415,5,15,0,0,
	415,470,1,0,0,0,416,470,3,56,28,0,417,429,5,43,0,0,418,423,3,58,29,0,419,
	420,5,5,0,0,420,422,3,58,29,0,421,419,1,0,0,0,422,425,1,0,0,0,423,421,1,
	0,0,0,423,424,1,0,0,0,424,427,1,0,0,0,425,423,1,0,0,0,426,428,5,5,0,0,427,
	426,1,0,0,0,427,428,1,0,0,0,428,430,1,0,0,0,429,418,1,0,0,0,429,430,1,0,
	0,0,430,431,1,0,0,0,431,470,3,56,28,0,432,433,5,44,0,0,433,434,3,48,24,
	0,434,435,3,56,28,0,435,436,5,45,0,0,436,437,3,56,28,0,437,470,1,0,0,0,
	438,439,5,46,0,0,439,440,3,48,24,0,440,449,5,4,0,0,441,446,3,52,26,0,442,
	443,5,5,0,0,443,445,3,52,26,0,444,442,1,0,0,0,445,448,1,0,0,0,446,444,1,
	0,0,0,446,447,1,0,0,0,447,450,1,0,0,0,448,446,1,0,0,0,449,441,1,0,0,0,449,
	450,1,0,0,0,450,452,1,0,0,0,451,453,5,5,0,0,452,451,1,0,0,0,452,453,1,0,
	0,0,453,454,1,0,0,0,454,455,5,6,0,0,455,470,1,0,0,0,456,466,5,47,0,0,457,
	461,3,50,25,0,458,459,5,5,0,0,459,460,5,28,0,0,460,462,3,48,24,0,461,458,
	1,0,0,0,461,462,1,0,0,0,462,464,1,0,0,0,463,465,5,5,0,0,464,463,1,0,0,0,
	464,465,1,0,0,0,465,467,1,0,0,0,466,457,1,0,0,0,466,467,1,0,0,0,467,468,
	1,0,0,0,468,470,5,48,0,0,469,381,1,0,0,0,469,383,1,0,0,0,469,384,1,0,0,
	0,469,385,1,0,0,0,469,386,1,0,0,0,469,387,1,0,0,0,469,389,1,0,0,0,469,399,
	1,0,0,0,469,412,1,0,0,0,469,416,1,0,0,0,469,417,1,0,0,0,469,432,1,0,0,0,
	469,438,1,0,0,0,469,456,1,0,0,0,470,517,1,0,0,0,471,472,10,14,0,0,472,473,
	7,2,0,0,473,516,3,48,24,15,474,475,10,13,0,0,475,476,7,3,0,0,476,516,3,
	48,24,14,477,478,10,12,0,0,478,479,7,4,0,0,479,516,3,48,24,13,480,481,10,
	11,0,0,481,482,7,5,0,0,482,516,3,48,24,12,483,484,10,10,0,0,484,485,5,41,
	0,0,485,516,3,48,24,11,486,487,10,9,0,0,487,488,5,42,0,0,488,516,3,48,24,
	10,489,490,10,1,0,0,490,491,5,49,0,0,491,516,3,48,24,2,492,493,10,19,0,
	0,493,496,5,3,0,0,494,495,5,60,0,0,495,497,5,26,0,0,496,494,1,0,0,0,496,
	497,1,0,0,0,497,498,1,0,0,0,498,516,5,59,0,0,499,500,10,15,0,0,500,512,
	5,14,0,0,501,506,3,48,24,0,502,503,5,5,0,0,503,505,3,48,24,0,504,502,1,
	0,0,0,505,508,1,0,0,0,506,504,1,0,0,0,506,507,1,0,0,0,507,510,1,0,0,0,508,
	506,1,0,0,0,509,511,5,5,0,0,510,509,1,0,0,0,510,511,1,0,0,0,511,513,1,0,
	0,0,512,501,1,0,0,0,512,513,1,0,0,0,513,514,1,0,0,0,514,516,5,15,0,0,515,
	471,1,0,0,0,515,474,1,0,0,0,515,477,1,0,0,0,515,480,1,0,0,0,515,483,1,0,
	0,0,515,486,1,0,0,0,515,489,1,0,0,0,515,492,1,0,0,0,515,499,1,0,0,0,516,
	519,1,0,0,0,517,515,1,0,0,0,517,518,1,0,0,0,518,49,1,0,0,0,519,517,1,0,
	0,0,520,525,3,48,24,0,521,522,5,5,0,0,522,524,3,48,24,0,523,521,1,0,0,0,
	524,527,1,0,0,0,525,523,1,0,0,0,525,526,1,0,0,0,526,51,1,0,0,0,527,525,
	1,0,0,0,528,529,3,58,29,0,529,530,5,50,0,0,530,531,3,48,24,0,531,53,1,0,
	0,0,532,533,5,51,0,0,533,534,3,42,21,0,534,535,3,58,29,0,535,536,5,12,0,
	0,536,537,3,48,24,0,537,538,5,52,0,0,538,546,1,0,0,0,539,540,5,11,0,0,540,
	541,3,58,29,0,541,542,5,12,0,0,542,543,3,48,24,0,543,544,5,52,0,0,544,546,
	1,0,0,0,545,532,1,0,0,0,545,539,1,0,0,0,546,55,1,0,0,0,547,551,5,4,0,0,
	548,550,3,54,27,0,549,548,1,0,0,0,550,553,1,0,0,0,551,549,1,0,0,0,551,552,
	1,0,0,0,552,554,1,0,0,0,553,551,1,0,0,0,554,555,3,48,24,0,555,556,5,6,0,
	0,556,57,1,0,0,0,557,608,5,59,0,0,558,559,3,0,0,0,559,560,5,3,0,0,560,562,
	1,0,0,0,561,558,1,0,0,0,561,562,1,0,0,0,562,563,1,0,0,0,563,575,5,60,0,
	0,564,565,5,14,0,0,565,570,3,58,29,0,566,567,5,5,0,0,567,569,3,58,29,0,
	568,566,1,0,0,0,569,572,1,0,0,0,570,568,1,0,0,0,570,571,1,0,0,0,571,573,
	1,0,0,0,572,570,1,0,0,0,573,574,5,15,0,0,574,576,1,0,0,0,575,564,1,0,0,
	0,575,576,1,0,0,0,576,608,1,0,0,0,577,608,5,61,0,0,578,608,5,64,0,0,579,
	608,5,62,0,0,580,608,5,63,0,0,581,591,5,47,0,0,582,586,3,60,30,0,583,584,
	5,5,0,0,584,585,5,28,0,0,585,587,3,58,29,0,586,583,1,0,0,0,586,587,1,0,
	0,0,587,589,1,0,0,0,588,590,5,5,0,0,589,588,1,0,0,0,589,590,1,0,0,0,590,
	592,1,0,0,0,591,582,1,0,0,0,591,592,1,0,0,0,592,593,1,0,0,0,593,608,5,48,
	0,0,594,595,5,14,0,0,595,596,3,58,29,0,596,597,5,5,0,0,597,602,3,58,29,
	0,598,599,5,5,0,0,599,601,3,58,29,0,600,598,1,0,0,0,601,604,1,0,0,0,602,
	600,1,0,0,0,602,603,1,0,0,0,603,605,1,0,0,0,604,602,1,0,0,0,605,606,5,15,
	0,0,606,608,1,0,0,0,607,557,1,0,0,0,607,561,1,0,0,0,607,577,1,0,0,0,607,
	578,1,0,0,0,607,579,1,0,0,0,607,580,1,0,0,0,607,581,1,0,0,0,607,594,1,0,
	0,0,608,59,1,0,0,0,609,614,3,58,29,0,610,611,5,5,0,0,611,613,3,58,29,0,
	612,610,1,0,0,0,613,616,1,0,0,0,614,612,1,0,0,0,614,615,1,0,0,0,615,61,
	1,0,0,0,616,614,1,0,0,0,83,67,73,79,85,99,104,109,111,117,123,128,134,138,
	144,154,157,160,165,171,175,180,184,191,197,201,206,210,217,222,227,231,
	239,249,253,264,268,277,280,289,295,304,309,313,327,332,339,343,352,357,
	362,375,379,392,396,407,423,427,429,446,449,452,461,464,466,469,496,506,
	510,512,515,517,525,545,551,561,570,575,586,589,591,602,607,614];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!KestrelParser.__ATN) {
			KestrelParser.__ATN = new ATNDeserializer().deserialize(KestrelParser._serializedATN);
		}

		return KestrelParser.__ATN;
	}


	static DecisionsToDFA = KestrelParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class ModuleNamespaceContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.TYPE_ID);
	}
	public TYPE_ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_moduleNamespace;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterModuleNamespace) {
	 		listener.enterModuleNamespace(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitModuleNamespace) {
	 		listener.exitModuleNamespace(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitModuleNamespace) {
			return visitor.visitModuleNamespace(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ProgramContext extends ParserRuleContext {
	public _doc!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(KestrelParser.EOF, 0);
	}
	public import__list(): Import_Context[] {
		return this.getTypedRuleContexts(Import_Context) as Import_Context[];
	}
	public import_(i: number): Import_Context {
		return this.getTypedRuleContext(Import_Context, i) as Import_Context;
	}
	public declaration_list(): DeclarationContext[] {
		return this.getTypedRuleContexts(DeclarationContext) as DeclarationContext[];
	}
	public declaration(i: number): DeclarationContext {
		return this.getTypedRuleContext(DeclarationContext, i) as DeclarationContext;
	}
	public MODULEDOC_COMMENT_LINE_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.MODULEDOC_COMMENT_LINE);
	}
	public MODULEDOC_COMMENT_LINE(i: number): TerminalNode {
		return this.getToken(KestrelParser.MODULEDOC_COMMENT_LINE, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_program;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterProgram) {
	 		listener.enterProgram(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitProgram) {
	 		listener.exitProgram(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitProgram) {
			return visitor.visitProgram(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_Context extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public importExposing_list(): ImportExposingContext[] {
		return this.getTypedRuleContexts(ImportExposingContext) as ImportExposingContext[];
	}
	public importExposing(i: number): ImportExposingContext {
		return this.getTypedRuleContext(ImportExposingContext, i) as ImportExposingContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_import_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterImport_) {
	 		listener.enterImport_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitImport_) {
	 		listener.exitImport_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitImport_) {
			return visitor.visitImport_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ImportExposingContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_importExposing;
	}
	public override copyFrom(ctx: ImportExposingContext): void {
		super.copyFrom(ctx);
	}
}
export class ValueExposingContext extends ImportExposingContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: ImportExposingContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public INFIX_ID(): TerminalNode {
		return this.getToken(KestrelParser.INFIX_ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterValueExposing) {
	 		listener.enterValueExposing(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitValueExposing) {
	 		listener.exitValueExposing(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitValueExposing) {
			return visitor.visitValueExposing(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeExposingContext extends ImportExposingContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: ImportExposingContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public EXPOSING_NESTED(): TerminalNode {
		return this.getToken(KestrelParser.EXPOSING_NESTED, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeExposing) {
	 		listener.enterTypeExposing(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeExposing) {
	 		listener.exitTypeExposing(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeExposing) {
			return visitor.visitTypeExposing(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_declaration;
	}
	public override copyFrom(ctx: DeclarationContext): void {
		super.copyFrom(ctx);
	}
}
export class StructDeclarationContext extends DeclarationContext {
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public structDeclaration_(): StructDeclaration_Context {
		return this.getTypedRuleContext(StructDeclaration_Context, 0) as StructDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStructDeclaration) {
	 		listener.enterStructDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStructDeclaration) {
	 		listener.exitStructDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStructDeclaration) {
			return visitor.visitStructDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExternTypeDeclarationContext extends DeclarationContext {
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public externTypeDeclaration_(): ExternTypeDeclaration_Context {
		return this.getTypedRuleContext(ExternTypeDeclaration_Context, 0) as ExternTypeDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExternTypeDeclaration) {
	 		listener.enterExternTypeDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExternTypeDeclaration) {
	 		listener.exitExternTypeDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExternTypeDeclaration) {
			return visitor.visitExternTypeDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeDeclarationContext extends DeclarationContext {
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public typeDeclaration_(): TypeDeclaration_Context {
		return this.getTypedRuleContext(TypeDeclaration_Context, 0) as TypeDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeDeclaration) {
	 		listener.enterTypeDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeDeclaration) {
	 		listener.exitTypeDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeDeclaration) {
			return visitor.visitTypeDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class LetDeclarationContext extends DeclarationContext {
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public letDeclaration_(): LetDeclaration_Context {
		return this.getTypedRuleContext(LetDeclaration_Context, 0) as LetDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterLetDeclaration) {
	 		listener.enterLetDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitLetDeclaration) {
	 		listener.exitLetDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitLetDeclaration) {
			return visitor.visitLetDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValueAttributeContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_valueAttribute;
	}
	public override copyFrom(ctx: ValueAttributeContext): void {
		super.copyFrom(ctx);
	}
}
export class AttrExternContext extends ValueAttributeContext {
	constructor(parser: KestrelParser, ctx: ValueAttributeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterAttrExtern) {
	 		listener.enterAttrExtern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitAttrExtern) {
	 		listener.exitAttrExtern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitAttrExtern) {
			return visitor.visitAttrExtern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AttrInlineContext extends ValueAttributeContext {
	constructor(parser: KestrelParser, ctx: ValueAttributeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterAttrInline) {
	 		listener.enterAttrInline(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitAttrInline) {
	 		listener.exitAttrInline(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitAttrInline) {
			return visitor.visitAttrInline(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AttrTypeContext extends ValueAttributeContext {
	constructor(parser: KestrelParser, ctx: ValueAttributeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public polyType(): PolyTypeContext {
		return this.getTypedRuleContext(PolyTypeContext, 0) as PolyTypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterAttrType) {
	 		listener.enterAttrType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitAttrType) {
	 		listener.exitAttrType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitAttrType) {
			return visitor.visitAttrType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LetDeclaration_Context extends ParserRuleContext {
	public _doc!: Token;
	public _pub!: Token;
	public _binding!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public INFIX_ID(): TerminalNode {
		return this.getToken(KestrelParser.INFIX_ID, 0);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public valueAttribute_list(): ValueAttributeContext[] {
		return this.getTypedRuleContexts(ValueAttributeContext) as ValueAttributeContext[];
	}
	public valueAttribute(i: number): ValueAttributeContext {
		return this.getTypedRuleContext(ValueAttributeContext, i) as ValueAttributeContext;
	}
	public DOC_COMMENT_LINE_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.DOC_COMMENT_LINE);
	}
	public DOC_COMMENT_LINE(i: number): TerminalNode {
		return this.getToken(KestrelParser.DOC_COMMENT_LINE, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_letDeclaration_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterLetDeclaration_) {
	 		listener.enterLetDeclaration_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitLetDeclaration_) {
	 		listener.exitLetDeclaration_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitLetDeclaration_) {
			return visitor.visitLetDeclaration_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeAttributeContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_typeAttribute;
	}
	public override copyFrom(ctx: TypeAttributeContext): void {
		super.copyFrom(ctx);
	}
}
export class TypeAttDerivingContext extends TypeAttributeContext {
	constructor(parser: KestrelParser, ctx: TypeAttributeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.TYPE_ID);
	}
	public TYPE_ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, i);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeAttDeriving) {
	 		listener.enterTypeAttDeriving(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeAttDeriving) {
	 		listener.exitTypeAttDeriving(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeAttDeriving) {
			return visitor.visitTypeAttDeriving(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TypeAttrExternContext extends TypeAttributeContext {
	constructor(parser: KestrelParser, ctx: TypeAttributeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeAttrExtern) {
	 		listener.enterTypeAttrExtern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeAttrExtern) {
	 		listener.exitTypeAttrExtern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeAttrExtern) {
			return visitor.visitTypeAttrExtern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeDeclaration_Context extends ParserRuleContext {
	public _doc!: Token;
	public _pub!: PubExposingContext;
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public typeAttribute_list(): TypeAttributeContext[] {
		return this.getTypedRuleContexts(TypeAttributeContext) as TypeAttributeContext[];
	}
	public typeAttribute(i: number): TypeAttributeContext {
		return this.getTypedRuleContext(TypeAttributeContext, i) as TypeAttributeContext;
	}
	public paramsList(): ParamsListContext {
		return this.getTypedRuleContext(ParamsListContext, 0) as ParamsListContext;
	}
	public typeVariants(): TypeVariantsContext {
		return this.getTypedRuleContext(TypeVariantsContext, 0) as TypeVariantsContext;
	}
	public pubExposing(): PubExposingContext {
		return this.getTypedRuleContext(PubExposingContext, 0) as PubExposingContext;
	}
	public DOC_COMMENT_LINE_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.DOC_COMMENT_LINE);
	}
	public DOC_COMMENT_LINE(i: number): TerminalNode {
		return this.getToken(KestrelParser.DOC_COMMENT_LINE, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_typeDeclaration_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeDeclaration_) {
	 		listener.enterTypeDeclaration_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeDeclaration_) {
	 		listener.exitTypeDeclaration_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeDeclaration_) {
			return visitor.visitTypeDeclaration_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructDeclaration_Context extends ParserRuleContext {
	public _doc!: Token;
	public _pub!: PubExposingContext;
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public typeAttribute_list(): TypeAttributeContext[] {
		return this.getTypedRuleContexts(TypeAttributeContext) as TypeAttributeContext[];
	}
	public typeAttribute(i: number): TypeAttributeContext {
		return this.getTypedRuleContext(TypeAttributeContext, i) as TypeAttributeContext;
	}
	public paramsList(): ParamsListContext {
		return this.getTypedRuleContext(ParamsListContext, 0) as ParamsListContext;
	}
	public declarationFields(): DeclarationFieldsContext {
		return this.getTypedRuleContext(DeclarationFieldsContext, 0) as DeclarationFieldsContext;
	}
	public pubExposing(): PubExposingContext {
		return this.getTypedRuleContext(PubExposingContext, 0) as PubExposingContext;
	}
	public DOC_COMMENT_LINE_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.DOC_COMMENT_LINE);
	}
	public DOC_COMMENT_LINE(i: number): TerminalNode {
		return this.getToken(KestrelParser.DOC_COMMENT_LINE, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_structDeclaration_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStructDeclaration_) {
	 		listener.enterStructDeclaration_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStructDeclaration_) {
	 		listener.exitStructDeclaration_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStructDeclaration_) {
			return visitor.visitStructDeclaration_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExternTypeDeclaration_Context extends ParserRuleContext {
	public _doc!: Token;
	public _pub!: Token;
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public paramsList(): ParamsListContext {
		return this.getTypedRuleContext(ParamsListContext, 0) as ParamsListContext;
	}
	public DOC_COMMENT_LINE_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.DOC_COMMENT_LINE);
	}
	public DOC_COMMENT_LINE(i: number): TerminalNode {
		return this.getToken(KestrelParser.DOC_COMMENT_LINE, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_externTypeDeclaration_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExternTypeDeclaration_) {
	 		listener.enterExternTypeDeclaration_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExternTypeDeclaration_) {
	 		listener.exitExternTypeDeclaration_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExternTypeDeclaration_) {
			return visitor.visitExternTypeDeclaration_(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PubExposingContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EXPOSING_NESTED(): TerminalNode {
		return this.getToken(KestrelParser.EXPOSING_NESTED, 0);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_pubExposing;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterPubExposing) {
	 		listener.enterPubExposing(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitPubExposing) {
	 		listener.exitPubExposing(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitPubExposing) {
			return visitor.visitPubExposing(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParamsListContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.ID);
	}
	public ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.ID, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_paramsList;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterParamsList) {
	 		listener.enterParamsList(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitParamsList) {
	 		listener.exitParamsList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitParamsList) {
			return visitor.visitParamsList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeVariantsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public typeConstructorDecl_list(): TypeConstructorDeclContext[] {
		return this.getTypedRuleContexts(TypeConstructorDeclContext) as TypeConstructorDeclContext[];
	}
	public typeConstructorDecl(i: number): TypeConstructorDeclContext {
		return this.getTypedRuleContext(TypeConstructorDeclContext, i) as TypeConstructorDeclContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_typeVariants;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeVariants) {
	 		listener.enterTypeVariants(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeVariants) {
	 		listener.exitTypeVariants(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeVariants) {
			return visitor.visitTypeVariants(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldDeclContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public type_(): TypeContext {
		return this.getTypedRuleContext(TypeContext, 0) as TypeContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_fieldDecl;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFieldDecl) {
	 		listener.enterFieldDecl(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFieldDecl) {
	 		listener.exitFieldDecl(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFieldDecl) {
			return visitor.visitFieldDecl(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationFieldsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public fieldDecl_list(): FieldDeclContext[] {
		return this.getTypedRuleContexts(FieldDeclContext) as FieldDeclContext[];
	}
	public fieldDecl(i: number): FieldDeclContext {
		return this.getTypedRuleContext(FieldDeclContext, i) as FieldDeclContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_declarationFields;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterDeclarationFields) {
	 		listener.enterDeclarationFields(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitDeclarationFields) {
	 		listener.exitDeclarationFields(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitDeclarationFields) {
			return visitor.visitDeclarationFields(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PolyTypeContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_(): TypeContext {
		return this.getTypedRuleContext(TypeContext, 0) as TypeContext;
	}
	public traitImplClause_list(): TraitImplClauseContext[] {
		return this.getTypedRuleContexts(TraitImplClauseContext) as TraitImplClauseContext[];
	}
	public traitImplClause(i: number): TraitImplClauseContext {
		return this.getTypedRuleContext(TraitImplClauseContext, i) as TraitImplClauseContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_polyType;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterPolyType) {
	 		listener.enterPolyType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitPolyType) {
	 		listener.exitPolyType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitPolyType) {
			return visitor.visitPolyType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TraitImplClauseContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public TYPE_ID_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.TYPE_ID);
	}
	public TYPE_ID(i: number): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_traitImplClause;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTraitImplClause) {
	 		listener.enterTraitImplClause(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTraitImplClause) {
	 		listener.exitTraitImplClause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTraitImplClause) {
			return visitor.visitTraitImplClause(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_type;
	}
	public override copyFrom(ctx: TypeContext): void {
		super.copyFrom(ctx);
	}
}
export class NamedTypeContext extends TypeContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterNamedType) {
	 		listener.enterNamedType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitNamedType) {
	 		listener.exitNamedType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitNamedType) {
			return visitor.visitNamedType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FnTypeContext extends TypeContext {
	public _ret!: TypeContext;
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public type_(): TypeContext {
		return this.getTypedRuleContext(TypeContext, 0) as TypeContext;
	}
	public fnTypeParams(): FnTypeParamsContext {
		return this.getTypedRuleContext(FnTypeParamsContext, 0) as FnTypeParamsContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFnType) {
	 		listener.enterFnType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFnType) {
	 		listener.exitFnType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFnType) {
			return visitor.visitFnType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleTypeContext extends TypeContext {
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTupleType) {
	 		listener.enterTupleType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTupleType) {
	 		listener.exitTupleType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTupleType) {
			return visitor.visitTupleType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class GenericTypeContext extends TypeContext {
	constructor(parser: KestrelParser, ctx: TypeContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterGenericType) {
	 		listener.enterGenericType(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitGenericType) {
	 		listener.exitGenericType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitGenericType) {
			return visitor.visitGenericType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FnTypeParamsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_fnTypeParams;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFnTypeParams) {
	 		listener.enterFnTypeParams(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFnTypeParams) {
	 		listener.exitFnTypeParams(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFnTypeParams) {
			return visitor.visitFnTypeParams(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeConstructorDeclContext extends ParserRuleContext {
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public type__list(): TypeContext[] {
		return this.getTypedRuleContexts(TypeContext) as TypeContext[];
	}
	public type_(i: number): TypeContext {
		return this.getTypedRuleContext(TypeContext, i) as TypeContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_typeConstructorDecl;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTypeConstructorDecl) {
	 		listener.enterTypeConstructorDecl(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTypeConstructorDecl) {
	 		listener.exitTypeConstructorDecl(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTypeConstructorDecl) {
			return visitor.visitTypeConstructorDecl(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class QualifiedIdContext extends ParserRuleContext {
	public _name!: Token;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_qualifiedId;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterQualifiedId) {
	 		listener.enterQualifiedId(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitQualifiedId) {
	 		listener.exitQualifiedId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitQualifiedId) {
			return visitor.visitQualifiedId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructFieldContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_structField;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStructField) {
	 		listener.enterStructField(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStructField) {
	 		listener.exitStructField(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStructField) {
			return visitor.visitStructField(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructFieldsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public structField_list(): StructFieldContext[] {
		return this.getTypedRuleContexts(StructFieldContext) as StructFieldContext[];
	}
	public structField(i: number): StructFieldContext {
		return this.getTypedRuleContext(StructFieldContext, i) as StructFieldContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_structFields;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStructFields) {
	 		listener.enterStructFields(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStructFields) {
	 		listener.exitStructFields(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStructFields) {
			return visitor.visitStructFields(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExprContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_expr;
	}
	public override copyFrom(ctx: ExprContext): void {
		super.copyFrom(ctx);
	}
}
export class ListLitContext extends ExprContext {
	public _tail!: ExprContext;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public listElems(): ListElemsContext {
		return this.getTypedRuleContext(ListElemsContext, 0) as ListElemsContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterListLit) {
	 		listener.enterListLit(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitListLit) {
	 		listener.exitListLit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitListLit) {
			return visitor.visitListLit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParensContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterParens) {
	 		listener.enterParens(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitParens) {
	 		listener.exitParens(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitParens) {
			return visitor.visitParens(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public STRING(): TerminalNode {
		return this.getToken(KestrelParser.STRING, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterString) {
	 		listener.enterString(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitString) {
	 		listener.exitString(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitString) {
			return visitor.visitString(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MulDivContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMulDiv) {
	 		listener.enterMulDiv(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMulDiv) {
	 		listener.exitMulDiv(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMulDiv) {
			return visitor.visitMulDiv(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AddSubContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterAddSub) {
	 		listener.enterAddSub(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitAddSub) {
	 		listener.exitAddSub(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitAddSub) {
			return visitor.visitAddSub(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FieldAccessContext extends ExprContext {
	public _structName!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFieldAccess) {
	 		listener.enterFieldAccess(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFieldAccess) {
	 		listener.exitFieldAccess(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFieldAccess) {
			return visitor.visitFieldAccess(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FnContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFn) {
	 		listener.enterFn(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFn) {
	 		listener.exitFn(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFn) {
			return visitor.visitFn(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MatchContext extends ExprContext {
	public _matched!: ExprContext;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public matchClause_list(): MatchClauseContext[] {
		return this.getTypedRuleContexts(MatchClauseContext) as MatchClauseContext[];
	}
	public matchClause(i: number): MatchClauseContext {
		return this.getTypedRuleContext(MatchClauseContext, i) as MatchClauseContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMatch) {
	 		listener.enterMatch(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMatch) {
	 		listener.exitMatch(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMatch) {
			return visitor.visitMatch(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class PipeContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterPipe) {
	 		listener.enterPipe(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitPipe) {
	 		listener.exitPipe(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitPipe) {
			return visitor.visitPipe(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FloatContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public FLOAT(): TerminalNode {
		return this.getToken(KestrelParser.FLOAT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFloat) {
	 		listener.enterFloat(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFloat) {
	 		listener.exitFloat(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFloat) {
			return visitor.visitFloat(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class EqContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterEq) {
	 		listener.enterEq(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitEq) {
	 		listener.exitEq(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitEq) {
			return visitor.visitEq(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IntContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public INT(): TerminalNode {
		return this.getToken(KestrelParser.INT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterInt) {
	 		listener.enterInt(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitInt) {
	 		listener.exitInt(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitInt) {
			return visitor.visitInt(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CompContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterComp) {
	 		listener.enterComp(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitComp) {
	 		listener.exitComp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitComp) {
			return visitor.visitComp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CallContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterCall) {
	 		listener.enterCall(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitCall) {
	 		listener.exitCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitCall) {
			return visitor.visitCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TupleContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTuple) {
	 		listener.enterTuple(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTuple) {
	 		listener.exitTuple(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTuple) {
			return visitor.visitTuple(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CharContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public CHAR(): TerminalNode {
		return this.getToken(KestrelParser.CHAR, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterChar) {
	 		listener.enterChar(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitChar) {
	 		listener.exitChar(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitChar) {
			return visitor.visitChar(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolNotContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBoolNot) {
	 		listener.enterBoolNot(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBoolNot) {
	 		listener.exitBoolNot(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBoolNot) {
			return visitor.visitBoolNot(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IdContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public qualifiedId(): QualifiedIdContext {
		return this.getTypedRuleContext(QualifiedIdContext, 0) as QualifiedIdContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterId) {
	 		listener.enterId(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitId) {
	 		listener.exitId(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitId) {
			return visitor.visitId(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockExprContext extends ExprContext {
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public block(): BlockContext {
		return this.getTypedRuleContext(BlockContext, 0) as BlockContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockExpr) {
	 		listener.enterBlockExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockExpr) {
	 		listener.exitBlockExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockExpr) {
			return visitor.visitBlockExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfContext extends ExprContext {
	public _condition!: ExprContext;
	public _then!: BlockContext;
	public _else_!: BlockContext;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public block_list(): BlockContext[] {
		return this.getTypedRuleContexts(BlockContext) as BlockContext[];
	}
	public block(i: number): BlockContext {
		return this.getTypedRuleContext(BlockContext, i) as BlockContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterIf) {
	 		listener.enterIf(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitIf) {
	 		listener.exitIf(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitIf) {
			return visitor.visitIf(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolOrContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBoolOr) {
	 		listener.enterBoolOr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBoolOr) {
	 		listener.exitBoolOr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBoolOr) {
			return visitor.visitBoolOr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StructLitContext extends ExprContext {
	public _spread!: ExprContext;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public structFields(): StructFieldsContext {
		return this.getTypedRuleContext(StructFieldsContext, 0) as StructFieldsContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStructLit) {
	 		listener.enterStructLit(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStructLit) {
	 		listener.exitStructLit(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStructLit) {
			return visitor.visitStructLit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BoolAndContext extends ExprContext {
	public _op!: Token;
	constructor(parser: KestrelParser, ctx: ExprContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBoolAnd) {
	 		listener.enterBoolAnd(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBoolAnd) {
	 		listener.exitBoolAnd(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBoolAnd) {
			return visitor.visitBoolAnd(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListElemsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expr_list(): ExprContext[] {
		return this.getTypedRuleContexts(ExprContext) as ExprContext[];
	}
	public expr(i: number): ExprContext {
		return this.getTypedRuleContext(ExprContext, i) as ExprContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_listElems;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterListElems) {
	 		listener.enterListElems(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitListElems) {
	 		listener.exitListElems(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitListElems) {
			return visitor.visitListElems(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MatchClauseContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_matchClause;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMatchClause) {
	 		listener.enterMatchClause(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMatchClause) {
	 		listener.exitMatchClause(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMatchClause) {
			return visitor.visitMatchClause(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockStatementContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_blockStatement;
	}
	public override copyFrom(ctx: BlockStatementContext): void {
		super.copyFrom(ctx);
	}
}
export class BlockLetContext extends BlockStatementContext {
	public _pattern!: MatchPatternContext;
	public _value!: ExprContext;
	constructor(parser: KestrelParser, ctx: BlockStatementContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockLet) {
	 		listener.enterBlockLet(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockLet) {
	 		listener.exitBlockLet(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockLet) {
			return visitor.visitBlockLet(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockLetHashContext extends BlockStatementContext {
	public _mapper!: QualifiedIdContext;
	public _pattern!: MatchPatternContext;
	public _value!: ExprContext;
	constructor(parser: KestrelParser, ctx: BlockStatementContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public qualifiedId(): QualifiedIdContext {
		return this.getTypedRuleContext(QualifiedIdContext, 0) as QualifiedIdContext;
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockLetHash) {
	 		listener.enterBlockLetHash(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockLetHash) {
	 		listener.exitBlockLetHash(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockLetHash) {
			return visitor.visitBlockLetHash(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BlockContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public blockStatement_list(): BlockStatementContext[] {
		return this.getTypedRuleContexts(BlockStatementContext) as BlockStatementContext[];
	}
	public blockStatement(i: number): BlockStatementContext {
		return this.getTypedRuleContext(BlockStatementContext, i) as BlockStatementContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_block;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlock) {
	 		listener.enterBlock(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlock) {
	 		listener.exitBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlock) {
			return visitor.visitBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MatchPatternContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_matchPattern;
	}
	public override copyFrom(ctx: MatchPatternContext): void {
		super.copyFrom(ctx);
	}
}
export class ListPatternContext extends MatchPatternContext {
	public _tail!: MatchPatternContext;
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public listPatterns(): ListPatternsContext {
		return this.getTypedRuleContext(ListPatternsContext, 0) as ListPatternsContext;
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterListPattern) {
	 		listener.enterListPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitListPattern) {
	 		listener.exitListPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitListPattern) {
			return visitor.visitListPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IntPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public INT(): TerminalNode {
		return this.getToken(KestrelParser.INT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterIntPattern) {
	 		listener.enterIntPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitIntPattern) {
	 		listener.exitIntPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitIntPattern) {
			return visitor.visitIntPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class TuplePatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterTuplePattern) {
	 		listener.enterTuplePattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitTuplePattern) {
	 		listener.exitTuplePattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitTuplePattern) {
			return visitor.visitTuplePattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class CharPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public CHAR(): TerminalNode {
		return this.getToken(KestrelParser.CHAR, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterCharPattern) {
	 		listener.enterCharPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitCharPattern) {
	 		listener.exitCharPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitCharPattern) {
			return visitor.visitCharPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FloatPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public FLOAT(): TerminalNode {
		return this.getToken(KestrelParser.FLOAT, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterFloatPattern) {
	 		listener.enterFloatPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitFloatPattern) {
	 		listener.exitFloatPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitFloatPattern) {
			return visitor.visitFloatPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConstructorContext extends MatchPatternContext {
	public _name!: Token;
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public TYPE_ID(): TerminalNode {
		return this.getToken(KestrelParser.TYPE_ID, 0);
	}
	public moduleNamespace(): ModuleNamespaceContext {
		return this.getTypedRuleContext(ModuleNamespaceContext, 0) as ModuleNamespaceContext;
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterConstructor) {
	 		listener.enterConstructor(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitConstructor) {
	 		listener.exitConstructor(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitConstructor) {
			return visitor.visitConstructor(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MatchIdentContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterMatchIdent) {
	 		listener.enterMatchIdent(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitMatchIdent) {
	 		listener.exitMatchIdent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitMatchIdent) {
			return visitor.visitMatchIdent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringPatternContext extends MatchPatternContext {
	constructor(parser: KestrelParser, ctx: MatchPatternContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public STRING(): TerminalNode {
		return this.getToken(KestrelParser.STRING, 0);
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterStringPattern) {
	 		listener.enterStringPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitStringPattern) {
	 		listener.exitStringPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitStringPattern) {
			return visitor.visitStringPattern(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ListPatternsContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public matchPattern_list(): MatchPatternContext[] {
		return this.getTypedRuleContexts(MatchPatternContext) as MatchPatternContext[];
	}
	public matchPattern(i: number): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, i) as MatchPatternContext;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_listPatterns;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterListPatterns) {
	 		listener.enterListPatterns(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitListPatterns) {
	 		listener.exitListPatterns(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitListPatterns) {
			return visitor.visitListPatterns(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
