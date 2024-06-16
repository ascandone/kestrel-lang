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
	public static readonly SLASH_4 = 48;
	public static readonly SLASH_3 = 49;
	public static readonly SLASH_2 = 50;
	public static readonly LineComment = 51;
	public static readonly EXPOSING_NESTED = 52;
	public static readonly INFIX_ID = 53;
	public static readonly ID = 54;
	public static readonly TYPE_ID = 55;
	public static readonly INT = 56;
	public static readonly CHAR = 57;
	public static readonly STRING = 58;
	public static readonly FLOAT = 59;
	public static readonly NEWLINE = 60;
	public static readonly WS = 61;
	public static readonly MODULEDOC_COMMENT_LINE = 62;
	public static readonly DOC_COMMENT_LINE = 63;
	public static readonly INFIX_CHAR = 64;
	public static readonly EOF = Token.EOF;
	public static readonly RULE_moduleNamespace = 0;
	public static readonly RULE_program = 1;
	public static readonly RULE_replInput = 2;
	public static readonly RULE_import_ = 3;
	public static readonly RULE_importExposing = 4;
	public static readonly RULE_declaration = 5;
	public static readonly RULE_letDeclaration_ = 6;
	public static readonly RULE_externLetDeclaration_ = 7;
	public static readonly RULE_typeDeclaration_ = 8;
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
                                                            "'type'", "'<'", 
                                                            "'>'", "'where'", 
                                                            "'+'", "'Fn'", 
                                                            "'('", "')'", 
                                                            "'->'", "'!'", 
                                                            "'*'", "'*.'", 
                                                            "'/.'", "'%'", 
                                                            "'-'", "'+.'", 
                                                            "'-.'", "'++'", 
                                                            "'::'", "'=='", 
                                                            "'!='", "'<='", 
                                                            "'>='", "'||'", 
                                                            "'&&'", "'fn'", 
                                                            "'if'", "'else'", 
                                                            "'match'", "'['", 
                                                            "']'", "'|>'", 
                                                            "'=>'", "'let#'", 
                                                            "';'", "'////'", 
                                                            "'///'", "'//'" ];
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
                                                             "SLASH_4", 
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
		"moduleNamespace", "program", "replInput", "import_", "importExposing", 
		"declaration", "letDeclaration_", "externLetDeclaration_", "typeDeclaration_", 
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
			while (_la===62) {
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
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 13184) !== 0) || _la===63) {
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
	public replInput(): ReplInputContext {
		let localctx: ReplInputContext = new ReplInputContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, KestrelParser.RULE_replInput);
		try {
			this.state = 80;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				localctx = new ReplExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 76;
				this.expr(0);
				}
				break;
			case 2:
				localctx = new ReplImportContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 77;
				this.import_();
				}
				break;
			case 3:
				localctx = new ReplDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 78;
				this.letDeclaration_();
				}
				break;
			case 4:
				localctx = new ReplTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 79;
				this.typeDeclaration_();
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
	public import_(): Import_Context {
		let localctx: Import_Context = new Import_Context(this, this._ctx, this.state);
		this.enterRule(localctx, 6, KestrelParser.RULE_import_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 82;
			this.match(KestrelParser.T__1);
			this.state = 83;
			this.moduleNamespace();
			this.state = 96;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 84;
				this.match(KestrelParser.T__2);
				this.state = 85;
				this.match(KestrelParser.T__3);
				this.state = 86;
				this.importExposing();
				this.state = 91;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 87;
					this.match(KestrelParser.T__4);
					this.state = 88;
					this.importExposing();
					}
					}
					this.state = 93;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 94;
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
		this.enterRule(localctx, 8, KestrelParser.RULE_importExposing);
		let _la: number;
		try {
			this.state = 103;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 53:
			case 54:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 98;
				(localctx as ValueExposingContext)._name = this._input.LT(1);
				_la = this._input.LA(1);
				if(!(_la===53 || _la===54)) {
				    (localctx as ValueExposingContext)._name = this._errHandler.recoverInline(this);
				}
				else {
					this._errHandler.reportMatch(this);
				    this.consume();
				}
				}
				break;
			case 55:
				localctx = new TypeExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 99;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 101;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===52) {
					{
					this.state = 100;
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
		this.enterRule(localctx, 10, KestrelParser.RULE_declaration);
		try {
			this.state = 109;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 105;
				this.letDeclaration_();
				}
				break;
			case 2:
				localctx = new ExternLetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 106;
				this.externLetDeclaration_();
				}
				break;
			case 3:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 107;
				this.typeDeclaration_();
				}
				break;
			case 4:
				localctx = new ExternTypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 108;
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
		this.enterRule(localctx, 12, KestrelParser.RULE_letDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 114;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===63) {
				{
				{
				this.state = 111;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 116;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 118;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===7) {
				{
				this.state = 117;
				localctx._inline = this.match(KestrelParser.T__6);
				}
			}

			{
			this.state = 121;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 120;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			}
			this.state = 123;
			this.match(KestrelParser.T__8);
			this.state = 124;
			this.match(KestrelParser.ID);
			this.state = 127;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 125;
				this.match(KestrelParser.T__9);
				this.state = 126;
				localctx._typeHint = this.polyType();
				}
			}

			this.state = 129;
			this.match(KestrelParser.T__10);
			this.state = 130;
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
		this.enterRule(localctx, 14, KestrelParser.RULE_externLetDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 135;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===63) {
				{
				{
				this.state = 132;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 137;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 138;
			this.match(KestrelParser.T__11);
			this.state = 140;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 139;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			this.state = 142;
			this.match(KestrelParser.T__8);
			{
			this.state = 143;
			localctx._binding = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===53 || _la===54)) {
			    localctx._binding = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
			this.state = 144;
			this.match(KestrelParser.T__9);
			this.state = 145;
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
		this.enterRule(localctx, 16, KestrelParser.RULE_typeDeclaration_);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 150;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===63) {
				{
				{
				this.state = 147;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 152;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 154;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 153;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 156;
			this.match(KestrelParser.T__12);
			this.state = 157;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 159;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14) {
				{
				this.state = 158;
				this.paramsList();
				}
			}

			this.state = 161;
			this.match(KestrelParser.T__3);
			this.state = 163;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===55) {
				{
				this.state = 162;
				this.typeVariants();
				}
			}

			this.state = 165;
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
			this.state = 170;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===63) {
				{
				{
				this.state = 167;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 172;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 173;
			this.match(KestrelParser.T__11);
			this.state = 175;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===8) {
				{
				this.state = 174;
				localctx._pub = this.match(KestrelParser.T__7);
				}
			}

			this.state = 177;
			this.match(KestrelParser.T__12);
			this.state = 178;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 180;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14) {
				{
				this.state = 179;
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
			this.state = 182;
			this.match(KestrelParser.T__7);
			this.state = 184;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===52) {
				{
				this.state = 183;
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
			this.state = 186;
			this.match(KestrelParser.T__13);
			this.state = 187;
			this.match(KestrelParser.ID);
			this.state = 192;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 188;
				this.match(KestrelParser.T__4);
				this.state = 189;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 194;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 195;
			this.match(KestrelParser.T__14);
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
			this.state = 197;
			this.typeConstructorDecl();
			this.state = 202;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 25, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 198;
					this.match(KestrelParser.T__4);
					this.state = 199;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 204;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 25, this._ctx);
			}
			this.state = 206;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 205;
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
			this.state = 208;
			this.type_();
			this.state = 218;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===16) {
				{
				this.state = 209;
				this.match(KestrelParser.T__15);
				this.state = 210;
				this.traitImplClause();
				this.state = 215;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 211;
					this.match(KestrelParser.T__4);
					this.state = 212;
					this.traitImplClause();
					}
					}
					this.state = 217;
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
			this.state = 220;
			this.match(KestrelParser.ID);
			this.state = 221;
			this.match(KestrelParser.T__9);
			{
			this.state = 222;
			this.match(KestrelParser.TYPE_ID);
			this.state = 227;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===17) {
				{
				{
				this.state = 223;
				this.match(KestrelParser.T__16);
				this.state = 224;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 229;
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
			this.state = 271;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 55:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 233;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 30, this._ctx) ) {
				case 1:
					{
					this.state = 230;
					this.moduleNamespace();
					this.state = 231;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 235;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 247;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 236;
					this.match(KestrelParser.T__13);
					this.state = 237;
					this.type_();
					this.state = 242;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 238;
						this.match(KestrelParser.T__4);
						this.state = 239;
						this.type_();
						}
						}
						this.state = 244;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 245;
					this.match(KestrelParser.T__14);
					}
				}

				}
				break;
			case 18:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 249;
				this.match(KestrelParser.T__17);
				this.state = 250;
				this.match(KestrelParser.T__18);
				this.state = 252;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===18 || _la===19 || _la===54 || _la===55) {
					{
					this.state = 251;
					this.fnTypeParams();
					}
				}

				this.state = 254;
				this.match(KestrelParser.T__19);
				this.state = 255;
				this.match(KestrelParser.T__20);
				this.state = 256;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 54:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 257;
				this.match(KestrelParser.ID);
				}
				break;
			case 19:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 258;
				this.match(KestrelParser.T__18);
				this.state = 259;
				this.type_();
				this.state = 260;
				this.match(KestrelParser.T__4);
				this.state = 261;
				this.type_();
				this.state = 266;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 262;
					this.match(KestrelParser.T__4);
					this.state = 263;
					this.type_();
					}
					}
					this.state = 268;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 269;
				this.match(KestrelParser.T__19);
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
			this.state = 273;
			this.type_();
			this.state = 278;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 36, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 274;
					this.match(KestrelParser.T__4);
					this.state = 275;
					this.type_();
					}
					}
				}
				this.state = 280;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 36, this._ctx);
			}
			this.state = 282;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 281;
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
			this.state = 284;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 296;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===19) {
				{
				this.state = 285;
				this.match(KestrelParser.T__18);
				this.state = 286;
				this.type_();
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 287;
					this.match(KestrelParser.T__4);
					this.state = 288;
					this.type_();
					}
					}
					this.state = 293;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 294;
				this.match(KestrelParser.T__19);
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
			this.state = 301;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				{
				this.state = 298;
				this.moduleNamespace();
				this.state = 299;
				this.match(KestrelParser.T__2);
				}
				break;
			}
			{
			this.state = 303;
			localctx._name = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===54 || _la===55)) {
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
			this.state = 385;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 51, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 306;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 307;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 308;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 309;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 310;
				this.qualifiedId();
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 311;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__21);
				this.state = 312;
				this.expr(17);
				}
				break;
			case 7:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 313;
				this.match(KestrelParser.T__18);
				this.state = 314;
				this.expr(0);
				this.state = 315;
				this.match(KestrelParser.T__4);
				this.state = 316;
				this.expr(0);
				this.state = 321;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 317;
					this.match(KestrelParser.T__4);
					this.state = 318;
					this.expr(0);
					}
					}
					this.state = 323;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 324;
				this.match(KestrelParser.T__19);
				}
				break;
			case 8:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 326;
				this.match(KestrelParser.T__18);
				this.state = 327;
				this.expr(0);
				this.state = 328;
				this.match(KestrelParser.T__19);
				}
				break;
			case 9:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 330;
				this.block();
				}
				break;
			case 10:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 331;
				this.match(KestrelParser.T__37);
				this.state = 343;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===19 || ((((_la - 54)) & ~0x1F) === 0 && ((1 << (_la - 54)) & 63) !== 0)) {
					{
					this.state = 332;
					this.matchPattern(0);
					this.state = 337;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 333;
							this.match(KestrelParser.T__4);
							this.state = 334;
							this.matchPattern(0);
							}
							}
						}
						this.state = 339;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
					}
					this.state = 341;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 340;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 345;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 346;
				this.match(KestrelParser.T__38);
				this.state = 347;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 348;
				(localctx as IfContext)._then = this.block();
				this.state = 349;
				this.match(KestrelParser.T__39);
				this.state = 350;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 12:
				{
				localctx = new MatchContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 352;
				this.match(KestrelParser.T__40);
				this.state = 353;
				(localctx as MatchContext)._matched = this.expr(0);
				this.state = 354;
				this.match(KestrelParser.T__3);
				this.state = 363;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===19 || ((((_la - 54)) & ~0x1F) === 0 && ((1 << (_la - 54)) & 63) !== 0)) {
					{
					this.state = 355;
					this.matchClause();
					this.state = 360;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 356;
							this.match(KestrelParser.T__4);
							this.state = 357;
							this.matchClause();
							}
							}
						}
						this.state = 362;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 45, this._ctx);
					}
					}
				}

				this.state = 366;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===5) {
					{
					this.state = 365;
					this.match(KestrelParser.T__4);
					}
				}

				this.state = 368;
				this.match(KestrelParser.T__5);
				}
				break;
			case 13:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 370;
				this.match(KestrelParser.T__41);
				this.state = 382;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4718608) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 4128795) !== 0)) {
					{
					this.state = 371;
					this.expr(0);
					this.state = 376;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 48, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 372;
							this.match(KestrelParser.T__4);
							this.state = 373;
							this.expr(0);
							}
							}
						}
						this.state = 378;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 48, this._ctx);
					}
					this.state = 380;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 379;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 384;
				this.match(KestrelParser.T__42);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 429;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 427;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 55, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 387;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 388;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 125829122) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 389;
						this.expr(16);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 390;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 391;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2013396992) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 392;
						this.expr(15);
						}
						break;
					case 3:
						{
						localctx = new ConsContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 393;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 394;
						(localctx as ConsContext)._op = this.match(KestrelParser.T__30);
						this.state = 395;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 396;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 397;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===32 || _la===33)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 398;
						this.expr(13);
						}
						break;
					case 5:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 399;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 400;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 14)) & ~0x1F) === 0 && ((1 << (_la - 14)) & 3145731) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 401;
						this.expr(12);
						}
						break;
					case 6:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 402;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 403;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__35);
						this.state = 404;
						this.expr(11);
						}
						break;
					case 7:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 405;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 406;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__36);
						this.state = 407;
						this.expr(10);
						}
						break;
					case 8:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 408;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 409;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__43);
						this.state = 410;
						this.expr(2);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 411;
						if (!(this.precpred(this._ctx, 16))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 16)");
						}
						this.state = 412;
						this.match(KestrelParser.T__18);
						this.state = 424;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 4718608) !== 0) || ((((_la - 38)) & ~0x1F) === 0 && ((1 << (_la - 38)) & 4128795) !== 0)) {
							{
							this.state = 413;
							this.expr(0);
							this.state = 418;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 52, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 414;
									this.match(KestrelParser.T__4);
									this.state = 415;
									this.expr(0);
									}
									}
								}
								this.state = 420;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 52, this._ctx);
							}
							this.state = 422;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 421;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 426;
						this.match(KestrelParser.T__19);
						}
						break;
					}
					}
				}
				this.state = 431;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
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
			this.state = 432;
			this.matchPattern(0);
			this.state = 433;
			this.match(KestrelParser.T__44);
			this.state = 434;
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
			this.state = 436;
			this.match(KestrelParser.T__3);
			this.state = 437;
			this.blockContent();
			this.state = 438;
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
			this.state = 456;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 19:
			case 22:
			case 38:
			case 39:
			case 41:
			case 42:
			case 54:
			case 55:
			case 56:
			case 57:
			case 58:
			case 59:
				localctx = new BlockContentExprContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 440;
				this.expr(0);
				}
				break;
			case 46:
				localctx = new BlockContentLetHashExprContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 441;
				this.match(KestrelParser.T__45);
				this.state = 442;
				(localctx as BlockContentLetHashExprContext)._mapper = this.qualifiedId();
				this.state = 443;
				(localctx as BlockContentLetHashExprContext)._pattern = this.matchPattern(0);
				this.state = 444;
				this.match(KestrelParser.T__10);
				this.state = 445;
				(localctx as BlockContentLetHashExprContext)._value = this.expr(0);
				this.state = 446;
				this.match(KestrelParser.T__46);
				this.state = 447;
				(localctx as BlockContentLetHashExprContext)._body = this.blockContent();
				}
				break;
			case 9:
				localctx = new BlockContentLetExprContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 449;
				this.match(KestrelParser.T__8);
				this.state = 450;
				(localctx as BlockContentLetExprContext)._pattern = this.matchPattern(0);
				this.state = 451;
				this.match(KestrelParser.T__10);
				this.state = 452;
				(localctx as BlockContentLetExprContext)._value = this.expr(0);
				this.state = 453;
				this.match(KestrelParser.T__46);
				this.state = 454;
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
			this.state = 496;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 54:
				{
				localctx = new MatchIdentContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 459;
				this.match(KestrelParser.ID);
				}
				break;
			case 55:
				{
				localctx = new ConstructorContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 463;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 58, this._ctx) ) {
				case 1:
					{
					this.state = 460;
					this.moduleNamespace();
					this.state = 461;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 465;
				(localctx as ConstructorContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 477;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 60, this._ctx) ) {
				case 1:
					{
					this.state = 466;
					this.match(KestrelParser.T__18);
					this.state = 467;
					this.matchPattern(0);
					this.state = 472;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 468;
						this.match(KestrelParser.T__4);
						this.state = 469;
						this.matchPattern(0);
						}
						}
						this.state = 474;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 475;
					this.match(KestrelParser.T__19);
					}
					break;
				}
				}
				break;
			case 56:
				{
				localctx = new IntPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 479;
				this.match(KestrelParser.INT);
				}
				break;
			case 59:
				{
				localctx = new FloatPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 480;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 57:
				{
				localctx = new CharPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 481;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 58:
				{
				localctx = new StringPatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 482;
				this.match(KestrelParser.STRING);
				}
				break;
			case 19:
				{
				localctx = new TuplePatternContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 483;
				this.match(KestrelParser.T__18);
				this.state = 484;
				this.matchPattern(0);
				this.state = 485;
				this.match(KestrelParser.T__4);
				this.state = 486;
				this.matchPattern(0);
				this.state = 491;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 487;
					this.match(KestrelParser.T__4);
					this.state = 488;
					this.matchPattern(0);
					}
					}
					this.state = 493;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 494;
				this.match(KestrelParser.T__19);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 503;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
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
					this.state = 498;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 499;
					this.match(KestrelParser.T__30);
					this.state = 500;
					this.matchPattern(2);
					}
					}
				}
				this.state = 505;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
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

	public static readonly _serializedATN: number[] = [4,1,64,507,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,1,0,1,
	0,1,0,5,0,52,8,0,10,0,12,0,55,9,0,1,1,5,1,58,8,1,10,1,12,1,61,9,1,1,1,5,
	1,64,8,1,10,1,12,1,67,9,1,1,1,5,1,70,8,1,10,1,12,1,73,9,1,1,1,1,1,1,2,1,
	2,1,2,1,2,3,2,81,8,2,1,3,1,3,1,3,1,3,1,3,1,3,1,3,5,3,90,8,3,10,3,12,3,93,
	9,3,1,3,1,3,3,3,97,8,3,1,4,1,4,1,4,3,4,102,8,4,3,4,104,8,4,1,5,1,5,1,5,
	1,5,3,5,110,8,5,1,6,5,6,113,8,6,10,6,12,6,116,9,6,1,6,3,6,119,8,6,1,6,3,
	6,122,8,6,1,6,1,6,1,6,1,6,3,6,128,8,6,1,6,1,6,1,6,1,7,5,7,134,8,7,10,7,
	12,7,137,9,7,1,7,1,7,3,7,141,8,7,1,7,1,7,1,7,1,7,1,7,1,8,5,8,149,8,8,10,
	8,12,8,152,9,8,1,8,3,8,155,8,8,1,8,1,8,1,8,3,8,160,8,8,1,8,1,8,3,8,164,
	8,8,1,8,1,8,1,9,5,9,169,8,9,10,9,12,9,172,9,9,1,9,1,9,3,9,176,8,9,1,9,1,
	9,1,9,3,9,181,8,9,1,10,1,10,3,10,185,8,10,1,11,1,11,1,11,1,11,5,11,191,
	8,11,10,11,12,11,194,9,11,1,11,1,11,1,12,1,12,1,12,5,12,201,8,12,10,12,
	12,12,204,9,12,1,12,3,12,207,8,12,1,13,1,13,1,13,1,13,1,13,5,13,214,8,13,
	10,13,12,13,217,9,13,3,13,219,8,13,1,14,1,14,1,14,1,14,1,14,5,14,226,8,
	14,10,14,12,14,229,9,14,1,15,1,15,1,15,3,15,234,8,15,1,15,1,15,1,15,1,15,
	1,15,5,15,241,8,15,10,15,12,15,244,9,15,1,15,1,15,3,15,248,8,15,1,15,1,
	15,1,15,3,15,253,8,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,1,15,
	5,15,265,8,15,10,15,12,15,268,9,15,1,15,1,15,3,15,272,8,15,1,16,1,16,1,
	16,5,16,277,8,16,10,16,12,16,280,9,16,1,16,3,16,283,8,16,1,17,1,17,1,17,
	1,17,1,17,5,17,290,8,17,10,17,12,17,293,9,17,1,17,1,17,3,17,297,8,17,1,
	18,1,18,1,18,3,18,302,8,18,1,18,1,18,1,19,1,19,1,19,1,19,1,19,1,19,1,19,
	1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,320,8,19,10,19,12,19,323,9,19,1,
	19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,336,8,19,10,19,
	12,19,339,9,19,1,19,3,19,342,8,19,3,19,344,8,19,1,19,1,19,1,19,1,19,1,19,
	1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,359,8,19,10,19,12,19,362,9,
	19,3,19,364,8,19,1,19,3,19,367,8,19,1,19,1,19,1,19,1,19,1,19,1,19,5,19,
	375,8,19,10,19,12,19,378,9,19,1,19,3,19,381,8,19,3,19,383,8,19,1,19,3,19,
	386,8,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,
	19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,1,19,
	1,19,1,19,5,19,417,8,19,10,19,12,19,420,9,19,1,19,3,19,423,8,19,3,19,425,
	8,19,1,19,5,19,428,8,19,10,19,12,19,431,9,19,1,20,1,20,1,20,1,20,1,21,1,
	21,1,21,1,21,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,
	1,22,1,22,1,22,1,22,3,22,457,8,22,1,23,1,23,1,23,1,23,1,23,3,23,464,8,23,
	1,23,1,23,1,23,1,23,1,23,5,23,471,8,23,10,23,12,23,474,9,23,1,23,1,23,3,
	23,478,8,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,490,
	8,23,10,23,12,23,493,9,23,1,23,1,23,3,23,497,8,23,1,23,1,23,1,23,5,23,502,
	8,23,10,23,12,23,505,9,23,1,23,0,2,38,46,24,0,2,4,6,8,10,12,14,16,18,20,
	22,24,26,28,30,32,34,36,38,40,42,44,46,0,6,1,0,53,54,1,0,54,55,2,0,1,1,
	23,26,2,0,17,17,27,30,1,0,32,33,2,0,14,15,34,35,576,0,48,1,0,0,0,2,59,1,
	0,0,0,4,80,1,0,0,0,6,82,1,0,0,0,8,103,1,0,0,0,10,109,1,0,0,0,12,114,1,0,
	0,0,14,135,1,0,0,0,16,150,1,0,0,0,18,170,1,0,0,0,20,182,1,0,0,0,22,186,
	1,0,0,0,24,197,1,0,0,0,26,208,1,0,0,0,28,220,1,0,0,0,30,271,1,0,0,0,32,
	273,1,0,0,0,34,284,1,0,0,0,36,301,1,0,0,0,38,385,1,0,0,0,40,432,1,0,0,0,
	42,436,1,0,0,0,44,456,1,0,0,0,46,496,1,0,0,0,48,53,5,55,0,0,49,50,5,1,0,
	0,50,52,5,55,0,0,51,49,1,0,0,0,52,55,1,0,0,0,53,51,1,0,0,0,53,54,1,0,0,
	0,54,1,1,0,0,0,55,53,1,0,0,0,56,58,5,62,0,0,57,56,1,0,0,0,58,61,1,0,0,0,
	59,57,1,0,0,0,59,60,1,0,0,0,60,65,1,0,0,0,61,59,1,0,0,0,62,64,3,6,3,0,63,
	62,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,65,66,1,0,0,0,66,71,1,0,0,0,67,65,
	1,0,0,0,68,70,3,10,5,0,69,68,1,0,0,0,70,73,1,0,0,0,71,69,1,0,0,0,71,72,
	1,0,0,0,72,74,1,0,0,0,73,71,1,0,0,0,74,75,5,0,0,1,75,3,1,0,0,0,76,81,3,
	38,19,0,77,81,3,6,3,0,78,81,3,12,6,0,79,81,3,16,8,0,80,76,1,0,0,0,80,77,
	1,0,0,0,80,78,1,0,0,0,80,79,1,0,0,0,81,5,1,0,0,0,82,83,5,2,0,0,83,96,3,
	0,0,0,84,85,5,3,0,0,85,86,5,4,0,0,86,91,3,8,4,0,87,88,5,5,0,0,88,90,3,8,
	4,0,89,87,1,0,0,0,90,93,1,0,0,0,91,89,1,0,0,0,91,92,1,0,0,0,92,94,1,0,0,
	0,93,91,1,0,0,0,94,95,5,6,0,0,95,97,1,0,0,0,96,84,1,0,0,0,96,97,1,0,0,0,
	97,7,1,0,0,0,98,104,7,0,0,0,99,101,5,55,0,0,100,102,5,52,0,0,101,100,1,
	0,0,0,101,102,1,0,0,0,102,104,1,0,0,0,103,98,1,0,0,0,103,99,1,0,0,0,104,
	9,1,0,0,0,105,110,3,12,6,0,106,110,3,14,7,0,107,110,3,16,8,0,108,110,3,
	18,9,0,109,105,1,0,0,0,109,106,1,0,0,0,109,107,1,0,0,0,109,108,1,0,0,0,
	110,11,1,0,0,0,111,113,5,63,0,0,112,111,1,0,0,0,113,116,1,0,0,0,114,112,
	1,0,0,0,114,115,1,0,0,0,115,118,1,0,0,0,116,114,1,0,0,0,117,119,5,7,0,0,
	118,117,1,0,0,0,118,119,1,0,0,0,119,121,1,0,0,0,120,122,5,8,0,0,121,120,
	1,0,0,0,121,122,1,0,0,0,122,123,1,0,0,0,123,124,5,9,0,0,124,127,5,54,0,
	0,125,126,5,10,0,0,126,128,3,26,13,0,127,125,1,0,0,0,127,128,1,0,0,0,128,
	129,1,0,0,0,129,130,5,11,0,0,130,131,3,38,19,0,131,13,1,0,0,0,132,134,5,
	63,0,0,133,132,1,0,0,0,134,137,1,0,0,0,135,133,1,0,0,0,135,136,1,0,0,0,
	136,138,1,0,0,0,137,135,1,0,0,0,138,140,5,12,0,0,139,141,5,8,0,0,140,139,
	1,0,0,0,140,141,1,0,0,0,141,142,1,0,0,0,142,143,5,9,0,0,143,144,7,0,0,0,
	144,145,5,10,0,0,145,146,3,26,13,0,146,15,1,0,0,0,147,149,5,63,0,0,148,
	147,1,0,0,0,149,152,1,0,0,0,150,148,1,0,0,0,150,151,1,0,0,0,151,154,1,0,
	0,0,152,150,1,0,0,0,153,155,3,20,10,0,154,153,1,0,0,0,154,155,1,0,0,0,155,
	156,1,0,0,0,156,157,5,13,0,0,157,159,5,55,0,0,158,160,3,22,11,0,159,158,
	1,0,0,0,159,160,1,0,0,0,160,161,1,0,0,0,161,163,5,4,0,0,162,164,3,24,12,
	0,163,162,1,0,0,0,163,164,1,0,0,0,164,165,1,0,0,0,165,166,5,6,0,0,166,17,
	1,0,0,0,167,169,5,63,0,0,168,167,1,0,0,0,169,172,1,0,0,0,170,168,1,0,0,
	0,170,171,1,0,0,0,171,173,1,0,0,0,172,170,1,0,0,0,173,175,5,12,0,0,174,
	176,5,8,0,0,175,174,1,0,0,0,175,176,1,0,0,0,176,177,1,0,0,0,177,178,5,13,
	0,0,178,180,5,55,0,0,179,181,3,22,11,0,180,179,1,0,0,0,180,181,1,0,0,0,
	181,19,1,0,0,0,182,184,5,8,0,0,183,185,5,52,0,0,184,183,1,0,0,0,184,185,
	1,0,0,0,185,21,1,0,0,0,186,187,5,14,0,0,187,192,5,54,0,0,188,189,5,5,0,
	0,189,191,5,54,0,0,190,188,1,0,0,0,191,194,1,0,0,0,192,190,1,0,0,0,192,
	193,1,0,0,0,193,195,1,0,0,0,194,192,1,0,0,0,195,196,5,15,0,0,196,23,1,0,
	0,0,197,202,3,34,17,0,198,199,5,5,0,0,199,201,3,34,17,0,200,198,1,0,0,0,
	201,204,1,0,0,0,202,200,1,0,0,0,202,203,1,0,0,0,203,206,1,0,0,0,204,202,
	1,0,0,0,205,207,5,5,0,0,206,205,1,0,0,0,206,207,1,0,0,0,207,25,1,0,0,0,
	208,218,3,30,15,0,209,210,5,16,0,0,210,215,3,28,14,0,211,212,5,5,0,0,212,
	214,3,28,14,0,213,211,1,0,0,0,214,217,1,0,0,0,215,213,1,0,0,0,215,216,1,
	0,0,0,216,219,1,0,0,0,217,215,1,0,0,0,218,209,1,0,0,0,218,219,1,0,0,0,219,
	27,1,0,0,0,220,221,5,54,0,0,221,222,5,10,0,0,222,227,5,55,0,0,223,224,5,
	17,0,0,224,226,5,55,0,0,225,223,1,0,0,0,226,229,1,0,0,0,227,225,1,0,0,0,
	227,228,1,0,0,0,228,29,1,0,0,0,229,227,1,0,0,0,230,231,3,0,0,0,231,232,
	5,3,0,0,232,234,1,0,0,0,233,230,1,0,0,0,233,234,1,0,0,0,234,235,1,0,0,0,
	235,247,5,55,0,0,236,237,5,14,0,0,237,242,3,30,15,0,238,239,5,5,0,0,239,
	241,3,30,15,0,240,238,1,0,0,0,241,244,1,0,0,0,242,240,1,0,0,0,242,243,1,
	0,0,0,243,245,1,0,0,0,244,242,1,0,0,0,245,246,5,15,0,0,246,248,1,0,0,0,
	247,236,1,0,0,0,247,248,1,0,0,0,248,272,1,0,0,0,249,250,5,18,0,0,250,252,
	5,19,0,0,251,253,3,32,16,0,252,251,1,0,0,0,252,253,1,0,0,0,253,254,1,0,
	0,0,254,255,5,20,0,0,255,256,5,21,0,0,256,272,3,30,15,0,257,272,5,54,0,
	0,258,259,5,19,0,0,259,260,3,30,15,0,260,261,5,5,0,0,261,266,3,30,15,0,
	262,263,5,5,0,0,263,265,3,30,15,0,264,262,1,0,0,0,265,268,1,0,0,0,266,264,
	1,0,0,0,266,267,1,0,0,0,267,269,1,0,0,0,268,266,1,0,0,0,269,270,5,20,0,
	0,270,272,1,0,0,0,271,233,1,0,0,0,271,249,1,0,0,0,271,257,1,0,0,0,271,258,
	1,0,0,0,272,31,1,0,0,0,273,278,3,30,15,0,274,275,5,5,0,0,275,277,3,30,15,
	0,276,274,1,0,0,0,277,280,1,0,0,0,278,276,1,0,0,0,278,279,1,0,0,0,279,282,
	1,0,0,0,280,278,1,0,0,0,281,283,5,5,0,0,282,281,1,0,0,0,282,283,1,0,0,0,
	283,33,1,0,0,0,284,296,5,55,0,0,285,286,5,19,0,0,286,291,3,30,15,0,287,
	288,5,5,0,0,288,290,3,30,15,0,289,287,1,0,0,0,290,293,1,0,0,0,291,289,1,
	0,0,0,291,292,1,0,0,0,292,294,1,0,0,0,293,291,1,0,0,0,294,295,5,20,0,0,
	295,297,1,0,0,0,296,285,1,0,0,0,296,297,1,0,0,0,297,35,1,0,0,0,298,299,
	3,0,0,0,299,300,5,3,0,0,300,302,1,0,0,0,301,298,1,0,0,0,301,302,1,0,0,0,
	302,303,1,0,0,0,303,304,7,1,0,0,304,37,1,0,0,0,305,306,6,19,-1,0,306,386,
	5,56,0,0,307,386,5,59,0,0,308,386,5,57,0,0,309,386,5,58,0,0,310,386,3,36,
	18,0,311,312,5,22,0,0,312,386,3,38,19,17,313,314,5,19,0,0,314,315,3,38,
	19,0,315,316,5,5,0,0,316,321,3,38,19,0,317,318,5,5,0,0,318,320,3,38,19,
	0,319,317,1,0,0,0,320,323,1,0,0,0,321,319,1,0,0,0,321,322,1,0,0,0,322,324,
	1,0,0,0,323,321,1,0,0,0,324,325,5,20,0,0,325,386,1,0,0,0,326,327,5,19,0,
	0,327,328,3,38,19,0,328,329,5,20,0,0,329,386,1,0,0,0,330,386,3,42,21,0,
	331,343,5,38,0,0,332,337,3,46,23,0,333,334,5,5,0,0,334,336,3,46,23,0,335,
	333,1,0,0,0,336,339,1,0,0,0,337,335,1,0,0,0,337,338,1,0,0,0,338,341,1,0,
	0,0,339,337,1,0,0,0,340,342,5,5,0,0,341,340,1,0,0,0,341,342,1,0,0,0,342,
	344,1,0,0,0,343,332,1,0,0,0,343,344,1,0,0,0,344,345,1,0,0,0,345,386,3,42,
	21,0,346,347,5,39,0,0,347,348,3,38,19,0,348,349,3,42,21,0,349,350,5,40,
	0,0,350,351,3,42,21,0,351,386,1,0,0,0,352,353,5,41,0,0,353,354,3,38,19,
	0,354,363,5,4,0,0,355,360,3,40,20,0,356,357,5,5,0,0,357,359,3,40,20,0,358,
	356,1,0,0,0,359,362,1,0,0,0,360,358,1,0,0,0,360,361,1,0,0,0,361,364,1,0,
	0,0,362,360,1,0,0,0,363,355,1,0,0,0,363,364,1,0,0,0,364,366,1,0,0,0,365,
	367,5,5,0,0,366,365,1,0,0,0,366,367,1,0,0,0,367,368,1,0,0,0,368,369,5,6,
	0,0,369,386,1,0,0,0,370,382,5,42,0,0,371,376,3,38,19,0,372,373,5,5,0,0,
	373,375,3,38,19,0,374,372,1,0,0,0,375,378,1,0,0,0,376,374,1,0,0,0,376,377,
	1,0,0,0,377,380,1,0,0,0,378,376,1,0,0,0,379,381,5,5,0,0,380,379,1,0,0,0,
	380,381,1,0,0,0,381,383,1,0,0,0,382,371,1,0,0,0,382,383,1,0,0,0,383,384,
	1,0,0,0,384,386,5,43,0,0,385,305,1,0,0,0,385,307,1,0,0,0,385,308,1,0,0,
	0,385,309,1,0,0,0,385,310,1,0,0,0,385,311,1,0,0,0,385,313,1,0,0,0,385,326,
	1,0,0,0,385,330,1,0,0,0,385,331,1,0,0,0,385,346,1,0,0,0,385,352,1,0,0,0,
	385,370,1,0,0,0,386,429,1,0,0,0,387,388,10,15,0,0,388,389,7,2,0,0,389,428,
	3,38,19,16,390,391,10,14,0,0,391,392,7,3,0,0,392,428,3,38,19,15,393,394,
	10,13,0,0,394,395,5,31,0,0,395,428,3,38,19,13,396,397,10,12,0,0,397,398,
	7,4,0,0,398,428,3,38,19,13,399,400,10,11,0,0,400,401,7,5,0,0,401,428,3,
	38,19,12,402,403,10,10,0,0,403,404,5,36,0,0,404,428,3,38,19,11,405,406,
	10,9,0,0,406,407,5,37,0,0,407,428,3,38,19,10,408,409,10,1,0,0,409,410,5,
	44,0,0,410,428,3,38,19,2,411,412,10,16,0,0,412,424,5,19,0,0,413,418,3,38,
	19,0,414,415,5,5,0,0,415,417,3,38,19,0,416,414,1,0,0,0,417,420,1,0,0,0,
	418,416,1,0,0,0,418,419,1,0,0,0,419,422,1,0,0,0,420,418,1,0,0,0,421,423,
	5,5,0,0,422,421,1,0,0,0,422,423,1,0,0,0,423,425,1,0,0,0,424,413,1,0,0,0,
	424,425,1,0,0,0,425,426,1,0,0,0,426,428,5,20,0,0,427,387,1,0,0,0,427,390,
	1,0,0,0,427,393,1,0,0,0,427,396,1,0,0,0,427,399,1,0,0,0,427,402,1,0,0,0,
	427,405,1,0,0,0,427,408,1,0,0,0,427,411,1,0,0,0,428,431,1,0,0,0,429,427,
	1,0,0,0,429,430,1,0,0,0,430,39,1,0,0,0,431,429,1,0,0,0,432,433,3,46,23,
	0,433,434,5,45,0,0,434,435,3,38,19,0,435,41,1,0,0,0,436,437,5,4,0,0,437,
	438,3,44,22,0,438,439,5,6,0,0,439,43,1,0,0,0,440,457,3,38,19,0,441,442,
	5,46,0,0,442,443,3,36,18,0,443,444,3,46,23,0,444,445,5,11,0,0,445,446,3,
	38,19,0,446,447,5,47,0,0,447,448,3,44,22,0,448,457,1,0,0,0,449,450,5,9,
	0,0,450,451,3,46,23,0,451,452,5,11,0,0,452,453,3,38,19,0,453,454,5,47,0,
	0,454,455,3,44,22,0,455,457,1,0,0,0,456,440,1,0,0,0,456,441,1,0,0,0,456,
	449,1,0,0,0,457,45,1,0,0,0,458,459,6,23,-1,0,459,497,5,54,0,0,460,461,3,
	0,0,0,461,462,5,3,0,0,462,464,1,0,0,0,463,460,1,0,0,0,463,464,1,0,0,0,464,
	465,1,0,0,0,465,477,5,55,0,0,466,467,5,19,0,0,467,472,3,46,23,0,468,469,
	5,5,0,0,469,471,3,46,23,0,470,468,1,0,0,0,471,474,1,0,0,0,472,470,1,0,0,
	0,472,473,1,0,0,0,473,475,1,0,0,0,474,472,1,0,0,0,475,476,5,20,0,0,476,
	478,1,0,0,0,477,466,1,0,0,0,477,478,1,0,0,0,478,497,1,0,0,0,479,497,5,56,
	0,0,480,497,5,59,0,0,481,497,5,57,0,0,482,497,5,58,0,0,483,484,5,19,0,0,
	484,485,3,46,23,0,485,486,5,5,0,0,486,491,3,46,23,0,487,488,5,5,0,0,488,
	490,3,46,23,0,489,487,1,0,0,0,490,493,1,0,0,0,491,489,1,0,0,0,491,492,1,
	0,0,0,492,494,1,0,0,0,493,491,1,0,0,0,494,495,5,20,0,0,495,497,1,0,0,0,
	496,458,1,0,0,0,496,463,1,0,0,0,496,479,1,0,0,0,496,480,1,0,0,0,496,481,
	1,0,0,0,496,482,1,0,0,0,496,483,1,0,0,0,497,503,1,0,0,0,498,499,10,2,0,
	0,499,500,5,31,0,0,500,502,3,46,23,2,501,498,1,0,0,0,502,505,1,0,0,0,503,
	501,1,0,0,0,503,504,1,0,0,0,504,47,1,0,0,0,505,503,1,0,0,0,64,53,59,65,
	71,80,91,96,101,103,109,114,118,121,127,135,140,150,154,159,163,170,175,
	180,184,192,202,206,215,218,227,233,242,247,252,266,271,278,282,291,296,
	301,321,337,341,343,360,363,366,376,380,382,385,418,422,424,427,429,456,
	463,472,477,491,496,503];

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


