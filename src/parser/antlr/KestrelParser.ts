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
	public static readonly RULE_listElems = 24;
	public static readonly RULE_matchClause = 25;
	public static readonly RULE_blockStatement = 26;
	public static readonly RULE_block = 27;
	public static readonly RULE_matchPattern = 28;
	public static readonly RULE_listPatterns = 29;
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
                                                            "'<'", "'>'", 
                                                            "':'", "'where'", 
                                                            "'+'", "'->'", 
                                                            "'#'", "'!'", 
                                                            "'..'", "'*'", 
                                                            "'*.'", "'/.'", 
                                                            "'%'", "'-'", 
                                                            "'+.'", "'-.'", 
                                                            "'++'", "'=='", 
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
		"structDeclaration_", "pubExposing", "paramsList", "typeVariants", "fieldDecl", 
		"declarationFields", "polyType", "traitImplClause", "type", "fnTypeParams", 
		"typeConstructorDecl", "qualifiedId", "structField", "structFields", "expr", 
		"listElems", "matchClause", "blockStatement", "block", "matchPattern", 
		"listPatterns",
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
			this.state = 60;
			this.match(KestrelParser.TYPE_ID);
			this.state = 65;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===1) {
				{
				{
				this.state = 61;
				this.match(KestrelParser.T__0);
				this.state = 62;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 67;
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
			this.state = 71;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===65) {
				{
				{
				this.state = 68;
				localctx._doc = this.match(KestrelParser.MODULEDOC_COMMENT_LINE);
				}
				}
				this.state = 73;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 77;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===2) {
				{
				{
				this.state = 74;
				this.import_();
				}
				}
				this.state = 79;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 83;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 208768) !== 0) || _la===66) {
				{
				{
				this.state = 80;
				this.declaration();
				}
				}
				this.state = 85;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 86;
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
			this.state = 88;
			this.match(KestrelParser.T__1);
			this.state = 89;
			this.moduleNamespace();
			this.state = 102;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===3) {
				{
				this.state = 90;
				this.match(KestrelParser.T__2);
				this.state = 91;
				this.match(KestrelParser.T__3);
				this.state = 92;
				this.importExposing();
				this.state = 97;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 93;
					this.match(KestrelParser.T__4);
					this.state = 94;
					this.importExposing();
					}
					}
					this.state = 99;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 100;
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
			this.state = 109;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 56:
			case 57:
				localctx = new ValueExposingContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 104;
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
				this.state = 105;
				(localctx as TypeExposingContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 107;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===55) {
					{
					this.state = 106;
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
			this.state = 114;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				localctx = new LetDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 111;
				this.letDeclaration_();
				}
				break;
			case 2:
				localctx = new TypeDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 112;
				this.typeDeclaration_();
				}
				break;
			case 3:
				localctx = new StructDeclarationContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 113;
				this.structDeclaration_();
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
			this.state = 120;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 7:
				localctx = new AttrTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 116;
				this.match(KestrelParser.T__6);
				this.state = 117;
				this.polyType();
				}
				break;
			case 8:
				localctx = new AttrInlineContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 118;
				this.match(KestrelParser.T__7);
				}
				break;
			case 9:
				localctx = new AttrExternContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 119;
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
			this.state = 125;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 122;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 127;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			{
			this.state = 131;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 896) !== 0)) {
				{
				{
				this.state = 128;
				this.valueAttribute();
				}
				}
				this.state = 133;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			{
			this.state = 135;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 134;
				localctx._pub = this.match(KestrelParser.T__9);
				}
			}

			}
			this.state = 137;
			this.match(KestrelParser.T__10);
			this.state = 138;
			localctx._binding = this._input.LT(1);
			_la = this._input.LA(1);
			if(!(_la===56 || _la===57)) {
			    localctx._binding = this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			this.state = 141;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===12) {
				{
				this.state = 139;
				this.match(KestrelParser.T__11);
				this.state = 140;
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
			this.state = 157;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 9:
				localctx = new TypeAttrExternContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 143;
				this.match(KestrelParser.T__8);
				}
				break;
			case 13:
				localctx = new TypeAttDerivingContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 144;
				this.match(KestrelParser.T__12);
				this.state = 145;
				this.match(KestrelParser.T__13);
				this.state = 154;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===58) {
					{
					this.state = 146;
					this.match(KestrelParser.TYPE_ID);
					this.state = 151;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 147;
						this.match(KestrelParser.T__4);
						this.state = 148;
						this.match(KestrelParser.TYPE_ID);
						}
						}
						this.state = 153;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 156;
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
			this.state = 162;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 159;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 164;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 168;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===9 || _la===13) {
				{
				{
				this.state = 165;
				this.typeAttribute();
				}
				}
				this.state = 170;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 172;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 171;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 174;
			this.match(KestrelParser.T__15);
			this.state = 175;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 177;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===18) {
				{
				this.state = 176;
				this.paramsList();
				}
			}

			this.state = 179;
			this.match(KestrelParser.T__3);
			this.state = 181;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===58) {
				{
				this.state = 180;
				this.typeVariants();
				}
			}

			this.state = 183;
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
			this.state = 188;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===66) {
				{
				{
				this.state = 185;
				localctx._doc = this.match(KestrelParser.DOC_COMMENT_LINE);
				}
				}
				this.state = 190;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
			this.state = 194;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===9 || _la===13) {
				{
				{
				this.state = 191;
				this.typeAttribute();
				}
				}
				this.state = 196;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 198;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===10) {
				{
				this.state = 197;
				localctx._pub = this.pubExposing();
				}
			}

			this.state = 200;
			this.match(KestrelParser.T__16);
			this.state = 201;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 203;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===18) {
				{
				this.state = 202;
				this.paramsList();
				}
			}

			this.state = 205;
			this.match(KestrelParser.T__3);
			this.state = 207;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===57) {
				{
				this.state = 206;
				this.declarationFields();
				}
			}

			this.state = 209;
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
	public pubExposing(): PubExposingContext {
		let localctx: PubExposingContext = new PubExposingContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, KestrelParser.RULE_pubExposing);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 211;
			this.match(KestrelParser.T__9);
			this.state = 213;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===55) {
				{
				this.state = 212;
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
			this.state = 215;
			this.match(KestrelParser.T__17);
			this.state = 216;
			this.match(KestrelParser.ID);
			this.state = 221;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===5) {
				{
				{
				this.state = 217;
				this.match(KestrelParser.T__4);
				this.state = 218;
				this.match(KestrelParser.ID);
				}
				}
				this.state = 223;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 224;
			this.match(KestrelParser.T__18);
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
			this.state = 226;
			this.typeConstructorDecl();
			this.state = 231;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 29, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 227;
					this.match(KestrelParser.T__4);
					this.state = 228;
					this.typeConstructorDecl();
					}
					}
				}
				this.state = 233;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 29, this._ctx);
			}
			this.state = 235;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 234;
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
			this.state = 237;
			this.match(KestrelParser.ID);
			this.state = 238;
			this.match(KestrelParser.T__19);
			this.state = 239;
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
			this.state = 241;
			this.fieldDecl();
			this.state = 246;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 31, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 242;
					this.match(KestrelParser.T__4);
					this.state = 243;
					this.fieldDecl();
					}
					}
				}
				this.state = 248;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 31, this._ctx);
			}
			this.state = 250;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 249;
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
			this.state = 252;
			this.type_();
			this.state = 262;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===21) {
				{
				this.state = 253;
				this.match(KestrelParser.T__20);
				this.state = 254;
				this.traitImplClause();
				this.state = 259;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 255;
					this.match(KestrelParser.T__4);
					this.state = 256;
					this.traitImplClause();
					}
					}
					this.state = 261;
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
			this.state = 264;
			this.match(KestrelParser.ID);
			this.state = 265;
			this.match(KestrelParser.T__19);
			{
			this.state = 266;
			this.match(KestrelParser.TYPE_ID);
			this.state = 271;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===22) {
				{
				{
				this.state = 267;
				this.match(KestrelParser.T__21);
				this.state = 268;
				this.match(KestrelParser.TYPE_ID);
				}
				}
				this.state = 273;
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
			this.state = 314;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				localctx = new NamedTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 277;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 36, this._ctx) ) {
				case 1:
					{
					this.state = 274;
					this.moduleNamespace();
					this.state = 275;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 279;
				(localctx as NamedTypeContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 291;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===18) {
					{
					this.state = 280;
					this.match(KestrelParser.T__17);
					this.state = 281;
					this.type_();
					this.state = 286;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 282;
						this.match(KestrelParser.T__4);
						this.state = 283;
						this.type_();
						}
						}
						this.state = 288;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 289;
					this.match(KestrelParser.T__18);
					}
				}

				}
				break;
			case 2:
				localctx = new FnTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 293;
				this.match(KestrelParser.T__13);
				this.state = 295;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || _la===57 || _la===58) {
					{
					this.state = 294;
					this.fnTypeParams();
					}
				}

				this.state = 297;
				this.match(KestrelParser.T__14);
				this.state = 298;
				this.match(KestrelParser.T__22);
				this.state = 299;
				(localctx as FnTypeContext)._ret = this.type_();
				}
				break;
			case 3:
				localctx = new GenericTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 300;
				this.match(KestrelParser.ID);
				}
				break;
			case 4:
				localctx = new TupleTypeContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 301;
				this.match(KestrelParser.T__13);
				this.state = 302;
				this.type_();
				this.state = 303;
				this.match(KestrelParser.T__4);
				this.state = 304;
				this.type_();
				this.state = 309;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 305;
					this.match(KestrelParser.T__4);
					this.state = 306;
					this.type_();
					}
					}
					this.state = 311;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 312;
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
		this.enterRule(localctx, 36, KestrelParser.RULE_fnTypeParams);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 316;
			this.type_();
			this.state = 321;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 317;
					this.match(KestrelParser.T__4);
					this.state = 318;
					this.type_();
					}
					}
				}
				this.state = 323;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 42, this._ctx);
			}
			this.state = 325;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 324;
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
			this.state = 327;
			localctx._name = this.match(KestrelParser.TYPE_ID);
			this.state = 339;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===14) {
				{
				this.state = 328;
				this.match(KestrelParser.T__13);
				this.state = 329;
				this.type_();
				this.state = 334;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 330;
					this.match(KestrelParser.T__4);
					this.state = 331;
					this.type_();
					}
					}
					this.state = 336;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 337;
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
		this.enterRule(localctx, 40, KestrelParser.RULE_qualifiedId);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 344;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 46, this._ctx) ) {
			case 1:
				{
				this.state = 341;
				this.moduleNamespace();
				this.state = 342;
				this.match(KestrelParser.T__2);
				}
				break;
			}
			{
			this.state = 346;
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
			this.state = 348;
			this.match(KestrelParser.ID);
			this.state = 349;
			this.match(KestrelParser.T__19);
			this.state = 350;
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
			this.state = 352;
			this.structField();
			this.state = 357;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 47, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 353;
					this.match(KestrelParser.T__4);
					this.state = 354;
					this.structField();
					}
					}
				}
				this.state = 359;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 47, this._ctx);
			}
			this.state = 361;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===5) {
				{
				this.state = 360;
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
			this.state = 451;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 61, this._ctx) ) {
			case 1:
				{
				localctx = new IntContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;

				this.state = 364;
				this.match(KestrelParser.INT);
				}
				break;
			case 2:
				{
				localctx = new FloatContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 365;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 3:
				{
				localctx = new CharContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 366;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 4:
				{
				localctx = new StringContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 367;
				this.match(KestrelParser.STRING);
				}
				break;
			case 5:
				{
				localctx = new IdContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 368;
				this.qualifiedId();
				}
				break;
			case 6:
				{
				localctx = new BoolNotContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 369;
				(localctx as BoolNotContext)._op = this.match(KestrelParser.T__24);
				this.state = 370;
				this.expr(17);
				}
				break;
			case 7:
				{
				localctx = new StructLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 371;
				this.match(KestrelParser.TYPE_ID);
				this.state = 372;
				this.match(KestrelParser.T__3);
				this.state = 374;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===57) {
					{
					this.state = 373;
					this.structFields();
					}
				}

				this.state = 378;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===26) {
					{
					this.state = 376;
					this.match(KestrelParser.T__25);
					this.state = 377;
					(localctx as StructLitContext)._spread = this.expr(0);
					}
				}

				this.state = 380;
				this.match(KestrelParser.T__5);
				}
				break;
			case 8:
				{
				localctx = new TupleContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 381;
				this.match(KestrelParser.T__13);
				this.state = 382;
				this.expr(0);
				this.state = 383;
				this.match(KestrelParser.T__4);
				this.state = 384;
				this.expr(0);
				this.state = 389;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 385;
					this.match(KestrelParser.T__4);
					this.state = 386;
					this.expr(0);
					}
					}
					this.state = 391;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 392;
				this.match(KestrelParser.T__14);
				}
				break;
			case 9:
				{
				localctx = new ParensContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 394;
				this.match(KestrelParser.T__13);
				this.state = 395;
				this.expr(0);
				this.state = 396;
				this.match(KestrelParser.T__14);
				}
				break;
			case 10:
				{
				localctx = new BlockExprContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 398;
				this.block();
				}
				break;
			case 11:
				{
				localctx = new FnContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 399;
				this.match(KestrelParser.T__40);
				this.state = 411;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 258049) !== 0)) {
					{
					this.state = 400;
					this.matchPattern();
					this.state = 405;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 52, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 401;
							this.match(KestrelParser.T__4);
							this.state = 402;
							this.matchPattern();
							}
							}
						}
						this.state = 407;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 52, this._ctx);
					}
					this.state = 409;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 408;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 413;
				this.block();
				}
				break;
			case 12:
				{
				localctx = new IfContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 414;
				this.match(KestrelParser.T__41);
				this.state = 415;
				(localctx as IfContext)._condition = this.expr(0);
				this.state = 416;
				(localctx as IfContext)._then = this.block();
				this.state = 417;
				this.match(KestrelParser.T__42);
				this.state = 418;
				(localctx as IfContext)._else_ = this.block();
				}
				break;
			case 13:
				{
				localctx = new MatchContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 420;
				this.match(KestrelParser.T__43);
				this.state = 421;
				(localctx as MatchContext)._matched = this.expr(0);
				this.state = 422;
				this.match(KestrelParser.T__3);
				this.state = 431;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 258049) !== 0)) {
					{
					this.state = 423;
					this.matchClause();
					this.state = 428;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 55, this._ctx);
					while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
						if (_alt === 1) {
							{
							{
							this.state = 424;
							this.match(KestrelParser.T__4);
							this.state = 425;
							this.matchClause();
							}
							}
						}
						this.state = 430;
						this._errHandler.sync(this);
						_alt = this._interp.adaptivePredict(this._input, 55, this._ctx);
					}
					}
				}

				this.state = 434;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===5) {
					{
					this.state = 433;
					this.match(KestrelParser.T__4);
					}
				}

				this.state = 436;
				this.match(KestrelParser.T__5);
				}
				break;
			case 14:
				{
				localctx = new ListLitContext(this, localctx);
				this._ctx = localctx;
				_prevctx = localctx;
				this.state = 438;
				this.match(KestrelParser.T__44);
				this.state = 448;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33570832) !== 0) || ((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 4128795) !== 0)) {
					{
					this.state = 439;
					this.listElems();
					this.state = 443;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 58, this._ctx) ) {
					case 1:
						{
						this.state = 440;
						this.match(KestrelParser.T__4);
						this.state = 441;
						this.match(KestrelParser.T__25);
						this.state = 442;
						(localctx as ListLitContext)._tail = this.expr(0);
						}
						break;
					}
					this.state = 446;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 445;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 450;
				this.match(KestrelParser.T__45);
				}
				break;
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 499;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 67, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 497;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 66, this._ctx) ) {
					case 1:
						{
						localctx = new MulDivContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 453;
						if (!(this.precpred(this._ctx, 14))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 14)");
						}
						this.state = 454;
						(localctx as MulDivContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 2013265922) !== 0))) {
						    (localctx as MulDivContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 455;
						this.expr(15);
						}
						break;
					case 2:
						{
						localctx = new AddSubContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 456;
						if (!(this.precpred(this._ctx, 13))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 13)");
						}
						this.state = 457;
						(localctx as AddSubContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 22)) & ~0x1F) === 0 && ((1 << (_la - 22)) & 7681) !== 0))) {
						    (localctx as AddSubContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 458;
						this.expr(14);
						}
						break;
					case 3:
						{
						localctx = new EqContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 459;
						if (!(this.precpred(this._ctx, 12))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 12)");
						}
						this.state = 460;
						(localctx as EqContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(_la===35 || _la===36)) {
						    (localctx as EqContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 461;
						this.expr(13);
						}
						break;
					case 4:
						{
						localctx = new CompContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 462;
						if (!(this.precpred(this._ctx, 11))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 11)");
						}
						this.state = 463;
						(localctx as CompContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if(!(((((_la - 18)) & ~0x1F) === 0 && ((1 << (_la - 18)) & 1572867) !== 0))) {
						    (localctx as CompContext)._op = this._errHandler.recoverInline(this);
						}
						else {
							this._errHandler.reportMatch(this);
						    this.consume();
						}
						this.state = 464;
						this.expr(12);
						}
						break;
					case 5:
						{
						localctx = new BoolOrContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 465;
						if (!(this.precpred(this._ctx, 10))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 10)");
						}
						this.state = 466;
						(localctx as BoolOrContext)._op = this.match(KestrelParser.T__38);
						this.state = 467;
						this.expr(11);
						}
						break;
					case 6:
						{
						localctx = new BoolAndContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 468;
						if (!(this.precpred(this._ctx, 9))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 9)");
						}
						this.state = 469;
						(localctx as BoolAndContext)._op = this.match(KestrelParser.T__39);
						this.state = 470;
						this.expr(10);
						}
						break;
					case 7:
						{
						localctx = new PipeContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 471;
						if (!(this.precpred(this._ctx, 1))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
						}
						this.state = 472;
						(localctx as PipeContext)._op = this.match(KestrelParser.T__46);
						this.state = 473;
						this.expr(2);
						}
						break;
					case 8:
						{
						localctx = new FieldAccessContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 474;
						if (!(this.precpred(this._ctx, 19))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 19)");
						}
						this.state = 475;
						this.match(KestrelParser.T__2);
						this.state = 478;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la===58) {
							{
							this.state = 476;
							(localctx as FieldAccessContext)._structName = this.match(KestrelParser.TYPE_ID);
							this.state = 477;
							this.match(KestrelParser.T__23);
							}
						}

						this.state = 480;
						this.match(KestrelParser.ID);
						}
						break;
					case 9:
						{
						localctx = new CallContext(this, new ExprContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, KestrelParser.RULE_expr);
						this.state = 481;
						if (!(this.precpred(this._ctx, 15))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 15)");
						}
						this.state = 482;
						this.match(KestrelParser.T__13);
						this.state = 494;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 33570832) !== 0) || ((((_la - 41)) & ~0x1F) === 0 && ((1 << (_la - 41)) & 4128795) !== 0)) {
							{
							this.state = 483;
							this.expr(0);
							this.state = 488;
							this._errHandler.sync(this);
							_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
							while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
								if (_alt === 1) {
									{
									{
									this.state = 484;
									this.match(KestrelParser.T__4);
									this.state = 485;
									this.expr(0);
									}
									}
								}
								this.state = 490;
								this._errHandler.sync(this);
								_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
							}
							this.state = 492;
							this._errHandler.sync(this);
							_la = this._input.LA(1);
							if (_la===5) {
								{
								this.state = 491;
								this.match(KestrelParser.T__4);
								}
							}

							}
						}

						this.state = 496;
						this.match(KestrelParser.T__14);
						}
						break;
					}
					}
				}
				this.state = 501;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 67, this._ctx);
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
		this.enterRule(localctx, 48, KestrelParser.RULE_listElems);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 502;
			this.expr(0);
			this.state = 507;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 68, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 503;
					this.match(KestrelParser.T__4);
					this.state = 504;
					this.expr(0);
					}
					}
				}
				this.state = 509;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 68, this._ctx);
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
		this.enterRule(localctx, 50, KestrelParser.RULE_matchClause);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 510;
			this.matchPattern();
			this.state = 511;
			this.match(KestrelParser.T__47);
			this.state = 512;
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
		this.enterRule(localctx, 52, KestrelParser.RULE_blockStatement);
		try {
			this.state = 527;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 49:
				localctx = new BlockLetHashContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 514;
				this.match(KestrelParser.T__48);
				this.state = 515;
				(localctx as BlockLetHashContext)._mapper = this.qualifiedId();
				this.state = 516;
				(localctx as BlockLetHashContext)._pattern = this.matchPattern();
				this.state = 517;
				this.match(KestrelParser.T__11);
				this.state = 518;
				(localctx as BlockLetHashContext)._value = this.expr(0);
				this.state = 519;
				this.match(KestrelParser.T__49);
				}
				break;
			case 11:
				localctx = new BlockLetContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 521;
				this.match(KestrelParser.T__10);
				this.state = 522;
				(localctx as BlockLetContext)._pattern = this.matchPattern();
				this.state = 523;
				this.match(KestrelParser.T__11);
				this.state = 524;
				(localctx as BlockLetContext)._value = this.expr(0);
				this.state = 525;
				this.match(KestrelParser.T__49);
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
		this.enterRule(localctx, 54, KestrelParser.RULE_block);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 529;
			this.match(KestrelParser.T__3);
			this.state = 533;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===11 || _la===49) {
				{
				{
				this.state = 530;
				this.blockStatement();
				}
				}
				this.state = 535;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 536;
			this.expr(0);
			this.state = 537;
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
		this.enterRule(localctx, 56, KestrelParser.RULE_matchPattern);
		let _la: number;
		try {
			this.state = 589;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 57:
				localctx = new MatchIdentContext(this, localctx);
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 539;
				this.match(KestrelParser.ID);
				}
				break;
			case 58:
				localctx = new ConstructorContext(this, localctx);
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 543;
				this._errHandler.sync(this);
				switch ( this._interp.adaptivePredict(this._input, 71, this._ctx) ) {
				case 1:
					{
					this.state = 540;
					this.moduleNamespace();
					this.state = 541;
					this.match(KestrelParser.T__2);
					}
					break;
				}
				this.state = 545;
				(localctx as ConstructorContext)._name = this.match(KestrelParser.TYPE_ID);
				this.state = 557;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14) {
					{
					this.state = 546;
					this.match(KestrelParser.T__13);
					this.state = 547;
					this.matchPattern();
					this.state = 552;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la===5) {
						{
						{
						this.state = 548;
						this.match(KestrelParser.T__4);
						this.state = 549;
						this.matchPattern();
						}
						}
						this.state = 554;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					this.state = 555;
					this.match(KestrelParser.T__14);
					}
				}

				}
				break;
			case 59:
				localctx = new IntPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 559;
				this.match(KestrelParser.INT);
				}
				break;
			case 62:
				localctx = new FloatPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 560;
				this.match(KestrelParser.FLOAT);
				}
				break;
			case 60:
				localctx = new CharPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 561;
				this.match(KestrelParser.CHAR);
				}
				break;
			case 61:
				localctx = new StringPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 562;
				this.match(KestrelParser.STRING);
				}
				break;
			case 45:
				localctx = new ListPatternContext(this, localctx);
				this.enterOuterAlt(localctx, 7);
				{
				this.state = 563;
				this.match(KestrelParser.T__44);
				this.state = 573;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===14 || ((((_la - 45)) & ~0x1F) === 0 && ((1 << (_la - 45)) & 258049) !== 0)) {
					{
					this.state = 564;
					this.listPatterns();
					this.state = 568;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 74, this._ctx) ) {
					case 1:
						{
						this.state = 565;
						this.match(KestrelParser.T__4);
						this.state = 566;
						this.match(KestrelParser.T__25);
						this.state = 567;
						(localctx as ListPatternContext)._tail = this.matchPattern();
						}
						break;
					}
					this.state = 571;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					if (_la===5) {
						{
						this.state = 570;
						this.match(KestrelParser.T__4);
						}
					}

					}
				}

				this.state = 575;
				this.match(KestrelParser.T__45);
				}
				break;
			case 14:
				localctx = new TuplePatternContext(this, localctx);
				this.enterOuterAlt(localctx, 8);
				{
				this.state = 576;
				this.match(KestrelParser.T__13);
				this.state = 577;
				this.matchPattern();
				this.state = 578;
				this.match(KestrelParser.T__4);
				this.state = 579;
				this.matchPattern();
				this.state = 584;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la===5) {
					{
					{
					this.state = 580;
					this.match(KestrelParser.T__4);
					this.state = 581;
					this.matchPattern();
					}
					}
					this.state = 586;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 587;
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
		this.enterRule(localctx, 58, KestrelParser.RULE_listPatterns);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 591;
			this.matchPattern();
			this.state = 596;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 79, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 592;
					this.match(KestrelParser.T__4);
					this.state = 593;
					this.matchPattern();
					}
					}
				}
				this.state = 598;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 79, this._ctx);
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
		case 23:
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

	public static readonly _serializedATN: number[] = [4,1,67,600,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,1,0,1,0,1,0,5,0,64,
	8,0,10,0,12,0,67,9,0,1,1,5,1,70,8,1,10,1,12,1,73,9,1,1,1,5,1,76,8,1,10,
	1,12,1,79,9,1,1,1,5,1,82,8,1,10,1,12,1,85,9,1,1,1,1,1,1,2,1,2,1,2,1,2,1,
	2,1,2,1,2,5,2,96,8,2,10,2,12,2,99,9,2,1,2,1,2,3,2,103,8,2,1,3,1,3,1,3,3,
	3,108,8,3,3,3,110,8,3,1,4,1,4,1,4,3,4,115,8,4,1,5,1,5,1,5,1,5,3,5,121,8,
	5,1,6,5,6,124,8,6,10,6,12,6,127,9,6,1,6,5,6,130,8,6,10,6,12,6,133,9,6,1,
	6,3,6,136,8,6,1,6,1,6,1,6,1,6,3,6,142,8,6,1,7,1,7,1,7,1,7,1,7,1,7,5,7,150,
	8,7,10,7,12,7,153,9,7,3,7,155,8,7,1,7,3,7,158,8,7,1,8,5,8,161,8,8,10,8,
	12,8,164,9,8,1,8,5,8,167,8,8,10,8,12,8,170,9,8,1,8,3,8,173,8,8,1,8,1,8,
	1,8,3,8,178,8,8,1,8,1,8,3,8,182,8,8,1,8,1,8,1,9,5,9,187,8,9,10,9,12,9,190,
	9,9,1,9,5,9,193,8,9,10,9,12,9,196,9,9,1,9,3,9,199,8,9,1,9,1,9,1,9,3,9,204,
	8,9,1,9,1,9,3,9,208,8,9,1,9,1,9,1,10,1,10,3,10,214,8,10,1,11,1,11,1,11,
	1,11,5,11,220,8,11,10,11,12,11,223,9,11,1,11,1,11,1,12,1,12,1,12,5,12,230,
	8,12,10,12,12,12,233,9,12,1,12,3,12,236,8,12,1,13,1,13,1,13,1,13,1,14,1,
	14,1,14,5,14,245,8,14,10,14,12,14,248,9,14,1,14,3,14,251,8,14,1,15,1,15,
	1,15,1,15,1,15,5,15,258,8,15,10,15,12,15,261,9,15,3,15,263,8,15,1,16,1,
	16,1,16,1,16,1,16,5,16,270,8,16,10,16,12,16,273,9,16,1,17,1,17,1,17,3,17,
	278,8,17,1,17,1,17,1,17,1,17,1,17,5,17,285,8,17,10,17,12,17,288,9,17,1,
	17,1,17,3,17,292,8,17,1,17,1,17,3,17,296,8,17,1,17,1,17,1,17,1,17,1,17,
	1,17,1,17,1,17,1,17,1,17,5,17,308,8,17,10,17,12,17,311,9,17,1,17,1,17,3,
	17,315,8,17,1,18,1,18,1,18,5,18,320,8,18,10,18,12,18,323,9,18,1,18,3,18,
	326,8,18,1,19,1,19,1,19,1,19,1,19,5,19,333,8,19,10,19,12,19,336,9,19,1,
	19,1,19,3,19,340,8,19,1,20,1,20,1,20,3,20,345,8,20,1,20,1,20,1,21,1,21,
	1,21,1,21,1,22,1,22,1,22,5,22,356,8,22,10,22,12,22,359,9,22,1,22,3,22,362,
	8,22,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,3,23,375,8,
	23,1,23,1,23,3,23,379,8,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,388,
	8,23,10,23,12,23,391,9,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,
	1,23,1,23,5,23,404,8,23,10,23,12,23,407,9,23,1,23,3,23,410,8,23,3,23,412,
	8,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,5,
	23,427,8,23,10,23,12,23,430,9,23,3,23,432,8,23,1,23,3,23,435,8,23,1,23,
	1,23,1,23,1,23,1,23,1,23,1,23,3,23,444,8,23,1,23,3,23,447,8,23,3,23,449,
	8,23,1,23,3,23,452,8,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,
	23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,1,23,
	1,23,3,23,479,8,23,1,23,1,23,1,23,1,23,1,23,1,23,5,23,487,8,23,10,23,12,
	23,490,9,23,1,23,3,23,493,8,23,3,23,495,8,23,1,23,5,23,498,8,23,10,23,12,
	23,501,9,23,1,24,1,24,1,24,5,24,506,8,24,10,24,12,24,509,9,24,1,25,1,25,
	1,25,1,25,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,26,1,
	26,3,26,528,8,26,1,27,1,27,5,27,532,8,27,10,27,12,27,535,9,27,1,27,1,27,
	1,27,1,28,1,28,1,28,1,28,3,28,544,8,28,1,28,1,28,1,28,1,28,1,28,5,28,551,
	8,28,10,28,12,28,554,9,28,1,28,1,28,3,28,558,8,28,1,28,1,28,1,28,1,28,1,
	28,1,28,1,28,1,28,1,28,3,28,569,8,28,1,28,3,28,572,8,28,3,28,574,8,28,1,
	28,1,28,1,28,1,28,1,28,1,28,1,28,5,28,583,8,28,10,28,12,28,586,9,28,1,28,
	1,28,3,28,590,8,28,1,29,1,29,1,29,5,29,595,8,29,10,29,12,29,598,9,29,1,
	29,0,1,46,30,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,
	42,44,46,48,50,52,54,56,58,0,6,1,0,56,57,1,0,57,58,2,0,1,1,27,30,2,0,22,
	22,31,34,1,0,35,36,2,0,18,19,37,38,678,0,60,1,0,0,0,2,71,1,0,0,0,4,88,1,
	0,0,0,6,109,1,0,0,0,8,114,1,0,0,0,10,120,1,0,0,0,12,125,1,0,0,0,14,157,
	1,0,0,0,16,162,1,0,0,0,18,188,1,0,0,0,20,211,1,0,0,0,22,215,1,0,0,0,24,
	226,1,0,0,0,26,237,1,0,0,0,28,241,1,0,0,0,30,252,1,0,0,0,32,264,1,0,0,0,
	34,314,1,0,0,0,36,316,1,0,0,0,38,327,1,0,0,0,40,344,1,0,0,0,42,348,1,0,
	0,0,44,352,1,0,0,0,46,451,1,0,0,0,48,502,1,0,0,0,50,510,1,0,0,0,52,527,
	1,0,0,0,54,529,1,0,0,0,56,589,1,0,0,0,58,591,1,0,0,0,60,65,5,58,0,0,61,
	62,5,1,0,0,62,64,5,58,0,0,63,61,1,0,0,0,64,67,1,0,0,0,65,63,1,0,0,0,65,
	66,1,0,0,0,66,1,1,0,0,0,67,65,1,0,0,0,68,70,5,65,0,0,69,68,1,0,0,0,70,73,
	1,0,0,0,71,69,1,0,0,0,71,72,1,0,0,0,72,77,1,0,0,0,73,71,1,0,0,0,74,76,3,
	4,2,0,75,74,1,0,0,0,76,79,1,0,0,0,77,75,1,0,0,0,77,78,1,0,0,0,78,83,1,0,
	0,0,79,77,1,0,0,0,80,82,3,8,4,0,81,80,1,0,0,0,82,85,1,0,0,0,83,81,1,0,0,
	0,83,84,1,0,0,0,84,86,1,0,0,0,85,83,1,0,0,0,86,87,5,0,0,1,87,3,1,0,0,0,
	88,89,5,2,0,0,89,102,3,0,0,0,90,91,5,3,0,0,91,92,5,4,0,0,92,97,3,6,3,0,
	93,94,5,5,0,0,94,96,3,6,3,0,95,93,1,0,0,0,96,99,1,0,0,0,97,95,1,0,0,0,97,
	98,1,0,0,0,98,100,1,0,0,0,99,97,1,0,0,0,100,101,5,6,0,0,101,103,1,0,0,0,
	102,90,1,0,0,0,102,103,1,0,0,0,103,5,1,0,0,0,104,110,7,0,0,0,105,107,5,
	58,0,0,106,108,5,55,0,0,107,106,1,0,0,0,107,108,1,0,0,0,108,110,1,0,0,0,
	109,104,1,0,0,0,109,105,1,0,0,0,110,7,1,0,0,0,111,115,3,12,6,0,112,115,
	3,16,8,0,113,115,3,18,9,0,114,111,1,0,0,0,114,112,1,0,0,0,114,113,1,0,0,
	0,115,9,1,0,0,0,116,117,5,7,0,0,117,121,3,30,15,0,118,121,5,8,0,0,119,121,
	5,9,0,0,120,116,1,0,0,0,120,118,1,0,0,0,120,119,1,0,0,0,121,11,1,0,0,0,
	122,124,5,66,0,0,123,122,1,0,0,0,124,127,1,0,0,0,125,123,1,0,0,0,125,126,
	1,0,0,0,126,131,1,0,0,0,127,125,1,0,0,0,128,130,3,10,5,0,129,128,1,0,0,
	0,130,133,1,0,0,0,131,129,1,0,0,0,131,132,1,0,0,0,132,135,1,0,0,0,133,131,
	1,0,0,0,134,136,5,10,0,0,135,134,1,0,0,0,135,136,1,0,0,0,136,137,1,0,0,
	0,137,138,5,11,0,0,138,141,7,0,0,0,139,140,5,12,0,0,140,142,3,46,23,0,141,
	139,1,0,0,0,141,142,1,0,0,0,142,13,1,0,0,0,143,158,5,9,0,0,144,145,5,13,
	0,0,145,154,5,14,0,0,146,151,5,58,0,0,147,148,5,5,0,0,148,150,5,58,0,0,
	149,147,1,0,0,0,150,153,1,0,0,0,151,149,1,0,0,0,151,152,1,0,0,0,152,155,
	1,0,0,0,153,151,1,0,0,0,154,146,1,0,0,0,154,155,1,0,0,0,155,156,1,0,0,0,
	156,158,5,15,0,0,157,143,1,0,0,0,157,144,1,0,0,0,158,15,1,0,0,0,159,161,
	5,66,0,0,160,159,1,0,0,0,161,164,1,0,0,0,162,160,1,0,0,0,162,163,1,0,0,
	0,163,168,1,0,0,0,164,162,1,0,0,0,165,167,3,14,7,0,166,165,1,0,0,0,167,
	170,1,0,0,0,168,166,1,0,0,0,168,169,1,0,0,0,169,172,1,0,0,0,170,168,1,0,
	0,0,171,173,3,20,10,0,172,171,1,0,0,0,172,173,1,0,0,0,173,174,1,0,0,0,174,
	175,5,16,0,0,175,177,5,58,0,0,176,178,3,22,11,0,177,176,1,0,0,0,177,178,
	1,0,0,0,178,179,1,0,0,0,179,181,5,4,0,0,180,182,3,24,12,0,181,180,1,0,0,
	0,181,182,1,0,0,0,182,183,1,0,0,0,183,184,5,6,0,0,184,17,1,0,0,0,185,187,
	5,66,0,0,186,185,1,0,0,0,187,190,1,0,0,0,188,186,1,0,0,0,188,189,1,0,0,
	0,189,194,1,0,0,0,190,188,1,0,0,0,191,193,3,14,7,0,192,191,1,0,0,0,193,
	196,1,0,0,0,194,192,1,0,0,0,194,195,1,0,0,0,195,198,1,0,0,0,196,194,1,0,
	0,0,197,199,3,20,10,0,198,197,1,0,0,0,198,199,1,0,0,0,199,200,1,0,0,0,200,
	201,5,17,0,0,201,203,5,58,0,0,202,204,3,22,11,0,203,202,1,0,0,0,203,204,
	1,0,0,0,204,205,1,0,0,0,205,207,5,4,0,0,206,208,3,28,14,0,207,206,1,0,0,
	0,207,208,1,0,0,0,208,209,1,0,0,0,209,210,5,6,0,0,210,19,1,0,0,0,211,213,
	5,10,0,0,212,214,5,55,0,0,213,212,1,0,0,0,213,214,1,0,0,0,214,21,1,0,0,
	0,215,216,5,18,0,0,216,221,5,57,0,0,217,218,5,5,0,0,218,220,5,57,0,0,219,
	217,1,0,0,0,220,223,1,0,0,0,221,219,1,0,0,0,221,222,1,0,0,0,222,224,1,0,
	0,0,223,221,1,0,0,0,224,225,5,19,0,0,225,23,1,0,0,0,226,231,3,38,19,0,227,
	228,5,5,0,0,228,230,3,38,19,0,229,227,1,0,0,0,230,233,1,0,0,0,231,229,1,
	0,0,0,231,232,1,0,0,0,232,235,1,0,0,0,233,231,1,0,0,0,234,236,5,5,0,0,235,
	234,1,0,0,0,235,236,1,0,0,0,236,25,1,0,0,0,237,238,5,57,0,0,238,239,5,20,
	0,0,239,240,3,34,17,0,240,27,1,0,0,0,241,246,3,26,13,0,242,243,5,5,0,0,
	243,245,3,26,13,0,244,242,1,0,0,0,245,248,1,0,0,0,246,244,1,0,0,0,246,247,
	1,0,0,0,247,250,1,0,0,0,248,246,1,0,0,0,249,251,5,5,0,0,250,249,1,0,0,0,
	250,251,1,0,0,0,251,29,1,0,0,0,252,262,3,34,17,0,253,254,5,21,0,0,254,259,
	3,32,16,0,255,256,5,5,0,0,256,258,3,32,16,0,257,255,1,0,0,0,258,261,1,0,
	0,0,259,257,1,0,0,0,259,260,1,0,0,0,260,263,1,0,0,0,261,259,1,0,0,0,262,
	253,1,0,0,0,262,263,1,0,0,0,263,31,1,0,0,0,264,265,5,57,0,0,265,266,5,20,
	0,0,266,271,5,58,0,0,267,268,5,22,0,0,268,270,5,58,0,0,269,267,1,0,0,0,
	270,273,1,0,0,0,271,269,1,0,0,0,271,272,1,0,0,0,272,33,1,0,0,0,273,271,
	1,0,0,0,274,275,3,0,0,0,275,276,5,3,0,0,276,278,1,0,0,0,277,274,1,0,0,0,
	277,278,1,0,0,0,278,279,1,0,0,0,279,291,5,58,0,0,280,281,5,18,0,0,281,286,
	3,34,17,0,282,283,5,5,0,0,283,285,3,34,17,0,284,282,1,0,0,0,285,288,1,0,
	0,0,286,284,1,0,0,0,286,287,1,0,0,0,287,289,1,0,0,0,288,286,1,0,0,0,289,
	290,5,19,0,0,290,292,1,0,0,0,291,280,1,0,0,0,291,292,1,0,0,0,292,315,1,
	0,0,0,293,295,5,14,0,0,294,296,3,36,18,0,295,294,1,0,0,0,295,296,1,0,0,
	0,296,297,1,0,0,0,297,298,5,15,0,0,298,299,5,23,0,0,299,315,3,34,17,0,300,
	315,5,57,0,0,301,302,5,14,0,0,302,303,3,34,17,0,303,304,5,5,0,0,304,309,
	3,34,17,0,305,306,5,5,0,0,306,308,3,34,17,0,307,305,1,0,0,0,308,311,1,0,
	0,0,309,307,1,0,0,0,309,310,1,0,0,0,310,312,1,0,0,0,311,309,1,0,0,0,312,
	313,5,15,0,0,313,315,1,0,0,0,314,277,1,0,0,0,314,293,1,0,0,0,314,300,1,
	0,0,0,314,301,1,0,0,0,315,35,1,0,0,0,316,321,3,34,17,0,317,318,5,5,0,0,
	318,320,3,34,17,0,319,317,1,0,0,0,320,323,1,0,0,0,321,319,1,0,0,0,321,322,
	1,0,0,0,322,325,1,0,0,0,323,321,1,0,0,0,324,326,5,5,0,0,325,324,1,0,0,0,
	325,326,1,0,0,0,326,37,1,0,0,0,327,339,5,58,0,0,328,329,5,14,0,0,329,334,
	3,34,17,0,330,331,5,5,0,0,331,333,3,34,17,0,332,330,1,0,0,0,333,336,1,0,
	0,0,334,332,1,0,0,0,334,335,1,0,0,0,335,337,1,0,0,0,336,334,1,0,0,0,337,
	338,5,15,0,0,338,340,1,0,0,0,339,328,1,0,0,0,339,340,1,0,0,0,340,39,1,0,
	0,0,341,342,3,0,0,0,342,343,5,3,0,0,343,345,1,0,0,0,344,341,1,0,0,0,344,
	345,1,0,0,0,345,346,1,0,0,0,346,347,7,1,0,0,347,41,1,0,0,0,348,349,5,57,
	0,0,349,350,5,20,0,0,350,351,3,46,23,0,351,43,1,0,0,0,352,357,3,42,21,0,
	353,354,5,5,0,0,354,356,3,42,21,0,355,353,1,0,0,0,356,359,1,0,0,0,357,355,
	1,0,0,0,357,358,1,0,0,0,358,361,1,0,0,0,359,357,1,0,0,0,360,362,5,5,0,0,
	361,360,1,0,0,0,361,362,1,0,0,0,362,45,1,0,0,0,363,364,6,23,-1,0,364,452,
	5,59,0,0,365,452,5,62,0,0,366,452,5,60,0,0,367,452,5,61,0,0,368,452,3,40,
	20,0,369,370,5,25,0,0,370,452,3,46,23,17,371,372,5,58,0,0,372,374,5,4,0,
	0,373,375,3,44,22,0,374,373,1,0,0,0,374,375,1,0,0,0,375,378,1,0,0,0,376,
	377,5,26,0,0,377,379,3,46,23,0,378,376,1,0,0,0,378,379,1,0,0,0,379,380,
	1,0,0,0,380,452,5,6,0,0,381,382,5,14,0,0,382,383,3,46,23,0,383,384,5,5,
	0,0,384,389,3,46,23,0,385,386,5,5,0,0,386,388,3,46,23,0,387,385,1,0,0,0,
	388,391,1,0,0,0,389,387,1,0,0,0,389,390,1,0,0,0,390,392,1,0,0,0,391,389,
	1,0,0,0,392,393,5,15,0,0,393,452,1,0,0,0,394,395,5,14,0,0,395,396,3,46,
	23,0,396,397,5,15,0,0,397,452,1,0,0,0,398,452,3,54,27,0,399,411,5,41,0,
	0,400,405,3,56,28,0,401,402,5,5,0,0,402,404,3,56,28,0,403,401,1,0,0,0,404,
	407,1,0,0,0,405,403,1,0,0,0,405,406,1,0,0,0,406,409,1,0,0,0,407,405,1,0,
	0,0,408,410,5,5,0,0,409,408,1,0,0,0,409,410,1,0,0,0,410,412,1,0,0,0,411,
	400,1,0,0,0,411,412,1,0,0,0,412,413,1,0,0,0,413,452,3,54,27,0,414,415,5,
	42,0,0,415,416,3,46,23,0,416,417,3,54,27,0,417,418,5,43,0,0,418,419,3,54,
	27,0,419,452,1,0,0,0,420,421,5,44,0,0,421,422,3,46,23,0,422,431,5,4,0,0,
	423,428,3,50,25,0,424,425,5,5,0,0,425,427,3,50,25,0,426,424,1,0,0,0,427,
	430,1,0,0,0,428,426,1,0,0,0,428,429,1,0,0,0,429,432,1,0,0,0,430,428,1,0,
	0,0,431,423,1,0,0,0,431,432,1,0,0,0,432,434,1,0,0,0,433,435,5,5,0,0,434,
	433,1,0,0,0,434,435,1,0,0,0,435,436,1,0,0,0,436,437,5,6,0,0,437,452,1,0,
	0,0,438,448,5,45,0,0,439,443,3,48,24,0,440,441,5,5,0,0,441,442,5,26,0,0,
	442,444,3,46,23,0,443,440,1,0,0,0,443,444,1,0,0,0,444,446,1,0,0,0,445,447,
	5,5,0,0,446,445,1,0,0,0,446,447,1,0,0,0,447,449,1,0,0,0,448,439,1,0,0,0,
	448,449,1,0,0,0,449,450,1,0,0,0,450,452,5,46,0,0,451,363,1,0,0,0,451,365,
	1,0,0,0,451,366,1,0,0,0,451,367,1,0,0,0,451,368,1,0,0,0,451,369,1,0,0,0,
	451,371,1,0,0,0,451,381,1,0,0,0,451,394,1,0,0,0,451,398,1,0,0,0,451,399,
	1,0,0,0,451,414,1,0,0,0,451,420,1,0,0,0,451,438,1,0,0,0,452,499,1,0,0,0,
	453,454,10,14,0,0,454,455,7,2,0,0,455,498,3,46,23,15,456,457,10,13,0,0,
	457,458,7,3,0,0,458,498,3,46,23,14,459,460,10,12,0,0,460,461,7,4,0,0,461,
	498,3,46,23,13,462,463,10,11,0,0,463,464,7,5,0,0,464,498,3,46,23,12,465,
	466,10,10,0,0,466,467,5,39,0,0,467,498,3,46,23,11,468,469,10,9,0,0,469,
	470,5,40,0,0,470,498,3,46,23,10,471,472,10,1,0,0,472,473,5,47,0,0,473,498,
	3,46,23,2,474,475,10,19,0,0,475,478,5,3,0,0,476,477,5,58,0,0,477,479,5,
	24,0,0,478,476,1,0,0,0,478,479,1,0,0,0,479,480,1,0,0,0,480,498,5,57,0,0,
	481,482,10,15,0,0,482,494,5,14,0,0,483,488,3,46,23,0,484,485,5,5,0,0,485,
	487,3,46,23,0,486,484,1,0,0,0,487,490,1,0,0,0,488,486,1,0,0,0,488,489,1,
	0,0,0,489,492,1,0,0,0,490,488,1,0,0,0,491,493,5,5,0,0,492,491,1,0,0,0,492,
	493,1,0,0,0,493,495,1,0,0,0,494,483,1,0,0,0,494,495,1,0,0,0,495,496,1,0,
	0,0,496,498,5,15,0,0,497,453,1,0,0,0,497,456,1,0,0,0,497,459,1,0,0,0,497,
	462,1,0,0,0,497,465,1,0,0,0,497,468,1,0,0,0,497,471,1,0,0,0,497,474,1,0,
	0,0,497,481,1,0,0,0,498,501,1,0,0,0,499,497,1,0,0,0,499,500,1,0,0,0,500,
	47,1,0,0,0,501,499,1,0,0,0,502,507,3,46,23,0,503,504,5,5,0,0,504,506,3,
	46,23,0,505,503,1,0,0,0,506,509,1,0,0,0,507,505,1,0,0,0,507,508,1,0,0,0,
	508,49,1,0,0,0,509,507,1,0,0,0,510,511,3,56,28,0,511,512,5,48,0,0,512,513,
	3,46,23,0,513,51,1,0,0,0,514,515,5,49,0,0,515,516,3,40,20,0,516,517,3,56,
	28,0,517,518,5,12,0,0,518,519,3,46,23,0,519,520,5,50,0,0,520,528,1,0,0,
	0,521,522,5,11,0,0,522,523,3,56,28,0,523,524,5,12,0,0,524,525,3,46,23,0,
	525,526,5,50,0,0,526,528,1,0,0,0,527,514,1,0,0,0,527,521,1,0,0,0,528,53,
	1,0,0,0,529,533,5,4,0,0,530,532,3,52,26,0,531,530,1,0,0,0,532,535,1,0,0,
	0,533,531,1,0,0,0,533,534,1,0,0,0,534,536,1,0,0,0,535,533,1,0,0,0,536,537,
	3,46,23,0,537,538,5,6,0,0,538,55,1,0,0,0,539,590,5,57,0,0,540,541,3,0,0,
	0,541,542,5,3,0,0,542,544,1,0,0,0,543,540,1,0,0,0,543,544,1,0,0,0,544,545,
	1,0,0,0,545,557,5,58,0,0,546,547,5,14,0,0,547,552,3,56,28,0,548,549,5,5,
	0,0,549,551,3,56,28,0,550,548,1,0,0,0,551,554,1,0,0,0,552,550,1,0,0,0,552,
	553,1,0,0,0,553,555,1,0,0,0,554,552,1,0,0,0,555,556,5,15,0,0,556,558,1,
	0,0,0,557,546,1,0,0,0,557,558,1,0,0,0,558,590,1,0,0,0,559,590,5,59,0,0,
	560,590,5,62,0,0,561,590,5,60,0,0,562,590,5,61,0,0,563,573,5,45,0,0,564,
	568,3,58,29,0,565,566,5,5,0,0,566,567,5,26,0,0,567,569,3,56,28,0,568,565,
	1,0,0,0,568,569,1,0,0,0,569,571,1,0,0,0,570,572,5,5,0,0,571,570,1,0,0,0,
	571,572,1,0,0,0,572,574,1,0,0,0,573,564,1,0,0,0,573,574,1,0,0,0,574,575,
	1,0,0,0,575,590,5,46,0,0,576,577,5,14,0,0,577,578,3,56,28,0,578,579,5,5,
	0,0,579,584,3,56,28,0,580,581,5,5,0,0,581,583,3,56,28,0,582,580,1,0,0,0,
	583,586,1,0,0,0,584,582,1,0,0,0,584,585,1,0,0,0,585,587,1,0,0,0,586,584,
	1,0,0,0,587,588,5,15,0,0,588,590,1,0,0,0,589,539,1,0,0,0,589,543,1,0,0,
	0,589,559,1,0,0,0,589,560,1,0,0,0,589,561,1,0,0,0,589,562,1,0,0,0,589,563,
	1,0,0,0,589,576,1,0,0,0,590,57,1,0,0,0,591,596,3,56,28,0,592,593,5,5,0,
	0,593,595,3,56,28,0,594,592,1,0,0,0,595,598,1,0,0,0,596,594,1,0,0,0,596,
	597,1,0,0,0,597,59,1,0,0,0,598,596,1,0,0,0,80,65,71,77,83,97,102,107,109,
	114,120,125,131,135,141,151,154,157,162,168,172,177,181,188,194,198,203,
	207,213,221,231,235,246,250,259,262,271,277,286,291,295,309,314,321,325,
	334,339,344,357,361,374,378,389,405,409,411,428,431,434,443,446,448,451,
	478,488,492,494,497,499,507,527,533,543,552,557,568,571,573,584,589,596];

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
