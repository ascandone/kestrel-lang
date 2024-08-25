// @ts-nocheck
// Generated from Kestrel.g4 by ANTLR 4.13.1
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
	public static readonly SLASH_4 = 51;
	public static readonly SLASH_3 = 52;
	public static readonly SLASH_2 = 53;
	public static readonly LINE_COMMENT = 54;
	public static readonly EXPOSING_NESTED = 55;
	public static readonly INFIX_ID = 56;
	public static readonly ID = 57;
	public static readonly TYPE_ID = 58;
	public static readonly INT = 59;
	public static readonly CHAR = 60;
	public static readonly STRING = 61;
	public static readonly FLOAT = 62;
	public static readonly NEWLINE = 63;
	public static readonly WS = 64;
	public static readonly MODULEDOC_COMMENT_LINE = 65;
	public static readonly DOC_COMMENT_LINE = 66;
	public static readonly INFIX_CHAR = 67;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_moduleNamespace = 0;
	public static readonly RULE_program = 1;
	public static readonly RULE_import_ = 2;
	public static readonly RULE_importExposing = 3;
	public static readonly RULE_declaration = 4;
	public static readonly RULE_letDeclaration_ = 5;
	public static readonly RULE_externLetDeclaration_ = 6;
	public static readonly RULE_typeDeclaration_ = 7;
	public static readonly RULE_structDeclaration_ = 8;
	public static readonly RULE_externTypeDeclaration_ = 9;
	public static readonly RULE_pubExposing = 10;
	public static readonly RULE_paramsList = 11;
	public static readonly RULE_typeVariants = 12;
	public static readonly RULE_fieldDecl = 13;
	public static readonly RULE_declarationFields = 14;
	public static readonly RULE_polyType = 15;
	public static readonly RULE_traitImplClause = 16;
	public static readonly RULE_type = 17;
	public static readonly RULE_fnTypeParams = 18;
	public static readonly RULE_typeConstructorDecl = 19;
	public static readonly RULE_qualifiedId = 20;
	public static readonly RULE_structField = 21;
	public static readonly RULE_structFields = 22;
	public static readonly RULE_expr = 23;
	public static readonly RULE_matchClause = 24;
	public static readonly RULE_block = 25;
	public static readonly RULE_blockContent = 26;
	public static readonly RULE_matchPattern = 27;
	public static readonly literalNames: (string | null)[] = [ null, "'/'", 
                                                            "'import'", 
                                                            "'.'", "'{'", 
                                                            "','", "'}'", 
                                                            "'@inline'", 
                                                            "'pub'", "'let'", 
                                                            "':'", "'='", 
                                                            "'extern'", 
                                                            "'type'", "'struct'", 
                                                            "'<'", "'>'", 
                                                            "'where'", "'+'", 
                                                            "'Fn'", "'('", 
                                                            "')'", "'->'", 
                                                            "'#'", "'!'", 
                                                            "'..'", "'*'", 
                                                            "'*.'", "'/.'", 
                                                            "'%'", "'-'", 
                                                            "'+.'", "'-.'", 
                                                            "'++'", "'::'", 
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
		"letDeclaration_", "externLetDeclaration_", "typeDeclaration_", "structDeclaration_", 
		"externTypeDeclaration_", "pubExposing", "paramsList", "typeVariants", 
		"fieldDecl", "declarationFields", "polyType", "traitImplClause", "type", 
		"fnTypeParams", "typeConstructorDecl", "qualifiedId", "structField", "structFields", 
		"expr", "matchClause", "block", "blockContent", "matchPattern",
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
			this.state = 56;
			this.match(KestrelParser.TYPE_ID);
			this.state = 61;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 57;
				this.match(KestrelParser.T__0);
				this.state = 58;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 63;
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
			this.state = 67;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===65) {
				{
				{
				this.state = 64;
				localctx._doc = this.match(KestrelParser.MODULEDOC_COMMENT_LINE);
				}
				}
				this.state = 69;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 73;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 70;
				this.import_();
				}
				}
				this.state = 75;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 79;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 13184) !== 0) || _la===66) {
				{
				{
				this.state = 76;
				this.declaration();
				}
				}
				this.state = 81;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 82;
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
			this.state = 84;
			this.match(KestrelParser.T__1);
			this.state = 85;
			this.moduleNamespace();
			this.state = 98;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 86;
				this.match(KestrelParser.T__2);
				this.state = 87;
				this.match(KestrelParser.T__3);
				this.state = 88;
				this.importExposing();
				this.state = 93;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 89;
					this.match(KestrelParser.T__4);
					this.state = 90;
					this.importExposing();
					}
					}
					this.state = 95;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 96;
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
			this.state = 105;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 56:
			case 57:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 100;
				(localctx as ValueExposingContext)._name = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===56 || _la===57)) {
				    (localctx as ValueExposingContext)._name = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 58:
				localctx = new TypeExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 101;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 103;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===55) {
					{
					this.state = 102;
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
			this.state = 112;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 107;
				this.letDeclaration_();
				}
				break;
			case 2:
				localctx = new ExternLetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 108;
				this.externLetDeclaration_();
				}
				break;
			case 3:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 109;
				this.typeDeclaration_();
				}
				break;
			case 4:
				localctx = new StructDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 110;
				this.structDeclaration_();
				}
				break;
			case 5:
				localctx = new ExternTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 111;
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
	public letDeclaration_(): LetDeclaration_Context {
		let localctx: LetDeclaration_Context = new LetDeclaration_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 10, KestrelParser.RULE_letDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 117;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 114;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 119;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 120;
				localctx._inline = this.match(KestrelParser.T__6);
				}
			}

			{
			this.state = 124;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 123;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			}
			this.state = 126;
			this.match(KestrelParser.T__8);
			this.state = 127;
			this.match(KestrelParser.ID);
			this.state = 130;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 128;
				this.match(KestrelParser.T__9);
				this.state = 129;
				localctx._typeHint = this.polyType();
				}
			}

			this.state = 132;
			this.match(KestrelParser.T__10);
			this.state = 133;
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
	public externLetDeclaration_(): ExternLetDeclaration_Context {
		let localctx: ExternLetDeclaration_Context = new ExternLetDeclaration_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 12, KestrelParser.RULE_externLetDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 138;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 135;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 140;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 141;
			this.match(KestrelParser.T__11);
			this.state = 143;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 142;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			this.state = 145;
			this.match(KestrelParser.T__8);
			{
			this.state = 146;
			localctx._binding = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===56 || _la===57)) {
			    localctx._binding = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
			this.state = 147;
			this.match(KestrelParser.T__9);
			this.state = 148;
			localctx._typeHint = this.polyType();
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
		this.enterRule(localctx, 14, KestrelParser.RULE_typeDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 153;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 150;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 155;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 157;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 156;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 159;
			this.match(KestrelParser.T__12);
			this.state = 160;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 162;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 161;
				this.paramsList();
				}
			}

			this.state = 164;
			this.match(KestrelParser.T__3);
			this.state = 166;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 165;
				this.typeVariants();
				}
			}

			this.state = 168;
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
		this.enterRule(localctx, 16, KestrelParser.RULE_structDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 173;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 170;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 175;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 177;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 176;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 179;
			this.match(KestrelParser.T__12);
			this.state = 180;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 182;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 181;
				this.paramsList();
				}
			}

			this.state = 184;
			this.match(KestrelParser.T__13);
			this.state = 185;
			this.match(KestrelParser.T__3);
			this.state = 187;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===57) {
				{
				this.state = 186;
				this.declarationFields();
				}
			}

			this.state = 189;
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
		this.enterRule(localctx, 18, KestrelParser.RULE_externTypeDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 194;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 191;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 196;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 197;
			this.match(KestrelParser.T__11);
			this.state = 199;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 198;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			this.state = 201;
			this.match(KestrelParser.T__12);
			this.state = 202;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 204;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 203;
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
		this.enterRule(localctx, 20, KestrelParser.RULE_pubExposing);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 206;
			this.match(KestrelParser.T__7);
			this.state = 208;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===55) {
				{
				this.state = 207;
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
		this.enterRule(localctx, 22, KestrelParser.RULE_paramsList);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 210;
			this.match(KestrelParser.T__14);
			this.state = 211;
			this.match(KestrelParser.ID);
			this.state = 216;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 212;
				this.match(KestrelParser.T__4);
				this.state = 213;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 218;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 219;
			this.match(KestrelParser.T__15);
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
		this.enterRule(localctx, 24, KestrelParser.RULE_typeVariants);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 221;
			this.typeConstructorDecl();
			this.state = 226;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 222;
					this.match(KestrelParser.T__4);
					this.state = 223;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 228;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
			}
			this.state = 230;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 229;
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
		this.enterRule(localctx, 26, KestrelParser.RULE_fieldDecl);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 232;
			this.match(KestrelParser.ID);
			this.state = 233;
			this.match(KestrelParser.T__9);
			this.state = 234;
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
		this.enterRule(localctx, 28, KestrelParser.RULE_declarationFields);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 236;
			this.fieldDecl();
			this.state = 241;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 30, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 237;
					this.match(KestrelParser.T__4);
					this.state = 238;
					this.fieldDecl();
					}
					}
				}
				this.state = 243;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 30, this._ctx);
			}
			this.state = 245;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 244;
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
		this.enterRule(localctx, 30, KestrelParser.RULE_polyType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 247;
			this.type_();
			this.state = 257;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===17) {
				{
				this.state = 248;
				this.match(KestrelParser.T__16);
				this.state = 249;
				this.traitImplClause();
				this.state = 254;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 250;
					this.match(KestrelParser.T__4);
					this.state = 251;
					this.traitImplClause();
					}
					}
					this.state = 256;
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
		this.enterRule(localctx, 32, KestrelParser.RULE_traitImplClause);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 259;
			this.match(KestrelParser.ID);
			this.state = 260;
			this.match(KestrelParser.T__9);
			{
			this.state = 261;
			this.match(KestrelParser.TYPE_ID);
			this.state = 266;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===18) {
				{
				{
				this.state = 262;
				this.match(KestrelParser.T__17);
				this.state = 263;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 268;
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
		this.enterRule(localctx, 34, KestrelParser.RULE_type);
		let _la: number;
		try {
			this.state = 310;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 58:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 272;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 35, this._ctx) ) {
				case 1:
					{
					this.state = 269;
					this.moduleNamespace();
					this.state = 270;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 274;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 286;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===15) {
					{
					this.state = 275;
					this.match(KestrelParser.T__14);
					this.state = 276;
					this.type_();
					this.state = 281;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 277;
						this.match(KestrelParser.T__4);
						this.state = 278;
						this.type_();
						}
						}
						this.state = 283;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 284;
					this.match(KestrelParser.T__15);
					}
				}

				}
				break;
			case 19:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 288;
				this.match(KestrelParser.T__18);
				this.state = 289;
				this.match(KestrelParser.T__19);
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===19 || _la===20 || _la===57 || _la===58) {
					{
					this.state = 290;
					this.fnTypeParams();
					}
				}

				this.state = 293;
				this.match(KestrelParser.T__20);
				this.state = 294;
				this.match(KestrelParser.T__21);
				this.state = 295;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 57:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 296;
				this.match(KestrelParser.ID);
				}
				break;
			case 20:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 297;
				this.match(KestrelParser.T__19);
				this.state = 298;
				this.type_();
				this.state = 299;
				this.match(KestrelParser.T__4);
				this.state = 300;
				this.type_();
				this.state = 305;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 301;
					this.match(KestrelParser.T__4);
					this.state = 302;
					this.type_();
					}
					}
					this.state = 307;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 308;
				this.match(KestrelParser.T__20);
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
	public fnTypeParams(): FnTypeParamsContext {
		let localctx: FnTypeParamsContext = new FnTypeParamsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, KestrelParser.RULE_fnTypeParams);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 312;
			this.type_();
			this.state = 317;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 41, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 313;
					this.match(KestrelParser.T__4);
					this.state = 314;
					this.type_();
					}
					}
				}
				this.state = 319;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 41, this._ctx);
			}
			this.state = 321;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 320;
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
		this.enterRule(localctx, 38, KestrelParser.RULE_typeConstructorDecl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 323;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 335;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===20) {
				{
				this.state = 324;
				this.match(KestrelParser.T__19);
				this.state = 325;
				this.type_();
				this.state = 330;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 326;
					this.match(KestrelParser.T__4);
					this.state = 327;
					this.type_();
					}
					}
					this.state = 332;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 333;
				this.match(KestrelParser.T__20);
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
		this.enterRule(localctx, 40, KestrelParser.RULE_qualifiedId);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 340;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 45, this._ctx) ) {
			case 1:
				{
				this.state = 337;
				this.moduleNamespace();
				this.state = 338;
				this.match(KestrelParser.T__2);
				}
				break;
			}
			{
			this.state = 342;
			localctx._name = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===57 || _la===58)) {
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
		this.enterRule(localctx, 42, KestrelParser.RULE_structField);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 344;
			this.match(KestrelParser.ID);
			this.state = 345;
			this.match(KestrelParser.T__9);
			this.state = 346;
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
		this.enterRule(localctx, 44, KestrelParser.RULE_structFields);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 348;
			this.structField();
			this.state = 353;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 46, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 349;
					this.match(KestrelParser.T__4);
					this.state = 350;
					this.structField();
					}
					}
				}
				this.state = 355;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 46, this._ctx);
			}
			this.state = 357;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 356;
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
		let _startState: number = 46;
		this.enterRecursionRule(localctx, 46, KestrelParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 449;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 60, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 360;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 361;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 362;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 363;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 364;
				this.qualifiedId();
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 365;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__23);
				this.state = 366;
				this.expr(18);
				}
				break;
			case 7:
				{
				localctx = new StructLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 367;
				this.match(KestrelParser.TYPE_ID);
				this.state = 368;
				this.match(KestrelParser.T__3);
				this.state = 370;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===57) {
					{
					this.state = 369;
					this.structFields();
					}
				}

				this.state = 374;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===25) {
					{
					this.state = 372;
					this.match(KestrelParser.T__24);
					this.state = 373;
					(localctx as StructLitContext)._spread = this.expr(0);
					}
				}

				this.state = 376;
				this.match(KestrelParser.T__5);
				}
				break;
			case 8:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 377;
				this.match(KestrelParser.T__19);
				this.state = 378;
				this.expr(0);
				this.state = 379;
				this.match(KestrelParser.T__4);
				this.state = 380;
				this.expr(0);
				this.state = 385;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 381;
					this.match(KestrelParser.T__4);
					this.state = 382;
					this.expr(0);
					}
					}
					this.state = 387;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 388;
				this.match(KestrelParser.T__20);
				}
				break;
			case 9:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 390;
				this.match(KestrelParser.T__19);
				this.state = 391;
				this.expr(0);
				this.state = 392;
				this.match(KestrelParser.T__20);
				}
				break;
			case 10:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 394;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 395;
				this.match(KestrelParser.T__40);
				this.state = 407;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===20 || ((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 63) !== 0)) {
					{
					this.state = 396;
					this.matchPattern(0);
					this.state = 401;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 51, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 397;
							this.match(KestrelParser.T__4);
							this.state = 398;
							this.matchPattern(0);
							}
							}
						}
						this.state = 403;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 51, this._ctx);
					}
					this.state = 405;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 404;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 409;
				this.block();
				}
				break;
			case 12:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 410;
				this.match(KestrelParser.T__41);
				this.state = 411;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 412;
				(localctx as IfContext)._then = this.block();
				this.state = 413;
				this.match(KestrelParser.T__42);
				this.state = 414;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 13:
				{
				localctx = new MatchContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 416;
				this.match(KestrelParser.T__43);
				this.state = 417;
				(localctx as MatchContext)._matched = this.expr(0);
				this.state = 418;
				this.match(KestrelParser.T__3);
				this.state = 427;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===20 || ((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 63) !== 0)) {
					{
					this.state = 419;
					this.matchClause();
					this.state = 424;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 54, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 420;
							this.match(KestrelParser.T__4);
							this.state = 421;
							this.matchClause();
							}
							}
						}
						this.state = 426;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 54, this._ctx);
					}
					}
				}

				this.state = 430;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===5) {
					{
					this.state = 429;
					this.match(KestrelParser.T__4);
					}
				}

				this.state = 432;
				this.match(KestrelParser.T__5);
				}
				break;
			case 14:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 434;
				this.match(KestrelParser.T__44);
				this.state = 446;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 17825808) !== 0) || ((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 4128795) !== 0)) {
					{
					this.state = 435;
					this.expr(0);
					this.state = 440;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 436;
							this.match(KestrelParser.T__4);
							this.state = 437;
							this.expr(0);
							}
							}
						}
						this.state = 442;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
					}
					this.state = 444;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 443;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 448;
				this.match(KestrelParser.T__45);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 500;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 66, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 498;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 65, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 451;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 452;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 1006632962) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 453;
						this.expr(16);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 454;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 455;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 18)) & ~0x1F) === 0 && ((1 << (_la - 18)) & 61441) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 456;
						this.expr(15);
						}
						break;
					case 3:
						{
						localctx = new ConsContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 457;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 458;
						(localctx as ConsContext)._op = this.match(KestrelParser.T__33);
						this.state = 459;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 460;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 461;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===35 || _la===36)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 462;
						this.expr(13);
						}
						break;
					case 5:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 463;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 464;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 15)) & ~0x1F) === 0 && ((1 << (_la - 15)) & 12582915) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 465;
						this.expr(12);
						}
						break;
					case 6:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 466;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 467;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__38);
						this.state = 468;
						this.expr(11);
						}
						break;
					case 7:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 469;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 470;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__39);
						this.state = 471;
						this.expr(10);
						}
						break;
					case 8:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 472;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 473;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__46);
						this.state = 474;
						this.expr(2);
						}
						break;
					case 9:
						{
						localctx = new FieldAccessContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 475;
						if (!(this.precpred(this._ctx, 20))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 20)");
						}
						this.state = 476;
						this.match(KestrelParser.T__2);
						this.state = 479;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la===58) {
							{
							this.state = 477;
							(localctx as FieldAccessContext)._structName = this.match(KestrelParser.TYPE_ID);
							this.state = 478;
							this.match(KestrelParser.T__22);
							}
						}

						this.state = 481;
						this.match(KestrelParser.ID);
						}
						break;
					case 10:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 482;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 483;
						this.match(KestrelParser.T__19);
						this.state = 495;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 17825808) !== 0) || ((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 4128795) !== 0)) {
							{
							this.state = 484;
							this.expr(0);
							this.state = 489;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 62, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 485;
									this.match(KestrelParser.T__4);
									this.state = 486;
									this.expr(0);
									}
									}
								}
								this.state = 491;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 62, this._ctx);
							}
							this.state = 493;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 492;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 497;
						this.match(KestrelParser.T__20);
						}
						break;
					}
					}
				}
				this.state = 502;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 66, this._ctx);
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
	public matchClause(): MatchClauseContext {
		let localctx: MatchClauseContext = new MatchClauseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 48, KestrelParser.RULE_matchClause);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 503;
			this.matchPattern(0);
			this.state = 504;
			this.match(KestrelParser.T__47);
			this.state = 505;
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
	public block(): BlockContext {
		let localctx: BlockContext = new BlockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, KestrelParser.RULE_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 507;
			this.match(KestrelParser.T__3);
			this.state = 508;
			this.blockContent();
			this.state = 509;
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
	public blockContent(): BlockContentContext {
		let localctx: BlockContentContext = new BlockContentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, KestrelParser.RULE_blockContent);
		try {
			this.state = 527;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 20:
			case 24:
			case 41:
			case 42:
			case 44:
			case 45:
			case 57:
			case 58:
			case 59:
			case 60:
			case 61:
			case 62:
				localctx = new BlockContentExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 511;
				this.expr(0);
				}
				break;
			case 49:
				localctx = new BlockContentLetHashExprContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 512;
				this.match(KestrelParser.T__48);
				this.state = 513;
				(localctx as BlockContentLetHashExprContext)._mapper = this.qualifiedId();
				this.state = 514;
				(localctx as BlockContentLetHashExprContext)._pattern = this.matchPattern(0);
				this.state = 515;
				this.match(KestrelParser.T__10);
				this.state = 516;
				(localctx as BlockContentLetHashExprContext)._value = this.expr(0);
				this.state = 517;
				this.match(KestrelParser.T__49);
				this.state = 518;
				(localctx as BlockContentLetHashExprContext)._body = this.blockContent();
				}
				break;
			case 9:
				localctx = new BlockContentLetExprContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 520;
				this.match(KestrelParser.T__8);
				this.state = 521;
				(localctx as BlockContentLetExprContext)._pattern = this.matchPattern(0);
				this.state = 522;
				this.match(KestrelParser.T__10);
				this.state = 523;
				(localctx as BlockContentLetExprContext)._value = this.expr(0);
				this.state = 524;
				this.match(KestrelParser.T__49);
				this.state = 525;
				(localctx as BlockContentLetExprContext)._body = this.blockContent();
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

	public matchPattern(): MatchPatternContext;
	public matchPattern(_p: number): MatchPatternContext;
	// @RuleVersion(0)
	public matchPattern(_p?: number): MatchPatternContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: MatchPatternContext = new MatchPatternContext(this, this._ctx, _parentState);
		let _prevctx: MatchPatternContext = localctx;
		let _startState: number = 54;
		this.enterRecursionRule(localctx, 54, KestrelParser.RULE_matchPattern, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 567;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 57:
				{
				localctx = new MatchIdentContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 530;
				this.match(KestrelParser.ID);
				}
				break;
			case 58:
				{
				localctx = new ConstructorContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 534;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 68, this._ctx) ) {
				case 1:
					{
					this.state = 531;
					this.moduleNamespace();
					this.state = 532;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 536;
				(localctx as ConstructorContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 548;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 70, this._ctx) ) {
				case 1:
					{
					this.state = 537;
					this.match(KestrelParser.T__19);
					this.state = 538;
					this.matchPattern(0);
					this.state = 543;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 539;
						this.match(KestrelParser.T__4);
						this.state = 540;
						this.matchPattern(0);
						}
						}
						this.state = 545;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 546;
					this.match(KestrelParser.T__20);
					}
					break;
				}
				}
				break;
			case 59:
				{
				localctx = new IntPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 550;
				this.match(KestrelParser.INT);
				}
				break;
			case 62:
				{
				localctx = new FloatPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 551;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 60:
				{
				localctx = new CharPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 552;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 61:
				{
				localctx = new StringPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 553;
				this.match(KestrelParser.STRING);
				}
				break;
			case 20:
				{
				localctx = new TuplePatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 554;
				this.match(KestrelParser.T__19);
				this.state = 555;
				this.matchPattern(0);
				this.state = 556;
				this.match(KestrelParser.T__4);
				this.state = 557;
				this.matchPattern(0);
				this.state = 562;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 558;
					this.match(KestrelParser.T__4);
					this.state = 559;
					this.matchPattern(0);
					}
					}
					this.state = 564;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 565;
				this.match(KestrelParser.T__20);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 574;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 73, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new ConsPatternContext(this, new MatchPatternContext(this, _parentctx, _parentState));
					this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_matchPattern);
					this.state = 569;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 570;
					this.match(KestrelParser.T__33);
					this.state = 571;
					this.matchPattern(2);
					}
					}
				}
				this.state = 576;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 73, this._ctx);
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

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 23:
			return this.expr_sempred(localctx as ExprContext, predIndex);
		case 27:
			return this.matchPattern_sempred(localctx as MatchPatternContext, predIndex);
		}
		return true;
	}
	private expr_sempred(localctx: ExprContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 15);
		case 1:
			return this.precpred(this._ctx, 14);
		case 2:
			return this.precpred(this._ctx, 13);
		case 3:
			return this.precpred(this._ctx, 12);
		case 4:
			return this.precpred(this._ctx, 11);
		case 5:
			return this.precpred(this._ctx, 10);
		case 6:
			return this.precpred(this._ctx, 9);
		case 7:
			return this.precpred(this._ctx, 1);
		case 8:
			return this.precpred(this._ctx, 20);
		case 9:
			return this.precpred(this._ctx, 16);
		}
		return true;
	}
	private matchPattern_sempred(localctx: MatchPatternContext, predIndex: number): boolean {
		switch (predIndex) {
		case 10:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,67,578,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,1,0,1,0,1,0,5,0,60,8,0,10,0,12,0,63,9,
	0,1,1,5,1,66,8,1,10,1,12,1,69,9,1,1,1,5,1,72,8,1,10,1,12,1,75,9,1,1,1,5,
	1,78,8,1,10,1,12,1,81,9,1,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,5,2,92,8,
	2,10,2,12,2,95,9,2,1,2,1,2,3,2,99,8,2,1,3,1,3,1,3,3,3,104,8,3,3,3,106,8,
	3,1,4,1,4,1,4,1,4,1,4,3,4,113,8,4,1,5,5,5,116,8,5,10,5,12,5,119,9,5,1,5,
	3,5,122,8,5,1,5,3,5,125,8,5,1,5,1,5,1,5,1,5,3,5,131,8,5,1,5,1,5,1,5,1,6,
	5,6,137,8,6,10,6,12,6,140,9,6,1,6,1,6,3,6,144,8,6,1,6,1,6,1,6,1,6,1,6,1,
	7,5,7,152,8,7,10,7,12,7,155,9,7,1,7,3,7,158,8,7,1,7,1,7,1,7,3,7,163,8,7,
	1,7,1,7,3,7,167,8,7,1,7,1,7,1,8,5,8,172,8,8,10,8,12,8,175,9,8,1,8,3,8,178,
	8,8,1,8,1,8,1,8,3,8,183,8,8,1,8,1,8,1,8,3,8,188,8,8,1,8,1,8,1,9,5,9,193,
	8,9,10,9,12,9,196,9,9,1,9,1,9,3,9,200,8,9,1,9,1,9,1,9,3,9,205,8,9,1,10,
	1,10,3,10,209,8,10,1,11,1,11,1,11,1,11,5,11,215,8,11,10,11,12,11,218,9,
	11,1,11,1,11,1,12,1,12,1,12,5,12,225,8,12,10,12,12,12,228,9,12,1,12,3,12,
	231,8,12,1,13,1,13,1,13,1,13,1,14,1,14,1,14,5,14,240,8,14,10,14,12,14,243,
	9,14,1,14,3,14,246,8,14,1,15,1,15,1,15,1,15,1,15,5,15,253,8,15,10,15,12,
	15,256,9,15,3,15,258,8,15,1,16,1,16,1,16,1,16,1,16,5,16,265,8,16,10,16,
	12,16,268,9,16,1,17,1,17,1,17,3,17,273,8,17,1,17,1,17,1,17,1,17,1,17,5,
	17,280,8,17,10,17,12,17,283,9,17,1,17,1,17,3,17,287,8,17,1,17,1,17,1,17,
	3,17,292,8,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,1,17,5,17,304,
	8,17,10,17,12,17,307,9,17,1,17,1,17,3,17,311,8,17,1,18,1,18,1,18,5,18,316,
	8,18,10,18,12,18,319,9,18,1,18,3,18,322,8,18,1,19,1,19,1,19,1,19,1,19,5,
	19,329,8,19,10,19,12,19,332,9,19,1,19,1,19,3,19,336,8,19,1,20,1,20,1,20,
	3,20,341,8,20,1,20,1,20,1,21,1,21,1,21,1,21,1,22,1,22,1,22,5,22,352,8,22,
	10,22,12,22,355,9,22,1,22,3,22,358,8,22,1,23,1,23,1,23,1,23,1,23,1,23,1,
	23,1,23,1,23,1,23,1,23,3,23,371,8,23,1,23,1,23,3,23,375,8,23,1,23,1,23,
	1,23,1,23,1,23,1,23,1,23,5,23,384,8,23,10,23,12,23,387,9,23,1,23,1,23,1,
	23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,400,8,23,10,23,12,23,403,
	9,23,1,23,3,23,406,8,23,3,23,408,8,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,
	1,23,1,23,1,23,1,23,1,23,1,23,5,23,423,8,23,10,23,12,23,426,9,23,3,23,428,
	8,23,1,23,3,23,431,8,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,439,8,23,10,
	23,12,23,442,9,23,1,23,3,23,445,8,23,3,23,447,8,23,1,23,3,23,450,8,23,1,
	23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,
	1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,3,23,480,
	8,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,488,8,23,10,23,12,23,491,9,23,1,
	23,3,23,494,8,23,3,23,496,8,23,1,23,5,23,499,8,23,10,23,12,23,502,9,23,
	1,24,1,24,1,24,1,24,1,25,1,25,1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,26,1,
	26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,3,26,528,8,26,1,27,1,27,
	1,27,1,27,1,27,3,27,535,8,27,1,27,1,27,1,27,1,27,1,27,5,27,542,8,27,10,
	27,12,27,545,9,27,1,27,1,27,3,27,549,8,27,1,27,1,27,1,27,1,27,1,27,1,27,
	1,27,1,27,1,27,1,27,5,27,561,8,27,10,27,12,27,564,9,27,1,27,1,27,3,27,568,
	8,27,1,27,1,27,1,27,5,27,573,8,27,10,27,12,27,576,9,27,1,27,0,2,46,54,28,
	0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,
	52,54,0,6,1,0,56,57,1,0,57,58,2,0,1,1,26,29,2,0,18,18,30,33,1,0,35,36,2,
	0,15,16,37,38,654,0,56,1,0,0,0,2,67,1,0,0,0,4,84,1,0,0,0,6,105,1,0,0,0,
	8,112,1,0,0,0,10,117,1,0,0,0,12,138,1,0,0,0,14,153,1,0,0,0,16,173,1,0,0,
	0,18,194,1,0,0,0,20,206,1,0,0,0,22,210,1,0,0,0,24,221,1,0,0,0,26,232,1,
	0,0,0,28,236,1,0,0,0,30,247,1,0,0,0,32,259,1,0,0,0,34,310,1,0,0,0,36,312,
	1,0,0,0,38,323,1,0,0,0,40,340,1,0,0,0,42,344,1,0,0,0,44,348,1,0,0,0,46,
	449,1,0,0,0,48,503,1,0,0,0,50,507,1,0,0,0,52,527,1,0,0,0,54,567,1,0,0,0,
	56,61,5,58,0,0,57,58,5,1,0,0,58,60,5,58,0,0,59,57,1,0,0,0,60,63,1,0,0,0,
	61,59,1,0,0,0,61,62,1,0,0,0,62,1,1,0,0,0,63,61,1,0,0,0,64,66,5,65,0,0,65,
	64,1,0,0,0,66,69,1,0,0,0,67,65,1,0,0,0,67,68,1,0,0,0,68,73,1,0,0,0,69,67,
	1,0,0,0,70,72,3,4,2,0,71,70,1,0,0,0,72,75,1,0,0,0,73,71,1,0,0,0,73,74,1,
	0,0,0,74,79,1,0,0,0,75,73,1,0,0,0,76,78,3,8,4,0,77,76,1,0,0,0,78,81,1,0,
	0,0,79,77,1,0,0,0,79,80,1,0,0,0,80,82,1,0,0,0,81,79,1,0,0,0,82,83,5,0,0,
	1,83,3,1,0,0,0,84,85,5,2,0,0,85,98,3,0,0,0,86,87,5,3,0,0,87,88,5,4,0,0,
	88,93,3,6,3,0,89,90,5,5,0,0,90,92,3,6,3,0,91,89,1,0,0,0,92,95,1,0,0,0,93,
	91,1,0,0,0,93,94,1,0,0,0,94,96,1,0,0,0,95,93,1,0,0,0,96,97,5,6,0,0,97,99,
	1,0,0,0,98,86,1,0,0,0,98,99,1,0,0,0,99,5,1,0,0,0,100,106,7,0,0,0,101,103,
	5,58,0,0,102,104,5,55,0,0,103,102,1,0,0,0,103,104,1,0,0,0,104,106,1,0,0,
	0,105,100,1,0,0,0,105,101,1,0,0,0,106,7,1,0,0,0,107,113,3,10,5,0,108,113,
	3,12,6,0,109,113,3,14,7,0,110,113,3,16,8,0,111,113,3,18,9,0,112,107,1,0,
	0,0,112,108,1,0,0,0,112,109,1,0,0,0,112,110,1,0,0,0,112,111,1,0,0,0,113,
	9,1,0,0,0,114,116,5,66,0,0,115,114,1,0,0,0,116,119,1,0,0,0,117,115,1,0,
	0,0,117,118,1,0,0,0,118,121,1,0,0,0,119,117,1,0,0,0,120,122,5,7,0,0,121,
	120,1,0,0,0,121,122,1,0,0,0,122,124,1,0,0,0,123,125,5,8,0,0,124,123,1,0,
	0,0,124,125,1,0,0,0,125,126,1,0,0,0,126,127,5,9,0,0,127,130,5,57,0,0,128,
	129,5,10,0,0,129,131,3,30,15,0,130,128,1,0,0,0,130,131,1,0,0,0,131,132,
	1,0,0,0,132,133,5,11,0,0,133,134,3,46,23,0,134,11,1,0,0,0,135,137,5,66,
	0,0,136,135,1,0,0,0,137,140,1,0,0,0,138,136,1,0,0,0,138,139,1,0,0,0,139,
	141,1,0,0,0,140,138,1,0,0,0,141,143,5,12,0,0,142,144,5,8,0,0,143,142,1,
	0,0,0,143,144,1,0,0,0,144,145,1,0,0,0,145,146,5,9,0,0,146,147,7,0,0,0,147,
	148,5,10,0,0,148,149,3,30,15,0,149,13,1,0,0,0,150,152,5,66,0,0,151,150,
	1,0,0,0,152,155,1,0,0,0,153,151,1,0,0,0,153,154,1,0,0,0,154,157,1,0,0,0,
	155,153,1,0,0,0,156,158,3,20,10,0,157,156,1,0,0,0,157,158,1,0,0,0,158,159,
	1,0,0,0,159,160,5,13,0,0,160,162,5,58,0,0,161,163,3,22,11,0,162,161,1,0,
	0,0,162,163,1,0,0,0,163,164,1,0,0,0,164,166,5,4,0,0,165,167,3,24,12,0,166,
	165,1,0,0,0,166,167,1,0,0,0,167,168,1,0,0,0,168,169,5,6,0,0,169,15,1,0,
	0,0,170,172,5,66,0,0,171,170,1,0,0,0,172,175,1,0,0,0,173,171,1,0,0,0,173,
	174,1,0,0,0,174,177,1,0,0,0,175,173,1,0,0,0,176,178,3,20,10,0,177,176,1,
	0,0,0,177,178,1,0,0,0,178,179,1,0,0,0,179,180,5,13,0,0,180,182,5,58,0,0,
	181,183,3,22,11,0,182,181,1,0,0,0,182,183,1,0,0,0,183,184,1,0,0,0,184,185,
	5,14,0,0,185,187,5,4,0,0,186,188,3,28,14,0,187,186,1,0,0,0,187,188,1,0,
	0,0,188,189,1,0,0,0,189,190,5,6,0,0,190,17,1,0,0,0,191,193,5,66,0,0,192,
	191,1,0,0,0,193,196,1,0,0,0,194,192,1,0,0,0,194,195,1,0,0,0,195,197,1,0,
	0,0,196,194,1,0,0,0,197,199,5,12,0,0,198,200,5,8,0,0,199,198,1,0,0,0,199,
	200,1,0,0,0,200,201,1,0,0,0,201,202,5,13,0,0,202,204,5,58,0,0,203,205,3,
	22,11,0,204,203,1,0,0,0,204,205,1,0,0,0,205,19,1,0,0,0,206,208,5,8,0,0,
	207,209,5,55,0,0,208,207,1,0,0,0,208,209,1,0,0,0,209,21,1,0,0,0,210,211,
	5,15,0,0,211,216,5,57,0,0,212,213,5,5,0,0,213,215,5,57,0,0,214,212,1,0,
	0,0,215,218,1,0,0,0,216,214,1,0,0,0,216,217,1,0,0,0,217,219,1,0,0,0,218,
	216,1,0,0,0,219,220,5,16,0,0,220,23,1,0,0,0,221,226,3,38,19,0,222,223,5,
	5,0,0,223,225,3,38,19,0,224,222,1,0,0,0,225,228,1,0,0,0,226,224,1,0,0,0,
	226,227,1,0,0,0,227,230,1,0,0,0,228,226,1,0,0,0,229,231,5,5,0,0,230,229,
	1,0,0,0,230,231,1,0,0,0,231,25,1,0,0,0,232,233,5,57,0,0,233,234,5,10,0,
	0,234,235,3,34,17,0,235,27,1,0,0,0,236,241,3,26,13,0,237,238,5,5,0,0,238,
	240,3,26,13,0,239,237,1,0,0,0,240,243,1,0,0,0,241,239,1,0,0,0,241,242,1,
	0,0,0,242,245,1,0,0,0,243,241,1,0,0,0,244,246,5,5,0,0,245,244,1,0,0,0,245,
	246,1,0,0,0,246,29,1,0,0,0,247,257,3,34,17,0,248,249,5,17,0,0,249,254,3,
	32,16,0,250,251,5,5,0,0,251,253,3,32,16,0,252,250,1,0,0,0,253,256,1,0,0,
	0,254,252,1,0,0,0,254,255,1,0,0,0,255,258,1,0,0,0,256,254,1,0,0,0,257,248,
	1,0,0,0,257,258,1,0,0,0,258,31,1,0,0,0,259,260,5,57,0,0,260,261,5,10,0,
	0,261,266,5,58,0,0,262,263,5,18,0,0,263,265,5,58,0,0,264,262,1,0,0,0,265,
	268,1,0,0,0,266,264,1,0,0,0,266,267,1,0,0,0,267,33,1,0,0,0,268,266,1,0,
	0,0,269,270,3,0,0,0,270,271,5,3,0,0,271,273,1,0,0,0,272,269,1,0,0,0,272,
	273,1,0,0,0,273,274,1,0,0,0,274,286,5,58,0,0,275,276,5,15,0,0,276,281,3,
	34,17,0,277,278,5,5,0,0,278,280,3,34,17,0,279,277,1,0,0,0,280,283,1,0,0,
	0,281,279,1,0,0,0,281,282,1,0,0,0,282,284,1,0,0,0,283,281,1,0,0,0,284,285,
	5,16,0,0,285,287,1,0,0,0,286,275,1,0,0,0,286,287,1,0,0,0,287,311,1,0,0,
	0,288,289,5,19,0,0,289,291,5,20,0,0,290,292,3,36,18,0,291,290,1,0,0,0,291,
	292,1,0,0,0,292,293,1,0,0,0,293,294,5,21,0,0,294,295,5,22,0,0,295,311,3,
	34,17,0,296,311,5,57,0,0,297,298,5,20,0,0,298,299,3,34,17,0,299,300,5,5,
	0,0,300,305,3,34,17,0,301,302,5,5,0,0,302,304,3,34,17,0,303,301,1,0,0,0,
	304,307,1,0,0,0,305,303,1,0,0,0,305,306,1,0,0,0,306,308,1,0,0,0,307,305,
	1,0,0,0,308,309,5,21,0,0,309,311,1,0,0,0,310,272,1,0,0,0,310,288,1,0,0,
	0,310,296,1,0,0,0,310,297,1,0,0,0,311,35,1,0,0,0,312,317,3,34,17,0,313,
	314,5,5,0,0,314,316,3,34,17,0,315,313,1,0,0,0,316,319,1,0,0,0,317,315,1,
	0,0,0,317,318,1,0,0,0,318,321,1,0,0,0,319,317,1,0,0,0,320,322,5,5,0,0,321,
	320,1,0,0,0,321,322,1,0,0,0,322,37,1,0,0,0,323,335,5,58,0,0,324,325,5,20,
	0,0,325,330,3,34,17,0,326,327,5,5,0,0,327,329,3,34,17,0,328,326,1,0,0,0,
	329,332,1,0,0,0,330,328,1,0,0,0,330,331,1,0,0,0,331,333,1,0,0,0,332,330,
	1,0,0,0,333,334,5,21,0,0,334,336,1,0,0,0,335,324,1,0,0,0,335,336,1,0,0,
	0,336,39,1,0,0,0,337,338,3,0,0,0,338,339,5,3,0,0,339,341,1,0,0,0,340,337,
	1,0,0,0,340,341,1,0,0,0,341,342,1,0,0,0,342,343,7,1,0,0,343,41,1,0,0,0,
	344,345,5,57,0,0,345,346,5,10,0,0,346,347,3,46,23,0,347,43,1,0,0,0,348,
	353,3,42,21,0,349,350,5,5,0,0,350,352,3,42,21,0,351,349,1,0,0,0,352,355,
	1,0,0,0,353,351,1,0,0,0,353,354,1,0,0,0,354,357,1,0,0,0,355,353,1,0,0,0,
	356,358,5,5,0,0,357,356,1,0,0,0,357,358,1,0,0,0,358,45,1,0,0,0,359,360,
	6,23,-1,0,360,450,5,59,0,0,361,450,5,62,0,0,362,450,5,60,0,0,363,450,5,
	61,0,0,364,450,3,40,20,0,365,366,5,24,0,0,366,450,3,46,23,18,367,368,5,
	58,0,0,368,370,5,4,0,0,369,371,3,44,22,0,370,369,1,0,0,0,370,371,1,0,0,
	0,371,374,1,0,0,0,372,373,5,25,0,0,373,375,3,46,23,0,374,372,1,0,0,0,374,
	375,1,0,0,0,375,376,1,0,0,0,376,450,5,6,0,0,377,378,5,20,0,0,378,379,3,
	46,23,0,379,380,5,5,0,0,380,385,3,46,23,0,381,382,5,5,0,0,382,384,3,46,
	23,0,383,381,1,0,0,0,384,387,1,0,0,0,385,383,1,0,0,0,385,386,1,0,0,0,386,
	388,1,0,0,0,387,385,1,0,0,0,388,389,5,21,0,0,389,450,1,0,0,0,390,391,5,
	20,0,0,391,392,3,46,23,0,392,393,5,21,0,0,393,450,1,0,0,0,394,450,3,50,
	25,0,395,407,5,41,0,0,396,401,3,54,27,0,397,398,5,5,0,0,398,400,3,54,27,
	0,399,397,1,0,0,0,400,403,1,0,0,0,401,399,1,0,0,0,401,402,1,0,0,0,402,405,
	1,0,0,0,403,401,1,0,0,0,404,406,5,5,0,0,405,404,1,0,0,0,405,406,1,0,0,0,
	406,408,1,0,0,0,407,396,1,0,0,0,407,408,1,0,0,0,408,409,1,0,0,0,409,450,
	3,50,25,0,410,411,5,42,0,0,411,412,3,46,23,0,412,413,3,50,25,0,413,414,
	5,43,0,0,414,415,3,50,25,0,415,450,1,0,0,0,416,417,5,44,0,0,417,418,3,46,
	23,0,418,427,5,4,0,0,419,424,3,48,24,0,420,421,5,5,0,0,421,423,3,48,24,
	0,422,420,1,0,0,0,423,426,1,0,0,0,424,422,1,0,0,0,424,425,1,0,0,0,425,428,
	1,0,0,0,426,424,1,0,0,0,427,419,1,0,0,0,427,428,1,0,0,0,428,430,1,0,0,0,
	429,431,5,5,0,0,430,429,1,0,0,0,430,431,1,0,0,0,431,432,1,0,0,0,432,433,
	5,6,0,0,433,450,1,0,0,0,434,446,5,45,0,0,435,440,3,46,23,0,436,437,5,5,
	0,0,437,439,3,46,23,0,438,436,1,0,0,0,439,442,1,0,0,0,440,438,1,0,0,0,440,
	441,1,0,0,0,441,444,1,0,0,0,442,440,1,0,0,0,443,445,5,5,0,0,444,443,1,0,
	0,0,444,445,1,0,0,0,445,447,1,0,0,0,446,435,1,0,0,0,446,447,1,0,0,0,447,
	448,1,0,0,0,448,450,5,46,0,0,449,359,1,0,0,0,449,361,1,0,0,0,449,362,1,
	0,0,0,449,363,1,0,0,0,449,364,1,0,0,0,449,365,1,0,0,0,449,367,1,0,0,0,449,
	377,1,0,0,0,449,390,1,0,0,0,449,394,1,0,0,0,449,395,1,0,0,0,449,410,1,0,
	0,0,449,416,1,0,0,0,449,434,1,0,0,0,450,500,1,0,0,0,451,452,10,15,0,0,452,
	453,7,2,0,0,453,499,3,46,23,16,454,455,10,14,0,0,455,456,7,3,0,0,456,499,
	3,46,23,15,457,458,10,13,0,0,458,459,5,34,0,0,459,499,3,46,23,13,460,461,
	10,12,0,0,461,462,7,4,0,0,462,499,3,46,23,13,463,464,10,11,0,0,464,465,
	7,5,0,0,465,499,3,46,23,12,466,467,10,10,0,0,467,468,5,39,0,0,468,499,3,
	46,23,11,469,470,10,9,0,0,470,471,5,40,0,0,471,499,3,46,23,10,472,473,10,
	1,0,0,473,474,5,47,0,0,474,499,3,46,23,2,475,476,10,20,0,0,476,479,5,3,
	0,0,477,478,5,58,0,0,478,480,5,23,0,0,479,477,1,0,0,0,479,480,1,0,0,0,480,
	481,1,0,0,0,481,499,5,57,0,0,482,483,10,16,0,0,483,495,5,20,0,0,484,489,
	3,46,23,0,485,486,5,5,0,0,486,488,3,46,23,0,487,485,1,0,0,0,488,491,1,0,
	0,0,489,487,1,0,0,0,489,490,1,0,0,0,490,493,1,0,0,0,491,489,1,0,0,0,492,
	494,5,5,0,0,493,492,1,0,0,0,493,494,1,0,0,0,494,496,1,0,0,0,495,484,1,0,
	0,0,495,496,1,0,0,0,496,497,1,0,0,0,497,499,5,21,0,0,498,451,1,0,0,0,498,
	454,1,0,0,0,498,457,1,0,0,0,498,460,1,0,0,0,498,463,1,0,0,0,498,466,1,0,
	0,0,498,469,1,0,0,0,498,472,1,0,0,0,498,475,1,0,0,0,498,482,1,0,0,0,499,
	502,1,0,0,0,500,498,1,0,0,0,500,501,1,0,0,0,501,47,1,0,0,0,502,500,1,0,
	0,0,503,504,3,54,27,0,504,505,5,48,0,0,505,506,3,46,23,0,506,49,1,0,0,0,
	507,508,5,4,0,0,508,509,3,52,26,0,509,510,5,6,0,0,510,51,1,0,0,0,511,528,
	3,46,23,0,512,513,5,49,0,0,513,514,3,40,20,0,514,515,3,54,27,0,515,516,
	5,11,0,0,516,517,3,46,23,0,517,518,5,50,0,0,518,519,3,52,26,0,519,528,1,
	0,0,0,520,521,5,9,0,0,521,522,3,54,27,0,522,523,5,11,0,0,523,524,3,46,23,
	0,524,525,5,50,0,0,525,526,3,52,26,0,526,528,1,0,0,0,527,511,1,0,0,0,527,
	512,1,0,0,0,527,520,1,0,0,0,528,53,1,0,0,0,529,530,6,27,-1,0,530,568,5,
	57,0,0,531,532,3,0,0,0,532,533,5,3,0,0,533,535,1,0,0,0,534,531,1,0,0,0,
	534,535,1,0,0,0,535,536,1,0,0,0,536,548,5,58,0,0,537,538,5,20,0,0,538,543,
	3,54,27,0,539,540,5,5,0,0,540,542,3,54,27,0,541,539,1,0,0,0,542,545,1,0,
	0,0,543,541,1,0,0,0,543,544,1,0,0,0,544,546,1,0,0,0,545,543,1,0,0,0,546,
	547,5,21,0,0,547,549,1,0,0,0,548,537,1,0,0,0,548,549,1,0,0,0,549,568,1,
	0,0,0,550,568,5,59,0,0,551,568,5,62,0,0,552,568,5,60,0,0,553,568,5,61,0,
	0,554,555,5,20,0,0,555,556,3,54,27,0,556,557,5,5,0,0,557,562,3,54,27,0,
	558,559,5,5,0,0,559,561,3,54,27,0,560,558,1,0,0,0,561,564,1,0,0,0,562,560,
	1,0,0,0,562,563,1,0,0,0,563,565,1,0,0,0,564,562,1,0,0,0,565,566,5,21,0,
	0,566,568,1,0,0,0,567,529,1,0,0,0,567,534,1,0,0,0,567,550,1,0,0,0,567,551,
	1,0,0,0,567,552,1,0,0,0,567,553,1,0,0,0,567,554,1,0,0,0,568,574,1,0,0,0,
	569,570,10,2,0,0,570,571,5,34,0,0,571,573,3,54,27,2,572,569,1,0,0,0,573,
	576,1,0,0,0,574,572,1,0,0,0,574,575,1,0,0,0,575,55,1,0,0,0,576,574,1,0,
	0,0,74,61,67,73,79,93,98,103,105,112,117,121,124,130,138,143,153,157,162,
	166,173,177,182,187,194,199,204,208,216,226,230,241,245,254,257,266,272,
	281,286,291,305,310,317,321,330,335,340,353,357,370,374,385,401,405,407,
	424,427,430,440,444,446,449,479,489,493,495,498,500,527,534,543,548,562,
	567,574];

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
	public copyFrom(ctx: ImportExposingContext): void {
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
	public copyFrom(ctx: DeclarationContext): void {
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
export class ExternLetDeclarationContext extends DeclarationContext {
	constructor(parser: KestrelParser, ctx: DeclarationContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public externLetDeclaration_(): ExternLetDeclaration_Context {
		return this.getTypedRuleContext(ExternLetDeclaration_Context, 0) as ExternLetDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExternLetDeclaration) {
	 		listener.enterExternLetDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExternLetDeclaration) {
	 		listener.exitExternLetDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExternLetDeclaration) {
			return visitor.visitExternLetDeclaration(this);
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


export class LetDeclaration_Context extends ParserRuleContext {
	public _doc!: Token;
	public _inline!: Token;
	public _pub!: Token;
	public _typeHint!: PolyTypeContext;
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
	public polyType(): PolyTypeContext {
		return this.getTypedRuleContext(PolyTypeContext, 0) as PolyTypeContext;
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


export class ExternLetDeclaration_Context extends ParserRuleContext {
	public _doc!: Token;
	public _pub!: Token;
	public _binding!: Token;
	public _typeHint!: PolyTypeContext;
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public polyType(): PolyTypeContext {
		return this.getTypedRuleContext(PolyTypeContext, 0) as PolyTypeContext;
	}
	public INFIX_ID(): TerminalNode {
		return this.getToken(KestrelParser.INFIX_ID, 0);
	}
	public ID(): TerminalNode {
		return this.getToken(KestrelParser.ID, 0);
	}
	public DOC_COMMENT_LINE_list(): TerminalNode[] {
	    	return this.getTokens(KestrelParser.DOC_COMMENT_LINE);
	}
	public DOC_COMMENT_LINE(i: number): TerminalNode {
		return this.getToken(KestrelParser.DOC_COMMENT_LINE, i);
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_externLetDeclaration_;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterExternLetDeclaration_) {
	 		listener.enterExternLetDeclaration_(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitExternLetDeclaration_) {
	 		listener.exitExternLetDeclaration_(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitExternLetDeclaration_) {
			return visitor.visitExternLetDeclaration_(this);
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
	public copyFrom(ctx: TypeContext): void {
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
	public copyFrom(ctx: ExprContext): void {
		super.copyFrom(ctx);
	}
}
export class ListLitContext extends ExprContext {
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
export class ConsContext extends ExprContext {
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
	    if(listener.enterCons) {
	 		listener.enterCons(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitCons) {
	 		listener.exitCons(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitCons) {
			return visitor.visitCons(this);
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


export class BlockContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public blockContent(): BlockContentContext {
		return this.getTypedRuleContext(BlockContentContext, 0) as BlockContentContext;
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


export class BlockContentContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_blockContent;
	}
	public copyFrom(ctx: BlockContentContext): void {
		super.copyFrom(ctx);
	}
}
export class BlockContentLetExprContext extends BlockContentContext {
	public _pattern!: MatchPatternContext;
	public _value!: ExprContext;
	public _body!: BlockContentContext;
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public matchPattern(): MatchPatternContext {
		return this.getTypedRuleContext(MatchPatternContext, 0) as MatchPatternContext;
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public blockContent(): BlockContentContext {
		return this.getTypedRuleContext(BlockContentContext, 0) as BlockContentContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockContentLetExpr) {
	 		listener.enterBlockContentLetExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockContentLetExpr) {
	 		listener.exitBlockContentLetExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockContentLetExpr) {
			return visitor.visitBlockContentLetExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockContentLetHashExprContext extends BlockContentContext {
	public _mapper!: QualifiedIdContext;
	public _pattern!: MatchPatternContext;
	public _value!: ExprContext;
	public _body!: BlockContentContext;
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
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
	public blockContent(): BlockContentContext {
		return this.getTypedRuleContext(BlockContentContext, 0) as BlockContentContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockContentLetHashExpr) {
	 		listener.enterBlockContentLetHashExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockContentLetHashExpr) {
	 		listener.exitBlockContentLetHashExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockContentLetHashExpr) {
			return visitor.visitBlockContentLetHashExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BlockContentExprContext extends BlockContentContext {
	constructor(parser: KestrelParser, ctx: BlockContentContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterBlockContentExpr) {
	 		listener.enterBlockContentExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitBlockContentExpr) {
	 		listener.exitBlockContentExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitBlockContentExpr) {
			return visitor.visitBlockContentExpr(this);
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
	public copyFrom(ctx: MatchPatternContext): void {
		super.copyFrom(ctx);
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
export class ConsPatternContext extends MatchPatternContext {
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
	    if(listener.enterConsPattern) {
	 		listener.enterConsPattern(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitConsPattern) {
	 		listener.exitConsPattern(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitConsPattern) {
			return visitor.visitConsPattern(this);
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