export class ReplInputContext extends ParserRuleContext {
	constructor(parser?: KestrelParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return KestrelParser.RULE_replInput;
	}
	public copyFrom(ctx: ReplInputContext): void {
		super.copyFrom(ctx);
	}
}
export class ReplDeclarationContext extends ReplInputContext {
	constructor(parser: KestrelParser, ctx: ReplInputContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public letDeclaration_(): LetDeclaration_Context {
		return this.getTypedRuleContext(LetDeclaration_Context, 0) as LetDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterReplDeclaration) {
	 		listener.enterReplDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitReplDeclaration) {
	 		listener.exitReplDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitReplDeclaration) {
			return visitor.visitReplDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReplTypeDeclarationContext extends ReplInputContext {
	constructor(parser: KestrelParser, ctx: ReplInputContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public typeDeclaration_(): TypeDeclaration_Context {
		return this.getTypedRuleContext(TypeDeclaration_Context, 0) as TypeDeclaration_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterReplTypeDeclaration) {
	 		listener.enterReplTypeDeclaration(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitReplTypeDeclaration) {
	 		listener.exitReplTypeDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitReplTypeDeclaration) {
			return visitor.visitReplTypeDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReplExprContext extends ReplInputContext {
	constructor(parser: KestrelParser, ctx: ReplInputContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public expr(): ExprContext {
		return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterReplExpr) {
	 		listener.enterReplExpr(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitReplExpr) {
	 		listener.exitReplExpr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitReplExpr) {
			return visitor.visitReplExpr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ReplImportContext extends ReplInputContext {
	constructor(parser: KestrelParser, ctx: ReplInputContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public import_(): Import_Context {
		return this.getTypedRuleContext(Import_Context, 0) as Import_Context;
	}
	public enterRule(listener: KestrelListener): void {
	    if(listener.enterReplImport) {
	 		listener.enterReplImport(this);
		}
	}
	public exitRule(listener: KestrelListener): void {
	    if(listener.exitReplImport) {
	 		listener.exitReplImport(this);
		}
	}
	// @Override
	public accept<Result>(visitor: KestrelVisitor<Result>): Result {
		if (visitor.visitReplImport) {
			return visitor.visitReplImport(this);
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
