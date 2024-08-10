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
	public static readonly SLASH_4 = 49;
	public static readonly SLASH_3 = 50;
	public static readonly SLASH_2 = 51;
	public static readonly LineComment = 52;
	public static readonly EXPOSING_NESTED = 53;
	public static readonly INFIX_ID = 54;
	public static readonly ID = 55;
	public static readonly TYPE_ID = 56;
	public static readonly INT = 57;
	public static readonly CHAR = 58;
	public static readonly STRING = 59;
	public static readonly FLOAT = 60;
	public static readonly NEWLINE = 61;
	public static readonly WS = 62;
	public static readonly MODULEDOC_COMMENT_LINE = 63;
	public static readonly DOC_COMMENT_LINE = 64;
	public static readonly INFIX_CHAR = 65;
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
	public static readonly RULE_polyType = 13;
	public static readonly RULE_traitImplClause = 14;
	public static readonly RULE_type = 15;
	public static readonly RULE_fnTypeParams = 16;
	public static readonly RULE_typeConstructorDecl = 17;
	public static readonly RULE_qualifiedId = 18;
	public static readonly RULE_expr = 19;
	public static readonly RULE_matchClause = 20;
	public static readonly RULE_block = 21;
	public static readonly RULE_blockContent = 22;
	public static readonly RULE_matchPattern = 23;
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
                                                            "'!'", "'*'", 
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
                                                             null, "SLASH_4", 
                                                             "SLASH_3", 
                                                             "SLASH_2", 
                                                             "LineComment", 
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
		"polyType", "traitImplClause", "type", "fnTypeParams", "typeConstructorDecl", 
		"qualifiedId", "expr", "matchClause", "block", "blockContent", "matchPattern",
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
			this.state = 48;
			this.match(KestrelParser.TYPE_ID);
			this.state = 53;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 49;
				this.match(KestrelParser.T__0);
				this.state = 50;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 55;
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
			this.state = 59;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===63) {
				{
				{
				this.state = 56;
				localctx._doc = this.match(KestrelParser.MODULEDOC_COMMENT_LINE);
				}
				}
				this.state = 61;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 65;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 62;
				this.import_();
				}
				}
				this.state = 67;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 71;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 13184) !== 0) || _la===64) {
				{
				{
				this.state = 68;
				this.declaration();
				}
				}
				this.state = 73;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 74;
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
			this.state = 76;
			this.match(KestrelParser.T__1);
			this.state = 77;
			this.moduleNamespace();
			this.state = 90;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 78;
				this.match(KestrelParser.T__2);
				this.state = 79;
				this.match(KestrelParser.T__3);
				this.state = 80;
				this.importExposing();
				this.state = 85;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 81;
					this.match(KestrelParser.T__4);
					this.state = 82;
					this.importExposing();
					}
					}
					this.state = 87;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 88;
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
			this.state = 97;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 54:
			case 55:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 92;
				(localctx as ValueExposingContext)._name = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===54 || _la===55)) {
				    (localctx as ValueExposingContext)._name = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 56:
				localctx = new TypeExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 93;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 95;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===53) {
					{
					this.state = 94;
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
			this.state = 104;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 99;
				this.letDeclaration_();
				}
				break;
			case 2:
				localctx = new ExternLetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 100;
				this.externLetDeclaration_();
				}
				break;
			case 3:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 101;
				this.typeDeclaration_();
				}
				break;
			case 4:
				localctx = new StructDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 102;
				this.structDeclaration_();
				}
				break;
			case 5:
				localctx = new ExternTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 103;
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
			this.state = 109;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 106;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 111;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 113;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 112;
				localctx._inline = this.match(KestrelParser.T__6);
				}
			}

			{
			this.state = 116;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 115;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			}
			this.state = 118;
			this.match(KestrelParser.T__8);
			this.state = 119;
			this.match(KestrelParser.ID);
			this.state = 122;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 120;
				this.match(KestrelParser.T__9);
				this.state = 121;
				localctx._typeHint = this.polyType();
				}
			}

			this.state = 124;
			this.match(KestrelParser.T__10);
			this.state = 125;
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
			this.state = 130;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 127;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 132;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 133;
			this.match(KestrelParser.T__11);
			this.state = 135;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 134;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			this.state = 137;
			this.match(KestrelParser.T__8);
			{
			this.state = 138;
			localctx._binding = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===54 || _la===55)) {
			    localctx._binding = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
			this.state = 139;
			this.match(KestrelParser.T__9);
			this.state = 140;
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
			this.state = 145;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 142;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 147;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 149;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 148;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 151;
			this.match(KestrelParser.T__12);
			this.state = 152;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 154;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 153;
				this.paramsList();
				}
			}

			this.state = 156;
			this.match(KestrelParser.T__3);
			this.state = 158;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===56) {
				{
				this.state = 157;
				this.typeVariants();
				}
			}

			this.state = 160;
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
			this.state = 165;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
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
			this.state = 169;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 168;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 171;
			this.match(KestrelParser.T__12);
			this.state = 172;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 174;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 173;
				this.paramsList();
				}
			}

			this.state = 176;
			this.match(KestrelParser.T__13);
			this.state = 177;
			this.match(KestrelParser.T__3);
			this.state = 178;
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
			this.state = 183;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===64) {
				{
				{
				this.state = 180;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 185;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 186;
			this.match(KestrelParser.T__11);
			this.state = 188;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 187;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			this.state = 190;
			this.match(KestrelParser.T__12);
			this.state = 191;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 193;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===15) {
				{
				this.state = 192;
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
			this.state = 195;
			this.match(KestrelParser.T__7);
			this.state = 197;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===53) {
				{
				this.state = 196;
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
			this.state = 199;
			this.match(KestrelParser.T__14);
			this.state = 200;
			this.match(KestrelParser.ID);
			this.state = 205;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 201;
				this.match(KestrelParser.T__4);
				this.state = 202;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 207;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 208;
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
			this.state = 210;
			this.typeConstructorDecl();
			this.state = 215;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 211;
					this.match(KestrelParser.T__4);
					this.state = 212;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 217;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
			}
			this.state = 219;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 218;
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
		this.enterRule(localctx, 26, KestrelParser.RULE_polyType);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 221;
			this.type_();
			this.state = 231;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===17) {
				{
				this.state = 222;
				this.match(KestrelParser.T__16);
				this.state = 223;
				this.traitImplClause();
				this.state = 228;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 224;
					this.match(KestrelParser.T__4);
					this.state = 225;
					this.traitImplClause();
					}
					}
					this.state = 230;
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
		this.enterRule(localctx, 28, KestrelParser.RULE_traitImplClause);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 233;
			this.match(KestrelParser.ID);
			this.state = 234;
			this.match(KestrelParser.T__9);
			{
			this.state = 235;
			this.match(KestrelParser.TYPE_ID);
			this.state = 240;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===18) {
				{
				{
				this.state = 236;
				this.match(KestrelParser.T__17);
				this.state = 237;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 242;
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
		this.enterRule(localctx, 30, KestrelParser.RULE_type);
		let _la: number;
		try {
			this.state = 284;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 56:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 246;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 32, this._ctx) ) {
				case 1:
					{
					this.state = 243;
					this.moduleNamespace();
					this.state = 244;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 248;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 260;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===15) {
					{
					this.state = 249;
					this.match(KestrelParser.T__14);
					this.state = 250;
					this.type_();
					this.state = 255;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 251;
						this.match(KestrelParser.T__4);
						this.state = 252;
						this.type_();
						}
						}
						this.state = 257;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 258;
					this.match(KestrelParser.T__15);
					}
				}

				}
				break;
			case 19:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 262;
				this.match(KestrelParser.T__18);
				this.state = 263;
				this.match(KestrelParser.T__19);
				this.state = 265;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===19 || _la===20 || _la===55 || _la===56) {
					{
					this.state = 264;
					this.fnTypeParams();
					}
				}

				this.state = 267;
				this.match(KestrelParser.T__20);
				this.state = 268;
				this.match(KestrelParser.T__21);
				this.state = 269;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 55:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 270;
				this.match(KestrelParser.ID);
				}
				break;
			case 20:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 271;
				this.match(KestrelParser.T__19);
				this.state = 272;
				this.type_();
				this.state = 273;
				this.match(KestrelParser.T__4);
				this.state = 274;
				this.type_();
				this.state = 279;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 275;
					this.match(KestrelParser.T__4);
					this.state = 276;
					this.type_();
					}
					}
					this.state = 281;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 282;
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
		this.enterRule(localctx, 32, KestrelParser.RULE_fnTypeParams);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 286;
			this.type_();
			this.state = 291;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 287;
					this.match(KestrelParser.T__4);
					this.state = 288;
					this.type_();
					}
					}
				}
				this.state = 293;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 38, this._ctx);
			}
			this.state = 295;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 294;
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
		this.enterRule(localctx, 34, KestrelParser.RULE_typeConstructorDecl);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 297;
			localctx._name = this.match(KestrelParser.TYPE_ID);
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
		this.enterRule(localctx, 36, KestrelParser.RULE_qualifiedId);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 314;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				{
				this.state = 311;
				this.moduleNamespace();
				this.state = 312;
				this.match(KestrelParser.T__2);
				}
				break;
			}
			{
			this.state = 316;
			localctx._name = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===55 || _la===56)) {
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
		let _startState: number = 38;
		this.enterRecursionRule(localctx, 38, KestrelParser.RULE_expr, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 398;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 53, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 319;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 320;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 321;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 322;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 323;
				this.qualifiedId();
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 324;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__22);
				this.state = 325;
				this.expr(17);
				}
				break;
			case 7:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 326;
				this.match(KestrelParser.T__19);
				this.state = 327;
				this.expr(0);
				this.state = 328;
				this.match(KestrelParser.T__4);
				this.state = 329;
				this.expr(0);
				this.state = 334;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 330;
					this.match(KestrelParser.T__4);
					this.state = 331;
					this.expr(0);
					}
					}
					this.state = 336;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 337;
				this.match(KestrelParser.T__20);
				}
				break;
			case 8:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 339;
				this.match(KestrelParser.T__19);
				this.state = 340;
				this.expr(0);
				this.state = 341;
				this.match(KestrelParser.T__20);
				}
				break;
			case 9:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 343;
				this.block();
				}
				break;
			case 10:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 344;
				this.match(KestrelParser.T__38);
				this.state = 356;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===20 || ((((_la - 55)) & ~0x1F) === 0 && ((1 << (_la - 55)) & 63) !== 0)) {
					{
					this.state = 345;
					this.matchPattern(0);
					this.state = 350;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 44, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 346;
							this.match(KestrelParser.T__4);
							this.state = 347;
							this.matchPattern(0);
							}
							}
						}
						this.state = 352;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 44, this._ctx);
					}
					this.state = 354;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 353;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 358;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 359;
				this.match(KestrelParser.T__39);
				this.state = 360;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 361;
				(localctx as IfContext)._then = this.block();
				this.state = 362;
				this.match(KestrelParser.T__40);
				this.state = 363;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 12:
				{
				localctx = new MatchContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 365;
				this.match(KestrelParser.T__41);
				this.state = 366;
				(localctx as MatchContext)._matched = this.expr(0);
				this.state = 367;
				this.match(KestrelParser.T__3);
				this.state = 376;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===20 || ((((_la - 55)) & ~0x1F) === 0 && ((1 << (_la - 55)) & 63) !== 0)) {
					{
					this.state = 368;
					this.matchClause();
					this.state = 373;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 47, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 369;
							this.match(KestrelParser.T__4);
							this.state = 370;
							this.matchClause();
							}
							}
						}
						this.state = 375;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 47, this._ctx);
					}
					}
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

				this.state = 381;
				this.match(KestrelParser.T__5);
				}
				break;
			case 13:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 383;
				this.match(KestrelParser.T__42);
				this.state = 395;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 9437200) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & 4128795) !== 0)) {
					{
					this.state = 384;
					this.expr(0);
					this.state = 389;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 50, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 385;
							this.match(KestrelParser.T__4);
							this.state = 386;
							this.expr(0);
							}
							}
						}
						this.state = 391;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 50, this._ctx);
					}
					this.state = 393;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 392;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 397;
				this.match(KestrelParser.T__43);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 442;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 440;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 57, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 400;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 401;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 251658242) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 402;
						this.expr(16);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 403;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 404;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 4026793984) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 405;
						this.expr(15);
						}
						break;
					case 3:
						{
						localctx = new ConsContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 406;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 407;
						(localctx as ConsContext)._op = this.match(KestrelParser.T__31);
						this.state = 408;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 409;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 410;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===33 || _la===34)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 411;
						this.expr(13);
						}
						break;
					case 5:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 412;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 413;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 15)) & ~0x1F) === 0 && ((1 << (_la - 15)) & 3145731) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 414;
						this.expr(12);
						}
						break;
					case 6:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 415;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 416;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__36);
						this.state = 417;
						this.expr(11);
						}
						break;
					case 7:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 418;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 419;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__37);
						this.state = 420;
						this.expr(10);
						}
						break;
					case 8:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 421;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 422;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__44);
						this.state = 423;
						this.expr(2);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 424;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 425;
						this.match(KestrelParser.T__19);
						this.state = 437;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 9437200) !== 0) || ((((_la - 39)) & ~0x1F) === 0 && ((1 << (_la - 39)) & 4128795) !== 0)) {
							{
							this.state = 426;
							this.expr(0);
							this.state = 431;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 54, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 427;
									this.match(KestrelParser.T__4);
									this.state = 428;
									this.expr(0);
									}
									}
								}
								this.state = 433;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 54, this._ctx);
							}
							this.state = 435;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 434;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 439;
						this.match(KestrelParser.T__20);
						}
						break;
					}
					}
				}
				this.state = 444;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
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
		this.enterRule(localctx, 40, KestrelParser.RULE_matchClause);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 445;
			this.matchPattern(0);
			this.state = 446;
			this.match(KestrelParser.T__45);
			this.state = 447;
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
		this.enterRule(localctx, 42, KestrelParser.RULE_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 449;
			this.match(KestrelParser.T__3);
			this.state = 450;
			this.blockContent();
			this.state = 451;
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
		this.enterRule(localctx, 44, KestrelParser.RULE_blockContent);
		try {
			this.state = 469;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 20:
			case 23:
			case 39:
			case 40:
			case 42:
			case 43:
			case 55:
			case 56:
			case 57:
			case 58:
			case 59:
			case 60:
				localctx = new BlockContentExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 453;
				this.expr(0);
				}
				break;
			case 47:
				localctx = new BlockContentLetHashExprContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 454;
				this.match(KestrelParser.T__46);
				this.state = 455;
				(localctx as BlockContentLetHashExprContext)._mapper = this.qualifiedId();
				this.state = 456;
				(localctx as BlockContentLetHashExprContext)._pattern = this.matchPattern(0);
				this.state = 457;
				this.match(KestrelParser.T__10);
				this.state = 458;
				(localctx as BlockContentLetHashExprContext)._value = this.expr(0);
				this.state = 459;
				this.match(KestrelParser.T__47);
				this.state = 460;
				(localctx as BlockContentLetHashExprContext)._body = this.blockContent();
				}
				break;
			case 9:
				localctx = new BlockContentLetExprContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 462;
				this.match(KestrelParser.T__8);
				this.state = 463;
				(localctx as BlockContentLetExprContext)._pattern = this.matchPattern(0);
				this.state = 464;
				this.match(KestrelParser.T__10);
				this.state = 465;
				(localctx as BlockContentLetExprContext)._value = this.expr(0);
				this.state = 466;
				this.match(KestrelParser.T__47);
				this.state = 467;
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
		let _startState: number = 46;
		this.enterRecursionRule(localctx, 46, KestrelParser.RULE_matchPattern, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 509;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 55:
				{
				localctx = new MatchIdentContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 472;
				this.match(KestrelParser.ID);
				}
				break;
			case 56:
				{
				localctx = new ConstructorContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 476;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 60, this._ctx) ) {
				case 1:
					{
					this.state = 473;
					this.moduleNamespace();
					this.state = 474;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 478;
				(localctx as ConstructorContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 490;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 62, this._ctx) ) {
				case 1:
					{
					this.state = 479;
					this.match(KestrelParser.T__19);
					this.state = 480;
					this.matchPattern(0);
					this.state = 485;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 481;
						this.match(KestrelParser.T__4);
						this.state = 482;
						this.matchPattern(0);
						}
						}
						this.state = 487;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 488;
					this.match(KestrelParser.T__20);
					}
					break;
				}
				}
				break;
			case 57:
				{
				localctx = new IntPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 492;
				this.match(KestrelParser.INT);
				}
				break;
			case 60:
				{
				localctx = new FloatPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 493;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 58:
				{
				localctx = new CharPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 494;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 59:
				{
				localctx = new StringPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 495;
				this.match(KestrelParser.STRING);
				}
				break;
			case 20:
				{
				localctx = new TuplePatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 496;
				this.match(KestrelParser.T__19);
				this.state = 497;
				this.matchPattern(0);
				this.state = 498;
				this.match(KestrelParser.T__4);
				this.state = 499;
				this.matchPattern(0);
				this.state = 504;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 500;
					this.match(KestrelParser.T__4);
					this.state = 501;
					this.matchPattern(0);
					}
					}
					this.state = 506;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 507;
				this.match(KestrelParser.T__20);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 516;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
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
					this.state = 511;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 512;
					this.match(KestrelParser.T__31);
					this.state = 513;
					this.matchPattern(2);
					}
					}
				}
				this.state = 518;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
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
		case 19:
			return this.expr_sempred(localctx as ExprContext, predIndex);
		case 23:
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
			return this.precpred(this._ctx, 16);
		}
		return true;
	}
	private matchPattern_sempred(localctx: MatchPatternContext, predIndex: number): boolean {
		switch (predIndex) {
		case 9:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,65,520,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,1,0,1,
	0,1,0,5,0,52,8,0,10,0,12,0,55,9,0,1,1,5,1,58,8,1,10,1,12,1,61,9,1,1,1,5,
	1,64,8,1,10,1,12,1,67,9,1,1,1,5,1,70,8,1,10,1,12,1,73,9,1,1,1,1,1,1,2,1,
	2,1,2,1,2,1,2,1,2,1,2,5,2,84,8,2,10,2,12,2,87,9,2,1,2,1,2,3,2,91,8,2,1,
	3,1,3,1,3,3,3,96,8,3,3,3,98,8,3,1,4,1,4,1,4,1,4,1,4,3,4,105,8,4,1,5,5,5,
	108,8,5,10,5,12,5,111,9,5,1,5,3,5,114,8,5,1,5,3,5,117,8,5,1,5,1,5,1,5,1,
	5,3,5,123,8,5,1,5,1,5,1,5,1,6,5,6,129,8,6,10,6,12,6,132,9,6,1,6,1,6,3,6,
	136,8,6,1,6,1,6,1,6,1,6,1,6,1,7,5,7,144,8,7,10,7,12,7,147,9,7,1,7,3,7,150,
	8,7,1,7,1,7,1,7,3,7,155,8,7,1,7,1,7,3,7,159,8,7,1,7,1,7,1,8,5,8,164,8,8,
	10,8,12,8,167,9,8,1,8,3,8,170,8,8,1,8,1,8,1,8,3,8,175,8,8,1,8,1,8,1,8,1,
	8,1,9,5,9,182,8,9,10,9,12,9,185,9,9,1,9,1,9,3,9,189,8,9,1,9,1,9,1,9,3,9,
	194,8,9,1,10,1,10,3,10,198,8,10,1,11,1,11,1,11,1,11,5,11,204,8,11,10,11,
	12,11,207,9,11,1,11,1,11,1,12,1,12,1,12,5,12,214,8,12,10,12,12,12,217,9,
	12,1,12,3,12,220,8,12,1,13,1,13,1,13,1,13,1,13,5,13,227,8,13,10,13,12,13,
	230,9,13,3,13,232,8,13,1,14,1,14,1,14,1,14,1,14,5,14,239,8,14,10,14,12,
	14,242,9,14,1,15,1,15,1,15,3,15,247,8,15,1,15,1,15,1,15,1,15,1,15,5,15,
	254,8,15,10,15,12,15,257,9,15,1,15,1,15,3,15,261,8,15,1,15,1,15,1,15,3,
	15,266,8,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,5,15,278,
	8,15,10,15,12,15,281,9,15,1,15,1,15,3,15,285,8,15,1,16,1,16,1,16,5,16,290,
	8,16,10,16,12,16,293,9,16,1,16,3,16,296,8,16,1,17,1,17,1,17,1,17,1,17,5,
	17,303,8,17,10,17,12,17,306,9,17,1,17,1,17,3,17,310,8,17,1,18,1,18,1,18,
	3,18,315,8,18,1,18,1,18,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,
	19,1,19,1,19,1,19,1,19,5,19,333,8,19,10,19,12,19,336,9,19,1,19,1,19,1,19,
	1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,349,8,19,10,19,12,19,352,9,
	19,1,19,3,19,355,8,19,3,19,357,8,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,
	1,19,1,19,1,19,1,19,1,19,1,19,5,19,372,8,19,10,19,12,19,375,9,19,3,19,377,
	8,19,1,19,3,19,380,8,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,388,8,19,10,
	19,12,19,391,9,19,1,19,3,19,394,8,19,3,19,396,8,19,1,19,3,19,399,8,19,1,
	19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,
	1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,
	19,430,8,19,10,19,12,19,433,9,19,1,19,3,19,436,8,19,3,19,438,8,19,1,19,
	5,19,441,8,19,10,19,12,19,444,9,19,1,20,1,20,1,20,1,20,1,21,1,21,1,21,1,
	21,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,
	1,22,1,22,3,22,470,8,22,1,23,1,23,1,23,1,23,1,23,3,23,477,8,23,1,23,1,23,
	1,23,1,23,1,23,5,23,484,8,23,10,23,12,23,487,9,23,1,23,1,23,3,23,491,8,
	23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,503,8,23,10,23,
	12,23,506,9,23,1,23,1,23,3,23,510,8,23,1,23,1,23,1,23,5,23,515,8,23,10,
	23,12,23,518,9,23,1,23,0,2,38,46,24,0,2,4,6,8,10,12,14,16,18,20,22,24,26,
	28,30,32,34,36,38,40,42,44,46,0,6,1,0,54,55,1,0,55,56,2,0,1,1,24,27,2,0,
	18,18,28,31,1,0,33,34,2,0,15,16,35,36,590,0,48,1,0,0,0,2,59,1,0,0,0,4,76,
	1,0,0,0,6,97,1,0,0,0,8,104,1,0,0,0,10,109,1,0,0,0,12,130,1,0,0,0,14,145,
	1,0,0,0,16,165,1,0,0,0,18,183,1,0,0,0,20,195,1,0,0,0,22,199,1,0,0,0,24,
	210,1,0,0,0,26,221,1,0,0,0,28,233,1,0,0,0,30,284,1,0,0,0,32,286,1,0,0,0,
	34,297,1,0,0,0,36,314,1,0,0,0,38,398,1,0,0,0,40,445,1,0,0,0,42,449,1,0,
	0,0,44,469,1,0,0,0,46,509,1,0,0,0,48,53,5,56,0,0,49,50,5,1,0,0,50,52,5,
	56,0,0,51,49,1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,0,54,1,1,0,
	0,0,55,53,1,0,0,0,56,58,5,63,0,0,57,56,1,0,0,0,58,61,1,0,0,0,59,57,1,0,
	0,0,59,60,1,0,0,0,60,65,1,0,0,0,61,59,1,0,0,0,62,64,3,4,2,0,63,62,1,0,0,
	0,64,67,1,0,0,0,65,63,1,0,0,0,65,66,1,0,0,0,66,71,1,0,0,0,67,65,1,0,0,0,
	68,70,3,8,4,0,69,68,1,0,0,0,70,73,1,0,0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,
	74,1,0,0,0,73,71,1,0,0,0,74,75,5,0,0,1,75,3,1,0,0,0,76,77,5,2,0,0,77,90,
	3,0,0,0,78,79,5,3,0,0,79,80,5,4,0,0,80,85,3,6,3,0,81,82,5,5,0,0,82,84,3,
	6,3,0,83,81,1,0,0,0,84,87,1,0,0,0,85,83,1,0,0,0,85,86,1,0,0,0,86,88,1,0,
	0,0,87,85,1,0,0,0,88,89,5,6,0,0,89,91,1,0,0,0,90,78,1,0,0,0,90,91,1,0,0,
	0,91,5,1,0,0,0,92,98,7,0,0,0,93,95,5,56,0,0,94,96,5,53,0,0,95,94,1,0,0,
	0,95,96,1,0,0,0,96,98,1,0,0,0,97,92,1,0,0,0,97,93,1,0,0,0,98,7,1,0,0,0,
	99,105,3,10,5,0,100,105,3,12,6,0,101,105,3,14,7,0,102,105,3,16,8,0,103,
	105,3,18,9,0,104,99,1,0,0,0,104,100,1,0,0,0,104,101,1,0,0,0,104,102,1,0,
	0,0,104,103,1,0,0,0,105,9,1,0,0,0,106,108,5,64,0,0,107,106,1,0,0,0,108,
	111,1,0,0,0,109,107,1,0,0,0,109,110,1,0,0,0,110,113,1,0,0,0,111,109,1,0,
	0,0,112,114,5,7,0,0,113,112,1,0,0,0,113,114,1,0,0,0,114,116,1,0,0,0,115,
	117,5,8,0,0,116,115,1,0,0,0,116,117,1,0,0,0,117,118,1,0,0,0,118,119,5,9,
	0,0,119,122,5,55,0,0,120,121,5,10,0,0,121,123,3,26,13,0,122,120,1,0,0,0,
	122,123,1,0,0,0,123,124,1,0,0,0,124,125,5,11,0,0,125,126,3,38,19,0,126,
	11,1,0,0,0,127,129,5,64,0,0,128,127,1,0,0,0,129,132,1,0,0,0,130,128,1,0,
	0,0,130,131,1,0,0,0,131,133,1,0,0,0,132,130,1,0,0,0,133,135,5,12,0,0,134,
	136,5,8,0,0,135,134,1,0,0,0,135,136,1,0,0,0,136,137,1,0,0,0,137,138,5,9,
	0,0,138,139,7,0,0,0,139,140,5,10,0,0,140,141,3,26,13,0,141,13,1,0,0,0,142,
	144,5,64,0,0,143,142,1,0,0,0,144,147,1,0,0,0,145,143,1,0,0,0,145,146,1,
	0,0,0,146,149,1,0,0,0,147,145,1,0,0,0,148,150,3,20,10,0,149,148,1,0,0,0,
	149,150,1,0,0,0,150,151,1,0,0,0,151,152,5,13,0,0,152,154,5,56,0,0,153,155,
	3,22,11,0,154,153,1,0,0,0,154,155,1,0,0,0,155,156,1,0,0,0,156,158,5,4,0,
	0,157,159,3,24,12,0,158,157,1,0,0,0,158,159,1,0,0,0,159,160,1,0,0,0,160,
	161,5,6,0,0,161,15,1,0,0,0,162,164,5,64,0,0,163,162,1,0,0,0,164,167,1,0,
	0,0,165,163,1,0,0,0,165,166,1,0,0,0,166,169,1,0,0,0,167,165,1,0,0,0,168,
	170,3,20,10,0,169,168,1,0,0,0,169,170,1,0,0,0,170,171,1,0,0,0,171,172,5,
	13,0,0,172,174,5,56,0,0,173,175,3,22,11,0,174,173,1,0,0,0,174,175,1,0,0,
	0,175,176,1,0,0,0,176,177,5,14,0,0,177,178,5,4,0,0,178,179,5,6,0,0,179,
	17,1,0,0,0,180,182,5,64,0,0,181,180,1,0,0,0,182,185,1,0,0,0,183,181,1,0,
	0,0,183,184,1,0,0,0,184,186,1,0,0,0,185,183,1,0,0,0,186,188,5,12,0,0,187,
	189,5,8,0,0,188,187,1,0,0,0,188,189,1,0,0,0,189,190,1,0,0,0,190,191,5,13,
	0,0,191,193,5,56,0,0,192,194,3,22,11,0,193,192,1,0,0,0,193,194,1,0,0,0,
	194,19,1,0,0,0,195,197,5,8,0,0,196,198,5,53,0,0,197,196,1,0,0,0,197,198,
	1,0,0,0,198,21,1,0,0,0,199,200,5,15,0,0,200,205,5,55,0,0,201,202,5,5,0,
	0,202,204,5,55,0,0,203,201,1,0,0,0,204,207,1,0,0,0,205,203,1,0,0,0,205,
	206,1,0,0,0,206,208,1,0,0,0,207,205,1,0,0,0,208,209,5,16,0,0,209,23,1,0,
	0,0,210,215,3,34,17,0,211,212,5,5,0,0,212,214,3,34,17,0,213,211,1,0,0,0,
	214,217,1,0,0,0,215,213,1,0,0,0,215,216,1,0,0,0,216,219,1,0,0,0,217,215,
	1,0,0,0,218,220,5,5,0,0,219,218,1,0,0,0,219,220,1,0,0,0,220,25,1,0,0,0,
	221,231,3,30,15,0,222,223,5,17,0,0,223,228,3,28,14,0,224,225,5,5,0,0,225,
	227,3,28,14,0,226,224,1,0,0,0,227,230,1,0,0,0,228,226,1,0,0,0,228,229,1,
	0,0,0,229,232,1,0,0,0,230,228,1,0,0,0,231,222,1,0,0,0,231,232,1,0,0,0,232,
	27,1,0,0,0,233,234,5,55,0,0,234,235,5,10,0,0,235,240,5,56,0,0,236,237,5,
	18,0,0,237,239,5,56,0,0,238,236,1,0,0,0,239,242,1,0,0,0,240,238,1,0,0,0,
	240,241,1,0,0,0,241,29,1,0,0,0,242,240,1,0,0,0,243,244,3,0,0,0,244,245,
	5,3,0,0,245,247,1,0,0,0,246,243,1,0,0,0,246,247,1,0,0,0,247,248,1,0,0,0,
	248,260,5,56,0,0,249,250,5,15,0,0,250,255,3,30,15,0,251,252,5,5,0,0,252,
	254,3,30,15,0,253,251,1,0,0,0,254,257,1,0,0,0,255,253,1,0,0,0,255,256,1,
	0,0,0,256,258,1,0,0,0,257,255,1,0,0,0,258,259,5,16,0,0,259,261,1,0,0,0,
	260,249,1,0,0,0,260,261,1,0,0,0,261,285,1,0,0,0,262,263,5,19,0,0,263,265,
	5,20,0,0,264,266,3,32,16,0,265,264,1,0,0,0,265,266,1,0,0,0,266,267,1,0,
	0,0,267,268,5,21,0,0,268,269,5,22,0,0,269,285,3,30,15,0,270,285,5,55,0,
	0,271,272,5,20,0,0,272,273,3,30,15,0,273,274,5,5,0,0,274,279,3,30,15,0,
	275,276,5,5,0,0,276,278,3,30,15,0,277,275,1,0,0,0,278,281,1,0,0,0,279,277,
	1,0,0,0,279,280,1,0,0,0,280,282,1,0,0,0,281,279,1,0,0,0,282,283,5,21,0,
	0,283,285,1,0,0,0,284,246,1,0,0,0,284,262,1,0,0,0,284,270,1,0,0,0,284,271,
	1,0,0,0,285,31,1,0,0,0,286,291,3,30,15,0,287,288,5,5,0,0,288,290,3,30,15,
	0,289,287,1,0,0,0,290,293,1,0,0,0,291,289,1,0,0,0,291,292,1,0,0,0,292,295,
	1,0,0,0,293,291,1,0,0,0,294,296,5,5,0,0,295,294,1,0,0,0,295,296,1,0,0,0,
	296,33,1,0,0,0,297,309,5,56,0,0,298,299,5,20,0,0,299,304,3,30,15,0,300,
	301,5,5,0,0,301,303,3,30,15,0,302,300,1,0,0,0,303,306,1,0,0,0,304,302,1,
	0,0,0,304,305,1,0,0,0,305,307,1,0,0,0,306,304,1,0,0,0,307,308,5,21,0,0,
	308,310,1,0,0,0,309,298,1,0,0,0,309,310,1,0,0,0,310,35,1,0,0,0,311,312,
	3,0,0,0,312,313,5,3,0,0,313,315,1,0,0,0,314,311,1,0,0,0,314,315,1,0,0,0,
	315,316,1,0,0,0,316,317,7,1,0,0,317,37,1,0,0,0,318,319,6,19,-1,0,319,399,
	5,57,0,0,320,399,5,60,0,0,321,399,5,58,0,0,322,399,5,59,0,0,323,399,3,36,
	18,0,324,325,5,23,0,0,325,399,3,38,19,17,326,327,5,20,0,0,327,328,3,38,
	19,0,328,329,5,5,0,0,329,334,3,38,19,0,330,331,5,5,0,0,331,333,3,38,19,
	0,332,330,1,0,0,0,333,336,1,0,0,0,334,332,1,0,0,0,334,335,1,0,0,0,335,337,
	1,0,0,0,336,334,1,0,0,0,337,338,5,21,0,0,338,399,1,0,0,0,339,340,5,20,0,
	0,340,341,3,38,19,0,341,342,5,21,0,0,342,399,1,0,0,0,343,399,3,42,21,0,
	344,356,5,39,0,0,345,350,3,46,23,0,346,347,5,5,0,0,347,349,3,46,23,0,348,
	346,1,0,0,0,349,352,1,0,0,0,350,348,1,0,0,0,350,351,1,0,0,0,351,354,1,0,
	0,0,352,350,1,0,0,0,353,355,5,5,0,0,354,353,1,0,0,0,354,355,1,0,0,0,355,
	357,1,0,0,0,356,345,1,0,0,0,356,357,1,0,0,0,357,358,1,0,0,0,358,399,3,42,
	21,0,359,360,5,40,0,0,360,361,3,38,19,0,361,362,3,42,21,0,362,363,5,41,
	0,0,363,364,3,42,21,0,364,399,1,0,0,0,365,366,5,42,0,0,366,367,3,38,19,
	0,367,376,5,4,0,0,368,373,3,40,20,0,369,370,5,5,0,0,370,372,3,40,20,0,371,
	369,1,0,0,0,372,375,1,0,0,0,373,371,1,0,0,0,373,374,1,0,0,0,374,377,1,0,
	0,0,375,373,1,0,0,0,376,368,1,0,0,0,376,377,1,0,0,0,377,379,1,0,0,0,378,
	380,5,5,0,0,379,378,1,0,0,0,379,380,1,0,0,0,380,381,1,0,0,0,381,382,5,6,
	0,0,382,399,1,0,0,0,383,395,5,43,0,0,384,389,3,38,19,0,385,386,5,5,0,0,
	386,388,3,38,19,0,387,385,1,0,0,0,388,391,1,0,0,0,389,387,1,0,0,0,389,390,
	1,0,0,0,390,393,1,0,0,0,391,389,1,0,0,0,392,394,5,5,0,0,393,392,1,0,0,0,
	393,394,1,0,0,0,394,396,1,0,0,0,395,384,1,0,0,0,395,396,1,0,0,0,396,397,
	1,0,0,0,397,399,5,44,0,0,398,318,1,0,0,0,398,320,1,0,0,0,398,321,1,0,0,
	0,398,322,1,0,0,0,398,323,1,0,0,0,398,324,1,0,0,0,398,326,1,0,0,0,398,339,
	1,0,0,0,398,343,1,0,0,0,398,344,1,0,0,0,398,359,1,0,0,0,398,365,1,0,0,0,
	398,383,1,0,0,0,399,442,1,0,0,0,400,401,10,15,0,0,401,402,7,2,0,0,402,441,
	3,38,19,16,403,404,10,14,0,0,404,405,7,3,0,0,405,441,3,38,19,15,406,407,
	10,13,0,0,407,408,5,32,0,0,408,441,3,38,19,13,409,410,10,12,0,0,410,411,
	7,4,0,0,411,441,3,38,19,13,412,413,10,11,0,0,413,414,7,5,0,0,414,441,3,
	38,19,12,415,416,10,10,0,0,416,417,5,37,0,0,417,441,3,38,19,11,418,419,
	10,9,0,0,419,420,5,38,0,0,420,441,3,38,19,10,421,422,10,1,0,0,422,423,5,
	45,0,0,423,441,3,38,19,2,424,425,10,16,0,0,425,437,5,20,0,0,426,431,3,38,
	19,0,427,428,5,5,0,0,428,430,3,38,19,0,429,427,1,0,0,0,430,433,1,0,0,0,
	431,429,1,0,0,0,431,432,1,0,0,0,432,435,1,0,0,0,433,431,1,0,0,0,434,436,
	5,5,0,0,435,434,1,0,0,0,435,436,1,0,0,0,436,438,1,0,0,0,437,426,1,0,0,0,
	437,438,1,0,0,0,438,439,1,0,0,0,439,441,5,21,0,0,440,400,1,0,0,0,440,403,
	1,0,0,0,440,406,1,0,0,0,440,409,1,0,0,0,440,412,1,0,0,0,440,415,1,0,0,0,
	440,418,1,0,0,0,440,421,1,0,0,0,440,424,1,0,0,0,441,444,1,0,0,0,442,440,
	1,0,0,0,442,443,1,0,0,0,443,39,1,0,0,0,444,442,1,0,0,0,445,446,3,46,23,
	0,446,447,5,46,0,0,447,448,3,38,19,0,448,41,1,0,0,0,449,450,5,4,0,0,450,
	451,3,44,22,0,451,452,5,6,0,0,452,43,1,0,0,0,453,470,3,38,19,0,454,455,
	5,47,0,0,455,456,3,36,18,0,456,457,3,46,23,0,457,458,5,11,0,0,458,459,3,
	38,19,0,459,460,5,48,0,0,460,461,3,44,22,0,461,470,1,0,0,0,462,463,5,9,
	0,0,463,464,3,46,23,0,464,465,5,11,0,0,465,466,3,38,19,0,466,467,5,48,0,
	0,467,468,3,44,22,0,468,470,1,0,0,0,469,453,1,0,0,0,469,454,1,0,0,0,469,
	462,1,0,0,0,470,45,1,0,0,0,471,472,6,23,-1,0,472,510,5,55,0,0,473,474,3,
	0,0,0,474,475,5,3,0,0,475,477,1,0,0,0,476,473,1,0,0,0,476,477,1,0,0,0,477,
	478,1,0,0,0,478,490,5,56,0,0,479,480,5,20,0,0,480,485,3,46,23,0,481,482,
	5,5,0,0,482,484,3,46,23,0,483,481,1,0,0,0,484,487,1,0,0,0,485,483,1,0,0,
	0,485,486,1,0,0,0,486,488,1,0,0,0,487,485,1,0,0,0,488,489,5,21,0,0,489,
	491,1,0,0,0,490,479,1,0,0,0,490,491,1,0,0,0,491,510,1,0,0,0,492,510,5,57,
	0,0,493,510,5,60,0,0,494,510,5,58,0,0,495,510,5,59,0,0,496,497,5,20,0,0,
	497,498,3,46,23,0,498,499,5,5,0,0,499,504,3,46,23,0,500,501,5,5,0,0,501,
	503,3,46,23,0,502,500,1,0,0,0,503,506,1,0,0,0,504,502,1,0,0,0,504,505,1,
	0,0,0,505,507,1,0,0,0,506,504,1,0,0,0,507,508,5,21,0,0,508,510,1,0,0,0,
	509,471,1,0,0,0,509,476,1,0,0,0,509,492,1,0,0,0,509,493,1,0,0,0,509,494,
	1,0,0,0,509,495,1,0,0,0,509,496,1,0,0,0,510,516,1,0,0,0,511,512,10,2,0,
	0,512,513,5,32,0,0,513,515,3,46,23,2,514,511,1,0,0,0,515,518,1,0,0,0,516,
	514,1,0,0,0,516,517,1,0,0,0,517,47,1,0,0,0,518,516,1,0,0,0,66,53,59,65,
	71,85,90,95,97,104,109,113,116,122,130,135,145,149,154,158,165,169,174,
	183,188,193,197,205,215,219,228,231,240,246,255,260,265,279,284,291,295,
	304,309,314,334,350,354,356,373,376,379,389,393,395,398,431,435,437,440,
	442,469,476,485,490,504,509,516];

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
